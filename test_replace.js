const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

content = content.replace(
    /id="flashcard"\s*class="w-full max-w-3xl h-\[420px\] shrink-0 relative cursor-pointer transform-style-3d transition-transform duration-500"/,
    'id="flashcard"\n                            class="w-full max-w-3xl min-h-[420px] shrink-0 grid cursor-pointer transform-style-3d transition-transform duration-500"'
);

content = content.replace(
    /id="fcFront"\s*class="absolute inset-0 bg-slate-800 border-2 border-slate-700 rounded-3xl shadow-2xl flex flex-col items-center justify-center p-10 backface-hidden"/,
    'id="fcFront"\n                                class="col-start-1 row-start-1 w-full h-full bg-slate-800 border-2 border-slate-700 rounded-3xl shadow-2xl flex flex-col items-center justify-center p-10 backface-hidden"'
);

const oldBack =                             <!-- Back (Meaning) -->
                            <div id="fcBack"
                                class="absolute inset-0 bg-gradient-to-br from-brand-900 to-indigo-900 border-2 border-brand-500/50 rounded-3xl shadow-[0_0_40px_rgba(99,102,241,0.2)] flex flex-col items-center justify-center p-10 backface-hidden rotate-y-180">
                                <span
                                    class="absolute top-6 left-6 text-[#2f75b5] text-sm font-bold uppercase tracking-widest"><i
                                        class="fa-solid fa-spell-check"></i> Định Nghĩa</span>
                                <div class="absolute top-6 right-6 flex items-center gap-2 z-10" onclick="event.stopPropagation()">
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
                                <h2 id="fcMeaning"
                                    class="text-4xl font-bold text-white text-center break-words w-full leading-relaxed">
                                    MEANING</h2>
                                <div id="fcGoogleTrans"
                                    class="hidden text-xl text-emerald-400 mt-4 font-medium opacity-90 text-center w-full">
                                </div>;

const newBack =                             <!-- Back (Meaning) -->
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
                                <div class="flex-1 flex flex-col items-center justify-center w-full">
                                    <h2 id="fcMeaning"
                                        class="text-4xl font-bold text-white text-center break-words w-full leading-relaxed">
                                        MEANING</h2>
                                    <div id="fcGoogleTrans"
                                        class="hidden text-xl text-emerald-400 mt-4 font-medium opacity-90 text-center w-full">
                                    </div>;

content = content.replace(oldBack, newBack);

// Also we need to close the extra div for the center content
// We can just add </div> before <!-- AI Example Box -->
content = content.replace(
    /                                <!-- AI Example Box -->/g,
    '                                <!-- AI Example Box -->\n                                </div>\n\n                                <!-- AI Example Box -->'
);

// Wait! If I just add </div> before AI Example Box, it closes the flex-1 div, meaning AI example box will NOT be centered vertically. It will be pushed down.
// BUT that's exactly what we want! We want the AI Example Box to be below the center content or inside it?
// Actually, AI Example Box was originally part of the flex container (which was centering everything). If we put it inside the flex-1 div, it will also be centered along with the MEANING. Yes, let's keep it inside the flex-1 div. Let's NOT close the div before AI Example Box. We should close it at the very end of fcBack!

fs.writeFileSync('index.html', content, 'utf8');
