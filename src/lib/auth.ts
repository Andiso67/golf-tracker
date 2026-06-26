import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'

const SALT_ROUNDS = 10
const TOKEN_EXPIRY_HOURS = 24

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
    data: { verificationToken: token },
  })

  return token
}

export async function verifySession(token: string): Promise<string | null> {
  if (!token) return null
  const user = await prisma.user.findFirst({
    where: { verificationToken: token },
  })
  return user?.id || null
}

export async function destroySession(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { verificationToken: null },
  })
}

export async function getPlayerForUser(userId: string): Promise<string> {
  let player = await prisma.player.findUnique({ where: { userId } })
  if (!player) {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new Error('User not found')
    player = await prisma.player.create({
      data: {
        userId: user.id,
        firstName: user.firstName,
        lastName1: user.lastName1,
        lastName2: user.lastName2,
        handicap: 0,
        homeCourse: '',
      },
    })
  }
  return player.id
}
