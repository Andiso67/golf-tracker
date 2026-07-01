import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword, getAuthenticatedUserId, handleAuthError } from '@/lib/auth'
import { createUserSchema, formatZodErrors } from '@/lib/validations'

export async function GET(req: Request) {
  try {
    await getAuthenticatedUserId(req)
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
  } catch (error) {
    return handleAuthError(error)
  }
}

export async function POST(req: Request) {
  try {
    await getAuthenticatedUserId(req)
    const body = await req.json()
    const result = createUserSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: formatZodErrors(result.error) }, { status: 400 })
    }
    const { firstName, lastName1, lastName2, email, password } = result.data

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

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    return handleAuthError(error)
  }
}
