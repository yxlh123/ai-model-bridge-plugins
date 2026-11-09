import json, struct, re
p = r"C:\Users\<用户名>\AppData\Local\Programs\DeepSeek Harness\resources\app.asar"
with open(p,"rb") as f:
    head = f.read(16)
    size = struct.unpack("<I", head[12:16])[0]
    hdr = f.read(size).decode("utf-8")
    data_start = 16+size
d = json.loads(hdr)
files=[]
def walk(n,path):
    for k,v in n.get("files",{}).items():
        if "files" in v: walk(v,path+"/"+k)
        else: files.append((path+"/"+k,v))
walk(d,"")
for path,v in files:
    if "agent-default-model" in path and path.endswith(".js"):
        print("FILE:", path, "size:", v["size"])
for path,v in files:
    if "agent-default-model" in path and path.endswith("index.js"):
        off = v.get("offset"); sz = v["size"]
        f = open(p,"rb"); f.seek(data_start+int(off)); data = f.read(sz).decode("utf-8","replace")
        print(data[:5000])
        break
