import os
p = "src/routes/events.ts"
os.makedirs(os.path.dirname(p), exist_ok=True)
f = open(p, "w", encoding="utf-8")
f.write("test ok
")
f.close()
print("done")
