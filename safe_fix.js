const fs = require('fs');

let mainContent = fs.readFileSync('main.js', 'utf8');

// 1. Remove structures from the prompt instructions
// The text we want to remove starts with "2. Cấu trúc ngữ pháp (structures):"
// We'll replace it with an empty string, being careful not to eat the closing backtick and semicolon.
// Let's just find the exact string or a safe regex.
const structRegex = /2\. Cấu trúc ngữ pháp \(structures\)[\s\S]*?(?=`\s*;\s*if \(wantSyn\))/;
if (mainContent.match(structRegex)) {
    mainContent = mainContent.replace(structRegex, '');
    console.log("Removed structures from prompt successfully.");
} else {
    // try fallback
    const fallbackRegex = /2\. Cấu trúc ngữ pháp \(structures\)[\s\S]*?(?=`\s*;)/;
    if (mainContent.match(fallbackRegex)) {
        mainContent = mainContent.replace(fallbackRegex, '');
        console.log("Removed structures from prompt (fallback).");
    }
}

// 2. Remove the JSON template
const jsonRegex = /"structures": \[\s*\{\s*"struct"[\s\S]*?\}\s*\],\s*/;
if (mainContent.match(jsonRegex)) {
    mainContent = mainContent.replace(jsonRegex, '');
    console.log("Removed structures from JSON template.");
}

fs.writeFileSync('main.js', mainContent);

// 3. Fix CSS dropdown
let cssContent = fs.readFileSync('styles.css', 'utf8');
const cssTarget = `html.light-mode select,
        html.light-mode input,
        html.light-mode textarea {
            background-color: #f1f5f9 !important;
            border-color: #cbd5e1 !important;
        }`;
const cssReplacement = `html.light-mode select,
        html.light-mode input,
        html.light-mode textarea {
            background-color: #f1f5f9 !important;
            border-color: #cbd5e1 !important;
            color: #1e293b !important;
        }`;

if (cssContent.includes(cssTarget)) {
    cssContent = cssContent.replace(cssTarget, cssReplacement);
    fs.writeFileSync('styles.css', cssContent);
    console.log("CSS fixed.");
} else {
    console.log("CSS target not found.");
}
