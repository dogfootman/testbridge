// @TASK T-04 - 피드백 작성 페이지 테스트
// @SPEC specs/screens/feedback-form.yaml
// @TEST src/app/tester/participations/[id]/feedback/page.test.tsx

import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import FeedbackPage from './page'

// Mock modules
jest.mock('next-auth/react')
jest.mock('next/navigation')

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockUseParams = useParams as jest.MockedFunction<typeof useParams>

const mockPush = jest.fn()
const mockRouter = { push: mockPush }

// Mock fetch
global.fetch = jest.fn()

describe('FeedbackPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseRouter.mockReturnValue(mockRouter as any)
    mockUseParams.mockReturnValue({ id: '123' })
  })

  describe('인증 및 권한', () => {
    it('로그인하지 않은 경우 로그인 페이지로 리다이렉트', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn(),
      })

      render(<FeedbackPage />)

      expect(mockPush).toHaveBeenCalledWith('/auth/login')
    })

    it('DEVELOPER 역할인 경우 개발자 페이지로 리다이렉트', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { email: 'dev@example.com', role: 'DEVELOPER' },
          expires: '2026-12-31',
        },
        status: 'authenticated',
        update: jest.fn(),
      })

      render(<FeedbackPage />)

      expect(mockPush).toHaveBeenCalledWith('/developer')
    })
  })

  describe('데이터 로딩', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: {
          user: { email: 'tester@example.com', role: 'TESTER' },
          expires: '2026-12-31',
        },
        status: 'authenticated',
        update: jest.fn(),
      })
    })

    it('참여 정보를 로딩하여 표시', async () => {
      const mockParticipation = {
        id: 123,
        app: {
          id: 1,
          appName: 'Test App',
          iconUrl: 'https://example.com/icon.png',
        },
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockParticipation,
      })

      render(<FeedbackPage />)

      await waitFor(() => {
        expect(screen.getByText('Test App')).toBeInTheDocument()
      })
    })

    it('참여 정보 로딩 실패 시 에러 메시지 표시', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      })

      render(<FeedbackPage />)

      await waitFor(() => {
        expect(screen.getByText(/참여 정보를 찾을 수 없습니다/i)).toBeInTheDocument()
      })
    })
  })

  describe('피드백 폼 렌더링', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: {
          user: { email: 'tester@example.com', role: 'TESTER' },
          expires: '2026-12-31',
        },
        status: 'authenticated',
        update: jest.fn(),
      })

      const mockParticipation = {
        id: 123,
        app: {
          id: 1,
          appName: 'Test App',
          iconUrl: 'https://example.com/icon.png',
        },
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockParticipation,
      })
    })

    it('전체 별점 컴포넌트를 렌더링', async () => {
      render(<FeedbackPage />)

      await waitFor(() => {
        expect(screen.getByText(/전체 만족도/i)).toBeInTheDocument()
      })
    })

    it('항목별 별점 4개 (UI/UX, 성능, 기능, 안정성)를 렌더링', async () => {
      render(<FeedbackPage />)

      await waitFor(() => {
        expect(screen.getByText(/UI\/UX/i)).toBeInTheDocument()
        expect(screen.getByText(/성능/i)).toBeInTheDocument()
        expect(screen.getByText(/기능/i)).toBeInTheDocument()
        expect(screen.getByText(/안정성/i)).toBeInTheDocument()
      })
    })

    it('텍스트 코멘트 입력란을 렌더링', async () => {
      render(<FeedbackPage />)

      await waitFor(() => {
        const textarea = screen.getByPlaceholderText(/앱 사용 소감을 자유롭게 작성해주세요/i)
        expect(textarea).toBeInTheDocument()
      })
    })

    it('버그 리포트 선택 섹션을 렌더링', async () => {
      render(<FeedbackPage />)

      await waitFor(() => {
        expect(screen.getByText(/버그 리포트/i)).toBeInTheDocument()
      })
    })

    it('제출 버튼을 렌더링', async () => {
      render(<FeedbackPage />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /제출/i })).toBeInTheDocument()
      })
    })
  })

  describe('별점 입력', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: {
          user: { email: 'tester@example.com', role: 'TESTER' },
          expires: '2026-12-31',
        },
        status: 'authenticated',
        update: jest.fn(),
      })

      const mockParticipation = {
        id: 123,
        app: {
          id: 1,
          appName: 'Test App',
          iconUrl: 'https://example.com/icon.png',
        },
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockParticipation,
      })
    })

    it('전체 별점을 클릭하여 선택 가능', async () => {
      render(<FeedbackPage />)

      await waitFor(() => {
        expect(screen.getByText(/전체 만족도/i)).toBeInTheDocument()
      })

      const stars = screen.getAllByTestId(/overall-star-/i)
      expect(stars.length).toBeGreaterThanOrEqual(5)

      fireEvent.click(stars[3]) // 4점 선택

      // 4점이 선택되었는지 확인 (filled 클래스 또는 aria-label 등으로)
      expect(stars[3]).toHaveAttribute('aria-pressed', 'true')
    })

    it('항목별 별점을 각각 선택 가능', async () => {
      render(<FeedbackPage />)

      await waitFor(() => {
        expect(screen.getByText(/UI\/UX/i)).toBeInTheDocument()
      })

      const uiStars = screen.getAllByTestId(/ui-ux-star-/i)
      expect(uiStars.length).toBeGreaterThanOrEqual(5)

      fireEvent.click(uiStars[4]) // 5점 선택

      expect(uiStars[4]).toHaveAttribute('aria-pressed', 'true')
    })
  })

  describe('피드백 제출', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: {
          user: { email: 'tester@example.com', role: 'TESTER' },
          expires: '2026-12-31',
        },
        status: 'authenticated',
        update: jest.fn(),
      })

      const mockParticipation = {
        id: 123,
        app: {
          id: 1,
          appName: 'Test App',
          iconUrl: 'https://example.com/icon.png',
        },
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockParticipation,
      })
    })

    it('필수 필드 누락 시 에러 메시지 표시 (전체 별점 미입력)', async () => {
      render(<FeedbackPage />)

      await waitFor(() => {
        expect(screen.getByText(/전체 만족도/i)).toBeInTheDocument()
      })

      const submitButton = screen.getByRole('button', { name: /제출/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/전체 만족도를 선택해주세요/i)).toBeInTheDocument()
      })
    })

    it('피드백 제출 성공 시 API 호출 및 리다이렉트', async () => {
      const mockParticipation = {
        id: 123,
        app: {
          id: 1,
          appName: 'Test App',
          iconUrl: 'https://example.com/icon.png',
        },
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockParticipation,
      })

      render(<FeedbackPage />)

      await waitFor(() => {
        expect(screen.getByText(/전체 만족도/i)).toBeInTheDocument()
      })

      // 전체 별점 선택
      const overallStars = screen.getAllByTestId(/overall-star-/i)
      fireEvent.click(overallStars[3]) // 4점

      // 항목별 별점 선택
      const uiStars = screen.getAllByTestId(/ui-ux-star-/i)
      fireEvent.click(uiStars[3]) // 4점

      const perfStars = screen.getAllByTestId(/performance-star-/i)
      fireEvent.click(perfStars[3]) // 4점

      const funcStars = screen.getAllByTestId(/functionality-star-/i)
      fireEvent.click(funcStars[3]) // 4점

      const stabStars = screen.getAllByTestId(/stability-star-/i)
      fireEvent.click(stabStars[3]) // 4점

      // 코멘트 입력
      const textarea = screen.getByPlaceholderText(/앱 사용 소감을 자유롭게 작성해주세요/i)
      fireEvent.change(textarea, { target: { value: '좋은 앱입니다!' } })

      // Mock API 응답
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: 1 }),
        }) // POST /api/feedbacks
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ count: 4 }),
        }) // POST /api/feedback-ratings

      const submitButton = screen.getByRole('button', { name: /제출/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/feedbacks',
          expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('overallRating'),
          })
        )
      })

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/feedback-ratings',
          expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('UI_UX'),
          })
        )
      })

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/tester/participations')
      })
    })

    it('버그 리포트 포함하여 제출 시 버그 리포트 API도 호출', async () => {
      render(<FeedbackPage />)

      await waitFor(() => {
        expect(screen.getByText(/전체 만족도/i)).toBeInTheDocument()
      })

      // 전체 별점 선택
      const overallStars = screen.getAllByTestId(/overall-star-/i)
      fireEvent.click(overallStars[3]) // 4점

      // 항목별 별점 선택 (간략화)
      const uiStars = screen.getAllByTestId(/ui-ux-star-/i)
      fireEvent.click(uiStars[3])

      const perfStars = screen.getAllByTestId(/performance-star-/i)
      fireEvent.click(perfStars[3])

      const funcStars = screen.getAllByTestId(/functionality-star-/i)
      fireEvent.click(funcStars[3])

      const stabStars = screen.getAllByTestId(/stability-star-/i)
      fireEvent.click(stabStars[3])

      // 코멘트 입력
      const textarea = screen.getByPlaceholderText(/앱 사용 소감을 자유롭게 작성해주세요/i)
      fireEvent.change(textarea, { target: { value: '좋은 앱입니다!' } })

      // 버그 리포트 입력
      const bugTitle = screen.getByPlaceholderText(/버그 제목/i)
      fireEvent.change(bugTitle, { target: { value: '로그인 버그' } })

      const bugDescription = screen.getByPlaceholderText(/버그 설명/i)
      fireEvent.change(bugDescription, { target: { value: '로그인이 안됩니다.' } })

      // Mock API 응답
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: 1 }),
        }) // POST /api/feedbacks
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ count: 4 }),
        }) // POST /api/feedback-ratings
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: 1 }),
        }) // POST /api/bug-reports

      const submitButton = screen.getByRole('button', { name: /제출/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/bug-reports',
          expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('로그인 버그'),
          })
        )
      })

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/tester/participations')
      })
    })
  })
})
