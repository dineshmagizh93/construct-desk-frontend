import { describe, expect, it } from 'vitest'
import { checkUploadSize, UPLOAD_LIMIT_MB } from './uploadLimits'

const MB = 1024 * 1024

describe('checkUploadSize', () => {
  it('accepts a file within the limit, including exactly at it', () => {
    expect(checkUploadSize({ name: 'a.pdf', size: 1 }, 'documents')).toBeNull()
    expect(checkUploadSize({ name: 'a.pdf', size: 10 * MB }, 'expenses')).toBeNull()
  })

  it('refuses a file one byte over the limit and names the file and the limit', () => {
    expect(checkUploadSize({ name: 'scan.pdf', size: 10 * MB + 1 }, 'expenses')).toBe('scan.pdf is too large — the limit here is 10 MB')
  })

  it('has a different limit per folder', () => {
    const size = 15 * MB
    expect(checkUploadSize({ name: 'x', size }, 'expenses')).not.toBeNull()
    expect(checkUploadSize({ name: 'x', size }, 'site-progress')).toBeNull()
    expect(checkUploadSize({ name: 'x', size }, 'documents')).toBeNull()
  })

  it('refuses an empty file', () => {
    expect(checkUploadSize({ name: 'blank.txt', size: 0 }, 'documents')).toBe('blank.txt is empty')
  })

  it('matches the limits the backend enforces', () => {
    // backend/src/shared/uploadKeys.ts: site-progress 20, documents 50, expenses 10
    expect(UPLOAD_LIMIT_MB).toEqual({ 'site-progress': 20, documents: 50, expenses: 10 })
  })
})
