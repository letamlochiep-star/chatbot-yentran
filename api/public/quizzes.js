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
<svg viewBox="0 0 200 130" width="100%" style="max-width:200px;display:block;margin:8px auto;background:#ffffff;border:1px solid #d4ebdd;border-radius:12px;padding:6px;">
  <polygon points="100,20 40,110 160,110" fill="#e8f6ef" stroke="#196653" stroke-width="2.5"/>
  <text x="94" y="15" fill="#144e3c" font-size="12" font-weight="bold">A</text>
  <text x="25" y="118" fill="#144e3c" font-size="12" font-weight="bold">B</text>
  <text x="165" y="118" fill="#144e3c" font-size="12" font-weight="bold">C</text>
  <text x="50" y="65" fill="#196653" font-size="11" font-weight="bold">6 cm</text>
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
  const grade = req.query?.grade || "6";
  const selectedTopic = req.query?.topic || "";

  let list = inMemoryQuizzesByGrade[grade] || inMemoryQuizzesByGrade["6"] || [];

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
