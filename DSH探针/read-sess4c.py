import json
p = r"C:\Users\<用户名>\.dsh\storages\session_projcache\sessions\session-4c1eb8a3-a517-47ab-83ec-1bb2a83fa0b1.json"
d = json.load(open(p, encoding="utf-8"))
rows = d["record"]["rows"]
print("identity:", json.dumps(d["record"]["identity"], ensure_ascii=False))
ms = rows.get("modelSelection")
print("modelSelection:", json.dumps(ms, ensure_ascii=False)[:400])
cu = rows.get("costUsage")
if cu:
    print("costUsage last:", json.dumps(cu.get("last"), ensure_ascii=False)[:300])
    print("byProviderModel:", json.dumps(cu.get("byProviderModel"), ensure_ascii=False)[:400])
to = rows.get("turnOutline")
if to:
    outline = to.get("val") if isinstance(to, dict) else to
    if isinstance(outline, list):
        print("turns:", len(outline))
        for t in outline[-4:]:
            print(" turn:", json.dumps(t, ensure_ascii=False)[:300])
