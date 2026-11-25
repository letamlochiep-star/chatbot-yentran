// Vercel Serverless Function: /api/public/resources
// Cung cấp và quản lý tài liệu, đề thi, đề cương ôn tập môn Toán THCS

let inMemoryResourcesByGrade = {
  "6": [
    { id: 101, grade_id: "6", title: "Mô phỏng tương tác: Khám phá Trục số nguyên & Phép cộng trừ", file_type: "HTML", topic: "Tương tác HTML", description: "Mô hình trực quan bước nhảy số đối và phép cộng trừ số nguyên trên trục số", file_url: "/interactive/so-nguyen.html" },
    { id: 1, grade_id: "6", title: "Đề cương ôn tập Toán Lớp 6 Học kỳ I", file_type: "PDF", topic: "Tổng hợp", description: "Tóm tắt lý thuyết, dạng bài trọng tâm và đề luyện thi", file_url: "#" },
    { id: 2, grade_id: "6", title: "Sổ tay công thức Toán THCS Lớp 6", file_type: "PDF", topic: "Công thức", description: "Đầy đủ các công thức số học và hình học trực quan", file_url: "#" },
    { id: 3, grade_id: "6", title: "Bộ 50 câu hỏi tư duy và bài toán thực tế Toán 6", file_type: "DOCX", topic: "Thực tế", description: "Rèn luyện tư duy thực tiễn theo chuẩn GDPT mới", file_url: "#" }
  ],
  "7": [
    { id: 102, grade_id: "7", title: "Mô phỏng tương tác: Tổng 3 góc của Tam giác & Định lý hình học", file_type: "HTML", topic: "Tương tác HTML", description: "Điều chỉnh các góc tam giác để kiểm chứng tổng 3 góc luôn bằng 180°", file_url: "/interactive/tam-giac.html" },
    { id: 4, grade_id: "7", title: "Đề cương ôn thi Học kỳ I Toán Lớp 7 (Có đáp án)", file_type: "PDF", topic: "Đề thi", description: "Tổng hợp các bài toán số hữu tỉ và hình học tam giác", file_url: "#" },
    { id: 5, grade_id: "7", title: "Chuyên đề Định lý Pythagore và ứng dụng thực tế", file_type: "DOCX", topic: "Chuyên đề", description: "Hệ thống bài tập từ cơ bản đến nâng cao", file_url: "#" }
  ],
  "8": [
    { id: 10, grade_id: "8", title: "Mô phỏng tương tác: Khám phá Định lý Pythagore & Tam giác vuông", file_type: "HTML", topic: "Tương tác HTML", description: "Mô hình hình học trực quan giúp học sinh tự thao tác và kiểm chứng định lý", file_url: "/interactive/pythagore.html" },
    { id: 6, grade_id: "8", title: "Trọn bộ 7 Hằng đẳng thức đáng nhớ & Bài tập vận dụng", file_type: "PDF", topic: "Đại số", description: "Phương pháp phân tích đa thức thành nhân tử", file_url: "#" },
    { id: 7, grade_id: "8", title: "Chuyên đề Tứ giác: Hình bình hành, Hình chữ nhật, Hình thoi", file_type: "PDF", topic: "Hình học", description: "Các bài toán chứng minh và tính toán hình học", file_url: "#" }
  ],
  "9": [
    { id: 103, grade_id: "9", title: "Mô phỏng tương tác: Góc nội tiếp & Góc ở tâm trong Đường tròn", file_type: "HTML", topic: "Tương tác HTML", description: "Khám phá định lý mối liên hệ số đo giữa góc nội tiếp và góc ở tâm cùng chắn cung", file_url: "/interactive/duong-tron.html" },
    { id: 8, grade_id: "9", title: "Bộ đề luyện thi tuyển sinh vào Lớp 10 môn Toán (Mới nhất)", file_type: "PDF", topic: "Luyện thi 10", description: "Đề thi chuẩn cấu trúc Sở GD&ĐT có lời giải chi tiết", file_url: "#" },
    { id: 9, grade_id: "9", title: "Sổ tay Chuyên đề Hình học Đường tròn & Tứ giác nội tiếp", file_type: "DOCX", topic: "Hình học 9", description: "Phương pháp vẽ hình phụ và các định lý mở rộng", file_url: "#" }
  ]
};

let nextResourceId = 300;

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  // POST: Giáo viên thêm tài liệu mới
  if (req.method === "POST") {
    let body = req.body;
    if (typeof body === "string") {
      try { body = JSON.parse(body); } catch (e) { body = {}; }
    }

    const { grade_id = "6", title, file_type = "PDF", topic = "Tài liệu", description = "", file_url = "#", html_content = "" } = body || {};

    if (!title) {
      return res.status(400).json({ success: false, error: "Vui lòng nhập tên tài liệu." });
    }

    const newResource = {
      id: nextResourceId++,
      grade_id: String(grade_id),
      title: title.trim(),
      file_type: (file_type || "PDF").toUpperCase(),
      topic: topic || "Tài liệu",
      description: description || "Tài liệu môn Toán do Thầy Lê Tâm chia sẻ",
      file_url: file_url || "#",
      html_content: html_content || undefined
    };

    if (!inMemoryResourcesByGrade[newResource.grade_id]) {
      inMemoryResourcesByGrade[newResource.grade_id] = [];
    }
    inMemoryResourcesByGrade[newResource.grade_id].unshift(newResource);

    return res.status(200).json({
      success: true,
      message: "Đã đăng tải tài liệu thành công!",
      resource: newResource
    });
  }

  // GET: Học sinh hoặc Giáo viên xem tài liệu
  const grade = req.query?.grade || "8";
  const resources = inMemoryResourcesByGrade[grade] || inMemoryResourcesByGrade["8"] || [];

  return res.status(200).json({
    success: true,
    resources
  });
};
