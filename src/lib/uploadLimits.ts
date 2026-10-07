import type { UploadFolder } from '@/components/shared/types'

/** Mirrors backend/src/shared/uploadKeys.ts UPLOAD_MAX_BYTES — the server (and storage itself) enforce
 * these; checking here just lets people see the problem before waiting on an upload. */
export const UPLOAD_LIMIT_MB: Record<UploadFolder, number> = {
  'site-progress': 20,
  documents: 50,
  expenses: 10,
}

/** A readable reason the file can't be uploaded, or null when it's fine. */
export function checkUploadSize(file: { name: string; size: number }, folder: UploadFolder): string | null {
  if (file.size <= 0) return `${file.name} is empty`
  const limit = UPLOAD_LIMIT_MB[folder]
  if (file.size > limit * 1024 * 1024) return `${file.name} is too large — the limit here is ${limit} MB`
  return null
}
