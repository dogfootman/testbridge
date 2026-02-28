// @TASK T-02 - App Detail Tester (앱 상세 테스터뷰)
// @SPEC specs/screens/app-detail-tester.yaml
// @TEST TDD RED Phase - Tests First

import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import AppDetailTesterPage from './page'

// Mock modules
jest.mock('next-auth/react')
jest.mock('next/navigation')

// Mock fetch
global.fetch = jest.fn()

const mockSession = {
  user: {
    id: '1',
    email: 'tester@test.com',
    nickname: 'testUser',
    role: 'TESTER',
  },
}

const mockApp = {
  id: 1,
  appName: 'Test App',
  packageName: 'com.test.app',
  description: 'This is a test app description',
  status: 'RECRUITING',
  testType: 'PAID_REWARD',
  targetTesters: 20,
  testStartDate: '2026-03-01T00:00:00.000Z',
  testEndDate: '2026-03-14T00:00:00.000Z',
  testLink: 'https://test.com/download',
  rewardType: 'BASIC',
  rewardAmount: 5000,
  feedbackRequired: true,
  testGuide: 'Test guide content',
  category: {
    id: 1,
    name: 'Games',
    slug: 'games',
  },
  developer: {
    id: 2,
    nickname: 'Developer',
    profileImageUrl: null,
  },
}

const mockAppImages = [
  { id: 1, appId: 1, url: 'https://example.com/screen1.png', type: 'SCREENSHOT', sortOrder: 1 },
  { id: 2, appId: 1, url: 'https://example.com/screen2.png', type: 'SCREENSHOT', sortOrder: 2 },
  { id: 3, appId: 1, url: 'https://example.com/screen3.png', type: 'SCREENSHOT', sortOrder: 3 },
]

const mockParticipations = [
  { id: 1, appId: 1, testerId: 2, status: 'ACTIVE', joinedAt: '2026-03-01T00:00:00.000Z' },
  { id: 2, appId: 1, testerId: 3, status: 'ACTIVE', joinedAt: '2026-03-01T00:00:00.000Z' },
]

describe('AppDetailTesterPage', () => {
  const mockPush = jest.fn()
  const mockUseSession = useSession as jest.MockedFunction<typeof useSession>
  const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
  const mockUseParams = useParams as jest.MockedFunction<typeof useParams>

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseSession.mockReturnValue({
      data: mockSession,
      status: 'authenticated',
      update: jest.fn(),
    } as any)
    mockUseRouter.mockReturnValue({ push: mockPush } as any)
    mockUseParams.mockReturnValue({ id: '1' })
  })

  describe('🔴 RED: 앱 상세 정보 렌더링', () => {
    it('앱 정보 표시 (이름, 설명, 카테고리, 리워드)', async () => {
      // Mock API responses
      ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/apps/1')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockApp),
          })
        }
        if (url.includes('/api/app-images')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockAppImages),
          })
        }
        if (url.includes('/api/participations')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockParticipations),
          })
        }
        if (url.includes('/api/applications?appId=1')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([]),
          })
        }
        return Promise.reject(new Error('Not found'))
      })

      render(<AppDetailTesterPage />)

      await waitFor(() => {
        expect(screen.getByText('Test App')).toBeInTheDocument()
      })

      expect(screen.getByText('This is a test app description')).toBeInTheDocument()
      expect(screen.getByText('Games')).toBeInTheDocument()
      expect(screen.getByText(/5,000원/)).toBeInTheDocument()
    })

    it('개발자 정보 표시', async () => {
      ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/apps/1')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockApp),
          })
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        })
      })

      render(<AppDetailTesterPage />)

      await waitFor(() => {
        expect(screen.getByText('Developer')).toBeInTheDocument()
      })
    })

    it('남은 자리 계산 및 표시', async () => {
      ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/apps/1')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockApp),
          })
        }
        if (url.includes('/api/participations')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockParticipations),
          })
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        })
      })

      render(<AppDetailTesterPage />)

      await waitFor(() => {
        // targetTesters: 20, participations: 2 => 18 남음
        expect(screen.getByText(/18.*남음/)).toBeInTheDocument()
      })
    })
  })

  describe('🔴 RED: 스크린샷 갤러리', () => {
    it('스크린샷 갤러리 표시', async () => {
      ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/apps/1')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockApp),
          })
        }
        if (url.includes('/api/app-images')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockAppImages),
          })
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        })
      })

      render(<AppDetailTesterPage />)

      await waitFor(() => {
        const images = screen.getAllByRole('img', { name: /screenshot/i })
        expect(images.length).toBeGreaterThan(0)
      })
    })
  })

  describe('🔴 RED: 지원하기 버튼 동작', () => {
    it('지원하지 않은 경우 "테스트 지원하기" 버튼 표시', async () => {
      ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/apps/1')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockApp),
          })
        }
        if (url.includes('/api/applications?appId=1')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([]), // 지원 내역 없음
          })
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        })
      })

      render(<AppDetailTesterPage />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /테스트 지원하기/i })).toBeInTheDocument()
      })
    })

    it('이미 지원한 경우 버튼 비활성화', async () => {
      const existingApplication = {
        id: 1,
        appId: 1,
        testerId: 1,
        status: 'PENDING',
        deviceInfo: 'iPhone 15',
        message: 'Test message',
        appliedAt: '2026-03-01T00:00:00.000Z',
      }

      ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/apps/1')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockApp),
          })
        }
        if (url.includes('/api/applications?appId=1')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([existingApplication]),
          })
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        })
      })

      render(<AppDetailTesterPage />)

      await waitFor(() => {
        const applyButton = screen.getByRole('button', { name: /지원 완료|승인 대기/i })
        expect(applyButton).toBeDisabled()
      })
    })

    it('지원하기 버튼 클릭 시 모달 열림', async () => {
      const user = userEvent.setup()

      ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/apps/1')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockApp),
          })
        }
        if (url.includes('/api/applications?appId=1')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([]),
          })
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        })
      })

      render(<AppDetailTesterPage />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /테스트 지원하기/i })).toBeInTheDocument()
      })

      const applyButton = screen.getByRole('button', { name: /테스트 지원하기/i })
      await user.click(applyButton)

      // 모달이 열리는지 확인
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      // 폼 필드 확인
      expect(screen.getByLabelText(/기기 정보/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/자기소개/i)).toBeInTheDocument()
    })
  })

  describe('🔴 RED: 지원서 제출', () => {
    it('지원서 제출 성공', async () => {
      const user = userEvent.setup()

      ;(global.fetch as jest.Mock).mockImplementation((url: string, options?: any) => {
        if (url.includes('/api/apps/1') && !options?.method) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockApp),
          })
        }
        if (url.includes('/api/applications?appId=1')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([]),
          })
        }
        if (url.includes('/api/applications') && options?.method === 'POST') {
          return Promise.resolve({
            ok: true,
            status: 201,
            json: () =>
              Promise.resolve({
                id: 1,
                appId: 1,
                testerId: 1,
                status: 'PENDING',
                deviceInfo: 'iPhone 15',
                message: 'I am interested',
                appliedAt: new Date().toISOString(),
              }),
          })
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        })
      })

      render(<AppDetailTesterPage />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /테스트 지원하기/i })).toBeInTheDocument()
      })

      const applyButton = screen.getByRole('button', { name: /테스트 지원하기/i })
      await user.click(applyButton)

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      // 폼 입력
      const deviceInput = screen.getByLabelText(/기기 정보/i)
      const messageInput = screen.getByLabelText(/자기소개/i)

      await user.type(deviceInput, 'iPhone 15')
      await user.type(messageInput, 'I am interested')

      // 제출 - "지원하기" 버튼 클릭 (모달 내부)
      const submitButton = within(screen.getByRole('dialog')).getByRole('button', { name: /^지원하기$/i })
      await user.click(submitButton)

      // 성공 메시지 확인
      await waitFor(() => {
        expect(screen.getByText(/지원이 완료되었습니다/i)).toBeInTheDocument()
      })
    })

    it('필수 필드 검증: 기기 정보 미입력', async () => {
      const user = userEvent.setup()

      ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/apps/1')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockApp),
          })
        }
        if (url.includes('/api/applications?appId=1')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([]),
          })
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        })
      })

      render(<AppDetailTesterPage />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /테스트 지원하기/i })).toBeInTheDocument()
      })

      const applyButton = screen.getByRole('button', { name: /테스트 지원하기/i })
      await user.click(applyButton)

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      // 기기 정보 입력하지 않고 제출 - "지원하기" 버튼 클릭 (모달 내부)
      const submitButton = within(screen.getByRole('dialog')).getByRole('button', { name: /^지원하기$/i })
      await user.click(submitButton)

      // 에러 메시지 확인
      await waitFor(() => {
        expect(screen.getByText(/기기 정보를 입력해주세요/i)).toBeInTheDocument()
      })
    })
  })

  describe('🔴 RED: 에러 처리', () => {
    it('앱을 찾을 수 없는 경우', async () => {
      ;(global.fetch as jest.Mock).mockImplementation(() => {
        return Promise.resolve({
          ok: false,
          status: 404,
          json: () => Promise.resolve({ error: 'App not found' }),
        })
      })

      render(<AppDetailTesterPage />)

      await waitFor(() => {
        expect(screen.getByText(/앱을 찾을 수 없습니다/i)).toBeInTheDocument()
      })
    })

    it('네트워크 에러', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

      render(<AppDetailTesterPage />)

      await waitFor(() => {
        expect(screen.getByText(/오류가 발생했습니다/i)).toBeInTheDocument()
      })
    })
  })

  describe('🔴 RED: 접근성', () => {
    it('모든 인터랙티브 요소에 적절한 role 속성', async () => {
      ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/apps/1')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockApp),
          })
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        })
      })

      render(<AppDetailTesterPage />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /테스트 지원하기/i })).toBeInTheDocument()
      })

      // 버튼 role 확인
      expect(screen.getByRole('button', { name: /테스트 지원하기/i })).toBeInTheDocument()
    })

    it('모달에 aria-modal 속성', async () => {
      const user = userEvent.setup()

      ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/apps/1')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockApp),
          })
        }
        if (url.includes('/api/applications?appId=1')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([]),
          })
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        })
      })

      render(<AppDetailTesterPage />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /테스트 지원하기/i })).toBeInTheDocument()
      })

      const applyButton = screen.getByRole('button', { name: /테스트 지원하기/i })
      await user.click(applyButton)

      await waitFor(() => {
        const modal = screen.getByRole('dialog')
        expect(modal).toHaveAttribute('aria-modal', 'true')
      })
    })
  })
})
