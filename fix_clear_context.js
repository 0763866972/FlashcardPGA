const fs = require('fs');

let mainContent = fs.readFileSync('main.js', 'utf8');

// Replace in getContextCacheSuffix
mainContent = mainContent.replace(
    /let ctx = localStorage\.getItem\('toeic_ai_context_' \+ groupId\) \|\| localStorage\.getItem\('toeic_ai_context'\) \|\| '';/,
    `let ctx = localStorage.getItem('toeic_ai_context_' + groupId); if(ctx === null) ctx = localStorage.getItem('toeic_ai_context') || '';`
);

// Replace the other 3 occurrences (fcAiContext and currentCtx)
const regex = /let (fcAiContext|currentCtx) = localStorage\.getItem\('toeic_ai_context_' \+ \(typeof activeVocabGroupId !== 'undefined' \? activeVocabGroupId : 'default'\)\) \|\| localStorage\.getItem\('toeic_ai_context'\) \|\| '';/g;

mainContent = mainContent.replace(regex, (match, p1) => {
    return `let groupId = typeof activeVocabGroupId !== 'undefined' ? activeVocabGroupId : 'default';\n        let ${p1} = localStorage.getItem('toeic_ai_context_' + groupId);\n        if (${p1} === null) ${p1} = localStorage.getItem('toeic_ai_context') || '';`;
});

fs.writeFileSync('main.js', mainContent);
console.log("Fixed AI context clearing bug!");
