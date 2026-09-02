const fs = require('fs');
let content = fs.readFileSync('pga.html', 'utf8');

const targetStr = `let isWritingMode = false;`;
const insertStr = `let isWritingMode = false;

window.getApiKey = function() {
    if (typeof getStorageKeyForModel !== 'function') return null;
    const storageKey = getStorageKeyForModel();
    const apiKeyRaw = localStorage.getItem(storageKey);
    if (!apiKeyRaw) return null;
    const keysArray = apiKeyRaw.split(',').map(k => k.trim()).filter(k => k);
    if (keysArray.length === 0) return null;
    window.clickKeyIndex = window.clickKeyIndex || 0;
    const apiKey = keysArray[window.clickKeyIndex % keysArray.length];
    window.clickKeyIndex++;
    return apiKey;
};`;

if (content.includes(targetStr) && !content.includes('window.getApiKey = function()')) {
    content = content.replace(targetStr, insertStr);
    fs.writeFileSync('pga.html', content);
    console.log("Fixed getApiKey issue!");
} else {
    console.log("Not found or already fixed.");
}
