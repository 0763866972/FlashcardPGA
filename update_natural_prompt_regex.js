const fs = require('fs');
let html = fs.readFileSync('pga.html', 'utf8');

const regex1 = /<!-- Nếu câu hoàn toàn đúng ngữ pháp cơ bản, ghi <li><span class="text-emerald-600 font-bold">Tuyệt vời!<\/span> Câu của bạn hoàn toàn chính xác\.<\/li> -->\s*<\/ul>/g;
const replacement1 = `<!-- Nếu câu hoàn toàn đúng ngữ pháp cơ bản, ghi <li><span class="text-emerald-600 font-bold">Tuyệt vời!</span> Câu của bạn hoàn toàn chính xác về ngữ pháp.</li> -->
        <!-- NẾU câu đúng ngữ pháp nhưng diễn đạt không tự nhiên, BẮT BUỘC thêm 1 thẻ <li>: <li><span class="text-amber-600 font-bold">Lưu ý:</span> Câu của bạn đúng ngữ pháp nhưng diễn đạt chưa được tự nhiên lắm.</li> -->
    </ul>`;

const regex2 = /<div class="mb-3">\s*<div class="text-xs text-slate-600 mb-1 uppercase tracking-wide font-bold"><i class="fa-solid fa-wand-magic-sparkles mr-1"><\/i>Câu đã sửa \(Theo văn phong của bạn\):<\/div>\s*<div class="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 font-medium ai-corrected-text">\s*<!-- Sửa lại câu cho đúng DỰA TRÊN TỪ VỰNG MÀ HỌC SINH ĐÃ DÙNG \(giữ nguyên các từ vựng đúng ngữ pháp của học sinh, không thay bằng từ của câu gốc\) -->\s*<\/div>\s*<\/div>/g;

const replacement2 = `<div class="mb-3">
    <div class="text-xs text-slate-600 mb-1 uppercase tracking-wide font-bold"><i class="fa-solid fa-wand-magic-sparkles mr-1"></i>Câu đã sửa (Theo văn phong của bạn):</div>
    <div class="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 font-medium ai-corrected-text">
        <!-- Sửa lại câu cho đúng DỰA TRÊN TỪ VỰNG MÀ HỌC SINH ĐÃ DÙNG (giữ nguyên các từ vựng đúng ngữ pháp của học sinh, không thay bằng từ của câu gốc) -->
    </div>
</div>
<!-- CHỈ TRẢ VỀ BLOCK DƯỚI ĐÂY NẾU CÂU CỦA HỌC SINH KHÔNG TỰ NHIÊN. NẾU CÂU ĐÃ TỰ NHIÊN RỒI THÌ KHÔNG TRẢ VỀ BLOCK NÀY:
<div class="mb-3">
    <div class="text-xs text-slate-600 mb-1 uppercase tracking-wide font-bold"><i class="fa-solid fa-leaf mr-1"></i>Câu sửa cho tự nhiên:</div>
    <div class="p-3 bg-teal-50 border border-teal-200 rounded-lg text-teal-800 font-medium">
        (Viết lại câu của học sinh sao cho tự nhiên, giống native speaker nhất, nhưng vẫn giữ nguyên ý)
    </div>
</div>
-->`;

let found = false;
if (regex1.test(html)) {
    html = html.replace(regex1, replacement1);
    found = true;
} else {
    console.log('Regex 1 not found');
}

if (regex2.test(html)) {
    html = html.replace(regex2, replacement2);
    found = true;
} else {
    console.log('Regex 2 not found');
}

if (found) {
    fs.writeFileSync('pga.html', html);
    console.log('Done!');
}
