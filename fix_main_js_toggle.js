const fs = require('fs');
let content = fs.readFileSync('main.js', 'utf8');

// 1. Add toggleAllGrammarWriting and update toggleGrammarWriting
const newToggleLogic = `window.toggleAllGrammarWriting = function(e) {
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

window.toggleGrammarWriting = function(idx) {
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
};`;

// Find where window.toggleGrammarWriting is defined and replace it entirely
const regexToggle = /window\.toggleGrammarWriting = function\(idx\) \{[\s\S]*?(?=window\.startDictation = function)/;
content = content.replace(regexToggle, newToggleLogic + '\n\n');

// 2. Add the reset logic for the "All" button when switching flashcards
const resetCode = `                    // Reset 'All' button state
                    const eyeIconAll = document.getElementById('grammarEyeIconAll');
                    if (eyeIconAll) {
                        eyeIconAll.classList.replace('fa-eye-slash', 'fa-eye');
                        eyeIconAll.classList.remove('text-brand-400');
                    }
                    
                    grammarContainer.classList.remove('hidden');`;

// Be very careful about matching this. It's inside displayFlashcard or similar update logic
content = content.replace(/grammarContainer\.classList\.remove\('hidden'\);(?![\s\S]*grammarContainer\.classList\.remove\('hidden'\);)/, resetCode);


fs.writeFileSync('main.js', content, 'utf8');
console.log("Successfully updated main.js with robust toggle logic.");
