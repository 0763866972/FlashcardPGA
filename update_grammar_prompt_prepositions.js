const fs = require('fs');

let html = fs.readFileSync('pga.html', 'utf8');

const oldPrompt = `  10. Cấu trúc diễn đạt sự lựa chọn / cân nhắc (Alternatives/Choices): BẮT BUỘC PHÂN TÍCH các cấu trúc như "whether it is better to do A or do B", "whether... or...". Phân tích cả cụm dài để thấy được cách tác giả đặt lên bàn cân hai sự lựa chọn (ví dụ: make their own decisions vs seeking advice).`;

const newPrompt = `  10. Cấu trúc diễn đạt sự lựa chọn / cân nhắc (Alternatives/Choices): BẮT BUỘC PHÂN TÍCH các cấu trúc như "whether it is better to do A or do B", "whether... or...". Phân tích cả cụm dài để thấy được cách tác giả đặt lên bàn cân hai sự lựa chọn (ví dụ: make their own decisions vs seeking advice).
  11. Các cụm từ đi kèm giới từ cố định (Prepositional Collocations / Phrasal Verbs): KHÔNG CHỈ liệt kê cấu trúc, mà nếu trong bài có các cụm từ/động từ/tính từ luôn đi kèm với một giới từ nhất định (ví dụ: except for, take care of, depend on, familiar with, insight into...), BẮT BUỘC phải lôi ra phân tích. Giải thích rõ tại sao từ này lại đi với giới từ này, và ý nghĩa trọn vẹn của cả cụm là gì.`;

html = html.replace(oldPrompt, newPrompt);
fs.writeFileSync('pga.html', html);
console.log("Updated prompt to include collocations/phrasal verbs with prepositions in Part 2");
