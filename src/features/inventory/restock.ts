export interface StockItem {
  id: string
  name: string
  unit: string
  quantity: number
  reorderLevel: number
  projectId: string
}

export interface OpenRequestLike {
  status: string
  items: { inventoryItemId?: string | null }[]
}

export interface RestockLine {
  inventoryItemId: string
  name: string
  unit: string
  quantity: number
}

export interface RestockGroup {
  projectId: string
  lines: RestockLine[]
}

/** Requests that already cover an item: on its way, so asking again would double-order. */
const OPEN_STATUSES = new Set(['pending', 'approved', 'ordered'])

/** Top an item back up to twice its reorder level — enough to get clear of the line, never less than one. */
export function restockQuantity(item: Pick<StockItem, 'quantity' | 'reorderLevel'>): number {
  return Math.max(1, Math.ceil(item.reorderLevel * 2 - item.quantity))
}

/** Stock at or below its reorder level (the same rule as the Low Stock badge and the dashboard). */
export const isLow = (item: Pick<StockItem, 'quantity' | 'reorderLevel'>) => item.quantity <= item.reorderLevel

/**
 * What to order: every low item that isn't already on an open request, grouped by project (a purchase request
 * belongs to one project). Groups and lines keep the order the items came in.
 */
export function restockPlan(items: StockItem[], requests: OpenRequestLike[] = []): RestockGroup[] {
  const covered = new Set<string>()
  for (const request of requests) {
    if (!OPEN_STATUSES.has(request.status)) continue
    for (const line of request.items) if (line.inventoryItemId) covered.add(line.inventoryItemId)
  }

  const groups = new Map<string, RestockGroup>()
  for (const item of items) {
    if (!isLow(item) || covered.has(item.id)) continue
    const group = groups.get(item.projectId) ?? { projectId: item.projectId, lines: [] }
    group.lines.push({ inventoryItemId: item.id, name: item.name, unit: item.unit, quantity: restockQuantity(item) })
    groups.set(item.projectId, group)
  }
  return [...groups.values()]
}

export const countLines = (plan: RestockGroup[]) => plan.reduce((sum, g) => sum + g.lines.length, 0)

/** "Restock — Prestige Towers (9 Oct)" */
export function restockTitle(projectName: string, now: Date): string {
  const day = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' }).format(now)
  return `Restock — ${projectName} (${day})`
}
