import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { destroySession, SESSION_COOKIE } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value

  if (token) {
    const user = await prisma.user.findFirst({
      where: { verificationToken: token },
    })
    if (user) {
      await destroySession(user.id)
    }
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set(SESSION_COOKIE, '', { maxAge: 0, path: '/' })
  return response
}
