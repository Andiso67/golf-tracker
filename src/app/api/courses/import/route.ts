import { NextResponse } from 'next/server'
import { importCoursesFromJson } from '@/lib/services/courseService'
import { promises as fs } from 'node:fs'
import path from 'node:path'

export async function POST() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'courses-es.json')
    const text = await fs.readFile(filePath, 'utf-8')
    const count = await importCoursesFromJson(text)
    return NextResponse.json({ imported: count })
  } catch {
    return NextResponse.json(
      { error: 'Failed to import courses' },
      { status: 500 }
    )
  }
}
