import json, struct
p = r"C:\Users\<用户名>\AppData\Local\Programs\DeepSeek Harness\resources\app.asar"
with open(p, "rb") as f:
    head = f.read(16); size = struct.unpack("<I", head[12:16])[0]
    hdr = f.read(size).decode("utf-8"); data_start = 16 + size
d = json.loads(hdr)

def find(node, target, path=""):
    for k, v in node.get("files", {}).items():
        if k == target:
            return path + "/" + k, v
        if "files" in v:
            r = find(v, target, path + "/" + k)
            if r: return r
    return None

for name in ["agent-default-model", "settings-models", "settings-model"]:
    found = []
    def walk(node, path=""):
        for k, v in node.get("files", {}).items():
            if "files" in v:
                walk(v, path + "/" + k)
            else:
                if name in path:
                    found.append(path + "/" + k)
    walk(d)
    print(name, "->", found[:6])
