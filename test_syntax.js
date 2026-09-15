const fs = require('fs');
const html = fs.readFileSync('pga.html', 'utf8');
const scripts = html.match(/<script\b[^>]*>([\s\S]*?)<\/script>/gi);
scripts.forEach((s, i) => {
    let code = s.replace(/<script\b[^>]*>/i, '').replace(/<\/script>/i, '');
    try {
        new Function(code);
        console.log(`Script ${i} is OK`);
    } catch(e) {
        console.error(`Script ${i} Error:`, e.message);
    }
});
