const fs = require('fs');
console.log('test ok');
fs.writeFileSync('hello.txt', 'hello world');
console.log('file written');
