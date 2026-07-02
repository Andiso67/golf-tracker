import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createResetToken } from '@/lib/auth'
import { forgotPasswordSchema, formatZodErrors } from '@/lib/validations'
import { checkRateLimit, extractIp, rateLimitResponse } from '@/lib/rateLimit'

export async function POST(req: Request) {
  try {
    const ip = extractIp(req)
    const { allowed, retryAfter } = checkRateLimit(ip, 3, 60000)
    if (!allowed) {
      return rateLimitResponse(retryAfter)
    }

    const body = await req.json()
    const result = forgotPasswordSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: formatZodErrors(result.error) }, { status: 400 })
    }
    const { email } = result.data

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ error: 'No account with that email' }, { status: 404 })
    }

    const token = await createResetToken(email)
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password?token=${token}&email=${encodeURIComponent(email)}`

    if (process.env.NODE_ENV === 'development') {
      console.log(`[EMAIL] Reset: ${resetUrl}`)
    }

    return NextResponse.json({
      success: true,
      ...(process.env.NODE_ENV === 'development' && { resetUrl }),
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
