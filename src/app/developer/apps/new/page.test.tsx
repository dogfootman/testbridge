// @TASK P3-S7 - App Register (앱 등록 4단계 위저드)
// @SPEC specs/screens/app-register.yaml

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import AppRegisterPage from './page'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
}))

// Mock getSession
jest.mock('@/lib/auth', () => ({
  getSession: jest.fn(() => Promise.resolve({
    user: { id: '1', email: 'dev@test.com', role: 'DEVELOPER' }
  })),
}))

// Mock fetch
global.fetch = jest.fn()

describe('P3-S7: App Register Page (4-Step Wizard)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ categories: [
        { id: 1, name: 'Game', slug: 'game' },
        { id: 2, name: 'Productivity', slug: 'productivity' },
      ]}),
    })
  })

  describe('🔴 RED: Initial Render & Step Navigation', () => {
    it('should display step 1 (기본정보) on initial load', async () => {
      render(<AppRegisterPage />)

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /앱 등록/i })).toBeInTheDocument()
      })

      expect(screen.getByLabelText(/앱 이름/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/패키지명/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/카테고리/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/설명/i)).toBeInTheDocument()
    })

    it('should show all 4 steps in stepper', async () => {
      render(<AppRegisterPage />)

      await waitFor(() => {
        const step1 = screen.getByTestId('step-1')
        expect(step1).toBeInTheDocument()
      })

      expect(screen.getByTestId('step-2')).toBeInTheDocument()
      expect(screen.getByTestId('step-3')).toBeInTheDocument()
      expect(screen.getByTestId('step-4')).toBeInTheDocument()
    })

    it('should highlight step 1 as active initially', async () => {
      render(<AppRegisterPage />)

      await waitFor(() => {
        const step1 = screen.getByTestId('step-1')
        expect(step1).toHaveAttribute('data-active', 'true')
      })
    })
  })

  describe('🔴 RED: Step 1 - 기본정보 Form Fields', () => {
    it('should render all required fields in step 1', async () => {
      render(<AppRegisterPage />)

      await waitFor(() => {
        expect(screen.getByLabelText(/앱 이름/i)).toBeInTheDocument()
      })

      expect(screen.getByLabelText(/패키지명/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/카테고리/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/설명/i)).toBeInTheDocument()
    })

    it('should fetch and display categories in select', async () => {
      render(<AppRegisterPage />)

      await waitFor(() => {
        const categorySelect = screen.getByLabelText(/카테고리/i)
        expect(categorySelect).toBeInTheDocument()
      })

      expect(global.fetch).toHaveBeenCalledWith('/api/categories')
    })

    it('should validate required fields before moving to step 2', async () => {
      render(<AppRegisterPage />)

      await waitFor(() => {
        const nextButton = screen.getByRole('button', { name: /다음/i })
        fireEvent.click(nextButton)
      })

      await waitFor(() => {
        expect(screen.getByText(/앱 이름을 입력해주세요/i)).toBeInTheDocument()
      })
    })

    it('should validate package name format', async () => {
      render(<AppRegisterPage />)

      await waitFor(() => {
        const packageInput = screen.getByLabelText(/패키지명/i)
        fireEvent.change(packageInput, { target: { value: 'invalid-package' } })
        fireEvent.blur(packageInput)
      })

      await waitFor(() => {
        expect(screen.getByText(/올바른 패키지명 형식이 아닙니다/i)).toBeInTheDocument()
      })
    })
  })

  describe('🔴 RED: Step 2 - 테스트설정 Form Fields', () => {
    beforeEach(async () => {
      render(<AppRegisterPage />)

      await waitFor(() => {
        const appNameInput = screen.getByLabelText(/앱 이름/i)
        fireEvent.change(appNameInput, { target: { value: 'Test App' } })
      })

      const packageInput = screen.getByLabelText(/패키지명/i)
      fireEvent.change(packageInput, { target: { value: 'com.test.app' } })

      const categorySelect = screen.getByLabelText(/카테고리/i)
      fireEvent.change(categorySelect, { target: { value: '1' } })

      const descInput = screen.getByLabelText(/설명/i)
      fireEvent.change(descInput, { target: { value: 'Test description' } })

      const nextButton = screen.getByRole('button', { name: /다음/i })
      fireEvent.click(nextButton)
    })

    it('should navigate to step 2 after valid step 1', async () => {
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /테스트설정/i })).toBeInTheDocument()
      })

      expect(screen.getByRole('radio', { name: /유료 리워드/i })).toBeInTheDocument()
      expect(screen.getByLabelText(/목표 테스터 수/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Google Play 테스트 링크/i)).toBeInTheDocument()
    })

    it('should display test type options (PAID_REWARD, CREDIT_EXCHANGE)', async () => {
      await waitFor(() => {
        expect(screen.getByText(/유료 리워드/i)).toBeInTheDocument()
      })

      expect(screen.getByText(/크레딧 교환/i)).toBeInTheDocument()
    })

    it('should validate target testers range (1-100)', async () => {
      await waitFor(() => {
        const testersInput = screen.getByLabelText(/목표 테스터 수/i)
        fireEvent.change(testersInput, { target: { value: '200' } })
        fireEvent.blur(testersInput)
      })

      await waitFor(() => {
        expect(screen.getByText(/최대 100명까지 가능합니다/i)).toBeInTheDocument()
      })
    })
  })

  describe('🔴 RED: Step 3 - 리워드설정 (PAID_REWARD Only)', () => {
    beforeEach(async () => {
      render(<AppRegisterPage />)

      // Fill step 1
      await waitFor(() => {
        const appNameInput = screen.getByLabelText(/앱 이름/i)
        fireEvent.change(appNameInput, { target: { value: 'Test App' } })
      })

      const packageInput = screen.getByLabelText(/패키지명/i)
      fireEvent.change(packageInput, { target: { value: 'com.test.app' } })

      const categorySelect = screen.getByLabelText(/카테고리/i)
      fireEvent.change(categorySelect, { target: { value: '1' } })

      const descInput = screen.getByLabelText(/설명/i)
      fireEvent.change(descInput, { target: { value: 'Test description' } })

      const nextButton1 = screen.getByRole('button', { name: /다음/i })
      fireEvent.click(nextButton1)

      // Fill step 2 with PAID_REWARD
      await waitFor(() => {
        const paidRewardRadio = screen.getByRole('radio', { name: /유료 리워드/i })
        fireEvent.click(paidRewardRadio)
      })

      const testersInput = screen.getByLabelText(/목표 테스터 수/i)
      fireEvent.change(testersInput, { target: { value: '14' } })

      const testLinkInput = screen.getByLabelText(/Google Play 테스트 링크/i)
      fireEvent.change(testLinkInput, { target: { value: 'https://play.google.com/apps/test' } })

      const nextButton2 = screen.getByRole('button', { name: /다음/i })
      fireEvent.click(nextButton2)
    })

    it('should show step 3 when PAID_REWARD selected', async () => {
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /리워드설정/i })).toBeInTheDocument()
      })

      expect(screen.getByRole('radio', { name: /기본/i })).toBeInTheDocument()
      expect(screen.getByLabelText(/리워드 금액/i)).toBeInTheDocument()
    })

    it('should display reward type options (BASIC, WITH_FEEDBACK, ADVANCED)', async () => {
      await waitFor(() => {
        expect(screen.getByRole('radio', { name: /^기본$/i })).toBeInTheDocument()
      })

      expect(screen.getByRole('radio', { name: /피드백 포함/i })).toBeInTheDocument()
      expect(screen.getByRole('radio', { name: /심화/i })).toBeInTheDocument()
    })

    it('should calculate total payment (rewardAmount * targetTesters)', async () => {
      await waitFor(() => {
        const rewardInput = screen.getByLabelText(/리워드 금액/i)
        fireEvent.change(rewardInput, { target: { value: '5000' } })
      })

      await waitFor(() => {
        expect(screen.getByText(/총 결제 금액:/i)).toBeInTheDocument()
        expect(screen.getByText(/70,000/)).toBeInTheDocument()
      })
    })
  })

  describe('🔴 RED: Step 3 Skip - CREDIT_EXCHANGE Flow', () => {
    beforeEach(async () => {
      render(<AppRegisterPage />)

      // Fill step 1
      await waitFor(() => {
        const appNameInput = screen.getByLabelText(/앱 이름/i)
        fireEvent.change(appNameInput, { target: { value: 'Test App' } })
      })

      const packageInput = screen.getByLabelText(/패키지명/i)
      fireEvent.change(packageInput, { target: { value: 'com.test.app' } })

      const categorySelect = screen.getByLabelText(/카테고리/i)
      fireEvent.change(categorySelect, { target: { value: '1' } })

      const descInput = screen.getByLabelText(/설명/i)
      fireEvent.change(descInput, { target: { value: 'Test description' } })

      const nextButton1 = screen.getByRole('button', { name: /다음/i })
      fireEvent.click(nextButton1)

      // Fill step 2 with CREDIT_EXCHANGE
      await waitFor(() => {
        const creditRadio = screen.getByRole('radio', { name: /크레딧 교환/i })
        fireEvent.click(creditRadio)
      })

      const testersInput = screen.getByLabelText(/목표 테스터 수/i)
      fireEvent.change(testersInput, { target: { value: '14' } })

      const testLinkInput = screen.getByLabelText(/Google Play 테스트 링크/i)
      fireEvent.change(testLinkInput, { target: { value: 'https://play.google.com/apps/test' } })

      const nextButton2 = screen.getByRole('button', { name: /다음/i })
      fireEvent.click(nextButton2)
    })

    it('should skip step 3 and go directly to step 4 when CREDIT_EXCHANGE', async () => {
      await waitFor(() => {
        expect(screen.getByText(/피드백 필수 여부/i)).toBeInTheDocument()
      })

      expect(screen.queryByText(/리워드 유형/i)).not.toBeInTheDocument()
    })
  })

  describe('🔴 RED: Step 4 - 피드백설정', () => {
    beforeEach(async () => {
      render(<AppRegisterPage />)

      // Fill step 1
      await waitFor(() => {
        const appNameInput = screen.getByLabelText(/앱 이름/i)
        fireEvent.change(appNameInput, { target: { value: 'Test App' } })
      })

      const packageInput = screen.getByLabelText(/패키지명/i)
      fireEvent.change(packageInput, { target: { value: 'com.test.app' } })

      const categorySelect = screen.getByLabelText(/카테고리/i)
      fireEvent.change(categorySelect, { target: { value: '1' } })

      const descInput = screen.getByLabelText(/설명/i)
      fireEvent.change(descInput, { target: { value: 'Test description' } })

      const nextButton1 = screen.getByRole('button', { name: /다음/i })
      fireEvent.click(nextButton1)

      // Fill step 2 with CREDIT_EXCHANGE (skip step 3)
      await waitFor(() => {
        const creditRadio = screen.getByRole('radio', { name: /크레딧 교환/i })
        fireEvent.click(creditRadio)
      })

      const testersInput = screen.getByLabelText(/목표 테스터 수/i)
      fireEvent.change(testersInput, { target: { value: '14' } })

      const testLinkInput = screen.getByLabelText(/Google Play 테스트 링크/i)
      fireEvent.change(testLinkInput, { target: { value: 'https://play.google.com/apps/test' } })

      const nextButton2 = screen.getByRole('button', { name: /다음/i })
      fireEvent.click(nextButton2)
    })

    it('should display feedback settings fields', async () => {
      await waitFor(() => {
        expect(screen.getByLabelText(/피드백 필수 여부/i)).toBeInTheDocument()
      })

      expect(screen.getByLabelText(/테스트 가이드/i)).toBeInTheDocument()
    })

    it('should have submit button in step 4', async () => {
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /앱 등록/i })).toBeInTheDocument()
      })
    })
  })

  describe('🔴 RED: Final Submission', () => {
    beforeEach(async () => {
      ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url === '/api/categories') {
          return Promise.resolve({
            ok: true,
            json: async () => ({ categories: [
              { id: 1, name: 'Game', slug: 'game' },
            ]}),
          })
        }
        if (url === '/api/apps' || url.includes('/api/apps')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              id: 1,
              appName: 'Test App',
              status: 'PENDING_APPROVAL'
            }),
          })
        }
        return Promise.reject(new Error('Unknown URL'))
      })

      render(<AppRegisterPage />)

      // Fill all steps
      await waitFor(() => {
        const appNameInput = screen.getByLabelText(/앱 이름/i)
        fireEvent.change(appNameInput, { target: { value: 'Test App' } })
      })

      const packageInput = screen.getByLabelText(/패키지명/i)
      fireEvent.change(packageInput, { target: { value: 'com.test.app' } })

      const categorySelect = screen.getByLabelText(/카테고리/i)
      fireEvent.change(categorySelect, { target: { value: '1' } })

      const descInput = screen.getByLabelText(/설명/i)
      fireEvent.change(descInput, { target: { value: 'Test description' } })

      const nextButton1 = screen.getByRole('button', { name: /다음/i })
      fireEvent.click(nextButton1)

      await waitFor(() => {
        const creditRadio = screen.getByRole('radio', { name: /크레딧 교환/i })
        fireEvent.click(creditRadio)
      })

      const testersInput = screen.getByLabelText(/목표 테스터 수/i)
      fireEvent.change(testersInput, { target: { value: '14' } })

      const testLinkInput = screen.getByLabelText(/Google Play 테스트 링크/i)
      fireEvent.change(testLinkInput, { target: { value: 'https://play.google.com/apps/test' } })

      const nextButton2 = screen.getByRole('button', { name: /다음/i })
      fireEvent.click(nextButton2)

      await waitFor(() => {
        const feedbackCheckbox = screen.getByLabelText(/피드백 필수 여부/i)
        fireEvent.click(feedbackCheckbox)
      })

      const guideInput = screen.getByLabelText(/테스트 가이드/i)
      fireEvent.change(guideInput, { target: { value: 'Please test all features' } })
    })

    it('should submit form data to POST /api/apps', async () => {
      const submitButton = screen.getByRole('button', { name: /앱 등록/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/apps',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: expect.stringContaining('Test App'),
          })
        )
      })
    })

    it('should redirect to /developer/apps on success', async () => {
      const submitButton = screen.getByRole('button', { name: /앱 등록/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/앱이 성공적으로 등록되었습니다/i)).toBeInTheDocument()
      })
    })
  })

  describe('🔴 RED: Back Navigation', () => {
    it('should allow navigating back from step 2 to step 1', async () => {
      render(<AppRegisterPage />)

      // Go to step 2
      await waitFor(() => {
        const appNameInput = screen.getByLabelText(/앱 이름/i)
        fireEvent.change(appNameInput, { target: { value: 'Test App' } })
      })

      const packageInput = screen.getByLabelText(/패키지명/i)
      fireEvent.change(packageInput, { target: { value: 'com.test.app' } })

      const categorySelect = screen.getByLabelText(/카테고리/i)
      fireEvent.change(categorySelect, { target: { value: '1' } })

      const descInput = screen.getByLabelText(/설명/i)
      fireEvent.change(descInput, { target: { value: 'Test description' } })

      const nextButton = screen.getByRole('button', { name: /다음/i })
      fireEvent.click(nextButton)

      await waitFor(() => {
        expect(screen.getByText(/테스트 유형/i)).toBeInTheDocument()
      })

      // Click back
      const backButton = screen.getByRole('button', { name: /이전/i })
      fireEvent.click(backButton)

      await waitFor(() => {
        expect(screen.getByLabelText(/앱 이름/i)).toHaveValue('Test App')
      })
    })
  })

  describe('🔴 RED: Error Handling', () => {
    it('should display error when API fails', async () => {
      ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url === '/api/categories') {
          return Promise.resolve({
            ok: true,
            json: async () => ({ categories: [{ id: 1, name: 'Game' }]}),
          })
        }
        if (url === '/api/apps') {
          return Promise.resolve({
            ok: false,
            json: async () => ({ error: 'Package name already exists' }),
          })
        }
        return Promise.reject(new Error('Unknown URL'))
      })

      render(<AppRegisterPage />)

      // Fill and submit
      await waitFor(() => {
        const appNameInput = screen.getByLabelText(/앱 이름/i)
        fireEvent.change(appNameInput, { target: { value: 'Test App' } })
      })

      const packageInput = screen.getByLabelText(/패키지명/i)
      fireEvent.change(packageInput, { target: { value: 'com.test.app' } })

      const categorySelect = screen.getByLabelText(/카테고리/i)
      fireEvent.change(categorySelect, { target: { value: '1' } })

      const descInput = screen.getByLabelText(/설명/i)
      fireEvent.change(descInput, { target: { value: 'Test description' } })

      const nextButton1 = screen.getByRole('button', { name: /다음/i })
      fireEvent.click(nextButton1)

      await waitFor(() => {
        const creditRadio = screen.getByRole('radio', { name: /크레딧 교환/i })
        fireEvent.click(creditRadio)
      })

      const testersInput = screen.getByLabelText(/목표 테스터 수/i)
      fireEvent.change(testersInput, { target: { value: '14' } })

      const testLinkInput = screen.getByLabelText(/Google Play 테스트 링크/i)
      fireEvent.change(testLinkInput, { target: { value: 'https://play.google.com/apps/test' } })

      const nextButton2 = screen.getByRole('button', { name: /다음/i })
      fireEvent.click(nextButton2)

      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /앱 등록/i })
        fireEvent.click(submitButton)
      })

      await waitFor(() => {
        expect(screen.getByText(/Package name already exists/i)).toBeInTheDocument()
      })
    })
  })
})
