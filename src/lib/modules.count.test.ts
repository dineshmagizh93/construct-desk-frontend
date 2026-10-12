import { describe, expect, it } from 'vitest'
import { BUSINESS_MODULE_COUNT, MODULE_GROUPS, MODULE_KEYS } from './modules'

describe('BUSINESS_MODULE_COUNT', () => {
  it('counts the modules the marketing pages list, not the admin screens', () => {
    const listed = MODULE_GROUPS.filter((g) => g.label !== 'System').flatMap((g) => g.modules)
    expect(BUSINESS_MODULE_COUNT).toBe(listed.length)
    expect(BUSINESS_MODULE_COUNT).toBe(MODULE_KEYS.length - 3) // settings, users, roles
  })

  it('leaves no module out of the groups', () => {
    const grouped = MODULE_GROUPS.flatMap((g) => g.modules.map((m) => m.key)).sort()
    expect([...MODULE_KEYS].sort()).toEqual(grouped)
  })
})
