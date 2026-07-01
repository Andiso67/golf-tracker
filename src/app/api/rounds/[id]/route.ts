import { NextResponse } from 'next/server'
import { getRound, deleteRound } from '@/lib/services/roundService'
import { getAuthenticatedUserId, handleAuthError } from '@/lib/auth'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await getAuthenticatedUserId(req)
    const { id } = await params
    const round = await getRound(id)
    if (!round) {
      return NextResponse.json({ error: 'Round not found' }, { status: 404 })
    }
    return NextResponse.json(round)
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
    const round = await getRound(id)
    if (!round) {
      return NextResponse.json({ error: 'Round not found' }, { status: 404 })
    }
    await deleteRound(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return handleAuthError(error)
  }
}
