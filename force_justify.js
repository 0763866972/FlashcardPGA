const fs = require('fs');

// Update main.js
let mainJs = fs.readFileSync('d:/GIT/FlashcardPGA/main.js', 'utf8');
mainJs = mainJs.replace(/meaningEl\.className = "(.*?) text-center (.*?)";/g, 'meaningEl.className = "$1 text-justify $2";');
fs.writeFileSync('d:/GIT/FlashcardPGA/main.js', mainJs, 'utf8');

// Update index.html
let indexHtml = fs.readFileSync('d:/GIT/FlashcardPGA/index.html', 'utf8');
indexHtml = indexHtml.replace(/<h2 id="fcMeaning"([\s\S]*?)class="([\s\S]*?)text-center([\s\S]*?)"/g, '<h2 id="fcMeaning"$1class="$2text-justify$3"');
indexHtml = indexHtml.replace(/<h2 id="fcWord"([\s\S]*?)class="([\s\S]*?)text-center([\s\S]*?)"/g, '<h2 id="fcWord"$1class="$2text-justify$3"');
indexHtml = indexHtml.replace(/<div id="fcGoogleTrans"([\s\S]*?)class="([\s\S]*?)text-center([\s\S]*?)"/g, '<div id="fcGoogleTrans"$1class="$2text-justify$3"');
indexHtml = indexHtml.replace(/<div id="fcAiExample"([\s\S]*?)class="([\s\S]*?)text-center([\s\S]*?)"/g, '<div id="fcAiExample"$1class="$2text-justify$3"');
indexHtml = indexHtml.replace(/<div id="fcAiExample"([\s\S]*?)class="([\s\S]*?)text-left([\s\S]*?)"/g, '<div id="fcAiExample"$1class="$2text-justify$3"');

fs.writeFileSync('d:/GIT/FlashcardPGA/index.html', indexHtml, 'utf8');
console.log("Success");
