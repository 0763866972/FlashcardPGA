const fs = require('fs');
let html = fs.readFileSync('pga.html', 'utf8');

// 1. Update instruction for highlighting in explanations
const oldHighlightInstr = `Đặc biệt, trong phần giải thích (các bullet points), BẤT CỨ KHI NÀO BẠN TRÍCH DẪN từ vựng, cấu trúc, hoặc câu văn tiếng Anh (đặt trong ngoặc kép "..." hoặc ngoặc đơn), BẮT BUỘC phải bôi đậm và tô màu xanh dương đậm hoặc tím bằng thẻ <strong class="text-indigo-600">"trích dẫn"</strong> để làm nổi bật sự khác biệt giữa tiếng Anh và tiếng Việt.`;
const newHighlightInstr = `Đặc biệt, trong phần giải thích (các bullet points), BẤT CỨ KHI NÀO BẠN TRÍCH DẪN từ vựng, cấu trúc, hoặc câu văn tiếng Anh (đặt trong ngoặc kép "..." hoặc ngoặc đơn), BẮT BUỘC phải bôi đậm và tô màu khác biệt bằng thẻ <strong class="text-rose-600 bg-rose-50 px-1 rounded">"trích dẫn"</strong> để làm nổi bật sự khác biệt giữa tiếng Anh và tiếng Việt.`;
html = html.replace(oldHighlightInstr, newHighlightInstr);

// 2. Update template for Câu gốc
const oldCauGoc = `<strong style="color: [MÀU KHỚP PHẦN 1];">"[Trích dẫn câu chứa cấu trúc]"</strong>`;
const newCauGoc = `<span class="text-slate-700">"[Trích dẫn TOÀN BỘ câu chứa cấu trúc, nhưng <strong style="color: [MÀU KHỚP PHẦN 1];">phần cấu trúc/từ vựng đang được phân tích</strong> phải được bôi đậm và tô màu nổi bật]"</span>`;
html = html.replace(oldCauGoc, newCauGoc);

fs.writeFileSync('pga.html', html);
console.log('Prompt updated!');
