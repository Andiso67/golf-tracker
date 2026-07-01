import { NextResponse } from 'next/server'
import { updateHole } from '@/lib/services/roundService'
import { getAuthenticatedUserId, handleAuthError } from '@/lib/auth'
import { updateHoleSchema, formatZodErrors } from '@/lib/validations'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; number: string }> }
) {
  try {
    await getAuthenticatedUserId(req)
    const { id, number } = await params
    const body = await req.json()
    const result = updateHoleSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: formatZodErrors(result.error) }, { status: 400 })
    }
    await updateHole(id, parseInt(number), result.data)
    return NextResponse.json({ success: true })
  } catch (error) {
    return handleAuthError(error)
  }
}
