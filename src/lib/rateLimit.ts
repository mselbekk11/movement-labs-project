// this is a simple rate limit store that is used to limit the number of requests per IP address

interface RateLimitStore {
  [ip: string]: {
    count: number; // Number of requests made
    resetTime: number; // When the counter will reset
  };
}

const rateLimitStore: RateLimitStore = {};


// The rateLimit function takes 3 parameters:
// 1. The IP address making the request
// 2. Maximum number of requests allowed
// 3. Time window in milliseconds (defaults to 60000ms = 1 minute)

export function rateLimit(ip: string, limit: number, windowMs: number = 60000): boolean {

  // Get current timestamp in milliseconds
  const now = Date.now();
  
  // STEP 1: First time visitor check
  if (!rateLimitStore[ip]) {
    // If this IP hasn't been seen before, create a new entry
    rateLimitStore[ip] = {
      count: 1, // Start with 1 request
      resetTime: now + windowMs, // Set expiry time to current time + window
    };
    return true; // Allow the request since it's their first one
  }

  // STEP 2: Get existing rate limit data for this IP
  const userLimit = rateLimitStore[ip];
  
  // STEP 3: Check if the time window has expired
  if (now > userLimit.resetTime) {
    // If window expired, reset the counter and create new window
    userLimit.count = 1;
    userLimit.resetTime = now + windowMs;
    return true; // Allow the request
  }

  // STEP 4: Check if user has exceeded their limit
  if (userLimit.count >= limit) {
    return false; // Block the request - they've hit their limit
  }

  // STEP 5: If we get here, user is within their limit
  userLimit.count++; // Increment their request count
  return true; // Allow the request
}