// Vercel Serverless Function: /api/public/lessons
module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const grade = req.query?.grade || "6";

  const lessonsByGrade = {
    "6": [
      { id: 1, grade_id: "6", title: "Tập hợp các số tự nhiên & Phép tính", content: "Tập hợp $\\mathbb{N} = \\{0, 1, 2, 3, ...\\}$. Phép cộng, trừ, nhân, chia và nâng lên lũy thừa $a^n$. Thứ tự thực hiện phép tính: trong ngoặc trước, ngoài ngoặc sau; lũy thừa -> nhân chia -> cộng trừ.", sample_example: "Tính $2^3 + 3 \\cdot 4 = 8 + 12 = 20$.", self_check_question: "Nếu có cả ngoặc tròn, vuông, nhọn thì thực hiện ngoặc nào trước?" },
      { id: 2, grade_id: "6", title: "Số nguyên & Quy tắc dấu", content: "Tập hợp số nguyên $\\mathbb{Z}$. Cộng hai số nguyên cùng dấu, khác dấu. Quy tắc dấu ngoặc: đằng trước có dấu trừ thì đổi dấu toàn bộ bên trong.", sample_example: "Tính $(-5) + (-8) = -13$; $(-7) + 12 = 5$.", self_check_question: "Kết quả của $-(-3 + 5)$ là bao nhiêu?" }
    ],
    "7": [
      { id: 3, grade_id: "7", title: "Số hữu tỉ & Các phép toán", content: "Số hữu tỉ là số viết được dưới dạng phân số $\\frac{a}{b}$ với $a, b \\in \\mathbb{Z}, b \\neq 0$. Cộng, trừ, nhân, chia số hữu tỉ và quy tắc chuyển vế.", sample_example: "Tìm $x$ biết $x + \\frac{1}{2} = \\frac{3}{4} \\Rightarrow x = \\frac{3}{4} - \\frac{1}{2} = \\frac{1}{4}$.", self_check_question: "Số thập phân vô hạn tuần hoàn có phải là số hữu tỉ không?" },
      { id: 4, grade_id: "7", title: "Hai tam giác bằng nhau", content: "Ba trường hợp bằng nhau của tam giác thường: Cạnh - Cạnh - Cạnh (c-c-c), Cạnh - Góc - Cạnh (c-g-c), Góc - Cạnh - Góc (g-c-g).", sample_example: "$\\triangle ABC = \\triangle A'B'C' \\Rightarrow AB=A'B', \\widehat{A}=\\widehat{A'}$.", self_check_question: "Ở trường hợp c-g-c, góc phải nằm ở vị trí nào so với hai cạnh?" }
    ],
    "8": [
      { id: 5, grade_id: "8", title: "7 Hằng đẳng thức đáng nhớ", content: "1) $(A+B)^2 = A^2 + 2AB + B^2$\n2) $(A-B)^2 = A^2 - 2AB + B^2$\n3) $A^2 - B^2 = (A-B)(A+B)$\n4) $(A+B)^3 = A^3 + 3A^2B + 3AB^2 + B^3$\n5) $(A-B)^3 = A^3 - 3A^2B + 3AB^2 - B^3$\n6) $A^3 + B^3 = (A+B)(A^2-AB+B^2)$\n7) $A^3 - B^3 = (A-B)(A^2+AB+B^2)$.", sample_example: "Rút gọn $(x+2)^2 - x^2 = x^2 + 4x + 4 - x^2 = 4x + 4$.", self_check_question: "Khai triển $(2x - 1)^2$ được kết quả gì?" },
      { id: 6, grade_id: "8", title: "Tứ giác & Hình bình hành, Hình chữ nhật", content: "Tổng các góc trong một tứ giác bằng $360^\\circ$. Hình bình hành có các cạnh đối song song và bằng nhau, hai đường chéo cắt nhau tại trung điểm mỗi đường. Hình chữ nhật là hình bình hành có một góc vuông.", sample_example: "Tứ giác $ABCD$ có $\\widehat{A}=100^\\circ, \\widehat{B}=80^\\circ, \\widehat{C}=90^\\circ \\Rightarrow \\widehat{D} = 360^\\circ - 270^\\circ = 90^\\circ$.", self_check_question: "Hình bình hành có hai đường chéo bằng nhau là hình gì?" }
    ],
    "9": [
      { id: 7, grade_id: "9", title: "Căn bậc hai & Hằng đẳng thức $\\sqrt{A^2} = |A|$", content: "Căn bậc hai số học của $a \\ge 0$ là $\\sqrt{a}$. Điều kiện để $\\sqrt{A}$ có nghĩa là $A \\ge 0$. Khai phương một tích, một thương và trục căn thức ở mẫu.", sample_example: "Rút gọn $\\sqrt{(2-\\sqrt{5})^2} = |2-\\sqrt{5}| = \\sqrt{5}-2$ (vì $\\sqrt{5} > 2$).", self_check_question: "Điều kiện xác định của $\\sqrt{3-x}$ là gì?" },
      { id: 8, grade_id: "9", title: "Hệ hai phương trình bậc nhất hai ẩn", content: "Dạng tổng quát: $\\begin{cases} ax + by = c \\\\ a'x + b'y = c' \\end{cases}$. Phương pháp giải: Phương pháp thế và Phương pháp cộng đại số.", sample_example: "Giải hệ: $x+y=5$ và $x-y=1 \\Rightarrow 2x=6 \\Rightarrow x=3, y=2$.", self_check_question: "Khi nào thì nên ưu tiên dùng phương pháp cộng đại số?" }
    ]
  };

  return res.status(200).json({
    success: true,
    lessons: lessonsByGrade[grade] || lessonsByGrade["6"]
  });
};
