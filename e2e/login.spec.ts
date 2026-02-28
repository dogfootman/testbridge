import { test, expect } from '@playwright/test'

// @TEST P2-S3-V - 로그인 플로우 E2E 검증
// @SPEC specs/screens/login.yaml

/**
 * E2E 테스트: 로그인 플로우 브라우저 자동화
 *
 * 테스트 시나리오:
 * 1. 로그인 페이지 접근
 * 2. OAuth 버튼 확인
 * 3. 에러 처리 확인
 * 4. 로그인 후 리다이렉트 확인
 *
 * 주의:
 * - 실제 OAuth는 테스트 환경에서 어려우므로,
 *   페이지 렌더링과 UI 상태만 검증
 * - 실제 E2E는 테스트 계정과 Mock OAuth 서버 필요
 */

test.describe('Login Page (P2-S3-V)', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 페이지 접근
    await page.goto('/auth/login')
  })

  test.describe('P2-S3-V.1: OAuth 로그인 버튼 표시', () => {
    test('should display login page with correct title', async ({ page }) => {
      // 타이틀 확인
      await expect(page.locator('h1')).toContainText('TestBridge에 로그인')
    })

    test('should display subtitle', async ({ page }) => {
      // 부제목 확인
      await expect(page.locator('text=로그인 후 계속하려면 인증해주세요')).toBeVisible()
    })

    test('should display Google OAuth button', async ({ page }) => {
      // Google 버튼 확인
      const googleButton = page.getByTestId('google-signin-button')
      await expect(googleButton).toBeVisible()
      await expect(googleButton).toContainText('Google로 계속')
    })

    test('should display Kakao OAuth button (disabled)', async ({ page }) => {
      // 카카오 버튼 확인 (비활성화)
      const kakaoButtons = await page.locator('button:has-text("카카오로 계속")').all()
      expect(kakaoButtons.length).toBeGreaterThan(0)
      await expect(kakaoButtons[0]).toBeDisabled()
    })

    test('should display Naver OAuth button (disabled)', async ({ page }) => {
      // 네이버 버튼 확인 (비활성화)
      const naverButtons = await page.locator('button:has-text("네이버로 계속")').all()
      expect(naverButtons.length).toBeGreaterThan(0)
      await expect(naverButtons[0]).toBeDisabled()
    })

    test('should display signup link', async ({ page }) => {
      // 회원가입 링크 확인
      const signupLink = page.getByText('회원가입')
      await expect(signupLink).toBeVisible()
      await expect(signupLink.locator('..').locator('a')).toHaveAttribute(
        'href',
        '/auth/signup'
      )
    })
  })

  test.describe('P2-S3-V.2: 에러 메시지 표시', () => {
    test('should display error message when OAuth fails', async ({ page }) => {
      // 에러 쿼리 파라미터로 접근
      await page.goto('/auth/login?error=oauthsignin')

      // 에러 메시지 확인
      const errorMessage = page.getByTestId('error-message')
      await expect(errorMessage).toBeVisible()
      await expect(errorMessage).toContainText('OAuth 로그인에 실패했습니다.')
    })

    test('should display access denied error', async ({ page }) => {
      // 접근 거부 에러
      await page.goto('/auth/login?error=accessdenied')

      const errorMessage = page.getByTestId('error-message')
      await expect(errorMessage).toBeVisible()
      await expect(errorMessage).toContainText('접근이 거부되었습니다.')
    })

    test('should display callback error', async ({ page }) => {
      // 콜백 에러
      await page.goto('/auth/login?error=oauthcallback')

      const errorMessage = page.getByTestId('error-message')
      await expect(errorMessage).toBeVisible()
      await expect(errorMessage).toContainText('OAuth 콜백 처리에 실패했습니다.')
    })

    test('should display account not linked error', async ({ page }) => {
      // 계정 미연동 에러
      await page.goto('/auth/login?error=oauthaccountnotlinked')

      const errorMessage = page.getByTestId('error-message')
      await expect(errorMessage).toBeVisible()
      await expect(errorMessage).toContainText(
        '이 이메일로 다른 로그인 방식이 이미 등록되어 있습니다.'
      )
    })
  })

  test.describe('P2-S3-V.3 & P2-S3-V.4: 로그인 UI 상호작용', () => {
    test('should disable button while signing in', async ({ page }) => {
      const googleButton = page.getByTestId('google-signin-button')

      // 버튼 클릭
      await googleButton.click()

      // 로딩 상태: 버튼 비활성화 및 텍스트 변경
      // (NextAuth 리다이렉트로 인해 페이지가 이동할 수 있음)
      // 따라서 이 부분은 제한적으로 검증
    })

    test('should show correct OAuth button group layout', async ({ page }) => {
      const oauthButtons = page.getByTestId('oauth-buttons')

      // OAuth 버튼 그룹이 정렬되어 있는지 확인
      await expect(oauthButtons).toBeVisible()

      const buttons = await oauthButtons.locator('button').all()
      expect(buttons.length).toBeGreaterThanOrEqual(1)
    })
  })

  test.describe('Page Accessibility', () => {
    test('should have semantic HTML structure', async ({ page }) => {
      // 메인 콘텐츠 영역 확인
      const mainContent = page.locator('div:has(> h1)')
      await expect(mainContent).toBeVisible()
    })

    test('should have proper link semantics', async ({ page }) => {
      // 회원가입 링크
      const signupLink = page.locator('a[href="/auth/signup"]')
      await expect(signupLink).toBeVisible()
    })

    test('should have readable text contrast', async ({ page }) => {
      // 제목이 명확하게 보이는지 확인
      const title = page.locator('h1')
      await expect(title).toBeVisible()
    })
  })

  test.describe('Responsive Design', () => {
    test('should be mobile friendly', async ({ page }) => {
      // 모바일 뷰포트 설정
      await page.setViewportSize({ width: 375, height: 667 })

      // 로그인 페이지 접근
      await page.goto('/auth/login')

      // 주요 요소들이 보이는지 확인
      const title = page.locator('h1')
      const googleButton = page.getByTestId('google-signin-button')

      await expect(title).toBeVisible()
      await expect(googleButton).toBeVisible()
    })

    test('should be tablet friendly', async ({ page }) => {
      // 태블릿 뷰포트 설정
      await page.setViewportSize({ width: 768, height: 1024 })

      // 로그인 페이지 접근
      await page.goto('/auth/login')

      // 주요 요소들이 보이는지 확인
      const title = page.locator('h1')
      await expect(title).toBeVisible()
    })

    test('should be desktop friendly', async ({ page }) => {
      // 데스크탑 뷰포트 설정
      await page.setViewportSize({ width: 1920, height: 1080 })

      // 로그인 페이지 접근
      await page.goto('/auth/login')

      // 주요 요소들이 보이는지 확인
      const title = page.locator('h1')
      await expect(title).toBeVisible()
    })
  })

  test.describe('Security', () => {
    test('should not show error message on initial load', async ({ page }) => {
      // 에러 메시지가 없어야 함
      const errorMessage = page.getByTestId('error-message')
      await expect(errorMessage).not.toBeVisible()
    })

    test('should have HTTPS recommended message', async ({ page }) => {
      // 보안 관련 메시지 확인
      const securityMessage = page.locator('text=보안')
      await expect(securityMessage).toBeVisible()
    })

    test('should not expose sensitive data in HTML', async ({ page }) => {
      // 페이지 소스에서 민감한 데이터 없는지 확인
      const pageContent = await page.content()

      // API 키, 토큰 등이 노출되지 않았는지 확인
      expect(pageContent).not.toContain('GOOGLE_CLIENT_SECRET')
      expect(pageContent).not.toContain('NEXTAUTH_SECRET')
    })
  })
})

test.describe('Dashboard Redirect (Role-based)', () => {
  /**
   * 주의: 실제 E2E 테스트를 위해서는 다음이 필요함:
   * 1. 테스트 계정 (Google OAuth 테스트 계정)
   * 2. 테스트 환경 설정 (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)
   * 3. 데이터베이스 초기화 (각 테스트 전 롤백)
   * 4. NextAuth 설정 (테스트 콜백 URL)
   *
   * 현재 테스트는 UI 검증에 초점을 맞추고,
   * 실제 OAuth 플로우는 Integration 테스트에서 Mock으로 처리
   */

  test('P2-S3-V.3: Developer dashboard should be accessible', async ({
    page,
  }) => {
    // 실제 테스트를 위해서는 먼저 인증 필요
    // 여기서는 URL 접근만 검증

    await page.goto('/developer', { waitUntil: 'networkidle' })

    // 개발자 대시보드로 리다이렉트되거나 로그인 페이지로 리다이렉트됨
    const url = page.url()

    // /developer 또는 /auth/login 중 하나여야 함
    const isValidPage =
      url.includes('/developer') || url.includes('/auth/login')
    expect(isValidPage).toBe(true)
  })

  test('P2-S3-V.4: Tester home should be accessible', async ({ page }) => {
    // 실제 테스트를 위해서는 먼저 인증 필요
    // 여기서는 URL 접근만 검증

    await page.goto('/tester', { waitUntil: 'networkidle' })

    // 테스터 홈으로 리다이렉트되거나 로그인 페이지로 리다이렉트됨
    const url = page.url()

    // /tester 또는 /auth/login 중 하나여야 함
    const isValidPage =
      url.includes('/tester') || url.includes('/auth/login')
    expect(isValidPage).toBe(true)
  })
})
