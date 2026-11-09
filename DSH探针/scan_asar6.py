import json, struct
p = r"C:\Users\<用户名>\AppData\Local\Programs\DeepSeek Harness\resources\app.asar"
with open(p, "rb") as f:
    head = f.read(16)
    json_size = struct.unpack("<I", head[12:16])[0]
    raw = f.read(json_size)
header = json.loads(raw.decode("utf-8"))
node = header["files"]["dsh"]["files"]["node_modules"]["files"]["@deepseek-ai"]["files"]["dsh-llm-pi-ai"]
def walk(n, prefix=""):
    out = []
    for name, v in n.get("files", {}).items():
        if "files" in v: out += walk(v, prefix + name + "/")
        else: out.append((prefix + name, v))
    return out
for name, meta in walk(node):
    print(name, meta.get("size"), meta.get("offset"))
