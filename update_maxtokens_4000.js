const fs = require('fs');

// Update pga.html
let pgaHtml = fs.readFileSync('pga.html', 'utf8');
pgaHtml = pgaHtml.replace(/max_tokens: 2000/g, 'max_tokens: 4000');
fs.writeFileSync('pga.html', pgaHtml);
console.log('Updated max_tokens to 4000 in pga.html');

// Update main.js
let mainJs = fs.readFileSync('main.js', 'utf8');
mainJs = mainJs.replace(/max_tokens: 2000/g, 'max_tokens: 4000');
mainJs = mainJs.replace(/payload\.max_tokens = 3000/g, 'payload.max_tokens = 4000');
fs.writeFileSync('main.js', mainJs);
console.log('Updated max_tokens to 4000 in main.js');

