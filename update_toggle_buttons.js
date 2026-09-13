const fs = require('fs');
let html = fs.readFileSync('pga.html', 'utf8');

// In toggleGrammarMode
// Remove hiding of buttons
html = html.replace(/if \(toggleDictBtn\) toggleDictBtn\.classList\.remove\('hidden'\);\n/g, '');
html = html.replace(/const tgb = document\.getElementById\('toggleGrammarBtn'\); if\(tgb\) tgb\.classList\.remove\('hidden'\);\n/g, '');
html = html.replace(/if \(toggleWritingBtn\) toggleWritingBtn\.classList\.remove\('hidden'\);\n/g, '');
html = html.replace(/if \(toggleDictBtn\) toggleDictBtn\.classList\.add\('hidden'\);\n/g, '');
html = html.replace(/if \(toggleWritingBtn\) toggleWritingBtn\.classList\.add\('hidden'\);\n/g, '');

// In toggleWritingMode
html = html.replace(/toggleDictBtn\.classList\.remove\('hidden'\);\n/g, '');
html = html.replace(/toggleDictBtn\.classList\.add\('hidden'\);\s*\/\/\s*ẩn nút đọc\n/g, '');
html = html.replace(/const tgb = document\.getElementById\('toggleGrammarBtn'\); if\(tgb\) tgb\.classList\.add\('hidden'\);\n/g, '');

// Also ensure toggleWritingMode turns off grammar mode if active
const toggleDictCheck = `        if (typeof isDictMode !== 'undefined' && isDictMode) {
            toggleDictMode();
        }`;
const toggleDictAndGrammarCheck = `        if (typeof isDictMode !== 'undefined' && isDictMode) {
            toggleDictMode();
        }
        if (typeof isGrammarMode !== 'undefined' && isGrammarMode) {
            toggleGrammarMode();
        }`;
html = html.replace(toggleDictCheck, toggleDictAndGrammarCheck);

fs.writeFileSync('pga.html', html);
console.log('Done!');
