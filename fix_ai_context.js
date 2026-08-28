const fs = require('fs');
let content = fs.readFileSync('main.js', 'utf8');

// Replace getContextCacheSuffix
content = content.replace(
    /function getContextCacheSuffix\(\) \{\r?\n    let ctx = localStorage\.getItem\('toeic_ai_context'\) \|\| '';/,
    "function getContextCacheSuffix() {\n    let groupId = typeof activeVocabGroupId !== 'undefined' ? activeVocabGroupId : 'default';\n    let ctx = localStorage.getItem('toeic_ai_context_' + groupId) || localStorage.getItem('toeic_ai_context') || '';"
);

// Replace fcAiContext 1
content = content.replace(
    /let fcAiContext = localStorage\.getItem\('toeic_ai_context'\) \|\| '';/g,
    "let fcAiContext = localStorage.getItem('toeic_ai_context_' + (typeof activeVocabGroupId !== 'undefined' ? activeVocabGroupId : 'default')) || localStorage.getItem('toeic_ai_context') || '';"
);

// Replace AI toggles in dictation / quizzes
content = content.replace(
    /localStorage\.getItem\('toeic_ai_fam_toggle'\)/g,
    "(localStorage.getItem('toeic_ai_fam_toggle_' + (typeof activeVocabGroupId !== 'undefined' ? activeVocabGroupId : 'default')) || localStorage.getItem('toeic_ai_fam_toggle'))"
);
content = content.replace(
    /localStorage\.getItem\('toeic_ai_syn_toggle'\)/g,
    "(localStorage.getItem('toeic_ai_syn_toggle_' + (typeof activeVocabGroupId !== 'undefined' ? activeVocabGroupId : 'default')) || localStorage.getItem('toeic_ai_syn_toggle'))"
);
content = content.replace(
    /localStorage\.getItem\('toeic_ai_hom_toggle'\)/g,
    "(localStorage.getItem('toeic_ai_hom_toggle_' + (typeof activeVocabGroupId !== 'undefined' ? activeVocabGroupId : 'default')) || localStorage.getItem('toeic_ai_hom_toggle'))"
);

// handleAiToggle replacements
content = content.replace(
    /let currentCtx = localStorage\.getItem\('toeic_ai_context'\) \|\| '';/g,
    "let currentCtx = localStorage.getItem('toeic_ai_context_' + (typeof activeVocabGroupId !== 'undefined' ? activeVocabGroupId : 'default')) || localStorage.getItem('toeic_ai_context') || '';"
);

content = content.replace(
    /localStorage\.setItem\('toeic_ai_context', result\.trim\(\)\);/g,
    "localStorage.setItem('toeic_ai_context_' + (typeof activeVocabGroupId !== 'undefined' ? activeVocabGroupId : 'default'), result.trim());"
);

content = content.replace(
    /localStorage\.setItem\('toeic_ai_context', ctx\);/g,
    "localStorage.setItem('toeic_ai_context_' + (typeof activeVocabGroupId !== 'undefined' ? activeVocabGroupId : 'default'), ctx);"
);

content = content.replace(
    /localStorage\.setItem\('toeic_ai_fam_toggle', aiFamToggle\.checked\);/g,
    "localStorage.setItem('toeic_ai_fam_toggle_' + (typeof activeVocabGroupId !== 'undefined' ? activeVocabGroupId : 'default'), aiFamToggle.checked);"
);
content = content.replace(
    /localStorage\.setItem\('toeic_ai_syn_toggle', aiSynToggle\.checked\);/g,
    "localStorage.setItem('toeic_ai_syn_toggle_' + (typeof activeVocabGroupId !== 'undefined' ? activeVocabGroupId : 'default'), aiSynToggle.checked);"
);
content = content.replace(
    /localStorage\.setItem\('toeic_ai_hom_toggle', aiHomToggle\.checked\);/g,
    "localStorage.setItem('toeic_ai_hom_toggle_' + (typeof activeVocabGroupId !== 'undefined' ? activeVocabGroupId : 'default'), aiHomToggle.checked);"
);

fs.writeFileSync('main.js', content, 'utf8');
console.log('Script executed.');
