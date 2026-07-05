const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Tách file CSS
const styleStart = html.indexOf('<style>');
if (styleStart !== -1) {
    const styleEnd = html.indexOf('</style>', styleStart);
    if (styleEnd !== -1) {
        const css = html.substring(styleStart + 7, styleEnd).trim();
        fs.writeFileSync('styles.css', css);
        html = html.substring(0, styleStart) + '<link rel="stylesheet" href="styles.css">' + html.substring(styleEnd + 8);
        console.log('✅ Đã tách CSS sang file styles.css');
    }
}

// 2. Tách file JS (chỉ lấy script chính)
let scriptStart = html.lastIndexOf('<script>');
while (scriptStart !== -1) {
    const scriptEnd = html.indexOf('</script>', scriptStart);
    if (scriptEnd !== -1) {
        const js = html.substring(scriptStart + 8, scriptEnd);
        // Nhận diện script chính dựa trên từ khóa
        if (js.includes('let apiKey') || js.includes('flatQuestions')) {
            fs.writeFileSync('main.js', js.trim());
            html = html.substring(0, scriptStart) + '<script src="main.js"></script>' + html.substring(scriptEnd + 9);
            console.log('✅ Đã tách JS sang file main.js');
            break;
        }
    }
    scriptStart = html.lastIndexOf('<script>', scriptStart - 1);
}

fs.writeFileSync('index.html', html);
console.log('✅ Đã cập nhật lại file index.html');
