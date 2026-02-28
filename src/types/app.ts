// @TASK P3-S7 - App Register Types
// @SPEC specs/screens/app-register.yaml

export type TestType = 'PAID_REWARD' | 'CREDIT_EXCHANGE'

export type RewardType = 'BASIC' | 'WITH_FEEDBACK' | 'ADVANCED'

export type AppStatus =
  | 'PENDING_APPROVAL'
  | 'RECRUITING'
  | 'IN_TESTING'
  | 'COMPLETED'
  | 'PRODUCTION'

export interface Category {
  id: number
  name: string
  slug: string
}

export interface AppFormData {
  // Step 1: 기본정보
  appName: string
  packageName: string
  categoryId: number | null
  description: string

  // Step 2: 테스트설정
  testType: TestType | null
  targetTesters: number
  testLink: string

  // Step 3: 리워드설정 (PAID_REWARD only)
  rewardType: RewardType | null
  rewardAmount: number

  // Step 4: 피드백설정
  feedbackRequired: boolean
  testGuide: string
}

export interface AppFormErrors {
  appName?: string
  packageName?: string
  categoryId?: string
  description?: string
  testType?: string
  targetTesters?: string
  testLink?: string
  rewardType?: string
  rewardAmount?: string
  testGuide?: string
}
