import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// The test environment is Node, so the few browser globals the tracker reads are stubbed, and the module is loaded fresh for
// every test because it remembers the last page it reported.
interface Env {
  hostname?: string
  doNotTrack?: string | null
  gpc?: boolean
  signedIn?: boolean
  referrer?: string
}

async function setup(env: Env = {}) {
  vi.resetModules()
  const fetchMock = vi.fn().mockResolvedValue({ ok: true })
  vi.stubGlobal('fetch', fetchMock)
  vi.stubGlobal('window', { location: { hostname: env.hostname ?? 'constructdesk.in' } })
  vi.stubGlobal('navigator', { doNotTrack: env.doNotTrack ?? null, globalPrivacyControl: env.gpc ?? false })
  vi.stubGlobal('document', { referrer: env.referrer ?? '' })
  vi.stubGlobal('localStorage', { getItem: (key: string) => (env.signedIn && key === 'constructdesk-auth' ? '{}' : null) })
  const { trackPageView } = await import('./analytics')
  return { trackPageView, fetchMock }
}

const sentBody = (fetchMock: ReturnType<typeof vi.fn>, call = 0) => JSON.parse(fetchMock.mock.calls[call][1].body as string)

describe('trackPageView', () => {
  beforeEach(() => vi.useRealTimers())
  afterEach(() => vi.unstubAllGlobals())

  it('reports the page to the analytics endpoint without cookies or credentials', async () => {
    const { trackPageView, fetchMock } = await setup()
    trackPageView('/pricing')
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]
    expect(String(url)).toMatch(/\/analytics\/pageview$/)
    expect(init.method).toBe('POST')
    expect(init.credentials).toBe('omit')
    expect(init.keepalive).toBe(true)
    expect(sentBody(fetchMock)).toEqual({ path: '/pricing', referrer: '' })
  })

  it('sends the referring site on the first page of a visit only', async () => {
    const { trackPageView, fetchMock } = await setup({ referrer: 'https://www.google.com/' })
    trackPageView('/')
    trackPageView('/pricing')
    expect(sentBody(fetchMock, 0).referrer).toBe('https://www.google.com/')
    expect(sentBody(fetchMock, 1).referrer).toBe('')
  })

  it('counts a page once when it is reported twice in a row', async () => {
    const { trackPageView, fetchMock } = await setup()
    trackPageView('/faq')
    trackPageView('/faq')
    expect(fetchMock).toHaveBeenCalledTimes(1)
    trackPageView('/features')
    trackPageView('/faq')
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('sends nothing for a browser that asks not to be tracked', async () => {
    for (const env of [{ doNotTrack: '1' }, { gpc: true }]) {
      const { trackPageView, fetchMock } = await setup(env)
      trackPageView('/')
      expect(fetchMock).not.toHaveBeenCalled()
    }
  })

  it('sends nothing for a signed-in customer or on a developer machine', async () => {
    for (const env of [{ signedIn: true }, { hostname: 'localhost' }, { hostname: '127.0.0.1' }]) {
      const { trackPageView, fetchMock } = await setup(env)
      trackPageView('/')
      expect(fetchMock).not.toHaveBeenCalled()
    }
  })

  it('never throws, even when the network call fails or storage is blocked', async () => {
    const { trackPageView, fetchMock } = await setup()
    fetchMock.mockRejectedValueOnce(new Error('offline'))
    expect(() => trackPageView('/modules')).not.toThrow()
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('blocked')
      },
    })
    expect(() => trackPageView('/how-it-works')).not.toThrow()
  })
})
