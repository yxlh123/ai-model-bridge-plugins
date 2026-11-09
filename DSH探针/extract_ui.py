import json, struct, io, sys
sys.stdout.reconfigure(encoding="utf-8")
p = r"C:\Users\<用户名>\AppData\Local\Programs\DeepSeek Harness\resources\app.asar"
with open(p,"rb") as f:
    head = f.read(16)
    size = struct.unpack("<I", head[12:16])[0]
    hdr = f.read(size).decode("utf-8")
    data_start = 16+size
d = json.loads(hdr)
files={}
def walk(n,path):
    for k,v in n.get("files",{}).items():
        if "files" in v: walk(v,path+"/"+k)
        else: files[path+"/"+k]=v
walk(d,"")
for target in ["/dsh/node_modules/@deepseek-ai/dsh-client-ui-workspace/lib/client.js"]:
    v=files[target]
    with open(p,"rb") as f:
        f.seek(data_start+int(v["offset"]))
        data=f.read(v["size"]).decode("utf-8",errors="replace")
    io.open(r"C:\Users\<用户名>\Documents\deepseek-harness\default-workspace\.scratch\ui-workspace-client.js","w",encoding="utf-8").write(data)
    print(target,len(data))
    for kw in ["unarchive","\u5f52\u6863","\u5df2\u5f52\u6863","archive"]:
        i=0;c=0
        print("==",kw)
        while c<6:
            i=data.find(kw,i)
            if i<0: break
            print("###",i); print(data[max(0,i-300):i+300].replace(chr(10)," | ")); print()
            i+=1;c+=1
