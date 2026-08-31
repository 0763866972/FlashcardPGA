const fs = require('fs');
let lines = fs.readFileSync('main.js', 'utf8').split('\n');

const newBullet1 = `  <li>Cụm "..." -> <span class="text-teal-600 font-semibold">Chỉ ra ĐÚNG cụm từ tiếng Anh đóng vai trò thể hiện "Ý chính muốn truyền đạt" ở trên. BẮT BUỘC DỊCH NGHĨA cụm đó và GIẢI THÍCH CHI TIẾT tại sao cụm đó truyền đạt được ý tóm tắt, đồng thời NÊU RÕ VÀ GIẢI THÍCH CẤU TRÚC NGỮ PHÁP nếu có (VD: cụm 'waste time visiting' -> nghĩa là 'lãng phí thời gian đi', thể hiện lợi ích của việc mua sắm online. Ở đây dùng cấu trúc waste + time + V-ing để nhấn mạnh hành động bị lãng phí). (BẮT BUỘC PHẢI CÓ MỤC NÀY ĐẦU TIÊN).</span></li>`;

const oldBullet1 = `  <li>Cụm "..." -> <span class="text-teal-600 font-semibold">Chỉ ra ĐÚNG cụm từ tiếng Anh đóng vai trò thể hiện "Ý chính muốn truyền đạt" ở trên (BẮT BUỘC PHẢI CÓ MỤC NÀY ĐẦU TIÊN).</span></li>`;

const newBullet2 = `<li>Cụm "..." -> <span class="text-teal-600 font-semibold">Dịch nghĩa và giải thích CẶN KẼ cấu trúc ngữ pháp, LÝ DO SỬ DỤNG (vd: dùng V-ing vì đóng vai trò làm chủ ngữ). KHÔNG ĐƯỢC chỉ kết luận suông (như "Cấu trúc waste time V-ing rất phổ biến") mà phải GIẢI THÍCH RÕ cấu trúc đó có nghĩa là gì và đóng vai trò gì trong câu.</span></li>`;
const oldBullet2 = `<li>Cụm "..." -> <span class="text-teal-600 font-semibold">Giải thích cấu trúc ngữ pháp và LÝ DO SỬ DỤNG (vd: dùng V-ing vì đóng vai trò làm chủ ngữ / dùng 'that' để mở đầu mệnh đề danh từ...)</span></li>`;

for(let i=0; i<lines.length; i++) {
    if (lines[i].includes(oldBullet1)) {
        lines[i] = lines[i].replace(oldBullet1, newBullet1);
    }
    if (lines[i].includes(oldBullet2)) {
        lines[i] = lines[i].replace(oldBullet2, newBullet2);
    }
}

fs.writeFileSync('main.js', lines.join('\n'));
console.log("Lines replaced!");
