import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword, getAuthenticatedUserId, handleAuthError } from '@/lib/auth'
import { updateUserSchema, formatZodErrors } from '@/lib/validations'

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await getAuthenticatedUserId(req)
    const { id } = await params
    const body = await req.json()
    const result = updateUserSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: formatZodErrors(result.error) }, { status: 400 })
    }
    const validated = result.data

    const existing = await prisma.user.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (validated.email && validated.email !== existing.email) {
      const emailTaken = await prisma.user.findUnique({ where: { email: validated.email } })
      if (emailTaken) {
        return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
      }
    }

    const userData: Record<string, unknown> = {}
    if (validated.firstName !== undefined) userData.firstName = validated.firstName
    if (validated.lastName1 !== undefined) userData.lastName1 = validated.lastName1
    if (validated.lastName2 !== undefined) userData.lastName2 = validated.lastName2
    if (validated.email !== undefined) userData.email = validated.email
    if (validated.password) userData.passwordHash = await hashPassword(validated.password)

    const updated = await prisma.user.update({
      where: { id },
      data: userData,
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

    return NextResponse.json(updated)
  } catch (error) {
    return handleAuthError(error)
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await getAuthenticatedUserId(req)
    const { id } = await params

    const existing = await prisma.user.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    await prisma.user.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleAuthError(error)
  }
}
