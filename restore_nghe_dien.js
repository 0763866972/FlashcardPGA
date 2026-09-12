const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

const targetNgheĐiền = `<div class="flex w-full transition-opacity duration-200">
                        <button onclick="startFillMode()" id="fillBtn"
                            class="w-full relative overflow-hidden group bg-[#ff7790] hover:bg-[#ff8ca1] text-white font-bold py-3 px-5 rounded-xl shadow-[0_0_20px_rgba(255,119,144,0.3)] hover:shadow-[0_0_30px_rgba(255,119,144,0.5)] active:scale-[0.98] transition-all duration-300 flex items-center justify-start gap-3">
                            <i class="fa-solid fa-headphones shrink-0"></i>
                            <span class="tracking-wide whitespace-nowrap text-sm">Nghe &amp; Điền (Dictation)</span>
                        </button>
                    </div>`;

const replaceNgheĐiền = `<div class="flex w-full transition-opacity duration-200">
                        <button onclick="startFillMode()" id="fillBtn"
                            class="flex-1 relative overflow-hidden group bg-[#ff7790] hover:bg-[#ff8ca1] text-white font-bold py-3 px-5 rounded-l-xl shadow-[0_0_20px_rgba(255,119,144,0.3)] hover:shadow-[0_0_30px_rgba(255,119,144,0.5)] active:scale-[0.98] transition-all duration-300 flex items-center justify-start gap-3">
                            <i class="fa-solid fa-headphones shrink-0"></i>
                            <span class="tracking-wide whitespace-nowrap text-sm">Nghe &amp; Điền (Dictation)</span>
                        </button>
                        <button onclick="toggleDiffRow()" title="Chọn độ khó"
                            class="bg-[#ee5a75] hover:bg-[#ff7790] text-white px-3 rounded-r-xl transition-all duration-200 flex items-center justify-center">
                            <i id="diffRowChevron"
                                class="fa-solid fa-chevron-down text-[10px] transition-transform duration-200"></i>
                        </button>
                    </div>`;

html = html.replace(targetNgheĐiền, replaceNgheĐiền);

fs.writeFileSync('index.html', html);
console.log('Restored dropdown button for Nghe & Điền');
