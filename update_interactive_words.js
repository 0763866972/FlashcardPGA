const fs = require('fs');
let content = fs.readFileSync('pga.html', 'utf8');

// 1. Update the system prompt to add specific classes
content = content.replace(/class="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 font-medium"/g, 'class="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 font-medium ai-corrected-text"');
content = content.replace(/class="p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-800 italic"/g, 'class="p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-800 italic ai-original-text"');

// 2. Add the injection logic right after feedbackEl.innerHTML = ...
const injectTarget = 'feedbackEl.innerHTML = `<div class="border-l-4 border-brand-500 pl-3 py-1">${feedbackHtml}</div>`;';
const injectLogic = `feedbackEl.innerHTML = \`<div class="border-l-4 border-brand-500 pl-3 py-1">\${feedbackHtml}</div>\`;
        
        // Bắt đầu xử lý cho phép click từ vựng
        setTimeout(() => {
            const targetNodes = feedbackEl.querySelectorAll('.ai-corrected-text, .ai-original-text, .ai-user-text');
            // If they don't have the classes for some reason, fallback to query by bg colors
            const allTargets = targetNodes.length > 0 ? targetNodes : feedbackEl.querySelectorAll('div.bg-emerald-50, div.bg-indigo-50, div.bg-slate-800\\\\/80, div.bg-slate-100');
            
            allTargets.forEach(node => {
                const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null, false);
                const textNodes = [];
                let n;
                while(n = walker.nextNode()) textNodes.push(n);
                
                textNodes.forEach(textNode => {
                    const text = textNode.nodeValue;
                    if (!text.trim() || !/[a-zA-Z]/.test(text)) return; // Bỏ qua nếu chỉ là dấu cách hoặc không có tiếng Anh
                    
                    const tokens = text.match(/[\\w'-]+|[^\\w\\s]+|\\s+/g) || [];
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
        }, 100);`;

if(content.includes(injectTarget)) {
    content = content.replace(injectTarget, injectLogic);
    
    // Let's also update the User Text box in system prompt to have ai-user-text class
    content = content.replace(/class="p-3 bg-slate-100 border border-slate-200 rounded-lg text-lg"/g, 'class="p-3 bg-slate-100 border border-slate-200 rounded-lg text-lg ai-user-text"');
    
    fs.writeFileSync('pga.html', content);
    console.log("Interactive words logic injected successfully!");
} else {
    console.log("Could not find the target to inject logic.");
}
