import { NextResponse } from 'next/server'

const store = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; retryAfter: number } {
  const now = Date.now()

  for (const [key, entry] of store) {
    if (entry.resetTime <= now) {
      store.delete(key)
    }
  }

  const entry = store.get(identifier)

  if (!entry || entry.resetTime <= now) {
    store.set(identifier, { count: 1, resetTime: now + windowMs })
    return { allowed: true, remaining: maxRequests - 1, retryAfter: 0 }
  }

  entry.count++

  if (entry.count > maxRequests) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000)
    return { allowed: false, remaining: 0, retryAfter }
  }

  return { allowed: true, remaining: maxRequests - entry.count, retryAfter: 0 }
}

export function extractIp(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('x-real-ip')
    || 'unknown'
}

export function rateLimitResponse(retryAfter: number): Response {
  return NextResponse.json(
    { error: `Too many requests. Try again in ${retryAfter} seconds.` },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfter),
        'X-RateLimit-Remaining': '0',
      },
    }
  )
}
