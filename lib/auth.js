/**
 * Module xác thực và phân quyền cho hệ thống Cô Trần Thị Hải Yến
 * Hỗ trợ Token ký HMAC-SHA256 an toàn, bảo vệ các endpoint Quản trị giáo viên
 */

const crypto = require('crypto');
const { db, verifyPassword } = require('./db');

const SECRET_KEY = process.env.JWT_SECRET || 'coyen-math-secret-key-2026-secure-token-salt';

// Ký tạo token phiên làm việc
function generateToken(user) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    id: user.id,
    username: user.username,
    role: user.role,
    full_name: user.full_name,
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 ngày
  })).toString('base64url');

  const signature = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(`${header}.${payload}`)
    .digest('base64url');

  return `${header}.${payload}.${signature}`;
}

// Xác thực token
function verifyToken(token) {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [header, payload, signature] = parts;
  const expectedSig = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(`${header}.${payload}`)
    .digest('base64url');

  if (signature !== expectedSig) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (data.exp && data.exp < Math.floor(Date.now() / 1000)) {
      return null; // Hết hạn
    }
    return data;
  } catch (e) {
    return null;
  }
}

// Xử lý đăng nhập giáo viên
function login(username, password) {
  const row = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!row) {
    return { success: false, message: 'Tên đăng nhập hoặc mật khẩu không chính xác' };
  }

  const isValid = verifyPassword(password, row.password_hash, row.salt);
  if (!isValid) {
    return { success: false, message: 'Tên đăng nhập hoặc mật khẩu không chính xác' };
  }

  const token = generateToken(row);
  return {
    success: true,
    token,
    user: {
      id: row.id,
      username: row.username,
      role: row.role,
      full_name: row.full_name
    }
  };
}

// Middleware kiểm tra quyền giáo viên
function requireTeacher(req, res, next) {
  let token = null;
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  const user = verifyToken(token);
  if (!user || user.role !== 'teacher') {
    return res.status(403).json({
      success: false,
      message: 'Yêu cầu quyền Quản trị viên (Giáo viên) để thực hiện thao tác này.'
    });
  }

  req.user = user;
  next();
}

module.exports = {
  login,
  generateToken,
  verifyToken,
  requireTeacher
};
