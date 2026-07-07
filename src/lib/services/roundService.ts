import { prisma } from '@/lib/db'
import type { Round, RoundPlayer, HoleData } from '@/types'
import type { Prisma } from '@/generated/prisma/client'

const puttDistanceToDb = {
  '<1': 'LT_1' as const,
  '1-2': 'R_1_2' as const,
  '2-4': 'R_2_4' as const,
  '4-8': 'R_4_8' as const,
  '+8': 'GT_8' as const,
}

const puttDistanceFromDb: Record<string, HoleData['puttDistance']> = {
  LT_1: '<1',
  R_1_2: '1-2',
  R_2_4: '2-4',
  R_4_8: '4-8',
  GT_8: '+8',
}

function holeWithoutRound(
  h: HoleData
): Prisma.HoleCreateWithoutRoundInput {
  return {
    number: h.number,
    par: h.par,
    score: h.score,
    fairwayHit: h.fairwayHit as any,
    gir: h.gir,
    girDirection: h.girDirection as any,
    putts: h.putts,
    puttDistance: h.puttDistance
      ? (puttDistanceToDb[h.puttDistance] as any)
      : null,
    penalties: h.penalties,
    sandSave: h.sandSave,
    approach: h.approach,
    drivingDistance: h.drivingDistance,
  }
}

function holeFromDb(h: any): HoleData {
  return {
    number: h.number,
    par: h.par,
    score: h.score,
    fairwayHit: h.fairwayHit as HoleData['fairwayHit'],
    gir: h.gir,
    girDirection: h.girDirection as HoleData['girDirection'],
    putts: h.putts,
    puttDistance: h.puttDistance
      ? (puttDistanceFromDb[h.puttDistance] as HoleData['puttDistance'])
      : null,
    penalties: h.penalties,
    sandSave: h.sandSave,
    approach: h.approach,
    drivingDistance: h.drivingDistance,
  }
}

export async function getAllRounds(playerId?: string): Promise<Round[]> {
  const rounds = await prisma.round.findMany({
    where: playerId ? { playerId } : undefined,
    include: { holes: { orderBy: { number: 'asc' } } },
    orderBy: { date: 'desc' },
  })
  return rounds.map(mapRound)
}

export async function getRound(id: string): Promise<Round | null> {
  const round = await prisma.round.findUnique({
    where: { id },
    include: { holes: { orderBy: { number: 'asc' } } },
  })
  if (!round) return null
  return mapRound(round)
}

export async function createRound(data: {
  playerId?: string
  players?: RoundPlayer[]
  courseName: string
  courseId?: string
  teeColor: string
  totalHoles: 9 | 18
  holes?: HoleData[]
  gameMode?: string
}): Promise<Round> {
  const firstPlayer = data.players?.[0];
  const round = await prisma.round.create({
    data: {
      playerId: firstPlayer?.playerId || data.playerId || 'local',
      courseName: data.courseName,
      courseId: data.courseId,
      teeColor: data.teeColor,
      gameMode: data.gameMode || 'stroke-play',
      totalHoles: data.totalHoles,
      holes: {
        create: (firstPlayer?.holes || data.holes || []).map(holeWithoutRound),
      },
    },
    include: { holes: { orderBy: { number: 'asc' } } },
  })
  return mapRound(round)
}

export async function updateHole(
  roundId: string,
  holeNumber: number,
  data: Partial<HoleData>
): Promise<void> {
  const updateData: Record<string, unknown> = {}
  if (data.score !== undefined) updateData.score = data.score
  if (data.fairwayHit !== undefined)
    updateData.fairwayHit = data.fairwayHit
  if (data.gir !== undefined) updateData.gir = data.gir
  if (data.putts !== undefined) updateData.putts = data.putts
  if (data.puttDistance !== undefined)
    updateData.puttDistance = data.puttDistance
      ? puttDistanceToDb[data.puttDistance]
      : null
  if (data.penalties !== undefined) updateData.penalties = data.penalties
  if (data.sandSave !== undefined) updateData.sandSave = data.sandSave
  if (data.approach !== undefined) updateData.approach = data.approach
  if (data.drivingDistance !== undefined)
    updateData.drivingDistance = data.drivingDistance

  await prisma.hole.updateMany({
    where: { roundId, number: holeNumber },
    data: updateData as any,
  })
}

export async function completeRound(roundId: string): Promise<void> {
  await prisma.round.update({
    where: { id: roundId },
    data: { completed: true },
  })
}

export async function deleteRound(roundId: string): Promise<void> {
  await prisma.round.delete({ where: { id: roundId } })
}

export async function getActiveRound(
  playerId: string
): Promise<Round | null> {
  const round = await prisma.round.findFirst({
    where: { playerId, completed: false },
    include: { holes: { orderBy: { number: 'asc' } } },
    orderBy: { date: 'desc' },
  })
  if (!round) return null
  return mapRound(round)
}

function mapRound(round: any): Round {
  return {
    id: round.id,
    players: round.players
      ? round.players.map((p: any) => ({
          playerId: p.playerId || p.id,
          playerName: p.playerName || 'Player',
          handicap: p.handicap || 0,
          holes: (p.holes || round.holes || []).map(holeFromDb),
          team: p.team,
        }))
      : [{
          playerId: round.playerId || 'local',
          playerName: 'Player',
          handicap: 0,
          holes: (round.holes || []).map(holeFromDb),
        }],
    courseName: round.courseName,
    courseId: round.courseId ?? undefined,
    teeColor: round.teeColor,
    gameMode: (round.gameMode as Round['gameMode']) || 'stroke-play',
    date: round.date.toISOString(),
    totalHoles: round.totalHoles as 9 | 18,
    completed: round.completed,
  }
}
