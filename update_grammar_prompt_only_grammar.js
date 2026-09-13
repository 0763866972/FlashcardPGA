const fs = require('fs');

let html = fs.readFileSync('pga.html', 'utf8');

const oldPrompt = `            const prompt = \`Nhiệm vụ của bạn là phân tích TOÀN DIỆN đoạn văn bản sau. Bạn phải làm ĐỒNG THỜI 2 việc:
1. Phát hiện lỗi sai ngữ pháp/chính tả (nếu có) và nhận xét nhanh.
2. Trích xuất, phân tích các cụm TỪ VỰNG hay VÀ các cấu trúc NGỮ PHÁP nổi bật (ví dụ: các thì đang dùng, mệnh đề quan hệ, rút gọn mệnh đề, câu bị động, cấu trúc V-ing/to-V...).

YÊU CẦU TRÌNH BÀY (BẮT BUỘC, CHỈ DÙNG HTML, KHÔNG DÙNG CODE BLOCK \\\`\\\`\\\`):

<h3 class="font-bold text-xl text-brand-600 mb-3">1. Nhận xét & Sửa lỗi</h3>
<div class="mb-6 text-lg text-slate-700 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
  (Chỉ ra lỗi sai nếu có và nhận xét ngắn gọn về đoạn văn)
</div>

<h3 class="font-bold text-xl text-brand-600 mb-3">2. Phân tích Từ vựng & Ngữ pháp (Đoạn văn gốc)</h3>
<div class="mb-6 text-lg leading-relaxed bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
  (Viết lại TOÀN BỘ đoạn văn bản gốc ở đây. Hãy bôi đậm và tô màu bằng thẻ <span style="color: [mã màu]; font-weight: bold;">...</span> cho CẢ TỪ VỰNG LẪN CẤU TRÚC NGỮ PHÁP. Mỗi cụm dùng một màu KHÁC NHAU ví dụ #ef4444, #f59e0b, #10b981, #3b82f6...)
</div>

<h3 class="font-bold text-xl text-brand-600 mb-3">3. Giải thích chi tiết</h3>
(Liệt kê và giải thích các cụm từ/cấu trúc đã bôi màu ở phần 2. MÀU SẮC PHẢI KHỚP HOÀN TOÀN với phần 2. Mỗi mục dùng cấu trúc HTML sau:)
<div class="mb-4 text-lg bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
  <span style="color: [MÃ MÀU KHỚP VỚI PHẦN 2]; font-weight: bold;">[Từ vựng / Cấu trúc tiếng Anh]:</span> 
  <span class="text-slate-700">Giải nghĩa tiếng Việt ngắn gọn và cách dùng ngữ pháp.</span>
</div>

Đoạn văn bản:
\${rawText}\`;`;

const newPrompt = `            const prompt = \`Nhiệm vụ của bạn là trích xuất và phân tích CHỈ CÁC CẤU TRÚC NGỮ PHÁP nổi bật (ví dụ: các thì đang dùng, mệnh đề quan hệ, rút gọn mệnh đề, câu bị động, cấu trúc V-ing/to-V...) từ đoạn văn bản sau. KHÔNG phân tích từ vựng đơn thuần, KHÔNG bắt lỗi, KHÔNG nhận xét.

YÊU CẦU TRÌNH BÀY (BẮT BUỘC, CHỈ DÙNG HTML, KHÔNG DÙNG CODE BLOCK \\\`\\\`\\\`):

<h3 class="font-bold text-xl text-brand-600 mb-3">1. Phân tích Ngữ pháp (Đoạn văn gốc)</h3>
<div class="mb-6 text-lg leading-relaxed bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
  (Viết lại TOÀN BỘ đoạn văn bản gốc ở đây. Hãy bôi đậm và tô màu bằng thẻ <span style="color: [mã màu]; font-weight: bold;">...</span> cho CHỈ CÁC CẤU TRÚC NGỮ PHÁP. Mỗi cấu trúc dùng một màu KHÁC NHAU ví dụ #ef4444, #f59e0b, #10b981, #3b82f6...)
</div>

<h3 class="font-bold text-xl text-brand-600 mb-3">2. Giải thích chi tiết</h3>
(Liệt kê và giải thích các cấu trúc đã bôi màu ở phần 1. MÀU SẮC PHẢI KHỚP HOÀN TOÀN với màu ở phần 1. Mỗi mục dùng cấu trúc HTML sau:)
<div class="mb-4 text-lg bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
  <span style="color: [MÃ MÀU KHỚP VỚI PHẦN 1]; font-weight: bold;">[Cấu trúc tiếng Anh]:</span> 
  <span class="text-slate-700">Giải nghĩa tiếng Việt ngắn gọn và giải thích cách dùng ngữ pháp đó trong ngữ cảnh của đoạn văn.</span>
</div>

Đoạn văn bản:
\${rawText}\`;`;

html = html.replace(oldPrompt, newPrompt);
fs.writeFileSync('pga.html', html);
console.log("Updated prompt to only grammar analysis and color coding");
