
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
window.getGrammarPrompt = function(rawText) {
    return `Nhiệm vụ của bạn là đóng vai trò "CHUYÊN GIA NGỮ PHÁP TIẾNG ANH" để phân tích CỰC KỲ CHI TIẾT và CHUYÊN SÂU đoạn văn bản sau. Không bắt lỗi sai, mà chỉ phân tích mổ xẻ tận gốc rễ các điểm ngữ pháp và từ vựng hay.

TIÊU CHÍ CHỌN CẤU TRÚC NGỮ PHÁP ĐỂ PHÂN TÍCH: Hãy ưu tiên chọn những cấu trúc ngữ pháp "xương sống" và học thuật. BẠN PHẢI TÌM VÀ PHÂN TÍCH CÁC CẤU TRÚC SAU (nếu có trong bài):
1. Mệnh đề quan hệ (Relative Clauses) và Mệnh đề quan hệ rút gọn (Reduced Relative Clauses).
2. Rút gọn mệnh đề trạng ngữ (Reduced Adverbial Clauses - vd: When V-ing, While V-ing).
3. TẤT CẢ CÁC THÌ (Tenses) xuất hiện trong bài (Hiện tại đơn, Quá khứ đơn, Tương lai, Tiếp diễn, Hoàn thành...). Phân tích tại sao tác giả lại chọn dùng thì đó ở câu này mà không phải thì khác.
4. Câu điều kiện (Conditionals - Loại 1, 2, 3, Mix) và Cấu trúc giả định (Subjunctive).
5. Cấu trúc so sánh (Comparisons - So sánh hơn, so sánh nhất, so sánh kép).
6. Câu bị động (Passive Voice) đặc biệt là bị động khách quan (It is said that...).
7. Đảo ngữ (Inversion), Câu chẻ (Cleft sentences - It is/was... that...), Cấu trúc nhấn mạnh.
8. MỌI Liên từ (Conjunctions) và Đại từ quan hệ xuất hiện trong bài (Whereas, as though, as if, whether...or, as to whether, when, as, while, since, as soon as, before, after, until, by the time, if, unless, provided/providing, once, in case, because, although, though, even though, even if, so that, in order that, now that, as long as, so long as, as far as, assuming that, given that, seeing that, just as, who, whom, which, that...). BẮT BUỘC PHẢI PHÂN TÍCH CHI TIẾT: Liên từ/Cụm từ này đang làm nhiệm vụ gì? Nó đang nối 2 từ cùng loại hay nối 2 mệnh đề với nhau? Ý nghĩa của sự kết nối này là gì?
9. Các cấu trúc ngữ pháp đặc biệt khác như: Cấu trúc tồn tại "There + be" (There is, There have been...), Phân từ hoàn thành (Having V3/ed), Cấu trúc chủ ngữ giả (It is + adj + to V), Mệnh đề danh ngữ (Noun Clauses, đặc biệt chú ý các mệnh đề bắt đầu bằng "as to whether...", "that...", "what...").
10. Cấu trúc diễn đạt sự lựa chọn / cân nhắc (Alternatives/Choices): BẮT BUỘC PHÂN TÍCH các cấu trúc như "whether it is better to do A or do B", "whether... or...". Phân tích cả cụm dài để thấy được cách tác giả đặt lên bàn cân hai sự lựa chọn (ví dụ: make their own decisions vs seeking advice).
11. Các cụm từ đi kèm giới từ cố định (Prepositional Collocations / Phrasal Verbs): KHÔNG CHỈ liệt kê cấu trúc, mà nếu trong bài có các cụm từ luôn đi kèm giới từ (ví dụ: except for, take care of, regarding, depend on...), BẮT BUỘC phải lôi ra phân tích. ĐẶC BIỆT BẮT BUỘC PHẢI CHỈ RÕ CÔNG THỨC: Sau giới từ/cụm từ đó phải cộng với dạng từ gì (ví dụ: + Noun / Noun Phrase / V-ing). Giải thích rõ ý nghĩa trọn vẹn của cả cụm là gì.
12. Từ vựng và Cụm từ vựng Nâng cao (Advanced Vocabulary - CEFR B2+): BẮT BUỘC phải tìm và lôi ra phân tích các từ vựng, cụm từ vựng, hoặc cách diễn đạt hay mang tính học thuật từ cấp độ B2 trở lên (B2, C1, C2).
LƯU Ý ĐẶC BIỆT: TUYỆT ĐỐI KHÔNG phân tích "Cấu trúc song song" (Parallel Structure / Parallelism) dưới bất kỳ hình thức nào. Bỏ qua hoàn toàn các điểm ngữ pháp liên quan đến việc nối liệt kê bằng "and", "or", "but". Chỉ chọn những cấu trúc đã liệt kê ở trên!

YÊU CẦU QUAN TRỌNG NHẤT: Phần phân tích ngữ pháp phải CỰC KỲ KỸ LƯỠNG. Tuy nhiên, KHÔNG ĐƯỢC VIẾT THÀNH MỘT CỤC VĂN BẢN DÀI THÒNG KHÓ ĐỌC. BẮT BUỘC PHẢI CHIA NHỎ Ý RA THÀNH CÁC BULLET POINTS (<ul><li>) ĐỂ DỄ NHÌN. 
Đặc biệt, trong phần giải thích chi tiết, BẤT CỨ KHI NÀO BẠN TRÍCH DẪN từ vựng, cấu trúc, chữ cái tiếng Anh (ví dụ: "allows", "To seek advice...", "V-ing"), BẮT BUỘC phải bôi đậm và tô màu vàng bằng thẻ <strong class="text-amber-600 bg-amber-50 px-1 rounded whitespace-nowrap">"từ tiếng anh"</strong>. TUYỆT ĐỐI KHÔNG ĐƯỢC ĐỂ BẤT KỲ TỪ TIẾNG ANH NÀO TRONG NGOẶC KÉP MÀ KHÔNG CÓ THẺ MÀU VÀNG NÀY!

TRÌNH BÀY DƯỚI DẠNG HTML (không dùng code block \`\`\`). Hãy tuân thủ NGHIÊM NGẶT cấu trúc 3 phần sau:

<h3 class="font-bold text-xl text-brand-600 mb-3">Phần 1: Đoạn văn bản gốc</h3>
<div class="mb-6 text-lg leading-relaxed bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
  (Viết lại TOÀN BỘ đoạn văn bản gốc. Bôi đậm và tô màu (dùng style="color: [mã màu]") cho các điểm ngữ pháp và từ vựng đáng chú ý. Mỗi điểm dùng một màu khác nhau).
</div>

<h3 class="font-bold text-xl text-brand-600 mb-3 border-b border-slate-200 pb-2">Phần 2: Phân tích Cấu trúc & Ngữ pháp</h3>
<div class="mb-6 text-lg bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
  (Trình bày MỖI điểm ngữ pháp theo ĐÚNG HTML template sau, không được làm khác:)
  <div class="mb-6">
    <strong class="text-slate-800 text-xl">1. [Tên cấu trúc tiếng Việt] ([Tên tiếng Anh]):</strong>
    <div class="my-2 p-3 bg-slate-50 border-l-4 border-brand-400 italic">
      <span class="text-slate-600">Câu gốc: </span><span class="text-blue-600">"[Trích dẫn TOÀN BỘ câu chứa cấu trúc, trong đó phần cấu trúc đang được phân tích BẮT BUỘC phải bọc trong ngoặc kép và tô màu vàng như đã hướng dẫn]"</span>
    </div>
    <span class="font-semibold text-slate-800">Giải thích chi tiết:</span>
    <ul class="list-disc ml-6 mt-2 text-slate-700 space-y-2">
      <li><strong>Cách hoạt động:</strong> [Giải thích ngắn gọn cấu trúc này hoạt động thế nào trong câu].</li>
      <li><strong>Tác dụng/Sắc thái:</strong> [Tạo sự trang trọng, nhấn mạnh, súc tích, hay nối ý...].</li>
      <li><strong>So sánh (nếu có):</strong> [Nếu dùng cách viết thông thường thì câu sẽ như thế nào, tại sao cách viết này hay hơn].</li>
    </ul>
  </div>
  (Lặp lại template cho điểm 2, 3...)
</div>

<h3 class="font-bold text-xl text-brand-600 mb-3 border-b border-slate-200 pb-2">Phần 3: Cụm từ vựng & Cách diễn đạt hay</h3>
<div class="mb-6 text-lg bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
  (Trình bày MỖI cụm từ vựng theo ĐÚNG HTML template sau:)
  <div class="mb-4">
    <strong style="color: [MÀU KHỚP PHẦN 1]; text-xl">[Từ/Cụm từ vựng tiếng Anh]</strong> <span class="text-slate-600 text-base">([Loại từ] - [Cấp độ B2/C1/C2 nếu có])</span>
    <ul class="list-disc ml-6 mt-1 text-slate-700 space-y-1">
      <li><strong>Nghĩa:</strong> [Nghĩa tiếng Việt].</li>
      <li><strong>Cách dùng & Cấu trúc:</strong> [GIẢI THÍCH CẶN KẼ cách dùng của cụm từ này. ĐỐI VỚI CỤM ĐỘNG TỪ/GIỚI TỪ: (1) BẮT BUỘC PHẢI GỘP CHUNG tất cả công thức theo sau vào 1 dấu ngoặc kép duy nhất (ví dụ: "allow for + Noun / Noun Phrase / V-ing"). (2) SAU ĐÓ, BẮT BUỘC PHẢI SO SÁNH với các cấu trúc dễ nhầm lẫn (ví dụ: so sánh với "allow + O + to V") và giải thích chi tiết sự khác biệt ý nghĩa].</li>
    </ul>
  </div>
  (Lặp lại template cho các cụm từ khác)
</div>

Đoạn văn bản:
${rawText}`;
};

window.prefetchGrammarAnalysis = async function(rawText) {
    const grammarContent = document.getElementById('grammarAnalysisContent');
    if (grammarContent.getAttribute('data-raw') === rawText || grammarContent.getAttribute('data-fetching') === rawText) return;
    grammarContent.setAttribute('data-fetching', rawText);
    
    try {
        const apiKey = typeof getApiKey === 'function' ? getApiKey() : null;
        if (!apiKey) return;
        
        const prompt = window.getGrammarPrompt(rawText);
        const selectedModel = document.getElementById('aiModelSelect') ? document.getElementById('aiModelSelect').value : "gemini-2.5-flash";
        const isGroq = !selectedModel.includes('gemini');
        const url = isGroq 
            ? 'https://api.groq.com/openai/v1/chat/completions' 
            : `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`;
            
        let payload, response, data, htmlResult;
        if (isGroq) {
            payload = { model: selectedModel, messages: [{ role: "user", content: prompt }], temperature: 0.2, max_tokens: 8000 };
            response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` }, body: JSON.stringify(payload) });
            if (!response.ok) return;
            data = await response.json();
            htmlResult = data.choices[0].message.content;
        } else {
            payload = { contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.2 } };
            response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
            if (!response.ok) return;
            data = await response.json();
            htmlResult = data.candidates[0].content.parts[0].text;
        }

        htmlResult = htmlResult.replace(/^```html\n/, '').replace(/^```\n/, '').replace(/```$/, '');
        grammarContent.innerHTML = htmlResult;
        grammarContent.setAttribute('data-raw', rawText);
    } catch (error) {
        console.error("Prefetch grammar error:", error);
    } finally {
        grammarContent.removeAttribute('data-fetching');
    }
};
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
                            } else {
        const rawText = textarea.value.trim();
        if (!rawText) return alert("Vui lòng nhập văn bản trước!");
        
        if (typeof isDictMode !== 'undefined' && isDictMode) toggleDictMode();
        if (typeof isWritingMode !== 'undefined' && isWritingMode) toggleWritingMode();

        isGrammarMode = true;
        textarea.classList.add('hidden');
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
            const prompt = window.getGrammarPrompt(rawText);
            
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
                    max_tokens: 8000
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
            } else {
        // Bật chế độ viết
        const rawText = textarea.value.trim();
        if (!rawText) return alert("Vui lòng nhập văn bản trước!");
        // Nếu đang bật chế độ Đọc thì tắt đi
        if (typeof isDictMode !== 'undefined' && isDictMode) {
            toggleDictMode();
        }
        if (typeof isGrammarMode !== 'undefined' && isGrammarMode) {
            toggleGrammarMode();
        }
        isWritingMode = true;
        textarea.classList.add('hidden');
                        writingContent.classList.remove('hidden');
        btnText.innerText = 'Tắt chế độ Viết';
        // Kiểm tra xem đã render chưa (dựa vào text gốc, nếu đổi text thì render lại)
        if (writingContent.getAttribute('data-raw') === rawText) {
            return; // Đã render rồi
        }
        
        // Gọi lệnh phân tích ngữ pháp chìm ở background để chuẩn bị dữ liệu
        window.prefetchGrammarAnalysis(rawText);
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
                      max_tokens: 8000,
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
    
    // Header with Toggle
    let html = `<div class="sticky top-0 z-50 bg-white/95 backdrop-blur flex items-center justify-between border-b border-slate-200 pt-4 pb-3 mb-4 -mt-4">`
        <div class="flex items-center gap-4">
            <h4 class="text-lg font-bold text-slate-700"><i class="fa-solid fa-pen-nib text-emerald-500 mr-2"></i>Luyện Viết</h4>
            <div class="bg-slate-100 p-1 rounded-lg inline-flex items-center">
                <button id="btnSentenceMode" onclick="toggleWritingModeType('sentence')" class="px-4 py-1.5 rounded-md text-sm font-semibold transition-all bg-white shadow-sm text-brand-600">Từng Câu</button>
                <button id="btnParagraphMode" onclick="toggleWritingModeType('paragraph')" class="px-4 py-1.5 rounded-md text-sm font-semibold transition-all text-slate-500 hover:text-slate-700">Nguyên Đoạn</button>
            </div>
        </div>
        <button id="btnToggleAllSentence" onclick="toggleAllPgaWriting(event)" class="text-slate-400 hover:text-brand-400 transition-colors mt-0.5" title="Bật/Tắt chế độ luyện viết (tất cả)">
            <i class="fa-solid fa-eye text-xl" id="pgaEyeIconAll"></i>
        </button>
    </div>`;

    // --- SENTENCE MODE CONTAINER ---
    html += `<div id="sentenceWritingContainer" class="block">`;
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
    html += `</div>`;

    // --- PARAGRAPH MODE CONTAINER ---
    window.pgaSentencesData = sentences; // Save for evaluation
    
    let viParagraphHtml = "";
    let currentIndexInRaw = 0;
    sentences.forEach((s, idx) => {
        viParagraphHtml += `<span id="viParaSentence_${idx}" class="transition-colors duration-300 p-0.5 rounded cursor-pointer hover:bg-amber-50" onclick="window.selectParaSentence(${idx})">${escapeHTML(s.vi)}</span>`;
        
        if (idx < sentences.length - 1) {
            let getSearchStr = (text) => text.replace(/[^a-zA-Z0-9 ]/g, '').trim().substring(0, 30).toLowerCase();
            let search1 = getSearchStr(s.en);
            let search2 = getSearchStr(sentences[idx+1].en);
            
            let pos1 = -1;
            if (search1.length > 2) pos1 = rawText.toLowerCase().indexOf(search1, currentIndexInRaw);
            
            let pos2 = -1;
            if (search2.length > 2) {
                if (pos1 !== -1) {
                    let startSearch2 = pos1 + Math.floor(s.en.length * 0.4);
                    pos2 = rawText.toLowerCase().indexOf(search2, startSearch2);
                } else {
                    pos2 = rawText.toLowerCase().indexOf(search2, currentIndexInRaw);
                }
            }
            
            if (pos1 !== -1 && pos2 !== -1 && pos2 >= pos1) {
                let between = rawText.substring(pos1, pos2);
                let newlines = between.match(/\n/g);
                if (newlines) {
                    viParagraphHtml += '<br>'.repeat(newlines.length);
                } else {
                    viParagraphHtml += ' ';
                }
                currentIndexInRaw = pos2;
            } else {
                viParagraphHtml += ' ';
            }
        }
    });
    
    html += `<div id="paragraphWritingContainer" class="hidden">
        <div class="mb-4 p-4 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-700 leading-relaxed text-lg">
            ${viParagraphHtml}
        </div>
        <div class="relative mb-4">
            <textarea id="pgaParaWriteInput" oninput="trackParagraphProgress(this)" class="w-full bg-white text-slate-800 p-4 rounded-xl border border-slate-300 focus:border-brand-500 outline-none shadow-inner text-base leading-relaxed placeholder-slate-500 resize-y" rows="8" placeholder="Dịch toàn bộ đoạn văn sang tiếng Anh..."></textarea>
        </div>
        <div class="flex justify-between items-center">
            <span class="text-sm text-slate-500 italic"><i class="fa-solid fa-circle-info mr-1"></i>Dịch thoáng, đúng ngữ pháp và ý chính. Đoạn gốc tiếng Anh sẽ được dùng để chấm điểm.</span>
            <button onclick="submitParagraphWriting()" class="bg-brand-600 hover:bg-brand-500 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md flex items-center gap-2 active:scale-95" id="pgaParaWriteSubmitBtn">
                Gửi đánh giá toàn bài <i class="fa-solid fa-paper-plane"></i>
            </button>
        </div>
        <div id="pgaParaWriteFeedback" class="hidden mt-6 p-5 text-base rounded-xl bg-white border border-slate-200 leading-relaxed text-slate-800 shadow-sm"></div>
    </div>`;

    writingContent.innerHTML = html;
    
    // Auto highlight first sentence
    setTimeout(() => {
        const firstSentence = document.getElementById('viParaSentence_0');
        if (firstSentence) firstSentence.classList.add('bg-amber-100', 'font-semibold', 'text-amber-900');
    }, 100);
}

window.toggleWritingModeType = function(mode) {
    const btnSentence = document.getElementById('btnSentenceMode');
    const btnPara = document.getElementById('btnParagraphMode');
    const containerSentence = document.getElementById('sentenceWritingContainer');
    const containerPara = document.getElementById('paragraphWritingContainer');
    const btnToggleAll = document.getElementById('btnToggleAllSentence');

    if (mode === 'sentence') {
        btnSentence.className = "px-4 py-1.5 rounded-md text-sm font-semibold transition-all bg-white shadow-sm text-brand-600";
        btnPara.className = "px-4 py-1.5 rounded-md text-sm font-semibold transition-all text-slate-500 hover:text-slate-700";
        containerSentence.classList.remove('hidden');
        containerPara.classList.add('hidden');
        btnToggleAll.classList.remove('hidden');
    } else {
        btnPara.className = "px-4 py-1.5 rounded-md text-sm font-semibold transition-all bg-white shadow-sm text-brand-600";
        btnSentence.className = "px-4 py-1.5 rounded-md text-sm font-semibold transition-all text-slate-500 hover:text-slate-700";
        containerPara.classList.remove('hidden');
        containerSentence.classList.add('hidden');
        btnToggleAll.classList.add('hidden');
    }
};

window.manualParaIdx = -1;

window.selectParaSentence = function(idx) {
    window.manualParaIdx = idx;
    const textarea = document.getElementById('pgaParaWriteInput');
    if (textarea) window.trackParagraphProgress(textarea);
};

window.trackParagraphProgress = function(textarea) {
    const text = textarea.value;
    const sentences = window.pgaSentencesData;
    if (!sentences || sentences.length === 0) return;

    let currentIdx = 0;
    
    if (window.manualParaIdx !== -1) {
        currentIdx = window.manualParaIdx;
    } else {
        let textRemaining = text;
        for (let i = 0; i < sentences.length; i++) {
            let enText = sentences[i].en.trim();
            let lastChar = enText.slice(-1);
            let isShort = enText.length < 50;
            
            let regex;
            if (lastChar === ',' && isShort) {
                regex = /,[ \n]/;
            } else if (lastChar === ':' && isShort) {
                regex = /:[ \n]/;
            } else if (lastChar === ';' && isShort) {
                regex = /;[ \n]/;
            } else {
                regex = /[.?!](\s|\n|$)|(\n\n)/;
            }
            
            let match = textRemaining.match(regex);
            if (match) {
                currentIdx++;
                textRemaining = textRemaining.slice(match.index + match[0].length);
            } else {
                break;
            }
        }
    }
    
    if (currentIdx >= sentences.length) currentIdx = sentences.length - 1;

    for (let i = 0; i < sentences.length; i++) {
        const el = document.getElementById('viParaSentence_' + i);
        if (el) {
            if (i === currentIdx) {
                el.classList.add('bg-amber-200', 'font-bold', 'text-amber-900', 'shadow-sm');
                el.classList.remove('bg-amber-100', 'font-semibold');
            } else {
                el.classList.remove('bg-amber-200', 'font-bold', 'text-amber-900', 'shadow-sm', 'bg-amber-100', 'font-semibold');
            }
        }
    }
};

window.submitParagraphWriting = async function() {
    const textarea = document.getElementById('pgaParaWriteInput');
    const feedbackEl = document.getElementById('pgaParaWriteFeedback');
    const submitBtn = document.getElementById('pgaParaWriteSubmitBtn');
    
    const userText = textarea.value.trim();
    if (!userText) {
        alert('Vui lòng viết đoạn văn của bạn trước khi gửi.');
        return;
    }
    
    const apiKey = typeof getApiKey === 'function' ? getApiKey() : null;
    if (!apiKey) {
        alert("Vui lòng nhập API Key ở góc trên bên phải.");
        return;
    }

    if (!window.pgaSentencesData || window.pgaSentencesData.length === 0) return;
    
    const fullOriginalEn = window.pgaSentencesData.map(s => s.en).join(' ');
    const fullOriginalVi = window.pgaSentencesData.map(s => s.vi).join(' ');

    feedbackEl.classList.remove('hidden');
    feedbackEl.innerHTML = '<div class="flex items-center gap-3 text-brand-600 font-medium"><i class="fa-solid fa-spinner fa-spin"></i> AI đang phân tích và chấm điểm đoạn văn của bạn...</div>';
    submitBtn.disabled = true;
    submitBtn.classList.add('opacity-70', 'cursor-not-allowed');

    const systemPrompt = `Bạn là một giáo viên dạy viết tiếng Anh IELTS/TOEIC khó tính nhưng tận tâm. Nhiệm vụ của bạn là nhận xét đoạn văn tiếng Anh mà học sinh vừa viết (được dịch từ một đoạn tiếng Việt).
Yêu cầu phân tích và Trình bày (BẮT BUỘC TUÂN THỦ ĐÚNG CẤU TRÚC SAU BẰNG HTML & Tailwind CSS, KHÔNG DÙNG MARKDOWN BLOCK):

<div class="mb-8">
  <h2 class="text-xl font-bold text-slate-800 mb-4 border-b pb-2">PHẦN 1: SỬA LỖI CƠ BẢN (So sánh với bản gốc)</h2>
  
  <h3 class="font-semibold text-slate-700 mb-2">1. Bài viết của bạn:</h3>
  <div class="bg-slate-50 border border-slate-200 p-4 rounded-lg mb-4 leading-relaxed text-slate-700">
    <!-- Trích dẫn lại nguyên văn bài của học sinh. Dùng thẻ <mark class="bg-red-200 text-red-900 px-1 rounded font-semibold">...</mark> cho lỗi nặng, bg-amber-200 cho lỗi nhẹ. BẮT BUỘC gắn thêm thẻ <sup class="text-xs ml-0.5">số thứ tự</sup> bên trong thẻ mark. -->
  </div>

  <h3 class="font-semibold text-slate-700 mb-2">2. Bản gốc (Mẫu chuẩn):</h3>
  <div class="bg-slate-50 border border-slate-200 p-4 rounded-lg mb-4 leading-relaxed text-slate-700">
    <!-- Trích dẫn lại bản gốc. TÔ MÀU VÀ ĐÁNH SỐ TƯƠNG ỨNG với các lỗi của học sinh ở mục 1 để đối chiếu (cùng thẻ mark màu đó, cùng số thứ tự). -->
  </div>

  <h3 class="font-semibold text-slate-700 mb-2">3. Phân tích lỗi chi tiết:</h3>
  <ul class="space-y-3">
    <!-- Giải thích lỗi dựa trên phần 1 và 2. KHÔNG DÙNG NGOẶC KÉP để trích dẫn từ vựng. Mọi từ/cụm từ tiếng Anh được nhắc đến BẮT BUỘC phải đặt trong thẻ <mark> có màu và số thứ tự tương ứng y như trên. -->
  </ul>
</div>

<div class="mb-4">
  <h2 class="text-xl font-bold text-emerald-800 mb-4 border-b border-emerald-200 pb-2">PHẦN 2: NÂNG CẤP CẤU TRÚC & TỪ VỰNG C1/C2 (Band 9.0 IELTS)</h2>
  
  <h3 class="font-semibold text-slate-700 mb-2">4. Bài viết của bạn (Phân tích điểm yếu):</h3>
  <div class="bg-slate-50 border border-slate-200 p-4 rounded-lg mb-4 leading-relaxed text-slate-700">
    <!-- Trích dẫn lại bài của học sinh. Ở mục này, HÃY TÔ MÀU XÁM VÀ ĐÁNH SỐ BẰNG THẺ <mark class="bg-slate-200 text-slate-800 px-1 rounded font-semibold"> NHỮNG TỪ/CỤM TỪ BÌNH DÂN (chưa được Band 9.0) mà bạn dự định sẽ nâng cấp. Ví dụ: <mark class="bg-slate-200 text-slate-800 px-1 rounded font-semibold">I hope<sup class="text-xs ml-0.5">1</sup></mark>. TẤT CẢ các điểm đánh dấu ở mục này phải được tô màu xám và đánh số từ 1 trở đi. -->
  </div>

  <h3 class="font-semibold text-emerald-700 mb-2">5. Phiên bản nâng cấp (Band 9.0 - Từ vựng C1/C2):</h3>
  <div class="bg-emerald-50 border border-emerald-200 p-4 rounded-lg mb-4 leading-relaxed text-emerald-900">
    <!-- Đưa ra bản Band 9.0. BẮT BUỘC sử dụng từ vựng trình độ C1/C2 và NÂNG CẤP CẤU TRÚC CÂU (đảo ngữ, câu phức, mệnh đề rút gọn...). TÔ MÀU XANH (<mark class="bg-emerald-200 text-emerald-900 px-1 rounded font-semibold">) VÀ ĐÁNH SỐ TƯƠNG ỨNG KHỚP VỚI MỤC 4. Ví dụ: <mark class="bg-emerald-200 text-emerald-900 px-1 rounded font-semibold">Trust<sup class="text-xs ml-0.5">1</sup></mark>. (Số 1 màu xanh tương ứng với số 1 màu xám ở mục 4 để khoe cấu trúc xịn). -->
  </div>

  <h3 class="font-semibold text-emerald-700 mb-2">6. Giải thích cấu trúc nâng cấp:</h3>
  <ul class="space-y-3">
    <!-- Giải thích chi tiết các từ vựng C1/C2 và cấu trúc ngữ pháp nâng cao vừa được sử dụng ở mục 5. KHÔNG DÙNG NGOẶC KÉP để trích dẫn từ vựng. Mọi từ/cụm từ tiếng Anh được nhắc đến BẮT BUỘC phải đặt trong thẻ <mark> có màu và số thứ tự tương ứng y như trên. -->
  </ul>
</div>`;

    const userPrompt = `Đoạn tiếng Việt gốc: "${fullOriginalVi}"
Đoạn tiếng Anh gốc (mẫu chuẩn): "${fullOriginalEn}"
Đoạn tiếng Anh học sinh viết: "${userText}"

Hãy chấm điểm và nhận xét chi tiết.`;

    try {
        const aiModelSelect = document.getElementById('aiModelSelect');
        const selectedModel = aiModelSelect ? aiModelSelect.value : "gemini-2.5-flash";
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
        
        feedbackHtml = feedbackHtml.replace(/\`\`\`html\n?/g, '').replace(/\`\`\`/g, '');
        feedbackEl.innerHTML = feedbackHtml;
    } catch (error) {
        feedbackEl.innerHTML = `<div class="text-rose-600 font-bold"><i class="fa-solid fa-triangle-exclamation mr-2"></i>Lỗi: ${error.message}</div>`;
    } finally {
        submitBtn.disabled = false;
        submitBtn.classList.remove('opacity-70', 'cursor-not-allowed');
    }
};
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
    const grammarContent = document.getElementById('grammarAnalysisContent');
    let grammarContext = '';
    if (grammarContent && grammarContent.innerText.trim()) {
        grammarContext = `\n\n--- BẢNG PHÂN TÍCH NGỮ PHÁP CỦA BÀI ---\n(Sử dụng bảng này để nhặt ra các Cấu trúc hay / Từ vựng đắt giá LIÊN QUAN ĐẾN CÂU MẪU GỐC TRÊN để điền vào phần mở rộng nhé):\n${grammarContent.innerText}`;
    }

    const userPrompt = `Câu tiếng Việt gốc cần truyền đạt: "${viTranslation}"
Câu học sinh viết: "${userSentence}"
Câu mẫu gốc (để tham khảo): "${originalEnSentence}"${grammarContext}

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
                  max_tokens: 8000
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
