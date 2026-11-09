import json, struct
p = r"C:\Users\<用户名>\AppData\Local\Programs\DeepSeek Harness\resources\app.asar"
with open(p, "rb") as f:
    head = f.read(16)
    json_size = struct.unpack("<I", head[12:16])[0]
    raw = f.read(json_size)
header = json.loads(raw.decode("utf-8"))
for label, node in [("root-nm", header["files"]["node_modules"]), ("dsh-nm", header["files"]["dsh"]["files"]["node_modules"])]:
    print(label, list(node["files"].keys())[:20])
    sc = node["files"].get("@deepseek-ai")
    if sc:
        names = list(sc["files"].keys())
        print(label, "@deepseek-ai:", [n for n in names if "pi-ai" in n or "llm" in n][:20])
