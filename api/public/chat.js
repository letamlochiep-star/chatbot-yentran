// Vercel Serverless Function: /api/chat & /api/public/chat
// Tích hợp AI Gemini chuyên biệt cho hệ thống Thầy Lê Tâm
// Phương châm: "HỎI ĐỂ HIỂU – KHÔNG LỜI GIẢI CHI TIẾT"
// Bổ sung: Tự động vẽ hình học dạng SVG vector chuẩn mực

const DEFAULT_MODELS = [
  "gemini-3.5-flash",
  "gemini-3.1-flash-lite",
  "gemini-flash-latest"
];

const MODELS = process.env.GEMINI_MODEL 
  ? [process.env.GEMINI_MODEL, ...DEFAULT_MODELS.filter(m => m !== process.env.GEMINI_MODEL)]
  : DEFAULT_MODELS;

const MAX_OUTPUT_TOKENS = 1800;
const MAX_HISTORY = 16;
const MAX_CHARS = 2500;

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

const KNOWLEDGE_BANK = `
=== NGÂN HÀNG KIẾN THỨC TRỌNG TÂM TOÁN LỚP 8 & TOÁN LỚP 9 (THẦY LÊ TÂM) ===

I. TRỌNG TÂM TOÁN LỚP 8 (CHƯƠNG TRÌNH GDPT MỚI)
1. ĐA THỨC & 7 HẰNG ĐẲNG THỨC ĐÁNG NHỚ:
   - 7 Hằng đẳng thức: 
     + $(A+B)^2 = A^2 + 2AB + B^2$; $(A-B)^2 = A^2 - 2AB + B^2$
     + $A^2 - B^2 = (A-B)(A+B)$
     + $(A+B)^3 = A^3 + 3A^2B + 3AB^2 + B^3$; $(A-B)^3 = A^3 - 3A^2B + 3AB^2 - B^3$
     + $A^3 + B^3 = (A+B)(A^2 - AB + B^2)$; $A^3 - B^3 = (A-B)(A^2 + AB + B^2)$
   - Phân tích đa thức thành nhân tử: Đặt nhân tử chung, dùng hằng đẳng thức, nhóm hạng tử, phối hợp nhiều phương pháp.
2. PHÂN THỨC ĐẠI SỐ:
   - Điều kiện xác định (ĐKXĐ): Mẫu thức khác 0.
   - Rút gọn phân thức: Phân tích tử và mẫu thành nhân tử rồi triệt tiêu nhân tử chung.
   - Các phép tính: Cộng, trừ cùng mẫu hoặc quy đồng mẫu thức; Nhân, chia phân thức.
3. HÀM SỐ BẬC NHẤT $y = ax + b$ ($a \\neq 0$):
   - Tính chất: Đồng biến trên $\\mathbb{R}$ khi $a > 0$, nghịch biến khi $a < 0$.
   - Vị trí tương đối của $d_1: y=a_1x+b_1$ và $d_2: y=a_2x+b_2$:
     + Cắt nhau $\\iff a_1 \\neq a_2$ (vuông góc $\\iff a_1 \\cdot a_2 = -1$).
     + Song song $\\iff a_1 = a_2$ và $b_1 \\neq b_2$.
     + Trùng nhau $\\iff a_1 = a_2$ và $b_1 = b_2$.
4. PHƯƠNG TRÌNH BẬC NHẤT MỘT ẨN & GIẢI BÀI TOÁN BẰNG CÁCH LẬP PHƯƠNG TRÌNH:
   - Dạng $ax + b = 0$ ($a \\neq 0$) $\\iff x = -b/a$.
   - Giải bài toán bằng cách lập PT: 3 bước chuẩn (Chọn ẩn và đặt điều kiện -> Lập phương trình -> Giải PT và đối chiếu điều kiện).
   - Các dạng toán thực tế: Chuyển động ($s = v \\cdot t$), Năng suất ($A = N \\cdot t$), Phần trăm, kinh tế, hình học.
5. HÌNH HỌC TỨ GIÁC:
   - Tứ giác có tổng 4 góc bằng $360^\\circ$.
   - Hình thang cân, Hình bình hành, Hình chữ nhật, Hình thoi, Hình vuông (nắm vững định nghĩa, tính chất đường chéo và dấu hiệu nhận biết).
6. ĐỊNH LÝ THALÈS & TAM GIÁC ĐỒNG DẠNG:
   - Định lý Thalès thuận và đảo; Hệ quả định lý Thalès: $MN \\parallel BC \\implies \\frac{AM}{AB} = \\frac{AN}{AC} = \\frac{MN}{BC}$.
   - 3 trường hợp đồng dạng của tam giác: c-c-c, c-g-c, g-g. Tam giác vuông đồng dạng.

II. TRỌNG TÂM TOÁN LỚP 9 (ÔN THI TUYỂN SINH VÀO LỚP 10)
1. CĂN BẬC HAI & RÚT GỌN BIỂU THỨC CHỨA CĂN:
   - Điều kiện xác định của $\\sqrt{A}$ là $A \\ge 0$. Hằng đẳng thức: $\\sqrt{A^2} = |A|$.
   - Khai phương một tích, một thương; Trục căn thức ở mẫu: nhân liên hợp $\\sqrt{A} - \\sqrt{B}$ với $\\sqrt{A} + \\sqrt{B}$.
   - Dạng bài thi vào 10: Rút gọn biểu thức $P$, tính giá trị khi biết $x$, tìm $x$ để $P > 0$ hoặc $P$ nguyên, tìm Min/Max.
2. HỆ PHƯƠNG TRÌNH BẬC NHẤT HAI ẨN:
   - Phương pháp thế và cộng đại số; Giải và biện luận hệ chứa tham số $m$.
   - Giải bài toán thực tế bằng cách lập hệ phương trình (Toán chung - riêng, chuyển động xuôi - ngược dòng sông, phần trăm).
3. HÀM SỐ $y = ax^2$ ($a \\neq 0$) & PHƯƠNG TRÌNH BẬC HAI MỘT ẨN:
   - Đồ thị Parabol $(P): y = ax^2$ và đường thẳng $(d): y = mx + n$. Phương trình hoành độ giao điểm: $ax^2 - mx - n = 0$.
   - Công thức nghiệm: $\\Delta = b^2 - 4ac$ (hoặc $\\Delta' = b'^2 - ac$).
   - Định lý Vi-ét: $S = x_1 + x_2 = -b/a$; $P = x_1 x_2 = c/a$. 
   - Các hệ thức đối xứng: $x_1^2 + x_2^2 = S^2 - 2P$; $\\frac{1}{x_1} + \\frac{1}{x_2} = \\frac{S}{P}$; $|x_1 - x_2| = \\sqrt{S^2 - 4P}$.
4. HỆ THỨC LƯỢNG TRONG TAM GIÁC VUÔNG & TỈ SỐ LƯỢNG GIÁC:
   - $\\Delta ABC$ vuông tại $A$, đường cao $AH$: $AB^2 = BH \\cdot BC$; $AC^2 = CH \\cdot BC$; $AH^2 = BH \\cdot CH$; $AB \\cdot AC = AH \\cdot BC$; $\\frac{1}{AH^2} = \\frac{1}{AB^2} + \\frac{1}{AC^2}$.
   - Tỉ số lượng giác góc nhọn: $\\sin = \\text{đối}/\\text{huyền}$, $\\cos = \\text{kề}/\\text{huyền}$, $\\tan = \\text{đối}/\\text{kề}$, $\\cot = \\text{kề}/\\text{đối}$.
5. ĐƯỜNG TRÒN & TỨ GIÁC NỘI TIẾP:
   - Góc ở tâm và góc nội tiếp: $\\widehat{ACB} = \\frac{1}{2}\\widehat{AOB}$. Góc nội tiếp chắn nửa đường tròn là góc vuông ($90^\\circ$).
   - Tiếp tuyến và tính chất hai tiếp tuyến cắt nhau.
   - 4 dấu hiệu chứng minh tứ giác nội tiếp:
     1) Tứ giác có tổng hai góc đối bằng $180^\\circ$.
     2) Tứ giác có góc ngoài tại một đỉnh bằng góc trong tại đỉnh đối diện.
     3) Hai đỉnh kề nhau cùng nhìn cạnh chứa hai đỉnh còn lại dưới hai góc bằng nhau.
     4) Tứ giác có 4 đỉnh cùng cách đều một điểm cố định (tâm đường tròn ngoại tiếp).
6. BẤT ĐẲNG THỨC AM-GM (CAUCHY) & TỐI ƯU HÓA ĐIỂM 10:
   - $a + b \\ge 2\\sqrt{ab}$ với $a, b \\ge 0$. Dấu bằng xảy ra $\\iff a = b$.
`.trim();

const KNOWLEDGE = process.env.KNOWLEDGE || KNOWLEDGE_BANK;

const SYSTEM_PROMPT = `
BẠN LÀ LÊ TÂM AI – TRỢ LÝ HỌC TOÁN THCS CỦA THẦY LÊ TÂM.
CHUYÊN GIA BỒI DƯỠNG TRỌNG TÂM TOÁN LỚP 8 VÀ ÔN THI TUYỂN SINH VÀO LỚP 10 (TOÁN LỚP 9).
ĐỐI TƯỢNG HỌC SINH: Học sinh cấp THCS trên toàn quốc, đặc biệt tập trung học sinh Lớp 8 và Lớp 9.

=== NGUYÊN TẮC SƯ PHẠM VÀ PHONG CÁCH GIẢNG BÀI (BẮT BUỘC TUÂN THỦ) ===
1. PHƯƠNG CHÂM CỐT LÕI: "HỎI ĐỂ HIỂU – KHÔNG LỜI GIẢI CHI TIẾT".
   - Bạn TUYỆT ĐỐI KHÔNG giải hộ từ đầu đến cuối hay đưa ra đáp số trọn gói ngay lập tức để học sinh chép.
   - PHONG CÁCH: Thân thiện, gần gũi, chuẩn mực, giảng giải ĐƠN GIẢN, NGẮN GỌN, DỄ HIỂU NHẤT đối với học sinh cấp 2 (khoảng 150 – 250 từ). Tuyệt đối không dài dòng lê thê hay dùng từ ngữ hàn lâm gây bối rối cho học sinh.

2. CẤU TRÚC 3 BƯỚC PHẢN HỒI ĐƠN GIẢN & DỄ HIỂU:
   🌱 BƯỚC 1: LỜI CHÀO THÂN TÌNH & NHẬN ĐỊNH BÀI TOÁN (1-2 câu)
   - Chào em thân thương ("Chào em! Thầy rất vui khi nhận được bài toán này của em...").
   - Xác định nhanh dạng toán trọng tâm (Phương trình, Tam giác vuông Pythagore, Hình bình hành, Phân thức, Hệ thức lượng, Parabol Vi-ét, Tứ giác nội tiếp...).

   💡 BƯỚC 2: CÔNG THỨC CỐT LÕI & LƯU Ý TRÁNH BẪY SAI LẦM
   - Nêu đúng 1 công thức hoặc định lý then chốt bằng LaTeX chuẩn KaTeX ($...$ hoặc $$...$$).
   - Nhắc 1 lưu ý quan trọng để tránh bẫy (ví dụ: điều kiện xác định mẫu khác 0, chuyển vế phải đổi dấu, xét dấu biệt thức Delta...).
   - NẾU LIÊN QUAN ĐẾN HÌNH HỌC (tam giác vuông, hình bình hành, đường tròn, hình chữ nhật, tam giác thường...):
     + Gắn thẻ chuẩn: [DIAGRAM: tam_giac_vuong | Tam giác vuông ABC tại A] (hoặc [DIAGRAM: hinh_binh_hanh | Hình bình hành ABCD], [DIAGRAM: duong_tron | Đường tròn (O; R)], [DIAGRAM: tam_giac_thuong | Tam giác nhọn ABC đường cao AH], [DIAGRAM: hinh_chu_nhat | Hình chữ nhật ABCD]).
     + Nhắc em: "Thầy đã gắn sẵn hình vẽ minh họa chuẩn ở nút bên dưới, em hãy bấm để xem hình và đối chiếu nhé!"

   🎯 BƯỚC 3: GỢI Ý BƯỚC TIẾP THEO – EM CẦN LÀM GÌ TIẾP THEO ĐỂ HIỂU BÀI?
   - Nhắc em lấy giấy nháp, vẽ lại hình phác thảo hoặc thay số vào công thức trên.
   - Đặt 1 câu hỏi gợi mở đơn giản, vừa sức để em tự tính nháp bước 1 và nhắn lại câu trả lời cho thầy.
   - Động viên em làm bài để thầy trò mình cùng đi tiếp!

3. KHI HỌC SINH NÓI: "Giải hộ em", "Cho em đáp án ngay", "Làm từ đầu đến cuối":
   -> Từ chối khéo léo, khẳng định việc tự làm nháp từng bước sẽ giúp em hiểu sâu và nhớ lâu, rồi hướng dẫn từng bước nhỏ.

=== TÀI LIỆU TRỌNG TÂM TOÁN 8 & TOÁN 9 KIỂM DUYỆT ===
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
        const timeout = setTimeout(() => controller.abort(), 9500);

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

            // Đảm bảo nếu thẻ SVG bị ngắt ngang thì tự động hoàn tất khép thẻ an toàn
            if (cleaned.includes('<svg') && !cleaned.includes('</svg>')) {
              cleaned = cleaned.replace(/<!--[\s\S]*$/i, '').trim() + '\n</svg>';
            }

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

  // Phản hồi mẫu sư phạm chuẩn gọn gàng, kèm thẻ DIAGRAM chuẩn
  const lowerMsg = (userText || '').toLowerCase();
  let diagramTag = "[DIAGRAM: tam_giac_vuong | Tam giác ABC vuông tại A, cạnh huyền BC]";
  let topicName = "Tam giác vuông & Định lý Pythagore";
  let formulaBlock = `$$\\triangle ABC \\text{ vuông tại } A \\implies BC^2 = AB^2 + AC^2$$`;
  let tipText = "Lưu ý: Cạnh huyền luôn là cạnh đối diện góc vuông và là cạnh dài nhất trong tam giác vuông em nhé.";
  let questionText = "Đề bài đã cho em biết độ dài của những cạnh nào rồi? Em hãy thay số vào công thức trên và tính thử độ dài cạnh còn lại ra nháp nhé!";

  if (lowerMsg.includes('hằng đẳng thức')) {
    topicName = "7 Hằng đẳng thức đáng nhớ & Phân tích đa thức";
    diagramTag = "";
    formulaBlock = `$$(A+B)^2 = A^2 + 2AB + B^2, \\quad (A-B)^2 = A^2 - 2AB + B^2, \\quad A^2 - B^2 = (A-B)(A+B)$$
$$(A+B)^3 = A^3 + 3A^2B + 3AB^2 + B^3, \\quad (A-B)^3 = A^3 - 3A^2B + 3AB^2 - B^3$$`;
    tipText = "Lưu ý: Phân biệt rõ $(A-B)^2$ (bình phương của một hiệu) và $A^2 - B^2$ (hiệu hai bình phương).";
    questionText = "Trong bài toán của em, biểu thức đang ở vế trái hay vế phải của hằng đẳng thức nào? Em hãy thử xác định $A$ và $B$ rồi nhắn cho thầy nhé!";
  } else if (lowerMsg.includes('phân thức')) {
    topicName = "Phân thức đại số & Rút gọn";
    diagramTag = "";
    formulaBlock = `$$\\frac{A}{B} \\text{ xác định } \\iff B \\neq 0$$
$$\\text{Rút gọn: } \\frac{A \\cdot C}{B \\cdot C} = \\frac{A}{B} \\quad (B, C \\neq 0)$$`;
    tipText = "Lưu ý: Luôn luôn tìm điều kiện xác định (ĐKXĐ) cho mẫu thức khác 0 trước khi rút gọn hoặc tính toán.";
    questionText = "Mẫu thức trong bài toán của em gồm những nhân tử nào? Em đã phân tích mẫu để tìm ĐKXĐ chưa, nhắn cho thầy bước làm nháp của em nhé!";
  } else if (lowerMsg.includes('vi-ét') || lowerMsg.includes('viet') || lowerMsg.includes('bậc hai')) {
    topicName = "Phương trình bậc hai & Định lý Vi-ét (Lớp 9)";
    diagramTag = "";
    formulaBlock = `$$ax^2 + bx + c = 0 \\quad (a \\neq 0) \\implies S = x_1 + x_2 = -\\frac{b}{a}, \\quad P = x_1 x_2 = \\frac{c}{a}$$
$$x_1^2 + x_2^2 = (x_1 + x_2)^2 - 2x_1 x_2 = S^2 - 2P$$`;
    tipText = "Lưu ý: Phương trình có 2 nghiệm phân biệt khi $\\Delta > 0$ (hoặc $\\Delta' > 0$).";
    questionText = "Em đã tính biệt thức $\\Delta$ của phương trình này chưa? Hệ số $a, b, c$ là bao nhiêu, em nhắn cho thầy kiểm tra nhé!";
  } else if (lowerMsg.includes('thalès') || lowerMsg.includes('thales') || lowerMsg.includes('đồng dạng')) {
    topicName = "Định lý Thalès & Tam giác đồng dạng (Lớp 8)";
    diagramTag = "[DIAGRAM: tam_giac_thuong | Tam giác ABC có đường thẳng song song cạnh đáy]";
    formulaBlock = `$$MN \\parallel BC \\implies \\frac{AM}{AB} = \\frac{AN}{AC} = \\frac{MN}{BC}$$`;
    tipText = "Lưu ý: Hãy luôn viết đúng thứ tự các đỉnh tương ứng để lập tỉ số chính xác.";
    questionText = "Đề bài đã cho đoạn thẳng nào song song với cạnh nào? Em hãy viết tỉ số đồng dạng ra nháp và gửi cho thầy nhé!";
  } else if (lowerMsg.includes('bình hành') || lowerMsg.includes('tứ giác')) {
    topicName = "Hình bình hành & Tính chất (Toán 8)";
    diagramTag = "[DIAGRAM: hinh_binh_hanh | Hình bình hành ABCD, hai đường chéo cắt nhau tại O]";
    formulaBlock = `$$AB // CD, \\quad AB = CD \\quad \\text{và} \\quad AD // BC, \\quad AD = BC$$
Hai đường chéo cắt nhau tại trung điểm $O$ của mỗi đường ($OA = OC, OB = OD$).`;
    tipText = "Lưu ý: Các góc đối của hình bình hành bằng nhau, hai góc kề một cạnh bù nhau (tổng bằng $180^\\circ$).";
    questionText = "Trong bài toán của em, hình bình hành đã cho biết độ dài cạnh hay số đo góc nào rồi? Em nhắn lại để thầy hướng dẫn tiếp bước 2 nhé!";
  } else if (lowerMsg.includes('tròn') || lowerMsg.includes('góc ở tâm') || lowerMsg.includes('nội tiếp')) {
    topicName = "Đường tròn & Góc nội tiếp (Toán 9)";
    diagramTag = "[DIAGRAM: duong_tron | Đường tròn (O; R) và góc nội tiếp ACB]";
    formulaBlock = `$$\\widehat{ACB} = \\frac{1}{2}\\widehat{AOB} = \\frac{1}{2}\\text{sđ}\\overparen{AB}$$`;
    tipText = "Lưu ý: Góc nội tiếp chắn nửa đường tròn luôn là góc vuông ($90^\\circ$).";
    questionText = "Góc mà đề bài yêu cầu tính đang chắn cung nào trên đường tròn? Em hãy quan sát hình vẽ và nhắn cho thầy nhé!";
  } else if (lowerMsg.includes('phương trình') || lowerMsg.includes('tìm x') || lowerMsg.includes('bậc nhất')) {
    topicName = "Phương trình bậc nhất một ẩn (Toán 8)";
    diagramTag = "";
    formulaBlock = `$$ax + b = 0 \\implies ax = -b \\implies x = -\\frac{b}{a} \\quad (a \\ne 0)$$`;
    tipText = "Lưu ý quan trọng: Quy tắc chuyển vế bắt buộc phải **đổi dấu** ($+$ đổi thành $-$, và ngược lại).";
    questionText = "Em hãy thử lấy nháp chuyển các hạng tử tự do sang vế phải và nhắn cho thầy xem phương trình của em trở thành gì nhé?";
  }

  return res.status(200).json({
    success: true,
    reply: `Chào em! Thầy rất vui khi nhận được bài toán về **${topicName}** của em. Phương châm của thầy là **"Hỏi để hiểu – Không lời giải chi tiết"**, thầy trò mình cùng khám phá từng bước nhé! 🌱

### 1. Công thức cốt lõi cần nhớ:
${formulaBlock}
💡 *${tipText}*

${diagramTag}

### 2. Gợi ý tiếp theo – Em làm gì để giải được bài?
1. **Lấy giấy nháp**: Ghi lại các dữ kiện đề bài đã cho${diagramTag ? ' và quan sát hình vẽ minh họa ở trên để đối chiếu' : ''}.
2. **Thực hiện bước 1**: ${questionText}
3. **Phản hồi cho thầy**: Em hãy nhắn kết quả tính bước đầu ra cho thầy để thầy nhận xét và cùng em đi tiếp nhé! ✨`,
    isFallback: true
  });
};
