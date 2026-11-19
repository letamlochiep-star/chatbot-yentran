// Vercel Serverless Function: /api/chat
// Giữ API key Gemini ở phía máy chủ (biến môi trường), xoay vòng 5–10 key, tự chuyển key khi lỗi/hết hạn mức.

const DEFAULT_MODELS = [
  "gemini-flash-lite-latest",
  "gemini-3.5-flash-lite",
  "gemini-3.8-flash-lite",
  "gemini-3.7-flash-lite",
  "gemini-3.6-flash-lite",
  "gemini-3.1-flash-lite",
  "gemini-flash-latest"
];
const MODELS = process.env.GEMINI_MODEL 
  ? [process.env.GEMINI_MODEL, ...DEFAULT_MODELS.filter(m => m !== process.env.GEMINI_MODEL)]
  : DEFAULT_MODELS;

const MAX_WORDS = 80;
const MAX_OUTPUT_TOKENS = 700;
const MAX_HISTORY = 16;      // số tin nhắn gần nhất được gửi lên Gemini
const MAX_CHARS = 1500;      // giới hạn độ dài mỗi tin nhắn

const { TOPICS_BY_GRADE, TOPICS, QUY_TRINH_GIAI, TIEU_CHI_DANH_GIA, KNOWLEDGE_BANK } = require("./knowledge.js");

const KNOWLEDGE = process.env.KNOWLEDGE || KNOWLEDGE_BANK;

const SYSTEM_PROMPT = `
Bạn là YENTRAN AI (YENMATH AI) – "Hiểu Toán – Giải Thực Tiễn – Vững Tương Lai", trợ lý học tập và ôn luyện Toán bổ sung toàn diện cho THCS (Lớp 6, 7, 8) và ôn thi Tốt nghiệp THPT (Lớp 12) do cô Trần Thị Hải Yến xây dựng.

QUY TẮC VĂN PHONG VÀ ĐỊNH DẠNG TOÁN HỌC (CHUẨN KATEX):
- Văn phong sư phạm: Chuẩn mực, ân cần, gần gũi, khích lệ học sinh tự tư duy theo phong cách của cô Trần Thị Hải Yến. Mỗi lượt trả lời cô đọng, tự nhiên, sư phạm (khoảng 50 - 80 từ), có thể dùng **in đậm** cho ý chính.
- Thích ứng sư phạm theo khối lớp của học sinh:
  + Lớp 6: Giải thích trực quan, mộc mạc, gần gũi (chia bánh kẹo, chia quà, hàng rào khu vườn, độ cao âm, nhiệt độ), từng bước nhỏ, động viên các em làm quen với môn Toán THCS.
  + Lớp 7: Rèn luyện tính chính xác trong biến đổi số hữu tỉ, định lý hình học (tam giác bằng nhau, định lý Pytago, quan hệ góc), quy tắc chuyển vế, đơn thức - đa thức một biến.
  + Lớp 8: Hướng dẫn kỹ năng phân tích hằng đẳng thức, phân thức đại số, lập phương trình mô hình hóa bài toán thực tế (chuyển động, năng suất), định lý Thalès và tam giác đồng dạng.
  + Ôn thi THPT (Lớp 12): Giữ nguyên chiều sâu toán thực tiễn 8 chủ đề (tối ưu đạo hàm, thống kê ghép nhóm, tích phân thể tích diện tích, Oxyz, xác suất Bayes, quy hoạch tuyến tính...).
- BẮT BUỘC ĐỊNH DẠNG CÔNG THỨC (PHÍA CHATBOT):
  + Bản thân Chatbot PHẢI dùng mã LaTeX/KaTeX để hiển thị đẹp mọi công thức, số liệu, biến số ($x$, $y$, $V(x)$, $S = 40\\text{ m}^2$, $\\sqrt{x}$,...).
  + Đảm bảo mở/đóng dấu $ và $$ chính xác 100%.
- ĐIỀU CẤM TUYỆT ĐỐI KHI NÓI CHUYỆN VỚI HỌC SINH:
  + TUYỆT ĐỐI KHÔNG BAO GIỜ nhắc đến các từ kỹ thuật như "KaTeX", "LaTeX", "chuẩn KaTeX", "mã code" trước mặt học sinh.
  + TUYỆT ĐỐI KHÔNG yêu cầu học sinh "viết dưới dạng chuẩn KaTeX" hay "gõ mã LaTeX". Học sinh chỉ là học sinh, các em trả lời bằng chữ/số thông thường hoặc gửi ảnh bài làm.
  + Mọi câu hỏi hướng dẫn PHẢI tự nhiên, gần gũi: ví dụ hỏi "Em hãy thử tính xem diện tích hình chữ nhật bằng bao nhiêu nhé!" hoặc "Theo em bước tiếp theo chúng ta làm gì nào?", TUYỆT ĐỐI KHÔNG chèn cụm từ "dưới dạng chuẩn KaTeX".
- Mỗi lượt chỉ làm MỘT bước của quy trình, rồi dừng lại chờ học sinh phản hồi hoặc tự giải.

${QUY_TRINH_GIAI}

QUY ĐỊNH CÁC HÌNH THỨC CÂU HỎI (THEO CẤU TRÚC ĐỀ BỘ GD&ĐT):
1. Trắc nghiệm nhiều lựa chọn (4 phương án A, B, C, D): 
   - 1 tình huống rõ ràng, phù hợp khối lớp, chưa tiết lộ đáp án.
   - BẮT BUỘC MỖI PHƯƠNG ÁN PHẢI XUỐNG DÒNG RIÊNG BIỆT (dùng phím Enter/xuống dòng), TUYỆT ĐỐI KHÔNG VIẾT DÍNH TRÊN CÙNG MỘT DÒNG:
     A. [Nội dung phương án A]
     B. [Nội dung phương án B]
     C. [Nội dung phương án C]
     D. [Nội dung phương án D]
   - Sau 4 phương án, xuống dòng mới để hỏi câu hỏi gợi ý bước tiếp theo.
2. Trắc nghiệm Đúng - Sai: 
   - 1 tình huống có 4 ý a), b), c), d).
   - BẮT BUỘC MỖI Ý a), b), c), d) PHẢI NẰM TRÊN MỘT DÒNG RIÊNG BIỆT:
     a) [Mệnh đề a]
     b) [Mệnh đề b]
     c) [Mệnh đề c]
     d) [Mệnh đề d]
   - Người học trả lời Đ hoặc S cho từng ý.
3. Trả lời ngắn: Đề bài yêu cầu đáp án là một số hoặc biểu thức ngắn gọn (nêu rõ quy tắc làm tròn nếu có).
- CÔNG THỨC TOÁN HỌC: Chỉ dùng \\text{...} cho đơn vị đo (ví dụ: $x = 4\\text{ m}$, $V = 32\\text{ m}^3$), TUYỆT ĐỐI KHÔNG dùng \\mtext.

${TIEU_CHI_DANH_GIA}

KHI HỌC SINH GỬI HOẶC CHỤP ẢNH BÀI TOÁN / BÀI LÀM:
- Đọc kỹ toàn bộ chữ viết, hình vẽ, bảng số liệu, đồ thị hoặc bài giải viết tay trong ảnh.
- Nhận diện đúng đề bài toán theo đúng khối lớp (6, 7, 8, 12) và trích xuất các công thức sang định dạng chuẩn KaTeX ($ ... $ và $$ ... $$).
- Nếu ảnh là ĐỀ BÀI: Khen ngợi học sinh, tóm tắt dữ kiện quan trọng ở Bước 1 và đặt câu hỏi gợi ý bước tiếp theo.
- Nếu ảnh là BÀI GIẢI VIẾT TAY CỦA HỌC SINH: Nhận xét ân cần, chỉ rõ bước làm đúng, phát hiện lỗi sai cụ thể (nếu có), chấm điểm theo Thang 10 điểm (4 tiêu chí) và xếp loại, sau đó hướng dẫn chỉnh sửa chuẩn xác.

NGUỒN DỮ LIỆU BÀI TOÁN & PHƯƠNG PHÁP (ƯU TIÊN TUYỆT ĐỐI KHI RA ĐỀ VÀ HƯỚNG DẪN):
${KNOWLEDGE}
`;

function getKeys() {
  let raw = "";
  for (const [k, v] of Object.entries(process.env)) {
    const cleanKey = k.trim().toUpperCase();
    if (cleanKey.includes("GEMINI") && cleanKey.includes("KEY")) {
      raw = v;
      break;
    }
  }
  if (!raw) {
    raw = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || process.env.GEMINI_KEY || process.env.API_KEY || "";
  }
  return raw
    .split(/[,\n;]+/)
    .map(k => k.trim())
    .filter(Boolean)
    .slice(0, 10);
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const keys = getKeys();
  if (keys.length === 0) {
    const customVars = Object.keys(process.env).filter(k => 
      !k.startsWith("VERCEL") && !k.startsWith("AWS") && !k.startsWith("NODE") && !k.startsWith("LAMBDA")
    );
    return res.status(500).json({ 
      error: "Máy chủ chưa cấu hình GEMINI_API_KEYS.",
      available_vars: customVars
    });
  }

  // Kiểm tra & làm sạch lịch sử hội thoại gửi lên (đảm bảo luân phiên user/model)
  let messages = req.body && req.body.messages;
  if (typeof req.body === "string") {
    try { messages = JSON.parse(req.body).messages; } catch (e) { messages = null; }
  }
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Thiếu messages." });
  }

  const contents = [];
  const historySlice = messages.slice(-MAX_HISTORY);

  for (let i = 0; i < historySlice.length; i++) {
    const m = historySlice[i];
    if (!m || (m.role !== "user" && m.role !== "model")) continue;

    const parts = [];

    // Chỉ nhận ảnh ở role user
    if (m.role === "user" && typeof m.image === "string" && m.image.length > 50) {
      let mimeType = m.mimeType || "image/jpeg";
      let base64Data = m.image;

      if (base64Data.startsWith("data:")) {
        const match = base64Data.match(/^data:([^;]+);base64,(.+)$/);
        if (match) {
          mimeType = match[1];
          base64Data = match[2];
        }
      }

      if (base64Data) {
        parts.push({
          inlineData: {
            mimeType,
            data: base64Data
          }
        });
      }
    }

    const text = typeof m.text === "string" ? m.text.slice(0, MAX_CHARS).trim() : "";
    if (text) {
      parts.push({ text });
    } else if (parts.length > 0) {
      // Nếu học sinh chỉ gửi ảnh mà không gõ kèm lời nhắn
      parts.push({ text: "Hãy đọc kỹ nội dung trong ảnh này (đề bài hoặc bài giải toán) và hướng dẫn/chấm điểm cho em theo quy trình 5 bước giải toán thực tiễn." });
    }

    if (parts.length === 0) continue;

    // Gộp nếu 2 tin nhắn liên tiếp cùng role
    if (contents.length > 0 && contents[contents.length - 1].role === m.role) {
      contents[contents.length - 1].parts.push(...parts);
    } else {
      contents.push({ role: m.role, parts });
    }
  }

  while (contents.length && contents[0].role !== "user") contents.shift();
  if (contents.length === 0) {
    return res.status(400).json({ error: "Messages không hợp lệ." });
  }

  const body = {
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents,
    generationConfig: {
      temperature: 0.6,
      maxOutputTokens: MAX_OUTPUT_TOKENS
    }
  };

  // Thử lần lượt các key và model (xoay vòng)
  let lastError = null;

  for (let mIdx = 0; mIdx < MODELS.length; mIdx++) {
    const model = MODELS[mIdx];

    for (let kIdx = 0; kIdx < keys.length; kIdx++) {
      const key = keys[kIdx];
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

      try {
        const ctrl = new AbortController();
        const timeout = setTimeout(() => ctrl.abort(), 20000);

        const r = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: ctrl.signal
        });
        clearTimeout(timeout);

        if (r.ok) {
          const data = await r.json();
          const candidate = data.candidates && data.candidates[0];
          const rawText = candidate && candidate.content && candidate.content.parts && candidate.content.parts[0] && candidate.content.parts[0].text;

          if (rawText) {
            let cleaned = rawText
              .replace(/\\mtext\{([^}]*)\}/g, "\\text{$1}")
              .replace(/dưới dạng chuẩn KaTeX/gi, "")
              .replace(/chuẩn KaTeX/gi, "")
              .replace(/theo mã LaTeX/gi, "")
              .trim();

            return res.status(200).json({
              reply: cleaned,
              modelUsed: model,
              keyIndex: kIdx
            });
          }
        }

        const errText = await r.text();
        lastError = `Model ${model}, Key #${kIdx + 1}: HTTP ${r.status} – ${errText.slice(0, 120)}`;
        
        // 429 = Hết quota, 400 = Lỗi cú pháp/key hỏng -> chuyển key kế tiếp
        continue;
      } catch (err) {
        lastError = `Model ${model}, Key #${kIdx + 1}: ${err.name === "AbortError" ? "Hết thời gian chờ" : err.message}`;
        continue;
      }
    }
  }

  return res.status(502).json({
    error: "Các key Gemini hiện đều bận hoặc hết hạn mức. Vui lòng thử lại sau giây lát.",
    detail: lastError
  });
};
