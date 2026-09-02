const fs = require('fs');

// Remove eye icon from index.html
let indexContent = fs.readFileSync('index.html', 'utf8');
indexContent = indexContent.replace(/<button onclick="toggleAllGrammarWriting\(event\)"[\s\S]*?<\/button>/, '');
fs.writeFileSync('index.html', indexContent);

// Remove injection logic from main.js
let mainContent = fs.readFileSync('main.js', 'utf8');

// Find the block starting with "const eyeBtn =" and ending with "parentDiv.insertAdjacentHTML('afterend', writingHTML);"
const regex = /const eyeBtn = document\.createElement\('button'\);[\s\S]*?parentDiv\.insertAdjacentHTML\('afterend', writingHTML\);/;
if(mainContent.match(regex)) {
    mainContent = mainContent.replace(regex, '');
    
    // Also remove the "Reset 'All' button state" part since it's no longer there
    const resetRegex = /\/\/ Reset 'All' button state[\s\S]*?grammarContainer\.classList\.remove\('hidden'\);/m;
    mainContent = mainContent.replace(resetRegex, 'grammarContainer.classList.remove(\'hidden\');');
    
    fs.writeFileSync('main.js', mainContent);
    console.log("Removed grammarEyeIcon logic from index.html and main.js");
} else {
    console.log("Could not find the injection block in main.js");
}
