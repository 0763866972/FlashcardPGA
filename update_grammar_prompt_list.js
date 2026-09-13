const fs = require('fs');

let html = fs.readFileSync('pga.html', 'utf8');

const oldPrompt = `            const prompt = \`Nhiệm vụ của bạn là phân tích cấu trúc và các điểm ngữ pháp tiếng Anh nổi bật trong đoạn văn bản sau.
Hãy liệt kê và giải thích rõ ràng các điểm ngữ pháp quan trọng được người viết sử dụng. Ví dụ: tại sao lại dùng V-ing sau từ 'when', các thì (tenses) đang dùng mang ý nghĩa gì, mệnh đề quan hệ, cấu trúc câu bị động, câu điều kiện, v.v. Không phải là tìm lỗi sai, mà là giải thích ngữ pháp của câu để người đọc hiểu được cấu trúc.
TRẢ VỀ KẾT QUẢ DƯỚI DẠNG MÃ HTML (chỉ dùng thẻ <div>, <h3>, <p>, <ul>, <li>, <strong>, <em>, <span class="text-brand-600 font-bold"> cho cấu trúc nổi bật, <span class="text-indigo-600 font-bold"> cho ví dụ, v.v.). KHÔNG TRẢ VỀ DẤU CODE BLOCK MẶC ĐỊNH (không dùng \\\`\\\`\\\`html). Trả về trực tiếp HTML đẹp mắt và dễ đọc.
Đoạn văn bản:
\${rawText}\`;`;

const newPrompt = `            const prompt = \`Nhiệm vụ của bạn là trích xuất và phân tích các cụm từ vựng khó, các cấu trúc ngữ pháp nổi bật (ví dụ: V-ing sau chữ when, bị động, mệnh đề quan hệ...) từ đoạn văn bản sau.
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

html = html.replace(oldPrompt, newPrompt);
fs.writeFileSync('pga.html', html);
console.log("Updated prompt for grammar analysis to match list format");
