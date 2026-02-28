// @TASK P2-S4 - Profile 페이지 테스트
// @SPEC specs/screens/profile.yaml
// @TDD RED Phase

import { render, screen, waitFor, fireEvent } from '@testing-library/react'
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

// Mock fetch
global.fetch = jest.fn()

describe('Profile Page - RED Phase', () => {
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
    role: 'TESTER',
    createdAt: '2024-01-01T00:00:00.000Z',
    currentPlan: 'FREE',
    pointBalance: 1000,
    creditBalance: 50,
    trustScore: 75,
    trustBadge: 'SILVER',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useSession as jest.Mock).mockReturnValue({
      data: mockSession,
      status: 'authenticated',
    })
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockUserData,
    })
  })

  describe('Profile Card - 프로필 요약', () => {
    it('사용자 프로필 정보를 표시해야 함', async () => {
      render(<ProfilePage />)

      await waitFor(() => {
        expect(screen.getByText('testuser')).toBeInTheDocument()
      })

      expect(screen.getAllByText('Hello, I am a tester').length).toBeGreaterThan(0)
      expect(screen.getByText(/가입일/)).toBeInTheDocument()
    })

    it('프로필 이미지를 표시해야 함', async () => {
      render(<ProfilePage />)

      await waitFor(() => {
        const avatar = screen.getByAltText('Profile')
        expect(avatar).toBeInTheDocument()
        expect(avatar).toHaveAttribute('src', expect.stringContaining('avatar.jpg'))
      })
    })

    it('역할(Role)을 표시해야 함', async () => {
      render(<ProfilePage />)

      await waitFor(() => {
        expect(screen.getAllByText(/TESTER/i).length).toBeGreaterThan(0)
      })
    })
  })

  describe('Profile Edit Form - 프로필 편집', () => {
    it('닉네임 입력 필드가 있어야 함', async () => {
      render(<ProfilePage />)

      await waitFor(() => {
        const nicknameInput = screen.getByLabelText(/닉네임/i)
        expect(nicknameInput).toBeInTheDocument()
        expect(nicknameInput).toHaveValue('testuser')
      })
    })

    it('자기소개 입력 필드가 있어야 함', async () => {
      render(<ProfilePage />)

      await waitFor(() => {
        const bioInput = screen.getByLabelText(/자기소개/i)
        expect(bioInput).toBeInTheDocument()
        expect(bioInput).toHaveValue('Hello, I am a tester')
      })
    })

    it('저장 버튼이 있어야 함', async () => {
      render(<ProfilePage />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /저장/i })).toBeInTheDocument()
      })
    })

    it('프로필 편집 성공 시 성공 메시지를 표시해야 함', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockUserData, nickname: 'newtester' }),
      })

      render(<ProfilePage />)

      await waitFor(() => {
        const nicknameInput = screen.getByLabelText(/닉네임/i)
        fireEvent.change(nicknameInput, { target: { value: 'newtester' } })
      })

      const saveButton = screen.getByRole('button', { name: /저장/i })
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(screen.getByText(/프로필이 업데이트되었습니다/i)).toBeInTheDocument()
      })
    })
  })

  describe('Role Switch - 역할 전환', () => {
    it('역할 전환 토글이 있어야 함', async () => {
      render(<ProfilePage />)

      await waitFor(() => {
        expect(screen.getByLabelText(/역할 전환/i)).toBeInTheDocument()
      })
    })

    it('역할 전환 시 users.role이 업데이트되어야 함', async () => {
      const fetchMock = global.fetch as jest.Mock
      fetchMock.mockClear()

      // Setup mock to resolve appropriately
      fetchMock.mockImplementation((url: string, options?: any) => {
        if (url.includes('/api/users/')) {
          if (options?.method === 'PATCH') {
            return Promise.resolve({
              ok: true,
              json: async () => ({ ...mockUserData, role: 'DEVELOPER' }),
            })
          }
          return Promise.resolve({
            ok: true,
            json: async () => mockUserData,
          })
        }
        if (url.includes('/api/notification-settings')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              emailEnabled: true,
              pushEnabled: true,
              smsEnabled: false,
            }),
          })
        }
        return Promise.reject(new Error('Unknown URL'))
      })

      render(<ProfilePage />)

      await waitFor(() => {
        expect(screen.getByLabelText(/역할 전환/i)).toBeInTheDocument()
      })

      const roleToggle = screen.getByLabelText(/역할 전환/i) as HTMLSelectElement
      fireEvent.change(roleToggle, { target: { value: 'DEVELOPER' } })

      await waitFor(() => {
        const patchCalls = fetchMock.mock.calls.filter(
          (call: any[]) => call[1]?.method === 'PATCH' && call[0].includes('/api/users/')
        )
        expect(patchCalls.length).toBeGreaterThan(0)
        expect(JSON.parse(patchCalls[0][1].body)).toHaveProperty('role', 'DEVELOPER')
      })
    })
  })

  describe('Credits & Points - 크레딧/포인트 표시', () => {
    it('테스터일 때 포인트 잔액을 표시해야 함', async () => {
      render(<ProfilePage />)

      await waitFor(() => {
        expect(screen.getByText(/리워드 포인트/i)).toBeInTheDocument()
        expect(screen.getByText('1000')).toBeInTheDocument()
      })
    })

    it('개발자일 때 크레딧 잔액을 표시해야 함', async () => {
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

    it('BOTH 역할일 때 크레딧과 포인트 모두 표시해야 함', async () => {
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

  describe('Trust Badge - 신뢰도 배지', () => {
    it('테스터일 때 신뢰도 배지를 표시해야 함', async () => {
      render(<ProfilePage />)

      await waitFor(() => {
        expect(screen.getByText(/SILVER/i)).toBeInTheDocument()
      })
    })
  })

  describe('Subscription Card - 구독 플랜', () => {
    it('현재 구독 플랜을 표시해야 함', async () => {
      render(<ProfilePage />)

      await waitFor(() => {
        expect(screen.getByText(/FREE/i)).toBeInTheDocument()
      })
    })

    it('플랜 변경 버튼이 있어야 함', async () => {
      render(<ProfilePage />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /플랜 변경/i })).toBeInTheDocument()
      })
    })
  })

  describe('Notification Settings - 알림 설정', () => {
    it('알림 설정 토글들이 있어야 함', async () => {
      render(<ProfilePage />)

      await waitFor(() => {
        expect(screen.getByLabelText(/이메일 알림/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/푸시 알림/i)).toBeInTheDocument()
      })
    })
  })

  describe('Logout & Delete Account - 로그아웃 및 회원탈퇴', () => {
    it('로그아웃 버튼이 있어야 함', async () => {
      render(<ProfilePage />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /로그아웃/i })).toBeInTheDocument()
      })
    })

    it('회원탈퇴 버튼이 있어야 함', async () => {
      render(<ProfilePage />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /회원탈퇴/i })).toBeInTheDocument()
      })
    })

    it('회원탈퇴 버튼 클릭 시 확인 모달이 표시되어야 함', async () => {
      render(<ProfilePage />)

      await waitFor(() => {
        const deleteButton = screen.getByRole('button', { name: /회원탈퇴/i })
        fireEvent.click(deleteButton)
      })

      await waitFor(() => {
        expect(screen.getByText(/정말 탈퇴하시겠습니까/i)).toBeInTheDocument()
      })
    })
  })

  describe('Loading & Error States', () => {
    it('로딩 중일 때 로딩 인디케이터를 표시해야 함', () => {
      ;(useSession as jest.Mock).mockReturnValue({
        data: null,
        status: 'loading',
      })

      render(<ProfilePage />)

      expect(screen.getByText(/로딩 중/i)).toBeInTheDocument()
    })

    it('인증되지 않았을 때 에러 메시지를 표시해야 함', () => {
      ;(useSession as jest.Mock).mockReturnValue({
        data: null,
        status: 'unauthenticated',
      })

      render(<ProfilePage />)

      expect(screen.getByText(/로그인이 필요합니다/i)).toBeInTheDocument()
    })

    it('API 에러 시 에러 메시지를 표시해야 함', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'))

      render(<ProfilePage />)

      await waitFor(() => {
        expect(screen.getByText(/데이터를 불러올 수 없습니다/i)).toBeInTheDocument()
      })
    })
  })
})
