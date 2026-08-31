const fs = require('fs');
const patch = `

// --- AUDIO WARMUP PATCH ---
(function() {
    // Warm up getVoices
    if (window.speechSynthesis) {
        window.speechSynthesis.getVoices();
        window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
    
    // Prime the audio engines on first user interaction to fix the "requires 2-3 clicks" issue
    let audioPrimed = false;
    document.addEventListener('click', function() {
        if (audioPrimed) return;
        audioPrimed = true;
        
        // Prime Web Speech API
        if (window.speechSynthesis) {
            let u = new SpeechSynthesisUtterance('');
            u.volume = 0;
            window.speechSynthesis.speak(u);
        }
        
        // Prime HTML5 Audio
        if (window.globalAudioTTS) {
            window.globalAudioTTS.play().catch(e => {});
        }
    }, { once: true, capture: true });
})();
`;
fs.appendFileSync('main.js', patch);
console.log("Patch appended!");
