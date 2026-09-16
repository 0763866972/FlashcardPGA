const fs = require('fs');
let c = fs.readFileSync('pga.html', 'utf8');

c = c.replace(/btnText\.innerText = 'Phân tích Ngữ pháp';\s*\} else \{/g, `btnText.innerText = 'Phân tích Ngữ pháp';
        if (toggleDictBtn) toggleDictBtn.classList.remove('hidden');
        if (toggleWritingBtn) toggleWritingBtn.classList.remove('hidden');
    } else {`);

c = c.replace(/grammarContent\.classList\.remove\('hidden'\);\s*btnText\.innerText = 'Đóng Phân tích';/g, `grammarContent.classList.remove('hidden');
        btnText.innerText = 'Đóng Phân tích';
        if (toggleDictBtn) toggleDictBtn.classList.add('hidden');
        if (toggleWritingBtn) toggleWritingBtn.classList.add('hidden');`);

c = c.replace(/btnText\.innerText = 'Bật chế độ Viết';\s*\} else \{/g, `btnText.innerText = 'Bật chế độ Viết';
        if (toggleDictBtn) toggleDictBtn.classList.remove('hidden');
        const toggleGrammarBtn = document.getElementById('toggleGrammarBtn');
        if (toggleGrammarBtn) toggleGrammarBtn.classList.remove('hidden');
    } else {`);

c = c.replace(/writingContent\.classList\.remove\('hidden'\);\s*btnText\.innerText = 'Tắt chế độ Viết';/g, `writingContent.classList.remove('hidden');
        btnText.innerText = 'Tắt chế độ Viết';
        if (toggleDictBtn) toggleDictBtn.classList.add('hidden');
        const toggleGrammarBtn = document.getElementById('toggleGrammarBtn');
        if (toggleGrammarBtn) toggleGrammarBtn.classList.add('hidden');`);

fs.writeFileSync('pga.html', c);
console.log('Done!');
