import { render, screen, waitFor } from '@testing-library/react'
import Home from './page'
import '@testing-library/jest-dom'

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>
  }
})

// Mock fetch
global.fetch = jest.fn()

describe('Landing Page (S-01)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Initial Load', () => {
    it('should display hero section with title and subtitle', () => {
      render(<Home />)

      expect(screen.getByText(/Google Play 테스트 요건, 더 이상 고민하지 마세요/i)).toBeInTheDocument()
      expect(screen.getByText(/14일 \/ 14명 테스터를 쉽고 빠르게/i)).toBeInTheDocument()
    })

    it('should display CTA buttons in hero section', () => {
      render(<Home />)

      const devButton = screen.getAllByText('개발자로 시작')[0]
      const testerButton = screen.getAllByText('테스터로 시작')[0]

      expect(devButton).toBeInTheDocument()
      expect(testerButton).toBeInTheDocument()
    })

    it('should display 4-step flow visualization', () => {
      render(<Home />)

      expect(screen.getByText('앱 등록')).toBeInTheDocument()
      expect(screen.getByText('테스터 매칭')).toBeInTheDocument()
      expect(screen.getByText('테스트 진행')).toBeInTheDocument()
      expect(screen.getByText('프로덕션 등록')).toBeInTheDocument()
    })

    it('should fetch and display 6 featured apps', async () => {
      const mockApps = [
        { id: 1, appName: 'App 1', categoryId: 1, iconUrl: '/icon1.png', rewardAmount: 5000 },
        { id: 2, appName: 'App 2', categoryId: 2, iconUrl: '/icon2.png', rewardAmount: 10000 },
        { id: 3, appName: 'App 3', categoryId: 1, iconUrl: '/icon3.png', rewardAmount: 7000 },
        { id: 4, appName: 'App 4', categoryId: 3, iconUrl: '/icon4.png', rewardAmount: 8000 },
        { id: 5, appName: 'App 5', categoryId: 2, iconUrl: '/icon5.png', rewardAmount: 6000 },
        { id: 6, appName: 'App 6', categoryId: 1, iconUrl: '/icon6.png', rewardAmount: 9000 },
      ]

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ apps: mockApps }),
      })

      render(<Home />)

      await waitFor(() => {
        expect(screen.getByText('App 1')).toBeInTheDocument()
      })

      expect(screen.getByText('App 2')).toBeInTheDocument()
      expect(screen.getByText('App 3')).toBeInTheDocument()
      expect(screen.getByText('App 4')).toBeInTheDocument()
      expect(screen.getByText('App 5')).toBeInTheDocument()
      expect(screen.getByText('App 6')).toBeInTheDocument()
    })

    it('should display testimonials section', () => {
      render(<Home />)

      expect(screen.getByText(/3일 만에 14명 모집 완료/i)).toBeInTheDocument()
      expect(screen.getByText(/앱 테스트하고 리워드까지/i)).toBeInTheDocument()
    })

    it('should display FAQ section', () => {
      render(<Home />)

      expect(screen.getByText(/Google Play 테스트 요건이 뭔가요?/i)).toBeInTheDocument()
      expect(screen.getByText(/테스트 비용은 얼마인가요?/i)).toBeInTheDocument()
    })
  })

  describe('CTA Button Navigation', () => {
    it('should have correct href for developer signup button', () => {
      render(<Home />)

      const devButtons = screen.getAllByText('개발자로 시작')
      const heroDevButton = devButtons[0].closest('a')

      expect(heroDevButton).toHaveAttribute('href', '/auth/signup?role=developer')
    })

    it('should have correct href for tester signup button', () => {
      render(<Home />)

      const testerButtons = screen.getAllByText('테스터로 시작')
      const heroTesterButton = testerButtons[0].closest('a')

      expect(heroTesterButton).toHaveAttribute('href', '/auth/signup?role=tester')
    })
  })

  describe('API Integration', () => {
    it('should fetch apps from correct endpoint', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ apps: [] }),
      })

      render(<Home />)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/apps?status=RECRUITING&limit=6')
      })
    })

    it('should handle API error gracefully', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'))

      render(<Home />)

      await waitFor(() => {
        expect(screen.queryByText('App 1')).not.toBeInTheDocument()
      })
    })
  })
})
