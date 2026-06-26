import { NextResponse } from 'next/server'
import { getOrCreatePlayer, updatePlayer } from '@/lib/services/playerService'

export async function GET() {
  const player = await getOrCreatePlayer({
    name: 'Golfer',
    handicap: 0,
    homeCourse: 'Local Course',
  })
  return NextResponse.json(player)
}

export async function PUT(req: Request) {
  const body = await req.json()
  const { id, name, handicap, homeCourse } = body
  if (!id) {
    const player = await getOrCreatePlayer({ name, handicap, homeCourse })
    return NextResponse.json(player)
  }
  const updated = await updatePlayer(id, { name, handicap, homeCourse })
  if (!updated) {
    return NextResponse.json({ error: 'Player not found' }, { status: 404 })
  }
  return NextResponse.json(updated)
}
