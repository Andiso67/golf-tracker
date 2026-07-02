import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

const SALT_ROUNDS = 10
const TOKEN_EXPIRY_HOURS = 24

export const SESSION_COOKIE = 'session-token'

function parseCookie(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null
  for (const part of cookieHeader.split(';')) {
    const eqIdx = part.indexOf('=')
    if (eqIdx === -1) continue
    const key = part.substring(0, eqIdx).trim()
    if (key === name) return part.substring(eqIdx + 1).trim()
  }
  return null
}

export async function getAuthenticatedUserId(req: Request): Promise<string> {
  let token = parseCookie(req.headers.get('cookie'), SESSION_COOKIE)
  if (!token) {
    token = req.headers.get('authorization')?.replace('Bearer ', '') || null
  }
  if (!token) {
    throw new AuthError('Not authenticated')
  }
  const userId = await verifySession(token)
  if (!userId) {
    throw new AuthError('Invalid session')
  }
  return userId
}

export const SESSION_MAX_AGE = 60 * 60 * 24 * 7

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: SESSION_MAX_AGE,
  path: '/',
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthError'
  }
}

export function handleAuthError(error: unknown): NextResponse {
  if (error instanceof AuthError) {
    return NextResponse.json({ error: error.message }, { status: 401 })
  }
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function generateToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

export function generateVerificationUrl(email: string, token: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  return `${base}/verify-email?token=${token}&email=${encodeURIComponent(email)}`
}

export function generateResetUrl(email: string, token: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  return `${base}/reset-password?token=${token}&email=${encodeURIComponent(email)}`
}

export async function createVerificationToken(email: string): Promise<string> {
  const token = generateToken()
  await prisma.verificationToken.create({
    data: {
      email,
      token,
      type: 'EMAIL_VERIFICATION',
      expires: new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000),
    },
  })
  return token
}

export async function createResetToken(email: string): Promise<string> {
  const token = generateToken()
  await prisma.verificationToken.create({
    data: {
      email,
      token,
      type: 'PASSWORD_RESET',
      expires: new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000),
    },
  })
  return token
}

export async function verifyEmailToken(email: string, token: string): Promise<boolean> {
  const record = await prisma.verificationToken.findFirst({
    where: { email, token, type: 'EMAIL_VERIFICATION', expires: { gt: new Date() } },
  })
  if (!record) return false

  await prisma.user.update({
    where: { email },
    data: { emailVerified: new Date(), verificationToken: null },
  })
  await prisma.verificationToken.delete({ where: { id: record.id } })
  return true
}

export async function verifyResetToken(email: string, token: string): Promise<boolean> {
  const record = await prisma.verificationToken.findFirst({
    where: { email, token, type: 'PASSWORD_RESET', expires: { gt: new Date() } },
  })
  if (!record) return false

  await prisma.verificationToken.delete({ where: { id: record.id } })
  return true
}

export async function resetPassword(email: string, token: string, newPassword: string): Promise<boolean> {
  const record = await prisma.verificationToken.findFirst({
    where: { email, token, type: 'PASSWORD_RESET', expires: { gt: new Date() } },
  })
  if (!record) return false

  const passwordHash = await hashPassword(newPassword)
  await prisma.user.update({
    where: { email },
    data: { passwordHash, resetPasswordToken: null, resetPasswordExpires: null },
  })
  await prisma.verificationToken.delete({ where: { id: record.id } })
  return true
}

export async function createSession(userId: string): Promise<string> {
  const token = generateToken()

  await prisma.user.update({
    where: { id: userId },
    data: { sessionToken: token },
  })

  return token
}

export async function verifySession(token: string): Promise<string | null> {
  if (!token) return null
  const user = await prisma.user.findFirst({
    where: { sessionToken: token },
  })
  return user?.id || null
}

export async function getUserRole(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  })
  return user?.role || null
}

export async function requireAdmin(userId: string): Promise<void> {
  const role = await getUserRole(userId)
  if (role !== 'admin') {
    throw new AuthError('Admin access required')
  }
}

export async function requireAdminOrOwner(userId: string, targetUserId: string): Promise<void> {
  if (userId === targetUserId) return
  await requireAdmin(userId)
}

export async function destroySession(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { sessionToken: null },
  })
}
