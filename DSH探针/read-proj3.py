import json
p = r"C:\Users\<用户名>\.dsh\storages\session_projcache\sessions\session-4c1eb8a3-a517-47ab-83ec-1bb2a83fa0b1.json"
d = json.load(open(p, encoding="utf-8"))
r = d.get("record", {})
print("identity:", json.dumps(r.get("identity"), ensure_ascii=False)[:600])
rows = r.get("rows", [])
print("rows count:", len(rows))
for row in rows[:3]:
    print("row:", json.dumps(row, ensure_ascii=False)[:300])
