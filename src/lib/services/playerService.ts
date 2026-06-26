import { prisma } from '@/lib/db'
import type { Player } from '@/types'

export async function getPlayer(id: string): Promise<Player | null> {
  const p = await prisma.player.findUnique({ where: { id } })
  if (!p) return null
  return {
    id: p.id,
    name: p.name,
    handicap: p.handicap,
    homeCourse: p.homeCourse,
  }
}

export async function getOrCreatePlayer(data: {
  id?: string
  name: string
  handicap: number
  homeCourse: string
}): Promise<Player> {
  if (data.id) {
    const existing = await prisma.player.findUnique({ where: { id: data.id } })
    if (existing) {
      const updated = await prisma.player.update({
        where: { id: data.id },
        data: {
          name: data.name,
          handicap: data.handicap,
          homeCourse: data.homeCourse,
        },
      })
      return {
        id: updated.id,
        name: updated.name,
        handicap: updated.handicap,
        homeCourse: updated.homeCourse,
      }
    }
  }
  const created = await prisma.player.create({
    data: {
      name: data.name,
      handicap: data.handicap,
      homeCourse: data.homeCourse,
    },
  })
  return {
    id: created.id,
    name: created.name,
    handicap: created.handicap,
    homeCourse: created.homeCourse,
  }
}

export async function updatePlayer(
  id: string,
  data: Partial<Pick<Player, 'name' | 'handicap' | 'homeCourse'>>
): Promise<Player | null> {
  const updated = await prisma.player.update({
    where: { id },
    data,
  })
  return {
    id: updated.id,
    name: updated.name,
    handicap: updated.handicap,
    homeCourse: updated.homeCourse,
  }
}
