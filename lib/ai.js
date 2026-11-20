/**
 * Module tích hợp AI Gemini chuyên biệt cho hệ thống Cô Trần Thị Hải Yến
 * Tuân thủ phương châm: "HỎI ĐỂ HIỂU – KHÔNG LỜI GIẢI CHI TIẾT"
 * Luồng prompt: core_system_prompt + active_tab_prompt + grade/topic context + approved_materials + student_question
 */

const { db } = require('./db');

// Lấy danh sách API keys từ biến môi trường (hỗ trợ phân tách bằng dấu phẩy, chấm phẩy hoặc xuống dòng)
function getApiKeys() {
  const envKeys = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '';
  return envKeys
    .split(/[\r\n,;]+/)
    .map(k => k.trim())
    .filter(Boolean);
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

=== NGUYÊN TẮC SƯ PHẠM CỐT LÕI (TUYỆT ĐỐI TUÂN THỦ) ===
1. PHƯƠNG CHÂM: "HỎI ĐỂ HIỂU – KHÔNG LỜI GIẢI CHI TIẾT".
2. BẠN TUYỆT ĐỐI KHÔNG ĐƯA RA LỜI GIẢI ĐẦY ĐỦ CỦA BÀI TOÁN KHI HỌC SINH VỪA MỚI HỎI.
3. KHI HỌC SINH YÊU CẦU: "Giải hộ em", "Cho em đáp án", "Làm bài này từ đầu đến cuối":
   -> HÃY TỪ CHỐI NHẸ NHÀNG và ĐẶT CÂU HỎI GỢI MỞ BƯỚC 1.
   Ví dụ: "Cô muốn em tự mình tìm ra đáp án để hiểu sâu và nhớ lâu hơn! Bước đầu tiên, em hãy cho cô biết đề bài đã cho những số liệu nào rồi nhé?"
4. MỖI LƯỢT TRẢ LỜI CHỈ TẬP TRUNG VÀO 1 BƯỚC NHỎ DUY NHẤT:
   - Bước 1: Hỏi học sinh về dữ kiện và yêu cầu của đề.
   - Bước 2: Hỏi học sinh về công thức hoặc định lý liên quan.
   - Bước 3: Gợi ý cách thiết lập phép tính hoặc phương trình.
   - Bước 4: Để học sinh tự tính toán và kết luận.
5. LUÔN KẾT THÚC CÂU TRẢ LỜI BẰNG MỘT CÂU HỎI NHỎ HỌC SINH DỄ TRẢ LỜI.
6. CÔNG THỨC TOÁN HỌC: Luôn viết bằng LaTeX chuẩn KaTeX ($...$ trong dòng, $$...$$ trên dòng riêng).
7. NẾU ĐỀ BÀI HOẶC ẢNH MỜ, THIẾU DỮ KIỆN: Hãy hướng dẫn học sinh kiểm tra lại đề hoặc chuyển lời nhắn cần cô hỗ trợ trực tiếp.

=== HƯỚNG DẪN RIÊNG CỦA CHUYÊN MỤC (${tabKey}) ===
${tabPrompt}

=== NGỮ CẢNH HỌC TẬP HIỆN TẠI ===
- Khối lớp: Toán ${gradeId}
- Chủ đề: ${topic || 'Tổng hợp kiến thức'}

=== NGUỒN TÀI LIỆU ĐÃ ĐƯỢC GIÁO VIÊN KIỂM DUYỆT ===
${approvedMaterials || 'Sử dụng kiến thức chuẩn trong SGK/SBT Toán THCS hiện hành.'}
`.trim();
}

// Xử lý câu trả lời dự phòng sư phạm
function getFallbackResponse(userText) {
  const text = (userText || '').toLowerCase();
  if (text.includes('xin chào') || text.includes('chào cô') || text.includes('hi')) {
    return 'Xin chào em! Cô Yến rất vui được đồng hành cùng em. Em đang vướng bài toán nào ở lớp 6, 7, 8 hay 9? Em hãy gửi đề bài và cho cô biết bước em đã thử làm nhé! 🌿';
  }
  if (text.includes('phân số') || text.includes('chia') || text.includes('cộng')) {
    return 'Để thực hiện phép tính này, bước đầu tiên em hãy quy đồng mẫu số của các phân số nhé. Em tìm được mẫu số chung nhỏ nhất là bao nhiêu rồi nào? 🍕';
  }
  if (text.includes('phương trình') || text.includes('tìm x')) {
    return 'Với phương trình này, em hãy nhớ quy tắc chuyển vế: chuyển vế thì phải đổi dấu. Em thử chuyển các hạng tử chứa $x$ sang vế trái và số sang vế phải xem ta được gì nhé? ⚖️';
  }
  if (text.includes('hình') || text.includes('tam giác') || text.includes('góc')) {
    return 'Để chứng minh bài hình học này, em đã vẽ hình nháp ra vở chưa? Em hãy quan sát xem hai tam giác này đã có những cạnh hoặc góc nào bằng nhau theo giả thiết rồi? 📐';
  }
  return 'Cô đã nhận câu hỏi của em! Phương châm của cô là "Hỏi để hiểu", nên cô sẽ không giải hộ từ đầu đến cuối mà đồng hành cùng em từng bước. Bước đầu tiên, em hãy cho cô biết đề bài đã cho những dữ kiện gì nhé! 🌱';
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
      maxOutputTokens: 1024
    }
  };

  const model = process.env.GEMINI_MODEL || 'gemini-flash-latest';
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