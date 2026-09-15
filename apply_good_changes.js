const fs = require('fs');
let c = fs.readFileSync('pga.html', 'utf8');

// 1. Sticky Header
c = c.replace(
    'let html = `<div class="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">',
    'let html = `<div class="sticky top-0 z-50 bg-white/95 backdrop-blur flex items-center justify-between border-b border-slate-200 pt-4 pb-3 mb-4 -mt-4">`'
);

// 2. Prompt Change
const oldPrompt = `Yêu cầu phân tích:
1. TRÍCH DẪN ĐOẠN VĂN CỦA HỌC SINH (BẮT BUỘC ĐẦU TIÊN): Trích dẫn lại nguyên văn đoạn tiếng Anh mà học sinh đã viết. Dùng thẻ <mark class="bg-red-200 text-red-900 px-1 rounded font-semibold">...</mark> để bôi màu các từ/cụm từ sai lỗi nặng, dùng thẻ <mark class="bg-amber-200 text-amber-900 px-1 rounded font-semibold">...</mark> cho các lỗi dùng từ chưa hay, và thẻ <mark class="bg-emerald-200 text-emerald-900 px-1 rounded font-semibold">...</mark> cho những cụm từ xuất sắc.
2. Đánh giá tổng thể độ tự nhiên, trôi chảy và cấu trúc đoạn văn.
3. So sánh với đoạn gốc tiếng Anh. Chỉ ra những chỗ học sinh dịch word-by-word sai ngữ cảnh, hoặc những chỗ học sinh dùng từ hay.
4. Chỉ ra các lỗi chi tiết (dựa trên các phần đã đánh dấu ở mục 1) và cách sửa.
5. Đưa ra phiên bản nâng cấp (nếu có).

TRÌNH BÀY BẰNG HTML (Sử dụng Tailwind CSS classes) KHÔNG DÙNG MARKDOWN BLOCK.
- Khung bài làm của học sinh chứa các phần đánh dấu (dùng bg-slate-50, border border-slate-200, p-4, rounded-lg, mb-4, leading-relaxed, text-slate-700).
- Khung nhận xét tổng quan (bg-blue-50, text-blue-800, p-4, rounded-lg, mb-4).
- Các lỗi chi tiết dùng ul, li (với icon dấu x màu đỏ hoặc dấu chấm than vàng).
- Những chỗ hay dùng icon tick xanh.\`;`;

const newPrompt = `Yêu cầu phân tích và Trình bày (BẮT BUỘC TUÂN THỦ ĐÚNG CẤU TRÚC SAU BẰNG HTML & Tailwind CSS, KHÔNG DÙNG MARKDOWN BLOCK):

<div class="mb-8">
  <h2 class="text-xl font-bold text-slate-800 mb-4 border-b pb-2">PHẦN 1: SỬA LỖI CƠ BẢN (So sánh với bản gốc)</h2>
  
  <h3 class="font-semibold text-slate-700 mb-2">1. Bài viết của bạn:</h3>
  <div class="bg-slate-50 border border-slate-200 p-4 rounded-lg mb-4 leading-relaxed text-slate-700">
    <!-- Trích dẫn lại nguyên văn bài của học sinh. Dùng thẻ <mark class="bg-red-200 text-red-900 px-1 rounded font-semibold">...</mark> cho lỗi nặng, bg-amber-200 cho lỗi nhẹ. BẮT BUỘC gắn thêm thẻ <sup class="text-xs ml-0.5">số thứ tự</sup> bên trong thẻ mark. -->
  </div>

  <h3 class="font-semibold text-slate-700 mb-2">2. Bản gốc (Mẫu chuẩn):</h3>
  <div class="bg-slate-50 border border-slate-200 p-4 rounded-lg mb-4 leading-relaxed text-slate-700">
    <!-- Trích dẫn lại bản gốc. TÔ MÀU VÀ ĐÁNH SỐ TƯƠNG ỨNG với các lỗi của học sinh ở mục 1 để đối chiếu (cùng thẻ mark màu đó, cùng số thứ tự). -->
  </div>

  <h3 class="font-semibold text-slate-700 mb-2">3. Phân tích lỗi chi tiết:</h3>
  <ul class="space-y-3">
    <!-- Giải thích lỗi dựa trên phần 1 và 2. KHÔNG DÙNG NGOẶC KÉP để trích dẫn từ vựng. Mọi từ/cụm từ tiếng Anh được nhắc đến BẮT BUỘC phải đặt trong thẻ <mark> có màu và số thứ tự tương ứng y như trên. -->
  </ul>
</div>

<div class="mb-4">
  <h2 class="text-xl font-bold text-emerald-800 mb-4 border-b border-emerald-200 pb-2">PHẦN 2: NÂNG CẤP CẤU TRÚC & TỪ VỰNG C1/C2 (Band 9.0 IELTS)</h2>
  
  <h3 class="font-semibold text-slate-700 mb-2">4. Bài viết của bạn (Phân tích điểm yếu):</h3>
  <div class="bg-slate-50 border border-slate-200 p-4 rounded-lg mb-4 leading-relaxed text-slate-700">
    <!-- Trích dẫn lại bài của học sinh. Ở mục này, HÃY TÔ MÀU XÁM VÀ ĐÁNH SỐ BẰNG THẺ <mark class="bg-slate-200 text-slate-800 px-1 rounded font-semibold"> NHỮNG TỪ/CỤM TỪ BÌNH DÂN (chưa được Band 9.0) mà bạn dự định sẽ nâng cấp. Ví dụ: <mark class="bg-slate-200 text-slate-800 px-1 rounded font-semibold">I hope<sup class="text-xs ml-0.5">1</sup></mark>. TẤT CẢ các điểm đánh dấu ở mục này phải được tô màu xám và đánh số từ 1 trở đi. -->
  </div>

  <h3 class="font-semibold text-emerald-700 mb-2">5. Phiên bản nâng cấp (Band 9.0 - Từ vựng C1/C2):</h3>
  <div class="bg-emerald-50 border border-emerald-200 p-4 rounded-lg mb-4 leading-relaxed text-emerald-900">
    <!-- Đưa ra bản Band 9.0. BẮT BUỘC sử dụng từ vựng trình độ C1/C2 và NÂNG CẤP CẤU TRÚC CÂU (đảo ngữ, câu phức, mệnh đề rút gọn...). TÔ MÀU XANH (<mark class="bg-emerald-200 text-emerald-900 px-1 rounded font-semibold">) VÀ ĐÁNH SỐ TƯƠNG ỨNG KHỚP VỚI MỤC 4. Ví dụ: <mark class="bg-emerald-200 text-emerald-900 px-1 rounded font-semibold">Trust<sup class="text-xs ml-0.5">1</sup></mark>. (Số 1 màu xanh tương ứng với số 1 màu xám ở mục 4 để khoe cấu trúc xịn). -->
  </div>

  <h3 class="font-semibold text-emerald-700 mb-2">6. Giải thích cấu trúc nâng cấp:</h3>
  <ul class="space-y-3">
    <!-- Giải thích chi tiết các từ vựng C1/C2 và cấu trúc ngữ pháp nâng cao vừa được sử dụng ở mục 5. KHÔNG DÙNG NGOẶC KÉP để trích dẫn từ vựng. Mọi từ/cụm từ tiếng Anh được nhắc đến BẮT BUỘC phải đặt trong thẻ <mark> có màu và số thứ tự tương ứng y như trên. -->
  </ul>
</div>\`;`;

if (c.includes(oldPrompt)) {
    c = c.replace(oldPrompt, newPrompt);
    console.log("Prompt replaced successfully.");
} else {
    console.log("Could not find oldPrompt");
}

fs.writeFileSync('pga.html', c);
console.log("Sticky and prompt applied.");
