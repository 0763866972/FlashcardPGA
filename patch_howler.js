const fs = require('fs');
let mainContent = fs.readFileSync('main.js', 'utf8');
const spriteMap = fs.readFileSync('generated_sprite_map.json', 'utf8');

const newSpeakPhoneme = `
const ipaSpriteMap = ${spriteMap};

let ipaHowl = null;

window.speakPhoneme = function(p, ev) {
    if (ev) ev.stopPropagation();
    
    // Khởi tạo Howl lazy load
    if (!ipaHowl && typeof Howl !== 'undefined') {
        ipaHowl = new Howl({
            src: ['audio/IPA.mp3'],
            sprite: ipaSpriteMap
        });
    }

    const cleanP = p.replace(/[ː\\u0303]/g, '');
    let spriteKey = p; // Thử p gốc trước
    if (!ipaSpriteMap[spriteKey]) {
        spriteKey = cleanP; // Nếu không có, thử cleanP
    }
    
    if (ipaHowl && ipaSpriteMap[spriteKey]) {
        ipaHowl.play(spriteKey);
    } else {
        // Fallback về Google TTS nếu lỗi hoặc không tìm thấy âm thanh
        const textToSpeak = (typeof ipaToTextMap !== 'undefined' && ipaToTextMap[cleanP]) ? ipaToTextMap[cleanP] : cleanP;
        speakText(textToSpeak, 'en-US');
    }
};
`;

mainContent = mainContent.replace(/window\.speakPhoneme = function\(p, ev\) \{[\s\S]*?speakText\(textToSpeak, 'en-US'\);\s*\};/, newSpeakPhoneme);

fs.writeFileSync('main.js', mainContent, 'utf8');
console.log('Patched main.js with Howler logic');
