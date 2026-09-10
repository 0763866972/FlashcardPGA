const fs = require('fs');

const removeStr = `<option value="meta-llama/llama-prompt-guard-2-86m">Llama Prompt Guard 86M</option>`;

// Update pga.html
let pgaHtml = fs.readFileSync('pga.html', 'utf8');
if (pgaHtml.includes(removeStr)) {
    pgaHtml = pgaHtml.replace(removeStr, '');
    // clean up empty line
    pgaHtml = pgaHtml.replace(/\n\s*\n/g, '\n');
    fs.writeFileSync('pga.html', pgaHtml);
    console.log('Removed from pga.html');
}

// Update index.html
let indexHtml = fs.readFileSync('index.html', 'utf8');
if (indexHtml.includes(removeStr)) {
    indexHtml = indexHtml.replace(removeStr, '');
    // clean up empty line
    indexHtml = indexHtml.replace(/\n\s*\n/g, '\n');
    fs.writeFileSync('index.html', indexHtml);
    console.log('Removed from index.html');
}

