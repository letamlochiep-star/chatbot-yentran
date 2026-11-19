# YENTRAN AI – TRỢ LÝ HỌC TẬP VÀ HỎI BÀI TOÁN

**Hiểu Toán – Giải Thực Tiễn – Vững Tương Lai**

Trợ lý học tập và ôn luyện Toán THCS (Lớp 6, 7, 8) và Ôn thi Tốt nghiệp THPT (Lớp 12) do **Cô Trần Thị Hải Yến** xây dựng.
Chạy bằng Gemini API (tự động xoay vòng 5–10 key), triển khai trên Vercel.

## Tính năng nổi bật

1. **Hỗ trợ học bài đa khối lớp**:
   - **Lớp 6**: Số tự nhiên & tính chia hết, số nguyên & quy tắc dấu, phân số & số thập phân, hình học trực quan và thống kê thực nghiệm.
   - **Lớp 7**: Số hữu tỉ & số thực, góc & hai đường thẳng song song, tam giác bằng nhau & định lý Pytago, biểu thức đại số, hình khối thực tiễn.
   - **Lớp 8**: Đa thức & 7 hằng đẳng thức đáng nhớ, phân thức đại số, hàm số bậc nhất $y = ax + b$, giải bài toán bằng cách lập phương trình, tứ giác & định lý Thalès, hình chóp đều.
   - **Ôn thi Tốt nghiệp THPT (Lớp 12)**: Giữ nguyên 8 chủ đề trọng tâm (ứng dụng đạo hàm, thống kê số liệu ghép nhóm, tích phân, Oxyz thực tiễn, xác suất có điều kiện & Bayes, xác suất cổ điển & tổ hợp, quy hoạch tuyến tính, phương trình & bài toán chuyên đề).
2. **Quy trình 5 bước giải bài toán thực tiễn**: Tìm hiểu thu thập thông tin → Mô hình hóa toán học → Chiến lược giải → Lời giải chi tiết → Đánh giá và trả lời thực tiễn.
3. **Đánh giá & chấm điểm theo thang 10**: 4 tiêu chí năng lực (Phát hiện vấn đề, Đề xuất giải pháp, Giải quyết vấn đề, Đánh giá kết quả).
4. **Hỗ trợ chụp và gửi ảnh bài tập**: Học sinh có thể gửi ảnh đề bài hoặc bài giải viết tay để AI đọc và hướng dẫn / chấm bài.
5. **Định dạng công thức Toán học chuẩn KaTeX**: Công thức sắc nét, chuẩn SGK.
6. **Thống kê lượt truy cập theo thời gian thực**.

## Cấu trúc thư mục

```
chatbot-yentran/
├── api/
│   ├── chat.js        # Hàm serverless: giữ API key, system prompt, xoay vòng key
│   ├── knowledge.js   # Ngân hàng kiến thức Toán 6, 7, 8 và Ôn thi THPT
│   └── stats.js       # Thống kê lượt truy cập
├── public/
│   └── index.html     # Giao diện học tập (cột trái chọn khối lớp & chủ đề, cột phải trò chuyện)
├── package.json
├── .gitignore
├── .env.example       # Mẫu biến môi trường
├── vercel.json
└── README.md
```

## Triển khai lên Vercel

1. Đưa repository `chatbot-yentran` lên GitHub.
2. Truy cập [vercel.com](https://vercel.com) → **Add New → Project** → chọn repository `chatbot-yentran` → **Deploy**.
3. Vào **Settings → Environment Variables**, thêm:
   - `GEMINI_API_KEYS` = `key1,key2,key3,key4,key5` (ngăn cách bằng dấu phẩy)
4. Vào **Deployments → Redeploy** để cập nhật biến môi trường.
