import urllib.request, json
req = urllib.request.Request("https://api.github.com/repos/ggml-org/llama.cpp/releases/latest", headers={"User-Agent":"dsh"})
with urllib.request.urlopen(req, timeout=30) as r:
    d = json.load(r)
print("tag:", d["tag_name"], "assets:", len(d["assets"]))
for a in d["assets"]:
    print(f'{a["name"]:75s} {a["size"]/1048576:8.1f} MB')
