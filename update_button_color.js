const fs = require('fs');
let indexContent = fs.readFileSync('index.html', 'utf8');

const regex = /<button onclick="closeAiContextModal\(true\)" class="([^"]*)text-white([^"]*)">/g;
if (indexContent.match(regex)) {
    indexContent = indexContent.replace(regex, `<button onclick="closeAiContextModal(true)" class="$1text-emerald-950$2">`);
    fs.writeFileSync('index.html', indexContent);
    console.log("Updated apply button text color to dark");
} else {
    console.log("Regex not found.");
}
