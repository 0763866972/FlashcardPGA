const fs = require('fs');

let html = fs.readFileSync('pga.html', 'utf8');

const oldPrompt = `TIÊU CHÍ CHỌN CẤU TRÚC NGỮ PHÁP ĐỂ PHÂN TÍCH: Hãy ưu tiên chọn những cấu trúc ngữ pháp "xương sống" và kinh điển (ví dụ: mệnh đề quan hệ, câu điều kiện, cấu trúc whether... or..., neither... nor..., cấu trúc đảo ngữ, câu bị động, rút gọn mệnh đề...). TUYỆT ĐỐI KHÔNG chọn các lỗi sai liệt kê lặt vặt (như V-ing and V-bare) hoặc các cụm từ nối bằng chữ "and" đơn giản làm điểm ngữ pháp chính. Phải chọn những cấu trúc thể hiện trình độ ngữ pháp cao!`;

const newPrompt = `TIÊU CHÍ CHỌN CẤU TRÚC NGỮ PHÁP ĐỂ PHÂN TÍCH: Hãy ưu tiên chọn những cấu trúc ngữ pháp "xương sống" và kinh điển (ví dụ: mệnh đề quan hệ, câu điều kiện, cấu trúc đảo ngữ, câu bị động, rút gọn mệnh đề, câu chẻ, cấu trúc nhấn mạnh...). 
LƯU Ý ĐẶC BIỆT: TUYỆT ĐỐI KHÔNG phân tích "Cấu trúc song song" (Parallel Structure / Parallelism) dưới bất kỳ hình thức nào. Bỏ qua hoàn toàn các điểm ngữ pháp liên quan đến việc nối liệt kê bằng "and", "or", "but". Chỉ chọn những cấu trúc ngữ pháp phức tạp khác!`;

html = html.replace(oldPrompt, newPrompt);
fs.writeFileSync('pga.html', html);
console.log("Updated prompt to strictly forbid analyzing Parallel Structure");
