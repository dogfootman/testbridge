// @TASK T-03 - 내 테스트 현황 Types
// @SPEC specs/screens/tester-participations.yaml

export type ParticipationStatus = 'ACTIVE' | 'COMPLETED' | 'DROPPED'
export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type RewardStatus = 'PENDING' | 'PAID' | 'FAILED'

export interface Participation {
  id: number
  testerId: number
  appId: number
  status: ParticipationStatus
  joinedAt: string
  lastAppRunAt: string | null
  dropReason: string | null
  createdAt: string
  updatedAt: string
  app: {
    id: number
    appName: string
    iconUrl: string | null
    testStartDate: string
    testEndDate: string
    rewardAmount: number | null
    rewardType: string | null
    testLink: string
  }
}

export interface Application {
  id: number
  testerId: number
  appId: number
  status: ApplicationStatus
  appliedAt: string
  rejectedReason: string | null
  createdAt: string
  updatedAt: string
  app: {
    id: number
    appName: string
    iconUrl: string | null
    testStartDate: string
    testEndDate: string
    rewardAmount: number | null
    rewardType: string | null
  }
}

export interface Feedback {
  id: number
  participationId: number
  testerId: number
  overallRating: number
  comment: string
  createdAt: string
}

export interface Reward {
  id: number
  participationId: number
  testerId: number
  amount: number
  status: RewardStatus
  createdAt: string
  paidAt: string | null
}

export interface ParticipationsResponse {
  participations: Participation[]
}

export interface ApplicationsResponse {
  applications: Application[]
}

// @TASK T-04 - 피드백 작성 Types
export type RatingItemType = 'UI_UX' | 'PERFORMANCE' | 'FUNCTIONALITY' | 'STABILITY'

export interface FeedbackRating {
  itemType: RatingItemType
  score: number
}

export interface BugReport {
  id: number
  participationId: number
  testerId: number
  title: string
  description: string
  createdAt: string
}
