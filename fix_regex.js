const fs = require('fs');
let content = fs.readFileSync('main.js', 'utf8');

const regex = /const match = textAfter\.match\(\/D.*?i\);/s;
const replacement = 'const match = textAfter.match(/Dịch[^:]*:\\s*(.*?)(?=\\n|•|(?:\\s*-\\s)|(?:\\s*Cụm\\s*")|$)/is);';

content = content.replace(regex, replacement);

fs.writeFileSync('main.js', content, 'utf8');
console.log("Fixed regex in main.js");
