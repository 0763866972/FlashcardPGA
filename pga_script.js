    <script>
        window.addEventListener('error', function(event) { alert('JS Error: ' + event.message + ' at line ' + event.lineno); }); window.addEventListener('unhandledrejection', function(event) { alert('Promise Error: ' + event.reason); });
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
            
            // Táº£i láº¡i Ä‘oáº¡n vÄƒn báº£n Ä‘Ã£ lÆ°u
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
                        <input type="password" id="apiKey_${i}" value="${val}" placeholder="Nháº­p API Key ${i + 1}" class="flex-1 bg-white border border-slate-200 text-slate-700 text-xs rounded-lg focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none px-3 py-2 pr-8 transition-all">
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
                alert('ÄÃ£ lÆ°u ' + apiKeys.length + ' API Key thÃ nh cÃ´ng!');
            } else {
                alert('Vui lÃ²ng nháº­p Ã­t nháº¥t 1 API Key!');
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
                showError("Vui lÃ²ng cáº¥u hÃ¬nh API Key (biá»ƒu tÆ°á»£ng chÃ¬a khÃ³a gÃ³c trÃªn) Ä‘á»ƒ thá»±c hiá»‡n quÃ©t!");
                return;
            }

            const textInput = document.getElementById('textInput').value.trim();

            if (!textInput) {
                showError("Vui lÃ²ng nháº­p Ä‘oáº¡n vÄƒn báº£n vÃ o Ã´!");
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
            scanBtnText.innerText = "Äang phÃ¢n tÃ­ch...";
            scanSpinner.classList.remove('hidden');

            try {
                // TIáº¾T KIá»†M API: Kiá»ƒm tra xem ngÆ°á»i dÃ¹ng Ä‘Ã£ báº¥m "Dá»‹ch toÃ n bá»™ báº±ng AI" chÆ°a
                // Náº¿u vÄƒn báº£n trÃ¹ng khá»›p vÃ  Ä‘Ã£ cÃ³ dá»¯ liá»‡u phÃ¢n loáº¡i tá»« (pos), ta láº¥y luÃ´n dá»¯ liá»‡u Ä‘Ã³
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
                        
                        displayResults(finalData);
                        document.getElementById('resultContainer').classList.remove('hidden');
                        
                        scanBtn.disabled = false;
                        scanBtnText.innerText = "PhÃ¢n TÃ­ch Dá»¯ Liá»‡u";
                        scanSpinner.classList.add('hidden');
                        
                        if (typeof initializeSynonymTable === 'function') {
                            initializeSynonymTable(finalData);
                        }
                        
                        return; // ThoÃ¡t luÃ´n, khÃ´ng gá»i API ná»¯a
                    }
                }

                const keysArray = apiKeyRaw.split(',').map(k => k.trim()).filter(k => k);
                window.clickKeyIndex = window.clickKeyIndex || 0;

                let prompt = `Nhiá»‡m vá»¥ cá»§a báº¡n lÃ  trÃ­ch xuáº¥t TOÃ€N Bá»˜ cÃ¡c tá»« vá»±ng tiáº¿ng Anh cÃ³ Ã½ nghÄ©a trong Ä‘oáº¡n vÄƒn báº£n Ä‘Æ°á»£c cung cáº¥p. Báº N PHáº¢I QUÃ‰T THáº¬T Ká»¸ VÃ€ KHÃ”NG ÄÆ¯á»¢C Bá»Ž SÃ“T Báº¤T Ká»² Tá»ª NÃ€O (nhÆ° retractable, refracting, aperture,...).
Tuyá»‡t Ä‘á»‘i Bá»Ž QUA cÃ¡c máº¡o tá»« vÃ  giá»›i tá»« cÆ¡ báº£n (vÃ­ dá»¥: a, an, the, in, on, at, of, to, for, with...).
Tuyá»‡t Ä‘á»‘i Bá»Ž QUA cÃ¡c danh tá»« riÃªng (tÃªn ngÆ°á»i, tÃªn Ä‘á»‹a danh, tÃªn cÃ´ng ty, model sáº£n pháº©m, vÃ­ dá»¥: Carol, Barger, Makatasi, Belter, BTR-1483...).
HÃ£y chuyá»ƒn cÃ¡c tá»« vá» dáº¡ng nguyÃªn thá»ƒ, NHÆ¯NG Náº¾U tá»« Ä‘Ã³ Ä‘ang Ä‘Ã³ng vai trÃ² lÃ  má»™t tÃ­nh tá»«/danh tá»« Ä‘áº·c thÃ¹ trong cÃ¢u (vÃ­ dá»¥: "retractable", "refracting") thÃ¬ hÃ£y giá»¯ nguyÃªn form cá»§a nÃ³ Ä‘á»ƒ dá»‹ch cho chuáº©n xÃ¡c.
Dá»‹ch tá»«ng tá»« tiáº¿ng Anh Ä‘Ã£ tÃ¬m tháº¥y sang tiáº¿ng Viá»‡t sao cho sÃ¡t nghÄ©a nháº¥t vá»›i ngá»¯ cáº£nh cá»§a Ä‘oáº¡n vÄƒn. 
Sau Ä‘Ã³, phÃ¢n loáº¡i Táº¤T Cáº¢ cÃ¡c tá»« vá»±ng nÃ y vÃ o 5 nhÃ³m tá»« loáº¡i cÆ¡ báº£n: Danh tá»«, TÃ­nh tá»«, Äá»™ng tá»«, Tráº¡ng tá»«, LiÃªn tá»«.

QUAN TRá»ŒNG: CHá»ˆ TRáº¢ Vá»€ DUY NHáº¤T 1 Äá»I TÆ¯á»¢NG JSON (KHÃ”NG bá»c trong markdown \`\`\`json, KHÃ”NG giáº£i thÃ­ch thÃªm).
Cáº¥u trÃºc JSON báº¯t buá»™c pháº£i giá»‘ng chÃ­nh xÃ¡c nhÆ° sau:
{
  "nouns": [{"w": "tá»«", "m": "nghÄ©a", "p": "phiÃªn Ã¢m"}],
  "adjectives": [{"w": "tá»«", "m": "nghÄ©a", "p": "phiÃªn Ã¢m"}],
  "verbs": [{"w": "tá»«", "m": "nghÄ©a", "p": "phiÃªn Ã¢m"}],
  "adverbs": [{"w": "tá»«", "m": "nghÄ©a", "p": "phiÃªn Ã¢m"}],
  "conjunctions": [{"w": "tá»«", "m": "nghÄ©a", "p": "phiÃªn Ã¢m"}]
}
Náº¿u má»™t nhÃ³m khÃ´ng cÃ³ tá»« nÃ o, hÃ£y tráº£ vá» máº£ng rá»—ng [].`;

                let finalData = { nouns: [], adjectives: [], verbs: [], adverbs: [], conjunctions: [] };

                // ==========================================
                // 1. CÆ  CHáº¾ CHIA ÄOáº N VÄ‚N Báº¢N (CHUNKING)
                // ==========================================
                // Máº·c Ä‘á»‹nh khÃ´ng chia Ä‘oáº¡n (numChunks = 1), dÃ nh riÃªng cho bá»™ nÃ£o siÃªu to cá»§a Gemini.
                // Do Gemini cÃ³ context window lá»›n nÃªn cÃ³ thá»ƒ xá»­ lÃ½ nguyÃªn bÃ i dÃ i trong 1 láº§n gá»­i.
                let numChunks = 1;
                if (isGroq) {
                    // NgÆ°á»£c láº¡i, Groq cháº¡y nhanh nhÆ°ng bá»‹ giá»›i háº¡n token Ä‘áº§u vÃ o/Ä‘áº§u ra khÃ¡ gáº¯t.
                    // Náº¿u vÄƒn báº£n quÃ¡ dÃ i, ta pháº£i "bÄƒm" nhá» nÃ³ ra thÃ nh 3 hoáº·c 4 Ä‘oáº¡n Ä‘á»ƒ Groq xá»­ lÃ½ tá»« tá»«, trÃ¡nh vÄƒng lá»—i quÃ¡ táº£i token.
                    if (textInput.length > 500) numChunks = 3;
                    if (textInput.length > 3000) numChunks = 4;
                }
                
                const chunks = splitTextIntoChunks(textInput, numChunks);
                scanBtnText.innerText = `Äang phÃ¢n tÃ­ch (${chunks.length} Ä‘oáº¡n)...`;

                for (let i = 0; i < chunks.length; i++) {
                    const currentChunk = chunks[i];
                    let aiText = "";
                    let retryCount = 0;
                    let success = false;

                    // ==========================================
                    // 2. CÆ  CHáº¾ CHá»NG NGHáº¼N (RETRY) & XOAY VÃ’NG KEY
                    // ==========================================
                    // VÃ²ng láº·p nÃ y sáº½ cá»‘ gáº¯ng gá»i API tá»‘i Ä‘a 5 láº§n náº¿u gáº·p lá»—i ngháº½n máº¡ng (429) hoáº·c lá»—i há»‡ thá»‘ng.
                    while (!success && retryCount < 5) {
                        // Ká»¹ thuáº­t Load Balancing (CÃ¢n báº±ng táº£i): 
                        // Má»—i láº§n chuáº©n bá»‹ gá»i API (dÃ¹ lÃ  do báº¥m nÃºt má»›i hay do gá»i láº¡i vÃ¬ bá»‹ lá»—i ngháº½n),
                        // biáº¿n 'clickKeyIndex' sáº½ tÄƒng lÃªn 1. DÃ¹ng phÃ©p chia láº¥y dÆ° (%) Ä‘á»ƒ quay vÃ²ng chá»n 1 API Key má»›i trong danh sÃ¡ch.
                        // Äáº£m báº£o khÃ´ng cÃ³ Key nÃ o bá»‹ váº¯t kiá»‡t sá»©c, lÃ¡ch luáº­t Rate Limit hoÃ n háº£o!
                        const apiKey = keysArray[window.clickKeyIndex % keysArray.length];
                        window.clickKeyIndex++;
                        
                        try {
                            if (isGroq) {
                                const url = `https://api.groq.com/openai/v1/chat/completions`;
                                const payload = {
                                    model: selectedModel,
                                    messages: [
                                        { role: "system", content: "You are a meticulous AI that carefully extracts ALL meaningful English vocabulary (excluding basic articles/prepositions, and excluding proper nouns/names/models), translates it accurately to Vietnamese based on context, and strictly classifies it into nouns, adjectives, verbs, adverbs, and conjunctions. You must not miss any vocabulary. Strictly follow the required JSON output schema." },
                                        { role: "user", content: prompt + `\n\nÄoáº¡n vÄƒn báº£n tiáº¿ng Anh cáº§n phÃ¢n tÃ­ch:\n${currentChunk}` }
                                    ],
                                    temperature: 0.1,
                                    response_format: { type: "json_object" }
                                };
                                const response = await fetch(url, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                                    body: JSON.stringify(payload)
                                });
                                
                                if (response.status === 429) {
                                    scanBtnText.innerText = `Äang phÃ¢n tÃ­ch (${i+1}/${chunks.length}) - Ngháº½n API, chá» 3s...`;
                                    await new Promise(r => setTimeout(r, 3000));
                                    retryCount++;
                                    continue;
                                }
                                if (!response.ok) throw new Error("Lá»—i API Groq (MÃ£: " + response.status + ")");
                                
                                const data = await response.json();
                                aiText = data.choices[0].message.content;
                                success = true;
                            } else {
                                const url = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`;
                                const payload = { contents: [{ parts: [{ text: prompt }, { text: `\n\nÄoáº¡n vÄƒn báº£n tiáº¿ng Anh cáº§n phÃ¢n tÃ­ch:\n${currentChunk}` }] }] };
                                const response = await fetch(url, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify(payload)
                                });
                                
                                if (response.status === 429) {
                                    scanBtnText.innerText = `Äang phÃ¢n tÃ­ch (${i+1}/${chunks.length}) - Ngháº½n API, chá» 3s...`;
                                    await new Promise(r => setTimeout(r, 3000));
                                    retryCount++;
                                    continue;
                                }
                                if (!response.ok) throw new Error("Lá»—i API Gemini (MÃ£: " + response.status + ")");
                                
                                const data = await response.json();
                                aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
                                success = true;
                            }
                        } catch (err) {
                            if (retryCount >= 4) throw err;
                            scanBtnText.innerText = `Lá»—i káº¿t ná»‘i, thá»­ láº¡i (${retryCount+1}/5)...`;
                            await new Promise(r => setTimeout(r, 2000));
                            retryCount++;
                        }
                    }

                    const parsed = parseAIResponse(aiText);
                    mergeResults(finalData, parsed);
                }

                renderTable(finalData);

            } catch (err) {
                showError("Lá»—i: " + err.message);
                console.error(err);
            } finally {
                scanBtn.disabled = false;
                scanBtnText.innerText = "PhÃ¢n TÃ­ch Dá»¯ Liá»‡u";
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
                    // LÆ°u luÃ´n vÃ o aiDict Ä‘á»ƒ dÃ¹ng chung
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
                tbody.innerHTML = `<tr><td colspan="11" class="text-center text-slate-500 italic py-4">KhÃ´ng tÃ¬m tháº¥y tá»« vá»±ng tiáº¿ng Anh nÃ o há»£p lá»‡.</td></tr>`;
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
                    <!-- Danh tá»« -->
                    <td class="word-text cursor-pointer hover:bg-brand-50 hover:text-brand-600 transition-colors" oncontextmenu="window.handleDictRightClick(event, '${n.w.replace(/'/g, "\\'")}')">${n.w}</td>
                    <td class="meaning-text">${n.m}</td>
                    <!-- TÃ­nh tá»« -->
                    <td class="word-text cursor-pointer hover:bg-brand-50 hover:text-brand-600 transition-colors" oncontextmenu="window.handleDictRightClick(event, '${adj.w.replace(/'/g, "\\'")}')">${adj.w}</td>
                    <td class="meaning-text">${adj.m}</td>
                    <!-- Äá»™ng tá»« -->
                    <td class="word-text cursor-pointer hover:bg-brand-50 hover:text-brand-600 transition-colors" oncontextmenu="window.handleDictRightClick(event, '${v.w.replace(/'/g, "\\'")}')">${v.w}</td>
                    <td class="meaning-text">${v.m}</td>
                    <!-- Tráº¡ng tá»« -->
                    <td class="word-text cursor-pointer hover:bg-brand-50 hover:text-brand-600 transition-colors" oncontextmenu="window.handleDictRightClick(event, '${adv.w.replace(/'/g, "\\'")}')">${adv.w}</td>
                    <td class="meaning-text">${adv.m}</td>
                    <!-- LiÃªn tá»« -->
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
            text += "STT\tDanh tá»«\t\tTÃ­nh tá»«\t\tÄá»™ng tá»«\t\tTráº¡ng tá»«\t\tLiÃªn tá»«\n";
            
            // Add rows
            for (let i = 1; i < table.rows.length; i++) {
                const row = table.rows[i];
                // Bá» qua cÃ¡c dÃ²ng Ä‘ang bá»‹ áº©n do search
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
                alert("ÄÃ£ copy toÃ n bá»™ dá»¯ liá»‡u báº£ng (cÃ³ thá»ƒ dÃ¡n trá»±c tiáº¿p vÃ o Excel)!");
            }).catch(err => {
                alert("KhÃ´ng thá»ƒ copy: " + err);
            });
        }
        
        function searchTable() {
            const input = document.getElementById("tableSearchInput");
            const filter = input.value.toLowerCase();
            const tbody = document.getElementById("vocabTableBody");
            const tr = tbody.getElementsByTagName("tr");

            for (let i = 0; i < tr.length; i++) {
                const cols = tr[i].getElementsByTagName("td");
                if (cols.length <= 1) continue; // Bá» qua dÃ²ng thÃ´ng bÃ¡o trá»‘ng
                
                let match = false;
                // Duyá»‡t qua táº¥t cáº£ cÃ¡c cá»™t trá»« cá»™t STT (index 0)
                for (let j = 1; j < cols.length; j++) {
                    if (cols[j].innerText.toLowerCase().indexOf(filter) > -1) {
                        match = true;
                        break;
                    }
                }
                
                tr[i].style.display = match ? "" : "none";
            }
            
            // Há»§y bÃ´i xanh khi cÃ³ thay Ä‘á»•i bá»™ lá»c Ä‘á»ƒ trÃ¡nh lá»—i tÃ­nh toÃ¡n
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
        // STUDY MODE LOGIC (áº¨N/HIá»†N NGHÄ¨A)
        // ==========================================
        let isMeaningHidden = false;
        function toggleMeanings() {
            isMeaningHidden = !isMeaningHidden;
            const icon = document.getElementById('meaningEyeIcon');
            const btnText = document.getElementById('meaningBtnText');
            
            if (isMeaningHidden) {
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
                btnText.innerText = "Hiá»‡n NghÄ©a";
                document.body.classList.add('hide-meanings');
            } else {
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
                btnText.innerText = "áº¨n NghÄ©a";
                document.body.classList.remove('hide-meanings');
                // Há»§y cÃ¡c Ã´ Ä‘Ã£ má»Ÿ
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

                // Cháº¿ Ä‘á»™ há»c: Náº¿u báº¥m vÃ o Ã´ nghÄ©a Ä‘ang bá»‹ áº©n thÃ¬ má»Ÿ nÃ³ ra vÃ  khÃ´ng bÃ´i Ä‘en
                if (isMeaningHidden && targetCell.classList.contains('meaning-text') && !targetCell.classList.contains('meaning-revealed')) {
                    targetCell.classList.add('meaning-revealed');
                    return; // Ngá»«ng viá»‡c bÃ´i Ä‘en
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
                    // XÃ³a toÃ n bá»™ vÃ¹ng chá»n hiá»‡n táº¡i vÃ  cÃ¡c Ã´ Ä‘Ã£ copy khi áº¥n ESC
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
        // CHáº¾ Äá»˜ TRA Tá»ª (CLICK CHUá»˜T PHáº¢I)
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

                showTooltip(x, y, word, '', '<i class="fa-solid fa-spinner fa-spin"></i> Äang táº£i...', '');
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
                        console.error('Lá»—i Google Translate API:', e);
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
                            console.error('Lá»—i Dictionary API:', e);
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
                    showTooltip(x, y, word, result.phonetic, result.meaning || 'KhÃ´ng tÃ¬m tháº¥y nghÄ©a');
                }).catch(err => {
                    console.error('Lá»—i getPhoneticAndMeaning:', err);
                    showTooltip(x, y, word, '', 'KhÃ´ng tÃ¬m tháº¥y nghÄ©a', '');
                });
            } catch(e) {
                console.error('Lá»—i handleWordRightClick:', e);
            }
        };

        function toggleDictMode() {
            const textarea = document.getElementById('textInput');
            const dictContent = document.getElementById('dictContent');
            const btnText = document.getElementById('toggleDictText');
            
            if (isDictMode) {
                // Táº¯t
                isDictMode = false;
                textarea.classList.remove('hidden');
                dictContent.classList.add('hidden');
                btnText.innerText = 'Báº­t cháº¿ Ä‘á»™ Tra tá»«';
                document.getElementById('aiDictBtn').classList.add('hidden');
                document.getElementById('aiDictBtn').classList.remove('flex');
            } else {
                // Báº­t
                const rawText = textarea.value.trim();
                if (!rawText) return alert("Vui lÃ²ng nháº­p vÄƒn báº£n trÆ°á»›c!");
                
                isDictMode = true;
                textarea.classList.add('hidden');
                dictContent.classList.remove('hidden');
                btnText.innerText = 'Táº¯t cháº¿ Ä‘á»™ Tra tá»«';
                document.getElementById('aiDictBtn').classList.remove('hidden');
                document.getElementById('aiDictBtn').classList.add('flex');
                
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
            
            document.getElementById('ttMeaning').innerHTML = meaning || 'KhÃ´ng tÃ¬m tháº¥y nghÄ©a';
            
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
                        span.innerText = token;
                        span.className = 'transition-colors duration-200';
                        span.setAttribute('data-start', start);
                        span.setAttribute('data-end', end);
                        container.appendChild(span);
                    }
                } else if (/^[\w'-]+$/.test(token)) {
                    const span = document.createElement('span');
                    span.innerText = token;
                    span.className = 'cursor-pointer hover:bg-brand-100 hover:text-brand-600 rounded transition-colors duration-200';
                    span.setAttribute('data-start', start);
                    span.setAttribute('data-end', end);
                    
                    span.addEventListener('dblclick', (e) => {
                        e.preventDefault();
                        window.getSelection().removeAllRanges();
                        
                        // Dá»«ng náº¿u Ä‘ang Ä‘á»c
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
                    span.innerText = token;
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

        document.addEventListener('click', () => hideDictTooltip());
        window.addEventListener('scroll', () => hideDictTooltip());

        // ==========================================
        // TÃNH NÄ‚NG Äá»ŒC VÄ‚N Báº¢N TÃCH Há»¢P
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
                window.getSelection().removeAllRanges(); // bá» bÃ´i Ä‘en
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
                alert("Vui lÃ²ng nháº­p vÄƒn báº£n Ä‘á»ƒ Ä‘á»c!");
                return;
            }

            if (typeof playSpeechChunked !== 'function') {
                alert("KhÃ´ng tÃ¬m tháº¥y bá»™ Ä‘á»c (main.js). Vui lÃ²ng táº£i láº¡i trang.");
                return;
            }

            isReadingPga = true;
            isPausedPga = false;
            document.getElementById('readPgaBtn').classList.add('hidden');
            document.getElementById('pausePgaBtn').classList.remove('hidden');
            document.getElementById('pausePgaBtn').innerHTML = `<i class="fa-solid fa-pause"></i> <span>Táº¡m dá»«ng</span>`;
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
            spans.forEach(span => span.classList.remove('bg-yellow-300', 'text-slate-900', 'rounded-l-md', 'rounded-r-md'));
        }

        function pausePgaText() {
            const btn = document.getElementById('pausePgaBtn');
            if (isPausedPga) {
                // Resume
                if (typeof resumeChunkedTTS === 'function') resumeChunkedTTS();
                isPausedPga = false;
                btn.innerHTML = `<i class="fa-solid fa-pause"></i> <span>Táº¡m dá»«ng</span>`;
            } else {
                // Pause
                if (typeof pauseChunkedTTS === 'function') pauseChunkedTTS();
                isPausedPga = true;
                btn.innerHTML = `<i class="fa-solid fa-play"></i> <span>Tiáº¿p tá»¥c</span>`;
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
            if (!rawText) return alert("Vui lÃ²ng nháº­p vÄƒn báº£n!");
            
            const btn = document.getElementById('aiDictBtn');
            const textSpan = document.getElementById('aiDictBtnText');
            
            btn.classList.add('opacity-70', 'cursor-not-allowed', 'animate-pulse');
            btn.disabled = true;
            textSpan.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Äang phÃ¢n tÃ­ch...';
            
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
                if (!res) throw new Error("API Tráº£ vá» rá»—ng");
                
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
                    
                    if (annotatedText === rawText) {
                        alert("AI không đánh dấu gì cả! Nó trả về y hệt ban đầu:\n" + annotatedText.substring(0, 50));
                    }
                    
                    // Cập nhật lại UI text area
                    document.getElementById('textInput').value = annotatedText;
                    if (typeof isDictMode !== 'undefined' && isDictMode) {
                        renderDictContent(annotatedText);
                    }
                } else {
                    alert("AI trả về JSON nhưng thiếu trường annotatedText hoặc dict! JSON: " + jsonStr.substring(0, 100));
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
                
                textSpan.innerHTML = '<i class="fa-solid fa-check mr-2"></i> ÄÃ£ dá»‹ch xong';
                setTimeout(() => {
                    textSpan.innerText = 'Dá»‹ch toÃ n bá»™ báº±ng AI';
                }, 3000);
            } catch (e) {
                console.error(e);
                alert("Lá»—i khi xá»­ lÃ½ AI: " + e.message);
                textSpan.innerText = 'Dá»‹ch toÃ n bá»™ báº±ng AI';
            } finally {
                btn.classList.remove('opacity-70', 'cursor-not-allowed', 'animate-pulse');
                btn.disabled = false;
            }
        }


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
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`;
            
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
            writingContent.innerHTML = `<div class="text-red-500 p-4 border border-red-300 bg-red-50 rounded-xl"><strong>Lỗi:</strong> ${error.message}. Thử lại sau nhé.</div>`;
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
    
    let html = `<div class="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
        <h4 class="text-lg font-bold text-slate-700"><i class="fa-solid fa-pen-nib text-emerald-500 mr-2"></i>Luyện Viết Từng Câu</h4>
        <button onclick="toggleAllPgaWriting(event)" class="text-slate-400 hover:text-brand-400 transition-colors" title="Bật/Tắt chế độ luyện viết (tất cả)">
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
            
            <div id="pgaWriteContainer_${idx}" data-vi="${escapeHTML(item.vi)}" class="hidden mt-4 p-4 bg-slate-900/90 rounded-xl w-full">
                <div class="relative">
                    <textarea id="pgaWriteInput_${idx}" class="w-full bg-slate-800 text-white p-3 pr-12 rounded-lg border border-slate-600 focus:border-brand-500 outline-none text-sm leading-relaxed placeholder-slate-500 resize-y" rows="2" placeholder="Dịch câu trên sang tiếng Anh..."></textarea>
                    <button id="pgaDictateBtn_${idx}" onclick="startPgaDictation(${idx})" class="absolute right-3 bottom-3 text-slate-400 hover:text-brand-400 transition-colors" title="Đọc bằng giọng nói">
                        <i class="fa-solid fa-microphone"></i>
                    </button>
                </div>
                
                <div class="flex justify-between items-center mt-3">
                    <span class="text-xs text-slate-400 italic"><i class="fa-solid fa-circle-info mr-1"></i>Đúng ngữ pháp, đúng ý là được.</span>
                    <button onclick="submitPgaGrammarWriting(${idx})" class="bg-brand-600 hover:bg-brand-500 text-white text-xs px-4 py-2 rounded-lg font-bold transition-all shadow-md flex items-center gap-1 active:scale-95" id="pgaWriteSubmitBtn_${idx}">
                        Gửi đánh giá <i class="fa-solid fa-paper-plane"></i>
                    </button>
                </div>
                <div id="pgaWriteFeedback_${idx}" class="hidden mt-4 p-4 text-sm rounded-lg bg-slate-950/80 border border-slate-700 leading-relaxed text-white"></div>
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
    
    const systemPrompt = `Đóng vai một giáo viên tiếng Anh chấm bài.
Học sinh cần viết lại một câu tiếng Anh dựa trên ý nghĩa tiếng Việt được cung cấp.
- Đánh giá xem câu của học sinh viết có ĐÚNG NGỮ PHÁP và ĐÚNG Ý NGHĨA hay không.
- Học sinh KHÔNG CẦN viết chính xác từng chữ giống câu gốc, miễn là diễn đạt đúng ý và chuẩn ngữ pháp.
- Nếu học sinh viết sai (ngữ pháp, từ vựng, hoặc sai nghĩa), hãy chỉ ra lỗi sai và giải thích ngắn gọn bằng TIẾNG VIỆT. Đưa ra một vài gợi ý sửa lại cho đúng.
- Nếu học sinh viết đúng, hãy dành một lời khen ngắn gọn.
TRẢ VỀ ĐỊNH DẠNG HTML ĐƠN GIẢN (dùng thẻ <b>, <i>, <span class="text-emerald-400 font-bold"> cho chữ đúng, <span class="text-rose-400 font-bold"> cho chữ sai). KHÔNG dùng markdown block.`;

    const userPrompt = `Câu tiếng Việt gốc cần truyền đạt: "${viTranslation}"
Câu học sinh viết: "${userSentence}"
Hãy chấm điểm và nhận xét.`;

    try {
        const selectedModel = document.getElementById('aiModelSelect').value || "gemini-2.5-flash";
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`;
        
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
        feedbackHtml = feedbackHtml.replace(/```html\n?/g, '').replace(/```/g, '');
        
        feedbackEl.innerHTML = `<div class="border-l-4 border-brand-500 pl-3 py-1">${feedbackHtml}</div>`;
    } catch (err) {
        feedbackEl.innerHTML = `<div class="text-red-400"><i class="fa-solid fa-triangle-exclamation mr-1"></i> Lỗi: ${err.message}</div>`;
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Gửi đánh giá <i class="fa-solid fa-paper-plane ml-1"></i>';
        submitBtn.classList.remove('opacity-70');
    }
};
