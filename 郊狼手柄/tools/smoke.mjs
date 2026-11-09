const base = "http://127.0.0.1:3210";
const token = process.argv[2];
const call = async (method, path, data) => {
  const response = await fetch(base + path, {
    method,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: data === undefined ? undefined : JSON.stringify(data),
  });
  const payload = await response.json();
  console.log(method, path, response.status, JSON.stringify(payload).slice(0, 240));
  return payload;
};

await call("GET", "/api/state");
await call("POST", "/api/connect", { protocol: "simulator" });
await new Promise((r) => setTimeout(r, 400));
const state = await call("GET", "/api/state");
const wave = state.data.waveforms[0];
await call("POST", "/api/set", { A: 10 });
await call("POST", "/api/set", { A: 30 });
await new Promise((r) => setTimeout(r, 1600));
await call("POST", "/api/set", { A: 20 });
await call("POST", "/api/set", { A: 21 });
await call("POST", "/api/pulse", { channel: "A", waveform: wave.id });
await new Promise((r) => setTimeout(r, 300));
await call("GET", "/api/state");
await call("POST", "/api/stop");
await new Promise((r) => setTimeout(r, 300));
await call("GET", "/api/state");
