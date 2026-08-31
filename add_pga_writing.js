const fs = require('fs');
let pgaScript = fs.readFileSync('pga_script.js', 'utf8');

const additionalCode = `
// ==========================================
// PGA WRITING MODE (FLASHCARD STYLE)
// ==========================================
let isWritingMode = false;

window.toggleWritingMode = async function() {
    const textarea = document.getElementById('textInput');
    const writingContent = document.getElementById('writingContent');
    const dictContent = document.getElementById('dictContent');
    const btnText = document.getElementById('toggleWritingText');
    const toggleDictBtn = document.getElementById('toggleDictBtn');
    
    if (isWritingMode) {
        // Tắt chế độ viết
        isWritingMode = false;
        writingContent.classList.add('hidden');
        textarea.classList.remove('hidden');
        btnText.innerText = 'Bật chế độ Viết';
        toggleDictBtn.classList.remove('hidden');
    } else {
        // Bật chế độ viết
        const rawText = textarea.value.trim();
        if (!rawText) return alert("Vui lòng nhập văn bản trước!");
        
        // Nếu đang bật chế độ Đọc thì tắt đi
        if (typeof isDictMode !== 'undefined' && isDictMode) {
            toggleDictMode();
        }
        
        isWritingMode = true;
        textarea.classList.add('hidden');
        toggleDictBtn.classList.add('hidden'); // ẩn nút đọc
        writingContent.classList.remove('hidden');
        btnText.innerText = 'Tắt chế độ Viết';
        
        // Kiểm tra xem đã render chưa (dựa vào text gốc, nếu đổi text thì render lại)
        if (writingContent.getAttribute('data-raw') === rawText) {
            return; // Đã render rồi
        }
        
        writingContent.innerHTML = '<div class="flex flex-col items-center justify-center p-10"><i class="fa-solid fa-spinner fa-spin text-4xl text-brand-500 mb-4"></i><p class="text-slate-500 font-medium animate-pulse">AI đang phân tách câu và dịch nghĩa, vui lòng đợi...</p></div>';
        
        try {
            const apiKey = getApiKey();
            if (!apiKey) {
                toggleWritingMode(); // revert
                return alert("Vui lòng nhập API Key ở góc trên bên phải.");
            }
            
            const prompt = \`Nhiệm vụ của bạn là phân tích đoạn văn bản tiếng Anh sau và chia nó thành các câu hoàn chỉnh riêng biệt.
Đối với mỗi câu, hãy cung cấp bản dịch tiếng Việt tự nhiên, sát nghĩa và phù hợp ngữ cảnh.
TRẢ VỀ ĐÚNG MỘT MẢNG JSON, mỗi phần tử có định dạng:
{
  "en": "câu tiếng Anh nguyên gốc",
  "vi": "dịch nghĩa tiếng Việt"
}
Không trả về bất kỳ text nào khác ngoài chuỗi JSON.

Đoạn văn bản:
\${rawText}\`;
            
            const selectedModel = document.getElementById('aiModelSelect').value || "gemini-2.5-flash";
            const url = \`https://generativelanguage.googleapis.com/v1beta/models/\${selectedModel}:generateContent?key=\${apiKey}\`;
            
            const payload = {
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.2,
                    responseMimeType: "application/json"
                }
            };
            
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) throw new Error("Lỗi kết nối đến Gemini API.");
            const data = await response.json();
            
            let jsonStr = data.candidates[0].content.parts[0].text;
            let sentences = JSON.parse(jsonStr);
            
            renderWritingMode(sentences, rawText);
            
        } catch (error) {
            console.error(error);
            writingContent.innerHTML = \`<div class="text-red-500 p-4 border border-red-300 bg-red-50 rounded-xl"><strong>Lỗi:</strong> \${error.message}. Thử lại sau nhé.</div>\`;
            writingContent.removeAttribute('data-raw');
        }
    }
}

function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

function renderWritingMode(sentences, rawText) {
    const writingContent = document.getElementById('writingContent');
    writingContent.setAttribute('data-raw', rawText);
    
    let html = \`<div class="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
        <h4 class="text-lg font-bold text-slate-700"><i class="fa-solid fa-pen-nib text-emerald-500 mr-2"></i>Luyện Viết Từng Câu</h4>
        <button onclick="toggleAllPgaWriting(event)" class="text-slate-400 hover:text-brand-400 transition-colors" title="Bật/Tắt chế độ luyện viết (tất cả)">
            <i class="fa-solid fa-eye text-xl" id="pgaEyeIconAll"></i>
        </button>
    </div>\`;
    
    sentences.forEach((item, idx) => {
        html += \`
        <div class="mb-6 p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div class="flex items-start gap-3 mb-2">
                <button onclick="togglePgaGrammarWriting(\${idx})" class="mt-0.5 text-slate-400 hover:text-brand-400 transition-colors shrink-0" title="Luyện viết câu này">
                    <i class="fa-solid fa-eye" id="pgaEyeIcon_\${idx}"></i>
                </button>
                <div class="flex-1">
                    <p id="pgaEnSentence_\${idx}" class="text-indigo-600 font-medium text-lg leading-relaxed">\${escapeHTML(item.en)}</p>
                    <p class="text-slate-500 mt-1"><i class="fa-solid fa-language mr-1 opacity-50"></i> \${escapeHTML(item.vi)}</p>
                </div>
            </div>
            
            <div id="pgaWriteContainer_\${idx}" data-vi="\${escapeHTML(item.vi)}" class="hidden mt-4 p-4 bg-slate-900/90 rounded-xl w-full">
                <div class="relative">
                    <textarea id="pgaWriteInput_\${idx}" class="w-full bg-slate-800 text-white p-3 pr-12 rounded-lg border border-slate-600 focus:border-brand-500 outline-none text-sm leading-relaxed placeholder-slate-500 resize-y" rows="2" placeholder="Dịch câu trên sang tiếng Anh..."></textarea>
                    <button id="pgaDictateBtn_\${idx}" onclick="startPgaDictation(\${idx})" class="absolute right-3 bottom-3 text-slate-400 hover:text-brand-400 transition-colors" title="Đọc bằng giọng nói">
                        <i class="fa-solid fa-microphone"></i>
                    </button>
                </div>
                
                <div class="flex justify-between items-center mt-3">
                    <span class="text-xs text-slate-400 italic"><i class="fa-solid fa-circle-info mr-1"></i>Đúng ngữ pháp, đúng ý là được.</span>
                    <button onclick="submitPgaGrammarWriting(\${idx})" class="bg-brand-600 hover:bg-brand-500 text-white text-xs px-4 py-2 rounded-lg font-bold transition-all shadow-md flex items-center gap-1 active:scale-95" id="pgaWriteSubmitBtn_\${idx}">
                        Gửi đánh giá <i class="fa-solid fa-paper-plane"></i>
                    </button>
                </div>
                <div id="pgaWriteFeedback_\${idx}" class="hidden mt-4 p-4 text-sm rounded-lg bg-slate-950/80 border border-slate-700 leading-relaxed text-white"></div>
            </div>
        </div>
        \`;
    });
    
    writingContent.innerHTML = html;
}

window.toggleAllPgaWriting = function(e) {
    if (e) e.stopPropagation();
    
    const eyeIconAll = document.getElementById('pgaEyeIconAll');
    if (!eyeIconAll) return;
    let isOpening = eyeIconAll.classList.contains('fa-eye');
    
    const containers = document.querySelectorAll('[id^="pgaWriteContainer_"]');
    
    containers.forEach((container) => {
        const idx = container.id.split('_')[1];
        const eyeIcon = document.getElementById(\`pgaEyeIcon_\${idx}\`);
        const enSentence = document.getElementById(\`pgaEnSentence_\${idx}\`);
        
        if (isOpening) {
            container.classList.remove('hidden');
            if (eyeIcon) {
                eyeIcon.classList.replace('fa-eye', 'fa-eye-slash');
                eyeIcon.classList.add('text-brand-400');
            }
            if (enSentence) enSentence.style.display = 'none';
        } else {
            container.classList.add('hidden');
            if (eyeIcon) {
                eyeIcon.classList.replace('fa-eye-slash', 'fa-eye');
                eyeIcon.classList.remove('text-brand-400');
            }
            if (enSentence) enSentence.style.display = '';
        }
    });
    
    if (isOpening) {
        eyeIconAll.classList.replace('fa-eye', 'fa-eye-slash');
        eyeIconAll.classList.add('text-brand-400');
    } else {
        eyeIconAll.classList.replace('fa-eye-slash', 'fa-eye');
        eyeIconAll.classList.remove('text-brand-400');
    }
};

window.togglePgaGrammarWriting = function(idx) {
    const enSentence = document.getElementById(\`pgaEnSentence_\${idx}\`);
    const container = document.getElementById(\`pgaWriteContainer_\${idx}\`);
    const icon = document.getElementById(\`pgaEyeIcon_\${idx}\`);
    
    if (container.classList.contains('hidden')) {
        container.classList.remove('hidden');
        if (enSentence) enSentence.style.display = 'none';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
        icon.classList.add('text-brand-400');
    } else {
        container.classList.add('hidden');
        if (enSentence) enSentence.style.display = '';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
        icon.classList.remove('text-brand-400');
    }
};

window.startPgaDictation = function(idx) {
    const input = document.getElementById(\`pgaWriteInput_\${idx}\`);
    const btn = document.getElementById(\`pgaDictateBtn_\${idx}\`);
    if (!input || !btn) return;
    
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert("Trình duyệt của bạn không hỗ trợ tính năng nhận diện giọng nói. Vui lòng sử dụng Google Chrome hoặc Edge.");
        return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    
    const originalBtnHtml = btn.innerHTML;
    const originalBtnClass = btn.className;
    
    recognition.onstart = function() {
        btn.innerHTML = '<i class="fa-solid fa-microphone-slash fa-beat-fade"></i>';
        btn.classList.add('text-red-400');
        btn.classList.remove('text-slate-400', 'hover:text-brand-400');
    };
    
    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        if (input.value.trim() === '') {
            input.value = transcript;
        } else {
            input.value = input.value + ' ' + transcript;
        }
    };
    
    recognition.onerror = function(event) {
        console.error("Speech recognition error", event.error);
    };
    
    recognition.onend = function() {
        btn.innerHTML = originalBtnHtml;
        btn.className = originalBtnClass;
    };
    
    recognition.start();
};

window.submitPgaGrammarWriting = async function(idx) {
    const inputEl = document.getElementById(\`pgaWriteInput_\${idx}\`);
    const submitBtn = document.getElementById(\`pgaWriteSubmitBtn_\${idx}\`);
    const feedbackEl = document.getElementById(\`pgaWriteFeedback_\${idx}\`);
    const containerEl = document.getElementById(\`pgaWriteContainer_\${idx}\`);
    const viTranslation = containerEl.getAttribute('data-vi');
    
    const userSentence = inputEl.value.trim();
    if (!userSentence) {
        inputEl.focus();
        return;
    }
    
    const apiKey = getApiKey();
    if (!apiKey) return alert("Vui lòng nhập API Key!");
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang chấm...';
    submitBtn.classList.add('opacity-70');
    
    feedbackEl.classList.remove('hidden');
    feedbackEl.innerHTML = '<div class="flex items-center text-slate-400"><i class="fa-solid fa-circle-notch fa-spin mr-2"></i> AI đang phân tích ngữ pháp...</div>';
    
    const systemPrompt = \`Đóng vai một giáo viên tiếng Anh chấm bài.
Học sinh cần viết lại một câu tiếng Anh dựa trên ý nghĩa tiếng Việt được cung cấp.
- Đánh giá xem câu của học sinh viết có ĐÚNG NGỮ PHÁP và ĐÚNG Ý NGHĨA hay không.
- Học sinh KHÔNG CẦN viết chính xác từng chữ giống câu gốc, miễn là diễn đạt đúng ý và chuẩn ngữ pháp.
- Nếu học sinh viết sai (ngữ pháp, từ vựng, hoặc sai nghĩa), hãy chỉ ra lỗi sai và giải thích ngắn gọn bằng TIẾNG VIỆT. Đưa ra một vài gợi ý sửa lại cho đúng.
- Nếu học sinh viết đúng, hãy dành một lời khen ngắn gọn.
TRẢ VỀ ĐỊNH DẠNG HTML ĐƠN GIẢN (dùng thẻ <b>, <i>, <span class="text-emerald-400 font-bold"> cho chữ đúng, <span class="text-rose-400 font-bold"> cho chữ sai). KHÔNG dùng markdown block.\`;

    const userPrompt = \`Câu tiếng Việt gốc cần truyền đạt: "\${viTranslation}"
Câu học sinh viết: "\${userSentence}"
Hãy chấm điểm và nhận xét.\`;

    try {
        const selectedModel = document.getElementById('aiModelSelect').value || "gemini-2.5-flash";
        const url = \`https://generativelanguage.googleapis.com/v1beta/models/\${selectedModel}:generateContent?key=\${apiKey}\`;
        
        const payload = {
            contents: [{ parts: [{ text: userPrompt }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: { temperature: 0.2 }
        };
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) throw new Error("API Error");
        const data = await response.json();
        
        let feedbackHtml = data.candidates[0].content.parts[0].text;
        
        // Remove markdown code blocks if AI still adds them
        feedbackHtml = feedbackHtml.replace(/\`\`\`html\\n?/g, '').replace(/\`\`\`/g, '');
        
        feedbackEl.innerHTML = \`<div class="border-l-4 border-brand-500 pl-3 py-1">\${feedbackHtml}</div>\`;
    } catch (err) {
        feedbackEl.innerHTML = \`<div class="text-red-400"><i class="fa-solid fa-triangle-exclamation mr-1"></i> Lỗi: \${err.message}</div>\`;
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Gửi đánh giá <i class="fa-solid fa-paper-plane ml-1"></i>';
        submitBtn.classList.remove('opacity-70');
    }
};
`;

if (!pgaScript.includes('window.toggleWritingMode')) {
    fs.writeFileSync('pga_script.js', pgaScript + '\n' + additionalCode, 'utf8');
    console.log("Successfully added writing mode to pga_script.js");
} else {
    console.log("Writing mode already exists in pga_script.js");
}
