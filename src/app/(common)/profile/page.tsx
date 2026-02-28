// @TASK P2-S4 - Profile 페이지 (마이페이지)
// @SPEC specs/screens/profile.yaml
// @TEST src/app/(common)/profile/page.test.tsx

'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface UserData {
  id: number
  email: string
  nickname: string | null
  bio: string | null
  profileImageUrl: string | null
  role: 'NONE' | 'DEVELOPER' | 'TESTER' | 'BOTH' | 'ADMIN'
  createdAt: string
  currentPlan: 'FREE' | 'BASIC' | 'PRO' | 'ENTERPRISE'
  pointBalance: number
  creditBalance: number
  trustScore: number
  trustBadge: 'BRONZE' | 'SILVER' | 'GOLD' | 'DIAMOND'
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    nickname: '',
    bio: '',
  })

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    emailEnabled: true,
    pushEnabled: true,
    smsEnabled: false,
  })

  // Fetch notification settings
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      fetchNotificationSettings()
    }
  }, [status, session])

  const fetchNotificationSettings = async () => {
    try {
      const response = await fetch('/api/notification-settings')
      if (response.ok) {
        const data = await response.json()
        setNotificationSettings({
          emailEnabled: data.emailEnabled,
          pushEnabled: data.pushEnabled,
          smsEnabled: data.smsEnabled,
        })
      }
    } catch (err) {
      console.error('Error fetching notification settings:', err)
    }
  }

  const updateNotificationSettings = async (
    key: 'emailEnabled' | 'pushEnabled' | 'smsEnabled',
    value: boolean
  ) => {
    try {
      const response = await fetch('/api/notification-settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [key]: value }),
      })

      if (response.ok) {
        setNotificationSettings({ ...notificationSettings, [key]: value })
      }
    } catch (err) {
      console.error('Error updating notification settings:', err)
    }
  }

  // Fetch user data
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      fetchUserData()
    } else if (status === 'unauthenticated') {
      setLoading(false)
    }
  }, [status, session])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/users/${session?.user?.id}`)

      if (!response.ok) {
        throw new Error('Failed to fetch user data')
      }

      const data = await response.json()
      setUserData(data)
      setFormData({
        nickname: data.nickname || '',
        bio: data.bio || '',
      })
    } catch (err) {
      console.error('Error fetching user data:', err)
      setError('데이터를 불러올 수 없습니다')
    } finally {
      setLoading(false)
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccessMessage(null)
    setError(null)

    try {
      const response = await fetch(`/api/users/${session?.user?.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      const updatedUser = await response.json()
      setUserData(updatedUser)
      setSuccessMessage('프로필이 업데이트되었습니다')
    } catch (err) {
      console.error('Error updating profile:', err)
      setError('프로필 업데이트에 실패했습니다')
    }
  }

  const handleRoleChange = async (newRole: UserData['role']) => {
    try {
      const response = await fetch(`/api/users/${session?.user?.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      })

      if (!response.ok) {
        throw new Error('Failed to update role')
      }

      const updatedUser = await response.json()
      setUserData(updatedUser)

      // Redirect based on role
      if (newRole === 'DEVELOPER') {
        router.push('/developer/dashboard')
      } else if (newRole === 'TESTER') {
        router.push('/tester/dashboard')
      }
    } catch (err) {
      console.error('Error updating role:', err)
      setError('역할 변경에 실패했습니다')
    }
  }

  const handleLogout = () => {
    // Implement logout logic
    router.push('/')
  }

  const handleDeleteAccount = () => {
    setShowDeleteModal(true)
  }

  const confirmDeleteAccount = async () => {
    try {
      const response = await fetch(`/api/users/${session?.user?.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'WITHDRAWN' }),
      })

      if (!response.ok) {
        throw new Error('Failed to delete account')
      }

      router.push('/')
    } catch (err) {
      console.error('Error deleting account:', err)
      setError('회원탈퇴에 실패했습니다')
    }
  }

  // Loading state
  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">로딩 중...</p>
      </div>
    )
  }

  // Unauthenticated state
  if (status === 'unauthenticated') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-red-600">로그인이 필요합니다</p>
      </div>
    )
  }

  // Error state
  if (error && !userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-red-600">{error}</p>
      </div>
    )
  }

  if (!userData) {
    return null
  }

  const { role, currentPlan, pointBalance, creditBalance, trustBadge } = userData

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">마이페이지</h1>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 text-green-800 rounded-lg">
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-lg">
          {error}
        </div>
      )}

      {/* Profile Card */}
      <section className="mb-8 p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">프로필 정보</h2>
        <div className="flex items-center gap-4">
          <img
            src={userData.profileImageUrl || '/default-avatar.png'}
            alt="Profile"
            className="w-20 h-20 rounded-full object-cover"
          />
          <div>
            <p className="text-2xl font-bold">{userData.nickname || '닉네임 없음'}</p>
            <p className="text-gray-600">{userData.bio || ''}</p>
            <p className="text-sm text-gray-500 mt-1">
              가입일: {new Date(userData.createdAt).toLocaleDateString()}
            </p>
            <p className="text-sm font-medium mt-1">역할: {role}</p>
          </div>
        </div>
      </section>

      {/* Profile Edit Form */}
      <section className="mb-8 p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">프로필 편집</h2>
        <form onSubmit={handleProfileUpdate}>
          <div className="mb-4">
            <label htmlFor="nickname" className="block text-sm font-medium mb-2">
              닉네임
            </label>
            <input
              type="text"
              id="nickname"
              value={formData.nickname}
              onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="bio" className="block text-sm font-medium mb-2">
              자기소개
            </label>
            <textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            저장
          </button>
        </form>
      </section>

      {/* Role Switch */}
      <section className="mb-8 p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">역할 전환</h2>
        <div className="flex items-center gap-4">
          <label htmlFor="role-switch" className="text-sm font-medium">
            역할 전환
          </label>
          <select
            id="role-switch"
            value={role}
            onChange={(e) => handleRoleChange(e.target.value as UserData['role'])}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="TESTER">테스터</option>
            <option value="DEVELOPER">개발자</option>
            <option value="BOTH">둘 다</option>
          </select>
        </div>
      </section>

      {/* Subscription Card */}
      <section className="mb-8 p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">구독 플랜</h2>
        <p className="text-lg mb-4">현재 플랜: {currentPlan}</p>
        <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
          플랜 변경
        </button>
      </section>

      {/* Credits & Points */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Credits (Developer/Both) */}
        {(role === 'DEVELOPER' || role === 'BOTH') && (
          <section className="p-6 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">크레딧</h2>
            <p className="text-3xl font-bold text-blue-600">{creditBalance}</p>
          </section>
        )}

        {/* Points (Tester/Both) */}
        {(role === 'TESTER' || role === 'BOTH') && (
          <section className="p-6 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">리워드 포인트</h2>
            <p className="text-3xl font-bold text-green-600">{pointBalance}</p>
          </section>
        )}
      </div>

      {/* Trust Badge (Tester/Both) */}
      {(role === 'TESTER' || role === 'BOTH') && (
        <section className="mb-8 p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">신뢰도 배지</h2>
          <p className="text-2xl font-bold text-yellow-600">{trustBadge}</p>
        </section>
      )}

      {/* Notification Settings */}
      <section className="mb-8 p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">알림 설정</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label htmlFor="email-notification" className="text-sm font-medium">
              이메일 알림
            </label>
            <input
              type="checkbox"
              id="email-notification"
              checked={notificationSettings.emailEnabled}
              onChange={(e) => updateNotificationSettings('emailEnabled', e.target.checked)}
              className="w-5 h-5"
            />
          </div>
          <div className="flex items-center justify-between">
            <label htmlFor="push-notification" className="text-sm font-medium">
              푸시 알림
            </label>
            <input
              type="checkbox"
              id="push-notification"
              checked={notificationSettings.pushEnabled}
              onChange={(e) => updateNotificationSettings('pushEnabled', e.target.checked)}
              className="w-5 h-5"
            />
          </div>
        </div>
      </section>

      {/* Logout & Delete Account */}
      <section className="mb-8 p-6 bg-white rounded-lg shadow">
        <div className="flex gap-4">
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            로그아웃
          </button>
          <button
            onClick={handleDeleteAccount}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            회원탈퇴
          </button>
        </div>
      </section>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
            <h3 className="text-xl font-bold mb-4">회원탈퇴 확인</h3>
            <p className="mb-6">정말 탈퇴하시겠습니까?</p>
            <div className="flex gap-4">
              <button
                onClick={confirmDeleteAccount}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                확인
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
