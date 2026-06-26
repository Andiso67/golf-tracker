import { NextResponse } from 'next/server'
import { getOrCreatePlayer, updatePlayer } from '@/lib/services/playerService'

export async function GET() {
  const player = await getOrCreatePlayer({
    firstName: 'Golfer',
    lastName1: '',
    lastName2: '',
    handicap: 0,
    homeCourse: 'Local Course',
    licenseNumber: '',
  })
  return NextResponse.json(player)
}

export async function PUT(req: Request) {
  const body = await req.json()
  const { id, firstName, lastName1, lastName2, handicap, homeCourse, licenseNumber } = body
  if (!id) {
    const player = await getOrCreatePlayer({ firstName, lastName1, lastName2, handicap, homeCourse, licenseNumber })
    return NextResponse.json(player)
  }
  const updated = await updatePlayer(id, { firstName, lastName1, lastName2, handicap, homeCourse, licenseNumber })
  if (!updated) {
    return NextResponse.json({ error: 'Player not found' }, { status: 404 })
  }
  return NextResponse.json(updated)
}
