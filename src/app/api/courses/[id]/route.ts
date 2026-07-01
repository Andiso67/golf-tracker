import { NextResponse } from 'next/server'
import { updateCourse, deleteCourse, getCourse } from '@/lib/services/courseService'
import { getAuthenticatedUserId, handleAuthError } from '@/lib/auth'
import { updateCourseSchema, formatZodErrors } from '@/lib/validations'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const course = await getCourse(id)
  if (!course) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 })
  }
  return NextResponse.json(course)
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await getAuthenticatedUserId(req)
    const { id } = await params
    const body = await req.json()
    const result = updateCourseSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: formatZodErrors(result.error) }, { status: 400 })
    }
    const updated = await updateCourse(id, result.data)
    if (!updated) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }
    return NextResponse.json(updated)
  } catch (error) {
    return handleAuthError(error)
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await getAuthenticatedUserId(req)
    const { id } = await params
    await deleteCourse(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return handleAuthError(error)
  }
}
