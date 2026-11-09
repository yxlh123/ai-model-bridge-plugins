import json, struct
p = r"C:\Users\<用户名>\AppData\Local\Programs\DeepSeek Harness\resources\app.asar"
with open(p, "rb") as f:
    head = f.read(16)
    json_size = struct.unpack("<I", head[12:16])[0]
    f.read(json_size)
    data_start = 16 + json_size
    f.seek(data_start + 78143542)
    src = f.read(125589).decode("utf-8", "replace")
open(r"C:\Users\<用户名>\Documents\deepseek-harness\default-workspace\.scratch\pi-ai-index.js","w",encoding="utf-8").write(src)
print("len", len(src))
