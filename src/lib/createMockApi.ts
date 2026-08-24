import { nextId, sleep } from './utils'

export interface MockApi<T> {
  list: () => Promise<T[]>
  get: (id: string) => Promise<T | undefined>
  create: (values: Partial<T>) => Promise<T>
  update: (id: string, values: Partial<T>) => Promise<T>
  remove: (id: string) => Promise<void>
}

export function createMockApi<T extends { id: string }>(seed: T[], prefix: string, latency = 350): MockApi<T> {
  let store = [...seed]

  return {
    async list() {
      await sleep(latency)
      return [...store]
    },
    async get(id) {
      await sleep(latency)
      return store.find((item) => item.id === id)
    },
    async create(values) {
      await sleep(latency)
      const record = { ...values, id: nextId(prefix) } as T
      store = [record, ...store]
      return record
    },
    async update(id, values) {
      await sleep(latency)
      let updated: T | undefined
      store = store.map((item) => {
        if (item.id !== id) return item
        updated = { ...item, ...values }
        return updated
      })
      if (!updated) throw new Error('Record not found')
      return updated
    },
    async remove(id) {
      await sleep(latency)
      store = store.filter((item) => item.id !== id)
    },
  }
}
