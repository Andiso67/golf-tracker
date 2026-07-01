import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyPassword, createSession } from '@/lib/auth'
import { loginSchema, formatZodErrors } from '@/lib/validations'

export async function POST(req: Request) {
  const body = await req.json()
  const result = loginSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: formatZodErrors(result.error) }, { status: 400 })
  }
  const { email, password } = result.data

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  }

  const valid = await verifyPassword(password, user.passwordHash)
  if (!valid) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  }

  const sessionToken = await createSession(user.id)

  return NextResponse.json({
    userId: user.id,
    firstName: user.firstName,
    lastName1: user.lastName1,
    lastName2: user.lastName2,
    email: user.email,
    emailVerified: user.emailVerified?.toISOString() || null,
    sessionToken,
  })
}
