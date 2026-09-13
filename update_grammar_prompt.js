const fs = require('fs');

let html = fs.readFileSync('pga.html', 'utf8');

const oldPrompt = `            const prompt = \`Nhiệm vụ của bạn là phân tích ngữ pháp tiếng Anh của đoạn văn bản sau.
Hãy chỉ ra các lỗi sai ngữ pháp, chính tả, cách dùng từ (nếu có) và đưa ra bản sửa lỗi hoàn thiện. Ngoài ra hãy nhận xét ngắn gọn về độ tự nhiên và mức độ từ vựng.
TRẢ VỀ KẾT QUẢ DƯỚI DẠNG MÃ HTML (chỉ dùng thẻ <div>, <h3>, <p>, <ul>, <li>, <strong>, <em>, <span class="text-rose-500 font-bold"> cho lỗi sai, <span class="text-emerald-600 font-bold"> cho phần sửa lại, v.v.). KHÔNG TRẢ VỀ DẤU CODE BLOCK MẶC ĐỊNH (không dùng \\\`\\\`\\\`html). Trả về trực tiếp HTML đẹp mắt.
Đoạn văn bản:
\${rawText}\`;`;

const newPrompt = `            const prompt = \`Nhiệm vụ của bạn là phân tích cấu trúc và các điểm ngữ pháp tiếng Anh nổi bật trong đoạn văn bản sau.
Hãy liệt kê và giải thích rõ ràng các điểm ngữ pháp quan trọng được người viết sử dụng. Ví dụ: tại sao lại dùng V-ing sau từ 'when', các thì (tenses) đang dùng mang ý nghĩa gì, mệnh đề quan hệ, cấu trúc câu bị động, câu điều kiện, v.v. Không phải là tìm lỗi sai, mà là giải thích ngữ pháp của câu để người đọc hiểu được cấu trúc.
TRẢ VỀ KẾT QUẢ DƯỚI DẠNG MÃ HTML (chỉ dùng thẻ <div>, <h3>, <p>, <ul>, <li>, <strong>, <em>, <span class="text-brand-600 font-bold"> cho cấu trúc nổi bật, <span class="text-indigo-600 font-bold"> cho ví dụ, v.v.). KHÔNG TRẢ VỀ DẤU CODE BLOCK MẶC ĐỊNH (không dùng \\\`\\\`\\\`html). Trả về trực tiếp HTML đẹp mắt và dễ đọc.
Đoạn văn bản:
\${rawText}\`;`;

html = html.replace(oldPrompt, newPrompt);
fs.writeFileSync('pga.html', html);
console.log("Updated prompt for grammar analysis");
