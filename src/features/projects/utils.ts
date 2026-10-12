import type { Project } from './types'

const DEFAULT_PREFIX = 'PRJ'
/** Legal-form words that say nothing about which company it is. */
const NAME_NOISE = new Set(['pvt', 'private', 'ltd', 'limited', 'llp', 'inc', 'co', 'company', 'corp', 'and', 'the', 'of'])

/**
 * The prefix a company's project codes carry: its initials ("Magizh Construction Pvt Ltd" -> MC, up to three letters),
 * or the first three letters of a one-word name. Falls back to PRJ when the name has no usable Latin letters.
 * The server allocates codes on conversion with the same rule (backend shared/leadConversion.ts); keep them in step.
 */
export function projectCodePrefix(companyName: string | null | undefined): string {
  const words = (companyName ?? '')
    .split(/[^A-Za-z0-9]+/)
    .filter((word) => /^[A-Za-z]/.test(word) && !NAME_NOISE.has(word.toLowerCase()))
  if (words.length === 0) return DEFAULT_PREFIX
  const prefix = words.length === 1 ? words[0].slice(0, 3) : words.slice(0, 3).map((word) => word[0]).join('')
  return prefix.toUpperCase()
}

/** The next code in the company's sequence ("MC-011"): one more than the highest existing number with this prefix. */
export function nextProjectCode(projects: Pick<Project, 'code'>[], prefix: string = DEFAULT_PREFIX) {
  const pattern = new RegExp(`^${prefix}-(\\d+)$`, 'i')
  let highest = 0
  let width = 3
  for (const { code } of projects) {
    const match = pattern.exec(code.trim())
    if (!match) continue
    highest = Math.max(highest, Number(match[1]))
    width = Math.max(width, match[1].length)
  }
  return `${prefix}-${String(highest + 1).padStart(width, '0')}`
}
