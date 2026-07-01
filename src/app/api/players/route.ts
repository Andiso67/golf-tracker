import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthenticatedUserId, handleAuthError } from '@/lib/auth'
import { createPlayerSchema, formatZodErrors } from '@/lib/validations'

export async function GET(req: Request) {
  try {
    await getAuthenticatedUserId(req)
    const players = await prisma.player.findMany({
      orderBy: { firstName: 'asc' },
    })
    return NextResponse.json(players)
  } catch (error) {
    return handleAuthError(error)
  }
}

export async function PUT(req: Request) {
  try {
    await getAuthenticatedUserId(req)
    const body = await req.json()
    const result = createPlayerSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: formatZodErrors(result.error) }, { status: 400 })
    }
    const { id, email, firstName, lastName1, lastName2, handicap, homeCourse, licenseNumber } = result.data

    const data = {
      email: email || '',
      firstName,
      lastName1: lastName1 || '',
      lastName2: lastName2 || '',
      handicap: handicap ?? 0,
      homeCourse: homeCourse || '',
      licenseNumber: licenseNumber || '',
    }

    if (id) {
      const existing = await prisma.player.findUnique({ where: { id } })
      if (existing) {
        const updated = await prisma.player.update({ where: { id }, data })
        return NextResponse.json(updated)
      }
    }

    const created = await prisma.player.create({ data })
    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    return handleAuthError(error)
  }
}
