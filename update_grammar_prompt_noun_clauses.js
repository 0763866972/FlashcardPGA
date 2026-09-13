const fs = require('fs');

let html = fs.readFileSync('pga.html', 'utf8');

const oldPrompt = `9. Các cấu trúc ngữ pháp đặc biệt khác như: Cấu trúc tồn tại "There + be" (There is, There have been...), Phân từ hoàn thành (Having V3/ed), Cấu trúc chủ ngữ giả (It is + adj + to V), Mệnh đề danh ngữ (Noun Clauses).`;

const newPrompt = `9. Các cấu trúc ngữ pháp đặc biệt khác như: Cấu trúc tồn tại "There + be" (There is, There have been...), Phân từ hoàn thành (Having V3/ed), Cấu trúc chủ ngữ giả (It is + adj + to V), Mệnh đề danh ngữ (Noun Clauses, đặc biệt chú ý các mệnh đề bắt đầu bằng "as to whether...", "that...", "what...").`;

html = html.replace(oldPrompt, newPrompt);
fs.writeFileSync('pga.html', html);
console.log("Updated prompt to explicitly mention Noun Clauses with 'as to whether'");
