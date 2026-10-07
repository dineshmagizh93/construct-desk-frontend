import { describe, expect, it } from 'vitest'
import { passwordChangeError } from './password'

describe('passwordChangeError', () => {
  it('accepts a long enough, different, confirmed password', () => {
    expect(passwordChangeError('old-password', 'new-password-1', 'new-password-1')).toBeNull()
  })

  it('names the first problem', () => {
    expect(passwordChangeError('', 'new-password-1', 'new-password-1')).toMatch(/current password/)
    expect(passwordChangeError('old-password', 'short', 'short')).toMatch(/at least 8/)
    expect(passwordChangeError('same-password', 'same-password', 'same-password')).toMatch(/different/)
    expect(passwordChangeError('old-password', 'new-password-1', 'new-password-2')).toMatch(/do not match/)
  })

  it('checks length before confirmation', () => {
    expect(passwordChangeError('old-password', 'short', 'other')).toMatch(/at least 8/)
  })
})
