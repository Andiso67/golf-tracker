import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword, createSession, createVerificationToken } from '@/lib/auth'

export async function POST(req: Request) {
  const { firstName, lastName1, lastName2, email, password } = await req.json()

  if (!email || !password || !firstName) {
    return NextResponse.json({ error: 'firstName, email and password required' }, { status: 400 })
  }

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

  return NextResponse.json({
    userId: user.id,
    firstName: user.firstName,
    lastName1: user.lastName1,
    lastName2: user.lastName2,
    email: user.email,
    emailVerified: null,
    sessionToken,
    verificationUrl,
  }, { status: 201 })
}
