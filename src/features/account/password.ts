export const MIN_PASSWORD_LENGTH = 8

/** The first problem with a password change, in plain words, or null when it is fine to send. Mirrors the backend's rules. */
export function passwordChangeError(current: string, next: string, confirm: string): string | null {
  if (!current) return 'Enter your current password.'
  if (next.length < MIN_PASSWORD_LENGTH) return `The new password must be at least ${MIN_PASSWORD_LENGTH} characters.`
  if (next === current) return 'Choose a password different from your current one.'
  if (next !== confirm) return 'The new password and its confirmation do not match.'
  return null
}
