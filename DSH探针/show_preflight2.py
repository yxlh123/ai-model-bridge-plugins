import os, io
root = r"C:\Users\<用户名>\.dsh\profiles\desktop\node_modules\billion-context\dist"
hits = []
for dirpath, _, files in os.walk(root):
    for fn in files:
        if not fn.endswith((".js",".mjs",".cjs")): continue
        p = os.path.join(dirpath, fn)
        try:
            with io.open(p, encoding="utf-8", errors="replace") as f:
                data = f.read()
        except Exception:
            continue
        for needle in ["preflight_compress_failed", "exceeds the model window", "compressible range"]:
            i = data.find(needle)
            if i >= 0:
                hits.append((p, needle, i))
                print("="*10, os.path.relpath(p, root), "|", needle, "| at", i)
                print(data[max(0,i-1200): i+1200])
                print()
