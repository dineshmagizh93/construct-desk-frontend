import { useCallback, useRef, useState } from 'react'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { http } from '@/lib/http'
import { describeDuplicates, type DuplicateMatch } from './describe'

interface Pending {
  matches: DuplicateMatch[]
}

/**
 * Asks "this looks like one you already have — create it anyway?" before a new lead or client is saved.
 * `confirmCreate(values)` resolves true to go ahead; false means the person backed out, so the caller
 * should throw to keep the form open. If the check itself fails the save is allowed: a missing warning
 * must never stop someone adding a record.
 */
export function useDuplicateGuard(entity: 'leads' | 'clients', noun: string) {
  const [pending, setPending] = useState<Pending | null>(null)
  const resolver = useRef<((go: boolean) => void) | null>(null)

  const settle = useCallback((go: boolean) => {
    resolver.current?.(go)
    resolver.current = null
    setPending(null)
  }, [])

  const confirmCreate = useCallback(
    async (values: Record<string, unknown>): Promise<boolean> => {
      let matches: DuplicateMatch[] = []
      try {
        matches = await http<DuplicateMatch[]>(`/${entity}/duplicates`, { method: 'POST', body: JSON.stringify({ phone: values.phone, email: values.email }) })
      } catch {
        return true
      }
      if (matches.length === 0) return true
      return new Promise<boolean>((resolve) => {
        resolver.current = resolve
        setPending({ matches })
      })
    },
    [entity],
  )

  const dialog = (
    <ConfirmDialog
      open={pending !== null}
      onOpenChange={(open) => {
        if (!open) settle(false)
      }}
      title={`Possible duplicate ${noun}`}
      description={pending ? describeDuplicates(pending.matches, noun) : undefined}
      confirmLabel="Create anyway"
      destructive={false}
      onConfirm={() => settle(true)}
    />
  )

  return { confirmCreate, dialog }
}
