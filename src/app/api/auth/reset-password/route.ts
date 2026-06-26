import { NextResponse } from 'next/server'
import { resetPassword } from '@/lib/auth'

export async function POST(req: Request) {
  const { email, token, password } = await req.json()
  if (!email || !token || !password) {
    return NextResponse.json({ error: 'Email, token and password required' }, { status: 400 })
  }

  const ok = await resetPassword(email, token, password)
  if (!ok) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
