/**
 * Module thống kê thời gian thực & bảo vệ chống bot/spam
 * Tuân thủ bảo mật quyền riêng tư học sinh: không lưu IP thô, băm IP bằng SHA-256
 */

const crypto = require('crypto');
const { db } = require('./db');

// Danh sách các mẫu User-Agent của bot / web crawler thông dụng
const BOT_REGEX = /bot|spider|crawl|slurp|facebookexternalhit|whatsapp|telegrambot|preview|curl|wget|python|postman|apachebench|scanner/i;

// Băm địa chỉ IP bảo mật
function hashIp(ip) {
  if (!ip) return 'unknown';
  return crypto.createHash('sha256').update(ip + '-yentran-salt-privacy').digest('hex').substring(0, 16);
}

// Kiểm tra xem User-Agent có phải bot hay không
function isBotUserAgent(userAgent) {
  if (!userAgent) return 0;
  return BOT_REGEX.test(userAgent) ? 1 : 0;
}

// Bộ nhớ đệm tạm thời để chống đếm lặp trong phiên (Session Timeout: 30 phút)
const sessionCache = new Map(); // sessionId -> lastTimestamp
const SESSION_WINDOW_MS = 30 * 60 * 1000;

// Ghi nhận lượt truy cập
function recordVisit({ sessionId, userAgent, path = '/', clientIp }) {
  if (!sessionId) {
    sessionId = crypto.randomUUID();
  }

  const now = Date.now();
  const lastSeen = sessionCache.get(sessionId);

  // Nếu cùng 1 session truy cập trong vòng 30 phút, không tăng đếm phiên mới
  if (lastSeen && (now - lastSeen) < SESSION_WINDOW_MS) {
    sessionCache.set(sessionId, now);
    return { recorded: false, reason: 'existing_session', sessionId };
  }

  sessionCache.set(sessionId, now);
  // Dọn dẹp cache phiên cũ quá 2 giờ
  if (sessionCache.size > 5000) {
    for (const [key, ts] of sessionCache.entries()) {
      if (now - ts > 2 * 60 * 60 * 1000) {
        sessionCache.delete(key);
      }
    }
  }

  const isBot = isBotUserAgent(userAgent);
  const ipH = hashIp(clientIp);

  db.prepare(`
    INSERT INTO visit_events (anonymous_session_id, user_agent, path, is_bot, ip_hash)
    VALUES (?, ?, ?, ?, ?)
  `).run(sessionId, userAgent ? userAgent.substring(0, 255) : '', path, isBot, ipH);

  return { recorded: true, isBot: isBot === 1, sessionId };
}

// Ghi nhận lượt nộp bài trắc nghiệm
function recordQuizAttempt({ questionId, gradeId, topic, isCorrect, anonymousSessionId }) {
  if (!anonymousSessionId) {
    anonymousSessionId = 'anon_' + crypto.randomBytes(8).toString('hex');
  }

  const stmt = db.prepare(`
    INSERT INTO quiz_attempts (question_id, grade_id, topic, is_correct, anonymous_session_id)
    VALUES (?, ?, ?, ?, ?)
  `);

  const info = stmt.run(
    Number(questionId) || 0,
    gradeId || '6',
    topic || 'Tổng hợp',
    isCorrect ? 1 : 0,
    anonymousSessionId
  );

  return { success: true, attemptId: info.lastInsertRowid };
}

// Lấy báo cáo thống kê theo khoảng thời gian (all, today, 7days, 30days)
function getStatistics(timeRange = 'all') {
  let timeFilterVisits = '';
  let timeFilterAttempts = '';

  if (timeRange === 'today') {
    timeFilterVisits = "AND created_at >= date('now', 'start of day')";
    timeFilterAttempts = "WHERE created_at >= date('now', 'start of day')";
  } else if (timeRange === '7days') {
    timeFilterVisits = "AND created_at >= date('now', '-7 days')";
    timeFilterAttempts = "WHERE created_at >= date('now', '-7 days')";
  } else if (timeRange === '30days') {
    timeFilterVisits = "AND created_at >= date('now', '-30 days')";
    timeFilterAttempts = "WHERE created_at >= date('now', '-30 days')";
  }

  // 1. Tổng lượt truy cập (chỉ tính người dùng thực, loại bỏ bot)
  const visitsRow = db.prepare(`
    SELECT 
      COUNT(*) as total_visits,
      COUNT(DISTINCT anonymous_session_id) as unique_sessions,
      SUM(CASE WHEN is_bot = 1 THEN 1 ELSE 0 END) as bot_requests
    FROM visit_events
    WHERE 1=1 ${timeFilterVisits}
  `).get();

  // 2. Tổng số lượt làm bài và tỷ lệ đúng
  const quizRow = db.prepare(`
    SELECT 
      COUNT(*) as total_attempts,
      SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct_attempts
    FROM quiz_attempts
    ${timeFilterAttempts}
  `).get();

  const totalAttempts = quizRow.total_attempts || 0;
  const correctAttempts = quizRow.correct_attempts || 0;
  const accuracyRate = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;

  // 3. Phân bố bài làm theo khối lớp
  const gradeDistribution = db.prepare(`
    SELECT grade_id, COUNT(*) as count, SUM(is_correct) as correct
    FROM quiz_attempts
    ${timeFilterAttempts}
    GROUP BY grade_id
    ORDER BY grade_id ASC
  `).all();

  // 4. Phân bố bài làm theo chủ đề
  const topicDistribution = db.prepare(`
    SELECT topic, grade_id, COUNT(*) as count, SUM(is_correct) as correct
    FROM quiz_attempts
    ${timeFilterAttempts}
    GROUP BY topic, grade_id
    ORDER BY count DESC
    LIMIT 10
  `).all();

  // 5. Nhật ký 15 lần nộp bài gần nhất
  const recentLogs = db.prepare(`
    SELECT id, question_id, grade_id, topic, is_correct, created_at
    FROM quiz_attempts
    ORDER BY id DESC
    LIMIT 15
  `).all();

  return {
    timeRange,
    visits: {
      total: (visitsRow.total_visits || 0) - (visitsRow.bot_requests || 0),
      uniqueSessions: visitsRow.unique_sessions || 0,
      botBlocked: visitsRow.bot_requests || 0
    },
    quizzes: {
      totalAttempts,
      correctAttempts,
      accuracyRate
    },
    gradeDistribution,
    topicDistribution,
    recentLogs
  };
}

module.exports = {
  recordVisit,
  recordQuizAttempt,
  getStatistics
};
