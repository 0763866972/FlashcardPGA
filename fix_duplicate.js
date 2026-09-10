const fs = require('fs');

let html = fs.readFileSync('pga.html', 'utf8');

const duplicateBlock = `<!-- CHỈ TRẢ VỀ BLOCK DƯỚI ĐÂY NẾU CÂU CỦA HỌC SINH KHÔNG TỰ NHIÊN. NẾU CÂU ĐÃ TỰ NHIÊN RỒI THÌ KHÔNG TRẢ VỀ BLOCK NÀY:
<div class="mb-3">
    <div class="text-xs text-slate-600 mb-1 uppercase tracking-wide font-bold"><i class="fa-solid fa-leaf mr-1"></i>Câu sửa cho tự nhiên:</div>
    <div class="p-3 bg-teal-50 border border-teal-200 rounded-lg text-teal-800 font-medium">
        (Viết lại câu của học sinh sao cho tự nhiên, giống native speaker nhất, nhưng vẫn giữ nguyên ý)
    </div>
</div>
-->
<!-- CHỈ TRẢ VỀ BLOCK DƯỚI ĐÂY NẾU CÂU CỦA HỌC SINH KHÔNG TỰ NHIÊN. NẾU CÂU ĐÃ TỰ NHIÊN RỒI THÌ KHÔNG TRẢ VỀ BLOCK NÀY:
<div class="mb-3">
    <div class="text-xs text-slate-600 mb-1 uppercase tracking-wide font-bold"><i class="fa-solid fa-leaf mr-1"></i>Câu sửa cho tự nhiên:</div>
    <div class="p-3 bg-teal-50 border border-teal-200 rounded-lg text-teal-800 font-medium">
        (Viết lại câu của học sinh sao cho tự nhiên, giống native speaker nhất, nhưng vẫn giữ nguyên ý)
    </div>
</div>
-->`;

const singleBlock = `<!-- CHỈ TRẢ VỀ BLOCK DƯỚI ĐÂY NẾU CÂU CỦA HỌC SINH KHÔNG TỰ NHIÊN. NẾU CÂU ĐÃ TỰ NHIÊN RỒI THÌ KHÔNG TRẢ VỀ BLOCK NÀY:
<div class="mb-3">
    <div class="text-xs text-slate-600 mb-1 uppercase tracking-wide font-bold"><i class="fa-solid fa-leaf mr-1"></i>Câu sửa cho tự nhiên:</div>
    <div class="p-3 bg-teal-50 border border-teal-200 rounded-lg text-teal-800 font-medium">
        (Viết lại câu của học sinh sao cho tự nhiên, giống native speaker nhất, nhưng vẫn giữ nguyên ý)
    </div>
</div>
-->`;

if (html.includes(duplicateBlock)) {
    html = html.replace(duplicateBlock, singleBlock);
    fs.writeFileSync('pga.html', html);
    console.log('Fixed duplicate block');
} else {
    console.log('Duplicate not found exactly as string');
}

