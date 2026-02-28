import '@testing-library/jest-dom'

// Save native Web APIs before whatwg-fetch potentially overwrites them.
// Node 24+ provides native Request/Response/Headers/fetch that are
// compatible with NextRequest. whatwg-fetch's polyfill is not.
const _nativeRequest = globalThis.Request
const _nativeResponse = globalThis.Response
const _nativeHeaders = globalThis.Headers
const _nativeFetch = globalThis.fetch

// Import whatwg-fetch for jsdom component tests that lack fetch API
import 'whatwg-fetch'

// Restore native implementations if they existed (Node 24+).
// This ensures NextRequest (which extends native Request) works correctly.
if (_nativeRequest) globalThis.Request = _nativeRequest
if (_nativeResponse) globalThis.Response = _nativeResponse
if (_nativeHeaders) globalThis.Headers = _nativeHeaders
if (_nativeFetch) globalThis.fetch = _nativeFetch

// Additional polyfills for Next.js edge runtime
if (typeof TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util')
  global.TextEncoder = TextEncoder
  global.TextDecoder = TextDecoder
}
