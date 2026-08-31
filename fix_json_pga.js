const fs = require('fs');
let content = fs.readFileSync('pga.html', 'utf8');

const targetStr = `let jsonStr = data.candidates[0].content.parts[0].text;`;
const replaceStr = `let jsonStr = data.candidates[0].content.parts[0].text;
            // Xóa markdown block nếu có
            jsonStr = jsonStr.replace(/\\`\\`\\`json\\n?/g, '').replace(/\\`\\`\\`\\n?/g, '').trim();`;

if (content.includes(targetStr) && !content.includes('jsonStr.replace')) {
    content = content.replace(targetStr, replaceStr);
    fs.writeFileSync('pga.html', content);
    console.log("Fixed JSON markdown parsing issue.");
} else {
    console.log("Already fixed or not found.");
}
