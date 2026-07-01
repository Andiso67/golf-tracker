import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'
import { verifySession, SESSION_COOKIE } from '@/lib/auth'

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value

  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }

  const userId = await verifySession(token)
  if (!userId) {
    const response = NextResponse.json({ authenticated: false }, { status: 401 })
    response.cookies.set(SESSION_COOKIE, '', { maxAge: 0, path: '/' })
    return response
  }

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    const response = NextResponse.json({ authenticated: false }, { status: 401 })
    response.cookies.set(SESSION_COOKIE, '', { maxAge: 0, path: '/' })
    return response
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName1: user.lastName1,
      lastName2: user.lastName2,
      email: user.email,
      emailVerified: user.emailVerified?.toISOString() || null,
    },
  })
}
