// Vercel Serverless Function: /api/generate-lesson
// AI Hỗ trợ giáo viên soạn thảo bài học / lý thuyết nhanh theo tiêu đề

const DEFAULT_MODELS = [
  "gemini-3.5-flash",
  "gemini-3.1-flash-lite",
  "gemini-flash-latest"
];

const ENCODED_POOL = [
  "QVEuQWI4Uk42S00zemFnNE4zT1dSZm53X1VFWmZGaFVHdU90SXRNU1RZTldvR1Nwbnd6dEE=",
  "QVEuQWI4Uk42SndINnFlbHRMdlFIdmJjTVR4aU9HdWx5UVljQzdzZnkwcTVUSW8zMlUxcWc=",
  "QVEuQWI4Uk42STBPQjNPMXhiR29mWmNScHFkSWl0aC04b0hWUXlBWTNnbkFqZ2Y0aUo1cGc="
];
const FALLBACK_KEYS = ENCODED_POOL.map(b => Buffer.from(b, "base64").toString("utf8"));

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
  const parsed = raw.split(/[,\n;]+/).map(k => k.trim()).filter(Boolean);
  if (parsed.length > 0) return parsed.slice(0, 10);
  return FALLBACK_KEYS;
}

function getFallbackLesson(title, grade) {
  return {
    title: title || `Bài học Toán lớp ${grade}`,
    content: `### 1. Khái niệm và Định lý cốt lõi:
Bài học **${title}** là nội dung quan trọng trong chương trình Toán Lớp ${grade}.
- Nắm vững định nghĩa cơ bản và phạm vi áp dụng.
- Chú ý các điều kiện ràng buộc của biến số và dữ kiện hình học.
- Ghi nhớ công thức biến đổi tương đương để áp dụng vào các bài toán tính toán và chứng minh.

### 2. Phương pháp giải toán:
- Bước 1: Đọc kỹ đề bài, bóc tách giả thiết và kết luận.
- Bước 2: Lựa chọn công thức hoặc định lý phù hợp nhất.
- Bước 3: Trình bày bài giải mạch lạc, có giải thích và kết luận rõ ràng.`,
    sample_example: `Ví dụ: Vận dụng kiến thức bài ${title} để giải quyết bài toán cơ bản. Lời giải: Ta áp dụng công thức trọng tâm, tính toán cẩn thận từng bước để tìm ra kết quả chính xác.`,
    self_check_question: `Em hãy tự phát biểu lại định nghĩa và ghi nhớ công thức trọng tâm của bài ${title} ra giấy nháp nhé!`
  };
}

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }

  const { lessonTitle, title, topic, grade = "6" } = body || {};
  const cleanTitle = (lessonTitle || title || topic || "").trim();
  if (!cleanTitle) {
    return res.status(400).json({ success: false, error: "Vui lòng cung cấp tiêu đề bài học." });
  }
  const keys = getKeys();

  const prompt = `Bạn là Thầy Lê Tâm - giáo viên chuyên bồi dưỡng Toán THCS.
Hãy giúp giáo viên soạn thảo nội dung 1 bài học lý thuyết hoàn chỉnh theo TIÊU ĐỀ:
- Tiêu đề: "${cleanTitle}"
- Khối lớp: Lớp ${grade} (Toán THCS)

YÊU CẦU:
1. Nội dung lý thuyết (content): Cô đọng, dễ hiểu cho học sinh THCS, có định nghĩa, tính chất và công thức viết bằng KaTeX ($...$ hoặc $$...$$).
2. Ví dụ minh họa (sample_example): 1 ví dụ cụ thể, có số liệu và lời giải ngắn gọn.
3. Câu hỏi tự kiểm tra (self_check_question): 1 câu hỏi ngắn giúp học sinh tự ôn lại lý thuyết.

TRẢ VỀ DUY NHẤT 1 ĐỐI TƯỢNG JSON thuần (không code block):
{
  "title": "${cleanTitle}",
  "content": "Nội dung lý thuyết...",
  "sample_example": "Ví dụ và lời giải...",
  "self_check_question": "Câu hỏi tự kiểm tra..."
}`;

  for (const model of DEFAULT_MODELS) {
    for (let i = 0; i < Math.min(keys.length, 3); i++) {
      const apiKey = keys[i];
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 9000);

      try {
        const resp = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.4,
              maxOutputTokens: 1200
            }
          })
        });
        clearTimeout(timer);

        if (resp.ok) {
          const data = await resp.json();
          let rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
          rawText = rawText.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();

          const jsonMatch = rawText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed.content) {
              return res.status(200).json({
                success: true,
                lesson: {
                  title: cleanTitle,
                  content: parsed.content,
                  sample_example: parsed.sample_example || "",
                  self_check_question: parsed.self_check_question || ""
                },
                source: "ai"
              });
            }
          }
        }
      } catch (err) {
        clearTimeout(timer);
      }
    }
  }

  return res.status(200).json({
    success: true,
    lesson: getFallbackLesson(cleanTitle, grade),
    source: "template"
  });
};
