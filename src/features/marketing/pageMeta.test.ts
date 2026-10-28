import { describe, expect, it } from 'vitest'
import { PAGE_META } from './pageMeta'
import sitemap from '../../../public/sitemap.xml?raw'

describe('PAGE_META', () => {
  it('gives every page its own title and description of a sensible length', () => {
    const titles = new Set<string>()
    for (const [path, m] of Object.entries(PAGE_META)) {
      expect(m.title.length, path).toBeLessThanOrEqual(75)
      expect(m.description.length, path).toBeGreaterThan(30)
      expect(m.description.length, path).toBeLessThanOrEqual(160)
      titles.add(m.title)
    }
    expect(titles.size).toBe(Object.keys(PAGE_META).length)
  })

  it('covers every page listed in the sitemap', () => {
    const paths = [...sitemap.matchAll(/<loc>https:\/\/constructdesk\.in(\/[^<]*)<\/loc>/g)].map((m) => m[1])
    expect(paths.length).toBeGreaterThan(5)
    for (const p of paths) expect(PAGE_META[p], p).toBeDefined()
  })
})
