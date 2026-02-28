// @TASK P3-S6 - Developer Dashboard - Feedback Card Component
// @SPEC specs/screens/developer-dashboard.yaml

import Image from 'next/image'

interface FeedbackCardProps {
  feedback: {
    id: number
    tester: {
      name: string
      avatar: string
    }
    overallRating: number
    comment: string
    createdAt: string
  }
  onFormatRelativeTime: (dateStr: string) => string
}

export function FeedbackCard({ feedback, onFormatRelativeTime }: FeedbackCardProps) {
  const renderStars = (rating: number): string => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating)
  }

  return (
    <div className="bg-bg-secondary border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all">
      <div className="flex items-start gap-4">
        <Image
          src={feedback.tester.avatar}
          alt={feedback.tester.name}
          width={48}
          height={48}
          className="rounded-full"
        />
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-white font-medium">
                {feedback.tester.name}
              </p>
              <p className="text-white/40 text-sm">
                {onFormatRelativeTime(feedback.createdAt)}
              </p>
            </div>
            <div className="text-yellow-400">
              {renderStars(feedback.overallRating)}
            </div>
          </div>
          <p className="text-white/80">{feedback.comment}</p>
        </div>
      </div>
    </div>
  )
}
