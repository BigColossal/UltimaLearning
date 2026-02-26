const RATE_MAP = new Map();

export default function rateLimiter({
  keyPrefix = "rl",
  limit = 50,
  windowMs = 60 * 60 * 1000,
} = {}) {
  return (req, res, next) => {
    const uid = req.user?.id || req.ip;
    const key = `${keyPrefix}:${uid}`;
    const entry = RATE_MAP.get(key) || {
      count: 0,
      reset: Date.now() + windowMs,
    };
    if (Date.now() > entry.reset) {
      entry.count = 0;
      entry.reset = Date.now() + windowMs;
    }
    entry.count += 1;
    RATE_MAP.set(key, entry);
    if (entry.count > limit)
      return res.status(429).json({ message: "Rate limit exceeded" });
    next();
  };
}
