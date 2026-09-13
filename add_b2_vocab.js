const fs = require('fs');
let html = fs.readFileSync('pga.html', 'utf8');

const target11 = `11. Các cụm từ đi kèm giới từ cố định (Prepositional Collocations / Phrasal Verbs): KHÔNG CHỈ liệt kê cấu trúc, mà nếu trong bài có các cụm từ luôn đi kèm giới từ (ví dụ: except for, take care of, regarding, depend on...), BẮT BUỘC phải lôi ra phân tích. ĐẶC BIỆT BẮT BUỘC PHẢI CHỈ RÕ CÔNG THỨC: Sau giới từ/cụm từ đó phải cộng với dạng từ gì (ví dụ: + Noun / Noun Phrase / V-ing). Giải thích rõ ý nghĩa trọn vẹn của cả cụm là gì.`;

const replacement11and12 = `11. Các cụm từ đi kèm giới từ cố định (Prepositional Collocations / Phrasal Verbs): KHÔNG CHỈ liệt kê cấu trúc, mà nếu trong bài có các cụm từ luôn đi kèm giới từ (ví dụ: except for, take care of, regarding, depend on...), BẮT BUỘC phải lôi ra phân tích. ĐẶC BIỆT BẮT BUỘC PHẢI CHỈ RÕ CÔNG THỨC: Sau giới từ/cụm từ đó phải cộng với dạng từ gì (ví dụ: + Noun / Noun Phrase / V-ing). Giải thích rõ ý nghĩa trọn vẹn của cả cụm là gì.
12. Từ vựng và Cụm từ vựng Nâng cao (Advanced Vocabulary - CEFR B2+): BẮT BUỘC phải tìm và lôi ra phân tích các từ vựng, cụm từ vựng, hoặc cách diễn đạt hay mang tính học thuật từ cấp độ B2 trở lên (B2, C1, C2).`;

html = html.replace(target11, replacement11and12);

const targetTemplate = `<strong style="color: [MÀU KHỚP PHẦN 1]; text-xl">[Cụm từ vựng tiếng Anh]</strong> <span class="text-slate-600 text-base">([Loại từ])</span>`;
const replacementTemplate = `<strong style="color: [MÀU KHỚP PHẦN 1]; text-xl">[Từ/Cụm từ vựng tiếng Anh]</strong> <span class="text-slate-600 text-base">([Loại từ] - [Cấp độ B2/C1/C2 nếu có])</span>`;

html = html.replace(targetTemplate, replacementTemplate);

fs.writeFileSync('pga.html', html);
console.log('Added requirement 12 for B2+ vocabulary!');
