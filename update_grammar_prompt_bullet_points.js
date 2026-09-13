const fs = require('fs');

let html = fs.readFileSync('pga.html', 'utf8');

const oldPrompt = `            const prompt = \`Nhiệm vụ của bạn là đóng vai trò "CHUYÊN GIA NGỮ PHÁP TIẾNG ANH" để phân tích CỰC KỲ CHI TIẾT và CHUYÊN SÂU đoạn văn bản sau. Không bắt lỗi sai, mà chỉ phân tích mổ xẻ tận gốc rễ các điểm ngữ pháp và từ vựng hay.

YÊU CẦU QUAN TRỌNG NHẤT: Phần phân tích ngữ pháp phải CỰC KỲ KỸ LƯỠNG. Đừng chỉ nêu tên cấu trúc hời hợt. Hãy phân tích cặn kẽ TẠI SAO tác giả lại dùng nó ở ngữ cảnh này, nó mang lại sắc thái ý nghĩa gì, tác dụng trong câu là gì (ví dụ: nhấn mạnh, tạo sự trang trọng, nối ý, v.v.). Phân tích ít nhất 3-5 điểm ngữ pháp cốt lõi.

TRÌNH BÀY DƯỚI DẠNG HTML (không dùng code block \\\`\\\`\\\`). Hãy tuân thủ NGHIÊM NGẶT cấu trúc 3 phần sau:

<h3 class="font-bold text-xl text-brand-600 mb-3">Phần 1: Đoạn văn bản gốc</h3>
<div class="mb-6 text-lg leading-relaxed bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
  (Viết lại TOÀN BỘ đoạn văn bản gốc. Bôi đậm và tô màu (dùng style="color: [mã màu]") cho các điểm ngữ pháp và từ vựng đáng chú ý. Mỗi điểm dùng một màu khác nhau).
</div>

<h3 class="font-bold text-xl text-brand-600 mb-3 border-b border-slate-200 pb-2">Phần 2: Phân tích Cấu trúc & Ngữ pháp</h3>
<div class="mb-6 text-lg bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
  (Trình bày MỖI điểm ngữ pháp theo đúng HTML template sau:)
  <div class="mb-4">
    <strong class="text-slate-800">1. [Tên cấu trúc tiếng Việt] ([Tên tiếng Anh]):</strong><br>
    <span class="text-slate-700">Câu gốc: </span><strong style="color: [MÀU KHỚP PHẦN 1];">"[Trích dẫn câu chứa cấu trúc]"</strong><br>
    <em>Giải thích: </em><span class="text-slate-700">[Giải thích CHUYÊN SÂU và DÀI DÒNG: Cấu trúc này hoạt động như thế nào? Tại sao người viết lại chọn cấu trúc này thay vì cấu trúc khác? Nó giúp ích gì cho ý nghĩa hoặc sắc thái của câu (tính trang trọng, nhấn mạnh, súc tích...)?]</span>
  </div>
  (Lặp lại template cho điểm 2, 3...)
</div>

<h3 class="font-bold text-xl text-brand-600 mb-3 border-b border-slate-200 pb-2">Phần 3: Cụm từ vựng & Cách diễn đạt hay</h3>
<div class="mb-6 text-lg bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
  (Trình bày MỖI cụm từ vựng theo đúng HTML template sau:)
  <div class="mb-3">
    <strong style="color: [MÀU KHỚP PHẦN 1];">[Cụm từ vựng tiếng Anh]:</strong> 
    <span class="text-slate-700">(Loại từ) - <em>[Nghĩa tiếng Việt]</em>. [Giải thích cặn kẽ cách dùng tự nhiên của cụm từ này, tác dụng trong văn cảnh].</span>
  </div>
  (Lặp lại template cho các cụm từ khác)
</div>

Đoạn văn bản:
\${rawText}\`;`;

const newPrompt = `            const prompt = \`Nhiệm vụ của bạn là đóng vai trò "CHUYÊN GIA NGỮ PHÁP TIẾNG ANH" để phân tích CỰC KỲ CHI TIẾT và CHUYÊN SÂU đoạn văn bản sau. Không bắt lỗi sai, mà chỉ phân tích mổ xẻ tận gốc rễ các điểm ngữ pháp và từ vựng hay.

YÊU CẦU QUAN TRỌNG NHẤT: Phần phân tích ngữ pháp phải CỰC KỲ KỸ LƯỠNG. Tuy nhiên, KHÔNG ĐƯỢC VIẾT THÀNH MỘT CỤC VĂN BẢN DÀI THÒNG KHÓ ĐỌC. BẮT BUỘC PHẢI CHIA NHỎ Ý RA THÀNH CÁC BULLET POINTS (<ul><li>) ĐỂ DỄ NHÌN.

TRÌNH BÀY DƯỚI DẠNG HTML (không dùng code block \\\`\\\`\\\`). Hãy tuân thủ NGHIÊM NGẶT cấu trúc 3 phần sau:

<h3 class="font-bold text-xl text-brand-600 mb-3">Phần 1: Đoạn văn bản gốc</h3>
<div class="mb-6 text-lg leading-relaxed bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
  (Viết lại TOÀN BỘ đoạn văn bản gốc. Bôi đậm và tô màu (dùng style="color: [mã màu]") cho các điểm ngữ pháp và từ vựng đáng chú ý. Mỗi điểm dùng một màu khác nhau).
</div>

<h3 class="font-bold text-xl text-brand-600 mb-3 border-b border-slate-200 pb-2">Phần 2: Phân tích Cấu trúc & Ngữ pháp</h3>
<div class="mb-6 text-lg bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
  (Trình bày MỖI điểm ngữ pháp theo ĐÚNG HTML template sau, không được làm khác:)
  <div class="mb-6">
    <strong class="text-slate-800 text-xl">1. [Tên cấu trúc tiếng Việt] ([Tên tiếng Anh]):</strong>
    <div class="my-2 p-3 bg-slate-50 border-l-4 border-brand-400 italic">
      <span class="text-slate-600">Câu gốc: </span><strong style="color: [MÀU KHỚP PHẦN 1];">"[Trích dẫn câu chứa cấu trúc]"</strong>
    </div>
    <span class="font-semibold text-slate-800">Giải thích chi tiết:</span>
    <ul class="list-disc ml-6 mt-2 text-slate-700 space-y-2">
      <li><strong>Cách hoạt động:</strong> [Giải thích ngắn gọn cấu trúc này hoạt động thế nào trong câu].</li>
      <li><strong>Tác dụng/Sắc thái:</strong> [Tạo sự trang trọng, nhấn mạnh, súc tích, hay nối ý...].</li>
      <li><strong>So sánh (nếu có):</strong> [Nếu dùng cách viết thông thường thì câu sẽ như thế nào, tại sao cách viết này hay hơn].</li>
    </ul>
  </div>
  (Lặp lại template cho điểm 2, 3...)
</div>

<h3 class="font-bold text-xl text-brand-600 mb-3 border-b border-slate-200 pb-2">Phần 3: Cụm từ vựng & Cách diễn đạt hay</h3>
<div class="mb-6 text-lg bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
  (Trình bày MỖI cụm từ vựng theo ĐÚNG HTML template sau:)
  <div class="mb-4">
    <strong style="color: [MÀU KHỚP PHẦN 1]; text-xl">[Cụm từ vựng tiếng Anh]</strong> <span class="text-slate-600 text-base">([Loại từ])</span>
    <ul class="list-disc ml-6 mt-1 text-slate-700 space-y-1">
      <li><strong>Nghĩa:</strong> [Nghĩa tiếng Việt].</li>
      <li><strong>Cách dùng:</strong> [Giải thích cặn kẽ cách dùng tự nhiên của cụm từ này, tác dụng trong văn cảnh].</li>
    </ul>
  </div>
  (Lặp lại template cho các cụm từ khác)
</div>

Đoạn văn bản:
\${rawText}\`;`;

html = html.replace(oldPrompt, newPrompt);
fs.writeFileSync('pga.html', html);
console.log("Updated prompt to use bullet points for easier reading");
