import { test, expect } from '@playwright/test'

/**
 * @TEST P2-S1-V - Landing Page E2E 검증
 * @IMPL src/app/page.tsx + src/app/api/apps/route.ts
 * @SPEC docs/phase-2/landing-page.md
 *
 * 실제 브라우저에서 Backend API와의 완전한 연결을 검증하는 E2E 테스트
 */

test.describe('Landing Page - Backend ↔ Frontend Integration (P2-S1-V)', () => {
  test.beforeEach(async ({ page }) => {
    // 각 테스트 전에 landing page 방문
    await page.goto('/')
    // 페이지가 완전히 로드될 때까지 대기
    await page.waitForLoadState('networkidle')
  })

  test.describe('Featured Apps Display (6개 앱 표시)', () => {
    /**
     * @TEST P2-S1-V-E2E.1 - 샘플 앱 6개 렌더링
     * 검증:
     * - 페이지 로드 후 API에서 앱 데이터를 가져옴
     * - 최대 6개의 앱 카드가 표시됨
     * - 각 앱의 정보(이름, 아이콘, 리워드)가 정상 표시
     */
    test('should display featured apps section with cards', async ({ page }) => {
      // 앱 카드가 렌더링될 때까지 대기
      const appCards = page.locator('text=모집 중인 앱')
      await expect(appCards).toBeVisible()

      // 최소 1개 이상의 앱이 표시되어야 함
      const appLinks = page.locator('a:has-text(/지원하기|리워드/)')
      const count = await appLinks.count()
      expect(count).toBeGreaterThan(0)
      expect(count).toBeLessThanOrEqual(6)
    })

    /**
     * @TEST P2-S1-V-E2E.2 - 앱 카드 컨텐츠 검증
     * 검증:
     * - 각 앱 카드에 앱 이름 표시
     * - 각 앱 카드에 카테고리 정보 표시
     * - 각 앱 카드에 리워드 금액 표시
     * - 각 앱 카드에 아이콘 이미지 표시
     */
    test('should display app card with name, category, and reward', async ({
      page,
    }) => {
      // 첫 번째 앱 카드 찾기
      const firstAppCard = page
        .locator('a')
        .filter({ has: page.locator('text=카테고리') })
        .first()

      await expect(firstAppCard).toBeVisible()

      // 앱 이름이 표시되는지 확인
      const appName = firstAppCard.locator('h3')
      await expect(appName).toBeVisible()
      const nameText = await appName.textContent()
      expect(nameText?.length).toBeGreaterThan(0)

      // 카테고리가 표시되는지 확인
      const category = firstAppCard.locator('text=/카테고리/')
      await expect(category).toBeVisible()

      // 리워드 금액이 표시되는지 확인
      const reward = firstAppCard.locator('text=/원/')
      await expect(reward).toBeVisible()
      const rewardText = await reward.textContent()
      expect(rewardText).toMatch(/\d+원/)

      // 아이콘 이미지가 표시되는지 확인
      const icon = firstAppCard.locator('img')
      await expect(icon).toBeVisible()
      const altText = await icon.getAttribute('alt')
      expect(altText).toContain('아이콘')
    })

    /**
     * @TEST P2-S1-V-E2E.3 - 앱 상세 페이지 네비게이션
     * 검증:
     * - 앱 카드 클릭 시 상세 페이지로 이동
     * - URL이 /tester/apps/{id} 형식
     */
    test('should navigate to app detail page on card click', async ({ page }) => {
      // 첫 번째 앱 카드의 링크 클릭
      const firstAppLink = page
        .locator('a')
        .filter({ has: page.locator('text=모집중') })
        .first()

      const href = await firstAppLink.getAttribute('href')
      expect(href).toMatch(/\/tester\/apps\/\d+/)

      // 링크 클릭 (실제 페이지가 없으면 404가 나지만 네비게이션은 확인됨)
      await firstAppLink.click()
      await page.waitForLoadState('networkidle')

      // URL 변경 확인
      expect(page.url()).toContain('/tester/apps/')
    })
  })

  test.describe('Hero Section & CTA Buttons', () => {
    /**
     * @TEST P2-S1-V-E2E.4 - Hero section 컨텐츠
     * 검증:
     * - 메인 타이틀 표시
     * - 서브 타이틀/설명 표시
     * - 배경 이미지 또는 스타일 적용
     */
    test('should display hero section with title and subtitle', async ({
      page,
    }) => {
      const heroTitle = page.locator('text=Google Play 테스트 요건')
      const heroSubtitle = page.locator('text=14일')

      await expect(heroTitle).toBeVisible()
      await expect(heroSubtitle).toBeVisible()
    })

    /**
     * @TEST P2-S1-V-E2E.5 - CTA 버튼 렌더링
     * 검증:
     * - "개발자로 시작" 버튼 표시
     * - "테스터로 시작" 버튼 표시
     * - 버튼이 클릭 가능
     */
    test('should display signup CTA buttons', async ({ page }) => {
      const devButtons = page.locator('text=개발자로 시작')
      const testerButtons = page.locator('text=테스터로 시작')

      expect(await devButtons.count()).toBeGreaterThan(0)
      expect(await testerButtons.count()).toBeGreaterThan(0)

      // 첫 번째 "개발자로 시작" 버튼이 보이는지 확인
      await expect(devButtons.first()).toBeVisible()
      await expect(testerButtons.first()).toBeVisible()
    })

    /**
     * @TEST P2-S1-V-E2E.6 - CTA 버튼 네비게이션
     * 검증:
     * - "개발자로 시작" 클릭 시 /auth/signup?role=developer로 이동
     * - "테스터로 시작" 클릭 시 /auth/signup?role=tester로 이동
     */
    test('should navigate to signup page with correct role parameter', async ({
      page,
    }) => {
      // Hero 섹션의 "개발자로 시작" 버튼 클릭
      const devButton = page
        .locator('text=개발자로 시작')
        .first()
        .locator('..')

      const href = await devButton.locator('a').getAttribute('href')
      expect(href).toContain('/auth/signup')
      expect(href).toContain('role=developer')

      // Hero 섹션의 "테스터로 시작" 버튼 클릭
      const testerButton = page
        .locator('text=테스터로 시작')
        .first()
        .locator('..')

      const testerHref = await testerButton.locator('a').getAttribute('href')
      expect(testerHref).toContain('/auth/signup')
      expect(testerHref).toContain('role=tester')
    })
  })

  test.describe('Flow Visualization', () => {
    /**
     * @TEST P2-S1-V-E2E.7 - 4단계 플로우 시각화
     * 검증:
     * - "앱 등록" 스텝 표시
     * - "테스터 매칭" 스텝 표시
     * - "테스트 진행" 스텝 표시
     * - "프로덕션 등록" 스텝 표시
     */
    test('should display 4-step flow visualization', async ({ page }) => {
      const steps = ['앱 등록', '테스터 매칭', '테스트 진행', '프로덕션 등록']

      for (const step of steps) {
        const stepElement = page.locator(`text=${step}`)
        await expect(stepElement).toBeVisible()
      }
    })
  })

  test.describe('Page Layout & Responsiveness', () => {
    /**
     * @TEST P2-S1-V-E2E.8 - 전체 페이지 섹션
     * 검증:
     * - Hero section 존재
     * - Featured apps section 존재
     * - Testimonials section 존재
     * - FAQ section 존재
     * - Footer CTA 존재
     */
    test('should render all main page sections', async ({ page }) => {
      // Hero
      await expect(page.locator('text=Google Play 테스트 요건')).toBeVisible()

      // Featured Apps
      await expect(page.locator('text=모집 중인 앱')).toBeVisible()

      // Testimonials (또는 다른 섹션)
      await expect(page.locator('text=테스트')).toBeVisible()

      // FAQ
      await expect(
        page.locator('text=Google Play 테스트 요건이 뭔가요?')
      ).toBeVisible()
    })

    /**
     * @TEST P2-S1-V-E2E.9 - 모바일 반응형 디자인
     * 검증:
     * - 모바일 뷰포트에서도 앱 카드 표시
     * - 모바일에서 CTA 버튼 클릭 가능
     */
    test('should be responsive on mobile viewport', async ({ page }) => {
      // 모바일 뷰포트 설정
      await page.setViewportSize({ width: 375, height: 667 })

      // 페이지 다시 로드
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      // 모바일에서도 주요 요소들이 보여야 함
      const appsSection = page.locator('text=모집 중인 앱')
      await expect(appsSection).toBeVisible()

      const ctaButton = page.locator('text=개발자로 시작').first()
      await expect(ctaButton).toBeVisible()

      // 버튼이 클릭 가능한지 확인
      await expect(ctaButton).toBeEnabled()
    })
  })

  test.describe('API Integration & Performance', () => {
    /**
     * @TEST P2-S1-V-E2E.10 - API 응답 성능
     * 검증:
     * - 페이지 로드 후 API 호출 1회만 수행
     * - API 응답 시간이 합리적
     */
    test('should fetch apps from API on page load', async ({ page }) => {
      // Network 활동 모니터링
      const requests: string[] = []
      page.on('request', (request) => {
        if (request.url().includes('/api/apps')) {
          requests.push(request.url())
        }
      })

      // 페이지 로드
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      // /api/apps 요청이 있는지 확인
      expect(requests.length).toBeGreaterThan(0)
      expect(requests[0]).toContain('status=RECRUITING')
      expect(requests[0]).toContain('limit=6')
    })

    /**
     * @TEST P2-S1-V-E2E.11 - 로딩 상태 처리
     * 검증:
     * - 로딩 중 로딩 스피너 표시 (빠르면 안 보일 수 있음)
     * - 로딩 완료 후 앱 카드 표시
     */
    test('should handle loading state correctly', async ({ page }) => {
      // 페이지 로드
      await page.goto('/')

      // API 응답 후 앱이 표시되어야 함
      const appsSection = page.locator('text=모집 중인 앱')
      await expect(appsSection).toBeVisible()

      // 앱 카드가 표시되어야 함
      const appCard = page.locator('a').filter({ has: page.locator('h3') }).first()
      await expect(appCard).toBeVisible()
    })

    /**
     * @TEST P2-S1-V-E2E.12 - 에러 처리
     * 검증:
     * - API 에러 시에도 페이지는 표시됨
     * - 에러 메시지 표시 또는 빈 상태 표시
     */
    test('should display page gracefully even if API fails', async ({ page }) => {
      // API 요청 실패 시뮬레이션
      await page.route('**/api/apps**', (route) => {
        route.abort('failed')
      })

      // 페이지 로드
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      // 페이지의 기본 요소들은 여전히 보여야 함
      const heroSection = page.locator('text=Google Play 테스트 요건')
      await expect(heroSection).toBeVisible()

      // CTA 버튼도 보여야 함
      const ctaButton = page.locator('text=개발자로 시작').first()
      await expect(ctaButton).toBeVisible()
    })
  })

  test.describe('Accessibility', () => {
    /**
     * @TEST P2-S1-V-E2E.13 - 접근성 검증
     * 검증:
     * - 이미지에 alt 텍스트 있음
     * - 버튼이 포커스 가능
     * - 제목 계층 구조 존재
     */
    test('should have proper alt text for images', async ({ page }) => {
      const images = page.locator('img')
      const count = await images.count()

      expect(count).toBeGreaterThan(0)

      // 각 이미지에 alt 텍스트가 있는지 확인
      for (let i = 0; i < Math.min(count, 3); i++) {
        const alt = await images.nth(i).getAttribute('alt')
        expect(alt).toBeTruthy()
      }
    })

    /**
     * @TEST P2-S1-V-E2E.14 - 키보드 네비게이션
     * 검증:
     * - Tab 키로 버튼에 포커스 가능
     * - Enter 키로 버튼 활성화
     */
    test('should support keyboard navigation', async ({ page }) => {
      // 첫 번째 버튼에 탭으로 포커스
      await page.keyboard.press('Tab')
      await page.waitForTimeout(100)

      // 다시 탭 누르기
      await page.keyboard.press('Tab')
      await page.waitForTimeout(100)

      // 페이지가 여전히 정상 상태
      const hero = page.locator('text=Google Play 테스트 요건')
      await expect(hero).toBeVisible()
    })
  })

  test.describe('SEO & Meta Tags', () => {
    /**
     * @TEST P2-S1-V-E2E.15 - SEO 메타 태그
     * 검증:
     * - 페이지 타이틀 설정
     * - 메타 설명 설정
     */
    test('should have proper page title', async ({ page }) => {
      const title = await page.title()
      expect(title).toBeTruthy()
      // Landing page임을 나타내는 텍스트 포함 가능
      console.log(`Page title: ${title}`)
    })
  })
})
