import json, struct
p = r"C:\Users\<用户名>\AppData\Local\Programs\DeepSeek Harness\resources\app.asar"
with open(p,"rb") as f:
    head = f.read(16)
    size = struct.unpack("<I", head[12:16])[0]
    hdr = f.read(size).decode("utf-8")
    data_start=16+size
d = json.loads(hdr)
files={}
def walk(n,path):
    for k,v in n.get("files",{}).items():
        if "files" in v: walk(v,path+"/"+k)
        else: files[path+"/"+k]=v
walk(d,"")
for name in ["/node_modules/@deepseek-ai/dsh-api-gateway/README.zh.md","/node_modules/@deepseek-ai/dsh-api-gateway/package.json"]:
    v=files[name]
    with open(p,"rb") as f:
        f.seek(data_start+int(v["offset"]))
        data=f.read(int(v["size"]))
    print("=====",name,"=====")
    print(data.decode("utf-8","replace"))
