const fs = require('fs');
['index.html', 'pga.html', 'tudongnghia.html'].forEach(f => {
    let c = fs.readFileSync(f, 'utf8');
    if (!c.includes('<meta name="referrer"')) {
        c = c.replace('<head>', '<head>\n    <meta name="referrer" content="no-referrer">');
        fs.writeFileSync(f, c);
        console.log('Fixed ' + f);
    }
});
