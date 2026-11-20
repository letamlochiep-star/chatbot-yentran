// Vercel Serverless Function: /api/public/resources
module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const grade = req.query?.grade || "6";

  const resources = [
    { id: 1, grade_id: grade, title: `Đề cương ôn tập Toán Lớp ${grade} Học kỳ I`, file_type: "PDF", topic: "Tổng hợp", description: "Tóm tắt lý thuyết, dạng bài trọng tâm và đề luyện thi", file_url: "#" },
    { id: 2, grade_id: grade, title: `Sổ tay công thức Toán THCS Lớp ${grade}`, file_type: "PDF", topic: "Công thức", description: "Đầy đủ các công thức số học, đại số và hình học", file_url: "#" },
    { id: 3, grade_id: grade, title: `Bộ 50 câu hỏi tư duy và bài toán thực tế`, file_type: "DOCX", topic: "Thực tế", description: "Rèn luyện tư duy thực tiễn theo chuẩn GDPT mới", file_url: "#" }
  ];

  return res.status(200).json({ success: true, resources });
};
