import { readFileSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
export const configPath = join(root, "config.json");

export type Config = {
  port: number;
  token: string;
  hardMax: number;
  stepMax: number;
  minIntervalMs: number;
  watchdogMs: number;
  relays: { v4: string; v3: string };
};

const defaults: Config = {
  port: 3210,
  token: "",
  // 硬上限：任何来源都不得超过（0–200）
  hardMax: 60,
  // 单次允许的最大变化幅度
  stepMax: 10,
  // 两次改动之间的最小间隔
  minIntervalMs: 1500,
  // 心跳超时：超时自动归零
  watchdogMs: 60_000,
  relays: {
    v4: "wss://trex.dungeon-lab.cn/v4",
    v3: "wss://ws.dungeon-lab.cn/",
  },
};

export function loadConfig(): Config {
  let stored: Partial<Config> = {};
  try {
    stored = JSON.parse(readFileSync(configPath, "utf8")) as Partial<Config>;
  } catch {
    stored = {};
  }
  const config: Config = {
    ...defaults,
    ...stored,
    relays: { ...defaults.relays, ...(stored.relays ?? {}) },
  };
  const clamp = (value: unknown, fallback: number, min: number, max: number) =>
    typeof value === "number" && Number.isFinite(value)
      ? Math.max(min, Math.min(max, Math.floor(value)))
      : fallback;
  config.port = clamp(config.port, defaults.port, 1024, 65535);
  config.hardMax = clamp(config.hardMax, defaults.hardMax, 0, 200);
  config.stepMax = clamp(config.stepMax, defaults.stepMax, 0, 200);
  config.minIntervalMs = clamp(
    config.minIntervalMs,
    defaults.minIntervalMs,
    0,
    60_000,
  );
  config.watchdogMs = clamp(
    config.watchdogMs,
    defaults.watchdogMs,
    5_000,
    3_600_000,
  );
  if (typeof config.token !== "string" || config.token.length < 16)
    config.token = randomBytes(18).toString("hex");
  writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`, "utf8");
  return config;
}
