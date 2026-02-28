// @TASK P3-S6 - Developer Dashboard - Subscription Card Component
// @SPEC specs/screens/developer-dashboard.yaml

interface SubscriptionCardProps {
  subscription: {
    planType: string
    remainingApps: number
  }
}

export function SubscriptionCard({ subscription }: SubscriptionCardProps) {
  return (
    <div className="bg-bg-secondary border border-white/10 rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4">구독 플랜</h3>
      <div className="mb-4">
        <span className="text-accent-neon text-2xl font-bold">
          {subscription.planType}
        </span>
      </div>
      <div className="text-white/60 text-sm mb-2">남은 등록 가능 앱</div>
      <div className="text-white text-3xl font-bold">
        {subscription.remainingApps}
      </div>
    </div>
  )
}
