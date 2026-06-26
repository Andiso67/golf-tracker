import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword, getPlayerForUser } from '@/lib/auth'

export async function GET() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      firstName: true,
      lastName1: true,
      lastName2: true,
      email: true,
      emailVerified: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(users)
}

export async function POST(req: Request) {
  const { firstName, lastName1, lastName2, email, password } = await req.json()

  if (!email || !password || !firstName) {
    return NextResponse.json({ error: 'firstName, email and password required' }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
  }

  const passwordHash = await hashPassword(password)

  const user = await prisma.user.create({
    data: {
      firstName,
      lastName1: lastName1 || '',
      lastName2: lastName2 || '',
      email,
      passwordHash,
    },
    select: {
      id: true,
      firstName: true,
      lastName1: true,
      lastName2: true,
      email: true,
      emailVerified: true,
      createdAt: true,
    },
  })

  await prisma.player.create({
    data: {
      userId: user.id,
      firstName: user.firstName,
      lastName1: user.lastName1,
      lastName2: user.lastName2,
      handicap: 0,
      homeCourse: '',
    },
  })

  return NextResponse.json(user, { status: 201 })
}
