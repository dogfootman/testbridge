// @TASK P3-S9 - App Detail Types
// @SPEC specs/screens/app-detail.yaml

export interface AppDetail {
  id: number
  appName: string
  packageName: string
  description: string
  status: string
  testType: string
  targetTesters: number
  testStartDate: string | null
  testEndDate: string | null
  testLink: string
  rewardType: string | null
  rewardAmount: number | null
  feedbackRequired: boolean
  testGuide: string | null
  category: {
    id: number
    name: string
    slug: string
  }
  developer: {
    id: number
    nickname: string
    profileImageUrl: string | null
  }
}

export interface ApplicationWithTester {
  id: number
  appId: number
  testerId: number
  status: string
  deviceInfo: string | null
  message: string | null
  appliedAt: string
  approvedAt: string | null
  tester: {
    id: number
    nickname: string
    email: string
  }
}

export interface ParticipationWithTester {
  id: number
  appId: number
  testerId: number
  status: string
  joinedAt: string
  lastAppRunAt: string | null
  dropReason: string | null
  tester: {
    id: number
    nickname: string
  }
}

export interface FeedbackWithTester {
  id: number
  appId: number
  testerId: number
  overallRating: number
  comment: string | null
  createdAt: string
  ratings: Record<string, number> | null
  bugReport: string | null
  tester: {
    id: number
    nickname: string
  }
}

export type TabType = 'overview' | 'applicants' | 'participants' | 'feedback' | 'guide'
