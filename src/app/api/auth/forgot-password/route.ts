import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createResetToken } from '@/lib/auth'

export async function POST(req: Request) {
  const { email } = await req.json()
  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return NextResponse.json({ error: 'No account with that email' }, { status: 404 })
  }

  const token = await createResetToken(email)
  const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password?token=${token}&email=${encodeURIComponent(email)}`

  console.log(`[EMAIL] Reset: ${resetUrl}`)

  return NextResponse.json({ success: true, resetUrl })
}
