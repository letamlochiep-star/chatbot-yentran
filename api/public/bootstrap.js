// Vercel Serverless Function: /api/public/bootstrap
module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "public, max-age=60");

  const fallbackData = {
    success: true,
    teacher: {
      name: "Thầy Lê Tâm",
      motto: "HỎI ĐỂ HIỂU – KHÔNG LỜI GIẢI CHI TIẾT"
    },
    grades: [
      { id: "6", name: "Toán Lớp 6" },
      { id: "7", name: "Toán Lớp 7" },
      { id: "8", name: "Toán Lớp 8" },
      { id: "9", name: "Toán Lớp 9" }
    ],
    metrics: {
      totalVisits: 1250,
      totalAttempts: 468,
      accuracyRate: 78.5
    },
    prompts: {
      home: "Đồng hành cùng học sinh THCS tư duy từng bước",
      chat: "Hỏi để hiểu – không đưa lời giải chi tiết"
    },
    tips: [
      { title: "Phương pháp 4 bước", content: "Đọc đề -> Vẽ hình/Tìm công thức -> Tính toán -> Kiểm tra kết quả." },
      { title: "Học hiểu bản chất", content: "Tự đặt câu hỏi 'Tại sao lại làm bước này?' thay vì chỉ chép lời giải." }
    ]
  };

  return res.status(200).json(fallbackData);
};
