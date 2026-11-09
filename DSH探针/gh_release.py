import urllib.request, json
req = urllib.request.Request("https://api.github.com/repos/ggml-org/llama.cpp/releases/latest", headers={"User-Agent":"dsh"})
with urllib.request.urlopen(req, timeout=30) as r:
    d = json.load(r)
print("tag:", d["tag_name"], "published:", d["published_at"])
for a in d["assets"]:
    n = a["name"]
    if "win" in n.lower():
        print(f'{n:70s} {a["size"]/1048576:.0f} MB')
        print("   ", a["browser_download_url"])
