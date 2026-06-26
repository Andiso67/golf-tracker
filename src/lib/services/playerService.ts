import { prisma } from '@/lib/db'
import type { Player } from '@/types'

function mapPlayer(p: any): Player {
  return {
    id: p.id,
    firstName: p.firstName,
    lastName1: p.lastName1 || '',
    lastName2: p.lastName2 || '',
    handicap: p.handicap,
    homeCourse: p.homeCourse,
    licenseNumber: p.licenseNumber || '',
  }
}

export async function getPlayer(id: string): Promise<Player | null> {
  const p = await prisma.player.findUnique({ where: { id } })
  if (!p) return null
  return mapPlayer(p)
}

export async function getOrCreatePlayer(data: {
  id?: string
  firstName: string
  lastName1?: string
  lastName2?: string
  handicap: number
  homeCourse: string
  licenseNumber?: string
}): Promise<Player> {
  if (data.id) {
    const existing = await prisma.player.findUnique({ where: { id: data.id } })
    if (existing) {
      const updated = await prisma.player.update({
        where: { id: data.id },
        data: {
          firstName: data.firstName,
          lastName1: data.lastName1 || '',
          lastName2: data.lastName2 || '',
          handicap: data.handicap,
          homeCourse: data.homeCourse,
          licenseNumber: data.licenseNumber || '',
        },
      })
      return mapPlayer(updated)
    }
  }
  const created = await prisma.player.create({
    data: {
      firstName: data.firstName,
      lastName1: data.lastName1 || '',
      lastName2: data.lastName2 || '',
      handicap: data.handicap,
      homeCourse: data.homeCourse,
      licenseNumber: data.licenseNumber || '',
    },
  })
  return mapPlayer(created)
}

export async function updatePlayer(
  id: string,
  data: Partial<Pick<Player, 'firstName' | 'lastName1' | 'lastName2' | 'handicap' | 'homeCourse' | 'licenseNumber'>>
): Promise<Player | null> {
  const updated = await prisma.player.update({
    where: { id },
    data,
  })
  return mapPlayer(updated)
}
