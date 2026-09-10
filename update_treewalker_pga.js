const fs = require('fs');
let html = fs.readFileSync('pga.html', 'utf8');

const regex1 = /const targetNodes = feedbackEl\.querySelectorAll\('\.ai-corrected-text, \.ai-original-text, \.ai-user-text, \.ai-vocab-expansion'\);/g;
const replacement1 = `const targetNodes = feedbackEl.querySelectorAll('.ai-corrected-text, .ai-original-text, .ai-user-text, .ai-vocab-expansion span.text-brand-600');`;

const regex2 = /const allTargets = targetNodes\.length > 0 \? targetNodes : feedbackEl\.querySelectorAll\('div\.bg-emerald-50, div\.bg-indigo-50, div\.bg-slate-800\\\\\/80, div\.bg-slate-100, div\.bg-amber-50'\);/g;
const replacement2 = `const allTargets = targetNodes.length > 0 ? targetNodes : feedbackEl.querySelectorAll('div.bg-emerald-50, div.bg-indigo-50, div.bg-slate-800\\\\/80, div.bg-slate-100');`;

html = html.replace(regex1, replacement1);
html = html.replace(regex2, replacement2);

// fallback for regex2 without escaping slashes
const regex2_alt = /const allTargets = targetNodes\.length > 0 \? targetNodes : feedbackEl\.querySelectorAll\('div\.bg-emerald-50, div\.bg-indigo-50, div\.bg-slate-800\\\/80, div\.bg-slate-100, div\.bg-amber-50'\);/g;
html = html.replace(regex2_alt, replacement2);


fs.writeFileSync('pga.html', html);
console.log('Done!');
