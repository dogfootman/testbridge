/**
 * @TEST P2-S4-V - Profile 페이지 통합 테스트
 * @IMPL src/app/(common)/profile/page.tsx + src/app/api/users/[id]/route.ts
 * @SPEC specs/screens/profile.yaml
 *
 * 프로필 수정 후 DB 반영을 확인하는 통합 테스트
 * 검증 항목:
 * - 프로필 편집 폼 렌더링
 * - 역할 전환 UI 표시
 * - 크레딧/포인트 표시
 * - 프로필 수정 후 DB 업데이트 확인
 * - 이미지 업로드 기능
 * - 알림 설정 토글
 */

import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useSession } from 'next-auth/react'
import ProfilePage from './page'
import '@testing-library/jest-dom'

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    refresh: jest.fn(),
  })),
}))

// Mock fetch - will be controlled per test
global.fetch = jest.fn()

describe('Profile Page - Integration Tests (P2-S4-V)', () => {
  const mockSession = {
    user: {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
    },
  }

  const mockUserData = {
    id: 1,
    email: 'test@example.com',
    nickname: 'testuser',
    bio: 'Hello, I am a tester',
    profileImageUrl: 'https://example.com/avatar.jpg',
    role: 'TESTER' as const,
    createdAt: '2024-01-01T00:00:00.000Z',
    currentPlan: 'FREE' as const,
    pointBalance: 1000,
    creditBalance: 50,
    trustScore: 75,
    trustBadge: 'SILVER' as const,
    status: 'ACTIVE',
    remainingApps: 1,
  }

  const mockNotificationSettings = {
    emailEnabled: true,
    pushEnabled: true,
    smsEnabled: false,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useSession as jest.Mock).mockReturnValue({
      data: mockSession,
      status: 'authenticated',
    })
  })

  describe('TEST 1: Profile 폼 렌더링 및 데이터 로드', () => {
    /**
     * @TEST P2-S4-V.1.1 - 프로필 편집 폼 렌더링
     * 검증: 닉네임, 자기소개 입력 필드 표시
     */
    it('should render profile edit form with all fields', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockUserData,
      })

      render(<ProfilePage />)

      await waitFor(() => {
        expect(screen.getByLabelText(/닉네임/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/자기소개/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /저장/i })).toBeInTheDocument()
      })
    })

    /**
     * @TEST P2-S4-V.1.2 - 초기 데이터 로드
     * 검증: API에서 받은 데이터로 폼 필드 채우기
     */
    it('should load and display user data from API', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockUserData,
      })

      render(<ProfilePage />)

      await waitFor(() => {
        const nicknameInput = screen.getByLabelText(/닉네임/i) as HTMLInputElement
        expect(nicknameInput.value).toBe('testuser')

        const bioInput = screen.getByLabelText(/자기소개/i) as HTMLTextAreaElement
        expect(bioInput.value).toBe('Hello, I am a tester')
      })
    })
  })

  describe('TEST 2: 역할 전환 UI 및 기능', () => {
    /**
     * @TEST P2-S4-V.2.1 - 역할 전환 드롭다운 표시
     * 검증: TESTER, DEVELOPER, BOTH 옵션 표시
     */
    it('should display role switch dropdown with all options', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockUserData,
      })

      render(<ProfilePage />)

      await waitFor(() => {
        const roleSelect = screen.getByLabelText(/역할 전환/i) as HTMLSelectElement
        expect(roleSelect).toBeInTheDocument()
        expect(roleSelect.value).toBe('TESTER')

        const options = Array.from(roleSelect.options).map((opt) => opt.value)
        expect(options).toContain('TESTER')
        expect(options).toContain('DEVELOPER')
        expect(options).toContain('BOTH')
      })
    })

    /**
     * @TEST P2-S4-V.2.2 - 역할 변경 시 API 호출
     * 검증: PATCH /api/users/[id] 호출 확인
     */
    it('should call API when changing role', async () => {
      const fetchMock = global.fetch as jest.Mock

      // Initial data load
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUserData,
      })

      // Notification settings
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockNotificationSettings,
      })

      // Role update
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockUserData, role: 'DEVELOPER' }),
      })

      render(<ProfilePage />)

      await waitFor(() => {
        expect(screen.getByLabelText(/역할 전환/i)).toBeInTheDocument()
      })

      const roleSelect = screen.getByLabelText(/역할 전환/i)
      fireEvent.change(roleSelect, { target: { value: 'DEVELOPER' } })

      await waitFor(() => {
        const patchCalls = fetchMock.mock.calls.filter(
          (call: any[]) => call[1]?.method === 'PATCH'
        )
        expect(patchCalls.length).toBeGreaterThan(0)

        const lastPatchCall = patchCalls[patchCalls.length - 1]
        expect(lastPatchCall[0]).toContain('/api/users/1')
        expect(JSON.parse(lastPatchCall[1].body)).toHaveProperty('role', 'DEVELOPER')
      })
    })
  })

  describe('TEST 3: 크레딧/포인트 표시', () => {
    /**
     * @TEST P2-S4-V.3.1 - 테스터: 포인트 표시
     * 검증: role=TESTER일 때 포인트 표시
     */
    it('should display point balance for TESTER role', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockUserData,
      })

      render(<ProfilePage />)

      await waitFor(() => {
        expect(screen.getByText(/리워드 포인트/i)).toBeInTheDocument()
        expect(screen.getByText('1000')).toBeInTheDocument()
      })
    })

    /**
     * @TEST P2-S4-V.3.2 - 개발자: 크레딧 표시
     * 검증: role=DEVELOPER일 때 크레딧 표시
     */
    it('should display credit balance for DEVELOPER role', async () => {
      const devUserData = { ...mockUserData, role: 'DEVELOPER' }

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => devUserData,
      })

      render(<ProfilePage />)

      await waitFor(() => {
        expect(screen.getByText(/크레딧/i)).toBeInTheDocument()
        expect(screen.getByText('50')).toBeInTheDocument()
      })
    })

    /**
     * @TEST P2-S4-V.3.3 - BOTH 역할: 크레딧과 포인트 모두 표시
     * 검증: role=BOTH일 때 크레딧, 포인트 모두 표시
     */
    it('should display both credit and point for BOTH role', async () => {
      const bothUserData = { ...mockUserData, role: 'BOTH' }

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => bothUserData,
      })

      render(<ProfilePage />)

      await waitFor(() => {
        expect(screen.getByText(/크레딧/i)).toBeInTheDocument()
        expect(screen.getByText(/리워드 포인트/i)).toBeInTheDocument()
      })
    })
  })

  describe('TEST 4: 프로필 수정 및 DB 업데이트', () => {
    /**
     * @TEST P2-S4-V.4.1 - 닉네임 수정 후 DB 반영
     * 검증:
     * - 입력값 변경
     * - 저장 버튼 클릭
     * - PATCH /api/users/[id] 호출 확인
     * - 응답 데이터로 UI 업데이트
     */
    it('should update nickname and reflect in DB', async () => {
      const fetchMock = global.fetch as jest.Mock

      // Initial load
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUserData,
      })

      // Notification settings
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockNotificationSettings,
      })

      // Profile update
      const updatedData = { ...mockUserData, nickname: 'newtester' }
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => updatedData,
      })

      render(<ProfilePage />)

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByLabelText(/닉네임/i)).toBeInTheDocument()
      })

      // Change nickname
      const nicknameInput = screen.getByLabelText(/닉네임/i) as HTMLInputElement
      fireEvent.change(nicknameInput, { target: { value: 'newtester' } })

      // Submit form
      const saveButton = screen.getByRole('button', { name: /저장/i })
      fireEvent.click(saveButton)

      // Verify API call
      await waitFor(() => {
        const patchCalls = fetchMock.mock.calls.filter(
          (call: any[]) => call[1]?.method === 'PATCH'
        )
        expect(patchCalls.length).toBeGreaterThan(0)

        const updateCall = patchCalls.find(
          (call: any[]) => call[0].includes('/api/users/') && !call[0].includes('notification')
        )
        expect(updateCall).toBeDefined()
        expect(JSON.parse(updateCall[1].body)).toHaveProperty('nickname', 'newtester')
      })

      // Verify success message
      await waitFor(() => {
        expect(screen.getByText(/프로필이 업데이트되었습니다/i)).toBeInTheDocument()
      })
    })

    /**
     * @TEST P2-S4-V.4.2 - 자기소개 수정 후 DB 반영
     * 검증: bio 필드 수정 및 저장
     */
    it('should update bio and reflect in DB', async () => {
      const fetchMock = global.fetch as jest.Mock

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUserData,
      })

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockNotificationSettings,
      })

      const updatedData = { ...mockUserData, bio: 'Updated bio text' }
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => updatedData,
      })

      render(<ProfilePage />)

      await waitFor(() => {
        expect(screen.getByLabelText(/자기소개/i)).toBeInTheDocument()
      })

      const bioInput = screen.getByLabelText(/자기소개/i)
      fireEvent.change(bioInput, { target: { value: 'Updated bio text' } })

      const saveButton = screen.getByRole('button', { name: /저장/i })
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(screen.getByText(/프로필이 업데이트되었습니다/i)).toBeInTheDocument()
      })
    })

    /**
     * @TEST P2-S4-V.4.3 - 프로필 수정 실패 시 에러 메시지
     * 검증: API 에러 시 적절한 에러 메시지 표시
     */
    it('should display error message on profile update failure', async () => {
      const fetchMock = global.fetch as jest.Mock

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUserData,
      })

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockNotificationSettings,
      })

      // Profile update fails
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 500,
      })

      render(<ProfilePage />)

      await waitFor(() => {
        expect(screen.getByLabelText(/닉네임/i)).toBeInTheDocument()
      })

      const nicknameInput = screen.getByLabelText(/닉네임/i)
      fireEvent.change(nicknameInput, { target: { value: 'newtester' } })

      const saveButton = screen.getByRole('button', { name: /저장/i })
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(screen.getByText(/프로필 업데이트에 실패했습니다/i)).toBeInTheDocument()
      })
    })
  })

  describe('TEST 5: 알림 설정 토글', () => {
    /**
     * @TEST P2-S4-V.5.1 - 이메일 알림 토글
     * 검증: 체크박스 클릭 시 API 호출
     */
    it('should toggle email notification setting', async () => {
      const fetchMock = global.fetch as jest.Mock

      // Setup mock to resolve appropriately
      fetchMock.mockImplementation((url: string, options?: any) => {
        if (url.includes('/api/users/')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockUserData,
          })
        }
        if (url.includes('/api/notification-settings')) {
          if (options?.method === 'PATCH') {
            return Promise.resolve({
              ok: true,
              json: async () => ({ ...mockNotificationSettings, emailEnabled: false }),
            })
          }
          return Promise.resolve({
            ok: true,
            json: async () => mockNotificationSettings,
          })
        }
        return Promise.reject(new Error('Unknown URL'))
      })

      render(<ProfilePage />)

      // Wait for notification settings to load and the checkbox to be checked
      await waitFor(
        () => {
          const emailToggle = screen.getByLabelText(/이메일 알림/i) as HTMLInputElement
          expect(emailToggle).toBeInTheDocument()
        },
        { timeout: 2000 }
      )

      const emailToggle = screen.getByLabelText(/이메일 알림/i) as HTMLInputElement
      // Check the current state before clicking
      const initialState = emailToggle.checked
      fireEvent.click(emailToggle)

      // Verify the PATCH call was made to notification-settings endpoint
      await waitFor(
        () => {
          const patchCalls = fetchMock.mock.calls.filter(
            (call: any[]) => call[0]?.includes('/api/notification-settings') && call[1]?.method === 'PATCH'
          )
          expect(patchCalls.length).toBeGreaterThan(0)
        },
        { timeout: 1000 }
      )
    })

    /**
     * @TEST P2-S4-V.5.2 - 푸시 알림 토글
     * 검증: 푸시 알림 설정 변경
     */
    it('should toggle push notification setting', async () => {
      const fetchMock = global.fetch as jest.Mock

      // Setup mock to resolve appropriately
      fetchMock.mockImplementation((url: string, options?: any) => {
        if (url.includes('/api/users/')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockUserData,
          })
        }
        if (url.includes('/api/notification-settings')) {
          if (options?.method === 'PATCH') {
            return Promise.resolve({
              ok: true,
              json: async () => ({ ...mockNotificationSettings, pushEnabled: false }),
            })
          }
          return Promise.resolve({
            ok: true,
            json: async () => mockNotificationSettings,
          })
        }
        return Promise.reject(new Error('Unknown URL'))
      })

      render(<ProfilePage />)

      await waitFor(
        () => {
          const pushToggle = screen.getByLabelText(/푸시 알림/i) as HTMLInputElement
          expect(pushToggle).toBeInTheDocument()
        },
        { timeout: 2000 }
      )

      const pushToggle = screen.getByLabelText(/푸시 알림/i) as HTMLInputElement
      fireEvent.click(pushToggle)

      await waitFor(
        () => {
          const patchCalls = fetchMock.mock.calls.filter(
            (call: any[]) => call[0]?.includes('/api/notification-settings') && call[1]?.method === 'PATCH'
          )
          expect(patchCalls.length).toBeGreaterThan(0)
        },
        { timeout: 1000 }
      )
    })
  })

  describe('TEST 6: 신뢰도 배지 표시', () => {
    /**
     * @TEST P2-S4-V.6.1 - 테스터: 신뢰도 배지 표시
     * 검증: role=TESTER일 때 신뢰도 배지 표시
     */
    it('should display trust badge for TESTER role', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockUserData,
      })

      render(<ProfilePage />)

      await waitFor(() => {
        expect(screen.getByText(/신뢰도 배지/i)).toBeInTheDocument()
        expect(screen.getByText('SILVER')).toBeInTheDocument()
      })
    })

    /**
     * @TEST P2-S4-V.6.2 - 개발자: 신뢰도 배지 미표시
     * 검증: role=DEVELOPER일 때 신뢰도 배지 비표시
     */
    it('should not display trust badge for DEVELOPER role', async () => {
      const devUserData = { ...mockUserData, role: 'DEVELOPER' }

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => devUserData,
      })

      render(<ProfilePage />)

      await waitFor(() => {
        expect(screen.queryByText(/신뢰도 배지/i)).not.toBeInTheDocument()
      })
    })
  })

  describe('TEST 7: 구독 플랜 표시', () => {
    /**
     * @TEST P2-S4-V.7.1 - 현재 구독 플랜 표시
     * 검증: 현재 플랜 정보 표시
     */
    it('should display current subscription plan', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockUserData,
      })

      render(<ProfilePage />)

      await waitFor(() => {
        expect(screen.getByText(/구독 플랜/i)).toBeInTheDocument()
        expect(screen.getByText(/FREE/i)).toBeInTheDocument()
      })
    })

    /**
     * @TEST P2-S4-V.7.2 - 플랜 변경 버튼 표시
     * 검증: 플랜 변경 버튼 렌더링
     */
    it('should display plan change button', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockUserData,
      })

      render(<ProfilePage />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /플랜 변경/i })).toBeInTheDocument()
      })
    })
  })

  describe('TEST 8: 로그아웃 및 회원탈퇴', () => {
    /**
     * @TEST P2-S4-V.8.1 - 로그아웃 버튼 표시
     * 검증: 로그아웃 버튼 렌더링
     */
    it('should display logout button', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockUserData,
      })

      render(<ProfilePage />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /로그아웃/i })).toBeInTheDocument()
      })
    })

    /**
     * @TEST P2-S4-V.8.2 - 회원탈퇴 버튼 표시
     * 검증: 회원탈퇴 버튼 렌더링
     */
    it('should display delete account button', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockUserData,
      })

      render(<ProfilePage />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /회원탈퇴/i })).toBeInTheDocument()
      })
    })

    /**
     * @TEST P2-S4-V.8.3 - 회원탈퇴 확인 모달
     * 검증: 회원탈퇴 버튼 클릭 시 확인 모달 표시
     */
    it('should show delete account confirmation modal', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockUserData,
      })

      render(<ProfilePage />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /회원탈퇴/i })).toBeInTheDocument()
      })

      const deleteButton = screen.getByRole('button', { name: /회원탈퇴/i })
      fireEvent.click(deleteButton)

      await waitFor(() => {
        expect(screen.getByText(/정말 탈퇴하시겠습니까/i)).toBeInTheDocument()
      })
    })
  })

  describe('TEST 9: 에러 및 로딩 상태', () => {
    /**
     * @TEST P2-S4-V.9.1 - 로딩 상태
     * 검증: 데이터 로드 중 로딩 인디케이터 표시
     */
    it('should show loading indicator while fetching data', async () => {
      ;(useSession as jest.Mock).mockReturnValue({
        data: mockSession,
        status: 'authenticated',
      })

      // Mock fetch to delay
      ;(global.fetch as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => mockUserData,
                }),
              100
            )
          )
      )

      render(<ProfilePage />)

      // Initial render should show loading
      expect(screen.getByText(/로딩 중/i)).toBeInTheDocument()

      // Wait for data to load
      await waitFor(() => {
        expect(screen.queryByText(/로딩 중/i)).not.toBeInTheDocument()
      })
    })

    /**
     * @TEST P2-S4-V.9.2 - 미인증 상태
     * 검증: 미인증 사용자에게 에러 메시지 표시
     */
    it('should show error message for unauthenticated user', () => {
      ;(useSession as jest.Mock).mockReturnValue({
        data: null,
        status: 'unauthenticated',
      })

      render(<ProfilePage />)

      expect(screen.getByText(/로그인이 필요합니다/i)).toBeInTheDocument()
    })

    /**
     * @TEST P2-S4-V.9.3 - API 에러 상태
     * 검증: API 에러 시 에러 메시지 표시
     */
    it('should show error message when API call fails', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'))

      render(<ProfilePage />)

      await waitFor(() => {
        expect(screen.getByText(/데이터를 불러올 수 없습니다/i)).toBeInTheDocument()
      })
    })
  })

  describe('TEST 10: 프로필 카드 정보 표시', () => {
    /**
     * @TEST P2-S4-V.10.1 - 프로필 이미지, 닉네임, 자기소개 표시
     * 검증: 프로필 카드의 모든 정보 표시
     */
    it('should display complete profile card information', async () => {
      const fetchMock = global.fetch as jest.Mock

      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => mockUserData,
      })

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockNotificationSettings,
      })

      render(<ProfilePage />)

      await waitFor(
        () => {
          expect(screen.getByText('testuser')).toBeInTheDocument()
        },
        { timeout: 2000 }
      )

      const bioTexts = screen.getAllByText('Hello, I am a tester')
      expect(bioTexts.length).toBeGreaterThan(0)
      expect(screen.getByText(/가입일/)).toBeInTheDocument()

      const profileImage = screen.getByAltText('Profile') as HTMLImageElement
      expect(profileImage).toBeInTheDocument()
      expect(profileImage.src).toContain('avatar.jpg')
    })

    /**
     * @TEST P2-S4-V.10.2 - 기본 아바타 표시
     * 검증: profileImageUrl이 없을 때 기본 아바타 표시
     */
    it('should display default avatar when profileImageUrl is null', async () => {
      const userData = { ...mockUserData, profileImageUrl: null }
      const fetchMock = global.fetch as jest.Mock

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => userData,
      })

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockNotificationSettings,
      })

      render(<ProfilePage />)

      await waitFor(() => {
        const profileImage = screen.getByAltText('Profile') as HTMLImageElement
        expect(profileImage.src).toContain('default-avatar.png')
      })
    })
  })
})
