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
- Nếu câu của học sinh SAI (ngữ pháp, từ vựng, hoặc sai nghĩa), hãy chỉ ra lỗi sai và giải thích ngắn gọn. QUAN TRỌNG: Hãy sửa lại câu cho đúng DỰA TRÊN CẤU TRÚC VÀ TỪ VỰNG MÀ HỌC SINH ĐÃ DÙNG (không ép học sinh phải dùng từ của câu gốc).
- Cuối cùng, luôn luôn in lại Câu mẫu gốc (Original sentence) để học sinh tham khảo thêm.
TRẢ VỀ ĐỊNH DẠNG HTML ĐƠN GIẢN (dùng thẻ <b>, <i>, <span class="text-emerald-400 font-bold"> cho chữ đúng, <span class="text-rose-400 font-bold"> cho chữ sai, <div class="mt-2 p-2 bg-slate-800 rounded">...</div> để bọc câu đã sửa). KHÔNG dùng markdown block.`;

    const newUserPrompt = `Câu tiếng Việt gốc cần truyền đạt: "\${viTranslation}"
Câu học sinh viết: "\${userSentence}"
Câu mẫu gốc (để tham khảo): "\${originalEnSentence}"
Hãy chấm điểm và nhận xét chi tiết.`;

    let newLogic = match[1];
    
    // Add logic to get the original sentence
    if (!newLogic.includes('const originalEnSentence =')) {
        newLogic = newLogic.replace(
            /const viTranslation = containerEl\.getAttribute\('data-vi'\);/,
            `const viTranslation = containerEl.getAttribute('data-vi');\n    const originalEnSentence = document.getElementById('pgaEnSentence_' + idx).innerText;`
        );
    }
    
    const replacement = `window.submitPgaGrammarWriting = async function(idx) {${newLogic}const systemPrompt = \`${newSystemPrompt}\`;\n\n    const userPrompt = \`${newUserPrompt}\`;`;
    
    content = content.replace(regexSubmit, replacement);
    fs.writeFileSync('pga.html', content);
    console.log("Updated submitPgaGrammarWriting successfully!");
} else {
    console.log("Could not match regex.");
}
