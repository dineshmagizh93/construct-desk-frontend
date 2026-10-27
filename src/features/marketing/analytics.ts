import { API_URL } from '@/lib/apiUrl'

/**
 * Reports a page view of the public website, for the visitor counts in the Super Admin console. Deliberately minimal: no
 * cookies, no identifier kept in the browser, only the page path and (on a visit's first page) the site that referred it.
 * The server decides what counts, so this only skips what must never be sent.
 */

let lastPath: string | null = null
let firstView = true

const LOCAL_HOSTS = ['localhost', '127.0.0.1', '[::1]']

/** A person who has asked not to be tracked: Do Not Track, or Global Privacy Control. */
function optedOut(): boolean {
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean }
  return nav.doNotTrack === '1' || (window as Window & { doNotTrack?: string }).doNotTrack === '1' || nav.globalPrivacyControl === true
}

/** Signed-in people are customers or staff, not visitors to the website, so they are not counted. */
function signedIn(): boolean {
  try {
    return localStorage.getItem('constructdesk-auth') !== null
  } catch {
    return false
  }
}

export function trackPageView(pathname: string): void {
  try {
    if (LOCAL_HOSTS.includes(window.location.hostname)) return
    if (optedOut() || signedIn()) return
    // React can run an effect twice in development; a page is only counted once in a row.
    if (pathname === lastPath) return
    lastPath = pathname

    const referrer = firstView ? document.referrer : ''
    firstView = false

    void fetch(`${API_URL}/analytics/pageview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: pathname, referrer }),
      keepalive: true,
      credentials: 'omit',
    }).catch(() => {
      // Counting is best effort; a failure must never be visible.
    })
  } catch {
    // Nothing here may ever break the page.
  }
}
