const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// The current fcBack:
const targetBackRegex = /<div id="fcBack"\s*class="col-start-1 row-start-1 w-full h-full bg-gradient-to-br from-brand-900 to-indigo-900 border-2 border-brand-500\/50 rounded-3xl shadow-\[0_0_40px_rgba\(99,102,241,0.2\)\] flex flex-col p-10 backface-hidden rotate-y-180">[\s\S]*?<div class="w-full text-center shrink-0 mt-auto pt-4">\s*<p class="text-brand-300\/70 text-sm">Click để lật lại<\/p>\s*<\/div>\s*<\/div>/;

const newBack = \<div id="fcBack"
                                class="col-start-1 row-start-1 w-full h-full bg-gradient-to-br from-brand-900 to-indigo-900 border-2 border-brand-500/50 rounded-3xl shadow-[0_0_40px_rgba(99,102,241,0.2)] flex flex-col items-center justify-center p-10 backface-hidden rotate-y-180">
                                <span class="absolute top-6 left-6 text-[#2f75b5] text-sm font-bold uppercase tracking-widest"><i class="fa-solid fa-spell-check"></i> Định Nghĩa</span>
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
                                </div>

                                <!-- AI Example Box -->
                                <div id="fcAiExample"
                                    class="hidden w-full max-w-[90%] mt-6 text-left p-4 bg-slate-950/40 border border-slate-700/50 rounded-xl shadow-inner relative group flex flex-col gap-2">
                                    <div class="relative">
                                        <button onclick="toggleListenModeEn(event)"
                                            class="absolute top-0 right-0 text-slate-500 hover:text-brand-400 transition-colors z-10"
                                            title="Che/hiện câu tiếng Anh">
                                            <i id="fcListenIconEn" class="fa-solid fa-eye"></i>
                                        </button>
                                        <p id="fcExEn"
                                            class="text-base font-semibold text-brand-300 italic leading-relaxed transition-all duration-300 pr-8"
                                            onclick="revealExampleEn(event)">English</p>
                                    </div>
                                    <div class="relative pt-1 border-t border-slate-800/50">
                                        <button onclick="toggleListenModeVi(event)"
                                            class="absolute top-2 right-0 text-slate-500 hover:text-brand-400 transition-colors z-10"
                                            title="Che/hiện nghĩa tiếng Việt">
                                            <i id="fcListenIconVi" class="fa-solid fa-eye"></i>
                                        </button>
                                        <p id="fcExVi"
                                            class="text-sm text-slate-400 leading-relaxed transition-all duration-300 pr-8 pt-1"
                                            onclick="revealExampleVi(event)">Vietnamese</p>
                                    </div>
                                </div>

                                <p class="mt-8 text-brand-300/70 text-sm">Click để lật lại</p>
                            </div>\;

content = content.replace(targetBackRegex, newBack);

fs.writeFileSync('index.html', content, 'utf8');
