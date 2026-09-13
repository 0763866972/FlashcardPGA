const fs = require('fs');

let html = fs.readFileSync('pga.html', 'utf8');

const oldPrompt = `            const prompt = \`Nhiệm vụ của bạn là đóng vai trò "CHUYÊN GIA NGỮ PHÁP TIẾNG ANH" để phân tích CỰC KỲ CHI TIẾT và CHUYÊN SÂU đoạn văn bản sau. Không bắt lỗi sai, mà chỉ phân tích mổ xẻ tận gốc rễ các điểm ngữ pháp và từ vựng hay.

YÊU CẦU QUAN TRỌNG NHẤT: Phần phân tích ngữ pháp phải CỰC KỲ KỸ LƯỠNG. Tuy nhiên, KHÔNG ĐƯỢC VIẾT THÀNH MỘT CỤC VĂN BẢN DÀI THÒNG KHÓ ĐỌC. BẮT BUỘC PHẢI CHIA NHỎ Ý RA THÀNH CÁC BULLET POINTS (<ul><li>) ĐỂ DỄ NHÌN.

TRÌNH BÀY DƯỚI DẠNG HTML (không dùng code block \\\`\\\`\\\`). Hãy tuân thủ NGHIÊM NGẶT cấu trúc 3 phần sau:`;

const newPrompt = `            const prompt = \`Nhiệm vụ của bạn là đóng vai trò "CHUYÊN GIA NGỮ PHÁP TIẾNG ANH" để phân tích CỰC KỲ CHI TIẾT và CHUYÊN SÂU đoạn văn bản sau. Không bắt lỗi sai, mà chỉ phân tích mổ xẻ tận gốc rễ các điểm ngữ pháp và từ vựng hay.

YÊU CẦU QUAN TRỌNG NHẤT: Phần phân tích ngữ pháp phải CỰC KỲ KỸ LƯỠNG. Tuy nhiên, KHÔNG ĐƯỢC VIẾT THÀNH MỘT CỤC VĂN BẢN DÀI THÒNG KHÓ ĐỌC. BẮT BUỘC PHẢI CHIA NHỎ Ý RA THÀNH CÁC BULLET POINTS (<ul><li>) ĐỂ DỄ NHÌN. 
Đặc biệt, trong phần giải thích (các bullet points), BẤT CỨ KHI NÀO BẠN TRÍCH DẪN từ vựng, cấu trúc, hoặc câu văn tiếng Anh (đặt trong ngoặc kép "..." hoặc ngoặc đơn), BẮT BUỘC phải bôi đậm và tô màu xanh dương đậm hoặc tím bằng thẻ <strong class="text-indigo-600">"trích dẫn"</strong> để làm nổi bật sự khác biệt giữa tiếng Anh và tiếng Việt.

TRÌNH BÀY DƯỚI DẠNG HTML (không dùng code block \\\`\\\`\\\`). Hãy tuân thủ NGHIÊM NGẶT cấu trúc 3 phần sau:`;

html = html.replace(oldPrompt, newPrompt);
fs.writeFileSync('pga.html', html);
console.log("Updated prompt to colorize English quotes inside explanations");
