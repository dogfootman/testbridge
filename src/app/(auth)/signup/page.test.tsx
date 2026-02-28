// @TASK P2-S2 - S-02 Signup (회원가입) 테스트
// @SPEC specs/screens/signup.yaml

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useSession, signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import SignupPage from './page'
import '@testing-library/jest-dom'

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
  signIn: jest.fn(),
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}))

// Mock fetch for API calls
global.fetch = jest.fn()

describe('SignupPage - TDD RED Phase', () => {
  const mockRouter = {
    push: jest.fn(),
    refresh: jest.fn(),
  }

  const mockSearchParams = {
    get: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(useSearchParams as jest.Mock).mockReturnValue(mockSearchParams)
    ;(useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    })
  })

  describe('OAuth 버튼 렌더링 검증', () => {
    it('should render Google OAuth button', () => {
      render(<SignupPage />)

      const googleButton = screen.getByRole('button', { name: /Google.*계속/i })
      expect(googleButton).toBeInTheDocument()
    })

    it('should call signIn with Google provider when Google button clicked', async () => {
      render(<SignupPage />)

      const googleButton = screen.getByRole('button', { name: /Google.*계속/i })
      fireEvent.click(googleButton)

      expect(signIn).toHaveBeenCalledWith('google', expect.any(Object))
    })

    it('should render Kakao OAuth button', () => {
      render(<SignupPage />)

      const kakaoButton = screen.getByRole('button', { name: /Kakao.*계속/i })
      expect(kakaoButton).toBeInTheDocument()
    })

    it('should render Naver OAuth button', () => {
      render(<SignupPage />)

      const naverButton = screen.getByRole('button', { name: /Naver.*계속/i })
      expect(naverButton).toBeInTheDocument()
    })
  })

  describe('역할 선택 UI 검증', () => {
    it('should show role selection after OAuth success (new user)', async () => {
      ;(useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
            role: null // 신규 사용자
          }
        },
        status: 'authenticated',
      })

      render(<SignupPage />)

      await waitFor(() => {
        expect(screen.getByText(/역할을 선택해주세요/i)).toBeInTheDocument()
      })
    })

    it('should render DEVELOPER role option', async () => {
      ;(useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
            role: null
          }
        },
        status: 'authenticated',
      })

      render(<SignupPage />)

      await waitFor(() => {
        const developerRadio = screen.getByRole('radio', { name: /개발자.*앱 테스트를 요청/i })
        expect(developerRadio).toBeInTheDocument()
      })
    })

    it('should render TESTER role option', async () => {
      ;(useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
            role: null
          }
        },
        status: 'authenticated',
      })

      render(<SignupPage />)

      await waitFor(() => {
        const testerRadio = screen.getByRole('radio', { name: /테스터.*앱을 테스트합니다/i })
        expect(testerRadio).toBeInTheDocument()
      })
    })

    it('should render BOTH role option', async () => {
      ;(useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
            role: null
          }
        },
        status: 'authenticated',
      })

      render(<SignupPage />)

      await waitFor(() => {
        const bothRadio = screen.getByRole('radio', { name: /둘 다.*개발자이면서 테스터/i })
        expect(bothRadio).toBeInTheDocument()
      })
    })

    it('should enable next button after role selection', async () => {
      ;(useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
            role: null
          }
        },
        status: 'authenticated',
      })

      render(<SignupPage />)

      await waitFor(() => {
        const developerRadio = screen.getByRole('radio', { name: /개발자.*앱 테스트를 요청/i })
        fireEvent.click(developerRadio)
      })

      const nextButton = screen.getByRole('button', { name: /다음/i })
      expect(nextButton).not.toBeDisabled()
    })
  })

  describe('프로필 입력 폼 검증', () => {
    it('should show profile form after role selection', async () => {
      ;(useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
            role: null
          }
        },
        status: 'authenticated',
      })

      render(<SignupPage />)

      // 역할 선택
      await waitFor(() => {
        const developerRadio = screen.getByRole('radio', { name: /개발자.*앱 테스트를 요청/i })
        fireEvent.click(developerRadio)
      })

      const nextButton = screen.getByRole('button', { name: /다음/i })
      fireEvent.click(nextButton)

      await waitFor(() => {
        expect(screen.getByLabelText(/닉네임/i)).toBeInTheDocument()
      })
    })

    it('should render nickname input field', async () => {
      ;(useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
            role: null
          }
        },
        status: 'authenticated',
      })

      render(<SignupPage />)

      // 역할 선택 후 다음
      await waitFor(() => {
        const developerRadio = screen.getByTestId('role-developer')
        fireEvent.click(developerRadio)
      })

      const nextButton = screen.getByRole('button', { name: /다음/i })
      fireEvent.click(nextButton)

      await waitFor(() => {
        const nicknameInput = screen.getByTestId('nickname-input')
        expect(nicknameInput).toBeInTheDocument()
        expect(nicknameInput).toHaveAttribute('type', 'text')
      })
    })

    it('should render profile image URL input field', async () => {
      ;(useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
            role: null
          }
        },
        status: 'authenticated',
      })

      render(<SignupPage />)

      // 역할 선택 후 다음
      await waitFor(() => {
        const developerRadio = screen.getByTestId('role-developer')
        fireEvent.click(developerRadio)
      })

      const nextButton = screen.getByRole('button', { name: /다음/i })
      fireEvent.click(nextButton)

      await waitFor(() => {
        const profileImageInput = screen.getByTestId('profile-image-input')
        expect(profileImageInput).toBeInTheDocument()
      })
    })

    it('should validate nickname is required', async () => {
      ;(useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
            role: null
          }
        },
        status: 'authenticated',
      })

      render(<SignupPage />)

      // 역할 선택 후 다음
      await waitFor(() => {
        const developerRadio = screen.getByTestId('role-developer')
        fireEvent.click(developerRadio)
      })

      let nextButton = screen.getByRole('button', { name: /다음/i })
      fireEvent.click(nextButton)

      // 프로필 화면에서 닉네임 비우고 다음 클릭
      await waitFor(() => {
        nextButton = screen.getByRole('button', { name: /다음/i })
        fireEvent.click(nextButton)
      })

      await waitFor(() => {
        expect(screen.getByText(/닉네임을 입력해주세요/i)).toBeInTheDocument()
      })
    })

    it('should show error for duplicate nickname', async () => {
      ;(useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
            role: null
          }
        },
        status: 'authenticated',
      })

      // Mock API 중복 에러
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({ error: '이미 사용 중인 닉네임입니다.' }),
      })

      render(<SignupPage />)

      // 역할 선택 후 다음
      await waitFor(() => {
        const developerRadio = screen.getByTestId('role-developer')
        fireEvent.click(developerRadio)
      })

      let nextButton = screen.getByRole('button', { name: /다음/i })
      fireEvent.click(nextButton)

      // 닉네임 입력 후 다음
      await waitFor(() => {
        const nicknameInput = screen.getByTestId('nickname-input')
        fireEvent.change(nicknameInput, { target: { value: 'existing-user' } })
      })

      nextButton = screen.getByRole('button', { name: /다음/i })
      fireEvent.click(nextButton)

      await waitFor(() => {
        expect(screen.getByText(/이미 사용 중인 닉네임입니다/i)).toBeInTheDocument()
      })
    })
  })

  describe('약관 동의 화면 검증', () => {
    it('should show agreement checkboxes after profile input', async () => {
      ;(useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
            role: null
          }
        },
        status: 'authenticated',
      })

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ available: true }),
      })

      render(<SignupPage />)

      // 역할 선택
      await waitFor(() => {
        const developerRadio = screen.getByTestId('role-developer')
        fireEvent.click(developerRadio)
      })

      let nextButton = screen.getByRole('button', { name: /다음/i })
      fireEvent.click(nextButton)

      // 프로필 입력
      await waitFor(() => {
        const nicknameInput = screen.getByTestId('nickname-input')
        fireEvent.change(nicknameInput, { target: { value: 'testuser' } })
      })

      nextButton = screen.getByRole('button', { name: /다음/i })
      fireEvent.click(nextButton)

      // 약관 동의 화면
      await waitFor(() => {
        expect(screen.getByTestId('terms-checkbox')).toBeInTheDocument()
      })
    })

    it('should render terms of service checkbox (required)', async () => {
      ;(useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
            role: null
          }
        },
        status: 'authenticated',
      })

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ available: true }),
      })

      render(<SignupPage />)

      // 역할 선택 → 프로필 입력 → 약관 동의
      await waitFor(() => {
        const developerRadio = screen.getByTestId('role-developer')
        fireEvent.click(developerRadio)
      })

      let nextButton = screen.getByRole('button', { name: /다음/i })
      fireEvent.click(nextButton)

      await waitFor(() => {
        const nicknameInput = screen.getByTestId('nickname-input')
        fireEvent.change(nicknameInput, { target: { value: 'testuser' } })
      })

      nextButton = screen.getByRole('button', { name: /다음/i })
      fireEvent.click(nextButton)

      await waitFor(() => {
        const termsCheckbox = screen.getByTestId('terms-checkbox')
        expect(termsCheckbox).toBeInTheDocument()
        expect(termsCheckbox).toBeRequired()
      })
    })

    it('should render privacy policy checkbox (required)', async () => {
      ;(useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
            role: null
          }
        },
        status: 'authenticated',
      })

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ available: true }),
      })

      render(<SignupPage />)

      // 역할 선택 → 프로필 입력 → 약관 동의
      await waitFor(() => {
        const developerRadio = screen.getByTestId('role-developer')
        fireEvent.click(developerRadio)
      })

      let nextButton = screen.getByRole('button', { name: /다음/i })
      fireEvent.click(nextButton)

      await waitFor(() => {
        const nicknameInput = screen.getByTestId('nickname-input')
        fireEvent.change(nicknameInput, { target: { value: 'testuser' } })
      })

      nextButton = screen.getByRole('button', { name: /다음/i })
      fireEvent.click(nextButton)

      await waitFor(() => {
        const privacyCheckbox = screen.getByTestId('privacy-checkbox')
        expect(privacyCheckbox).toBeInTheDocument()
        expect(privacyCheckbox).toBeRequired()
      })
    })

    it('should render marketing checkbox (optional)', async () => {
      ;(useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
            role: null
          }
        },
        status: 'authenticated',
      })

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ available: true }),
      })

      render(<SignupPage />)

      // 역할 선택 → 프로필 입력 → 약관 동의
      await waitFor(() => {
        const developerRadio = screen.getByTestId('role-developer')
        fireEvent.click(developerRadio)
      })

      let nextButton = screen.getByRole('button', { name: /다음/i })
      fireEvent.click(nextButton)

      await waitFor(() => {
        const nicknameInput = screen.getByTestId('nickname-input')
        fireEvent.change(nicknameInput, { target: { value: 'testuser' } })
      })

      nextButton = screen.getByRole('button', { name: /다음/i })
      fireEvent.click(nextButton)

      await waitFor(() => {
        const marketingCheckbox = screen.getByTestId('marketing-checkbox')
        expect(marketingCheckbox).toBeInTheDocument()
        expect(marketingCheckbox).not.toBeRequired()
      })
    })

    it('should disable submit button when required agreements are not checked', async () => {
      ;(useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
            role: null
          }
        },
        status: 'authenticated',
      })

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ available: true }),
      })

      render(<SignupPage />)

      // 역할 선택 → 프로필 입력 → 약관 동의
      await waitFor(() => {
        const developerRadio = screen.getByTestId('role-developer')
        fireEvent.click(developerRadio)
      })

      let nextButton = screen.getByRole('button', { name: /다음/i })
      fireEvent.click(nextButton)

      await waitFor(() => {
        const nicknameInput = screen.getByTestId('nickname-input')
        fireEvent.change(nicknameInput, { target: { value: 'testuser' } })
      })

      nextButton = screen.getByRole('button', { name: /다음/i })
      fireEvent.click(nextButton)

      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /가입.*완료/i })
        expect(submitButton).toBeDisabled()
      })
    })

    it('should enable submit button when all required agreements are checked', async () => {
      ;(useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
            role: null
          }
        },
        status: 'authenticated',
      })

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ available: true }),
      })

      render(<SignupPage />)

      // 역할 선택 → 프로필 입력 → 약관 동의
      await waitFor(() => {
        const developerRadio = screen.getByTestId('role-developer')
        fireEvent.click(developerRadio)
      })

      let nextButton = screen.getByRole('button', { name: /다음/i })
      fireEvent.click(nextButton)

      await waitFor(() => {
        const nicknameInput = screen.getByTestId('nickname-input')
        fireEvent.change(nicknameInput, { target: { value: 'testuser' } })
      })

      nextButton = screen.getByRole('button', { name: /다음/i })
      fireEvent.click(nextButton)

      await waitFor(() => {
        const termsCheckbox = screen.getByTestId('terms-checkbox')
        const privacyCheckbox = screen.getByTestId('privacy-checkbox')

        fireEvent.click(termsCheckbox)
        fireEvent.click(privacyCheckbox)
      })

      const submitButton = screen.getByRole('button', { name: /가입.*완료/i })
      expect(submitButton).not.toBeDisabled()
    })
  })

  describe('가입 완료 및 리다이렉트', () => {
    it('should redirect to /developer after successful signup with DEVELOPER role', async () => {
      ;(useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
            role: null
          }
        },
        status: 'authenticated',
      })

      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ available: true }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            id: 'test-user-id',
            role: 'DEVELOPER',
            nickname: 'testuser'
          }),
        })

      render(<SignupPage />)

      // 역할 선택 (DEVELOPER)
      await waitFor(() => {
        const developerRadio = screen.getByTestId('role-developer')
        fireEvent.click(developerRadio)
      })

      let nextButton = screen.getByRole('button', { name: /다음/i })
      fireEvent.click(nextButton)

      // 프로필 입력
      await waitFor(() => {
        const nicknameInput = screen.getByTestId('nickname-input')
        fireEvent.change(nicknameInput, { target: { value: 'testuser' } })
      })

      nextButton = screen.getByRole('button', { name: /다음/i })
      fireEvent.click(nextButton)

      // 약관 동의
      await waitFor(() => {
        const termsCheckbox = screen.getByTestId('terms-checkbox')
        const privacyCheckbox = screen.getByTestId('privacy-checkbox')

        fireEvent.click(termsCheckbox)
        fireEvent.click(privacyCheckbox)
      })

      const submitButton = screen.getByRole('button', { name: /가입.*완료/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/developer')
      })
    })

    it('should redirect to /tester after successful signup with TESTER role', async () => {
      ;(useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
            role: null
          }
        },
        status: 'authenticated',
      })

      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ available: true }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            id: 'test-user-id',
            role: 'TESTER',
            nickname: 'testuser'
          }),
        })

      render(<SignupPage />)

      // 역할 선택 (TESTER)
      await waitFor(() => {
        const testerRadio = screen.getByTestId('role-tester')
        fireEvent.click(testerRadio)
      })

      let nextButton = screen.getByRole('button', { name: /다음/i })
      fireEvent.click(nextButton)

      // 프로필 입력
      await waitFor(() => {
        const nicknameInput = screen.getByTestId('nickname-input')
        fireEvent.change(nicknameInput, { target: { value: 'testuser' } })
      })

      nextButton = screen.getByRole('button', { name: /다음/i })
      fireEvent.click(nextButton)

      // 약관 동의
      await waitFor(() => {
        const termsCheckbox = screen.getByTestId('terms-checkbox')
        const privacyCheckbox = screen.getByTestId('privacy-checkbox')

        fireEvent.click(termsCheckbox)
        fireEvent.click(privacyCheckbox)
      })

      const submitButton = screen.getByRole('button', { name: /가입.*완료/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/tester')
      })
    })
  })

  describe('기존 사용자 처리', () => {
    it('should redirect existing user with role to appropriate dashboard', async () => {
      ;(useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            id: 'existing-user-id',
            email: 'existing@example.com',
            role: 'DEVELOPER' // 기존 사용자
          }
        },
        status: 'authenticated',
      })

      render(<SignupPage />)

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/developer')
      })
    })
  })
})
