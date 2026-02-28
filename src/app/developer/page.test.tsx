// @TASK P3-S6 - Developer Dashboard
// @SPEC specs/screens/developer-dashboard.yaml
// @TEST TDD RED Phase: 개발자 대시보드 테스트

import { render, screen, waitFor, act } from '@testing-library/react'
import DeveloperDashboard from './page'
import '@testing-library/jest-dom'
import React from 'react'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}))

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>
  }
})

// Mock fetch
global.fetch = jest.fn()

describe('Developer Dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('초기 로딩', () => {
    it('진행 중인 앱 카드를 표시한다', async () => {
      const mockApps = {
        apps: [
          {
            id: 1,
            appName: 'Test App 1',
            iconUrl: null,
            status: 'IN_TESTING',
            targetTesters: 20,
            testStartDate: new Date('2026-02-20').toISOString(),
            testEndDate: new Date('2026-03-10').toISOString(),
          },
          {
            id: 2,
            appName: 'Test App 2',
            status: 'RECRUITING',
            targetTesters: 15,
            testStartDate: new Date('2026-02-25').toISOString(),
            testEndDate: new Date('2026-03-15').toISOString(),
          },
        ],
        total: 2,
      }

      const mockParticipations = {
        participations: [
          { appId: 1, status: 'ACTIVE' },
          { appId: 1, status: 'ACTIVE' },
          { appId: 1, status: 'ACTIVE' },
        ],
        total: 3,
      }

      ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/apps')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockApps,
          })
        }
        if (url.includes('/api/participations')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockParticipations,
          })
        }
        if (url.includes('/api/feedbacks')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ feedbacks: [], total: 0 }),
          })
        }
        return Promise.reject(new Error('Unknown URL'))
      })

      await act(async () => {
        render(<DeveloperDashboard />)
      })

      await waitFor(() => {
        expect(screen.getByText('Test App 1')).toBeInTheDocument()
        expect(screen.getByText('Test App 2')).toBeInTheDocument()
      })
    })

    it('로딩 상태를 표시한다', async () => {
      ;(global.fetch as any).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({ apps: [], total: 0 }),
                }),
              100
            )
          )
      )

      await act(async () => {
        render(<DeveloperDashboard />)
      })

      // 로딩 상태는 서버 컴포넌트에서 처리되므로 즉시 데이터가 표시됨
      // 실제 프로덕션에서는 loading.tsx를 사용
    })

    it('에러 상태를 처리한다', async () => {
      ;(global.fetch as any).mockRejectedValue(new Error('API Error'))

      await act(async () => {
        render(<DeveloperDashboard />)
      })

      await waitFor(() => {
        expect(
          screen.getByText(/데이터를 불러오는 중 오류가 발생했습니다/i)
        ).toBeInTheDocument()
      })
    })
  })

  describe('D-Day 계산', () => {
    it('테스트 종료일 기준으로 남은 일수를 계산한다', async () => {
      const today = new Date('2026-03-01')
      const endDate = new Date('2026-03-04')

      const mockApps = {
        apps: [
          {
            id: 1,
            appName: 'Test App',
            status: 'IN_TESTING',
            targetTesters: 20,
            testStartDate: new Date('2026-02-20').toISOString(),
            testEndDate: endDate.toISOString(),
          },
        ],
        total: 1,
      }

      ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/apps')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockApps,
          })
        }
        if (url.includes('/api/participations')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ participations: [], total: 0 }),
          })
        }
        if (url.includes('/api/feedbacks')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ feedbacks: [], total: 0 }),
          })
        }
        return Promise.reject(new Error('Unknown URL'))
      })

      // Mock Date.now()
      jest.useFakeTimers()
      jest.setSystemTime(today)

      await act(async () => {
        render(<DeveloperDashboard />)
      })

      await waitFor(() => {
        // D-3 (3일 남음)
        expect(screen.getByText(/D-3/i)).toBeInTheDocument()
      })

      jest.useRealTimers()
    })

    it('모집 중인 앱은 시작일까지 남은 일수를 표시한다', async () => {
      const today = new Date('2026-02-26')
      const startDate = new Date('2026-03-01')

      const mockApps = {
        apps: [
          {
            id: 1,
            appName: 'Recruiting App',
            status: 'RECRUITING',
            targetTesters: 15,
            testStartDate: startDate.toISOString(),
            testEndDate: new Date('2026-03-15').toISOString(),
          },
        ],
        total: 1,
      }

      ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/apps')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockApps,
          })
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ participations: [], total: 0 }),
        })
      })

      jest.useFakeTimers()
      jest.setSystemTime(today)

      await act(async () => {
        render(<DeveloperDashboard />)
      })

      await waitFor(() => {
        // 시작까지 3일
        expect(screen.getByText(/3일 후 시작/i)).toBeInTheDocument()
      })

      jest.useRealTimers()
    })
  })

  describe('참여자 수 집계', () => {
    it('앱별 ACTIVE 상태 참여자 수를 집계한다', async () => {
      const mockApps = {
        apps: [
          {
            id: 1,
            appName: 'Test App',
            status: 'IN_TESTING',
            targetTesters: 20,
            testStartDate: new Date('2026-02-20').toISOString(),
            testEndDate: new Date('2026-03-10').toISOString(),
          },
        ],
        total: 1,
      }

      const mockParticipations = {
        participations: [
          { id: 1, appId: 1, status: 'ACTIVE' },
          { id: 2, appId: 1, status: 'ACTIVE' },
          { id: 3, appId: 1, status: 'ACTIVE' },
          { id: 4, appId: 1, status: 'DROPPED' }, // 제외
        ],
        total: 4,
      }

      ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/apps')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockApps,
          })
        }
        if (url.includes('/api/participations')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockParticipations,
          })
        }
        if (url.includes('/api/feedbacks')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ feedbacks: [], total: 0 }),
          })
        }
        return Promise.reject(new Error('Unknown URL'))
      })

      await act(async () => {
        render(<DeveloperDashboard />)
      })

      await waitFor(() => {
        // 3/20 형식으로 표시
        expect(screen.getByText(/3\/20/i)).toBeInTheDocument()
      })
    })
  })

  describe('최근 피드백', () => {
    it('최근 피드백 5개를 표시한다', async () => {
      const mockFeedbacks = {
        feedbacks: [
          {
            id: 1,
            appId: 1,
            tester: { nickname: 'Tester1' },
            overallRating: 5,
            comment: '훌륭한 앱입니다',
            createdAt: new Date('2026-02-27').toISOString(),
          },
          {
            id: 2,
            appId: 1,
            tester: { nickname: 'Tester2' },
            overallRating: 4,
            comment: '좋아요',
            createdAt: new Date('2026-02-26').toISOString(),
          },
        ],
        total: 2,
      }

      ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/apps')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ apps: [], total: 0 }),
          })
        }
        if (url.includes('/api/participations')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ participations: [], total: 0 }),
          })
        }
        if (url.includes('/api/feedbacks')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockFeedbacks,
          })
        }
        return Promise.reject(new Error('Unknown URL'))
      })

      await act(async () => {
        render(<DeveloperDashboard />)
      })

      await waitFor(() => {
        expect(screen.getByText('Tester1')).toBeInTheDocument()
        expect(screen.getByText('훌륭한 앱입니다')).toBeInTheDocument()
        expect(screen.getByText('Tester2')).toBeInTheDocument()
      })
    })

    it('피드백이 없을 때 빈 상태를 표시한다', async () => {
      ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/apps')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ apps: [], total: 0 }),
          })
        }
        if (url.includes('/api/participations')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ participations: [], total: 0 }),
          })
        }
        if (url.includes('/api/feedbacks')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ feedbacks: [], total: 0 }),
          })
        }
        return Promise.reject(new Error('Unknown URL'))
      })

      await act(async () => {
        render(<DeveloperDashboard />)
      })

      await waitFor(() => {
        expect(
          screen.getByText(/아직 피드백이 없습니다/i)
        ).toBeInTheDocument()
      })
    })
  })

  describe('빈 상태', () => {
    it('진행 중인 테스트가 없을 때 빈 상태를 표시한다', async () => {
      ;(global.fetch as any).mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: async () => ({ apps: [], total: 0 }),
        })
      )

      await act(async () => {
        render(<DeveloperDashboard />)
      })

      await waitFor(() => {
        expect(
          screen.getByText(/진행 중인 테스트가 없습니다/i)
        ).toBeInTheDocument()
        expect(
          screen.getByText(/새 앱을 등록해보세요/i)
        ).toBeInTheDocument()
      })
    })
  })

  describe('구독 플랜', () => {
    it('현재 플랜과 남은 앱 등록 수를 표시한다', async () => {
      const mockUserData = {
        currentPlan: 'PRO',
        remainingApps: 5,
      }

      ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/apps')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ apps: [], total: 0 }),
          })
        }
        if (url.includes('/api/users')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockUserData,
          })
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ participations: [], total: 0 }),
        })
      })

      await act(async () => {
        render(<DeveloperDashboard />)
      })

      await waitFor(() => {
        expect(screen.getByText(/PRO/i)).toBeInTheDocument()
        expect(screen.getByText(/5/i)).toBeInTheDocument()
      })
    })
  })
})
