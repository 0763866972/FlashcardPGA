const fs = require('fs');

const newPrompt = `const prompt = \`Nhiệm vụ của bạn là trích xuất TOÀN BỘ các từ vựng tiếng Anh (bao gồm cả danh từ, động từ, tính từ, trạng từ, liên từ, giới từ, mạo từ...) trong đoạn văn bản được cung cấp. BẠN PHẢI QUÉT THẬT KỸ VÀ KHÔNG ĐƯỢC BỎ SÓT BẤT KỲ TỪ NÀO.
Tuyệt đối BỎ QUA các danh từ riêng (tên người, tên địa danh, tên công ty).
Hãy giữ nguyên form của từ trong câu để dịch cho chuẩn xác nhất với ngữ cảnh. Cung cấp kèm phiên âm chuẩn IPA (UK hoặc US) và phân loại từ loại (pos). pos chỉ được mang một trong các giá trị: "nouns", "adjectives", "verbs", "adverbs", "conjunctions", hoặc chuỗi rỗng "" nếu không thuộc các loại trên.

ĐỒNG THỜI, bạn phải áp dụng quy tắc Ngắt Nghỉ và Ngữ Điệu (Intonation & Pausing) của TOEIC vào chính đoạn văn bản đó và trả về trong trường "annotatedText":
- Lên giọng (➚): cuối câu hỏi Yes/No (bắt đầu bằng Be, Do, Modal verbs), và các mục liệt kê ngoại trừ mục cuối cùng.
- Xuống giọng (➘): cuối câu trần thuật, câu mệnh lệnh, câu cảm thán, câu hỏi Wh-, và mục cuối cùng của chuỗi liệt kê.
- Ngắt nhẹ (/): CHỈ ngắt ở những cụm từ dài (như trước giới từ, trước mệnh đề quan hệ, cụm trạng ngữ). TUYỆT ĐỐI KHÔNG ngắt từng chữ một.
- Dừng lâu (//): sau dấu chấm câu.
- Nhấn mạnh (VIẾT HOA TOÀN BỘ TỪ): đối với các con số, số lượng, tên riêng, hoặc từ nối.
*Lưu ý: KHÔNG dùng thẻ HTML. CHỈ chèn ký hiệu /, //, ➚, ➘ trực tiếp vào văn bản.

QUAN TRỌNG: CHỈ TRẢ VỀ DUY NHẤT 1 ĐỐI TƯỢNG JSON (KHÔNG bọc trong markdown \\\`\\\`\\\`json).
Cấu trúc JSON bắt buộc phải gồm 2 phần "annotatedText" và "dict". 
Đây là một số MẪU ĐÁNH DẤU CHUẨN (tham khảo cách ngắt / thưa thớt, tự nhiên):
Mẫu 1: "If you haven't yet / ridden on ADDISON CITY'S brand-new commuter train, you should give it a try➘! // With comfortable seating➚, foldout writing trays➚, and individual lights, the commuter train is the clear choice / for the business commuter / who wants to get some work done while traveling➘. // So make your commute more productive - replace your drive with ADDISON CITY'S commuter train➘. //"
Mẫu 2: "I am happy to introduce EMILY KEITH, famous musician from the opera BLACK MASK, who will be here for us / in the next segment➘. // This romantic comedy opera / was open SEVERAL weeks ago, and you can still enjoy it / in ONE of our local theaters➘. // Tonight, she'll talk about her character in the play➚, trainings done behind the scene➚, and plans for her next performance➘. //"
Mẫu 3: "Good morning➚, and let me be the FIRST to welcome you / to your new jobs at BAXTER INDUSTRIES➘. // You've already received our employee handbook, which describes our company hours➚, paid holidays➚, and / employee benefits➘. // Now, if you'll look at the back of the handbook, you'll find copies of some forms / that we'd like you to fill out➘. //"

Ví dụ định dạng trả về:
{
  "annotatedText": "If you haven't yet / ridden on ADDISON CITY'S brand-new commuter train...",
  "dict": {
    "ridden": {"p": "/ˈrɪd.ən/", "m": "cưỡi, đi", "pos": "verbs"}
  }
}\`;`;

function updateFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    const pStart = content.indexOf('const prompt = `Nhiệm vụ của bạn là trích xuất');
    if (pStart === -1) return console.log("Prompt not found in " + filePath);
    const pEnd = content.indexOf('}`;', pStart) + 3;
    if (pEnd !== -1) {
        const oldP = content.substring(pStart, pEnd);
        content = content.replace(oldP, newPrompt);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log("Success updated " + filePath);
    }
}

updateFile('d:/GIT/FlashcardPGA/pga.html');
updateFile('d:/GIT/FlashcardPGA/pga_script.js');
