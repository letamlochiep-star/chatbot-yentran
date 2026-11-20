// Ngân hàng kiến thức Toán THCS (Lớp 6, 7, 8 và Chuyên đề Ôn tập Toán THCS)
// Xây dựng bởi Cô Trần Thị Hải Yến – Định hướng "Hỏi để hiểu – Không lời giải chi tiết"

const TOPICS_BY_GRADE = {
  "6": {
    name: "Toán Lớp 6",
    label: "Lớp 6",
    topics: [
      { id: "6_1", ic: "🔢", name: "Số tự nhiên & Tính chia hết (Ước, Bội, Số nguyên tố)" },
      { id: "6_2", ic: "➖", name: "Số nguyên & Quy tắc dấu (Cộng, trừ, nhân, chia số nguyên)" },
      { id: "6_3", ic: "🍕", name: "Phân số & Số thập phân (Tỉ số, tỉ số phần trăm, bài toán thực tế)" },
      { id: "6_4", ic: "📐", name: "Hình học trực quan (Chu vi, diện tích chữ nhật, thoi, bình hành, thang cân)" },
      { id: "6_5", ic: "📏", name: "Hình học phẳng cơ bản (Điểm, đường thẳng, tia, đoạn thẳng, góc)" },
      { id: "6_6", ic: "📊", name: "Thống kê & Xác suất thực nghiệm (Biểu đồ tranh, biểu đồ cột)" }
    ]
  },
  "7": {
    name: "Toán Lớp 7",
    label: "Lớp 7",
    topics: [
      { id: "7_1", ic: "🧮", name: "Số hữu tỉ & Thứ tự phép tính (Lũy thừa, giá trị tuyệt đối)" },
      { id: "7_2", ic: "√",  name: "Số thực & Căn bậc hai số học (Làm tròn số, ước lượng)" },
      { id: "7_3", ic: "📐", name: "Góc & Đường thẳng song song (Góc đối đỉnh, kề bù, so le trong)" },
      { id: "7_4", ic: "🔺", name: "Tam giác bằng nhau & Định lý Pytago (Các trường hợp bằng nhau, tam giác cân)" },
      { id: "7_5", ic: "✏️", name: "Biểu thức đại số & Đa thức một biến (Cộng trừ nhân chia, nghiệm)" },
      { id: "7_6", ic: "📈", name: "Thống kê & Biến cố - Xác suất (Biểu đồ quạt tròn, biểu đồ đoạn thẳng)" },
      { id: "7_7", ic: "📦", name: "Hình khối trong thực tiễn (Hình hộp chữ nhật, lập phương, lăng trụ đứng)" }
    ]
  },
  "8": {
    name: "Toán Lớp 8",
    label: "Lớp 8",
    topics: [
      { id: "8_1", ic: "✨", name: "Đa thức nhiều biến & Hằng đẳng thức (7 hằng đẳng thức, phân tích nhân tử)" },
      { id: "8_2", ic: "🧩", name: "Phân thức đại số (Rút gọn, quy đồng, cộng trừ nhân chia)" },
      { id: "8_3", ic: "📉", name: "Hàm số bậc nhất & Đồ thị (y = ax + b, hệ số góc, ứng dụng thực tế)" },
      { id: "8_4", ic: "⚖️", name: "Phương trình bậc nhất một ẩn (Giải PT và bài toán thực tế bằng cách lập PT)" },
      { id: "8_5", ic: "🔷", name: "Tứ giác & Định lý hình học (Hình bình hành, chữ nhật, thoi, vuông)" },
      { id: "8_6", ic: "📐", name: "Định lý Thalès & Tam giác đồng dạng (Tỉ số đồng dạng, đường phân giác)" },
      { id: "8_7", ic: "🏛️", name: "Một số hình khối không gian (Hình chóp tam giác đều, chóp tứ giác đều)" },
      { id: "8_8", ic: "🎯", name: "Dữ liệu & Xác suất thực nghiệm (Bảng số liệu, biểu đồ, xác suất biến cố)" }
    ]
  },
  "9": {
    name: "Toán Lớp 9",
    label: "Toán 9",
    topics: [
      { id: "9_1", ic: "⚖️", name: "Phương trình & Hệ hai phương trình bậc nhất 2 ẩn" },
      { id: "9_2", ic: "⚡", name: "Phương trình & Bất phương trình bậc nhất 1 ẩn" },
      { id: "9_3", ic: "√",  name: "Căn bậc hai & Căn bậc ba (Rút gọn biểu thức chứa căn)" },
      { id: "9_4", ic: "📐", name: "Hệ thức lượng trong tam giác vuông & Tỉ số lượng giác góc nhọn" },
      { id: "9_5", ic: "⭕", name: "Đường tròn & Góc với đường tròn (Tiếp tuyến, góc nội tiếp)" },
      { id: "9_6", ic: "📉", name: "Hàm số y = ax² & Phương trình bậc hai một ẩn (Định lý Vi-ét)" },
      { id: "9_7", ic: "📊", name: "Tần số, tần số tương đối & Xác suất của biến cố" },
      { id: "9_8", ic: "🏛️", name: "Một số hình khối trong thực tiễn (Hình trụ, hình nón, hình cầu)" }
    ]
  }
};

const TOPICS = TOPICS_BY_GRADE["6"].topics;

const QUY_TRINH_GIAI = `
QUY TRÌNH HỎI ĐỂ HIỂU – 5 BƯỚC TƯ DUY TOÁN THCS (KHÔNG GIẢI HỘ, HỎI ĐỂ HỌC SINH TỰ LÀM):
Mạch tổng quát: Đặt câu hỏi tìm hiểu thông tin → Đặt câu hỏi xây dựng mô hình toán → Đặt câu hỏi chọn chiến lược → Đặt câu hỏi gợi ý bước biến đổi → Đặt câu hỏi kiểm tra và đánh giá kết quả.
- Bước 1. Tìm hiểu đề bài (Hỏi để hiểu dữ kiện): Hỏi học sinh xem đề bài đã cho những gì, yêu cầu tìm gì, có điều kiện gì cần lưu ý không.
- Bước 2. Mô hình hóa (Hỏi để chọn cách gọi ẩn/công thức): Hỏi học sinh nên gọi ẩn là gì, đơn vị và điều kiện của ẩn ra sao; công thức liên quan trực tiếp đến bài này là gì.
- Bước 3. Chiến lược giải (Hỏi để tìm hướng đi): Hỏi học sinh có thể áp dụng định lý nào (Pytago, Thalès, Vi-ét, góc nội tiếp...) hoặc phương pháp nào (thế, cộng đại số, phân tích nhân tử...).
- Bước 4. Thực hiện lời giải (Từng bước nhỏ): Cho học sinh tự tính toán từng dòng. Nếu học sinh bị tắc, chỉ hỏi gợi mở đúng dòng bị tắc, tuyệt đối không viết sẵn cả bài giải.
- Bước 5. Đánh giá và kết luận (Hỏi để tự kiểm tra): Hỏi học sinh đối chiếu nghiệm với điều kiện xác định, đơn vị thực tế xem có hợp lý không trước khi đưa ra kết luận.
`;

const TIEU_CHI_DANH_GIA = `
BẢNG TIÊU CHÍ ĐÁNH GIÁ NĂNG LỰC TOÁN THCS (THANG 10 ĐIỂM):
1. Năng lực Hiểu đề & Phát hiện vấn đề (Tối đa 3 điểm):
   - Nêu đúng dữ kiện và câu hỏi đề bài: 2đ.
   - Nêu đủ điều kiện xác định/điều kiện ẩn: 1đ.
2. Năng lực Đề xuất hướng giải & Mô hình hóa (Tối đa 3 điểm):
   - Đặt ẩn/thiết lập biểu thức hoặc vẽ hình chính xác: 2đ.
   - Chọn đúng công thức/định lý phù hợp: 1đ.
3. Năng lực Biến đổi & Tính toán (Tối đa 2 điểm):
   - Tính toán đúng, biến đổi logic: 2đ (sai sót nhỏ trừ 0.5 - 1đ).
4. Năng lực Đánh giá & Kết luận thực tế (Tối đa 2 điểm):
   - Đối chiếu điều kiện, loại nghiệm ngoại lai: 1đ.
   - Kết luận chuẩn xác, đúng yêu cầu đề bài: 1đ.
XẾP LOẠI: 8.0 - 10.0: Tốt | 6.5 - dưới 8.0: Khá | 5.0 - dưới 6.5: Đạt | Dưới 5.0: Cần cố gắng.
`;

const KNOWLEDGE_BANK = `
NGÂN HÀNG KIẾN THỨC VÀ CÂU HỎI GỢI MỞ ÔN TẬP TOÁN THCS (CÔ TRẦN THỊ HẢI YẾN):

============================================================
PHẦN 1: TOÁN LỚP 6
============================================================
- Số tự nhiên: Thứ tự thực hiện phép tính; $a^m \\cdot a^n = a^{m+n}$; tính chia hết cho 2, 3, 5, 9; ƯCLN, BCNN; số nguyên tố và hợp số.
  * Câu hỏi gợi mở tiêu biểu: "Số nguyên tố là số như thế nào?", "Muốn chia đều số bánh kẹo vào các đĩa ta tìm ƯCLN hay BCNN?".
- Số nguyên: Cộng trừ nhân chia số nguyên cùng dấu, khác dấu; quy tắc chuyển vế và bỏ dấu ngoặc.
  * Câu hỏi gợi mở: "Đằng trước dấu ngoặc có dấu trừ, khi bỏ ngoặc ta phải làm gì?".
- Phân số & Số thập phân: Rút gọn phân số; cộng trừ nhân chia; 3 bài toán cơ bản về phân số ($a \\cdot \\frac{m}{n}$, $b : \\frac{m}{n}$, $\\frac{a}{b} \\cdot 100\\%$).
- Hình học trực quan: Tam giác đều, lục giác đều, hình vuông, hình chữ nhật ($S = a \\cdot b$), hình thoi ($S = \\frac{1}{2} d_1 d_2$), hình bình hành ($S = a \\cdot h$), hình thang cân ($S = \\frac{(a+b)h}{2}$).

============================================================
PHẦN 2: TOÁN LỚP 7
============================================================
- Số hữu tỉ & Số thực: Các phép tính trên $\\mathbb{Q}$, lũy thừa; số vô tỉ, căn bậc hai số học $\\sqrt{a}$ ($a \\ge 0$).
  * Câu hỏi gợi mở: "Một số muốn có căn bậc hai số học thì số đó phải có điều kiện gì?".
- Góc & Đường thẳng song song: Hai góc đối đỉnh (bằng nhau), hai góc kề bù (tổng bằng $180^\\circ$); dấu hiệu hai đường thẳng song song (so le trong, đồng vị bằng nhau).
- Tam giác bằng nhau: 3 trường hợp c-c-c, c-g-c, g-c-g; các trường hợp của tam giác vuông; tam giác cân; định lý Pytago trong tam giác vuông: $a^2 + b^2 = c^2$.
  * Câu hỏi gợi mở: "Trong tam giác vuông, bình phương cạnh huyền bằng gì?", "Hai tam giác này đã có những yếu tố nào bằng nhau rồi?".
- Biểu thức đại số: Đơn thức, đa thức một biến, cộng trừ nhân chia đa thức, nghiệm của đa thức.
- Hình khối thực tế: Hình hộp chữ nhật ($V = abh$, $S_{xq} = 2(a+b)h$), hình lập phương ($V = a^3$), hình lăng trụ đứng ($V = S_{\\text{đáy}} \\cdot h$).

============================================================
PHẦN 3: TOÁN LỚP 8
============================================================
- Đa thức nhiều biến & 7 hằng đẳng thức đáng nhớ:
  1) $(A+B)^2 = A^2 + 2AB + B^2$
  2) $(A-B)^2 = A^2 - 2AB + B^2$
  3) $A^2 - B^2 = (A-B)(A+B)$
  4) $(A+B)^3 = A^3 + 3A^2B + 3AB^2 + B^3$
  5) $(A-B)^3 = A^3 - 3A^2B + 3AB^2 - B^3$
  6) $A^3 + B^3 = (A+B)(A^2 - AB + B^2)$
  7) $A^3 - B^3 = (A-B)(A^2 + AB + B^2)$
  * Câu hỏi gợi mở: "Biểu thức này có dạng hiệu hai bình phương không?", "Nhân tử chung của các hạng tử là gì?".
- Phân thức đại số: Điều kiện xác định ($B \\neq 0$), rút gọn phân thức, quy đồng mẫu thức.
- Hàm số bậc nhất $y = ax + b$ ($a \\neq 0$): Đồng biến khi $a > 0$, nghịch biến khi $a < 0$. Hai đường thẳng song song ($a = a', b \\neq b'$), cắt nhau ($a \\neq a'$).
- Phương trình bậc nhất một ẩn: $ax + b = 0$. Giải bài toán bằng cách lập phương trình (dạng chuyển động $s = v \\cdot t$, năng suất, phần trăm).
- Tứ giác & Định lý Thalès: Hình bình hành, chữ nhật, thoi, vuông; Định lý Thalès thuận và đảo; Tam giác đồng dạng (c-c-c, c-g-c, g-g); Hình chóp tam giác đều, chóp tứ giác đều ($V = \\frac{1}{3} S_{\\text{đáy}} \\cdot h$).

============================================================
PHẦN 4: TOÁN LỚP 9
============================================================
CHỦ ĐỀ 1: CĂN THỨC BẬC HAI & RÚT GỌN BIỂU THỨC
- Điều kiện có nghĩa: $\\sqrt{A}$ có nghĩa khi $A \\ge 0$.
- Hằng đẳng thức: $\\sqrt{A^2} = |A| = A$ nếu $A \\ge 0$, và $-A$ nếu $A < 0$.
- Trục căn thức ở mẫu, nhân liên hợp: $\\frac{1}{\\sqrt{A} \\pm \\sqrt{B}} = \\frac{\\sqrt{A} \\mp \\sqrt{B}}{A - B}$.
- Các câu hỏi phụ: Tính giá trị biểu thức khi biết $x$; Tìm $x$ để biểu thức đạt giá trị nguyên; So sánh biểu thức với một số $k$; Tìm GTLN/GTNN.
* Câu hỏi gợi mở: "Điều kiện xác định của biểu thức này là gì?", "Mẫu thức chung nhỏ nhất em chọn là bao nhiêu?", "Để tìm $x$ nguyên thì tử thức phải quan hệ thế nào với mẫu thức?".

CHỦ ĐỀ 2: HỆ PHƯƠNG TRÌNH & BÀI TOÁN LẬP PHƯƠNG TRÌNH / HỆ PHƯƠNG TRÌNH
- Hệ phương trình bậc nhất 2 ẩn: Giải bằng phương pháp thế hoặc cộng đại số.
- Các dạng toán thực tế lập PT/Hệ PT:
  + Dạng chuyển động: Đường bộ, đường thủy xuôi/ngược dòng ($v_{\\text{xuôi}} = v_t + v_n$, $v_{\\text{ngược}} = v_t - v_n$).
  + Dạng làm chung - làm riêng (năng suất): Quy ước cả công việc là 1, năng suất 1 ngày là $\\frac{1}{x}$.
  + Dạng toán kinh tế, phần trăm, lãi suất, chu vi diện tích hình học.
* Câu hỏi gợi mở: "Đề bài có hai đại lượng chưa biết, em sẽ chọn đại lượng nào làm $x$ và $y$?", "Mối liên hệ giữa vận tốc xuôi và vận tốc ngược là gì?".

CHỦ ĐỀ 3: HÀM SỐ BẬC NHẤT VÀ PARABOL $y = ax^2$ ($a \\neq 0$)
- Đồ thị Parabol $(P): y = ax^2$: Đỉnh $O(0;0)$, nhận $Oy$ làm trục đối xứng.
- Phương trình hoành độ giao điểm giữa Parabol $(P)$ và đường thẳng $(d): y = mx + n$:
  $$ax^2 = mx + n \\iff ax^2 - mx - n = 0$$
- Số giao điểm tương ứng với số nghiệm của phương trình hoành độ: $\\Delta > 0$ (cắt tại 2 điểm phân biệt), $\\Delta = 0$ (tiếp xúc), $\\Delta < 0$ (không giao nhau).
* Câu hỏi gợi mở: "Để tìm tọa độ giao điểm của $(P)$ và $(d)$, bước đầu tiên ta lập phương trình gì?", "Đường thẳng tiếp xúc với Parabol khi biệt thức $\\Delta$ có giá trị bằng mấy?".

CHỦ ĐỀ 4: PHƯƠNG TRÌNH BẬC HAI & ĐỊNH LÝ VI-ÉT
- Phương trình $ax^2 + bx + c = 0$ ($a \\neq 0$): $\\Delta = b^2 - 4ac$ (hoặc $\\Delta' = b'^2 - ac$).
- Định lý Vi-ét: Nếu phương trình có hai nghiệm $x_1, x_2$ thì:
  $$\\begin{cases} S = x_1 + x_2 = -\\dfrac{b}{a} \\\\[2mm] P = x_1 \\cdot x_2 = \\dfrac{c}{a} \\end{cases}$$
- Các hệ thức quen thuộc:
  + $x_1^2 + x_2^2 = (x_1 + x_2)^2 - 2x_1 x_2 = S^2 - 2P$
  + $\\dfrac{1}{x_1} + \\dfrac{1}{x_2} = \\dfrac{x_1 + x_2}{x_1 x_2} = \\dfrac{S}{P}$
  + $|x_1 - x_2| = \\sqrt{(x_1 + x_2)^2 - 4x_1 x_2} = \\sqrt{S^2 - 4P}$
* Câu hỏi gợi mở: "Điều kiện để phương trình có hai nghiệm phân biệt là gì?", "Biểu thức $x_1^2 + x_2^2$ biến đổi theo tổng $S$ và tích $P$ như thế nào?".

CHỦ ĐỀ 5: HỆ THỨC LƯỢNG TRONG TAM GIÁC VUÔNG & LƯỢNG GIÁC
- Cho $\\Delta ABC$ vuông tại $A$, đường cao $AH$:
  + $AB^2 = BH \\cdot BC$; $AC^2 = CH \\cdot BC$
  + $AH^2 = BH \\cdot CH$
  + $AB \\cdot AC = AH \\cdot BC$
  + $\\dfrac{1}{AH^2} = \\dfrac{1}{AB^2} + \\dfrac{1}{AC^2}$
- Tỉ số lượng giác góc nhọn: $\\sin = \\frac{\\text{đối}}{\\text{huyền}}$, $\\cos = \\frac{\\text{kề}}{\\text{huyền}}$, $\\tan = \\frac{\\text{đối}}{\\text{kề}}$, $\\cot = \\frac{\\text{kề}}{\\text{đối}}$.
* Câu hỏi gợi mở: "Cạnh $AH$ là đường cao ứng với cạnh huyền, vậy $AH^2$ liên hệ thế nào với hai hình chiếu $BH$ và $CH$?".

CHỦ ĐỀ 6: ĐƯỜNG TRÒN & TỨ GIÁC NỘI TIẾP
- Tính chất tiếp tuyến: Tiếp tuyến vuông góc với bán kính tại tiếp điểm; Hai tiếp tuyến cắt nhau thì cách đều tiếp điểm, tạo góc bằng nhau.
- Góc với đường tròn: Góc ở tâm bằng số đo cung bị chắn; Góc nội tiếp bằng nửa số đo cung bị chắn; Góc tạo bởi tiếp tuyến và dây cung bằng nửa số đo cung bị chắn.
- Dấu hiệu nhận biết tứ giác nội tiếp:
  1) Tứ giác có tổng hai góc đối bằng $180^\\circ$.
  2) Tứ giác có góc ngoài tại một đỉnh bằng góc trong tại đỉnh đối diện.
  3) Hai đỉnh kề nhau cùng nhìn cạnh chứa hai đỉnh còn lại dưới hai góc bằng nhau.
  4) Tứ giác có 4 đỉnh cùng cách đều một điểm cố định.
* Câu hỏi gợi mở: "Hai góc đối diện của tứ giác này có tổng số đo bằng bao nhiêu độ?", "Hai đỉnh $B$ và $C$ cùng nhìn đoạn $AD$ dưới góc nào?".

CHỦ ĐỀ 7: HÌNH HỌC KHÔNG GIAN THỰC TẾ THCS
- Hình trụ bán kính đáy $R$, chiều cao $h$: $S_{xq} = 2\\pi R h$, $V = \\pi R^2 h$.
- Hình nón bán kính $R$, đường sinh $l$, chiều cao $h$: $l = \\sqrt{R^2 + h^2}$, $S_{xq} = \\pi R l$, $V = \\frac{1}{3} \\pi R^2 h$.
- Hình cầu bán kính $R$: $S = 4\\pi R^2$, $V = \\frac{4}{3} \\pi R^3$.
* Câu hỏi gợi mở: "Chiếc nón lá có dạng hình gì?", "Để tính diện tích lá làm nón, ta cần tính diện tích xung quanh hay toàn phần của hình nón?".

CHỦ ĐỀ 8: BÀI TOÁN THỰC TẾ LIÊN MÔN & BẤT ĐẲNG THỨC MIN - MAX
- Bất đẳng thức AM-GM (Cauchy) cho 2 số không âm: $a + b \\ge 2\\sqrt{ab}$. Dấu \"=\" xảy ra khi $a = b$.
- Kỹ thuật chọn điểm rơi, thêm bớt hạng tử, chia nhóm.
- Bài toán tối ưu thực tế đời sống: Chi phí nhỏ nhất, thể tích lớn nhất trong các bài toán hình học THCS.
* Câu hỏi gợi mở: "Dự đoán dấu bằng xảy ra khi các biến bằng bao nhiêu?", "Hai số này có tích là hằng số chưa để áp dụng bất đẳng thức Cauchy?".
`;

module.exports = {
  TOPICS_BY_GRADE,
  TOPICS,
  QUY_TRINH_GIAI,
  TIEU_CHI_DANH_GIA,
  KNOWLEDGE_BANK
};
