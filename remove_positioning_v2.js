const fs = require('fs');
let mainContent = fs.readFileSync('main.js', 'utf8');

const strToReplace = `// Lấy vị trí nút flashcard để đặt modal bên cạnh
            const btnRect = document.getElementById('flashcardBtn').getBoundingClientRect();
            
            modal.classList.remove('hidden'); // Hiện trước để lấy chiều cao
            const modalHeight = modal.offsetHeight || 300; // Chiều cao ước tính nếu chưa lấy được
            
            let topPos = btnRect.top - 20;
            // Đảm bảo không bị lẹm xuống đáy màn hình
            if (topPos + modalHeight > window.innerHeight - 20) {
                topPos = window.innerHeight - modalHeight - 20;
            }
            // Đảm bảo không bị lẹm lên nóc màn hình
            if (topPos < 20) topPos = 20;
            
            modal.style.top = topPos + 'px';
            modal.style.left = (btnRect.right + 15) + 'px';`;

if (mainContent.includes(strToReplace)) {
    mainContent = mainContent.replace(strToReplace, "modal.classList.remove('hidden');");
    fs.writeFileSync('main.js', mainContent);
    console.log("Successfully removed positioning logic using exact string match");
} else {
    console.log("Still could not match due to encoding. Using fallback regex.");
    const fallbackRegex = /\/\/ L.y v.*tr.*n.t flashcard .*?[\s\S]*?modal\.style\.left = \(btnRect\.right \+ 15\) \+ 'px';/m;
    if (mainContent.match(fallbackRegex)) {
        mainContent = mainContent.replace(fallbackRegex, "modal.classList.remove('hidden');");
        fs.writeFileSync('main.js', mainContent);
        console.log("Successfully removed positioning logic using fallback regex");
    } else {
        console.log("Fallback regex also failed.");
    }
}
