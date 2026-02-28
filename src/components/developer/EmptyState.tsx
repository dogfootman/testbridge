// @TASK P3-S6 - Developer Dashboard
// @COMPONENT EmptyState - 빈 상태 표시 컴포넌트

import Link from 'next/link'

interface EmptyStateProps {
  title: string
  message: string
  ctaText?: string
  ctaHref?: string
}

export function EmptyState({
  title,
  message,
  ctaText,
  ctaHref,
}: EmptyStateProps) {
  return (
    <div className="bg-bg-secondary border border-white/10 rounded-2xl p-12 text-center">
      <p className="text-white/60 mb-4">{title}</p>
      <p className="text-white/40 mb-6">{message}</p>
      {ctaText && ctaHref && (
        <Link
          href={ctaHref}
          className="inline-block bg-accent-neon text-black px-6 py-3 rounded-full font-semibold hover:bg-accent-neon/90 transition-colors"
        >
          {ctaText}
        </Link>
      )}
    </div>
  )
}
