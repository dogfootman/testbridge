// TestBridge Prisma Schema
// DBMS: PostgreSQL 16
// 34 테이블, 42 FK, 12 Unique

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ═══════════════════════════════════════
// 1. users - 사용자 (개발자+테스터+관리자)
// ═══════════════════════════════════════
model User {
  id                Int       @id @default(autoincrement())
  email             String                          // AES-256 암호화
  emailHash         String    @unique @map("email_hash") // SHA-256 (검색용)
  name              String?   @db.VarChar(100)
  nickname          String?   @unique @db.VarChar(20)
  bio               String?   @db.VarChar(200)
  profileImageUrl   String?   @map("profile_image_url") @db.VarChar(500)
  role              Role      @default(NONE)
  status            UserStatus @default(ACTIVE)
  currentPlan       Plan      @default(FREE) @map("current_plan")
  pointBalance      Int       @default(0) @map("point_balance")
  creditBalance     Int       @default(0) @map("credit_balance")
  trustScore        Int       @default(50) @map("trust_score")
  trustBadge        TrustBadge @default(BRONZE) @map("trust_badge")
  remainingApps     Int       @default(1) @map("remaining_apps")
  provider          SocialProvider
  providerId        String    @map("provider_id") @db.VarChar(255)
  lastLoginAt       DateTime? @map("last_login_at")
  nicknameChangedAt DateTime? @map("nickname_changed_at")
  suspendedAt       DateTime? @map("suspended_at")
  suspendedReason   String?   @map("suspended_reason") @db.VarChar(500)
  suspendedUntil    DateTime? @map("suspended_until")
  withdrawnAt       DateTime? @map("withdrawn_at")
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")
  deletedAt         DateTime? @map("deleted_at")

  // Relations
  socialAccounts      SocialAccount[]
  agreements          UserAgreement[]
  refreshTokens       RefreshToken[]
  nicknameHistories   NicknameHistory[]
  notificationSetting NotificationSetting?
  apps                App[]              @relation("DeveloperApps")
  applications        Application[]
  participations      Participation[]
  feedbacks           Feedback[]
  payments            Payment[]
  subscriptions       Subscription[]
  paymentMethods      PaymentMethod[]
  bankAccounts        BankAccount[]
  withdrawals         Withdrawal[]       @relation("TesterWithdrawals")
  rewardHistories     RewardHistory[]
  creditHistories     CreditHistory[]
  trustScoreHistories TrustScoreHistory[]
  notifications       Notification[]
  tickets             Ticket[]           @relation("UserTickets")
  reports             Report[]           @relation("ReporterReports")
  warnings            UserWarning[]      @relation("WarnedUser")
  givenWarnings       UserWarning[]      @relation("WarnerAdmin")
  adminLogs           AdminLog[]
  approvedWithdrawals Withdrawal[]       @relation("ApproverWithdrawals")
  assignedTickets     Ticket[]           @relation("AssignedTickets")
  notices             Notice[]
  processedReports    Report[]           @relation("ProcessorReports")

  @@index([provider, providerId])
  @@index([status])
  @@index([role])
  @@index([trustScore(sort: Desc)])
  @@index([createdAt(sort: Desc)])
  @@map("users")
}

// ═══════════════════════════════════════
// 2. apps - 등록된 앱
// ═══════════════════════════════════════
model App {
  id                     Int        @id @default(autoincrement())
  developerId            Int        @map("developer_id")
  appName                String     @map("app_name") @db.VarChar(50)
  packageName            String     @unique @map("package_name") @db.VarChar(150)
  categoryId             Int        @map("category_id")
  description            String     @db.VarChar(500)
  testType               TestType   @map("test_type")
  targetTesters          Int        @map("target_testers")
  testLink               String     @map("test_link") @db.VarChar(500)
  rewardType             RewardType? @map("reward_type")
  rewardAmount           Int?       @map("reward_amount")
  feedbackRequired       Boolean    @default(false) @map("feedback_required")
  testGuide              String?    @map("test_guide")
  status                 AppStatus  @default(PENDING_APPROVAL)
  rejectedReason         String?    @map("rejected_reason") @db.VarChar(500)
  blockedReason          String?    @map("blocked_reason") @db.VarChar(500)
  testStartDate          DateTime?  @map("test_start_date")
  testEndDate            DateTime?  @map("test_end_date")
  approvedAt             DateTime?  @map("approved_at")
  productionConfirmedAt  DateTime?  @map("production_confirmed_at")
  boostActiveUntil       DateTime?  @map("boost_active_until")
  createdAt              DateTime   @default(now()) @map("created_at")
  updatedAt              DateTime   @updatedAt @map("updated_at")
  deletedAt              DateTime?  @map("deleted_at")

  // Relations
  developer        User               @relation("DeveloperApps", fields: [developerId], references: [id])
  category         Category           @relation(fields: [categoryId], references: [id])
  images           AppImage[]
  feedbackItems    AppFeedbackItem[]
  applications     Application[]
  participations   Participation[]
  feedbacks        Feedback[]
  payments         Payment[]
  notifications    Notification[]
  rewardHistories  RewardHistory[]
  creditHistories  CreditHistory[]
  trustScoreHistories TrustScoreHistory[]
  tickets          Ticket[]
  reports          Report[]           @relation("ReportedApps")

  @@index([developerId])
  @@index([status])
  @@index([categoryId])
  @@index([status, createdAt(sort: Desc)])
  @@index([createdAt(sort: Desc)])
  @@map("apps")
}

// ═══════════════════════════════════════
// 3. applications - 테스트 지원
// ═══════════════════════════════════════
model Application {
  id          Int               @id @default(autoincrement())
  appId       Int               @map("app_id")
  testerId    Int               @map("tester_id")
  deviceInfo  String?           @map("device_info") @db.VarChar(100)
  message     String?           @db.VarChar(200)
  status      ApplicationStatus @default(PENDING)
  appliedAt   DateTime          @default(now()) @map("applied_at")
  approvedAt  DateTime?         @map("approved_at")
  createdAt   DateTime          @default(now()) @map("created_at")
  updatedAt   DateTime          @updatedAt @map("updated_at")

  // Relations
  app           App            @relation(fields: [appId], references: [id])
  tester        User           @relation(fields: [testerId], references: [id])
  participation Participation?

  @@unique([appId, testerId])
  @@index([appId, status])
  @@map("applications")
}

// ═══════════════════════════════════════
// 4. participations - 테스트 참여
// ═══════════════════════════════════════
model Participation {
  id              Int                @id @default(autoincrement())
  appId           Int                @map("app_id")
  testerId        Int                @map("tester_id")
  applicationId   Int                @unique @map("application_id")
  status          ParticipationStatus @default(ACTIVE)
  rewardStatus    RewardStatus       @default(NONE) @map("reward_status")
  skipReason      String?            @map("skip_reason") @db.VarChar(100)
  lastAppRunAt    DateTime?          @map("last_app_run_at")
  joinedAt        DateTime           @default(now()) @map("joined_at")
  droppedAt       DateTime?          @map("dropped_at")
  dropReason      String?            @map("drop_reason") @db.VarChar(100)
  completedAt     DateTime?          @map("completed_at")
  createdAt       DateTime           @default(now()) @map("created_at")
  updatedAt       DateTime           @updatedAt @map("updated_at")

  // Relations
  app         App          @relation(fields: [appId], references: [id])
  tester      User         @relation(fields: [testerId], references: [id])
  application Application  @relation(fields: [applicationId], references: [id])
  feedback    Feedback?

  @@unique([appId, testerId])
  @@index([appId, status])
  @@index([testerId, status])
  @@map("participations")
}

// ═══════════════════════════════════════
// 5. feedbacks - 피드백
// ═══════════════════════════════════════
model Feedback {
  id              Int      @id @default(autoincrement())
  appId           Int      @map("app_id")
  testerId        Int      @map("tester_id")
  participationId Int      @unique @map("participation_id")
  overallRating   Int      @map("overall_rating") @db.SmallInt
  comment         String?
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  // Relations
  app           App              @relation(fields: [appId], references: [id])
  tester        User             @relation(fields: [testerId], references: [id])
  participation Participation    @relation(fields: [participationId], references: [id])
  ratings       FeedbackRating[]
  bugReport     BugReport?

  @@unique([appId, testerId])
  @@index([appId, createdAt(sort: Desc)])
  @@map("feedbacks")
}

// ═══════════════════════════════════════
// 6. payments - 결제 이력
// ═══════════════════════════════════════
model Payment {
  id              Int           @id @default(autoincrement())
  userId          Int           @map("user_id")
  appId           Int?          @map("app_id")
  subscriptionId  Int?          @map("subscription_id")
  type            PaymentType
  orderId         String        @unique @map("order_id") @db.VarChar(50)
  amount          Int
  method          String?       @db.VarChar(20)
  status          PaymentStatus @default(PENDING)
  pgPaymentId     String?       @map("pg_payment_id") @db.VarChar(200)
  pgReceiptUrl    String?       @map("pg_receipt_url") @db.VarChar(500)
  refundAmount    Int           @default(0) @map("refund_amount")
  refundReason    String?       @map("refund_reason") @db.VarChar(500)
  refundedAt      DateTime?     @map("refunded_at")
  paidAt          DateTime?     @map("paid_at")
  failedAt        DateTime?     @map("failed_at")
  failReason      String?       @map("fail_reason") @db.VarChar(500)
  createdAt       DateTime      @default(now()) @map("created_at")
  updatedAt       DateTime      @updatedAt @map("updated_at")

  // Relations
  user         User          @relation(fields: [userId], references: [id])
  app          App?          @relation(fields: [appId], references: [id])
  subscription Subscription? @relation(fields: [subscriptionId], references: [id])

  @@index([userId])
  @@index([status])
  @@index([createdAt(sort: Desc)])
  @@map("payments")
}

// ═══════════════════════════════════════
// 7. subscriptions - 구독
// ═══════════════════════════════════════
model Subscription {
  id              Int                @id @default(autoincrement())
  userId          Int                @map("user_id")
  plan            Plan
  price           Int
  pendingPlan     Plan?              @map("pending_plan")
  billingKey      String?            @map("billing_key") @db.VarChar(255)
  status          SubscriptionStatus @default(ACTIVE)
  failCount       Int                @default(0) @map("fail_count") @db.SmallInt
  startDate       DateTime           @map("start_date") @db.Date
  nextBillingDate DateTime           @map("next_billing_date") @db.Date
  cancelledAt     DateTime?          @map("cancelled_at")
  createdAt       DateTime           @default(now()) @map("created_at")
  updatedAt       DateTime           @updatedAt @map("updated_at")

  // Relations
  user     User      @relation(fields: [userId], references: [id])
  payments Payment[]

  @@index([userId])
  @@index([status])
  @@map("subscriptions")
}

// ═══════════════════════════════════════
// 8. withdrawals - 출금
// ═══════════════════════════════════════
model Withdrawal {
  id              Int              @id @default(autoincrement())
  testerId        Int              @map("tester_id")
  bankAccountId   Int?             @map("bank_account_id")
  method          WithdrawalMethod
  amount          Int
  status          WithdrawalStatus @default(REQUESTED)
  flagged         Boolean          @default(false)
  flagReason      String?          @map("flag_reason") @db.VarChar(200)
  holdReason      String?          @map("hold_reason") @db.VarChar(500)
  rejectReason    String?          @map("reject_reason") @db.VarChar(500)
  failReason      String?          @map("fail_reason") @db.VarChar(500)
  approvedBy      Int?             @map("approved_by")
  approvedAt      DateTime?        @map("approved_at")
  completedAt     DateTime?        @map("completed_at")
  requestedAt     DateTime         @default(now()) @map("requested_at")
  createdAt       DateTime         @default(now()) @map("created_at")
  updatedAt       DateTime         @updatedAt @map("updated_at")

  // Relations
  tester      User         @relation("TesterWithdrawals", fields: [testerId], references: [id])
  bankAccount BankAccount? @relation(fields: [bankAccountId], references: [id])
  approver    User?        @relation("ApproverWithdrawals", fields: [approvedBy], references: [id])

  @@index([testerId])
  @@index([status])
  @@map("withdrawals")
}

// ═══════════════════════════════════════
// 9. social_accounts
// ═══════════════════════════════════════
model SocialAccount {
  id         Int            @id @default(autoincrement())
  userId     Int            @map("user_id")
  provider   SocialProvider
  providerId String         @map("provider_id") @db.VarChar(255)
  createdAt  DateTime       @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerId])
  @@index([userId])
  @@map("social_accounts")
}

// ═══════════════════════════════════════
// 10. user_agreements
// ═══════════════════════════════════════
model UserAgreement {
  id               Int      @id @default(autoincrement())
  userId           Int      @map("user_id")
  termsVersion     String   @map("terms_version") @db.VarChar(20)
  privacyVersion   String   @map("privacy_version") @db.VarChar(20)
  marketingAgreed  Boolean  @default(false) @map("marketing_agreed")
  ipAddress        String?  @map("ip_address") @db.VarChar(45)
  userAgent        String?  @map("user_agent")
  agreedAt         DateTime @default(now()) @map("agreed_at")

  user User @relation(fields: [userId], references: [id])

  @@index([userId])
  @@map("user_agreements")
}

// ═══════════════════════════════════════
// 11. refresh_tokens
// ═══════════════════════════════════════
model RefreshToken {
  id         Int      @id @default(autoincrement())
  userId     Int      @map("user_id")
  tokenHash  String   @unique @map("token_hash") @db.VarChar(64)
  deviceInfo String?  @map("device_info") @db.VarChar(200)
  ipAddress  String?  @map("ip_address") @db.VarChar(45)
  expiresAt  DateTime @map("expires_at")
  createdAt  DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("refresh_tokens")
}

// ═══════════════════════════════════════
// 12. nickname_histories
// ═══════════════════════════════════════
model NicknameHistory {
  id               Int      @id @default(autoincrement())
  userId           Int      @map("user_id")
  previousNickname String   @map("previous_nickname") @db.VarChar(20)
  newNickname      String   @map("new_nickname") @db.VarChar(20)
  changedAt        DateTime @default(now()) @map("changed_at")

  user User @relation(fields: [userId], references: [id])

  @@index([userId])
  @@map("nickname_histories")
}

// ═══════════════════════════════════════
// 13. app_images
// ═══════════════════════════════════════
model AppImage {
  id           Int          @id @default(autoincrement())
  appId        Int          @map("app_id")
  type         AppImageType
  url          String       @db.VarChar(500)
  thumbnailUrl String?      @map("thumbnail_url") @db.VarChar(500)
  sortOrder    Int          @default(0) @map("sort_order") @db.SmallInt
  createdAt    DateTime     @default(now()) @map("created_at")

  app App @relation(fields: [appId], references: [id], onDelete: Cascade)

  @@index([appId, type, sortOrder])
  @@map("app_images")
}

// ═══════════════════════════════════════
// 14. app_feedback_items
// ═══════════════════════════════════════
model AppFeedbackItem {
  id       Int              @id @default(autoincrement())
  appId    Int              @map("app_id")
  itemType FeedbackItemType @map("item_type")

  app App @relation(fields: [appId], references: [id], onDelete: Cascade)

  @@unique([appId, itemType])
  @@map("app_feedback_items")
}

// ═══════════════════════════════════════
// 15. categories
// ═══════════════════════════════════════
model Category {
  id        Int      @id @default(autoincrement())
  name      String   @unique @db.VarChar(50)
  icon      String?  @db.VarChar(10)
  sortOrder Int      @default(0) @map("sort_order") @db.SmallInt
  isActive  Boolean  @default(true) @map("is_active")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  apps App[]

  @@map("categories")
}

// ═══════════════════════════════════════
// 16. feedback_ratings
// ═══════════════════════════════════════
model FeedbackRating {
  id         Int              @id @default(autoincrement())
  feedbackId Int              @map("feedback_id")
  itemType   FeedbackItemType @map("item_type")
  score      Int              @db.SmallInt

  feedback Feedback @relation(fields: [feedbackId], references: [id], onDelete: Cascade)

  @@unique([feedbackId, itemType])
  @@map("feedback_ratings")
}

// ═══════════════════════════════════════
// 17. bug_reports
// ═══════════════════════════════════════
model BugReport {
  id          Int      @id @default(autoincrement())
  feedbackId  Int      @unique @map("feedback_id")
  title       String   @db.VarChar(100)
  description String
  deviceInfo  String?  @map("device_info") @db.VarChar(200)
  createdAt   DateTime @default(now()) @map("created_at")

  feedback Feedback         @relation(fields: [feedbackId], references: [id], onDelete: Cascade)
  images   BugReportImage[]

  @@map("bug_reports")
}

// ═══════════════════════════════════════
// 18. bug_report_images
// ═══════════════════════════════════════
model BugReportImage {
  id          Int      @id @default(autoincrement())
  bugReportId Int      @map("bug_report_id")
  url         String   @db.VarChar(500)
  sortOrder   Int      @default(0) @map("sort_order") @db.SmallInt
  createdAt   DateTime @default(now()) @map("created_at")

  bugReport BugReport @relation(fields: [bugReportId], references: [id], onDelete: Cascade)

  @@index([bugReportId])
  @@map("bug_report_images")
}

// ═══════════════════════════════════════
// 19. reward_histories
// ═══════════════════════════════════════
model RewardHistory {
  id          Int              @id @default(autoincrement())
  userId      Int              @map("user_id")
  appId       Int?             @map("app_id")
  type        RewardHistoryType
  amount      Int
  balance     Int
  description String?          @db.VarChar(200)
  createdAt   DateTime         @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id])
  app  App? @relation(fields: [appId], references: [id])

  @@index([userId, createdAt(sort: Desc)])
  @@map("reward_histories")
}

// ═══════════════════════════════════════
// 20. credit_histories
// ═══════════════════════════════════════
model CreditHistory {
  id          Int               @id @default(autoincrement())
  userId      Int               @map("user_id")
  appId       Int?              @map("app_id")
  type        CreditHistoryType
  amount      Int
  balance     Int
  description String?           @db.VarChar(200)
  createdAt   DateTime          @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id])
  app  App? @relation(fields: [appId], references: [id])

  @@index([userId, createdAt(sort: Desc)])
  @@map("credit_histories")
}

// ═══════════════════════════════════════
// 21. trust_score_histories
// ═══════════════════════════════════════
model TrustScoreHistory {
  id         Int             @id @default(autoincrement())
  userId     Int             @map("user_id")
  appId      Int?            @map("app_id")
  event      TrustScoreEvent
  delta      Int
  scoreAfter Int             @map("score_after")
  createdAt  DateTime        @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id])
  app  App? @relation(fields: [appId], references: [id])

  @@index([userId, createdAt(sort: Desc)])
  @@map("trust_score_histories")
}

// ═══════════════════════════════════════
// 22. payment_methods
// ═══════════════════════════════════════
model PaymentMethod {
  id         Int      @id @default(autoincrement())
  userId     Int      @map("user_id")
  type       String   @db.VarChar(20)
  billingKey String   @map("billing_key") @db.VarChar(255)
  label      String?  @db.VarChar(50)
  last4      String?  @db.VarChar(4)
  isDefault  Boolean  @default(false) @map("is_default")
  createdAt  DateTime @default(now()) @map("created_at")
  updatedAt  DateTime @updatedAt @map("updated_at")
  deletedAt  DateTime? @map("deleted_at")

  user User @relation(fields: [userId], references: [id])

  @@index([userId])
  @@map("payment_methods")
}

// ═══════════════════════════════════════
// 23. bank_accounts
// ═══════════════════════════════════════
model BankAccount {
  id             Int      @id @default(autoincrement())
  userId         Int      @map("user_id")
  method         WithdrawalMethod
  bankCode       String?  @map("bank_code") @db.VarChar(10)
  bankName       String?  @map("bank_name") @db.VarChar(50)
  accountNumber  String?  @map("account_number") @db.VarChar(255)  // AES-256
  accountHolder  String?  @map("account_holder") @db.VarChar(255)  // AES-256
  paypalEmail    String?  @map("paypal_email") @db.VarChar(255)    // AES-256
  isVerified     Boolean  @default(false) @map("is_verified")
  isDefault      Boolean  @default(false) @map("is_default")
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")
  deletedAt      DateTime? @map("deleted_at")

  user        User         @relation(fields: [userId], references: [id])
  withdrawals Withdrawal[]

  @@index([userId])
  @@map("bank_accounts")
}

// ═══════════════════════════════════════
// 24. notifications
// ═══════════════════════════════════════
model Notification {
  id           Int              @id @default(autoincrement())
  userId       Int              @map("user_id")
  type         NotificationType
  title        String           @db.VarChar(100)
  message      String           @db.VarChar(500)
  linkUrl      String?          @map("link_url") @db.VarChar(500)
  isRead       Boolean          @default(false) @map("is_read")
  relatedAppId Int?             @map("related_app_id")
  createdAt    DateTime         @default(now()) @map("created_at")

  user       User @relation(fields: [userId], references: [id])
  relatedApp App? @relation(fields: [relatedAppId], references: [id])

  @@index([userId, createdAt(sort: Desc)])
  @@index([userId, isRead])
  @@map("notifications")
}

// ═══════════════════════════════════════
// 25. notification_settings
// ═══════════════════════════════════════
model NotificationSetting {
  id            Int      @id @default(autoincrement())
  userId        Int      @unique @map("user_id")
  pushEnabled   Boolean  @default(true) @map("push_enabled")
  emailEnabled  Boolean  @default(true) @map("email_enabled")
  smsEnabled    Boolean  @default(false) @map("sms_enabled")
  phoneNumber   String?  @map("phone_number") @db.VarChar(255)  // AES-256
  phoneVerified Boolean  @default(false) @map("phone_verified")
  fcmToken      String?  @map("fcm_token") @db.VarChar(500)
  updatedAt     DateTime @updatedAt @map("updated_at")

  user User @relation(fields: [userId], references: [id])

  @@map("notification_settings")
}

// ═══════════════════════════════════════
// 26. tickets - 고객 문의
// ═══════════════════════════════════════
model Ticket {
  id           Int          @id @default(autoincrement())
  ticketNumber String       @unique @map("ticket_number") @db.VarChar(10)
  userId       Int          @map("user_id")
  inquiryType  InquiryType  @map("inquiry_type")
  title        String       @db.VarChar(100)
  relatedAppId Int?         @map("related_app_id")
  priority     TicketPriority @default(NORMAL)
  status       TicketStatus @default(SUBMITTED)
  assignedTo   Int?         @map("assigned_to")
  closedAt     DateTime?    @map("closed_at")
  createdAt    DateTime     @default(now()) @map("created_at")
  updatedAt    DateTime     @updatedAt @map("updated_at")

  user        User             @relation("UserTickets", fields: [userId], references: [id])
  relatedApp  App?             @relation(fields: [relatedAppId], references: [id])
  assignee    User?            @relation("AssignedTickets", fields: [assignedTo], references: [id])
  messages    TicketMessage[]
  attachments TicketAttachment[]

  @@index([userId, createdAt(sort: Desc)])
  @@index([status, priority(sort: Desc), createdAt])
  @@map("tickets")
}

// ═══════════════════════════════════════
// 27. ticket_messages
// ═══════════════════════════════════════
model TicketMessage {
  id         Int        @id @default(autoincrement())
  ticketId   Int        @map("ticket_id")
  senderId   Int        @map("sender_id")
  senderRole SenderRole @map("sender_role")
  content    String
  createdAt  DateTime   @default(now()) @map("created_at")

  ticket Ticket @relation(fields: [ticketId], references: [id], onDelete: Cascade)

  @@index([ticketId, createdAt])
  @@map("ticket_messages")
}

// ═══════════════════════════════════════
// 28. ticket_attachments
// ═══════════════════════════════════════
model TicketAttachment {
  id        Int      @id @default(autoincrement())
  ticketId  Int      @map("ticket_id")
  messageId Int?     @map("message_id")
  fileName  String   @map("file_name") @db.VarChar(255)
  fileUrl   String   @map("file_url") @db.VarChar(500)
  fileSize  Int      @map("file_size")
  mimeType  String   @map("mime_type") @db.VarChar(50)
  createdAt DateTime @default(now()) @map("created_at")

  ticket Ticket @relation(fields: [ticketId], references: [id], onDelete: Cascade)

  @@index([ticketId])
  @@map("ticket_attachments")
}

// ═══════════════════════════════════════
// 29. reports - 신고
// ═══════════════════════════════════════
model Report {
  id             Int          @id @default(autoincrement())
  reporterId     Int          @map("reporter_id")
  targetType     ReportTarget @map("target_type")
  targetUserId   Int?         @map("target_user_id")
  targetAppId    Int?         @map("target_app_id")
  reason         String       @db.VarChar(30)
  detail         String?      @db.VarChar(500)
  status         ReportStatus @default(SUBMITTED)
  processedBy    Int?         @map("processed_by")
  processedAt    DateTime?    @map("processed_at")
  processReason  String?      @map("process_reason") @db.VarChar(500)
  createdAt      DateTime     @default(now()) @map("created_at")
  updatedAt      DateTime     @updatedAt @map("updated_at")

  reporter  User  @relation("ReporterReports", fields: [reporterId], references: [id])
  targetApp App?  @relation("ReportedApps", fields: [targetAppId], references: [id])
  processor User? @relation("ProcessorReports", fields: [processedBy], references: [id])

  @@index([reporterId])
  @@index([status, createdAt])
  @@map("reports")
}

// ═══════════════════════════════════════
// 30. faqs
// ═══════════════════════════════════════
model Faq {
  id        Int        @id @default(autoincrement())
  category  FaqCategory
  question  String
  answer    String
  sortOrder Int        @default(0) @map("sort_order") @db.SmallInt
  isActive  Boolean    @default(true) @map("is_active")
  createdAt DateTime   @default(now()) @map("created_at")
  updatedAt DateTime   @updatedAt @map("updated_at")

  @@index([category, sortOrder])
  @@map("faqs")
}

// ═══════════════════════════════════════
// 31. notices - 공지사항
// ═══════════════════════════════════════
model Notice {
  id          Int        @id @default(autoincrement())
  tag         NoticeTag
  title       String     @db.VarChar(200)
  content     String
  isPinned    Boolean    @default(false) @map("is_pinned")
  authorId    Int        @map("author_id")
  publishedAt DateTime?  @map("published_at")
  createdAt   DateTime   @default(now()) @map("created_at")
  updatedAt   DateTime   @updatedAt @map("updated_at")
  deletedAt   DateTime?  @map("deleted_at")

  author User @relation(fields: [authorId], references: [id])

  @@index([isPinned(sort: Desc), publishedAt(sort: Desc)])
  @@map("notices")
}

// ═══════════════════════════════════════
// 32. admin_logs
// ═══════════════════════════════════════
model AdminLog {
  id         Int      @id @default(autoincrement())
  adminId    Int      @map("admin_id")
  action     String   @db.VarChar(50)
  targetType String?  @map("target_type") @db.VarChar(20)
  targetId   Int?     @map("target_id")
  detail     Json?
  ipAddress  String?  @map("ip_address") @db.VarChar(45)
  createdAt  DateTime @default(now()) @map("created_at")

  admin User @relation(fields: [adminId], references: [id])

  @@index([adminId, createdAt(sort: Desc)])
  @@index([targetType, targetId])
  @@map("admin_logs")
}

// ═══════════════════════════════════════
// 33. user_warnings
// ═══════════════════════════════════════
model UserWarning {
  id        Int      @id @default(autoincrement())
  userId    Int      @map("user_id")
  warnedBy  Int      @map("warned_by")
  reason    String   @db.VarChar(500)
  reportId  Int?     @map("report_id")
  createdAt DateTime @default(now()) @map("created_at")

  user   User @relation("WarnedUser", fields: [userId], references: [id])
  warner User @relation("WarnerAdmin", fields: [warnedBy], references: [id])

  @@index([userId, createdAt(sort: Desc)])
  @@map("user_warnings")
}

// ═══════════════════════════════════════
// 34. email_logs
// ═══════════════════════════════════════
model EmailLog {
  id         Int          @id @default(autoincrement())
  userId     Int?         @map("user_id")
  toEmail    String       @map("to_email") @db.VarChar(255)
  type       EmailType
  subject    String       @db.VarChar(200)
  status     EmailStatus  @default(PENDING)
  retryCount Int          @default(0) @map("retry_count") @db.SmallInt
  sentAt     DateTime?    @map("sent_at")
  failedAt   DateTime?    @map("failed_at")
  failReason String?      @map("fail_reason") @db.VarChar(200)
  createdAt  DateTime     @default(now()) @map("created_at")

  @@index([status])
  @@map("email_logs")
}

// ═══════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════

enum Role {
  NONE
  DEVELOPER
  TESTER
  BOTH
  ADMIN
}

enum UserStatus {
  ACTIVE
  SUSPENDED
  WITHDRAWN
}

enum Plan {
  FREE
  BASIC
  PRO
  ENTERPRISE
}

enum TrustBadge {
  BRONZE
  SILVER
  GOLD
  DIAMOND
}

enum SocialProvider {
  GOOGLE
  KAKAO
  NAVER
}

enum TestType {
  PAID_REWARD
  CREDIT_EXCHANGE
}

enum RewardType {
  BASIC
  WITH_FEEDBACK
  ADVANCED
}

enum AppStatus {
  PENDING_APPROVAL
  RECRUITING
  IN_TESTING
  COMPLETED
  PRODUCTION
  REJECTED
  CANCELLED
  BLOCKED
}

enum ApplicationStatus {
  PENDING
  APPROVED
  REJECTED
  WAITLISTED
}

enum ParticipationStatus {
  ACTIVE
  DROPPED
  COMPLETED
}

enum RewardStatus {
  NONE
  PAID
  PENDING_FEEDBACK
  SKIPPED
}

enum PaymentType {
  ONE_TIME_20
  ONE_TIME_30
  SUBSCRIPTION
  BOOST
  REFUND
}

enum PaymentStatus {
  PENDING
  SUCCESS
  FAILED
  REFUNDED
  PARTIALLY_REFUNDED
}

enum SubscriptionStatus {
  ACTIVE
  CANCELLING
  CANCELLED
  PAST_DUE
}

enum WithdrawalMethod {
  BANK_TRANSFER
  PAYPAL
}

enum WithdrawalStatus {
  REQUESTED
  PROCESSING
  ON_HOLD
  COMPLETED
  FAILED
  REJECTED
}

enum AppImageType {
  ICON
  SCREENSHOT
}

enum FeedbackItemType {
  UI_UX
  PERFORMANCE
  FUNCTIONALITY
  STABILITY
}

enum RewardHistoryType {
  EARNED
  WITHDRAWN
  WITHDRAWAL_REFUND
  EXCHANGED
}

enum CreditHistoryType {
  EARNED_TEST
  EARNED_FEEDBACK
  USED_REGISTER
}

enum TrustScoreEvent {
  TEST_COMPLETED
  DROPOUT
  FEEDBACK_QUALITY
  PERIOD_BONUS
}

enum NotificationType {
  SELECTED
  TEST_STARTED
  DROPOUT
  COMPLETED
  REWARD
  FEEDBACK_RECEIVED
  WITHDRAWAL_DONE
  NEW_APPLICATION
  SYSTEM
  WARNING
  INACTIVE_WARNING
}

enum InquiryType {
  BUG
  PAYMENT
  ACCOUNT
  TEST
  REWARD
  REPORT
  FEATURE
  OTHER
}

enum TicketPriority {
  URGENT
  HIGH
  NORMAL
  LOW
}

enum TicketStatus {
  SUBMITTED
  IN_PROGRESS
  ANSWERED
  REOPENED
  CLOSED
}

enum SenderRole {
  USER
  ADMIN
}

enum ReportTarget {
  USER
  APP
}

enum ReportStatus {
  SUBMITTED
  IN_REVIEW
  WARNING
  SUSPENDED
  BLOCKED
  DISMISSED
}

enum FaqCategory {
  TEST
  REWARD
  PAYMENT
  ACCOUNT
}

enum NoticeTag {
  IMPORTANT
  NOTICE
  UPDATE
  EVENT
}

enum EmailType {
  TESTER_SELECTED
  TEST_STARTED
  DROPOUT
  COMPLETED
  REWARD
  FEEDBACK
  WITHDRAWAL
  TICKET_REPLY
  WARNING
  SYSTEM
}

enum EmailStatus {
  PENDING
  SENT
  FAILED
}
