const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

content = content.replace(
    /<\/div>\r?\n\s*<\/div>\r?\n\s*<!-- Center Content -->/,
    '</div>\n\n                                <!-- Center Content -->'
);

fs.writeFileSync('index.html', content, 'utf8');
console.log('Fixed extra div');
