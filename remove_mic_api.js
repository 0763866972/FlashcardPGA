const fs = require('fs');

let html = fs.readFileSync('pga.html', 'utf8');

// Replace textarea
const oldTextarea = `<textarea id="speakTranscribeInput" rows="5" class="w-full bg-teal-50/30 border border-teal-200 rounded-xl p-4 text-slate-700 focus:outline-none resize-y transition-all" readonly placeholder="Đọc to đoạn văn tiếng Anh ở trên... Nội dung thu âm sẽ hiện ra ở đây theo thời gian thực..."></textarea>`;
const newTextarea = `<textarea id="speakTranscribeInput" rows="5" class="w-full bg-teal-50/30 border border-teal-200 rounded-xl p-4 text-slate-700 focus:outline-none resize-y transition-all" placeholder="Bấm Windows + H để đọc, hoặc gõ trực tiếp vào đây..." oninput="document.getElementById('evaluateSpeechBtn').classList.toggle('hidden', this.value.trim() === '')"></textarea>`;
html = html.replace(oldTextarea, newTextarea);

// Replace toggleSpeakPractice and stopSpeakPractice completely
const oldFunctionsStart = `        function toggleSpeakPractice() {`;
const oldFunctionsEnd = `        async function evaluateSpeech() {`;

const oldBlock = html.substring(html.indexOf(oldFunctionsStart), html.indexOf(oldFunctionsEnd));

const newBlock = `        function toggleSpeakPractice() {
            const btn = document.getElementById('speakPracticeBtn');
            const btnText = document.getElementById('speakPracticeBtnText');
            const area = document.getElementById('speakPracticeArea');
            const status = document.getElementById('speakStatus');
            const input = document.getElementById('speakTranscribeInput');
            
            if (!isSpeakingPractice) {
                isSpeakingPractice = true;
                area.classList.remove('hidden');
                btn.classList.remove('bg-teal-50', 'text-teal-600', 'hover:bg-teal-100');
                btn.classList.add('bg-teal-500', 'text-white');
                btnText.innerText = "Đóng Speak";
                status.innerText = "Sẵn sàng (Win + H)";
                input.focus();
                document.getElementById('evaluateSpeechBtn').classList.toggle('hidden', input.value.trim() === '');
            } else {
                stopSpeakPractice();
                area.classList.add('hidden');
            }
        }
        function stopSpeakPractice() {
            isSpeakingPractice = false;
            const btn = document.getElementById('speakPracticeBtn');
            const btnText = document.getElementById('speakPracticeBtnText');
            const status = document.getElementById('speakStatus');
            if (btn) {
                btn.classList.add('bg-teal-50', 'text-teal-600', 'hover:bg-teal-100');
                btn.classList.remove('bg-teal-500', 'text-white');
            }
            if (btnText) btnText.innerText = "Luyện Speak";
            if (status) status.innerText = "Đã đóng";
        }
`;

html = html.replace(oldBlock, newBlock);

fs.writeFileSync('pga.html', html);
console.log('Removed mic permission requirement, updated to manual input for speaking practice.');
