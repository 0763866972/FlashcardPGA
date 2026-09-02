const fs = require('fs');
let mainJS = fs.readFileSync('main.js', 'utf8');

// Replace document.getElementById('vocabInput').value = savedVocab || '';
// with if (document.getElementById('vocabInput')) document.getElementById('vocabInput').value = savedVocab || '';
mainJS = mainJS.replace(/document\.getElementById\('vocabInput'\)\.value = savedVocab \|\| '';/g, "if (document.getElementById('vocabInput')) document.getElementById('vocabInput').value = savedVocab || '';");

mainJS = mainJS.replace(/document\.getElementById\('vocabInput'\)\.value = savedVocab;/g, "if (document.getElementById('vocabInput')) document.getElementById('vocabInput').value = savedVocab;");

mainJS = mainJS.replace(/document\.getElementById\('vocabInput'\)\.value = '';/g, "if (document.getElementById('vocabInput')) document.getElementById('vocabInput').value = '';");

fs.writeFileSync('main.js', mainJS);
console.log('Fixed DOM dependency error in main.js');
