const fs = require('fs');

let html = fs.readFileSync('pga.html', 'utf8');

// 1. Insert Button
const buttonStr = `<button onclick="toggleGrammarMode()" id="toggleGrammarBtn" class="bg-amber-50 text-amber-600 hover:bg-amber-100 px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-all flex items-center gap-2 border border-amber-100 active:scale-95">
                        <i class="fa-solid fa-spell-check"></i> <span id="toggleGrammarText">Phân tích Ngữ pháp</span>
                    </button>`;

if (!html.includes('toggleGrammarMode()')) {
    const target1 = `id="toggleWritingBtn" class="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-all flex items-center gap-2 border border-emerald-100 active:scale-95">
                        <i class="fa-solid fa-pen-to-square"></i> <span id="toggleWritingText">Bật chế độ Viết</span>
                    </button>`;
    html = html.replace(target1, target1 + '\n                    ' + buttonStr);
}

// 2. Insert Container
const containerStr = `<div id="grammarAnalysisContent" class="hidden w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-700 resize-y transition-all min-h-[250px] leading-relaxed"></div>`;

if (!html.includes('id="grammarAnalysisContent"')) {
    const target2 = `<div id="writingContent" class="hidden w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-700 resize-y transition-all min-h-[250px] leading-relaxed"></div>`;
    html = html.replace(target2, target2 + '\n            ' + containerStr);
}

// 3. Insert toggleGrammarMode logic
const jsLogic = `
let isGrammarMode = false;
window.toggleGrammarMode = async function() {
    const textarea = document.getElementById('textInput');
    const grammarContent = document.getElementById('grammarAnalysisContent');
    const btnText = document.getElementById('toggleGrammarText');
    const toggleDictBtn = document.getElementById('toggleDictBtn');
    const toggleWritingBtn = document.getElementById('toggleWritingBtn');

    if (isGrammarMode) {
        isGrammarMode = false;
        grammarContent.classList.add('hidden');
        textarea.classList.remove('hidden');
        btnText.innerText = 'Phân tích Ngữ pháp';
        if (toggleDictBtn) toggleDictBtn.classList.remove('hidden');
        if (toggleWritingBtn) toggleWritingBtn.classList.remove('hidden');
    } else {
        const rawText = textarea.value.trim();
        if (!rawText) return alert("Vui lòng nhập văn bản trước!");
        
        if (typeof isDictMode !== 'undefined' && isDictMode) toggleDictMode();
        if (typeof isWritingMode !== 'undefined' && isWritingMode) toggleWritingMode();

        isGrammarMode = true;
        textarea.classList.add('hidden');
        if (toggleDictBtn) toggleDictBtn.classList.add('hidden');
        if (toggleWritingBtn) toggleWritingBtn.classList.add('hidden');
        grammarContent.classList.remove('hidden');
        btnText.innerText = 'Đóng Phân tích';

        if (grammarContent.getAttribute('data-raw') === rawText) return;

        grammarContent.innerHTML = '<div class="flex flex-col items-center justify-center p-10"><i class="fa-solid fa-spinner fa-spin text-4xl text-amber-500 mb-4"></i><p class="text-slate-500 font-medium animate-pulse">AI đang phân tích ngữ pháp, vui lòng đợi...</p></div>';

        try {
            const apiKey = typeof getApiKey === 'function' ? getApiKey() : null;
            if (!apiKey) {
                toggleGrammarMode();
                return alert("Vui lòng nhập API Key ở góc trên bên phải.");
            }
            const prompt = \`Nhiệm vụ của bạn là phân tích ngữ pháp tiếng Anh của đoạn văn bản sau.
Hãy chỉ ra các lỗi sai ngữ pháp, chính tả, cách dùng từ (nếu có) và đưa ra bản sửa lỗi hoàn thiện. Ngoài ra hãy nhận xét ngắn gọn về độ tự nhiên và mức độ từ vựng.
TRẢ VỀ KẾT QUẢ DƯỚI DẠNG MÃ HTML (chỉ dùng thẻ <div>, <h3>, <p>, <ul>, <li>, <strong>, <em>, <span class="text-rose-500 font-bold"> cho lỗi sai, <span class="text-emerald-600 font-bold"> cho phần sửa lại, v.v.). KHÔNG TRẢ VỀ DẤU CODE BLOCK MẶC ĐỊNH (không dùng \\\`\\\`\\\`html). Trả về trực tiếp HTML đẹp mắt.
Đoạn văn bản:
\${rawText}\`;
            
            const selectedModel = document.getElementById('aiModelSelect') ? document.getElementById('aiModelSelect').value : "gemini-2.5-flash";
            const isGroq = !selectedModel.includes('gemini');
            const url = isGroq 
                ? 'https://api.groq.com/openai/v1/chat/completions' 
                : \\\`https://generativelanguage.googleapis.com/v1beta/models/\${selectedModel}:generateContent?key=\${apiKey}\\\`;
            
            let payload, response, data, htmlResult;
            if (isGroq) {
                payload = {
                    model: selectedModel,
                    messages: [{ role: "user", content: prompt }],
                    temperature: 0.2,
                    max_tokens: 5000
                };
                response = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "Authorization": \\\`Bearer \${apiKey}\\\` },
                    body: JSON.stringify(payload)
                });
                if (!response.ok) { let err = await response.text(); throw new Error(err || "Lỗi kết nối Groq API"); }
                data = await response.json();
                htmlResult = data.choices[0].message.content;
            } else {
                payload = {
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.2 }
                };
                response = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
                if (!response.ok) { let err = await response.text(); throw new Error(err || "Lỗi kết nối Gemini API"); }
                data = await response.json();
                htmlResult = data.candidates[0].content.parts[0].text;
            }

            htmlResult = htmlResult.replace(/^\\\`\\\`\\\`html\\n/, '').replace(/^\\\`\\\`\\\`\\n/, '').replace(/\\\`\\\`\\\`$/, '');

            grammarContent.innerHTML = htmlResult;
            grammarContent.setAttribute('data-raw', rawText);
        } catch (error) {
            console.error(error);
            grammarContent.innerHTML = \\\`<div class="text-rose-500 font-bold p-4 text-center">Lỗi: \${error.message}</div>\\\`;
            grammarContent.removeAttribute('data-raw');
        }
    }
};
`;

if (!html.includes('window.toggleGrammarMode = async function()')) {
    html = html.replace('window.toggleWritingMode = async function() {', jsLogic + '\nwindow.toggleWritingMode = async function() {');
}

// 4. Update toggleWritingMode to hide toggleGrammarBtn
if (html.includes('toggleDictBtn.classList.add(\'hidden\'); // ẩn nút đọc')) {
    html = html.replace(
        'toggleDictBtn.classList.add(\'hidden\'); // ẩn nút đọc',
        'toggleDictBtn.classList.add(\'hidden\'); // ẩn nút đọc\n        const tgb = document.getElementById(\'toggleGrammarBtn\'); if(tgb) tgb.classList.add(\'hidden\');'
    );
    html = html.replace(
        'toggleDictBtn.classList.remove(\'hidden\');',
        'toggleDictBtn.classList.remove(\'hidden\');\n        const tgb = document.getElementById(\'toggleGrammarBtn\'); if(tgb) tgb.classList.remove(\'hidden\');'
    );
}

// 5. Update toggleDictMode to handle Grammar mode
if (html.includes('if (isWritingMode) toggleWritingMode();')) {
    html = html.replace(
        'if (isWritingMode) toggleWritingMode();',
        'if (isWritingMode) toggleWritingMode();\n        if (typeof isGrammarMode !== \'undefined\' && isGrammarMode) toggleGrammarMode();'
    );
    html = html.replace(
        'toggleWritingBtn.classList.add(\'hidden\'); // ẩn nút viết',
        'toggleWritingBtn.classList.add(\'hidden\'); // ẩn nút viết\n        const tgb = document.getElementById(\'toggleGrammarBtn\'); if(tgb) tgb.classList.add(\'hidden\');'
    );
    html = html.replace(
        'toggleWritingBtn.classList.remove(\'hidden\');',
        'toggleWritingBtn.classList.remove(\'hidden\');\n        const tgb = document.getElementById(\'toggleGrammarBtn\'); if(tgb) tgb.classList.remove(\'hidden\');'
    );
}


fs.writeFileSync('pga.html', html);
console.log('Successfully injected grammar mode feature.');
