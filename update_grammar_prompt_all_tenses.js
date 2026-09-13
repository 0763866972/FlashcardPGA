const fs = require('fs');

let html = fs.readFileSync('pga.html', 'utf8');

const oldPrompt = `3. Các thì (Tenses) đặc biệt và cách sử dụng khéo léo (Hiện tại hoàn thành, Quá khứ hoàn thành...).`;

const newPrompt = `3. TẤT CẢ CÁC THÌ (Tenses) xuất hiện trong bài (Hiện tại đơn, Quá khứ đơn, Tương lai, Tiếp diễn, Hoàn thành...). Phân tích tại sao tác giả lại chọn dùng thì đó ở câu này mà không phải thì khác.`;

html = html.replace(oldPrompt, newPrompt);
fs.writeFileSync('pga.html', html);
console.log("Updated prompt to analyze all tenses");
