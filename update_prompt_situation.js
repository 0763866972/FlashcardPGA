const fs = require('fs');
let content = fs.readFileSync('pga.html', 'utf8');

// Target the comment we just injected
const regex = /<!-- So s.*nh t.*v.*ng h.*c sinh d.*ng vA c.*u g.*c.*-->/g;
const newComment = `<!-- So sánh từ vựng học sinh dùng và câu gốc. CHỈ giải thích NGẮN GỌN sự khác biệt về sắc thái và NÊN DÙNG MỖI TỪ TRONG TÌNH HUỐNG/NGỮ CẢNH NÀO. KHÔNG CẦN giải thích cấu trúc ngữ pháp. -->`;

content = content.replace(regex, newComment);

fs.writeFileSync('pga.html', content);
console.log("Updated instruction to emphasize usage situation/context.");
