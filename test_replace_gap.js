const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// Header mb-6 -> mb-2
content = content.replace(
    /class="w-full flex justify-between items-start mb-6 shrink-0"/,
    'class="w-full flex justify-between items-start mb-2 shrink-0"'
);

// Center Content pt-8 -> pt-2
content = content.replace(
    /class="flex-1 flex flex-col items-center justify-start w-full relative z-0 pt-8 pb-4"/,
    'class="flex-1 flex flex-col items-center justify-start w-full relative z-0 pt-2 pb-4"'
);

fs.writeFileSync('index.html', content, 'utf8');
