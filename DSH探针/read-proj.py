import json
p = r"C:\Users\<用户名>\.dsh\storages\session_projcache\sessions\session-4c1eb8a3-a517-47ab-83ec-1bb2a83fa0b1.json"
d = json.load(open(p, encoding="utf-8"))
def show(k, v):
    print(k, "=", json.dumps(v, ensure_ascii=False)[:300])
for k in ["sessionId","cwd","title","modelSelection","contextWindow","surfaceTokens"]:
    if k in d: show(k, d[k])
if "meta" in d:
    for k in ["modelSelection","model","provider"]:
        if k in d["meta"]: show("meta."+k, d["meta"][k])
print("top keys:", list(d.keys())[:25])
