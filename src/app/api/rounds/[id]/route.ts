import { NextResponse } from 'next/server'
import { getRound, deleteRound } from '@/lib/services/roundService'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const round = await getRound(id)
  if (!round) {
    return NextResponse.json({ error: 'Round not found' }, { status: 404 })
  }
  return NextResponse.json(round)
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const round = await getRound(id)
  if (!round) {
    return NextResponse.json({ error: 'Round not found' }, { status: 404 })
  }
  await deleteRound(id)
  return NextResponse.json({ success: true })
}
