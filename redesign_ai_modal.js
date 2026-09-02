const fs = require('fs');
let indexContent = fs.readFileSync('index.html', 'utf8');

const regex = /<div id="aiContextModal" class="hidden fixed inset-0 z-\[9999\] flex items-center justify-center[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;

const newHTML = `<div id="aiContextModal" class="hidden fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300">
        <!-- Main Modal Container -->
        <div class="bg-white border border-slate-200 shadow-2xl shadow-slate-300/50 rounded-3xl w-[850px] max-w-[95vw] transform transition-all flex flex-col md:flex-row overflow-hidden relative">
            
            <!-- Nút đóng nhanh (X) -->
            <button onclick="closeAiContextModal(false)" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all z-10 w-8 h-8 flex items-center justify-center rounded-full">
                <i class="fa-solid fa-xmark text-lg"></i>
            </button>

            <!-- Bên trái: Context Input -->
            <div class="flex-1 p-8 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col bg-white">
                <h3 class="text-2xl font-extrabold text-slate-800 mb-2 flex items-center gap-3">
                    <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 border border-amber-200/50 flex items-center justify-center shadow-sm">
                        <i class="fa-solid fa-wand-magic-sparkles text-amber-500 text-lg"></i>
                    </div>
                    Ngữ cảnh AI
                </h3>
                <p class="text-slate-500 text-[15px] mb-6 leading-relaxed">Nhập ngữ cảnh để AI tạo ví dụ (VD: <span class="text-brand-600 font-medium">Giao tiếp hằng ngày</span>, <span class="text-brand-600 font-medium">Luyện thi TOEIC</span>, <span class="text-brand-600 font-medium">Viết email</span>...). Nếu để trống, AI sẽ tạo tự do theo cảm hứng.</p>
                <div class="relative flex-1 flex flex-col">
                    <textarea id="aiContextInput" class="w-full flex-1 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-2xl p-5 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all resize-none custom-scrollbar text-[15px] leading-relaxed min-h-[250px] shadow-inner" placeholder="Bắt đầu nhập ngữ cảnh tại đây..."></textarea>
                    <div class="absolute bottom-4 right-4 text-slate-300 pointer-events-none">
                        <i class="fa-regular fa-keyboard text-xl opacity-50"></i>
                    </div>
                </div>
            </div>

            <!-- Bên phải: Tùy chỉnh (Options & Actions) -->
            <div class="w-full md:w-[340px] p-8 bg-slate-50/80 flex flex-col justify-between">
                <div>
                    <h4 class="text-xs font-bold text-slate-400 mb-5 uppercase tracking-widest flex items-center gap-2">
                        <i class="fa-solid fa-sliders text-slate-400"></i> Cấu hình bổ sung
                    </h4>
                    <div class="flex flex-col gap-3.5">
                        
                        <!-- Toggle 1 -->
                        <label class="relative flex items-center cursor-pointer group bg-white hover:bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all">
                            <input type="checkbox" id="aiFamToggle" class="sr-only" checked onchange="handleAiOptionToggle(this, 'trackFam', 'thumbFam')">
                            <div id="trackFam" class="w-11 h-6 rounded-full transition-colors duration-300 shadow-inner p-[2px] bg-emerald-500 flex items-center shrink-0">
                                <div id="thumbFam" class="bg-white rounded-full h-5 w-5 transition-all duration-300 transform translate-x-5 shadow-sm"></div>
                            </div>
                            <div class="ml-4 flex-1 flex items-center gap-3">
                                <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-colors">
                                    <i class="fa-solid fa-sitemap"></i>
                                </div>
                                <span class="text-[15px] font-semibold text-slate-700">Word Family</span>
                            </div>
                        </label>
                        
                        <!-- Toggle 2 -->
                        <label class="relative flex items-center cursor-pointer group bg-white hover:bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all">
                            <input type="checkbox" id="aiSynToggle" class="sr-only" checked onchange="handleAiOptionToggle(this, 'trackSyn', 'thumbSyn')">
                            <div id="trackSyn" class="w-11 h-6 rounded-full transition-colors duration-300 shadow-inner p-[2px] bg-emerald-500 flex items-center shrink-0">
                                <div id="thumbSyn" class="bg-white rounded-full h-5 w-5 transition-all duration-300 transform translate-x-5 shadow-sm"></div>
                            </div>
                            <div class="ml-4 flex-1 flex items-center gap-3">
                                <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-colors">
                                    <i class="fa-solid fa-right-left"></i>
                                </div>
                                <span class="text-[15px] font-semibold text-slate-700">Đồng/Trái nghĩa</span>
                            </div>
                        </label>

                        <!-- Toggle 3 -->
                        <label class="relative flex items-center cursor-pointer group bg-white hover:bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all">
                            <input type="checkbox" id="aiHomToggle" class="sr-only" checked onchange="handleAiOptionToggle(this, 'trackHom', 'thumbHom')">
                            <div id="trackHom" class="w-11 h-6 rounded-full transition-colors duration-300 shadow-inner p-[2px] bg-emerald-500 flex items-center shrink-0">
                                <div id="thumbHom" class="bg-white rounded-full h-5 w-5 transition-all duration-300 transform translate-x-5 shadow-sm"></div>
                            </div>
                            <div class="ml-4 flex-1 flex items-center gap-3">
                                <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-red-400/70 group-hover:text-red-500 transition-colors">
                                    <i class="fa-solid fa-triangle-exclamation"></i>
                                </div>
                                <span class="text-[15px] font-semibold text-slate-700">Từ dễ nhầm lẫn</span>
                            </div>
                        </label>

                        <!-- Toggle 4 -->
                        <label class="relative flex items-center cursor-pointer group bg-white hover:bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all">
                            <input type="checkbox" id="aiGrammarToggle" class="sr-only" checked onchange="handleAiOptionToggle(this, 'trackGrammar', 'thumbGrammar')">
                            <div id="trackGrammar" class="w-11 h-6 rounded-full transition-colors duration-300 shadow-inner p-[2px] bg-emerald-500 flex items-center shrink-0">
                                <div id="thumbGrammar" class="bg-white rounded-full h-5 w-5 transition-all duration-300 transform translate-x-5 shadow-sm"></div>
                            </div>
                            <div class="ml-4 flex-1 flex items-center gap-3">
                                <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-blue-400/70 group-hover:text-blue-500 transition-colors">
                                    <i class="fa-solid fa-spell-check"></i>
                                </div>
                                <span class="text-[15px] font-semibold text-slate-700">Phân tích Ngữ pháp</span>
                            </div>
                        </label>
                    </div>
                </div>

                <div class="mt-8 flex flex-col gap-3">
                    <button onclick="closeAiContextModal(true)" class="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold text-[15px] shadow-lg shadow-emerald-500/30 transition-all active:scale-[0.98] flex justify-center items-center gap-2">
                        <i class="fa-solid fa-check"></i> Áp dụng cài đặt
                    </button>
                    <button onclick="closeAiContextModal(false)" class="w-full py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-2xl font-bold text-[15px] transition-all active:scale-[0.98] shadow-sm">
                        Đóng (Không lưu)
                    </button>
                </div>
            </div>
        </div>
    </div>`;

if(indexContent.match(regex)) {
    indexContent = indexContent.replace(regex, newHTML);
    fs.writeFileSync('index.html', indexContent);
    console.log("Updated aiContextModal to bright, premium light theme!");
} else {
    console.log("Regex did not match.");
}
