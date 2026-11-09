import json
p = r"C:\Users\<用户名>\.dsh\storages\session_projcache\sessions\5664859b-a1e7-f197-4b3a-70628676f330.json"
d = json.load(open(p, encoding="utf-8"))
rows = d["record"]["rows"]
print("identity:", json.dumps(d["record"]["identity"], ensure_ascii=False))
for k in ["title","modelSelection","contextWindow","surfaceTokens"]:
    if k in rows: print(k, "=", json.dumps(rows[k], ensure_ascii=False)[:300])
to = rows.get("turnOutline")
if to:
    val = to.get("val") if isinstance(to, dict) else to
    if isinstance(val, list):
        print("turns:", len(val))
        for t in val[-6:]:
            print(" turn:", json.dumps(t, ensure_ascii=False)[:400])
cu = rows.get("costUsage")
if cu:
    print("last:", json.dumps(cu.get("last"), ensure_ascii=False)[:200])
    print("bpm:", json.dumps(cu.get("byProviderModel"), ensure_ascii=False)[:400])
