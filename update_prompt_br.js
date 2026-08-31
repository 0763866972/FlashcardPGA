const fs = require('fs');
let content = fs.readFileSync('main.js', 'utf8');

const targetStr = `<div class="mb-2"><b>Câu Tiếng Anh:</b><br><b class="text-indigo-500 dark:text-indigo-400">(Ghi toàn bộ câu tiếng Anh)</b></div>`;
const replaceStr = `<div class="mb-2"><b>Câu Tiếng Anh:</b> <b class="text-indigo-500 dark:text-indigo-400">(Ghi toàn bộ câu tiếng Anh)</b></div>`;

if (content.includes(targetStr)) {
    content = content.replace(targetStr, replaceStr); // Replace first occurrence
    content = content.replace(targetStr, replaceStr); // Replace second occurrence if any (there are two because of dictation/flashcard logic blocks)
    fs.writeFileSync('main.js', content);
    console.log("Replaced successfully!");
} else {
    console.log("Target string not found.");
}
