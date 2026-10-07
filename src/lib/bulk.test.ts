import { describe, expect, it } from 'vitest'
import { bulkSummary, runBulk } from './bulk'

describe('runBulk', () => {
  it('runs every id in order and counts the successes', async () => {
    const seen: string[] = []
    const result = await runBulk(['a', 'b', 'c'], async (id) => {
      seen.push(id)
    })
    expect(seen).toEqual(['a', 'b', 'c'])
    expect(result).toEqual({ succeeded: 3, failed: [] })
  })

  it('carries on after a failure and reports it with its reason', async () => {
    const result = await runBulk(['a', 'b', 'c'], async (id) => {
      if (id === 'b') throw new Error('Linked to other records')
    })
    expect(result.succeeded).toBe(2)
    expect(result.failed).toEqual([{ id: 'b', message: 'Linked to other records' }])
  })

  it('does one at a time, never in parallel', async () => {
    let running = 0
    let peak = 0
    await runBulk(['a', 'b', 'c', 'd'], async () => {
      running += 1
      peak = Math.max(peak, running)
      await new Promise((r) => setTimeout(r, 1))
      running -= 1
    })
    expect(peak).toBe(1)
  })

  it('copes with nothing to do', async () => {
    expect(await runBulk([], async () => undefined)).toEqual({ succeeded: 0, failed: [] })
  })
})

describe('bulkSummary', () => {
  it('words a clean run', () => {
    expect(bulkSummary({ succeeded: 3, failed: [] }, 'deleted', 'lead')).toEqual({ title: '3 leads deleted', failed: false })
    expect(bulkSummary({ succeeded: 1, failed: [] }, 'updated', 'task')).toEqual({ title: '1 task updated', failed: false })
  })

  it('words a partial run with the distinct reasons', () => {
    const summary = bulkSummary(
      { succeeded: 2, failed: [{ id: 'x', message: 'In use' }, { id: 'y', message: 'In use' }] },
      'deleted',
      'vendor',
    )
    expect(summary).toEqual({ title: '2 of 4 vendors deleted', description: '2 could not be changed: In use', failed: true })
  })

  it('words a total failure', () => {
    expect(bulkSummary({ succeeded: 0, failed: [{ id: 'x', message: 'Nope' }] }, 'deleted', 'task').title).toBe('Could not change any of the 1 task')
  })
})
