const fs = require('fs');
let c = fs.readFileSync('pga.html', 'utf8');
c = c.replace(/document\.getElementById\('aiDictBtn'\)\.classList\.add\('hidden'\);/g, "if(document.getElementById('aiDictBtn')) document.getElementById('aiDictBtn').classList.add('hidden');");
c = c.replace(/document\.getElementById\('aiDictBtn'\)\.classList\.remove\('flex'\);/g, "if(document.getElementById('aiDictBtn')) document.getElementById('aiDictBtn').classList.remove('flex');");
c = c.replace(/document\.getElementById\('aiDictBtn'\)\.classList\.remove\('hidden'\);/g, "if(document.getElementById('aiDictBtn')) document.getElementById('aiDictBtn').classList.remove('hidden');");
c = c.replace(/document\.getElementById\('aiDictBtn'\)\.classList\.add\('flex'\);/g, "if(document.getElementById('aiDictBtn')) document.getElementById('aiDictBtn').classList.add('flex');");
fs.writeFileSync('pga.html', c);
console.log('Done 2');
