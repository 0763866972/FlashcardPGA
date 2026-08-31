const fs = require('fs');
const path = 'd:/GIT/FlashcardPGA/index.html';
let content = fs.readFileSync(path, 'utf8');

// Update fcWord
content = content.replace(
    '<h2 id="fcWord"\n                                        class="text-5xl font-black text-white text-center break-words relative inline-flex items-center justify-center max-w-full"',
    '<h2 id="fcWord"\n                                        class="text-5xl font-black text-white text-left break-words w-full relative flex items-center justify-start max-w-full"'
);

// Update fcMeaning
content = content.replace(
    '<h2 id="fcMeaning"\n                                    class="text-4xl font-bold text-white text-center break-words w-full leading-relaxed">',
    '<h2 id="fcMeaning"\n                                    class="text-4xl font-bold text-white text-left break-words w-full leading-relaxed">'
);

// Update fcGoogleTrans
content = content.replace(
    '<div id="fcGoogleTrans"\n                                    class="hidden text-xl text-emerald-400 mt-4 font-medium opacity-90 text-center w-full">',
    '<div id="fcGoogleTrans"\n                                    class="hidden text-xl text-emerald-400 mt-4 font-medium opacity-90 text-left w-full">'
);

// Update fcAiExample just to be safe
content = content.replace(
    '<div id="fcAiExample"\n                                    class="hidden w-full max-w-[90%] mt-6 text-center p-4 bg-slate-950/40 border border-slate-700/50 rounded-xl shadow-inner relative group flex flex-col gap-2">',
    '<div id="fcAiExample"\n                                    class="hidden w-full max-w-[90%] mt-6 text-left p-4 bg-slate-950/40 border border-slate-700/50 rounded-xl shadow-inner relative group flex flex-col gap-2">'
);

// Also remove the `justify-center` from the parent container if there is one that forces center?
// The parent is `flex flex-col items-center justify-center p-10`.
// If I change items-center to items-start, the content will stick to the left.
content = content.replace(
    'col-start-1 row-start-1 w-full h-full bg-gradient-to-br from-brand-900 to-indigo-900 border-2 border-brand-500/50 rounded-3xl shadow-[0_0_40px_rgba(99,102,241,0.2)] flex flex-col items-center justify-center p-10 backface-hidden rotate-y-180',
    'col-start-1 row-start-1 w-full h-full bg-gradient-to-br from-brand-900 to-indigo-900 border-2 border-brand-500/50 rounded-3xl shadow-[0_0_40px_rgba(99,102,241,0.2)] flex flex-col items-start justify-center p-10 backface-hidden rotate-y-180'
);

content = content.replace(
    'col-start-1 row-start-1 w-full h-full bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-slate-700 rounded-3xl shadow-2xl flex flex-col items-center justify-center p-10 backface-hidden',
    'col-start-1 row-start-1 w-full h-full bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-slate-700 rounded-3xl shadow-2xl flex flex-col items-start justify-center p-10 backface-hidden'
);


fs.writeFileSync(path, content, 'utf8');
console.log("Success");
