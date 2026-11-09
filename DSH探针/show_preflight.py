import io
def show(p, line_no, before=1000, after=3000, key="preflight"):
    with io.open(p, encoding="utf-8", errors="replace") as f:
        lines = f.read().split("\n")
    line = lines[line_no-1]
    idx = line.find(key)
    print("="*20, p, "line", line_no, "len", len(line), "idx", idx)
    print(line[max(0,idx-before): idx+after])
show(r"C:\Users\<用户名>\.dsh\profiles\desktop\node_modules\billion-context\dist\index.js", 17, key="preflight")
show(r"C:\Users\<用户名>\.dsh\profiles\desktop\node_modules\billion-context\dist\agent\dsh-native.js", 154, key="preflight")
