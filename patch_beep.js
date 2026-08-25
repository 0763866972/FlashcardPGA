const fs = require('fs');
let mainContent = fs.readFileSync('main.js', 'utf8');

const targetContent = `        if (event.code === 'Space') {
            event.preventDefault();
            if (isFcSlideshow) {
                isFcSlideshowLoopingCurrent = !isFcSlideshowLoopingCurrent;
                const icon = document.getElementById('fcSlideshowIcon');
                const textSpan = document.getElementById('fcSlideshowBtn').querySelector('span');
                if (isFcSlideshowLoopingCurrent) {
                    icon.className = "fa-solid fa-repeat animate-spin-slow";
                    if (textSpan) textSpan.innerText = "Đang lặp";
                } else {
                    icon.className = "fa-solid fa-pause";
                    if (textSpan) textSpan.innerText = "Học rảnh tay";
                }
            } else {`;

const replacementContent = `        if (event.code === 'Space') {
            event.preventDefault();
            if (isFcSlideshow) {
                isFcSlideshowLoopingCurrent = !isFcSlideshowLoopingCurrent;
                const icon = document.getElementById('fcSlideshowIcon');
                const textSpan = document.getElementById('fcSlideshowBtn').querySelector('span');
                
                // Hàm phát tiếng beep
                if (!window.playBeep) {
                    window.playBeep = function(times) {
                        try {
                            const ctx = new (window.AudioContext || window.webkitAudioContext)();
                            for (let i = 0; i < times; i++) {
                                const osc = ctx.createOscillator();
                                const gain = ctx.createGain();
                                osc.connect(gain);
                                gain.connect(ctx.destination);
                                osc.type = 'sine';
                                osc.frequency.value = 800;
                                gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.2);
                                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.2 + 0.1);
                                osc.start(ctx.currentTime + i * 0.2);
                                osc.stop(ctx.currentTime + i * 0.2 + 0.1);
                            }
                        } catch (e) {}
                    };
                }

                if (isFcSlideshowLoopingCurrent) {
                    icon.className = "fa-solid fa-repeat animate-spin-slow";
                    if (textSpan) textSpan.innerText = "Đang lặp";
                    if (window.playBeep) window.playBeep(1);
                } else {
                    icon.className = "fa-solid fa-pause";
                    if (textSpan) textSpan.innerText = "Học rảnh tay";
                    if (window.playBeep) window.playBeep(2);
                }
            } else {`;

mainContent = mainContent.replace(targetContent, replacementContent);
fs.writeFileSync('main.js', mainContent, 'utf8');
console.log('Added playBeep');
