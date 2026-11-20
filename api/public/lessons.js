// Vercel Serverless Function: /api/public/lessons
// Cung cấp bài học trọng tâm chuẩn GDPT, tích hợp ảnh hình học dạng SVG vector trực quan
module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const grade = req.query?.grade || "6";

  const lessonsByGrade = {
    "6": [
      {
        id: 1,
        grade_id: "6",
        title: "Tập hợp các số tự nhiên & Phép tính",
        content: "Tập hợp $\\mathbb{N} = \\{0, 1, 2, 3, ...\\}$. Phép cộng, trừ, nhân, chia và nâng lên lũy thừa $a^n$. Thứ tự thực hiện phép tính: trong ngoặc trước, ngoài ngoặc sau; lũy thừa -> nhân chia -> cộng trừ.",
        sample_example: "Tính $2^3 + 3 \\cdot 4 = 8 + 12 = 20$.",
        self_check_question: "Nếu có cả ngoặc tròn, vuông, nhọn thì thực hiện ngoặc nào trước?"
      },
      {
        id: 2,
        grade_id: "6",
        title: "Hình học trực quan: Tam giác đều, Hình vuông, Lục giác đều",
        content: `Hình học trực quan giúp các em nhận biết các hình phẳng đều qua cạnh, góc và đường chéo:<br>
<svg viewBox="0 0 320 150" width="100%" style="max-width:320px;display:block;margin:12px auto;background:#ffffff;border:1px solid #d4ebdd;border-radius:14px;padding:8px;">
  <!-- Tam giác đều -->
  <polygon points="55,25 15,115 95,115" fill="#e8f6ef" stroke="#196653" stroke-width="2.5"/>
  <text x="50" y="18" fill="#144e3c" font-size="12" font-weight="bold">A</text>
  <text x="5" y="125" fill="#144e3c" font-size="12" font-weight="bold">B</text>
  <text x="95" y="125" fill="#144e3c" font-size="12" font-weight="bold">C</text>
  <text x="24" y="140" fill="#196653" font-size="10.5" font-weight="bold">Tam giác đều</text>
  <!-- Hình vuông -->
  <rect x="135" y="35" width="75" height="75" fill="#fef8eb" stroke="#e5881e" stroke-width="2.5" rx="2"/>
  <text x="130" y="30" fill="#a05e13" font-size="12" font-weight="bold">M</text>
  <text x="210" y="30" fill="#a05e13" font-size="12" font-weight="bold">N</text>
  <text x="210" y="122" fill="#a05e13" font-size="12" font-weight="bold">P</text>
  <text x="130" y="122" fill="#a05e13" font-size="12" font-weight="bold">Q</text>
  <text x="148" y="140" fill="#e5881e" font-size="10.5" font-weight="bold">Hình vuông</text>
  <!-- Lục giác đều -->
  <polygon points="275,35 295,72 275,110 245,110 225,72 245,35" fill="#eff6fc" stroke="#2563eb" stroke-width="2.5"/>
  <text x="238" y="140" fill="#2563eb" font-size="10.5" font-weight="bold">Lục giác đều</text>
</svg>
• Tam giác đều: 3 cạnh bằng nhau, 3 góc bằng nhau và bằng $60^\\circ$.<br>
• Hình vuông: 4 cạnh bằng nhau, 4 góc vuông, 2 đường chéo bằng nhau.<br>
• Lục giác đều: 6 cạnh bằng nhau, 6 góc bằng nhau.`,
        sample_example: "Tính chu vi tam giác đều có cạnh $a = 4\\text{ cm}$: $P = 3 \\cdot 4 = 12\\text{ cm}$.",
        self_check_question: "Lục giác đều được ghép từ bao nhiêu tam giác đều bằng nhau?"
      }
    ],
    "7": [
      {
        id: 3,
        grade_id: "7",
        title: "Số hữu tỉ & Các phép toán",
        content: "Số hữu tỉ là số viết được dưới dạng phân số $\\frac{a}{b}$ với $a, b \\in \\mathbb{Z}, b \\neq 0$. Cộng, trừ, nhân, chia số hữu tỉ và quy tắc chuyển vế.",
        sample_example: "Tìm $x$ biết $x + \\frac{1}{2} = \\frac{3}{4} \\Rightarrow x = \\frac{3}{4} - \\frac{1}{2} = \\frac{1}{4}$.",
        self_check_question: "Số thập phân vô hạn tuần hoàn có phải là số hữu tỉ không?"
      },
      {
        id: 4,
        grade_id: "7",
        title: "Định lý Pythagore trong Tam giác vuông",
        content: `Trong một tam giác vuông, bình phương của cạnh huyền bằng tổng bình phương của hai cạnh góc vuông:<br>
<svg viewBox="0 0 300 170" width="100%" style="max-width:300px;display:block;margin:12px auto;background:#ffffff;border:1px solid #d4ebdd;border-radius:14px;padding:8px;">
  <!-- Tam giác vuông ABC vuông tại A -->
  <polygon points="60,30 60,130 220,130" fill="#e8f6ee" stroke="#196653" stroke-width="2.5"/>
  <polyline points="60,115 75,115 75,130" fill="none" stroke="#e11d48" stroke-width="2"/>
  <text x="45" y="145" fill="#144e3c" font-size="14" font-weight="bold">A</text>
  <text x="45" y="28" fill="#144e3c" font-size="14" font-weight="bold">B</text>
  <text x="225" y="140" fill="#144e3c" font-size="14" font-weight="bold">C</text>
  <text x="35" y="85" fill="#196653" font-size="13" font-weight="bold">c</text>
  <text x="135" y="148" fill="#196653" font-size="13" font-weight="bold">b</text>
  <text x="150" y="75" fill="#e5881e" font-size="13" font-weight="bold">a (cạnh huyền)</text>
</svg>
$$\\triangle ABC \\text{ vuông tại } A \\implies BC^2 = AB^2 + AC^2 \\quad (a^2 = b^2 + c^2)$$
Định lý đảo: Nếu một tam giác có bình phương một cạnh bằng tổng bình phương hai cạnh kia thì đó là tam giác vuông.`,
        sample_example: "Cho $\\triangle ABC$ vuông tại $A$ có $AB = 3\\text{ cm}, AC = 4\\text{ cm}$. Tính $BC$: $BC^2 = 3^2 + 4^2 = 25 \\implies BC = 5\\text{ cm}$.",
        self_check_question: "Tam giác có độ dài 3 cạnh là 6cm, 8cm, 10cm có vuông không?"
      }
    ],
    "8": [
      {
        id: 5,
        grade_id: "8",
        title: "7 Hằng đẳng thức đáng nhớ",
        content: "1) $(A+B)^2 = A^2 + 2AB + B^2$\n2) $(A-B)^2 = A^2 - 2AB + B^2$\n3) $A^2 - B^2 = (A-B)(A+B)$\n4) $(A+B)^3 = A^3 + 3A^2B + 3AB^2 + B^3$\n5) $(A-B)^3 = A^3 - 3A^2B + 3AB^2 - B^3$\n6) $A^3 + B^3 = (A+B)(A^2-AB+B^2)$\n7) $A^3 - B^3 = (A-B)(A^2+AB+B^2)$.",
        sample_example: "Rút gọn $(x+2)^2 - x^2 = x^2 + 4x + 4 - x^2 = 4x + 4$.",
        self_check_question: "Khai triển $(2x - 1)^2$ được kết quả gì?"
      },
      {
        id: 6,
        grade_id: "8",
        title: "Tứ giác: Hình bình hành & Hình chữ nhật",
        content: `Hình bình hành là tứ giác có các cạnh đối song song và bằng nhau:<br>
<svg viewBox="0 0 300 160" width="100%" style="max-width:300px;display:block;margin:12px auto;background:#ffffff;border:1px solid #d4ebdd;border-radius:14px;padding:8px;">
  <polygon points="90,30 250,30 210,120 50,120" fill="#f4faf6" stroke="#196653" stroke-width="2.5"/>
  <line x1="90" y1="30" x2="210" y2="120" stroke="#92bda8" stroke-dasharray="4" stroke-width="1.8"/>
  <line x1="250" y1="30" x2="50" y2="120" stroke="#92bda8" stroke-dasharray="4" stroke-width="1.8"/>
  <circle cx="150" cy="75" r="3.5" fill="#e11d48"/>
  <text x="153" y="72" fill="#e11d48" font-size="12" font-weight="bold">O</text>
  <text x="82" y="24" fill="#144e3c" font-size="14" font-weight="bold">A</text>
  <text x="255" y="28" fill="#144e3c" font-size="14" font-weight="bold">B</text>
  <text x="215" y="135" fill="#144e3c" font-size="14" font-weight="bold">C</text>
  <text x="35" y="130" fill="#144e3c" font-size="14" font-weight="bold">D</text>
</svg>
• Tính chất: Các cạnh đối bằng nhau ($AB=CD, AD=BC$), các góc đối bằng nhau, hai đường chéo cắt nhau tại trung điểm $O$ của mỗi đường.<br>
• Hình chữ nhật: Là hình bình hành có một góc vuông (hoặc hai đường chéo bằng nhau).`,
        sample_example: "Cho hình bình hành $ABCD$ có $AB = 7\\text{ cm}, BC = 5\\text{ cm}$. Chu vi là: $2 \\cdot (7 + 5) = 24\\text{ cm}$.",
        self_check_question: "Hình bình hành có hai đường chéo vuông góc với nhau là hình gì?"
      }
    ],
    "9": [
      {
        id: 7,
        grade_id: "9",
        title: "Căn bậc hai & Hằng đẳng thức $\\sqrt{A^2} = |A|$",
        content: "Căn bậc hai số học của $a \\ge 0$ là $\\sqrt{a}$. Điều kiện để $\\sqrt{A}$ có nghĩa là $A \\ge 0$. Khai phương một tích, một thương và trục căn thức ở mẫu.",
        sample_example: "Rút gọn $\\sqrt{(2-\\sqrt{5})^2} = |2-\\sqrt{5}| = \\sqrt{5}-2$ (vì $\\sqrt{5} > 2$).",
        self_check_question: "Điều kiện xác định của $\\sqrt{3-x}$ là gì?"
      },
      {
        id: 8,
        grade_id: "9",
        title: "Đường tròn: Góc ở tâm & Góc nội tiếp",
        content: `Mối quan hệ giữa góc ở tâm và góc nội tiếp cùng chắn một cung:<br>
<svg viewBox="0 0 300 190" width="100%" style="max-width:300px;display:block;margin:12px auto;background:#ffffff;border:1px solid #d4ebdd;border-radius:14px;padding:8px;">
  <circle cx="150" cy="100" r="75" fill="#f5fbf7" stroke="#196653" stroke-width="2.5"/>
  <circle cx="150" cy="100" r="3.5" fill="#196653"/>
  <text x="155" y="100" fill="#144e3c" font-size="13" font-weight="bold">O</text>
  <circle cx="95" cy="150" r="3" fill="#196653"/>
  <circle cx="205" cy="150" r="3" fill="#196653"/>
  <circle cx="150" cy="25" r="3" fill="#e11d48"/>
  <text x="80" y="160" fill="#144e3c" font-size="13" font-weight="bold">A</text>
  <text x="212" y="160" fill="#144e3c" font-size="13" font-weight="bold">B</text>
  <text x="145" y="18" fill="#e11d48" font-size="14" font-weight="bold">C</text>
  <line x1="95" y1="150" x2="205" y2="150" stroke="#144e3c" stroke-width="2"/>
  <line x1="150" y1="100" x2="95" y2="150" stroke="#196653" stroke-width="1.8"/>
  <line x1="150" y1="100" x2="205" y2="150" stroke="#196653" stroke-width="1.8"/>
  <line x1="150" y1="25" x2="95" y2="150" stroke="#e11d48" stroke-width="2"/>
  <line x1="150" y1="25" x2="205" y2="150" stroke="#e11d48" stroke-width="2"/>
</svg>
Trong một đường tròn, số đo của góc nội tiếp bằng nửa số đo của góc ở tâm cùng chắn một cung:
$$\\widehat{ACB} = \\frac{1}{2} \\widehat{AOB} = \\frac{1}{2} \\text{sđ}\\overparen{AB}$$
Hệ quả: Các góc nội tiếp cùng chắn một cung (hoặc các cung bằng nhau) thì bằng nhau; Góc nội tiếp chắn nửa đường tròn là góc vuông ($90^\\circ$).`,
        sample_example: "Cho góc ở tâm $\\widehat{AOB} = 80^\\circ$. Tính góc nội tiếp $\\widehat{ACB}$ cùng chắn cung $AB$: $\\widehat{ACB} = \\frac{80^\\circ}{2} = 40^\\circ$.",
        self_check_question: "Góc nội tiếp chắn nửa đường tròn có số đo bằng bao nhiêu độ?"
      }
    ]
  };

  return res.status(200).json({
    success: true,
    lessons: lessonsByGrade[grade] || lessonsByGrade["6"]
  });
};
