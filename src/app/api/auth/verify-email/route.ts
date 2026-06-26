import { NextResponse } from 'next/server'
import { verifyEmailToken } from '@/lib/auth'

export async function POST(req: Request) {
  const { email, token } = await req.json()
  if (!email || !token) {
    return NextResponse.json({ error: 'Email and token required' }, { status: 400 })
  }

  const ok = await verifyEmailToken(email, token)
  if (!ok) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
