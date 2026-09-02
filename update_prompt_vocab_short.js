const fs = require('fs');
let content = fs.readFileSync('pga.html', 'utf8');

// Use a regex to target the exact comment block and change it.
const regex = /<!-- So s.*nh t.*v.*ng h.*c sinh d.*ng vA c.*u g.*c.*-->/g;
const newComment = `<!-- So sánh từ vựng học sinh dùng và câu gốc. Ví dụ "start to play" vs "take up". CHỈ giải thích NGẮN GỌN sự khác biệt về sắc thái và độ tự nhiên, KHÔNG CẦN giải thích cách sử dụng. Nếu giống hệt nhau thì mở rộng thêm 1 từ đồng nghĩa hay. -->`;

content = content.replace(regex, newComment);

fs.writeFileSync('pga.html', content);
console.log("Updated instruction to omit 'cách dùng'.");
