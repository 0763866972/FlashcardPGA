const fs = require('fs');
let content = fs.readFileSync('pga.html', 'utf8');

// Replace the problematic backticks in the JS template literal
content = content.replace(/như ```html\):/g, "như thẻ code markdown):");
content = content.replace(/như ```html\):/g, "như khối markdown html):");

// Wait, the file might currently have `... nh ```html): ...` or something because of encoding, but let's just replace ```html entirely
content = content.replace(/```html/g, "khối code HTML");

fs.writeFileSync('pga.html', content);
console.log("Fixed the syntax error caused by backticks!");
