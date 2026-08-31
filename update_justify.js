const fs = require('fs');
const path = 'd:/GIT/FlashcardPGA/index.html';
let content = fs.readFileSync(path, 'utf8');

// The elements I changed to text-left earlier were:
// fcWord, fcMeaning, fcGoogleTrans, fcAiExample.
// I will change them to text-justify.

content = content.replace(
    '<h2 id="fcWord"\n                                        class="text-5xl font-black text-white text-left break-words w-full relative flex items-center justify-start max-w-full"',
    '<h2 id="fcWord"\n                                        class="text-5xl font-black text-white text-justify break-words w-full relative flex items-center justify-start max-w-full"'
);

content = content.replace(
    '<h2 id="fcMeaning"\n                                    class="text-4xl font-bold text-white text-left break-words w-full leading-relaxed">',
    '<h2 id="fcMeaning"\n                                    class="text-4xl font-bold text-white text-justify break-words w-full leading-relaxed">'
);

content = content.replace(
    '<div id="fcGoogleTrans"\n                                    class="hidden text-xl text-emerald-400 mt-4 font-medium opacity-90 text-left w-full">',
    '<div id="fcGoogleTrans"\n                                    class="hidden text-xl text-emerald-400 mt-4 font-medium opacity-90 text-justify w-full">'
);

content = content.replace(
    '<div id="fcAiExample"\n                                    class="hidden w-full max-w-[90%] mt-6 text-left p-4 bg-slate-950/40 border border-slate-700/50 rounded-xl shadow-inner relative group flex flex-col gap-2">',
    '<div id="fcAiExample"\n                                    class="hidden w-full max-w-[90%] mt-6 text-justify p-4 bg-slate-950/40 border border-slate-700/50 rounded-xl shadow-inner relative group flex flex-col gap-2">'
);

fs.writeFileSync(path, content, 'utf8');
console.log("Success");
