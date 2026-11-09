import json, struct
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
        else: files.append((path+"/"+k,v))
walk(d,"")
tops=set()
for path,v in files:
    parts=path.split("/")
    if len(parts)>1: tops.add(parts[1])
print("TOP:",sorted(tops))
# @deepseek-ai packages
for path,v in files:
    if path.startswith("/node_modules/@deepseek-ai/") and path.count("/")==4:
        print(path)
