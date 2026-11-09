import json, struct, os
p = r"C:\Users\<用户名>\AppData\Local\Programs\DeepSeek Harness\resources\app.asar"
out = r"C:\Users\<用户名>\Documents\deepseek-harness\default-workspace\.scratch\asar"
with open(p,"rb") as f:
    head = f.read(16)
    size = struct.unpack("<I", head[12:16])[0]
    hdr = f.read(size).decode("utf-8")
    data_start = 16 + size
d = json.loads(hdr)
def find(node, parts):
    cur = node
    for part in parts:
        cur = cur["files"][part]
    return cur
targets = [
    ("dsh","node_modules","@earendil-works","pi-ai","dist","api","llama-cpp-classify.js"),
    ("dsh","node_modules","@earendil-works","pi-ai","dist","api","llama-cpp-classify.lazy.js"),
]
for t in targets:
    node = find(d, list(t))
    off = int(node["offset"]); sz = node["size"]
    with open(p,"rb") as f:
        f.seek(data_start+off)
        data = f.read(sz)
    dest = os.path.join(out, *t[2:])
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    open(dest,"wb").write(data)
    print(t[-1], sz, "->", dest)
    print(data.decode("utf-8","replace")[:1500].replace("\n","\n  "))
    print("="*60)
