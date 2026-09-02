const fs = require('fs');
let mainContent = fs.readFileSync('main.js', 'utf8');

const regex = /\/\/ L.*y v.* tr.* n.*t flashcard.*?\n[\s\S]*?modal\.style\.left = \(btnRect\.right \+ 20\) \+ 'px';/g;

if (mainContent.match(regex)) {
    mainContent = mainContent.replace(regex, `modal.classList.remove('hidden');`);
    fs.writeFileSync('main.js', mainContent);
    console.log("Removed manual positioning logic from main.js");
} else {
    console.log("Could not find the positioning logic in main.js");
}
