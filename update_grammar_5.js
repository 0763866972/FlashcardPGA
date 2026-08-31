const fs = require('fs');
let lines = fs.readFileSync('main.js', 'utf8').split('\n');

const oldStructure1 = `<div class="mb-2"><b>Ý chính muốn truyền đạt:</b> (Ghi tóm tắt nội dung/ý chính của câu này bằng tiếng Việt, KHÔNG cần dịch nguyên câu)</div>
<div class="mb-2"><b>Câu Tiếng Anh:</b> <b class="text-indigo-500 dark:text-indigo-400">(Ghi toàn bộ câu tiếng Anh)</b></div>`;

const newStructure1 = `<div class="mb-2"><b>Ý chính muốn truyền đạt:</b> (Ghi tóm tắt nội dung/ý chính của câu này bằng tiếng Việt, KHÔNG cần dịch nguyên câu)</div>
<div class="mb-2"><b>Câu Tiếng Anh:</b><br><b class="text-indigo-500 dark:text-indigo-400">(Ghi toàn bộ câu tiếng Anh)</b></div>
<div class="mb-2"><b>Dịch nghĩa câu:</b> (Dịch toàn bộ câu tiếng Anh ở trên sang tiếng Việt)</div>`;

let content = lines.join('\n');
content = content.replaceAll(oldStructure1, newStructure1);

fs.writeFileSync('main.js', content);
console.log("Lines replaced!");
