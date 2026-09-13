const fs = require('fs');
let html = fs.readFileSync('pga.html', 'utf8');

// Update quote highlighting to yellow
const oldHighlightInstr = `Đặc biệt, trong phần giải thích (các bullet points), BẤT CỨ KHI NÀO BẠN TRÍCH DẪN từ vựng, cấu trúc, hoặc câu văn tiếng Anh (đặt trong ngoặc kép "..." hoặc ngoặc đơn), BẮT BUỘC phải bôi đậm và tô màu khác biệt bằng thẻ <strong class="text-rose-600 bg-rose-50 px-1 rounded">"trích dẫn"</strong> để làm nổi bật sự khác biệt giữa tiếng Anh và tiếng Việt.`;
const newHighlightInstr = `Đặc biệt, BẤT CỨ KHI NÀO BẠN TRÍCH DẪN từ vựng, cấu trúc tiếng Anh (đặt trong ngoặc kép "..."), BẮT BUỘC phải bôi đậm và tô màu vàng bằng thẻ <strong class="text-amber-600 bg-amber-50 px-1 rounded">"trích dẫn"</strong> để làm nổi bật.`;
html = html.replace(oldHighlightInstr, newHighlightInstr);

// Update Câu gốc to blue
const oldCauGoc = `<span class="text-slate-700">"[Trích dẫn TOÀN BỘ câu chứa cấu trúc, nhưng <strong style="color: [MÀU KHỚP PHẦN 1];">phần cấu trúc/từ vựng đang được phân tích</strong> phải được bôi đậm và tô màu nổi bật]"</span>`;
const newCauGoc = `<span class="text-blue-600">"[Trích dẫn TOÀN BỘ câu chứa cấu trúc, trong đó phần cấu trúc đang được phân tích BẮT BUỘC phải bọc trong ngoặc kép và tô màu vàng như đã hướng dẫn]"</span>`;
html = html.replace(oldCauGoc, newCauGoc);

// Also make sure to update it if the previous replace didn't match perfectly
if (html.includes(oldCauGoc)) {
    console.log("Replaced Cau Goc successfully");
} else {
    console.log("Could not find exact Cau Goc string");
}

fs.writeFileSync('pga.html', html);
