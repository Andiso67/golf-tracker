import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import type { Player } from '@/types'

export async function GET() {
  const players = await prisma.player.findMany({
    orderBy: { firstName: 'asc' },
  })
  return NextResponse.json(players)
}

export async function PUT(req: Request) {
  const body: Player = await req.json()
  const { id, email, firstName, lastName1, lastName2, handicap, homeCourse, licenseNumber } = body

  if (!firstName) {
    return NextResponse.json({ error: 'firstName is required' }, { status: 400 })
  }

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
}
