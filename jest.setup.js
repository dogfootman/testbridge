import '@testing-library/jest-dom'
import 'whatwg-fetch'

// Additional polyfills for Next.js edge runtime
if (typeof TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util')
  global.TextEncoder = TextEncoder
  global.TextDecoder = TextDecoder
}
