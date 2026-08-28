const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

content = content.replace(
    /class="absolute inset-0 bg-slate-800 border-2 border-slate-700 rounded-3xl shadow-2xl flex flex-col items-center justify-center p-10 backface-hidden"/g,
    'class="col-start-1 row-start-1 w-full h-full bg-slate-800 border-2 border-slate-700 rounded-3xl shadow-2xl flex flex-col items-center justify-center p-10 backface-hidden"'
);

const oldBackRegex = /<!-- Back \(Meaning\) -->\s*<div id="fcBack"[\s\S]*?<h2 id="fcMeaning"[\s\S]*?MEANING<\/h2>\s*<div id="fcGoogleTrans"[\s\S]*?<\/div>/;

const newBack = \<!-- Back (Meaning) -->
                            <div id="fcBack"
                                class="col-start-1 row-start-1 w-full h-full bg-gradient-to-br from-brand-900 to-indigo-900 border-2 border-brand-500/50 rounded-3xl shadow-[0_0_40px_rgba(99,102,241,0.2)] flex flex-col p-10 backface-hidden rotate-y-180">
                                
                                <!-- Top row: Định nghĩa & actions -->
                                <div class="w-full flex justify-between items-start mb-6 shrink-0">
                                    <span class="text-[#2f75b5] text-sm font-bold uppercase tracking-widest mt-2"><i class="fa-solid fa-spell-check"></i> Định Nghĩa</span>
                                    <div class="flex items-center gap-2 z-10" onclick="event.stopPropagation()">
                                        <button onclick="toggleFcStar(event)"
                                            class="text-brand-300/70 hover:text-amber-400 text-2xl transition-colors p-2"
                                            title="Đánh dấu từ này">
                                            <i id="fcStarIconBack" class="fa-regular fa-star"></i>
                                        </button>
                                        <button onclick="speakMeaning(event)"
                                            class="text-brand-300/70 hover:text-white text-2xl transition-colors p-2"
                                            title="Đọc nghĩa (Tiếng Việt)">
                                            <i class="fa-solid fa-volume-high"></i>
                                        </button>
                                    </div>
                                </div>

                                <!-- Center Content -->
                                <div class="flex-1 flex flex-col items-center justify-center w-full relative z-0">
                                    <h2 id="fcMeaning"
                                        class="text-4xl font-bold text-white text-center break-words w-full leading-relaxed">
                                        MEANING</h2>
                                    <div id="fcGoogleTrans"
                                        class="hidden text-xl text-emerald-400 mt-4 font-medium opacity-90 text-center w-full">
                                    </div>\;

content = content.replace(oldBackRegex, newBack);

// Add closing div for the Center Content before <!-- AI Example Box -->
content = content.replace(
    /(\s*)<!-- AI Example Box -->/,
    '<!-- AI Example Box -->'
);
// Actually, let's close the center content div at the very end of fcBack.
// Where does fcBack end?
// Looking at the HTML, fcBack ends right before <!-- Bottom Navigation -->
const oldEndRegex = /<p id="fcBackHint" class="mt-6 text-slate-400 text-sm transition-all duration-300">[\s\S]*?Click để lật lại<\/p>\s*<\/div>/;
const newEnd = \<p id="fcBackHint" class="mt-6 text-slate-400 text-sm transition-all duration-300">
                                    Click để lật lại</p>
                                </div> <!-- end center content -->
                            </div>\;
                            
// Wait, the fcBackHint is inside the center content? Yes, it can be.
content = content.replace(
    /<p id="fcBackHint"[\s\S]*?Click.*?lật lại<\/p>\s*<\/div>/,
    \<p id="fcBackHint" class="mt-6 text-slate-400 text-sm transition-all duration-300">
                                    Click để lật lại</p>
                                </div>
                            </div>\
);

fs.writeFileSync('index.html', content, 'utf8');
