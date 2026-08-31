const fs = require('fs');
let lines = fs.readFileSync('main.js', 'utf8').split('\n');

const newListItem = `  <li>Cụm "..." -> <span class="text-teal-600 font-semibold">Chỉ ra ĐÚNG cụm từ tiếng Anh đóng vai trò thể hiện "Ý chính muốn truyền đạt" ở trên (BẮT BUỘC PHẢI CÓ MỤC NÀY ĐẦU TIÊN).</span></li>`;

// Insert at line 2079 (index 2078)
lines.splice(2078, 0, newListItem);

// Since we added 1 line, the old line 2277 is now 2278. The ul is at 2278, so we insert at 2279 (index 2278)
lines.splice(2278, 0, newListItem);

fs.writeFileSync('main.js', lines.join('\n'));
console.log("Lines inserted!");
