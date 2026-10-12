import { describe, expect, it } from 'vitest'
import { apiUrlProblem } from './apiUrl'

describe('apiUrlProblem', () => {
  it('is fine when the API is a real address', () => {
    expect(apiUrlProblem('https://api.example.com', 'app.example.com')).toBeNull()
    expect(apiUrlProblem('https://api.example.com/', 'localhost')).toBeNull()
  })

  it('is fine in local development, where both are local', () => {
    expect(apiUrlProblem('http://localhost:4002', 'localhost')).toBeNull()
    expect(apiUrlProblem('http://127.0.0.1:4000', '127.0.0.1')).toBeNull()
    expect(apiUrlProblem('http://localhost:4000', 'app.localhost')).toBeNull()
  })

  it('explains a live site that would call localhost', () => {
    expect(apiUrlProblem('http://localhost:4000', 'app.example.com')).toMatch(/built without its server address/)
    expect(apiUrlProblem('http://127.0.0.1:4000', 'app.example.com')).toMatch(/VITE_API_URL/)
    expect(apiUrlProblem('http://[::1]:4000', 'app.example.com')).toMatch(/VITE_API_URL/)
  })

  it('refuses an address that is not a web address', () => {
    expect(apiUrlProblem('not a url', 'app.example.com')).toMatch(/not a valid web address/)
  })
})
