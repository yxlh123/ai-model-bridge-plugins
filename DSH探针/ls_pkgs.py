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
import collections
pkgs=collections.OrderedDict()
for path,v in files:
    parts=path.split("/")
    if len(parts)>=5 and parts[1]=="node_modules" and parts[2]=="@deepseek-ai":
        pkgs[parts[3]]=1
    if len(parts)>=4 and parts[1]=="dsh" and parts[2]=="node_modules" and parts[3]=="@deepseek-ai":
        pkgs["dsh:"+parts[4]]=1
for k in sorted(pkgs): print(k)
