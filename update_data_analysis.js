const fs = require('fs');
let c = fs.readFileSync('pga.html', 'utf8');

// 1. Add CSS classes
c = c.replace(
    /\.th-conj \{ background-color: #fde047; \} \/\* Vàng đậm \*\//,
    `.th-conj { background-color: #fde047; } /* Vàng đậm */\n        .th-prep { background-color: #a7f3d0; } /* Xanh ngọc */\n        .th-phrase { background-color: #fbcfe8; } /* Hồng nhạt */`
);

// 2. Add Table Headers
c = c.replace(
    /<th class="th-conj" colspan="2">Liên từ<\/th>/,
    `<th class="th-conj" colspan="2">Liên từ</th>\n                        <th class="th-prep" colspan="2">Giới từ</th>\n                        <th class="th-phrase" colspan="2">Cụm từ</th>`
);

// 3. Update init data in processContent
c = c.replace(
    /let finalData = \{ nouns: \[\], adjectives: \[\], verbs: \[\], adverbs: \[\], conjunctions: \[\] \};/g,
    `let finalData = { nouns: [], adjectives: [], verbs: [], adverbs: [], conjunctions: [], prepositions: [], phrases: [] };`
);

// 3b. Update init data in parseAIResponse (there are 2 places)
c = c.replace(
    /return \{ nouns: \[\], adjectives: \[\], verbs: \[\], adverbs: \[\], conjunctions: \[\] \};/g,
    `return { nouns: [], adjectives: [], verbs: [], adverbs: [], conjunctions: [], prepositions: [], phrases: [] };`
);

// 4. Update mergeResults
c = c.replace(
    /\['nouns', 'adjectives', 'verbs', 'adverbs', 'conjunctions'\]\.forEach/g,
    `['nouns', 'adjectives', 'verbs', 'adverbs', 'conjunctions', 'prepositions', 'phrases'].forEach`
);

// 5. Update AI Prompt
let oldPrompt = `Tuyệt đối BỎ QUA các mạo từ và giới từ cơ bản (ví dụ: a, an, the, in, on, at, of, to, for, with...).
Tuyệt đối BỎ QUA các danh từ riêng (tên người, tên địa danh, tên công ty, model sản phẩm, ví dụ: Carol, Barger, Makatasi, Belter, BTR-1483...).
Hãy chuyển các từ về dạng nguyên thể, NHƯNG NẾU từ đó đang đóng vai trò là một tính từ/danh từ đặc thù trong câu (ví dụ: "retractable", "refracting") thì hãy giữ nguyên form của nó để dịch cho chuẩn xác.
Dịch từng từ tiếng Anh đã tìm thấy sang tiếng Việt sao cho sát nghĩa nhất với ngữ cảnh của đoạn văn. 
Sau đó, phân loại TẤT CẢ các từ vựng này vào 5 nhóm từ loại cơ bản: Danh từ, Tính từ, Động từ, Trạng từ, Liên từ.
QUAN TRỌNG: CHỈ TRẢ VỀ DUY NHẤT 1 ĐỐI TƯỢNG JSON (KHÔNG bọc trong markdown \`\`\`json, KHÔNG giải thích thêm).
Cấu trúc JSON bắt buộc phải giống chính xác như sau:
{
  "nouns": [{"w": "từ", "m": "nghĩa", "p": "phiên âm"}],
  "adjectives": [{"w": "từ", "m": "nghĩa", "p": "phiên âm"}],
  "verbs": [{"w": "từ", "m": "nghĩa", "p": "phiên âm"}],
  "adverbs": [{"w": "từ", "m": "nghĩa", "p": "phiên âm"}],
  "conjunctions": [{"w": "từ", "m": "nghĩa", "p": "phiên âm"}]
}`;

let newPrompt = `Tuyệt đối BỎ QUA các mạo từ cơ bản (ví dụ: a, an, the).
Các giới từ (in, on, at, of, with...) thì trích xuất vào nhóm "prepositions".
ĐẶC BIỆT: NẾU có các cụm từ ghép, phrasal verbs, collocations, hoặc cụm giới từ (ví dụ: except for, abide by, take care of, in charge of...) thì trích xuất vào nhóm "phrases".
Tuyệt đối BỎ QUA các danh từ riêng (tên người, tên địa danh, tên công ty, model sản phẩm, ví dụ: Carol, Barger, Makatasi, Belter, BTR-1483...).
Hãy chuyển các từ về dạng nguyên thể, NHƯNG NẾU từ đó đang đóng vai trò là một tính từ/danh từ đặc thù trong câu thì hãy giữ nguyên form.
Dịch từng từ/cụm từ tiếng Anh đã tìm thấy sang tiếng Việt sao cho sát nghĩa nhất với ngữ cảnh của đoạn văn. 
Sau đó, phân loại TẤT CẢ vào 7 nhóm: Danh từ, Tính từ, Động từ, Trạng từ, Liên từ, Giới từ, Cụm từ.
QUAN TRỌNG: CHỈ TRẢ VỀ DUY NHẤT 1 ĐỐI TƯỢNG JSON (KHÔNG bọc trong markdown \`\`\`json, KHÔNG giải thích thêm).
Cấu trúc JSON bắt buộc phải giống chính xác như sau:
{
  "nouns": [{"w": "từ", "m": "nghĩa", "p": "phiên âm"}],
  "adjectives": [{"w": "từ", "m": "nghĩa", "p": "phiên âm"}],
  "verbs": [{"w": "từ", "m": "nghĩa", "p": "phiên âm"}],
  "adverbs": [{"w": "từ", "m": "nghĩa", "p": "phiên âm"}],
  "conjunctions": [{"w": "từ", "m": "nghĩa", "p": "phiên âm"}],
  "prepositions": [{"w": "từ", "m": "nghĩa", "p": "phiên âm"}],
  "phrases": [{"w": "cụm từ", "m": "nghĩa", "p": "phiên âm"}]
}`;
c = c.replace(oldPrompt, newPrompt);

// Update system prompt for Groq
let oldSys = `5 nhóm từ loại cơ bản: Danh từ, Tính từ, Động từ, Trạng từ, Liên từ.`;
let newSys = `7 nhóm từ loại cơ bản: Danh từ, Tính từ, Động từ, Trạng từ, Liên từ, Giới từ, Cụm từ.`;
c = c.replace(/into nouns, adjectives, verbs, adverbs, and conjunctions/g, `into nouns, adjectives, verbs, adverbs, conjunctions, prepositions, and phrases`);

// 6. Update renderTable
c = c.replace(
    /const maxLen = Math\.max\(data\.nouns\.length, data\.adjectives\.length, data\.verbs\.length, data\.adverbs\.length, data\.conjunctions\.length\);/,
    `const maxLen = Math.max(data.nouns.length, data.adjectives.length, data.verbs.length, data.adverbs.length, data.conjunctions.length, data.prepositions.length, data.phrases.length);`
);

let oldVars = `const conj = data.conjunctions[i] || { w: '', m: '' };`;
let newVars = `const conj = data.conjunctions[i] || { w: '', m: '' };\n                const prep = data.prepositions[i] || { w: '', m: '' };\n                const phrase = data.phrases[i] || { w: '', m: '' };`;
c = c.replace(oldVars, newVars);

let oldTd = `<!-- Liên từ -->
                    <td class="word-text cursor-pointer hover:bg-brand-50 hover:text-brand-600 transition-colors" oncontextmenu="window.handleDictRightClick(event, '\${conj.w.replace(/'/g, "\\\\'")}')">\${conj.w}</td>
                    <td class="meaning-text">\${conj.m}</td>
                \`;`;
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
c = c.replace(oldTd, newTd);

// 7. Update copyTableData
c = c.replace(
    /text \+= "STT\\tDanh từ\\t\\tTính từ\\t\\tĐộng từ\\t\\tTrạng từ\\t\\tLiên từ\\n";/,
    `text += "STT\\tDanh từ\\t\\tTính từ\\t\\tĐộng từ\\t\\tTrạng từ\\t\\tLiên từ\\t\\tGiới từ\\t\\tCụm từ\\n";`
);

let oldCopyVars = `const conjM = cols\\[10\\]\\.innerText;
                text \\+= \\\`\\$\\{stt\\}\\t\\$\\{nW\\}\\t\\$\\{nM\\}\\t\\$\\{adjW\\}\\t\\$\\{adjM\\}\\t\\$\\{vW\\}\\t\\$\\{vM\\}\\t\\$\\{advW\\}\\t\\$\\{advM\\}\\t\\$\\{conjW\\}\\t\\$\\{conjM\\}\\n\\\`;`;
let newCopyVars = `const conjM = cols[10].innerText;
                const prepW = cols[11] ? cols[11].innerText : '';
                const prepM = cols[12] ? cols[12].innerText : '';
                const phraseW = cols[13] ? cols[13].innerText : '';
                const phraseM = cols[14] ? cols[14].innerText : '';
                text += \`\${stt}\\t\${nW}\\t\${nM}\\t\${adjW}\\t\${adjM}\\t\${vW}\\t\${vM}\\t\${advW}\\t\${advM}\\t\${conjW}\\t\${conjM}\\t\${prepW}\\t\${prepM}\\t\${phraseW}\\t\${phraseM}\\n\`;`;
c = c.replace(new RegExp(oldCopyVars), newCopyVars);


fs.writeFileSync('pga.html', c);
console.log('Update Data Analysis successful!');
