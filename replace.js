const fs = require('fs');
let content = fs.readFileSync('main.js', 'utf8');

content = content.replace(
    /if \(checkbox\.id === 'aiHomToggle'\) localStorage\.setItem\('toeic_ai_hom_toggle', checkbox\.checked\);/,
    "if (checkbox.id === 'aiHomToggle') localStorage.setItem('toeic_ai_hom_toggle', checkbox.checked);\n    if (checkbox.id === 'aiGrammarToggle') localStorage.setItem('toeic_ai_grammar_toggle', checkbox.checked);"
);

content = content.replace(
    /const aiHomToggle = document\.getElementById\('aiHomToggle'\);/g,
    "const aiHomToggle = document.getElementById('aiHomToggle');\n            const aiGrammarToggle = document.getElementById('aiGrammarToggle');"
);

content = content.replace(
    /if \(aiHomToggle\) \{\n *aiHomToggle\.checked = [^;]+;\n *window\.handleAiOptionToggle\(aiHomToggle, 'trackHom', 'thumbHom'\);\n *\}/,
    "$&" + 
            if (aiGrammarToggle) {
                aiGrammarToggle.checked = (localStorage.getItem('toeic_ai_grammar_toggle_' + (typeof activeVocabGroupId !== 'undefined' ? activeVocabGroupId : 'default')) || localStorage.getItem('toeic_ai_grammar_toggle')) !== 'false';
                window.handleAiOptionToggle(aiGrammarToggle, 'trackGrammar', 'thumbGrammar');
            }
);

content = content.replace(
    /if \(aiHomToggle\) localStorage\.setItem\('toeic_ai_hom_toggle_'.*?, aiHomToggle\.checked\);/,
    "$&" + 
            if (aiGrammarToggle) localStorage.setItem('toeic_ai_grammar_toggle_' + (typeof activeVocabGroupId !== 'undefined' ? activeVocabGroupId : 'default'), aiGrammarToggle.checked);
);

fs.writeFileSync('main.js', content, 'utf8');
