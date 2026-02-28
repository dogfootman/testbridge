/**
 * Mock NextRequest for node environment testing
 * Use this instead of @edge-runtime/jest-environment which has mocking limitations
 */

export class MockNextRequest {
  url: string
  method: string
  headers: Map<string, string>
  _json: any

  constructor(url: string, options?: { method?: string; headers?: Record<string, string>; body?: any }) {
    this.url = url
    this.method = options?.method || 'GET'
    this.headers = new Map(Object.entries(options?.headers || {}))
    this._json = options?.body
  }

  async json() {
    return this._json
  }
}
