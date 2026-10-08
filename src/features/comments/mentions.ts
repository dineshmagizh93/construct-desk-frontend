export interface Mentionable {
  id: string
  name: string
}

export interface Segment {
  text: string
  /** The teammate this piece of text tags, when it is an @mention. */
  mention?: Mentionable
}

const isWordChar = (char: string | undefined) => !!char && /[\p{L}\p{N}_]/u.test(char)

/**
 * Splits a comment into plain text and @mentions of known teammates ("@Priya Nair"). A mention is "@" plus a
 * full name, matched without regard to case, and must not run on into another word ("@Raj" is not inside
 * "@Rajesh Kumar"). Longer names are matched first so "@Raj Kumar" is not read as "@Raj" plus text.
 */
export function segmentBody(body: string, people: Mentionable[]): Segment[] {
  const lowered = body.toLowerCase()
  const candidates = people.filter((p) => p.name.trim()).sort((a, b) => b.name.length - a.name.length)
  const found: { start: number; end: number; person: Mentionable }[] = []

  for (const person of candidates) {
    const needle = `@${person.name.trim().toLowerCase()}`
    let from = 0
    for (;;) {
      const start = lowered.indexOf(needle, from)
      if (start === -1) break
      const end = start + needle.length
      const overlaps = found.some((f) => start < f.end && end > f.start)
      if (!overlaps && !isWordChar(lowered[end]) && !isWordChar(lowered[start - 1])) found.push({ start, end, person })
      from = end
    }
  }

  found.sort((a, b) => a.start - b.start)
  const segments: Segment[] = []
  let cursor = 0
  for (const f of found) {
    if (f.start > cursor) segments.push({ text: body.slice(cursor, f.start) })
    segments.push({ text: body.slice(f.start, f.end), mention: f.person })
    cursor = f.end
  }
  if (cursor < body.length) segments.push({ text: body.slice(cursor) })
  return segments.length ? segments : [{ text: body }]
}

/** The teammates tagged in a comment, each once, in the order they appear. */
export function extractMentions(body: string, people: Mentionable[]): Mentionable[] {
  const seen = new Set<string>()
  const out: Mentionable[] = []
  for (const segment of segmentBody(body, people)) {
    if (segment.mention && !seen.has(segment.mention.id)) {
      seen.add(segment.mention.id)
      out.push(segment.mention)
    }
  }
  return out
}

/** Appends "@Name " to the text being typed, adding a space first when needed so it does not glue onto a word. */
export function insertMention(text: string, name: string): string {
  const spacer = text.length > 0 && !/\s$/.test(text) ? ' ' : ''
  return `${text}${spacer}@${name} `
}
