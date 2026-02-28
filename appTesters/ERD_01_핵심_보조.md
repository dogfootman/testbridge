# TestBridge 데이터베이스 설계 (ERD) — Part 1: 핵심 + 보조 엔티티

**DBMS**: PostgreSQL 16  
**ORM**: Prisma  
**버전**: v1.0  
**작성일**: 2026-02-28

---

## 설계 원칙

1. **PK**: 모든 테이블 id (BIGSERIAL)
2. **시간**: createdAt, updatedAt 필수. 삭제는 deletedAt 소프트삭제
3. **Enum**: PostgreSQL ENUM 타입 또는 VARCHAR + CHECK
4. **인덱스**: FK, 자주 검색하는 컬럼, 유니크 제약
5. **암호화**: 이메일, 전화번호, 계좌번호는 AES-256 (애플리케이션 레벨)
6. **네이밍**: snake_case, 단수형

---

# A. 핵심 엔티티 (8개)

---

## 1. users

사용자 (개발자, 테스터, 관리자 통합)

```sql
CREATE TABLE users (
  id              BIGSERIAL PRIMARY KEY,
  email           VARCHAR(255) NOT NULL,          -- AES-256 암호화
  email_hash      VARCHAR(64) NOT NULL UNIQUE,    -- SHA-256 해시 (검색용)
  name            VARCHAR(100),                    -- Google 프로필 이름
  nickname        VARCHAR(20) UNIQUE,
  bio             VARCHAR(200),
  profile_image_url VARCHAR(500),
  role            VARCHAR(20) NOT NULL DEFAULT 'NONE',  -- DEVELOPER, TESTER, BOTH, ADMIN, NONE
  status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, SUSPENDED, WITHDRAWN
  current_plan    VARCHAR(20) NOT NULL DEFAULT 'FREE',   -- FREE, BASIC, PRO, ENTERPRISE
  point_balance   INTEGER NOT NULL DEFAULT 0,     -- 포인트 잔액 (1P=1원)
  credit_balance  INTEGER NOT NULL DEFAULT 0,     -- 크레딧 잔액
  trust_score     INTEGER NOT NULL DEFAULT 50,    -- 신뢰도 0~100
  trust_badge     VARCHAR(20) NOT NULL DEFAULT 'BRONZE', -- BRONZE, SILVER, GOLD, DIAMOND
  remaining_apps  INTEGER NOT NULL DEFAULT 1,     -- 이번 달 남은 앱 등록 수
  provider        VARCHAR(20) NOT NULL,           -- GOOGLE, KAKAO, NAVER
  provider_id     VARCHAR(255) NOT NULL,          -- OAuth Provider 고유 ID
  last_login_at   TIMESTAMPTZ,
  nickname_changed_at TIMESTAMPTZ,                -- 닉네임 최근 변경일
  suspended_at    TIMESTAMPTZ,
  suspended_reason VARCHAR(500),
  suspended_until TIMESTAMPTZ,                    -- 일시 정지 해제일 (NULL=영구)
  withdrawn_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ                     -- 소프트삭제
);

-- 인덱스
CREATE UNIQUE INDEX idx_users_email_hash ON users(email_hash) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX idx_users_nickname ON users(nickname) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_provider ON users(provider, provider_id);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_trust_score ON users(trust_score DESC);
CREATE INDEX idx_users_created_at ON users(created_at DESC);
```

---

## 2. apps

등록된 앱

```sql
CREATE TABLE apps (
  id                BIGSERIAL PRIMARY KEY,
  developer_id      BIGINT NOT NULL REFERENCES users(id),
  app_name          VARCHAR(50) NOT NULL,
  package_name      VARCHAR(150) NOT NULL UNIQUE,
  category_id       BIGINT NOT NULL REFERENCES categories(id),
  description       VARCHAR(500) NOT NULL,
  test_type         VARCHAR(20) NOT NULL,          -- PAID_REWARD, CREDIT_EXCHANGE
  target_testers    INTEGER NOT NULL,              -- 20~40
  test_link         VARCHAR(500) NOT NULL,         -- Google Play 테스트 링크
  reward_type       VARCHAR(20),                   -- BASIC, WITH_FEEDBACK, ADVANCED (PAID만)
  reward_amount     INTEGER,                       -- 1인당 리워드 (원)
  feedback_required BOOLEAN NOT NULL DEFAULT false,
  test_guide        TEXT,                          -- 최대 2,000자
  status            VARCHAR(20) NOT NULL DEFAULT 'PENDING_APPROVAL',
  -- PENDING_APPROVAL, RECRUITING, IN_TESTING, COMPLETED, PRODUCTION, REJECTED, CANCELLED, BLOCKED
  rejected_reason   VARCHAR(500),
  blocked_reason    VARCHAR(500),
  test_start_date   TIMESTAMPTZ,                  -- 전원 승인 시 설정
  test_end_date     TIMESTAMPTZ,                  -- start + 14일
  approved_at       TIMESTAMPTZ,
  production_confirmed_at TIMESTAMPTZ,
  boost_active_until TIMESTAMPTZ,                 -- 긴급 부스트 만료 시간
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ
);

-- 인덱스
CREATE UNIQUE INDEX idx_apps_package_name ON apps(package_name);
CREATE INDEX idx_apps_developer_id ON apps(developer_id);
CREATE INDEX idx_apps_status ON apps(status);
CREATE INDEX idx_apps_category_id ON apps(category_id);
CREATE INDEX idx_apps_created_at ON apps(created_at DESC);
CREATE INDEX idx_apps_status_created ON apps(status, created_at DESC);
CREATE INDEX idx_apps_test_end_date ON apps(test_end_date) WHERE status = 'IN_TESTING';
CREATE INDEX idx_apps_boost ON apps(boost_active_until) WHERE boost_active_until IS NOT NULL;
```

---

## 3. applications

테스터 → 앱 지원

```sql
CREATE TABLE applications (
  id            BIGSERIAL PRIMARY KEY,
  app_id        BIGINT NOT NULL REFERENCES apps(id),
  tester_id     BIGINT NOT NULL REFERENCES users(id),
  device_info   VARCHAR(100),
  message       VARCHAR(200),
  status        VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  -- PENDING, APPROVED, REJECTED, WAITLISTED
  applied_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_application_app_tester UNIQUE(app_id, tester_id)
);

-- 인덱스
CREATE INDEX idx_applications_app_id ON applications(app_id);
CREATE INDEX idx_applications_tester_id ON applications(tester_id);
CREATE INDEX idx_applications_status ON applications(app_id, status);
CREATE INDEX idx_applications_waitlist ON applications(app_id, status, applied_at)
  WHERE status = 'WAITLISTED';
```

---

## 4. participations

실제 테스트 참여 (승인 후 생성, 실행 추적)

```sql
CREATE TABLE participations (
  id              BIGSERIAL PRIMARY KEY,
  app_id          BIGINT NOT NULL REFERENCES apps(id),
  tester_id       BIGINT NOT NULL REFERENCES users(id),
  application_id  BIGINT NOT NULL REFERENCES applications(id),
  status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  -- ACTIVE, DROPPED, COMPLETED
  reward_status   VARCHAR(20) NOT NULL DEFAULT 'NONE',
  -- NONE, PAID, PENDING_FEEDBACK, SKIPPED
  skip_reason     VARCHAR(100),                   -- 미지급 사유
  last_app_run_at TIMESTAMPTZ,                    -- 최근 앱 실행
  joined_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  dropped_at      TIMESTAMPTZ,
  drop_reason     VARCHAR(100),                   -- APP_UNINSTALL, OPT_OUT
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_participation_app_tester UNIQUE(app_id, tester_id)
);

-- 인덱스
CREATE INDEX idx_participations_app_id ON participations(app_id);
CREATE INDEX idx_participations_tester_id ON participations(tester_id);
CREATE INDEX idx_participations_status ON participations(app_id, status);
CREATE INDEX idx_participations_active ON participations(tester_id, status)
  WHERE status = 'ACTIVE';
CREATE INDEX idx_participations_inactive_check ON participations(last_app_run_at)
  WHERE status = 'ACTIVE';
```

---

## 5. feedbacks

테스터 피드백

```sql
CREATE TABLE feedbacks (
  id              BIGSERIAL PRIMARY KEY,
  app_id          BIGINT NOT NULL REFERENCES apps(id),
  tester_id       BIGINT NOT NULL REFERENCES users(id),
  participation_id BIGINT NOT NULL REFERENCES participations(id),
  overall_rating  SMALLINT NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
  comment         TEXT,                           -- 텍스트 피드백
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_feedback_app_tester UNIQUE(app_id, tester_id)
);

-- 인덱스
CREATE INDEX idx_feedbacks_app_id ON feedbacks(app_id);
CREATE INDEX idx_feedbacks_tester_id ON feedbacks(tester_id);
CREATE INDEX idx_feedbacks_created_at ON feedbacks(app_id, created_at DESC);
CREATE INDEX idx_feedbacks_rating ON feedbacks(app_id, overall_rating);
```

---

## 6. payments

모든 결제 이력 (건별 + 구독 + 부스트 통합)

```sql
CREATE TABLE payments (
  id                BIGSERIAL PRIMARY KEY,
  user_id           BIGINT NOT NULL REFERENCES users(id),
  app_id            BIGINT REFERENCES apps(id),           -- 건별 결제 시
  subscription_id   BIGINT REFERENCES subscriptions(id),  -- 구독 결제 시
  type              VARCHAR(20) NOT NULL,
  -- ONE_TIME_20, ONE_TIME_30, SUBSCRIPTION, BOOST, REFUND
  order_id          VARCHAR(50) NOT NULL UNIQUE,          -- TB-YYYYMMDD-XXXX
  amount            INTEGER NOT NULL,                     -- 결제 금액 (원)
  method            VARCHAR(20),                          -- CARD, TOSS_PAY, KAKAO_PAY
  status            VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  -- PENDING, SUCCESS, FAILED, REFUNDED, PARTIALLY_REFUNDED
  pg_payment_id     VARCHAR(200),                         -- 토스페이먼츠 paymentKey
  pg_receipt_url    VARCHAR(500),                         -- 영수증 URL
  refund_amount     INTEGER DEFAULT 0,
  refund_reason     VARCHAR(500),
  refunded_at       TIMESTAMPTZ,
  paid_at           TIMESTAMPTZ,
  failed_at         TIMESTAMPTZ,
  fail_reason       VARCHAR(500),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스
CREATE UNIQUE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_app_id ON payments(app_id) WHERE app_id IS NOT NULL;
CREATE INDEX idx_payments_subscription_id ON payments(subscription_id) WHERE subscription_id IS NOT NULL;
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_type ON payments(type);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);
```

---

## 7. subscriptions

구독 플랜

```sql
CREATE TABLE subscriptions (
  id                BIGSERIAL PRIMARY KEY,
  user_id           BIGINT NOT NULL REFERENCES users(id),
  plan              VARCHAR(20) NOT NULL,          -- FREE, BASIC, PRO, ENTERPRISE
  price             INTEGER NOT NULL,              -- 월 금액
  pending_plan      VARCHAR(20),                   -- 다운그레이드 예정 플랜
  billing_key       VARCHAR(255),                  -- PG 빌링키 (암호화)
  status            VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  -- ACTIVE, CANCELLING, CANCELLED, PAST_DUE
  fail_count        SMALLINT NOT NULL DEFAULT 0,   -- 연속 결제 실패 횟수
  start_date        DATE NOT NULL,
  next_billing_date DATE NOT NULL,
  cancelled_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_next_billing ON subscriptions(next_billing_date)
  WHERE status IN ('ACTIVE', 'PAST_DUE');
```

---

## 8. withdrawals

출금 요청

```sql
CREATE TABLE withdrawals (
  id              BIGSERIAL PRIMARY KEY,
  tester_id       BIGINT NOT NULL REFERENCES users(id),
  bank_account_id BIGINT REFERENCES bank_accounts(id),
  method          VARCHAR(20) NOT NULL,            -- BANK_TRANSFER, PAYPAL
  amount          INTEGER NOT NULL,
  status          VARCHAR(20) NOT NULL DEFAULT 'REQUESTED',
  -- REQUESTED, PROCESSING, ON_HOLD, COMPLETED, FAILED, REJECTED
  flagged         BOOLEAN NOT NULL DEFAULT false,
  flag_reason     VARCHAR(200),
  hold_reason     VARCHAR(500),
  reject_reason   VARCHAR(500),
  fail_reason     VARCHAR(500),
  approved_by     BIGINT REFERENCES users(id),     -- 관리자
  approved_at     TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  requested_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_withdrawals_tester_id ON withdrawals(tester_id);
CREATE INDEX idx_withdrawals_status ON withdrawals(status);
CREATE INDEX idx_withdrawals_flagged ON withdrawals(flagged, status)
  WHERE flagged = true;
CREATE INDEX idx_withdrawals_processing ON withdrawals(status)
  WHERE status = 'PROCESSING';
```

---

# B. 보조 엔티티 (17개)

---

## 9. social_accounts

소셜 로그인 연동 (사용자 1:N)

```sql
CREATE TABLE social_accounts (
  id          BIGSERIAL PRIMARY KEY,
  user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider    VARCHAR(20) NOT NULL,    -- GOOGLE, KAKAO, NAVER
  provider_id VARCHAR(255) NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_social_provider UNIQUE(provider, provider_id)
);

CREATE INDEX idx_social_accounts_user_id ON social_accounts(user_id);
```

---

## 10. user_agreements

약관 동의 이력

```sql
CREATE TABLE user_agreements (
  id                BIGSERIAL PRIMARY KEY,
  user_id           BIGINT NOT NULL REFERENCES users(id),
  terms_version     VARCHAR(20) NOT NULL,   -- v1.0
  privacy_version   VARCHAR(20) NOT NULL,
  marketing_agreed  BOOLEAN NOT NULL DEFAULT false,
  ip_address        VARCHAR(45),
  user_agent        TEXT,
  agreed_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_agreements_user_id ON user_agreements(user_id);
```

---

## 11. refresh_tokens

JWT Refresh Token (디바이스별)

```sql
CREATE TABLE refresh_tokens (
  id          BIGSERIAL PRIMARY KEY,
  user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  VARCHAR(64) NOT NULL UNIQUE,  -- SHA-256 해시
  device_info VARCHAR(200),
  ip_address  VARCHAR(45),
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at);
```

---

## 12. nickname_histories

닉네임 변경 이력

```sql
CREATE TABLE nickname_histories (
  id              BIGSERIAL PRIMARY KEY,
  user_id         BIGINT NOT NULL REFERENCES users(id),
  previous_nickname VARCHAR(20) NOT NULL,
  new_nickname    VARCHAR(20) NOT NULL,
  changed_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_nickname_histories_user_id ON nickname_histories(user_id);
```

---

## 13. app_images

앱 아이콘/스크린샷

```sql
CREATE TABLE app_images (
  id          BIGSERIAL PRIMARY KEY,
  app_id      BIGINT NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  type        VARCHAR(20) NOT NULL,     -- ICON, SCREENSHOT
  url         VARCHAR(500) NOT NULL,    -- S3/CDN URL
  thumbnail_url VARCHAR(500),           -- 썸네일 (스크린샷만)
  sort_order  SMALLINT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_app_images_app_id ON app_images(app_id, type, sort_order);
```

---

## 14. app_feedback_items

앱별 피드백 평가 항목 설정

```sql
CREATE TABLE app_feedback_items (
  id        BIGSERIAL PRIMARY KEY,
  app_id    BIGINT NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  item_type VARCHAR(20) NOT NULL,   -- UI_UX, PERFORMANCE, FUNCTIONALITY, STABILITY
  
  CONSTRAINT uq_app_feedback_item UNIQUE(app_id, item_type)
);

CREATE INDEX idx_app_feedback_items_app_id ON app_feedback_items(app_id);
```

---

## 15. categories

앱 카테고리 마스터

```sql
CREATE TABLE categories (
  id          BIGSERIAL PRIMARY KEY,
  name        VARCHAR(50) NOT NULL UNIQUE,
  icon        VARCHAR(10),              -- 이모지
  sort_order  SMALLINT NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 16. feedback_ratings

항목별 별점 (피드백 1:N)

```sql
CREATE TABLE feedback_ratings (
  id          BIGSERIAL PRIMARY KEY,
  feedback_id BIGINT NOT NULL REFERENCES feedbacks(id) ON DELETE CASCADE,
  item_type   VARCHAR(20) NOT NULL,   -- UI_UX, PERFORMANCE, FUNCTIONALITY, STABILITY
  score       SMALLINT NOT NULL CHECK (score BETWEEN 1 AND 5),
  
  CONSTRAINT uq_feedback_rating UNIQUE(feedback_id, item_type)
);

CREATE INDEX idx_feedback_ratings_feedback_id ON feedback_ratings(feedback_id);
```

---

## 17. bug_reports

버그 리포트 (피드백 1:0..1)

```sql
CREATE TABLE bug_reports (
  id            BIGSERIAL PRIMARY KEY,
  feedback_id   BIGINT NOT NULL UNIQUE REFERENCES feedbacks(id) ON DELETE CASCADE,
  title         VARCHAR(100) NOT NULL,
  description   TEXT NOT NULL,
  device_info   VARCHAR(200),           -- UserAgent 자동
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 18. bug_report_images

버그 첨부 이미지 (버그 1:N, 최대 3)

```sql
CREATE TABLE bug_report_images (
  id              BIGSERIAL PRIMARY KEY,
  bug_report_id   BIGINT NOT NULL REFERENCES bug_reports(id) ON DELETE CASCADE,
  url             VARCHAR(500) NOT NULL,
  sort_order      SMALLINT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bug_report_images_report ON bug_report_images(bug_report_id);
```

---

## 19. reward_histories

포인트 변동 이력

```sql
CREATE TABLE reward_histories (
  id          BIGSERIAL PRIMARY KEY,
  user_id     BIGINT NOT NULL REFERENCES users(id),
  app_id      BIGINT REFERENCES apps(id),
  type        VARCHAR(30) NOT NULL,
  -- EARNED, WITHDRAWN, WITHDRAWAL_REFUND, EXCHANGED
  amount      INTEGER NOT NULL,           -- 양수(적립) / 음수(사용)
  balance     INTEGER NOT NULL,           -- 변동 후 잔액
  description VARCHAR(200),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reward_histories_user_id ON reward_histories(user_id, created_at DESC);
CREATE INDEX idx_reward_histories_app_id ON reward_histories(app_id) WHERE app_id IS NOT NULL;
```

---

## 20. credit_histories

크레딧 변동 이력

```sql
CREATE TABLE credit_histories (
  id          BIGSERIAL PRIMARY KEY,
  user_id     BIGINT NOT NULL REFERENCES users(id),
  app_id      BIGINT REFERENCES apps(id),
  type        VARCHAR(30) NOT NULL,
  -- EARNED_TEST, EARNED_FEEDBACK, USED_REGISTER
  amount      INTEGER NOT NULL,
  balance     INTEGER NOT NULL,           -- 변동 후 잔액
  description VARCHAR(200),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_credit_histories_user_id ON credit_histories(user_id, created_at DESC);
```

---

## 21. trust_score_histories

신뢰도 변동 이력

```sql
CREATE TABLE trust_score_histories (
  id          BIGSERIAL PRIMARY KEY,
  user_id     BIGINT NOT NULL REFERENCES users(id),
  app_id      BIGINT REFERENCES apps(id),
  event       VARCHAR(30) NOT NULL,
  -- TEST_COMPLETED, DROPOUT, FEEDBACK_QUALITY, PERIOD_BONUS
  delta       INTEGER NOT NULL,           -- 변동값 (+10, -10 등)
  score_after INTEGER NOT NULL,           -- 변동 후 점수
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_trust_score_histories_user_id ON trust_score_histories(user_id, created_at DESC);
```

---

## 22. payment_methods

결제 수단 (빌링키)

```sql
CREATE TABLE payment_methods (
  id          BIGSERIAL PRIMARY KEY,
  user_id     BIGINT NOT NULL REFERENCES users(id),
  type        VARCHAR(20) NOT NULL,       -- CARD, TOSS_PAY, KAKAO_PAY
  billing_key VARCHAR(255) NOT NULL,      -- PG 빌링키 (암호화)
  label       VARCHAR(50),                -- "신한 ****1234"
  last4       VARCHAR(4),
  is_default  BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at  TIMESTAMPTZ
);

CREATE INDEX idx_payment_methods_user_id ON payment_methods(user_id) WHERE deleted_at IS NULL;
```

---

## 23. bank_accounts

출금 계좌 (암호화)

```sql
CREATE TABLE bank_accounts (
  id              BIGSERIAL PRIMARY KEY,
  user_id         BIGINT NOT NULL REFERENCES users(id),
  method          VARCHAR(20) NOT NULL,    -- BANK_TRANSFER, PAYPAL
  bank_code       VARCHAR(10),             -- 은행 코드 (계좌이체 시)
  bank_name       VARCHAR(50),
  account_number  VARCHAR(255),            -- AES-256 암호화
  account_holder  VARCHAR(255),            -- AES-256 암호화
  paypal_email    VARCHAR(255),            -- AES-256 암호화 (PayPal 시)
  is_verified     BOOLEAN NOT NULL DEFAULT false,  -- 1원 인증 완료
  is_default      BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_bank_accounts_user_id ON bank_accounts(user_id) WHERE deleted_at IS NULL;
```

---

## 24. notifications

알림

```sql
CREATE TABLE notifications (
  id          BIGSERIAL PRIMARY KEY,
  user_id     BIGINT NOT NULL REFERENCES users(id),
  type        VARCHAR(30) NOT NULL,
  -- SELECTED, TEST_STARTED, DROPOUT, COMPLETED, REWARD, FEEDBACK_RECEIVED,
  -- WITHDRAWAL_DONE, NEW_APPLICATION, SYSTEM, WARNING
  title       VARCHAR(100) NOT NULL,
  message     VARCHAR(500) NOT NULL,
  link_url    VARCHAR(500),               -- 클릭 시 이동 경로
  is_read     BOOLEAN NOT NULL DEFAULT false,
  related_app_id BIGINT REFERENCES apps(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read)
  WHERE is_read = false;
```

---

## 25. notification_settings

알림 설정 (사용자 1:1)

```sql
CREATE TABLE notification_settings (
  id              BIGSERIAL PRIMARY KEY,
  user_id         BIGINT NOT NULL UNIQUE REFERENCES users(id),
  push_enabled    BOOLEAN NOT NULL DEFAULT true,
  email_enabled   BOOLEAN NOT NULL DEFAULT true,
  sms_enabled     BOOLEAN NOT NULL DEFAULT false,
  phone_number    VARCHAR(255),           -- AES-256 (SMS 인증 시)
  phone_verified  BOOLEAN NOT NULL DEFAULT false,
  fcm_token       VARCHAR(500),           -- FCM 푸시 토큰
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

# 관계 다이어그램 (텍스트)

```
                    ┌──────────────────────────────────────────┐
                    │                 users                     │
                    │  id, email, nickname, role, status,       │
                    │  point_balance, credit_balance,           │
                    │  trust_score, current_plan                │
                    └─────┬──┬──┬──┬──┬──┬──┬──┬──┬──┬────────┘
                          │  │  │  │  │  │  │  │  │  │
      ┌───────────────────┘  │  │  │  │  │  │  │  │  └──────────────────┐
      ▼                      │  │  │  │  │  │  │  │                     ▼
 social_accounts             │  │  │  │  │  │  │  │            notification_settings
 user_agreements             │  │  │  │  │  │  │  │            (1:1)
 refresh_tokens              │  │  │  │  │  │  │  │
 nickname_histories          │  │  │  │  │  │  │  │
                             │  │  │  │  │  │  │  │
      ┌──────────────────────┘  │  │  │  │  │  │  └──────────────┐
      ▼                         │  │  │  │  │  │                  ▼
 ┌─────────┐                    │  │  │  │  │  │            ┌───────────┐
 │  apps   │◀───────────────────┘  │  │  │  │  │            │  payments │
 │         │  (developer_id)       │  │  │  │  │            │           │
 └────┬────┘                       │  │  │  │  │            └───────────┘
      │                            │  │  │  │  │
      ├─ app_images                │  │  │  │  └── subscriptions
      ├─ app_feedback_items        │  │  │  └───── payment_methods
      ├─ categories (N:1)          │  │  └──────── bank_accounts
      │                            │  └─────────── reward_histories
      │                            └────────────── credit_histories
      ▼                                            trust_score_histories
 ┌──────────────┐                                  notifications
 │ applications │
 └──────┬───────┘
        │ (승인 시)
        ▼
 ┌──────────────────┐
 │  participations   │
 └──────┬────────────┘
        │ (완료 후)
        ▼
 ┌──────────────┐
 │  feedbacks    │
 ├──────────────┤
 ├─ feedback_ratings
 └─ bug_reports
      └─ bug_report_images
```
