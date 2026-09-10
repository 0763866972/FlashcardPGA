const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

const alternativeScript = `
<script>
document.addEventListener('click', (e) => {
    const keyBtn = document.getElementById('toggleKeyConfigBtn');
    const keyPanel = document.getElementById('keyConfigSection');
    if (keyBtn && keyPanel && !keyBtn.contains(e.target) && !keyPanel.contains(e.target)) {
        keyPanel.classList.add('hidden');
    }
});
</script>
`;

if (html.includes('</html>')) {
   html = html.replace('</html>', alternativeScript + '</html>');
   fs.writeFileSync('index.html', html);
   console.log('Added click outside listener to index.html');
}
