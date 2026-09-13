const fs = require('fs');

let html = fs.readFileSync('pga.html', 'utf8');

const oldPrompt = `            const prompt = \`Nhiệm vụ của bạn là trích xuất và phân tích các cụm từ vựng khó, các cấu trúc ngữ pháp nổi bật (ví dụ: V-ing sau chữ when, bị động, mệnh đề quan hệ...) từ đoạn văn bản sau.
TRÌNH BÀY KẾT QUẢ THEO ĐÚNG ĐỊNH DẠNG HTML SAU ĐÂY cho mỗi từ vựng hoặc cấu trúc (KHÔNG thêm bất kỳ giải thích dài dòng nào ở đầu hoặc cuối, CHỈ in ra danh sách):
<div class="mb-4 text-lg">
  <span class="font-bold text-brand-600">Từ vựng hoặc Cấu trúc tiếng Anh:</span> 
  <span class="text-slate-700">Giải nghĩa tiếng Việt ngắn gọn hoặc cách dùng.</span>
</div>
Ví dụ:
<div class="mb-4 text-lg">
  <span class="font-bold text-brand-600">helping in + V-ing:</span> 
  <span class="text-slate-700">dùng dạng V-ing sau "help" để chỉ hành động đang được hỗ trợ.</span>
</div>
KHÔNG TRẢ VỀ DẤU CODE BLOCK MẶC ĐỊNH (không dùng \\\`\\\`\\\`html). Trả về trực tiếp HTML.
Đoạn văn bản:
\${rawText}\`;`;

const newPrompt = `            const prompt = \`Nhiệm vụ của bạn là trích xuất và phân tích các cụm từ vựng khó, các cấu trúc ngữ pháp nổi bật từ đoạn văn bản sau.
YÊU CẦU TRÌNH BÀY (BẮT BUỘC, CHỈ DÙNG HTML, KHÔNG DÙNG CODE BLOCK \\\`\\\`\\\`):
Phần 1: Viết lại TOÀN BỘ đoạn văn bản gốc. Bọc đoạn văn trong thẻ <div class="mb-6 text-lg leading-relaxed bg-white p-5 rounded-xl border border-slate-200 shadow-sm">...</div>.
Trong đoạn văn này, hãy bôi đậm và tô màu (dùng thẻ <span style="color: [mã màu]; font-weight: bold;">...</span>) cho các từ vựng/cấu trúc nổi bật. Mỗi cụm từ vựng/cấu trúc phải được tô một màu KHÁC NHAU (ví dụ: #ef4444, #f59e0b, #10b981, #3b82f6, #8b5cf6, #ec4899...).

Phần 2: Bên dưới đoạn văn, liệt kê và giải thích các cụm từ đó. MÀU SẮC của cụm từ trong danh sách PHẢI KHỚP HOÀN TOÀN với màu đã tô trong đoạn văn ở Phần 1.
Mỗi mục dùng cấu trúc HTML sau:
<div class="mb-4 text-lg bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
  <span style="color: [MÃ MÀU KHỚP VỚI PHẦN 1]; font-weight: bold;">[Từ vựng / Cấu trúc tiếng Anh]:</span> 
  <span class="text-slate-700">Giải nghĩa tiếng Việt ngắn gọn và cách dùng.</span>
</div>
Đoạn văn bản:
\${rawText}\`;`;

html = html.replace(oldPrompt, newPrompt);
fs.writeFileSync('pga.html', html);
console.log("Updated prompt for colorful grammar analysis");
