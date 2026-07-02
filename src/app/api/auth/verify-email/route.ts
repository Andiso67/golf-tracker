import { NextResponse } from 'next/server'
import { verifyEmailToken } from '@/lib/auth'
import { verifyEmailSchema, formatZodErrors } from '@/lib/validations'
import { checkRateLimit, extractIp, rateLimitResponse } from '@/lib/rateLimit'

export async function POST(req: Request) {
  try {
    const ip = extractIp(req)
    const { allowed, retryAfter } = checkRateLimit(ip, 5, 60000)
    if (!allowed) {
      return rateLimitResponse(retryAfter)
    }

    const body = await req.json()
    const result = verifyEmailSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: formatZodErrors(result.error) }, { status: 400 })
    }
    const { email, token } = result.data

    const ok = await verifyEmailToken(email, token)
    if (!ok) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
