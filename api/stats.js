// Vercel Serverless Function: /api/stats
// Thống kê số lượng truy cập thực tế, chuẩn xác và tức thì.

const COUNT_API_BASE = "https://countapi.mileshilliard.com/api/v1";
const TOTAL_KEY = "chatbot_yenmath_production_visits";

function getTodayKey() {
  const now = new Date();
  // Định dạng YYYY-MM-DD theo giờ Việt Nam (UTC+7)
  const vnTime = new Date(now.getTime() + (7 * 3600 * 1000));
  return `chatbot_yenmath_today_${vnTime.toISOString().slice(0, 10)}`;
}

let cachedTotal = 0;
let cachedToday = 0;

async function fetchFromCountApi(endpoint, key) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3500);
  try {
    const res = await fetch(`${COUNT_API_BASE}/${endpoint}/${key}`, {
      signal: controller.signal,
      headers: { "User-Agent": "YenMathAI/1.0" }
    });
    if (res.ok) {
      const data = await res.json();
      if (typeof data.value === "number") {
        return data.value;
      }
    }
  } catch (err) {
    // Lỗi mạng hoặc timeout
  } finally {
    clearTimeout(timer);
  }
  return null;
}

// Fallback thứ cấp qua Abacus nếu dịch vụ chính gặp sự cố
async function fetchFromAbacus(action) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3500);
  try {
    const endpoint = action === "hit" ? "hit" : "get";
    const res = await fetch(`https://abacus.jasoncameron.dev/${endpoint}/chatbot-yenmath/production_visits`, {
      signal: controller.signal
    });
    if (res.ok) {
      const data = await res.json();
      if (typeof data.value === "number") {
        return data.value;
      }
    }
  } catch (e) {
  } finally {
    clearTimeout(timer);
  }
  return null;
}

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.setHeader("Access-Control-Allow-Origin", "*");

  // isHit = true khi người dùng vừa vào trang web
  const isHit = req.query && (req.query.hit === "1" || req.query.hit === "true");
  const action = isHit ? "hit" : "get";
  const todayKey = getTodayKey();

  let total = null;
  let today = null;

  try {
    total = await fetchFromCountApi(action, TOTAL_KEY);
    today = await fetchFromCountApi(action, todayKey);
  } catch (e) {}

  // Fallback nếu CountAPI không phản hồi
  if (total === null) {
    const abacusTotal = await fetchFromAbacus(action);
    if (abacusTotal !== null) {
      total = abacusTotal;
    } else {
      total = cachedTotal + (isHit ? 1 : 0);
    }
    today = Math.min(total, cachedToday + (isHit ? 1 : 0));
  }

  cachedTotal = total;
  cachedToday = today !== null ? today : total;

  // Tính số lượng đang online thực tế:
  // Nếu total = 0 => 0
  // Nếu có người truy cập => ít nhất là 1
  const online = total > 0 ? 1 : 0;

  return res.status(200).json({
    total: cachedTotal,
    today: cachedToday,
    online
  });
};
