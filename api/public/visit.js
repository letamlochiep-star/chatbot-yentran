// Vercel Serverless Function: /api/public/visit
module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  return res.status(200).json({ success: true, message: "Lượt truy cập đã được ghi nhận." });
};
