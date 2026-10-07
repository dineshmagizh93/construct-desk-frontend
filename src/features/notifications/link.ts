/**
 * The in-app path a notification should open, or null if it has none or the value is not a plain
 * app path. Only "/something" is accepted, so a link can never send someone to another site
 * ("//evil.com", "https://…", "javascript:…" are all refused).
 */
export function safeLink(link: string | null | undefined): string | null {
  if (!link) return null
  if (!link.startsWith('/') || link.startsWith('//')) return null
  if (link.includes('\\') || /\s/.test(link)) return null
  return link
}
