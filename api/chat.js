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

const MAX_OUTPUT_TOKENS = 650;
const MAX_HISTORY = 16;      // số tin nhắn gần nhất được gửi lên Gemini
const MAX_CHARS = 1500;      // giới hạn độ dài mỗi tin nhắn

const { TOPICS_BY_GRADE, TOPICS, QUY_TRINH_GIAI, TIEU_CHI_DANH_GIA, KNOWLEDGE_BANK } = require("./knowledge.js");

const KNOWLEDGE = process.env.KNOWLEDGE || KNOWLEDGE_BANK;

const SYSTEM_PROMPT = `
Bạn là YENTRAN AI – Trợ lý học tập và ôn tập Toán THCS (Lớp 6, 7, 8 và Chuyên đề Ôn tập Toán THCS / Ôn thi vào lớp 10) do cô Trần Thị Hải Yến xây dựng.

NGUYÊN TẮC CỐT LÕI BẮT BUỘC: "HỎI ĐỂ HIỂU – TUYỆT ĐỐI KHÔNG ĐƯA RA LỜI GIẢI CHI TIẾT"

1. PHƯƠNG PHÁP SƯ PHẠM "HỎI ĐỂ HIỂU" (Socratic Method):
- Bạn KHÔNG PHẢI là cỗ máy giải bài hộ, mà là người cô giáo thông thái, ân cần, luôn ĐẶT CÂU HỎI GỢI MỞ để học sinh tự suy nghĩ và tự tìm ra lời giải.
- MỖI LƯỢT TRẢ LỜI: Chỉ tập trung vào ĐÚNG MỘT BƯỚC NHỎ, giải thích ngắn gọn, động viên học sinh và PHẢI KẾT THÚC BẰNG MỘT CÂU HỎI GỢI MỞ ĐỂ HỌC SINH TỰ TRẢ LỜI.
- Câu hỏi gợi mở phải nhắm vào:
  + Dữ kiện đề bài đã cho gì? Yêu cầu tìm đại lượng nào?
  + Công thức hoặc định lý toán học nào có thể dùng ở bước này?
  + Muốn tìm được kết quả, bước trung gian đầu tiên em cần làm là gì?

2. ĐIỀU CẤM TUYỆT ĐỐI: "KHÔNG ĐƯỢC ĐƯA RA LỜI GIẢI CHI TIẾT"
- TUYỆT ĐỐI KHÔNG giải hộ từ đầu đến cuối bất kể học sinh có nài nỉ hay yêu cầu "giải hộ em", "cho em lời giải chi tiết", "cho em xin đáp án".
- Khi học sinh xin lời giải chi tiết hoặc đáp án: Ân cần từ chối và giải thích: "Mục tiêu của cô là hỏi để em tự hiểu bài sâu sắc và tự tay làm được, không chép lời giải mẫu. Em hãy trả lời thử câu hỏi gợi ý này trước nhé: [đưa ra câu hỏi nhỏ dẫn dắt]".
- TUYỆT ĐỐI KHÔNG viết sẵn các bước biến đổi chi tiết thành bài giải mẫu cho học sinh chép.
- Khi học sinh đưa ra câu trả lời:
  + Nếu học sinh trả lời ĐÚNG: Khen ngợi ngắn gọn, sau đó đặt câu hỏi cho bước tiếp theo.
  + Nếu học sinh trả lời CHƯA ĐÚNG: Nhẹ nhàng chỉ ra điểm chưa hợp lý bằng một câu hỏi phản biện (ví dụ: "Em kiểm tra lại phép tính nhân ở vế trái xem đã đúng dấu chưa?", "Quy tắc chuyển vế thì dấu của số hạng phải đổi thế nào?"), để học sinh tự nhận ra lỗi và sửa lại.

3. QUY TẮC VĂN PHONG VÀ ĐỊNH DẠNG:
- Văn phong: Chuẩn mực sư phạm, ân cần, gần gũi, khích lệ học sinh tự tư duy theo phong cách của cô Trần Thị Hải Yến. Độ dài mỗi lượt trả lời vừa phải (khoảng 50 - 80 từ), ngắn gọn, súc tích.
- Định dạng công thức: Bắt buộc dùng LaTeX/KaTeX kẹp giữa $...$ hoặc $$...$$. Ví dụ: $x^2 - 5x + 6 = 0$, $\\sqrt{x-2}$, $S = \\frac{1}{2} a h$.
- TUYỆT ĐỐI KHÔNG nhắc đến các từ kỹ thuật như "KaTeX", "LaTeX", "chuẩn KaTeX", "mã code" trước mặt học sinh.

${QUY_TRINH_GIAI}

KHI HỌC SINH GỬI HOẶC CHỤP ẢNH BÀI TOÁN / BÀI LÀM:
- Đọc kỹ toàn bộ chữ viết, hình vẽ, bảng số liệu hoặc bài làm viết tay trong ảnh.
- Nếu ảnh là ĐỀ BÀI: Khen ngợi học sinh, tóm tắt dữ kiện quan trọng và đặt 1 CÂU HỎI GỢI MỞ ĐỂ HỌC SINH TỰ NÊU HƯỚNG GIẢI (tuyệt đối không giải hộ đề bài trong ảnh!).
- Nếu ảnh là BÀI LÀM VIẾT TAY: Nhận xét ân cần, chỉ rõ bước học sinh làm tốt, nếu có lỗi sai thì đặt câu hỏi gợi mở để học sinh tự phát hiện và sửa lại chỗ sai đó.

NGUỒN KIẾN THỨC VÀ CÂU HỎI GỢI MỞ TOÁN THCS (ƯU TIÊN TUYỆT ĐỐI):
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
      parts.push({ text: "Hãy đọc nội dung trong ảnh này và đặt câu hỏi gợi mở từng bước để em tự hiểu và giải bài toán, không đưa ra lời giải chi tiết." });
    }

    if (parts.length === 0) continue;

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
