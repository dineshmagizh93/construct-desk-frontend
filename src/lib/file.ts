import type { UploadedFile, UploadFolder } from '@/components/shared/types'
import { http } from './http'
import { nextId } from './utils'

interface PresignResponse {
  key: string
  uploadUrl: string
  publicUrl: string
}

export async function uploadFile(file: File, folder: UploadFolder): Promise<UploadedFile> {
  const presign = await http<PresignResponse>('/uploads/presign', {
    method: 'POST',
    // The exact size is signed into the upload URL, so storage refuses any other length.
    body: JSON.stringify({ fileName: file.name, contentType: file.type || 'application/octet-stream', folder, size: file.size }),
  })

  const putRes = await fetch(presign.uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type || 'application/octet-stream' },
    body: file,
  })
  if (!putRes.ok) {
    throw new Error(`Upload to storage failed (${putRes.status})`)
  }

  return {
    id: nextId('file'),
    name: file.name,
    size: file.size,
    type: file.type,
    key: presign.key,
    url: presign.publicUrl,
  }
}

export function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}
