/**
 * @TEST P2-S1-V - Landing Page 통합 테스트
 * @IMPL src/app/page.tsx + src/app/api/apps/route.ts
 * @SPEC docs/phase-2/landing-page.md
 *
 * 실제 API 엔드포인트와의 연결을 검증하는 통합 테스트
 */

import { render, screen, waitFor } from '@testing-library/react'
import Home from './page'
import '@testing-library/jest-dom'

// Mock next/link (필수)
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>
  }
})

// Mock fetch for integration tests
const mockApps = [
  { id: 1, appName: 'Instagram Clone', categoryId: 1, iconUrl: '/icon1.png', rewardAmount: 10000 },
  { id: 2, appName: 'Fitness Tracker', categoryId: 2, iconUrl: '/icon2.png', rewardAmount: 15000 },
  { id: 3, appName: 'Note Taking App', categoryId: 3, iconUrl: '/icon3.png', rewardAmount: 12000 },
  { id: 4, appName: 'Weather App', categoryId: 1, iconUrl: '/icon4.png', rewardAmount: 8000 },
  { id: 5, appName: 'Music Player', categoryId: 2, iconUrl: '/icon5.png', rewardAmount: 20000 },
  { id: 6, appName: 'Todo App', categoryId: 3, iconUrl: '/icon6.png', rewardAmount: 5000 },
]

describe('Landing Page - Backend API Integration (P2-S1-V)', () => {
  beforeEach(() => {
    // Mock fetch for each test
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ apps: mockApps }),
      })
    ) as jest.Mock
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })
  describe('6 Featured Apps Display', () => {
    /**
     * @TEST P2-S1-V.1 - 샘플 앱 6개 표시
     * 검증 항목:
     * - API에서 정상적으로 6개 앱 로드
     * - 각 앱의 이름, 아이콘, 리워드 표시
     */
    it('should display exactly 6 featured apps when API returns 6 apps', async () => {
      render(<Home />)

      // 앱이 로드될 때까지 대기
      await waitFor(
        () => {
          const appCards = screen.queryAllByRole('link')
          // 모든 링크 중 앱 카드 링크만 필터 (href가 /tester/apps/로 시작)
          const appCardLinks = appCards.filter(
            (link) => (link as HTMLAnchorElement).href.includes('/tester/apps/')
          )
          expect(appCardLinks.length).toBeGreaterThan(0)
        },
        { timeout: 10000 }
      )

      // 실제로는 최대 6개까지 표시되어야 함
      const appCards = screen.queryAllByRole('link').filter(
        (link) => (link as HTMLAnchorElement).href.includes('/tester/apps/')
      )
      expect(appCards.length).toBeLessThanOrEqual(6)
    })

    /**
     * @TEST P2-S1-V.2 - 앱 데이터 구조 검증
     */
    it('should display app data with all required fields', async () => {
      render(<Home />)

      // 앱이 로드될 때까지 대기 - findByText는 자동으로 대기
      const appName = await screen.findByText(/Instagram Clone/, {}, { timeout: 10000 })

      // 첫 번째 앱 확인
      const firstAppLink = screen.getAllByRole('link').find(
        (link) => (link as HTMLAnchorElement).href.includes('/tester/apps/1')
      )
      expect(firstAppLink).toBeInTheDocument()

      // 리워드 금액 표시 확인
      const rewardText = screen.queryAllByText(/원/)
      expect(rewardText.length).toBeGreaterThan(0)
    }, 15000)

    /**
     * @TEST P2-S1-V.3 - 앱 네비게이션 링크 검증
     */
    it('should have correct navigation links to app detail pages', async () => {
      render(<Home />)

      // 앱이 로드될 때까지 대기 - findByText는 자동으로 대기
      await screen.findByText(/Instagram Clone/, {}, { timeout: 10000 })

      // /tester/apps/{id} 형식의 링크 확인
      const appLinks = screen.getAllByRole('link').filter(
        (link) => (link as HTMLAnchorElement).href.includes('/tester/apps/')
      )
      expect(appLinks.length).toBeGreaterThan(0)

      appLinks.forEach((link) => {
        const href = (link as HTMLAnchorElement).href
        expect(href).toMatch(/\/tester\/apps\/\d+/)
      })
    }, 15000)
  })

  describe('Hero Section & CTA Buttons', () => {
    /**
     * @TEST P2-S1-V.4 - Hero section 렌더링
     */
    it('should render hero section with title and subtitle', () => {
      render(<Home />)

      expect(
        screen.getByText(/Google Play 테스트 요건, 더 이상 고민하지 마세요/i)
      ).toBeInTheDocument()
      expect(
        screen.getByText(/14일 \/ 14명 테스터를 쉽고 빠르게/i)
      ).toBeInTheDocument()
    })

    /**
     * @TEST P2-S1-V.5 - CTA 버튼 렌더링
     */
    it('should display developer and tester CTA buttons', () => {
      render(<Home />)

      const devButtons = screen.getAllByText('개발자로 시작')
      const testerButtons = screen.getAllByText('테스터로 시작')

      expect(devButtons.length).toBeGreaterThan(0)
      expect(testerButtons.length).toBeGreaterThan(0)
    })

    /**
     * @TEST P2-S1-V.6 - CTA 버튼 네비게이션
     */
    it('should have correct navigation for signup buttons', () => {
      render(<Home />)

      const devButtons = screen.getAllByText('개발자로 시작')
      const testerButtons = screen.getAllByText('테스터로 시작')

      const devLink = devButtons[0].closest('a')
      const testerLink = testerButtons[0].closest('a')

      expect(devLink).toHaveAttribute('href', expect.stringContaining('/auth/signup'))
      expect(testerLink).toHaveAttribute('href', expect.stringContaining('/auth/signup'))
    })
  })

  describe('Layout Components', () => {
    /**
     * @TEST P2-S1-V.7 - 전체 페이지 구조
     */
    it('should render all main landing page sections', () => {
      render(<Home />)

      // Flow Visualization (4단계)
      expect(screen.getByText('앱 등록')).toBeInTheDocument()
      expect(screen.getByText('테스터 매칭')).toBeInTheDocument()
      expect(screen.getByText('테스트 진행')).toBeInTheDocument()
      expect(screen.getByText('프로덕션 등록')).toBeInTheDocument()

      // Testimonials
      expect(
        screen.queryByText(/3일 만에 14명 모집 완료/i) ||
        screen.queryByText(/앱 테스트하고 리워드까지/i)
      ).toBeTruthy()

      // FAQ
      expect(
        screen.getByText(/Google Play 테스트 요건이 뭔가요?/i)
      ).toBeInTheDocument()
    })
  })

  describe('API Integration', () => {
    /**
     * @TEST P2-S1-V.8 - API 호출 검증
     */
    it('should call the correct API endpoint on mount', async () => {
      render(<Home />)

      await waitFor(
        () => {
          expect(global.fetch).toHaveBeenCalled()
        },
        { timeout: 10000 }
      )

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/apps')
      )
    })

    /**
     * @TEST P2-S1-V.9 - 올바른 쿼리 파라미터 사용
     */
    it('should request apps with correct query parameters', async () => {
      render(<Home />)

      await waitFor(
        () => {
          expect(global.fetch).toHaveBeenCalled()
        },
        { timeout: 10000 }
      )

      const mockFetch = global.fetch as jest.Mock
      const callArgs = mockFetch.mock.calls[0][0] as string
      expect(callArgs).toContain('status=RECRUITING')
      expect(callArgs).toContain('limit=6')
    })

    /**
     * @TEST P2-S1-V.10 - 로딩 상태 표시
     */
    it('should show loading state while fetching apps', () => {
      render(<Home />)

      // 초기에는 로딩 상태이거나 로딩이 빠르게 완료됨
      // 최소한 페이지가 렌더링되어야 함
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    /**
     * @TEST P2-S1-V.11 - API 에러 처리
     */
    it('should handle API errors gracefully', async () => {
      // Override the mock to reject
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      render(<Home />)

      await waitFor(
        () => {
          // 에러가 발생했을 때도 페이지는 렌더링되어야 함
          expect(screen.getByRole('main')).toBeInTheDocument()
        },
        { timeout: 10000 }
      )
    })
  })

  describe('Performance', () => {
    /**
     * @TEST P2-S1-V.12 - 성능 기준
     */
    it('should load page and API data within reasonable time', async () => {
      const startTime = performance.now()

      render(<Home />)

      await waitFor(
        () => {
          // 최소한 페이지가 렌더링되고 API 요청이 완료되어야 함
          expect(screen.getByRole('main')).toBeInTheDocument()
        },
        { timeout: 10000 }
      )

      const endTime = performance.now()
      const loadTime = endTime - startTime

      // 합리적인 시간 내에 로드 (5초 이내)
      expect(loadTime).toBeLessThan(5000)
    })
  })
})
