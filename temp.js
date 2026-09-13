
// ==========================================
// PGA WRITING MODE (FLASHCARD STYLE)
// ==========================================
let isWritingMode = false;
window.getApiKey = function() {
    if (typeof getStorageKeyForModel !== 'function') return null;
    const storageKey = getStorageKeyForModel();
    const apiKeyRaw = localStorage.getItem(storageKey);
    if (!apiKeyRaw) return null;
    const keysArray = apiKeyRaw.split(',').map(k => k.trim()).filter(k => k);
    if (keysArray.length === 0) return null;
    window.clickKeyIndex = window.clickKeyIndex || 0;
    const apiKey = keysArray[window.clickKeyIndex % keysArray.length];
    window.clickKeyIndex++;
    return apiKey;
};

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
        const tgb = document.getElementById('toggleGrammarBtn'); if(tgb) tgb.classList.remove('hidden');
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
            const prompt = `Nhiệm vụ của bạn là phân tích cấu trúc và các điểm ngữ pháp tiếng Anh nổi bật trong đoạn văn bản sau.
Hãy liệt kê và giải thích rõ ràng các điểm ngữ pháp quan trọng được người viết sử dụng. Ví dụ: tại sao lại dùng V-ing sau từ 'when', các thì (tenses) đang dùng mang ý nghĩa gì, mệnh đề quan hệ, cấu trúc câu bị động, câu điều kiện, v.v. Không phải là tìm lỗi sai, mà là giải thích ngữ pháp của câu để người đọc hiểu được cấu trúc.
TRẢ VỀ KẾT QUẢ DƯỚI DẠNG MÃ HTML (chỉ dùng thẻ <div>, <h3>, <p>, <ul>, <li>, <strong>, <em>, <span class="text-brand-600 font-bold"> cho cấu trúc nổi bật, <span class="text-indigo-600 font-bold"> cho ví dụ, v.v.). KHÔNG TRẢ VỀ DẤU CODE BLOCK MẶC ĐỊNH (không dùng \`\`\`html). Trả về trực tiếp HTML đẹp mắt và dễ đọc.
Đoạn văn bản:
${rawText}`;
            
            const selectedModel = document.getElementById('aiModelSelect') ? document.getElementById('aiModelSelect').value : "gemini-2.5-flash";
            const isGroq = !selectedModel.includes('gemini');
            const url = isGroq 
                ? 'https://api.groq.com/openai/v1/chat/completions' 
                : `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`;
            
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
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
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

            htmlResult = htmlResult.replace(/^\`\`\`html\n/, '').replace(/^\`\`\`\n/, '').replace(/\`\`\`$/, '');

            grammarContent.innerHTML = htmlResult;
            grammarContent.setAttribute('data-raw', rawText);
        } catch (error) {
            console.error(error);
            grammarContent.innerHTML = `<div class="text-rose-500 font-bold p-4 text-center">Lỗi: ${error.message}</div>`;
            grammarContent.removeAttribute('data-raw');
        }
    }
};

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
        const tgb = document.getElementById('toggleGrammarBtn'); if(tgb) tgb.classList.add('hidden');
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
            const prompt = `Nhiệm vụ của bạn là phân tích đoạn văn bản tiếng Anh sau và chia nó thành các câu hoàn chỉnh riêng biệt.
Đối với mỗi câu, hãy cung cấp bản dịch tiếng Việt tự nhiên, sát nghĩa và phù hợp ngữ cảnh.
TRẢ VỀ ĐÚNG MỘT MẢNG JSON, mỗi phần tử có định dạng:
{
  "en": "câu tiếng Anh nguyên gốc",
  "vi": "dịch nghĩa tiếng Việt"
}
Không trả về bất kỳ text nào khác ngoài chuỗi JSON.
Đoạn văn bản:
${rawText}`;
            const selectedModel = document.getElementById('aiModelSelect').value || "gemini-2.5-flash";
            const isGroq = !selectedModel.includes('gemini');
            const url = isGroq 
                ? 'https://api.groq.com/openai/v1/chat/completions' 
                : `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`;
            let payload, response, data, jsonStr;
            if (isGroq) {
                payload = {
                    model: selectedModel,
                    messages: [{ role: "user", content: prompt }],
                    temperature: 0.2,
                      max_tokens: 5000,
                      response_format: { type: "json_object" }
                  };
                response = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
                    body: JSON.stringify(payload)
                });
                if (!response.ok) { let err = await response.text(); throw new Error(err || "Lỗi kết nối Groq API"); }
                data = await response.json();
                jsonStr = data.choices[0].message.content;
            } else {
                payload = {
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.2,
                        responseMimeType: "application/json"
                    }
                };
                response = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
                if (!response.ok) { let err = await response.text(); throw new Error(err || "Lỗi kết nối Gemini API"); }
                data = await response.json();
                jsonStr = data.candidates[0].content.parts[0].text;
            }
            jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            let sentences = JSON.parse(jsonStr);
            renderWritingMode(sentences, rawText);
        } catch (error) {
            console.error(error);
            writingContent.innerHTML = `<div class="text-red-500 p-4 border border-red-300 bg-red-50 rounded-xl"><strong>Lỗi:</strong> ${error.message}. Thử lại sau nhé.</div>`;
            writingContent.removeAttribute('data-raw');
        }
    }
}
window.escapeHTML = function(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
    }[tag] || tag));
};
window.renderWritingMode = function(sentences, rawText) {
    const writingContent = document.getElementById('writingContent');
    writingContent.setAttribute('data-raw', rawText);
    let html = `<div class="mb-4 flex items-center justify-start gap-4 border-b border-slate-200 pb-3">
        <h4 class="text-lg font-bold text-slate-700"><i class="fa-solid fa-pen-nib text-emerald-500 mr-2"></i>Luyện Viết Từng Câu</h4>
        <button onclick="toggleAllPgaWriting(event)" class="text-slate-400 hover:text-brand-400 transition-colors mt-0.5" title="Bật/Tắt chế độ luyện viết (tất cả)">
            <i class="fa-solid fa-eye text-xl" id="pgaEyeIconAll"></i>
        </button>
    </div>`;
    sentences.forEach((item, idx) => {
        html += `
        <div class="mb-6 p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div class="flex items-start gap-3 mb-2">
                <button onclick="togglePgaGrammarWriting(${idx})" class="mt-0.5 text-slate-400 hover:text-brand-400 transition-colors shrink-0" title="Luyện viết câu này">
                    <i class="fa-solid fa-eye" id="pgaEyeIcon_${idx}"></i>
                </button>
                <div class="flex-1">
                    <p id="pgaEnSentence_${idx}" class="text-indigo-600 font-medium text-lg leading-relaxed">${escapeHTML(item.en)}</p>
                    <p class="text-slate-500 mt-1"><i class="fa-solid fa-language mr-1 opacity-50"></i> ${escapeHTML(item.vi)}</p>
                </div>
            </div>
            <div id="pgaWriteContainer_${idx}" data-vi="${escapeHTML(item.vi)}" class="hidden mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl w-full">
                <div class="relative">
                    <textarea id="pgaWriteInput_${idx}" class="w-full bg-white text-slate-800 p-3 pr-12 rounded-lg border border-slate-300 focus:border-brand-500 outline-none shadow-inner text-sm leading-relaxed placeholder-slate-500 resize-y" rows="2" placeholder="Dịch câu trên sang tiếng Anh..."></textarea>
                    <button id="pgaDictateBtn_${idx}" onclick="startPgaDictation(${idx})" class="absolute right-3 bottom-3 text-slate-400 hover:text-brand-400 transition-colors" title="Đọc bằng giọng nói">
                        <i class="fa-solid fa-microphone"></i>
                    </button>
                </div>
                <div class="flex justify-between items-center mt-3">
                    <span class="text-xs text-slate-500 italic"><i class="fa-solid fa-circle-info mr-1"></i>Đúng ngữ pháp, đúng ý là được.</span>
                    <button onclick="submitPgaGrammarWriting(${idx})" class="bg-brand-600 hover:bg-brand-500 text-white text-xs px-4 py-2 rounded-lg font-bold transition-all shadow-md flex items-center gap-1 active:scale-95" id="pgaWriteSubmitBtn_${idx}">
                        Gửi đánh giá <i class="fa-solid fa-paper-plane"></i>
                    </button>
                </div>
                <div id="pgaWriteFeedback_${idx}" class="hidden mt-4 p-4 text-sm rounded-lg bg-white border border-slate-200 leading-relaxed text-slate-800 shadow-sm"></div>
            </div>
        </div>
        `;
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
        const eyeIcon = document.getElementById(`pgaEyeIcon_${idx}`);
        const enSentence = document.getElementById(`pgaEnSentence_${idx}`);
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
    const enSentence = document.getElementById(`pgaEnSentence_${idx}`);
    const container = document.getElementById(`pgaWriteContainer_${idx}`);
    const icon = document.getElementById(`pgaEyeIcon_${idx}`);
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
    const input = document.getElementById(`pgaWriteInput_${idx}`);
    const btn = document.getElementById(`pgaDictateBtn_${idx}`);
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
    const inputEl = document.getElementById(`pgaWriteInput_${idx}`);
    const submitBtn = document.getElementById(`pgaWriteSubmitBtn_${idx}`);
    const feedbackEl = document.getElementById(`pgaWriteFeedback_${idx}`);
    const containerEl = document.getElementById(`pgaWriteContainer_${idx}`);
    const viTranslation = containerEl.getAttribute('data-vi');
    const originalEnSentence = document.getElementById('pgaEnSentence_' + idx).innerText;
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
    feedbackEl.innerHTML = '<div class="flex items-center text-slate-600"><i class="fa-solid fa-circle-notch fa-spin text-brand-500 mr-2"></i> AI đang phân tích ngữ pháp...</div>';
    const systemPrompt = `Đóng vai một giáo viên tiếng Anh chấm bài.
Học sinh cần viết lại một câu tiếng Anh dựa trên ý nghĩa tiếng Việt.
Nhiệm vụ của bạn là đánh giá, giải thích lỗi sai (nếu có), và sửa lại câu.
LƯU Ý CỰC KỲ QUAN TRỌNG:
- KHÔNG ĐƯỢC trừ điểm hoặc bắt lỗi từ vựng/văn phong nếu câu của học sinh đã đúng ngữ pháp và diễn đạt được ý cơ bản. 
- Ví dụ: học sinh dùng "want to" thay vì "would love to", "play golf" thay vì "take up golf" thì VẪN PHẢI TÍNH LÀ ĐÚNG. Đừng ép học sinh dùng từ hay hơn nếu từ của họ không sai.
- CHỈ BẮT LỖI khi sai ngữ pháp thật sự (sai thì, thiếu to be, sai trật tự từ) hoặc sai hoàn toàn về nghĩa.
BẠN PHẢI TRẢ VỀ ĐÚNG CẤU TRÚC HTML SAU (tuyệt đối không dùng markdown block khối code html):
<div class="mb-3">
    <div class="text-xs text-slate-600 mb-1 uppercase tracking-wide font-bold"><i class="fa-solid fa-user-pen mr-1"></i>Câu của bạn:</div>
    <div class="p-3 bg-slate-100 border border-slate-200 rounded-lg text-lg ai-user-text">
        <!-- In lại câu của học sinh. Chữ nào đúng thì bọc trong <span class="text-emerald-600 font-semibold">, chữ nào sai thì bọc trong <span class="text-rose-600 line-through font-semibold">, chữ nào sửa/thêm vào thì bọc trong <span class="text-amber-600 font-bold"> -->
    </div>
</div>
<div class="mb-3 text-slate-700 leading-relaxed">
    <div class="text-xs text-slate-600 mb-1 uppercase tracking-wide font-bold"><i class="fa-solid fa-microscope mr-1"></i>Nhận xét chi tiết:</div>
    <ul class="list-disc pl-5 space-y-2">
        <!-- Với mỗi lỗi sai, tạo 1 thẻ <li>. Giảng giải ngắn gọn tại sao sai cấu trúc đó. Tuyệt đối không bắt bẻ văn phong. -->
        <!-- Nếu câu hoàn toàn đúng ngữ pháp cơ bản, ghi <li><span class="text-emerald-600 font-bold">Tuyệt vời!</span> Câu của bạn hoàn toàn chính xác.</li> -->
    </ul>
</div>
<div class="mb-3">
    <div class="text-xs text-slate-600 mb-1 uppercase tracking-wide font-bold"><i class="fa-solid fa-wand-magic-sparkles mr-1"></i>Câu đã sửa (Theo văn phong của bạn):</div>
    <div class="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 font-medium ai-corrected-text">
        <!-- Sửa lại câu cho đúng DỰA TRÊN TỪ VỰNG MÀ HỌC SINH ĐÃ DÙNG (giữ nguyên các từ vựng đúng ngữ pháp của học sinh, không thay bằng từ của câu gốc) -->
    </div>
</div>
<div class="mb-1">
    <div class="text-xs text-slate-600 mb-1 uppercase tracking-wide font-bold"><i class="fa-solid fa-book-open mr-1"></i>Câu mẫu gốc (Original):</div>
    <div class="p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-800 italic ai-original-text">
        <!-- In lại Câu mẫu gốc (Original sentence) -->
    </div>
</div>
  <div class="mt-3 text-slate-700 leading-relaxed">
      <div class="text-xs text-slate-600 mb-1 uppercase tracking-wide font-bold"><i class="fa-solid fa-lightbulb mr-1"></i>Mở rộng từ vựng & Cấu trúc hay:</div>
      <div class="p-4 bg-white border border-slate-200 rounded-lg text-slate-800 text-sm shadow-sm ai-vocab-expansion">
          <!-- BẮT BUỘC BẠN PHẢI TRẢ VỀ ĐÚNG 2 PHẦN BẰNG ĐỊNH DẠNG HTML BÊN DƯỚI BÊN TRONG THẺ NÀY:
          <div class="mb-2 font-bold text-indigo-700"><i class="fa-solid fa-layer-group mr-1"></i>1. Cấu trúc câu gốc:</div>
          <ul class="list-disc pl-5 mb-4 space-y-1">
              <li><span class="font-bold text-brand-600">In response to something</span>: để phản hồi lại cái gì, nhằm hồi đáp cho cái gì (ví dụ)</li>
              <!-- Trích xuất, liệt kê và giải thích bằng tiếng Việt các cụm từ (phrasal verbs, idioms, collocations), cấu trúc ngữ pháp hay từ CÂU MẪU GỐC. -->
          </ul>
          <div class="mb-2 font-bold text-indigo-700"><i class="fa-solid fa-not-equal mr-1"></i>2. So sánh từ vựng:</div>
          <ul class="list-disc pl-5 space-y-1">
              <li><span class="font-bold text-brand-600">từ của học sinh</span> vs <span class="font-bold text-brand-600">từ của câu gốc</span>: Giải thích sự khác biệt...</li>
              <!-- So sánh sự khác biệt sắc thái và ngữ cảnh giữa từ vựng học sinh dùng và từ vựng câu gốc (nếu có). -->
          </ul>
          -->
      </div>
  </div>`;
    const userPrompt = `Câu tiếng Việt gốc cần truyền đạt: "${viTranslation}"
Câu học sinh viết: "${userSentence}"
Câu mẫu gốc (để tham khảo): "${originalEnSentence}"
Hãy chấm điểm và nhận xét chi tiết.`;
    try {
        const selectedModel = document.getElementById('aiModelSelect').value || "gemini-2.5-flash";
            const isGroq = !selectedModel.includes('gemini');
            const url = isGroq 
                ? 'https://api.groq.com/openai/v1/chat/completions' 
                : `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`;
        let payload, response, data, feedbackHtml;
        if (isGroq) {
            payload = {
                model: selectedModel,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
                temperature: 0.2,
                  max_tokens: 5000
              };
            response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
                body: JSON.stringify(payload)
            });
            if (!response.ok) { let err = await response.text(); throw new Error(err || "Lỗi Groq API"); }
            data = await response.json();
            feedbackHtml = data.choices[0].message.content;
        } else {
            payload = {
                contents: [{ parts: [{ text: userPrompt }] }],
                systemInstruction: { parts: [{ text: systemPrompt }] },
                generationConfig: { temperature: 0.2 }
            };
            response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) { let err = await response.text(); throw new Error(err || "Lỗi Gemini API"); }
            data = await response.json();
            feedbackHtml = data.candidates[0].content.parts[0].text;
        }
        // Remove markdown code blocks if AI still adds them
        feedbackHtml = feedbackHtml.replace(/khối code HTML\n?/g, '').replace(/```/g, '');
        feedbackEl.innerHTML = `<div class="border-l-4 border-brand-500 pl-3 py-1">${feedbackHtml}</div>`;
        // Bắt đầu xử lý cho phép click từ vựng
        setTimeout(() => {
            const targetNodes = feedbackEl.querySelectorAll('.ai-corrected-text, .ai-original-text, .ai-user-text, .ai-vocab-expansion span.text-brand-600');
            // If they don't have the classes for some reason, fallback to query by bg colors
            const allTargets = targetNodes.length > 0 ? targetNodes : feedbackEl.querySelectorAll('div.bg-emerald-50, div.bg-indigo-50, div.bg-slate-800\\/80, div.bg-slate-100');
            allTargets.forEach(node => {
                const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null, false);
                const textNodes = [];
                let n;
                while(n = walker.nextNode()) textNodes.push(n);
                textNodes.forEach(textNode => {
                    const text = textNode.nodeValue;
                    if (!text.trim() || !/[a-zA-Z]/.test(text)) return; // Bỏ qua nếu chỉ là dấu cách hoặc không có tiếng Anh
                    const tokens = text.match(/[\w'-]+|[^\w\s]+|\s+/g) || [];
                    const fragment = document.createDocumentFragment();
                    tokens.forEach(token => {
                        if (/[a-zA-Z]/.test(token)) {
                            const span = document.createElement('span');
                            span.className = "cursor-pointer hover:bg-emerald-200 hover:text-emerald-800 rounded px-[2px] transition-colors duration-200";
                            span.innerText = token;
                            span.onclick = (e) => {
                                e.stopPropagation();
                                if(typeof speakText === 'function') speakText(token);
                            };
                            span.oncontextmenu = (e) => {
                                if(typeof handleDictRightClick === 'function') handleDictRightClick(e, token, span);
                            };
                            fragment.appendChild(span);
                        } else {
                            fragment.appendChild(document.createTextNode(token));
                        }
                    });
                    textNode.parentNode.replaceChild(fragment, textNode);
                });
            });
        }, 100);
    } catch (err) {
        feedbackEl.innerHTML = `<div class="text-red-400"><i class="fa-solid fa-triangle-exclamation mr-1"></i> Lỗi: ${err.message}</div>`;
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Gửi đánh giá <i class="fa-solid fa-paper-plane ml-1"></i>';
        submitBtn.classList.remove('opacity-70');
    }
};
