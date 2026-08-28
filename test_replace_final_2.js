const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// 1. Change flashcard height and relative to grid
content = content.replace(
    'class="w-full max-w-3xl h-[420px] shrink-0 relative cursor-pointer transform-style-3d transition-transform duration-500"',
    'class="w-full max-w-3xl min-h-[420px] shrink-0 grid cursor-pointer transform-style-3d transition-transform duration-500"'
);

// 2. Change fcFront absolute to grid cell
content = content.replace(
    'id="fcFront"\r\n                                class="absolute inset-0 bg-slate-800 border-2 border-slate-700 rounded-3xl shadow-2xl flex flex-col items-center justify-center p-10 backface-hidden"',
    'id="fcFront"\r\n                                class="col-start-1 row-start-1 w-full h-full bg-slate-800 border-2 border-slate-700 rounded-3xl shadow-2xl flex flex-col items-center justify-center p-10 backface-hidden"'
);

// 3. Change fcBack absolute to grid cell
content = content.replace(
    'id="fcBack"\r\n                                class="absolute inset-0 bg-gradient-to-br from-brand-900 to-indigo-900 border-2 border-brand-500/50 rounded-3xl shadow-[0_0_40px_rgba(99,102,241,0.2)] flex flex-col items-center justify-center p-10 backface-hidden rotate-y-180"',
    'id="fcBack"\r\n                                class="col-start-1 row-start-1 w-full h-full bg-gradient-to-br from-brand-900 to-indigo-900 border-2 border-brand-500/50 rounded-3xl shadow-[0_0_40px_rgba(99,102,241,0.2)] flex flex-col items-center justify-center p-10 backface-hidden rotate-y-180"'
);

fs.writeFileSync('index.html', content, 'utf8');
