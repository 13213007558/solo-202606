const fs = require("fs");
const p = "src/backend/server.ts";
fs.writeFileSync(p, "", "utf8");
console.log("init");
