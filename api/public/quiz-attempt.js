// Vercel Serverless Function: /api/public/quiz-attempt
module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }

  const selectedIndex = Number(body?.selectedIndex);
  // Mô phỏng kiểm tra đáp án đúng (phương án A hoặc đúng theo hint)
  const isCorrect = selectedIndex === 0 || selectedIndex === 1;

  return res.status(200).json({
    success: true,
    isCorrect,
    correctAnswer: 0,
    hint: "Hãy xem lại công thức và thực hiện từng bước tính toán nháp trước khi kết luận.",
    explanation: "Áp dụng đúng định nghĩa và thứ tự thực hiện phép tính để tìm ra đáp án."
  });
};
