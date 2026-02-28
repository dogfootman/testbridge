import { withAuth } from 'next-auth/middleware'
import { NextRequest, NextResponse } from 'next/server'

// @TEST P2-S3-V.3 & P2-S3-V.4 - 역할별 리다이렉트
// @SPEC specs/screens/login.yaml

export default withAuth(
  async function middleware(request: NextRequest) {
    const token = request.nextauth.token

    // 인증된 사용자만 처리
    if (!token) return NextResponse.next()

    const userRole = token.role as string

    // 대시보드 접근 시 역할에 따라 리다이렉트
    if (request.nextUrl.pathname === '/dashboard') {
      if (userRole === 'DEVELOPER') {
        return NextResponse.redirect(new URL('/developer', request.url))
      } else if (userRole === 'TESTER') {
        return NextResponse.redirect(new URL('/tester', request.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // 모든 요청 허용 (인증 여부는 페이지에서 처리)
        return true
      },
    },
  }
)

export const config = {
  matcher: ['/dashboard', '/developer', '/tester'],
}
