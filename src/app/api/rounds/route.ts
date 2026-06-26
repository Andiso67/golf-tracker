import { NextResponse } from 'next/server'
import { getAllRounds, createRound } from '@/lib/services/roundService'

export async function GET() {
  const rounds = await getAllRounds('local')
  return NextResponse.json(rounds)
}

export async function POST(req: Request) {
  const body = await req.json()
  const { playerId, courseName, courseId, teeColor, totalHoles, holes } = body
  const round = await createRound({
    playerId: playerId || 'local',
    courseName,
    courseId,
    teeColor,
    totalHoles,
    holes,
  })
  return NextResponse.json(round, { status: 201 })
}
