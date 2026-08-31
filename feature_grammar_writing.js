const fs = require('fs');
let mainJs = fs.readFileSync('d:/GIT/FlashcardPGA/main.js', 'utf8');

// The goal is to inject the writing practice logic right before grammarContent.innerHTML = '';
const targetLine = "                        grammarContent.innerHTML = '';";

const injectionCode = `
                        // --- NEW: INJECT WRITING PRACTICE UI ---
                        const enSentences = tempDiv.querySelectorAll('b.text-indigo-500, b.text-indigo-400');
                        enSentences.forEach((bTag, idx) => {
                            const parentDiv = bTag.closest('div.mb-2');
                            if (!parentDiv) return;
                            
                            let viTranslation = '';
                            let nextDiv = parentDiv.nextElementSibling;
                            while (nextDiv && nextDiv.classList.contains('mb-2')) {
                                if (nextDiv.textContent.includes('Dịch nghĩa câu:')) {
                                    viTranslation = nextDiv.textContent.replace('Dịch nghĩa câu:', '').trim();
                                    break;
                                }
                                nextDiv = nextDiv.nextElementSibling;
                            }
                            
                            bTag.id = \`grammarEnSentence_\${idx}\`;
                            
                            const eyeBtn = document.createElement('button');
                            eyeBtn.className = "ml-2 text-slate-400 hover:text-brand-400 transition-colors";
                            eyeBtn.title = "Luyện viết câu này";
                            eyeBtn.onclick = function(e) {
                                e.stopPropagation();
                                toggleGrammarWriting(idx);
                            };
                            eyeBtn.innerHTML = \`<i class="fa-solid fa-eye" id="grammarEyeIcon_\${idx}"></i>\`;
                            
                            // Insert eye button right after the "Câu Tiếng Anh:" label
                            const labelB = parentDiv.querySelector('b');
                            if (labelB) {
                                labelB.insertAdjacentElement('afterend', eyeBtn);
                            }
                            
                            const writingHTML = \`
                                <div id="grammarWriteContainer_\${idx}" data-vi="\${escapeHTML(viTranslation)}" class="hidden mt-3 p-4 bg-slate-900/80 rounded-xl border border-slate-700 shadow-inner">
                                    <textarea id="grammarWriteInput_\${idx}" class="w-full bg-slate-800 text-white p-3 rounded-lg border border-slate-600 focus:border-brand-500 outline-none text-sm leading-relaxed placeholder-slate-500 resize-y" rows="2" placeholder="Viết lại câu theo cách của bạn (cùng ý nghĩa)..."></textarea>
                                    <div class="flex justify-between items-center mt-3">
                                        <span class="text-xs text-slate-400 italic"><i class="fa-solid fa-circle-info mr-1"></i>Đúng ngữ pháp, đúng ý là được.</span>
                                        <button onclick="submitGrammarWriting(\${idx})" class="bg-brand-600 hover:bg-brand-500 text-white text-xs px-4 py-2 rounded-lg font-bold transition-all shadow-md" id="grammarWriteSubmitBtn_\${idx}">
                                            Gửi đánh giá <i class="fa-solid fa-paper-plane ml-1"></i>
                                        </button>
                                    </div>
                                    <div id="grammarWriteFeedback_\${idx}" class="hidden mt-4 p-4 text-sm rounded-lg bg-slate-950/80 border border-slate-700 leading-relaxed"></div>
                                </div>
                            \`;
                            parentDiv.insertAdjacentHTML('afterend', writingHTML);
                        });
                        // ---------------------------------------
`;

if (!mainJs.includes('toggleGrammarWriting')) {
    mainJs = mainJs.replace(targetLine, injectionCode + '\n' + targetLine);
    
    const globalFunctions = `
window.toggleGrammarWriting = function(idx) {
    const enSentence = document.getElementById(\`grammarEnSentence_\${idx}\`);
    const container = document.getElementById(\`grammarWriteContainer_\${idx}\`);
    const icon = document.getElementById(\`grammarEyeIcon_\${idx}\`);
    
    if (container.classList.contains('hidden')) {
        container.classList.remove('hidden');
        enSentence.classList.add('hidden');
        icon.classList.replace('fa-eye', 'fa-eye-slash');
        icon.classList.add('text-brand-400');
    } else {
        container.classList.add('hidden');
        enSentence.classList.remove('hidden');
        icon.classList.replace('fa-eye-slash', 'fa-eye');
        icon.classList.remove('text-brand-400');
    }
}

window.submitGrammarWriting = async function(idx) {
    const container = document.getElementById(\`grammarWriteContainer_\${idx}\`);
    const viTranslation = container.getAttribute('data-vi');
    const inputEl = document.getElementById(\`grammarWriteInput_\${idx}\`);
    const userSentence = inputEl.value.trim();
    const btn = document.getElementById(\`grammarWriteSubmitBtn_\${idx}\`);
    const feedbackEl = document.getElementById(\`grammarWriteFeedback_\${idx}\`);
    
    if (!userSentence) {
        alert("Vui lòng nhập câu của bạn!");
        return;
    }
    
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang chấm điểm...';
    feedbackEl.classList.add('hidden');
    
    const systemPrompt = \`Bạn là giáo viên tiếng Anh chấm bài. 
Nhiệm vụ của bạn là đánh giá xem câu tiếng Anh của học sinh viết CÓ ĐÚNG NGỮ PHÁP và CÓ ĐÚNG Ý NGHĨA với câu tiếng Việt gốc hay không.
Học sinh KHÔNG CẦN viết chính xác từng chữ giống câu mẫu ban đầu, miễn là diễn đạt đúng ý.
- Nếu học sinh viết sai (ngữ pháp, từ vựng, hoặc sai nghĩa), hãy chỉ ra lỗi sai và giải thích ngắn gọn bằng TIẾNG VIỆT. Đưa ra một vài gợi ý sửa lại cho đúng.
- Nếu học sinh viết đúng, hãy dành một lời khen ngắn gọn.
TRẢ VỀ ĐỊNH DẠNG HTML ĐƠN GIẢN (dùng thẻ <b>, <i>, <span class="text-emerald-400 font-bold"> cho chữ đúng, <span class="text-rose-400 font-bold"> cho chữ sai). KHÔNG dùng markdown block (như \`\`\`html).\`;

    const userPrompt = \`Câu tiếng Việt gốc cần truyền đạt: "\${viTranslation}"
Câu học sinh viết: "\${userSentence}"

Hãy đánh giá bằng tiếng Việt và định dạng HTML.\`;

    try {
        const responseText = await callGeminiAPIText(systemPrompt, userPrompt);
        feedbackEl.innerHTML = responseText.replace(/\`\`\`html/g, '').replace(/\`\`\`/g, '');
        feedbackEl.classList.remove('hidden');
    } catch (error) {
        feedbackEl.innerHTML = \`<span class="text-red-500">Lỗi kết nối AI: \${error.message}</span>\`;
        feedbackEl.classList.remove('hidden');
    } finally {
        btn.disabled = false;
        btn.innerHTML = 'Gửi đánh giá <i class="fa-solid fa-paper-plane ml-1"></i>';
    }
}
`;
    // append global functions
    mainJs += '\n' + globalFunctions;
    fs.writeFileSync('d:/GIT/FlashcardPGA/main.js', mainJs, 'utf8');
    console.log("Success");
} else {
    console.log("Already injected");
}
