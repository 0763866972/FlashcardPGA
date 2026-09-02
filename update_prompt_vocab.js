const fs = require('fs');
let content = fs.readFileSync('pga.html', 'utf8');

const originalBlock = `<div class="mb-1">
    <div class="text-xs text-slate-600 mb-1 uppercase tracking-wide font-bold"><i class="fa-solid fa-book-open mr-1"></i>CAu mu g\`c (Original):</div>
    <div class="p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-800 italic ai-original-text">
        <!-- In li CAu mu g\`c (Original sentence) -->
    </div>
</div>\`;`;

// The Vietnamese accents are probably mangled in reading, so let's use a regex instead of exact string replacement.
const regex = /<div class="mb-1">[\s\S]*?<!-- In l.*i CA.*u m.*u g.*c \(Original sentence\) -->[\s\S]*?<\/div>\n  <\/div>/;

const newSection = `
  <div class="mt-3 text-slate-700 leading-relaxed">
      <div class="text-xs text-slate-600 mb-1 uppercase tracking-wide font-bold"><i class="fa-solid fa-lightbulb mr-1"></i>Mở rộng & So sánh từ vựng:</div>
      <div class="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-sm ai-vocab-expansion">
          <!-- So sánh từ vựng học sinh dùng và câu gốc. Ví dụ "start to play" vs "take up". Giải thích sự khác biệt về sắc thái, độ tự nhiên, cách dùng. Nếu giống hệt nhau thì mở rộng thêm 1 từ đồng nghĩa hay. -->
      </div>
  </div>`;

// Actually, wait, let's just do a regex replace for the end of the systemPrompt string.
// It ends with `    </div>\n  </div>\`;`

content = content.replace(/<!-- In l(.)i C(.)u m(.)u g(.*)c \(Original sentence\) -->\r?\n\s*<\/div>\r?\n\s*<\/div>/, (match) => {
    return `${match}\n${newSection}`;
});

// Also make sure .ai-vocab-expansion is processed by the interactive words script!
// Look for `.ai-corrected-text, .ai-original-text, .ai-user-text`
content = content.replace(/\.ai-corrected-text, \.ai-original-text, \.ai-user-text/g, '.ai-corrected-text, .ai-original-text, .ai-user-text, .ai-vocab-expansion');
// And the fallback for background colors: div.bg-amber-50
content = content.replace(/div\.bg-slate-100/g, 'div.bg-slate-100, div.bg-amber-50');

fs.writeFileSync('pga.html', content);
console.log("Vocabulary expansion section added to AI prompt!");
