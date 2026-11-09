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
needle = b"lastUsed"
count = 0
with open(p,"rb") as f:
    for path,v in files:
        if not path.endswith(".js"): continue
        off = v.get("offset")
        if off is None: continue
        sz = v["size"]
        if sz > 10_000_000: continue
        f.seek(data_start+int(off))
        data = f.read(sz)
        i = data.find(needle)
        if i >= 0:
            count += 1
            print("FILE:", path, "size:", sz)
            print(data[max(0,i-600):i+900].decode("utf-8","replace"))
            print("="*60)
            if count > 8: break
