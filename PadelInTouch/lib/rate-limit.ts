// Simple in-memory rate limiting for API endpoints
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function rateLimit(identifier: string, limit = 10, windowMs = 60000): boolean {
  const now = Date.now()
  const key = identifier
  const record = rateLimitMap.get(key)

  if (!record || now > record.resetTime) {
    // Reset or create new record
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (record.count >= limit) {
    return false // Rate limit exceeded
  }

  record.count++
  return true
}

export function getRateLimitIdentifier(request: Request): string {
  // In production, you might want to use IP address or user ID
  // For now, we'll use a simple approach
  const forwarded = request.headers.get("x-forwarded-for")
  const ip = forwarded ? forwarded.split(",")[0] : "unknown"
  return ip
}
