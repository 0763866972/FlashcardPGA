/***********************************************************************************************
         * TO: CLAUDE (OR ANY AI ASSISTANT IN THE FUTURE)
         * =============================================================================================
         * TÓM TẮT KIẾN TRÚC VÀ CÁC THÀNH PHẦN CHÍNH CỦA FILE NÀY (Từ vựng.html)
         * 
         * File này là một ứng dụng Web (Single Page App) dùng thuần HTML/JS/TailwindCSS để hỗ trợ học 
         * và ôn tập Từ vựng TOEIC. Ứng dụng này có 4 màn hình chính tương đương 4 chế độ học:
         * 
         * 1. [Màn hình Chính / Nhập liệu] (welcomeScreen):
         *    - Người dùng nhập danh sách từ vựng theo format "Từ - Nghĩa".
         *    - Hệ thống parse và lưu vào localStorage (có hỗ trợ lưu theo Thư Mục/Group thông qua 
         *      monkey-patch các hàm localStorage).
         * 
         * 2. [Chế độ Flashcard] (flashcardContainer):
         *    - Học thuộc từ qua các thẻ lật (Mặt trước/Mặt sau).
         *    - Cho phép gọi AI (Groq/Gemini) để sinh câu ví dụ động (hàm `generateBulkExamples`).
         * 
         * 3. [Chế độ Trắc Nghiệm] (quizContainer):
         *    - Tạo bài test nhanh dạng Multiple Choice từ các từ đã nhập.
         *    - Sinh ra các đáp án nhiễu tự động (distractors).
         * 
         * 4. [Chế độ Nghe & Điền từ] (fillContainer):
         *    - Ứng dụng AI để sinh một câu ví dụ tiếng Anh có chứa từ vựng.
         *    - Người dùng nghe và gõ từ còn thiếu vào chỗ trống.
         * 
         * 5. [Chế độ Tạo Đề Thi] (examContainer):
         *    - Sử dụng AI để biến danh sách từ vựng thành 1 đề thi Part 5 TOEIC hoàn chỉnh.
         *    - Các câu hỏi được AI đóng gói thành JSON với `sentence_structure_analysis`, `explanation`.
         * 
         * ĐIỂM QUAN TRỌNG KHI LÀM VIỆC VỚI FILE NÀY:
         * - API Tương tác: Cấu hình `callGeminiAPI` (cho tạo đề) và `callGeminiAPIText` (cho chat và flashcard).
         * - Groq / GPT-OSS 120B: API của Groq dễ bị quá tải/cắt đứt nên đã được tích hợp bộ lọc 
         *   Balanced Bracket Extractor để bảo vệ parse JSON và giảm chunk `batchSize = 3` (dòng ~2400).
         * - Multi-Folder Logic: (dòng ~1630) Các hàm get/setItem của localStorage đã bị monkey-patch 
         *   để tự động trỏ key vào đúng `activeVocabGroupId`. Hãy cẩn thận khi thao tác trực tiếp với localStorage.
         * 
         * LỊCH SỬ CẬP NHẬT GẦN ĐÂY (VUI LÒNG ĐỌC KỸ ĐỂ KHÔNG PHÁ VỠ LOGIC CŨ):
         * 1. [UI/UX Cấu hình API Key]: Khung API Key Panel (`keyConfigSection`) đã được thiết kế lại theo phong cách Glassmorphism 
         *    (không gian rộng, nền sáng chế độ Light Mode, hiệu ứng focus viền xanh). TRÁNH ghi đè CSS làm nó biến thành màu xám.
         * 2. [Lỗi Lắng nghe Phím trong Dictation/Quiz]: 
         *    - CỰC KỲ QUAN TRỌNG: Các hàm `startFillMode` và `startQuizMode` có cơ chế "Lưu phiên học" (return sớm). 
         *      Khi khôi phục phiên học, PHẢI gắn lại event listener `document.addEventListener('keydown', handleFillKeydownGlobal)`
         *      ngay trước khi gọi hàm load câu hỏi, nếu không toàn bộ phím tắt sẽ bị vô hiệu hóa.
         * 3. [Phím Shift & Enter trong Dictation]:
         *    - Tính năng Nghe lại (Shift) được bắt ở mức TOÀN CỤC (`handleFillKeydownGlobal`), kèm theo điều kiện `!e.repeat`
         *      để người dùng có thể giữ Shift viết hoa mà không bị dội âm thanh liên tục.
         *    - KHÔNG ĐƯỢC gán sự kiện phím tắt (onkeyup/onkeydown) trực tiếp (inline) vào thẻ `<input>` vì sẽ phá vỡ tính nhất quán 
         *      giữa chế độ 1 lỗ (Từ khoá) và nhiều lỗ (30/50/100%).
         *    - Phím Enter trong chế độ nhiều lỗ (multi-input) sẽ thực thi `checkFillAnswerMulti()` thay vì nhảy sang ô tiếp theo.
         * 4. [Tách biệt AI Flashcard và Dictation & Cache Validation]:
         *    - Hàm `generateBulkExamples` nay có thêm `targetMode = 'both'|'flashcard'|'dictation'`. Hãy cẩn thận khi gọi hàm này, phải truyền đúng 4 tham số.
         *    - Dictation (`startFillMode`) nay đã có logic `shouldResume` nghiêm ngặt để xác thực số lượng từ vựng và nội dung (`sourceList.length !== currentFillList.length`) trước khi khôi phục, giống hệt Quiz Mode, nhằm chống lỗi kẹt dữ liệu cũ.
         *    - Dictation có thêm chức năng `restartFill()` (Làm lại đề) thay vì thoát ứng dụng. Khi chạy đến câu cuối cùng `nextFillQuestion()` sẽ tự động vòng lại câu 0 thay vì báo hoàn thành.
         * 5. [Lỗi Mất Đề Xuất Chính Tả trong Dictation]:
         *    - Do quá trình tách `en_dictation`, hàm `loadFillQuestion` đã từng bị lỗi logic fallback vì chỉ check `!card.aiExample.en`. Nếu không có `en`, nó ghi đè toàn bộ `aiExample` bằng câu báo lỗi mặc định `(Lỗi: AI chưa tạo được...)`. Điều này khiến tính năng bắt lỗi Levenshtein bị vô hiệu hóa do chữ nhập sai luôn khớp với biến fallback. ĐÃ SỬA lại thành `if (!card.aiExample || (!card.aiExample.en && !card.aiExample.en_dictation))` để ngăn việc ghi đè sai sót này.
         * 6. [Tối ưu API Key Rotation, Trải nghiệm AI & UI Loading]:
         *    - Áp dụng cơ chế "Trí nhớ toàn cục" (biến localStorage `toeic_api_key_index`) để tự động quay vòng API Key trên tất cả mọi 
         *      chế độ (Flashcard, Dictation, Tạo Đề), đảm bảo chống lãng phí key và không bị "reset" về key đầu tiên khi F5 trang.
         *    - Cấu trúc "Mẻ" xử lý (Batch Size): Dictation sử dụng batchSize=20 cho Gemini (nhưng ĐÃ TẮT tính năng tạo Family/Collocation 
         *      để giảm tải Token và tránh vượt giới hạn). Flashcard giữ mức 5 từ/mẻ. Groq giữ mức 3 từ/mẻ. Cập nhật độ dài câu (Dễ: 8-13, Thường: 15-20).
         *    - Giao diện `loadingScreen` (khi AI biên soạn) đã được lột xác thành phong cách Premium SaaS với icon Microchip, 
         *      vòng radar sóng Ping, Progress Bar trượt động nhích dần lên thực tế (không đứng hình ở 50%), xoá bỏ chữ thừa thãi.
         *    - Khắc phục lỗi hiển thị đảo ngược của nút `saveSessionToggle` (ON thì trượt qua trái màu xám - nhìn như OFF). Tự động gọi 
         *      hàm `turnOnSaveSessionToggle` sau khi AI chạy xong ở mọi chế độ để bảo vệ tiến độ học cho user.
         ***********************************************************************************************/

/* ============================================================================
 * BIẾN TRẠNG THÁI TOÀN CỤC (GLOBAL STATE VARIABLES)
 * Đây là các biến lưu trữ trạng thái chính của ứng dụng trong suốt phiên làm việc.
 * Chúng được sử dụng xuyên suốt bởi tất cả các chế độ học.
 * ============================================================================ */

/** API Key dùng để gọi Gemini/Groq API. Có thể chứa nhiều key phân cách bằng dấu phẩy */
let apiKey = '';

/** Kích thước bài thi: 'mini' (số câu = số từ hoặc 15) hoặc 'full' (30 câu) */
let testSize = 'full'; // 'mini' (15) or 'full' (30)

/* ============================================================================
 * TOGGLE HÀNG CHỌN SỐ CÂU (SIZE ROW TOGGLE)
 * Ẩn/hiện hàng nút chọn số câu hỏi (15 hoặc 30 câu) bên dưới nút "Tạo Đề".
 * Xoay mũi tên chevron 180° để biểu thị trạng thái đóng/mở.
 * ============================================================================ */
function toggleSizeRow() {
    const row = document.getElementById('sizeRow');         // Hàng chứa các nút chọn số câu
    const chevron = document.getElementById('sizeRowChevron'); // Icon mũi tên xoay
    const isHidden = row.classList.contains('hidden');      // Kiểm tra trạng thái hiện tại
    row.classList.toggle('hidden');                         // Đảo trạng thái ẩn/hiện
    chevron.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)'; // Xoay chevron
}

/* ============================================================================
 * TOGGLE HÀNG CHỌN ĐỘ KHÓ AI (DIFFICULTY ROW TOGGLE)
 * Ẩn/hiện hàng nút chọn độ khó (Dễ/Thường/Khó) bên dưới nút "Nghe & Điền".
 * Độ khó ảnh hưởng cách AI sinh câu ví dụ (ngắn gọn vs dài vs kiểu definition).
 * ============================================================================ */
function toggleDiffRow() {
    const row = document.getElementById('diffRow');         // Hàng chứa 3 nút: Dễ / Thường / Khó
    const chevron = document.getElementById('diffRowChevron'); // Icon mũi tên xoay
    const isHidden = row.classList.contains('hidden');      // Kiểm tra trạng thái hiện tại
    row.classList.toggle('hidden');                         // Đảo trạng thái ẩn/hiện
    chevron.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)'; // Xoay chevron
}

/**
 * setTestSize - Đặt kích thước bài thi và cập nhật giao diện nút chọn.
 * @param {string} size - 'mini' (15/số từ câu) hoặc 'full' (30 câu)
 * Nút đang chọn sẽ được highlight xanh (bg-brand-500), các nút khác mờ đi.
 */
function setTestSize(size) {
    testSize = size; // Lưu kích thước vào biến global
    // Cập nhật highlight cho các nút: nút active sáng, nút không active mờ
    ['mini', 'full'].forEach(s => {
        const btn = document.getElementById('sizeBtn_' + s);
        if (!btn) return;
        const isActive = (s === size) || (size === 'custom' && s === 'full');

        if (isActive) {
            btn.classList.remove('text-slate-500', 'dark:text-slate-400', 'hover:bg-white', 'dark:hover:bg-slate-800', 'shadow-sm', 'border-transparent', 'font-semibold');
            btn.classList.add('bg-brand-500', 'text-white', 'shadow-md', 'border-brand-400/30', 'font-bold');
        } else {
            btn.classList.remove('bg-brand-500', 'text-white', 'shadow-md', 'border-brand-400/30', 'font-bold');
            btn.classList.add('text-slate-500', 'dark:text-slate-400', 'hover:bg-white', 'dark:hover:bg-slate-800', 'shadow-sm', 'border-transparent', 'font-semibold');
        }
    });

    // Đã gỡ bỏ logic tự động đóng dropdown để người dùng thấy rõ lựa chọn
}

/** Danh sách câu hỏi đã được làm phẳng (flatten) từ passages → questions. Dùng cho chế độ Tạo Đề Thi */
let flatQuestions = [];

/** Index câu hỏi đang hiển thị trong chế độ Tạo Đề Thi */
let activeQuestionIndex = 0;

/** Object lưu đáp án người dùng chọn theo index: { 0: 'A', 1: 'C', ... } */
let userAnswers = {};

/* ---- QUẢN LÝ TỪ VỰNG (Vocabulary Management) ---- */

/** Danh sách từ vựng đã parse từ textarea: [{word, meaning, pos, aiExample?, phonetic?}, ...] */
let parsedVocabList = [];

/** Bộ đếm số lần mỗi từ đã được dùng trong đề thi: { "apple": 2, "banana": 1, ... }
 *  Dùng để xoay vòng ưu tiên từ ít dùng hơn khi tạo đề mới */
let vocabTracker = {};

/** Mức độ khó AI hiện tại: 'easy' (câu ngắn), 'medium' (câu vừa), 'hard' (câu definition) */
let aiDifficultyLevel = 'medium';
let fcAiLength = 'short';

/* MULTI-FOLDER MANAGEMENT & STORAGE PATCH */
// =====================================================================
// [STORAGE INTERCEPTOR] Quản lý nhiều thư mục
// MỤC ĐÍCH: Thay vì chỉ có 1 danh sách từ vựng, hệ thống hỗ trợ chia theo Group/Thư mục.
// CÁCH HOẠT ĐỘNG: Ghi đè (monkey patch) các hàm getItem, setItem, removeItem của localStorage.
// VD: Nếu activeVocabGroupId là "nhom1", key "toeic_vocab_list" sẽ tự động trỏ vào "toeic_vocab_list_nhom1".
// Điều này giúp giữ nguyên logic đọc/ghi cũ mà không cần sửa code hàng loạt.
// =====================================================================
let activeVocabGroupId = localStorage.getItem('toeic_active_group_id') || 'default';
let vocabGroups;
try {
    vocabGroups = JSON.parse(localStorage.getItem('toeic_vocab_groups') || '[{"id":"default","name":"Mặc định"}]');
} catch (e) {
    vocabGroups = [{"id":"default","name":"Mặc định"}];
}

// Tự động xoá bộ nhớ đệm AI bị lỗi (chỉ chạy 1 lần) để fix triệt để lỗi hiển thị sai câu ví dụ
if (!localStorage.getItem('toeic_ai_cache_cleared_bugfix_1')) {
    localStorage.removeItem('toeic_ai_cache');
    localStorage.setItem('toeic_ai_cache_cleared_bugfix_1', 'true');
}

/**
 * getRealVocabKey - Chuyển đổi key localStorage thành key thực tế theo thư mục đang active.
 * @param {string} key - Key gốc (VD: 'toeic_vocab_list')
 * @returns {string} - Key thực (VD: 'toeic_vocab_list_nhom1' nếu đang ở nhóm nhom1)
 * 
 * Chỉ redirect 2 key: 'toeic_vocab_list' và 'toeic_starred_words'.
 * Các key khác (API key, theme, model) giữ nguyên vì chúng là global.
 */
function getRealVocabKey(key) {
    if (key === 'toeic_vocab_list') {
        return activeVocabGroupId === 'default' ? 'toeic_vocab_list' : `toeic_vocab_list_${activeVocabGroupId}`;
    }
    if (key === 'toeic_starred_words') {
        return activeVocabGroupId === 'default' ? 'toeic_starred_words' : `toeic_starred_words_${activeVocabGroupId}`;
    }
    return key; // Các key khác không bị redirect
}

/* Monkey-patch localStorage.getItem: Tự động redirect key về đúng thư mục */
const originalGetItem = localStorage.getItem;
localStorage.getItem = function (key) {
    return originalGetItem.call(this, getRealVocabKey(key));
};

/* Monkey-patch localStorage.removeItem: Tự động redirect key về đúng thư mục */
const originalRemoveItem = localStorage.removeItem;
localStorage.removeItem = function (key) {
    return originalRemoveItem.call(this, getRealVocabKey(key));
};

/* Monkey-patch localStorage.setItem: Redirect key + tự đồng bộ bảng xem trước.
 * isSyncingStorage: Cờ chống vòng lặp vô hạn khi syncTableWithStorage gọi setItem.
 * window.disableAutoSync: Cờ bên ngoài (VD: khi sửa lỗi chính tả) để tạm tắt sync. */
const originalSetItem = localStorage.setItem;
let isSyncingStorage = false; // Cờ chống đệ quy vô hạn
localStorage.setItem = function (key, value) {
    originalSetItem.call(this, getRealVocabKey(key), value); // Ghi vào key thực
    if (isSyncingStorage || window.disableAutoSync) return;  // Nếu đang sync hoặc bị tắt → bỏ qua
    // Chỉ sync lại UI khi thay đổi danh sách từ vựng hoặc starred
    if (key === 'toeic_vocab_list' || key === 'toeic_starred_words') {
        isSyncingStorage = true;
        try {
            if (typeof syncTableWithStorage === 'function') {
                syncTableWithStorage(); // Cập nhật bảng xem trước realtime
            }
        } finally {
            isSyncingStorage = false; // Luôn reset cờ dù có lỗi
        }
    }
};

/** Lưu danh sách groups + group đang active vào localStorage (bypass monkey-patch) */
function saveGroups() {
    originalSetItem.call(localStorage, 'toeic_vocab_groups', JSON.stringify(vocabGroups));
    originalSetItem.call(localStorage, 'toeic_active_group_id', activeVocabGroupId);
}

/** Render lại dropdown chọn thư mục với danh sách groups hiện tại */
function renderGroupSelect() {
    const select = document.getElementById('vocabGroupSelect');
    if (!select) return;
    select.innerHTML = ''; // Xóa hết options cũ

    // Khôi phục mảng an toàn nếu bị hỏng/trống
    if (!Array.isArray(vocabGroups) || vocabGroups.length === 0) {
        vocabGroups = [{ id: 'default', name: 'Mặc định' }];
        saveGroups();
    }

    // Nếu active id không tồn tại trong danh sách, đưa về default
    if (!vocabGroups.some(g => g.id === activeVocabGroupId)) {
        activeVocabGroupId = 'default';
        saveGroups();
    }

    vocabGroups.forEach(g => {
        const opt = document.createElement('option');
        opt.value = g.id;
        opt.innerText = g.name;
        if (g.id === activeVocabGroupId) opt.selected = true; // Chọn group đang active
        select.appendChild(opt);
    });
}
// Automatically call renderGroupSelect when the script loads
renderGroupSelect();

/**
 * changeVocabGroup - Chuyển sang thư mục từ vựng khác.
 * Khi chuyển nhóm:
 * 1. Cập nhật activeVocabGroupId → localStorage sẽ tự redirect key mới.
 * 2. Load nội dung textarea từ localStorage (key mới).
 * 3. Parse lại từ vựng + render bảng xem trước.
 * 4. Xóa phiên học cũ (không tương thích với từ vựng mới).
 */
function changeVocabGroup() {
    const select = document.getElementById('vocabGroupSelect');
    if (!select) return;
    activeVocabGroupId = select.value; // Chuyển sang group mới
    originalSetItem.call(localStorage, 'toeic_active_group_id', activeVocabGroupId);

    // Load từ vựng từ localStorage theo key mới (đã được redirect)
    const savedVocab = localStorage.getItem('toeic_vocab_list');
    document.getElementById('vocabInput').value = savedVocab || '';
    const viewMode = localStorage.getItem('toeic_vocab_view_mode');
    if (viewMode === 'table') {
        parseVocab(true);
    } else {
        parseVocab();
    }
    if (typeof updateStarredCount === 'function') updateStarredCount();

    // Phục hồi lại phiên học riêng của thư mục này (nếu có)
    // if (typeof aiDifficultyLevel !== 'undefined') {
    //     restoreSessionForDifficulty(aiDifficultyLevel);
    // }
}

/** Tạo thư mục mới: Hỏi tên → tạo ID unique → lưu → chuyển sang thư mục mới */
function createNewGroup() {
    const name = prompt('Nhập tên thư mục mới:');
    if (!name || name.trim() === '') return;
    const id = 'group_' + Date.now(); // Tạo ID unique bằng timestamp
    vocabGroups.push({ id, name: name.trim() });
    saveGroups();
    renderGroupSelect();
    document.getElementById('vocabGroupSelect').value = id; // Chọn group mới
    changeVocabGroup(); // Load nội dung trống
}

/** Đổi tên thư mục hiện tại (không cho phép đổi tên nhóm 'Mặc định') */
function renameCurrentGroup() {
    if (activeVocabGroupId === 'default') {
        alert('Không thể đổi tên thư mục Mặc định.');
        return;
    }
    const group = vocabGroups.find(g => g.id === activeVocabGroupId);
    if (!group) return;
    const newName = prompt('Nhập tên mới:', group.name);
    if (!newName || newName.trim() === '') return;
    group.name = newName.trim();
    saveGroups();
    renderGroupSelect();
}

/**
 * deleteCurrentGroup - Xóa thư mục hiện tại.
 * Xóa cả dữ liệu localStorage (vocab_list + starred) của thư mục đó.
 * Sau khi xóa, tự chuyển về thư mục 'Mặc định'.
 */
function deleteCurrentGroup() {
    if (activeVocabGroupId === 'default') {
        alert('Không thể xóa thư mục Mặc định.');
        return;
    }
    if (confirm('Bạn có chắc chắn muốn xóa thư mục này và toàn bộ từ vựng bên trong?')) {
        localStorage.removeItem('toeic_vocab_list');     // Xóa dữ liệu vocab của group này
        localStorage.removeItem('toeic_starred_words');  // Xóa starred words của group này

        vocabGroups = vocabGroups.filter(g => g.id !== activeVocabGroupId); // Xóa group khỏi mảng
        activeVocabGroupId = 'default'; // Chuyển về thư mục mặc định
        saveGroups();
        renderGroupSelect();
        changeVocabGroup();
    }
}

/* ============================================================================
 * CHUYỂN ĐỔI CHẾ ĐỘ SÁNG/TỐI (LIGHT / DARK MODE TOGGLE)
 * - toggleTheme(): Bật/tắt class 'light-mode' trên <html>, đổi icon mặt trời ↔ mặt trăng.
 * - applyStoredTheme(): Áp dụng theme đã lưu trong localStorage khi trang được tải lên.
 * - CSS override cho light mode nằm ở phần <style> phía trên (dòng ~50-686).
 * ============================================================================ */
function toggleTheme() {
    const html = document.documentElement;
    const icon = document.getElementById('themeIcon');
    const isLight = html.classList.toggle('light-mode'); // Bật/tắt class 'light-mode'
    icon.className = isLight ? 'fa-solid fa-moon' : 'fa-solid fa-sun'; // Đổi icon
    localStorage.setItem('toeic_theme', isLight ? 'light' : 'dark');   // Lưu vào localStorage
}

/** Áp dụng theme đã lưu khi trang được load lần đầu */
function applyStoredTheme() {
    const saved = localStorage.getItem('toeic_theme');
    if (saved === 'light') {
        document.documentElement.classList.add('light-mode');
        const icon = document.getElementById('themeIcon');
        if (icon) icon.className = 'fa-solid fa-moon';
    }
}

/* ============================================================================
 * KHỞI TẠO KHI TRANG ĐƯỢC LOAD (ON LOAD INITIALIZATION)
 * Chạy 1 lần duy nhất khi trang tải xong.
 * Khôi phục tất cả trạng thái đã lưu: theme, API key, vocab, difficulty, v.v.
 * ============================================================================ */
window.onload = function () {
    // 1. Áp dụng theme sáng/tối đã lưu
    applyStoredTheme();

    // 2. Khôi phục model AI đã chọn (Gemini/Groq)
    const savedModel = localStorage.getItem('toeic_ai_model');
    if (savedModel && document.querySelector(`#aiModelSelect option[value="${savedModel}"]`)) {
        document.getElementById('aiModelSelect').value = savedModel;
    }
    loadApiKeyForCurrentModel(); // Load API key tương ứng với model

    // 9. Đóng cấu hình API key khi bấm ra ngoài
    document.addEventListener('click', function (event) {
        const section = document.getElementById('keyConfigSection');
        const btn = document.getElementById('toggleKeyConfigBtn');
        if (section && !section.classList.contains('hidden') && btn) {
            if (!section.contains(event.target) && !btn.contains(event.target)) {
                hideKeyConfig();
            }
        }

        // Đóng dropdown Chọn số câu khi bấm ra ngoài
        const dropdown = document.getElementById('testSizeDropdown');
        const toggleBtn = document.querySelector('[onclick="toggleSizeRow()"]');
        if (dropdown && !dropdown.classList.contains('hidden')) {
            if (!dropdown.contains(event.target) && !toggleBtn.contains(event.target)) {
                dropdown.classList.add('hidden');
                document.getElementById('sizeChevron').classList.remove('rotate-180');
            }
        }
    });

    // Mở khóa Audio trên iOS ngay lần chạm đầu tiên
    let audioUnlocked = false;
    document.addEventListener('click', function unlockAudioOnFirstClick() {
        if (!audioUnlocked) {
            if (window.globalAudioTTS) {
                window.globalAudioTTS.play().catch(() => {});
                window.globalAudioTTS.pause();
            }
            if ('speechSynthesis' in window) {
                const unlockMsg = new SpeechSynthesisUtterance('');
                unlockMsg.volume = 0;
                window.speechSynthesis.speak(unlockMsg);
            }
            audioUnlocked = true;
            document.removeEventListener('click', unlockAudioOnFirstClick);
        }
    }, { once: true });

    // 3. Khôi phục danh sách từ vựng từ localStorage
    const savedVocab = localStorage.getItem('toeic_vocab_list');
    const viewMode = localStorage.getItem('toeic_vocab_view_mode'); // 'table' hoặc null (textarea)
    if (savedVocab && savedVocab.trim() !== '') {
        document.getElementById('vocabInput').value = savedVocab;
        if (viewMode === 'table') {
            parseVocab(true); // Render bảng xem trước ngay
        } else {
            parseVocab();     // Chỉ parse, không render bảng
        }
    } else {
        document.getElementById('vocabInput').value = '';
        if (viewMode === 'table') {
            parseVocab(true); // Render bảng trống
        }
    }

    // 4. Khôi phục bộ đếm vocab tracker (dùng cho xoay vòng từ)
    try {
        vocabTracker = JSON.parse(localStorage.getItem('toeic_vocab_tracker') || "{}");
    } catch (e) {
        vocabTracker = {};
    }

    // 5. Cập nhật badge số từ được đánh dấu sao
    updateStarredCount();

    // 6. Khôi phục kích thước bài thi và độ khó AI
    setTestSize(testSize);
    const savedAiDiff = localStorage.getItem('toeic_ai_difficulty') || 'medium';
    aiDifficultyLevel = savedAiDiff; // Gán trước để các hàm load có giá trị
    restoreSessionForDifficulty(savedAiDiff);
    setAiDifficulty(savedAiDiff);

    // 7. Cài đặt drag-and-drop cho file upload
    setupDragAndDrop();

    // 8. Khôi phục trạng thái toggle "Lọc sao"
    toggleFilter();

    // 9. Đóng cấu hình API key khi bấm ra ngoài
    document.addEventListener('click', function (event) {
        const section = document.getElementById('keyConfigSection');
        const btn = document.getElementById('toggleKeyConfigBtn');
        if (section && !section.classList.contains('hidden') && btn) {
            if (!section.contains(event.target) && !btn.contains(event.target)) {
                hideKeyConfig();
            }
        }

        // Đóng dropdown Chọn số câu khi bấm ra ngoài
        const sizeRow = document.getElementById('sizeRow');
        const sizeBtn = document.querySelector('[onclick="toggleSizeRow()"]');
        if (sizeRow && !sizeRow.classList.contains('hidden') && sizeBtn) {
            if (!sizeRow.contains(event.target) && !sizeBtn.contains(event.target)) {
                if (typeof toggleSizeRow === 'function') toggleSizeRow();
            }
        }

        // Đóng dropdown Chọn độ khó khi bấm ra ngoài
        const diffRow = document.getElementById('diffRow');
        const diffBtn = document.querySelector('[onclick="toggleDiffRow()"]');
        if (diffRow && !diffRow.classList.contains('hidden') && diffBtn) {
            if (!diffRow.contains(event.target) && !diffBtn.contains(event.target)) {
                if (typeof toggleDiffRow === 'function') toggleDiffRow();
            }
        }
    });

    // 10. Phím tắt Shift: Đọc từ hiện tại trong chế độ Flashcard
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Shift') {
            const flashcardContainer = document.getElementById('flashcardContainer');
            if (flashcardContainer && !flashcardContainer.classList.contains('hidden')) {
                speakWord(null); // Đọc từ đang hiển thị
            }
        }
    });

    // 11. Lắng nghe thay đổi trong textarea: auto-save vào localStorage
    const vocabInput = document.getElementById('vocabInput');
    vocabInput.addEventListener('input', function () {
        try { currentFillList = []; currentQuizList = []; currentFlashcards = []; } catch (e) { }
        const saveToggle = document.getElementById('saveSessionToggle');
        if (saveToggle) saveToggle.checked = false;

        const isStarredMode = document.getElementById('onlyStarredToggle') && !document.getElementById('onlyStarredToggle').checked;
        if (isStarredMode) {
            parseStarredVocabInput(); // Nếu đang ở chế độ lọc sao, parse khác
        } else {
            localStorage.setItem('toeic_vocab_list', this.value); // Lưu ngay mỗi khi gõ
            parseVocab(false); // Re-parse nhưng không render bảng
        }
    });

    // 12. Xử lý paste: Đợi 50ms để nội dung paste xuất hiện, rồi parse + render bảng
    vocabInput.addEventListener('paste', function () {
        try { currentFillList = []; currentQuizList = []; currentFlashcards = []; } catch (e) { }
        const saveToggle = document.getElementById('saveSessionToggle');
        if (saveToggle) saveToggle.checked = false;

        setTimeout(() => {
            const isStarredMode = document.getElementById('onlyStarredToggle') && !document.getElementById('onlyStarredToggle').checked;
            if (isStarredMode) {
                parseStarredVocabInput();
                parseVocab(true);
            } else {
                localStorage.setItem('toeic_vocab_list', this.value);
                parseVocab(true); // Force render bảng sau paste
            }
        }, 50);
    });

    // 13. Khi blur textarea → render bảng xem trước
    vocabInput.addEventListener('blur', function () {
        parseVocab(true);
    });

    // 14. Cross-tab sync: Nếu tab khác thay đổi localStorage, cập nhật bảng ở tab này
    window.addEventListener('storage', function (e) {
        if (e.key === getRealVocabKey('toeic_vocab_list') || e.key === getRealVocabKey('toeic_starred_words')) {
            syncTableWithStorage();
        }
    });

    // 15. Render dropdown chọn thư mục
    renderGroupSelect();
};


/**
 * setAiDifficulty - Đặt mức độ khó cho AI và cập nhật giao diện.
 * @param {string} level - 'easy' (câu ngắn 13-20 từ), 'medium' (câu vừa 15-25 từ), 'hard' (câu definition)
 * 
 * Khi đổi độ khó:
 * - Cập nhật biến global và localStorage.
 * - Highlight nút tương ứng (xanh lá/vàng/đỏ), mờ các nút khác.
 * - XÓA toàn bộ phiên học hiện tại (Fill, Quiz, Flashcard) vì ví dụ cũ không còn phù hợp.
 * - Tắt toggle "Lưu tiến độ" để buộc tạo lại ví dụ mới với độ khó mới.
 */
function setAiDifficulty(level) {
    aiDifficultyLevel = level;                             // Cập nhật biến global
    localStorage.setItem('toeic_ai_difficulty', level);    // Persist vào localStorage

    // Bảng màu cho từng mức độ khó: active (đang chọn) vs inactive (không chọn)
    const colorMap = {
        easy: { active: 'bg-emerald-600 text-white shadow-sm font-bold border border-emerald-400/30', inactive: 'text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 shadow-sm border border-transparent font-semibold' },
        medium: { active: 'bg-orange-500 text-white shadow-md font-bold border border-orange-400/30', inactive: 'text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 shadow-sm border border-transparent font-semibold' },
        hard: { active: 'bg-rose-600 text-white shadow-sm font-bold border border-rose-400/30', inactive: 'text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 shadow-sm border border-transparent font-semibold' },
    };
    // Cập nhật CSS class cho từng nút
    ['easy', 'medium', 'hard'].forEach(s => {
        const btn = document.getElementById('aiDiff_' + s);
        if (!btn) return;
        const baseClass = 'ai-diff-btn flex items-center justify-center text-[11px] rounded-lg text-center transition-all duration-200 py-2.5';
        btn.className = baseClass + ' ' + (s === level ? colorMap[s].active : colorMap[s].inactive);
    });

    // Đã gỡ bỏ logic tự động đóng dropdown để người dùng thấy rõ lựa chọn

    // Xóa dữ liệu cũ trong RAM trước
    if (typeof currentFillList !== 'undefined') currentFillList = [];       // Xóa phiên Nghe & Điền
    if (typeof currentQuizList !== 'undefined') currentQuizList = [];       // Xóa phiên Quiz
    if (typeof currentFlashcards !== 'undefined') currentFlashcards = [];   // Xóa phiên Flashcard

    // FIX: Cập nhật lại danh sách từ vựng từ cache AI cho đúng độ khó mới
    const viewMode = localStorage.getItem('toeic_vocab_view_mode');
    if (viewMode === 'table') {
        parseVocab(true);
    } else {
        parseVocab(false);
    }

    // Phục hồi lại phiên học đang dang dở của độ khó mới này (nếu có)
    restoreSessionForDifficulty(level);

    // Bật lại toggle "Lưu tiến độ" nếu phát hiện có phiên học cũ, ngược lại tắt nó đi
    const saveToggle = document.getElementById('saveSessionToggle');
    if (saveToggle) {
        const hasSession = (typeof currentFillList !== 'undefined' && currentFillList.length > 0) ||
            (typeof currentQuizList !== 'undefined' && currentQuizList.length > 0) ||
            (typeof currentFlashcards !== 'undefined' && currentFlashcards.length > 0);
        saveToggle.checked = hasSession;
    }
}

/** Lưu tiến độ của độ khó hiện tại vào localStorage */
function saveSessionForCurrentDifficulty() {
    if (!aiDifficultyLevel) return;
    const groupKey = typeof currentGroupName !== 'undefined' ? currentGroupName : 'Mặc định';
    const state = {
        fillList: currentFillList || [],
        fillIndex: currentFillIndex || 0,
        quizList: currentQuizList || [],
        quizIndex: currentQuizIndex || 0,
        flashcards: currentFlashcards || [],
        flashcardIndex: flashcardIndex || 0,
        isFlipped: typeof isFlipped !== 'undefined' ? isFlipped : false
    };
    localStorage.setItem(`toeic_session_${aiDifficultyLevel}_${groupKey}`, JSON.stringify(state));
}

/** Phục hồi tiến độ tương ứng với độ khó */
function restoreSessionForDifficulty(level) {
    try {
        const groupKey = typeof currentGroupName !== 'undefined' ? currentGroupName : 'Mặc định';
        const saved = localStorage.getItem(`toeic_session_${level}_${groupKey}`);
        if (saved) {
            const state = JSON.parse(saved);
            currentFillList = state.fillList || [];
            currentFillIndex = state.fillIndex || 0;
            currentQuizList = state.quizList || [];
            currentQuizIndex = state.quizIndex || 0;
            currentFlashcards = state.flashcards || [];
            flashcardIndex = state.flashcardIndex || 0;
            if (typeof isFlipped !== 'undefined') isFlipped = state.isFlipped || false;
        } else {
            currentFillList = [];
            currentFillIndex = 0;
            currentQuizList = [];
            currentQuizIndex = 0;
            currentFlashcards = [];
            flashcardIndex = 0;
            if (typeof isFlipped !== 'undefined') isFlipped = false;
        }
    } catch (e) {
        currentFillList = [];
        currentFillIndex = 0;
        currentQuizList = [];
        currentQuizIndex = 0;
        currentFlashcards = [];
        flashcardIndex = 0;
        if (typeof isFlipped !== 'undefined') isFlipped = false;
    }
}

/**
 * syncTableWithStorage - Đồng bộ bảng xem trước với dữ liệu localStorage mới nhất.
 * Được gọi tự động bởi monkey-patched setItem() khi dữ liệu vocab/starred thay đổi.
 * CHÚ Ý: Không refresh nếu người dùng đang gõ (inline edit hoặc textarea) để tránh mất focus.
 */
function syncTableWithStorage() {
    const vocabInput = document.getElementById('vocabInput');
    const isEditing = vocabInput && !vocabInput.classList.contains('hidden'); // Đang ở chế độ textarea?

    const activeEl = document.activeElement;
    const isTypingInTable = activeEl && activeEl.isContentEditable && activeEl.closest('#vocabPreviewBody'); // Đang inline edit?

    if (typeof updateStarredCount === 'function') {
        updateStarredCount(); // Cập nhật badge số sao
    }

    // Chỉ auto-refresh nếu không đang gõ → tránh giật UI
    if (!isEditing && !isTypingInTable) {
        toggleFilter(true); // isBackgroundSync = true → cập nhật nhẹ nhàng
    }
}

/* ============================================================================
 * DRAG & DROP FILE UPLOAD
 * Cho phép người dùng kéo thả file .txt/.csv vào vùng nhập từ vựng.
 * Khi thả file: đọc nội dung → đổ vào textarea → lưu localStorage → render bảng.
 * ============================================================================ */
function setupDragAndDrop() {
    const dropZone = document.getElementById('dropZone'); // Vùng cho phép thả file
    const input = document.getElementById('vocabInput');  // Textarea chính

    // Highlight vùng drop khi kéo file vào
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    // Bỏ highlight khi kéo file ra ngoài
    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
    });

    // Xử lý khi thả file
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');

        if (e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];    // Lấy file đầu tiên
            const reader = new FileReader();
            reader.onload = function (e) {
                input.value = e.target.result;         // Đổ nội dung vào textarea
                localStorage.setItem('toeic_vocab_list', input.value); // Lưu vào storage
                parseVocab(true);                      // Parse và render bảng
            };
            reader.readAsText(file); // Đọc file dạng text
        }
    });
}

/* ============================================================================
 * CHẾ ĐỘ THẺ FLASHCARD (FLASHCARD MODE)
 * 
 * State variables:
 *  - flashcardIndex: Vị trí thẻ hiện tại trong mảng currentFlashcards.
 *  - isFlipped: Thẻ đang lật (true = mặt sau/nghĩa, false = mặt trước/từ).
 *  - currentFlashcards: Mảng các thẻ đang học: [{word, meaning, aiExample?, phonetic?}, ...].
 *  - isFcAutoPlay: Tự động đọc từ khi lật thẻ (text-to-speech).
 *  - isListenModeEn: Chế độ ẩn câu ví dụ tiếng Anh (để kiểm tra nghe).
 *  - isListenModeVi: Chế độ ẩn câu ví dụ tiếng Việt.
 *  - isFcWordListenMode: Chế độ "Nghe & Gõ" - che từ trên thẻ, gõ lại để kiểm tra.
 * ============================================================================ */
let flashcardIndex = 0;        // Vị trí thẻ hiện tại
let isFlipped = false;         // Thẻ đang lật?
let currentFlashcards = [];    // Mảng thẻ đang học
let isFcAutoPlay = true;       // Tự động đọc từ?
let isListenModeEn = false;    // Ẩn câu ví dụ tiếng Anh?
let isListenModeVi = false;    // Ẩn câu ví dụ tiếng Việt?
let isFcWordListenMode = false; // Chế độ "Nghe & Gõ"?
let isFcMeaningBlurred = false; // Chế độ "ẩn tạm thời" tiếng Việt?

function toggleFcMeaningBlur(event) {
    if (event) event.stopPropagation();
    isFcMeaningBlurred = !isFcMeaningBlurred;
    const meaningHint = document.getElementById('fcListenMeaningHint');
    if (meaningHint) {
        if (isFcMeaningBlurred) {
            meaningHint.classList.add('blur-[6px]', 'opacity-40');
        } else {
            meaningHint.classList.remove('blur-[6px]', 'opacity-40');
        }
    }
}

/**
 * toggleFcWordListenMode - Bật/tắt chế độ "Nghe & Gõ".
 * Khi bật: từ trên thẻ bị blur, xuất hiện ô input để gõ lại từ.
 * Khi tắt: hiện lại từ bình thường, ẩn ô input.
 */
function toggleFcWordListenMode(event) {
    if (event) event.stopPropagation();
    isFcWordListenMode = !isFcWordListenMode;

    const icon = document.getElementById('fcWordListenIcon');
    if (isFcWordListenMode) {
        icon.className = 'fa-solid fa-eye-slash text-brand-400'; // Icon mắt tắt
    } else {
        icon.className = 'fa-solid fa-eye'; // Icon mắt mở
    }
    applyFcWordListenMode(); // Áp dụng trạng thái mới
}

/**
 * applyFcWordListenMode - Áp dụng trạng thái chế độ "Nghe & Gõ".
 * Nếu bật: Blur từ + phiên âm, hiện ô input để gõ, focus vào ô.
 * Nếu tắt: Bỏ blur, ẩn ô input, hiện lại hint "click để lật".
 */
function applyFcWordListenMode() {
    const wordEl = document.getElementById('fcWord');           // Phần tử hiện từ
    const phoneticEl = document.getElementById('fcPhonetic');   // Phần tử hiện phiên âm IPA
    const spellContainer = document.getElementById('fcSpellContainer'); // Container ô gõ từ
    const spellInput = document.getElementById('fcSpellInput');         // Ô input gõ từ
    const hint = document.getElementById('fcFrontHint');        // Hint "click để lật thẻ"
    const meaningHint = document.getElementById('fcListenMeaningHint'); // Hint nghĩa tiếng Việt

    if (isFcWordListenMode) {
        // Bật chế độ: blur từ, hiện ô input
        wordEl.classList.add('blur-md', 'opacity-40', 'select-none', 'cursor-pointer');
        wordEl.title = 'Click để xem từ vựng';
        if (phoneticEl) {
            phoneticEl.classList.add('hidden'); // Ẩn phiên âm để nhường chỗ cho nghĩa tiếng Việt
        }
        if (meaningHint) {
            meaningHint.classList.remove('hidden');
            if (typeof currentFlashcards !== 'undefined' && currentFlashcards[flashcardIndex]) {
                meaningHint.innerText = currentFlashcards[flashcardIndex].meaning;
            }
            if (isFcMeaningBlurred) {
                meaningHint.classList.add('blur-[6px]', 'opacity-40');
            } else {
                meaningHint.classList.remove('blur-[6px]', 'opacity-40');
            }
        }
        if (spellContainer) spellContainer.classList.remove('hidden');
        if (hint) hint.classList.add('hidden');
        if (spellInput) {
            spellInput.value = '';  // Reset ô input
            spellInput.className = "w-full bg-slate-900 border-2 border-slate-600 focus:border-brand-500 rounded-xl px-4 py-3 text-center text-xl text-white outline-none font-bold placeholder-slate-500 transition-all shadow-inner relative z-10";
            setTimeout(() => spellInput.focus(), 50); // Auto-focus vào ô gõ
        }
        const feedbackEl = document.getElementById('fcSpellFeedback');
        if (feedbackEl) feedbackEl.classList.add('hidden'); // Ẩn feedback cũ
    } else {
        // Tắt chế độ: bỏ blur, ẩn ô input
        wordEl.classList.remove('blur-md', 'opacity-40', 'select-none', 'cursor-pointer');
        wordEl.title = '';
        if (phoneticEl) {
            phoneticEl.classList.remove('hidden', 'blur-md', 'opacity-40', 'select-none', 'cursor-pointer');
            phoneticEl.title = '';
        }
        if (meaningHint) meaningHint.classList.add('hidden');
        if (spellContainer) spellContainer.classList.add('hidden');
        if (hint) hint.classList.remove('hidden');
    }
}

function revealFcWord(event) {
    if (isFcWordListenMode && document.getElementById('fcWord').classList.contains('blur-md')) {
        if (event) event.stopPropagation();
        document.getElementById('fcWord').classList.remove('blur-md', 'opacity-40', 'select-none', 'cursor-pointer');
        const phoneticEl = document.getElementById('fcPhonetic');
        if (phoneticEl) phoneticEl.classList.remove('blur-md', 'opacity-40', 'select-none', 'cursor-pointer');
        const meaningHint = document.getElementById('fcListenMeaningHint');
        if (meaningHint) {
            meaningHint.classList.add('hidden'); // Ẩn nghĩa đi khi đã reveal
            meaningHint.classList.remove('blur-[6px]', 'opacity-40');
        }
    }
}

function checkFcSpell(event) {
    if (currentFlashcards.length === 0) return;
    const targetWord = currentFlashcards[flashcardIndex].word.toLowerCase().trim();
    const inputEl = event.target;
    const userText = inputEl.value.toLowerCase().trim();

    // Ẩn lỗi nếu đang gõ lại
    const feedbackEl = document.getElementById('fcSpellFeedback');
    if (feedbackEl && !feedbackEl.classList.contains('hidden')) {
        feedbackEl.classList.add('hidden');
        inputEl.classList.remove('border-rose-500', 'focus:border-rose-500', 'text-rose-400');
        inputEl.classList.add('focus:border-brand-500', 'text-white');
    }

    if (userText === targetWord) {
        const wasAlreadyCorrect = inputEl.classList.contains('border-emerald-500');

        inputEl.className = "w-full bg-emerald-900/30 border-2 border-emerald-500 rounded-xl px-4 py-3 text-center text-xl text-emerald-400 outline-none font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] relative z-10";
        document.getElementById('fcWord').classList.remove('blur-md', 'opacity-40', 'select-none', 'cursor-pointer');
        const phoneticEl = document.getElementById('fcPhonetic');
        if (phoneticEl) phoneticEl.classList.remove('blur-md', 'opacity-40', 'select-none', 'cursor-pointer');

        // Tự động hiện rõ nghĩa tiếng Việt
        const meaningHint = document.getElementById('fcListenMeaningHint');
        if (meaningHint) meaningHint.classList.remove('blur-[6px]', 'opacity-40');

        // Tự động đọc từ khi vừa gõ đúng xong (nếu bật Tự động đọc)
        if (!wasAlreadyCorrect && typeof isFcAutoPlay !== 'undefined' && isFcAutoPlay) {
            setTimeout(() => speakWord(null), 50);
        }
    } else {
        // Chỉ reset style cơ bản nếu chưa báo lỗi (logic ẩn lỗi ở trên đã xử lý phần lớn)
        if (!inputEl.classList.contains('border-rose-500')) {
            inputEl.className = "w-full bg-slate-900 border-2 border-slate-600 focus:border-brand-500 rounded-xl px-4 py-3 text-center text-xl text-white outline-none font-bold placeholder-slate-500 transition-all shadow-inner relative z-10";
        }
    }
}

function handleFcSpellKeydown(event) {
    if (event.key === 'Tab' || event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        event.preventDefault();
        flipFlashcard();
        return;
    }

    if (event.key === 'Backspace') {
        const inputEl = event.target;
        const feedbackEl = document.getElementById('fcSpellFeedback');
        const isWrong = feedbackEl && !feedbackEl.classList.contains('hidden');
        const isCorrect = inputEl.classList.contains('border-emerald-500');

        if (isWrong || isCorrect) {
            // Đã hiển thị đúng/sai -> bấm Backspace để xóa hết và tập ghi lại
            event.preventDefault();
            inputEl.value = '';
            
            // Xóa trạng thái sai
            if (isWrong) {
                feedbackEl.classList.add('hidden');
                inputEl.classList.remove('border-rose-500', 'focus:border-rose-500', 'text-rose-400');
            }
            
            // Xóa trạng thái đúng
            if (isCorrect) {
                inputEl.classList.remove('border-emerald-500', 'bg-emerald-900/30', 'text-emerald-400', 'shadow-[0_0_15px_rgba(16,185,129,0.3)]');
            }
            
            // Trả về trạng thái mặc định
            inputEl.className = "w-full bg-slate-900 border-2 border-slate-600 focus:border-brand-500 rounded-xl px-4 py-3 text-center text-xl text-white outline-none font-bold placeholder-slate-500 transition-all shadow-inner relative z-10";

            // Bật lại chế độ ẩn (blur) để người dùng phải tự nhớ và gõ lại
            document.getElementById('fcWord').classList.add('blur-md', 'opacity-40', 'select-none', 'cursor-pointer');
            const phoneticEl = document.getElementById('fcPhonetic');
            if (phoneticEl) phoneticEl.classList.add('blur-md', 'opacity-40', 'select-none', 'cursor-pointer');
            
            return;
        }
    }

    if (event.key === 'Enter') {
        if (event.repeat) return;
        event.preventDefault();
        const inputEl = event.target;
        const userText = inputEl.value.toLowerCase().trim();
        const targetWord = currentFlashcards[flashcardIndex].word.toLowerCase().trim();
        const feedbackEl = document.getElementById('fcSpellFeedback');

        if (userText === '') {
            nextFlashcard();
        } else if (userText !== targetWord) {
            if (feedbackEl && !feedbackEl.classList.contains('hidden')) {
                // Nếu đang báo lỗi mà vẫn bấm Enter -> Chấp nhận sai và qua câu
                nextFlashcard();
            } else if (feedbackEl) {
                // So sánh lỗi chính tả và hiển thị
                let html = '';
                for (let i = 0; i < targetWord.length; i++) {
                    if (i < userText.length && userText[i] === targetWord[i]) {
                        html += `<span class="text-emerald-400">${targetWord[i]}</span>`;
                    } else {
                        html += `<span class="text-rose-500 underline decoration-rose-500/50">${targetWord[i]}</span>`;
                    }
                }
                if (userText.length > targetWord.length) {
                    const extra = userText.substring(targetWord.length);
                    html += `<span class="text-rose-500 line-through opacity-50">${extra}</span>`;
                }

                feedbackEl.innerHTML = html;
                feedbackEl.classList.remove('hidden');

                // Đổi màu ô input thành đỏ
                inputEl.classList.remove('focus:border-brand-500', 'border-slate-600', 'text-white');
                inputEl.classList.add('border-rose-500', 'focus:border-rose-500', 'text-rose-400');

                document.getElementById('fcWord').classList.remove('blur-md', 'opacity-40', 'select-none', 'cursor-pointer');
                const phoneticEl = document.getElementById('fcPhonetic');
                if (phoneticEl) phoneticEl.classList.remove('blur-md', 'opacity-40', 'select-none', 'cursor-pointer');

                // Tự động hiện rõ nghĩa tiếng Việt
                const meaningHint = document.getElementById('fcListenMeaningHint');
                if (meaningHint) meaningHint.classList.remove('blur-[6px]', 'opacity-40');

                // Tự động đọc lại từ để người học nghe kỹ lại chỗ mình sai
                setTimeout(() => speakWord(null), 50);
            }
        } else {
            nextFlashcard();
        }
    }
}

/**
 * toggleListenModeEn - Bật/tắt chế độ ẩn câu ví dụ tiếng Anh trên flashcard.
 * Khi bật: câu tiếng Anh bị blur, phải click để hiện → luyện nghe.
 */
function toggleListenModeEn(event) {
    if (event) event.stopPropagation();
    isListenModeEn = !isListenModeEn;
    const icon = document.getElementById('fcListenIconEn');
    const enEl = document.getElementById('fcExEn');

    if (isListenModeEn) {
        icon.className = 'fa-solid fa-eye-slash text-brand-400';
        enEl.classList.add('blur-md', 'select-none', 'cursor-pointer', 'opacity-70');
        enEl.title = 'Click để xem câu tiếng Anh';
    } else {
        icon.className = 'fa-solid fa-eye';
        enEl.classList.remove('blur-md', 'select-none', 'cursor-pointer', 'opacity-70');
        enEl.title = '';
    }
}

function toggleListenModeVi(event) {
    if (event) event.stopPropagation();
    isListenModeVi = !isListenModeVi;
    const icon = document.getElementById('fcListenIconVi');
    const viEl = document.getElementById('fcExVi');

    if (isListenModeVi) {
        icon.className = 'fa-solid fa-eye-slash text-brand-400';
        viEl.classList.add('blur-md', 'select-none', 'cursor-pointer', 'opacity-70');
        viEl.title = 'Click để xem câu tiếng Việt';
    } else {
        icon.className = 'fa-solid fa-eye';
        viEl.classList.remove('blur-md', 'select-none', 'cursor-pointer', 'opacity-70');
        viEl.title = '';
    }
}

function revealExampleEn(event) {
    if (event) event.stopPropagation();
    if (!isListenModeEn) return;
    const enEl = document.getElementById('fcExEn');
    enEl.classList.toggle('blur-md');
    enEl.classList.toggle('opacity-70');
}

function revealExampleVi(event) {
    if (event) event.stopPropagation();
    if (!isListenModeVi) return;
    const viEl = document.getElementById('fcExVi');
    viEl.classList.toggle('blur-md');
    viEl.classList.toggle('opacity-70');
}

let isFcSlideshow = false;
let autoPlaySequenceTimeout = null;
let currentAutoPlayId = 0;
window.currentViAudio = null;
let fcPlaybackSpeed = 1.0;
let fcExampleReadMode = 'none';

function changePlaybackSpeed() {
    const speedSelect = document.getElementById('fcPlaybackSpeed');
    if (speedSelect) {
        fcPlaybackSpeed = parseFloat(speedSelect.value);
    }
}

function changeExampleReadMode() {
    const modeSelect = document.getElementById('fcExampleReadMode');
    if (modeSelect) {
        fcExampleReadMode = modeSelect.value;
    }
}

function stopAllAudio() {
    window.speechSynthesis.cancel();
    if (window.currentViAudio) {
        window.currentViAudio.pause();
        window.currentViAudio.removeAttribute('src');
        window.currentViAudio.load();
        window.currentViAudio = null;
    }
}

function runAutoPlaySequence() {
    if (!isFcSlideshow) return;
    
    currentAutoPlayId++;
    const seqId = currentAutoPlayId;
    
    // Hàm trợ giúp phát Google TTS và tự động fallback về Web Speech API nếu lỗi
    const playGoogleTTS = (text, langGoogle, langWeb, onEnd) => {
        if (!isFcSlideshow || seqId !== currentAutoPlayId) return;
        const url = `https://translate.googleapis.com/translate_tts?client=gtx&ie=UTF-8&tl=${langGoogle}&q=${encodeURIComponent(text)}`;
        window.currentViAudio = new Audio(url);
        window.currentViAudio.playbackRate = fcPlaybackSpeed;
        
        window.currentViAudio.onended = () => {
            if (!isFcSlideshow || seqId !== currentAutoPlayId) return;
            if (onEnd) onEnd();
        };
        
        window.currentViAudio.onerror = () => {
            playSpeechRobust(text, langWeb, 0.85 * fcPlaybackSpeed, () => {
                if (!isFcSlideshow || seqId !== currentAutoPlayId) return;
                if (onEnd) onEnd();
            });
        };
        
        window.currentViAudio.play().catch(e => {
            if (window.currentViAudio && window.currentViAudio.onerror) window.currentViAudio.onerror();
        });
    };
    
    // Đọc Từ vựng chính bằng Google TTS (Thay vì Web Speech API)
    const card = currentFlashcards[flashcardIndex];
    if (!card) return;
    
    let text = card.word;
    text = text.replace(/\//g, ', ');
    const langGoogle = isVietnameseText(text) ? 'vi' : 'en';
    const langWeb = isVietnameseText(text) ? 'vi-VN' : 'en-US';

    playGoogleTTS(text, langGoogle, langWeb, () => {
        if (!isFcSlideshow || seqId !== currentAutoPlayId) return;
        
        // Nghỉ 1 chút xíu rồi đọc tiếng Việt
        autoPlaySequenceTimeout = setTimeout(() => {
            if (!isFcSlideshow || seqId !== currentAutoPlayId) return;
            
            const handleExampleSequence = () => {
                if (!isFcSlideshow || seqId !== currentAutoPlayId) return;
                
                const aiExEn = document.getElementById('fcExEn');
                const aiExVi = document.getElementById('fcExVi');
                const aiExampleContainer = document.getElementById('fcAiExample');
                
                const hasExample = aiExEn && aiExampleContainer && !aiExampleContainer.classList.contains('hidden') && aiExEn.innerText.trim() !== '';

                if (fcExampleReadMode !== 'none' && hasExample) {
                    autoPlaySequenceTimeout = setTimeout(() => {
                        if (!isFcSlideshow || seqId !== currentAutoPlayId) return;
                        
                        let enText = aiExEn.innerText;
                        if (enText.startsWith('"') && enText.endsWith('"')) enText = enText.substring(1, enText.length - 1);
                        
                        // Đọc ví dụ tiếng Anh bằng Google TTS
                        playGoogleTTS(enText, 'en', 'en-US', () => {
                            const hasViExample = aiExVi && aiExVi.innerText.trim() !== '';
                            if (fcExampleReadMode === 'en_vi' && hasViExample) {
                                // Đọc ví dụ tiếng Việt bằng Google TTS
                                autoPlaySequenceTimeout = setTimeout(() => {
                                    if (!isFcSlideshow || seqId !== currentAutoPlayId) return;
                                    let viText = aiExVi.innerText;
                                    playGoogleTTS(viText, 'vi', 'vi-VN', () => {
                                        autoPlaySequenceTimeout = setTimeout(() => {
                                            if (!isFcSlideshow || seqId !== currentAutoPlayId) return;
                                            nextFlashcard();
                                        }, 500 / fcPlaybackSpeed);
                                    });
                                }, 500 / fcPlaybackSpeed);
                            } else {
                                // Bỏ qua ví dụ tiếng Việt, sang thẻ mới
                                autoPlaySequenceTimeout = setTimeout(() => {
                                    if (!isFcSlideshow || seqId !== currentAutoPlayId) return;
                                    nextFlashcard();
                                }, 500 / fcPlaybackSpeed);
                            }
                        });
                    }, 500 / fcPlaybackSpeed);
                } else {
                    // Không đọc ví dụ hoặc không có data, sang thẻ mới
                    autoPlaySequenceTimeout = setTimeout(() => {
                        if (!isFcSlideshow || seqId !== currentAutoPlayId) return;
                        nextFlashcard();
                    }, 500 / fcPlaybackSpeed);
                }
            };
            
            if (card && card.meaning) {
                // Đọc nghĩa Tiếng Việt của từ vựng bằng Google TTS
                playGoogleTTS(card.meaning, 'vi', 'vi-VN', handleExampleSequence);
            } else {
                handleExampleSequence();
            }
        }, 500 / fcPlaybackSpeed); // 0.5 giây nghỉ điều chỉnh theo tốc độ
    });
}

let wakeLock = null;
async function requestWakeLock() {
    if ('wakeLock' in navigator) {
        try {
            wakeLock = await navigator.wakeLock.request('screen');
            wakeLock.addEventListener('release', () => {
                console.log('Screen Wake Lock released');
            });
        } catch (err) {
            console.error(`Wake Lock error: ${err.name}, ${err.message}`);
        }
    }
}
function releaseWakeLock() {
    if (wakeLock !== null) {
        wakeLock.release().then(() => wakeLock = null);
    }
}

document.addEventListener('visibilitychange', () => {
    if (wakeLock !== null && document.visibilityState === 'visible' && (isFcSlideshow || isFcAutoPlay)) {
        requestWakeLock();
    }
});

function toggleSlideshow() {
    isFcSlideshow = !isFcSlideshow;
    const btn = document.getElementById('fcSlideshowBtn');
    const icon = document.getElementById('fcSlideshowIcon');
    const speedControl = document.getElementById('fcSpeedControl');

    if (isFcSlideshow) {
        btn.className = 'bg-amber-100 text-amber-600 hover:bg-amber-200 px-4 py-2 rounded-xl transition-all text-sm font-bold flex items-center gap-2';
        icon.className = 'fa-solid fa-pause';
        if (speedControl) speedControl.classList.remove('hidden');
        if (autoPlaySequenceTimeout) clearTimeout(autoPlaySequenceTimeout);
        requestWakeLock();
        runAutoPlaySequence();
    } else {
        btn.className = 'bg-slate-100 text-slate-500 hover:bg-amber-50 hover:text-amber-500 px-4 py-2 rounded-xl transition-all text-sm font-bold flex items-center gap-2';
        icon.className = 'fa-solid fa-play';
        if (speedControl) speedControl.classList.add('hidden');
        if (autoPlaySequenceTimeout) clearTimeout(autoPlaySequenceTimeout);
        stopAllAudio(); // Dừng phát âm
        if (!isFcAutoPlay) releaseWakeLock();
    }
}

/**
 * toggleAutoPlay - Bật/tắt chế độ tự động đọc từ (text-to-speech) khi lật thẻ.
 * Khi bật: nút sáng lên, đọc luôn từ hiện tại.
 * Khi tắt: nút mờ đi, dừng speech synthesis.
 */
function toggleAutoPlay() {
    isFcAutoPlay = !isFcAutoPlay;
    const btn = document.getElementById('fcAutoPlayBtn');
    const icon = document.getElementById('fcAutoPlayIcon');

    if (isFcAutoPlay) {
        // Bật: Sáng nút + đọc từ
        btn.className = 'bg-sky-100 text-sky-500 hover:bg-sky-200 px-4 py-2 rounded-xl transition-all text-sm font-bold flex items-center gap-2';
        icon.className = 'fa-solid fa-volume-high';
        requestWakeLock();
        speakWord(null); 
    } else {
        // Tắt: Mờ nút + dừng đọc
        btn.className = 'bg-slate-100 text-slate-500 hover:bg-sky-50 hover:text-sky-500 px-4 py-2 rounded-xl transition-all text-sm font-bold flex items-center gap-2';
        icon.className = 'fa-solid fa-volume-xmark';
        stopAllAudio(); // Dừng phát âm
        if (!isFcSlideshow) releaseWakeLock();
    }
}

/**
 * getStarredWords - Lấy danh sách từ được đánh dấu sao từ localStorage.
 * @returns {Array} - Mảng các object: [{word, meaning, aiExample?}, ...]
 * 
 * Tính năng đặc biệt:
 * 1. Tương thích ngược: Nếu dữ liệu cũ là string[], tự migrate sang object[].
 * 2. Hydrate AI cache: Tự gắn aiExample từ cache vào từng từ để hiển thị trong Quiz/Flashcard.
 * 3. Thử nhiều cache key: newCacheKey, oldCacheKey, legacyNewCacheKey, legacyOldCacheKey.
 */
function getStarredWords() {
    try {
        let list = JSON.parse(localStorage.getItem('toeic_starred_words') || "[]");
        // Tương thích ngược: Migrate từ dạng string[] sang object[]
        if (list.length > 0 && typeof list[0] === 'string') {
            list = list.map(w => {
                const existing = (typeof parsedVocabList !== 'undefined') ? parsedVocabList.find(x => x.word === w) : null;
                return existing ? { ...existing } : { word: w, meaning: "..." };
            });
            localStorage.setItem('toeic_starred_words', JSON.stringify(list));
        }

        // Hydrate: Gắn dữ liệu AI đã cache vào từng từ starred
        let aiCache = {};
        try { aiCache = JSON.parse(localStorage.getItem('toeic_ai_cache') || "{}"); } catch (e) { }
        list.forEach(item => {
            if (item.word) {
                // Thử các biến thể cache key: mới → cũ → legacy
                const newCacheKey = `${item.word.toLowerCase()}_${(item.meaning || '').toLowerCase().replace(/\s+/g, '')}_${aiDifficultyLevel}`;
                const oldCacheKey = `${item.word.toLowerCase()}_${aiDifficultyLevel}`;
                let cacheEntry = aiCache[newCacheKey] || aiCache[oldCacheKey];
                
                if (!cacheEntry) {
                    const fallbackSuffixes = ['_fc_short', '_fc_long', '_medium', '_hard', '_easy', ''];
                    const baseKey = `${item.word.toLowerCase()}_${(item.meaning || '').toLowerCase().replace(/\s+/g, '')}`;
                    const baseOldKey = item.word.toLowerCase();
                    for (let suffix of fallbackSuffixes) {
                        if (aiCache[`${baseKey}${suffix}`]) { cacheEntry = aiCache[`${baseKey}${suffix}`]; break; }
                        if (aiCache[`${baseOldKey}${suffix}`]) { cacheEntry = aiCache[`${baseOldKey}${suffix}`]; break; }
                    }
                }

                if (!cacheEntry) {
                    const legacyNewCacheKey = `${item.word.toLowerCase()}_${(item.meaning || '').toLowerCase().replace(/\s+/g, '')}`;
                    const legacyOldCacheKey = item.word.toLowerCase();
                    cacheEntry = aiCache[legacyNewCacheKey] || aiCache[legacyOldCacheKey];
                }
                if (cacheEntry) {
                    item.aiExample = cacheEntry; // Gắn dữ liệu AI vào từ
                }
            }
        });

        return list;
    } catch (e) {
        return [];
    }
}

/** Kiểm tra từ có được đánh dấu sao không */
function isWordStarred(wordStr) {
    return getStarredWords().some(x => x.word === wordStr);
}

/** Cập nhật badge số từ sao trên sidebar */
function updateStarredCount() {
    const starred = getStarredWords();
    const countElem = document.getElementById('starredCount');
    if (countElem) {
        countElem.innerText = starred.length;
    }
}

/**
 * toggleStarInList - Đánh dấu/bỏ dấu sao cho từ vựng.
 * @param {Object} wordObj - {word, meaning, ...}
 * @returns {boolean} - true nếu đã đánh sao, false nếu đã bỏ sao
 */
function toggleStarInList(wordObj) {
    let starred = getStarredWords();
    const idx = starred.findIndex(item => item.word === wordObj.word);
    let isStarred = false;
    if (idx === -1) {
        starred.push(wordObj);  // Thêm vào danh sách sao
        isStarred = true;
    } else {
        starred.splice(idx, 1); // Xóa khỏi danh sách sao
    }
    localStorage.setItem('toeic_starred_words', JSON.stringify(starred));
    updateStarredCount();
    return isStarred;
}

/** Toggle sao trên thẻ flashcard hiện tại */
function toggleFcStar(event) {
    if (event) event.stopPropagation();
    if (!currentFlashcards || currentFlashcards.length === 0) return;
    const card = currentFlashcards[flashcardIndex];
    if (!card) return;

    const isStarred = toggleStarInList(card);
    updateFcStarIcon(isStarred);
}

function updateFcStarIcon(isStarred) {
    const icon = document.getElementById('fcStarIcon');
    if (icon) {
        if (isStarred) {
            icon.className = "fa-solid fa-star text-yellow-400 drop-shadow-sm scale-110 transition-transform";
        } else {
            icon.className = "fa-regular fa-star text-slate-500 hover:text-yellow-400 transition-colors";
        }
    }
}

/** Hiển thị popup xác nhận xóa thẻ Flashcard */
function showDeleteFcConfirm(event) {
    if (event) event.stopPropagation();
    const btn = event.currentTarget;
    const popup = document.getElementById('fcDeleteConfirmPopup');
    if (popup && btn) {
        // Tạm thời hiển thị ẩn để lấy kích thước
        popup.style.visibility = 'hidden';
        popup.classList.remove('hidden');

        const btnRect = btn.getBoundingClientRect();
        const popupRect = popup.getBoundingClientRect();

        // Tính toán vị trí tương đối với màn hình (fixed)
        const top = btnRect.top - popupRect.height - 12;
        const left = btnRect.left + (btnRect.width / 2) - (popupRect.width / 2);

        popup.style.top = top + 'px';
        popup.style.left = left + 'px';
        popup.style.visibility = 'visible';
    }
    document.addEventListener('click', hideDeleteFcConfirmOutside);
}

/** Ẩn popup xác nhận xóa thẻ Flashcard */
function hideDeleteFcConfirm(event) {
    if (event) event.stopPropagation();
    const popup = document.getElementById('fcDeleteConfirmPopup');
    if (popup) popup.classList.add('hidden');
    document.removeEventListener('click', hideDeleteFcConfirmOutside);
}

/** Ẩn popup khi click ra ngoài */
function hideDeleteFcConfirmOutside(event) {
    const popup = document.getElementById('fcDeleteConfirmPopup');
    if (popup && !popup.contains(event.target) && !event.target.closest('button[onclick="showDeleteFcConfirm(event)"]')) {
        hideDeleteFcConfirm(null);
    }
}

/** Xóa từ vựng hiện tại khi đang học Flashcard (Đã xác nhận) */
function executeDeleteFcWord(event) {
    if (event) event.stopPropagation();
    hideDeleteFcConfirm(null);

    if (!currentFlashcards || currentFlashcards.length === 0) return;
    const card = currentFlashcards[flashcardIndex];
    if (!card) return;

    // 1. Xóa khỏi textarea và parsedVocabList
    const realIndex = parsedVocabList.findIndex(v => v.word === card.word);
    if (realIndex !== -1) {
        const textarea = document.getElementById('vocabInput');
        let lines = textarea.value.split('\n');
        let parsedCount = 0;
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].trim() !== '') {
                if (parsedCount === realIndex) {
                    lines.splice(i, 1);
                    break;
                }
                parsedCount++;
            }
        }
        textarea.value = lines.join('\n');
        localStorage.setItem('toeic_vocab_list', textarea.value);
        parsedVocabList.splice(realIndex, 1);
    }

    // 2. Xóa khỏi danh sách sao
    let starred = getStarredWords();
    const sIdx = starred.findIndex(s => s.word === card.word);
    if (sIdx !== -1) {
        starred.splice(sIdx, 1);
        localStorage.setItem('toeic_starred_words', JSON.stringify(starred));
    }

    // 3. Cập nhật bảng preview ẩn bên ngoài
    parseVocab(true);

    // 4. Xóa khỏi mảng đang học
    currentFlashcards.splice(flashcardIndex, 1);

    // 5. Reset các phiên học khác (để nó tạo lại ngẫu nhiên không dính từ bị xóa)
    try { currentFillList = []; } catch (e) { }
    const saveToggle = document.getElementById('saveSessionToggle');
    if (saveToggle) saveToggle.checked = false;

    // Xử lý UI Flashcard
    if (currentFlashcards.length === 0) {
        document.getElementById('flashcardTotalCount').innerText = "0";
        document.getElementById('fcWord').innerHTML = "Hoàn thành!";
        document.getElementById('fcMeaning').innerText = "Không còn từ nào.";
        if (document.getElementById('fcGoogleTrans')) document.getElementById('fcGoogleTrans').classList.add('hidden');
        if (document.getElementById('fcAiExample')) document.getElementById('fcAiExample').classList.add('hidden');
        return;
    }

    if (flashcardIndex >= currentFlashcards.length) {
        flashcardIndex = currentFlashcards.length - 1;
    }

    // Ép lật thẻ về mặt trước nếu đang ở mặt sau để render từ tiếp theo mượt hơn
    const fc = document.getElementById('flashcard');
    if (fc && fc.classList.contains('rotate-y-180')) {
        fc.classList.remove('rotate-y-180');
        setTimeout(() => renderFlashcard(), 300);
    } else {
        renderFlashcard();
    }
}

// =====================================================================
// [FLASHCARD MODE] startFlashcardMode
// MỤC ĐÍCH: Khởi tạo dữ liệu và giao diện cho chế độ Flashcard.
// CÁCH HOẠT ĐỘNG:
// - Kiểm tra xem người dùng có chọn "Lọc sao" (từ yêu thích) không.
// - Xử lý tính năng "Lưu tiến độ": Quyết định có nên tạo lại ví dụ mới hay giữ nguyên state cũ.
// - Nếu AI Example Toggle bật và thiếu dữ liệu, gọi API (generateBulkExamples) để bổ sung.
// - Random trộn danh sách (nếu cần) và chuyển giao diện sang #flashcardContainer.
// =====================================================================
async function startFlashcardMode() {
    isFcSlideshow = false;
    const slideshowBtn = document.getElementById('fcSlideshowBtn');
    const slideshowIcon = document.getElementById('fcSlideshowIcon');
    const speedControl = document.getElementById('fcSpeedControl');
    if (slideshowBtn && slideshowIcon) {
        slideshowBtn.className = 'bg-slate-100 text-slate-500 hover:bg-amber-50 hover:text-amber-500 px-4 py-2 rounded-xl transition-all text-sm font-bold flex items-center gap-2';
        slideshowIcon.className = 'fa-solid fa-play';
    }
    if (speedControl) speedControl.classList.add('hidden');

    // Đảm bảo luôn bật chế độ tự động đọc khi mới vào
    isFcAutoPlay = true;
    const autoPlayBtn = document.getElementById('fcAutoPlayBtn');
    const autoPlayIcon = document.getElementById('fcAutoPlayIcon');
    if (autoPlayBtn && autoPlayIcon) {
        autoPlayBtn.className = 'bg-sky-100 text-sky-500 hover:bg-sky-200 px-4 py-2 rounded-xl transition-all text-sm font-bold flex items-center gap-2';
        autoPlayIcon.className = 'fa-solid fa-volume-high';
    }

    // [HACK FIX] Mở khóa Audio Context của trình duyệt (Audio Priming)
    const unlockUtterance = new SpeechSynthesisUtterance('');
    unlockUtterance.volume = 0;
    window.speechSynthesis.speak(unlockUtterance);

    if (parsedVocabList.length === 0) {
        alert("Vui lòng nhập danh sách từ vựng trước!");
        return;
    }

    let sourceList = parsedVocabList;
    const onlyStarred = document.getElementById('onlyStarredToggle') && !document.getElementById('onlyStarredToggle').checked;
    if (onlyStarred) {
        sourceList = getStarredWords();
        if (sourceList.length === 0) {
            alert("Bạn chưa đánh dấu (star) từ vựng nào hợp lệ.");
            return;
        }
    }

    const saveSessionToggle = document.getElementById('saveSessionToggle');
    let shouldResume = saveSessionToggle && saveSessionToggle.checked && currentFlashcards && currentFlashcards.length > 0;

    // Do not resume if the vocab list has been modified (e.g. pasted new list)
    if (shouldResume) {
        if (sourceList.length !== currentFlashcards.length) {
            shouldResume = false;
        } else {
            const sourceWords = sourceList.map(w => w.word + '|' + w.meaning).sort().join(',');
            const currentWords = currentFlashcards.map(w => w.word + '|' + w.meaning).sort().join(',');
            if (sourceWords !== currentWords) {
                shouldResume = false;
            }
        }

        // NẾU người dùng BẬT cờ AI, nhưng flashcards hiện tại CHƯA CÓ dữ liệu AI (do phiên trước không bật) -> ÉP tạo mới!
        const aiExampleToggle = document.getElementById('aiExampleToggle');
        if (shouldResume && aiExampleToggle && aiExampleToggle.checked) {
            const missingAiCount = currentFlashcards.filter(w => !w.aiExample || !w.aiExample.en).length;
            if (missingAiCount > 0) {
                shouldResume = false; // Phá vỡ Resume để đi xuống hàm AI sinh từ mới
            }
        }
    }

    if (shouldResume) {
        const hasAnyExamples = currentFlashcards.some(word => word.aiExample && word.aiExample.en);
        const exampleReadModeSelect = document.getElementById('fcExampleReadMode');
        if (exampleReadModeSelect) {
            if (!hasAnyExamples) {
                exampleReadModeSelect.classList.add('hidden');
                fcExampleReadMode = 'none';
                exampleReadModeSelect.value = 'none';
            } else {
                exampleReadModeSelect.classList.remove('hidden');
            }
        }

        document.getElementById('welcomeScreen').classList.add('hidden');
        document.getElementById('examContainer').classList.add('hidden');
        document.getElementById('loadingScreen').classList.add('hidden');
        document.getElementById('quizContainer').classList.add('hidden');
        document.getElementById('fillContainer').classList.add('hidden');
        document.getElementById('flashcardContainer').classList.remove('hidden');
        renderFlashcard();
        return;
    }

    const aiExampleToggle = document.getElementById('aiExampleToggle');
    if (aiExampleToggle && aiExampleToggle.checked) {
        let aiCache = {};
        try { aiCache = JSON.parse(localStorage.getItem('toeic_ai_cache') || "{}"); } catch (e) { }

        // Lấy dữ liệu từ Cache nạp vào RAM trước khi kiểm tra
        sourceList.forEach(w => {
            const newCacheKey = `${w.word.toLowerCase()}_${w.meaning.toLowerCase().replace(/\s+/g, '')}_fc_${fcAiLength}`;
            const fallbackCacheKey = `${w.word.toLowerCase()}_${w.meaning.toLowerCase().replace(/\s+/g, '')}_medium`;
            const oldCacheKey = `${w.word.toLowerCase()}_medium`;

            let cacheEntry = aiCache[newCacheKey] || aiCache[fallbackCacheKey] || aiCache[oldCacheKey];
            if (!cacheEntry) {
                const legacyNewCacheKey = `${w.word.toLowerCase()}_${w.meaning.toLowerCase().replace(/\s+/g, '')}`;
                const legacyOldCacheKey = w.word.toLowerCase();
                cacheEntry = aiCache[legacyNewCacheKey] || aiCache[legacyOldCacheKey];
            }
            if (cacheEntry && cacheEntry.en) {
                w.aiExample = cacheEntry;
                if (w.aiExample.synonyms && w.aiExample.synonyms.length > 0) {
                    const hasTags = w.aiExample.synonyms.some(s => {
                        const vi = s.vi || '';
                        return vi.toLowerCase().includes('[đồng nghĩa]') || vi.toLowerCase().includes('[trái nghĩa]');
                    });
                    if (!hasTags) {
                        w.aiExample.synonyms = [];
                    }
                }
            }

            // [AI BUGFIX] Lục tìm Family và Collocation từ TẤT CẢ các cấu hình khác (long, short, easy, medium, hard) để kế thừa
            let inheritedFamily = null;
            let inheritedSynonyms = null;
            let inheritedHomophones = null;

            if (!w.aiExample || !w.aiExample.family || w.aiExample.family.length === 0) {
                const possibleKeys = [
                    `${w.word.toLowerCase()}_${w.meaning.toLowerCase().replace(/\s+/g, '')}_fc_long`,
                    `${w.word.toLowerCase()}_fc_long`,
                    `${w.word.toLowerCase()}_${w.meaning.toLowerCase().replace(/\s+/g, '')}_fc_short`,
                    `${w.word.toLowerCase()}_fc_short`,
                    `${w.word.toLowerCase()}_${w.meaning.toLowerCase().replace(/\s+/g, '')}_medium`,
                    `${w.word.toLowerCase()}_medium`,
                    `${w.word.toLowerCase()}_${w.meaning.toLowerCase().replace(/\s+/g, '')}_hard`,
                    `${w.word.toLowerCase()}_hard`,
                    `${w.word.toLowerCase()}_${w.meaning.toLowerCase().replace(/\s+/g, '')}_easy`,
                    `${w.word.toLowerCase()}_easy`,
                    `${w.word.toLowerCase()}_${w.meaning.toLowerCase().replace(/\s+/g, '')}`,
                    w.word.toLowerCase()
                ];
                for (let pk of possibleKeys) {
                    if (aiCache[pk] && aiCache[pk].family && aiCache[pk].family.length > 0) {
                        inheritedFamily = aiCache[pk].family;
                        let rawSyn = aiCache[pk].synonyms || [];
                        if (rawSyn.length > 0) {
                            const hasTags = rawSyn.some(s => {
                                const vi = s.vi || '';
                                return vi.toLowerCase().includes('[đồng nghĩa]') || vi.toLowerCase().includes('[trái nghĩa]');
                            });
                            if (!hasTags) {
                                rawSyn = [];
                            }
                        }
                        inheritedSynonyms = rawSyn;
                        inheritedHomophones = aiCache[pk].homophones || [];
                        break;
                    }
                }
            }

            if (inheritedFamily) {
                if (!w.aiExample) w.aiExample = {};
                w.aiExample.family = inheritedFamily;
                w.aiExample.synonyms = inheritedSynonyms;
                w.aiExample.homophones = inheritedHomophones;
            }
        });

        let wordsNeedingEverything = [];
        let wordsNeedingOnlyExample = [];

        if (saveSessionToggle && !saveSessionToggle.checked) {
            // Nếu tắt "Lưu tiến độ": TẠO MỚI HOÀN TOÀN TẤT CẢ.
            sourceList.forEach(w => {
                delete w.aiExample; // Xóa trong RAM để ép tạo mới toàn bộ
                wordsNeedingEverything.push(w);
            });
        } else {
            // Nếu bật "Lưu tiến độ": Chỉ lấy những từ CHƯA CÓ dữ liệu flashcard
            sourceList.forEach(w => {
                if (!w.aiExample || !w.aiExample.en) {
                    const hasFamily = w.aiExample && w.aiExample.family && w.aiExample.family.length > 0;
                    const hasSynonyms = w.aiExample && w.aiExample.synonyms && w.aiExample.synonyms.length > 0;
                    if (hasFamily && hasSynonyms) {
                        w._tempInheritedFamily = w.aiExample.family;
                        w._tempInheritedSynonyms = w.aiExample.synonyms;
                        w._tempInheritedHomophones = w.aiExample.homophones;
                        wordsNeedingOnlyExample.push(w);
                    } else {
                        wordsNeedingEverything.push(w);
                    }
                }
            });
        }

        if (wordsNeedingEverything.length > 0 || wordsNeedingOnlyExample.length > 0) {
            if (!apiKey) {
                alert("Vui lòng cấu hình API Key để tạo ví dụ bằng AI.");
                return;
            }

            document.getElementById('welcomeScreen').classList.add('hidden');
            document.getElementById('examContainer').classList.add('hidden');
            document.getElementById('flashcardContainer').classList.add('hidden');
            document.getElementById('quizContainer').classList.add('hidden');
            document.getElementById('fillContainer').classList.add('hidden');

            const loading = document.getElementById('loadingScreen');
            loading.classList.remove('hidden');
            document.getElementById('loadingSubText').innerHTML = "";
            updateLoadingProgress("Chờ chút xíu...", 10);

            const keysArray = apiKey.split(',').map(k => k.trim()).filter(k => k);
            window.clickKeyIndex = window.clickKeyIndex || 0;
            const assignedKeyForThisClick = keysArray[window.clickKeyIndex % keysArray.length];
            window.clickKeyIndex++;

            try {
                if (wordsNeedingEverything.length > 0) {
                    await generateBulkExamples(wordsNeedingEverything, assignedKeyForThisClick, false, 'flashcard');
                }
                if (wordsNeedingOnlyExample.length > 0) {
                    await generateBulkExamples(wordsNeedingOnlyExample, assignedKeyForThisClick, true, 'flashcard');
                }
                turnOnSaveSessionToggle();
            } catch (err) {
                alert("Lỗi khi tạo ví dụ: " + err.message);
                loading.classList.add('hidden');
                document.getElementById('welcomeScreen').classList.remove('hidden');
                return;
            }
        }
    }

    currentFlashcards = [...sourceList];
    flashcardIndex = 0;
    isFlipped = false;
    saveSessionForCurrentDifficulty();

    const hasAnyExamples = currentFlashcards.some(word => word.aiExample && word.aiExample.en);
    const exampleReadModeSelect = document.getElementById('fcExampleReadMode');
    if (exampleReadModeSelect) {
        if (!hasAnyExamples) {
            exampleReadModeSelect.classList.add('hidden');
            fcExampleReadMode = 'none';
            exampleReadModeSelect.value = 'none';
        } else {
            exampleReadModeSelect.classList.remove('hidden');
        }
    }

    document.getElementById('welcomeScreen').classList.add('hidden');
    document.getElementById('examContainer').classList.add('hidden');
    document.getElementById('loadingScreen').classList.add('hidden');
    document.getElementById('quizContainer').classList.add('hidden');
    document.getElementById('fillContainer').classList.add('hidden');
    document.getElementById('flashcardContainer').classList.remove('hidden');

    renderFlashcard();
}

// =====================================================================
// [AI INTEGRATION] generateBulkExamples
// MỤC ĐÍCH: Gọi API của AI (Gemini/Groq) để tạo ví dụ hàng loạt cho từ vựng.
// CÁCH HOẠT ĐỘNG:
// - Xử lý theo lô (batchSize = 15) để tránh quá tải JSON output.
// - Truyền system prompt nghiêm ngặt bắt AI trả về đúng schema JSON bao gồm:
//   + Câu ví dụ (en) và dịch (vi).
//   + Các cụm từ đồng nghĩa / trái nghĩa (synonyms).
//   + Các từ cùng gốc (word family) và các từ dễ nhầm lẫn (homophones).
// =====================================================================
async function generateBulkExamples(wordsArray, assignedKey, onlyExample = false, targetMode = 'both') {
    const selectedModel = document.getElementById('aiModelSelect').value;
    const isGroq = !selectedModel.includes('gemini');

    let batchSize = 5;
    if (isGroq) {
        batchSize = 2;
    } else {
        if (targetMode === 'dictation') {
            batchSize = 20;
        } else {
            batchSize = 5;
        }
    }
    const keysArray = apiKey.split(',').map(k => k.trim()).filter(k => k);

    for (let i = 0; i < wordsArray.length; i += batchSize) {
        const batch = wordsArray.slice(i, i + batchSize);
        const wordListStr = batch.map((w, idx) => `ID: ${idx + 1} | Từ: "${w.word}" - Nghĩa: "${w.meaning}"`).join("\n");

        let styleInstruction = "";
        let outputFields = "";

        if (targetMode === 'flashcard') {
            // Cấu hình độ dài ví dụ theo tuỳ chọn của người dùng
            if (fcAiLength === 'short') {
                styleInstruction = "Tạo 1 CÂU VÍ DỤ TRUNG BÌNH (10-15 từ) rõ nghĩa ngữ cảnh. KHÔNG TẠO CÂU DICTATION.";
            } else {
                styleInstruction = "Tạo 1 CÂU VÍ DỤ TRUNG BÌNH (15-25 từ) rõ nghĩa ngữ cảnh. KHÔNG TẠO CÂU DICTATION.";
            }
            outputFields = `"en": "câu ví dụ tiếng anh (bọc [...] quanh TỪ VỰNG ĐANG HỌC)", \n      "vi": "câu dịch TỰ NHIÊN (bọc [...] quanh ĐÚNG phần dịch của từ vựng, DỊCH THEO NGỮ CẢNH, KHÔNG ÉP DÙNG TỪ ĐIỂN NẾU SƯỢNG)"`;
        } else if (targetMode === 'dictation') {
            if (aiDifficultyLevel === 'easy') {
                styleInstruction = "Tạo 1 CÂU VÍ DỤ NGẮN (8-13 từ) DỄ HIỂU ĐỂ LUYỆN NGHE ĐIỀN TỪ.";
                outputFields = `"en_dictation": "câu ví dụ tiếng anh (bọc [...] quanh TỪ VỰNG ĐANG HỌC)", \n      "vi_dictation": "câu dịch TỰ NHIÊN (bọc [...] quanh ĐÚNG phần dịch của từ vựng, DỊCH THEO NGỮ CẢNH, KHÔNG ÉP DÙNG TỪ ĐIỂN NẾU SƯỢNG)"`;
            } else if (aiDifficultyLevel === 'hard') {
                // [AI Note] Người dùng yêu cầu chế độ Khó (Hard) của phần Nghe & Điền (Dictation)
                // PHẢI LÀ nghe mô tả từ (định nghĩa) thay vì câu ví dụ đục lỗ điền khuyết.
                // Do đó prompt ở đây ép AI tạo câu có dạng: "Định nghĩa: từ gốc".
                styleInstruction = "Định nghĩa tiếng Anh mô tả từ, BẮT BUỘC đặt từ gốc NẰM TÁCH BIỆT Ở CUỐI CÂU sau dấu hai chấm (vd: 'A round fruit: apple'). ĐỂ LUYỆN NGHE MÔ TẢ TỪ.";
                outputFields = `"en_dictation": "câu định nghĩa tiếng anh", \n      "vi_dictation": "câu dịch"`;
            } else {
                styleInstruction = "Tạo 1 CÂU VÍ DỤ TRUNG BÌNH (15-20 từ) ĐỂ LUYỆN NGHE ĐIỀN TỪ.";
                outputFields = `"en_dictation": "câu ví dụ tiếng anh (bọc [...] quanh TỪ VỰNG ĐANG HỌC)", \n      "vi_dictation": "câu dịch TỰ NHIÊN (bọc [...] quanh ĐÚNG phần dịch của từ vựng, DỊCH THEO NGỮ CẢNH, KHÔNG ÉP DÙNG TỪ ĐIỂN NẾU SƯỢNG)"`;
            }
        } else {
            if (aiDifficultyLevel === 'easy') {
                styleInstruction = "Tạo 2 CÂU VÍ DỤ. Câu 1 (Flashcard): NGẮN (10-15 từ). Câu 2 (Dictation): NGẮN (8-13 từ). Câu 1 và 2 PHẢI KHÁC HOÀN TOÀN NHAU VỀ NGỮ CẢNH VÀ TỪ VỰNG.";
                outputFields = `"en": "câu 1 (Flashcard) (bọc [...] quanh TỪ VỰNG ĐANG HỌC)", \n      "vi": "câu dịch 1 TỰ NHIÊN (bọc [...] quanh ĐÚNG phần dịch của từ vựng, DỊCH THEO NGỮ CẢNH, KHÔNG ÉP DÙNG TỪ ĐIỂN NẾU SƯỢNG)", \n      "en_dictation": "câu 2 (Dictation, khác câu 1) (bọc [...] quanh TỪ VỰNG ĐANG HỌC)", \n      "vi_dictation": "câu dịch 2 TỰ NHIÊN (bọc [...] quanh ĐÚNG phần dịch của từ vựng, DỊCH THEO NGỮ CẢNH, KHÔNG ÉP DÙNG TỪ ĐIỂN NẾU SƯỢNG)"`;
            } else if (aiDifficultyLevel === 'hard') {
                styleInstruction = "Câu 1 (Flashcard): Tạo 1 CÂU VÍ DỤ NGẮN (10-15 từ) rõ nghĩa ngữ cảnh. Câu 2 (Dictation): Định nghĩa tiếng Anh mô tả từ, BẮT BUỘC đặt từ gốc NẰM TÁCH BIỆT Ở CUỐI CÂU sau dấu hai chấm (vd: 'A round fruit: apple').";
                outputFields = `"en": "câu ví dụ 1 (Flashcard)", \n      "vi": "câu dịch 1", \n      "en_dictation": "câu định nghĩa 2 (Dictation)", \n      "vi_dictation": "câu dịch 2"`;
            } else {
                styleInstruction = "Tạo 2 CÂU VÍ DỤ. Câu 1 (Flashcard): NGẮN (10-15 từ). Câu 2 (Dictation): TRUNG BÌNH (15-20 từ). Câu 1 và 2 PHẢI KHÁC HOÀN TOÀN NHAU VỀ NGỮ CẢNH VÀ TỪ VỰNG.";
                outputFields = `"en": "câu 1 (Flashcard) (bọc [...] quanh TỪ VỰNG ĐANG HỌC)", \n      "vi": "câu dịch 1 TỰ NHIÊN (bọc [...] quanh ĐÚNG phần dịch của từ vựng, DỊCH THEO NGỮ CẢNH, KHÔNG ÉP DÙNG TỪ ĐIỂN NẾU SƯỢNG)", \n      "en_dictation": "câu 2 (Dictation, khác câu 1) (bọc [...] quanh TỪ VỰNG ĐANG HỌC)", \n      "vi_dictation": "câu dịch 2 TỰ NHIÊN (bọc [...] quanh ĐÚNG phần dịch của từ vựng, DỊCH THEO NGỮ CẢNH, KHÔNG ÉP DÙNG TỪ ĐIỂN NẾU SƯỢNG)"`;
            }
        }
        styleInstruction += " (LƯU Ý: Giới hạn số lượng từ chỉ áp dụng cho câu Tiếng Anh. Câu dịch Tiếng Việt KHÔNG BỊ GIỚI HẠN độ dài, phải dịch trọn vẹn và thoát ý nhất có thể!).";

        let wantSyn = document.getElementById('aiSynToggle') ? document.getElementById('aiSynToggle').checked : true;
        let wantFam = document.getElementById('aiFamToggle') ? document.getElementById('aiFamToggle').checked : true;
        let wantHom = document.getElementById('aiHomToggle') ? document.getElementById('aiHomToggle').checked : true;

        if (onlyExample || targetMode === 'dictation') {
            wantSyn = false;
            wantFam = false;
            wantHom = false;
        }

        let taskInstructions = `1. Phân tích loại từ (pos). Viết 1 câu cho mỗi từ theo chuẩn: ${styleInstruction}
2. Cấu trúc ngữ pháp (structures): NẾU TỪ CÓ giới từ đi kèm (vd: under + construction) HOẶC là danh từ ghép phổ biến (vd: lecture hall), hãy đưa vào đây.
- NẾU LÀ CẤU TRÚC GIỚI TỪ/ĐỘNG TỪ: Dấu '+' CHỈ ĐƯỢC DÙNG trước các biến số (như noun, V-ing). CẤM dùng dấu '+' trước giới từ. Bọc ngoặc vuông [...] quanh TỪ KHÓA CHÍNH + GIỚI TỪ, và ngoặc nhọn {...} quanh BIẾN SỐ. (SAI: [domain] + of + {noun} -> ĐÚNG: [domain of] + {noun}).
- NẾU LÀ DANH TỪ GHÉP: CẤM DÙNG dấu '+' hay ngoặc nhọn {...}. HÃY BỌC NGOẶC VUÔNG [...] CHO TOÀN BỘ CỤM (vd: [lecture hall]). Phải thêm "(danh từ ghép)" ở cuối phần nghĩa và DỊCH THẬT TỰ NHIÊN (vd: "[giảng đường] (danh từ ghép)"). Mảng rỗng \`[]\` nếu không có gì đặc biệt.
- QUY TẮC NGOẶC NÀY **CHỈ ÁP DỤNG** BÊN TRONG mảng 'structures' (cho 4 trường: struct, vi, example, example_vi). Câu ví dụ trong structures PHẢI KHÁC HOÀN TOÀN với câu ví dụ chính, và PHẢI CÓ ĐẦY ĐỦ ngoặc ở cả câu tiếng Anh lẫn tiếng Việt!
- VỚI trường 'en', 'vi', 'en_dictation', 'vi_dictation': BẮT BUỘC bọc ngoặc vuông [...] quanh từ vựng gốc (ở câu Anh) và phần dịch tương ứng (ở câu Việt). QUAN TRỌNG: CẤM TUYỆT ĐỐI việc nhét "Nghĩa" từ điển vào câu dịch nếu nó làm câu văn vô nghĩa! HÃY BỎ QUA NGHĨA GỐC VÀ DỊCH THẬT TỰ NHIÊN THEO ĐÚNG NGỮ CẢNH (VD: Từ 'domain' nghĩa gốc là 'thuộc quyền sở hữu', nhưng trong câu 'secured a new domain for website' thì BẮT BUỘC dịch là 'mua một [tên miền] mới' chứ CẤM dịch 'bảo vệ một [thuộc quyền sở hữu]'). TUYỆT ĐỐI không bọc sai từ.
Ví dụ CHUẨN trong structures: struct: "[be eligible for] + {noun}", vi: "[đủ điều kiện cho] + {danh từ}", example: "She is [eligible for] {the scholarship}.", example_vi: "Cô ấy [đủ điều kiện cho] {học bổng}."`;
        if (wantSyn) taskInstructions += `\n3. TÌM TỪ ĐỒNG NGHĨA VÀ TRÁI NGHĨA: BẮT BUỘC PHẢI TÌM ÍT NHẤT 3 TỪ ĐỒNG NGHĨA VÀ 3 TỪ TRÁI NGHĨA (nếu từ điển có). Phân loại rõ bằng cách thêm "[Đồng nghĩa]" hoặc "[Trái nghĩa]" ở đầu phần nghĩa tiếng Việt. BẮT BUỘC PHẢI TRẢ VỀ TRONG KEY 'synonyms_antonyms'.`;
        if (wantFam) taskInstructions += `\n4. KHAI THÁC TỐI ĐA TỪ CÙNG GỐC (Word Family): Hãy tìm VÀ LIỆT KÊ TOÀN BỘ tất cả các biến thể của từ. BẮT BUỘC PHẢI TÌM TRẠNG TỪ (Adverb - đuôi ly) NẾU CÓ THỂ, cùng với danh từ, động từ, tính từ và các từ thêm tiền/hậu tố (un-, in-, -ness...). BẮT BUỘC TÌM ÍT NHẤT 4-5 TỪ CÙNG GỐC (nếu từ điển có), TUYỆT ĐỐI KHÔNG ĐƯỢC LƯỜI BIẾNG. Đánh dấu "isSpecial": true nếu từ có dạng đuôi dễ nhầm lẫn (vd: danh từ nhưng đuôi -al, tính từ đuôi -ing/-ed). Đánh dấu "isDifferentMeaning": true nếu từ đó CÓ NGHĨA KHÁC HOÀN TOÀN so với từ gốc (vd: confidence là tự tin, nhưng confidential là tuyệt mật). BẮT BUỘC PHẢI TRẢ VỀ TRONG KEY 'family'.`;
        if (wantHom) taskInstructions += `\n5. TÌM 3-4 TỪ DỄ NHẦM LẪN (Confusing Words / Homophones). YÊU CẦU TỐI THƯỢNG: CÁC TỪ NÀY PHẢI LÀ TỪ VỰNG TIẾNG ANH CHUẨN CÓ THẬT TRONG TỪ ĐIỂN. TUYỆT ĐỐI KHÔNG ĐƯỢC CHẾ RA TỪ SAI CHÍNH TẢ (vd: cấm dùng 'eligibilty' để nhầm với 'eligibility', cấm dùng 'açess' để nhầm với 'access'). HÃY tìm các từ có CÁCH VIẾT hoặc PHÁT ÂM gần giống với từ gốc NHƯNG NGHĨA KHÁC HOÀN TOÀN (ví dụ: "access" nhầm với "accessory", "eligible" nhầm với "illegible", "affect" nhầm với "effect"). BẮT BUỘC PHẢI TRẢ VỀ TRONG KEY 'homophones'.`;

        let jsonStructure = `{
  "examples": [
    { 
      "id": <SỐ ID BẠN NHẬN ĐƯỢC>,
      "word": "từ vựng ở trên", 
      "pos": "n/v/adj/adv/prep...",
      "structures": [
        { "struct": "[cấu trúc] {tiếng anh}", "vi": "[nghĩa] {tiếng việt}", "example": "Câu ví dụ [có] {ngoặc}", "example_vi": "Dịch nghĩa [có] {ngoặc}" }
      ],
      ${outputFields}`;

        if (wantSyn) {
            jsonStructure += `,
      "synonyms_antonyms": [
        { "word": "từ tiếng anh", "vi": "[Đồng nghĩa/Trái nghĩa] nghĩa tiếng việt" }
      ]`;
        }
        if (wantFam) {
            jsonStructure += `,
      "family": [
        { "word": "từ cùng gốc 1", "type": "n/v/adj/adv", "vi": "nghĩa tiếng việt", "isSpecial": false, "isDifferentMeaning": false },
        { "word": "từ cùng gốc 2", "type": "n/v/adj/adv", "vi": "nghĩa tiếng việt", "isSpecial": true, "isDifferentMeaning": true }
      ]`;
        }
        if (wantHom) {
            jsonStructure += `,
      "homophones": [
        { "word": "từ đồng âm/nhầm lẫn", "vi": "nghĩa tiếng việt khác hoàn toàn" }
      ]`;
        }
        jsonStructure += `
    }
  ]
}`;

        let systemPrompt = `Bạn là chuyên gia ngôn ngữ học. BẮT BUỘC trả về định dạng JSON hợp lệ, không có markdown, không giải thích.
Bạn sẽ nhận được 1 danh sách từ vựng và nghĩa tiếng Việt. 
Nhiệm vụ: 
${taskInstructions}

LƯU Ý CỰC KỲ QUAN TRỌNG: TUYỆT ĐỐI KHÔNG ĐƯỢC BỎ QUÊN HOẶC LƯỢC BỎ CÁC TRƯỜNG NHƯ 'synonyms_antonyms', 'family', 'homophones' TRONG KẾT QUẢ TRẢ VỀ!

Cấu trúc JSON bắt buộc:
${jsonStructure}`;

        const userPrompt = `Danh sách từ vựng:\n${wordListStr}`;

        let percent = 10 + Math.round((i / wordsArray.length) * 80);
        updateLoadingProgress(`Đang tạo ví dụ...`, percent);
        document.getElementById('loadingSubText').innerHTML = "";

        let success = false;
        let lastErr = null;
        const maxRetries = Math.max(3, keysArray.length);
        for (let tryIdx = 0; tryIdx < maxRetries; tryIdx++) {
            let globalIdx = parseInt(localStorage.getItem('toeic_api_key_index') || "0");
            localStorage.setItem('toeic_api_key_index', (globalIdx + 1).toString());
            let k = keysArray[globalIdx % keysArray.length];
            try {
                const responseText = await callGeminiAPIText(systemPrompt, userPrompt, null, k);
                let cleanJson = responseText.replace(/```json/gi, '').replace(/```html/gi, '').replace(/```/g, '').trim();
                const firstBrace = cleanJson.indexOf('{');
                if (firstBrace !== -1) {
                    let balance = 0;
                    let insideString = false;
                    let escaped = false;
                    for (let i = firstBrace; i < cleanJson.length; i++) {
                        const char = cleanJson[i];
                        if (escaped) { escaped = false; continue; }
                        if (char === '\\') { escaped = true; continue; }
                        if (char === '"') { insideString = !insideString; continue; }
                        if (!insideString) {
                            if (char === '{') balance++;
                            else if (char === '}') {
                                balance--;
                                if (balance === 0) {
                                    cleanJson = cleanJson.substring(firstBrace, i + 1);
                                    break;
                                }
                            }
                        }
                    }
                }
                cleanJson = cleanJson.replace(/,\s*([\]}])/g, '$1');
                const data = JSON.parse(cleanJson);

                if (data.examples && Array.isArray(data.examples)) {
                    data.examples.forEach(ex => {
                        if (ex.synonyms_antonyms) {
                            ex.synonyms = ex.synonyms_antonyms.map(s => ({ word: s.word || s.col, vi: s.vi }));
                            delete ex.synonyms_antonyms;
                        }
                        if (ex.homophones) {
                            ex.homophones = ex.homophones.filter(h => !/chính\s*tả/i.test(h.vi || '') && !/không\s*có\s*nghĩa/i.test(h.vi || ''));
                        }
                    });

                    let aiCache = {};
                    try { aiCache = JSON.parse(localStorage.getItem('toeic_ai_cache') || "{}"); } catch (e) { }
                    data.examples.forEach((ex, idx) => {
                        let wTarget;
                        // [AI BUGFIX] Ưu tiên khớp bằng tên từ vựng trước vì AI hay trả về sai ID
                        if (ex.word) {
                            wTarget = batch.find(b => b.word.toLowerCase() === ex.word.toLowerCase());
                        }
                        // Khớp bằng ID nếu không khớp được từ
                        if (!wTarget && ex.id && batch[ex.id - 1]) {
                            wTarget = batch[ex.id - 1];
                        }
                        // Fallback theo index
                        if (!wTarget) {
                            wTarget = batch[idx];
                        }
                        if (!wTarget) return;
                        let difficultySuffix = aiDifficultyLevel;
                        if (targetMode === 'flashcard') {
                            difficultySuffix = `fc_${fcAiLength}`;
                        }

                        const newCacheKey = `${wTarget.word.toLowerCase()}_${wTarget.meaning.toLowerCase().replace(/\s+/g, '')}_${difficultySuffix}`;
                        const oldCacheKey = `${wTarget.word.toLowerCase()}_${difficultySuffix}`;

                        const fbNewKey = `${wTarget.word.toLowerCase()}_${wTarget.meaning.toLowerCase().replace(/\s+/g, '')}_medium`;
                        const fbOldKey = `${wTarget.word.toLowerCase()}_medium`;
                        let oldCache = aiCache[newCacheKey] || aiCache[oldCacheKey] || aiCache[fbNewKey] || aiCache[fbOldKey];
                        if (!oldCache) {
                            const legacyNewCacheKey = `${wTarget.word.toLowerCase()}_${wTarget.meaning.toLowerCase().replace(/\s+/g, '')}`;
                            const legacyOldCacheKey = wTarget.word.toLowerCase();
                            oldCache = aiCache[legacyNewCacheKey] || aiCache[legacyOldCacheKey] || {};
                        }

                        if (onlyExample) {
                            ex.synonyms = wTarget._tempInheritedSynonyms || oldCache.synonyms || [];
                            ex.family = wTarget._tempInheritedFamily || oldCache.family || [];
                            ex.homophones = wTarget._tempInheritedHomophones || oldCache.homophones || [];

                            // Dọn rác
                            delete wTarget._tempInheritedSynonyms;
                            delete wTarget._tempInheritedFamily;
                            delete wTarget._tempInheritedHomophones;
                        }

                        // [AI BUGFIX] Kế thừa chéo: Nếu ex trống family (bất kể onlyExample là gì), lục tìm các cấu hình khác
                        if (!ex.family || ex.family.length === 0) {
                            const possibleKeys = [
                                `${wTarget.word.toLowerCase()}_${wTarget.meaning.toLowerCase().replace(/\\s+/g, '')}_fc_long`,
                                `${wTarget.word.toLowerCase()}_fc_long`,
                                `${wTarget.word.toLowerCase()}_${wTarget.meaning.toLowerCase().replace(/\\s+/g, '')}_fc_short`,
                                `${wTarget.word.toLowerCase()}_fc_short`,
                                `${wTarget.word.toLowerCase()}_${wTarget.meaning.toLowerCase().replace(/\\s+/g, '')}_medium`,
                                `${wTarget.word.toLowerCase()}_medium`,
                                `${wTarget.word.toLowerCase()}_${wTarget.meaning.toLowerCase().replace(/\\s+/g, '')}_hard`,
                                `${wTarget.word.toLowerCase()}_hard`,
                                `${wTarget.word.toLowerCase()}_${wTarget.meaning.toLowerCase().replace(/\\s+/g, '')}_easy`,
                                `${wTarget.word.toLowerCase()}_easy`,
                                `${wTarget.word.toLowerCase()}_${wTarget.meaning.toLowerCase().replace(/\\s+/g, '')}`,
                                wTarget.word.toLowerCase()
                            ];
                            for (let pk of possibleKeys) {
                                if (aiCache[pk] && aiCache[pk].family && aiCache[pk].family.length > 0) {
                                    ex.family = aiCache[pk].family;
                                    if (!ex.synonyms || ex.synonyms.length === 0) {
                                        ex.synonyms = aiCache[pk].synonyms || (aiCache[pk].collocations ? aiCache[pk].collocations.map(c => ({ word: c.col || c.word, vi: c.vi })) : []);
                                    }
                                    if (!ex.homophones || ex.homophones.length === 0) {
                                        ex.homophones = aiCache[pk].homophones || [];
                                    }
                                    break;
                                }
                            }
                        }

                        // Merge generated fields with existing cache to avoid erasing other mode's data
                        ex = { ...oldCache, ...ex };

                        const targetWord = parsedVocabList.find(w => w.word.toLowerCase() === wTarget.word.toLowerCase() && w.meaning === wTarget.meaning);
                        if (targetWord) {
                            targetWord.aiExample = ex;
                            targetWord.aiExample.level = aiDifficultyLevel;
                        }

                        wTarget.aiExample = ex;
                        wTarget.aiExample.level = aiDifficultyLevel;
                        aiCache[newCacheKey] = ex;
                    });
                    localStorage.setItem('toeic_ai_cache', JSON.stringify(aiCache));
                    success = true;
                    break;
                } else {
                    throw new Error("Không tìm thấy mảng 'examples' trong kết quả trả về.");
                }
            } catch (err) {
                lastErr = err;
                console.warn("Lỗi JSON hoặc API, đang thử lại...", err);
            }
        }
        if (!success) {
            throw new Error(lastErr ? lastErr.message : "Thất bại sau khi thử tất cả các API Key");
        }
    }
}

// Mảng toàn cục lưu trữ âm thanh để chống lỗi Garbage Collection (trình duyệt xóa nhầm âm thanh)
window.__ttsUtterances = [];
if (!window.globalAudioTTS) {
    window.globalAudioTTS = new Audio();
}
let lastTTSCallTime = 0;

function playSpeechRobust(text, lang = 'en-US', rate = 1.0, onEndCallback = null) {
    // === CƠ CHẾ CHỐNG SPAM GOOGLE (DEBOUNCE) ===
    // Dùng timestamp thay vì setTimeout để đảm bảo Audio.play() nằm trong user gesture synchronously (tránh lỗi iOS/iPad)
    const now = Date.now();
    if (now - lastTTSCallTime < 250) {
        // Nếu gọi quá nhanh (dưới 250ms), bỏ qua để chống spam
        return;
    }
    lastTTSCallTime = now;

    // Dọn dẹp hàng đợi Web Speech API cũ để tránh kẹt
    window.speechSynthesis.cancel();
    
    // Dừng Audio Google TTS đang phát (nếu có)
    window.globalAudioTTS.pause();

    // Xác định mã ngôn ngữ cho Google TTS
    const langGoogle = lang.startsWith('vi') ? 'vi' : 'en';
    const url = `https://translate.googleapis.com/translate_tts?client=gtx&ie=UTF-8&tl=${langGoogle}&q=${encodeURIComponent(text)}`;
    
    window.globalAudioTTS.src = url;
    // Điều chỉnh tốc độ cho Google TTS (đúng với rate user chọn: 1.0 -> 1.4)
    window.globalAudioTTS.playbackRate = rate;

    window.globalAudioTTS.onended = () => {
        if (onEndCallback) onEndCallback();
    };

    window.globalAudioTTS.onerror = () => {
        // === FALLBACK: NẾU GOOGLE TTS LỖI HOẶC BỊ CHẶN, CHUYỂN VỀ WEB SPEECH API CŨ ===
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        // Web Speech API nói nhanh hơn Google 1 chút, nên ta dùng hệ số 0.85 * rate
        utterance.rate = 0.85 * rate;
        
        if (onEndCallback) {
            utterance.onend = onEndCallback;
            utterance.onerror = onEndCallback;
        }

        const voices = window.speechSynthesis.getVoices();
        const targetVoices = voices.filter(v => v.lang.startsWith(lang.split('-')[0]));

        if (targetVoices.length > 0) {
            const preferredVoice = targetVoices.find(v => v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Microsoft Mark') || v.name.includes('Samantha'));
            utterance.voice = preferredVoice || targetVoices[0];
        }

        window.__ttsUtterances.push(utterance);
        if (window.__ttsUtterances.length > 10) window.__ttsUtterances.shift();

        window.speechSynthesis.speak(utterance);
    };

    // Bắt đầu phát Google TTS (Synchronous - iOS sẽ cho phép nếu từ user click)
    window.globalAudioTTS.play().catch(e => {
        if (e.name === 'AbortError') return;
        if (window.globalAudioTTS && window.globalAudioTTS.onerror) window.globalAudioTTS.onerror();
    });
}

function isVietnameseText(text) {
    const vnPattern = /[àáãạảăắằẳẵặâấầẩẫậèéẹẻẽêềếểễệđìíĩỉịòóõọỏôốồổỗộơớờởỡợùúũụủưứừửữựỳýỵỷỹ]/i;
    return vnPattern.test(text);
}

function speakWord(event, onEndCallback = null) {
    if (event) event.stopPropagation();
    if (currentFlashcards.length === 0) return;
    let text = currentFlashcards[flashcardIndex].word;
    if (!text) return;

    // Đổi dấu / thành dấu phẩy để giọng đọc ngắt nghỉ tự nhiên thay vì đọc chữ "slash"
    text = text.replace(/\//g, ', ');

    const lang = isVietnameseText(text) ? 'vi-VN' : 'en-US';
    playSpeechRobust(text, lang, fcPlaybackSpeed, onEndCallback);
}

function speakMeaning(event) {
    if (event) event.stopPropagation();

    const aiExEn = document.getElementById('fcExEn');
    const aiExampleContainer = document.getElementById('fcAiExample');

    if (aiExEn && aiExampleContainer && !aiExampleContainer.classList.contains('hidden')) {
        let text = aiExEn.innerText;
        if (text.startsWith('"') && text.endsWith('"')) {
            text = text.substring(1, text.length - 1);
        }

        playSpeechRobust(text, 'en-US', fcPlaybackSpeed);
        return;
    }

    speakWord(null);
}

function checkAndShowGoogleTranslation(card, el) {
    if (!card.googleTranslation || !Array.isArray(card.googleTranslation)) return;
    const userMeaning = card.meaning.toLowerCase().trim();

    const filtered = card.googleTranslation.filter(gTrans => {
        const g = gTrans.toLowerCase().trim();
        return !userMeaning.includes(g) && !g.includes(userMeaning);
    });

    if (filtered.length > 0) {
        el.innerHTML = `<i class="fa-brands fa-google mr-2 text-lg mb-1 block sm:inline"></i><span class="inline-block">${filtered.join(' <span class="mx-1.5 opacity-50">•</span> ')}</span>`;
        el.classList.remove('hidden');
    }
}

async function fetchPhonetic(card) {
    const el = document.getElementById('fcPhonetic');
    if (card.phonetic !== undefined) {
        el.innerText = card.phonetic || '';
        return;
    }

    el.innerText = '...';
    const word = card.word.toLowerCase().trim();

    if (word.includes(' ')) {
        card.phonetic = '';
        el.innerText = '';
        return;
    }

    try {
        const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        let phonetic = '';
        if (Array.isArray(data) && data[0]) {
            if (data[0].phonetic) {
                phonetic = data[0].phonetic;
            } else if (data[0].phonetics && data[0].phonetics.length > 0) {
                const p = data[0].phonetics.find(x => x.text);
                if (p) phonetic = p.text;
            }
        }

        card.phonetic = phonetic;
        el.innerText = phonetic || '';
    } catch (e) {
        card.phonetic = '';
        el.innerText = '';
    }
}

function renderFlashcard() {
    if (currentFlashcards.length === 0) return;
    const card = currentFlashcards[flashcardIndex];

    if (typeof applyFcWordListenMode === 'function') applyFcWordListenMode();

    // Dynamically resize flashcard based on whether it has AI example
    const flashcardEl = document.getElementById('flashcard');
    if (flashcardEl) {
        if (card.aiExample) {
            flashcardEl.classList.replace('max-w-2xl', 'max-w-3xl');
            flashcardEl.classList.replace('h-[400px]', 'h-[420px]');
        } else {
            flashcardEl.classList.replace('max-w-3xl', 'max-w-2xl');
            flashcardEl.classList.replace('h-[420px]', 'h-[400px]');
        }
    }

    const wordTextEl = document.getElementById('fcWordText');
    const posContainer = document.getElementById('fcPosContainer');
    if (wordTextEl && posContainer) {
        wordTextEl.innerText = card.word;
        posContainer.innerHTML = formatPOS(card.pos);
    } else {
        document.getElementById('fcWord').innerHTML = `${card.word} ${formatPOS(card.pos)}`;
    }

    fetchPhonetic(card);
    const meaningEl = document.getElementById('fcMeaning');
    meaningEl.innerText = card.meaning;

    // Tự động thu nhỏ chữ nếu nghĩa quá dài
    if (card.meaning.length > 50) {
        meaningEl.className = "text-xl sm:text-2xl font-bold text-white text-center break-words w-full leading-relaxed";
    } else if (card.meaning.length > 25) {
        meaningEl.className = "text-2xl sm:text-3xl font-bold text-white text-center break-words w-full leading-relaxed";
    } else {
        meaningEl.className = "text-3xl sm:text-4xl font-bold text-white text-center break-words w-full leading-relaxed";
    }
    const fcIndexInput = document.getElementById('fcIndexInput');
    const fcTotalCount = document.getElementById('fcTotalCount');
    if (fcIndexInput && fcTotalCount) {
        fcIndexInput.value = flashcardIndex + 1;
        fcTotalCount.innerText = currentFlashcards.length;
        fcIndexInput.max = currentFlashcards.length;
    } else {
        const fcCounter = document.getElementById('fcCounter');
        if (fcCounter) fcCounter.innerText = `Thẻ: ${flashcardIndex + 1} / ${currentFlashcards.length}`;
    }

    const isStarred = isWordStarred(card.word);
    updateFcStarIcon(isStarred);

    const googleTransEl = document.getElementById('fcGoogleTrans');
    if (googleTransEl) {
        googleTransEl.classList.add('hidden');
        googleTransEl.innerHTML = '';
    }

    if (card.googleTranslation === undefined) {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&dt=bd&q=${encodeURIComponent(card.word)}`;
        fetch(url).then(res => res.json()).then(data => {
            let meanings = [];
            if (data[1] && Array.isArray(data[1])) {
                for (let pos of data[1]) {
                    if (pos[1] && Array.isArray(pos[1])) {
                        meanings = meanings.concat(pos[1]);
                    }
                }
            }
            if (meanings.length === 0 && data[0] && data[0][0] && data[0][0][0]) {
                meanings.push(data[0][0][0].trim());
            }
            meanings = [...new Set(meanings.map(m => m.toLowerCase().trim()))];

            if (meanings.length > 0) {
                card.googleTranslation = meanings.slice(0, 2); // Keep top 2
                if (googleTransEl) checkAndShowGoogleTranslation(card, googleTransEl);
            } else {
                card.googleTranslation = null;
            }
        }).catch(e => {
            card.googleTranslation = null;
        });
    } else {
        if (googleTransEl) checkAndShowGoogleTranslation(card, googleTransEl);
    }

    const aiExContainer = document.getElementById('fcAiExample');
    if (aiExContainer) {
        if (card.aiExample) {
            const enEl = document.getElementById('fcExEn');
            const rawEnText = card.aiExample.en || "";
            // Trích xuất các từ được AI bọc ngoặc vuông (nếu có)
            const bracketMatches = [...rawEnText.matchAll(/\[(.*?)\]/g)];
            // Tách thành mảng các từ riêng biệt để tránh lỗi substring (VD: "mineral".includes("a"))
            const aiHighlightedWords = bracketMatches.flatMap(m => m[1].toLowerCase().split(/(\b[\w'-]+\b)/g).filter(w => /^[\w'-]+$/.test(w)));

            const sentence = rawEnText.replace(/[\[\]\{\}"]/g, '').replace(/[\.\?!]$/, '').trim();
            const words = sentence.split(/(\b[\w'-]+\b)/g);

            // Cải tiến fuzzy match: xử lý y -> i (vd: accessory -> accessori -> accessories)
            const getBaseRoot = (w) => {
                let base = w.replace(/(e|ed|d|ing|s|es|ly)$/, '');
                base = base.replace(/y$/, 'i');
                return base;
            };
            const targetRoots = card.word.toLowerCase().split(/\s+/).map(getBaseRoot);
            const exactWords = card.word.toLowerCase().split(/\s+/);

            const html = words.map(part => {
                if (/^[\w'-]+$/.test(part)) {
                    const pLower = part.toLowerCase();
                    let isTarget = exactWords.includes(pLower);
                    
                    if (!isTarget) {
                        isTarget = targetRoots.some(root => root.length > 2 && pLower.includes(root));
                    }
                    if (!isTarget && aiHighlightedWords.length > 0) {
                        isTarget = aiHighlightedWords.includes(pLower);
                    }
                    const extraClass = isTarget ? "text-orange-400 font-bold" : "";
                    return `<span class="${extraClass} hover:bg-slate-500/20 rounded px-0.5 cursor-pointer transition-colors inline-block" onclick="handleWordClick(event, '${part.replace(/'/g, "\\'")}')" oncontextmenu="handleWordRightClick(event, '${part.replace(/'/g, "\\'")}')">${part}</span>`;
                }
                return part.replace(/</g, "&lt;").replace(/>/g, "&gt;");
            }).join('');

            enEl.innerHTML = html;

            // Highlight nghĩa tiếng Việt (bỏ ngoặc vuông, xoá ngoặc nhọn, xoá chấm câu)
            const viText = card.aiExample.vi.replace(/[\{\}"]/g, '').replace(/[\.\?!]$/, '').trim();
            const viHtml = viText.replace(/\[(.*?)\]/g, '<span class="font-bold text-orange-400">$1</span>');
            document.getElementById('fcExVi').innerHTML = viHtml;
            aiExContainer.classList.remove('hidden');

            if (isListenModeEn) {
                enEl.classList.add('blur-md', 'select-none', 'cursor-pointer', 'opacity-70');
                enEl.title = 'Click để xem câu tiếng Anh';
            } else {
                enEl.classList.remove('blur-md', 'select-none', 'cursor-pointer', 'opacity-70');
                enEl.title = '';
            }

            const viEl = document.getElementById('fcExVi');
            if (isListenModeVi) {
                viEl.classList.add('blur-md', 'select-none', 'cursor-pointer', 'opacity-70');
                viEl.title = 'Click để xem câu tiếng Việt';
            } else {
                viEl.classList.remove('blur-md', 'select-none', 'cursor-pointer', 'opacity-70');
                viEl.title = '';
            }

            // Check if Extra Details should be shown
            const extraDetails = document.getElementById('fcExtraDetails');
            let hasExtra = false;

            // Render Structures (if any)
            const usageContainer = document.getElementById('fcUsage');
            const usageList = document.getElementById('fcUsageList');
            if (usageContainer && usageList) {
                if (card.aiExample.structures && Array.isArray(card.aiExample.structures) && card.aiExample.structures.length > 0) {
                    usageList.innerHTML = card.aiExample.structures.map(s => {
                        let isCompound = s.vi && s.vi.toLowerCase().includes('(danh từ ghép)');
                        
                        let normStruct = s.struct || '';
                        let normVi = s.vi || '';
                        let normEx = s.example || '';
                        let normExVi = s.example_vi || '';

                        if (isCompound) {
                            normStruct = normStruct.replace(/\+/g, ' ').replace(/\s+/g, ' ').trim();
                            normVi = normVi.replace(/\+/g, ' ').replace(/\s+/g, ' ').trim();
                            
                            normEx = normEx.replace(/\[([^\]]+)\]\s*\{([^\}]+)\}/g, '[$1 $2]');
                            normExVi = normExVi.replace(/\[([^\]]+)\]\s*\{([^\}]+)\}/g, '[$1 $2]');
                        }

                        const fmt = (text, isStruct = false) => {
                            if (!text) return '';
                            
                            if (isCompound && isStruct) {
                                let cleanText = text.replace(/[\+\[\]\{\}]/g, '').replace(/\s+/g, ' ').trim();
                                let noteMatch = cleanText.match(/(.*?)\s*(\(danh từ ghép\))/i);
                                if (noteMatch) {
                                    return `<span class="text-emerald-400 font-bold">${noteMatch[1].trim()}</span> <span class="text-slate-400 italic font-normal text-[13px] ml-1">${noteMatch[2]}</span>`;
                                }
                                return `<span class="text-emerald-400 font-bold">${cleanText}</span>`;
                            }

                            let res = text.replace(/\[(.*?)\]/g, '<span class="text-emerald-400 font-bold">$1</span>').replace(/\{(.*?)\}/g, '<span class="text-orange-400 font-bold">$1</span>');
                            if (!res.includes('<span') && isStruct) {
                                if (res.includes('+')) {
                                    let parts = res.split('+');
                                    if (parts.length === 2) {
                                        return `<span class="text-emerald-400 font-bold">${parts[0].trim()}</span> <span class="text-slate-500 font-normal mx-1">+</span> <span class="text-orange-400 font-bold">${parts[1].trim()}</span>`;
                                    }
                                } else {
                                    return `<span class="text-emerald-400 font-bold">${res}</span>`;
                                }
                            }
                            return res;
                        };
                        const cleanStr = normStruct ? normStruct.replace(/[\[\]\{\}]/g, '') : '';
                        return `<tr class="hover:bg-slate-800/30 transition-colors cursor-pointer group"
                                onclick="speakText('${cleanStr.replace(/'/g, "\\'")}', 'en-US')">
                                <td class="py-0">
                                    <div class="flex flex-col">
                                        <div class="flex items-start py-3 border-b border-slate-600">
                                            <div class="w-1/2 pr-4 text-slate-400 font-bold">${fmt(normStruct, true)}</div>
                                            <div class="w-1/2 pr-4 text-slate-400 font-bold">${fmt(normVi, true)}</div>
                                        </div>
                                        ${normEx ? `
                                        <div class="flex flex-col gap-1 pt-3 pb-2">
                                            <div class="text-[14px] text-slate-200">${fmt(normEx)}</div>
                                            ${normExVi ? `<div class="text-[14px] text-slate-200">${fmt(normExVi)}</div>` : ''}
                                        </div>
                                        ` : ''}
                                    </div>
                                </td>
                            </tr>`;
                    }).join('');
                    usageContainer.classList.remove('hidden');
                    hasExtra = true;
                } else {
                    usageContainer.classList.add('hidden');
                }
            }

            // Render Word Family
            const famContainer = document.getElementById('fcWordFamily');
            const famList = document.getElementById('fcFamilyList');
            const famCount = document.getElementById('fcFamilyCount');
            if (card.aiExample.family && card.aiExample.family.length > 0) {
                famCount.innerText = `${card.aiExample.family.length} từ`;
                famList.innerHTML = card.aiExample.family.map(f => {
                    const isSp = f.isSpecial === true || f.isSpecial === 'true';
                    const isDiff = f.isDifferentMeaning === true || f.isDifferentMeaning === 'true';
                    
                    let wordClass = 'text-indigo-300 font-bold group-hover:text-indigo-200';
                    let typeClass = 'text-slate-400';
                    
                    if (isDiff) {
                        wordClass = 'text-rose-400 font-bold group-hover:text-rose-300';
                        typeClass = 'text-rose-500/70';
                    } else if (isSp) {
                        wordClass = 'text-amber-400 font-bold group-hover:text-amber-300';
                        typeClass = 'text-amber-500/70';
                    }
                    
                    let meaningHtml = f.vi;
                    if (isDiff) {
                        meaningHtml += ` <span class="text-[11px] text-rose-400/80 font-bold ml-1 tracking-wide">(khác nghĩa)</span>`;
                    }
                    
                    return `<tr class="hover:bg-slate-800/30 transition-colors cursor-pointer group"
                            onclick="speakText('${f.word.replace(/'/g, "\\'")}', 'en-US')"
                            oncontextmenu="handleExtraRightClick(event, '${f.word.replace(/'/g, "\\'")}')"
                            title="Chuột trái: Đọc từ | Chuột phải: Tra từ">
                            <td class="py-2.5 pr-4 ${wordClass} w-1/3 whitespace-nowrap transition-colors">${f.word}</td>
                            <td class="py-2.5 px-4 ${typeClass} w-1/6 italic">${f.type}</td>
                            <td class="py-2.5 pl-4 text-slate-300">${meaningHtml}</td>
                        </tr>`;
                }).join('');
                famContainer.classList.remove('hidden');
                hasExtra = true;
            } else {
                famContainer.classList.add('hidden');
            }

            // Render Synonyms
            const synContainer = document.getElementById('fcSynonyms');
            const synList = document.getElementById('fcSynList');
            if (card.aiExample.synonyms && card.aiExample.synonyms.length > 0) {
                synList.innerHTML = card.aiExample.synonyms.map(c => {
                    let textVi = c.vi || '';
                    if (/\[Đồng nghĩa\]/i.test(textVi)) {
                        textVi = textVi.replace(/\[Đồng nghĩa\]\s*-?\s*/gi, '').trim() + ' <span class="text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded text-[10px] font-bold ml-2 uppercase">Đồng nghĩa</span>';
                    } else if (/\[Trái nghĩa\]/i.test(textVi)) {
                        textVi = textVi.replace(/\[Trái nghĩa\]\s*-?\s*/gi, '').trim() + ' <span class="text-rose-600 dark:text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded text-[10px] font-bold ml-2 uppercase">Trái nghĩa</span>';
                    } else {
                        textVi = textVi.replace(/\[Đồng nghĩa\]/gi, '<span class="text-emerald-400 font-bold ml-2">[Đồng nghĩa]</span>');
                        textVi = textVi.replace(/\[Trái nghĩa\]/gi, '<span class="text-rose-400 font-bold ml-2">[Trái nghĩa]</span>');
                    }
                    return `<tr class="cursor-pointer hover:bg-slate-800/30 transition-colors group"
                            onclick="speakText('${c.word.replace(/'/g, "\\'")}', 'en-US')"
                            oncontextmenu="handleExtraRightClick(event, '${c.word.replace(/'/g, "\\'")}')"
                            title="Chuột trái: Đọc từ | Chuột phải: Tra từ">
                            <td class="py-2.5 pr-4 text-slate-200 group-hover:text-white font-bold w-1/3 whitespace-nowrap transition-colors">${c.word}</td>
                            <td class="py-2.5 pl-4 text-slate-300 italic border-l border-slate-700/50">${textVi}</td>
                        </tr>`;
                }).join('');
                synContainer.classList.remove('hidden');
                hasExtra = true;
            } else {
                synContainer.classList.add('hidden');
            }

            // Render Homophones
            const homContainer = document.getElementById('fcHomophones');
            const homList = document.getElementById('fcHomList');
            if (card.aiExample.homophones && card.aiExample.homophones.length > 0) {
                homList.innerHTML = card.aiExample.homophones.map(h => `<tr class="cursor-pointer hover:bg-slate-800/30 transition-colors group"
                            onclick="speakText('${h.word.replace(/'/g, "\\'")}', 'en-US')"
                            oncontextmenu="handleExtraRightClick(event, '${h.word.replace(/'/g, "\\'")}')"
                            title="Chuột trái: Đọc từ | Chuột phải: Tra từ">
                            <td class="py-2.5 pr-4 text-slate-200 group-hover:text-white font-bold w-1/3 whitespace-nowrap transition-colors">${h.word}</td>
                            <td class="py-2.5 pl-4 text-slate-300 italic border-l border-slate-700/50">${h.vi}</td>
                        </tr>`).join('');
                homContainer.classList.remove('hidden');
                hasExtra = true;
            } else {
                homContainer.classList.add('hidden');
            }

            if (hasExtra) {
                extraDetails.classList.remove('hidden');
            } else {
                extraDetails.classList.add('hidden');
            }
        } else {
            aiExContainer.classList.add('hidden');
            const extraDetails = document.getElementById('fcExtraDetails');
            if (extraDetails) extraDetails.classList.add('hidden');
        }
    }

    const fcElement = document.getElementById('flashcard');
    if (isFlipped) {
        fcElement.classList.remove('rotate-y-180');
        isFlipped = false;
    }

    if (isFcSlideshow) {
        if (autoPlaySequenceTimeout) clearTimeout(autoPlaySequenceTimeout);
        autoPlaySequenceTimeout = setTimeout(() => runAutoPlaySequence(), 600);
    } else if (isFcAutoPlay) {
        // Tăng độ trễ lên 600ms (đủ lâu để TTS engine trên Windows khởi tạo thành công)
        if (typeof isFcWordListenMode !== 'undefined' && isFcWordListenMode && typeof isFcMeaningBlurred !== 'undefined' && !isFcMeaningBlurred) {
            // Chế độ Nghe & Gõ VÀ Nghĩa tiếng Việt ĐANG HIỆN RÕ:
            // -> Người dùng muốn tự dịch từ tiếng Việt sang tiếng Anh và gõ.
            // -> Không tự động đọc từ lúc này, đợi họ Enter kiểm tra thì mới đọc.
        } else {
            setTimeout(() => speakWord(null), 600);
        }
    }
}

function flipFlashcard() {
    const fcElement = document.getElementById('flashcard');
    if (isFlipped) {
        fcElement.classList.remove('rotate-y-180');
    } else {
        fcElement.classList.add('rotate-y-180');
    }
    isFlipped = !isFlipped;
}

function jumpToFlashcardInline(val) {
    if (!currentFlashcards || currentFlashcards.length === 0) return;
    let num = parseInt(val);
    if (isNaN(num)) num = 1;
    if (num < 1) num = 1;
    if (num > currentFlashcards.length) num = currentFlashcards.length;

    flashcardIndex = num - 1;

    // Re-render
    const flashcardEl = document.getElementById('flashcard');
    flashcardEl.classList.remove('rotate-y-180');
    isFlipped = false;

    // Khôi phục UI input
    document.getElementById('fcIndexInput').value = num;

    setTimeout(() => {
        renderFlashcard();
    }, 150);
}

function nextFlashcard() {
    stopAllAudio();
    if (flashcardIndex < currentFlashcards.length - 1) {
        flashcardIndex++;
    } else {
        flashcardIndex = 0; // Vòng lại từ đầu
    }
    if (isFlipped) {
        flipFlashcard();
        setTimeout(renderFlashcard, 250);
    } else {
        renderFlashcard();
    }
}

function prevFlashcard() {
    stopAllAudio();
    if (flashcardIndex > 0) {
        flashcardIndex--;
    } else {
        flashcardIndex = currentFlashcards.length - 1; // Vòng lại từ cuối
    }
    if (isFlipped) {
        flipFlashcard();
        setTimeout(renderFlashcard, 250);
    } else {
        renderFlashcard();
    }
}

function shuffleFlashcards() {
    window.speechSynthesis.cancel();
    for (let i = currentFlashcards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [currentFlashcards[i], currentFlashcards[j]] = [currentFlashcards[j], currentFlashcards[i]];
    }
    flashcardIndex = 0;
    if (isFlipped) {
        flipFlashcard();
        setTimeout(renderFlashcard, 250);
    } else {
        renderFlashcard();
    }
}

// Lắng nghe sự kiện bàn phím cho Flashcard
document.addEventListener('keydown', function (event) {
    const fcContainer = document.getElementById('flashcardContainer');
    if (fcContainer && !fcContainer.classList.contains('hidden')) {
        // Không chặn phím nếu đang gõ chữ ở đâu đó
        if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName) || document.activeElement.isContentEditable) return;

        if (event.code === 'Space') {
            event.preventDefault();
            if (isFlipped) {
                speakMeaning(null);
            } else {
                speakWord(null);
            }
        } else if (event.key === 'Shift') {
            if (!event.repeat) {
                event.preventDefault();
                speakWord(null); // Đọc tiếng Anh
            }
        } else if (event.code === 'ArrowRight') {
            event.preventDefault();
            nextFlashcard();
        } else if (event.code === 'ArrowLeft') {
            event.preventDefault();
            prevFlashcard();
        } else if (event.code === 'ArrowUp' || event.code === 'ArrowDown') {
            event.preventDefault();
            flipFlashcard();
        }
    }
});

function editVocab(lineIndex = -1, colIndex = 0, event = null) {
    if (event) event.stopPropagation();

    localStorage.setItem('toeic_vocab_view_mode', 'edit');

    const isStarredMode = document.getElementById('onlyStarredToggle') && !document.getElementById('onlyStarredToggle').checked;
    const textarea = document.getElementById('vocabInput');

    if (isStarredMode) {
        const starred = getStarredWords();
        textarea.value = starred.map(item => `${item.word} - ${item.meaning}`).join('\n');
    } else {
        textarea.value = localStorage.getItem('toeic_vocab_list') || '';
    }

    let sourceList = isStarredMode ? getStarredWords() : parsedVocabList;

    // Nếu không được chỉ định index (tức là bấm nút Chỉnh sửa), thử tìm dòng đang hiển thị ở vị trí cuộn hiện tại
    if (lineIndex === -1 && sourceList && sourceList.length > 0) {
        const preview = document.getElementById('vocabPreview');
        const tbody = document.getElementById('vocabPreviewBody');
        if (preview && tbody && tbody.children.length > 0) {
            const scrollY = preview.scrollTop;
            // Cộng thêm 30px để bù trừ cho phần tiêu đề dính (sticky header)
            const adjustedScrollY = scrollY + 30;
            for (let i = 0; i < tbody.children.length; i++) {
                const tr = tbody.children[i];
                if (tr.offsetTop + tr.offsetHeight >= adjustedScrollY) {
                    lineIndex = i;
                    break;
                }
            }
        }
    }

    document.getElementById('vocabPreview').classList.add('hidden');
    textarea.classList.remove('hidden');
    document.getElementById('showTableBtn').classList.remove('hidden');
    document.getElementById('showEditBtn').classList.add('hidden');
    if (document.getElementById('spellCheckBtn')) document.getElementById('spellCheckBtn').classList.add('hidden');
    textarea.focus();

    if (lineIndex >= 0 && sourceList && sourceList[lineIndex]) {
        const lines = textarea.value.split('\n');
        let charCount = 0;
        let parsedCount = 0;

        for (let i = 0; i < lines.length; i++) {
            if (lines[i].trim() !== '') {
                if (parsedCount === lineIndex) {
                    let startPos = charCount;

                    if (colIndex === 1) {
                        const meaningStr = sourceList[lineIndex].meaning;
                        const meaningIdx = lines[i].lastIndexOf(meaningStr);
                        if (meaningIdx !== -1) {
                            startPos += meaningIdx;
                        } else {
                            startPos += lines[i].length;
                        }
                    } else {
                        const wordStr = sourceList[lineIndex].word;
                        const wordIdx = lines[i].indexOf(wordStr);
                        if (wordIdx !== -1) {
                            startPos += wordIdx;
                        }
                    }

                    textarea.setSelectionRange(startPos, startPos);

                    const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight) || 16;
                    textarea.scrollTop = Math.max(0, (i - 2) * lineHeight);
                    break;
                }
                parsedCount++;
            }
            charCount += lines[i].length + 1;
        }
    }
}

function guessPartOfSpeech(word, meaning) {
    let w = word.toLowerCase().trim();
    let m = meaning.toLowerCase().trim();

    if (m.includes('(n)') || w.includes('(n)')) return 'n';
    if (m.includes('(v)') || w.includes('(v)')) return 'v';
    if (m.includes('(adj)') || w.includes('(adj)')) return 'adj';
    if (m.includes('(adv)') || w.includes('(adv)')) return 'adv';

    if (m.startsWith('sự ') || m.startsWith('việc ') || m.startsWith('người ') || m.startsWith('cái ') || m.startsWith('nhà ') || m.startsWith('đồ ') || m.startsWith('máy ') || m.startsWith('cuộc ') || m.startsWith('chuyến ')) return 'n';
    if (m.startsWith('một cách ')) return 'adv';
    if (m.startsWith('thuộc về ') || m.startsWith('có tính ') || m.startsWith('tính ')) return 'adj';
    if (m.startsWith('làm ') || m.startsWith('thực hiện ') || m.startsWith('bị ') || m.startsWith('được ') || m.startsWith('cho ') || m.startsWith('chỉ ')) return 'v';

    if (w.endsWith('tion') || w.endsWith('sion') || w.endsWith('ment') || w.endsWith('ness') || w.endsWith('ity') || w.endsWith('ance') || w.endsWith('ence') || w.endsWith('ism') || w.endsWith('ist') || w.endsWith('er') || w.endsWith('or') || w.endsWith('ship') || w.endsWith('hood') || w.endsWith('ture')) return 'n';
    if (w.endsWith('ive') || w.endsWith('able') || w.endsWith('ible') || w.endsWith('ful') || w.endsWith('less') || w.endsWith('ous') || w.endsWith('al') || w.endsWith('ic') || w.endsWith('ish') || w.endsWith('y')) return 'adj';
    if (w.endsWith('ly')) return 'adv';
    if (w.endsWith('ify') || w.endsWith('ize') || w.endsWith('ise') || w.endsWith('ate') || w.endsWith('en')) return 'v';

    return '';
}

function formatPOS(pos) {
    if (!pos) return '';
    if (pos === 'n') return `<span class="bg-blue-500/10 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded font-bold border border-blue-500/20 ml-2 align-middle text-lg inline-block">(n)</span>`;
    if (pos === 'v') return `<span class="bg-rose-500/10 text-rose-600 dark:text-rose-400 px-1.5 py-0.5 rounded font-bold border border-rose-500/20 ml-2 align-middle text-lg inline-block">(v)</span>`;
    if (pos === 'adj') return `<span class="bg-amber-500/10 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded font-bold border border-amber-500/20 ml-2 align-middle text-lg inline-block">(adj)</span>`;
    if (pos === 'adv') return `<span class="bg-purple-500/10 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded font-bold border border-purple-500/20 ml-2 align-middle text-lg inline-block">(adv)</span>`;
    return `<span class="bg-slate-500/10 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded font-bold border border-slate-500/20 ml-2 align-middle text-lg inline-block">(${pos})</span>`;
}

function parseStarredVocabInput() {
    const text = document.getElementById('vocabInput').value;
    const lines = text.split('\n');
    const oldStarred = getStarredWords();
    let newStarred = [];

    lines.forEach(line => {
        let currentLine = line.trim();
        if (!currentLine) return;

        let parts = [];
        if (currentLine.includes('\t')) parts = currentLine.split('\t');
        else if (currentLine.includes(' - ')) { let idx = currentLine.indexOf(' - '); parts = [currentLine.slice(0, idx), currentLine.slice(idx + 3)]; }
        else if (currentLine.includes('-')) { let idx = currentLine.lastIndexOf('-'); parts = [currentLine.slice(0, idx), currentLine.slice(idx + 1)]; }
        else if (currentLine.includes(':')) { let idx = currentLine.indexOf(':'); parts = [currentLine.slice(0, idx), currentLine.slice(idx + 1)]; }
        else if (currentLine.includes('=')) { let idx = currentLine.indexOf('='); parts = [currentLine.slice(0, idx), currentLine.slice(idx + 1)]; }
        else if (currentLine.includes(',')) { let idx = currentLine.indexOf(','); parts = [currentLine.slice(0, idx), currentLine.slice(idx + 1)]; }
        else if (currentLine.includes(' ')) { let idx = currentLine.indexOf(' '); parts = [currentLine.slice(0, idx), currentLine.slice(idx + 1)]; }

        if (parts.length >= 2) {
            const word = parts[0].trim();
            const meaning = parts.slice(1).join(' ').trim();
            if (word && meaning) {
                const pos = guessPartOfSpeech(word, meaning);
                let newItem = { word, meaning, pos };

                const oldItem = oldStarred.find(o => o.word === word);
                if (oldItem) {
                    if (oldItem.aiExample) newItem.aiExample = oldItem.aiExample;
                    if (oldItem.phonetic !== undefined) newItem.phonetic = oldItem.phonetic;
                    if (oldItem.googleTranslation !== undefined) newItem.googleTranslation = oldItem.googleTranslation;
                }

                newStarred.push(newItem);
            }
        }
    });

    localStorage.setItem('toeic_starred_words', JSON.stringify(newStarred));
    updateStarredCount();
}

function parseVocab(forceRender = false, noRender = false) {
    const onlyStarredToggle = document.getElementById('onlyStarredToggle');
    const isStarredMode = onlyStarredToggle && !onlyStarredToggle.checked;
    const text = document.getElementById('vocabInput').value;
    const lines = text.split('\n');

    if (!isStarredMode) {
        const oldList = parsedVocabList || [];
        parsedVocabList = [];

        lines.forEach(line => {
            let currentLine = line.trim();
            if (!currentLine) return;

            let parts = [];

            if (currentLine.includes('\t')) {
                parts = currentLine.split('\t');
            } else if (currentLine.includes(' - ')) {
                let idx = currentLine.indexOf(' - ');
                parts = [currentLine.slice(0, idx), currentLine.slice(idx + 3)];
            } else if (currentLine.includes('-')) {
                let idx = currentLine.lastIndexOf('-');
                parts = [currentLine.slice(0, idx), currentLine.slice(idx + 1)];
            } else if (currentLine.includes(':')) {
                let idx = currentLine.indexOf(':');
                parts = [currentLine.slice(0, idx), currentLine.slice(idx + 1)];
            } else if (currentLine.includes('=')) {
                let idx = currentLine.indexOf('=');
                parts = [currentLine.slice(0, idx), currentLine.slice(idx + 1)];
            } else if (currentLine.includes(',')) {
                let idx = currentLine.indexOf(',');
                parts = [currentLine.slice(0, idx), currentLine.slice(idx + 1)];
            } else if (currentLine.includes(' ')) {
                let idx = currentLine.indexOf(' ');
                parts = [currentLine.slice(0, idx), currentLine.slice(idx + 1)];
            }

            if (parts.length >= 2) {
                const word = parts[0].trim();
                // Join back just in case \t produced multiple parts
                const meaning = parts.slice(1).join(' ').trim();
                if (word && meaning) {
                    const pos = guessPartOfSpeech(word, meaning);
                    let newItem = { word, meaning, pos };

                    const oldItem = oldList.find(o => o.word === word && o.meaning === meaning) || (typeof currentFlashcards !== 'undefined' ? currentFlashcards.find(fc => fc.word === word && fc.meaning === meaning) : null);
                    let aiCache = {};
                    try { aiCache = JSON.parse(localStorage.getItem('toeic_ai_cache') || "{}"); } catch (e) { }

                    if (oldItem) {
                        if (oldItem.aiExample) newItem.aiExample = oldItem.aiExample;
                        if (oldItem.phonetic !== undefined) newItem.phonetic = oldItem.phonetic;
                        if (oldItem.googleTranslation !== undefined) newItem.googleTranslation = oldItem.googleTranslation;
                    }
                    const baseKey = `${word.toLowerCase()}_${meaning.toLowerCase().replace(/\s+/g, '')}`;
                    const baseOldKey = word.toLowerCase();

                    // 1. Tìm cache chính xác theo độ khó hiện tại
                    let cacheEntry = aiCache[`${baseKey}_${aiDifficultyLevel}`] || aiCache[`${baseOldKey}_${aiDifficultyLevel}`];

                    // 2. Nếu không có, tìm fallback ở các chế độ khác
                    if (!cacheEntry) {
                        const fallbackSuffixes = ['_fc_short', '_fc_long', '_medium', '_hard', '_easy', ''];
                        for (let suffix of fallbackSuffixes) {
                            if (aiCache[`${baseKey}${suffix}`]) { cacheEntry = aiCache[`${baseKey}${suffix}`]; break; }
                            if (aiCache[`${baseOldKey}${suffix}`]) { cacheEntry = aiCache[`${baseOldKey}${suffix}`]; break; }
                        }
                    }

                    // 3. Kế thừa chéo Family (áp dụng cho cả newItem.aiExample cũ và cacheEntry mới)
                    let targetEx = newItem.aiExample || cacheEntry;

                    // [AI BUGFIX] Tẩy rửa bộ nhớ đệm: Nếu synonyms bị nhiễm độc (không chứa tag), xóa nó để ép AI tạo lại
                    if (targetEx && targetEx.synonyms && targetEx.synonyms.length > 0) {
                        const hasTags = targetEx.synonyms.some(s => {
                            const vi = s.vi || '';
                            return vi.toLowerCase().includes('[đồng nghĩa]') || vi.toLowerCase().includes('[trái nghĩa]');
                        });
                        if (!hasTags) {
                            targetEx.synonyms = [];
                        }
                    }

                    if (targetEx && (!targetEx.family || targetEx.family.length === 0)) {
                        const allSuffixes = ['_fc_short', '_fc_long', '_medium', '_hard', '_easy', ''];
                        for (let suffix of allSuffixes) {
                            const pk1 = `${baseKey}${suffix}`;
                            const pk2 = `${baseOldKey}${suffix}`;
                            if (aiCache[pk1] && aiCache[pk1].family && aiCache[pk1].family.length > 0) {
                                targetEx.family = aiCache[pk1].family;
                                targetEx.synonyms = aiCache[pk1].synonyms || [];
                                targetEx.homophones = aiCache[pk1].homophones || [];
                                break;
                            }
                            if (aiCache[pk2] && aiCache[pk2].family && aiCache[pk2].family.length > 0) {
                                targetEx.family = aiCache[pk2].family;
                                targetEx.synonyms = aiCache[pk2].synonyms || [];
                                targetEx.homophones = aiCache[pk2].homophones || [];
                                break;
                            }
                        }
                    }

                    if (!newItem.aiExample && targetEx) {
                        newItem.aiExample = targetEx;
                    }

                    parsedVocabList.push(newItem);
                }
            }
        });
    }

    let renderList = isStarredMode ? getStarredWords() : parsedVocabList;

    const label = document.getElementById('wordCountLabel');
    label.innerText = `${renderList.length} từ vựng`;
    if (renderList.length > 0) {
        const count = renderList.length;
        const miniBtnCount = document.getElementById('miniBtnCount');
        if (miniBtnCount) {
            miniBtnCount.innerText = count.toString();
        }
        label.classList.remove('text-slate-400');
        label.classList.add('text-emerald-400');
    } else {
        label.classList.remove('text-emerald-400');
        label.classList.add('text-slate-400');
    }

    if (forceRender) {
        localStorage.setItem('toeic_vocab_view_mode', 'table');
        const tbody = document.getElementById('vocabPreviewBody');
        if (tbody) {
            tbody.innerHTML = '';
            renderList.forEach((item, index) => {
                const originalIndex = parsedVocabList.indexOf(item);
                const editId = (originalIndex !== -1) ? originalIndex : `'star_${item.word.replace(/'/g, "\\'")}'`;
                const isStarred = isWordStarred(item.word);
                const starIcon = isStarred ? '<i class="fa-solid fa-star text-yellow-400 drop-shadow-[0_0_3px_rgba(250,204,21,0.6)] scale-110 transition-all duration-300"></i>' : '<i class="fa-regular fa-star text-slate-500 hover:text-yellow-400 hover:scale-110 transition-all duration-300"></i>';

                const hasAi = !!item.aiExample;
                const tr = document.createElement('tr');
                // Tăng hiệu ứng hover và padding
                tr.className = "hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors group/row relative";
                tr.innerHTML = `
                            <td class="py-3 px-3 align-top w-1/3 relative border-r border-slate-200 dark:border-slate-700/50">
                                <!-- Hover accent line -->
                                <div class="absolute inset-y-0 left-0 w-1 bg-brand-500 opacity-0 group-hover/row:opacity-100 transition-opacity"></div>
                                <div class="flex items-start justify-between gap-2">
                                    <div class="font-bold text-brand-600 dark:text-brand-300 outline-none flex-1 focus:text-brand-500 dark:focus:text-brand-400 transition-colors whitespace-nowrap cursor-text" contenteditable="true" onblur="saveInlineEdit(${editId}, 0, this.innerText)">${item.word}</div>
                                    <div class="flex gap-2 shrink-0 transition-opacity">
                                        <button onclick="deleteWordFromTable(${editId}, event)" class="text-slate-400 hover:text-rose-500 transition-colors" title="Xóa từ này"><i class="fa-solid fa-trash-can text-xs"></i></button>
                                        <button onclick="toggleStarFromTable('${item.word.replace(/'/g, "\\'")}', event, this)" class="transition-colors" title="Đánh dấu từ này">${starIcon}</button>
                                    </div>
                                </div>
                            </td>
                            <td class="py-3 px-2 align-top text-slate-600 dark:text-slate-300 min-w-[150px]">
                                <div class="w-full h-full outline-none focus:text-slate-800 dark:focus:text-slate-100 transition-colors break-words cursor-text" contenteditable="true" onblur="saveInlineEdit(${editId}, 1, this.innerText)">${item.meaning}</div>
                            </td>
                        `;
                tbody.appendChild(tr);
            });

            // Add empty row for continuous input
            const newTr = document.createElement('tr');
            newTr.className = "hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-colors group/row border-t border-dashed border-slate-300 dark:border-slate-700 relative";
            newTr.innerHTML = `
                        <td class="py-3 px-3 align-middle w-1/3 relative border-r border-slate-200 dark:border-slate-700/50">
                            <!-- Hover accent line -->
                            <div class="absolute inset-y-0 left-0 w-1 bg-emerald-500 opacity-0 group-focus-within/row:opacity-100 group-hover/row:opacity-100 transition-opacity"></div>
                            <div class="font-bold text-brand-500 dark:text-brand-400 outline-none flex-1 focus:text-brand-600 dark:focus:text-brand-300 transition-colors empty:before:content-['+_Thêm_từ_mới...'] empty:before:text-slate-400 dark:empty:before:text-slate-500/60 empty:before:italic empty:before:font-medium whitespace-nowrap cursor-text" contenteditable="true" onblur="saveNewRow(this)" onkeydown="handleNewRowKeydown(event, this, 0)"></div>
                        </td>
                        <td class="py-3 px-2 align-middle text-slate-500 dark:text-slate-400 min-w-[150px]">
                            <div class="w-full h-full outline-none focus:text-slate-700 dark:focus:text-slate-200 transition-colors empty:before:content-['Nhập_nghĩa_và_nhấn_Enter...'] empty:before:text-slate-400 dark:empty:before:text-slate-500/60 empty:before:italic break-words cursor-text" contenteditable="true" onblur="saveNewRow(this)" onkeydown="handleNewRowKeydown(event, this, 1)"></div>
                        </td>
                    `;
            tbody.appendChild(newTr);

            document.getElementById('vocabInput').classList.add('hidden');
            document.getElementById('dropHint').classList.add('hidden');

            const dropZone = document.getElementById('dropZone');
            if (dropZone) {
                dropZone.classList.remove('border-dashed', 'border-2', 'p-1');
                dropZone.classList.add('border-solid', 'border', 'p-0');
            }

            document.getElementById('vocabPreview').classList.remove('hidden');
            document.getElementById('showTableBtn').classList.add('hidden');
            document.getElementById('showEditBtn').classList.remove('hidden');
            if (document.getElementById('spellCheckBtn')) document.getElementById('spellCheckBtn').classList.remove('hidden');
        }
    } else {
        if (!forceRender && !text) {
            document.getElementById('dropHint').classList.remove('hidden');
        } else if (!forceRender && text) {
            document.getElementById('dropHint').classList.add('hidden');
        }
    }
}

function editVocab() {
    document.getElementById('vocabPreview').classList.add('hidden');
    document.getElementById('vocabInput').classList.remove('hidden');

    const dropZone = document.getElementById('dropZone');
    if (dropZone) {
        dropZone.classList.add('border-dashed', 'border-2', 'p-1');
        dropZone.classList.remove('border-solid', 'border', 'p-0');
    }

    document.getElementById('showTableBtn').classList.remove('hidden');
    document.getElementById('showEditBtn').classList.add('hidden');
    if (document.getElementById('spellCheckBtn')) document.getElementById('spellCheckBtn').classList.add('hidden');
}

function toggleFilter(isBackgroundSync = false) {
    const toggleInput = document.getElementById('onlyStarredToggle');
    const textSpan = document.getElementById('starredToggleText');
    const badgeDiv = document.getElementById('starredToggleBadge');
    const textarea = document.getElementById('vocabInput');
    const track = document.getElementById('starredToggleTrack');
    const isEditing = textarea && !textarea.classList.contains('hidden');

    if (toggleInput && textSpan && badgeDiv) {
        if (!toggleInput.checked) {
            textSpan.classList.remove('text-slate-500', 'dark:text-slate-400');
            textSpan.classList.add('text-amber-500');
            badgeDiv.classList.add('border-amber-500');
            if (track) {
                track.classList.remove('bg-slate-400', 'dark:bg-slate-700');
                track.classList.add('bg-amber-500', 'dark:bg-amber-600');
            }
            if (textarea) {
                const starred = getStarredWords();
                textarea.value = starred.map(item => `${item.word} - ${item.meaning}`).join('\n');
            }
        } else {
            textSpan.classList.remove('text-amber-500');
            textSpan.classList.add('text-slate-500', 'dark:text-slate-400');
            badgeDiv.classList.remove('border-amber-500');
            if (track) {
                track.classList.remove('bg-amber-500', 'dark:bg-amber-600');
                track.classList.add('bg-slate-400', 'dark:bg-slate-700');
            }
            if (textarea) {
                const val = localStorage.getItem('toeic_vocab_list') || '';
                textarea.value = val.trim() === '' ? '' : val;
            }
        }
    }

    if (isEditing) {
        parseVocab(false);
    } else {
        parseVocab(true);
    }
    const fcContainer = document.getElementById('flashcardContainer');
    if (fcContainer && !fcContainer.classList.contains('hidden')) {
        let sourceList = parsedVocabList;
        const onlyStarred = document.getElementById('onlyStarredToggle') && !document.getElementById('onlyStarredToggle').checked;
        if (onlyStarred) {
            sourceList = getStarredWords();
        }

        if (sourceList.length === 0) {
            alert("Không có thẻ nào để hiển thị trong chế độ này.");
            returnToHome();
            return;
        }
        let currentWord = null;
        if (currentFlashcards && currentFlashcards.length > 0 && flashcardIndex >= 0 && flashcardIndex < currentFlashcards.length) {
            currentWord = currentFlashcards[flashcardIndex].word;
        }

        currentFlashcards = [...sourceList];

        let newIndex = 0;
        if (currentWord) {
            const foundIndex = currentFlashcards.findIndex(item => item.word === currentWord);
            if (foundIndex !== -1) {
                newIndex = foundIndex;
            }
        }

        flashcardIndex = newIndex;

        if (isBackgroundSync && currentWord && newIndex !== -1) {
            // Just update UI counters, don't disrupt current view
            const fcIndexInput = document.getElementById('fcIndexInput');
            const fcTotalCount = document.getElementById('fcTotalCount');
            if (fcIndexInput) fcIndexInput.value = flashcardIndex + 1;
            if (fcTotalCount) fcTotalCount.innerText = currentFlashcards.length;

            const fcCounter = document.getElementById('fcCounter');
            if (fcCounter) fcCounter.innerText = `Thẻ: ${flashcardIndex + 1} / ${currentFlashcards.length}`;
        } else {
            isFlipped = false;
            renderFlashcard();
        }
    }
}

async function checkTableSpelling() {
    const btn = document.getElementById('spellCheckBtn');
    const originalHtml = btn.innerHTML;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Đang quét`;
    btn.disabled = true;

    const tbody = document.getElementById('vocabPreviewBody');
    if (!tbody) {
        btn.innerHTML = originalHtml;
        btn.disabled = false;
        return;
    }

    const rows = tbody.children;
    let checkCount = 0;
    const isStarredMode = document.getElementById('onlyStarredToggle') && !document.getElementById('onlyStarredToggle').checked;
    const sourceList = isStarredMode ? getStarredWords() : parsedVocabList;

    for (let i = 0; i < sourceList.length; i++) {
        const item = sourceList[i];
        const word = item.word.toLowerCase().trim();
        let suggestion = null;
        let isSemantic = false;
        let datamuseHasWord = false;

        // 1. Kiểm tra chính tả chữ (Chỉ dùng cho từ đơn)
        if (word && !word.includes(' ') && !word.includes('-')) {
            try {
                const res = await fetch(`https://api.datamuse.com/words?sp=${encodeURIComponent(word)}&max=5`);
                const data = await res.json();
                if (data && data.length > 0) {
                    for (let d of data) {
                        if (d.word.toLowerCase() === word) {
                            datamuseHasWord = true;
                            break;
                        }
                    }
                    const dWord = data[0].word.toLowerCase();
                    if (dWord !== word && !datamuseHasWord) {
                        suggestion = dWord;
                    }
                }
            } catch (e) { }
        } else {
            datamuseHasWord = true;
        }

        // 2. Fallback Google Spell Check
        if (!suggestion) {
            try {
                const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&dt=bd&dt=sp&q=${encodeURIComponent(word)}`;
                const res = await fetch(url);
                const data = await res.json();

                if (data && data[7] && data[7][1]) {
                    let corrected = data[7][1].replace(/<[^>]*>?/gm, '').toLowerCase().trim();
                    if (/^[a-z \-']+$/.test(corrected)) {
                        if (corrected && corrected !== word) {
                            suggestion = corrected;
                        }
                    }
                }
            } catch (e) { }
        }

        // 3. Kiểm tra bằng Dictionary API nếu Datamuse không nhận diện được
        if (!suggestion && !datamuseHasWord) {
            try {
                const dictRes = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
                if (!dictRes.ok) {
                    // Thử tìm từ gốc bằng cách gọt bớt từng chữ cái bị gõ thừa ở cuối (ví dụ: blindhj -> blind)
                    let guess = word;
                    let foundGuess = null;
                    while (guess.length > 3) {
                        guess = guess.slice(0, -1);
                        try {
                            const gRes = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(guess)}`);
                            if (gRes.ok) {
                                foundGuess = guess;
                                break;
                            }
                        } catch (e) { }
                    }

                    if (foundGuess) {
                        suggestion = foundGuess;
                    } else {
                        suggestion = "[TỪ KHÔNG CÓ THẬT]";
                    }
                }
            } catch (e) { }
        }

        // 3. Render đề xuất nếu có
        if (suggestion) {
            const tr = rows[i];
            if (tr) {
                let suggestionHtml = '';

                if (suggestion === "[TỪ KHÔNG CÓ THẬT]") {
                    suggestionHtml = `<div class="mt-1.5"><span class="text-rose-400 bg-rose-500/10 border border-rose-500/30 px-1.5 py-0.5 rounded text-[10px] inline-flex items-center gap-1 transition-all shadow-sm"><i class="fa-solid fa-triangle-exclamation"></i> Từ này không tồn tại!</span></div>`;
                    const tdWord = tr.children[0];
                    if (!tdWord.innerHTML.includes('fa-triangle-exclamation')) {
                        tdWord.innerHTML += suggestionHtml;
                    }
                } else {
                    const icon = isSemantic ? "fa-language" : "fa-wand-magic-sparkles";
                    const title = isSemantic ? "Nghĩa có vẻ chưa chuẩn, bấm để tự sửa." : "Sai chính tả, bấm để tự sửa.";
                    const colorClass = isSemantic ? "text-amber-400 bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20 hover:border-amber-500/50" : "text-rose-400 bg-rose-500/10 border-rose-500/30 hover:bg-rose-500/20 hover:border-rose-500/50";
                    suggestionHtml = `<div class="mt-1.5"><span class="${colorClass} border px-1.5 py-0.5 rounded text-[10px] inline-flex items-center gap-1 cursor-pointer transition-all shadow-sm" title="${title}" onclick="applySpellingFix(${i}, '${suggestion.replace(/'/g, "\\'")}', event, ${isSemantic})"><i class="fa-solid ${icon}"></i> Sửa: <b>${suggestion}</b>?</span></div>`;

                    if (isSemantic) {
                        const tdMeaning = tr.children[1];
                        if (!tdMeaning.innerHTML.includes('fa-language')) {
                            tdMeaning.innerHTML += suggestionHtml;
                        }
                    } else {
                        const tdWord = tr.children[0];
                        if (!tdWord.innerHTML.includes('fa-wand-magic-sparkles')) {
                            tdWord.innerHTML += suggestionHtml;
                        }
                    }
                }
            }
        }

        checkCount++;
        if (checkCount % 3 === 0) await new Promise(r => setTimeout(r, 100));
    }

    btn.innerHTML = `<i class="fa-solid fa-check"></i> Hoàn tất`;
    setTimeout(() => {
        btn.innerHTML = originalHtml;
        btn.disabled = false;
    }, 2000);
}

function applySpellingFix(index, correctedText, event, isSemantic = false) {
    if (event) event.stopPropagation();

    const isStarredMode = document.getElementById('onlyStarredToggle') && !document.getElementById('onlyStarredToggle').checked;
    let sourceList = isStarredMode ? getStarredWords() : parsedVocabList;

    if (!sourceList[index]) return;
    const item = sourceList[index];
    const oldWord = item.word;
    const oldMeaning = item.meaning;

    if (isStarredMode) {
        // If in starred mode, directly update the starred item and save
        let starred = getStarredWords();
        if (starred[index] && starred[index].word === oldWord) {
            if (isSemantic) {
                starred[index].meaning = correctedText;
            } else {
                starred[index].word = correctedText;
            }
            window.disableAutoSync = true;
            localStorage.setItem('toeic_starred_words', JSON.stringify(starred));
            window.disableAutoSync = false;
        }
    } else {
        const textarea = document.getElementById('vocabInput');
        let lines = textarea.value.split('\n');

        let parsedCount = 0;
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].trim() !== '') {
                if (parsedCount === index) {
                    if (isSemantic) {
                        const meaningIdx = lines[i].lastIndexOf(oldMeaning);
                        if (meaningIdx !== -1) {
                            lines[i] = lines[i].substring(0, meaningIdx) + correctedText + lines[i].substring(meaningIdx + oldMeaning.length);
                        }
                    } else {
                        lines[i] = lines[i].replace(oldWord, correctedText);
                    }
                    break;
                }
                parsedCount++;
            }
        }

        textarea.value = lines.join('\n');
        window.disableAutoSync = true;
        localStorage.setItem('toeic_vocab_list', textarea.value);
        window.disableAutoSync = false;
    }

    // Cập nhật lại list trong bộ nhớ (không render lại HTML để giữ vị trí cuộn và không làm mất gợi ý lỗi)
    parseVocab(false, true);

    // Chỉ cập nhật DOM của hàng vừa sửa
    const tbody = document.getElementById('vocabPreviewBody');
    if (tbody && tbody.children[index]) {
        const tr = tbody.children[index];

        if (isSemantic) {
            const tdMeaning = tr.children[1];
            const editableDiv = tdMeaning.querySelector('div[contenteditable="true"]');
            if (editableDiv) editableDiv.innerText = correctedText;

            const badges = tdMeaning.querySelectorAll('div.mt-1\\.5');
            badges.forEach(b => b.remove());

            tdMeaning.classList.add('text-emerald-400', 'transition-colors', 'duration-500');
            setTimeout(() => tdMeaning.classList.remove('text-emerald-400'), 1000);
        } else {
            const tdWord = tr.children[0];
            const editableDiv = tdWord.querySelector('div[contenteditable="true"]');
            if (editableDiv) editableDiv.innerText = correctedText;

            const starBtn = tdWord.querySelector('button[onclick^="toggleStarFromTable"]');
            if (starBtn) {
                starBtn.setAttribute('onclick', `toggleStarFromTable('${correctedText.replace(/'/g, "\\'")}', event, this)`);
            }

            const badges = tdWord.querySelectorAll('div.mt-1\\.5');
            badges.forEach(b => b.remove());

            tdWord.classList.add('text-emerald-400', 'transition-colors', 'duration-500');
            setTimeout(() => tdWord.classList.remove('text-emerald-400'), 1000);
        }
    }

    // Invalidate sessions so UI rebuilds and generates new AI examples if needed
    try { currentFillList = []; } catch (e) { }
    refreshActiveFlashcards();
}

/**
 * getStorageKeyForModel - Trả về key localStorage tương ứng với model AI đang chọn.
 * Gemini dùng 'toeic_ai_apikey', Groq dùng 'toeic_ai_apikey_groq'.
 */
function getStorageKeyForModel() {
    const val = document.getElementById('aiModelSelect').value;
    if (val.includes('gpt-oss')) return 'toeic_ai_apikey_groq';
    return 'toeic_ai_apikey';
}

/**
 * loadApiKeyForCurrentModel - Load API key đã lưu cho model đang chọn.
 * Cập nhật link "Lấy key" (Groq console / Google AI Studio).
 * Render các ô input key, cập nhật badge số key.
 */
function loadApiKeyForCurrentModel() {
    const storageKey = getStorageKeyForModel();
    const linkEl = document.getElementById('getKeyLink');
    if (linkEl) {
        if (storageKey === 'toeic_ai_apikey_groq') {
            linkEl.href = 'https://console.groq.com/keys';
        } else {
            linkEl.href = 'https://aistudio.google.com/app/apikey';
        }
    }

    const savedKey = localStorage.getItem(storageKey);
    if (savedKey) {
        apiKey = savedKey;
        const keysArray = savedKey.split(',').filter(k => k.trim());
        if (keysArray.length > 0) {
            const countInput = document.getElementById('keyCountInput');
            countInput.value = Math.min(keysArray.length, 10);
            renderKeyInputs();
            for (let i = 0; i < keysArray.length; i++) {
                const el = document.getElementById('apiKeyInput_' + i);
                if (el) el.value = keysArray[i].trim();
            }
            updateKeyBadge(keysArray.length);
            hideKeyConfig();
        } else {
            renderKeyInputs();
            updateKeyBadge(0);
            showKeyConfig();
        }
        hideBanner();
    } else {
        apiKey = '';
        document.getElementById('keyCountInput').value = 1;
        renderKeyInputs();
        updateKeyBadge(0);
        showKeyConfig();
        showBanner(`Vui lòng cấu hình API Key cho ${storageKey === 'toeic_ai_apikey' ? 'Gemini' : 'Groq'}.`);
    }
}

function updateKeyBadge(count) {
    const badge = document.getElementById('activeKeyCountBadge');
    if (!badge) return;
    if (count > 0) {
        badge.innerText = count;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

function turnOnSaveSessionToggle() {
    const toggle = document.getElementById('saveSessionToggle');
    if (toggle && !toggle.checked) {
        toggle.checked = true;
        toggle.dispatchEvent(new Event('change'));
    }
}

function handleSaveSessionToggle(checkbox) {
    // Không xóa cache AI khi tắt toggle, chỉ ảnh hưởng đến việc có reset index bài học hay không
}

function clearAiCache() {
    if (confirm("Bạn có chắc chắn muốn xóa toàn bộ bộ nhớ đệm AI không? Việc này sẽ ép AI phải phân tích lại từ đầu ở lần học tới và sẽ tốn API Quota.")) {
        localStorage.removeItem('toeic_ai_cache');
        alert("Đã xóa bộ nhớ đệm AI thành công! Hãy tải lại trang hoặc tạo lại flashcard để thấy thay đổi.");
        hideKeyConfig();
    }
}

function toggleKeyConfig() {
    const section = document.getElementById('keyConfigSection');
    if (section.classList.contains('hidden')) {
        showKeyConfig();
    } else {
        hideKeyConfig();
    }
}

function showKeyConfig() {
    const section = document.getElementById('keyConfigSection');
    section.classList.remove('hidden');
    section.classList.add('flex');
}

function hideKeyConfig() {
    const section = document.getElementById('keyConfigSection');
    section.classList.add('hidden');
    section.classList.remove('flex');
}

function handleModelChange() {
    const val = document.getElementById('aiModelSelect').value;
    localStorage.setItem('toeic_ai_model', val);
    loadApiKeyForCurrentModel();
}

function changeKeyCount(delta) {
    const input = document.getElementById('keyCountInput');
    let val = parseInt(input.value) || 1;
    val += delta;
    if (val < 1) val = 1;
    if (val > 10) val = 10;
    input.value = val;
    renderKeyInputs();
}

function toggleStarFromTable(wordStr, event, btnElement) {
    if (event) event.stopPropagation();
    let item = null;
    if (typeof parsedVocabList !== 'undefined') item = parsedVocabList.find(x => x.word === wordStr);
    if (!item && typeof currentFlashcards !== 'undefined') item = currentFlashcards.find(x => x.word === wordStr);
    if (!item) {
        let starred = getStarredWords();
        item = starred.find(x => x.word === wordStr);
    }
    if (!item) item = { word: wordStr, meaning: "..." };

    const isStarred = toggleStarInList(item);
    if (isStarred) {
        btnElement.innerHTML = '<i class="fa-solid fa-star text-yellow-400 drop-shadow-[0_0_3px_rgba(250,204,21,0.6)] scale-110 transition-all duration-300"></i>';
    } else {
        btnElement.innerHTML = '<i class="fa-regular fa-star text-slate-500 hover:text-yellow-400 hover:scale-110 transition-all duration-300"></i>';
    }
}

function saveInlineEdit(id, colIndex, newText) {
    newText = newText.trim();
    if (newText === '') {
        deleteWordFromTable(id, null, true);
        return;
    }

    let item = null;
    let isOnlyStarred = false;

    if (typeof id === 'string' && id.startsWith('star_')) {
        const wordStr = id.replace('star_', '');
        let starred = getStarredWords();
        item = starred.find(s => s.word === wordStr);
        isOnlyStarred = true;
    } else {
        item = parsedVocabList[id];
    }

    if (!item) return;

    const oldWord = item.word;
    const oldMeaning = item.meaning;

    if (colIndex === 0 && newText === oldWord) return;
    if (colIndex === 1 && newText === oldMeaning) return;

    let starred = getStarredWords();
    const sIdx = starred.findIndex(s => s.word === oldWord);
    if (sIdx !== -1) {
        if (colIndex === 0) {
            starred[sIdx].word = newText;
            delete starred[sIdx].aiExample;
            delete starred[sIdx].phonetic;
            delete starred[sIdx].googleTranslation;
        }
        if (colIndex === 1) starred[sIdx].meaning = newText;
        localStorage.setItem('toeic_starred_words', JSON.stringify(starred));
    }

    if (!isOnlyStarred) {
        const textarea = document.getElementById('vocabInput');
        let lines = textarea.value.split('\n');
        let parsedCount = 0;
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].trim() !== '') {
                if (parsedCount === id) {
                    if (colIndex === 0) lines[i] = lines[i].replace(oldWord, newText);
                    if (colIndex === 1) lines[i] = lines[i].replace(oldMeaning, newText);
                    break;
                }
                parsedCount++;
            }
        }
        textarea.value = lines.join('\n');
        localStorage.setItem('toeic_vocab_list', textarea.value);

        if (colIndex === 0) {
            item.word = newText;
            delete item.aiExample;
            delete item.phonetic;
            delete item.googleTranslation;
        }
        if (colIndex === 1) item.meaning = newText;
    } else {
        if (colIndex === 0) {
            item.word = newText;
            delete item.aiExample;
            delete item.phonetic;
            delete item.googleTranslation;
        }
        if (colIndex === 1) item.meaning = newText;
    }

    updateStarredCount();

    // Invalidate sessions so UI rebuilds and generates new AI examples if needed
    try { currentFillList = []; } catch (e) { }
    refreshActiveFlashcards();
}

function deleteWordFromTable(id, event = null) {
    if (event) event.stopPropagation();

    let isOnlyStarred = false;
    let oldWord = '';

    if (typeof id === 'string' && id.startsWith('star_')) {
        const wordStr = id.replace('star_', '');
        let starred = getStarredWords();
        const sIdx = starred.findIndex(s => s.word === wordStr);
        if (sIdx !== -1) {
            starred.splice(sIdx, 1);
            localStorage.setItem('toeic_starred_words', JSON.stringify(starred));
        }
        isOnlyStarred = true;
    } else {
        const item = parsedVocabList[id];
        if (!item) return;
        oldWord = item.word;

        let starred = getStarredWords();
        const sIdx = starred.findIndex(s => s.word === oldWord);
        if (sIdx !== -1) {
            starred.splice(sIdx, 1);
            localStorage.setItem('toeic_starred_words', JSON.stringify(starred));
        }

        const textarea = document.getElementById('vocabInput');
        let lines = textarea.value.split('\n');
        let parsedCount = 0;
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].trim() !== '') {
                if (parsedCount === id) {
                    lines.splice(i, 1);
                    break;
                }
                parsedCount++;
            }
        }
        textarea.value = lines.join('\n');
        localStorage.setItem('toeic_vocab_list', textarea.value);
    }

    parseVocab(true);

    // Invalidate sessions so UI rebuilds and generates new AI examples if needed
    try { currentFillList = []; } catch (e) { }
    refreshActiveFlashcards();
}

function saveNewRow(element) {
    if (element.dataset.saving) return;

    const tr = element.closest('tr');
    if (!tr) return;
    const divs = tr.querySelectorAll('div[contenteditable="true"]');
    if (divs.length < 2) return;

    const word = divs[0].innerText.trim();
    const meaning = divs[1].innerText.trim();

    if (word && meaning) {
        element.dataset.saving = "true";

        const isStarredMode = document.getElementById('onlyStarredToggle') && !document.getElementById('onlyStarredToggle').checked;

        if (isStarredMode) {
            let starred = getStarredWords();
            if (!starred.find(s => s.word === word)) {
                starred.push({ word: word, meaning: meaning });
                localStorage.setItem('toeic_starred_words', JSON.stringify(starred));
            }
        } else {
            const textarea = document.getElementById('vocabInput');
            let text = textarea.value.trim();
            if (text) text += '\n';
            text += `${word} - ${meaning}`;
            textarea.value = text;
            localStorage.setItem('toeic_vocab_list', text);
        }

        // Re-render and spawn new row
        parseVocab(true);

        // Invalidate sessions so UI rebuilds and generates new AI examples if needed
        try { currentFillList = []; } catch (e) { }
        refreshActiveFlashcards();

        // Focus the new empty row's word cell
        setTimeout(() => {
            const newEmptyDiv = document.querySelector('#vocabPreviewBody tr.new-word-row td:first-child div');
            if (newEmptyDiv) newEmptyDiv.focus();
        }, 10);
    }
}

function handleNewRowKeydown(event, element, colIndex) {
    if (event.key === 'Enter') {
        event.preventDefault();
        if (colIndex === 0) {
            const tr = element.closest('tr');
            const divs = tr.querySelectorAll('div[contenteditable="true"]');
            if (divs[1]) divs[1].focus();
        } else {
            element.blur();
        }
    } else if (colIndex === 0 && (event.key === '-' || event.key === '=' || event.key === ',')) {
        // Mobile quick-jump: Pressing hyphen, equals, or comma jumps to the meaning cell
        event.preventDefault();
        const tr = element.closest('tr');
        const divs = tr.querySelectorAll('div[contenteditable="true"]');
        if (divs[1]) {
            // Remove trailing spaces if any
            element.innerText = element.innerText.trim();
            divs[1].focus();
        }
    }
}

function refreshActiveFlashcards() {
    try {
        const fcContainer = document.getElementById('flashcardContainer');
        if (fcContainer && !fcContainer.classList.contains('hidden')) {
            const isStarredMode = document.getElementById('onlyStarredToggle') && !document.getElementById('onlyStarredToggle').checked;
            currentFlashcards = [...(isStarredMode ? getStarredWords() : parsedVocabList)];
            if (flashcardIndex >= currentFlashcards.length) flashcardIndex = Math.max(0, currentFlashcards.length - 1);
            if (currentFlashcards.length > 0) {
                renderFlashcard();
            } else {
                document.getElementById('flashcardTotalCount').innerText = "0";
                document.getElementById('fcWord').innerHTML = "Hoàn thành!";
                document.getElementById('fcMeaning').innerText = "Không còn từ nào.";
                if (document.getElementById('fcUsage')) document.getElementById('fcUsage').classList.add('hidden');
                if (document.getElementById('fcExtraDetails')) document.getElementById('fcExtraDetails').classList.add('hidden');
            }
        } else {
            currentFlashcards = [];
        }
    } catch (e) { 
        currentFlashcards = []; 
    }
}

function renderKeyInputs() {
    const count = parseInt(document.getElementById('keyCountInput').value) || 1;
    const container = document.getElementById('keyInputsContainer');

    let existingVals = [];
    for (let i = 0; i < 10; i++) {
        const el = document.getElementById('apiKeyInput_' + i);
        if (el) existingVals.push(el.value);
    }

    container.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const val = existingVals[i] || '';
        container.innerHTML += `
                    <div class="relative shrink-0 w-full group bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus-within:ring-2 focus-within:ring-brand-500/30 focus-within:border-brand-500 transition-all duration-300 shadow-sm overflow-hidden">
                        <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 group-focus-within:text-brand-500 transition-colors z-10 pointer-events-none">
                            <i class="fa-solid fa-key text-xs"></i>
                        </span>
                        <input type="password" id="apiKeyInput_${i}" value="${val}" placeholder="Key ${i + 1}..."
                            class="w-full bg-transparent border-none text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 text-sm font-medium focus:ring-0 block pl-10 pr-10 py-3 outline-none"
                            style="background: transparent !important; color: inherit !important; box-shadow: none !important;">
                        <button onclick="toggleApiKeyVisibility(${i})"
                            class="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors z-10">
                            <i id="apiKeyToggleIcon_${i}" class="fa-solid fa-eye text-sm"></i>
                        </button>
                    </div>
                `;
    }
}

function toggleApiKeyVisibility(index) {
    const input = document.getElementById('apiKeyInput_' + index);
    const icon = document.getElementById('apiKeyToggleIcon_' + index);
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fa-solid fa-eye-slash text-xs';
    } else {
        input.type = 'password';
        icon.className = 'fa-solid fa-eye text-xs';
    }
}

/** returnToHome - Quay về màn hình chính, ẩn tất cả chế độ, reset state */
function returnToHome() {
    window.speechSynthesis.cancel(); // Dừng đọc
    document.getElementById('examContainer').classList.add('hidden');
    document.getElementById('flashcardContainer').classList.add('hidden');
    document.getElementById('quizContainer').classList.add('hidden');
    document.getElementById('fillContainer').classList.add('hidden');
    document.getElementById('loadingScreen').classList.add('hidden');
    document.getElementById('welcomeScreen').classList.remove('hidden');
    flatQuestions = [];      // Xóa đề thi
    userAnswers = {};        // Xóa đáp án
    activeQuestionIndex = 0; // Reset vị trí
}

/** saveApiKey - Lưu API keys từ các ô input vào localStorage. Nối bằng dấu phẩy. */
function saveApiKey() {
    const count = parseInt(document.getElementById('keyCountInput').value) || 1;
    let keys = [];
    for (let i = 0; i < count; i++) {
        const val = document.getElementById('apiKeyInput_' + i).value.trim();
        if (val) keys.push(val);
    }

    if (keys.length === 0) {
        alert("Vui lòng nhập ít nhất 1 API Key hợp lệ.");
        return;
    }

    const keyStr = keys.join(',');
    const storageKey = getStorageKeyForModel();
    localStorage.setItem(storageKey, keyStr);
    apiKey = keyStr;
    updateKeyBadge(keys.length);
    hideBanner();
    hideKeyConfig();
    showNotice("Đã lưu " + keys.length + " API Key thành công!");
}

function showBanner(msg) {
    const banner = document.getElementById('statusBanner');
    const bannerMsg = document.getElementById('statusMessage');
    bannerMsg.innerText = msg;
    banner.classList.remove('hidden');
}

function hideBanner() {
    document.getElementById('statusBanner').classList.add('hidden');
}

/** showNotice - Hiển thị thông báo toast ở góc dưới phải, tự mất sau 3 giây */
function showNotice(msg) {
    const tempNotice = document.createElement('div');
    tempNotice.className = "fixed bottom-5 right-5 bg-emerald-600 text-white font-bold py-3 px-6 rounded-xl shadow-2xl z-50 flex items-center gap-2 transform translate-y-10 opacity-0 transition-all duration-300";
    tempNotice.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${msg}`;
    document.body.appendChild(tempNotice);
    setTimeout(() => {
        tempNotice.classList.remove('translate-y-10', 'opacity-0');
    }, 50);
    setTimeout(() => {
        tempNotice.classList.add('translate-y-10', 'opacity-0');
        setTimeout(() => tempNotice.remove(), 300);
    }, 3000);
}

function setTestSize(size) {
    testSize = size;
    const miniBtn = document.getElementById('sizeBtn_mini');
    const fullBtn = document.getElementById('sizeBtn_full');

    if (size === 'mini') {
        miniBtn.className = "size-btn py-2.5 text-xs font-bold rounded-lg text-center transition-all duration-200 bg-brand-500 text-white shadow-md shadow-brand-500/20";
        fullBtn.className = "size-btn py-2.5 text-xs font-semibold rounded-lg text-center transition-all duration-200 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50";
    } else {
        fullBtn.className = "size-btn py-2.5 text-xs font-bold rounded-lg text-center transition-all duration-200 bg-brand-500 text-white shadow-md shadow-brand-500/20";
        miniBtn.className = "size-btn py-2.5 text-xs font-semibold rounded-lg text-center transition-all duration-200 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50";
    }
}

/**
 * downloadExamAsHTML - Xuất đề thi ra file HTML đẹp để in.
 * Bao gồm: câu hỏi, đáp án, giải thích, điểm số, phân tích cú pháp.
 */
function downloadExamAsHTML() {
    if (!flatQuestions || flatQuestions.length === 0) {
        alert("Vui lòng tạo đề và làm bài trước khi tải xuống.");
        return;
    }

    const now = new Date();
    const dateStr = now.toLocaleDateString('vi-VN');
    const timeStr = now.toLocaleTimeString('vi-VN');
    const modelName = document.getElementById('aiModelSelect').options[document.getElementById('aiModelSelect').selectedIndex].text;

    function fmtSyntax(str) {
        if (!str) return '<em style="color:#64748b;">Không có phân tích.</em>';
        return str
            .replace(/\[S\]/g, '<span class="tok tok-s">S</span>')
            .replace(/\[V\]/g, '<span class="tok tok-v">V</span>')
            .replace(/\[O\]/g, '<span class="tok tok-o">O</span>')
            .replace(/\[M\]/g, '<span class="tok tok-m">M</span>')
            .replace(/\n/g, '<br>');
    }

    let questionsHTML = '';

    flatQuestions.forEach((q, index) => {
        const uAns = userAnswers[index];

        let optionsHTML = '';
        ['A', 'B', 'C', 'D'].forEach(opt => {
            const isCorrect = opt === q.correct_answer;
            const isSelected = opt === uAns;

            let cls = 'opt-default';
            let indicator = '';

            if (isCorrect) {
                cls = 'opt-correct';
                indicator = ' ✓ Đúng';
            } else if (isSelected && !isCorrect) {
                cls = 'opt-wrong';
                indicator = ' ✗ Sai của bạn';
            }

            optionsHTML += `
                        <div class="opt ${cls}">
                            <div class="opt-letter">${opt}</div>
                            <div>${q.options[opt]}${indicator}</div>
                        </div>
                    `;
        });

        let wrongHTML = '';
        if (q.explanation?.wrong_options_grammar_analysis) {
            Object.entries(q.explanation.wrong_options_grammar_analysis).forEach(([k, v]) => {
                wrongHTML += `
                            <div class="wrong-row">
                                <div class="wrong-letter">${k.replace('option_', '')}</div>
                                <div>
                                    <div class="wrong-nature">🔬 Bản chất: <em>${v.nature || '—'}</em></div>
                                    <div class="wrong-reason">❌ Tại sao sai: ${(v.why_faulty || '—').replace(/(Tại\s*sao\s*sai:|Sai\s*vì\b:?)/gi, '<br><strong style="color:#e11d48">Sai vì: </strong>')}</div>
                                </div>
                            </div>
                        `;
            });
        }

        const isCorrect = uAns === q.correct_answer;
        const statusColor = uAns ? (isCorrect ? '#6ee7b7' : '#fca5a5') : '#94a3b8';
        const statusText = uAns
            ? (isCorrect ? `✅ Bạn chọn: ${uAns} — Đúng!` : `❌ Bạn chọn: ${uAns} — Sai · Đáp án đúng: ${q.correct_answer}`)
            : `⬜ Chưa trả lời · Đáp án đúng: ${q.correct_answer}`;

        questionsHTML += `
                <div class="qcard">
                    <div class="qcard-header">
                        <span class="q-num">Câu ${index + 1}</span>
                        <span style="font-size:13px;color:${statusColor};font-weight:600;">${statusText}</span>
                    </div>
                    <p class="q-text">${q.question_text || ''}</p>
                    <div class="opts">${optionsHTML}</div>
                    
                    <details class="analysis">
                        <summary class="analysis-title">📖 Xem Phân Tích Chi Tiết</summary>
                        <div class="analysis-body">
                            
                            ${q.sentence_structure_analysis ? `
                            <div class="panel panel-indigo">
                                <div class="panel-label">🔬 Cú Pháp & Ngữ Pháp · Mổ Xẻ Cấu Trúc Câu</div>
                                <div class="syntax-box">${fmtSyntax(q.sentence_structure_analysis)}</div>
                            </div>` : ''}

                            ${q.vietnamese_translation ? `
                            <div class="panel panel-blue">
                                <span style="font-size:20px;">🇻🇳</span>
                                <div><strong>Dịch nghĩa:</strong><br>${q.vietnamese_translation}</div>
                            </div>` : ''}
                            
                            <div class="two-col">
                                <div class="panel panel-green">
                                    <div class="panel-label">✅ Vì Sao Đáp Án Đúng?</div>
                                    ${q.explanation?.grammar_rule ? `<div class="info-row"><strong>Chủ điểm:</strong> ${q.explanation.grammar_rule}</div>` : ''}
                                    ${q.explanation?.keywords ? `<div class="info-row"><strong>Dấu hiệu/Từ khóa:</strong> <span class="keyword-badge">${q.explanation.keywords}</span></div>` : ''}
                                    ${q.explanation?.why_correct ? `<div class="info-row" style="margin-top:8px;">${q.explanation.why_correct}</div>` : ''}
                                </div>
                                ${q.explanation?.trap_warning ? `
                                <div class="panel panel-amber">
                                    <div class="panel-label">⚠️ Bẫy TOEIC Cần Tránh</div>
                                    <p class="trap-text">${q.explanation.trap_warning}</p>
                                </div>` : '<div></div>'}
                            </div>

                            ${wrongHTML ? `
                            <div class="panel panel-rose">
                                <div class="panel-label">❌ Vạch Trần Bản Chất Các Đáp Án Sai</div>
                                ${wrongHTML}
                            </div>` : ''}
                            
                            ${(q.deep_explanation || q.family_grammar) ? `
                            <div class="panel panel-teal" style="background:#022c22; border:1px solid #065f46; color:#a7f3d0;">
                                <div class="panel-label" style="color:#34d399;">🎓 Mở Rộng Hệ Sinh Thái & Giải Thích Sâu</div>
                                <div style="margin-top:12px; font-size:14px; line-height:1.7;">
                                    ${q.family_grammar || ''}
                                    ${(q.family_grammar && q.deep_explanation) ? `<hr style="border:0;border-top:1px dashed #059669;margin:20px 0;">` : ''}
                                    ${q.deep_explanation || ''}
                                </div>
                            </div>` : ''}
                            
                        </div>
                    </details>
                </div>`;
    });

    const answered = Object.keys(userAnswers).length;
    const correct = Object.keys(userAnswers).filter(i => userAnswers[i] === flatQuestions[i]?.correct_answer).length;
    const scoreHTML = answered > 0
        ? `<div class="score-box">
                    <span style="color:#64748b;font-size:15px;">Kết quả làm bài: </span>
                    <span style="font-size:28px;font-weight:900;color:#34d399;">${correct}/${answered}</span>
                    <span style="color:#64748b;font-size:15px;"> câu đúng (${Math.round(correct / answered * 100)}%)</span>
                   </div>` : '';

    const htmlContent = `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Đề TOEIC Vocab — ${dateStr} ${timeStr}</title>
<script src="https://cdn.tailwindcss.com"><\/script>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0f172a; color: #cbd5e1; font-family: 'Segoe UI', system-ui, sans-serif; padding: 32px; max-width: 960px; margin: 0 auto; line-height: 1.6; }
  details > summary::-webkit-details-marker { display: none; }
  
  .site-header { text-align: center; padding: 40px 0 32px; }
  .site-title { font-size: 32px; font-weight: 900; background: linear-gradient(90deg, #60a5fa, #a5b4fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: -0.02em; }
  .site-sub { color: #64748b; margin-top: 8px; font-size: 14px; }
  
  .score-box { background: rgba(15, 23, 42, 0.6); border: 1px solid #1e293b; border-radius: 16px; padding: 20px; margin-bottom: 32px; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.2); }
  
  .qcard { background: rgba(15, 23, 42, 0.6); border: 1px solid #1e293b; border-radius: 20px; padding: 32px; margin-bottom: 28px; box-shadow: 0 4px 15px rgba(0,0,0,0.2); }
  .qcard-header { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
  .q-num { background: rgba(99, 102, 241, 0.2); color: #818cf8; font-weight: 800; padding: 6px 16px; border-radius: 24px; font-size: 14px; border: 1px solid rgba(99, 102, 241, 0.3); }
  .q-text { color: #f1f5f9; font-size: 16px; font-weight: 600; margin-bottom: 20px; }
  
  .opts { display: flex; flex-direction: column; gap: 10px; margin-bottom: 12px; }
  .opt { display: flex; align-items: center; gap: 14px; border: 1px solid #1e293b; border-radius: 12px; padding: 12px 16px; font-size: 15px; transition: all 0.2s; }
  .opt-letter { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px; flex-shrink: 0; }
  .opt-default { background: rgba(2, 6, 23, 0.4); color: #94a3b8; } .opt-default .opt-letter { background: #1e293b; color: #64748b; }
  .opt-correct { background: rgba(16, 185, 129, 0.1); border-color: #059669; color: #34d399; font-weight: 700; } .opt-correct .opt-letter { background: #059669; color: #fff; }
  .opt-wrong { background: rgba(225, 29, 72, 0.1); border-color: #e11d48; color: #fb7185; font-weight: 700; } .opt-wrong .opt-letter { background: #e11d48; color: #fff; }
  
  .analysis { margin-top: 24px; }
  .analysis-title { cursor: pointer; background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 14px 20px; color: #818cf8; font-weight: 800; font-size: 15px; list-style: none; display: flex; align-items: center; gap: 10px; transition: 0.2s; }
  .analysis-title:hover { background: #334155; }
  .analysis-body { margin-top: 16px; display: flex; flex-direction: column; gap: 16px; animation: fadeIn 0.3s ease-in-out; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
  
  .panel { border-radius: 16px; padding: 20px; font-size: 14px; background: rgba(15, 23, 42, 0.6); border: 1px solid #1e293b; }
  .panel-label { font-weight: 800; font-size: 13px; text-transform: uppercase; letter-spacing: .08em; margin-bottom: 12px; opacity: .9; }
  .panel-indigo { color: #cbd5e1; } .panel-indigo .panel-label { color: #818cf8; }
  .panel-blue { border-left: 4px solid #6366f1; background: rgba(49, 46, 129, 0.4); color: #e2e8f0; display: flex; align-items: flex-start; gap: 12px; }
  .panel-green { color: #cbd5e1; height: 100%; } .panel-green .panel-label { color: #34d399; }
  .panel-amber { background: rgba(120, 53, 15, 0.2); border: 1px solid rgba(245, 158, 11, 0.2); color: #fde68a; height: 100%; } .panel-amber .panel-label { color: #fbbf24; }
  .panel-rose { color: #cbd5e1; } .panel-rose .panel-label { color: #fb7185; }
  
  .syntax-box { font-family: 'Courier New', monospace; font-size: 14px; background: rgba(2, 6, 23, 0.6); padding: 16px; border-radius: 10px; border: 1px solid #1e293b; line-height: 2.2; color: #cbd5e1; }
  .tok { display: inline-block; padding: 2px 8px; border-radius: 6px; font-weight: 800; font-size: 12px; margin-right: 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.2); }
  .tok-s { background: rgba(59, 130, 246, 0.2); color: #93c5fd; border: 1px solid rgba(59, 130, 246, 0.3); }
  .tok-v { background: rgba(16, 185, 129, 0.2); color: #6ee7b7; border: 1px solid rgba(16, 185, 129, 0.3); }
  .tok-o { background: rgba(245, 158, 11, 0.2); color: #fcd34d; border: 1px solid rgba(245, 158, 11, 0.3); }
  .tok-m { background: rgba(168, 85, 247, 0.2); color: #d8b4fe; border: 1px solid rgba(168, 85, 247, 0.3); }
  
  .info-row { margin-bottom: 8px; line-height: 1.6; }
  .keyword-badge { font-weight: 700; color: #818cf8; margin-left: 4px; }
  .trap-text { font-style: italic; line-height: 1.7; }
  
  .two-col { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 16px; }
  @media(max-width: 768px) { .two-col { grid-template-columns: 1fr; } }
  
  .wrong-row { display: flex; align-items: flex-start; gap: 12px; padding: 12px 0; border-bottom: 1px solid rgba(225, 29, 72, 0.1); }
  .wrong-row:last-child { border-bottom: none; padding-bottom: 0; }
  .wrong-letter { width: 32px; height: 32px; background: rgba(225, 29, 72, 0.1); border: 1px solid rgba(225, 29, 72, 0.2); color: #fb7185; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px; flex-shrink: 0; font-family: monospace; }
  .wrong-nature { color: #818cf8; font-size: 13px; margin-bottom: 4px; font-weight: 600; }
  .wrong-reason { color: #94a3b8; font-size: 13px; font-weight: 500; }
  
  .footer { text-align: center; color: #475569; font-size: 12px; margin-top: 48px; padding-top: 24px; border-top: 1px solid #1e293b; }
</style>
</head>
<body>
  <div class="site-header">
    <h1 class="site-title">🎓 TOEIC VOCAB MASTERCLASS</h1>
    <p class="site-sub">${flatQuestions.length} câu · ${modelName} · Xuất ngày ${dateStr} lúc ${timeStr}</p>
  </div>
  ${scoreHTML}
  ${questionsHTML}
  <div class="footer">Tạo bởi TOEIC Vocab Masterclass · ${dateStr}</div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TOEIC_Vocab_${dateStr}_${timeStr}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotice('Đã tải đề thi xuống thành công!');
}

/**
 * selectWordsForChunk - Chọn từ vựng cho một chunk đề thi.
 * Ưu tiên từ chưa dùng (usedCount thấp) để xoay vòng đều.
 * Nếu số từ ít hơn số câu, lặp lại từ theo vòng.
 * @param {number} count - Số từ cần chọn
 * @param {Array} sourceList - Nguồn từ vựng
 */
function selectWordsForChunk(count, sourceList = parsedVocabList) {
    if (sourceList.length === 0) return [];

    // Xoay vòng từ vựng: Ưu tiên từ chưa dùng (usedCount thấp)
    let candidates = sourceList.map((item, index) => {
        let key = item.word.toLowerCase();
        let count = vocabTracker[key] || 0;
        return { item, count, index };
    });

    candidates.sort((a, b) => {
        if (a.count !== b.count) return a.count - b.count;
        // Nếu cùng count, lấy ưu tiên từ trên xuống dưới theo danh sách
        return a.index - b.index;
    });

    let selected = [];
    for (let i = 0; i < count; i++) {
        // Nếu danh sách từ ít hơn số câu hỏi, ta sẽ xoay vòng lặp lại
        let c = candidates[i % candidates.length];
        let key = c.item.word.toLowerCase();
        vocabTracker[key] = (vocabTracker[key] || 0) + 1;
        selected.push(c.item);
    }

    localStorage.setItem('toeic_vocab_tracker', JSON.stringify(vocabTracker));
    return selected;
}

/**
 * generateExam - Tạo đề thi TOEIC Part 5 bằng AI.
 * Quy trình: Chọn từ → Chia chunk (5 từ/lô) → Gọi API song song theo key → Merge kết quả.
 * Hỗ trợ 2 kích thước: mini (15/số từ) và full (30 câu).
 */
async function generateExam() {
    if (!apiKey) {
        alert("Vui lòng cấu hình API Key ở góc trên bên phải trước khi bắt đầu.");
        return;
    }

    parseVocab();
    if (parsedVocabList.length === 0) {
        alert("Vui lòng dán danh sách từ vựng hợp lệ vào khung bên trái.");
        return;
    }

    document.getElementById('welcomeScreen').classList.add('hidden');
    document.getElementById('examContainer').classList.add('hidden');
    document.getElementById('flashcardContainer').classList.add('hidden');
    document.getElementById('quizContainer').classList.add('hidden');
    document.getElementById('fillContainer').classList.add('hidden');
    const loading = document.getElementById('loadingScreen');
    loading.classList.remove('hidden');

    const generateBtn = document.getElementById('generateBtn');
    generateBtn.disabled = true;
    generateBtn.innerHTML = `<i class="fa-solid fa-circle-notch animate-spin"></i> Đang tải đề...`;

    let sourceList = parsedVocabList;
    const onlyStarred = document.getElementById('onlyStarredToggle') && !document.getElementById('onlyStarredToggle').checked;
    if (onlyStarred) {
        sourceList = getStarredWords();
        if (sourceList.length === 0) {
            alert("Bạn chưa đánh dấu (star) từ vựng nào hợp lệ.");
            document.getElementById('loadingScreen').classList.add('hidden');
            document.getElementById('welcomeScreen').classList.remove('hidden');
            generateBtn.disabled = false;
            generateBtn.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> <span class="tracking-wide">Tạo Đề Từ Vựng</span>`;
            return;
        }
    }

    let count = sourceList.length;
    let miniQCount = count;
    let qCount = 30;
    if (testSize === 'mini') {
        qCount = miniQCount;
    } else if (testSize === 'custom') {
        qCount = parseInt(document.getElementById('customSizeInput').value) || 30;
    } else {
        qCount = 30;
    }

    const keysArray = apiKey.split(',').map(k => k.trim()).filter(k => k);
    const numKeys = keysArray.length;

    updateLoadingProgress(`Khởi động Giáo viên AI...`, 10);
    document.getElementById('loadingSubText').innerHTML = `Đang phân tích danh sách từ vựng và chuẩn bị biên soạn.`;

    // Limit chunk size to 5 to avoid API rate limits
    let maxChunkSize = 5;
    let tasksConfig = [];
    let remainingQ = qCount;
    let keyIndex = 0;

    let selectedWords = selectWordsForChunk(qCount, sourceList);

    while (remainingQ > 0) {
        let taskQCount = Math.min(remainingQ, maxChunkSize);
        let currentChunkWords = selectedWords.splice(0, taskQCount);
        remainingQ -= taskQCount;

        let wordInstructions = currentChunkWords.map((w, idx) =>
            `Câu ${idx + 1}: Tạo câu hỏi mà ĐÁP ÁN ĐÚNG BẮT BUỘC LÀ TỪ "${w.word}" (Nghĩa: ${w.meaning}).`
        ).join("\n");

        const contextsList = ["kinh doanh/thương mại", "đời sống hàng ngày", "du lịch/nhà hàng", "công nghệ/IT", "nhân sự/tuyển dụng", "tài chính/kế toán", "y tế/sức khỏe", "giáo dục/đào tạo", "mua sắm/bán lẻ", "giao thông/vận tải", "giải trí/nghệ thuật", "sản xuất/nhà máy"];
        let randomContext = contextsList[Math.floor(Math.random() * contextsList.length)];

        let description = `Sinh đúng ${taskQCount} câu hỏi trắc nghiệm độc lập (Part 5 TOEIC format). BẮT BUỘC TẤT CẢ CÁC CÂU HỎI PHẢI LÀ CÂU HỎI TỪ VỰNG.
CHỦ ĐỀ/NGỮ CẢNH BẮT BUỘC LẦN NÀY: "${randomContext}" (Hãy sáng tạo tình huống xoay quanh chủ đề này để tránh trùng lặp nội dung với các câu hỏi khác).
YÊU CẦU ĐẶC BIỆT: Đây là bài ôn tập từ vựng dựa trên danh sách từ của học viên. BẮT BUỘC bạn phải thiết kế MỖI CÂU HỎI sao cho ĐÁP ÁN ĐÚNG LÀ TỪ VỰNG ĐƯỢC CHỈ ĐỊNH DƯỚI ĐÂY:
${wordInstructions}

Đảm bảo 4 lựa chọn A/B/C/D của mỗi câu phải là 4 TỪ KHÁC NHAU HOÀN TOÀN VỀ NGHĨA. TUYỆT ĐỐI không dùng cùng một gốc từ có chia đuôi (ví dụ A. create B. creation là SAI quy tắc). Cả 4 từ đều phải là các từ vựng khác nhau. Trong đó 1 đáp án phải ĐÚNG chính xác là từ được chỉ định.`;

        const systemPrompt = `Bạn là một Đại cao thủ luyện thi TOEIC 990 và là chuyên gia ngôn ngữ xuất sắc. Nhiệm vụ của bạn là biên soạn đề thi luyện tập hướng tới mức điểm 750+ cho học viên.
QUY TẮC SỐNG CÒN VỀ LOGIC NGỮ NGHĨA: BẮT BUỘC đáp án đúng ghép vào câu phải tạo ra một câu hoàn toàn HỢP LÝ VỀ MẶT THỰC TẾ.
QUY TẮC SỐNG CÒN VỀ TÍNH DUY NHẤT: Trong 4 lựa chọn (A, B, C, D), BẮT BUỘC CHỈ CÓ DUY NHẤT 1 ĐÁP ÁN ĐÚNG. Ba đáp án còn lại phải SAI HOÀN TOÀN về mặt ngữ nghĩa ngữ cảnh.
QUAN TRỌNG: Bạn phải VIẾT PHẦN GIẢI THÍCH (explanation) VÔ CÙNG CẶN KẼ, SÂU SẮC. ĐẶC BIỆT LƯU Ý LỖI NGHIÊM TRỌNG: MỖI CÂU HỎI PHẢI CÓ PHẦN GIẢI THÍCH, MỔ XẺ CẤU TRÚC HOÀN TOÀN RIÊNG BIỆT KHỚP ĐÚNG VỚI NỘI DUNG CÂU ĐÓ.
Yêu cầu biên soạn: ${description}
TUYỆT ĐỐI TUÂN THỦ: TẤT CẢ CÁC MỤC GIẢI THÍCH, PHÂN TÍCH, DỊCH NGHĨA PHẢI VIẾT BẰNG TIẾNG VIỆT 100%.

ĐÁP ỨNG TIÊU CHUẨN THÔNG TIN BẮT BUỘC TRẢ VỀ DẠNG JSON SAU (KHÔNG ĐƯỢC CHỨA BẤT KỲ VĂN BẢN NÀO NGOÀI JSON):
{
  "passages": [
    {
      "passage_text": "",
      "questions": [
        {
          "question_number": [Số thứ tự câu hỏi tăng dần từ 1],
          "question_text": "Nội dung câu hỏi đầy đủ. QUY TẮC CỨNG: BẮT BUỘC PHẢI CHỨA CHỖ TRỐNG '___' (3 dấu gạch dưới) ĐỂ HỌC VIÊN ĐIỀN VÀO.",
          "options": { "A": "Đáp án A", "B": "Đáp án B", "C": "Đáp án C", "D": "Đáp án D" },
          "correct_answer": "Đáp án đúng (chỉ ghi A, B, C hoặc D)",
          "sentence_structure_analysis": "MỔ XẺ CẤU TRÚC CÂU: Phân tích thành phần câu thật trực quan sử dụng chuẩn viết tắt [S] (Chủ ngữ), [V] (Động từ chính), [O] (Tân ngữ), [M] (Trạng từ/Trạng ngữ/Cụm từ bổ trợ).",
          "vietnamese_translation": "Dịch nghĩa toàn bộ câu hỏi sang tiếng Việt thật tự nhiên.",
          "explanation": {
            "grammar_rule": "Từ Vựng",
            "keywords": "TRÍCH XUẤT CHÍNH XÁC CÁC TỪ KHÓA/DẤU HIỆU NHẬN BIẾT trong câu.",
            "why_correct": "Giải thích chi tiết lý do chọn đáp án này. BẮT BUỘC bắt đầu bằng việc ghi rõ \\"Dịch nghĩa: [nghĩa của đáp án]\\". Kế tiếp dùng \\\\n để tách biệt, giải thích lý do vì sao phù hợp ngữ cảnh. BẮT BUỘC cho thêm 1 câu ví dụ tiếng Anh (kèm dịch) minh họa.",
            "wrong_options_grammar_analysis": {
              "option_A": {
                "nature": "Bản chất/Loại từ",
                "why_faulty": "BẮT BUỘC trình bày: \\\\nDịch nghĩa: [Nghĩa tiếng Việt] \\\\nTại sao sai: [Giải thích] \\\\nVí dụ: [Câu ví dụ kèm dịch]. \\\\nTừ đồng nghĩa: [từ] \\\\nTừ trái nghĩa: [từ]"
              },
              "option_B": {
                "nature": "Bản chất/Loại từ",
                "why_faulty": "BẮT BUỘC trình bày: \\\\nDịch nghĩa: [Nghĩa tiếng Việt] \\\\nTại sao sai: [Giải thích] \\\\nVí dụ: [Câu ví dụ kèm dịch]. \\\\nTừ đồng nghĩa: [từ] \\\\nTừ trái nghĩa: [từ]"
              },
              "option_C": {
                "nature": "Bản chất/Loại từ",
                "why_faulty": "BẮT BUỘC trình bày: \\\\nDịch nghĩa: [Nghĩa tiếng Việt] \\\\nTại sao sai: [Giải thích] \\\\nVí dụ: [Câu ví dụ kèm dịch]. \\\\nTừ đồng nghĩa: [từ] \\\\nTừ trái nghĩa: [từ]"
              },
              "option_D": {
                "nature": "Bản chất/Loại từ",
                "why_faulty": "BẮT BUỘC trình bày: \\nTại sao sai: [Giải thích] \\nVí dụ: [Câu ví dụ kèm dịch]. \\nTừ đồng nghĩa: [từ] \\nTừ trái nghĩa: [từ]"
              }
            },
            "word_family_html": "Trình bày CHUYÊN SÂU Bằng HTML: Bảng Word Family của TỪ VỰNG GỐC. BẮT BUỘC BẢNG PHẢI CÓ ĐÚNG 3 CỘT: Loại từ (Noun/Verb/Adj/Adv) | Từ vựng tiếng Anh | Nghĩa tiếng Việt. Phía dưới bảng là danh sách các Từ đồng nghĩa & Trái nghĩa phổ biến (BẮT BUỘC phải dịch nghĩa tiếng Việt cho từng từ). BẮT BUỘC CHỈ dùng thẻ <table class='w-full text-sm text-left border-collapse'> với thẻ <thead>, <tbody>, các dòng <tr class='border-b border-slate-800'>, <td class='p-3'> và danh sách <ul class='list-disc pl-5 space-y-1 mt-4'> để hiển thị đẹp mắt. KHÔNG dùng định dạng markdown code block.",
            "trap_warning": "Cảnh báo bẫy ngữ cảnh."
          }
        }
      ]
    }
  ]
}

LƯU Ý QUAN TRỌNG VÀ NGHIÊM NGẶT:
1. Đối với wrong_options_grammar_analysis, loại trừ khóa tương ứng với correct_answer ra.
2. VIẾT TOÀN BỘ BẰNG TIẾNG VIỆT.
3. TRONG QUESTION_TEXT, CHỖ TRỐNG LÀ DẤU "___". TUYỆT ĐỐI KHÔNG ĐƯỢC VIẾT LỘ ĐÁP ÁN ĐÚNG.`;
        const userPrompt = `Hãy khởi tạo bộ đề TOEIC Từ Vựng chất lượng cao. NGÔN NGỮ GIẢI THÍCH LÀ TIẾNG VIỆT.`;

        tasksConfig.push({ systemPrompt, userPrompt, key: keysArray[keyIndex % numKeys], taskQCount });
        keyIndex++;
    }

    try {
        let results = [];
        let currentQ = 0;
        let lastErr = null;

        for (let i = 0; i < tasksConfig.length; i++) {
            currentQ += tasksConfig[i].taskQCount;
            const percent = Math.round((currentQ / qCount) * 100);
            updateLoadingProgress(`Giáo viên AI đang biên soạn đề thi (${percent}%)...`, percent);
            document.getElementById('loadingSubText').innerHTML = `Đang phân tích cấu trúc và xây dựng đáp án cặn kẽ (${currentQ}/${qCount} câu hỏi)...`;

            let success = false;
            for (let tryIdx = 0; tryIdx < keysArray.length; tryIdx++) {
                let globalIdx = parseInt(localStorage.getItem('toeic_api_key_index') || "0");
                localStorage.setItem('toeic_api_key_index', (globalIdx + 1).toString());
                let k = keysArray[globalIdx % keysArray.length];
                try {
                    const res = await callGeminiAPI(tasksConfig[i].systemPrompt, tasksConfig[i].userPrompt, k);
                    results.push(res);
                    success = true;
                    break;
                } catch (err) {
                    lastErr = err;
                    console.warn("Key thất bại, thử key khác...", err);
                }
            }

            if (!success) {
                console.error("Tất cả API Key đều thất bại ở lượt này.", lastErr);
                break;
            }
        }

        if (results.length === 0) {
            throw new Error("Tất cả API Key đều thất bại. Lỗi: " + (lastErr ? lastErr.message : "Quá tải"));
        }

        updateLoadingProgress(`Hoàn tất! Đang hiển thị giao diện...`, 100);

        let mergedData = { passages: [] };
        results.forEach(res => {
            if (res && res.passages) {
                mergedData.passages.push(...res.passages);
            }
        });

        let globalNum = 1;
        mergedData.passages.forEach(passage => {
            passage.questions.forEach(q => {
                q.question_number = globalNum++;
                if (q.question_text && q.question_text.includes('___')) {
                    let correctOptText = q.options[q.correct_answer];
                    if (correctOptText) {
                        correctOptText = correctOptText.trim();
                        const parts = q.question_text.split('___');
                        if (parts.length > 1) {
                            let afterBlank = parts[1].trim();
                            const escapedText = correctOptText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                            const regex = new RegExp(`^${escapedText}(?=[\\s,.!?;:]|$)`, 'i');
                            if (regex.test(afterBlank)) {
                                parts[1] = afterBlank.replace(regex, '').trim();
                                q.question_text = parts[0] + '___ ' + parts[1];
                            }
                        }
                    }
                }
            });
        });

        if (globalNum - 1 < qCount) {
            showNotice(`Chỉ tạo được ${globalNum - 1} câu hỏi do API quá tải.`);
        }

        setTimeout(() => {
            generateBtn.disabled = false;
            generateBtn.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> Tạo Đề Từ Vựng`;
            setupExamEnvironment(mergedData);
            turnOnSaveSessionToggle();
        }, 600);

    } catch (err) {
        console.error(err);
        alert("Lỗi kết nối AI: " + err.message);
        generateBtn.disabled = false;
        generateBtn.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> Tạo Đề Từ Vựng`;

        document.getElementById('loadingScreen').classList.add('hidden');
        document.getElementById('welcomeScreen').classList.remove('hidden');
    }
}

function updateLoadingProgress(stageText, percentage) {
    document.getElementById('loadingStage').innerText = stageText;
    document.getElementById('loadingProgress').style.width = `${percentage}%`;
}

/**
 * callGeminiAPI - Gọi API Gemini/Groq để sinh JSON (dùng cho đề thi).
 * Hỗ trợ retry 3 lần khi gặp 429 (rate limit), timeout 60s.
 * Sử dụng Balanced Bracket Extractor để parse JSON từ response.
 * @param {string} systemPrompt - Prompt hệ thống (vai trò AI)
 * @param {string} userPrompt - Prompt người dùng
 * @param {string} currentApiKey - API key hiện tại
 * @returns {Object} - JSON đã parse
 */
async function callGeminiAPI(systemPrompt, userPrompt, currentApiKey) {
    const selectedModel = document.getElementById('aiModelSelect').value;
    const isGroq = !selectedModel.includes('gemini'); // Phân biệt Gemini vs Groq

    let apiUrl;
    let payload;
    let headers = { 'Content-Type': 'application/json' };

    if (isGroq) {
        apiUrl = `https://api.groq.com/openai/v1/chat/completions`;
        headers['Authorization'] = `Bearer ${currentApiKey}`;
        payload = {
            model: selectedModel,
            messages: [
                { role: "system", content: `${systemPrompt}\n\nLƯU Ý QUAN TRỌNG: KẾT QUẢ BẮT BUỘC TRẢ VỀ JSON, KHÔNG KÈM VĂN BẢN NÀO KHÁC.` },
                { role: "user", content: userPrompt }
            ],
            max_tokens: 6000
        };
    } else {
        apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${currentApiKey}`;
        payload = {
            contents: [{ parts: [{ text: userPrompt }] }],
            systemInstruction: {
                parts: [{ text: systemPrompt }]
            },
            generationConfig: {
                responseMimeType: "application/json"
            }
        };
    }

    let res;
    let retries = 0;
    while (retries < 3) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000);
        try {
            res = await fetch(apiUrl, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(payload),
                signal: controller.signal
            });
        } catch (fetchErr) {
            clearTimeout(timeoutId);
            if (fetchErr.name === 'AbortError') {
                throw new Error('Kết nối bị timeout sau 60 giây. Vui lòng thử lại.');
            }
            throw fetchErr;
        }
        clearTimeout(timeoutId);

        if (res.status === 429) {
            const errorText = await res.text().catch(() => "");
            console.warn("429 Rate Limit Hit.", errorText);
            const match = errorText.match(/try again in ([\d.]+)s/i);
            let waitMs = (parseFloat(match ? match[1] : "10") + 1.5) * 1000;
            await new Promise(r => setTimeout(r, waitMs));
            retries++;
            continue;
        }

        if (!res.ok) {
            const errorText = await res.text().catch(() => "");
            throw new Error(`Mã lỗi ${res.status}: ${errorText}`);
        }
        break;
    }
    if (!res || !res.ok) {
        throw new Error(`Quá số lần thử lại do giới hạn 429 Rate Limit.`);
    }

    const data = await res.json();

    let textResponse = "";
    if (isGroq) {
        textResponse = data.choices?.[0]?.message?.content;
    } else {
        textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    }

    if (!textResponse) {
        throw new Error("EMPTY_RESPONSE");
    }

    let cleanJson = textResponse.trim();
    if (cleanJson.startsWith('```json')) cleanJson = cleanJson.substring(7);
    else if (cleanJson.startsWith('```')) cleanJson = cleanJson.substring(3);
    if (cleanJson.endsWith('```')) cleanJson = cleanJson.substring(0, cleanJson.length - 3);
    cleanJson = cleanJson.trim();

    const firstBrace = cleanJson.indexOf('{');
    if (firstBrace !== -1) {
        let balance = 0;
        let insideString = false;
        let escaped = false;
        for (let i = firstBrace; i < cleanJson.length; i++) {
            const char = cleanJson[i];
            if (escaped) { escaped = false; continue; }
            if (char === '\\') { escaped = true; continue; }
            if (char === '"') { insideString = !insideString; continue; }
            if (!insideString) {
                if (char === '{') balance++;
                else if (char === '}') {
                    balance--;
                    if (balance === 0) {
                        cleanJson = cleanJson.substring(firstBrace, i + 1);
                        break;
                    }
                }
            }
        }
    }

    cleanJson = cleanJson.replace(/,\s*([\]}])/g, '$1');

    try {
        return JSON.parse(cleanJson);
    } catch (jsonErr) {
        throw new Error("JSON_PARSE_ERROR. Nội dung trả về không đúng cấu trúc.");
    }
}

/**
 * setupExamEnvironment - Cài đặt giao diện thi sau khi AI trả về dữ liệu.
 * Flatten passages → flatQuestions, đánh số câu, chuyển sang #examContainer.
 */
function setupExamEnvironment(data) {
    flatQuestions = [];
    userAnswers = {};
    activeQuestionIndex = 0;

    let globalNum = 1;
    data.passages.forEach(passage => {
        passage.questions.forEach(q => {
            flatQuestions.push({
                ...q,
                globalIndex: globalNum++
            });
        });
    });

    if (flatQuestions.length === 0) {
        alert("Lỗi parse dữ liệu. Vui lòng thử lại.");
        return;
    }

    document.getElementById('welcomeScreen').classList.add('hidden');
    document.getElementById('flashcardContainer').classList.add('hidden');
    document.getElementById('quizContainer').classList.add('hidden');
    document.getElementById('fillContainer').classList.add('hidden');
    document.getElementById('loadingScreen').classList.add('hidden');
    document.getElementById('examContainer').classList.remove('hidden');

    buildNavigationGrid();
    renderActiveQuestion();
}

/** buildNavigationGrid - Tạo lưới nút chuyển câu hỏi trong đề thi (số 1, 2, 3...) */
function buildNavigationGrid() {
    const grid = document.getElementById('navGrid');
    grid.innerHTML = '';

    flatQuestions.forEach((q, idx) => {
        const btn = document.createElement('button');
        btn.id = `navBtn_${idx}`;
        btn.className = "w-8 h-8 rounded-lg border border-slate-700 hover:border-slate-500 bg-slate-800/60 font-semibold text-xs text-slate-300 flex items-center justify-center shrink-0 transition-all duration-150";
        btn.innerText = q.question_number || (idx + 1);
        btn.onclick = () => {
            activeQuestionIndex = idx;
            renderActiveQuestion();
        };
        grid.appendChild(btn);
    });
}

/** renderActiveQuestion - Render câu hỏi đang active lên giao diện thi */
function renderActiveQuestion() {
    if (activeQuestionIndex < 0 || activeQuestionIndex >= flatQuestions.length) return;
    const q = flatQuestions[activeQuestionIndex];

    document.getElementById('examBodyContainer').scrollTop = 0;

    document.getElementById('questionCounter').innerText = `Câu hỏi: ${activeQuestionIndex + 1} / ${flatQuestions.length}`;
    document.getElementById('activeQNum').innerText = q.question_number || (activeQuestionIndex + 1);
    document.getElementById('activeQText').innerText = q.question_text;

    document.getElementById('text_A').innerText = q.options.A || '';
    document.getElementById('text_B').innerText = q.options.B || '';
    document.getElementById('text_C').innerText = q.options.C || '';
    document.getElementById('text_D').innerText = q.options.D || '';

    resetOptionButtons();

    document.querySelectorAll('[id^="navBtn_"]').forEach(btn => {
        btn.classList.remove('ring-2', 'ring-brand-500', 'scale-110', 'border-brand-500', 'bg-brand-900/40', 'text-brand-400');
    });
    const activeNavBtn = document.getElementById(`navBtn_${activeQuestionIndex}`);
    if (activeNavBtn) {
        // If it's not answered yet, give it the default brand highlight, otherwise just ring it
        if (!userAnswers[activeQuestionIndex]) {
            activeNavBtn.classList.add('border-brand-500', 'bg-brand-900/40', 'text-brand-400');
        }
        activeNavBtn.classList.add('ring-2', 'ring-brand-500', 'scale-110');
        activeNavBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }

    if (userAnswers[activeQuestionIndex]) {
        displaySelectedAnswer(userAnswers[activeQuestionIndex]);
    } else {
        document.getElementById('explanationBoard').classList.add('hidden');
    }
}

function resetOptionButtons() {
    const keys = ['A', 'B', 'C', 'D'];
    keys.forEach(k => {
        const btn = document.getElementById(`optionBtn_${k}`);
        btn.disabled = false;
        btn.className = "option-btn border border-slate-800 bg-slate-950/40 hover:border-slate-600 px-5 py-4 rounded-xl text-left flex items-center gap-4 group transition-all duration-200";

        const span = btn.querySelector('span');
        span.className = "w-8 h-8 rounded-lg bg-slate-800 group-hover:bg-brand-500/20 group-hover:text-brand-400 flex items-center justify-center font-bold text-slate-400 transition-all shadow-inner font-mono text-sm shrink-0";
    });
}

function selectAnswer(ans) {
    if (userAnswers[activeQuestionIndex]) return;
    userAnswers[activeQuestionIndex] = ans;

    const q = flatQuestions[activeQuestionIndex];
    const isCorrect = (ans === q.correct_answer);

    const navBtn = document.getElementById(`navBtn_${activeQuestionIndex}`);
    if (navBtn) {
        navBtn.classList.remove('bg-slate-800/60', 'text-slate-300', 'border-slate-700', 'hover:border-slate-500', 'border-brand-500', 'bg-brand-900/40', 'text-brand-400');
        if (isCorrect) {
            navBtn.classList.add('bg-emerald-500', 'text-white', 'border-emerald-600', 'shadow-md', 'shadow-emerald-500/20');
        } else {
            navBtn.classList.add('bg-rose-500', 'text-white', 'border-rose-600', 'shadow-md', 'shadow-rose-500/20');
        }
    }

    displaySelectedAnswer(ans);
}

function displaySelectedAnswer(userAns) {
    const q = flatQuestions[activeQuestionIndex];
    const correctAns = q.correct_answer;

    const keys = ['A', 'B', 'C', 'D'];
    keys.forEach(k => {
        const btn = document.getElementById(`optionBtn_${k}`);
        btn.disabled = false;
        const indicator = btn.querySelector('span');

        if (k === correctAns) {
            btn.className = "option-btn border-2 border-emerald-500 bg-emerald-950/20 px-5 py-4 rounded-xl text-left flex items-center gap-4 transition-all duration-200";
            indicator.className = "w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold transition-all shadow-inner font-mono text-sm shrink-0";
        } else if (k === userAns) {
            btn.className = "option-btn border-2 border-rose-500 bg-rose-950/20 px-5 py-4 rounded-xl text-left flex items-center gap-4 transition-all duration-200";
            indicator.className = "w-8 h-8 rounded-lg bg-rose-500 text-white flex items-center justify-center font-bold transition-all shadow-inner font-mono text-sm shrink-0";
        } else {
            btn.className = "option-btn border border-slate-800/40 bg-slate-950/20 opacity-40 px-5 py-4 rounded-xl text-left flex items-center gap-4 transition-all duration-200";
            indicator.className = "w-8 h-8 rounded-lg bg-slate-800/40 flex items-center justify-center font-bold text-slate-500 transition-all font-mono text-sm shrink-0";
        }
    });

    renderTeacherAnalysis();
}

function navigateQuestion(dir) {
    if (dir === 'prev' && activeQuestionIndex > 0) {
        activeQuestionIndex--;
        renderActiveQuestion();
    } else if (dir === 'next' && activeQuestionIndex < flatQuestions.length - 1) {
        activeQuestionIndex++;
        renderActiveQuestion();
    }
}

/** renderTeacherAnalysis - Hiển bảng phân tích chi tiết của giáo viên AI */
function renderTeacherAnalysis() {
    const q = flatQuestions[activeQuestionIndex];
    const board = document.getElementById('explanationBoard');
    board.classList.remove('hidden');

    renderChatHistory();

    const deepContainer = document.getElementById('deepExplainContainer');
    const deepOutput = document.getElementById('deepExplainOutput');
    const deepBtn = document.getElementById('deepExplainBtn');

    deepBtn.disabled = false;
    deepBtn.innerHTML = `<i class="fa-solid fa-chalkboard-user"></i> Giảng Giải Sâu`;

    if (q.deep_explanation) {
        deepContainer.classList.remove('hidden');
        deepOutput.classList.remove('hidden');
        deepOutput.innerHTML = q.deep_explanation;
        deepBtn.innerHTML = `<i class="fa-solid fa-circle-check text-emerald-400"></i> Đã có giải thích sâu`;
    } else {
        deepContainer.classList.add('hidden');
        deepOutput.innerHTML = '';
    }

    document.getElementById('wordFamilyContainer').innerHTML = q.explanation.word_family_html || '<span class="text-slate-500 italic">Dữ liệu Word Family không có sẵn trong đề này. (Tính năng vừa cập nhật, vui lòng tạo đề mới để xem)</span>';

    document.getElementById('structureAnalysisBox').innerHTML = highlightSyntaxTokens(q.sentence_structure_analysis);
    let transText = q.vietnamese_translation || 'Chưa có bản dịch.';
    transText = transText.replace(/\\n/g, '<br>');
    document.getElementById('vietnameseTranslationBox').innerHTML = `<i class="fa-solid fa-language mr-2 text-indigo-400 text-lg align-middle"></i> <span class="leading-relaxed inline-block mt-1">${transText}</span>`;

    document.getElementById('grammarRule').innerText = q.explanation.grammar_rule || 'Từ Vựng';
    document.getElementById('grammarKeywords').innerText = q.explanation.keywords || 'Dựa vào ngữ cảnh';
    document.getElementById('whyCorrectExplanation').innerHTML = formatVocabExplanation(q.explanation.why_correct) || 'Không có mô tả chi tiết.';

    document.getElementById('trapWarningText').innerText = q.explanation.trap_warning || 'Chú ý từ vựng và chủ điểm ngữ cảnh.';

    const container = document.getElementById('wrongOptionsContainer');
    container.innerHTML = '';
    const wrongAnalysis = q.explanation.wrong_options_grammar_analysis || {};
    const correctKey = q.correct_answer;
    const wrongKeys = ['A', 'B', 'C', 'D'].filter(k => k !== correctKey);

    wrongKeys.forEach(k => {
        const optKey = `option_${k}`;
        const data = wrongAnalysis[optKey] || wrongAnalysis[k] || { nature: 'Từ vựng', why_faulty: 'Sai ngữ nghĩa' };
        const optValue = q.options[k] || '';

        const row = document.createElement('div');
        row.className = "py-3 flex flex-col md:flex-row md:items-start gap-2 text-sm";
        row.innerHTML = `
                    <div class="flex items-center gap-2 shrink-0 md:w-1/4">
                        <span class="w-6 h-6 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold font-mono text-xs flex items-center justify-center">${k}</span>
                        <span class="font-semibold text-slate-300 font-mono text-xs truncate max-w-[120px]" title="${optValue}">${optValue}</span>
                    </div>
                    <div class="flex-1 space-y-1">
                        <div class="text-xs text-indigo-400 font-semibold"><i class="fa-solid fa-microscope text-[10px]"></i> Bản chất: <span class="text-slate-300 font-normal italic">${data.nature}</span></div>
                        <p class="text-xs text-slate-400 leading-relaxed">${formatVocabExplanation(data.why_faulty)}</p>
                    </div>
                `;
        container.appendChild(row);
    });
}

/** formatVocabExplanation - Format text giải thích thành HTML đẹp với icon + màu */
function formatVocabExplanation(text) {
    if (!text) return '';
    let res = text.replace(/\\n/g, '<br>').replace(/\n/g, '<br>');
    res = res.replace(/(Dịch\s*nghĩa:)/gi, '<br><span class="text-indigo-300 font-semibold mt-1.5 inline-block"><i class="fa-solid fa-language mr-1 text-[10px]"></i>$1</span>');
    res = res.replace(/(Tại\s*sao\s*sai:|Sai\s*vì\b:?)/gi, '<br><span class="text-rose-400/90 font-semibold mt-1.5 inline-block"><i class="fa-solid fa-xmark mr-1 text-[10px]"></i>Sai vì: </span> ');
    res = res.replace(/(Ví\s*dụ:)/gi, '<br><span class="text-brand-300 font-semibold mt-1.5 inline-block"><i class="fa-regular fa-comment-dots mr-1 text-[10px]"></i>$1</span>');
    res = res.replace(/(Từ\s*đồng\s*nghĩa:)/gi, '<br><span class="text-emerald-400 font-semibold mt-1.5 inline-block"><i class="fa-solid fa-link text-[10px] mr-1"></i>$1</span>');
    res = res.replace(/(Từ\s*trái\s*nghĩa:)/gi, '<br><span class="text-amber-400 font-semibold mt-1.5 inline-block"><i class="fa-solid fa-link-slash text-[10px] mr-1"></i>$1</span>');
    res = res.replace(/^(<br>\s*)+/, '');
    res = res.replace(/(<br>\s*){2,}/g, '<br>');
    return res;
}

/** highlightSyntaxTokens - Thay thế [S], [V], [O], [M] thành badge màu trong phân tích cú pháp */
function highlightSyntaxTokens(str) {
    if (!str) return 'Không tìm thấy phân tích.';
    return str
        .replace(/\[S\]/g, '<span class="bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded font-bold text-xs mr-1 shadow-sm border border-blue-500/30">S</span>')
        .replace(/\[V\]/g, '<span class="bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold text-xs mr-1 shadow-sm border border-emerald-500/30">V</span>')
        .replace(/\[O\]/g, '<span class="bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-bold text-xs mr-1 shadow-sm border border-amber-500/30">O</span>')
        .replace(/\[M\]/g, '<span class="bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-bold text-xs mr-1 shadow-sm border border-purple-500/30">M</span>')
        .replace(/\n/g, '<br>');
}

window.singleRequestKeyIndex = window.singleRequestKeyIndex || 0;

/**
 * callGeminiAPIText - Gọi API trả về văn bản thuần (dùng cho giảng giải sâu, chat).
 * Tự xoay vòng API key khi gặp lỗi. Khác callGeminiAPI ở chỗ không parse JSON.
 * @param {string} overrideModel - Model tùy chọn (null = dùng model đang chọn)
 * @param {string} overrideKey - Key tùy chọn (null = xoay vòng tự động)
 */
async function callGeminiAPIText(systemPrompt, userPrompt, overrideModel = null, overrideKey = null) {
    const selectedModel = overrideModel || document.getElementById('aiModelSelect').value;
    const isGroq = !selectedModel.includes('gemini');
    const storageKey = isGroq ? 'toeic_ai_apikey_groq' : 'toeic_ai_apikey';
    const keysString = localStorage.getItem(storageKey) || apiKey || '';
    const keysArray = keysString.split(',').map(k => k.trim()).filter(k => k);

    if (keysArray.length === 0) throw new Error('Chưa có API Key.');

    let startIndex = 0;
    if (overrideKey) {
        const idx = keysArray.indexOf(overrideKey);
        if (idx !== -1) startIndex = idx;
    } else {
        startIndex = window.singleRequestKeyIndex % keysArray.length;
        window.singleRequestKeyIndex++;
    }

    let lastErr = null;

    for (let i = 0; i < keysArray.length; i++) {
        let currentKey = keysArray[(startIndex + i) % keysArray.length];
        let apiUrl, payload, headers = { 'Content-Type': 'application/json' };

        if (isGroq) {
            apiUrl = `https://api.groq.com/openai/v1/chat/completions`;
            headers['Authorization'] = `Bearer ${currentKey}`;
            payload = { model: selectedModel, messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }] };
            if (!selectedModel.includes('compound')) payload.max_tokens = 3000;
        } else {
            apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${currentKey}`;
            payload = { contents: [{ parts: [{ text: userPrompt }] }], systemInstruction: { parts: [{ text: systemPrompt }] } };
        }

        let res;
        let retries = 0;
        let success = false;

        while (retries < 3) {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 60000);
            try {
                res = await fetch(apiUrl, { method: 'POST', headers, body: JSON.stringify(payload), signal: controller.signal });
            } catch (fetchErr) {
                clearTimeout(timeoutId);
                if (fetchErr.name === 'AbortError') {
                    lastErr = new Error('Timeout');
                    break;
                }
                lastErr = fetchErr;
                retries++;
                continue;
            }
            clearTimeout(timeoutId);

            if (res.status === 429) {
                const errorText = await res.text().catch(() => "");
                console.warn("429 Rate Limit Hit.", errorText);
                const match = errorText.match(/try again in ([\d.]+)s/i);
                let waitMs = (parseFloat(match ? match[1] : "10") + 1.5) * 1000;
                await new Promise(r => setTimeout(r, waitMs));
                retries++;
                continue;
            }

            if (!res.ok) {
                lastErr = new Error(`API_ERROR_${res.status}`);
                break; // Server error -> move to next key
            }

            success = true;
            break;
        }

        if (success && res) {
            const data = await res.json();
            let textResponse = isGroq ? data.choices?.[0]?.message?.content : data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!textResponse) {
                lastErr = new Error("EMPTY_RESPONSE");
                continue; // Empty -> move to next key
            }
            return textResponse.replace(/```html/g, '').replace(/```/g, '').trim();
        }
    }

    throw lastErr || new Error("Tất cả API Key đều thất bại.");
}

async function requestDeepExplanation() {
    if (!apiKey) return alert("Vui lòng cấu hình API Key.");
    const q = flatQuestions[activeQuestionIndex];
    const btn = document.getElementById('deepExplainBtn');
    const container = document.getElementById('deepExplainContainer');
    const loading = document.getElementById('deepExplainLoading');
    const output = document.getElementById('deepExplainOutput');

    btn.disabled = true;
    btn.innerHTML = `<i class="fa-solid fa-circle-notch animate-spin"></i>...`;
    container.classList.remove('hidden');
    loading.classList.remove('hidden');
    output.classList.add('hidden');

    const systemPrompt = `Bạn là chuyên gia TOEIC. GIẢNG GIẢI CỰC KỲ SÂU SẮC cho câu hỏi.
1. VIẾT BẰNG TIẾNG VIỆT, HTML KÈM TAILWIND CSS. Không dùng markdown html.
2. Dùng template: <h4 class="text-lg font-bold text-brand-300 mt-4 mb-3 border-b border-slate-700 pb-2">...</h4>, Bảng <table>, <div class="bg-indigo-950/40 p-3 rounded-xl...">Ví dụ</div>.
Trình bày theo:
Mục 1: Mổ Xẻ Gốc Rễ Từ Vựng (Giải thích nghĩa, tại sao đúng/sai)
Mục 2: Bẫy ETS & Mẹo Nhớ Lâu`;

    const userPrompt = `Câu hỏi: ${q.question_text}\nA. ${q.options.A} | B. ${q.options.B} | C. ${q.options.C} | D. ${q.options.D}\nĐáp án đúng: ${q.correct_answer}\nBẮT BUỘC TRÌNH BÀY ĐẸP.`;

    try {
        const responseText = await callGeminiAPIText(systemPrompt, userPrompt);
        q.deep_explanation = responseText;
        loading.classList.add('hidden');
        let combinedHtml = '';
        if (q.family_grammar) combinedHtml += q.family_grammar + "<br><hr class='border-slate-800 my-6'><br>";
        combinedHtml += q.deep_explanation;
        output.innerHTML = combinedHtml;
        output.classList.remove('hidden');
        btn.innerHTML = `<i class="fa-solid fa-circle-check text-emerald-400"></i> Xong`;
    } catch (err) {
        loading.classList.add('hidden');
        output.innerHTML = `<div class="text-rose-400">Lỗi: ${err.message}</div>`;
        output.classList.remove('hidden');
        btn.disabled = false;
        btn.innerHTML = `Thử lại`;
    }
}

function renderChatHistory() {
    const q = flatQuestions[activeQuestionIndex];
    const chatBox = document.getElementById('chatHistory');
    if (!chatBox) return;
    chatBox.innerHTML = '';

    if (!q.chat_history || q.chat_history.length === 0) {
        chatBox.innerHTML = `<div class="flex gap-3 text-slate-400 text-xs italic"><i class="fa-solid fa-robot mt-1 text-brand-400"></i><span>Bạn có thắc mắc gì về câu hỏi này? Hãy hỏi tôi nhé!</span></div>`;
        return;
    }

    q.chat_history.forEach(msg => {
        const div = document.createElement('div');
        div.className = msg.role === 'user' ? "flex justify-end" : "flex justify-start";
        const inner = document.createElement('div');
        inner.className = msg.role === 'user' ? "bg-brand-600/20 border border-brand-500/30 text-slate-200 p-3 rounded-xl rounded-tr-sm max-w-[85%] whitespace-pre-wrap" : "bg-slate-800/60 border border-slate-700 text-slate-300 p-3 rounded-xl rounded-tl-sm max-w-[95%] leading-relaxed whitespace-pre-wrap";
        inner.innerHTML = msg.content;
        div.appendChild(inner);
        chatBox.appendChild(div);
    });
    chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendChatMessage() {
    const inputField = document.getElementById('chatInput');
    const btn = document.getElementById('sendChatBtn');
    const message = inputField.value.trim();
    if (!message) return;
    if (!apiKey) return alert("Vui lòng cấu hình API Key.");

    const q = flatQuestions[activeQuestionIndex];
    if (!q.chat_history) q.chat_history = [];
    q.chat_history.push({ role: 'user', content: message });
    inputField.value = '';
    renderChatHistory();

    inputField.disabled = true;
    btn.disabled = true;
    btn.innerHTML = `<i class="fa-solid fa-spinner animate-spin"></i>`;

    const chatBox = document.getElementById('chatHistory');
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'chatLoadingIndic';
    loadingDiv.className = "flex justify-start text-slate-500 text-xs italic";
    loadingDiv.innerHTML = `<i class="fa-solid fa-circle-notch animate-spin mr-2 mt-0.5 text-brand-400"></i> Giáo viên đang suy nghĩ...`;
    chatBox.appendChild(loadingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    const systemPrompt = "Bạn là Giáo viên AI dạy TOEIC. Trả lời BẰNG TIẾNG VIỆT, giải thích dễ hiểu. Dùng HTML cơ bản <b>, <i>, <br>, <ul><li>. KHÔNG dùng markdown.";
    let convo = q.chat_history.map(m => (m.role === 'user' ? 'Học viên: ' : 'Giáo viên AI: ') + m.content).join('\n');
    const userPrompt = "Câu hỏi: " + q.question_text + "\nĐáp án đúng: " + q.correct_answer + "\nLỊCH SỬ CHAT:\n" + convo + "\nTrả lời thắc mắc mới nhất.";

    const chatModel = document.getElementById('chatModelSelect').value;
    try {
        const responseText = await callGeminiAPIText(systemPrompt, userPrompt, chatModel);
        q.chat_history.push({ role: 'assistant', content: responseText });
    } catch (err) {
        q.chat_history.push({ role: 'assistant', content: '<span class="text-rose-400">Lỗi: ' + err.message + '</span>' });
    }

    document.getElementById('chatLoadingIndic')?.remove();
    renderChatHistory();
    inputField.disabled = false;
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Gửi';
    inputField.focus();
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const icon = document.getElementById('sidebarToggleIcon');

    if (sidebar.classList.contains('w-80')) {
        sidebar.classList.remove('w-80', 'border-r');
        sidebar.classList.add('w-0', 'overflow-hidden', 'border-transparent');
        icon.classList.remove('fa-chevron-left');
        icon.classList.add('fa-chevron-right');
    } else {
        sidebar.classList.add('w-80', 'border-r');
        sidebar.classList.remove('w-0', 'overflow-hidden', 'border-transparent');
        icon.classList.remove('fa-chevron-right');
        icon.classList.add('fa-chevron-left');
    }
}

/* ============================================================================
 * WORD CLICK & TỪ ĐIỂN POPUP
 * Click từ trong câu ví dụ để đọc phát âm, right-click để tra từ.
 * Popup hiện: phiên âm IPA + nghĩa tiếng Việt + nút "Thêm vào danh sách".
 * ============================================================================ */

/** speakText - Đọc văn bản bằng Web Speech API, ưu tiên voice Google/Natural */
function speakText(text, lang = 'en-US') {
    playSpeechRobust(text, lang, 1.0);
}

function handleWordClick(event, word) {
    event.stopPropagation();
    const enEl = document.getElementById('fcExEn');
    if (enEl.classList.contains('blur-md')) {
        revealExampleEn(event);
        return;
    }
    speakText(word, 'en-US');
}

function handleWordRightClick(event, word) {
    event.preventDefault();
    event.stopPropagation();
    const enEl = document.getElementById('fcExEn');
    if (enEl.classList.contains('blur-md')) {
        return;
    }
    let contextVi = "";
    if (currentFlashcards && currentFlashcards[flashcardIndex] && currentFlashcards[flashcardIndex].aiExample) {
        contextVi = currentFlashcards[flashcardIndex].aiExample.vi;
    }
    showWordPopup(event.clientX, event.clientY, word, contextVi);
}

function handleExtraRightClick(event, word) {
    event.preventDefault();
    event.stopPropagation();
    let contextVi = "";
    const flashcardContainer = document.getElementById('flashcardContainer');
    const quizContainer = document.getElementById('quizContainer');

    if (flashcardContainer && !flashcardContainer.classList.contains('hidden') && currentFlashcards && currentFlashcards[flashcardIndex] && currentFlashcards[flashcardIndex].aiExample) {
        contextVi = currentFlashcards[flashcardIndex].aiExample.vi;
    } else if (quizContainer && !quizContainer.classList.contains('hidden') && currentQuizList && currentQuizList[currentQuizIndex] && currentQuizList[currentQuizIndex].aiExample) {
        contextVi = currentQuizList[currentQuizIndex].aiExample.vi;
    }
    showWordPopup(event.clientX, event.clientY, word, contextVi);
}

/**
 * showWordPopup - Hiển popup tra từ tại vị trí (x, y).
 * Tự tra phiên âm (Dictionary API) + nghĩa (Google Translate).
 * Sắp xếp nghĩa theo ngữ cảnh câu ví dụ tiếng Việt (contextVi).
 */
async function showWordPopup(x, y, word, contextVi) {
    const popup = document.getElementById('wordPopup');
    const wordEl = document.getElementById('wpWord');
    const phoneticEl = document.getElementById('wpPhonetic');
    const meaningEl = document.getElementById('wpMeaning');
    const addBtn = document.getElementById('wpAddBtn');

    word = word.toLowerCase();
    wordEl.innerText = word;
    if (phoneticEl) {
        phoneticEl.classList.add('hidden');
        phoneticEl.innerText = '';
    }
    meaningEl.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Đang dịch...';

    popup.style.left = `${x}px`;
    popup.style.top = `${y + 10}px`;
    popup.classList.remove('hidden');

    const rect = popup.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
        popup.style.left = `${window.innerWidth - rect.width - 10}px`;
    }
    if (rect.bottom > window.innerHeight) {
        popup.style.top = `${y - rect.height - 10}px`;
    }

    addBtn.onclick = () => {
        addWordToList(word, meaningEl.innerText);
    };

    // Fetch phonetic in background
    fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`)
        .then(r => r.json())
        .then(d => {
            if (d && d[0] && d[0].phonetics) {
                let phon = d[0].phonetics.find(p => p.text);
                if (!phon && d[0].phonetic) {
                    phon = { text: d[0].phonetic };
                }
                if (phon && phoneticEl) {
                    phoneticEl.innerText = phon.text;
                    phoneticEl.classList.remove('hidden');
                }
            }
        }).catch(e => { });

    try {
        const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&dt=bd&q=${encodeURIComponent(word)}`);
        const data = await res.json();

        let meanings = [];
        if (data[1] && Array.isArray(data[1])) {
            for (let pos of data[1]) {
                if (pos[1] && Array.isArray(pos[1])) {
                    meanings = meanings.concat(pos[1]);
                }
            }
        }
        if (meanings.length === 0 && data[0] && data[0][0] && data[0][0][0]) {
            meanings.push(data[0][0][0].trim());
        }

        meanings = [...new Set(meanings.map(m => m.toLowerCase().trim()))];

        if (contextVi && meanings.length > 1) {
            const ctxLower = contextVi.toLowerCase();
            meanings.sort((a, b) => {
                let scoreA = 0;
                let scoreB = 0;

                if (ctxLower.includes(a)) scoreA += 100;
                if (ctxLower.includes(b)) scoreB += 100;

                const wordsA = a.split(' ').filter(w => w.length > 1);
                for (let w of wordsA) {
                    if (ctxLower.includes(w)) scoreA += 10;
                }

                const wordsB = b.split(' ').filter(w => w.length > 1);
                for (let w of wordsB) {
                    if (ctxLower.includes(w)) scoreB += 10;
                }

                return scoreB - scoreA;
            });
        }

        if (meanings.length > 0) {
            meaningEl.innerText = meanings.slice(0, 4).join(', ');
        } else {
            throw new Error("Không có kết quả");
        }
    } catch (e) {
        meaningEl.innerText = "Lỗi dịch: " + e.message;
    }
}

function closeWordPopup() {
    const popup = document.getElementById('wordPopup');
    if (popup) popup.classList.add('hidden');
}

document.addEventListener('click', (e) => {
    const popup = document.getElementById('wordPopup');
    if (popup && !popup.classList.contains('hidden') && !popup.contains(e.target)) {
        closeWordPopup();
    }
});

/** addWordToList - Thêm từ mới vào textarea + localStorage + currentFlashcards */
function addWordToList(word, meaning) {
    const textarea = document.getElementById('vocabInput');
    let rawText = textarea.value.trim();
    if (rawText) {
        rawText += `\n${word} - ${meaning}`;
    } else {
        rawText = `${word} - ${meaning}`;
    }
    textarea.value = rawText;
    localStorage.setItem('toeic_vocab_list', rawText);

    // Re-parse
    parseVocab(false);

    // Add to current flashcards if not exists
    const exists = currentFlashcards.find(item => item.word === word);
    if (!exists) {
        currentFlashcards.push({ word: word, meaning: meaning, isLearned: false });
    }

    const addBtn = document.getElementById('wpAddBtn');
    addBtn.innerHTML = '<i class="fa-solid fa-check"></i> Đã thêm!';
    addBtn.classList.replace('bg-brand-600', 'bg-emerald-600');
    addBtn.classList.replace('hover:bg-brand-500', 'hover:bg-emerald-500');

    setTimeout(() => {
        closeWordPopup();
        setTimeout(() => {
            addBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Thêm vào danh sách';
            addBtn.classList.replace('bg-emerald-600', 'bg-brand-600');
            addBtn.classList.replace('hover:bg-emerald-500', 'hover:bg-brand-500');
        }, 300);
    }, 1000);
}

/* ============================================================================
 * CHẾ ĐỘ TRẮc NGHIỆM (QUIZ MODE)
 * Người dùng được hỏi từ vựng với 4 lựa chọn (3 sai + 1 đúng).
 * Hỗ trợ 2 hướng: Hỏi Việt → chọn Anh, hoặc hỏi Anh → chọn Việt.
 * Hiển thị AI details (word family, synonyms, homophones) sau khi trả lời.
 * ============================================================================ */

/** Mảng các câu nói động viên khi trả lời sai */
const quizEncouragingQuotes = [
    "Học tài thi phận, lần này do 'phận' thôi! 🤣",
    "Học từ vựng như marathon, đi chậm nhưng chắc! 🏃‍♂️",
    "Sai lầm hôm nay, điểm 10 ngày mai! 💯",
    "Mỗi lỗi sai là một viên gạch xây nên sự thông thái! 🧱",
    "Trúng thì vui, trật thì học, đường nào cũng lời! 🎯",
    "Không có người thất bại, chỉ có người chưa thành công! 🌟",
    "Bút sa gà chết, nhưng ở đây sa thì mình sửa lại! 🐔",
    "Chắc đang mải nhớ crush nên chọn nhầm chứ gì! 🫣",
    "Tiếng Anh là một nghệ thuật, người làm sai là một... nghệ sĩ! 🎨",
    "Năng lượng vũ trụ nói rằng câu tiếp theo bạn sẽ đúng! 🌌",
    "Sai thì sửa, chữ nào khó quá thì mình học thêm! 🛠️",
    "Mỗi từ vựng mới là một người bạn mới, làm quen lại nhé! 🤝",
    "Đúng thì nở mày nở mặt, sai thì nở thêm kiến thức! 😆",
    "Thêm một lỗi, bớt một lần quên! 🧩",
    "Sai ít thì học ít, sai nhiều thì học nhiều! 😂",
    "Đúng thì cộng điểm, sai thì cộng kinh nghiệm! 📈",
    "Sai một câu, khôn thêm một chút! 💡",
    "Muốn nhớ lâu thì phải gặp nhau nhiều lần! 🔄",
    "Kiến tha lâu cũng đầy tổ, học lâu cũng đầy đầu! 🐜",
    "Nước chảy đá mòn, chăm học sẽ giỏi! 💧",
    "Lửa thử vàng, gian nan thử sức! 🔥",
    "Cần cù bù thông minh, kiên trì bù điểm số! 🤓",
    "Có chí thì nên, có quên thì học lại! 🧠",
    "Muốn biết phải hỏi, muốn giỏi phải học! 🙋‍♂️",
    "Muốn sang thì bắc cầu kiều, muốn điểm cao thì chăm học nhiều! 🌉",
    "Ngọc không mài không sáng, người không học không giỏi! 💎",
    "Có thực mới vực được đạo, có học mới vực được điểm! 🍚",
    "Có học có hành, điểm lành sẽ tới! 🌟",
    "Cần cù bù thông minh, chăm ôn bù điểm số! 🤓",
    "Đi đâu mà vội mà vàng, học xong rồi hẵng vội vàng đi chơi! 🏃‍♂️"
];

let currentQuizList = [];        // Mảng từ vựng đang quiz (shuffled)
let currentQuizIndex = 0;        // Vị trí câu hiện tại
let currentQuizCorrectOptionIndex = -1; // Index đáp án đúng trong 4 options
let isQuizAnswered = false;      // Đã trả lời câu hiện tại?
let isQuizAutoPlay = false;      // Tự động đọc từ sau khi trả lời?
let quizMode = localStorage.getItem('toeic_quiz_mode') || 'vi_to_en'; // Chiều hỏi
let availableQuotes = [];        // Pool câu nói động viên (tránh lặp)

function toggleQuizMode() {
    quizMode = quizMode === 'vi_to_en' ? 'en_to_vi' : 'vi_to_en';
    localStorage.setItem('toeic_quiz_mode', quizMode);
    const modeText = document.getElementById('quizModeText');
    if (modeText) modeText.innerText = quizMode === 'vi_to_en' ? "Hỏi Tiếng Việt" : "Hỏi Tiếng Anh";
    currentQuizList.forEach(w => w.quizState = null);
    isQuizAnswered = false;
    loadQuizQuestion();
}

function toggleQuizAutoPlay() {
    isQuizAutoPlay = !isQuizAutoPlay;
    const btn = document.getElementById('quizAutoPlayBtn');
    const icon = document.getElementById('quizAutoPlayIcon');

    if (isQuizAutoPlay) {
        btn.classList.remove('text-slate-400', 'bg-slate-800', 'hover:bg-slate-700');
        btn.classList.add('text-indigo-400', 'bg-indigo-900/20', 'border-indigo-500/30', 'hover:bg-indigo-900/40', 'active-toggle');
        icon.className = 'fa-solid fa-volume-high';
    } else {
        btn.classList.remove('text-indigo-400', 'bg-indigo-900/20', 'border-indigo-500/30', 'hover:bg-indigo-900/40', 'active-toggle');
        btn.classList.add('text-slate-400', 'bg-slate-800', 'hover:bg-slate-700');
        icon.className = 'fa-solid fa-volume-xmark';
        window.speechSynthesis.cancel();
    }
}

// =====================================================================
// [QUIZ MODE] startQuizMode
// MỤC ĐÍCH: Chế độ trắc nghiệm tự tạo bằng các từ vựng đang có.
// CÁCH HOẠT ĐỘNG:
// - Yêu cầu danh sách phải có >= 4 từ để có thể tạo các đáp án nhiễu (distractors).
// - Nếu tick "Lưu tiến độ", ứng dụng có thể khôi phục lại mảng câu hỏi đang làm dở.
// - Trộn (shuffle) lại mảng currentQuizList và chuyển sang màn #quizContainer.
// =====================================================================
function startQuizMode() {
    if (parsedVocabList.length < 4) {
        alert("Bạn cần ít nhất 4 từ vựng trong danh sách để sử dụng chế độ Học!");
        return;
    }

    let sourceList = parsedVocabList;
    const onlyStarred = document.getElementById('onlyStarredToggle') && !document.getElementById('onlyStarredToggle').checked;
    if (onlyStarred) {
        sourceList = getStarredWords();
        if (sourceList.length < 4) {
            alert("Bạn cần ít nhất 4 từ được đánh dấu sao (hoặc hãy tắt 'Lọc sao' đi).");
            return;
        }
    }

    const saveSessionToggle = document.getElementById('saveSessionToggle');
    let shouldResume = saveSessionToggle && saveSessionToggle.checked && typeof currentQuizList !== 'undefined' && currentQuizList.length > 0;

    if (shouldResume) {
        if (sourceList.length !== currentQuizList.length) {
            shouldResume = false;
        } else {
            const sourceWords = sourceList.map(w => w.word).sort().join(',');
            const currentWords = currentQuizList.map(w => w.word).sort().join(',');
            if (sourceWords !== currentWords) {
                shouldResume = false;
            }
        }
    }

    if (shouldResume) {
        document.getElementById('welcomeScreen').classList.add('hidden');
        document.getElementById('loadingScreen').classList.add('hidden');
        document.getElementById('examContainer').classList.add('hidden');
        document.getElementById('flashcardContainer').classList.add('hidden');
        document.getElementById('fillContainer').classList.add('hidden');

        // Safeguard: Nếu tất cả các câu đều đã được trả lời (do lỗi cũ lưu lại) -> Tự động reset
        if (currentQuizList.length > 0 && currentQuizList.every(w => w.quizState && w.quizState.answered)) {
            currentQuizList.forEach(w => delete w.quizState);
            currentQuizIndex = 0;
            saveSessionForCurrentDifficulty();
        }

        document.getElementById('quizContainer').classList.remove('hidden');
        document.addEventListener('keydown', handleQuizKeydown);
        loadQuizQuestion();
        return;
    }

    currentQuizList = [...sourceList];

    // Attach aiCache so Quiz mode always has AI details if they were ever generated
    let aiCache = {};
    try { aiCache = JSON.parse(localStorage.getItem('toeic_ai_cache') || "{}"); } catch (e) { }
    currentQuizList.forEach(w => {
        if (!w.aiExample) {
            const newCacheKey = `${w.word.toLowerCase()}_${w.meaning.toLowerCase().replace(/\s+/g, '')}_${aiDifficultyLevel}`;
            const oldCacheKey = `${w.word.toLowerCase()}_${aiDifficultyLevel}`;
            let cacheEntry = aiCache[newCacheKey] || aiCache[oldCacheKey];
            if (!cacheEntry) {
                const legacyNewCacheKey = `${w.word.toLowerCase()}_${w.meaning.toLowerCase().replace(/\s+/g, '')}`;
                const legacyOldCacheKey = w.word.toLowerCase();
                cacheEntry = aiCache[legacyNewCacheKey] || aiCache[legacyOldCacheKey];
            }
            if (cacheEntry) {
                w.aiExample = cacheEntry;
            }
        }
    });

    // Xóa state cũ nếu bắt đầu lượt mới
    currentQuizList.forEach(w => delete w.quizState);

    // Shuffle the quiz list
    for (let i = currentQuizList.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [currentQuizList[i], currentQuizList[j]] = [currentQuizList[j], currentQuizList[i]];
    }

    currentQuizIndex = 0;
    saveSessionForCurrentDifficulty();

    const modeText = document.getElementById('quizModeText');
    if (modeText) modeText.innerText = quizMode === 'vi_to_en' ? "Hỏi Tiếng Việt" : "Hỏi Tiếng Anh";

    document.getElementById('welcomeScreen').classList.add('hidden');
    document.getElementById('loadingScreen').classList.add('hidden');
    document.getElementById('examContainer').classList.add('hidden');
    document.getElementById('flashcardContainer').classList.add('hidden');
    document.getElementById('fillContainer').classList.add('hidden');
    document.getElementById('quizContainer').classList.remove('hidden');

    document.addEventListener('keydown', handleQuizKeydown);

    loadQuizQuestion();
}

function exitQuizMode() {
    document.getElementById('quizContainer').classList.add('hidden');
    document.getElementById('welcomeScreen').classList.remove('hidden');
    document.removeEventListener('keydown', handleQuizKeydown);
}

function appendGoogleTranslationToQuiz(wordObj, qEl) {
    if (!wordObj.googleTranslation || !Array.isArray(wordObj.googleTranslation)) return;
    const userMeaning = wordObj.meaning.toLowerCase().trim();
    const filtered = wordObj.googleTranslation.filter(gTrans => {
        const g = gTrans.toLowerCase().trim();
        return !userMeaning.includes(g) && !g.includes(userMeaning);
    });

    if (filtered.length > 0) {
        qEl.innerHTML = wordObj.meaning + `<span class="text-sky-400 font-normal quiz-google-meaning text-[2rem] ml-2">, ${filtered.join(', ')}</span>`;
    }
}

function loadQuizQuestion() {
    if (currentQuizIndex >= currentQuizList.length) {
        currentQuizIndex = 0;
        // Vòng lại từ đầu -> xóa state cũ để chơi lại
        currentQuizList.forEach(w => delete w.quizState);
        saveSessionForCurrentDifficulty();
    }
    if (currentQuizIndex < 0) {
        currentQuizIndex = 0;
    }

    isQuizAnswered = false;
    document.getElementById('quizCounter').innerText = `${currentQuizIndex + 1} / ${currentQuizList.length}`;

    const prevBtn = document.getElementById('quizPrevBtn');
    const nextBtn = document.getElementById('quizNextBtn');
    if (prevBtn) prevBtn.disabled = currentQuizIndex === 0;
    if (nextBtn) nextBtn.disabled = currentQuizIndex >= currentQuizList.length - 1;

    const currentWord = currentQuizList[currentQuizIndex];
    const qEl = document.getElementById('quizQuestion');
    if (quizMode === 'vi_to_en') {
        qEl.innerText = currentWord.meaning;

        if (currentWord.googleTranslation === undefined) {
            const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&dt=bd&q=${encodeURIComponent(currentWord.word)}`;
            fetch(url).then(res => res.json()).then(data => {
                let meanings = [];
                if (data[1] && Array.isArray(data[1])) {
                    for (let pos of data[1]) {
                        if (pos[1] && Array.isArray(pos[1])) {
                            meanings = meanings.concat(pos[1]);
                        }
                    }
                }
                if (meanings.length === 0 && data[0] && data[0][0] && data[0][0][0]) {
                    meanings.push(data[0][0][0].trim());
                }
                meanings = [...new Set(meanings.map(m => m.toLowerCase().trim()))];

                if (meanings.length > 0) {
                    currentWord.googleTranslation = meanings.slice(0, 2);
                    appendGoogleTranslationToQuiz(currentWord, qEl);
                } else {
                    currentWord.googleTranslation = null;
                }
            }).catch(e => {
                currentWord.googleTranslation = null;
            });
        } else {
            appendGoogleTranslationToQuiz(currentWord, qEl);
        }
    } else {
        qEl.innerHTML = currentWord.word;
    }

    if (!currentWord.quizState) {
        let availableDistractors = parsedVocabList.filter(w =>
            w.word !== currentWord.word &&
            w.meaning.trim().toLowerCase() !== currentWord.meaning.trim().toLowerCase()
        );

        for (let i = availableDistractors.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [availableDistractors[i], availableDistractors[j]] = [availableDistractors[j], availableDistractors[i]];
        }

        let wrongOptions = [];
        let seenDisplayTexts = new Set();

        const correctDisplayText = quizMode === 'vi_to_en' ? currentWord.word : currentWord.meaning;
        seenDisplayTexts.add(correctDisplayText.trim().toLowerCase());

        for (let w of availableDistractors) {
            if (wrongOptions.length >= 3) break;
            const displayText = quizMode === 'vi_to_en' ? w.word : w.meaning;
            const normalizedText = displayText.trim().toLowerCase();
            if (!seenDisplayTexts.has(normalizedText)) {
                seenDisplayTexts.add(normalizedText);
                wrongOptions.push(w);
            }
        }

        if (wrongOptions.length < 3) {
            const usedIds = new Set(wrongOptions.map(w => w.word));
            usedIds.add(currentWord.word);
            for (let w of parsedVocabList) {
                if (wrongOptions.length >= 3) break;
                if (!usedIds.has(w.word)) {
                    wrongOptions.push(w);
                    usedIds.add(w.word);
                }
            }
        }

        let options = [...wrongOptions, currentWord];
        for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]];
        }

        currentWord.quizState = {
            // Đã sửa lỗi: Cắt đứt vòng lặp tham chiếu chéo (circular reference) 
            // gây lỗi đứng máy khi bấm "Tiếp tục" (do lỗi khi gọi JSON.stringify lưu tiến độ).
            options: options.map(o => ({ word: o.word, meaning: o.meaning })),
            correctIndex: options.findIndex(o => o.word === currentWord.word),
            answered: false,
            selectedIndex: -1
        };
    }

    const state = currentWord.quizState;
    currentQuizCorrectOptionIndex = state.correctIndex;
    isQuizAnswered = state.answered;

    const grid = document.getElementById('quizOptionsGrid');
    grid.innerHTML = '';

    state.options.forEach((opt, index) => {
        const optText = quizMode === 'vi_to_en' ? opt.word : opt.meaning;
        grid.innerHTML += `
                    <button onclick="selectQuizAnswer(${index})" id="quizOpt_${index}"
                        class="quiz-opt-btn border border-slate-700 bg-slate-800/80 hover:bg-slate-700 hover:border-slate-500 px-6 py-5 rounded-xl text-left flex items-center gap-4 transition-all duration-200 shadow-sm relative overflow-hidden group">
                        <span id="quizOptIcon_${index}" class="w-8 h-8 rounded-md bg-slate-700 text-slate-400 group-hover:text-white flex items-center justify-center font-bold text-sm shrink-0 transition-colors">
                            ${index + 1}
                        </span>
                        <span id="quizOptText_${index}" class="text-slate-300 font-medium text-lg">${optText}</span>
                    </button>
                `;
    });

    document.getElementById('quizFeedbackMsg').classList.remove('opacity-100');
    document.getElementById('quizFeedbackMsg').classList.add('opacity-0');
    document.getElementById('quizContinueHint').classList.remove('opacity-100');
    document.getElementById('quizContinueHint').classList.add('opacity-0');
    document.getElementById('quizContinueBtn').classList.add('hidden');

    // Hide AI details
    if (document.getElementById('quizAiDetails')) {
        document.getElementById('quizAiDetails').classList.add('hidden');
        document.getElementById('quizAiFamily').classList.add('hidden');
        document.getElementById('quizAiSynonyms').classList.add('hidden');
        const homBlock = document.getElementById('quizAiHomophones');
        if (homBlock) homBlock.classList.add('hidden');
        const exBlock = document.getElementById('quizAiExample');
        if (exBlock) exBlock.classList.add('hidden');
    }

    if (state.answered) {
        isQuizAnswered = false; // Tạm thời cho phép select chạy
        selectQuizAnswer(state.selectedIndex, true);
    }
}

/**
 * selectQuizAnswer - Xử lý khi người dùng chọn đáp án quiz.
 * Highlight đáp án đúng (xanh) + sai (đỏ), hiển AI details nếu có.
 * @param {number} selectedIndex - Index đáp án được chọn (0-3)
 * @param {boolean} isRestore - true nếu đang khôi phục state cũ
 */
function selectQuizAnswer(selectedIndex, isRestore = false) {
    if (isQuizAnswered) return;
    isQuizAnswered = true;

    const currentWord = currentQuizList[currentQuizIndex];
    if (!isRestore && currentWord && currentWord.quizState) {
        currentWord.quizState.answered = true;
        currentWord.quizState.selectedIndex = selectedIndex;
    }

    const isCorrect = selectedIndex === currentQuizCorrectOptionIndex;

    const selectedBtn = document.getElementById(`quizOpt_${selectedIndex}`);
    const selectedIcon = document.getElementById(`quizOptIcon_${selectedIndex}`);
    const selectedText = document.getElementById(`quizOptText_${selectedIndex}`);

    const correctBtn = document.getElementById(`quizOpt_${currentQuizCorrectOptionIndex}`);
    const correctIcon = document.getElementById(`quizOptIcon_${currentQuizCorrectOptionIndex}`);
    const correctText = document.getElementById(`quizOptText_${currentQuizCorrectOptionIndex}`);

    const allBtns = document.querySelectorAll('.quiz-opt-btn');
    allBtns.forEach(btn => {
        btn.classList.remove('hover:bg-slate-700', 'hover:border-slate-500');
    });

    // Hiển thị thêm nghĩa (hoặc từ tiếng Anh) cho TẤT CẢ các đáp án sau khi đã chọn
    if (currentWord && currentWord.quizState && currentWord.quizState.options) {
        currentWord.quizState.options.forEach((opt, idx) => {
            const textEl = document.getElementById(`quizOptText_${idx}`);
            if (textEl && !textEl.innerHTML.includes('quiz-reveal-meaning')) {
                const hintText = quizMode === 'vi_to_en' ? opt.meaning : opt.word;
                textEl.innerHTML += ` <span class="quiz-reveal-meaning opacity-75 text-[0.9em] ml-2 font-normal italic">(${hintText})</span>`;
            }
        });
    }

    // Correct Option
    correctBtn.classList.remove('border-slate-700', 'bg-slate-800/80');
    correctBtn.classList.add('border-emerald-500', 'border-2', 'bg-emerald-500/10');
    correctIcon.innerHTML = '<i class="fa-solid fa-check"></i>';
    correctIcon.classList.remove('bg-slate-700', 'text-slate-400', 'group-hover:text-white');
    correctIcon.classList.add('bg-transparent', 'text-emerald-500', 'text-xl');
    correctText.classList.remove('text-slate-300');
    correctText.classList.add('text-slate-100');

    const feedback = document.getElementById('quizFeedbackMsg');
    feedback.classList.remove('opacity-0', 'text-orange-400', 'text-emerald-400');
    feedback.classList.add('opacity-100');

    if (!isCorrect) {
        // Wrong Option
        selectedBtn.classList.remove('border-slate-700', 'bg-slate-800/80');
        selectedBtn.classList.add('border-orange-500', 'border-2', 'bg-slate-800');
        selectedIcon.innerHTML = '<i class="fa-solid fa-xmark"></i>';
        selectedIcon.classList.remove('bg-slate-700', 'text-slate-400', 'group-hover:text-white');
        selectedIcon.classList.add('bg-transparent', 'text-orange-500', 'text-xl');
        selectedText.classList.remove('text-slate-300');
        selectedText.classList.add('text-slate-100');

        if (availableQuotes.length === 0) {
            availableQuotes = [...quizEncouragingQuotes];
        }
        const quoteIndex = Math.floor(Math.random() * availableQuotes.length);
        const randomQuote = availableQuotes[quoteIndex];
        availableQuotes.splice(quoteIndex, 1);

        feedback.innerText = randomQuote;
        feedback.classList.add('text-orange-400');

        // Dim other unselected buttons
        allBtns.forEach((btn, idx) => {
            if (idx !== selectedIndex && idx !== currentQuizCorrectOptionIndex) {
                btn.classList.add('opacity-40');
            }
        });
    } else {
        feedback.innerText = "Chính xác!";
        feedback.classList.add('text-emerald-400');

        allBtns.forEach((btn, idx) => {
            if (idx !== currentQuizCorrectOptionIndex) {
                btn.classList.add('opacity-40');
            }
        });
    }

    // Show AI details if available
    const correctWord = currentQuizList[currentQuizIndex];
    if (correctWord.aiExample) {
        const ex = correctWord.aiExample;

        // [PATCH] Kế thừa chéo Family/Collocation (Để fix lỗi thiếu dữ liệu do Resume Session cũ)
        if (!ex.family || ex.family.length === 0) {
            let aiCache = {};
            try { aiCache = JSON.parse(localStorage.getItem('toeic_ai_cache') || "{}"); } catch (e) { }
            const baseKey = `${correctWord.word.toLowerCase()}_${correctWord.meaning.toLowerCase().replace(/\s+/g, '')}`;
            const baseOldKey = correctWord.word.toLowerCase();
            const allSuffixes = ['_fc_short', '_fc_long', '_medium', '_hard', '_easy', ''];
            for (let suffix of allSuffixes) {
                const pk1 = `${baseKey}${suffix}`;
                const pk2 = `${baseOldKey}${suffix}`;
                if (aiCache[pk1] && aiCache[pk1].family && aiCache[pk1].family.length > 0) {
                    ex.family = aiCache[pk1].family;
                    ex.synonyms = aiCache[pk1].synonyms || (aiCache[pk1].collocations ? aiCache[pk1].collocations.map(c => ({ word: c.col || c.word, vi: c.vi })) : []);
                    ex.homophones = aiCache[pk1].homophones || [];
                    break;
                }
                if (aiCache[pk2] && aiCache[pk2].family && aiCache[pk2].family.length > 0) {
                    ex.family = aiCache[pk2].family;
                    ex.synonyms = aiCache[pk2].synonyms || (aiCache[pk2].collocations ? aiCache[pk2].collocations.map(c => ({ word: c.col || c.word, vi: c.vi })) : []);
                    ex.homophones = aiCache[pk2].homophones || [];
                    break;
                }
            }
        }
        let showAi = false;

        const fmt = (text) => {
            if (!text) return '';
            return text.replace(/\[(.*?)\]/g, '<span class="text-orange-400 font-bold">$1</span>').replace(/\{(.*?)\}/g, '<span class="text-emerald-400 font-bold">$1</span>');
        };

        const finalEn = ex.en || ex.en_dictation;
        const finalVi = ex.vi || ex.vi_dictation;
        if (finalEn && finalVi) {
            const exEn = document.getElementById('quizAiExEn');
            if (exEn) {
                exEn.innerHTML = fmt(finalEn);
                exEn.onclick = () => speakText(finalEn.replace(/[\[\]\{\}]/g, ''), 'en-US');
                document.getElementById('quizAiExVi').innerHTML = fmt(finalVi);
                document.getElementById('quizAiExample').classList.remove('hidden');
                showAi = true;
            }
        }

        if (ex.family && ex.family.length > 0) {
            const famHtml = ex.family.map(f => `<tr class="cursor-pointer hover:bg-slate-800/30 transition-colors group" 
                        onclick="speakText('${f.word.replace(/'/g, "\\'")}', 'en-US')" 
                        oncontextmenu="handleExtraRightClick(event, '${f.word.replace(/'/g, "\\'")}')" title="Chuột trái: Đọc từ | Chuột phải: Tra từ">
                        <td class="py-1.5 font-bold text-white text-white-light-override pr-2 group-hover:text-indigo-200 transition-colors">${f.word}</td>
                        <td class="py-1.5 text-slate-500 italic pr-2">${f.type}</td>
                        <td class="py-1.5 text-slate-300 text-slate-400-light-override">${f.vi}</td>
                    </tr>`).join('');
            document.getElementById('quizAiFamilyList').innerHTML = famHtml;
            document.getElementById('quizAiFamily').classList.remove('hidden');
            showAi = true;
        }

        if (ex.synonyms && ex.synonyms.length > 0) {
            const synHtml = ex.synonyms.map(c => {
                let textVi = c.vi || '';
                if (/\[Đồng nghĩa\]/i.test(textVi)) {
                    textVi = textVi.replace(/\[Đồng nghĩa\]\s*-?\s*/gi, '').trim() + ' <span class="text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded text-[10px] font-bold ml-2 uppercase">Đồng nghĩa</span>';
                } else if (/\[Trái nghĩa\]/i.test(textVi)) {
                    textVi = textVi.replace(/\[Trái nghĩa\]\s*-?\s*/gi, '').trim() + ' <span class="text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded text-[10px] font-bold ml-2 uppercase">Trái nghĩa</span>';
                } else {
                    textVi = textVi.replace(/\[Đồng nghĩa\]/gi, '<span class="text-emerald-400 font-bold ml-2">[Đồng nghĩa]</span>');
                    textVi = textVi.replace(/\[Trái nghĩa\]/gi, '<span class="text-rose-400 font-bold ml-2">[Trái nghĩa]</span>');
                }
                return `<tr class="cursor-pointer hover:bg-slate-800/30 transition-colors group" 
                        onclick="speakText('${c.word.replace(/'/g, "\\'")}', 'en-US')" 
                        oncontextmenu="handleExtraRightClick(event, '${c.word.replace(/'/g, "\\'")}')" title="Chuột trái: Đọc từ | Chuột phải: Tra từ">
                        <td class="py-1.5 pr-4 text-white text-white-light-override font-bold group-hover:text-amber-200 w-1/3 whitespace-nowrap transition-colors">${c.word}</td>
                        <td class="py-1.5 pl-4 text-slate-400 text-slate-400-light-override border-l border-slate-700/50">${textVi}</td>
                    </tr>`;
            }).join('');
            document.getElementById('quizAiSynList').innerHTML = synHtml;
            document.getElementById('quizAiSynonyms').classList.remove('hidden');
            showAi = true;
        }

        if (ex.homophones && ex.homophones.length > 0) {
            const homHtml = ex.homophones.map(h => `<tr class="cursor-pointer hover:bg-slate-800/30 transition-colors group" 
                        onclick="speakText('${h.word.replace(/'/g, "\\'")}', 'en-US')" 
                        oncontextmenu="handleExtraRightClick(event, '${h.word.replace(/'/g, "\\'")}')" title="Chuột trái: Đọc từ | Chuột phải: Tra từ">
                        <td class="py-1.5 pr-4 text-white text-white-light-override font-bold group-hover:text-rose-200 w-1/3 whitespace-nowrap transition-colors">${h.word}</td>
                        <td class="py-1.5 pl-4 text-slate-400 text-slate-400-light-override border-l border-slate-700/50">${h.vi}</td>
                    </tr>`).join('');
            const homList = document.getElementById('quizAiHomList');
            if (homList) {
                homList.innerHTML = homHtml;
                document.getElementById('quizAiHomophones').classList.remove('hidden');
                showAi = true;
            }
        }

        if (showAi && document.getElementById('quizAiDetails')) {
            document.getElementById('quizAiDetails').classList.remove('hidden');
        }
    }

    if (isQuizAutoPlay && !isRestore) {
        speakText(currentQuizList[currentQuizIndex].word, 'en-US');
    }

    document.getElementById('quizContinueHint').classList.remove('opacity-0');
    document.getElementById('quizContinueHint').classList.add('opacity-100');
    document.getElementById('quizContinueBtn').classList.remove('hidden');
}

function restartQuiz() {
    if (currentQuizList) {
        currentQuizList.forEach(w => delete w.quizState);
    }

    const onlyStarred = document.getElementById('onlyStarredToggle') && !document.getElementById('onlyStarredToggle').checked;
    if (onlyStarred) {
        currentQuizList = getStarredWords();
    } else {
        currentQuizList = [...parsedVocabList];
    }

    for (let i = currentQuizList.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [currentQuizList[i], currentQuizList[j]] = [currentQuizList[j], currentQuizList[i]];
    }

    if (typeof currentTestSize !== 'undefined' && currentTestSize > 0 && currentQuizList.length > currentTestSize) {
        currentQuizList = currentQuizList.slice(0, currentTestSize);
    }

    currentQuizIndex = 0;
    loadQuizQuestion();
}

function nextQuizQuestion() {
    if (!isQuizAnswered) return;
    currentQuizIndex++;
    saveSessionForCurrentDifficulty();
    loadQuizQuestion();
}

function manualPrevQuiz() {
    if (currentQuizIndex > 0) {
        currentQuizIndex--;
        saveSessionForCurrentDifficulty();
        loadQuizQuestion();
    }
}

function manualNextQuiz() {
    if (currentQuizIndex < currentQuizList.length - 1) {
        currentQuizIndex++;
        saveSessionForCurrentDifficulty();
        loadQuizQuestion();
    }
}

function handleQuizKeydown(e) {
    const quizContainer = document.getElementById('quizContainer');
    if (quizContainer && !quizContainer.classList.contains('hidden')) {
        if (e.key === ' ' || e.key === 'Shift') {
            e.preventDefault();
            if (isQuizAnswered && currentQuizList && currentQuizList[currentQuizIndex]) {
                speakText(currentQuizList[currentQuizIndex].word, 'en-US');
            }
            return;
        }

        if (isQuizAnswered) {
            if (e.key === 'Control' || e.key === 'Enter') {
                nextQuizQuestion();
            }
        } else if (e.key >= '1' && e.key <= '4') {
            const idx = parseInt(e.key) - 1;
            if (document.getElementById(`quizOpt_${idx}`)) {
                document.getElementById(`quizOpt_${idx}`).click();
            }
        }
    }
}

/* ============================================================================
 * CHẾ ĐỘ NGHE & ĐIỀN (FILL / DICTATION MODE)
 * AI sinh câu ví dụ chứa từ vựng, người dùng nghe + gõ từ còn thiếu.
 * Hỗ trợ 3 độ khó: word (1 từ), 30%/50%/100% (đục lỗ nhiều từ).
 * ============================================================================ */
let currentFillList = [];     // Mảng từ vựng đang fill (shuffled)
let currentFillIndex = 0;     // Vị trí câu hiện tại
let isFillAnswered = false;   // Đã trả lời câu hiện tại?
let isFillAutoPlay = true;    // Tự động đọc câu khi chuyển?

// =====================================================================
// [FILL MODE] startFillMode
// MỤC ĐÍCH: Chế độ Nghe & Điền (Dictation / Fill in the blanks).
// CÁCH HOẠT ĐỘNG:
// - Rất phụ thuộc vào AI Example (cần câu ví dụ tiếng Anh để đục lỗ).
// - Quét xem các từ đã có ví dụ chưa, nếu chưa bắt buộc phải cấu hình API Key để tạo.
// - Khởi tạo currentFillList, tự động random các câu và chuyển sang màn #fillContainer.
// =====================================================================
async function startFillMode() {
    parseVocab(false, true); // Cập nhật parsedVocabList với cache mới nhất
    if (parsedVocabList.length === 0) {
        alert("Vui lòng nhập từ vựng trước!");
        return;
    }

    let sourceList = parsedVocabList;
    const onlyStarred = document.getElementById('onlyStarredToggle') && !document.getElementById('onlyStarredToggle').checked;
    if (onlyStarred) {
        sourceList = getStarredWords();
        if (sourceList.length === 0) {
            alert("Bạn chưa đánh dấu sao từ vựng nào.");
            return;
        }
    }

    const saveSessionToggle = document.getElementById('saveSessionToggle');
    let shouldResume = saveSessionToggle && saveSessionToggle.checked && typeof currentFillList !== 'undefined' && currentFillList.length > 0;

    if (shouldResume) {
        if (sourceList.length !== currentFillList.length) {
            shouldResume = false;
        } else {
            const sourceWords = sourceList.map(w => w.word).sort().join(',');
            const currentWords = currentFillList.map(w => w.word).sort().join(',');
            if (sourceWords !== currentWords) {
                shouldResume = false;
            }
        }
    }

    if (shouldResume) {
        document.getElementById('welcomeScreen').classList.add('hidden');
        document.getElementById('loadingScreen').classList.add('hidden');
        document.getElementById('examContainer').classList.add('hidden');
        document.getElementById('flashcardContainer').classList.add('hidden');
        document.getElementById('quizContainer').classList.add('hidden');

        // Safeguard: Nếu tất cả các câu đều đã điền (do lỗi cũ lưu lại) -> Tự động reset
        if (currentFillList.length > 0 && currentFillList.every(w => w.userFillAnswer !== undefined || w.userFillAnswers !== undefined)) {
            currentFillList.forEach(w => {
                delete w.userFillAnswer;
                delete w.userFillAnswers;
            });
            currentFillIndex = 0;
            saveSessionForCurrentDifficulty();
        }

        document.getElementById('fillContainer').classList.remove('hidden');
        document.addEventListener('keydown', handleFillKeydownGlobal);
        loadFillQuestion();
        return;
    }



    let wordsNeedingEverything = [];
    let wordsNeedingOnlyExample = [];

    sourceList.forEach(w => {
        if (!w.aiExample || w.aiExample.level !== aiDifficultyLevel || !w.aiExample.en_dictation) {
            const hasFamily = w.aiExample && w.aiExample.family && w.aiExample.family.length > 0;
            if (hasFamily) {
                wordsNeedingOnlyExample.push(w);
            } else {
                wordsNeedingEverything.push(w);
            }
        }
    });

    const totalNeeding = wordsNeedingEverything.length + wordsNeedingOnlyExample.length;

    if (totalNeeding > 0) {
        if (!apiKey) {
            alert("Bạn cần cấu hình API Key để AI tự động tạo câu ví dụ cho chế độ này nhé!");
            return;
        }

        document.getElementById('welcomeScreen').classList.add('hidden');
        document.getElementById('examContainer').classList.add('hidden');
        document.getElementById('flashcardContainer').classList.add('hidden');
        document.getElementById('quizContainer').classList.add('hidden');
        document.getElementById('fillContainer').classList.add('hidden');

        const loading = document.getElementById('loadingScreen');
        loading.classList.remove('hidden');
        document.getElementById('loadingSubText').innerHTML = "";
        updateLoadingProgress("Chờ chút xíu...", 10);

        const keysArray = apiKey.split(',').map(k => k.trim()).filter(k => k);
        window.clickKeyIndex = window.clickKeyIndex || 0;
        const assignedKeyForThisClick = keysArray[window.clickKeyIndex % keysArray.length];
        window.clickKeyIndex++;

        try {
            if (wordsNeedingEverything.length > 0) {
                await generateBulkExamples(wordsNeedingEverything, assignedKeyForThisClick, false, 'dictation');
            }
            if (wordsNeedingOnlyExample.length > 0) {
                await generateBulkExamples(wordsNeedingOnlyExample, assignedKeyForThisClick, true, 'dictation');
            }
        } catch (err) {
            alert("Lỗi khi tạo ví dụ: " + err.message);
            loading.classList.add('hidden');
            document.getElementById('welcomeScreen').classList.remove('hidden');
            return;
        }
        turnOnSaveSessionToggle();
    }

    currentFillList = [...sourceList];
    for (let i = currentFillList.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [currentFillList[i], currentFillList[j]] = [currentFillList[j], currentFillList[i]];
    }
    currentFillList.forEach(c => {
        delete c.userFillAnswer;
        delete c.userFillAnswers;
    });

    currentFillIndex = 0;
    saveSessionForCurrentDifficulty();

    document.getElementById('welcomeScreen').classList.add('hidden');
    document.getElementById('loadingScreen').classList.add('hidden');
    document.getElementById('examContainer').classList.add('hidden');
    document.getElementById('flashcardContainer').classList.add('hidden');
    document.getElementById('quizContainer').classList.add('hidden');
    document.getElementById('fillContainer').classList.remove('hidden');

    document.addEventListener('keydown', handleFillKeydownGlobal);

    loadFillQuestion();
}

function exitFillMode() {
    document.getElementById('fillContainer').classList.add('hidden');
    document.getElementById('welcomeScreen').classList.remove('hidden');
    document.removeEventListener('keydown', handleFillKeydownGlobal);
}

function restartFill() {
    if (currentFillList && currentFillList.length > 0) {
        currentFillList.forEach(c => {
            delete c.userFillAnswer;
            delete c.userFillAnswers;
        });

        for (let i = currentFillList.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [currentFillList[i], currentFillList[j]] = [currentFillList[j], currentFillList[i]];
        }
    }

    currentFillIndex = 0;
    saveSessionForCurrentDifficulty();
    loadFillQuestion();
}

function revealFillVietnamese() {
    const vnEl = document.getElementById('fillVietnamese');
    if (vnEl) {
        vnEl.className = "text-slate-400 text-xl mb-8 italic transition-all duration-300";
        vnEl.title = "";
    }
}

function handleFillWordClick(event, word) {
    event.stopPropagation();
    if (!isFillAnswered) return;
    speakText(word, 'en-US');
}

function handleFillWordRightClick(event, word) {
    event.preventDefault();
    event.stopPropagation();
    if (!isFillAnswered) return;
    const card = currentFillList[currentFillIndex];
    const contextVi = card && card.aiExample ? card.aiExample.vi : "";
    showWordPopup(event.clientX, event.clientY, word, contextVi);
}

function toggleFillAutoPlay() {
    isFillAutoPlay = !isFillAutoPlay;
    const btn = document.getElementById('fillAutoPlayBtn');
    const icon = document.getElementById('fillAutoPlayIcon');

    if (isFillAutoPlay) {
        btn.classList.remove('text-slate-400', 'bg-slate-800', 'hover:bg-slate-700');
        btn.classList.add('text-teal-400', 'bg-teal-900/20', 'border-teal-500/30', 'hover:bg-teal-900/40', 'active-toggle');
        icon.className = 'fa-solid fa-volume-high';
    } else {
        btn.classList.remove('text-teal-400', 'bg-teal-900/20', 'border-teal-500/30', 'hover:bg-teal-900/40', 'active-toggle');
        btn.classList.add('text-slate-400', 'bg-slate-800', 'hover:bg-slate-700');
        icon.className = 'fa-solid fa-volume-xmark';
        window.speechSynthesis.cancel();
    }
}

function playFillAudio() {
    if (currentFillIndex >= currentFillList.length) return;
    const card = currentFillList[currentFillIndex];
    if (!card.aiExample) return;
    let text = card.aiExample.en_dictation || card.aiExample.en;
    if (text.startsWith('"') && text.endsWith('"')) text = text.substring(1, text.length - 1);
    if (card.aiExample.level === 'hard' && text.includes(':')) {
        text = text.substring(0, text.lastIndexOf(':')).trim();
    }

    window.speechSynthesis.cancel();
    setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.85;

        const voices = window.speechSynthesis.getVoices();
        const englishVoices = voices.filter(v => v.lang.startsWith('en'));
        if (englishVoices.length > 0) {
            const preferredVoice = englishVoices.find(v => v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha'));
            utterance.voice = preferredVoice || englishVoices[0];
        }
        window.speechSynthesis.speak(utterance);
    }, 50);
}

function changeFillDifficulty() {
    if (currentFillList.length > 0 && !isFillAnswered) {
        const card = currentFillList[currentFillIndex];
        card.userFillAnswer = undefined;
        card.userFillAnswers = undefined;
        loadFillQuestion();
    }
}

function loadFillQuestion() {
    if (currentFillIndex >= currentFillList.length) {
        currentFillIndex = 0;
    }

    isFillAnswered = false;
    document.getElementById('fillCounter').innerText = `${currentFillIndex + 1} / ${currentFillList.length}`;

    const fillAiDetails = document.getElementById('fillAiDetails');
    if (fillAiDetails) fillAiDetails.classList.add('hidden');

    const card = currentFillList[currentFillIndex];
    if (!card.aiExample || (!card.aiExample.en && !card.aiExample.en_dictation)) {
        card.aiExample = { en_dictation: "Điền từ này: " + card.word, vi_dictation: "(Lỗi: AI chưa tạo được câu ví dụ cho từ này)", level: aiDifficultyLevel };
    }
    let sentence = card.aiExample.en_dictation || card.aiExample.en;
    if (sentence.startsWith('"') && sentence.endsWith('"')) sentence = sentence.substring(1, sentence.length - 1);
    
    // Xóa dấu ngoặc vuông AI tạo ra (do người dùng yêu cầu không hiển thị ngoặc vuông)
    sentence = sentence.replace(/\[/g, '').replace(/\]/g, '');

    const fillDifficulty = document.getElementById('fillDifficulty') ? document.getElementById('fillDifficulty').value : 'word';
    const coreWord = card.word.replace(/\s*\(.*?\)\s*/g, '').trim();
    const cleanWord = coreWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    let maskedSentence = "";
    card.fillTargets = [];

    if (fillDifficulty === 'word') {
        const wordWidth = Math.max(80, coreWord.length * 24 + 20);
        const escapedVal = card.userFillAnswer ? card.userFillAnswer.replace(/"/g, '&quot;') : "";
        const inputHtml = `<input type="text" id="fillInput" value="${escapedVal}" class="bg-slate-800 border-b-2 border-slate-500 font-bold text-blue-400 outline-none text-center focus:border-teal-500 transition-colors inline-block pb-1 mx-1" style="width: ${wordWidth}px" autocomplete="off" spellcheck="false" oninput="checkFillInputAuto(event)">`;

        let leftPart = "";
        let rightPart = "";
        let match = sentence.match(new RegExp(`\\b${cleanWord}\\b`, 'i'));
        if (!match) match = sentence.match(new RegExp(cleanWord, 'i'));

        if (match) {
            leftPart = sentence.substring(0, match.index);
            rightPart = sentence.substring(match.index + match[0].length);
        } else {
            leftPart = sentence;
        }

        const wrapWords = (text) => {
            return text.split(/([^a-zA-Z0-9']+)/).map(part => {
                if (/[a-zA-Z0-9']/.test(part)) {
                    return `<span class="hover:bg-slate-500/20 rounded px-0.5 cursor-pointer transition-colors inline-block" onclick="handleFillWordClick(event, '${part.replace(/'/g, "\\'")}')" oncontextmenu="handleFillWordRightClick(event, '${part.replace(/'/g, "\\'")}')">${part}</span>`;
                }
                return part;
            }).join('');
        };

        let warningHtml = "";
        if (!match) {
            const getLevenshteinDistance = (a, b) => {
                const matrix = [];
                for (let i = 0; i <= b.length; i++) matrix[i] = [i];
                for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
                for (let i = 1; i <= b.length; i++) {
                    for (let j = 1; j <= a.length; j++) {
                        if (b.charAt(i - 1) == a.charAt(j - 1)) {
                            matrix[i][j] = matrix[i - 1][j - 1];
                        } else {
                            matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1));
                        }
                    }
                }
                return matrix[b.length][a.length];
            };

            const sWords = sentence.replace(/[.,!?"]/g, '').split(/\s+/);
            const tWordsCount = coreWord.split(/\s+/).length;
            let bestMatch = "";
            let minDistance = 999;

            for (let i = 0; i <= sWords.length - tWordsCount; i++) {
                const phrase = sWords.slice(i, i + tWordsCount).join(' ');
                const dist = getLevenshteinDistance(coreWord.toLowerCase(), phrase.toLowerCase());
                if (dist < minDistance) {
                    minDistance = dist;
                    bestMatch = phrase;
                }
            }

            let suggestionText = "";
            if (minDistance <= Math.max(3, coreWord.length * 0.4) && bestMatch) {
                suggestionText = `AI đang dùng từ <strong class="text-emerald-500 cursor-pointer hover:underline" title="Nhấn để tự động sửa lỗi chính tả này" onclick="autoFixSpellingError(${currentFillIndex}, '${bestMatch.replace(/'/g, "\\'")}')">${bestMatch}</strong> thay vì <strong class="text-rose-500">${card.word}</strong>.`;
            } else {
                suggestionText = `Từ <strong class="text-rose-500">${card.word}</strong> không có mặt trong câu của AI.`;
            }

            warningHtml = `<div class="text-sm text-slate-700 dark:text-slate-300 mt-4 bg-slate-100 dark:bg-slate-800/80 inline-block px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 shadow-sm">
                        <i class="fa-solid fa-circle-info text-blue-500 mr-1"></i> ${suggestionText} Vui lòng sửa lại lỗi chính tả ở Bảng Xem Trước!
                    </div>`;
        }
        maskedSentence = wrapWords(leftPart) + (match ? inputHtml + wrapWords(rightPart) : ` <br><br><div class="flex flex-col items-center justify-center mt-2"><div class="flex items-center justify-center"><span class="text-xl text-slate-400 mr-2">Điền từ:</span> ${inputHtml}</div>${warningHtml}</div>`);
    } else {
        const words = sentence.split(/([^a-zA-Z0-9']+)/).filter(Boolean);
        const actualWordIndexes = [];
        words.forEach((w, idx) => {
            if (/[a-zA-Z]/.test(w)) actualWordIndexes.push(idx);
        });

        let blankCount = 0;
        if (fillDifficulty === '100') blankCount = actualWordIndexes.length;
        else if (fillDifficulty === '50') blankCount = Math.max(1, Math.floor(actualWordIndexes.length * 0.5));
        else if (fillDifficulty === '30') blankCount = Math.max(1, Math.floor(actualWordIndexes.length * 0.3));

        let targetWordIdx = -1;
        actualWordIndexes.forEach(idx => {
            if (new RegExp(`^${cleanWord}$`, 'i').test(words[idx])) targetWordIdx = idx;
        });

        let selectedIndexes = new Set();
        if (targetWordIdx !== -1) {
            selectedIndexes.add(targetWordIdx);
            blankCount--;
        }

        let availableIndexes = actualWordIndexes.filter(idx => !selectedIndexes.has(idx));
        for (let i = availableIndexes.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [availableIndexes[i], availableIndexes[j]] = [availableIndexes[j], availableIndexes[i]];
        }

        for (let i = 0; i < blankCount && i < availableIndexes.length; i++) {
            selectedIndexes.add(availableIndexes[i]);
        }

        let inputIndex = 0;
        let html = "";
        words.forEach((part, idx) => {
            if (/[a-zA-Z]/.test(part)) {
                if (selectedIndexes.has(idx)) {
                    const wordWidth = part.length * 15 + 16;
                    const escapedVal = (card.userFillAnswers && card.userFillAnswers[inputIndex]) ? card.userFillAnswers[inputIndex].replace(/"/g, '&quot;') : "";
                    html += `<input type="text" data-index="${inputIndex}" value="${escapedVal}" class="fill-multi-input bg-slate-800 border-b-2 border-slate-500 font-bold text-blue-400 outline-none text-center focus:border-teal-500 transition-colors inline-block pb-0.5 mx-0.5" style="width: ${wordWidth}px" autocomplete="off" spellcheck="false" oninput="checkFillInputAutoMulti(event)">`;
                    card.fillTargets.push(part);
                    inputIndex++;
                } else {
                    html += `<span class="hover:bg-slate-500/20 rounded px-0.5 cursor-pointer transition-colors inline-block" onclick="handleFillWordClick(event, '${part.replace(/'/g, "\\'")}')" oncontextmenu="handleFillWordRightClick(event, '${part.replace(/'/g, "\\'")}')">${part}</span>`;
                }
            } else {
                html += part;
            }
        });
        maskedSentence = html;
    }

    document.getElementById('fillSentence').innerHTML = maskedSentence;
    const vnEl = document.getElementById('fillVietnamese');

    let viSentence = card.aiExample.vi_dictation || card.aiExample.vi;
    if (viSentence.includes('[') && viSentence.includes(']')) {
        viSentence = viSentence.replace(/\[(.*?)\]/g, `<span id="fillViHighlight" class="transition-colors duration-300">$1</span>`);
    } else {
        let meanings = card.meaning.split(/[,;\/]+/).map(m => m.trim()).filter(m => m.length > 0);
        meanings.sort((a, b) => b.length - a.length);
        for (let m of meanings) {
            const cleanM = m.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`(^|\\s|[.,!?;:"'\\(\\[\\{])(${cleanM})(?=\\s|[.,!?;:"'\\)\\]\\}]|$)`, 'i');
            if (regex.test(viSentence)) {
                viSentence = viSentence.replace(regex, `$1<span id="fillViHighlight" class="transition-colors duration-300">$2</span>`);
                break;
            }
        }
    }
    vnEl.innerHTML = viSentence;
    vnEl.className = "text-slate-400 text-xl mb-8 italic cursor-pointer blur-md hover:blur-sm transition-all duration-300 select-none";
    vnEl.title = "Nhấn để xem nghĩa tiếng Việt";

    document.getElementById('fillFeedbackMsg').classList.remove('opacity-100');
    document.getElementById('fillFeedbackMsg').classList.add('opacity-0');
    document.getElementById('fillContinueHint').classList.add('hidden');
    document.getElementById('fillContinueBtn').classList.add('hidden');

    const input = document.getElementById('fillInput');
    const multiInputs = document.querySelectorAll('.fill-multi-input');

    if (card.userFillAnswer !== undefined && fillDifficulty === 'word') {
        checkFillAnswer(input, true);
    } else if (card.userFillAnswers !== undefined && fillDifficulty !== 'word' && card.fillTargets && card.fillTargets.length === card.userFillAnswers.length) {
        checkFillAnswerMulti(true);
    } else {
        if (input) {
            setTimeout(() => input.focus(), 100);
        } else if (multiInputs.length > 0) {
            setTimeout(() => multiInputs[0].focus(), 100);
        }
        if (isFillAutoPlay) {
            playFillAudio();
        }
    }
}

function checkFillInputAutoMulti(e) {
    if (isFillAnswered) return;
    const input = e.target;
    const currentIdx = parseInt(input.getAttribute('data-index'));
    const card = currentFillList[currentFillIndex];
    const targetWord = card.fillTargets[currentIdx].trim().toLowerCase();
    const val = input.value.trim().toLowerCase();

    // Auto expand width if text is getting long
    const minWidth = card.fillTargets[currentIdx].length * 15 + 16;
    const currentTextWidth = val.length * 15 + 16;
    input.style.width = Math.max(minWidth, currentTextWidth) + 'px';

    if (val === targetWord) {
        // Correct for this specific input
        input.classList.remove('border-slate-500', 'focus:border-teal-500', 'bg-slate-800', 'border-orange-500', 'text-orange-400');
        input.classList.add('border-emerald-500', 'bg-emerald-900/30', 'text-emerald-400');
        input.disabled = true; // Lock it in

        // Move focus to next empty input
        const inputs = Array.from(document.querySelectorAll('.fill-multi-input'));
        const nextEmpty = inputs.find(inp => !inp.disabled);
        if (nextEmpty) {
            nextEmpty.focus();
        } else {
            // All are disabled (meaning all are correct!)
            checkFillAnswerMulti();
        }
    }
}

function showFillAiDetails() {
    const card = currentFillList[currentFillIndex];
    const ex = card.aiExample;
    if (!ex) return;

    // [PATCH] Kế thừa chéo Family/Collocation (Để fix lỗi thiếu dữ liệu do Resume Session cũ)
    if (!ex.family || ex.family.length === 0) {
        let aiCache = {};
        try { aiCache = JSON.parse(localStorage.getItem('toeic_ai_cache') || "{}"); } catch (e) { }
        const baseKey = `${card.word.toLowerCase()}_${card.meaning.toLowerCase().replace(/\s+/g, '')}`;
        const baseOldKey = card.word.toLowerCase();
        const allSuffixes = ['_fc_short', '_fc_long', '_medium', '_hard', '_easy', ''];
        for (let suffix of allSuffixes) {
            const pk1 = `${baseKey}${suffix}`;
            const pk2 = `${baseOldKey}${suffix}`;
            if (aiCache[pk1] && aiCache[pk1].family && aiCache[pk1].family.length > 0) {
                ex.family = aiCache[pk1].family;
                ex.synonyms = aiCache[pk1].synonyms || (aiCache[pk1].collocations ? aiCache[pk1].collocations.map(c => ({ word: c.col || c.word, vi: c.vi })) : []);
                ex.homophones = aiCache[pk1].homophones || [];
                break;
            }
            if (aiCache[pk2] && aiCache[pk2].family && aiCache[pk2].family.length > 0) {
                ex.family = aiCache[pk2].family;
                ex.synonyms = aiCache[pk2].synonyms || (aiCache[pk2].collocations ? aiCache[pk2].collocations.map(c => ({ word: c.col || c.word, vi: c.vi })) : []);
                ex.homophones = aiCache[pk2].homophones || [];
                break;
            }
        }
    }

    let showAi = false;
    const elDetails = document.getElementById('fillAiDetails');
    const elFamily = document.getElementById('fillAiFamily');
    const elSynonyms = document.getElementById('fillAiSynonyms');
    const elHomophones = document.getElementById('fillAiHomophones');

    if (elFamily) elFamily.classList.add('hidden');
    if (elSynonyms) elSynonyms.classList.add('hidden');
    if (elHomophones) elHomophones.classList.add('hidden');
    if (elDetails) elDetails.classList.add('hidden');

    if (ex.family && ex.family.length > 0) {
        const famHtml = ex.family.map(f => `<tr class="cursor-pointer hover:bg-slate-800/30 transition-colors group" 
                    onclick="speakText('${f.word.replace(/'/g, "\\'")}', 'en-US')" 
                    oncontextmenu="handleExtraRightClick(event, '${f.word.replace(/'/g, "\\'")}')" title="Chuột trái: Đọc từ | Chuột phải: Tra từ">
                    <td class="py-1.5 font-bold text-white text-white-light-override pr-2 group-hover:text-indigo-200 transition-colors">${f.word}</td>
                    <td class="py-1.5 text-slate-500 italic pr-2">${f.type}</td>
                    <td class="py-1.5 text-slate-300 text-slate-400-light-override">${f.vi}</td>
                </tr>`).join('');
        document.getElementById('fillAiFamilyList').innerHTML = famHtml;
        if (elFamily) elFamily.classList.remove('hidden');
        showAi = true;
    }

    if (ex.synonyms && ex.synonyms.length > 0) {
        const synHtml = ex.synonyms.map(c => {
            let textVi = c.vi || '';
            if (/\[Đồng nghĩa\]/i.test(textVi)) {
                textVi = textVi.replace(/\[Đồng nghĩa\]\s*-?\s*/gi, '').trim() + ' <span class="text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded text-[10px] font-bold ml-2 uppercase">Đồng nghĩa</span>';
            } else if (/\[Trái nghĩa\]/i.test(textVi)) {
                textVi = textVi.replace(/\[Trái nghĩa\]\s*-?\s*/gi, '').trim() + ' <span class="text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded text-[10px] font-bold ml-2 uppercase">Trái nghĩa</span>';
            } else {
                textVi = textVi.replace(/\[Đồng nghĩa\]/gi, '<span class="text-emerald-400 font-bold ml-2">[Đồng nghĩa]</span>');
                textVi = textVi.replace(/\[Trái nghĩa\]/gi, '<span class="text-rose-400 font-bold ml-2">[Trái nghĩa]</span>');
            }
            return `<tr class="cursor-pointer hover:bg-slate-800/30 transition-colors group" 
                    onclick="speakText('${c.word.replace(/'/g, "\\'")}', 'en-US')" 
                    oncontextmenu="handleExtraRightClick(event, '${c.word.replace(/'/g, "\\'")}')" title="Chuột trái: Đọc từ | Chuột phải: Tra từ">
                    <td class="py-1.5 pr-4 text-white text-white-light-override font-bold group-hover:text-amber-200 w-1/3 whitespace-nowrap transition-colors">${c.word}</td>
                    <td class="py-1.5 pl-4 text-slate-400 text-slate-400-light-override border-l border-slate-700/50">${textVi}</td>
                </tr>`;
        }).join('');
        const synListEl = document.getElementById('fillAiSynList');
        if (synListEl) synListEl.innerHTML = synHtml;
        if (elSynonyms) elSynonyms.classList.remove('hidden');
        showAi = true;
    }

    if (ex.homophones && ex.homophones.length > 0) {
        const homHtml = ex.homophones.map(h => `<tr class="cursor-pointer hover:bg-slate-800/30 transition-colors group" 
                    onclick="speakText('${h.word.replace(/'/g, "\\'")}', 'en-US')" 
                    oncontextmenu="handleExtraRightClick(event, '${h.word.replace(/'/g, "\\'")}')" title="Chuột trái: Đọc từ | Chuột phải: Tra từ">
                    <td class="py-1.5 pr-4 text-white text-white-light-override font-bold group-hover:text-rose-200 w-1/3 whitespace-nowrap transition-colors">${h.word}</td>
                    <td class="py-1.5 pl-4 text-slate-400 text-slate-400-light-override border-l border-slate-700/50">${h.vi}</td>
                </tr>`).join('');
        const homList = document.getElementById('fillAiHomList');
        if (homList) {
            homList.innerHTML = homHtml;
            if (elHomophones) elHomophones.classList.remove('hidden');
            showAi = true;
        }
    }

    if (showAi && elDetails) {
        elDetails.classList.remove('hidden');
    }
}

function checkFillAnswerMulti(isRestore = false) {
    if (isFillAnswered) return;
    const card = currentFillList[currentFillIndex];
    const inputs = document.querySelectorAll('.fill-multi-input');

    let allCorrect = true;

    if (!isRestore) {
        card.userFillAnswers = Array.from(inputs).map(inp => inp.value.trim());
    }

    inputs.forEach((input, idx) => {
        const val = input.value.trim().toLowerCase();
        const targetWord = card.fillTargets[idx].trim().toLowerCase();

        input.disabled = true;
        if (val === targetWord) {
            input.classList.remove('border-slate-500', 'focus:border-teal-500', 'bg-slate-800');
            input.classList.add('border-emerald-500', 'bg-emerald-900/30', 'text-emerald-400');
        } else {
            allCorrect = false;
            input.classList.remove('border-slate-500', 'focus:border-teal-500', 'bg-slate-800');
            input.classList.add('border-orange-500', 'bg-orange-900/30', 'text-orange-400');
        }
    });

    isFillAnswered = true;
    saveSessionForCurrentDifficulty();
    revealFillVietnamese();

    const feedback = document.getElementById('fillFeedbackMsg');
    feedback.classList.remove('opacity-0', 'text-orange-400', 'text-emerald-400');
    feedback.classList.add('opacity-100');

    if (allCorrect) {
        feedback.innerText = "Chính xác tuyệt đối!";
        feedback.classList.add('text-emerald-400');
        const viHighlight = document.getElementById('fillViHighlight');
        if (viHighlight) viHighlight.classList.add('font-bold', 'text-emerald-500', 'dark:text-emerald-400');
    } else {
        let html = card.fillTargets.map((target, idx) => {
            const userVal = inputs[idx].value.trim().toLowerCase();
            if (userVal === target.toLowerCase()) {
                return `<span class="text-emerald-400">${target}</span>`;
            } else {
                return `<span class="text-rose-500 underline decoration-rose-500/50">${target}</span>`;
            }
        }).join('<span class="text-slate-500 mx-1">|</span>');

        const randomQuote = quizEncouragingQuotes[Math.floor(Math.random() * quizEncouragingQuotes.length)];
        feedback.innerHTML = `${randomQuote} <br><div class="mt-2 text-sm text-slate-300 flex items-center justify-center gap-2 flex-wrap">Đáp án: <span class="tracking-widest font-mono text-xl bg-slate-900/50 px-3 py-1 rounded-lg shadow-inner border border-slate-700/50">${html}</span></div>`;
        feedback.classList.add('text-orange-400');
        const viHighlight = document.getElementById('fillViHighlight');
        if (viHighlight) viHighlight.classList.add('font-bold', 'text-rose-500', 'dark:text-rose-400');
    }

    if (typeof showFillAiDetails === 'function') showFillAiDetails();

    document.getElementById('fillContinueHint').classList.remove('hidden');
    document.getElementById('fillContinueBtn').classList.remove('hidden');
}

function checkFillInputAuto(e) {
    if (isFillAnswered) return;
    const input = e.target;
    const val = input.value.trim().toLowerCase();
    const card = currentFillList[currentFillIndex];
    const targetWord = card.word.replace(/\s*\(.*?\)\s*/g, '').trim().toLowerCase();

    if (val === targetWord) {
        checkFillAnswer(input);
    }
}

function handleFillKeydownGlobal(e) {
    const fillContainer = document.getElementById('fillContainer');
    if (fillContainer && !fillContainer.classList.contains('hidden')) {
        if (e.key === 'Shift') {
            if (!e.repeat) {
                e.preventDefault();
                playFillAudio();
            }
        } else if (e.key === 'Enter') {
            if (isFillAnswered) {
                e.preventDefault();
                nextFillQuestion();
            } else {
                const multiInputs = document.querySelectorAll('.fill-multi-input');
                if (multiInputs.length > 0) {
                    e.preventDefault();
                    checkFillAnswerMulti();
                } else {
                    e.preventDefault();
                    const input = document.getElementById('fillInput');
                    if (input && input.value.trim()) {
                        checkFillAnswer(input);
                    }
                }
            }
        }
    }
}

window.autoFixSpellingError = function (idx, correctWord) {
    const card = currentFillList[idx];
    const oldWord = card.word;
    const coreWord = oldWord.replace(/\s*\(.*?\)\s*/g, '').trim();
    const newWord = oldWord.replace(coreWord, correctWord);

    // 1. Update in starred list if exists
    let starred = getStarredWords();
    const sIdx = starred.findIndex(s => s.word === oldWord);
    if (sIdx !== -1) {
        starred[sIdx].word = newWord;
        localStorage.setItem('toeic_starred_words', JSON.stringify(starred));
    }

    // 2. Find index in parsedVocabList
    const pIdx = parsedVocabList.findIndex(w => w.word === oldWord && w.meaning === card.meaning);
    if (pIdx !== -1) {
        parsedVocabList[pIdx].word = newWord;

        // Update textarea based on pIdx
        const textarea = document.getElementById('vocabInput');
        if (textarea) {
            let lines = textarea.value.split('\n');
            let parsedCount = 0;
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].trim() !== '') {
                    if (parsedCount === pIdx) {
                        lines[i] = lines[i].replace(oldWord, newWord);
                        break;
                    }
                    parsedCount++;
                }
            }
            textarea.value = lines.join('\n');
            localStorage.setItem('toeic_vocab_list', textarea.value);
        }
    }

    // 3. Update currentFillList card
    card.word = newWord;

    // 4. Update the preview table in the background
    parseVocab(true);

    // 5. Reload the dictation question
    loadFillQuestion();
};

/**
 * checkFillAnswer - Kiểm tra đáp án fill đơn từ.
 * So sánh từng ký tự và hiển thị chữ đúng (xanh) / sai (đỏ).
 * @param {HTMLElement} input - Ô input đã gõ
 * @param {boolean} isRestore - true nếu đang khôi phục state cũ
 */
function checkFillAnswer(input, isRestore = false) {
    if (isFillAnswered) return;
    const val = input.value.trim().toLowerCase();
    const card = currentFillList[currentFillIndex];
    const targetWord = card.word.replace(/\s*\(.*?\)\s*/g, '').trim().toLowerCase();

    if (!isRestore) {
        card.userFillAnswer = input.value.trim();
    }

    isFillAnswered = true;
    saveSessionForCurrentDifficulty();
    revealFillVietnamese();
    const feedback = document.getElementById('fillFeedbackMsg');
    feedback.classList.remove('opacity-0', 'text-orange-400', 'text-emerald-400');
    feedback.classList.add('opacity-100');

    if (val === targetWord) {
        input.classList.remove('border-slate-500', 'focus:border-teal-500', 'bg-slate-800');
        input.classList.add('border-emerald-500', 'bg-emerald-900/30', 'text-emerald-400');
        feedback.innerText = "Chính xác!";
        feedback.classList.add('text-emerald-400');
        const viHighlight = document.getElementById('fillViHighlight');
        if (viHighlight) viHighlight.classList.add('font-bold', 'text-emerald-500', 'dark:text-emerald-400');
    } else {
        input.classList.remove('border-slate-500', 'focus:border-teal-500', 'bg-slate-800');
        input.classList.add('border-orange-500', 'bg-orange-900/30', 'text-orange-400');

        let html = '';
        for (let i = 0; i < targetWord.length; i++) {
            if (i < val.length && val[i] === targetWord[i]) {
                html += `<span class="text-emerald-400">${targetWord[i]}</span>`;
            } else {
                html += `<span class="text-rose-500 underline decoration-rose-500/50">${targetWord[i]}</span>`;
            }
        }
        if (val.length > targetWord.length) {
            const extra = val.substring(targetWord.length);
            html += `<span class="text-rose-500 line-through opacity-50">${extra}</span>`;
        }

        const randomQuote = quizEncouragingQuotes[Math.floor(Math.random() * quizEncouragingQuotes.length)];
        feedback.innerHTML = `${randomQuote} <br><div class="mt-2 text-sm text-slate-300 flex items-center justify-center gap-2">Đáp án đúng: <span class="tracking-widest font-mono text-xl bg-slate-900/50 px-3 py-1 rounded-lg shadow-inner border border-slate-700/50">${html}</span></div>`;
        feedback.classList.add('text-orange-400');
        const viHighlight = document.getElementById('fillViHighlight');
        if (viHighlight) viHighlight.classList.add('font-bold', 'text-rose-500', 'dark:text-rose-400');
    }

    if (typeof showFillAiDetails === 'function') showFillAiDetails();

    input.disabled = true;
    document.getElementById('fillContinueHint').classList.remove('hidden');
    document.getElementById('fillContinueBtn').classList.remove('hidden');
}

function nextFillQuestion() {
    if (currentFillIndex < currentFillList.length - 1) {
        currentFillIndex++;
        loadFillQuestion();
    } else if (isFillAnswered) {
        currentFillIndex = 0;
        loadFillQuestion();
    }
}

function prevFillQuestion() {
    if (currentFillIndex > 0) {
        currentFillIndex--;
        loadFillQuestion();
    }
}