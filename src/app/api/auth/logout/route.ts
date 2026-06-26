import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { destroySession } from '@/lib/auth'

export async function POST(req: Request) {
  const { sessionToken } = await req.json()
  if (sessionToken) {
    const user = await prisma.user.findFirst({
      where: { verificationToken: sessionToken },
    })
    if (user) {
      await destroySession(user.id)
    }
  }
  return NextResponse.json({ success: true })
}
