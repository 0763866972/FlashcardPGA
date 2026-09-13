const fs = require('fs');

let html = fs.readFileSync('pga.html', 'utf8');

const oldPrompt = `            const prompt = \`Nhiệm vụ của bạn là trích xuất và phân tích CHỈ CÁC CẤU TRÚC NGỮ PHÁP nổi bật (ví dụ: các thì đang dùng, mệnh đề quan hệ, rút gọn mệnh đề, câu bị động, cấu trúc V-ing/to-V...) từ đoạn văn bản sau. KHÔNG phân tích từ vựng đơn thuần, KHÔNG bắt lỗi, KHÔNG nhận xét.

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

const newPrompt = `            const prompt = \`Nhiệm vụ của bạn là phân tích cấu trúc và các điểm ngữ pháp tiếng Anh nổi bật trong đoạn văn bản sau.
Hãy liệt kê và giải thích rõ ràng các điểm ngữ pháp quan trọng được người viết sử dụng. Ví dụ: tại sao lại dùng V-ing sau từ 'when', các thì (tenses) đang dùng mang ý nghĩa gì, mệnh đề quan hệ, cấu trúc câu bị động, câu điều kiện, v.v. Không phải là tìm lỗi sai, mà là giải thích ngữ pháp của câu để người đọc hiểu được cấu trúc.
TRẢ VỀ KẾT QUẢ DƯỚI DẠNG MÃ HTML (chỉ dùng thẻ <div>, <h3>, <p>, <ul>, <li>, <strong>, <em>, <span class="text-brand-600 font-bold"> cho cấu trúc nổi bật, <span class="text-indigo-600 font-bold"> cho ví dụ, v.v.). KHÔNG TRẢ VỀ DẤU CODE BLOCK MẶC ĐỊNH (không dùng \\\`\\\`\\\`html). Trả về trực tiếp HTML đẹp mắt và dễ đọc.
Đoạn văn bản:
\${rawText}\`;`;

html = html.replace(oldPrompt, newPrompt);
fs.writeFileSync('pga.html', html);
console.log("Updated prompt to revert to the original grammar dissector version");
