import sys
content = sys.stdin.read()
with open("src/index.css", "w", encoding="utf-8") as f:
    f.write(content)
print("Written", len(content), "chars")
