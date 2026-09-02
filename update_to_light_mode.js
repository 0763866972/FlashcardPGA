const fs = require('fs');
let content = fs.readFileSync('pga.html', 'utf8');

// Update renderWritingMode HTML
content = content.replace(/bg-slate-900\/90 rounded-xl w-full/g, 'bg-slate-50 border border-slate-200 rounded-xl w-full');
content = content.replace(/bg-slate-800 text-white p-3 pr-12 rounded-lg\s+border border-slate-600 focus:border-brand-500 outline-none/g, 'bg-white text-slate-800 p-3 pr-12 rounded-lg border border-slate-300 focus:border-brand-500 outline-none shadow-inner');
content = content.replace(/text-xs text-slate-400 italic/g, 'text-xs text-slate-500 italic');
content = content.replace(/bg-slate-950\/80 border\s+border-slate-700 leading-relaxed text-white/g, 'bg-white border border-slate-200 leading-relaxed text-slate-800 shadow-sm');

// Update loading text
content = content.replace(/<div class="flex items-center text-slate-400"><i class="fa-solid fa-circle-notch fa-spin mr-2"><\/i> AI đang phân tích ngữ pháp...<\/div>/g, '<div class="flex items-center text-slate-600"><i class="fa-solid fa-circle-notch fa-spin text-brand-500 mr-2"></i> AI đang phân tích ngữ pháp...</div>');

// Update systemPrompt HTML Template
content = content.replace(/bg-slate-800\/80 border border-slate-700/g, 'bg-slate-100 border border-slate-200');
content = content.replace(/text-slate-400 mb-1/g, 'text-slate-600 mb-1');
content = content.replace(/text-slate-300 leading-relaxed/g, 'text-slate-700 leading-relaxed');
content = content.replace(/<span class="text-emerald-400">/g, '<span class="text-emerald-600 font-semibold">');
content = content.replace(/<span class="text-rose-400 line-through">/g, '<span class="text-rose-600 line-through font-semibold">');
content = content.replace(/<span class="text-amber-400 font-bold">/g, '<span class="text-amber-600 font-bold">');
content = content.replace(/<span class="text-emerald-400 font-bold">Tuyệt vời!<\/span>/g, '<span class="text-emerald-600 font-bold">Tuyệt vời!</span>');

content = content.replace(/bg-emerald-950\/40 border border-emerald-900\/60 rounded-lg text-emerald-400/g, 'bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800');
content = content.replace(/bg-indigo-950\/40 border border-indigo-900\/60 rounded-lg text-indigo-300/g, 'bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-800');

fs.writeFileSync('pga.html', content);
console.log("Updated writing mode container to light theme!");
