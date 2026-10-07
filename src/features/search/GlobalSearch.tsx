import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { clientsApi } from '@/features/clients/api'
import { contractsApi } from '@/features/contracts/api'
import { leadsApi } from '@/features/leads/api'
import { paymentsApi } from '@/features/payments/api'
import { projectsApi } from '@/features/projects/api'
import { tasksApi } from '@/features/tasks/api'
import { vendorsApi } from '@/features/vendors/api'
import { usePermission } from '@/lib/permissions'
import { KIND_LABEL, searchRecords, MIN_QUERY_LENGTH, type SearchHit, type SearchRecord } from './search'

/** Every list the search can read, fetched only once the box is used and only if the user may view it.
 * The query keys match the modules' own lists, so a list already loaded is reused, not fetched twice. */
function useSearchRecords(active: boolean): SearchRecord[] {
  const can = {
    projects: usePermission('projects', 'view'),
    clients: usePermission('clients', 'view'),
    leads: usePermission('leads', 'view'),
    tasks: usePermission('tasks', 'view'),
    payments: usePermission('payments', 'view'),
    contracts: usePermission('contracts', 'view'),
    vendors: usePermission('vendors', 'view'),
  }
  const on = (allowed: boolean) => active && allowed
  const projects = useQuery({ queryKey: ['projects'], queryFn: projectsApi.list, enabled: on(can.projects) })
  const clients = useQuery({ queryKey: ['clients'], queryFn: clientsApi.list, enabled: on(can.clients) })
  const leads = useQuery({ queryKey: ['leads'], queryFn: leadsApi.list, enabled: on(can.leads) })
  const tasks = useQuery({ queryKey: ['tasks'], queryFn: tasksApi.list, enabled: on(can.tasks) })
  const payments = useQuery({ queryKey: ['payments'], queryFn: paymentsApi.list, enabled: on(can.payments) })
  const contracts = useQuery({ queryKey: ['contracts'], queryFn: contractsApi.list, enabled: on(can.contracts) })
  const vendors = useQuery({ queryKey: ['vendors'], queryFn: vendorsApi.list, enabled: on(can.vendors) })

  return useMemo<SearchRecord[]>(
    () => [
      ...(projects.data ?? []).map((p) => ({ kind: 'project' as const, id: p.id, label: p.name, sublabel: `${p.code} · ${p.clientName}`, to: `/projects/${p.id}`, keywords: [p.code, p.clientName, p.location] })),
      ...(clients.data ?? []).map((c) => ({ kind: 'client' as const, id: c.id, label: c.name, sublabel: c.email, to: `/clients/${c.id}`, keywords: [c.email, c.phone] })),
      ...(leads.data ?? []).map((l) => ({ kind: 'lead' as const, id: l.id, label: l.name, sublabel: l.email || l.phone, to: '/leads', keywords: [l.email, l.phone] })),
      ...(tasks.data ?? []).map((t) => ({ kind: 'task' as const, id: t.id, label: t.title, to: '/tasks', keywords: [] })),
      ...(payments.data ?? []).map((p) => ({ kind: 'invoice' as const, id: p.id, label: p.invoiceNumber, sublabel: p.clientName, to: '/payments', keywords: [p.clientName] })),
      ...(contracts.data ?? []).map((c) => ({ kind: 'contract' as const, id: c.id, label: c.title, sublabel: c.party, to: '/contracts', keywords: [c.party] })),
      ...(vendors.data ?? []).map((v) => ({ kind: 'vendor' as const, id: v.id, label: v.name, sublabel: v.email, to: '/vendors', keywords: [v.email, v.phone] })),
    ],
    [projects.data, clients.data, leads.data, tasks.data, payments.data, contracts.data, vendors.data],
  )
}

/** The top-bar search: type to find projects, clients, leads, tasks, invoices, contracts and vendors. Ctrl/Cmd+K focuses it. */
interface GlobalSearchProps {
  /** 'bar' sits in the top bar and hides on phones; 'mobile' fills the width of the row shown under the top bar on phones. */
  variant?: 'bar' | 'mobile'
  /** Called after a result is chosen or Escape is pressed, so a phone overlay can close itself. */
  onDone?: () => void
}

export function GlobalSearch({ variant = 'bar', onDone }: GlobalSearchProps) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [used, setUsed] = useState(false)
  const [cursor, setCursor] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const records = useSearchRecords(used)
  const hits = useMemo(() => searchRecords(records, query), [records, query])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    const onClickAway = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onClickAway)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onClickAway)
    }
  }, [])

  const choose = (hit: SearchHit) => {
    setOpen(false)
    setQuery('')
    navigate(hit.to)
    onDone?.()
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpen(false)
      inputRef.current?.blur()
      onDone?.()
    } else if (e.key === 'ArrowDown' && hits.length > 0) {
      e.preventDefault()
      setCursor((c) => (c + 1) % hits.length)
    } else if (e.key === 'ArrowUp' && hits.length > 0) {
      e.preventDefault()
      setCursor((c) => (c - 1 + hits.length) % hits.length)
    } else if (e.key === 'Enter' && hits[cursor]) {
      e.preventDefault()
      choose(hits[cursor])
    }
  }

  const showPanel = open && query.trim().length >= MIN_QUERY_LENGTH

  return (
    <div ref={rootRef} className={variant === 'mobile' ? 'relative w-full' : 'relative hidden max-w-sm flex-1 sm:block'}>
      <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        ref={inputRef}
        autoFocus={variant === 'mobile'}
        value={query}
        placeholder="Search projects, leads, clients…  (Ctrl K)"
        className="pl-8"
        role="combobox"
        aria-expanded={showPanel}
        aria-label="Search"
        onChange={(e) => {
          setQuery(e.target.value)
          setCursor(0)
          setOpen(true)
        }}
        onFocus={() => {
          setUsed(true)
          setOpen(true)
        }}
        onKeyDown={onKeyDown}
      />
      {showPanel && (
        <div className="absolute left-0 right-0 top-full z-40 mt-1 max-h-96 overflow-y-auto rounded-md border border-border bg-popover p-1 shadow-lg" role="listbox">
          {hits.length === 0 ? (
            <p className="px-3 py-4 text-center text-sm text-muted-foreground">No matches for “{query.trim()}”.</p>
          ) : (
            hits.map((hit, i) => (
              <div key={`${hit.kind}-${hit.id}`}>
                {(i === 0 || hits[i - 1].kind !== hit.kind) && (
                  <p className="px-3 pb-1 pt-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">{KIND_LABEL[hit.kind]}</p>
                )}
                <button
                  role="option"
                  aria-selected={i === cursor}
                  className={`flex w-full flex-col rounded-sm px-3 py-1.5 text-left ${i === cursor ? 'bg-secondary' : 'hover:bg-secondary/60'}`}
                  onMouseEnter={() => setCursor(i)}
                  onClick={() => choose(hit)}
                >
                  <span className="truncate text-sm font-medium">{hit.label}</span>
                  {hit.sublabel && <span className="truncate text-xs text-muted-foreground">{hit.sublabel}</span>}
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
