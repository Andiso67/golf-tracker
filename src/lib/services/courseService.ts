import { prisma } from '@/lib/db'
import type { SavedCourse, CourseTee } from '@/types'

export async function getAllCourses(): Promise<SavedCourse[]> {
  const courses = await prisma.course.findMany({
    include: { tees: true },
    orderBy: { createdAt: 'desc' },
  })
  return courses.map(mapCourse)
}

export async function getCourse(id: string): Promise<SavedCourse | null> {
  const course = await prisma.course.findUnique({
    where: { id },
    include: { tees: true },
  })
  if (!course) return null
  return mapCourse(course)
}

export async function createCourse(
  name: string,
  tees: CourseTee[],
  imageUrl?: string
): Promise<SavedCourse> {
  const course = await prisma.course.create({
    data: {
      name,
      imageUrl: imageUrl || '',
      tees: {
        create: tees.map((t) => ({
          name: t.name,
          rating: t.rating,
          slope: t.slope,
          totalHoles: t.totalHoles,
          pars: t.pars,
        })),
      },
    },
    include: { tees: true },
  })
  return mapCourse(course)
}

export async function updateCourse(
  id: string,
  data: { name?: string; imageUrl?: string; tees?: CourseTee[] }
): Promise<SavedCourse | null> {
  if (data.tees) {
    await prisma.tee.deleteMany({ where: { courseId: id } })
    await prisma.tee.createMany({
      data: data.tees.map((t) => ({
        courseId: id,
        name: t.name,
        rating: t.rating,
        slope: t.slope,
        totalHoles: t.totalHoles,
        pars: t.pars,
      })),
    })
  }
  const updateData: Record<string, any> = {}
  if (data.name !== undefined) updateData.name = data.name
  if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl
  const course = await prisma.course.update({
    where: { id },
    data: updateData,
    include: { tees: true },
  })
  return mapCourse(course)
}

export async function deleteCourse(id: string): Promise<void> {
  await prisma.course.delete({ where: { id } })
}

export async function importCoursesFromJson(
  jsonData: string
): Promise<number> {
  let imported = 0
  try {
    const data = JSON.parse(jsonData)
    const list = data.courses || []
    const existing = await prisma.course.findMany({
      select: { name: true },
    })
    const existingNames = new Set(
      existing.map((c) => c.name.toLowerCase().trim())
    )

    for (const item of list) {
      const name = item.n || item.name
      const key = name.toLowerCase().trim()
      if (existingNames.has(key)) continue

      const tees: CourseTee[] = (item.t || item.tees || []).map((t: any) => ({
        name: t.n || t.name || '',
        rating: t.r ?? t.rating ?? 0,
        slope: t.s ?? t.slope ?? 0,
        totalHoles: t.h ?? t.totalHoles ?? (t.p ? t.p.length : 18),
        pars: [...(t.p || t.pars || [])],
      }))

      if (tees.length === 0) continue

      const course = await prisma.course.create({
        data: {
          id: `rfeg_${item.id}`,
          name,
        },
      })

      await prisma.tee.createMany({
        data: tees.map((t) => ({
          courseId: course.id,
          name: t.name,
          rating: t.rating,
          slope: t.slope,
          totalHoles: t.totalHoles,
          pars: t.pars,
        })),
        skipDuplicates: true,
      })
      existingNames.add(key)
      imported++
    }
  } catch (e) {
    console.error('Failed to import courses:', e)
  }
  return imported
}

function mapCourse(course: any): SavedCourse {
  return {
    id: course.id,
    name: course.name,
    imageUrl: course.imageUrl || '',
    tees: course.tees.map((t: any) => ({
      name: t.name,
      rating: t.rating,
      slope: t.slope,
      totalHoles: t.totalHoles as 9 | 18,
      pars: t.pars as number[],
    })),
    createdAt: course.createdAt.toISOString(),
  }
}
