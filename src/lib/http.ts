import { useAuthStore } from '@/features/auth/store'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

export class HttpError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  const { refreshToken } = useAuthStore.getState()
  if (!refreshToken) return null

  if (!refreshPromise) {
    refreshPromise = fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
      .then(async (res) => {
        if (!res.ok) return null
        const data = await res.json()
        useAuthStore.getState().setTokens(data.accessToken, data.refreshToken)
        return data.accessToken as string
      })
      .catch(() => null)
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

export async function http<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const { accessToken } = useAuthStore.getState()

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...init.headers,
    },
  })

  if (res.status === 401 && retry) {
    const newToken = await refreshAccessToken()
    if (newToken) return http<T>(path, init, false)
    useAuthStore.getState().logout()
    throw new HttpError(401, 'Session expired — please log in again')
  }

  if (!res.ok) {
    let message = res.statusText
    try {
      const body = await res.json()
      message = body.error ?? message
    } catch {
      // response had no JSON body
    }
    throw new HttpError(res.status, message)
  }

  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}
