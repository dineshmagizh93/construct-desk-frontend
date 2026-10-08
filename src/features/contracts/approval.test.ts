import { describe, expect, it } from 'vitest'
import { isApprover, statusOptionsFor } from './approval'

const values = (role: string | undefined, current?: string) => statusOptionsFor(role, current).map((o) => o.value)

describe('statusOptionsFor', () => {
  it('gives administrators every status', () => {
    expect(values('admin')).toEqual(['draft', 'pending', 'approved', 'rejected'])
    expect(values('super_admin')).toEqual(['draft', 'pending', 'approved', 'rejected'])
  })

  it('gives everyone else only draft and pending approval', () => {
    expect(values('project_manager')).toEqual(['draft', 'pending'])
    expect(values('accountant', 'draft')).toEqual(['draft', 'pending'])
    expect(values(undefined)).toEqual(['draft', 'pending'])
  })

  it('still shows an already decided status so the box is not blank', () => {
    expect(values('project_manager', 'approved')).toEqual(['draft', 'pending', 'approved'])
    expect(values('project_manager', 'rejected')).toEqual(['draft', 'pending', 'rejected'])
  })
})

describe('isApprover', () => {
  it('is true for administrators only', () => {
    expect(isApprover('admin')).toBe(true)
    expect(isApprover('project_manager')).toBe(false)
    expect(isApprover(undefined)).toBe(false)
  })
})
