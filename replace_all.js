const fs = require('fs');
let text = fs.readFileSync('main.js', 'utf8');

// 1. handleAiOptionToggle
text = text.replace(
    "if (checkbox.id === 'aiHomToggle') localStorage.setItem('toeic_ai_hom_toggle', checkbox.checked);",
    "if (checkbox.id === 'aiHomToggle') localStorage.setItem('toeic_ai_hom_toggle', checkbox.checked);\n    if (checkbox.id === 'aiGrammarToggle') localStorage.setItem('toeic_ai_grammar_toggle', checkbox.checked);"
);

// 2. openAiContextModal variables
text = text.split("const aiHomToggle = document.getElementById('aiHomToggle');").join(
    "const aiHomToggle = document.getElementById('aiHomToggle');\n            const aiGrammarToggle = document.getElementById('aiGrammarToggle');"
);

// 3. openAiContextModal load state
const loadTarget = "if (aiHomToggle) {\n                aiHomToggle.checked = (localStorage.getItem('toeic_ai_hom_toggle_' + (typeof activeVocabGroupId !== 'undefined' ? activeVocabGroupId : 'default')) || localStorage.getItem('toeic_ai_hom_toggle')) !== 'false';\n                window.handleAiOptionToggle(aiHomToggle, 'trackHom', 'thumbHom');\n            }";
const loadReplace = loadTarget + "\n            if (aiGrammarToggle) {\n                aiGrammarToggle.checked = (localStorage.getItem('toeic_ai_grammar_toggle_' + (typeof activeVocabGroupId !== 'undefined' ? activeVocabGroupId : 'default')) || localStorage.getItem('toeic_ai_grammar_toggle')) !== 'false';\n                window.handleAiOptionToggle(aiGrammarToggle, 'trackGrammar', 'thumbGrammar');\n            }";
text = text.split(loadTarget).join(loadReplace);

// 4. closeAiContextModal save state
const saveTarget = "if (aiHomToggle) localStorage.setItem('toeic_ai_hom_toggle_' + (typeof activeVocabGroupId !== 'undefined' ? activeVocabGroupId : 'default'), aiHomToggle.checked);";
const saveReplace = saveTarget + "\n            if (aiGrammarToggle) localStorage.setItem('toeic_ai_grammar_toggle_' + (typeof activeVocabGroupId !== 'undefined' ? activeVocabGroupId : 'default'), aiGrammarToggle.checked);";
text = text.split(saveTarget).join(saveReplace);

// 5. Prompt wantGrammar declarations
const wantTarget = "let wantHom = document.getElementById('aiHomToggle') ? document.getElementById('aiHomToggle').checked : true;";
const wantReplace = wantTarget + "\n        let wantGrammar = document.getElementById('aiGrammarToggle') ? document.getElementById('aiGrammarToggle').checked : true;";
text = text.split(wantTarget).join(wantReplace);

// 6 & 7. Prompt targetMode logic
text = text.split("wantHom = false;\n        }").join("wantHom = false;\n            wantGrammar = false;\n        }");
text = text.split("wantSyn = false; wantFam = false; wantHom = false;").join("wantSyn = false; wantFam = false; wantHom = false; wantGrammar = false;");

// 8. Prompt instructions
const grammarInstruction = "\\n6. PHÂN TÍCH NGỮ PHÁP (Grammar Analysis): BẮT BUỘC TRẢ VỀ TRONG KEY 'grammar_analysis'. Dựa vào CÂU VÍ DỤ TIẾNG ANH CHÍNH (nằm trong mảng structures ở trên), hãy phân tích thật ngắn gọn cấu trúc ngữ pháp quan trọng nhất hoặc thì (tense) được sử dụng. Nếu trong câu có những cấu trúc như: Prefer to, Want to, Cấu trúc bị động, Đảo ngữ, Câu điều kiện, hoặc Tại sao lại dùng thì Hiện tại tiếp diễn, Hiện tại hoàn thành... hãy giải thích ngắn gọn lý do sử dụng cấu trúc/thì đó. Trả về dưới dạng chuỗi HTML đơn giản (chỉ dùng thẻ <b>, <i>, <br> nếu cần). Ví dụ: \\\"Dùng cấu trúc <b>Prefer to + V-inf</b> để diễn tả sự yêu thích. Câu dùng thì <b>Hiện tại đơn</b> vì...\\\"";

text = text.replace(
    /if \(wantHom\) taskInstructions \+= [^]+homophones'\.;/g,
    "$&" + "\n        if (wantGrammar) taskInstructions += " + grammarInstruction + ";"
);

// 9. Prompt JSON structure
const jsonTarget = 'if (wantHom) {\n            jsonStructure += ,\n      "homophones": [\n        { "word": "từ đồng âm/nhầm lẫn", "vi": "nghĩa tiếng việt khác hoàn toàn" }\n      ];\n        }';
const jsonReplace = jsonTarget + '\n        if (wantGrammar) {\n            jsonStructure += ,\n      "grammar_analysis": "Giải thích ngữ pháp (dạng HTML)";\n        }';
text = text.split(jsonTarget).join(jsonReplace);

// 10. Display Logic
const displayTarget = "document.getElementById('fcExVi').innerHTML = viHtml;\n            aiExContainer.classList.remove('hidden');";
const displayReplace = displayTarget + "\n\n            const grammarContainer = document.getElementById('fcGrammarAnalysis');\n            const grammarContent = document.getElementById('fcGrammarContent');\n            if (grammarContainer && grammarContent) {\n                if (card.aiExample && card.aiExample.grammar_analysis) {\n                    grammarContent.innerHTML = card.aiExample.grammar_analysis;\n                    grammarContainer.classList.remove('hidden');\n                } else {\n                    grammarContainer.classList.add('hidden');\n                }\n            }";
text = text.split(displayTarget).join(displayReplace);

fs.writeFileSync('main.js', text, 'utf8');
