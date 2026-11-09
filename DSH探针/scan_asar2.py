import re
p = r"C:\Users\<用户名>\AppData\Local\Programs\DeepSeek Harness\resources\app.asar"
data = open(p, "rb").read()
for pat in [b"dsh-llm-pi-ai", b"llm-pi-ai"]:
    print("=====", pat)
    for i, m in enumerate(re.finditer(pat, data)):
        if i > 5: break
        s = max(0, m.start()-120); e = min(len(data), m.end()+400)
        print("-----", m.start())
        print(data[s:e].decode("utf-8","replace")[:600])
