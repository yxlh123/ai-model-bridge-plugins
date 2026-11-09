import json, struct
p = r"C:\Users\<用户名>\AppData\Local\Programs\DeepSeek Harness\resources\app.asar"
with open(p,"rb") as f:
    head = f.read(16)
    size = struct.unpack("<I", head[12:16])[0]
    hdr = f.read(size).decode("utf-8")
d = json.loads(hdr)
files = []
def walk(node, path):
    for k,v in node.get("files",{}).items():
        if "files" in v: walk(v, path+"/"+k)
        else: files.append(path+"/"+k)
walk(d,"")
print("total files:", len(files))
import re
for pat in ["llama","gguf","node-llama","mlx","local-infer","transformers"]:
    hit = [x for x in files if pat in x.lower()]
    print(pat, "->", len(hit)); 
    for h in hit[:8]: print("   ", h)
