interface RateLimitStore {
  [ip: string]: {
    count: number;
    resetTime: number;
  };
}

const rateLimitStore: RateLimitStore = {};

export function rateLimit(ip: string, limit: number, windowMs: number = 60000): boolean {
  const now = Date.now();
  
  if (!rateLimitStore[ip]) {
    rateLimitStore[ip] = {
      count: 1,
      resetTime: now + windowMs,
    };
    return true;
  }

  const userLimit = rateLimitStore[ip];
  
  if (now > userLimit.resetTime) {
    userLimit.count = 1;
    userLimit.resetTime = now + windowMs;
    return true;
  }

  if (userLimit.count >= limit) {
    return false;
  }

  userLimit.count++;
  return true;
}