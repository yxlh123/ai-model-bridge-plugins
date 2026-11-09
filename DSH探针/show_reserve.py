import io, re
p = r"C:\Users\<用户名>\.dsh\profiles\desktop\node_modules\billion-context\dist\index.js"
with io.open(p, encoding="utf-8", errors="replace") as f:
    data = f.read()
for needle in ["completionReserve", "modelContextLimit", "compressionTarget="]:
    start=0; count=0
    print("#"*25, needle)
    while count < 5:
        i = data.find(needle, start)
        if i < 0: break
        print("-"*6, "at", i)
        print(data[max(0,i-600): i+600].replace("\n","\\n"))
        print()
        start=i+1; count+=1
