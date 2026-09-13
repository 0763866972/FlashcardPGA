const fs = require('fs');

let html = fs.readFileSync('pga.html', 'utf8');

const oldPrompt = `            const prompt = \`Nhiệm vụ của bạn là phân tích cấu trúc và các điểm ngữ pháp tiếng Anh nổi bật trong đoạn văn bản sau.
Hãy liệt kê và giải thích rõ ràng các điểm ngữ pháp quan trọng được người viết sử dụng. Ví dụ: tại sao lại dùng V-ing sau từ 'when', các thì (tenses) đang dùng mang ý nghĩa gì, mệnh đề quan hệ, cấu trúc câu bị động, câu điều kiện, v.v. Không phải là tìm lỗi sai, mà là giải thích ngữ pháp của câu để người đọc hiểu được cấu trúc.
TRẢ VỀ KẾT QUẢ DƯỚI DẠNG MÃ HTML (chỉ dùng thẻ <div>, <h3>, <p>, <ul>, <li>, <strong>, <em>, <span class="text-brand-600 font-bold"> cho cấu trúc nổi bật, <span class="text-indigo-600 font-bold"> cho ví dụ, v.v.). KHÔNG TRẢ VỀ DẤU CODE BLOCK MẶC ĐỊNH (không dùng \\\`\\\`\\\`html). Trả về trực tiếp HTML đẹp mắt và dễ đọc.
Đoạn văn bản:
\${rawText}\`;`;

const newPrompt = `            const prompt = \`Nhiệm vụ của bạn là đóng vai trò "Người mổ xẻ" để phân tích cấu trúc ngữ pháp VÀ các cụm từ vựng nổi bật trong đoạn văn bản sau. Không phải là bới móc lỗi sai, mà là phân tích cái hay, cái đúng để người học noi theo.

Hãy chia kết quả thành 2 phần rõ rệt:

Phần 1: Phân tích Cấu trúc & Ngữ pháp
Hãy liệt kê và giải thích chi tiết các điểm ngữ pháp quan trọng được người viết sử dụng. Ví dụ: tại sao lại dùng V-ing sau từ 'when', các thì (tenses) đang dùng mang ý nghĩa gì, mệnh đề quan hệ, rút gọn mệnh đề, bị động... Hãy trích dẫn câu gốc và giải thích cách dùng.

Phần 2: Cụm từ vựng & Cách diễn đạt hay
Trích xuất các cụm từ vựng (phrasal verbs, idioms, collocations, từ học thuật) khó hoặc hay được sử dụng trong bài. Kèm theo nghĩa tiếng Việt và giải thích ngắn gọn cách dùng.

TRẢ VỀ KẾT QUẢ DƯỚI DẠNG MÃ HTML (chỉ dùng thẻ <div>, <h3>, <p>, <ul>, <li>, <strong>, <em>, <span class="text-brand-600 font-bold"> cho tiêu đề/cấu trúc, <span class="text-indigo-600 font-bold"> cho ví dụ trích dẫn, v.v.). KHÔNG TRẢ VỀ DẤU CODE BLOCK MẶC ĐỊNH (không dùng \\\`\\\`\\\`html). Trả về trực tiếp HTML đẹp mắt, rõ ràng và dễ đọc.

Đoạn văn bản:
\${rawText}\`;`;

html = html.replace(oldPrompt, newPrompt);
fs.writeFileSync('pga.html', html);
console.log("Updated prompt to include both grammar dissector and phrase extraction");
