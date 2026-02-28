// @TASK P3-S6 - Developer Dashboard
// @COMPONENT FeedbackList - 최근 피드백 목록

interface Feedback {
  id: number
  appId: number
  tester: {
    nickname: string
  }
  overallRating: number
  comment: string
  createdAt: string
}

interface FeedbackListProps {
  feedbacks: Feedback[]
}

export function FeedbackList({ feedbacks }: FeedbackListProps) {
  if (feedbacks.length === 0) {
    return (
      <div className="bg-bg-secondary border border-white/10 rounded-2xl p-8 text-center">
        <p className="text-white/60">아직 피드백이 없습니다</p>
      </div>
    )
  }

  return (
    <div className="bg-bg-secondary border border-white/10 rounded-2xl divide-y divide-white/10">
      {feedbacks.map((feedback) => (
        <div key={feedback.id} className="p-6">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="font-semibold">{feedback.tester.nickname}</p>
              <div className="flex items-center gap-1 mt-1">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={
                      i < feedback.overallRating
                        ? 'text-yellow-400'
                        : 'text-white/20'
                    }
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
            <span className="text-sm text-white/40">
              {new Date(feedback.createdAt).toLocaleDateString()}
            </span>
          </div>
          <p className="text-white/70">{feedback.comment}</p>
        </div>
      ))}
    </div>
  )
}
