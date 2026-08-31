const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

content = content.replace(
    `class="hidden w-full max-w-[90%] mt-6 text-left p-4 bg-slate-950/40 border border-slate-700/50 rounded-xl shadow-inner relative group flex flex-col gap-2"`,
    `class="hidden w-full max-w-[90%] mt-6 text-justify p-4 bg-slate-950/40 border border-slate-700/50 rounded-xl shadow-inner relative group flex flex-col gap-2"`
);

// If user said "căn giữa", usually for paragraphs they mean `text-justify` so the edges are straight, 
// OR they literally mean `text-center`. Let's actually use `text-center` since they said "căn giữa".
content = content.replace(
    `class="hidden w-full max-w-[90%] mt-6 text-justify p-4 bg-slate-950/40 border border-slate-700/50 rounded-xl shadow-inner relative group flex flex-col gap-2"`,
    `class="hidden w-full max-w-[90%] mt-6 text-center p-4 bg-slate-950/40 border border-slate-700/50 rounded-xl shadow-inner relative group flex flex-col gap-2"`
);
content = content.replace(
    `class="hidden w-full max-w-[90%] mt-6 text-left p-4 bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-700/50 rounded-xl shadow-inner relative group flex flex-col gap-2"`,
    `class="hidden w-full max-w-[90%] mt-6 text-center p-4 bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-700/50 rounded-xl shadow-inner relative group flex flex-col gap-2"`
);

// Replace pr-8 with px-8 for balance
content = content.replace(
    `class="text-base font-semibold text-brand-300 italic leading-relaxed transition-all duration-300 pr-8"`,
    `class="text-base font-semibold text-brand-300 italic leading-relaxed transition-all duration-300 px-8"`
);
content = content.replace(
    `class="text-sm text-slate-400 leading-relaxed transition-all duration-300 pr-8 pt-1"`,
    `class="text-sm text-slate-400 leading-relaxed transition-all duration-300 px-8 pt-1"`
);

fs.writeFileSync('index.html', content);
console.log("Aligned center!");
