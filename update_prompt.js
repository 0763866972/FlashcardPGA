const fs = require('fs');
let c = fs.readFileSync('pga.html', 'utf8');

let newPrompt = `Nhiệm vụ của bạn là trích xuất TOÀN BỘ các từ vựng tiếng Anh có ý nghĩa trong đoạn văn bản được cung cấp. BẠN PHẢI QUÉT THẬT KỸ VÀ KHÔNG ĐƯỢC BỎ SÓT BẤT KỲ TỪ NÀO (như retractable, refracting, aperture,...).
Tuyệt đối BỎ QUA các mạo từ cơ bản (ví dụ: a, an, the).
Các giới từ (in, on, at, of, with...) thì trích xuất vào nhóm "prepositions".
ĐẶC BIỆT 1: NẾU có các cụm từ ghép, phrasal verbs, collocations, hoặc cụm giới từ (ví dụ: except for, abide by, take care of, in charge of...) thì trích xuất toàn bộ cụm đó vào nhóm "phrases", KHÔNG TÁCH RỜI.
ĐẶC BIỆT 2: NẾU là DANH TỪ GHÉP (Compound Nouns) tạo từ 2 danh từ trở lên (ví dụ: assembly line, filing cabinet, wooden crate...) thì trích xuất NGUYÊN CỤM ĐÓ vào nhóm "nouns" chứ ĐỪNG TÁCH THÀNH 2 TỪ ĐƠN.
Tuyệt đối BỎ QUA các danh từ riêng (tên người, tên địa danh, tên công ty, model sản phẩm, ví dụ: Carol, Barger, Makatasi, Belter, BTR-1483...).
Hãy chuyển các từ về dạng nguyên thể, NHƯNG NẾU từ đó đang đóng vai trò là một tính từ/danh từ đặc thù trong câu thì hãy giữ nguyên form.
Dịch từng từ/cụm từ tiếng Anh đã tìm thấy sang tiếng Việt sao cho sát nghĩa nhất với ngữ cảnh của đoạn văn. 
Sau đó, phân loại TẤT CẢ vào 7 nhóm: Danh từ, Tính từ, Động từ, Trạng từ, Liên từ, Giới từ, Cụm từ.
QUAN TRỌNG: CHỈ TRẢ VỀ DUY NHẤT 1 ĐỐI TƯỢNG JSON (KHÔNG bọc trong markdown \`\`\`json, KHÔNG giải thích thêm).
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

// Thay thế prompt
c = c.replace(/let prompt = `Nhiệm vụ của bạn là trích xuất[\s\S]*?Nếu một nhóm không có từ nào, hãy trả về mảng rỗng \[\].`;/, "let prompt = `" + newPrompt + "`;");

fs.writeFileSync('pga.html', c);
console.log('Update prompt success');
