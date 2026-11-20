// Vercel Serverless Function: /api/public/quizzes
module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const grade = req.query?.grade || "6";

  const quizzesByGrade = {
    "6": [
      { id: 1, grade_id: "6", topic: "Số tự nhiên", text: "Kết quả của phép tính $3^2 + 4^2$ là:", options: ["14", "25", "49", "7"], correct_answer: 1, hint: "Tính lũy thừa trước: $3^2 = 9$ và $4^2 = 16$, sau đó cộng lại." },
      { id: 2, grade_id: "6", topic: "Số nguyên", text: "Giá trị của biểu thức $(-15) + 8$ bằng:", options: ["-7", "7", "-23", "23"], correct_answer: 0, hint: "Cộng hai số nguyên khác dấu: lấy số có phần tự nhiên lớn hơn trừ số bé hơn và mang dấu của số lớn hơn." }
    ],
    "7": [
      { id: 3, grade_id: "7", topic: "Số hữu tỉ", text: "Tìm $x$ biết: $x - \\frac{1}{3} = \\frac{2}{3}$", options: ["$x = 1$", "$x = \\frac{1}{3}$", "$x = -1$", "$x = \\frac{1}{2}$"], correct_answer: 0, hint: "Chuyển vế: $x = \\frac{2}{3} + \\frac{1}{3}$." }
    ],
    "8": [
      { id: 4, grade_id: "8", topic: "Hằng đẳng thức", text: "Khai triển $(x - 3)^2$ ta được:", options: ["$x^2 - 6x + 9$", "$x^2 - 9$", "$x^2 + 6x + 9$", "$x^2 - 3x + 9$"], correct_answer: 0, hint: "Áp dụng $(A-B)^2 = A^2 - 2AB + B^2$." }
    ],
    "9": [
      { id: 5, grade_id: "9", topic: "Căn bậc hai", text: "Rút gọn biểu thức $\\sqrt{25a^2}$ với $a \\ge 0$ được:", options: ["$5a$", "$-5a$", "$25a$", "$5|a|$"], correct_answer: 0, hint: "$\\sqrt{25a^2} = \\sqrt{25} \\cdot \\sqrt{a^2} = 5|a|$. Vì $a \\ge 0$ nên $|a| = a$." }
    ]
  };

  return res.status(200).json({
    success: true,
    questions: quizzesByGrade[grade] || quizzesByGrade["6"]
  });
};
