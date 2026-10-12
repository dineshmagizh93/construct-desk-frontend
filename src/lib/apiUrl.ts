/** Where the API lives. Set VITE_API_URL when building; the localhost default only suits local development. */
export const API_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

const LOCAL_HOSTS = ['localhost', '127.0.0.1', '[::1]']

function hostOf(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase()
  } catch {
    return null
  }
}

/**
 * Explains a deployment that was built without a real API address: the app is being served from a real site but
 * would call localhost. Returns null when all is well (including running on localhost itself). A plain message
 * beats every screen failing with an unexplained network error.
 */
export function apiUrlProblem(apiUrl: string, pageHostname: string): string | null {
  const apiHost = hostOf(apiUrl)
  if (!apiHost) return `VITE_API_URL ("${apiUrl}") is not a valid web address.`
  const apiIsLocal = LOCAL_HOSTS.includes(apiHost)
  const page = pageHostname.toLowerCase()
  const pageIsLocal = LOCAL_HOSTS.includes(page) || page.endsWith('.localhost')
  if (apiIsLocal && !pageIsLocal) {
    return "This site was built without its server address. Rebuild it with VITE_API_URL set to your API's https:// address (see DEPLOYMENT.md)."
  }
  return null
}
