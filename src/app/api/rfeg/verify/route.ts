import { NextResponse } from 'next/server'
import { getAuthenticatedUserId, handleAuthError } from '@/lib/auth'
import { verifyLicenseSchema, formatZodErrors } from '@/lib/validations'

function decodeEntities(text: string): string {
  return text.replace(/&#(\d+);/g, (_, c) => String.fromCharCode(Number(c)))
}

function normalizeName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/\s+/g, ' ')
    .trim()
}

function parseRfegResponse(html: string, licenseNumber: string): { rfegName: string; handicap: string; estado: string; fecha: string } | null {
  const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/g
  const cells: string[] = []
  let m: RegExpExecArray | null
  while ((m = tdRegex.exec(html)) !== null) {
    const val = m[1]
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, '')
      .replace(/\u00A0/g, '')
      .trim()
    if (val) cells.push(decodeEntities(val))
  }

  const licIdx = cells.indexOf(licenseNumber)
  if (licIdx === -1 || licIdx < 1 || licIdx > cells.length - 3) return null

  return {
    rfegName: cells[licIdx - 1],
    handicap: cells[licIdx + 1].replace(',', '.'),
    estado: cells[licIdx + 2],
    fecha: cells[licIdx + 3],
  }
}

export async function POST(req: Request) {
  try {
    await getAuthenticatedUserId(req)
    const body = await req.json()
    const result = verifyLicenseSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: formatZodErrors(result.error) }, { status: 400 })
    }
    const { licenseNumber, firstName, lastName1, lastName2 } = result.data

    const res = await fetch(
      `https://rfegolf.es/PaginasServicios/ServicioHandicap.aspx?HLic=${encodeURIComponent(licenseNumber)}`,
      { signal: AbortSignal.timeout(10000) }
    )

    if (!res.ok) {
      return NextResponse.json({ error: 'RFEG server error' }, { status: 502 })
    }

    const html = await res.text()

    const parsed = parseRfegResponse(html, licenseNumber)
    if (!parsed) {
      return NextResponse.json({ error: 'License not found in RFEG', match: false }, { status: 404 })
    }

    const localFullName = normalizeName([firstName, lastName1 || '', lastName2 || ''].filter(Boolean).join(' '))
    const rfegFullName = normalizeName(parsed.rfegName)
    const match = localFullName === rfegFullName

    return NextResponse.json({
      match,
      rfegName: parsed.rfegName,
      handicap: parsed.handicap,
      estado: parsed.estado,
      fecha: parsed.fecha,
    })
  } catch (err) {
    if (err instanceof DOMException && err.name === 'TimeoutError') {
      return NextResponse.json({ error: 'RFEG request timed out' }, { status: 504 })
    }
    return NextResponse.json({ error: 'Failed to verify license' }, { status: 500 })
  }
}
