// Vercel Serverless Function: /api/public/quizzes
// Cung cấp danh sách câu hỏi trắc nghiệm tương tác theo khối lớp và theo từng bài học

let inMemoryQuizzesByGrade = {
  "6": [
    { id: 1, grade_id: "6", topic: "Tập hợp các số tự nhiên & Phép tính", text: "Kết quả của phép tính $3^2 + 4^2$ là:", options: ["14", "25", "49", "7"], correct_answer: 1, hint: "Tính lũy thừa trước: $3^2 = 9$ và $4^2 = 16$, sau đó cộng lại.", explanation: "$3^2 + 4^2 = 9 + 16 = 25$." },
    { 
      id: 2, 
      grade_id: "6", 
      topic: "Hình học trực quan: Tam giác đều, Hình vuông", 
      text: `Cho tam giác đều $ABC$ có độ dài cạnh $AB = 6\\text{ cm}$ như hình vẽ:<br>
<svg viewBox="0 0 240 160" width="100%" style="max-width:240px;display:block;margin:8px auto;background:#ffffff">
  <polygon points="120,20 40,140 200,140" fill="#e8f6ee" stroke="#196653" stroke-width="2.5" stroke-linejoin="round"/>
  <line x1="76" y1="78" x2="84" y2="82" stroke="#196653" stroke-width="2"/>
  <line x1="156" y1="82" x2="164" y2="78" stroke="#196653" stroke-width="2"/>
  <line x1="118" y1="136" x2="122" y2="144" stroke="#196653" stroke-width="2"/>
  <circle cx="120" cy="20" r="3.5" fill="#144e3c"/>
  <text x="115" y="14" fill="#144e3c" font-size="13" font-weight="bold">A</text>
  <circle cx="40" cy="140" r="3.5" fill="#144e3c"/>
  <text x="24" y="148" fill="#144e3c" font-size="13" font-weight="bold">B</text>
  <circle cx="200" cy="140" r="3.5" fill="#144e3c"/>
  <text x="206" y="148" fill="#144e3c" font-size="13" font-weight="bold">C</text>
  <text x="52" y="75" fill="#b45309" font-size="12" font-weight="bold">6 cm</text>
</svg>
Chu vi của tam giác đều $ABC$ là:`, 
      options: ["$12\\text{ cm}$", "$18\\text{ cm}$", "$36\\text{ cm}$", "$24\\text{ cm}$"], 
      correct_answer: 1, 
      hint: "Tam giác đều có 3 cạnh bằng nhau: $AB = BC = CA = 6\\text{ cm}$. Chu vi bằng tổng 3 cạnh: $3 \\cdot 6 = 18\\text{ cm}$.",
      explanation: "Chu vi tam giác đều $P = 3 \\cdot a = 3 \\cdot 6 = 18\\text{ cm}$."
    }
  ],
  "7": [
    { id: 3, grade_id: "7", topic: "Số hữu tỉ & Các phép toán", text: "Tìm $x$ biết: $x - \\frac{1}{3} = \\frac{2}{3}$", options: ["$x = 1$", "$x = \\frac{1}{3}$", "$x = -1$", "$x = \\frac{1}{2}$"], correct_answer: 0, hint: "Chuyển vế: $x = \\frac{2}{3} + \\frac{1}{3}$.", explanation: "$x = \\frac{2}{3} + \\frac{1}{3} = \\frac{3}{3} = 1$." },
    {
      id: 4,
      grade_id: "7",
      topic: "Định lý Pythagore trong Tam giác vuông",
      text: `Cho tam giác $ABC$ vuông tại $A$ có $AB = 6\\text{ cm}$ và $AC = 8\\text{ cm}$ như hình vẽ:<br>
<svg viewBox="0 0 220 140" width="100%" style="max-width:220px;display:block;margin:8px auto;background:#ffffff;border:1px solid #d4ebdd;border-radius:12px;padding:6px;">
  <polygon points="50,25 50,115 180,115" fill="#e8f6ee" stroke="#196653" stroke-width="2.5"/>
  <polyline points="50,103 62,103 62,115" fill="none" stroke="#e11d48" stroke-width="2"/>
  <text x="35" y="125" fill="#144e3c" font-size="12" font-weight="bold">A</text>
  <text x="35" y="24" fill="#144e3c" font-size="12" font-weight="bold">B</text>
  <text x="185" y="125" fill="#144e3c" font-size="12" font-weight="bold">C</text>
  <text x="20" y="75" fill="#196653" font-size="11" font-weight="bold">6cm</text>
  <text x="105" y="132" fill="#196653" font-size="11" font-weight="bold">8cm</text>
  <text x="125" y="65" fill="#e5881e" font-size="11" font-weight="bold">BC = ?</text>
</svg>
Độ dài cạnh huyền $BC$ là:`,
      options: ["$14\\text{ cm}$", "$10\\text{ cm}$", "$100\\text{ cm}$", "$12\\text{ cm}$"],
      correct_answer: 1,
      hint: "Theo định lý Pythagore: $BC^2 = AB^2 + AC^2 = 6^2 + 8^2 = 36 + 64 = 100 \\implies BC = \\sqrt{100} = 10\\text{ cm}$.",
      explanation: "$BC = \\sqrt{6^2 + 8^2} = \\sqrt{36+64} = 10\\text{ cm}$."
    }
  ],
  "8": [
    { id: 5, grade_id: "8", topic: "7 Hằng đẳng thức đáng nhớ", text: "Khai triển $(x - 3)^2$ ta được:", options: ["$x^2 - 6x + 9$", "$x^2 - 9$", "$x^2 + 6x + 9$", "$x^2 - 3x + 9$"], correct_answer: 0, hint: "Áp dụng $(A-B)^2 = A^2 - 2AB + B^2$.", explanation: "$(x-3)^2 = x^2 - 2 \\cdot x \\cdot 3 + 3^2 = x^2 - 6x + 9$." },
    {
      id: 6,
      grade_id: "8",
      topic: "Tứ giác: Hình bình hành & Hình chữ nhật",
      text: `Cho hình bình hành $ABCD$ có $AB = 7\\text{ cm}$ và cạnh bên $BC = 5\\text{ cm}$ như hình vẽ:<br>
<svg viewBox="0 0 240 130" width="100%" style="max-width:240px;display:block;margin:8px auto;background:#ffffff;border:1px solid #d4ebdd;border-radius:12px;padding:6px;">
  <polygon points="70,25 200,25 160,105 30,105" fill="#f4faf6" stroke="#196653" stroke-width="2.5"/>
  <text x="62" y="20" fill="#144e3c" font-size="12" font-weight="bold">A</text>
  <text x="205" y="22" fill="#144e3c" font-size="12" font-weight="bold">B</text>
  <text x="165" y="118" fill="#144e3c" font-size="12" font-weight="bold">C</text>
  <text x="20" y="115" fill="#144e3c" font-size="12" font-weight="bold">D</text>
  <text x="125" y="18" fill="#196653" font-size="11" font-weight="bold">7 cm</text>
  <text x="185" y="70" fill="#196653" font-size="11" font-weight="bold">5 cm</text>
</svg>
Chu vi của hình bình hành $ABCD$ là:`,
      options: ["$24\\text{ cm}$", "$35\\text{ cm}$", "$12\\text{ cm}$", "$48\\text{ cm}$"],
      correct_answer: 0,
      hint: "Hình bình hành có các cạnh đối bằng nhau: $AB=CD=7\\text{ cm}, BC=AD=5\\text{ cm}$. Chu vi $P = 2 \\cdot (7 + 5) = 24\\text{ cm}$.",
      explanation: "Chu vi hình bình hành: $P = 2 \\cdot (AB + BC) = 2 \\cdot (7 + 5) = 24\\text{ cm}$."
    },
    {
      id: 13,
      grade_id: "8",
      topic: "Phân thức đại số: Điều kiện xác định & Rút gọn",
      text: "Điều kiện xác định của phân thức đại số $\\frac{2x - 1}{x^2 - 4}$ là:",
      options: ["$x \\neq 2$", "$x \\neq \\pm 2$", "$x \\neq -2$", "$x > 0$"],
      correct_answer: 1,
      hint: "Phân thức $\\frac{A}{B}$ xác định khi mẫu thức khác 0: $B \\neq 0$. Ở đây $x^2 - 4 \\neq 0 \\iff (x-2)(x+2) \\neq 0$.",
      explanation: "Ta có $x^2 - 4 \\neq 0 \\iff (x-2)(x+2) \\neq 0 \\iff x \\neq 2$ và $x \\neq -2$ (tức là $x \\neq \\pm 2$)."
    },
    {
      id: 14,
      grade_id: "8",
      topic: "Định lý Thalès trong tam giác",
      text: `Cho $\\triangle ABC$ có $MN \\parallel BC$ ($M \\in AB, N \\in AC$) như hình vẽ:<br>
<svg viewBox="0 0 240 150" width="100%" style="max-width:240px;display:block;margin:8px auto;background:#ffffff;border:1px solid #d4ebdd;border-radius:12px;padding:6px;">
  <polygon points="120,20 40,135 200,135" fill="#f4faf6" stroke="#196653" stroke-width="2.5"/>
  <line x1="72" y1="89" x2="168" y2="89" stroke="#e11d48" stroke-width="2"/>
  <circle cx="120" cy="20" r="3" fill="#144e3c"/>
  <circle cx="40" cy="135" r="3" fill="#144e3c"/>
  <circle cx="200" cy="135" r="3" fill="#144e3c"/>
  <circle cx="72" cy="89" r="3" fill="#e11d48"/>
  <circle cx="168" cy="89" r="3" fill="#e11d48"/>
  <text x="115" y="14" fill="#144e3c" font-size="12" font-weight="bold">A</text>
  <text x="24" y="142" fill="#144e3c" font-size="12" font-weight="bold">B</text>
  <text x="206" y="142" fill="#144e3c" font-size="12" font-weight="bold">C</text>
  <text x="56" y="88" fill="#e11d48" font-size="11" font-weight="bold">M</text>
  <text x="174" y="88" fill="#e11d48" font-size="11" font-weight="bold">N</text>
  <text x="80" y="55" fill="#196653" font-size="10" font-weight="bold">AM = 2</text>
  <text x="42" y="112" fill="#196653" font-size="10" font-weight="bold">MB = 4</text>
  <text x="145" y="55" fill="#196653" font-size="10" font-weight="bold">AN = 3</text>
  <text x="180" y="112" fill="#b45309" font-size="10" font-weight="bold">NC = ?</text>
</svg>
Độ dài đoạn thẳng $NC$ là:`,
      options: ["$5$", "$6$", "$8$", "$4.5$"],
      correct_answer: 1,
      hint: "Vì $MN \\parallel BC$, áp dụng định lý Thalès: $\\frac{AM}{MB} = \\frac{AN}{NC}$.",
      explanation: "Áp dụng định lý Thalès: $\\frac{AM}{MB} = \\frac{AN}{NC} \\implies \\frac{2}{4} = \\frac{3}{NC} \\implies NC = \\frac{4 \\cdot 3}{2} = 6$."
    }
  ],
  "9": [
    { id: 7, grade_id: "9", topic: "Căn bậc hai & Hằng đẳng thức", text: "Rút gọn biểu thức $\\sqrt{25a^2}$ với $a \\ge 0$ được:", options: ["$5a$", "$-5a$", "$25a$", "$5|a|$"], correct_answer: 0, hint: "$\\sqrt{25a^2} = \\sqrt{25} \\cdot \\sqrt{a^2} = 5|a|$. Vì $a \\ge 0$ nên $|a| = a$.", explanation: "$\\sqrt{25a^2} = 5|a| = 5a$ vì $a \\ge 0$." },
    {
      id: 8,
      grade_id: "9",
      topic: "Đường tròn: Góc ở tâm & Góc nội tiếp",
      text: `Cho đường tròn $(O)$ có góc ở tâm $\\widehat{AOB} = 80^\\circ$. Điểm $C$ nằm trên cung lớn $AB$ như hình vẽ:<br>
<svg viewBox="0 0 220 160" width="100%" style="max-width:220px;display:block;margin:8px auto;background:#ffffff;border:1px solid #d4ebdd;border-radius:12px;padding:6px;">
  <circle cx="110" cy="85" r="60" fill="#f5fbf7" stroke="#196653" stroke-width="2.5"/>
  <circle cx="110" cy="85" r="3" fill="#196653"/>
  <text x="114" y="85" fill="#144e3c" font-size="11" font-weight="bold">O</text>
  <circle cx="65" cy="125" r="2.5" fill="#196653"/>
  <circle cx="155" cy="125" r="2.5" fill="#196653"/>
  <circle cx="110" cy="25" r="2.5" fill="#e11d48"/>
  <text x="50" y="135" fill="#144e3c" font-size="11" font-weight="bold">A</text>
  <text x="160" y="135" fill="#144e3c" font-size="11" font-weight="bold">B</text>
  <text x="106" y="18" fill="#e11d48" font-size="12" font-weight="bold">C</text>
  <line x1="110" y1="85" x2="65" y2="125" stroke="#196653" stroke-width="1.6"/>
  <line x1="110" y1="85" x2="155" y2="125" stroke="#196653" stroke-width="1.6"/>
  <line x1="110" y1="25" x2="65" y2="125" stroke="#e11d48" stroke-width="1.8"/>
  <line x1="110" y1="25" x2="155" y2="125" stroke="#e11d48" stroke-width="1.8"/>
  <text x="96" y="112" fill="#196653" font-size="10" font-weight="bold">80°</text>
</svg>
Số đo của góc nội tiếp $\\widehat{ACB}$ là:`,
      options: ["$40^\\circ$", "$80^\\circ$", "$160^\\circ$", "$90^\\circ$"],
      correct_answer: 0,
      hint: "Góc nội tiếp bằng nửa số đo góc ở tâm cùng chắn một cung: $\\widehat{ACB} = \\frac{1}{2} \\widehat{AOB} = \\frac{80^\\circ}{2} = 40^\\circ$.",
      explanation: "$\\widehat{ACB} = \\frac{1}{2} \\cdot 80^\\circ = 40^\\circ$."
    },
    {
      id: 15,
      grade_id: "9",
      topic: "Phương trình bậc hai & Định lý Vi-ét",
      text: "Cho phương trình bậc hai $x^2 - 7x + 12 = 0$. Giá trị của biểu thức $T = x_1^2 + x_2^2$ bằng:",
      options: ["$25$", "$37$", "$49$", "$13$"],
      correct_answer: 0,
      hint: "Áp dụng định lý Vi-ét: $S = x_1 + x_2 = 7$, $P = x_1 x_2 = 12$. Biến đổi $x_1^2 + x_2^2 = S^2 - 2P$.",
      explanation: "Theo định lý Vi-ét: $S = 7, P = 12$. Ta có $x_1^2 + x_2^2 = (x_1+x_2)^2 - 2x_1x_2 = 7^2 - 2 \\cdot 12 = 49 - 24 = 25$."
    },
    {
      id: 16,
      grade_id: "9",
      topic: "Hệ thức lượng trong tam giác vuông",
      text: `Cho $\\triangle ABC$ vuông tại $A$, đường cao $AH$ như hình vẽ:<br>
<svg viewBox="0 0 240 140" width="100%" style="max-width:240px;display:block;margin:8px auto;background:#ffffff;border:1px solid #d4ebdd;border-radius:12px;padding:6px;">
  <polygon points="50,20 50,115 190,115" fill="#f4faf6" stroke="#196653" stroke-width="2.5"/>
  <polyline points="50,103 62,103 62,115" fill="none" stroke="#e11d48" stroke-width="2"/>
  <line x1="50" y1="20" x2="108" y2="115" stroke="#196653" stroke-width="2" stroke-dasharray="3,3"/>
  <circle cx="108" cy="115" r="3" fill="#144e3c"/>
  <text x="35" y="125" fill="#144e3c" font-size="12" font-weight="bold">A</text>
  <text x="35" y="18" fill="#144e3c" font-size="12" font-weight="bold">B</text>
  <text x="195" y="125" fill="#144e3c" font-size="12" font-weight="bold">C</text>
  <text x="110" y="132" fill="#144e3c" font-size="11" font-weight="bold">H</text>
  <text x="68" y="128" fill="#196653" font-size="10" font-weight="bold">BH=4</text>
  <text x="145" y="128" fill="#196653" font-size="10" font-weight="bold">HC=9</text>
  <text x="82" y="65" fill="#e11d48" font-size="11" font-weight="bold">AH = ?</text>
</svg>
Độ dài đường cao $AH$ là:`,
      options: ["$6\\text{ cm}$", "$5\\text{ cm}$", "$6.5\\text{ cm}$", "$36\\text{ cm}$"],
      correct_answer: 0,
      hint: "Áp dụng hệ thức lượng trong tam giác vuông: Bình phương đường cao bằng tích hai hình chiếu: $AH^2 = BH \\cdot HC$.",
      explanation: "$AH^2 = BH \\cdot HC = 4 \\cdot 9 = 36 \\implies AH = \\sqrt{36} = 6\\text{ cm}$."
    }
  ]
};

let nextId = 100;

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  // POST: Giáo viên đưa bài tập mới lên
  if (req.method === "POST") {
    let body = req.body;
    if (typeof body === "string") {
      try { body = JSON.parse(body); } catch (e) { body = {}; }
    }

    const { grade_id = "6", topic, text, options, correct_answer = 0, hint, explanation } = body || {};

    if (!text || !options || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ success: false, error: "Nội dung câu hỏi và các phương án chưa hợp lệ." });
    }

    const newQuestion = {
      id: nextId++,
      grade_id: String(grade_id),
      topic: topic || "Chuyên đề mở rộng",
      text: text.trim(),
      options: options.slice(0, 4),
      correct_answer: Number(correct_answer) || 0,
      hint: hint || "Em hãy đọc kỹ đề bài và xem lại công thức lý thuyết nhé.",
      explanation: explanation || ""
    };

    if (!inMemoryQuizzesByGrade[newQuestion.grade_id]) {
      inMemoryQuizzesByGrade[newQuestion.grade_id] = [];
    }
    inMemoryQuizzesByGrade[newQuestion.grade_id].unshift(newQuestion);

    return res.status(200).json({
      success: true,
      message: "Đã thêm bài tập tương tác thành công!",
      question: newQuestion
    });
  }

  // GET: Học sinh hoặc Giáo viên lấy danh sách bài tập theo khối lớp và theo bài học
  const grade = req.query?.grade || "8";
  const selectedTopic = req.query?.topic || "";

  let list = inMemoryQuizzesByGrade[grade] || inMemoryQuizzesByGrade["8"] || [];

  // Lấy danh sách tất cả các bài học (chủ đề) duy nhất của khối lớp này
  const topicsSet = new Set();
  list.forEach(q => {
    if (q.topic) topicsSet.add(q.topic);
  });
  const topics = Array.from(topicsSet);

  // Lọc theo bài học nếu có yêu cầu
  if (selectedTopic && selectedTopic.trim() && selectedTopic !== "all") {
    const filterKey = selectedTopic.trim().toLowerCase();
    list = list.filter(q => (q.topic || "").toLowerCase().includes(filterKey));
  }

  return res.status(200).json({
    success: true,
    grade,
    selectedTopic,
    topics,
    questions: list
  });
};

module.exports.inMemoryQuizzesByGrade = inMemoryQuizzesByGrade;
