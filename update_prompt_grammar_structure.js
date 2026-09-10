const fs = require('fs');

let html = fs.readFileSync('pga.html', 'utf8');

const oldBlockRegex = /<div class="mt-3 text-slate-700 leading-relaxed">[\s\S]*?<\/div>\s*<\/div>`;/g;

const newBlock = `<div class="mt-3 text-slate-700 leading-relaxed">
      <div class="text-xs text-slate-600 mb-1 uppercase tracking-wide font-bold"><i class="fa-solid fa-lightbulb mr-1"></i>Mở rộng từ vựng & Cấu trúc hay:</div>
      <div class="p-4 bg-white border border-slate-200 rounded-lg text-slate-800 text-sm shadow-sm ai-vocab-expansion">
          <!-- BẮT BUỘC BẠN PHẢI TRẢ VỀ ĐÚNG 2 PHẦN BẰNG ĐỊNH DẠNG HTML BÊN DƯỚI BÊN TRONG THẺ NÀY:

          <div class="mb-2 font-bold text-indigo-700"><i class="fa-solid fa-layer-group mr-1"></i>1. Cấu trúc câu gốc:</div>
          <ul class="list-disc pl-5 mb-4 space-y-1">
              <li><span class="font-bold text-brand-600">In response to something</span>: để phản hồi lại cái gì, nhằm hồi đáp cho cái gì (ví dụ)</li>
              <!-- Trích xuất, liệt kê và giải thích bằng tiếng Việt các cụm từ (phrasal verbs, idioms, collocations), cấu trúc ngữ pháp hay từ CÂU MẪU GỐC. -->
          </ul>

          <div class="mb-2 font-bold text-indigo-700"><i class="fa-solid fa-not-equal mr-1"></i>2. So sánh từ vựng:</div>
          <ul class="list-disc pl-5 space-y-1">
              <li><span class="font-bold text-brand-600">từ của học sinh</span> vs <span class="font-bold text-brand-600">từ của câu gốc</span>: Giải thích sự khác biệt...</li>
              <!-- So sánh sự khác biệt sắc thái và ngữ cảnh giữa từ vựng học sinh dùng và từ vựng câu gốc (nếu có). -->
          </ul>
          -->
      </div>
  </div>\`;`;

if (html.match(oldBlockRegex)) {
    html = html.replace(oldBlockRegex, newBlock);
    fs.writeFileSync('pga.html', html);
    console.log('Successfully updated the prompt colors in pga.html!');
} else {
    console.log('Could not find the target block in pga.html. Regex might be wrong.');
}
