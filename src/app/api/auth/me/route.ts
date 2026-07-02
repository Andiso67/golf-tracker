import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthenticatedUserId } from '@/lib/auth'

export async function GET(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req)

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      userId: user.id,
      firstName: user.firstName,
      lastName1: user.lastName1,
      lastName2: user.lastName2,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified?.toISOString() || null,
    })
  } catch {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }
}
