const fs = require('fs');
let content = fs.readFileSync('pga.html', 'utf8');

const targetStr = `<div class="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
        <h4 class="text-lg font-bold text-slate-700"><i class="fa-solid fa-pen-nib text-emerald-500 mr-2"></i>Luyn Vit Tng CAu</h4>
        <button onclick="toggleAllPgaWriting(event)" class="text-slate-400 hover:text-brand-400 transition-colors" title="Bt/T_t ch \`T luyn vit (tt c)">
            <i class="fa-solid fa-eye text-xl" id="pgaEyeIconAll"></i>
        </button>
    </div>`;

// Since there are encoding issues with string matching, let's use regex
const regex = /<div class="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">\s*<h4 class="text-lg font-bold text-slate-700"><i class="fa-solid fa-pen-nib text-emerald-500 mr-2"><\/i>.*?<\/h4>\s*<button onclick="toggleAllPgaWriting\(event\)" class="text-slate-400 hover:text-brand-400 transition-colors" title=".*?">\s*<i class="fa-solid fa-eye text-xl" id="pgaEyeIconAll"><\/i>\s*<\/button>\s*<\/div>/g;

content = content.replace(regex, `<div class="mb-4 flex items-center justify-start gap-4 border-b border-slate-200 pb-3">
        <h4 class="text-lg font-bold text-slate-700"><i class="fa-solid fa-pen-nib text-emerald-500 mr-2"></i>Luyện Viết Từng Câu</h4>
        <button onclick="toggleAllPgaWriting(event)" class="text-slate-400 hover:text-brand-400 transition-colors mt-0.5" title="Bật/Tắt chế độ luyện viết (tất cả)">
            <i class="fa-solid fa-eye text-xl" id="pgaEyeIconAll"></i>
        </button>
    </div>`);

fs.writeFileSync('pga.html', content);
console.log("Moved the eye button next to the title!");
