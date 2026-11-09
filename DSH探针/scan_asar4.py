import json, struct
p = r"C:\Users\<用户名>\AppData\Local\Programs\DeepSeek Harness\resources\app.asar"
with open(p, "rb") as f:
    head = f.read(16)
    json_size = struct.unpack("<I", head[12:16])[0]
    raw = f.read(json_size)
header = json.loads(raw.decode("utf-8"))
print("top:", list(header["files"].keys())[:30])
dsh = header["files"]["dsh"]["files"]
print("dsh:", list(dsh.keys())[:40])
