// Vercel Serverless Function: /api/auth/login
module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }

  const { username, password } = body || {};
  if (username === "coyen" && password === "coYen@2026") {
    return res.status(200).json({
      success: true,
      token: "demo-jwt-token-co-yen-2026",
      user: {
        id: 1,
        username: "coyen",
        role: "teacher",
        full_name: "Trần Thị Hải Yến"
      }
    });
  }

  return res.status(401).json({
    success: false,
    message: "Tên đăng nhập hoặc mật khẩu không chính xác."
  });
};
