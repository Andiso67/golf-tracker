import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyPassword, createSession, getPlayerForUser } from '@/lib/auth'

export async function POST(req: Request) {
  const { email, password } = await req.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  }

  const valid = await verifyPassword(password, user.passwordHash)
  if (!valid) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  }

  const sessionToken = await createSession(user.id)
  const playerId = await getPlayerForUser(user.id)

  return NextResponse.json({
    userId: user.id,
    playerId,
    firstName: user.firstName,
    lastName1: user.lastName1,
    lastName2: user.lastName2,
    email: user.email,
    emailVerified: user.emailVerified?.toISOString() || null,
    sessionToken,
  })
}
