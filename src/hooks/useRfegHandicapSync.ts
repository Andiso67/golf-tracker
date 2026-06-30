'use client'

import { useEffect, useRef, useState } from 'react'
import { useStore } from '@/store/useStore'
import type { Player } from '@/types'

export type SyncStatus = 'idle' | 'checking' | 'updated' | 'nomatch' | 'error' | 'nolicense'

export function useRfegHandicapSync(player: Player | null): SyncStatus {
  const updatePlayer = useStore((s) => s.updatePlayer)
  const [status, setStatus] = useState<SyncStatus>('idle')
  const syncedRef = useRef<string | null>(null)

  useEffect(() => {
    if (!player || !player.licenseNumber) {
      setStatus('nolicense')
      return
    }

    if (syncedRef.current === player.id) {
      setStatus('idle')
      return
    }
    syncedRef.current = player.id

    let cancelled = false
    setStatus('checking')

    fetch('/api/rfeg/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        licenseNumber: player.licenseNumber,
        firstName: player.firstName,
        lastName1: player.lastName1,
        lastName2: player.lastName2,
      }),
    })
      .then(async (res) => {
        if (cancelled) return
        if (res.status === 404) {
          setStatus('nomatch')
          return
        }
        if (!res.ok) {
          setStatus('error')
          return
        }
        const data = await res.json()
        if (cancelled) return

        if (!data.match) {
          setStatus('nomatch')
          return
        }

        const rfegHandicap = parseFloat(data.handicap.replace(',', '.'))
        if (isNaN(rfegHandicap)) {
          setStatus('error')
          return
        }

        if (Math.abs(player.handicap - rfegHandicap) > 0.01) {
          updatePlayer({ handicap: rfegHandicap })
          setStatus('updated')
        } else {
          setStatus('idle')
        }
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })

    return () => {
      cancelled = true
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [player?.id, player?.licenseNumber, player?.firstName, player?.lastName1, player?.lastName2])

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (status === 'updated' || status === 'error') {
      timerRef.current = setTimeout(() => setStatus('idle'), status === 'updated' ? 5000 : 3000)
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [status])

  return status
}
