import { NextResponse } from 'next/server'
import { updateHole } from '@/lib/services/roundService'
import type { HoleData } from '@/types'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; number: string }> }
) {
  const { id, number } = await params
  const body = (await req.json()) as Partial<HoleData>
  await updateHole(id, parseInt(number), body)
  return NextResponse.json({ success: true })
}
