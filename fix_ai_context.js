const fs = require('fs');

let content = fs.readFileSync('main.js', 'utf8');

// The two patterns to replace:
const pattern1 = "localStorage.getItem('toeic_ai_context_' + groupId) || localStorage.getItem('toeic_ai_context') || ''";
const replace1 = "(localStorage.getItem('toeic_ai_context_' + groupId) ?? localStorage.getItem('toeic_ai_context') ?? '')";

const pattern2 = "localStorage.getItem('toeic_ai_context_' + (typeof activeVocabGroupId !== 'undefined' ? activeVocabGroupId : 'default')) || localStorage.getItem('toeic_ai_context') || ''";
const replace2 = "(localStorage.getItem('toeic_ai_context_' + (typeof activeVocabGroupId !== 'undefined' ? activeVocabGroupId : 'default')) ?? localStorage.getItem('toeic_ai_context') ?? '')";

const pattern3 = "localStorage.getItem('toeic_ai_context_' + (typeof activeVocabGroupId !== 'undefined' ? \nactiveVocabGroupId : 'default')) || localStorage.getItem('toeic_ai_context') || ''";

// We'll use split and join to safely replace all instances regardless of formatting,
// or better yet, a regex that handles whitespace if needed.

// Actually, looking at the previous output, pattern2 sometimes has a newline.
// So let's use a regex:
const regex = /localStorage\.getItem\('toeic_ai_context_' \+ ([^)]+)\)\s*\|\|\s*localStorage\.getItem\('toeic_ai_context'\)\s*\|\|\s*''/g;

content = content.replace(regex, "(localStorage.getItem('toeic_ai_context_' + $1) ?? localStorage.getItem('toeic_ai_context') ?? '')");

fs.writeFileSync('main.js', content);
console.log("Replaced nullish coalescing logic for toeic_ai_context");
