/**
 * P2-S5: S-05 Notifications (알림 센터)
 * TDD GREEN Phase - Implementation
 */

import { getServerSession } from 'next-auth/next'
import Link from 'next/link'

interface Notification {
  id: number
  type: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
  relatedId: number
}

/**
 * 알림 타입별 라우팅 경로 생성
 */
function getNotificationRoute(type: string, relatedId: number): string {
  const routes: Record<string, string> = {
    APPLICATION_APPROVED: `/tester/participations/${relatedId}`,
    TEST_STARTED: `/tester/participations/${relatedId}`,
    FEEDBACK_SUBMITTED: `/developer/apps/${relatedId}/feedbacks`,
    REWARD_PAID: `/tester/rewards`,
    DROPOUT_WARNING: `/tester/participations/${relatedId}`,
  }

  return routes[type] || '#'
}

/**
 * 시간 경과 표시 (예: 3시간 전, 2일 전)
 */
function getTimeAgo(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return '방금 전'
  if (diffMins < 60) return `${diffMins}분 전`
  if (diffHours < 24) return `${diffHours}시간 전`
  if (diffDays < 7) return `${diffDays}일 전`

  return date.toLocaleDateString('ko-KR')
}

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams?: { tab?: string; page?: string }
}) {
  const session = await getServerSession()
  const userId = session?.user?.id || 1

  const tab = searchParams?.tab || 'all'
  const page = parseInt(searchParams?.page || '1', 10)

  // API 호출
  let url = `/api/notifications?userId=${userId}&page=${page}`
  if (tab === 'unread') url += '&isRead=false'
  if (tab === 'read') url += '&isRead=true'

  const res = await fetch(`${process.env.NEXTAUTH_URL}${url}`, {
    cache: 'no-store',
  })

  const data = await res.json()
  const notifications: Notification[] = data.notifications || []
  const total: number = data.total || 0

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">알림 센터</h1>

        {/* 전체 읽음 버튼 */}
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => {
            fetch('/api/notifications/mark-all-read', {
              method: 'PATCH',
            }).then(() => window.location.reload())
          }}
        >
          전체 읽음
        </button>
      </div>

      {/* 탭 */}
      <div role="tablist" className="flex gap-4 mb-6 border-b">
        <Link
          href="/notifications?tab=all"
          className={`px-4 py-2 ${tab === 'all' ? 'border-b-2 border-blue-600 font-bold' : ''}`}
          role="tab"
        >
          전체
        </Link>
        <Link
          href="/notifications?tab=unread"
          className={`px-4 py-2 ${tab === 'unread' ? 'border-b-2 border-blue-600 font-bold' : ''}`}
          role="tab"
        >
          읽지않음
        </Link>
        <Link
          href="/notifications?tab=read"
          className={`px-4 py-2 ${tab === 'read' ? 'border-b-2 border-blue-600 font-bold' : ''}`}
          role="tab"
        >
          읽음
        </Link>
      </div>

      {/* 알림 목록 */}
      {notifications.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">새로운 알림이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notif) => (
            <Link
              key={notif.id}
              href={getNotificationRoute(notif.type, notif.relatedId)}
              className={`block p-4 rounded border ${
                notif.isRead
                  ? 'bg-white border-gray-200'
                  : 'bg-blue-50 border-blue-300 font-bold'
              } hover:shadow-md transition`}
              onClick={() => {
                // 읽음 처리
                if (!notif.isRead) {
                  fetch(`/api/notifications/${notif.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ isRead: true }),
                  })
                }
              }}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg mb-1">{notif.title}</h3>
                  <p className="text-sm text-gray-600">{notif.message}</p>
                </div>
                <span className="text-xs text-gray-400 ml-4">
                  {getTimeAgo(notif.createdAt)}
                </span>
              </div>

              {/* 읽음 상태 표시 */}
              {!notif.isRead && (
                <span className="inline-block mt-2 w-2 h-2 bg-blue-600 rounded-full"></span>
              )}
            </Link>
          ))}
        </div>
      )}

      {/* 페이지네이션 */}
      {total > 20 && (
        <div className="flex justify-center gap-2 mt-8">
          {page > 1 && (
            <Link
              href={`/notifications?tab=${tab}&page=${page - 1}`}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              이전
            </Link>
          )}
          <span className="px-4 py-2">
            {page} / {Math.ceil(total / 20)}
          </span>
          {page < Math.ceil(total / 20) && (
            <Link
              href={`/notifications?tab=${tab}&page=${page + 1}`}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              다음
            </Link>
          )}
        </div>
      )}
    </main>
  )
}
