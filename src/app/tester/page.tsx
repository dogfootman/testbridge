'use client'

// @TASK T-01 - 테스터 홈 / 앱 탐색
// @SPEC specs/screens/tester-home.yaml
// @TEST src/app/tester/page.test.tsx

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Category {
  id: number
  name: string
  icon: string | null
  sortOrder: number
}

interface App {
  id: number
  appName: string
  categoryId: number
  iconUrl: string | null
  description: string
  rewardAmount: number | null
  rewardType: string | null
  targetTesters: number
  status: string
  category: {
    id: number
    name: string
    icon: string | null
  }
  _count: {
    participations: number
  }
}

export default function TesterHome() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // State
  const [categories, setCategories] = useState<Category[]>([])
  const [apps, setApps] = useState<App[]>([])
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [rewardMin, setRewardMin] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Authentication handling
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (
      status === 'authenticated' &&
      session?.user?.role !== 'TESTER'
    ) {
      if (session?.user?.role === 'DEVELOPER') {
        router.push('/developer')
      } else {
        router.push('/')
      }
    }
  }, [status, session, router])

  // Fetch categories
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'TESTER') {
      fetchCategories()
    }
  }, [status, session])

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Fetch apps
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'TESTER') {
      fetchApps()
    }
  }, [status, session, selectedCategory, debouncedSearch, rewardMin])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const fetchApps = async () => {
    try {
      setIsLoading(true)

      const params = new URLSearchParams({
        status: 'RECRUITING',
      })

      if (selectedCategory) {
        params.append('categoryId', selectedCategory.toString())
      }

      if (debouncedSearch.trim()) {
        params.append('search', debouncedSearch.trim())
      }

      if (rewardMin !== null) {
        params.append('rewardMin', rewardMin.toString())
      }

      const response = await fetch(`/api/apps?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setApps(data.apps || [])
      }
    } catch (error) {
      console.error('Failed to fetch apps:', error)
    } finally {
      setIsLoading(false)
    }
  }


  const handleCategoryClick = (categoryId: number | null) => {
    setSelectedCategory(categoryId)
  }

  const handleRewardFilterChange = (minAmount: number | null) => {
    setRewardMin(minAmount)
  }

  const handleAppClick = (appId: number) => {
    router.push(`/tester/apps/${appId}`)
  }

  const isHotApp = (app: App): boolean => {
    const remainingSlots = app.targetTesters - app._count.participations
    return remainingSlots < 5 || (app.rewardAmount || 0) >= 5000
  }

  const getRemainingSlots = (app: App): number => {
    return app.targetTesters - app._count.participations
  }

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>로딩 중...</p>
        </div>
      </div>
    )
  }

  // Render for authenticated TESTER
  if (status === 'authenticated' && session?.user?.role === 'TESTER') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <h1 className="text-2xl font-bold text-gray-900">테스터 홈</h1>
              <button
                data-testid="logout-button"
                onClick={() => signOut({ redirect: true, callbackUrl: '/' })}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition"
              >
                로그아웃
              </button>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-8">
            {/* Sidebar - 카테고리 필터 */}
            <aside className="w-64 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  카테고리
                </h2>
                <div className="space-y-2">
                  <button
                    onClick={() => handleCategoryClick(null)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition ${
                      selectedCategory === null
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    전체
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryClick(category.id)}
                      className={`w-full text-left px-4 py-2 rounded-lg transition ${
                        selectedCategory === category.id
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category.icon && (
                        <span className="mr-2">{category.icon}</span>
                      )}
                      {category.name}
                    </button>
                  ))}
                </div>

                {/* 리워드 금액 필터 */}
                <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-4">
                  리워드 금액
                </h2>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="rewardFilter"
                      checked={rewardMin === null}
                      onChange={() => handleRewardFilterChange(null)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">전체</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="rewardFilter"
                      checked={rewardMin === 5000}
                      onChange={() => handleRewardFilterChange(5000)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">5,000원 이상</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="rewardFilter"
                      checked={rewardMin === 3000}
                      onChange={() => handleRewardFilterChange(3000)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">3,000원 이상</span>
                  </label>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1">
              {/* Search Bar */}
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="앱 이름 또는 키워드 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                />
              </div>

              {/* Apps Grid */}
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">앱 목록을 불러오는 중...</p>
                </div>
              ) : apps.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                  <p className="text-gray-600">모집 중인 앱이 없습니다.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {apps.map((app) => (
                    <button
                      key={app.id}
                      onClick={() => handleAppClick(app.id)}
                      className="bg-white rounded-lg shadow-sm hover:shadow-md transition p-6 text-left relative"
                    >
                      {/* HOT 태그 */}
                      {isHotApp(app) && (
                        <div className="absolute top-4 right-4 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                          HOT
                        </div>
                      )}

                      {/* 앱 아이콘 */}
                      <div className="flex items-start mb-4">
                        {app.iconUrl ? (
                          <img
                            src={app.iconUrl}
                            alt={app.appName}
                            className="w-12 h-12 rounded-lg mr-3"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded-lg mr-3 flex items-center justify-center">
                            <span className="text-gray-400 text-2xl">
                              {app.category.icon || '📱'}
                            </span>
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {app.appName}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {app.category.name}
                          </p>
                        </div>
                      </div>

                      {/* 설명 */}
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {app.description}
                      </p>

                      {/* 리워드 & 남은 자리 */}
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">리워드</p>
                          <p className="text-lg font-bold text-green-600">
                            {app.rewardAmount
                              ? `${app.rewardAmount.toLocaleString()}원`
                              : '크레딧 교환'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500 mb-1">남은 자리</p>
                          <p className="text-lg font-bold text-gray-900">
                            {getRemainingSlots(app)}명 남음
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    )
  }

  return null
}
