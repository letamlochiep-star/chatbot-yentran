// Vercel Serverless Function: /api/auth/me
module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  const auth = req.headers.authorization || "";
  if (auth.startsWith("Bearer demo-jwt-token-co-yen-2026") || auth.startsWith("Bearer ")) {
    return res.status(200).json({
      success: true,
      user: {
        id: 1,
        username: "yentran",
        role: "teacher",
        full_name: "Cô Trần Thị Hải Yến"
      }
    });
  }
  return res.status(401).json({ success: false, message: "Chưa đăng nhập." });
};
