const fs = require('fs');

let html = fs.readFileSync('pga.html', 'utf8');

const currentNhanXet = `        <!-- Nếu câu hoàn toàn đúng ngữ pháp cơ bản, ghi <li><span class="text-emerald-600 font-bold">Tuyệt vời!</span> Câu của bạn hoàn toàn chính xác về ngữ pháp.</li> -->
        <!-- NẾU câu đúng ngữ pháp nhưng diễn đạt không tự nhiên, BẮT BUỘC thêm 1 thẻ <li>: <li><span class="text-amber-600 font-bold">Lưu ý:</span> Câu của bạn đúng ngữ pháp nhưng diễn đạt chưa được tự nhiên lắm.</li> -->
    </ul>`;
const originalNhanXet = `        <!-- Nếu câu hoàn toàn đúng ngữ pháp cơ bản, ghi <li><span class="text-emerald-600 font-bold">Tuyệt vời!</span> Câu của bạn hoàn toàn chính xác.</li> -->
    </ul>`;

html = html.replace(currentNhanXet, originalNhanXet);


const currentCauDaSua = `    <div class="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 font-medium ai-corrected-text">
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
const originalCauDaSua = `    <div class="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 font-medium ai-corrected-text">
        <!-- Sửa lại câu cho đúng DỰA TRÊN TỪ VỰNG MÀ HỌC SINH ĐÃ DÙNG (giữ nguyên các từ vựng đúng ngữ pháp của học sinh, không thay bằng từ của câu gốc) -->
    </div>
</div>`;

html = html.replace(currentCauDaSua, originalCauDaSua);

fs.writeFileSync('pga.html', html);
console.log('Successfully reverted the natural sentence blocks in pga.html!');
