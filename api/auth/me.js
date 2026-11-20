// Vercel Serverless Function: /api/auth/me
module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const auth = req.headers.authorization || "";
  if (auth.startsWith("Bearer demo-jwt-token-co-yen-2026")) {
    return res.status(200).json({
      success: true,
      user: {
        id: 1,
        username: "coyen",
        role: "teacher",
        full_name: "Trần Thị Hải Yến"
      }
    });
  }
  return res.status(401).json({ success: false, message: "Chưa đăng nhập." });
};
