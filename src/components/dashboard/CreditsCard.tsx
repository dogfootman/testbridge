// @TASK P3-S6 - Developer Dashboard - Credits Card Component
// @SPEC specs/screens/developer-dashboard.yaml

interface CreditsCardProps {
  credits: number
  onClick?: () => void
}

export function CreditsCard({ credits, onClick }: CreditsCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-bg-secondary border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all text-left"
    >
      <h3 className="text-lg font-semibold text-white mb-4">
        크레딧 잔액
      </h3>
      <div className="text-accent-neon text-3xl font-bold">
        {credits.toLocaleString()}
      </div>
      <p className="text-white/40 text-sm mt-2">클릭하여 충전하기</p>
    </button>
  )
}
