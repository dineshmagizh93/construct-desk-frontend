export interface DuplicateMatch {
  id: string
  name: string
  matchedOn: 'phone' | 'email' | 'phone and email'
}

const MAX_NAMES = 3

/** The sentence shown before creating a record that looks like one already on file. */
export function describeDuplicates(matches: DuplicateMatch[], noun: string): string {
  const shown = matches.slice(0, MAX_NAMES).map((m) => `${m.name} (same ${m.matchedOn})`)
  const more = matches.length - shown.length
  const list = shown.join(', ') + (more > 0 ? ` and ${more} more` : '')
  return `${matches.length === 1 ? `A ${noun} that looks like this one is` : `${matches.length} ${noun}s that look like this one are`} already on file: ${list}. Create it anyway?`
}
