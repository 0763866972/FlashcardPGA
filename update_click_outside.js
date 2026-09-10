const fs = require('fs');

function addClickOutside(filePath) {
    let html = fs.readFileSync(filePath, 'utf8');
    const targetScript = `document.addEventListener('click', () => hideDictTooltip());`;
    const newScript = `document.addEventListener('click', (e) => {
            hideDictTooltip();
            // Close API Key dropdown when clicking outside
            const keyBtn = document.getElementById('toggleKeyConfigBtn');
            const keyPanel = document.getElementById('keyConfigSection');
            if (keyBtn && keyPanel && !keyBtn.contains(e.target) && !keyPanel.contains(e.target)) {
                keyPanel.classList.add('hidden');
            }
        });`;

    if (html.includes(targetScript)) {
        html = html.replace(targetScript, newScript);
        fs.writeFileSync(filePath, html);
        console.log(`Added click outside listener to ${filePath}`);
    } else {
        // Fallback for index.html if hideDictTooltip is not there
        const scriptEndTag = `</script>\n</body>`;
        const alternativeScript = `
        document.addEventListener('click', (e) => {
            const keyBtn = document.getElementById('toggleKeyConfigBtn');
            const keyPanel = document.getElementById('keyConfigSection');
            if (keyBtn && keyPanel && !keyBtn.contains(e.target) && !keyPanel.contains(e.target)) {
                keyPanel.classList.add('hidden');
            }
        });
        `;
        if (html.includes('</script>\n</body>')) {
           html = html.replace('</script>\n</body>', alternativeScript + '</script>\n</body>');
           fs.writeFileSync(filePath, html);
           console.log(`Added click outside listener to ${filePath} (fallback)`);
        }
    }
}

addClickOutside('pga.html');
addClickOutside('index.html');
