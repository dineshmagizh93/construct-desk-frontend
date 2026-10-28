import { trackingAllowed } from './analytics'

/**
 * Google Ads measurement for the public website, so the Ads account can see which clicks turn into demo requests.
 * Loaded only for people the visitor counter would also count, and never inside the signed-in app.
 */

export const GOOGLE_ADS_ID = 'AW-18542173806'

/** The conversion label from Google Ads (Goals > Conversions > the "demo request" action). Until it is set, only the tag loads. */
export const DEMO_CONVERSION_LABEL = ''

type Gtag = (...args: unknown[]) => void
interface GtagWindow extends Window {
  dataLayer?: unknown[]
  gtag?: Gtag
}

let loaded = false

export function loadGoogleAdsTag(): void {
  try {
    if (loaded || !trackingAllowed()) return
    loaded = true
    const w = window as GtagWindow
    w.dataLayer = w.dataLayer ?? []
    w.gtag = function gtag() {
      // gtag.js reads the arguments object itself, so the call has to be queued exactly as Google's snippet does.
      // eslint-disable-next-line prefer-rest-params
      w.dataLayer!.push(arguments)
    }
    w.gtag('js', new Date())
    w.gtag('config', GOOGLE_ADS_ID)

    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`
    document.head.appendChild(script)
  } catch {
    // Measurement must never break the page.
  }
}

/** Called when a demo request has been accepted by the server. */
export function reportDemoRequest(): void {
  try {
    const w = window as GtagWindow
    if (!loaded || !DEMO_CONVERSION_LABEL || typeof w.gtag !== 'function') return
    w.gtag('event', 'conversion', { send_to: `${GOOGLE_ADS_ID}/${DEMO_CONVERSION_LABEL}` })
  } catch {
    // Same: never visible.
  }
}
