/**
 * Cơ sở dữ liệu SQLite cho hệ thống YENTRAN AI (Cô Trần Thị Hải Yến)
 * Sử dụng node:sqlite tích hợp sẵn trong Node.js (nhanh, ổn định, không phụ thuộc C++ native build)
 */

const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'yentran.db');
const db = new DatabaseSync(DB_PATH);

// Bật WAL mode để tăng tốc độ ghi/đọc song song
try {
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');
} catch (e) {
  console.warn('[DB] Pragma setting note:', e.message);
}

// Khởi tạo các bảng
function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'student',
      full_name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS grades (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT NOT NULL,
      order_index INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS topics (
      id TEXT PRIMARY KEY,
      grade_id TEXT NOT NULL,
      title TEXT NOT NULL,
      icon TEXT DEFAULT '📐',
      order_index INTEGER DEFAULT 0,
      FOREIGN KEY (grade_id) REFERENCES grades(id)
    );

    CREATE TABLE IF NOT EXISTS tab_prompts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tab_key TEXT NOT NULL,
      prompt_text TEXT NOT NULL,
      version INTEGER DEFAULT 1,
      is_active INTEGER DEFAULT 1,
      notes TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS lessons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      grade_id TEXT NOT NULL,
      topic_id TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      sample_example TEXT,
      self_check_question TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      grade_id TEXT NOT NULL,
      topic TEXT NOT NULL,
      text TEXT NOT NULL,
      options_json TEXT NOT NULL,
      correct_answer INTEGER NOT NULL,
      hint TEXT,
      explanation TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS quiz_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_id INTEGER NOT NULL,
      grade_id TEXT,
      topic TEXT,
      is_correct INTEGER NOT NULL,
      anonymous_session_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS visit_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      anonymous_session_id TEXT NOT NULL,
      user_agent TEXT,
      path TEXT DEFAULT '/',
      is_bot INTEGER DEFAULT 0,
      ip_hash TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS resources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      grade_id TEXT NOT NULL,
      topic TEXT,
      title TEXT NOT NULL,
      description TEXT,
      file_url TEXT NOT NULL,
      file_type TEXT DEFAULT 'PDF',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS videos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      grade_id TEXT NOT NULL,
      topic TEXT,
      title TEXT NOT NULL,
      description TEXT,
      video_url TEXT NOT NULL,
      duration TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tips (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      order_index INTEGER DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_visits_session ON visit_events(anonymous_session_id);
    CREATE INDEX IF NOT EXISTS idx_visits_created ON visit_events(created_at);
    CREATE INDEX IF NOT EXISTS idx_attempts_created ON quiz_attempts(created_at);
    CREATE INDEX IF NOT EXISTS idx_questions_grade ON questions(grade_id);
    CREATE INDEX IF NOT EXISTS idx_lessons_grade ON lessons(grade_id);
  `);
}

// Băm mật khẩu bằng PBKDF2 bảo mật cao
function hashPassword(password, salt) {
  if (!salt) {
    salt = crypto.randomBytes(16).toString('hex');
  }
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

function verifyPassword(password, hash, salt) {
  const result = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return result === hash;
}

// Seed dữ liệu mặc định ban đầu nếu bảng còn trống
function seedData() {
  // 1. Tài khoản giáo viên mặc định
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount === 0) {
    const { hash, salt } = hashPassword('coYen@2026');
    db.prepare(`
      INSERT INTO users (username, password_hash, salt, role, full_name)
      VALUES (?, ?, ?, 'teacher', ?)
    `).run('coyen', hash, salt, 'Cô Trần Thị Hải Yến');
    console.log('[DB] Tạo tài khoản giáo viên: coyen / coYen@2026');
  }

  // 2. Khối lớp
  const gradeCount = db.prepare('SELECT COUNT(*) as count FROM grades').get().count;
  if (gradeCount === 0) {
    const insertGrade = db.prepare('INSERT INTO grades (id, name, code, order_index) VALUES (?, ?, ?, ?)');
    insertGrade.run('6', 'Toán Lớp 6', 'TOAN6', 1);
    insertGrade.run('7', 'Toán Lớp 7', 'TOAN7', 2);
    insertGrade.run('8', 'Toán Lớp 8', 'TOAN8', 3);
    insertGrade.run('9', 'Toán Lớp 9', 'TOAN9', 4);
  }

  // 3. Tab Prompts
  const promptCount = db.prepare('SELECT COUNT(*) as count FROM tab_prompts').get().count;
  if (promptCount === 0) {
    const insertPrompt = db.prepare(`
      INSERT INTO tab_prompts (tab_key, prompt_text, version, is_active, notes)
      VALUES (?, ?, 1, 1, 'Bản khởi tạo mặc định của hệ thống')
    `);

    insertPrompt.run('home', 'Giới thiệu ngắn gọn không gian học tập của cô Trần Thị Hải Yến. Khuyến khích học sinh tự suy nghĩ và chọn đúng khối lớp (Toán 6, 7, 8 hoặc 9).');
    insertPrompt.run('chat', `Bạn là trợ lý dạy Toán THCS của cô Trần Thị Hải Yến.
PHƯƠNG CHÂM SƯ PHẠM CỐT LÕI: "HỎI ĐỂ HIỂU – KHÔNG LỜI GIẢI CHI TIẾT".
- Tuyệt đối không giải hộ trọn vẹn cả bài cho học sinh chép.
- Mỗi lượt phản hồi chỉ tập trung vào một bước nhỏ, đặt câu hỏi gợi mở Socratic để học sinh tự suy nghĩ.
- Giọng văn: Chuẩn mực, ân cần, gần gũi, khích lệ tinh thần học tập.
- Viết công thức bằng LaTeX chuẩn KaTeX ($...$ trong dòng và $$...$$ trên dòng riêng).
- Nếu học sinh xin đáp án trực tiếp, hãy nhẹ nhàng từ chối và đưa ra một gợi ý bước đầu.`);
    insertPrompt.run('knowledge', 'Tóm tắt kiến thức theo khối lớp 6–9, định nghĩa, công thức chính, một ví dụ rất ngắn và câu hỏi tự kiểm tra. Bám sát chuẩn GDPT và SGK/SBT mới.');
    insertPrompt.run('quiz', 'Tạo câu hỏi trắc nghiệm và câu hỏi tự luận ngắn từ chủ đề đã chọn, đáp án và gợi ý sư phạm. Mỗi lần học sinh nộp một câu, ghi nhận kết quả và đưa ra gợi ý tương ứng.');
    insertPrompt.run('video', 'Giới thiệu video từ danh sách liên kết do cô kiểm duyệt. Không tự bịa liên kết.');
    insertPrompt.run('resources', 'Chỉ hiển thị tài liệu học tập do giáo viên tải lên hoặc duyệt; ghi tên, khối lớp, chủ đề và mô tả.');
    insertPrompt.run('tips', 'Đề xuất thói quen học Toán tích cực, phương pháp kiểm tra kết quả, không tạo áp lực thành tích.');
    insertPrompt.run('about', 'Giới thiệu cô Trần Thị Hải Yến, phương châm sư phạm "Hỏi để hiểu" và cách học sinh tương tác với trợ lý AI hiệu quả.');
    insertPrompt.run('admin', 'Dành riêng cho giáo viên đã xác thực. Quản lý toàn bộ nội dung, câu hỏi, tài liệu, video và theo dõi số liệu học tập thực tế.');
  }

  // 4. Câu hỏi tương tác mẫu
  const questionCount = db.prepare('SELECT COUNT(*) as count FROM questions').get().count;
  if (questionCount === 0) {
    const insertQ = db.prepare(`
      INSERT INTO questions (grade_id, topic, text, options_json, correct_answer, hint, explanation)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const seedQuestions = [
      // Toán 6
      { grade: '6', topic: 'Phân số', text: 'Phân số nào sau đây bằng phân số $\\dfrac{1}{2}$?', options: ['$\\dfrac{2}{3}$', '$\\dfrac{3}{6}$', '$\\dfrac{4}{6}$', '$\\dfrac{5}{6}$'], right: 1, hint: 'Hãy rút gọn tử số và mẫu số bằng cách chia cả hai cho 3.', exp: 'Ta có $\\dfrac{3}{6} = \\dfrac{3:3}{6:3} = \\dfrac{1}{2}$.' },
      { grade: '6', topic: 'Số nguyên', text: 'Giá trị của phép tính $(-3) + 5$ là bao nhiêu?', options: ['-8', '-2', '2', '8'], right: 2, hint: 'Cộng hai số nguyên khác dấu: lấy số có giá trị tuyệt đối lớn hơn trừ số bé hơn.', exp: '$(-3) + 5 = 5 - 3 = 2$.' },
      { grade: '6', topic: 'Tính chia hết', text: 'Số nào sau đây chia hết cho cả 2 và 5?', options: ['124', '135', '140', '156'], right: 2, hint: 'Số chia hết cho cả 2 và 5 phải có chữ số tận cùng là 0.', exp: 'Số 140 có chữ số tận cùng là 0 nên chia hết cho cả 2 và 5.' },
      
      // Toán 7
      { grade: '7', topic: 'Tỉ lệ thức', text: 'Nếu $\\dfrac{2}{x} = \\dfrac{1}{3}$ thì giá trị của $x$ bằng mấy?', options: ['3', '5', '6', '9'], right: 2, hint: 'Áp dụng tính chất tỉ lệ thức: tích trung tỉ bằng tích ngoại tỉ ($2 \\cdot 3 = 1 \\cdot x$).', exp: '$x = 2 \\cdot 3 = 6$.' },
      { grade: '7', topic: 'Tam giác', text: 'Tổng số đo ba góc trong một tam giác bằng bao nhiêu độ?', options: ['$90^\\circ$', '$180^\\circ$', '$270^\\circ$', '$360^\\circ$'], right: 1, hint: 'Nhớ lại định lý về tổng các góc của một tam giác trong hình học 7.', exp: 'Tổng ba góc của mọi tam giác luôn bằng $180^\\circ$.' },
      
      // Toán 8
      { grade: '8', topic: 'Hằng đẳng thức', text: 'Biểu thức $(a+b)^2$ khai triển bằng biểu thức nào?', options: ['$a^2+b^2$', '$a^2+2ab+b^2$', '$a^2-2ab+b^2$', '$2a^2+2b^2$'], right: 1, hint: 'Bình phương một tổng bằng bình phương số thứ nhất cộng 2 lần tích cộng bình phương số thứ hai.', exp: '$(a+b)^2 = a^2 + 2ab + b^2$.' },
      { grade: '8', topic: 'Phương trình', text: 'Nghiệm của phương trình $2x + 3 = 11$ là:', options: ['$x = 3$', '$x = 4$', '$x = 5$', '$x = 7$'], right: 1, hint: 'Chuyển 3 sang vế phải: $2x = 11 - 3$, sau đó chia cho 2.', exp: '$2x = 8 \\Rightarrow x = 4$.' },
      
      // Toán 9
      { grade: '9', topic: 'Căn thức', text: 'Giá trị của $\\sqrt{49}$ bằng bao nhiêu?', options: ['-7', '7', '$\\pm 7$', '14'], right: 1, hint: 'Căn bậc hai số học của một số không âm luôn là một số không âm.', exp: '$\\sqrt{49} = 7$ (vì $7 \\ge 0$ và $7^2 = 49$).' },
      { grade: '9', topic: 'Hàm số bậc hai', text: 'Đồ thị hàm số $y = ax^2$ ($a \\neq 0$) có dạng hình học là đường gì?', options: ['Đường thẳng', 'Đường tròn', 'Parabol', 'Elip'], right: 2, hint: 'Đồ thị của hàm số bậc hai nhận trục tung làm trục đối xứng.', exp: 'Đồ thị hàm số $y = ax^2$ ($a \\neq 0$) là một đường Parabol.' },
      { grade: '9', topic: 'Định lý Vi-ét', text: 'Nếu phương trình $x^2 - 5x + 6 = 0$ có 2 nghiệm $x_1, x_2$, thì tổng $x_1 + x_2$ bằng:', options: ['-5', '5', '6', '-6'], right: 1, hint: 'Theo định lý Vi-ét: $x_1 + x_2 = -\\dfrac{b}{a}$.', exp: '$x_1 + x_2 = -\\dfrac{-5}{1} = 5$.' }
    ];

    seedQuestions.forEach(q => {
      insertQ.run(q.grade, q.topic, q.text, JSON.stringify(q.options), q.right, q.hint, q.exp);
    });
  }

  // 5. Kiến thức bài học mẫu
  const lessonCount = db.prepare('SELECT COUNT(*) as count FROM lessons').get().count;
  if (lessonCount === 0) {
    const insertLesson = db.prepare(`
      INSERT INTO lessons (grade_id, topic_id, title, content, sample_example, self_check_question)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    insertLesson.run(
      '6', '6_1', 'Chương I: Số tự nhiên & Tính chia hết',
      `### 1. Tập hợp số tự nhiên
- Tập hợp số tự nhiên: $\\mathbb{N} = \\{0; 1; 2; 3; \\dots\\}$.
- Tập hợp số tự nhiên khác 0: $\\mathbb{N}^* = \\{1; 2; 3; \\dots\\}$.

### 2. Quan hệ chia hết, ước và bội
- Cho $a, b \\in \\mathbb{N}$ ($b \\neq 0$). Nếu có số $q$ sao cho $a = b \\cdot q$ thì ta nói **$a$ chia hết cho $b$** (kí hiệu $a \\,\\vdots\\, b$), khi đó $a$ là **bội** của $b$, còn $b$ là **ước** của $a$.
- Dấu hiệu chia hết:
  + Chia hết cho 2: Chữ số tận cùng là 0, 2, 4, 6, 8.
  + Chia hết cho 5: Chữ số tận cùng là 0 hoặc 5.
  + Chia hết cho 3 (hoặc 9): Tổng các chữ số chia hết cho 3 (hoặc 9).`,
      'Tìm tất cả các ước của 12: Ta có $\\text{Ư}(12) = \\{1; 2; 3; 4; 6; 12\\}$.',
      'Số 135 có chia hết cho cả 3 và 5 không? Vì sao?'
    );

    insertLesson.run(
      '7', '7_1', 'Chương I: Số hữu tỉ & Các phép tính',
      `### 1. Định nghĩa số hữu tỉ
- Số hữu tỉ là số viết được dưới dạng phân số $\\dfrac{a}{b}$ với $a, b \\in \\mathbb{Z}, b \\neq 0$. Kí hiệu tập hợp số hữu tỉ là $\\mathbb{Q}$.

### 2. Thứ tự thực hiện phép tính
- Trong biểu thức không có ngoặc: Lũy thừa $\\to$ Nhân và chia $\\to$ Cộng và trừ.
- Trong biểu thức có ngoặc: Ngoặc tròn $( ) \\to$ Ngoặc vuông $[ ] \\to$ Ngoặc nhọn $\\{ \\}$.`,
      'Tính $\\dfrac{1}{2} + \\dfrac{2}{3} = \\dfrac{3}{6} + \\dfrac{4}{6} = \\dfrac{7}{6}$.',
      'Số thập phân $0{,}75$ có phải là số hữu tỉ không? Hãy giải thích.'
    );

    insertLesson.run(
      '8', '8_1', 'Chương I: Đa thức & 7 hằng đẳng thức đáng nhớ',
      `### 7 hằng đẳng thức cốt lõi:
1. $(A+B)^2 = A^2 + 2AB + B^2$
2. $(A-B)^2 = A^2 - 2AB + B^2$
3. $A^2 - B^2 = (A-B)(A+B)$
4. $(A+B)^3 = A^3 + 3A^2B + 3AB^2 + B^3$
5. $(A-B)^3 = A^3 - 3A^2B + 3AB^2 - B^3$
6. $A^3 + B^3 = (A+B)(A^2 - AB + B^2)$
7. $A^3 - B^3 = (A-B)(A^2 + AB + B^2)$`,
      'Rút gọn: $(x+2)^2 - x^2 = x^2 + 4x + 4 - x^2 = 4x + 4$.',
      'Phân tích thành nhân tử: $x^2 - 9$.'
    );

    insertLesson.run(
      '9', '9_1', 'Chương I: Hệ hai phương trình & Căn thức bậc hai',
      `### 1. Hệ hai phương trình bậc nhất hai ẩn
- Dạng tổng quát:
  $$\\begin{cases} ax + by = c \\\\ a'x + b'y = c' \\end{cases}$$
- Hai phương pháp giải chính: Phương pháp thế và phương pháp cộng đại số.

### 2. Căn bậc hai số học
- Với số thực $a \\ge 0$, $\\sqrt{a}$ là số $x \\ge 0$ thỏa mãn $x^2 = a$.
- Hằng đẳng thức: $\\sqrt{A^2} = |A|$.`,
      'Giải hệ $\\begin{cases} x + y = 3 \\\\ x - y = 1 \\end{cases} \\Rightarrow 2x = 4 \\Rightarrow x = 2, y = 1$.',
      'Tìm điều kiện xác định của biểu thức $\\sqrt{2x - 6}$.'
    );
  }

  // 6. Video bài giảng mẫu
  const videoCount = db.prepare('SELECT COUNT(*) as count FROM videos').get().count;
  if (videoCount === 0) {
    const insertVid = db.prepare('INSERT INTO videos (grade_id, topic, title, description, video_url, duration) VALUES (?, ?, ?, ?, ?, ?)');
    insertVid.run('6', 'Số học', 'Bài giảng: Thứ tự thực hiện phép tính và Quy tắc dấu ngoặc', 'Hướng dẫn phương pháp tính toán chuẩn xác, tránh nhầm lẫn dấu.', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '18:45');
    insertVid.run('7', 'Hình học', 'Bài giảng: Ba trường hợp bằng nhau của tam giác', 'Phương pháp chứng minh hai tam giác bằng nhau và ứng dụng.', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '22:10');
    insertVid.run('8', 'Đại số', 'Bài giảng: Khắc sâu 7 Hằng đẳng thức đáng nhớ', 'Cách ghi nhớ và kỹ thuật áp dụng hằng đẳng thức vào phân tích nhân tử.', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '25:30');
    insertVid.run('9', 'Đại số', 'Bài giảng: Kỹ thuật giải phương trình bậc hai & Định lý Vi-ét', 'Phương pháp phân tích bài toán thực tế và ứng dụng hệ thức Vi-ét.', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '28:15');
  }

  // 7. Tài liệu học tập mẫu
  const resCount = db.prepare('SELECT COUNT(*) as count FROM resources').get().count;
  if (resCount === 0) {
    const insertRes = db.prepare('INSERT INTO resources (grade_id, topic, title, description, file_url, file_type) VALUES (?, ?, ?, ?, ?, ?)');
    insertRes.run('6', 'Số học', 'Phiếu tự luyện: Ôn tập Ước chung & Bội chung', 'Tổng hợp dạng bài tìm ƯCLN, BCNN và bài toán lời văn thực tế.', '#', 'PDF');
    insertRes.run('7', 'Hình học', 'Bảng hệ thống: Các định lý hình học Lớp 7', 'Tóm lược định lý góc, hai đường thẳng song song và tam giác cân.', '#', 'DOCX');
    insertRes.run('8', 'Đại số', 'Bộ đề ôn tập: Phân thức đại số & Phương trình bậc nhất', 'Đề kiểm tra 45 phút có đáp án và hướng dẫn giải vắn tắt.', '#', 'PDF');
    insertRes.run('9', 'Tổng hợp', 'Chuyên đề: Rút gọn biểu thức chứa căn & Câu hỏi phụ', 'Tài liệu ôn thi chất lượng cao do cô Trần Thị Hải Yến biên soạn.', '#', 'PDF');
  }

  // 8. Mẹo học toán
  const tipsCount = db.prepare('SELECT COUNT(*) as count FROM tips').get().count;
  if (tipsCount === 0) {
    const insertTip = db.prepare('INSERT INTO tips (title, content, order_index) VALUES (?, ?, ?)');
    insertTip.run('1. Đọc kỹ đề và gạch chân từ khóa', 'Khi nhận đề bài, đừng vội tính ngay. Hãy đọc chậm rãi 2 lần, dùng bút chì gạch chân dữ kiện đã cho và câu hỏi cần tìm.', 1);
    insertTip.run('2. Vẽ hình nháp to, rõ ràng và chuẩn xác', 'Với môn Hình học, một hình vẽ nháp chuẩn xác đến từng góc và tỉ lệ sẽ giúp em nhìn ra ngay 70% hướng chứng minh.', 2);
    insertTip.run('3. Đặt câu hỏi tự vấn trước mỗi bước biến đổi', 'Hãy tự hỏi: "Tại sao mình dùng công thức này?", "Có điều kiện xác định nào bị bỏ quên không?", "Dấu cộng trừ đã chuẩn chưa?".', 3);
    insertTip.run('4. Thử lại kết quả bằng số liệu thực tế', 'Sau khi tìm ra nghiệm, luôn thay ngược lại vào phương trình ban đầu hoặc đối chiếu với điều kiện thực tế (ví dụ: số người, độ dài phải là số dương).', 4);
  }
}

// Chạy khởi tạo schema và seed
initSchema();
seedData();

module.exports = {
  db,
  hashPassword,
  verifyPassword
};
