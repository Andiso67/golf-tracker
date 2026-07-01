import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword, createSession, createVerificationToken, SESSION_COOKIE, SESSION_COOKIE_OPTIONS } from '@/lib/auth'
import { registerSchema, formatZodErrors } from '@/lib/validations'
import { checkRateLimit, extractIp, rateLimitResponse } from '@/lib/rateLimit'

export async function POST(req: Request) {
  const ip = extractIp(req)
  const { allowed, retryAfter } = checkRateLimit(ip, 10, 3600000)
  if (!allowed) {
    return rateLimitResponse(retryAfter)
  }

  const body = await req.json()
  const result = registerSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: formatZodErrors(result.error) }, { status: 400 })
  }
  const { firstName, lastName1, lastName2, email, password } = result.data

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
  }

  const passwordHash = await hashPassword(password)

  const user = await prisma.user.create({
    data: {
      firstName,
      lastName1: lastName1 || '',
      lastName2: lastName2 || '',
      email,
      passwordHash,
    },
  })

  const sessionToken = await createSession(user.id)
  const verificationToken = await createVerificationToken(email)

  const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`

  console.log(`[EMAIL] Verify: ${verificationUrl}`)

  const response = NextResponse.json({
    userId: user.id,
    firstName: user.firstName,
    lastName1: user.lastName1,
    lastName2: user.lastName2,
    email: user.email,
    emailVerified: null,
    verificationUrl,
  }, { status: 201 })
  response.cookies.set(SESSION_COOKIE, sessionToken, SESSION_COOKIE_OPTIONS)
  return response
}
