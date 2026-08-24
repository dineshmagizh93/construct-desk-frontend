import type { UploadedFile } from '@/components/shared/types'

export interface SiteProgressEntry {
  id: string
  projectId: string
  date: string
  progressPercent: number
  workforceCount: number
  weather: 'Clear' | 'Rainy' | 'Cloudy' | 'Extreme Heat'
  notes: string
  photos: UploadedFile[]
}
