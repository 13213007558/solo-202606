import os, base64
os.makedirs("src/components", exist_ok=True)
os.makedirs("src/pages", exist_ok=True)
def b(p, d):
    with open(p, "wb") as f: f.write(base64.b64decode(d))
    print("OK", p)
done = "setup"
