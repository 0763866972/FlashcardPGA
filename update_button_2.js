const fs = require('fs');
let lines = fs.readFileSync('index.html', 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('class="absolute top-6 left-6 text-[#2f75b5] text-sm font-bold uppercase tracking-widest"><i')) {
        lines[i] = `                                <span id="fcGenExampleBtn" onclick="generateExampleForWord(event)" title="Nhấn để AI tạo ví dụ mới" class="absolute top-6 left-6 text-[#2f75b5] text-sm font-bold uppercase tracking-widest cursor-pointer hover:text-brand-400 transition-colors"><i`;
        console.log("Replaced line", i + 1);
        break;
    }
}

fs.writeFileSync('index.html', lines.join('\n'));
