const fs = require("fs");
const path = "src/routes/events.ts";
let c = "";
c += "
";
c += "const router = Router();
";
c += "
";
c += "let events: Event[] = [];
";
c += "let allTags: Set<string> = new Set(['圣诞派对',' 万圣夜','新年倒计时','春节聚会','生日派对','户外野餐','音乐会']);
";
