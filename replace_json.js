const fs = require('fs');
let text = fs.readFileSync('main.js', 'utf8');

// Normalize CRLF to LF
text = text.replace(/\r\n/g, '\n');

// 9. Prompt JSON structure
const jsonTarget = 'if (wantHom) {\n            jsonStructure += ,\n      "homophones": [\n        { "word": "từ đồng âm/nhầm lẫn", "vi": "nghĩa tiếng việt khác hoàn toàn" }\n      ];\n        }';
const jsonReplace = jsonTarget + '\n        if (wantGrammar) {\n            jsonStructure += ,\n      "grammar_analysis": "Giải thích ngữ pháp (dạng HTML)";\n        }';
text = text.split(jsonTarget).join(jsonReplace);

// 10. Display Logic
const displayTarget = "document.getElementById('fcExVi').innerHTML = viHtml;\n            aiExContainer.classList.remove('hidden');";
const displayReplace = displayTarget + "\n\n            const grammarContainer = document.getElementById('fcGrammarAnalysis');\n            const grammarContent = document.getElementById('fcGrammarContent');\n            if (grammarContainer && grammarContent) {\n                if (card.aiExample && card.aiExample.grammar_analysis) {\n                    grammarContent.innerHTML = card.aiExample.grammar_analysis;\n                    grammarContainer.classList.remove('hidden');\n                } else {\n                    grammarContainer.classList.add('hidden');\n                }\n            }";
text = text.split(displayTarget).join(displayReplace);

// We can convert back to CRLF if needed, but saving as LF is fine.
fs.writeFileSync('main.js', text, 'utf8');
