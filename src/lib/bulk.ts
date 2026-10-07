export interface BulkResult {
  succeeded: number
  failed: { id: string; message: string }[]
}

/**
 * Runs one action per id, one after another (so the server is never hit with a burst, and the first
 * failure doesn't stop the rest). Returns how many worked and which failed, with the reason.
 */
export async function runBulk(ids: string[], action: (id: string) => Promise<unknown> | void): Promise<BulkResult> {
  const result: BulkResult = { succeeded: 0, failed: [] }
  for (const id of ids) {
    try {
      await action(id)
      result.succeeded += 1
    } catch (error) {
      result.failed.push({ id, message: error instanceof Error ? error.message : 'Failed' })
    }
  }
  return result
}

/** A toast-ready summary: "3 leads deleted" or "2 of 3 leads deleted — 1 could not be changed (…)". */
export function bulkSummary(result: BulkResult, verbPast: string, noun: string): { title: string; description?: string; failed: boolean } {
  const total = result.succeeded + result.failed.length
  const plural = (n: number) => `${n} ${noun}${n === 1 ? '' : 's'}`
  if (result.failed.length === 0) return { title: `${plural(result.succeeded)} ${verbPast}`, failed: false }
  const reasons = [...new Set(result.failed.map((f) => f.message))].slice(0, 2).join('; ')
  return {
    title: result.succeeded === 0 ? `Could not change any of the ${plural(total)}` : `${result.succeeded} of ${plural(total)} ${verbPast}`,
    description: `${result.failed.length} could not be changed: ${reasons}`,
    failed: true,
  }
}
