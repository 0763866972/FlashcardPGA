const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

content = content.replace(
    'class="w-full max-w-3xl h-[420px] shrink-0 relative cursor-pointer transform-style-3d transition-transform duration-500"',
    'class="w-full max-w-3xl min-h-[420px] shrink-0 grid cursor-pointer transform-style-3d transition-transform duration-500"'
);

content = content.replace(
    'id="fcFront"\r\n                                class="absolute inset-0 bg-slate-800 border-2 border-slate-700 rounded-3xl shadow-2xl flex flex-col items-center justify-center p-10 backface-hidden"',
    'id="fcFront"\r\n                                class="col-start-1 row-start-1 w-full h-full bg-slate-800 border-2 border-slate-700 rounded-3xl shadow-2xl flex flex-col items-center justify-center p-10 backface-hidden"'
);

content = content.replace(
    'id="fcFront"\n                                class="absolute inset-0 bg-slate-800 border-2 border-slate-700 rounded-3xl shadow-2xl flex flex-col items-center justify-center p-10 backface-hidden"',
    'id="fcFront"\n                                class="col-start-1 row-start-1 w-full h-full bg-slate-800 border-2 border-slate-700 rounded-3xl shadow-2xl flex flex-col items-center justify-center p-10 backface-hidden"'
);

const targetBack = 'id="fcBack"\r\n                                class="absolute inset-0 bg-gradient-to-br from-brand-900 to-indigo-900 border-2 border-brand-500/50 rounded-3xl shadow-[0_0_40px_rgba(99,102,241,0.2)] flex flex-col items-center justify-center p-10 backface-hidden rotate-y-180"';
const newBack = 'id="fcBack"\r\n                                class="col-start-1 row-start-1 w-full h-full bg-gradient-to-br from-brand-900 to-indigo-900 border-2 border-brand-500/50 rounded-3xl shadow-[0_0_40px_rgba(99,102,241,0.2)] flex flex-col p-10 backface-hidden rotate-y-180"';
content = content.replace(targetBack, newBack);
content = content.replace(targetBack.replace(/\r/g, ''), newBack.replace(/\r/g, ''));

const targetSpan = '<span\r\n                                    class="absolute top-6 left-6 text-[#2f75b5] text-sm font-bold uppercase tracking-widest">';
const newSpan = '<div class="w-full flex justify-between items-start mb-6 shrink-0">\n                                    <span class="text-[#2f75b5] text-sm font-bold uppercase tracking-widest mt-2">';
content = content.replace(targetSpan, newSpan);
content = content.replace(targetSpan.replace(/\r/g, ''), newSpan.replace(/\r/g, ''));

const targetButtons = '<div class="absolute top-6 right-6 flex items-center gap-2 z-10" onclick="event.stopPropagation()">';
const newButtons = '<div class="flex items-center gap-2 z-10" onclick="event.stopPropagation()">';
content = content.replace(targetButtons, newButtons);

const targetMeaning = '<h2 id="fcMeaning"';
const newMeaning = '</div>\n                                </div>\n\n                                <!-- Center Content -->\n                                <div class="flex-1 flex flex-col items-center justify-center w-full relative z-0">\n                                    <h2 id="fcMeaning"';
content = content.replace(targetMeaning, newMeaning);

const targetFooter = '<p class="mt-8 text-brand-300/70 text-sm">Click để lật lại</p>\r\n                            </div>';
const newFooter = '<p class="mt-8 text-brand-300/70 text-sm">Click để lật lại</p>\n                                </div>\n                            </div>';
content = content.replace(targetFooter, newFooter);
content = content.replace(targetFooter.replace(/\r/g, ''), newFooter.replace(/\r/g, ''));

fs.writeFileSync('index.html', content, 'utf8');
console.log('Script executed');
