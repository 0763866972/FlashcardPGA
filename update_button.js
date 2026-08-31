const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const targetStr = `<span
                                    class="absolute top-6 left-6 text-[#2f75b5] text-sm font-bold uppercase tracking-widest"><i
                                        class="fa-solid fa-spell-check"></i> Định Nghĩa</span>`;

const replaceStr = `<span id="fcGenExampleBtn" onclick="generateExampleForWord(event)" title="Nhấn để AI tạo ví dụ mới"
                                    class="absolute top-6 left-6 text-[#2f75b5] text-sm font-bold uppercase tracking-widest cursor-pointer hover:text-brand-400 transition-colors"><i
                                        class="fa-solid fa-spell-check"></i> Định Nghĩa</span>`;

if (content.includes(targetStr)) {
    content = content.replace(targetStr, replaceStr);
    fs.writeFileSync('index.html', content);
    console.log("Replaced successfully!");
} else {
    console.log("Target string not found. Please check exact characters and spaces.");
}
