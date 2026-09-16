const fs = require('fs');
let c = fs.readFileSync('pga.html', 'utf8');

c = c.replace(
    /const conjunctions = data\.conjunctions \|\| \[\];/,
    `const conjunctions = data.conjunctions || [];\n            const prepositions = data.prepositions || [];\n            const phrases = data.phrases || [];`
);

c = c.replace(
    /const maxRows = Math\.max\(nouns\.length, adjectives\.length, verbs\.length, adverbs\.length, conjunctions\.length\);/,
    `const maxRows = Math.max(nouns.length, adjectives.length, verbs.length, adverbs.length, conjunctions.length, prepositions.length, phrases.length);`
);

c = c.replace(
    /<td colspan="11"/g,
    `<td colspan="15"`
);

c = c.replace(
    /const conj = conjunctions\[i\] \|\| \{ w: '', m: '' \};/,
    `const conj = conjunctions[i] || { w: '', m: '' };\n                const prep = prepositions[i] || { w: '', m: '' };\n                const phrase = phrases[i] || { w: '', m: '' };`
);

let newTd = `<!-- Liên từ -->
                    <td class="word-text cursor-pointer hover:bg-brand-50 hover:text-brand-600 transition-colors" oncontextmenu="window.handleDictRightClick(event, '\${conj.w.replace(/'/g, "\\\\'")}')">\${conj.w}</td>
                    <td class="meaning-text">\${conj.m}</td>
                    <!-- Giới từ -->
                    <td class="word-text cursor-pointer hover:bg-brand-50 hover:text-brand-600 transition-colors" oncontextmenu="window.handleDictRightClick(event, '\${prep.w.replace(/'/g, "\\\\'")}')">\${prep.w}</td>
                    <td class="meaning-text">\${prep.m}</td>
                    <!-- Cụm từ -->
                    <td class="word-text cursor-pointer hover:bg-brand-50 hover:text-brand-600 transition-colors" oncontextmenu="window.handleDictRightClick(event, '\${phrase.w.replace(/'/g, "\\\\'")}')">\${phrase.w}</td>
                    <td class="meaning-text">\${phrase.m}</td>
                \`;`;
                
c = c.replace(/<!-- Liên từ -->[\s\S]*?<\/td>\s*`;/, newTd);

fs.writeFileSync('pga.html', c);
console.log('Done 3');
