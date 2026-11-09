import json, struct, os
p = r"C:\Users\<用户名>\AppData\Local\Programs\DeepSeek Harness\resources\app.asar"
target = "/dsh/node_modules/@deepseek-ai/dsh-client-ui-model-selection/lib/client.js"
with open(p, "rb") as f:
    head = f.read(16); size = struct.unpack("<I", head[12:16])[0]
    hdr = f.read(size).decode("utf-8"); data_start = 16 + size
d = json.loads(hdr)
node = d
for part in target.strip("/").split("/"):
    node = node["files"][part]
with open(p, "rb") as f:
    f.seek(data_start + int(node["offset"]))
    data = f.read(node["size"])
out = r"C:\Users\<用户名>\Documents\deepseek-harness\default-workspace\.scratch\model-selection-client.js"
open(out, "wb").write(data)
print("saved", len(data))
