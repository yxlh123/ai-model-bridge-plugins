import urllib.request, json, ssl, time
def probe(url, timeout=15):
    t0=time.time()
    try:
        req = urllib.request.Request(url, headers={"User-Agent":"Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=timeout) as r:
            data = r.read(2000)
            return f"OK {r.status} {time.time()-t0:.1f}s len={len(data)}"
    except Exception as e:
        return f"FAIL {type(e).__name__}: {str(e)[:120]} {time.time()-t0:.1f}s"
print("github api :", probe("https://api.github.com/rate_limit"))
print("github web :", probe("https://github.com/ggml-org/llama.cpp/releases/latest"))
print("ollama.com :", probe("https://ollama.com"))
print("hf mirror  :", probe("https://hf-mirror.com"))
print("modelscope :", probe("https://www.modelscope.cn"))
