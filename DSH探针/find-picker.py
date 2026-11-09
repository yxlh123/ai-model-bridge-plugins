import json, struct, re

p = r"C:\Users\<用户名>\AppData\Local\Programs\DeepSeek Harness\resources\app.asar"
needles = ["閫夋嫨妯″瀷", "鍒囨崲妯″瀷", "妯″瀷閫夋嫨", "model-picker", "modelPicker", "models-picker"]
with open(p, "rb") as f:
    head = f.read(16)
    size = struct.unpack("<I", head[12:16])[0]
    hdr = f.read(size).decode("utf-8")
    data_start = 16 + size
d = json.loads(hdr)
files = []
def walk(n, path):
    for k, v in n.get("files", {}).items():
        if "files" in v:
            walk(v, path + "/" + k)
        else:
            files.append((path + "/" + k, v))
walk(d, "")

hits = {}
with open(p, "rb") as f:
    for path, v in files:
        if not path.endswith(".js"):
            continue
        sz = v.get("size", 0)
        if sz > 3_000_000: continue
            continue
        if "offset" not in v: continue; f.seek(data_start + int(v["offset"]))
        data = f.read(sz)
        try:
            txt = data.decode("utf-8", "ignore")
        except Exception:
            continue
        for nd in needles:
            idx = txt.find(nd)
            if idx >= 0:
                hits.setdefault(nd, []).append((path, txt[max(0,idx-80):idx+160].replace("\n"," ")))
for nd, arr in hits.items():
    print("====", nd, "hits:", len(arr))
    for path, ctx in arr[:6]:
        print("  ", path)
        print("     ", ctx[:240])

