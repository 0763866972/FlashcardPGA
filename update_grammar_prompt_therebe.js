const fs = require('fs');

let html = fs.readFileSync('pga.html', 'utf8');

const oldPrompt = `8. Các cấu trúc ngữ pháp nâng cao như: Phân từ hoàn thành (Having V3/ed), Cấu trúc "There be", Cấu trúc chủ ngữ giả (It is + adj + to V), Mệnh đề danh ngữ (Noun Clauses).`;

const newPrompt = `8. Các từ nối, đại từ quan hệ và liên từ đặc biệt (whether, while, who, whom, which, that, although, despite...). Phân tích cách chúng liên kết các mệnh đề.
9. Các cấu trúc ngữ pháp đặc biệt khác như: Cấu trúc tồn tại "There + be" (There is, There have been...), Phân từ hoàn thành (Having V3/ed), Cấu trúc chủ ngữ giả (It is + adj + to V), Mệnh đề danh ngữ (Noun Clauses).`;

html = html.replace(oldPrompt, newPrompt);
fs.writeFileSync('pga.html', html);
console.log("Updated prompt to explicitly include 'There be' and conjunctions/relative pronouns");
