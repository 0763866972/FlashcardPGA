const fs = require('fs');
let content = fs.readFileSync('pga.html', 'utf8');

const regexSubmit = /window\.submitPgaGrammarWriting = async function\(idx\) \{([\s\S]*?)const systemPrompt = `([\s\S]*?)`;\s*const userPrompt = `([\s\S]*?)`;/m;

const match = content.match(regexSubmit);

if (match) {
    const newSystemPrompt = `Đóng vai một giáo viên tiếng Anh chấm bài.
Học sinh cần viết lại một câu tiếng Anh dựa trên ý nghĩa tiếng Việt được cung cấp.
- Đánh giá xem câu của học sinh viết có ĐÚNG NGỮ PHÁP và ĐÚNG Ý NGHĨA hay không.
- Học sinh KHÔNG CẦN viết chính xác từng chữ giống câu gốc, miễn là diễn đạt đúng ý và chuẩn ngữ pháp thì vẫn được tính là ĐÚNG.
- Nếu câu của học sinh ĐÚNG, hãy dành lời khen ngợi.
- Nếu câu của học sinh SAI (ngữ pháp, từ vựng, hoặc sai nghĩa), hãy chỉ ra từng lỗi sai. VỚI MỖI LỖI SAI, BẠN PHẢI GIẢI THÍCH RÕ RÀNG LÝ DO VỀ MẶT NGỮ PHÁP HOẶC NGỮ NGHĨA (tại sao lại sai, cấu trúc đúng là gì, quy tắc ngữ pháp nào được áp dụng ở đây). Tuyệt đối không chỉ đưa ra câu sửa mà không giải thích nguyên nhân.
- QUAN TRỌNG: Hãy sửa lại câu cho đúng DỰA TRÊN CẤU TRÚC VÀ TỪ VỰNG MÀ HỌC SINH ĐÃ DÙNG (không ép học sinh phải dùng từ của câu gốc).
- Cuối cùng, luôn luôn in lại Câu mẫu gốc (Original sentence) để học sinh tham khảo thêm.
TRẢ VỀ ĐỊNH DẠNG HTML ĐƠN GIẢN (dùng thẻ <b>, <i>, <span class="text-emerald-400 font-bold"> cho chữ đúng, <span class="text-rose-400 font-bold"> cho chữ sai, <div class="mt-2 p-2 bg-slate-800 rounded">...</div> để bọc câu đã sửa). KHÔNG dùng markdown block.`;

    const newUserPrompt = match[3];

    const replacement = `window.submitPgaGrammarWriting = async function(idx) {${match[1]}const systemPrompt = \`${newSystemPrompt}\`;\n\n    const userPrompt = \`${newUserPrompt}\`;`;
    
    content = content.replace(regexSubmit, replacement);
    fs.writeFileSync('pga.html', content);
    console.log("Updated systemPrompt for detailed grammar explanation!");
} else {
    console.log("Could not match regex.");
}
