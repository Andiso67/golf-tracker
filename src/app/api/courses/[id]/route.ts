import { NextResponse } from 'next/server'
import { updateCourse, deleteCourse, getCourse } from '@/lib/services/courseService'

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
  const { id } = await params
  const body = await req.json()
  const updated = await updateCourse(id, body)
  if (!updated) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 })
  }
  return NextResponse.json(updated)
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await deleteCourse(id)
  return NextResponse.json({ success: true })
}
