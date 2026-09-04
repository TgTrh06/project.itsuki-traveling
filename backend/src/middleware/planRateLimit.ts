// Simple in-memory rate limiter for plan endpoints
// Limits requests per user/IP to N requests per window
const rateMap = new Map();

export default function planRateLimit({ windowMs = 60 * 1000, max = 30 } = {}) {
  return (req, res, next) => {
    try {
      const key = req.user?._id?.toString() || req.ip;
      const now = Date.now();
      const entry = rateMap.get(key) || { count: 0, start: now };

      if (now - entry.start > windowMs) {
        // reset window
        entry.count = 1;
        entry.start = now;
        rateMap.set(key, entry);
        return next();
      }

      if (entry.count >= max) {
        res.status(429).json({ success: false, message: 'Too many requests, please slow down' });
        return;
      }

      entry.count += 1;
      rateMap.set(key, entry);
      return next();
    } catch (err) {
      return next();
    }
  };
}
