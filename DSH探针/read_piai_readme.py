import json, struct
p = r"C:\Users\<用户名>\AppData\Local\Programs\DeepSeek Harness\resources\app.asar"
out = r"C:\Users\<用户名>\Documents\deepseek-harness\default-workspace\.scratch\pi-ai-readme.md"
with open(p, "rb") as f:
    head = f.read(16)
    json_size = struct.unpack("<I", head[12:16])[0]
    raw = f.read(json_size)
    header = json.loads(raw.decode("utf-8"))
    print("json ok, json_size", json_size, flush=True)
    data_start = 16 + json_size
    f.seek(data_start + 78114821)
    content = f.read(28721).decode("utf-8", "replace")
open(out, "w", encoding="utf-8").write(content)
print("written", len(content))
