import { createServer } from "node:http";
import type { IncomingMessage, ServerResponse } from "node:http";
import { readFile } from "node:fs/promises";
import { dirname, extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { loadConfig } from "./lib/config.ts";
import { CoyoteDevice, getBuiltinWaveforms } from "./lib/device.ts";
import { Player } from "./lib/player.ts";
import type { Wave } from "./lib/player.ts";
import type { Channel } from "./shared/types.ts";

const root = dirname(fileURLToPath(import.meta.url));
const config = loadConfig();
const CHANNELS: Channel[] = ["A", "B"];
const startedAt = Date.now();

const device = new CoyoteDevice();
let lastError: string | undefined;
const player = new Player(device, (message) => {
  lastError = message;
  console.error("[player]", message);
});

const slug = (name: string, index: number) =>
  `builtin-${index}-${name.replace(/[^\w\u4e00-\u9fa5-]+/g, "").slice(0, 24) || "wave"}`;

const waveforms: Wave[] = getBuiltinWaveforms().map((wave, index) => ({
  id: slug(wave.name, index),
  name: wave.name,
  frames: wave.frames,
}));
const byId = new Map(waveforms.map((wave) => [wave.id, wave]));

let lastChangeAt = 0;
let lastSignalAt = Date.now();
let stopping = false;

function state() {
  const s = device.state;
  return {
    device: {
      protocol: s.protocol,
      connected: s.connected,
      relayStatus: s.relayStatus,
      appStatus: s.appStatus,
      name: s.name,
      intensities: s.intensities,
      limits: s.limits,
      pairingUrl: s.pairingUrl,
      qrUrl: s.qrUrl,
      devices: s.devices,
      error: s.error ?? lastError,
    },
    channels: {
      A: { waveform: player.waveform("A")?.id ?? null },
      B: { waveform: player.waveform("B")?.id ?? null },
    },
    guard: {
      hardMax: config.hardMax,
      stepMax: config.stepMax,
      minIntervalMs: config.minIntervalMs,
      watchdogMs: config.watchdogMs,
      lastChangeAt,
      uptimeMs: Date.now() - startedAt,
    },
    waveforms: waveforms.map((wave) => ({ id: wave.id, name: wave.name })),
  };
}

class HttpError extends Error {
  code: string;
  status: number;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const fail = (status: number, code: string, message: string) => {
  throw new HttpError(status, code, message);
};

function channelOf(value: unknown): Channel {
  const channel = String(value ?? "").toUpperCase();
  if (channel !== "A" && channel !== "B") fail(400, "BAD_CHANNEL", "通道只能是 A 或 B");
  return channel as Channel;
}

function requireConnected() {
  if (!device.state.connected)
    fail(409, "DEVICE_NOT_READY", "设备未连接或状态不新鲜");
}

async function setChannel(channel: Channel, raw: unknown) {
  requireConnected();
  if (typeof raw !== "number" || !Number.isInteger(raw))
    fail(400, "BAD_INTENSITY", "强度必须是整数");
  const ceiling = Math.min(config.hardMax, device.state.limits[channel]);
  const target = Math.max(0, Math.min(ceiling, raw));
  if (target !== raw)
    fail(
      409,
      "OUT_OF_RANGE",
      `${channel} 目标 ${raw} 超出允许范围 0–${ceiling}`,
    );
  const current = device.state.intensities[channel];
  if (config.stepMax > 0 && Math.abs(target - current) > config.stepMax)
    fail(
      409,
      "STEP_TOO_LARGE",
      `${channel} 单次最多变 ${config.stepMax}（当前 ${current}，目标 ${target}）`,
    );
  const wait = config.minIntervalMs - (Date.now() - lastChangeAt);
  if (config.minIntervalMs > 0 && wait > 0)
    fail(429, "RATE_LIMITED", `操作太频繁，请等 ${Math.ceil(wait / 100) / 10}s`);
  return target;
}

async function apply(input: Record<string, unknown>) {
  const targets: Partial<Record<Channel, number>> = {};
  for (const channel of CHANNELS) {
    if (!(channel in input)) continue;
    targets[channel] = await setChannel(channel, input[channel]);
  }
  if (Object.keys(targets).length === 0)
    fail(400, "EMPTY", "至少要给一个通道的强度");
  lastChangeAt = Date.now();
  for (const channel of CHANNELS) {
    const target = targets[channel];
    if (target === undefined) continue;
    await device.setIntensity(channel, target);
  }
  lastSignalAt = Date.now();
  return targets;
}

async function stop(reason: string) {
  if (stopping) return;
  stopping = true;
  player.reset();
  try {
    await device.stop();
  } catch (error) {
    lastError = `停止失败：${error instanceof Error ? error.message : String(error)}`;
  } finally {
    stopping = false;
    lastError = reason === "watchdog" ? "心跳超时，已自动归零" : lastError;
  }
}

function authorized(req: IncomingMessage): boolean {
  const header = String(req.headers.authorization ?? "");
  const bearer = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (bearer && bearer === config.token) return true;
  if (String(req.headers["x-hand-token"] ?? "") === config.token) return true;
  const url = new URL(req.url ?? "/", "http://127.0.0.1");
  return url.searchParams.get("token") === config.token;
}

async function body(req: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    size += (chunk as Buffer).length;
    if (size > 512 * 1024) fail(413, "BODY_TOO_LARGE", "请求体过大");
    chunks.push(chunk as Buffer);
  }
  if (size === 0) return {};
  try {
    const parsed = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
      fail(400, "BAD_BODY", "请求体必须是对象");
    return parsed as Record<string, unknown>;
  } catch {
    fail(400, "BAD_BODY", "请求体不是合法 JSON");
  }
  return {};
}

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

async function serveStatic(res: ServerResponse, pathname: string) {
  const relative = pathname === "/" ? "index.html" : pathname.slice(1);
  const target = normalize(join(root, "public", relative));
  if (!target.startsWith(join(root, "public"))) {
    res.writeHead(403).end("forbidden");
    return;
  }
  try {
    const file = await readFile(target);
    res.writeHead(200, {
      "Content-Type": MIME[extname(target)] ?? "application/octet-stream",
      "Cache-Control": "no-store",
    });
    res.end(file);
  } catch {
    res.writeHead(404).end("not found");
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", "http://127.0.0.1");
  try {
    if (!url.pathname.startsWith("/api/")) {
      await serveStatic(res, url.pathname);
      return;
    }
    if (!authorized(req)) {
      res
        .writeHead(401, { "Content-Type": "application/json; charset=utf-8" })
        .end(JSON.stringify({ ok: false, code: "UNAUTHORIZED", error: "token 无效" }));
      return;
    }
    let data: unknown;
    switch (`${req.method} ${url.pathname}`) {
      case "GET /api/state":
        data = state();
        break;
      case "GET /api/waveforms":
        data = waveforms.map((wave) => ({ id: wave.id, name: wave.name }));
        break;
      case "POST /api/connect": {
        const input = await body(req);
        const protocol = String(input.protocol ?? "v4");
        lastError = undefined;
        await device.connect({
          protocol,
          relayUrl: typeof input.relayUrl === "string" ? input.relayUrl : undefined,
        } as never);
        data = { protocol, pairingUrl: device.state.pairingUrl, qrUrl: device.state.qrUrl };
        break;
      }
      case "POST /api/select": {
        const input = await body(req);
        const clientId = String(input.clientId ?? device.state.devices[0]?.clientId ?? "");
        const slotId = String(input.slotId ?? device.state.devices[0]?.slotId ?? "");
        if (!clientId || !slotId) fail(409, "NO_DEVICE", "还没有可选的设备");
        await device.selectDevice(clientId, slotId);
        data = { clientId, slotId };
        break;
      }
      case "POST /api/disconnect":
        player.reset();
        await device.disconnect();
        data = { disconnected: true };
        break;
      case "POST /api/set": {
        const input = await body(req);
        data = { targets: await apply(input), intensities: device.state.intensities };
        break;
      }
      case "POST /api/pulse": {
        const input = await body(req);
        const channel = channelOf(input.channel);
        const id = input.waveform === null ? null : String(input.waveform ?? "");
        if (id !== null && !byId.has(id)) fail(404, "NO_WAVEFORM", "没有这个波形");
        player.setWaveform(channel, id === null ? null : (byId.get(id) as Wave));
        lastSignalAt = Date.now();
        data = { channel, waveform: id };
        break;
      }
      case "POST /api/stop":
        await stop("manual");
        data = { stopped: true, intensities: device.state.intensities };
        break;
      case "POST /api/keepalive":
        lastSignalAt = Date.now();
        lastError = undefined;
        data = { ok: true };
        break;
      default:
        fail(404, "NOT_FOUND", "没有这个接口");
    }
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ ok: true, data }));
  } catch (error) {
    const status = error instanceof HttpError ? error.status : 500;
    const code = error instanceof HttpError ? error.code : "INTERNAL";
    const message = error instanceof Error ? error.message : String(error);
    res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ ok: false, code, error: message }));
  }
});

setInterval(() => {
  const now = Date.now();
  if (device.state.connected && now - lastSignalAt > config.watchdogMs) {
    lastSignalAt = now;
    void stop("watchdog");
    return;
  }
  player.tick(now);
}, 100);

device.on("state", (s: any) => {
  // 自动选中第一个郊狼设备（未选中时设备列表不会上报强度）
  if (s.devices?.length && (!s.clientId || !s.slotId)) {
    const first = s.devices[0];
    void device
      .selectDevice(first.clientId, first.slotId)
      .catch((error: unknown) => console.error("[select]", error));
  }
});

server.listen(config.port, "127.0.0.1", () => {
  console.log(`郊狼手柄已启动：http://127.0.0.1:${config.port}/?token=${config.token}`);
  console.log(
    `护栏：上限 ${config.hardMax} · 单次 ${config.stepMax} · 间隔 ${config.minIntervalMs}ms · 看门狗 ${config.watchdogMs}ms`,
  );
});

for (const signal of ["SIGINT", "SIGTERM"] as const)
  process.on(signal, () => {
    void stop("shutdown").finally(() => process.exit(0));
  });
