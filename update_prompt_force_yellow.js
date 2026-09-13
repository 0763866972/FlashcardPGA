const fs = require('fs');
let html = fs.readFileSync('pga.html', 'utf8');

const oldHighlightInstr = `Đặc biệt, BẤT CỨ KHI NÀO BẠN TRÍCH DẪN từ vựng, cấu trúc tiếng Anh (đặt trong ngoặc kép "..."), BẮT BUỘC phải bôi đậm và tô màu vàng bằng thẻ <strong class="text-amber-600 bg-amber-50 px-1 rounded">"trích dẫn"</strong> để làm nổi bật.`;
const newHighlightInstr = `Đặc biệt, trong phần giải thích chi tiết, BẤT CỨ KHI NÀO BẠN TRÍCH DẪN từ vựng, cấu trúc, chữ cái tiếng Anh (ví dụ: "allows", "To seek advice...", "V-ing"), BẮT BUỘC phải bôi đậm và tô màu vàng bằng thẻ <strong class="text-amber-600 bg-amber-50 px-1 rounded">"từ tiếng anh"</strong>. TUYỆT ĐỐI KHÔNG ĐƯỢC ĐỂ BẤT KỲ TỪ TIẾNG ANH NÀO TRONG NGOẶC KÉP MÀ KHÔNG CÓ THẺ MÀU VÀNG NÀY!`;
html = html.replace(oldHighlightInstr, newHighlightInstr);

fs.writeFileSync('pga.html', html);
console.log('Prompt updated to force yellow color on quoted words!');
