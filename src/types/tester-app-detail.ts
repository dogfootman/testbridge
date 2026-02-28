// @TASK T-02 - Tester App Detail Types
// @SPEC specs/screens/app-detail-tester.yaml

export interface TesterAppDetail {
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
    icon?: string | null
  }
  developer: {
    id: number
    nickname: string
    profileImageUrl: string | null
  }
}

export interface AppImage {
  id: number
  appId: number
  url: string
  type: string
  sortOrder: number
}

export interface Participation {
  id: number
  appId: number
  testerId: number
  status: string
  joinedAt: string
  lastAppRunAt?: string | null
}

export interface TesterApplication {
  id: number
  appId: number
  testerId: number
  status: string
  deviceInfo: string | null
  message: string | null
  appliedAt: string
  approvedAt?: string | null
}

export interface ApplicationFormData {
  deviceInfo: string
  message: string
}

export interface ApplicationFormErrors {
  deviceInfo?: string
  message?: string
}
