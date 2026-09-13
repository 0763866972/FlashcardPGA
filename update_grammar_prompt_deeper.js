const fs = require('fs');

let html = fs.readFileSync('pga.html', 'utf8');

const oldPrompt = `            const prompt = \`Nhiệm vụ của bạn là đóng vai trò "Người mổ xẻ" để phân tích CHI TIẾT đoạn văn bản sau. Không bắt lỗi sai, mà chỉ phân tích sâu sắc các điểm ngữ pháp và từ vựng hay.

TRÌNH BÀY DƯỚI DẠNG HTML (không dùng code block \\\`\\\`\\\`). Hãy tuân thủ NGHIÊM NGẶT cấu trúc 3 phần sau:`;

const newPrompt = `            const prompt = \`Nhiệm vụ của bạn là đóng vai trò "CHUYÊN GIA NGỮ PHÁP TIẾNG ANH" để phân tích CỰC KỲ CHI TIẾT và CHUYÊN SÂU đoạn văn bản sau. Không bắt lỗi sai, mà chỉ phân tích mổ xẻ tận gốc rễ các điểm ngữ pháp và từ vựng hay.

YÊU CẦU QUAN TRỌNG NHẤT: Phần phân tích ngữ pháp phải CỰC KỲ KỸ LƯỠNG. Đừng chỉ nêu tên cấu trúc hời hợt. Hãy phân tích cặn kẽ TẠI SAO tác giả lại dùng nó ở ngữ cảnh này, nó mang lại sắc thái ý nghĩa gì, tác dụng trong câu là gì (ví dụ: nhấn mạnh, tạo sự trang trọng, nối ý, v.v.). Phân tích ít nhất 3-5 điểm ngữ pháp cốt lõi.

TRÌNH BÀY DƯỚI DẠNG HTML (không dùng code block \\\`\\\`\\\`). Hãy tuân thủ NGHIÊM NGẶT cấu trúc 3 phần sau:`;

html = html.replace(oldPrompt, newPrompt);

const oldPrompt2 = `    <em>Giải thích: </em><span class="text-slate-700">[Giải thích cực kỳ chi tiết, cặn kẽ tại sao người viết lại dùng cấu trúc này, tác dụng của nó là gì trong câu...]</span>`;
const newPrompt2 = `    <em>Giải thích: </em><span class="text-slate-700">[Giải thích CHUYÊN SÂU và DÀI DÒNG: Cấu trúc này hoạt động như thế nào? Tại sao người viết lại chọn cấu trúc này thay vì cấu trúc khác? Nó giúp ích gì cho ý nghĩa hoặc sắc thái của câu (tính trang trọng, nhấn mạnh, súc tích...)?]</span>`;

html = html.replace(oldPrompt2, newPrompt2);

fs.writeFileSync('pga.html', html);
console.log("Updated prompt to demand deep, detailed grammatical analysis");
