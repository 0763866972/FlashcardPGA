const fs = require('fs');
let content = fs.readFileSync('pga.html', 'utf8');

const regex = /<div class="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-sm ai-vocab-expansion">[\s\S]*?<\/div>/;

const newBlock = `<div class="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-sm ai-vocab-expansion">
          <!-- So sánh từ vựng học sinh dùng và câu gốc. 
          YÊU CẦU TRÌNH BÀY (RẤT QUAN TRỌNG):
          1. Dùng danh sách (<ul><li>) để trình bày rành mạch, dễ đọc.
          2. BỌC TẤT CẢ CÁC TỪ TIẾNG ANH (hoặc cụm từ tiếng Anh) trong thẻ <span class="font-bold text-amber-700">từ vựng</span> để làm nổi bật.
          3. CHỈ giải thích NGẮN GỌN sự khác biệt về sắc thái và NÊN DÙNG MỖI TỪ TRONG TÌNH HUỐNG/NGỮ CẢNH NÀO. Tuyệt đối KHÔNG CẦN giải thích cấu trúc ngữ pháp. -->
      </div>`;

if(content.match(regex)) {
    content = content.replace(regex, newBlock);
    fs.writeFileSync('pga.html', content);
    console.log("Updated vocab expansion prompt for better formatting!");
} else {
    console.log("Regex did not match.");
}
