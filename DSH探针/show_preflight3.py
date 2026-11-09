import io
p = r"C:\Users\<用户名>\.dsh\profiles\desktop\node_modules\billion-context\dist\index.js"
with io.open(p, encoding="utf-8", errors="replace") as f:
    data = f.read()
for needle in ["could not bring it under", "compressible range(s) still visible", "exceeds the model window", "model window", "preflight"]:
    start = 0
    count = 0
    print("#"*30, needle)
    while count < 6:
        i = data.find(needle, start)
        if i < 0: break
        print("-"*8, "at", i)
        print(data[max(0,i-1500): i+1500])
        print()
        start = i+1
        count += 1
