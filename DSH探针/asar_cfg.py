import json, struct, re
p = r"C:\Users\<用户名>\AppData\Local\Programs\DeepSeek Harness\resources\app.asar"
with open(p,"rb") as f:
    head = f.read(16)
    size = struct.unpack("<I", head[12:16])[0]
    hdr = f.read(size).decode("utf-8")
d = json.loads(hdr)
files=[]
def walk(n,path):
    for k,v in n.get("files",{}).items():
        if "files" in v: walk(v,path+"/"+k)
        else: files.append(path+"/"+k)
walk(d,"")
cands=[x for x in files if "pi-ai" in x and ("config" in x.lower() or "catalog" in x.lower() or "schema" in x.lower())]
for c in cands[:30]: print(c)
