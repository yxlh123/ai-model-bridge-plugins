import yaml, io
for p in [r"C:\Users\<用户名>\.dsh\profiles\desktop\cordis.patch.yml", r"C:\Users\<用户名>\.dsh\.credentials.yaml"]:
    with open(p, encoding="utf-8") as f:
        d = yaml.safe_load(f)
    print(p.split("\\")[-1], "OK", type(d).__name__, len(d) if hasattr(d, "__len__") else "")
d = yaml.safe_load(open(r"C:\Users\<用户名>\.dsh\profiles\desktop\cordis.patch.yml", encoding="utf-8"))
adm = [e for e in d if e.get("id") == "agent-default-model"]
print("agent-default-model:", adm)
pi = [e for e in d if e.get("name") == "@deepseek-ai/dsh-llm-pi-ai"]
if pi:
    print("providers:", list(pi[0]["config"]["providers"].keys()))
    print("qwen-web:", pi[0]["config"]["providers"].get("qwen-web", {}).get("models"))
c = yaml.safe_load(open(r"C:\Users\<用户名>\.dsh\.credentials.yaml", encoding="utf-8"))
print("refs:", c.get("refs"))
