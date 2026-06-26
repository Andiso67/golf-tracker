import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword } from '@/lib/auth'

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()

  const existing = await prisma.user.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  if (body.email && body.email !== existing.email) {
    const emailTaken = await prisma.user.findUnique({ where: { email: body.email } })
    if (emailTaken) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
    }
  }

  const userData: Record<string, unknown> = {}
  if (body.firstName !== undefined) userData.firstName = body.firstName
  if (body.lastName1 !== undefined) userData.lastName1 = body.lastName1
  if (body.lastName2 !== undefined) userData.lastName2 = body.lastName2
  if (body.email !== undefined) userData.email = body.email
  if (body.password) userData.passwordHash = await hashPassword(body.password)

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

  if (body.firstName || body.lastName1 || body.lastName2) {
    await prisma.player.updateMany({
      where: { userId: id },
      data: {
        ...(body.firstName !== undefined && { firstName: body.firstName }),
        ...(body.lastName1 !== undefined && { lastName1: body.lastName1 }),
        ...(body.lastName2 !== undefined && { lastName2: body.lastName2 }),
      },
    })
  }

  return NextResponse.json(updated)
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const existing = await prisma.user.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  await prisma.user.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
