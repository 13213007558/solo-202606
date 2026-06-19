import sys
path = sys.argv[1]
with open(path, "w", encoding="utf-8") as f:
    f.write(sys.stdin.read())
print("wrote", path)
