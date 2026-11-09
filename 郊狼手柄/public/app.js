const token = new URLSearchParams(location.search).get("token") ?? "";
const $ = (id) => document.getElementById(id);
const log = (text) => {
  const box = $("log");
  box.textContent = `${new Date().toLocaleTimeString()} ${text}\n${box.textContent}`.slice(0, 4000);
};

async function api(path, init = {}) {
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {}),
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!payload.ok) throw new Error(`${payload.code ?? response.status} ${payload.error ?? ""}`.trim());
  return payload.data;
}

const post = (path, data) =>
  api(path, { method: "POST", body: data === undefined ? undefined : JSON.stringify(data) });

let busy = false;
let lastSent = 0;

async function push(channel) {
  const slider = $(`slider-${channel}`);
  const value = Number(slider.value);
  $(`value-${channel}`).textContent = String(value);
  if (busy) return;
  busy = true;
  try {
    lastSent = Date.now();
    await post("/api/set", { [channel]: value });
    log(`A/B 已设置 ${channel}=${value}`);
  } catch (error) {
    log(String(error.message ?? error));
  } finally {
    setTimeout(() => {
      busy = false;
    }, 220);
  }
}

for (const channel of ["A", "B"])
  $(`slider-${channel}`).addEventListener("input", () => {
    $(`value-${channel}`).textContent = $(`slider-${channel}`).value;
  });
for (const channel of ["A", "B"])
  $(`slider-${channel}`).addEventListener("change", () => void push(channel));

for (const channel of ["A", "B"])
  $(`wave-${channel}`).addEventListener("change", async (event) => {
    const id = event.target.value || null;
    event.target.dataset.touched = "1";
    try {
      await post("/api/pulse", { channel, waveform: id });
      log(`${channel} 波形：${id ?? "无"}`);
    } catch (error) {
      log(String(error.message ?? error));
    }
  });

$("connect-v4").addEventListener("click", () => connect("v4"));
$("connect-sim").addEventListener("click", () => connect("simulator"));
$("disconnect").addEventListener("click", () => guard(() => post("/api/disconnect")));
$("stop").addEventListener("click", () => guard(() => post("/api/stop")));

async function guard(task) {
  try {
    const data = await task();
    log(JSON.stringify(data));
  } catch (error) {
    log(String(error.message ?? error));
  }
}

async function connect(protocol) {
  try {
    await post("/api/connect", { protocol });
    log(`已连接 ${protocol}`);
  } catch (error) {
    log(String(error.message ?? error));
  }
}

function render(state) {
  const d = state.device;
  $("status").innerHTML = [
    `<span class="pill ${d.connected ? "on" : "warn"}">${d.connected ? "已连接" : "未连接"}</span>`,
    `<span class="pill">${d.protocol}</span>`,
    `<span class="pill">中继 ${d.relayStatus}</span>`,
    `<span class="pill">APP ${d.appStatus}</span>`,
    `<span class="pill">${d.name ?? ""}</span>`,
    d.error ? `<span class="pill warn">${d.error}</span>` : "",
  ].join("");

  for (const channel of ["A", "B"]) {
    const slider = $(`slider-${channel}`);
    slider.max = String(Math.min(state.guard.hardMax, d.limits[channel] || 0));
    if (document.activeElement !== slider) {
      slider.value = String(d.intensities[channel] ?? 0);
      $(`value-${channel}`).textContent = slider.value;
    }
    const select = $(`wave-${channel}`);
    if (select.options.length <= 1 && state.waveforms.length) {
      for (const wave of state.waveforms) {
        const option = document.createElement("option");
        option.value = wave.id;
        option.textContent = wave.name;
        select.append(option);
      }
    }
    if (!select.dataset.touched) select.value = state.channels[channel].waveform ?? "";
  }

  $("guard").textContent = `上限 ${state.guard.hardMax} · 单次 ${state.guard.stepMax > 0 ? state.guard.stepMax : "不限"} · 间隔 ${state.guard.minIntervalMs > 0 ? state.guard.minIntervalMs + "ms" : "不限"} · 看门狗 ${Math.round(state.guard.watchdogMs / 1000)}s`;

  const pairing = $("pairing");
  if (d.qrUrl && !d.connected) {
    pairing.hidden = false;
    $("qr").src = d.qrUrl;
    $("pairing-url").textContent = d.pairingUrl ?? "";
  } else {
    pairing.hidden = true;
  }
}

async function poll() {
  try {
    render(await api("/api/state"));
  } catch (error) {
    log(String(error.message ?? error));
  }
}

setInterval(poll, 600);
setInterval(() => void post("/api/keepalive").catch(() => {}), 15_000);
void poll();
