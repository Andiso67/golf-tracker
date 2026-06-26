import { prisma } from '@/lib/db'
import type { HandicapEntry } from '@/types'

export async function getHandicapHistory(
  playerId: string
): Promise<HandicapEntry[]> {
  const entries = await prisma.handicapEntry.findMany({
    where: { playerId },
    orderBy: { date: 'asc' },
  })
  return entries.map((e) => ({
    date: e.date.toISOString(),
    handicap: e.handicap,
  }))
}

export async function addHandicapEntry(
  playerId: string,
  handicap: number,
  date?: Date
): Promise<HandicapEntry> {
  const entry = await prisma.handicapEntry.create({
    data: {
      playerId,
      handicap,
      date: date ?? new Date(),
    },
  })
  return {
    date: entry.date.toISOString(),
    handicap: entry.handicap,
  }
}
