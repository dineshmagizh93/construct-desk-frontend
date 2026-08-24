import { http } from '@/lib/http'

export function forgotPassword(email: string) {
  return http<{ ok: boolean }>('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) })
}

export function resetPassword(accessToken: string, password: string) {
  return http<{ ok: boolean }>('/auth/reset-password', { method: 'POST', body: JSON.stringify({ accessToken, password }) })
}
