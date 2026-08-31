const fs = require('fs');
const { execSync } = require('child_process');

console.log("Restoring main.js...");
execSync('git checkout main.js', { stdio: 'inherit' });

console.log("Running feature_grammar_writing.js...");
execSync('node feature_grammar_writing.js', { stdio: 'inherit' });

console.log("Running fix_grammar_injection.js...");
execSync('node fix_grammar_injection.js', { stdio: 'inherit' });

console.log("Running fix_translation_logic.js...");
execSync('node fix_translation_logic.js', { stdio: 'inherit' });

// We won't run fix_main_js_toggle.js because it fails to find the regex since startDictation is gone.
// We will just manually append the correct toggle functions to the end of main.js.

console.log("Applying final fixes to main.js...");
let mainJs = fs.readFileSync('main.js', 'utf8');

// 1. Fix the bad regex syntax error first!
mainJs = mainJs.replace(/const match = textAfter\.match\(\/D.*?i\);/s, 'const match = textAfter.match(/Dịch[^:]*:\\s*(.*?)(?=\\n|•|(?:\\s*-\\s)|(?:\\s*Cụm\\s*")|$)/is);');

// 2. Fix the unescaped backticks in template literal!
mainJs = mainJs.replace('KHÔNG dùng markdown block (như ```html).`;', 'KHÔNG dùng markdown block (như \\`\\`\\`html).`;');

// 3. Add the reset logic for the eye icon in displayFlashcard
const resetCode = `                    // Reset 'All' button state
                    const eyeIconAll = document.getElementById('grammarEyeIconAll');
                    if (eyeIconAll) {
                        eyeIconAll.classList.replace('fa-eye-slash', 'fa-eye');
                        eyeIconAll.classList.remove('text-brand-400');
                    }
                    
                    grammarContainer.classList.remove('hidden');`;
mainJs = mainJs.replace(/grammarContainer\.classList\.remove\('hidden'\);(?![\s\S]*grammarContainer\.classList\.remove\('hidden'\);)/, resetCode);

// 4. Find and replace window.toggleGrammarWriting and add window.toggleAllGrammarWriting
const toggleLogic = `window.toggleGrammarWriting = function(idx) {
    const enSentence = document.getElementById(\`grammarEnSentence_\${idx}\`);
    const container = document.getElementById(\`grammarWriteContainer_\${idx}\`);
    const icon = document.getElementById(\`grammarEyeIcon_\${idx}\`);
    
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

window.toggleAllGrammarWriting = function(e) {
    if (e) e.stopPropagation();
    
    const eyeIconAll = document.getElementById('grammarEyeIconAll');
    if (!eyeIconAll) return;
    let isOpening = eyeIconAll.classList.contains('fa-eye');
    
    const containers = document.querySelectorAll('[id^="grammarWriteContainer_"]');
    
    containers.forEach((container) => {
        const idx = container.id.split('_')[1];
        const eyeIcon = document.getElementById(\`grammarEyeIcon_\${idx}\`);
        const enSentence = document.getElementById(\`grammarEnSentence_\${idx}\`);
        
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
`;

const oldToggleRegex = /window\.toggleGrammarWriting = function\(idx\) \{[\s\S]*?\n\};/s;
if (oldToggleRegex.test(mainJs)) {
    mainJs = mainJs.replace(oldToggleRegex, toggleLogic);
} else {
    mainJs += '\n\n' + toggleLogic;
}

// 5. Add startDictation (which was lost earlier)
const dictationCode = `
window.startDictation = function(idx) {
    const input = document.getElementById(\`grammarWriteInput_\${idx}\`);
    const btn = document.getElementById(\`grammarDictateBtn_\${idx}\`);
    if (!input || !btn) return;
    
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert("Trình duyệt của bạn không hỗ trợ tính năng nhận diện giọng nói. Vui lòng sử dụng Google Chrome.");
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
        btn.classList.add('text-red-400', 'bg-red-500/20');
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
`;
if (!mainJs.includes('window.startDictation')) {
    mainJs += dictationCode;
}

fs.writeFileSync('main.js', mainJs, 'utf8');
console.log("Done updating main.js!");
