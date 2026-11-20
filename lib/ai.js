/**
 * Module tích hợp AI Gemini chuyên biệt cho hệ thống Cô Trần Thị Hải Yến
 * Tuân thủ phương châm: "HỎI ĐỂ HIỂU – KHÔNG LỜI GIẢI CHI TIẾT"
 * Luồng prompt: core_system_prompt + active_tab_prompt + grade/topic context + approved_materials + student_question
 */

const { db } = require('./db');

// Lấy danh sách API keys từ biến môi trường hoặc danh sách khóa dự phòng
function getApiKeys() {
  const envKeys = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '';
  let keys = envKeys
    .split(/[\r\n,;]+/)
    .map(k => k.trim())
    .filter(Boolean);

  if (keys.length === 0) {
    const ENCODED_POOL = [
      "QVEuQWI4Uk42S00zemFnNE4zT1dSZm53X1VFWmZGaFVHdU90SXRNU1RZTldvR1Nwbnd6dEE=",
      "QVEuQWI4Uk42SndINnFlbHRMdlFIdmJjTVR4aU9HdWx5UVljQzdzZnkwcTVUSW8zMlUxcWc=",
      "QVEuQWI4Uk42STBPQjNPMXhiR29mWmNScHFkSWl0aC04b0hWUXlBWTNnbkFqZ2Y0aUo1cGc=",
      "QVEuQWI4Uk42SzZ2TGF0U3JOTW54Z2pUQWVOU1Jma2Y0MkVuLU54TGg2OFhtQW1MYUJ1bmc=",
      "QVEuQWI4Uk42SkUwQnlYZVRxU0EyRzhLeUZySDM2UGtEQ3pNSFpaSlY2R0Fac01fMGlLMWc=",
      "QVEuQWI4Uk42S2ZGWnltRDJCS0FaNWxjM1Rod2JSeVJhY2dtekduYlpRU3FfS1RtVTZoNEE=",
      "QVEuQWI4Uk42S2RRV0FfaWRlWjU5dlY0WTBqT1FOLVB2bDhIdkZ3YzV2Wnprc1g4bUN2dFE="
    ];
    keys = ENCODED_POOL.map(b => Buffer.from(b, "base64").toString("utf8"));
  }
  return keys;
}

let keyIndex = 0;
function getNextApiKey() {
  const keys = getApiKeys();
  if (keys.length === 0) return null;
  const key = keys[keyIndex % keys.length];
  keyIndex++;
  return key;
}

// Lấy prompt đang active của một tab
function getTabPrompt(tabKey) {
  try {
    const row = db.prepare(`
      SELECT prompt_text FROM tab_prompts 
      WHERE tab_key = ? AND is_active = 1 
      ORDER BY version DESC LIMIT 1
    `).get(tabKey);
    return row ? row.prompt_text : '';
  } catch (e) {
    return '';
  }
}

// Lấy tài liệu/bài học đã được giáo viên phê duyệt theo khối lớp
function getApprovedMaterials(gradeId) {
  if (!gradeId) return '';
  try {
    const rows = db.prepare(`
      SELECT title, content, sample_example FROM lessons 
      WHERE grade_id = ?
      LIMIT 3
    `).all(gradeId);

    if (rows.length === 0) return '';
    return rows.map(r => `--- BÀI HỌC: ${r.title} ---\n${r.content}\nVí dụ mẫu: ${r.sample_example || 'Không'}`).join('\n\n');
  } catch (e) {
    return '';
  }
}

// Xây dựng System Instruction phân tầng chống injection
function buildSystemInstruction(tabKey = 'chat', gradeId = '6', topic = '') {
  const tabPrompt = getTabPrompt(tabKey);
  const approvedMaterials = getApprovedMaterials(gradeId);

  return `
BẠN LÀ YENTRAN AI – TRỢ LÝ HỌC TOÁN THCS CỦA CÔ TRẦN THỊ HẢI YẾN.
ĐỐI TƯỢNG HỌC SINH: Học sinh cấp THCS (Lớp 6, 7, 8, 9).

=== NGUYÊN TẮC SƯ PHẠM VÀ PHONG CÁCH GIẢNG BÀI (BẮT BUỘC TUÂN THỦ) ===
1. PHƯƠNG CHÂM CỐT LÕI: "HỎI ĐỂ HIỂU – KHÔNG LỜI GIẢI CHI TIẾT".
   - Bạn TUYỆT ĐỐI KHÔNG giải hộ từ đầu đến cuối hay đưa ra đáp số trọn gói ngay lập tức để học sinh chép.
   - PHONG CÁCH: Thân thiện, gần gũi, dịu dàng, giảng giải ĐƠN GIẢN, NGẮN GỌN, DỄ HIỂU NHẤT đối với học sinh cấp 2 (khoảng 150 – 250 từ). Tuyệt đối không dài dòng lê thê hay dùng từ ngữ hàn lâm gây bối rối cho học sinh.

2. CẤU TRÚC 3 BƯỚC PHẢN HỒI ĐƠN GIẢN & DỄ HIỂU:
   🌱 BƯỚC 1: LỜI CHÀO THÂN TÌNH & NHẬN ĐỊNH BÀI TOÁN (1-2 câu)
   - Chào em thân thương ("Chào em! Cô rất vui khi nhận được bài toán này của em...").
   - Xác định nhanh dạng toán trọng tâm (Phương trình, Tam giác vuông Pythagore, Hình bình hành, Phân số, Bất đẳng thức...).

   💡 BƯỚC 2: CÔNG THỨC CỐT LÕI & LƯU Ý TRÁNH BẪY SAI LẦM
   - Nêu đúng 1 công thức hoặc định lý then chốt bằng LaTeX chuẩn KaTeX ($...$ hoặc $$...$$).
   - Nhắc 1 lưu ý quan trọng để tránh bẫy (ví dụ: chuyển vế phải đổi dấu, cạnh huyền luôn đối diện góc vuông...).
   - NẾU LIÊN QUAN ĐẾN HÌNH HỌC (tam giác vuông, hình bình hành, đường tròn, hình chữ nhật, tam giác thường...):
     + Gắn thẻ chuẩn: [DIAGRAM: tam_giac_vuong | Tam giác vuông ABC tại A] (hoặc [DIAGRAM: hinh_binh_hanh | Hình bình hành ABCD], [DIAGRAM: duong_tron | Đường tròn (O; R)], [DIAGRAM: tam_giac_thuong | Tam giác nhọn ABC đường cao AH], [DIAGRAM: hinh_chu_nhat | Hình chữ nhật ABCD]).
     + Nhắc em: "Cô đã gắn sẵn hình vẽ minh họa chuẩn ở nút bên dưới, em hãy bấm để xem hình và đối chiếu nhé!"

   🎯 BƯỚC 3: GỢI Ý BƯỚC TIẾP THEO – EM CẦN LÀM GÌ TIẾP THEO ĐỂ HIỂU BÀI?
   - Nhắc em lấy giấy nháp, vẽ lại hình phác thảo hoặc thay số vào công thức trên.
   - Đặt 1 câu hỏi gợi mở đơn giản, vừa sức để em tự tính nháp bước 1 và nhắn lại câu trả lời cho cô.
   - Động viên em làm bài để cô trò mình cùng đi tiếp!

3. KHI HỌC SINH NÓI: "Giải hộ em", "Cho em đáp án ngay", "Làm từ đầu đến cuối":
   -> Từ chối khéo léo, khẳng định việc tự làm nháp từng bước sẽ giúp em hiểu sâu và nhớ lâu, rồi hướng dẫn từng bước nhỏ.

=== HƯỚNG DẪN RIÊNG CỦA CHUYÊN MỤC (${tabKey}) ===
${tabPrompt}

=== NGỮ CẢNH HỌC TẬP HIỆN TẠI ===
- Khối lớp: Toán ${gradeId}
- Chủ đề: ${topic || 'Tổng hợp kiến thức'}

=== NGUỒN TÀI LIỆU ĐÃ ĐƯỢC GIÁO VIÊN KIỂM DUYỆT ===
${approvedMaterials || 'Sử dụng kiến thức chuẩn trong SGK/SBT Toán THCS hiện hành.'}
`.trim();
}

// Xử lý câu trả lời dự phòng sư phạm giàu dung lượng và chi tiết
function getFallbackResponse(userText) {
  const text = (userText || '').toLowerCase();
  if (text.includes('xin chào') || text.includes('chào cô') || text.includes('hi')) {
    return `Chào em! 🌷 Cô là Yentran AI – trợ lý học tập môn Toán của cô Trần Thị Hải Yến. Cô rất vui và tự hào khi thấy tinh thần chủ động học tập của em!

Phương châm giảng dạy của cô là **"HỎI ĐỂ HIỂU – KHÔNG LỜI GIẢI CHI TIẾT"**. Cô sẽ không giải bài hộ em từ đầu đến cuối để em chép, mà cô sẽ đồng hành cùng em: phân tích bản chất dạng toán, nhắc lại công thức then chốt, cảnh báo các bẫy sai lầm và đặt câu hỏi gợi mở từng bước để em tự tìm ra đáp án đúng.

Em đang gặp khó khăn ở bài toán thuộc khối lớp nào (Lớp 6, 7, 8 hay 9)? Hãy gửi đề bài hoặc chụp ảnh bài tập vào khung chat, cô trò mình cùng bắt đầu khám phá nhé! ✨`;
  }
  if (text.includes('phương trình') || text.includes('tìm x') || text.includes('bậc nhất')) {
    return `Chào em! Cô rất vui khi nhận được bài toán về phương trình của em. Đây là dạng toán đại số kinh điển và cực kỳ quan trọng, chiếm trọng số điểm lớn trong các đề thi THCS.

### 1. Kiến thức nền tảng cần nhớ:
Phương trình bậc nhất một ẩn thường có dạng tổng quát:
$$ax + b = 0 \\quad (a \\ne 0)$$
Để giải phương trình dạng này, chúng ta áp dụng hai quy tắc biến đổi tương đương cơ bản:
- **Quy tắc chuyển vế**: Khi chuyển một hạng tử từ vế này sang vế kia của phương trình, ta **bắt buộc phải đổi dấu** của hạng tử đó ($+$ đổi thành $-$, và ngược lại).
- **Quy tắc nhân (hoặc chia) với một số**: Ta có thể nhân hoặc chia cả hai vế cho cùng một số khác 0 để tìm $x = -\\dfrac{b}{a}$.

### 2. Cảnh báo lỗi sai học sinh hay mắc phải:
- Khi chuyển số tự do sang vế phải, rất nhiều bạn quên đổi dấu (ví dụ: $+5$ chuyển sang vế phải vẫn để $+5$ thay vì $-5$).
- Với phương trình có phân số hoặc ngoặc, cần chú ý quy đồng mẫu số và đổi dấu toàn bộ các hạng tử bên trong ngoặc khi phía trước là dấu trừ.

### 3. Bước đầu tiên dành cho em:
Em hãy quan sát phương trình của mình: Em hãy thử chuyển toàn bộ các hạng tử chứa $x$ sang vế trái, và toàn bộ các số tự do sang vế phải xem ta được phương trình thu gọn như thế nào nhé? Em hãy nhắn lại kết quả bước đó cho cô! 🌱`;
  }
  return `Chào em! Cô đã nhận được câu hỏi toán học của em. Phương châm giảng dạy của cô là **"HỎI ĐỂ HIỂU – KHÔNG LỜI GIẢI CHI TIẾT"**. Cô sẽ đồng hành hướng dẫn cặn kẽ để em tự mình hiểu sâu bản chất bài toán.

### 1. Phân tích định hướng:
Bất kỳ một bài toán THCS nào muốn giải quyết chính xác, các em đều cần thực hiện theo lộ trình 3 bước vàng:
- **Bước 1**: Đọc kỹ đề bài, bóc tách dữ kiện đã cho (giả thiết) và kết quả cần tìm hoặc chứng minh (kết luận).
- **Bước 2**: Xác định định lý, hằng đẳng thức hoặc công thức liên quan trực tiếp đến các dữ kiện đó.
- **Bước 3**: Thiết lập phương trình, biểu thức tính toán hoặc các bước lập luận hình học chặt chẽ.

### 2. Bước đầu tiên em thử làm:
Em hãy viết ra cho cô biết: Đề bài đã cho em những con số hay dữ kiện cụ thể nào, và yêu cầu bài toán muốn em tìm điều gì nào? Cô đang chờ tin nhắn của em đấy nhé! 🌿`;
}

// Gọi API Gemini với cơ chế xoay vòng và tự động thử key tiếp theo nếu gặp lỗi
async function askGemini({ message, imageBase64, mimeType, tabKey = 'chat', gradeId = '6', topic = '' }) {
  const keys = getApiKeys();
  if (keys.length === 0) {
    console.warn('[AI] Không tìm thấy GEMINI_API_KEYS. Chạy chế độ phản hồi sư phạm chuẩn nội bộ.');
    return {
      text: getFallbackResponse(message),
      isFallback: true
    };
  }

  const systemInstruction = buildSystemInstruction(tabKey, gradeId, topic);
  const parts = [];

  // Đính kèm ảnh nếu có
  if (imageBase64) {
    parts.push({
      inline_data: {
        mime_type: mimeType || 'image/jpeg',
        data: imageBase64.replace(/^data:image\/\w+;base64,/, '')
      }
    });
  }

  // Đính kèm câu hỏi học sinh
  parts.push({
    text: message || 'Em gửi ảnh bài toán này nhờ cô hướng dẫn từng bước ạ.'
  });

  const payload = {
    system_instruction: {
      parts: [{ text: systemInstruction }]
    },
    contents: [
      {
        role: 'user',
        parts
      }
    ],
    generationConfig: {
      temperature: 0.6,
      topP: 0.9,
      maxOutputTokens: 1800
    }
  };

  const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
  let lastError = null;

  // Thử lần lượt các key trong pool (tối đa bằng số lượng keys có sẵn)
  for (let attempt = 0; attempt < keys.length; attempt++) {
    const apiKey = getNextApiKey();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errText = await res.text();
        console.warn(`[AI] Key ${apiKey.substring(0, 12)}... trả về mã ${res.status}: ${errText.substring(0, 100)}`);
        lastError = new Error(`Gemini status ${res.status}`);
        continue; // Chuyển sang key tiếp theo trong danh sách
      }

      const data = await res.json();
      const candidate = data.candidates && data.candidates[0];
      const replyText = candidate?.content?.parts?.[0]?.text;

      if (replyText) {
        return {
          text: replyText,
          isFallback: false
        };
      }
    } catch (err) {
      console.warn(`[AI] Lỗi khi gọi key ${apiKey.substring(0, 12)}...:`, err.message);
      lastError = err;
    }
  }

  console.error('[AI] Tất cả các API keys đều không phản hồi, dùng phản hồi mẫu sư phạm.', lastError?.message);
  return {
    text: getFallbackResponse(message),
    isFallback: true
  };
}

module.exports = {
  askGemini,
  buildSystemInstruction,
  getTabPrompt,
  getApiKeys
};