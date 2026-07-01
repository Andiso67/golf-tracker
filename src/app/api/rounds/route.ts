import { NextResponse } from 'next/server'
import { getAllRounds, createRound } from '@/lib/services/roundService'
import { getAuthenticatedUserId, handleAuthError } from '@/lib/auth'
import { createRoundSchema, formatZodErrors } from '@/lib/validations'

export async function GET(req: Request) {
  try {
    await getAuthenticatedUserId(req)
    const rounds = await getAllRounds()
    return NextResponse.json(rounds)
  } catch (error) {
    return handleAuthError(error)
  }
}

export async function POST(req: Request) {
  try {
    await getAuthenticatedUserId(req)
    const body = await req.json()
    const result = createRoundSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: formatZodErrors(result.error) }, { status: 400 })
    }
    const { playerId, courseName, courseId, teeColor, totalHoles, holes, gameMode } = result.data
    const round = await createRound({
      playerId: playerId || 'local',
      courseName,
      courseId,
      teeColor,
      totalHoles,
      holes,
      gameMode: gameMode || 'stroke-play',
    })
    return NextResponse.json(round, { status: 201 })
  } catch (error) {
    return handleAuthError(error)
  }
}
