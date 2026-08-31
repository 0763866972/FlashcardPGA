const fs = require('fs');

const injectionCode = `
                        // --- NEW: INJECT WRITING PRACTICE UI ---
                        const enSentences = Array.from(tempDiv.querySelectorAll('b, strong, span, font')).filter(el => 
                            el.classList.contains('text-indigo-500') || 
                            el.classList.contains('text-indigo-400') || 
                            (el.className && typeof el.className === 'string' && el.className.includes('indigo')) ||
                            (el.getAttribute('style') && el.getAttribute('style').includes('color'))
                        );
                        
                        enSentences.forEach((bTag, idx) => {
                            let parentDiv = bTag.parentElement;
                            if (!parentDiv || parentDiv.tagName === 'BODY' || parentDiv === tempDiv) {
                                // If no suitable parent, wrap it
                                const wrapper = document.createElement('div');
                                wrapper.className = "mb-2 block w-full";
                                bTag.parentNode.insertBefore(wrapper, bTag);
                                wrapper.appendChild(bTag);
                                parentDiv = wrapper;
                            }
                            
                            // Make parent block for sure
                            parentDiv.classList.add('block', 'w-full');
                            
                            let viTranslation = '';
                            
                            // Look for Vietnamese translation in next siblings
                            let current = parentDiv;
                            while(current && current.nextElementSibling) {
                                current = current.nextElementSibling;
                                if (current.textContent.includes('Dịch nghĩa') || current.textContent.includes('Dịch')) {
                                    viTranslation = current.textContent.replace(/.*Dịch nghĩa[^\:]*\:/g, '').trim();
                                    break;
                                }
                            }
                            // Fallback scan
                            if (!viTranslation) {
                                const allNodes = Array.from(tempDiv.querySelectorAll('*'));
                                for (let n of allNodes) {
                                    if (n.compareDocumentPosition(bTag) & Node.DOCUMENT_POSITION_PRECEDING) {
                                        if (n.textContent.includes('Dịch nghĩa') || n.textContent.includes('Dịch')) {
                                            viTranslation = n.textContent.replace(/.*Dịch nghĩa[^\:]*\:/g, '').trim();
                                            break;
                                        }
                                    }
                                }
                            }
                            
                            bTag.id = \`grammarEnSentence_\${idx}\`;
                            
                            const eyeBtn = document.createElement('button');
                            eyeBtn.className = "ml-2 text-slate-400 hover:text-brand-400 transition-colors inline-block align-middle";
                            eyeBtn.title = "Luyện viết câu này";
                            eyeBtn.onclick = function(e) {
                                e.stopPropagation();
                                toggleGrammarWriting(idx);
                            };
                            eyeBtn.innerHTML = \`<i class="fa-solid fa-eye" id="grammarEyeIcon_\${idx}"></i>\`;
                            
                            bTag.insertAdjacentElement('beforebegin', eyeBtn);
                            eyeBtn.insertAdjacentHTML('afterend', '&nbsp;');
                            
                            const writingHTML = \`
                                <div id="grammarWriteContainer_\${idx}" data-vi="\${escapeHTML(viTranslation)}" class="hidden mt-3 p-4 bg-slate-900/80 rounded-xl border border-slate-700 shadow-inner w-full block clear-both">
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
                        // ---------------------------------------`;

let mainJs = fs.readFileSync('d:/GIT/FlashcardPGA/main.js', 'utf8');

const startTag = '// --- NEW: INJECT WRITING PRACTICE UI ---';
const endTag = '// ---------------------------------------';

const startIndex = mainJs.indexOf(startTag);
const endIndex = mainJs.indexOf(endTag) + endTag.length;

if (startIndex !== -1 && endIndex !== -1) {
    mainJs = mainJs.substring(0, startIndex) + injectionCode + mainJs.substring(endIndex);
    fs.writeFileSync('d:/GIT/FlashcardPGA/main.js', mainJs, 'utf8');
    console.log("Success replacing injection code");
} else {
    console.log("Could not find start or end tags!");
}
