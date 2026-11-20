# YENTRAN AI – TRỢ LÝ HỌC TOÁN THCS (CÔ TRẦN THỊ HẢI YẾN)

**HỎI ĐỂ HIỂU – KHÔNG LỜI GIẢI CHI TIẾT**  
*Hiểu Toán – Tự Tư Duy – Vững Tương Lai*

Ứng dụng web toàn diện (Full-stack Production) hỗ trợ học tập và quản lý học liệu số môn Toán cấp THCS (Lớp 6, Lớp 7, Lớp 8, Lớp 9) do **Cô Trần Thị Hải Yến** xây dựng.

---

## 1. TỔNG QUAN HỆ THỐNG VÀ KIẾN TRÚC

Hệ thống được chuyển đổi từ bản prototype một trang sang kiến trúc ứng dụng **Full-stack Client – Server – Database**:

- **Frontend**: Giao diện xanh mint dịu nhẹ (`#196653`), màu kem (`#f5f9f6`), thẻ bo góc mềm mại (`border-radius: 18px/22px`), hiển thị công thức chuẩn Toán học với **KaTeX**. Hỗ trợ đầy đủ thiết bị máy tính và điện thoại.
- **Backend**: Nền tảng **Node.js + Express 5** với kiến trúc RESTful APIs bảo mật cao, xác thực phiên bằng JWT Token ký HMAC-SHA256.
- **Cơ sở dữ liệu (Database)**: SQLite (`yentran.db`) sử dụng module `node:sqlite` hiệu năng cao với chế độ WAL (Write-Ahead Logging). Toàn bộ nội dung học liệu, câu hỏi trắc nghiệm, video, tài liệu, prompt và lượt truy cập được lưu trữ bền vững trên máy chủ.
- **Tích hợp Trợ lý AI**: Kết nối Google Gemini API chỉ qua backend (không lộ khóa API), định hướng Socratic "Hỏi để hiểu" và có cơ chế phản hồi dự phòng thông minh khi offline.

---

## 2. HỆ THỐNG 9 TAB CHUYÊN MỤC

1. **Trang chủ (`home`)**: Lời chào của cô Yến, các chỉ số thống kê máy chủ thời gian thực và thẻ truy cập nhanh.
2. **Hỏi bài Toán (`chat`)**: Khung tương tác AI gợi mở từng bước, đính kèm ảnh bài toán, chọn khối lớp (Toán 6 $\to$ 9).
3. **Kiến thức theo lớp (`knowledge`)**: Trọng tâm lý thuyết, công thức, ví dụ mẫu và câu hỏi tự kiểm tra theo từng khối lớp từ CSDL.
4. **Bài tập tương tác (`quiz`)**: Ngân hàng câu hỏi trắc nghiệm khách quan, ghi nhận lượt nộp bài thực tế, hiển thị gợi ý sư phạm và lời giải.
5. **Video bài giảng (`video`)**: Danh sách video bài giảng do cô kiểm duyệt theo từng khối lớp.
6. **Tài liệu học tập (`resources`)**: Phiếu học tập, đề ôn thi định dạng PDF/DOCX do cô cung cấp.
7. **Mẹo học Toán (`tips`)**: Thói quen và kỹ năng giải toán tích cực, phương pháp kiểm tra kết quả.
8. **Giới thiệu về cô (`about`)**: Giới thiệu cô Trần Thị Hải Yến và phương châm dạy học "Hỏi để hiểu".
9. **Quản trị giáo viên (`admin`)**: Khu vực bảo mật có xác thực:
   - Thống kê lượt truy cập thực tế (loại bỏ bot, lọc theo ngày/tuần/tháng/toàn bộ).
   - Thống kê tỷ lệ làm đúng bài tập, phân bố theo khối lớp và chủ đề.
   - Biên tập System Prompt cho từng tab và lưu lịch sử phiên bản.
   - Thêm/sửa/xóa câu hỏi trắc nghiệm vào ngân hàng đề.
   - Xuất dữ liệu sao lưu JSON toàn bộ hệ thống.

---

## 3. CƠ SỞ DỮ LIỆU (DATABASE SCHEMA)

Cơ sở dữ liệu đặt tại `data/yentran.db` gồm các bảng:
- `users`: Quản lý tài khoản và phân quyền (`teacher` / `student`), mật khẩu băm PBKDF2 bảo mật cao.
- `grades`: Khối lớp Toán 6, 7, 8, 9.
- `topics`: Chủ đề bài học theo từng khối lớp.
- `tab_prompts`: Hệ thống prompt chỉ dẫn AI theo từng tab, hỗ trợ đa phiên bản (`version`, `is_active`, `notes`).
- `lessons`: Bài học kiến thức lý thuyết, ví dụ và câu hỏi tự đánh giá.
- `questions`: Ngân hàng câu hỏi trắc nghiệm, các lựa chọn, đáp án đúng, gợi ý và giải thích.
- `quiz_attempts`: Nhật ký làm bài thực tế của học sinh (`is_correct`, `anonymous_session_id`, thời gian nộp).
- `visit_events`: Lượt truy cập ẩn danh (nhận diện phiên `session_id`, lọc bot User-Agent, băm IP riêng tư).
- `videos`: Liên kết video bài giảng theo khối lớp.
- `resources`: File tài liệu và phiếu học tập.
- `tips`: Mẹo học toán.

---

## 4. HƯỚNG DẪN CÀI ĐẶT VÀ CHẠY MÁY CHỦ CỤC BỘ

### Yêu cầu hệ thống
- **Node.js**: Phiên bản 18 trở lên (khuyên dùng Node.js 20 hoặc 22/24).
- Không yêu cầu cài đặt thêm database server bên ngoài (SQLite chạy trực tiếp).

### Các bước cài đặt và khởi động:

1. **Cài đặt thư viện phụ thuộc**:
   ```bash
   cd "d:\WEBAPP AI\CHATBOT\chatbot-yentran"
   npm install
   ```

2. **Cấu hình biến môi trường**:
   Sao chép `.env.example` thành `.env`:
   ```bash
   cp .env.example .env
   ```
   Chỉnh sửa tệp `.env`:
   ```ini
   PORT=3000
   GEMINI_API_KEYS=your_actual_gemini_api_key_here
   JWT_SECRET=coyen-math-secret-key-2026-production-salt
   ```

3. **Khởi động ứng dụng**:
   ```bash
   npm start
   ```
   Ứng dụng sẽ hoạt động tại: **`http://localhost:3000`**.

4. **Tài khoản đăng nhập Giáo viên (Mặc định)**:
   - **Tên đăng nhập**: `coyen`
   - **Mật khẩu**: `coYen@2026`

---

## 5. CƠ CHẾ BẢO MẬT VÀ PHÒNG CHỐNG TẤN CÔNG

- **Bảo mật khóa API**: Khóa Gemini API chỉ lưu trữ trên backend và gọi từ server, tuyệt đối không xuất hiện trong mã nguồn client.
- **Chống Bot & Spam**: Bộ lọc biểu thức chính quy nhận diện web crawler/bot (`is_bot = 1`) và tách biệt hoàn toàn khỏi số liệu người dùng thật.
- **Chống đếm trùng lượt truy cập**: Mỗi thiết bị được gán một `sessionId` ẩn danh trong `localStorage`. Các lượt tải lại trang trong vòng 30 phút cùng 1 phiên không bị đếm tăng trùng lặp.
- **Chống Prompt Injection**: Dữ liệu do học sinh gửi lên được xử lý là nội dung đầu vào (`user content`), không thể can thiệp hoặc ghi đè System Instruction của giáo viên.
- **Rate Limit**: Giới hạn tối đa 25 lượt hỏi/phút trên mỗi địa chỉ IP để chống spam API.

---

## 6. TRIỂN KHAI LÊN MÔI TRƯỜNG CLOUD (VPS / RENDER / RAILWAY / VERCEL)

- **Trên VPS / Docker / Render / Railway**:
  Chạy lệnh `npm start`, mở cổng `PORT` (mặc định 3000). Toàn bộ dữ liệu SQLite được lưu trữ tại thư mục `data/` bền vững (hãy gắn Persistent Volume cho thư mục `data/`).
- **Trên Vercel**:
  Cấu hình `GEMINI_API_KEYS` và `JWT_SECRET` trong phần **Project Settings $\to$ Environment Variables**.
