import re
p = r"C:\Users\<用户名>\AppData\Local\Programs\DeepSeek Harness\resources\app.asar"
data = open(p, "rb").read()
print("size", len(data))
for m in re.finditer(b"contextWindow", data):
    s = max(0, m.start()-160); e = min(len(data), m.end()+160)
    chunk = data[s:e].decode("utf-8", "replace")
    print("-----", m.start())
    print(chunk)
