const fs = require('fs');

const replacementCode = `                            bTag.id = \`grammarEnSentence_\${idx}\`;
                            
                            let viTranslation = '';
                            
                            // Find all text after this bTag in the current LI or tempDiv
                            const container = bTag.closest('li') || tempDiv;
                            const containerHtml = container.innerHTML;
                            const bTagIdIdx = containerHtml.indexOf(bTag.id);
                            
                            if (bTagIdIdx !== -1) {
                                const htmlAfter = containerHtml.substring(bTagIdIdx);
                                const divTemp = document.createElement('div');
                                divTemp.innerHTML = htmlAfter;
                                const textAfter = divTemp.textContent;
                                
                                // Match everything after "Dịch" and ":" up to the next bullet point, newline, or "Cụm"
                                const match = textAfter.match(/Dịch[^:]*:\s*(.*?)(?=\n|•|(?:\s*-\s)|(?:\s*Cụm\s*")|$)/i);
                                if (match && match[1]) {
                                    viTranslation = match[1].trim();
                                }
                            }
                            
                            // Fallback if empty
                            if (!viTranslation) {
                                viTranslation = "Không tìm thấy nghĩa tiếng Việt.";
                            }`;

let mainJs = fs.readFileSync('d:/GIT/FlashcardPGA/main.js', 'utf8');

// We need to replace the old viTranslation logic:
const startString = `                            let viTranslation = '';
                            
                            // Look for Vietnamese translation in next siblings`;
                            
const endString = `                            bTag.id = \`grammarEnSentence_\${idx}\`;`;

const startIndex = mainJs.indexOf(startString);
const endIndex = mainJs.indexOf(endString) + endString.length;

if (startIndex !== -1 && endIndex !== -1) {
    mainJs = mainJs.substring(0, startIndex) + replacementCode + mainJs.substring(endIndex);
    fs.writeFileSync('d:/GIT/FlashcardPGA/main.js', mainJs, 'utf8');
    console.log("Success replacing viTranslation logic");
} else {
    console.log("Could not find start or end strings!");
}
