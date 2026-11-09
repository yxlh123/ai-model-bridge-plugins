import json
p = r"C:\Users\<用户名>\.dsh\storages\session_projcache\sessions\session-4c1eb8a3-a517-47ab-83ec-1bb2a83fa0b1.json"
d = json.load(open(p, encoding="utf-8"))
rows = d["record"]["rows"]

def walk(o, path=""):
    if isinstance(o, dict):
        for k, v in o.items():
            if "model" in k.lower() or k in ("provider","modelSelection"):
                print(path + "/" + k, "=", json.dumps(v, ensure_ascii=False)[:300])
            walk(v, path + "/" + k)
    elif isinstance(o, list):
        for i, v in enumerate(o[:5]):
            walk(v, path + f"[{i}]")

walk(rows)
print("---")
print("rows keys sample:", list(rows.keys())[:10] if isinstance(rows, dict) else type(rows))
