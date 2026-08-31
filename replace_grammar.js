const fs = require('fs');
let content = fs.readFileSync('main.js', 'utf8');

const targetStr = `<ul class="list-disc pl-5 mt-1 space-y-1">
  <li>Cụm "..." -> <span class="text-teal-600 font-semibold">Giải thích cấu trúc ngữ pháp và LÝ DO SỬ DỤNG (vd: dùng V-ing vì đóng vai trò làm chủ ngữ / dùng 'that' để mở đầu mệnh đề danh từ...)</span></li>
  <li>(Phân tích SÂU SẮC hết toàn bộ câu tiếng Anh theo cách này)</li>
  </ul>`;

const replaceStr = `<ul class="list-disc pl-5 mt-1 space-y-1">
  <li>Cụm "..." -> <span class="text-teal-600 font-semibold">Chỉ ra ĐÚNG cụm từ tiếng Anh đóng vai trò thể hiện "Ý chính muốn truyền đạt" ở trên (BẮT BUỘC PHẢI CÓ MỤC NÀY ĐẦU TIÊN).</span></li>
  <li>Cụm "..." -> <span class="text-teal-600 font-semibold">Giải thích cấu trúc ngữ pháp và LÝ DO SỬ DỤNG (vd: dùng V-ing vì đóng vai trò làm chủ ngữ / dùng 'that' để mở đầu mệnh đề danh từ...)</span></li>
  <li>(Phân tích SÂU SẮC hết toàn bộ câu tiếng Anh theo cách này)</li>
  </ul>`;

content = content.replaceAll(targetStr, replaceStr);
fs.writeFileSync('main.js', content);
console.log("Replaced successfully!");
