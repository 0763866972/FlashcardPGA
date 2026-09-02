const fs = require('fs');
let content = fs.readFileSync('pga.html', 'utf8');

const badTag = `<script src="main.js">

// ==========================================
// PGA WRITING MODE (FLASHCARD STYLE)`;

const goodTag = `<script src="main.js"></script>
<script>

// ==========================================
// PGA WRITING MODE (FLASHCARD STYLE)`;

if (content.includes(badTag)) {
    content = content.replace(badTag, goodTag);
    fs.writeFileSync('pga.html', content);
    console.log("Fixed the script tag issue!");
} else {
    // Try regex if exact match fails due to line endings
    const regex = /<script src="main\.js">\s*\/\/\s*==========================================\s*\/\/\s*PGA WRITING MODE/;
    if (regex.test(content)) {
        content = content.replace(/<script src="main\.js">\s*\/\/\s*==========================================\s*\/\/\s*PGA WRITING MODE/, 
            '<script src="main.js"></script>\\n<script>\\n\\n// ==========================================\\n// PGA WRITING MODE');
        fs.writeFileSync('pga.html', content);
        console.log("Fixed the script tag issue via regex!");
    } else {
        console.log("Not found.");
    }
}
