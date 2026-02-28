// @TASK T-03 - 내 테스트 현황 테스트
// @SPEC specs/screens/tester-participations.yaml

import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import ParticipationsPage from './page'
import { Participation, Application } from '@/types/participation'

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// Mock fetch
global.fetch = jest.fn()

describe('T-03: 내 테스트 현황', () => {
  const mockRouter = {
    push: jest.fn(),
  }

  const mockSession = {
    user: {
      id: 1,
      email: 'tester@test.com',
      role: 'TESTER',
      name: 'Test Tester',
    },
    expires: '2026-12-31',
  }

  const mockActiveParticipations: Participation[] = [
    {
      id: 1,
      testerId: 1,
      appId: 101,
      status: 'ACTIVE',
      joinedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7일 전
      lastAppRunAt: new Date().toISOString(), // 오늘
      dropReason: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      app: {
        id: 101,
        appName: '테스트 앱 1',
        iconUrl: 'https://example.com/icon1.png',
        testStartDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        testEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7일 후
        rewardAmount: 5000,
        rewardType: 'BASIC',
        testLink: 'https://play.google.com/test1',
      },
    },
    {
      id: 2,
      testerId: 1,
      appId: 102,
      status: 'ACTIVE',
      joinedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3일 전
      lastAppRunAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1일 전 (오늘 실행 안함)
      dropReason: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      app: {
        id: 102,
        appName: '테스트 앱 2',
        iconUrl: null,
        testStartDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        testEndDate: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000).toISOString(), // 11일 후
        rewardAmount: 3000,
        rewardType: 'BASIC',
        testLink: 'https://play.google.com/test2',
      },
    },
  ]

  const mockCompletedParticipations: Participation[] = [
    {
      id: 3,
      testerId: 1,
      appId: 103,
      status: 'COMPLETED',
      joinedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      lastAppRunAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      dropReason: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      app: {
        id: 103,
        appName: '완료된 앱',
        iconUrl: 'https://example.com/icon3.png',
        testStartDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        testEndDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        rewardAmount: 10000,
        rewardType: 'WITH_FEEDBACK',
        testLink: 'https://play.google.com/test3',
      },
    },
  ]

  const mockPendingApplications: Application[] = [
    {
      id: 1,
      testerId: 1,
      appId: 201,
      status: 'PENDING',
      appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      rejectedReason: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      app: {
        id: 201,
        appName: '지원 중인 앱',
        iconUrl: 'https://example.com/icon201.png',
        testStartDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        testEndDate: new Date(Date.now() + 19 * 24 * 60 * 60 * 1000).toISOString(),
        rewardAmount: 7000,
        rewardType: 'BASIC',
      },
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useSession as jest.Mock).mockReturnValue({
      data: mockSession,
      status: 'authenticated',
    })
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/participations')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ participations: [...mockActiveParticipations, ...mockCompletedParticipations] }),
        })
      }
      if (url.includes('/api/applications')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ applications: mockPendingApplications }),
        })
      }
      return Promise.reject(new Error('Unknown URL'))
    })
  })

  describe('초기 로드 (진행 중 탭)', () => {
    it('페이지 접속 시 진행 중인 테스트를 표시한다', async () => {
      render(<ParticipationsPage />)

      // 데이터 로딩 완료 대기
      await waitFor(() => {
        expect(screen.queryByText('데이터를 불러오는 중...')).not.toBeInTheDocument()
      }, { timeout: 3000 })

      // 진행 중 탭이 기본 선택
      const activeTab = screen.getByRole('button', { name: /진행중/i })
      expect(activeTab).toHaveClass(/bg-green-600|text-white/)

      // 진행 중인 테스트 표시
      await waitFor(() => {
        expect(screen.getByText('테스트 앱 1')).toBeInTheDocument()
      })
      expect(screen.getByText('테스트 앱 2')).toBeInTheDocument()
    })

    it('D-Day를 계산하여 표시한다', async () => {
      render(<ParticipationsPage />)

      await waitFor(() => {
        expect(screen.getByText('테스트 앱 1')).toBeInTheDocument()
      })

      // D-7 표시
      expect(screen.getByText(/D-7/i)).toBeInTheDocument()

      // D-11 표시
      expect(screen.getByText(/D-11/i)).toBeInTheDocument()
    })

    it('프로그레스 바를 표시한다', async () => {
      render(<ParticipationsPage />)

      await waitFor(() => {
        expect(screen.getByText('테스트 앱 1')).toBeInTheDocument()
      })

      // "7/14일차" 표시 (7일 경과)
      expect(screen.getByText(/7\/14일차/i)).toBeInTheDocument()

      // "3/14일차" 표시 (3일 경과)
      expect(screen.getByText(/3\/14일차/i)).toBeInTheDocument()
    })

    it('오늘 실행 여부를 표시한다', async () => {
      render(<ParticipationsPage />)

      await waitFor(() => {
        expect(screen.getByText('테스트 앱 1')).toBeInTheDocument()
      })

      // 오늘 실행한 앱: "오늘 실행됨" 텍스트 확인
      expect(screen.getByText('오늘 실행됨')).toBeInTheDocument()

      // 오늘 실행 안한 앱: "실행 필요" 텍스트 확인
      expect(screen.getByText('실행 필요')).toBeInTheDocument()
    })
  })

  describe('탭 전환', () => {
    it('완료 탭 클릭 시 완료된 테스트를 표시한다', async () => {
      const user = userEvent.setup()
      render(<ParticipationsPage />)

      await waitFor(() => {
        expect(screen.getByText('테스트 앱 1')).toBeInTheDocument()
      })

      // 완료 탭 클릭
      const completedTab = screen.getByRole('button', { name: /완료/i })
      await user.click(completedTab)

      // 완료된 테스트만 표시
      expect(screen.getByText('완료된 앱')).toBeInTheDocument()
      expect(screen.queryByText('테스트 앱 1')).not.toBeInTheDocument()
      expect(screen.queryByText('테스트 앱 2')).not.toBeInTheDocument()
    })

    it('지원중 탭 클릭 시 지원 중인 앱을 표시한다', async () => {
      const user = userEvent.setup()
      render(<ParticipationsPage />)

      await waitFor(() => {
        expect(screen.getByText('테스트 앱 1')).toBeInTheDocument()
      })

      // 지원중 탭 클릭
      const pendingTab = screen.getByRole('button', { name: /지원중/i })
      await user.click(pendingTab)

      // 지원 중인 앱만 표시
      expect(screen.getByText('지원 중인 앱')).toBeInTheDocument()
      expect(screen.queryByText('테스트 앱 1')).not.toBeInTheDocument()
    })
  })

  describe('빈 상태', () => {
    it('진행 중인 테스트가 없을 때 빈 상태를 표시한다', async () => {
      ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/participations')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ participations: [] }),
          })
        }
        if (url.includes('/api/applications')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ applications: [] }),
          })
        }
        return Promise.reject(new Error('Unknown URL'))
      })

      render(<ParticipationsPage />)

      await waitFor(() => {
        expect(screen.getByText(/참여 중인 테스트가 없습니다/i)).toBeInTheDocument()
      })
    })
  })

  describe('인증 및 권한', () => {
    it('인증되지 않은 경우 로그인 페이지로 리다이렉트한다', () => {
      ;(useSession as jest.Mock).mockReturnValue({
        data: null,
        status: 'unauthenticated',
      })

      render(<ParticipationsPage />)

      expect(mockRouter.push).toHaveBeenCalledWith('/auth/login')
    })

    it('TESTER가 아닌 경우 리다이렉트한다', () => {
      ;(useSession as jest.Mock).mockReturnValue({
        data: { ...mockSession, user: { ...mockSession.user, role: 'DEVELOPER' } },
        status: 'authenticated',
      })

      render(<ParticipationsPage />)

      expect(mockRouter.push).toHaveBeenCalledWith('/developer')
    })
  })

  describe('클릭 이벤트', () => {
    it('피드백 작성 버튼 클릭 시 피드백 페이지로 이동한다', async () => {
      const user = userEvent.setup()
      render(<ParticipationsPage />)

      await waitFor(() => {
        expect(screen.getByText('테스트 앱 1')).toBeInTheDocument()
      })

      const feedbackButtons = screen.getAllByText('피드백 작성')
      if (feedbackButtons.length > 0) {
        await user.click(feedbackButtons[0])
        expect(mockRouter.push).toHaveBeenCalledWith('/tester/participations/1/feedback')
      }
    })
  })

  describe('Google Play 버튼', () => {
    it('"Google Play에서 열기" 버튼을 표시한다', async () => {
      render(<ParticipationsPage />)

      await waitFor(() => {
        expect(screen.getByText('테스트 앱 1')).toBeInTheDocument()
      })

      const playButtons = screen.getAllByText(/Google Play에서 열기/i)
      expect(playButtons.length).toBeGreaterThan(0)
    })
  })
})
