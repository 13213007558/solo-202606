const fs = require("fs");
const path = require("path");

const routesDir = path.join(__dirname, "src", "routes");
if (!fs.existsSync(routesDir)) {
  fs.mkdirSync(routesDir, { recursive: true });
}

