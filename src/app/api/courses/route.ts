import { NextResponse } from 'next/server'
import {
  getAllCourses,
  createCourse,
} from '@/lib/services/courseService'
import { getAuthenticatedUserId, handleAuthError } from '@/lib/auth'
import { createCourseSchema, formatZodErrors } from '@/lib/validations'

export async function GET() {
  const courses = await getAllCourses()
  return NextResponse.json(courses)
}

export async function POST(req: Request) {
  try {
    await getAuthenticatedUserId(req)
    const body = await req.json()
    const result = createCourseSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: formatZodErrors(result.error) }, { status: 400 })
    }
    const { name, tees, imageUrl } = result.data
    const course = await createCourse(name, tees, imageUrl)
    return NextResponse.json(course, { status: 201 })
  } catch (error) {
    return handleAuthError(error)
  }
}
