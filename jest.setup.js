import '@testing-library/jest-dom'

// Save native Web APIs before whatwg-fetch potentially overwrites them.
// Node 24+ provides native Request/Response/Headers/fetch that are
// compatible with NextRequest. whatwg-fetch's polyfill is not.
//
// NOTE: ES module `import` statements are hoisted, so we use dynamic
// require() to ensure native APIs are captured BEFORE whatwg-fetch loads.
const _nativeRequest = globalThis.Request
const _nativeResponse = globalThis.Response
const _nativeHeaders = globalThis.Headers
const _nativeFetch = globalThis.fetch

// Dynamically load whatwg-fetch for jsdom component tests that lack fetch API.
// Using require() avoids hoisting so our saved references above remain valid.
require('whatwg-fetch')

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
