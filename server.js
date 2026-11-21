/**
 * Máy chủ Express Production cho hệ thống Cô Trần Thị Hải Yến
 * Trợ lý học và ôn tập Toán THCS (Lớp 6, 7, 8, 9)
 * Phương châm: "HỎI ĐỂ HIỂU – KHÔNG LỜI GIẢI CHI TIẾT"
 */

require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');

const { db } = require('./lib/db');
const { login, verifyToken, requireTeacher } = require('./lib/auth');
const { recordVisit, recordQuizAttempt, getStatistics } = require('./lib/analytics');
const { askGemini } = require('./lib/ai');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware cơ bản
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Tạo ảnh avatar mặc định bằng SVG nếu chưa có avatar_co_yen.jpg vật lý
const avatarPath = path.join(__dirname, 'public', 'avatar_co_yen.jpg');
if (!fs.existsSync(avatarPath)) {
  const defaultSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#196653;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#0891b2;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="200" height="200" rx="100" fill="url(#grad)" />
    <circle cx="100" cy="78" r="38" fill="#e8f5ec" />
    <path d="M40 175 C50 125, 150 125, 160 175 Z" fill="#e8f5ec" />
    <text x="100" y="86" font-family="'Segoe UI', sans-serif" font-size="28" font-weight="bold" fill="#196653" text-anchor="middle">Y</text>
    <text x="100" y="165" font-family="'Segoe UI', sans-serif" font-size="12" font-weight="bold" fill="#196653" text-anchor="middle">CÔ YẾN</text>
  </svg>`;
  try {
    fs.writeFileSync(avatarPath, defaultSvg);
  } catch (e) {
    console.warn('Không thể tạo file avatar placeholder:', e.message);
  }
}

// Phục vụ thư mục public tĩnh
app.use(express.static(path.join(__dirname, 'public')));

// Rate limit đơn giản cho chat (bộ nhớ tạm)
const chatRateLimit = new Map();
function rateLimiter(req, res, next) {
  const ip = req.ip || req.headers['x-forwarded-for'] || 'client';
  const now = Date.now();
  const clientData = chatRateLimit.get(ip) || { count: 0, resetAt: now + 60000 };

  if (now > clientData.resetAt) {
    clientData.count = 0;
    clientData.resetAt = now + 60000;
  }

  clientData.count++;
  chatRateLimit.set(ip, clientData);

  if (clientData.count > 25) { // Tối đa 25 lượt hỏi/phút
    return res.status(429).json({
      success: false,
      message: 'Em đang hỏi hơi nhanh! Hãy dành 1 phút để tự suy nghĩ câu hỏi vừa rồi nhé 🌱'
    });
  }
  next();
}

// ============================================================
// 1. PUBLIC APIS (Dành cho học sinh và khách truy cập)
// ============================================================

// Khởi tạo dữ liệu ban đầu cho giao diện (bootstrap)
app.get('/api/public/bootstrap', (req, res) => {
  try {
    const grades = db.prepare('SELECT id, name, code FROM grades ORDER BY order_index ASC').all();
    const prompts = db.prepare('SELECT tab_key, prompt_text FROM tab_prompts WHERE is_active = 1').all();
    const tips = db.prepare('SELECT id, title, content FROM tips ORDER BY order_index ASC').all();
    
    // Thống kê sơ bộ thời gian thực
    const stats = getStatistics('all');

    res.json({
      success: true,
      teacher: {
        name: 'Cô Trần Thị Hải Yến',
        motto: 'HỎI ĐỂ HIỂU – KHÔNG LỜI GIẢI CHI TIẾT',
        avatar: 'avatar_co_yen.jpg'
      },
      grades,
      prompts: Object.fromEntries(prompts.map(p => [p.tab_key, p.prompt_text])),
      tips,
      metrics: {
        totalVisits: stats.visits.total,
        totalAttempts: stats.quizzes.totalAttempts,
        accuracyRate: stats.quizzes.accuracyRate
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Ghi nhận lượt truy cập
app.post('/api/public/visit', (req, res) => {
  try {
    const { sessionId, path } = req.body;
    const userAgent = req.headers['user-agent'] || '';
    const clientIp = req.ip || req.headers['x-forwarded-for'] || '';

    const result = recordVisit({ sessionId, userAgent, path, clientIp });
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Lấy danh sách kiến thức theo khối lớp
app.get('/api/public/lessons', (req, res) => {
  try {
    const gradeId = req.query.grade || '6';
    const lessons = db.prepare('SELECT id, grade_id, title, content, sample_example, self_check_question FROM lessons WHERE grade_id = ? ORDER BY id ASC').all(gradeId);
    res.json({ success: true, lessons });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Lấy danh sách câu hỏi trắc nghiệm tương tác
app.get('/api/public/quizzes', (req, res) => {
  try {
    const gradeId = req.query.grade || '6';
    const questions = db.prepare('SELECT id, grade_id, topic, text, options_json, correct_answer, hint, explanation FROM questions WHERE grade_id = ? ORDER BY id ASC').all(gradeId);
    
    // Parse options_json
    const parsed = questions.map(q => ({
      ...q,
      options: JSON.parse(q.options_json || '[]')
    }));

    res.json({ success: true, questions: parsed });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Nộp bài làm trắc nghiệm tương tác
app.post('/api/public/quiz-attempt', (req, res) => {
  try {
    const { questionId, selectedIndex, anonymousSessionId } = req.body;
    const q = db.prepare('SELECT * FROM questions WHERE id = ?').get(questionId);

    if (!q) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy câu hỏi.' });
    }

    const isCorrect = Number(selectedIndex) === Number(q.correct_answer);

    // Ghi nhận kết quả vào cơ sở dữ liệu server
    recordQuizAttempt({
      questionId: q.id,
      gradeId: q.grade_id,
      topic: q.topic,
      isCorrect,
      anonymousSessionId
    });

    res.json({
      success: true,
      isCorrect,
      correctAnswer: q.correct_answer,
      hint: q.hint,
      explanation: q.explanation
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Lấy danh sách video bài giảng
app.get('/api/public/videos', (req, res) => {
  try {
    const gradeId = req.query.grade || '6';
    const videos = db.prepare('SELECT id, grade_id, topic, title, description, video_url, duration FROM videos WHERE grade_id = ? ORDER BY id ASC').all(gradeId);
    res.json({ success: true, videos });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Lấy danh sách tài liệu học tập
app.get('/api/public/resources', (req, res) => {
  try {
    const gradeId = req.query.grade || '6';
    const resources = db.prepare('SELECT id, grade_id, topic, title, description, file_url, file_type FROM resources WHERE grade_id = ? ORDER BY id ASC').all(gradeId);
    res.json({ success: true, resources });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Lấy danh sách mẹo học toán
app.get('/api/public/tips', (req, res) => {
  try {
    const tips = db.prepare('SELECT id, title, content FROM tips ORDER BY order_index ASC').all();
    res.json({ success: true, tips });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Hỏi bài toán với Trợ lý AI (Gợi mở từng bước Socratic)
app.post('/api/public/chat', rateLimiter, async (req, res) => {
  try {
    const { message, imageBase64, mimeType, tabKey = 'chat', gradeId = '6', topic = '' } = req.body;

    if (!message && !imageBase64) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập câu hỏi hoặc gửi ảnh bài toán.' });
    }

    const reply = await askGemini({
      message: message ? String(message).substring(0, 2000) : '',
      imageBase64,
      mimeType,
      tabKey,
      gradeId,
      topic
    });

    res.json({
      success: true,
      reply: reply.text,
      isFallback: reply.isFallback
    });
  } catch (err) {
    console.error('[Chat API Error]:', err.message);
    res.status(500).json({
      success: false,
      message: 'Có chút trục trặc khi kết nối với cô AI, em thử gửi lại câu hỏi nhé! 🌿'
    });
  }
});

// ============================================================
// 2. AUTHENTICATION APIS (Xác thực giáo viên)
// ============================================================

app.post('/api/auth/login', (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập đủ tên đăng nhập và mật khẩu.' });
    }

    const result = login(username, password);
    if (!result.success) {
      return res.status(401).json(result);
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/auth/me', (req, res) => {
  let token = null;
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  const user = verifyToken(token);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Chưa đăng nhập hoặc phiên đã hết hạn.' });
  }

  res.json({ success: true, user });
});

// ============================================================
// 3. ADMIN APIS (Chỉ giáo viên xác thực mới truy cập được)
// ============================================================

// Báo cáo số liệu thực tế trên máy chủ
app.get('/api/admin/stats', requireTeacher, (req, res) => {
  try {
    const range = req.query.range || 'all';
    const stats = getStatistics(range);
    res.json({ success: true, stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Danh sách & Cập nhật Prompts theo tab
app.get('/api/admin/prompts', requireTeacher, (req, res) => {
  try {
    const prompts = db.prepare('SELECT * FROM tab_prompts ORDER BY tab_key ASC, version DESC').all();
    res.json({ success: true, prompts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/admin/prompts', requireTeacher, (req, res) => {
  try {
    const { tab_key, prompt_text, notes } = req.body;
    if (!tab_key || !prompt_text) {
      return res.status(400).json({ success: false, message: 'Thiếu tab_key hoặc nội dung prompt.' });
    }

    // Lấy version lớn nhất hiện tại
    const maxV = db.prepare('SELECT MAX(version) as max_v FROM tab_prompts WHERE tab_key = ?').get(tab_key);
    const newVersion = (maxV?.max_v || 0) + 1;

    // Đánh dấu các bản trước thành không active
    db.prepare('UPDATE tab_prompts SET is_active = 0 WHERE tab_key = ?').run(tab_key);

    // Chèn bản mới active
    db.prepare(`
      INSERT INTO tab_prompts (tab_key, prompt_text, version, is_active, notes)
      VALUES (?, ?, ?, 1, ?)
    `).run(tab_key, prompt_text, newVersion, notes || `Bản cập nhật v${newVersion} bởi giáo viên`);

    res.json({ success: true, message: `Đã lưu prompt cho tab [${tab_key}] thành công (v${newVersion})!` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Quản lý câu hỏi trắc nghiệm
app.get('/api/admin/questions', requireTeacher, (req, res) => {
  try {
    const grade = req.query.grade;
    let query = 'SELECT * FROM questions';
    let params = [];
    if (grade) {
      query += ' WHERE grade_id = ?';
      params.push(grade);
    }
    query += ' ORDER BY id DESC';
    const rows = db.prepare(query).all(...params);
    res.json({
      success: true,
      questions: rows.map(r => ({ ...r, options: JSON.parse(r.options_json || '[]') }))
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// AI Tự động trích xuất bài tập tương tác theo tiêu đề bài học
app.post('/api/generate-quiz', (req, res) => {
  const handler = require('./api/generate-quiz.js');
  return handler(req, res);
});

// AI Hỗ trợ giáo viên soạn thảo bài học
app.post('/api/generate-lesson', (req, res) => {
  const handler = require('./api/generate-lesson.js');
  return handler(req, res);
});

// Endpoint thêm bài học công khai / giáo viên
app.post('/api/public/lessons', (req, res) => {
  const handler = require('./api/public/lessons.js');
  return handler(req, res);
});

// Endpoint thêm tài liệu công khai / giáo viên
app.post('/api/public/resources', (req, res) => {
  const handler = require('./api/public/resources.js');
  return handler(req, res);
});

// Endpoint thêm bài tập công khai / giáo viên
app.post('/api/public/quizzes', (req, res) => {
  const handler = require('./api/public/quizzes.js');
  return handler(req, res);
});

app.post('/api/admin/questions', requireTeacher, (req, res) => {
  try {
    const { grade_id, topic, text, options, correct_answer, hint, explanation } = req.body;
    const stmt = db.prepare(`
      INSERT INTO questions (grade_id, topic, text, options_json, correct_answer, hint, explanation)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      grade_id || '6',
      topic || 'Tổng hợp',
      text,
      JSON.stringify(options || []),
      Number(correct_answer) || 0,
      hint || '',
      explanation || ''
    );
    res.json({ success: true, id: info.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/admin/questions/:id', requireTeacher, (req, res) => {
  try {
    db.prepare('DELETE FROM questions WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Đã xóa câu hỏi thành công.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Quản lý bài học kiến thức
app.get('/api/admin/lessons', requireTeacher, (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM lessons ORDER BY grade_id ASC, id ASC').all();
    res.json({ success: true, lessons: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/admin/lessons', requireTeacher, (req, res) => {
  try {
    const { grade_id, topic_id, title, content, sample_example, self_check_question } = req.body;
    const stmt = db.prepare(`
      INSERT INTO lessons (grade_id, topic_id, title, content, sample_example, self_check_question)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(grade_id || '6', topic_id || 'general', title, content, sample_example || '', self_check_question || '');
    res.json({ success: true, id: info.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/admin/lessons/:id', requireTeacher, (req, res) => {
  try {
    db.prepare('DELETE FROM lessons WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Đã xóa bài học.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Quản lý video và tài liệu
app.get('/api/admin/videos', requireTeacher, (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM videos ORDER BY id DESC').all();
    res.json({ success: true, videos: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/admin/videos', requireTeacher, (req, res) => {
  try {
    const { grade_id, topic, title, description, video_url, duration } = req.body;
    const stmt = db.prepare('INSERT INTO videos (grade_id, topic, title, description, video_url, duration) VALUES (?, ?, ?, ?, ?, ?)');
    const info = stmt.run(grade_id || '6', topic || '', title, description || '', video_url, duration || '');
    res.json({ success: true, id: info.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/admin/videos/:id', requireTeacher, (req, res) => {
  try {
    db.prepare('DELETE FROM videos WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/admin/resources', requireTeacher, (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM resources ORDER BY id DESC').all();
    res.json({ success: true, resources: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/admin/resources', requireTeacher, (req, res) => {
  try {
    const { grade_id, topic, title, description, file_url, file_type } = req.body;
    const stmt = db.prepare('INSERT INTO resources (grade_id, topic, title, description, file_url, file_type) VALUES (?, ?, ?, ?, ?, ?)');
    const info = stmt.run(grade_id || '6', topic || '', title, description || '', file_url, file_type || 'PDF');
    res.json({ success: true, id: info.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/admin/resources/:id', requireTeacher, (req, res) => {
  try {
    db.prepare('DELETE FROM resources WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Xuất bản sao lưu dữ liệu toàn hệ thống
app.get('/api/admin/export', requireTeacher, (req, res) => {
  try {
    const backup = {
      exported_at: new Date().toISOString(),
      grades: db.prepare('SELECT * FROM grades').all(),
      prompts: db.prepare('SELECT * FROM tab_prompts').all(),
      lessons: db.prepare('SELECT * FROM lessons').all(),
      questions: db.prepare('SELECT * FROM questions').all(),
      videos: db.prepare('SELECT * FROM videos').all(),
      resources: db.prepare('SELECT * FROM resources').all(),
      tips: db.prepare('SELECT * FROM tips').all()
    };
    res.setHeader('Content-Disposition', 'attachment; filename=coyen_math_backup.json');
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(backup, null, 2));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Xóa đặt lại dữ liệu thống kê
app.post('/api/admin/reset-stats', requireTeacher, (req, res) => {
  try {
    db.exec('DELETE FROM visit_events; DELETE FROM quiz_attempts;');
    res.json({ success: true, message: 'Đã đặt lại dữ liệu lượt truy cập và bài tập trên máy chủ.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Bắt mọi route frontend SPA
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Khởi động server khi chạy trực tiếp
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🌸 YENTRAN AI - TRỢ LÝ HỌC TOÁN THCS (CÔ TRẦN THỊ HẢI YẾN)`);
    console.log(`🚀 Máy chủ đang chạy tại: http://localhost:${PORT}`);
    console.log(`🔑 Tài khoản Quản trị giáo viên: yentran`);
    console.log(`=======================================================`);
  });
}

module.exports = app;
