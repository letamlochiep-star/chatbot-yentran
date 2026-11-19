// Ngân hàng kiến thức Toán THCS (Lớp 6, 7, 8) & Ôn thi Tốt nghiệp THPT (Cô Trần Thị Hải Yến)
// Biên soạn và chuẩn hóa từ hệ thống tài liệu chuyên đề của cô Trần Thị Hải Yến

const TOPICS_BY_GRADE = {
  "6": {
    name: "Toán Lớp 6",
    label: "Lớp 6",
    topics: [
      { id: "6_1", ic: "🔢", name: "Số tự nhiên & Tính chia hết (Ước, Bội, Số nguyên tố)" },
      { id: "6_2", ic: "➖", name: "Số nguyên & Quy tắc dấu (Cộng, trừ, nhân, chia số nguyên)" },
      { id: "6_3", ic: "🍕", name: "Phân số & Số thập phân (Tỉ số, tỉ số phần trăm, bài toán thực tế)" },
      { id: "6_4", ic: "📐", name: "Hình học trực quan (Chu vi, diện tích hình chữ nhật, thoi, bình hành, thang cân)" },
      { id: "6_5", ic: "📏", name: "Hình học phẳng cơ bản (Điểm, đường thẳng, tia, đoạn thẳng, góc)" },
      { id: "6_6", ic: "📊", name: "Thống kê & Xác suất thực nghiệm (Biểu đồ tranh, biểu đồ cột)" }
    ]
  },
  "7": {
    name: "Toán Lớp 7",
    label: "Lớp 7",
    topics: [
      { id: "7_1", ic: "🧮", name: "Số hữu tỉ & Thứ tự phép tính (Luỹ thừa, giá trị tuyệt đối)" },
      { id: "7_2", ic: "√",  name: "Số thực & Căn bậc hai số học (Làm tròn số, ước lượng)" },
      { id: "7_3", ic: "📐", name: "Góc & Đường thẳng song song (Góc đối đỉnh, kề bù, định lý)" },
      { id: "7_4", ic: "🔺", name: "Tam giác bằng nhau & Định lý Pytago (Các trường hợp bằng nhau, tam giác cân)" },
      { id: "7_5", ic: "✏️", name: "Biểu thức đại số & Đa thức một biến (Cộng, trừ, nhân, chia, nghiệm)" },
      { id: "7_6", ic: "📈", name: "Thống kê & Biến cố - Xác suất (Biểu đồ quạt tròn, biểu đồ đoạn thẳng)" },
      { id: "7_7", ic: "📦", name: "Hình khối trong thực tiễn (Hình hộp chữ nhật, hình lập phương, lăng trụ đứng)" }
    ]
  },
  "8": {
    name: "Toán Lớp 8",
    label: "Lớp 8",
    topics: [
      { id: "8_1", ic: "✨", name: "Đa thức nhiều biến & Hằng đẳng thức (7 hằng đẳng thức, phân tích nhân tử)" },
      { id: "8_2", ic: "🧩", name: "Phân thức đại số (Rút gọn, quy đồng, cộng trừ nhân chia)" },
      { id: "8_3", ic: "📉", name: "Hàm số bậc nhất & Đồ thị (y = ax + b, hệ số góc, bài toán thực tế)" },
      { id: "8_4", ic: "⚖️", name: "Phương trình bậc nhất một ẩn (Giải PT và bài toán thực tế bằng cách lập PT)" },
      { id: "8_5", ic: "🔷", name: "Tứ giác & Định lý hình học (Hình bình hành, chữ nhật, thoi, vuông)" },
      { id: "8_6", ic: "📐", name: "Định lý Thalès & Tam giác đồng dạng (Tỉ số đồng dạng, đường phân giác)" },
      { id: "8_7", ic: "🏛️", name: "Một số hình khối không gian (Hình chóp tam giác đều, chóp tứ giác đều)" },
      { id: "8_8", ic: "🎯", name: "Dữ liệu & Xác suất thực nghiệm (Bảng số liệu, biểu đồ, xác suất biến cố)" }
    ]
  },
  "12": {
    name: "Ôn thi Tốt nghiệp THPT",
    label: "Ôn thi THPT",
    topics: [
      { id: "12_1", ic: "📈", name: "Ứng dụng đạo hàm – Bài toán tối ưu hóa thực tiễn" },
      { id: "12_2", ic: "📊", name: "Thống kê – Số đặc trưng mẫu số liệu ghép nhóm" },
      { id: "12_3", ic: "∫",  name: "Nguyên hàm & Tích phân – Tính diện tích, thể tích thực tế" },
      { id: "12_4", ic: "🧭", name: "Phương pháp tọa độ không gian Oxyz thực tiễn (Đường, Mặt, Cầu)" },
      { id: "12_5", ic: "🎲", name: "Xác suất có điều kiện – Công thức xác suất toàn phần & Bayes" },
      { id: "12_6", ic: "🎯", name: "Xác suất cổ điển, quy tắc tính xác suất & tổ hợp" },
      { id: "12_7", ic: "📋", name: "Quy hoạch tuyến tính – Hệ bất phương trình bậc nhất hai ẩn" },
      { id: "12_8", ic: "🧮", name: "Phương trình, hệ phương trình & bài toán chuyên đề thực tiễn" }
    ]
  }
};

// Giữ nguyên mảng TOPICS mặc định của lớp 12 để tương thích ngược
const TOPICS = TOPICS_BY_GRADE["12"].topics;

const QUY_TRINH_GIAI = `
QUY TRÌNH 5 BƯỚC GIẢI BÀI TOÁN THỰC TIỄN (DÀNH CHO MỌI KHỐI LỚP 6, 7, 8, 12):
Mạch tổng quát: Bài toán thực tiễn/đề bài → Xác định thông tin, xây dựng mô hình → Bài toán toán học → Lựa chọn chiến lược → Lời giải toán học → Đánh giá kết quả → Trả lời câu hỏi thực tiễn.
- Bước 1. Tìm hiểu vấn đề, thu thập thông tin: Đọc và xác định câu hỏi thực tiễn; ghi dữ kiện đã cho, đại lượng cần tìm, đơn vị đo, giả thiết và điều kiện ràng buộc.
- Bước 2. Chuyển đổi sang mô hình toán học: Đặt ẩn (nếu cần); liên hệ đại lượng; chuyển ngôn ngữ đời sống thành biểu thức, phương trình, hàm số hoặc mô hình hình học tương ứng; nêu điều kiện của ẩn.
- Bước 3. Tìm kiếm chiến lược giải: Nhận dạng mô hình/dạng toán; lựa chọn công thức hoặc định lý phù hợp với khối lớp (Lớp 6: tính chia hết, phân số, chu vi diện tích; Lớp 7: số hữu tỉ, Pytago, tam giác bằng nhau; Lớp 8: hằng đẳng thức, phân thức, lập PT, Thalès; Lớp 12: đạo hàm, tích phân, Oxyz, xác suất...); dự kiến trình tự thực hiện.
- Bước 4. Thực hiện và trình bày lời giải: Biến đổi, tính toán, giải phương trình hoặc lập luận hình học; trình bày các bước rõ ràng, kiểm tra thao tác và kết quả trung gian.
- Bước 5. Xem xét kết quả và trả lời thực tiễn: Đối chiếu nghiệm với điều kiện, đơn vị và bối cảnh đời sống; loại nghiệm không phù hợp; xử lý quy tắc làm tròn; trả lời đúng điều đề bài hỏi bằng ngôn ngữ thực tiễn.
`;

const TIEU_CHI_DANH_GIA = `
BẢNG TIÊU CHÍ ĐÁNH GIÁ VÀ XẾP LOẠI (THANG 10 ĐIỂM):
1. Năng lực Phát hiện vấn đề (Tối đa 3 điểm):
   - Xác định vấn đề: 0đ (sai); 1đ (hiểu gần đúng, còn lỗi nhỏ); 2đ (hiểu đúng hoàn toàn).
   - Thu thập dữ kiện: 0đ (thiếu nhiều); 0.5đ (chưa đầy đủ hoặc thiếu chính xác); 1đ (đầy đủ và chính xác).
2. Năng lực Đề xuất giải pháp (Tối đa 3 điểm):
   - Mô hình hóa: 1đ (liên hệ kiến thức/thông tin liên quan); 1đ (diễn đạt đúng bằng ngôn ngữ toán học).
   - Lựa chọn giải pháp: 0đ (sai/không hiệu quả); 0.5đ (đúng nhưng còn sai sót nhỏ); 1đ (đúng và chi tiết).
3. Năng lực Giải quyết vấn đề (Tối đa 2 điểm):
   - Thực hiện và tính toán: 0đ (tính sai); 1đ (tính đúng nhưng chưa tối ưu); 2đ (tính đúng và phương pháp tối ưu).
4. Năng lực Đánh giá kết quả (Tối đa 2 điểm):
   - Xem xét, lựa chọn kết quả: Đạt yêu cầu (1đ); chưa đạt (0đ).
   - Trả lời vấn đề thực tiễn: Đạt yêu cầu (1đ); chưa đạt (0đ).
Tổng điểm: 10 điểm (3 + 3 + 2 + 2).
XẾP LOẠI:
- 8.0 – 10.0 điểm: Tốt (Xuất sắc)
- 6.5 – dưới 8.0 điểm: Khá
- 5.0 – dưới 6.5 điểm: Trung bình (Đạt)
- Dưới 5.0 điểm: Yếu (Cần cố gắng)
`;

const KNOWLEDGE_BANK = `
NGÂN HÀNG KIẾN THỨC VÀ BÀI TOÁN TRỌNG TÂM THEO CÁC KHỐI LỚP (CÔ TRẦN THỊ HẢI YẾN):

============================================================
PHẦN A: TOÁN LỚP 6
============================================================
1. SỐ TỰ NHIÊN & TÍNH CHIA HẾT:
- Luỹ thừa với số mũ tự nhiên: $a^n = a \\cdot a \\dots a$ ($n$ thừa số $a$), $a^m \\cdot a^n = a^{m+n}$, $a^m : a^n = a^{m-n}$ ($a \\neq 0, m \\ge n$).
- Quan hệ chia hết: $a = b \\cdot q + r$ ($0 \\le r < b$). Chia hết khi $r = 0$.
- Dấu hiệu chia hết cho 2, 5 (chữ số tận cùng); cho 3, 9 (tổng các chữ số).
- Số nguyên tố là số tự nhiên lớn hơn 1, chỉ có hai ước là 1 và chính nó. Hợp số có nhiều hơn 2 ước.
- ƯCLN và BCNN: Ứng dụng chia đều quà, xếp hàng học sinh, tìm chu kỳ gặp nhau của các tín hiệu đèn.

2. SỐ NGUYÊN & PHÉP TÍNH:
- Tập hợp số nguyên $\\mathbb{Z} = \\{\\dots, -3, -2, -1, 0, 1, 2, 3, \\dots\\}$. Số đối của $a$ là $-a$.
- Quy tắc cộng hai số nguyên cùng dấu, khác dấu. Quy tắc nhân, chia cùng dấu (dương), khác dấu (âm).
- Quy tắc dấu ngoặc: Đằng trước có dấu \"+\" giữ nguyên, đằng trước dấu \"-\" đổi dấu tất cả số hạng bên trong.
- Ứng dụng thực tế: Độ cao dưới mực nước biển, nhiệt độ dưới $0^\\circ\\text{C}$, số tiền nợ/lời trong kinh doanh.

3. PHÂN SỐ & SỐ THẬP PHÂN:
- Phân số bằng nhau: $\\frac{a}{b} = \\frac{c}{d} \\iff a \\cdot d = b \\cdot c$. Rút gọn phân số về tối giản.
- Các phép tính cộng, trừ, nhân, chia phân số và số thập phân.
- Ba bài toán cơ bản về phân số:
  + Tìm giá trị phân số $\\frac{m}{n}$ của số $a$: lấy $a \\cdot \\frac{m}{n}$.
  + Tìm một số biết $\\frac{m}{n}$ của nó bằng $b$: lấy $b : \\frac{m}{n}$.
  + Tìm tỉ số của hai số $a$ và $b$: lấy $\\frac{a}{b}$; tỉ số phần trăm: $\\frac{a}{b} \\cdot 100\\%$.
- Bài toán thực tế: Tính tiền giảm giá (sale off), tính lãi suất, pha chế tỉ lệ nước chanh, bản đồ tỉ lệ.

4. HÌNH HỌC TRỰC QUAN & HÌNH HỌC PHẲNG:
- Tam giác đều, hình vuông, lục giác đều (các cạnh bằng nhau, các góc bằng nhau).
- Hình chữ nhật: Chu vi $C = 2(a + b)$, Diện tích $S = a \\cdot b$.
- Hình thoi: Chu vi $C = 4a$, Diện tích $S = \\frac{1}{2} d_1 \\cdot d_2$.
- Hình bình hành: Diện tích $S = a \\cdot h$.
- Hình thang cân: Diện tích $S = \\frac{(a + b) \\cdot h}{2}$.
- Điểm, đường thẳng, tia, đoạn thẳng, trung điểm của đoạn thẳng; góc nhọn, góc vuông, góc tù, góc bẹt.
- Bài toán thực tế: Tính chi phí lát gạch sân vườn, làm hàng rào quanh khu đất, tính lượng sơn tường.

============================================================
PHẦN B: TOÁN LỚP 7
============================================================
1. SỐ HỮU TỈ & SỐ THỰC:
- Số hữu tỉ viết được dưới dạng $\\frac{a}{b}$ ($a, b \\in \\mathbb{Z}, b \\neq 0$). Tập hợp $\\mathbb{Q}$.
- Luỹ thừa của số hữu tỉ: $(x^m)^n = x^{m \\cdot n}$, $(x \\cdot y)^n = x^n \\cdot y^n$, $(\\frac{x}{y})^n = \\frac{x^n}{y^n}$.
- Thứ tự thực hiện phép tính và quy tắc chuyển vế: Khi chuyển một số hạng từ vế này sang vế kia phải đổi dấu.
- Căn bậc hai số học của số $a \\ge 0$ là số $x \\ge 0$ sao cho $x^2 = a$, ký hiệu $\\sqrt{a}$.
- Số vô tỉ (số thập phân vô hạn không tuần hoàn, ví dụ $\\sqrt{2}, \\pi$). Tập hợp số thực $\\mathbb{R}$.

2. HÌNH HỌC PHẲNG & ĐỊNH LÝ PYTAGO:
- Hai góc đối đỉnh thì bằng nhau. Hai góc kề bù có tổng số đo bằng $180^\\circ$.
- Dấu hiệu hai đường thẳng song song: Hai góc so le trong bằng nhau hoặc hai góc đồng vị bằng nhau. Tiên đề Euclid.
- Tổng ba góc trong một tam giác bằng $180^\\circ$.
- Các trường hợp bằng nhau của tam giác thường: c-c-c, c-g-c, g-c-g. Các trường hợp tam giác vuông (cạnh huyền - góc nhọn, cạnh huyền - cạnh góc vuông).
- Tam giác cân: Có 2 cạnh bằng nhau $\\iff$ 2 góc ở đáy bằng nhau.
- Định lý Pytago trong tam giác vuông: $a^2 + b^2 = c^2$ ($c$ là cạnh huyền). Định lý đảo dùng để kiểm tra tam giác vuông.
- Ứng dụng thực tế: Chiều dài thang dựa vào tường, khoảng cách đường chéo màn hình tivi, đo đạc cọc tiêu ngoài trời.

3. BIỂU THỨC ĐẠI SỐ & ĐA THỨC MỘT BIẾN:
- Biểu thức số, biểu thức chứa chữ. Giá trị của biểu thức tại giá trị cho trước của biến.
- Đơn thức, đa thức một biến; thu gọn và sắp xếp đa thức theo luỹ thừa giảm dần.
- Bậc, hệ số cao nhất, hệ số tự do của đa thức.
- Cộng, trừ, nhân, chia đa thức một biến. Nghiệm của đa thức $P(x)$ là giá trị $a$ sao cho $P(a) = 0$.

4. HÌNH KHỐI TRONG THỰC TIỄN:
- Hình hộp chữ nhật: $S_{xq} = 2(a + b) \\cdot h$, $V = a \\cdot b \\cdot h$.
- Hình lập phương: $S_{xq} = 4a^2$, $S_{tp} = 6a^2$, $V = a^3$.
- Hình lăng trụ đứng tam giác / tứ giác: $S_{xq} = C_{\\text{đáy}} \\cdot h$, $V = S_{\\text{đáy}} \\cdot h$.
- Bài toán thực tế: Thể tích bể bơi, bao bì hộp quà, thùng xe tải chở hàng, dựng lều trại tam giác.

============================================================
PHẦN C: TOÁN LỚP 8
============================================================
1. ĐA THỨC NHIỀU BIẾN & HẰNG ĐẲNG THỨC:
- 7 Hằng đẳng thức đáng nhớ:
  1) $(A + B)^2 = A^2 + 2AB + B^2$
  2) $(A - B)^2 = A^2 - 2AB + B^2$
  3) $A^2 - B^2 = (A - B)(A + B)$
  4) $(A + B)^3 = A^3 + 3A^2B + 3AB^2 + B^3$
  5) $(A - B)^3 = A^3 - 3A^2B + 3AB^2 - B^3$
  6) $A^3 + B^3 = (A + B)(A^2 - AB + B^2)$
  7) $A^3 - B^3 = (A - B)(A^2 + AB + B^2)$
- Phân tích đa thức thành nhân tử: Đặt nhân tử chung, dùng hằng đẳng thức, nhóm hạng tử, tách hạng tử.

2. PHÂN THỨC ĐẠI SỐ:
- Định nghĩa phân thức $\\frac{A}{B}$ ($B \\neq 0$). Điều kiện xác định của phân thức.
- Tính chất cơ bản của phân thức; rút gọn phân thức.
- Các phép tính cộng, trừ, nhân, chia phân thức đại số.

3. HÀM SỐ BẬC NHẤT & ĐỒ THỊ:
- Hàm số bậc nhất $y = ax + b$ ($a \\neq 0$). Đồng biến khi $a > 0$, nghịch biến khi $a < 0$.
- Đồ thị là đường thẳng cắt trục tung tại $(0; b)$ và trục hoành tại $(-\\frac{b}{a}; 0)$. Hệ số góc $a$.
- Vị trí tương đối của hai đường thẳng $y = ax + b$ và $y = a'x + b'$: Cắt nhau khi $a \\neq a'$; Song song khi $a = a'$ và $b \\neq b'$; Trùng nhau khi $a = a'$ và $b = b'$.
- Bài toán thực tế: Giá cước taxi ($y = 15000 + 12000(x-1)$), hóa đơn tiền điện/nước, nhiệt độ Fahrenheit theo Celsius.

4. PHƯƠNG TRÌNH BẬC NHẤT MỘT ẨN:
- Dạng $ax + b = 0$ ($a \\neq 0$) $\\iff x = -\\frac{b}{a}$.
- Giải bài toán bằng cách lập phương trình:
  + Dạng 1: Chuyển động ($s = v \\cdot t$; ngược chiều, cùng chiều, dòng nước $v_{\\text{xuôi}} = v_{\\text{thuyền}} + v_{\\text{nước}}$).
  + Dạng 2: Năng suất, làm chung làm riêng ($A = N \\cdot t$, quy ước công việc là 1 đơn vị).
  + Dạng 3: Bài toán kinh tế, pha chế dung dịch, phần trăm.

5. HÌNH HỌC PHẲNG & ĐỊNH LÝ THALÈS:
- Tứ giác: Hình thang, hình thang cân, hình bình hành, hình chữ nhật, hình thoi, hình vuông (định nghĩa, tính chất, dấu hiệu nhận biết).
- Định lý Thalès trong tam giác: Nếu một đường thẳng song song với một cạnh của tam giác và cắt hai cạnh còn lại thì nó định ra trên hai cạnh đó những đoạn thẳng tương ứng tỉ lệ.
- Tính chất đường phân giác trong tam giác: $\\frac{DB}{DC} = \\frac{AB}{AC}$.
- Tam giác đồng dạng: Ba trường hợp c-c-c, c-g-c, g-g. Tỉ số diện tích bằng bình phương tỉ số đồng dạng ($S/S' = k^2$).
- Hình chóp tam giác đều, chóp tứ giác đều: $S_{xq} = p \\cdot d$ ($p$ là nửa chu vi đáy, $d$ là trung đoạn), $V = \\frac{1}{3} S_{\\text{đáy}} \\cdot h$.
- Ứng dụng thực tế: Đo chiều cao của cây/tòa nhà bằng bóng râm hoặc gương phẳng, tính khoảng cách giữa 2 điểm không thể đo trực tiếp.

============================================================
PHẦN D: ÔN THI TỐT NGHIỆP THPT (LỚP 12 - GIỮ NGUYÊN 8 CHỦ ĐỀ CỐT LÕI)
============================================================
CHỦ ĐỀ 1: ỨNG DỤNG ĐẠO HÀM – BÀI TOÁN TỐI ƯU HÓA THỰC TIỄN
- Tìm GTLN, GTNN của $y = f(x)$ trên miền $D$ để tối ưu hóa chi phí, thể tích, lợi nhuận, diện tích.
- Cắt góc tấm bìa $a \\times b$ làm hộp thể tích $V(x) = x(a - 2x)(b - 2x)$ lớn nhất.
- Lợi nhuận cực đại: $P(x) = R(x) - C(x) \\implies P'(x) = 0$.

CHỦ ĐỀ 2: THỐNG KÊ – SỐ ĐẶC TRƯNG MẪU SỐ LIỆU GHÉP NHÓM
- Số trung bình $\\bar{x}$, Mốt $M_o$, Trung vị $M_e$, Tứ phân vị $Q_1, Q_2, Q_3$, Phương sai $s^2$, độ lệch chuẩn $s$.

CHỦ ĐỀ 3: NGUYÊN HÀM & TÍCH PHÂN – DIỆN TÍCH, THỂ TÍCH THỰC TẾ
- Diện tích $S = \\int_a^b |f(x)| dx$, thể tích tròn xoay $V = \\pi \\int_a^b [f(x)]^2 dx$. Mặt cắt kênh dẫn nước, bồn hoa elip, bồn chứa xăng dầu.

CHỦ ĐỀ 4: PHƯƠNG PHÁP TỌA ĐỘ TRONG KHÔNG GIAN OXYZ THỰC TIỄN
- Mặt phẳng $(\\alpha)$, đường thẳng $d$, mặt cầu $(S)$. Radar không lưu, quỹ đạo bay máy bay, mái nhà đón nắng.

CHỦ ĐỀ 5: XÁC SUẤT CÓ ĐIỀU KIỆN – CÔNG THỨC XÁC SUẤT TOÀN PHẦN & BAYES
- $P(A|B) = \\frac{P(A \\cap B)}{P(B)}$, công thức Bayes $P(A_k|B) = \\frac{P(A_k) P(B|A_k)}{P(B)}$. Xét nghiệm y tế, sàng lọc bệnh, rủi ro tín dụng.

CHỦ ĐỀ 6: XÁC SUẤT CỔ ĐIỂN, QUY TẮC TÍNH XÁC SUẤT & TỔ HỢP
- Hoán vị, Chỉnh hợp, Tổ hợp; biến cố độc lập $P(AB) = P(A)P(B)$. Kiểm định lô hàng, bắn súng, mạch điện nối tiếp/song song.

CHỦ ĐỀ 7: QUY HOẠCH TUYẾN TÍNH – HỆ BẤT PHƯƠNG TRÌNH BẬC NHẤT HAI ẨN
- Thiết lập hệ BPT miền nghiệm đa giác lồi, tìm max/min hàm mục tiêu $F(x, y) = ax + by$ tại các đỉnh. Bài toán dinh dưỡng, phân bổ ca máy.

CHỦ ĐỀ 8: PHƯƠNG TRÌNH, HỆ PHƯƠNG TRÌNH & BÀI TOÁN LIÊN MÔN THỰC TIỄN
- Lãi đơn, lãi kép $A = P(1+r)^n$, phương trình chuyển động $v(t) = s'(t)$, pha chế hóa học, mạch điện Kirchhoff.
`;

module.exports = {
  TOPICS_BY_GRADE,
  TOPICS,
  QUY_TRINH_GIAI,
  TIEU_CHI_DANH_GIA,
  KNOWLEDGE_BANK
};
