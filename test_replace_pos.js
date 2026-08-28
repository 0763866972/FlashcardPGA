const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// The Center content div:
// <div class="flex-1 flex flex-col items-center justify-center w-full relative z-0">
// Change to justify-start pt-8
content = content.replace(
    /class="flex-1 flex flex-col items-center justify-center w-full relative z-0"/,
    'class="flex-1 flex flex-col items-center justify-start w-full relative z-0 pt-8 pb-4"'
);

// The Footer
// <p class="mt-8 text-brand-300/70 text-sm">Click để lật lại</p>
// </div>
// Change to put the footer in its own container outside
content = content.replace(
    /<p class="mt-8 text-brand-300\/70 text-sm">Click để lật lại<\/p>\r?\n\s*<\/div>/,
    '</div>\n\n                                <div class="w-full text-center shrink-0 mt-auto pt-4">\n                                    <p class="text-brand-300/70 text-sm">Click để lật lại</p>\n                                </div>'
);

// Also we should check if fcFront has a hint.
// Yes, fcFront has <p id="fcFrontHint" class="mt-6 text-slate-400 text-sm transition-all duration-300">
// We might want to fix fcFront too so it's consistent?
// The user only complained about the definition side (phòng thí nghiệm).
// I will just do the back side for now.

fs.writeFileSync('index.html', content, 'utf8');
