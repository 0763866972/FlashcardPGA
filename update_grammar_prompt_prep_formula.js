const fs = require('fs');

let html = fs.readFileSync('pga.html', 'utf8');

const oldPrompt = `  11. Các cụm từ đi kèm giới từ cố định (Prepositional Collocations / Phrasal Verbs): KHÔNG CHỈ liệt kê cấu trúc, mà nếu trong bài có các cụm từ/động từ/tính từ luôn đi kèm với một giới từ nhất định (ví dụ: except for, take care of, depend on, familiar with, insight into...), BẮT BUỘC phải lôi ra phân tích. Giải thích rõ tại sao từ này lại đi với giới từ này, và ý nghĩa trọn vẹn của cả cụm là gì.`;

const newPrompt = `  11. Các cụm từ đi kèm giới từ cố định (Prepositional Collocations / Phrasal Verbs): KHÔNG CHỈ liệt kê cấu trúc, mà nếu trong bài có các cụm từ luôn đi kèm giới từ (ví dụ: except for, take care of, regarding, depend on...), BẮT BUỘC phải lôi ra phân tích. ĐẶC BIỆT BẮT BUỘC PHẢI CHỈ RÕ CÔNG THỨC: Sau giới từ/cụm từ đó phải cộng với dạng từ gì (ví dụ: + Noun / Noun Phrase / V-ing). Giải thích rõ ý nghĩa trọn vẹn của cả cụm là gì.`;

html = html.replace(oldPrompt, newPrompt);
fs.writeFileSync('pga.html', html);
console.log("Updated prompt to require formulation (e.g. + N/V-ing) for prepositions");
