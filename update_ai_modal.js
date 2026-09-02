const fs = require('fs');
let indexContent = fs.readFileSync('index.html', 'utf8');

const regex = /<div id="aiContextModal" class="hidden fixed z-\[9999\] transition-opacity">[\s\S]*?<\/div>\s*<\/div>/;

const newHTML = `<div id="aiContextModal" class="hidden fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity">
        <div class="bg-slate-900 border border-slate-700/60 shadow-2xl shadow-black/80 rounded-2xl w-[850px] max-w-[95vw] transform transition-all flex flex-col md:flex-row overflow-hidden relative">
            
            <!-- Nút đóng nhanh (X) ở góc phải trên -->
            <button onclick="closeAiContextModal(false)" class="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors z-10 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-800">
                <i class="fa-solid fa-xmark text-lg"></i>
            </button>

            <!-- Bên trái: Context Input -->
            <div class="flex-1 p-6 border-b md:border-b-0 md:border-r border-slate-700/60 flex flex-col">
                <h3 class="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                        <i class="fa-solid fa-wand-magic-sparkles text-amber-400"></i>
                    </div>
                    Ngữ cảnh AI
                </h3>
                <p class="text-slate-400 text-sm mb-5">Nhập ngữ cảnh để AI tạo ví dụ (VD: Giao tiếp hằng ngày, Luyện thi TOEIC, Viết email công sở...). Nếu để trống, AI sẽ tạo tự do.</p>
                <textarea id="aiContextInput" class="w-full flex-1 bg-slate-800/80 border border-slate-600/60 rounded-xl p-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-shadow resize-none custom-scrollbar text-[15px] leading-relaxed min-h-[250px]" placeholder="Nhập ngữ cảnh tại đây..."></textarea>
            </div>

            <!-- Bên phải: Tùy chỉnh (Options & Actions) -->
            <div class="w-full md:w-[320px] p-6 bg-slate-800/30 flex flex-col justify-between">
                <div>
                    <h4 class="text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest flex items-center gap-2"><i class="fa-solid fa-sliders text-slate-500"></i> Tùy chỉnh nâng cao</h4>
                    <div class="flex flex-col gap-3">
                        <label class="relative flex items-center cursor-pointer group bg-slate-800/60 hover:bg-slate-700/60 p-3.5 rounded-xl border border-slate-700/50 hover:border-slate-600 transition-all">
                            <input type="checkbox" id="aiFamToggle" class="sr-only" checked onchange="handleAiOptionToggle(this, 'trackFam', 'thumbFam')">
                            <div id="trackFam" class="w-10 h-6 rounded-full transition-colors duration-300 shadow-inner p-[2px] bg-emerald-500 flex items-center shrink-0">
                                <div id="thumbFam" class="bg-white rounded-full h-5 w-5 transition-all duration-300 transform translate-x-4 shadow-sm"></div>
                            </div>
                            <span class="ml-3 text-sm font-medium text-slate-200 group-hover:text-white transition-colors flex-1 flex items-center gap-2"><i class="fa-solid fa-sitemap w-5 text-center text-slate-400"></i> Word Family</span>
                        </label>
                        
                        <label class="relative flex items-center cursor-pointer group bg-slate-800/60 hover:bg-slate-700/60 p-3.5 rounded-xl border border-slate-700/50 hover:border-slate-600 transition-all">
                            <input type="checkbox" id="aiSynToggle" class="sr-only" checked onchange="handleAiOptionToggle(this, 'trackSyn', 'thumbSyn')">
                            <div id="trackSyn" class="w-10 h-6 rounded-full transition-colors duration-300 shadow-inner p-[2px] bg-emerald-500 flex items-center shrink-0">
                                <div id="thumbSyn" class="bg-white rounded-full h-5 w-5 transition-all duration-300 transform translate-x-4 shadow-sm"></div>
                            </div>
                            <span class="ml-3 text-sm font-medium text-slate-200 group-hover:text-white transition-colors flex-1 flex items-center gap-2"><i class="fa-solid fa-right-left w-5 text-center text-slate-400"></i> Đồng & Trái nghĩa</span>
                        </label>

                        <label class="relative flex items-center cursor-pointer group bg-slate-800/60 hover:bg-slate-700/60 p-3.5 rounded-xl border border-slate-700/50 hover:border-slate-600 transition-all">
                            <input type="checkbox" id="aiHomToggle" class="sr-only" checked onchange="handleAiOptionToggle(this, 'trackHom', 'thumbHom')">
                            <div id="trackHom" class="w-10 h-6 rounded-full transition-colors duration-300 shadow-inner p-[2px] bg-emerald-500 flex items-center shrink-0">
                                <div id="thumbHom" class="bg-white rounded-full h-5 w-5 transition-all duration-300 transform translate-x-4 shadow-sm"></div>
                            </div>
                            <span class="ml-3 text-sm font-medium text-slate-200 group-hover:text-white transition-colors flex-1 flex items-center gap-2"><i class="fa-solid fa-triangle-exclamation w-5 text-center text-red-400"></i> Từ dễ nhầm lẫn</span>
                        </label>

                        <label class="relative flex items-center cursor-pointer group bg-slate-800/60 hover:bg-slate-700/60 p-3.5 rounded-xl border border-slate-700/50 hover:border-slate-600 transition-all">
                            <input type="checkbox" id="aiGrammarToggle" class="sr-only" checked onchange="handleAiOptionToggle(this, 'trackGrammar', 'thumbGrammar')">
                            <div id="trackGrammar" class="w-10 h-6 rounded-full transition-colors duration-300 shadow-inner p-[2px] bg-emerald-500 flex items-center shrink-0">
                                <div id="thumbGrammar" class="bg-white rounded-full h-5 w-5 transition-all duration-300 transform translate-x-4 shadow-sm"></div>
                            </div>
                            <span class="ml-3 text-sm font-medium text-slate-200 group-hover:text-white transition-colors flex-1 flex items-center gap-2"><i class="fa-solid fa-spell-check w-5 text-center text-blue-400"></i> Phân tích Ngữ pháp</span>
                        </label>
                    </div>
                </div>

                <div class="mt-8 flex flex-col gap-3">
                    <button onclick="closeAiContextModal(true)" class="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.98] flex justify-center items-center gap-2">
                        <i class="fa-solid fa-check"></i> Áp dụng cài đặt
                    </button>
                    <button onclick="closeAiContextModal(false)" class="w-full py-3 bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl font-medium transition-all active:scale-[0.98]">
                        Đóng (Không lưu)
                    </button>
                </div>
            </div>
        </div>
    </div>`;

if(indexContent.match(regex)) {
    indexContent = indexContent.replace(regex, newHTML);
    fs.writeFileSync('index.html', indexContent);
    console.log("Updated aiContextModal layout!");
} else {
    console.log("Regex did not match.");
}
