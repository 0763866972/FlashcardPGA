const fs = require('fs');
let html = fs.readFileSync('pga.html', 'utf8');

html = html.replace(/max_tokens: 4096/g, 'max_tokens: 2000');

fs.writeFileSync('pga.html', html);
console.log('Successfully updated max_tokens to 2000 in pga.html!');
