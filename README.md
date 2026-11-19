# YENTRAN AI – HỎI ĐỂ HIỂU, ÔN TẬP TOÁN THCS

**Hiểu Toán – Tự Tư Duy – Vững Tương Lai**

Trợ lý học tập và ôn tập Toán THCS (Lớp 6, 7, 8 và Chuyên đề Ôn tập Toán THCS / Ôn thi vào lớp 10) do **Cô Trần Thị Hải Yến** xây dựng.
Vận hành theo phương pháp sư phạm: **"HỎI ĐỂ HIỂU – KHÔNG LỜI GIẢI CHI TIẾT"**.

## Phương pháp sư phạm cốt lõi: "Hỏi để hiểu"

- **Không giải hộ từ đầu đến cuối**: Chatbot kiên quyết từ chối giải sẵn toàn bộ bài toán cho học sinh chép.
- **Hỏi để học sinh tự hiểu (Phương pháp gợi mở Socratic)**: Mỗi lượt trao đổi chỉ tập trung vào một bước nhỏ, đặt câu hỏi gợi ý để học sinh tự tư duy và tìm ra hướng giải quyết.
- **Tự phát hiện lỗi sai**: Khi học sinh làm sai, cô giáo AI đặt câu hỏi phản biện để học sinh tự kiểm tra lại phép tính, dấu hoặc điều kiện, giúp nhớ lâu và hiểu sâu bản chất toán học.

## Các khối lớp & chuyên đề hỗ trợ

1. **Toán Lớp 6**:
   - Số tự nhiên & tính chia hết (Ước, Bội, Số nguyên tố).
   - Số nguyên & quy tắc dấu (Cộng, trừ, nhân, chia số nguyên).
   - Phân số & số thập phân thực tế.
   - Hình học trực quan (Chu vi, diện tích chữ nhật, thoi, bình hành, thang cân).
   - Hình học phẳng cơ bản (Điểm, đường thẳng, tia, đoạn thẳng, góc).
   - Thống kê & xác suất thực nghiệm.
2. **Toán Lớp 7**:
   - Số hữu tỉ & thứ tự phép tính, lũy thừa.
   - Số thực & căn bậc hai số học.
   - Góc & hai đường thẳng song song.
   - Tam giác bằng nhau & định lý Pytago.
   - Biểu thức đại số & đa thức một biến.
   - Thống kê biểu đồ quạt tròn, đoạn thẳng & xác suất biến cố.
   - Hình khối thực tiễn (Hộp chữ nhật, lăng trụ đứng).
3. **Toán Lớp 8**:
   - Đa thức nhiều biến & 7 hằng đẳng thức đáng nhớ.
   - Phân thức đại số.
   - Hàm số bậc nhất $y = ax + b$ & đồ thị.
   - Phương trình bậc nhất một ẩn (giải bài toán thực tế bằng cách lập PT).
   - Tứ giác hình học.
   - Định lý Thalès & tam giác đồng dạng.
   - Hình chóp tam giác đều, chóp tứ giác đều.
   - Dữ liệu bảng biểu & xác suất thực nghiệm.
4. **Chuyên đề Ôn tập Toán THCS (Trọng tâm Ôn thi vào 10)**:
   - Căn thức & rút gọn biểu thức chứa căn (ĐKXĐ, tính giá trị, so sánh, min-max).
   - Hệ phương trình & bài toán lập phương trình / hệ phương trình thực tế.
   - Tương giao giữa đường thẳng và Parabol $y = ax^2$.
   - Phương trình bậc hai & ứng dụng định lý Vi-ét.
   - Hệ thức lượng trong tam giác vuông & tỉ số lượng giác góc nhọn.
   - Đường tròn & tứ giác nội tiếp (tiếp tuyến, góc nội tiếp).
   - Hình học không gian thực tế THCS (Hình trụ, nón, cầu).
   - Bài toán thực tế liên môn & bất đẳng thức Min - Max THCS.

## Cấu trúc thư mục

```
chatbot-yentran/
├── api/
│   ├── chat.js        # Serverless Function: Gemini API (xoay vòng key), prompt "Hỏi để hiểu"
│   ├── knowledge.js   # Ngân hàng kiến thức & câu hỏi gợi mở Toán THCS
│   └── stats.js       # Thống kê truy cập thời gian thực
├── public/
│   └── index.html     # Giao diện học tập (chọn Khối 6, 7, 8, Ôn THCS; chụp/gửi ảnh; KaTeX)
├── package.json
├── .gitignore
├── .env.example
├── vercel.json
└── README.md
```

## Triển khai lên Vercel

1. Đưa repository `chatbot-yentran` lên GitHub.
2. Truy cập [vercel.com](https://vercel.com) → **Add New → Project** → chọn repository `chatbot-yentran` → **Deploy**.
3. Vào **Settings → Environment Variables**, thêm:
   - `GEMINI_API_KEYS` = `key1,key2,key3,key4,key5` (ngăn cách bằng dấu phẩy)
4. Vào **Deployments → Redeploy** để cập nhật biến môi trường.
