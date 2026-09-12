const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

const oldSelect = `<select id="vocabGroupSelect" onchange="changeVocabGroup()"
                            class="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 outline-none focus:border-brand-500 transition-colors">`;
const newSelect = `<select id="vocabGroupSelect" onchange="changeVocabGroup()"
                            class="flex-1 min-w-0 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 outline-none focus:border-brand-500 transition-colors">`;
html = html.replace(oldSelect, newSelect);

const oldBtn1 = `<button onclick="createNewGroup()"
                            class="bg-brand-600 hover:bg-brand-500 text-white px-3 py-2 rounded-lg text-sm transition-colors"`;
const newBtn1 = `<button onclick="createNewGroup()"
                            class="bg-brand-600 hover:bg-brand-500 text-white px-3 py-2 rounded-lg text-sm transition-colors shrink-0"`;
html = html.replace(oldBtn1, newBtn1);

const oldBtn2 = `<button onclick="renameCurrentGroup()"
                            class="bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-2 rounded-lg text-sm transition-colors"`;
const newBtn2 = `<button onclick="renameCurrentGroup()"
                            class="bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-2 rounded-lg text-sm transition-colors shrink-0"`;
html = html.replace(oldBtn2, newBtn2);

const oldBtn3 = `<button onclick="deleteCurrentGroup()"
                            class="bg-rose-600 hover:bg-rose-500 text-white px-3 py-2 rounded-lg text-sm transition-colors shadow-sm"`;
const newBtn3 = `<button onclick="deleteCurrentGroup()"
                            class="bg-rose-600 hover:bg-rose-500 text-white px-3 py-2 rounded-lg text-sm transition-colors shadow-sm shrink-0"`;
html = html.replace(oldBtn3, newBtn3);

fs.writeFileSync('index.html', html);
console.log('Fixed sidebar buttons overflowing issue in index.html');
