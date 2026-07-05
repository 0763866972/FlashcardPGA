# Hệ thống Học Từ Vựng Thông Minh AI (Flashcard AI)

Đây là ứng dụng web học từ vựng tiếng Anh hiện đại, kết hợp trí tuệ nhân tạo (AI) thông qua **Groq API** để tự động tạo ra câu ví dụ, họ từ (Word Family), cụm từ đi kèm (Collocations) và phát âm. Ứng dụng cung cấp 3 chế độ học tập đa dạng, lưu trữ tiến độ thông minh và giao diện được thiết kế chuyên nghiệp, trực quan.

## ✨ Các Tính Năng Nổi Bật

### 1. Quản lý Từ Vựng Chuyên Sâu
- **Đa Thư Mục (Folders):** Dễ dàng tạo, đổi tên, xóa các nhóm từ vựng riêng biệt (ví dụ: Giới từ, Động từ, Bài 1...). Tiến độ học tập của mỗi thư mục được lưu trữ hoàn toàn độc lập.
- **Nhập Liệu Nhanh:** Hỗ trợ sao chép/dán trực tiếp danh sách từ vựng từ Excel/Word. 
- **Chỉnh Sửa Trực Tiếp (Inline Edit):** Sửa lỗi chính tả, thêm/xóa từ vựng cực kỳ nhanh chóng trực tiếp trên bảng.
- **Lưu Từ Khó (Starred Words):** Đánh dấu sao các từ khó nhớ và sử dụng chế độ "Lọc Sao" để chỉ ôn tập lại những từ vựng này.

### 2. Sức Mạnh Trí Tuệ Nhân Tạo (Groq AI)
- Tự động sinh ra câu ví dụ tiếng Anh kèm nghĩa tiếng Việt theo ngữ cảnh.
- Cung cấp **Word Family** (Họ từ liên quan) và **Collocations** (Cụm từ thường đi chung).
- Có 3 mức độ khó AI (Dễ, Thường, Khó) để tạo ra các ví dụ phù hợp với trình độ người học.
- **Cơ chế Cache Thông Minh:** Dữ liệu AI sinh ra sẽ được lưu lại trong bộ nhớ trình duyệt, giúp chuyển đổi thư mục mượt mà mà không tốn thêm API Quota.

### 3. Ba Chế Độ Học Tập Tương Tác
- 🃏 **Flashcard:** Lật thẻ truyền thống. Phát âm chuẩn từ vựng, tự động đọc câu ví dụ.
- 🎮 **Chế độ Trắc Nghiệm (Quiz):** 
  - AI tự động trộn các đáp án gây nhiễu thông minh.
  - Hỗ trợ dịch nghĩa mở rộng (Google Translate hint) khi lật mặt sau để người học hiểu sâu hơn.
- 🎧 **Nghe & Điền (Dictation):** 
  - Luyện kỹ năng nghe hiểu (Listening) thông qua việc nghe câu ví dụ và điền chính xác từ vựng còn thiếu vào ô trống.

### 4. Lưu Tiến Độ Học Tập (Save Session)
- Ứng dụng tự động lưu lại vị trí thẻ bài / câu trắc nghiệm bạn đang học dở dang. 
- Thoải mái chuyển qua lại giữa các thư mục từ vựng, khi quay lại hệ thống sẽ phục hồi lại đúng ngay thẻ bài bạn đã dừng lại.

## 🚀 Hướng Dẫn Sử Dụng (Dành Cho Người Dùng)

### Bước 1: Cài đặt API Key (Quan trọng)
1. Để sử dụng tính năng tạo câu ví dụ tự động bằng AI, bạn cần có một (hoặc nhiều) API Key từ [Groq Console](https://console.groq.com/).
2. Nhấn vào biểu tượng **Bánh Răng (Cài đặt)** ở góc trên bên phải màn hình.
3. Dán API Key vào ô trống (nếu có nhiều key, hãy cách nhau bằng dấu phẩy để hệ thống tự động xoay vòng nhằm tránh giới hạn tốc độ - rate limit).
4. Nhấn **Lưu Cấu Hình**.

### Bước 2: Tạo Thư Mục và Nhập Từ Vựng
1. Tại khu vực **Thư mục Từ vựng**, nhấn nút `+` để tạo thư mục mới (ví dụ: "Từ Vựng Toeic Part 1").
2. Tại khu vực **Nhập / Dán từ Excel**, bạn có thể dán danh sách từ theo định dạng `Từ vựng - Nghĩa` (Mỗi từ 1 dòng).
3. Sau khi dán, bảng xem trước ở dưới sẽ ngay lập tức được cập nhật. Bạn có thể bấm thẳng vào từ vựng trên bảng để chỉnh sửa lỗi chính tả nếu cần.

### Bước 3: Bắt Đầu Học Tập
Ứng dụng có 3 nút tương ứng với 3 chức năng:

- **Tạo Đề Từ Vựng:** Chọn số câu (10, 20, 30...) và hệ thống sẽ trích xuất ngẫu nhiên danh sách từ vựng của bạn để tạo thành bài kiểm tra nhỏ.
- **Nghe & Điền (Dictation):** Luyện nghe câu ví dụ, gõ lại từ vựng bị khuyết để luyện kỹ năng đánh máy và nghe hiểu. Bạn có thể bấm vào dấu mũi tên bên cạnh nút này để chọn độ khó AI (Dễ/Thường/Khó).
- **Flashcard:** Ôn tập theo dạng lật mặt thẻ truyền thống. 
  - **Lưu ý:** Nếu bạn BẬT công tắc "AI" nằm ngay bên trong nút Flashcard, hệ thống sẽ tự động gọi API để sinh câu ví dụ cho các từ mới. Nếu bạn TẮT công tắc AI, hệ thống sẽ chỉ dùng đúng từ vựng gốc và nghĩa bạn đã nhập để học tốc độ cao.
- **Chế độ Học (Quiz):** Làm bài tập trắc nghiệm chọn nghĩa đúng.

### Bước 4: Lưu Ý Khi Sử Dụng
- Hệ thống hỗ trợ **Dark Mode / Light Mode**. Hãy nhấn vào biểu tượng Mặt Trời/Mặt Trăng ở thanh trên cùng để đổi giao diện.
- Nút công tắc **"Lưu tiến độ" (Save Session)** ở góc dưới bên trái có tác dụng lưu lại tiến trình học. Nếu bạn chỉnh sửa bảng từ vựng (xóa từ, thêm từ mới), hệ thống sẽ tự động vô hiệu hóa chế độ này để ép làm mới lại danh sách từ.

---
*Chúc bạn học tập hiệu quả và chinh phục mọi chứng chỉ ngôn ngữ với Hệ thống Học Từ vựng Thông minh!*