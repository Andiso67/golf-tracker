import { NextResponse } from 'next/server'
import { resetPassword } from '@/lib/auth'
import { resetPasswordSchema, formatZodErrors } from '@/lib/validations'
import { checkRateLimit, extractIp, rateLimitResponse } from '@/lib/rateLimit'

export async function POST(req: Request) {
  try {
    const ip = extractIp(req)
    const { allowed, retryAfter } = checkRateLimit(ip, 5, 60000)
    if (!allowed) {
      return rateLimitResponse(retryAfter)
    }

    const body = await req.json()
    const result = resetPasswordSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: formatZodErrors(result.error) }, { status: 400 })
    }
    const { email, token, password } = result.data

    const ok = await resetPassword(email, token, password)
    if (!ok) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
