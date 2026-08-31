const fs = require('fs');
let lines = fs.readFileSync('index.html', 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '<span' && lines[i+1].includes('id="fcGenExampleBtn"')) {
        // Remove the hanging `<span`
        lines.splice(i, 1);
        console.log("Fixed hanging <span at line", i + 1);
        break;
    }
}

fs.writeFileSync('index.html', lines.join('\n'));
