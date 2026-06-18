const fs = require('fs');
const path = require('path');

function writeFile(filePath, content) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log('Created: ' + filePath);
}

// We'll build content by reading from multiple template files
// For now just test
writeFile('test-output.txt', 'test from build script');
