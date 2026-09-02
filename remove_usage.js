const fs = require('fs');

let indexContent = fs.readFileSync('index.html', 'utf8');
const usageRegex = /<div id="fcUsage"[\s\S]*?<tbody id="fcUsageList"[\s\S]*?<\/tbody>\s*<\/table>\s*<\/div>/;

if (indexContent.match(usageRegex)) {
    indexContent = indexContent.replace(usageRegex, '');
    fs.writeFileSync('index.html', indexContent);
    console.log("Removed fcUsage from index.html");
} else {
    console.log("Could not find fcUsage in index.html");
}

let mainContent = fs.readFileSync('main.js', 'utf8');
// We want to remove the instruction for structures.
// It starts with "2. Cấu trúc ngữ pháp (structures):" and ends before "3. TÌM ĐỒNG NGHĨA". Or ends before "\n          if (wantSyn)".
const structPromptRegex1 = /2\. C.u tr.c ng.*ph.p \(structures\)[\s\S]*?(?=if \(wantSyn\))/g;
if (mainContent.match(structPromptRegex1)) {
    mainContent = mainContent.replace(structPromptRegex1, '');
    console.log("Removed structures instruction from main.js");
}

const structJsonRegex1 = /"structures": \[\s*\{\s*"struct"[\s\S]*?\}\s*\],\s*/g;
if (mainContent.match(structJsonRegex1)) {
    mainContent = mainContent.replace(structJsonRegex1, '');
    console.log("Removed structures JSON template from main.js");
}

fs.writeFileSync('main.js', mainContent);
