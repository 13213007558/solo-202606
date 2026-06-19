import os, base64
os.makedirs("src/components", exist_ok=True)
os.makedirs("src/pages", exist_ok=True)

def w(p, c):
    with open(p, "w", encoding="utf-8") as f:
        f.write(c)
    print("OK", p)

print("ready")
