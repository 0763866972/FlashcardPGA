const fs = require('fs');

let html = fs.readFileSync('pga.html', 'utf8');

const oldPrompt = `            const prompt = \`Nhiệm vụ của bạn là đóng vai trò "Người mổ xẻ" để phân tích đoạn văn bản sau. Không bắt lỗi sai, mà chỉ phân tích cái hay, cái đúng để người học noi theo.

Hãy chia kết quả thành 3 phần trình bày bằng HTML (không dùng code block \\\`\\\`\\\`):

<h3 class="font-bold text-xl text-brand-600 mb-3">Phần 1: Đoạn văn bản gốc</h3>
<div class="mb-6 text-lg leading-relaxed bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
  (Viết lại TOÀN BỘ đoạn văn bản gốc ở đây. Quan trọng: Hãy bôi đậm và tô màu bằng thẻ <span style="color: [mã màu]; font-weight: bold;">...</span> cho các cấu trúc ngữ pháp VÀ cụm từ vựng đáng chú ý. Mỗi cụm dùng một màu KHÁC NHAU ví dụ #ef4444, #f59e0b, #10b981, #3b82f6...)
</div>

<h3 class="font-bold text-xl text-brand-600 mb-3">Phần 2: Phân tích Cấu trúc & Ngữ pháp</h3>
(Liệt kê và giải thích chi tiết các điểm ngữ pháp quan trọng được tô màu ở Phần 1. MÀU SẮC PHẢI KHỚP HOÀN TOÀN với phần 1. Trích dẫn câu gốc và giải thích tại sao lại dùng cấu trúc đó, ví dụ mệnh đề quan hệ, rút gọn mệnh đề...)

<h3 class="font-bold text-xl text-brand-600 mb-3">Phần 3: Cụm từ vựng & Cách diễn đạt hay</h3>
(Trích xuất các cụm từ vựng, phrasal verbs, collocations hay được tô màu ở Phần 1. MÀU SẮC PHẢI KHỚP HOÀN TOÀN với phần 1. Kèm theo nghĩa tiếng Việt và cách dùng.)

TRẢ VỀ KẾT QUẢ DƯỚI DẠNG MÃ HTML. Trả về trực tiếp HTML đẹp mắt, rõ ràng và dễ đọc. Dùng thẻ <div>, <p>, <ul> cho các phần giải thích.

Đoạn văn bản:
\${rawText}\`;`;

const newPrompt = `            const prompt = \`Nhiệm vụ của bạn là đóng vai trò "Người mổ xẻ" để phân tích CHI TIẾT đoạn văn bản sau. Không bắt lỗi sai, mà chỉ phân tích sâu sắc các điểm ngữ pháp và từ vựng hay.

TRÌNH BÀY DƯỚI DẠNG HTML (không dùng code block \\\`\\\`\\\`). Hãy tuân thủ NGHIÊM NGẶT cấu trúc 3 phần sau:

<h3 class="font-bold text-xl text-brand-600 mb-3">Phần 1: Đoạn văn bản gốc</h3>
<div class="mb-6 text-lg leading-relaxed bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
  (Viết lại TOÀN BỘ đoạn văn bản gốc. Bôi đậm và tô màu (dùng style="color: [mã màu]") cho các điểm ngữ pháp và từ vựng đáng chú ý. Mỗi điểm dùng một màu khác nhau).
</div>

<h3 class="font-bold text-xl text-brand-600 mb-3 border-b border-slate-200 pb-2">Phần 2: Phân tích Cấu trúc & Ngữ pháp</h3>
<div class="mb-6 text-lg bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
  (Trình bày MỖI điểm ngữ pháp theo đúng HTML template sau:)
  <div class="mb-4">
    <strong class="text-slate-800">1. [Tên cấu trúc tiếng Việt] ([Tên tiếng Anh]):</strong><br>
    <span class="text-slate-700">Câu gốc: </span><strong style="color: [MÀU KHỚP PHẦN 1];">"[Trích dẫn câu chứa cấu trúc]"</strong><br>
    <em>Giải thích: </em><span class="text-slate-700">[Giải thích cực kỳ chi tiết, cặn kẽ tại sao người viết lại dùng cấu trúc này, tác dụng của nó là gì trong câu...]</span>
  </div>
  (Lặp lại template cho điểm 2, 3...)
</div>

<h3 class="font-bold text-xl text-brand-600 mb-3 border-b border-slate-200 pb-2">Phần 3: Cụm từ vựng & Cách diễn đạt hay</h3>
<div class="mb-6 text-lg bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
  (Trình bày MỖI cụm từ vựng theo đúng HTML template sau:)
  <div class="mb-3">
    <strong style="color: [MÀU KHỚP PHẦN 1];">[Cụm từ vựng tiếng Anh]:</strong> 
    <span class="text-slate-700">(Loại từ) - <em>[Nghĩa tiếng Việt]</em>. [Giải thích cặn kẽ cách dùng tự nhiên của cụm từ này, tác dụng trong văn cảnh].</span>
  </div>
  (Lặp lại template cho các cụm từ khác)
</div>

Đoạn văn bản:
\${rawText}\`;`;

html = html.replace(oldPrompt, newPrompt);
fs.writeFileSync('pga.html', html);
console.log("Updated prompt to enforce detailed grammatical structure templates");
