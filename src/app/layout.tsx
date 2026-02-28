import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TestBridge - Google Play 테스터 매칭 플랫폼',
  description: 'Google Play 14일/14명 테스트 요건을 충족하는 테스터 매칭 플랫폼',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
