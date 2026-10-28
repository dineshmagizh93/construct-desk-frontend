import { afterEach, describe, expect, it, vi } from 'vitest'

// Node test environment: the few browser globals the module touches are stubbed, and it is loaded fresh each time.
async function setup(env: { hostname?: string; doNotTrack?: string | null; signedIn?: boolean } = {}) {
  vi.resetModules()
  const appended: { src?: string }[] = []
  vi.stubGlobal('window', { location: { hostname: env.hostname ?? 'constructdesk.in' } })
  vi.stubGlobal('navigator', { doNotTrack: env.doNotTrack ?? null, globalPrivacyControl: false })
  vi.stubGlobal('localStorage', { getItem: (k: string) => (env.signedIn && k === 'constructdesk-auth' ? '{}' : null) })
  vi.stubGlobal('document', {
    createElement: () => ({}) as { src?: string; async?: boolean },
    head: { appendChild: (el: { src?: string }) => appended.push(el) },
  })
  const mod = await import('./googleAds')
  return { ...mod, appended, win: window as unknown as { dataLayer?: unknown[]; gtag?: (...a: unknown[]) => void } }
}

describe('Google Ads tag', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('loads the tag once for an ordinary visitor', async () => {
    const { loadGoogleAdsTag, appended, win, GOOGLE_ADS_ID } = await setup()
    loadGoogleAdsTag()
    loadGoogleAdsTag()
    expect(appended).toHaveLength(1)
    expect(appended[0].src).toContain(`googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`)
    expect(win.dataLayer).toHaveLength(2)
  })

  it('does not load for do-not-track, signed-in customers or developer machines', async () => {
    for (const env of [{ doNotTrack: '1' }, { signedIn: true }, { hostname: 'localhost' }]) {
      const { loadGoogleAdsTag, appended } = await setup(env)
      loadGoogleAdsTag()
      expect(appended).toHaveLength(0)
    }
  })

  it('reports a demo request to Google Ads as a conversion', async () => {
    const { loadGoogleAdsTag, reportDemoRequest, win, GOOGLE_ADS_ID, DEMO_CONVERSION_LABEL } = await setup()
    loadGoogleAdsTag()
    const before = win.dataLayer!.length
    reportDemoRequest()
    expect(win.dataLayer!.length).toBe(before + 1)
    const sent = Array.from(win.dataLayer![before] as ArrayLike<unknown>)
    expect(sent).toEqual(['event', 'conversion', { send_to: `${GOOGLE_ADS_ID}/${DEMO_CONVERSION_LABEL}`, value: 1.0, currency: 'INR' }])
  })

  it('reports nothing when the tag was never loaded (opted out or signed in)', async () => {
    const { reportDemoRequest, win } = await setup({ doNotTrack: '1' })
    reportDemoRequest()
    expect(win.dataLayer).toBeUndefined()
  })
})
