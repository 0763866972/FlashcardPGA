const fs = require('fs');
let c = fs.readFileSync('pga.html', 'utf8');

// The final prompt text
let finalPrompt = `Nhiệm vụ của bạn là trích xuất TOÀN BỘ các từ vựng tiếng Anh có ý nghĩa trong đoạn văn bản được cung cấp. BẠN PHẢI QUÉT THẬT KỸ VÀ KHÔNG ĐƯỢC BỎ SÓT BẤT KỲ TỪ NÀO (như retractable, refracting, aperture,...).
Tuyệt đối BỎ QUA các mạo từ cơ bản (ví dụ: a, an, the).
Các giới từ đơn (in, on, at, of, with...) và ĐẶC BIỆT LÀ CÁC GIỚI TỪ GHÉP (ví dụ: as to, as for, according to, on behalf of, regardless of, by means of, ahead of, due to, because of, on account of, prior to, as well as, in addition to, with regard to, in regard to, in spite of, rather than, adhere to, comply with, aside from, apart from, in contrast with, notwithstanding, along with, together with, as opposed to, except for, instead of, depending on, in advance, along side, without, beyond, via, per, given, in light of, as a result of, owing to, other than...) thì BẮT BUỘC TRÍCH XUẤT VÀO NHÓM "prepositions" (CHỨ KHÔNG PHẢI "phrases").
ĐẶC BIỆT 1: NẾU có các cụm từ ghép, phrasal verbs, collocations (ví dụ: abide by, take care of, in charge of...) thì trích xuất vào nhóm "phrases", KHÔNG TÁCH RỜI.
ĐẶC BIỆT 2: NẾU là DANH TỪ GHÉP (Compound Nouns) tạo từ 2 danh từ trở lên (ví dụ: assembly line, filing cabinet, wooden crate...) thì trích xuất NGUYÊN CỤM ĐÓ vào nhóm "nouns" chứ ĐỪNG TÁCH THÀNH 2 TỪ ĐƠN.
ĐẶC BIỆT 3: Đối với các từ (however, meanwhile, instead, if so, moreover, furthermore, therefore, thus, besides, in addition, otherwise, then, nevertheless, on the other hand, in fact, finally, ultimately, likewise, similarly, nonetheless, consequently, as a consequence, subsequently, meantime, accordingly, after all, even so, conversely, so far, before long, as a result, to this end, as such, hence, at once, on the contrary, while, beforehand, in advance...), HÃY XÉT NGỮ CẢNH: Nếu phía sau chúng là một mệnh đề (clause) hoặc chúng đóng vai trò nối các câu/mệnh đề lại với nhau thì mới xếp vào nhóm "conjunctions" (Liên từ). Còn nếu không, hãy xếp vào trạng từ hoặc giới từ tuỳ ngữ cảnh.
Tuyệt đối BỎ QUA các danh từ riêng (tên người, tên địa danh, tên công ty, model sản phẩm, ví dụ: Carol, Barger, Makatasi, Belter, BTR-1483...).
Hãy chuyển các từ về dạng nguyên thể, NHƯNG NẾU từ đó đang đóng vai trò là một tính từ/danh từ đặc thù trong câu thì hãy giữ nguyên form.
Dịch từng từ/cụm từ tiếng Anh đã tìm thấy sang tiếng Việt sao cho sát nghĩa nhất với ngữ cảnh của đoạn văn. 
Sau đó, phân loại TẤT CẢ vào 7 nhóm: Danh từ, Tính từ, Động từ, Trạng từ, Liên từ, Giới từ, Cụm từ.
QUAN TRỌNG: CHỈ TRẢ VỀ DUY NHẤT 1 ĐỐI TƯỢNG JSON (KHÔNG bọc trong markdown \\\`\\\`\\\`json, KHÔNG giải thích thêm).
Cấu trúc JSON bắt buộc phải giống chính xác như sau:
{
  "nouns": [{"w": "từ hoặc cụm danh từ ghép", "m": "nghĩa", "p": "phiên âm"}],
  "adjectives": [{"w": "từ", "m": "nghĩa", "p": "phiên âm"}],
  "verbs": [{"w": "từ", "m": "nghĩa", "p": "phiên âm"}],
  "adverbs": [{"w": "từ", "m": "nghĩa", "p": "phiên âm"}],
  "conjunctions": [{"w": "từ", "m": "nghĩa", "p": "phiên âm"}],
  "prepositions": [{"w": "từ", "m": "nghĩa", "p": "phiên âm"}],
  "phrases": [{"w": "cụm từ", "m": "nghĩa", "p": "phiên âm"}]
}
Nếu một nhóm không có từ nào, hãy trả về mảng rỗng [].`;

// Replace prompt
c = c.replace(/let prompt = `Nhiệm vụ của bạn là trích xuất[\s\S]*?Nếu một nhóm không có từ nào, hãy trả về mảng rỗng \[\].`;/, "let prompt = `" + finalPrompt + "`;");

// Replace copyTableData
let oldCopy = `        function copyTableData() {
            const table = document.getElementById('vocabTable');
            let text = "";
            // Add Header
            text += "STT\\tDanh từ\\t\\tTính từ\\t\\tĐộng từ\\t\\tTrạng từ\\t\\tLiên từ\\n";
            // Add rows
            for (let i = 1; i < table.rows.length; i++) {
                const row = table.rows[i];
                // Bỏ qua các dòng đang bị ẩn do search
                if (row.style.display === "none") continue;
                const cols = row.cells;
                if (cols.length === 1) continue; // Skip empty message
                const stt = cols[0].innerText;
                const nW = cols[1].innerText;
                const nM = cols[2].innerText;
                const adjW = cols[3].innerText;
                const adjM = cols[4].innerText;
                const vW = cols[5].innerText;
                const vM = cols[6].innerText;
                const advW = cols[7].innerText;
                const advM = cols[8].innerText;
                const conjW = cols[9].innerText;
                const conjM = cols[10].innerText;
                text += \`\${stt}\\t\${nW}\\t\${nM}\\t\${adjW}\\t\${adjM}\\t\${vW}\\t\${vM}\\t\${advW}\\t\${advM}\\t\${conjW}\\t\${conjM}\\n\`;
            }
            navigator.clipboard.writeText(text).then(() => {`;
            
let newCopy = `        function copyTableData() {
            const table = document.getElementById('vocabTable');
            let text = "";
            // Add Header
            text += "STT\\tDanh từ\\t\\tTính từ\\t\\tĐộng từ\\t\\tTrạng từ\\t\\tLiên từ\\t\\tGiới từ\\t\\tCụm từ\\n";
            // Add rows
            for (let i = 1; i < table.rows.length; i++) {
                const row = table.rows[i];
                if (row.style.display === "none") continue;
                const cols = row.cells;
                if (cols.length === 1) continue; 
                const stt = cols[0].innerText;
                const nW = cols[1].innerText;
                const nM = cols[2].innerText;
                const adjW = cols[3].innerText;
                const adjM = cols[4].innerText;
                const vW = cols[5].innerText;
                const vM = cols[6].innerText;
                const advW = cols[7].innerText;
                const advM = cols[8].innerText;
                const conjW = cols[9].innerText;
                const conjM = cols[10].innerText;
                const prepW = cols[11] ? cols[11].innerText : '';
                const prepM = cols[12] ? cols[12].innerText : '';
                const phraseW = cols[13] ? cols[13].innerText : '';
                const phraseM = cols[14] ? cols[14].innerText : '';
                text += \`\${stt}\\t\${nW}\\t\${nM}\\t\${adjW}\\t\${adjM}\\t\${vW}\\t\${vM}\\t\${advW}\\t\${advM}\\t\${conjW}\\t\${conjM}\\t\${prepW}\\t\${prepM}\\t\${phraseW}\\t\${phraseM}\\n\`;
            }
            navigator.clipboard.writeText(text).then(() => {`;

c = c.replace(oldCopy, newCopy);

// And we need to make sure update_data_analysis didn't already mess up copyData:
// If it's already partly modified but missing columns, we force replace it using regex:
c = c.replace(/function copyTableData\(\) \{[\s\S]*?navigator\.clipboard\.writeText\(text\)\.then\(\(\) => \{/, newCopy);

fs.writeFileSync('pga.html', c);
console.log('Final fix applied');
