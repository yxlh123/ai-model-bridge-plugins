import json, struct
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
for needle in [b"archivedSessionIds", b"\\u672a\\u5206\\u7ec4"]:
    hits=[]
    with open(p,"rb") as f:
        for path,v in files:
            if not path.endswith(".js"): continue
            sz=v.get("size",0)
            if sz>6_000_000: continue
            off=v.get("offset")
            if off is None: continue
            f.seek(data_start+int(off))
            data=f.read(sz)
            if needle in data: hits.append((path,data.count(needle)))
    print("===",needle)
    for h in hits: print(h)
