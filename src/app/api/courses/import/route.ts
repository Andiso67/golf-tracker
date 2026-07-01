import { NextResponse } from 'next/server'
import { importCoursesFromJson } from '@/lib/services/courseService'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { getAuthenticatedUserId, handleAuthError } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    await getAuthenticatedUserId(req)
    const filePath = path.join(process.cwd(), 'public', 'courses-es.json')
    const text = await fs.readFile(filePath, 'utf-8')
    const count = await importCoursesFromJson(text)
    return NextResponse.json({ imported: count })
  } catch (error) {
    const authResponse = handleAuthError(error)
    if (authResponse.status === 401) return authResponse
    return NextResponse.json(
      { error: 'Failed to import courses' },
      { status: 500 }
    )
  }
}
