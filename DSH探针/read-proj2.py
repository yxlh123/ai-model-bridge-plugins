import json
p = r"C:\Users\<用户名>\.dsh\storages\session_projcache\sessions\session-4c1eb8a3-a517-47ab-83ec-1bb2a83fa0b1.json"
d = json.load(open(p, encoding="utf-8"))
r = d.get("record", {})
print("record keys:", list(r.keys()))
for k in ["sessionId","cwd","title","modelSelection","contextWindow","surfaceTokens","contextBreakdown"]:
    if k in r:
        print(k, "=", json.dumps(r[k], ensure_ascii=False)[:400])
