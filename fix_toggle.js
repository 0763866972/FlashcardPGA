const fs = require('fs');
let c = fs.readFileSync('pga.html', 'utf8');

c = c.replace(/btnText\.innerText = 'Phân tích Ngữ pháp';\n        if \(toggleDictBtn\) toggleDictBtn\.classList\.remove\('hidden'\);\n        if \(toggleWritingBtn\) toggleWritingBtn\.classList\.remove\('hidden'\);\n    \} else \{/g, `btnText.innerText = 'Phân tích Ngữ pháp';
        if (toggleDictBtn) toggleDictBtn.classList.remove('hidden');
    } else {`);

c = c.replace(/grammarContent\.classList\.remove\('hidden'\);\n        btnText\.innerText = 'Đóng Phân tích';\n        if \(toggleDictBtn\) toggleDictBtn\.classList\.add\('hidden'\);\n        if \(toggleWritingBtn\) toggleWritingBtn\.classList\.add\('hidden'\);/g, `grammarContent.classList.remove('hidden');
        btnText.innerText = 'Đóng Phân tích';
        if (toggleDictBtn) toggleDictBtn.classList.add('hidden');`);

c = c.replace(/btnText\.innerText = 'Bật chế độ Viết';\n        if \(toggleDictBtn\) toggleDictBtn\.classList\.remove\('hidden'\);\n        const toggleGrammarBtn = document\.getElementById\('toggleGrammarBtn'\);\n        if \(toggleGrammarBtn\) toggleGrammarBtn\.classList\.remove\('hidden'\);\n    \} else \{/g, `btnText.innerText = 'Bật chế độ Viết';
        if (toggleDictBtn) toggleDictBtn.classList.remove('hidden');
    } else {`);

c = c.replace(/writingContent\.classList\.remove\('hidden'\);\n        btnText\.innerText = 'Tắt chế độ Viết';\n        if \(toggleDictBtn\) toggleDictBtn\.classList\.add\('hidden'\);\n        const toggleGrammarBtn = document\.getElementById\('toggleGrammarBtn'\);\n        if \(toggleGrammarBtn\) toggleGrammarBtn\.classList\.add\('hidden'\);/g, `writingContent.classList.remove('hidden');
        btnText.innerText = 'Tắt chế độ Viết';
        if (toggleDictBtn) toggleDictBtn.classList.add('hidden');`);

fs.writeFileSync('pga.html', c);
console.log('Done!');
