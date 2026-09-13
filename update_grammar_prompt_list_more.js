const fs = require('fs');

let html = fs.readFileSync('pga.html', 'utf8');

const oldPrompt = `TIÊU CHÍ CHỌN CẤU TRÚC NGỮ PHÁP ĐỂ PHÂN TÍCH: Hãy ưu tiên chọn những cấu trúc ngữ pháp "xương sống" và kinh điển (ví dụ: mệnh đề quan hệ, câu điều kiện, cấu trúc đảo ngữ, câu bị động, rút gọn mệnh đề, câu chẻ, cấu trúc nhấn mạnh...). 
LƯU Ý ĐẶC BIỆT: TUYỆT ĐỐI KHÔNG phân tích "Cấu trúc song song" (Parallel Structure / Parallelism) dưới bất kỳ hình thức nào. Bỏ qua hoàn toàn các điểm ngữ pháp liên quan đến việc nối liệt kê bằng "and", "or", "but". Chỉ chọn những cấu trúc ngữ pháp phức tạp khác!`;

const newPrompt = `TIÊU CHÍ CHỌN CẤU TRÚC NGỮ PHÁP ĐỂ PHÂN TÍCH: Hãy ưu tiên chọn những cấu trúc ngữ pháp "xương sống" và học thuật. BẠN PHẢI TÌM VÀ PHÂN TÍCH CÁC CẤU TRÚC SAU (nếu có trong bài):
1. Mệnh đề quan hệ (Relative Clauses) và Mệnh đề quan hệ rút gọn (Reduced Relative Clauses).
2. Rút gọn mệnh đề trạng ngữ (Reduced Adverbial Clauses - vd: When V-ing, While V-ing).
3. Các thì (Tenses) đặc biệt và cách sử dụng khéo léo (Hiện tại hoàn thành, Quá khứ hoàn thành...).
4. Câu điều kiện (Conditionals - Loại 1, 2, 3, Mix) và Cấu trúc giả định (Subjunctive).
5. Cấu trúc so sánh (Comparisons - So sánh hơn, so sánh nhất, so sánh kép).
6. Câu bị động (Passive Voice) đặc biệt là bị động khách quan (It is said that...).
7. Đảo ngữ (Inversion), Câu chẻ (Cleft sentences - It is/was... that...), Cấu trúc nhấn mạnh.
8. Các cấu trúc ngữ pháp nâng cao như: Phân từ hoàn thành (Having V3/ed), Cấu trúc "There be", Cấu trúc chủ ngữ giả (It is + adj + to V), Mệnh đề danh ngữ (Noun Clauses).
LƯU Ý ĐẶC BIỆT: TUYỆT ĐỐI KHÔNG phân tích "Cấu trúc song song" (Parallel Structure / Parallelism) dưới bất kỳ hình thức nào. Bỏ qua hoàn toàn các điểm ngữ pháp liên quan đến việc nối liệt kê bằng "and", "or", "but". Chỉ chọn những cấu trúc đã liệt kê ở trên!`;

html = html.replace(oldPrompt, newPrompt);
fs.writeFileSync('pga.html', html);
console.log("Updated prompt to explicitly list a wide variety of grammar points");
