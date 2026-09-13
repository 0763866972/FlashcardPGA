const fs = require('fs');

let html = fs.readFileSync('pga.html', 'utf8');

const oldPrompt = `            const prompt = \`Nhiệm vụ của bạn là đóng vai trò "Người mổ xẻ" để phân tích cấu trúc ngữ pháp VÀ các cụm từ vựng nổi bật trong đoạn văn bản sau. Không phải là bới móc lỗi sai, mà là phân tích cái hay, cái đúng để người học noi theo.

Hãy chia kết quả thành 2 phần rõ rệt:

Phần 1: Phân tích Cấu trúc & Ngữ pháp
Hãy liệt kê và giải thích chi tiết các điểm ngữ pháp quan trọng được người viết sử dụng. Ví dụ: tại sao lại dùng V-ing sau từ 'when', các thì (tenses) đang dùng mang ý nghĩa gì, mệnh đề quan hệ, rút gọn mệnh đề, bị động... Hãy trích dẫn câu gốc và giải thích cách dùng.

Phần 2: Cụm từ vựng & Cách diễn đạt hay
Trích xuất các cụm từ vựng (phrasal verbs, idioms, collocations, từ học thuật) khó hoặc hay được sử dụng trong bài. Kèm theo nghĩa tiếng Việt và giải thích ngắn gọn cách dùng.

TRẢ VỀ KẾT QUẢ DƯỚI DẠNG MÃ HTML (chỉ dùng thẻ <div>, <h3>, <p>, <ul>, <li>, <strong>, <em>, <span class="text-brand-600 font-bold"> cho tiêu đề/cấu trúc, <span class="text-indigo-600 font-bold"> cho ví dụ trích dẫn, v.v.). KHÔNG TRẢ VỀ DẤU CODE BLOCK MẶC ĐỊNH (không dùng \\\`\\\`\\\`html). Trả về trực tiếp HTML đẹp mắt, rõ ràng và dễ đọc.

Đoạn văn bản:
\${rawText}\`;`;

const newPrompt = `            const prompt = \`Nhiệm vụ của bạn là đóng vai trò "Người mổ xẻ" để phân tích đoạn văn bản sau. Không bắt lỗi sai, mà chỉ phân tích cái hay, cái đúng để người học noi theo.

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

html = html.replace(oldPrompt, newPrompt);
fs.writeFileSync('pga.html', html);
console.log("Updated prompt to include original text with colors, grammar, and vocab");
