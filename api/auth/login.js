// Vercel Serverless Function: /api/auth/login
module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }

  const { username, password } = body || {};
  const ADMIN_PASS = process.env.ADMIN_PASSWORD || "Antam2025@";
  const validUsers = ["letam", "yentran", (process.env.ADMIN_USERNAME || "letam")];

  if (validUsers.includes(username) && password === ADMIN_PASS) {
    return res.status(200).json({
      success: true,
      token: "demo-jwt-token-le-tam-2026",
      user: {
        id: 1,
        username: username,
        role: "teacher",
        full_name: "Thầy Lê Tâm"
      }
    });
  }

  return res.status(401).json({
    success: false,
    message: "Tên đăng nhập hoặc mật khẩu không chính xác."
  });
};
