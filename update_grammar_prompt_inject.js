const fs = require('fs');

let html = fs.readFileSync('pga.html', 'utf8');

// 1. Remove toggle HTML
const toggleHTML = `<div class="flex items-center gap-2" id="grammarToggleContainer">
            <span class="text-sm font-semibold text-slate-600">Hiện bảng phân tích ngữ pháp</span>
            <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" id="showGrammarToggle" class="sr-only peer" onchange="toggleGrammarAtBottom(this.checked)">
                <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
        </div>`;
html = html.replace(toggleHTML, "");

const headerOld = `<div class="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
        <div class="flex items-center justify-start gap-4">
            <h4 class="text-lg font-bold text-slate-700"><i class="fa-solid fa-pen-nib text-emerald-500 mr-2"></i>Luyện Viết Từng Câu</h4>
            <button onclick="toggleAllPgaWriting(event)" class="text-slate-400 hover:text-brand-400 transition-colors mt-0.5" title="Bật/Tắt chế độ luyện viết (tất cả)">
                <i class="fa-solid fa-eye text-xl" id="pgaEyeIconAll"></i>
            </button>
        </div>
        
    </div>`;
const headerNew = `<div class="mb-4 flex items-center justify-start gap-4 border-b border-slate-200 pb-3">
        <h4 class="text-lg font-bold text-slate-700"><i class="fa-solid fa-pen-nib text-emerald-500 mr-2"></i>Luyện Viết Từng Câu</h4>
        <button onclick="toggleAllPgaWriting(event)" class="text-slate-400 hover:text-brand-400 transition-colors mt-0.5" title="Bật/Tắt chế độ luyện viết (tất cả)">
            <i class="fa-solid fa-eye text-xl" id="pgaEyeIconAll"></i>
        </button>
    </div>`;
html = html.replace(headerOld, headerNew);

// 2. Remove logic
const logicRegex = /\/\/ Ẩn\/hiện thanh gạt tuỳ thuộc vào việc có grammar content hay chưa[\s\S]*?\}\s*window\.toggleGrammarAtBottom\s*=\s*function\(checked\)\s*\{[\s\S]*?\}/;
html = html.replace(logicRegex, "");

// 3. Inject grammarContext into submitPgaGrammarWriting
const userPromptOld = '    const userPrompt = `Câu tiếng Việt gốc cần truyền đạt: "${viTranslation}"\\nCâu học sinh viết: "${userSentence}"\\nCâu mẫu gốc (để tham khảo): "${originalEnSentence}"\\nHãy chấm điểm và nhận xét chi tiết.`;';
const userPromptNew = `    const grammarContent = document.getElementById('grammarAnalysisContent');
    let grammarContext = '';
    if (grammarContent && grammarContent.innerText.trim()) {
        grammarContext = \`\\n\\n--- BẢNG PHÂN TÍCH NGỮ PHÁP CỦA BÀI ---\\n(Sử dụng bảng này để nhặt ra các Cấu trúc hay / Từ vựng đắt giá LIÊN QUAN ĐẾN CÂU MẪU GỐC TRÊN để điền vào phần mở rộng nhé):\\n\${grammarContent.innerText}\`;
    }

    const userPrompt = \`Câu tiếng Việt gốc cần truyền đạt: "\${viTranslation}"\\nCâu học sinh viết: "\${userSentence}"\\nCâu mẫu gốc (để tham khảo): "\${originalEnSentence}"\${grammarContext}\\n\\nHãy chấm điểm và nhận xét chi tiết.\`;`;
html = html.replace(userPromptOld, userPromptNew);

fs.writeFileSync('pga.html', html);
console.log("Updated pga.html to inject grammarContext into AI prompt");
