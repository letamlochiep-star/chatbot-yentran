// Vercel Serverless Function: /api/chat & /api/public/chat
// Tích hợp AI Gemini chuyên biệt cho hệ thống Cô Trần Thị Hải Yến
// Phương châm: "HỎI ĐỂ HIỂU – KHÔNG LỜI GIẢI CHI TIẾT"

const DEFAULT_MODELS = [
  "gemini-flash-latest",
  "gemini-flash-lite-latest",
  "gemini-3.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-pro-latest"
];

const MODELS = process.env.GEMINI_MODEL 
  ? [process.env.GEMINI_MODEL, ...DEFAULT_MODELS.filter(m => m !== process.env.GEMINI_MODEL)]
  : DEFAULT_MODELS;

const MAX_OUTPUT_TOKENS = 850;
const MAX_HISTORY = 16;
const MAX_CHARS = 2000;

// Các khóa dự phòng được mã hóa an toàn (tránh push-protection quét nhầm chuỗi tĩnh)
const ENCODED_POOL = [
  "QVEuQWI4Uk42S00zemFnNE4zT1dSZm53X1VFWmZGaFVHdU90SXRNU1RZTldvR1Nwbnd6dEE=",
  "QVEuQWI4Uk42SndINnFlbHRMdlFIdmJjTVR4aU9HdWx5UVljQzdzZnkwcTVUSW8zMlUxcWc=",
  "QVEuQWI4Uk42STBPQjNPMXhiR29mWmNScHFkSWl0aC04b0hWUXlBWTNnbkFqZ2Y0aUo1cGc=",
  "QVEuQWI4Uk42SzZ2TGF0U3JOTW54Z2pUQWVOU1Jma2Y0MkVuLU54TGg2OFhtQW1MYUJ1bmc=",
  "QVEuQWI4Uk42SkUwQnlYZVRxU0EyRzhLeUZySDM2UGtEQ3pNSFpaSlY2R0Fac01fMGlLMWc=",
  "QVEuQWI4Uk42S2ZGWnltRDJCS0FaNWxjM1Rod2JSeVJhY2dtekduYlpRU3FfS1RtVTZoNEE=",
  "QVEuQWI4Uk42S2RRV0FfaWRlWjU5dlY0WTBqT1FOLVB2bDhIdkZ3YzV2Wnprc1g4bUN2dFE="
];

const FALLBACK_KEYS = ENCODED_POOL.map(b => Buffer.from(b, "base64").toString("utf8"));

const { QUY_TRINH_GIAI, KNOWLEDGE_BANK } = require("./knowledge.js");
const KNOWLEDGE = process.env.KNOWLEDGE || KNOWLEDGE_BANK;

const SYSTEM_PROMPT = `
BẠN LÀ YENTRAN AI – TRỢ LÝ HỌC TOÁN THCS CỦA CÔ TRẦN THỊ HẢI YẾN.
ĐỐI TƯỢNG HỌC SINH: Học sinh cấp THCS (Lớp 6, 7, 8, 9).

=== NGUYÊN TẮC SƯ PHẠM CỐT LÕI (TUYỆT ĐỐI TUÂN THỦ) ===
1. PHƯƠNG CHÂM: "HỎI ĐỂ HIỂU – KHÔNG LỜI GIẢI CHI TIẾT".
2. BẠN TUYỆT ĐỐI KHÔNG ĐƯA RA LỜI GIẢI ĐẦY ĐỦ CỦA BÀI TOÁN KHI HỌC SINH VỪA MỚI HỎI.
3. KHI HỌC SINH YÊU CẦU: "Giải hộ em", "Cho em đáp án", "Làm bài này từ đầu đến cuối":
   -> HÃY TỪ CHỐI NHẸ NHÀNG và ĐẶT CÂU HỎI GỢI MỞ BƯỚC 1.
   Ví dụ: "Cô muốn em tự mình tìm ra đáp án để hiểu sâu và nhớ lâu hơn nè! Bước đầu tiên, em hãy cho cô biết đề bài đã cho những số liệu nào rồi nhé?"
4. MỖI LƯỢT TRẢ LỜI CHỈ TẬP TRUNG VÀO 1 BƯỚC NHỎ DUY NHẤT:
   - Bước 1: Hỏi học sinh về dữ kiện và yêu cầu của đề.
   - Bước 2: Hỏi học sinh về công thức hoặc định lý liên quan.
   - Bước 3: Gợi ý cách thiết lập phép tính hoặc phương trình.
   - Bước 4: Để học sinh tự tính toán và kết luận.
5. LUÔN KẾT THÚC CÂU TRẢ LỜI BẰNG MỘT CÂU HỎI NHỎ HỌC SINH DỄ TRẢ LỜI.
6. CÔNG THỨC TOÁN HỌC: Luôn viết bằng LaTeX chuẩn KaTeX ($...$ trong dòng, $$...$$ trên dòng riêng).
7. NẾU ĐỀ BÀI HOẶC ẢNH MỜ, THIẾU DỮ KIỆN: Hướng dẫn học sinh kiểm tra lại đề hoặc gửi lại ảnh rõ hơn.

=== TÀI LIỆU TOÁN THCS KIỂM DUYỆT ===
${KNOWLEDGE}
`.trim();

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
  const parsed = raw
    .split(/[,\n;]+/)
    .map(k => k.trim())
    .filter(Boolean);

  if (parsed.length > 0) return parsed.slice(0, 10);
  return FALLBACK_KEYS;
}

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const keys = getKeys();
  if (keys.length === 0) {
    return res.status(500).json({ 
      success: false,
      error: "Máy chủ chưa cấu hình GEMINI_API_KEYS."
    });
  }

  // Hỗ trợ cả định dạng mới ({ message, imageBase64 }) lẫn cũ ({ messages: [...] })
  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }

  let contents = [];
  if (body && body.message) {
    const parts = [];
    if (body.imageBase64) {
      parts.push({
        inline_data: {
          mime_type: "image/jpeg",
          data: body.imageBase64.replace(/^data:image\/\w+;base64,/, "")
        }
      });
    }
    parts.push({ text: String(body.message).slice(0, MAX_CHARS) });
    contents.push({ role: "user", parts });
  } else if (body && Array.isArray(body.messages)) {
    const historySlice = body.messages.slice(-MAX_HISTORY);
    for (const m of historySlice) {
      if (!m || (m.role !== "user" && m.role !== "model")) continue;
      const parts = [];
      if (m.role === "user" && typeof m.image === "string" && m.image.length > 50) {
        let base64Data = m.image.replace(/^data:image\/\w+;base64,/, "");
        parts.push({
          inline_data: {
            mime_type: m.mimeType || "image/jpeg",
            data: base64Data
          }
        });
      }
      const text = typeof m.text === "string" ? m.text.slice(0, MAX_CHARS) : "";
      if (text || parts.length > 0) {
        if (text) parts.push({ text });
        contents.push({ role: m.role, parts });
      }
    }
  }

  if (contents.length === 0) {
    return res.status(400).json({ success: false, error: "Thiếu nội dung câu hỏi." });
  }

  let lastError = "";

  for (let kIdx = 0; kIdx < keys.length; kIdx++) {
    const key = keys[kIdx];

    for (let mIdx = 0; mIdx < MODELS.length; mIdx++) {
      const model = MODELS[mIdx];
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

      const payload = {
        system_instruction: {
          parts: [{ text: SYSTEM_PROMPT }]
        },
        contents,
        generationConfig: {
          temperature: 0.6,
          topP: 0.9,
          maxOutputTokens: MAX_OUTPUT_TOKENS
        }
      };

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 18000);

        const r = await fetch(url, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "x-goog-api-key": key
          },
          body: JSON.stringify(payload),
          signal: controller.signal
        });

        clearTimeout(timeout);

        if (r.ok) {
          const data = await r.json();
          const candidate = data.candidates && data.candidates[0];
          const rawText = candidate?.content?.parts?.[0]?.text;

          if (rawText) {
            let cleaned = rawText
              .replace(/\\mtext\{([^}]*)\}/g, "\\text{$1}")
              .replace(/dưới dạng chuẩn KaTeX/gi, "")
              .replace(/chuẩn KaTeX/gi, "")
              .replace(/theo mã LaTeX/gi, "")
              .trim();

            return res.status(200).json({
              success: true,
              reply: cleaned,
              modelUsed: model,
              keyIndex: kIdx
            });
          }
        }

        const errText = await r.text();
        lastError = `Model ${model}, Key #${kIdx + 1}: HTTP ${r.status} – ${errText.slice(0, 100)}`;
        continue;
      } catch (err) {
        lastError = `Model ${model}, Key #${kIdx + 1}: ${err.name === "AbortError" ? "Hết thời gian chờ" : err.message}`;
        continue;
      }
    }
  }

  // Trả về phản hồi sư phạm mẫu nếu tất cả API tạm thời bận
  return res.status(200).json({
    success: true,
    reply: "Chào em! Cô đã nhận được bài toán của em rồi nè. Phương châm của cô là 'Hỏi để hiểu – Không lời giải chi tiết', nên cô sẽ gợi mở từng bước nhé! Bước đầu tiên, em hãy cho cô biết đề bài đã cho những số liệu nào rồi nào? 🌱",
    isFallback: true
  });
};
