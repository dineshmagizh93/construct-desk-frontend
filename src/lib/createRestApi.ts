import type { MockApi } from './createMockApi'
import { http } from './http'

export function createRestApi<T extends { id: string }>(resourcePath: string): MockApi<T> {
  return {
    list: () => http<T[]>(resourcePath),
    get: (id) => http<T>(`${resourcePath}/${id}`),
    create: (values) => http<T>(resourcePath, { method: 'POST', body: JSON.stringify(values) }),
    update: (id, values) => http<T>(`${resourcePath}/${id}`, { method: 'PUT', body: JSON.stringify(values) }),
    remove: (id) => http<void>(`${resourcePath}/${id}`, { method: 'DELETE' }),
  }
}
