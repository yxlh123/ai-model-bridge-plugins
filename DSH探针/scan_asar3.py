import json, struct
p = r"C:\Users\<用户名>\AppData\Local\Programs\DeepSeek Harness\resources\app.asar"
with open(p, "rb") as f:
    head = f.read(16)
    json_size = struct.unpack("<I", head[12:16])[0]
    raw = f.read(json_size)
header = json.loads(raw.decode("utf-8"))
base = 16 + json_size
print("json_size", json_size, "base", base)
def walk(node, prefix=""):
    out = []
    for name, v in node.get("files", {}).items():
        if "files" in v:
            out += walk(v, prefix + name + "/")
        else:
            out.append((prefix + name, v))
    return out
files = walk(header["files"]["node_modules"]["files"]["@deepseek-ai"]["files"]["dsh-llm-pi-ai"])
for name, meta in files:
    print(name, meta.get("size"), meta.get("offset"))
