import { NextResponse } from 'next/server'
import {
  getAllCourses,
  createCourse,
} from '@/lib/services/courseService'

export async function GET() {
  const courses = await getAllCourses()
  return NextResponse.json(courses)
}

export async function POST(req: Request) {
  const body = await req.json()
  const { name, tees } = body
  if (!name || !tees) {
    return NextResponse.json(
      { error: 'Name and tees are required' },
      { status: 400 }
    )
  }
  const course = await createCourse(name, tees)
  return NextResponse.json(course, { status: 201 })
}
