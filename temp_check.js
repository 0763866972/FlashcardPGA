

        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        brand: { 50: '#f0f9ff', 100: '#e0f2fe', 200: '#bae6fd', 300: '#7dd3fc', 400: '#38bdf8', 500: '#0ea5e9', 600: '#0284c7', 700: '#0369a1' }
                    }
                }
            }
        }
    

        let keyCount = 1;
        let apiKeys = [];
        function getStorageKeyForModel() {
            const val = document.getElementById('aiModelSelect').value;
            if (val.includes('gpt-oss') || val.includes('llama') || val.includes('mixtral')) return 'toeic_ai_apikey_groq';
            return 'toeic_ai_apikey'; // Gemini
        }
        // Initialize API Key and Model from localStorage
        document.addEventListener("DOMContentLoaded", () => {
            const savedModel = localStorage.getItem('toeic_ai_model');
            if (savedModel) {
                const select = document.getElementById('aiModelSelect');
                for (let i = 0; i < select.options.length; i++) {
                    if (select.options[i].value === savedModel) {
                        select.selectedIndex = i;
                        break;
                    }
                }
            }
            // Tải lại đoạn văn bản đã lưu
            const savedText = localStorage.getItem('pga_paragraph_input');
            const pInput = document.getElementById('textInput');
            if (savedText && pInput) {
                pInput.value = savedText;
            }
            if (pInput) {
                pInput.addEventListener('input', function() {
                    localStorage.setItem('pga_paragraph_input', this.value);
                });
            }
            window.aiDict = {};
            loadApiKeyForCurrentModel();
        });
        function loadApiKeyForCurrentModel() {
            const storageKey = getStorageKeyForModel();
            const savedKey = localStorage.getItem(storageKey);
            const linkEl = document.getElementById('getKeyLink');
            if (linkEl) {
                if (storageKey === 'toeic_ai_apikey_groq') {
                    linkEl.href = 'https://console.groq.com/keys';
                } else {
                    linkEl.href = 'https://aistudio.google.com/app/apikey';
                }
            }
            if (savedKey) {
                apiKeys = savedKey.split(',').filter(k => k.trim());
                keyCount = apiKeys.length || 1;
            } else {
                apiKeys = [];
                keyCount = 1;
            }
            document.getElementById('keyCountInput').value = keyCount;
            renderKeyInputs();
            updateKeyBadge();
        }
        function toggleKeyConfig() {
            document.getElementById('keyConfigSection').classList.toggle('hidden');
        }
        function changeKeyCount(delta) {
            let newVal = keyCount + delta;
            if (newVal >= 1 && newVal <= 10) {
                keyCount = newVal;
                document.getElementById('keyCountInput').value = keyCount;
                renderKeyInputs();
            }
        }
        function renderKeyInputs() {
            const container = document.getElementById('keyInputsContainer');
            container.innerHTML = '';
            for (let i = 0; i < keyCount; i++) {
                const val = apiKeys[i] || '';
                container.innerHTML += `
                    <div class="flex items-center gap-2 relative">
                        <div class="w-6 text-xs font-bold text-slate-400 text-right">#${i + 1}</div>
                        <input type="password" id="apiKey_${i}" value="${val}" placeholder="Nhập API Key ${i + 1}" class="flex-1 bg-white border border-slate-200 text-slate-700 text-xs rounded-lg focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none px-3 py-2 pr-8 transition-all">
                        <button onclick="toggleKeyVisibility(${i})" class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                            <i id="keyEye_${i}" class="fa-regular fa-eye text-xs"></i>
                        </button>
                    </div>
                `;
            }
        }
        function toggleKeyVisibility(index) {
            const input = document.getElementById(`apiKey_${index}`);
            const icon = document.getElementById(`keyEye_${index}`);
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        }
        function saveApiKey() {
            apiKeys = [];
            for (let i = 0; i < keyCount; i++) {
                const val = document.getElementById(`apiKey_${i}`).value.trim();
                if (val) apiKeys.push(val);
            }
            if (apiKeys.length > 0) {
                const storageKey = getStorageKeyForModel();
                localStorage.setItem(storageKey, apiKeys.join(','));
                updateKeyBadge();
                toggleKeyConfig();
                alert('Đã lưu ' + apiKeys.length + ' API Key thành công!');
            } else {
                alert('Vui lòng nhập ít nhất 1 API Key!');
            }
        }
        function updateKeyBadge() {
            const badge = document.getElementById('activeKeyCountBadge');
            const storageKey = getStorageKeyForModel();
            const savedKey = localStorage.getItem(storageKey);
            if (savedKey) {
                const keys = savedKey.split(',').filter(k => k.trim());
                if (keys.length > 0) {
                    badge.innerText = keys.length;
                    badge.classList.remove('hidden');
                    return;
                }
            }
            badge.classList.add('hidden');
        }
        function saveModelPref() {
            const model = document.getElementById('aiModelSelect').value;
            localStorage.setItem('toeic_ai_model', model);
            loadApiKeyForCurrentModel();
        }
        function showError(msg) {
            const el = document.getElementById('errorMsg');
            el.innerText = msg;
            el.classList.remove('hidden');
        }
        function hideError() {
            document.getElementById('errorMsg').classList.add('hidden');
        }
        function splitTextIntoChunks(text, numChunks) {
            if (numChunks <= 1) return [text];
            const chunks = [];
            const chunkSize = Math.ceil(text.length / numChunks);
            let currentIndex = 0;
            while (currentIndex < text.length) {
                let endIndex = currentIndex + chunkSize;
                if (endIndex < text.length) {
                    while (endIndex > currentIndex && !/\s/.test(text[endIndex])) endIndex--;
                    if (endIndex === currentIndex) endIndex = currentIndex + chunkSize;
                } else {
                    endIndex = text.length;
                }
                chunks.push(text.substring(currentIndex, endIndex).trim());
                currentIndex = endIndex;
            }
            return chunks.filter(c => c.length > 0);
        }
        async function processContent() {
            const storageKey = getStorageKeyForModel();
            const apiKeyRaw = localStorage.getItem(storageKey);
            if (!apiKeyRaw) {
                showError("Vui lòng cấu hình API Key (biểu tượng chìa khóa góc trên) để thực hiện quét!");
                return;
            }
            const textInput = document.getElementById('textInput').value.trim();
            if (!textInput) {
                showError("Vui lòng nhập đoạn văn bản vào ô!");
                return;
            }
            const selectedModel = document.getElementById('aiModelSelect').value;
            const isGroq = !selectedModel.includes('gemini');
            hideError();
            document.getElementById('resultContainer').classList.add('hidden');
            const scanBtn = document.getElementById('scanBtn');
            const scanBtnText = document.getElementById('scanBtnText');
            const scanSpinner = document.getElementById('scanSpinner');
            scanBtn.disabled = true;
            scanBtnText.innerText = "Đang phân tích...";
            scanSpinner.classList.remove('hidden');
            try {
                // TIẾT KIỆM API: Kiểm tra xem người dùng đã bấm "Dịch toàn bộ bằng AI" chưa
                // Nếu văn bản trùng khớp và đã có dữ liệu phân loại từ (pos), ta lấy luôn dữ liệu đó
                if (window.lastDictText === textInput && window.lastDictObj) {
                    let hasPosData = Object.values(window.lastDictObj).some(item => item.pos && item.pos !== "");
                    if (hasPosData) {
                        let finalData = { nouns: [], adjectives: [], verbs: [], adverbs: [], conjunctions: [] };
                        for (let k in window.lastDictObj) {
                            let item = window.lastDictObj[k];
                            let pos = item.pos;
                            // mapping to the correct plural form just in case, though the prompt requires nouns, verbs, etc.
                            if (pos && finalData[pos]) {
                                finalData[pos].push({ w: k, m: item.m });
                            }
                        }
                        renderTable(finalData);
                        document.getElementById('resultContainer').classList.remove('hidden');
                        scanBtn.disabled = false;
                        scanBtnText.innerText = "Phân Tích Dữ Liệu";
                        scanSpinner.classList.add('hidden');
                        if (typeof initializeSynonymTable === 'function') {
                            initializeSynonymTable(finalData);
                        }
                        return; // Thoát luôn, không gọi API nữa
                    }
                }
                const keysArray = apiKeyRaw.split(',').map(k => k.trim()).filter(k => k);
                window.clickKeyIndex = window.clickKeyIndex || 0;
                let prompt = `Nhiệm vụ của bạn là trích xuất TOÀN BỘ các từ vựng tiếng Anh có ý nghĩa trong đoạn văn bản được cung cấp. BẠN PHẢI QUÉT THẬT KỸ VÀ KHÔNG ĐƯỢC BỎ SÓT BẤT KỲ TỪ NÀO (như retractable, refracting, aperture,...).
Tuyệt đối BỎ QUA các mạo từ và giới từ cơ bản (ví dụ: a, an, the, in, on, at, of, to, for, with...).
Tuyệt đối BỎ QUA các danh từ riêng (tên người, tên địa danh, tên công ty, model sản phẩm, ví dụ: Carol, Barger, Makatasi, Belter, BTR-1483...).
Hãy chuyển các từ về dạng nguyên thể, NHƯNG NẾU từ đó đang đóng vai trò là một tính từ/danh từ đặc thù trong câu (ví dụ: "retractable", "refracting") thì hãy giữ nguyên form của nó để dịch cho chuẩn xác.
Dịch từng từ tiếng Anh đã tìm thấy sang tiếng Việt sao cho sát nghĩa nhất với ngữ cảnh của đoạn văn. 
Sau đó, phân loại TẤT CẢ các từ vựng này vào 5 nhóm từ loại cơ bản: Danh từ, Tính từ, Động từ, Trạng từ, Liên từ.
QUAN TRỌNG: CHỈ TRẢ VỀ DUY NHẤT 1 ĐỐI TƯỢNG JSON (KHÔNG bọc trong markdown \`\`\`json, KHÔNG giải thích thêm).
Cấu trúc JSON bắt buộc phải giống chính xác như sau:
{
  "nouns": [{"w": "từ", "m": "nghĩa", "p": "phiên âm"}],
  "adjectives": [{"w": "từ", "m": "nghĩa", "p": "phiên âm"}],
  "verbs": [{"w": "từ", "m": "nghĩa", "p": "phiên âm"}],
  "adverbs": [{"w": "từ", "m": "nghĩa", "p": "phiên âm"}],
  "conjunctions": [{"w": "từ", "m": "nghĩa", "p": "phiên âm"}]
}
Nếu một nhóm không có từ nào, hãy trả về mảng rỗng [].`;
                let finalData = { nouns: [], adjectives: [], verbs: [], adverbs: [], conjunctions: [] };
                // ==========================================
                // 1. CƠ CHẾ CHIA ĐOẠN VĂN BẢN (CHUNKING)
                // ==========================================
                // Mặc định không chia đoạn (numChunks = 1), dành riêng cho bộ não siêu to của Gemini.
                // Do Gemini có context window lớn nên có thể xử lý nguyên bài dài trong 1 lần gửi.
                let numChunks = 1;
                if (isGroq) {
                    // Ngược lại, Groq chạy nhanh nhưng bị giới hạn token đầu vào/đầu ra khá gắt.
                    // Nếu văn bản quá dài, ta phải "băm" nhỏ nó ra thành 3 hoặc 4 đoạn để Groq xử lý từ từ, tránh văng lỗi quá tải token.
                    if (textInput.length > 500) numChunks = 3;
                    if (textInput.length > 3000) numChunks = 4;
                }
                const chunks = splitTextIntoChunks(textInput, numChunks);
                scanBtnText.innerText = `Đang phân tích (${chunks.length} đoạn)...`;
                for (let i = 0; i < chunks.length; i++) {
                    const currentChunk = chunks[i];
                    let aiText = "";
                    let retryCount = 0;
                    let success = false;
                    // ==========================================
                    // 2. CƠ CHẾ CHỐNG NGHẼN (RETRY) & XOAY VÒNG KEY
                    // ==========================================
                    // Vòng lặp này sẽ cố gắng gọi API tối đa 5 lần nếu gặp lỗi nghẽn mạng (429) hoặc lỗi hệ thống.
                    while (!success && retryCount < 5) {
                        // Kỹ thuật Load Balancing (Cân bằng tải): 
                        // Mỗi lần chuẩn bị gọi API (dù là do bấm nút mới hay do gọi lại vì bị lỗi nghẽn),
                        // biến 'clickKeyIndex' sẽ tăng lên 1. Dùng phép chia lấy dư (%) để quay vòng chọn 1 API Key mới trong danh sách.
                        // Đảm bảo không có Key nào bị vắt kiệt sức, lách luật Rate Limit hoàn hảo!
                        const apiKey = keysArray[window.clickKeyIndex % keysArray.length];
                        window.clickKeyIndex++;
                        try {
                            if (isGroq) {
                                const url = `https://api.groq.com/openai/v1/chat/completions`;
                                const payload = {
                                    model: selectedModel,
                                    messages: [
                                        { role: "system", content: "You are a meticulous AI that carefully extracts ALL meaningful English vocabulary (excluding basic articles/prepositions, and excluding proper nouns/names/models), translates it accurately to Vietnamese based on context, and strictly classifies it into nouns, adjectives, verbs, adverbs, and conjunctions. You must not miss any vocabulary. Strictly follow the required JSON output schema." },
                                        { role: "user", content: prompt + `\n\nĐoạn văn bản tiếng Anh cần phân tích:\n${currentChunk}` }
                                    ],
                                    temperature: 0.1,
                                      max_tokens: 5000,
                                      response_format: { type: "json_object" }
                                  };
                                const response = await fetch(url, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                                    body: JSON.stringify(payload)
                                });
                                if (response.status === 429) {
                                    scanBtnText.innerText = `Đang phân tích (${i+1}/${chunks.length}) - Nghẽn API, chờ 3s...`;
                                    await new Promise(r => setTimeout(r, 3000));
                                    retryCount++;
                                    continue;
                                }
                                if (!response.ok) throw new Error("Lỗi API Groq (Mã: " + response.status + ")");
                                const data = await response.json();
                                aiText = data.choices[0].message.content;
                                success = true;
                            } else {
                                const url = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`;
                                const payload = { contents: [{ parts: [{ text: prompt }, { text: `\n\nĐoạn văn bản tiếng Anh cần phân tích:\n${currentChunk}` }] }] };
                                const response = await fetch(url, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify(payload)
                                });
                                if (response.status === 429) {
                                    scanBtnText.innerText = `Đang phân tích (${i+1}/${chunks.length}) - Nghẽn API, chờ 3s...`;
                                    await new Promise(r => setTimeout(r, 3000));
                                    retryCount++;
                                    continue;
                                }
                                if (!response.ok) throw new Error("Lỗi API Gemini (Mã: " + response.status + ")");
                                const data = await response.json();
                                aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
                                success = true;
                            }
                        } catch (err) {
                            if (retryCount >= 4) throw err;
                            scanBtnText.innerText = `Lỗi kết nối, thử lại (${retryCount+1}/5)...`;
                            await new Promise(r => setTimeout(r, 2000));
                            retryCount++;
                        }
                    }
                    const parsed = parseAIResponse(aiText);
                    mergeResults(finalData, parsed);
                }
                renderTable(finalData);
            } catch (err) {
                showError("Lỗi: " + err.message);
                console.error(err);
            } finally {
                scanBtn.disabled = false;
                scanBtnText.innerText = "Phân Tích Dữ Liệu";
                scanSpinner.classList.add('hidden');
            }
        }
        function parseAIResponse(aiText) {
            if (!aiText) return { nouns: [], adjectives: [], verbs: [], adverbs: [], conjunctions: [] };
            let cleanJson = aiText.trim();
            if (cleanJson.startsWith('```json')) cleanJson = cleanJson.substring(7);
            else if (cleanJson.startsWith('```')) cleanJson = cleanJson.substring(3);
            if (cleanJson.endsWith('```')) cleanJson = cleanJson.substring(0, cleanJson.length - 3);
            try {
                return JSON.parse(cleanJson.trim());
            } catch (e) {
                console.error("JSON parse error:", e);
                return { nouns: [], adjectives: [], verbs: [], adverbs: [], conjunctions: [] };
            }
        }
        function mergeResults(finalData, parsed) {
            ['nouns', 'adjectives', 'verbs', 'adverbs', 'conjunctions'].forEach(pos => {
                if (parsed[pos]) {
                    finalData[pos].push(...parsed[pos]);
                    // Lưu luôn vào aiDict để dùng chung
                    parsed[pos].forEach(item => {
                        let wLow = item.w.toLowerCase();
                        window.aiDict[wLow] = {
                            p: item.p ? item.p.replace(/\//g, '') : '',
                            m: item.m,
                            pos: pos
                        };
                        if (item.p) {
                            let savedPhonetics = JSON.parse(localStorage.getItem('saved_phonetics') || '{}');
                            savedPhonetics[wLow] = window.aiDict[wLow].p;
                            localStorage.setItem('saved_phonetics', JSON.stringify(savedPhonetics));
                        }
                    });
                }
            });
        }
        function renderTable(data) {
            const nouns = data.nouns || [];
            const adjectives = data.adjectives || [];
            const verbs = data.verbs || [];
            const adverbs = data.adverbs || [];
            const conjunctions = data.conjunctions || [];
            const maxRows = Math.max(nouns.length, adjectives.length, verbs.length, adverbs.length, conjunctions.length);
            const tbody = document.getElementById('vocabTableBody');
            tbody.innerHTML = '';
            if (maxRows === 0) {
                tbody.innerHTML = `<tr><td colspan="11" class="text-center text-slate-500 italic py-4">Không tìm thấy từ vựng tiếng Anh nào hợp lệ.</td></tr>`;
                document.getElementById('resultContainer').classList.remove('hidden');
                return;
            }
            for (let i = 0; i < maxRows; i++) {
                const n = nouns[i] || { w: '', m: '' };
                const adj = adjectives[i] || { w: '', m: '' };
                const v = verbs[i] || { w: '', m: '' };
                const adv = adverbs[i] || { w: '', m: '' };
                const conj = conjunctions[i] || { w: '', m: '' };
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="col-stt font-semibold text-slate-500">${i + 1}</td>
                    <!-- Danh từ -->
                    <td class="word-text cursor-pointer hover:bg-brand-50 hover:text-brand-600 transition-colors" oncontextmenu="window.handleDictRightClick(event, '${n.w.replace(/'/g, "\\'")}')">${n.w}</td>
                    <td class="meaning-text">${n.m}</td>
                    <!-- Tính từ -->
                    <td class="word-text cursor-pointer hover:bg-brand-50 hover:text-brand-600 transition-colors" oncontextmenu="window.handleDictRightClick(event, '${adj.w.replace(/'/g, "\\'")}')">${adj.w}</td>
                    <td class="meaning-text">${adj.m}</td>
                    <!-- Động từ -->
                    <td class="word-text cursor-pointer hover:bg-brand-50 hover:text-brand-600 transition-colors" oncontextmenu="window.handleDictRightClick(event, '${v.w.replace(/'/g, "\\'")}')">${v.w}</td>
                    <td class="meaning-text">${v.m}</td>
                    <!-- Trạng từ -->
                    <td class="word-text cursor-pointer hover:bg-brand-50 hover:text-brand-600 transition-colors" oncontextmenu="window.handleDictRightClick(event, '${adv.w.replace(/'/g, "\\'")}')">${adv.w}</td>
                    <td class="meaning-text">${adv.m}</td>
                    <!-- Liên từ -->
                    <td class="word-text cursor-pointer hover:bg-brand-50 hover:text-brand-600 transition-colors" oncontextmenu="window.handleDictRightClick(event, '${conj.w.replace(/'/g, "\\'")}')">${conj.w}</td>
                    <td class="meaning-text">${conj.m}</td>
                `;
                tbody.appendChild(tr);
            }
            document.getElementById('resultContainer').classList.remove('hidden');
            // Scroll to table smoothly
            setTimeout(() => {
                document.getElementById('resultContainer').scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
        function copyTableData() {
            const table = document.getElementById('vocabTable');
            let text = "";
            // Add Header
            text += "STT\tDanh từ\t\tTính từ\t\tĐộng từ\t\tTrạng từ\t\tLiên từ\n";
            // Add rows
            for (let i = 1; i < table.rows.length; i++) {
                const row = table.rows[i];
                // Bỏ qua các dòng đang bị ẩn do search
                if (row.style.display === "none") continue;
                const cols = row.cells;
                if (cols.length === 1) continue; // Skip empty message
                const stt = cols[0].innerText;
                const nW = cols[1].innerText;
                const nM = cols[2].innerText;
                const adjW = cols[3].innerText;
                const adjM = cols[4].innerText;
                const vW = cols[5].innerText;
                const vM = cols[6].innerText;
                const advW = cols[7].innerText;
                const advM = cols[8].innerText;
                const conjW = cols[9].innerText;
                const conjM = cols[10].innerText;
                text += `${stt}\t${nW}\t${nM}\t${adjW}\t${adjM}\t${vW}\t${vM}\t${advW}\t${advM}\t${conjW}\t${conjM}\n`;
            }
            navigator.clipboard.writeText(text).then(() => {
                alert("Đã copy toàn bộ dữ liệu bảng (có thể dán trực tiếp vào Excel)!");
            }).catch(err => {
                alert("Không thể copy: " + err);
            });
        }
        function searchTable() {
            const input = document.getElementById("tableSearchInput");
            const filter = input.value.toLowerCase();
            const tbody = document.getElementById("vocabTableBody");
            const tr = tbody.getElementsByTagName("tr");
            for (let i = 0; i < tr.length; i++) {
                const cols = tr[i].getElementsByTagName("td");
                if (cols.length <= 1) continue; // Bỏ qua dòng thông báo trống
                let match = false;
                // Duyệt qua tất cả các cột trừ cột STT (index 0)
                for (let j = 1; j < cols.length; j++) {
                    if (cols[j].innerText.toLowerCase().indexOf(filter) > -1) {
                        match = true;
                        break;
                    }
                }
                tr[i].style.display = match ? "" : "none";
            }
            // Hủy bôi xanh khi có thay đổi bộ lọc để tránh lỗi tính toán
            clearSelection();
        }
        function toggleClearSearchBtn() {
            const input = document.getElementById("tableSearchInput");
            const btn = document.getElementById("clearSearchBtn");
            if (input.value.length > 0) {
                btn.classList.remove("hidden");
            } else {
                btn.classList.add("hidden");
            }
        }
        function clearSearch() {
            const input = document.getElementById("tableSearchInput");
            input.value = "";
            toggleClearSearchBtn();
            searchTable();
            input.focus();
        }
        // ==========================================
        // STUDY MODE LOGIC (ẨN/HIỆN NGHĨA)
        // ==========================================
        let isMeaningHidden = false;
        function toggleMeanings() {
            isMeaningHidden = !isMeaningHidden;
            const icon = document.getElementById('meaningEyeIcon');
            const btnText = document.getElementById('meaningBtnText');
            if (isMeaningHidden) {
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
                btnText.innerText = "Hiện Nghĩa";
                document.body.classList.add('hide-meanings');
            } else {
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
                btnText.innerText = "Ẩn Nghĩa";
                document.body.classList.remove('hide-meanings');
                // Hủy các ô đã mở
                document.querySelectorAll('.meaning-revealed').forEach(el => el.classList.remove('meaning-revealed'));
            }
        }
        // ==========================================
        // EXCEL-LIKE CELL SELECTION & COPY LOGIC
        // ==========================================
        let isSelecting = false;
        let startRow = -1;
        let startCol = -1;
        function getCellCoordinates(cell) {
            const row = cell.parentElement.rowIndex;
            const col = cell.cellIndex;
            return { row, col };
        }
        function clearSelection() {
            document.querySelectorAll('.selected-cell').forEach(td => td.classList.remove('selected-cell'));
        }
        function selectRectangle(r1, c1, r2, c2) {
            clearSelection();
            const table = document.getElementById('vocabTable');
            const minRow = Math.min(r1, r2);
            const maxRow = Math.max(r1, r2);
            const minCol = Math.min(c1, c2);
            const maxCol = Math.max(c1, c2);
            for (let r = minRow; r <= maxRow; r++) {
                const row = table.rows[r];
                if (!row) continue;
                for (let c = minCol; c <= maxCol; c++) {
                    const cell = row.cells[c];
                    if (cell && cell.tagName === 'TD') {
                        cell.classList.add('selected-cell');
                    }
                }
            }
        }
        document.addEventListener("DOMContentLoaded", () => {
            const table = document.getElementById('vocabTable');
            table.addEventListener('mousedown', (e) => {
                let targetCell = e.target;
                if (targetCell.tagName !== 'TD') targetCell = targetCell.closest('td');
                if (!targetCell) return;
                if (e.button !== 0) return; // Only left click
                // Chế độ học: Nếu bấm vào ô nghĩa đang bị ẩn thì mở nó ra và không bôi đen
                if (isMeaningHidden && targetCell.classList.contains('meaning-text') && !targetCell.classList.contains('meaning-revealed')) {
                    targetCell.classList.add('meaning-revealed');
                    return; // Ngừng việc bôi đen
                }
                isSelecting = true;
                const coords = getCellCoordinates(targetCell);
                startRow = coords.row;
                startCol = coords.col;
                clearSelection();
                targetCell.classList.add('selected-cell');
                // Disable text selection globally while dragging cells
                document.body.style.userSelect = 'none';
            });
            table.addEventListener('mouseover', (e) => {
                if (!isSelecting) return;
                let target = e.target;
                if (target.tagName !== 'TD') {
                    target = target.closest('td');
                }
                if (!target) return;
                const coords = getCellCoordinates(target);
                selectRectangle(startRow, startCol, coords.row, coords.col);
            });
            window.addEventListener('mouseup', () => {
                isSelecting = false;
                document.body.style.userSelect = '';
            });
            // Clear selection when clicking outside the table
            document.addEventListener('mousedown', (e) => {
                if (!e.target.closest('#vocabTable')) {
                    clearSelection();
                }
            });
            // Handle Ctrl+C for selected cells
            window.addEventListener('keydown', (e) => {
                if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
                    const selectedCells = document.querySelectorAll('.selected-cell');
                    if (selectedCells.length === 0) return; // Fallback to default copy if no cells selected
                    e.preventDefault(); // Prevent default text copy
                    let rowMap = {};
                    selectedCells.forEach(cell => {
                        const r = cell.parentElement.rowIndex;
                        const c = cell.cellIndex;
                        if (!rowMap[r]) rowMap[r] = [];
                        rowMap[r].push({ col: c, text: cell.innerText });
                    });
                    const rows = Object.keys(rowMap).sort((a,b) => a - b);
                    let copyStr = "";
                    rows.forEach(r => {
                        rowMap[r].sort((a,b) => a.col - b.col);
                        const rowText = rowMap[r].map(cell => cell.text).join('\t');
                        copyStr += rowText + "\n";
                    });
                    const markAsCopied = () => {
                        selectedCells.forEach(cell => {
                            cell.classList.remove('selected-cell');
                            cell.classList.add('copied-cell');
                        });
                    };
                    try {
                        if (navigator.clipboard && navigator.clipboard.writeText) {
                            navigator.clipboard.writeText(copyStr).then(markAsCopied).catch(err => {
                                console.error("Clipboard API failed, using fallback.", err);
                                fallbackCopy(copyStr);
                                markAsCopied();
                            });
                        } else {
                            fallbackCopy(copyStr);
                            markAsCopied();
                        }
                    } catch (err) {
                        fallbackCopy(copyStr);
                        markAsCopied();
                    }
                } else if (e.key === 'Escape') {
                    // Xóa toàn bộ vùng chọn hiện tại và các ô đã copy khi ấn ESC
                    clearSelection();
                    document.querySelectorAll('.copied-cell').forEach(td => td.classList.remove('copied-cell'));
                }
            });
            function fallbackCopy(text) {
                const textArea = document.createElement("textarea");
                textArea.value = text;
                textArea.style.top = "0";
                textArea.style.left = "0";
                textArea.style.position = "fixed";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                try {
                    document.execCommand('copy');
                } catch (err) {
                    console.error('Fallback copy failed', err);
                }
                document.body.removeChild(textArea);
            }
        });
        // ==========================================
        // CHẾ ĐỘ TRA TỪ (CLICK CHUỘT PHẢI)
        // ==========================================
        let isDictMode = false;
        window.handleDictRightClick = function(e, word, targetEl) {
            try {
                e.preventDefault();
                if (!word) return;
                const rect = (targetEl || e.target).getBoundingClientRect();
                const x = rect.left + (rect.width / 2);
                const y = rect.top + window.scrollY;
                let w = word.toLowerCase();
                if (window.aiDict && window.aiDict[w]) {
                    showTooltip(x, y, word, window.aiDict[w].p, window.aiDict[w].m, window.aiDict[w].pos);
                    playSpeechRobust(word, 'en-US');
                    return;
                }
                showTooltip(x, y, word, '', '<i class="fa-solid fa-spinner fa-spin"></i> Đang tải...', '');
                playSpeechRobust(word, 'en-US');
                const getPhoneticAndMeaning = async (word) => {
                    let meaning = '';
                    let phonetic = '';
                    let googlePhonetic = '';
                    let wLower = word.toLowerCase();
                    let savedPhonetics = JSON.parse(localStorage.getItem('saved_phonetics') || '{}');
                    try {
                        let tRes = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&dt=bd&dt=rm&q=${encodeURIComponent(word)}`);
                        let tData = await tRes.json();
                        if (tData && tData[0] && tData[0][0] && tData[0][0][0]) {
                            meaning = tData[0][0][0];
                        }
                        if (tData && tData[0]) {
                            for (let i = 0; i < tData[0].length; i++) {
                                if (tData[0][i] && tData[0][i].length > 3 && tData[0][i][3] && typeof tData[0][i][3] === 'string') {
                                    googlePhonetic = tData[0][i][3];
                                    break;
                                }
                            }
                        }
                    } catch(e) {
                        console.error('Lỗi Google Translate API:', e);
                    }
                    const fetchDictPhonetic = async (w) => {
                        try {
                            let dRes = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(w)}`);
                            let dData = await dRes.json();
                            if (dData && dData[0]) {
                                if (dData[0].phonetic) return dData[0].phonetic;
                                if (dData[0].phonetics) {
                                    const p = dData[0].phonetics.find(x => x.text);
                                    if (p) return p.text;
                                }
                            }
                        } catch (e) {
                            console.error('Lỗi Dictionary API:', e);
                        }
                        return null;
                    };
                    if (savedPhonetics[wLower]) {
                        phonetic = savedPhonetics[wLower];
                    } else {
                        phonetic = await fetchDictPhonetic(word);
                        if (!phonetic) {
                            let bases = [];
                            if (wLower.endsWith('ies')) bases.push(wLower.slice(0, -3) + 'y');
                            else if (wLower.endsWith('ves')) bases.push(wLower.slice(0, -3) + 'f', wLower.slice(0, -3) + 'fe');
                            else if (wLower.endsWith('es')) { bases.push(wLower.slice(0, -1)); bases.push(wLower.slice(0, -2)); }
                            else if (wLower.endsWith('s') && !wLower.endsWith('ss')) bases.push(wLower.slice(0, -1));
                            else if (wLower.endsWith('ed')) { bases.push(wLower.slice(0, -1)); bases.push(wLower.slice(0, -2)); }
                            else if (wLower.endsWith('ing')) { bases.push(wLower.slice(0, -3)); bases.push(wLower.slice(0, -3) + 'e'); }
                            for (let base of bases) {
                                let bp = await fetchDictPhonetic(base);
                                if (bp) {
                                    phonetic = bp;
                                    break;
                                }
                            }
                        }
                    }
                    if (!phonetic) {
                        phonetic = googlePhonetic;
                    } else {
                        phonetic = phonetic.replace(/\//g, '');
                    }
                    return { meaning, phonetic };
                };
                getPhoneticAndMeaning(word).then(result => {
                    showTooltip(x, y, word, result.phonetic, result.meaning || 'Không tìm thấy nghĩa');
                }).catch(err => {
                    console.error('Lỗi getPhoneticAndMeaning:', err);
                    showTooltip(x, y, word, '', 'Không tìm thấy nghĩa', '');
                });
            } catch(e) {
                console.error('Lỗi handleWordRightClick:', e);
            }
        };
        function toggleDictMode() {
            const textarea = document.getElementById('textInput');
            const dictContent = document.getElementById('dictContent');
            const btnText = document.getElementById('toggleDictText');
            if (isDictMode) {
                // Tắt
                isDictMode = false;
                textarea.classList.remove('hidden');
                dictContent.classList.add('hidden');
                btnText.innerText = 'Bật chế độ Đọc';
                document.getElementById('aiDictBtn').classList.add('hidden');
                document.getElementById('aiDictBtn').classList.remove('flex');
                // Tắt luôn việc đọc
                if (typeof stopPgaText === 'function') stopPgaText();
                document.getElementById('readPgaBtn').classList.add('hidden');
                document.getElementById('readPgaBtn').classList.remove('flex');
            } else {
                // Bật
                const rawText = textarea.value.trim();
                if (!rawText) return alert("Vui lòng nhập văn bản trước!");
                isDictMode = true;
                textarea.classList.add('hidden');
                dictContent.classList.remove('hidden');
                btnText.innerText = 'Tắt chế độ Đọc';
                document.getElementById('aiDictBtn').classList.remove('hidden');
                document.getElementById('aiDictBtn').classList.add('flex');
                document.getElementById('readPgaBtn').classList.remove('hidden');
                document.getElementById('readPgaBtn').classList.add('flex');
                renderDictContent(rawText);
            }
        }
        function showTooltip(x, y, word, phonetic, meaning, pos) {
            document.getElementById('ttWord').innerText = word;
            let cleanP = phonetic ? phonetic.replace(/\//g, '') : '';
            document.getElementById('ttPhonetic').innerText = cleanP ? `/${cleanP}/` : '';
            const posEl = document.getElementById('ttPos');
            if (pos && pos !== '') {
                posEl.innerText = pos;
                posEl.style.display = 'inline-block';
            } else {
                posEl.style.display = 'none';
            }
            document.getElementById('ttMeaning').innerHTML = meaning || 'Không tìm thấy nghĩa';
            const tooltip = document.getElementById('dictTooltip');
            tooltip.style.left = x + 'px';
            tooltip.style.top = (y - 10) + 'px'; // offset slightly up
            tooltip.classList.add('active');
        }
        function renderDictContent(text) {
            const container = document.getElementById('dictContent');
            container.innerHTML = '';
            const tokens = text.match(/[\w'-]+|[^\w\s]+|\s+/g) || [];
            let currentOffset = 0;
            tokens.forEach(token => {
                const tokenLen = token.length;
                const start = currentOffset;
                const end = start + tokenLen;
                if (/^\s+$/.test(token)) {
                    if (token.includes('\n')) {
                        const brCount = (token.match(/\n/g) || []).length;
                        for(let i=0; i<brCount; i++) {
                            container.appendChild(document.createElement('br'));
                        }
                    } else {
                        const span = document.createElement('span');
                        span.textContent = token;
                        span.className = 'transition-colors duration-200';
                        span.setAttribute('data-start', start);
                        span.setAttribute('data-end', end);
                        container.appendChild(span);
                    }
                } else if (/^[\w'-]+$/.test(token)) {
                    const span = document.createElement('span');
                    span.textContent = token;
                    span.className = 'cursor-pointer hover:bg-brand-100 hover:text-brand-600 rounded transition-colors duration-200';
                    span.setAttribute('data-start', start);
                    span.setAttribute('data-end', end);
                    span.addEventListener('dblclick', (e) => {
                        e.preventDefault();
                        window.getSelection().removeAllRanges();
                        // Dừng nếu đang đọc
                        if (typeof stopChunkedTTS === 'function') stopChunkedTTS();
                        isReadingPga = false;
                        isPausedPga = false;
                        let startIdx = parseInt(span.getAttribute('data-start'));
                        let fullText = document.getElementById('textInput').value;
                        let tToRead = fullText.substring(startIdx).trim();
                        if (tToRead) {
                            readPgaText(tToRead, startIdx);
                        }
                    });
                    span.addEventListener('contextmenu', (e) => {
                        window.handleDictRightClick(e, token, span);
                    });
                    container.appendChild(span);
                } else {
                    const span = document.createElement('span');
                    span.textContent = token;
                    span.className = 'transition-colors duration-200';
                    span.setAttribute('data-start', start);
                    span.setAttribute('data-end', end);
                    container.appendChild(span);
                }
                currentOffset += tokenLen;
            });
        }
        function hideDictTooltip() {
            const dictTooltip = document.getElementById('dictTooltip');
            if (dictTooltip) dictTooltip.classList.remove('active');
        }
        document.addEventListener('click', (e) => {
            hideDictTooltip();
            // Close API Key dropdown when clicking outside
            const keyBtn = document.getElementById('toggleKeyConfigBtn');
            const keyPanel = document.getElementById('keyConfigSection');
            if (keyBtn && keyPanel && !keyBtn.contains(e.target) && !keyPanel.contains(e.target)) {
                keyPanel.classList.add('hidden');
            }
        });
        window.addEventListener('scroll', () => hideDictTooltip());
        // ==========================================
        // TÍNH NĂNG ĐỌC VĂN BẢN TÍCH HỢP
        // ==========================================
        let isReadingPga = false;
        let isPausedPga = false;
        function readPgaText(forceText = null, forceOffset = null) {
            let textToRead = "";
            let globalStartOffset = 0;
            const textarea = document.getElementById('textInput');
            if (forceText !== null && forceOffset !== null) {
                textToRead = forceText;
                globalStartOffset = forceOffset;
                window.getSelection().removeAllRanges(); // bỏ bôi đen
            } else {
                const sel = window.getSelection();
                if (sel.rangeCount > 0 && sel.toString().trim()) {
                    textToRead = sel.toString().trim();
                    let node = sel.getRangeAt(0).startContainer;
                    if (node.nodeType === 3) node = node.parentNode;
                    if (node && node.hasAttribute && node.hasAttribute('data-start')) {
                        globalStartOffset = parseInt(node.getAttribute('data-start'));
                    } else {
                        globalStartOffset = textarea.value.indexOf(textToRead);
                        if (globalStartOffset === -1) globalStartOffset = 0;
                    }
                } else if (textarea.selectionStart !== textarea.selectionEnd) {
                    textToRead = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd).trim();
                    globalStartOffset = textarea.selectionStart;
                } else {
                    textToRead = textarea.value.trim();
                    globalStartOffset = 0;
                }
            }
            if (!textToRead) {
                alert("Vui lòng nhập văn bản để đọc!");
                return;
            }
            if (typeof playSpeechChunked !== 'function') {
                alert("Không tìm thấy bộ đọc (main.js). Vui lòng tải lại trang.");
                return;
            }
            isReadingPga = true;
            isPausedPga = false;
            document.getElementById('readPgaBtn').classList.add('hidden');
            document.getElementById('pausePgaBtn').classList.remove('hidden');
            document.getElementById('pausePgaBtn').innerHTML = `<i class="fa-solid fa-pause"></i> <span>Tạm dừng</span>`;
            document.getElementById('stopPgaBtn').classList.remove('hidden');
            playSpeechChunked(textToRead, 'en-US', 1.0, () => {
                isReadingPga = false;
                isPausedPga = false;
                document.getElementById('readPgaBtn').classList.remove('hidden');
                document.getElementById('pausePgaBtn').classList.add('hidden');
                document.getElementById('stopPgaBtn').classList.add('hidden');
                clearHighlights();
            }, (chunkText, start, end) => {
                highlightTextRange(globalStartOffset + start, globalStartOffset + end);
            });
        }
        function highlightTextRange(start, end) {
            clearHighlights();
            const dictContent = document.getElementById('dictContent');
            if (!dictContent.classList.contains('hidden')) {
                const spans = dictContent.querySelectorAll('span[data-start]');
                let highlightedSpans = [];
                spans.forEach(span => {
                    let s = parseInt(span.getAttribute('data-start'));
                    let e = parseInt(span.getAttribute('data-end'));
                    if (Math.max(s, start) < Math.min(e, end)) {
                        span.classList.remove('rounded');
                        span.classList.add('bg-yellow-300', 'text-slate-900');
                        highlightedSpans.push(span);
                    }
                });
                if (highlightedSpans.length > 0) {
                    highlightedSpans[0].classList.add('rounded-l-md');
                    highlightedSpans[highlightedSpans.length - 1].classList.add('rounded-r-md');
                }
            } else {
                const textarea = document.getElementById('textInput');
                textarea.focus();
                textarea.setSelectionRange(start, end);
            }
        }
        function clearHighlights() {
            const spans = document.querySelectorAll('#dictContent .bg-yellow-300');
            spans.forEach(span => {
                span.classList.remove('bg-yellow-300', 'text-slate-900', 'rounded-l-md', 'rounded-r-md');
                if (span.classList.contains('cursor-pointer')) {
                    span.classList.add('rounded');
                }
            });
        }
        function pausePgaText() {
            const btn = document.getElementById('pausePgaBtn');
            if (isPausedPga) {
                // Resume
                if (typeof resumeChunkedTTS === 'function') resumeChunkedTTS();
                isPausedPga = false;
                btn.innerHTML = `<i class="fa-solid fa-pause"></i> <span>Tạm dừng</span>`;
            } else {
                // Pause
                if (typeof pauseChunkedTTS === 'function') pauseChunkedTTS();
                isPausedPga = true;
                btn.innerHTML = `<i class="fa-solid fa-play"></i> <span>Tiếp tục</span>`;
            }
        }
        function stopPgaText() {
            isReadingPga = false;
            isPausedPga = false;
            if (typeof stopChunkedTTS === 'function') stopChunkedTTS();
            document.getElementById('readPgaBtn').classList.remove('hidden');
            document.getElementById('pausePgaBtn').classList.add('hidden');
            document.getElementById('stopPgaBtn').classList.add('hidden');
            clearHighlights();
        }
        async function preTranslateAI() {
            const rawText = document.getElementById('textInput').value.trim();
            if (!rawText) return alert("Vui lòng nhập văn bản!");
            const btn = document.getElementById('aiDictBtn');
            const textSpan = document.getElementById('aiDictBtnText');
            btn.classList.add('opacity-70', 'cursor-not-allowed', 'animate-pulse');
            btn.disabled = true;
            textSpan.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Đang phân tích...';
            const prompt = `Nhiệm vụ của bạn là trích xuất TOÀN BỘ các từ vựng tiếng Anh (bao gồm cả danh từ, động từ, tính từ, trạng từ, liên từ, giới từ, mạo từ...) trong đoạn văn bản được cung cấp. BẠN PHẢI QUÉT THẬT KỸ VÀ KHÔNG ĐƯỢC BỎ SÓT BẤT KỲ TỪ NÀO.
Tuyệt đối BỎ QUA các danh từ riêng (tên người, tên địa danh, tên công ty).
Hãy giữ nguyên form của từ trong câu để dịch cho chuẩn xác nhất với ngữ cảnh. Cung cấp kèm phiên âm chuẩn IPA (UK hoặc US) và phân loại từ loại (pos). pos chỉ được mang một trong các giá trị: "nouns", "adjectives", "verbs", "adverbs", "conjunctions", hoặc chuỗi rỗng "" nếu không thuộc các loại trên.
ĐỒNG THỜI, bạn phải áp dụng quy tắc Ngắt Nghỉ và Ngữ Điệu (Intonation & Pausing) của TOEIC vào chính đoạn văn bản đó và trả về trong trường "annotatedText":
- Lên giọng (➚): cuối câu hỏi Yes/No (bắt đầu bằng Be, Do, Modal verbs), và các mục liệt kê ngoại trừ mục cuối cùng.
- Xuống giọng (➘): cuối câu trần thuật, câu mệnh lệnh, câu cảm thán, câu hỏi Wh-, và mục cuối cùng của chuỗi liệt kê.
- Ngắt nhẹ (/): CHỈ ngắt ở những cụm từ dài (như trước giới từ, trước mệnh đề quan hệ, cụm trạng ngữ). TUYỆT ĐỐI KHÔNG ngắt từng chữ một.
- Dừng lâu (//): sau dấu chấm câu.
- Nhấn mạnh (VIẾT HOA TOÀN BỘ TỪ): đối với các con số, số lượng, tên riêng, hoặc từ nối.
*Lưu ý: KHÔNG dùng thẻ HTML. CHỈ chèn ký hiệu /, //, ➚, ➘ trực tiếp vào văn bản.
QUAN TRỌNG: CHỈ TRẢ VỀ DUY NHẤT 1 ĐỐI TƯỢNG JSON (KHÔNG bọc trong markdown \`\`\`json).
Cấu trúc JSON bắt buộc phải gồm 2 phần "annotatedText" và "dict". 
Đây là một số MẪU ĐÁNH DẤU CHUẨN (tham khảo cách ngắt / thưa thớt, tự nhiên):
Mẫu 1: "If you haven't yet / ridden on ADDISON CITY'S brand-new commuter train, you should give it a try➘! // With comfortable seating➚, foldout writing trays➚, and individual lights, the commuter train is the clear choice / for the business commuter / who wants to get some work done while traveling➘. // So make your commute more productive - replace your drive with ADDISON CITY'S commuter train➘. //"
Mẫu 2: "I am happy to introduce EMILY KEITH, famous musician from the opera BLACK MASK, who will be here for us / in the next segment➘. // This romantic comedy opera / was open SEVERAL weeks ago, and you can still enjoy it / in ONE of our local theaters➘. // Tonight, she'll talk about her character in the play➚, trainings done behind the scene➚, and plans for her next performance➘. //"
Mẫu 3: "Good morning➚, and let me be the FIRST to welcome you / to your new jobs at BAXTER INDUSTRIES➘. // You've already received our employee handbook, which describes our company hours➚, paid holidays➚, and / employee benefits➘. // Now, if you'll look at the back of the handbook, you'll find copies of some forms / that we'd like you to fill out➘. //"
Ví dụ định dạng trả về:
{
  "annotatedText": "If you haven't yet / ridden on ADDISON CITY'S brand-new commuter train...",
  "dict": {
    "ridden": {"p": "/ˈrɪd.ən/", "m": "cưỡi, đi", "pos": "verbs"}
  }
}`;
            try {
                const res = await callGeminiAPIText(prompt, rawText);
                if (!res) throw new Error("API Trả về rỗng");
                let jsonStr = res.trim();
                if (jsonStr.startsWith("```json")) {
                    jsonStr = jsonStr.replace(/^```json/, "").replace(/```$/, "").trim();
                } else if (jsonStr.startsWith("```")) {
                    jsonStr = jsonStr.replace(/^```/, "").replace(/```$/, "").trim();
                }
                const resObj = JSON.parse(jsonStr);
                  let dictObj = resObj;
                  let annotatedText = rawText;
                  if (resObj.dict && resObj.annotatedText) {
                      dictObj = resObj.dict;
                      annotatedText = resObj.annotatedText;
                      // Cập nhật lại UI text area
                      document.getElementById('textInput').value = annotatedText;
                      if (typeof isDictMode !== 'undefined' && isDictMode) {
                          renderDictContent(annotatedText);
                      }
                  }
                  window.lastDictText = annotatedText;
                  window.lastDictObj = dictObj;
                let savedPhonetics = JSON.parse(localStorage.getItem('saved_phonetics') || '{}');
                for (let k in dictObj) {
                    let w = k.toLowerCase();
                    let p = dictObj[k].p ? dictObj[k].p.replace(/\//g, '') : '';
                    let pos = dictObj[k].pos || '';
                    window.aiDict[w] = { p: p, m: dictObj[k].m, pos: pos };
                    if (p) savedPhonetics[w] = p;
                }
                localStorage.setItem('saved_phonetics', JSON.stringify(savedPhonetics));
                textSpan.innerHTML = '<i class="fa-solid fa-check mr-2"></i> Đã dịch xong';
                setTimeout(() => {
                    textSpan.innerText = 'Dịch toàn bộ bằng AI';
                }, 3000);
            } catch (e) {
                console.error(e);
                alert("Lỗi khi xử lý AI: " + e.message);
                textSpan.innerText = 'Dịch toàn bộ bằng AI';
            } finally {
                btn.classList.remove('opacity-70', 'cursor-not-allowed', 'animate-pulse');
                btn.disabled = false;
            }
        }
        let speechRecognition = null;
        let isSpeakingPractice = false;
        function toggleSpeakPractice() {
            const btn = document.getElementById('speakPracticeBtn');
            const btnText = document.getElementById('speakPracticeBtnText');
            const area = document.getElementById('speakPracticeArea');
            const status = document.getElementById('speakStatus');
            const input = document.getElementById('speakTranscribeInput');
            
            if (!isSpeakingPractice) {
                isSpeakingPractice = true;
                area.classList.remove('hidden');
                btn.classList.remove('bg-teal-50', 'text-teal-600', 'hover:bg-teal-100');
                btn.classList.add('bg-teal-500', 'text-white');
                btnText.innerText = "Đóng Speak";
                status.innerText = "Sẵn sàng (Win + H)";
                input.focus();
                document.getElementById('evaluateSpeechBtn').classList.toggle('hidden', input.value.trim() === '');
            } else {
                stopSpeakPractice();
                area.classList.add('hidden');
            }
        }
        function stopSpeakPractice() {
            isSpeakingPractice = false;
            const btn = document.getElementById('speakPracticeBtn');
            const btnText = document.getElementById('speakPracticeBtnText');
            const status = document.getElementById('speakStatus');
            if (btn) {
                btn.classList.add('bg-teal-50', 'text-teal-600', 'hover:bg-teal-100');
                btn.classList.remove('bg-teal-500', 'text-white');
            }
            if (btnText) btnText.innerText = "Luyện Speak";
            if (status) status.innerText = "Đã đóng";
        }
        async function evaluateSpeech() {
            const originalText = document.getElementById('textInput').value.trim();
            const spokenText = document.getElementById('speakTranscribeInput').value.trim();
            if (!originalText || !spokenText) {
                alert("Bạn cần phải có cả đoạn văn bản gốc và đoạn văn thu âm để chấm điểm.");
                return;
            }
            const evalBtn = document.getElementById('evaluateSpeechBtn');
            const evalBtnText = document.getElementById('evaluateSpeechBtnText');
            const resultArea = document.getElementById('speakEvalResult');
            const markedTextEl = document.getElementById('speakEvalMarkedText');
            const reasonsEl = document.getElementById('speakEvalReasons');
            evalBtn.disabled = true;
            evalBtn.classList.add('opacity-70', 'cursor-not-allowed', 'animate-pulse');
            evalBtnText.innerText = "Đang phân tích...";
            resultArea.classList.add('hidden');
            const systemPrompt = `Bạn là một chuyên gia phát âm tiếng Anh.
Nhiệm vụ: So sánh đoạn văn bản do người dùng đọc (Spoken Text) với đoạn văn bản gốc (Original Text).
Yêu cầu:
1. Xác định những từ tiếng Anh mà người dùng đọc sai, đọc thiếu hoặc phát âm không chuẩn so với gốc.
2. Trả về kết quả dưới định dạng JSON duy nhất. KHÔNG TRẢ VỀ MARKDOWN hay bất kỳ chữ nào ngoài JSON.
Cấu trúc JSON:
{
  "marked_text": "Toàn bộ đoạn văn bản GỐC, trong đó những từ đọc sai hoặc bị thiếu phải được bọc trong thẻ <span class='text-rose-600 font-bold bg-rose-100 px-1 rounded'>...</span>. Những từ đọc dư bọc bằng <del class='text-slate-400'>...</del>",
  "errors": [
    "Từ '...': Bạn đọc thành '...', hãy chú ý âm ...",
    "Từ '...': Bạn đọc thiếu âm đuôi ...",
    "Bạn bỏ sót từ '...'"
  ]
}
Chú ý: Nếu người dùng đọc hoàn hảo, errors có thể là mảng rỗng và marked_text không có thẻ đỏ.
Hãy làm việc thật chính xác và bao dung với các lỗi nhỏ của speech-to-text (ví dụ dấu câu).`;
            const userPrompt = `Original Text:\n${originalText}\n\nSpoken Text:\n${spokenText}`;
            try {
                const responseText = await callGeminiAPIText(systemPrompt, userPrompt);
                // Parse JSON từ văn bản trả về
                let result = null;
                try {
                    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        result = JSON.parse(jsonMatch[0]);
                    } else {
                        result = JSON.parse(responseText);
                    }
                } catch (e) {
                    throw new Error("AI trả về kết quả không đúng định dạng JSON.");
                }
                if (result && result.marked_text) {
                    markedTextEl.innerHTML = result.marked_text;
                    reasonsEl.innerHTML = "";
                    if (result.errors && result.errors.length > 0) {
                        result.errors.forEach(err => {
                            const li = document.createElement('li');
                            li.innerHTML = err;
                            reasonsEl.appendChild(li);
                        });
                    } else {
                        reasonsEl.innerHTML = "<li class='text-emerald-600 font-bold'>Tuyệt vời! Bạn đọc rất chuẩn, không tìm thấy lỗi sai đáng kể nào.</li>";
                    }
                    resultArea.classList.remove('hidden');
                } else {
                    throw new Error("Không nhận được kết quả hợp lệ từ AI.");
                }
            } catch (error) {
                console.error(error);
                alert("Lỗi khi chấm điểm: " + error.message);
            } finally {
                evalBtn.disabled = false;
                evalBtn.classList.remove('opacity-70', 'cursor-not-allowed', 'animate-pulse');
                evalBtnText.innerText = "Chấm điểm AI";
            }
        }
    


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
Đặc biệt, trong phần giải thích chi tiết, BẤT CỨ KHI NÀO BẠN TRÍCH DẪN từ vựng, cấu trúc, chữ cái tiếng Anh (ví dụ: "allows", "To seek advice...", "V-ing"), BẮT BUỘC phải bôi đậm và tô màu vàng bằng thẻ <strong class="text-amber-600 bg-amber-50 px-1 rounded">"từ tiếng anh"</strong>. TUYỆT ĐỐI KHÔNG ĐƯỢC ĐỂ BẤT KỲ TỪ TIẾNG ANH NÀO TRONG NGOẶC KÉP MÀ KHÔNG CÓ THẺ MÀU VÀNG NÀY!

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
      <li><strong>Cách dùng:</strong> [Giải thích cặn kẽ cách dùng tự nhiên của cụm từ này, tác dụng trong văn cảnh].</li>
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
            payload = { model: selectedModel, messages: [{ role: "user", content: prompt }], temperature: 0.2, max_tokens: 5000 };
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

