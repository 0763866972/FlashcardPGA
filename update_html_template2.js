const fs = require('fs');
let content = fs.readFileSync('pga.html', 'utf8');

const regexSubmit = /window\.submitPgaGrammarWriting = async function\(idx\) \{([\s\S]*?)const systemPrompt = `([\s\S]*?)`;\s*const userPrompt = `([\s\S]*?)`;/m;

const match = content.match(regexSubmit);

if (match) {
    const newSystemPrompt = `Đóng vai một giáo viên tiếng Anh chấm bài.
Học sinh cần viết lại một câu tiếng Anh dựa trên ý nghĩa tiếng Việt.
Nhiệm vụ của bạn là đánh giá, giải thích lỗi sai (nếu có), và sửa lại câu.

LƯU Ý CỰC KỲ QUAN TRỌNG:
- KHÔNG ĐƯỢC trừ điểm hoặc bắt lỗi từ vựng/văn phong nếu câu của học sinh đã đúng ngữ pháp và diễn đạt được ý cơ bản. 
- Ví dụ: học sinh dùng "want to" thay vì "would love to", "play golf" thay vì "take up golf" thì VẪN PHẢI TÍNH LÀ ĐÚNG. Đừng ép học sinh dùng từ hay hơn nếu từ của họ không sai.
- CHỈ BẮT LỖI khi sai ngữ pháp thật sự (sai thì, thiếu to be, sai trật tự từ) hoặc sai hoàn toàn về nghĩa.

BẠN PHẢI TRẢ VỀ ĐÚNG CẤU TRÚC HTML SAU (tuyệt đối không dùng markdown block khối code html):

<div class="mb-3">
    <div class="text-xs text-slate-400 mb-1 uppercase tracking-wide font-bold"><i class="fa-solid fa-user-pen mr-1"></i>Câu của bạn:</div>
    <div class="p-3 bg-slate-800/80 border border-slate-700 rounded-lg text-lg">
        <!-- In lại câu của học sinh. Chữ nào đúng thì bọc trong <span class="text-emerald-400">, chữ nào sai thì bọc trong <span class="text-rose-400 line-through">, chữ nào sửa/thêm vào thì bọc trong <span class="text-amber-400 font-bold"> -->
    </div>
</div>

<div class="mb-3 text-slate-300 leading-relaxed">
    <div class="text-xs text-slate-400 mb-1 uppercase tracking-wide font-bold"><i class="fa-solid fa-microscope mr-1"></i>Nhận xét chi tiết:</div>
    <ul class="list-disc pl-5 space-y-2">
        <!-- Với mỗi lỗi sai, tạo 1 thẻ <li>. Giảng giải ngắn gọn tại sao sai cấu trúc đó. Tuyệt đối không bắt bẻ văn phong. -->
        <!-- Nếu câu hoàn toàn đúng ngữ pháp cơ bản, ghi <li><span class="text-emerald-400 font-bold">Tuyệt vời!</span> Câu của bạn hoàn toàn chính xác.</li> -->
    </ul>
</div>

<div class="mb-3">
    <div class="text-xs text-slate-400 mb-1 uppercase tracking-wide font-bold"><i class="fa-solid fa-wand-magic-sparkles mr-1"></i>Câu đã sửa (Theo văn phong của bạn):</div>
    <div class="p-3 bg-emerald-950/40 border border-emerald-900/60 rounded-lg text-emerald-400 font-medium">
        <!-- Sửa lại câu cho đúng DỰA TRÊN TỪ VỰNG MÀ HỌC SINH ĐÃ DÙNG (giữ nguyên các từ vựng đúng ngữ pháp của học sinh, không thay bằng từ của câu gốc) -->
    </div>
</div>

<div class="mb-1">
    <div class="text-xs text-slate-400 mb-1 uppercase tracking-wide font-bold"><i class="fa-solid fa-book-open mr-1"></i>Câu mẫu gốc (Original):</div>
    <div class="p-3 bg-indigo-950/40 border border-indigo-900/60 rounded-lg text-indigo-300 italic">
        <!-- In lại Câu mẫu gốc (Original sentence) -->
    </div>
</div>`;

    const newUserPrompt = match[3];

    const replacement = `window.submitPgaGrammarWriting = async function(idx) {${match[1]}const systemPrompt = \`${newSystemPrompt}\`;\n\n    const userPrompt = \`${newUserPrompt}\`;`;
    
    content = content.replace(regexSubmit, replacement);
    fs.writeFileSync('pga.html', content);
    console.log("Updated systemPrompt to be extremely strict about not nitpicking style!");
} else {
    console.log("Could not match regex.");
}
