// @TASK P3-S6 - Developer Dashboard
// @COMPONENT StatCard - 통계 카드 (구독 플랜, 크레딧)

interface StatCardProps {
  title: string
  children: React.ReactNode
}

export function StatCard({ title, children }: StatCardProps) {
  return (
    <div className="bg-bg-secondary border border-white/10 rounded-2xl p-6">
      <h3 className="font-semibold mb-4">{title}</h3>
      {children}
    </div>
  )
}

interface SubscriptionCardProps {
  currentPlan: string
  remainingApps: number
}

export function SubscriptionCard({
  currentPlan,
  remainingApps,
}: SubscriptionCardProps) {
  return (
    <StatCard title="구독 플랜">
      <div className="space-y-3">
        <div>
          <p className="text-sm text-white/60 mb-1">현재 플랜</p>
          <p className="text-lg font-bold text-accent-neon">{currentPlan}</p>
        </div>
        <div>
          <p className="text-sm text-white/60 mb-1">남은 앱 등록 수</p>
          <p className="text-2xl font-bold">{remainingApps}</p>
        </div>
      </div>
    </StatCard>
  )
}

interface CreditsCardProps {
  creditBalance: number
  onRecharge?: () => void
}

export function CreditsCard({ creditBalance, onRecharge }: CreditsCardProps) {
  return (
    <StatCard title="크레딧">
      <div>
        <p className="text-2xl font-bold mb-2">
          {creditBalance.toLocaleString()}
        </p>
        <p className="text-sm text-white/60 mb-4">크레딧</p>
        <button
          onClick={onRecharge}
          className="w-full bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors text-sm"
        >
          충전하기
        </button>
      </div>
    </StatCard>
  )
}
