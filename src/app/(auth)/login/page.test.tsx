// @TASK P2-S3 - S-03 Login 페이지 테스트
// @SPEC specs/screens/login.yaml
// @TEST TDD RED Phase - 로그인 UI 및 OAuth 리다이렉트 검증

import { render, screen } from '@testing-library/react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import LoginPage from './page'

// Mocks
jest.mock('next-auth/react')
jest.mock('next/navigation')

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockUseSearchParams = useSearchParams as jest.MockedFunction<typeof useSearchParams>

describe('LoginPage', () => {
  const mockPush = jest.fn()
  const mockGet = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseRouter.mockReturnValue({
      push: mockPush,
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    } as any)
    mockUseSearchParams.mockReturnValue({
      get: mockGet,
    } as any)
  })

  describe('🔴 RED: 렌더링 테스트', () => {
    it('로그인 페이지 제목이 렌더링된다', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn(),
      })
      mockGet.mockReturnValue(null)

      render(<LoginPage />)

      expect(screen.getByRole('heading', { name: /로그인/i })).toBeInTheDocument()
    })

    it('Google OAuth 로그인 버튼이 렌더링된다', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn(),
      })
      mockGet.mockReturnValue(null)

      render(<LoginPage />)

      const googleButton = screen.getByRole('button', { name: /google/i })
      expect(googleButton).toBeInTheDocument()
    })

    it('리다이렉트 안내 메시지가 렌더링된다', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn(),
      })
      mockGet.mockReturnValue(null)

      render(<LoginPage />)

      expect(screen.getByText(/로그인 후 계속하려면 인증해주세요/i)).toBeInTheDocument()
    })
  })

  describe('🔴 RED: 로그인 리다이렉트 테스트', () => {
    it('DEVELOPER 역할 사용자는 /developer로 리다이렉트된다', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: '1',
            email: 'dev@test.com',
            role: 'DEVELOPER',
            name: 'Developer',
          },
          expires: '2026-12-31',
        },
        status: 'authenticated',
        update: jest.fn(),
      })
      mockGet.mockReturnValue(null)

      render(<LoginPage />)

      expect(mockPush).toHaveBeenCalledWith('/developer')
    })

    it('TESTER 역할 사용자는 /tester로 리다이렉트된다', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: '2',
            email: 'tester@test.com',
            role: 'TESTER',
            name: 'Tester',
          },
          expires: '2026-12-31',
        },
        status: 'authenticated',
        update: jest.fn(),
      })
      mockGet.mockReturnValue(null)

      render(<LoginPage />)

      expect(mockPush).toHaveBeenCalledWith('/tester')
    })

    it('callbackUrl이 있으면 해당 URL로 리다이렉트된다', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: '3',
            email: 'user@test.com',
            role: 'DEVELOPER',
            name: 'User',
          },
          expires: '2026-12-31',
        },
        status: 'authenticated',
        update: jest.fn(),
      })
      mockGet.mockReturnValue('/tester/apps/123')

      render(<LoginPage />)

      expect(mockPush).toHaveBeenCalledWith('/tester/apps/123')
    })

    it('NONE 역할 사용자는 /auth/signup으로 리다이렉트된다', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: '4',
            email: 'newuser@test.com',
            role: 'NONE',
            name: 'New User',
          },
          expires: '2026-12-31',
        },
        status: 'authenticated',
        update: jest.fn(),
      })
      mockGet.mockReturnValue(null)

      render(<LoginPage />)

      expect(mockPush).toHaveBeenCalledWith('/auth/signup')
    })
  })

  describe('🔴 RED: 접근성 테스트', () => {
    it('로그인 버튼에 적절한 ARIA 레이블이 있다', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn(),
      })
      mockGet.mockReturnValue(null)

      render(<LoginPage />)

      const googleButton = screen.getByRole('button', { name: /google/i })
      expect(googleButton).toHaveAttribute('aria-label')
    })

    it('메인 컨텐츠가 main 태그로 마크업된다', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn(),
      })
      mockGet.mockReturnValue(null)

      const { container } = render(<LoginPage />)

      expect(container.querySelector('main')).toBeInTheDocument()
    })
  })
})
