const fs = require('fs');

let html = fs.readFileSync('pga.html', 'utf8');

const oldPrompt = `  9. Các cấu trúc ngữ pháp đặc biệt khác như: Cấu trúc tồn tại "There + be" (There is, There have been...), Phân từ hoàn thành (Having V3/ed), Cấu trúc chủ ngữ giả (It is + adj + to V), Mệnh đề danh ngữ (Noun Clauses, đặc biệt chú ý các mệnh đề bắt đầu bằng "as to whether...", "that...", "what...").`;

const newPrompt = `  9. Các cấu trúc ngữ pháp đặc biệt khác như: Cấu trúc tồn tại "There + be" (There is, There have been...), Phân từ hoàn thành (Having V3/ed), Cấu trúc chủ ngữ giả (It is + adj + to V), Mệnh đề danh ngữ (Noun Clauses, đặc biệt chú ý các mệnh đề bắt đầu bằng "as to whether...", "that...", "what...").
  10. Cấu trúc diễn đạt sự lựa chọn / cân nhắc (Alternatives/Choices): BẮT BUỘC PHÂN TÍCH các cấu trúc như "whether it is better to do A or do B", "whether... or...". Phân tích cả cụm dài để thấy được cách tác giả đặt lên bàn cân hai sự lựa chọn (ví dụ: make their own decisions vs seeking advice).`;

html = html.replace(oldPrompt, newPrompt);
fs.writeFileSync('pga.html', html);
console.log("Updated prompt to explicitly require analysis of alternative structures like 'whether A or B'");
