// Vercel Serverless Function: /api/public/quiz-attempt
// Kiểm tra đáp án trắc nghiệm tương tác chuẩn xác theo ngân hàng câu hỏi

let quizzesModule = null;
try {
  quizzesModule = require("./quizzes.js");
} catch (e) {}

const FALLBACK_BANK = {
  1: {
    correct_answer: 1,
    hint: "Tính lũy thừa trước: $3^2 = 9$ và $4^2 = 16$, sau đó cộng lại: $9 + 16 = 25$.",
    explanation: "Ta có: $3^2 = 9$; $4^2 = 16$. Do đó: $3^2 + 4^2 = 9 + 16 = 25$. Phương án chính xác là B."
  },
  2: {
    correct_answer: 1,
    hint: "Tam giác đều có 3 cạnh bằng nhau: $AB = BC = CA = 6\\text{ cm}$. Chu vi bằng tổng 3 cạnh: $3 \\cdot 6 = 18\\text{ cm}$.",
    explanation: "Chu vi tam giác đều $P = 3 \\cdot a = 3 \\cdot 6 = 18\\text{ cm}$. Phương án chính xác là B."
  },
  3: {
    correct_answer: 0,
    hint: "Chuyển vế: $x = \\frac{2}{3} + \\frac{1}{3}$.",
    explanation: "Ta có: $x = \\frac{2}{3} + \\frac{1}{3} = \\frac{3}{3} = 1$. Phương án chính xác là A."
  },
  4: {
    correct_answer: 1,
    hint: "Theo định lý Pythagore: $BC^2 = AB^2 + AC^2 = 6^2 + 8^2 = 36 + 64 = 100 \\implies BC = \\sqrt{100} = 10\\text{ cm}$.",
    explanation: "Cạnh huyền $BC = \\sqrt{6^2 + 8^2} = \\sqrt{36+64} = 10\\text{ cm}$. Phương án chính xác là B."
  },
  5: {
    correct_answer: 0,
    hint: "Áp dụng $(A-B)^2 = A^2 - 2AB + B^2$.",
    explanation: "Khai triển: $(x-3)^2 = x^2 - 2 \\cdot x \\cdot 3 + 3^2 = x^2 - 6x + 9$. Phương án chính xác là A."
  },
  6: {
    correct_answer: 0,
    hint: "Hình bình hành có các cạnh đối bằng nhau: $AB=CD=7\\text{ cm}, BC=AD=5\\text{ cm}$. Chu vi $P = 2 \\cdot (7 + 5) = 24\\text{ cm}$.",
    explanation: "Chu vi hình bình hành: $P = 2 \\cdot (AB + BC) = 2 \\cdot (7 + 5) = 24\\text{ cm}$. Phương án chính xác là A."
  },
  7: {
    correct_answer: 0,
    hint: "$\\sqrt{25a^2} = \\sqrt{25} \\cdot \\sqrt{a^2} = 5|a|$. Vì $a \\ge 0$ nên $|a| = a$.",
    explanation: "Rút gọn: $\\sqrt{25a^2} = 5|a| = 5a$ (do $a \\ge 0$). Phương án chính xác là A."
  },
  8: {
    correct_answer: 0,
    hint: "Góc nội tiếp bằng nửa số đo góc ở tâm cùng chắn một cung: $\\widehat{ACB} = \\frac{1}{2} \\widehat{AOB} = \\frac{80^\\circ}{2} = 40^\\circ$.",
    explanation: "Số đo góc nội tiếp $\\widehat{ACB} = \\frac{1}{2} \\cdot 80^\\circ = 40^\\circ$. Phương án chính xác là A."
  },
  13: {
    correct_answer: 1,
    hint: "Phân thức xác định khi mẫu thức khác 0: $x^2 - 4 \\neq 0 \\iff (x-2)(x+2) \\neq 0$.",
    explanation: "Ta có $x^2 - 4 \\neq 0 \\iff x \\neq 2$ và $x \\neq -2$ (tức $x \\neq \\pm 2$). Phương án chính xác là B."
  },
  14: {
    correct_answer: 1,
    hint: "Theo định lý Thalès: $\\frac{AM}{MB} = \\frac{AN}{NC}$.",
    explanation: "Theo định lý Thalès: $\\frac{2}{4} = \\frac{3}{NC} \\implies NC = \\frac{4 \\cdot 3}{2} = 6$. Phương án chính xác là B."
  },
  15: {
    correct_answer: 0,
    hint: "Theo định lý Vi-ét: $S = 7, P = 12$. Biến đổi $x_1^2 + x_2^2 = S^2 - 2P$.",
    explanation: "$x_1^2 + x_2^2 = 7^2 - 2 \\cdot 12 = 49 - 24 = 25$. Phương án chính xác là A."
  },
  16: {
    correct_answer: 0,
    hint: "Hệ thức lượng trong tam giác vuông: $AH^2 = BH \\cdot CH$.",
    explanation: "$AH^2 = 4 \\cdot 9 = 36 \\implies AH = 6\\text{ cm}$. Phương án chính xác là A."
  }
};

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }

  const questionId = Number(body?.questionId);
  const selectedIndex = Number(body?.selectedIndex);

  let q = null;
  const inMem = quizzesModule?.inMemoryQuizzesByGrade;
  if (inMem) {
    for (const g of ["6", "7", "8", "9"]) {
      const list = inMem[g] || [];
      const found = list.find(item => Number(item.id) === questionId);
      if (found) {
        q = found;
        break;
      }
    }
  }

  if (!q && FALLBACK_BANK[questionId]) {
    q = FALLBACK_BANK[questionId];
  }

  const correct_answer = (q && q.correct_answer !== undefined) ? Number(q.correct_answer) : 1;
  const isCorrect = (selectedIndex === correct_answer);

  return res.status(200).json({
    success: true,
    isCorrect,
    correctAnswer: correct_answer,
    hint: q?.hint || "Hãy đọc kỹ dữ kiện bài toán và nháp từng bước cẩn thận trước khi chọn đáp án nhé.",
    explanation: q?.explanation || `Đáp án chính xác là ${String.fromCharCode(65 + correct_answer)}.`
  });
};
