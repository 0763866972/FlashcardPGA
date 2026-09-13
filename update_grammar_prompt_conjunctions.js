const fs = require('fs');

let html = fs.readFileSync('pga.html', 'utf8');

const oldPrompt = `8. Các từ nối, đại từ quan hệ và liên từ đặc biệt (whether, while, who, whom, which, that, although, despite...). Phân tích cách chúng liên kết các mệnh đề.`;

const newPrompt = `8. MỌI Liên từ (Conjunctions) và Đại từ quan hệ xuất hiện trong bài (Whereas, as though, as if, whether...or, when, as, while, since, as soon as, before, after, until, by the time, if, unless, provided/providing, once, in case, because, although, though, even though, even if, so that, in order that, now that, as long as, so long as, as far as, assuming that, given that, seeing that, just as, who, whom, which, that...). BẮT BUỘC PHẢI PHÂN TÍCH CHI TIẾT: Liên từ này đang làm nhiệm vụ gì? Nó đang nối 2 từ cùng loại hay nối 2 mệnh đề với nhau? Ý nghĩa của sự kết nối này là gì?`;

html = html.replace(oldPrompt, newPrompt);
fs.writeFileSync('pga.html', html);
console.log("Updated prompt to explicitly list all conjunctions and demand connection analysis");
