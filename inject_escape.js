const fs = require('fs');
let pga = fs.readFileSync('pga.html', 'utf8');
if (!pga.includes('function escapeHTML(str) {') && !pga.includes('window.escapeHTML = function(str) {')) {
    const replacement = `window.escapeHTML = function(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
    }[tag] || tag));
};

window.renderWritingMode = function(sentences, rawText) {`;
    pga = pga.replace('window.renderWritingMode = function(sentences, rawText) {', replacement);
    fs.writeFileSync('pga.html', pga);
    console.log('Added escapeHTML');
} else {
    console.log('Already exists');
}
