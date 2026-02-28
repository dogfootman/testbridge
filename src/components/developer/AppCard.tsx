// @TASK P3-S6 - Developer Dashboard
// @COMPONENT AppCard - 진행 중인 앱 카드

import Link from 'next/link'

interface Participation {
  id: number
  appId: number
  status: string
}

interface AppCardProps {
  id: number
  appName: string
  iconUrl?: string | null
  status: string
  targetTesters: number
  testStartDate: string
  testEndDate: string
  participations: Participation[]
}

export function AppCard({
  id,
  appName,
  iconUrl,
  status,
  targetTesters,
  testStartDate,
  testEndDate,
  participations,
}: AppCardProps) {
  const activeParticipants = participations.filter(
    (p) => p.status === 'ACTIVE'
  ).length

  const daysLeft = calculateDaysLeft(status, testStartDate, testEndDate)

  return (
    <Link
      href={`/developer/apps/${id}`}
      className="bg-bg-secondary border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all block"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
          {iconUrl ? (
            <img
              src={iconUrl}
              alt={appName}
              className="w-full h-full rounded-lg object-cover"
            />
          ) : (
            <span className="text-2xl">📱</span>
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold mb-2">{appName}</h3>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-white/60">
              {activeParticipants}/{targetTesters}
            </span>
            <span className="text-accent-neon">{daysLeft}</span>
          </div>
          <div className="mt-2">
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs ${
                status === 'RECRUITING'
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'bg-green-500/20 text-green-400'
              }`}
            >
              {status === 'RECRUITING' ? '모집 중' : '테스트 중'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

function calculateDaysLeft(
  status: string,
  testStartDate: string,
  testEndDate: string
): string {
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  if (status === 'RECRUITING') {
    const start = new Date(testStartDate)
    start.setHours(0, 0, 0, 0)
    const diffTime = start.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays > 0) {
      return `${diffDays}일 후 시작`
    } else if (diffDays === 0) {
      return '오늘 시작'
    } else {
      return '시작됨'
    }
  }

  // IN_TESTING
  const end = new Date(testEndDate)
  end.setHours(0, 0, 0, 0)
  const diffTime = end.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays > 0) {
    return `D-${diffDays}`
  } else if (diffDays === 0) {
    return 'D-Day'
  } else {
    return '종료'
  }
}
