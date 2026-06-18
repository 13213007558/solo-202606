const fs = require("fs");
const path = "src/client/pages/Dashboard.tsx";
let content = fs.readFileSync(path, "utf-8");
const lines = content.split("
");
lines[46] = "    async (updates: { id: string; progress: number }[]) => {";
lines[48] = "        prevNodes.map((n) => {";
lines[49] = "          const update = updates.find((u) => u.id === n.id);";
lines[50] = "          return update ? { ...n, progress: update.progress } : n;";
lines[51] = "        })";
const newContent = lines.join("
");
fs.writeFileSync(path, newContent, "utf-8");
console.log("Done");
