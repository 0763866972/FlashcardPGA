const fs = require('fs');
let content = fs.readFileSync('main.js', 'utf8');

const regex = /\|\|\s*localStorage\.getItem\('toeic_ai_context'\)\s*\|\|\s*''/g;
content = content.replace(regex, "?? localStorage.getItem('toeic_ai_context') ?? ''");

fs.writeFileSync('main.js', content);
console.log("Replaced global fallbacks");
