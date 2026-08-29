const fs = require('fs');
let content = fs.readFileSync('main.js', 'utf8');

content = content.replace(
    /let wantHom = document\.getElementById\('aiHomToggle'\) \? document\.getElementById\('aiHomToggle'\)\.checked : true;/g,
    "let wantHom = document.getElementById('aiHomToggle') ? document.getElementById('aiHomToggle').checked : true;\n        let wantGrammar = document.getElementById('aiGrammarToggle') ? document.getElementById('aiGrammarToggle').checked : true;"
);
content = content.replace(
    /wantHom = false;\n        \}/g,
    "wantHom = false;\n            wantGrammar = false;\n        }"
);
content = content.replace(
    /if \(wantHom\) taskInstructions \+= \.*?homophones'\.\;/,
    "$&" + \n        if (wantGrammar) taskInstructions += \\\n6. PHÂN TÍCH NGỮ PHÁP (Grammar Analysis): BẮT BUỘC TRẢ VỀ TRONG KEY 'grammar_analysis'. Dựa vào CÂU VÍ DỤ TIẾNG ANH CHÍNH (nằm trong mảng structures ở trên), hãy phân tích thật ngắn gọn cấu trúc ngữ pháp quan trọng nhất hoặc thì (tense) được sử dụng. Nếu trong câu có những cấu trúc như: Prefer to, Want to, Cấu trúc bị động, Đảo ngữ, Câu điều kiện, hoặc Tại sao lại dùng thì Hiện tại tiếp diễn, Hiện tại hoàn thành... hãy giải thích ngắn gọn lý do sử dụng cấu trúc/thì đó. Trả về dưới dạng chuỗi HTML đơn giản (chỉ dùng thẻ <b>, <i>, <br> nếu cần). Ví dụ: "Dùng cấu trúc <b>Prefer to + V-inf</b> để diễn tả sự yêu thích. Câu dùng thì <b>Hiện tại đơn</b> vì..."\;
);
content = content.replace(
    /if \(wantHom\) \{\s*jsonStructure \+= \,\s*"homophones": \[\s*\{ "word".*? \}\s*\]\;\s*\}/s,
    "$&" + \n        if (wantGrammar) {\n            jsonStructure += \,\n      "grammar_analysis": "Giải thích ngữ pháp (dạng HTML)"\;\n        }
);

fs.writeFileSync('main.js', content, 'utf8');
