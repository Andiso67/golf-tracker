import { NextResponse } from 'next/server'
import { completeRound } from '@/lib/services/roundService'
import { addHandicapEntry } from '@/lib/services/handicapService'
import { calculateRoundStats } from '@/lib/stats'
import { getRound } from '@/lib/services/roundService'

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const round = await getRound(id)
  if (!round) {
    return NextResponse.json({ error: 'Round not found' }, { status: 404 })
  }

  const stats = calculateRoundStats(round.players, round.gameMode)
  const hcp = Math.round(((stats.playerStats[0]?.scoreToPar || 0) * 0.96) * 10) / 10

  await completeRound(id)
  await addHandicapEntry(round.players[0]?.playerId || 'local', hcp, new Date(round.date))

  return NextResponse.json({ success: true })
}
