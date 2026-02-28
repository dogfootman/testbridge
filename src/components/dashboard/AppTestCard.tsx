// @TASK P3-S6 - Developer Dashboard - App Test Card Component
// @SPEC specs/screens/developer-dashboard.yaml

import Image from 'next/image'
import Link from 'next/link'

interface AppTestCardProps {
  app: {
    id: number
    appName: string
    iconUrl: string
    status: 'RECRUITING' | 'IN_TESTING'
    targetTesters: number
    testEndDate: string
  }
  activeParticipants: number
  onCalculateDDay: (endDate: string) => string
}

export function AppTestCard({ app, activeParticipants, onCalculateDDay }: AppTestCardProps) {
  const progressPercentage = Math.round((activeParticipants / app.targetTesters) * 100)

  return (
    <Link href={`/developer/apps/${app.id}`}>
      <div className="bg-bg-secondary border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all cursor-pointer">
        <div className="flex items-start gap-4">
          <Image
            src={app.iconUrl}
            alt={app.appName}
            width={64}
            height={64}
            className="rounded-xl"
          />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-1">
              {app.appName}
            </h3>
            <div className="flex items-center gap-2 mb-3">
              {app.status === 'IN_TESTING' ? (
                <span className="text-accent-neon text-sm font-medium">
                  {onCalculateDDay(app.testEndDate)}
                </span>
              ) : (
                <span className="text-blue-400 text-sm font-medium">
                  모집중
                </span>
              )}
            </div>

            {/* Participant Progress */}
            <div className="mb-2">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-white/60">참여자</span>
                <span className="text-white">
                  {activeParticipants}/{app.targetTesters}
                </span>
              </div>
              <div className="bg-white/10 rounded-full h-2 overflow-hidden">
                <div
                  role="progressbar"
                  aria-valuenow={progressPercentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  className="bg-accent-neon h-full rounded-full transition-all"
                  style={{
                    width: `${progressPercentage}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
