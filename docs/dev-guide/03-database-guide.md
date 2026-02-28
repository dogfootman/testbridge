# TestBridge 데이터베이스 개발 가이드

**DBMS**: PostgreSQL 16
**ORM**: Prisma
**버전**: v1.0
**작성일**: 2026-03-01

---

## 목차

1. [Prisma 개요](#1-prisma-개요)
2. [스키마 설계](#2-스키마-설계)
3. [마이그레이션](#3-마이그레이션)
4. [쿼리 작성](#4-쿼리-작성)
5. [성능 최적화](#5-성능-최적화)
6. [트랜잭션](#6-트랜잭션)
7. [Soft Delete](#7-soft-delete)
8. [Seeding](#8-seeding)
9. [베스트 프랙티스](#9-베스트-프랙티스)

---

## 1. Prisma 개요

### 1.1 Prisma란?

Prisma는 타입 안전한 데이터베이스 ORM으로, TypeScript와 완벽하게 통합되어 자동 완성 및 타입 체크를 제공합니다.

**장점:**
- 타입 안전성 (TypeScript 기반)
- 자동 완성 지원 (IntelliSense)
- 마이그레이션 자동 생성
- 쿼리 빌더 (Raw SQL 불필요)
- N+1 쿼리 문제 자동 감지

### 1.2 Prisma vs Raw SQL

| 기준 | Prisma | Raw SQL |
|------|--------|---------|
| **타입 안전성** | ✅ 컴파일 타임 체크 | ❌ 런타임 에러 |
| **자동 완성** | ✅ IDE 지원 | ❌ 수동 작성 |
| **마이그레이션** | ✅ 자동 생성 | ⚠️ 수동 관리 |
| **성능** | ⚠️ ORM 오버헤드 | ✅ 최적화 가능 |
| **유지보수** | ✅ 쉬움 | ⚠️ 어려움 |

**권장:**
- 기본적으로 Prisma 사용
- 복잡한 집계/통계 쿼리는 Raw SQL 사용

```typescript
// ✅ Good: Prisma (타입 안전)
const users = await prisma.user.findMany({
  where: { status: 'ACTIVE' },
  select: { id: true, email: true }
})

// ❌ Bad: Raw SQL (타입 불안전)
const users = await prisma.$queryRaw`SELECT * FROM users WHERE status = 'ACTIVE'`
```

---

## 2. 스키마 설계

### 2.1 Model 정의

**기본 규칙:**
- PK는 항상 `id` (Int, autoincrement)
- 타임스탬프: `createdAt`, `updatedAt` 필수
- Soft Delete: `deletedAt` 사용
- 네이밍: camelCase (Prisma), snake_case (DB)

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique @db.VarChar(255)
  nickname  String?  @db.VarChar(20)
  status    UserStatus @default(ACTIVE)

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  deletedAt DateTime? @map("deleted_at")

  // Relations
  apps      App[]

  @@index([status])
  @@index([createdAt(sort: Desc)])
  @@map("users")
}

enum UserStatus {
  ACTIVE
  SUSPENDED
  WITHDRAWN
}
```

### 2.2 관계 설정 (1:N)

**개발자 → 앱 (1:N)**

```prisma
model User {
  id   Int    @id @default(autoincrement())
  apps App[]  @relation("DeveloperApps")

  @@map("users")
}

model App {
  id          Int  @id @default(autoincrement())
  developerId Int  @map("developer_id")

  developer User @relation("DeveloperApps", fields: [developerId], references: [id])

  @@index([developerId])
  @@map("apps")
}
```

**쿼리 예시:**

```typescript
// ✅ Good: 개발자의 앱 목록 조회 (include)
const developer = await prisma.user.findUnique({
  where: { id: 1 },
  include: {
    apps: {
      where: { status: 'RECRUITING' },
      orderBy: { createdAt: 'desc' }
    }
  }
})

// ✅ Good: 앱과 개발자 정보 조회
const app = await prisma.app.findUnique({
  where: { id: 1 },
  include: {
    developer: {
      select: { id: true, nickname: true, profileImageUrl: true }
    }
  }
})
```

### 2.3 관계 설정 (N:M)

**테스터 ↔ 앱 (N:M via Participation)**

```prisma
model User {
  id             Int             @id @default(autoincrement())
  participations Participation[]

  @@map("users")
}

model App {
  id             Int             @id @default(autoincrement())
  participations Participation[]

  @@map("apps")
}

model Participation {
  id       Int  @id @default(autoincrement())
  appId    Int  @map("app_id")
  testerId Int  @map("tester_id")

  app    App  @relation(fields: [appId], references: [id])
  tester User @relation(fields: [testerId], references: [id])

  @@unique([appId, testerId])
  @@index([appId, status])
  @@map("participations")
}
```

### 2.4 Enum 사용

```prisma
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

model App {
  status AppStatus @default(PENDING_APPROVAL)
}
```

### 2.5 제약 조건

```prisma
model User {
  email     String @unique @db.VarChar(255)          // UNIQUE
  emailHash String @unique @map("email_hash")        // UNIQUE
  nickname  String? @unique @db.VarChar(20)          // UNIQUE (nullable)

  @@index([status])                                  // INDEX
  @@index([createdAt(sort: Desc)])                   // INDEX (DESC)
}

model Application {
  appId    Int
  testerId Int

  @@unique([appId, testerId])  // COMPOSITE UNIQUE
}

model Feedback {
  overallRating Int @db.SmallInt  // SMALLINT (1~5)

  // CHECK 제약은 마이그레이션에서 수동 추가
}
```

---

## 3. 마이그레이션

### 3.1 마이그레이션 생성

```bash
# 1. schema.prisma 수정 후 마이그레이션 생성
npx prisma migrate dev --name add_feedbacks

# 2. 프로덕션 적용
npx prisma migrate deploy
```

**생성 파일:**
```
prisma/migrations/
└── 20260301000000_add_feedbacks/
    └── migration.sql
```

### 3.2 마이그레이션 수동 수정

Prisma가 생성한 마이그레이션에 CHECK 제약 추가:

```sql
-- prisma/migrations/.../migration.sql

CREATE TABLE feedbacks (
  id BIGSERIAL PRIMARY KEY,
  overall_rating SMALLINT NOT NULL,
  ...
);

-- ✅ Good: CHECK 제약 추가 (1~5)
ALTER TABLE feedbacks
  ADD CONSTRAINT chk_overall_rating CHECK (overall_rating BETWEEN 1 AND 5);

-- ✅ Good: 인덱스 추가
CREATE INDEX idx_feedbacks_rating ON feedbacks(app_id, overall_rating);
```

### 3.3 롤백 전략

```bash
# 마지막 마이그레이션 롤백 (개발 환경만)
npx prisma migrate reset

# 특정 마이그레이션으로 롤백 (수동)
psql -U postgres -d testbridge -f prisma/migrations/.../migration.sql
```

**⚠️ 프로덕션 롤백 주의사항:**
- 데이터 손실 가능 → 백업 필수
- 롤백 대신 새 마이그레이션 권장

---

## 4. 쿼리 작성

### 4.1 기본 CRUD

```typescript
// CREATE
const user = await prisma.user.create({
  data: {
    email: 'test@example.com',
    nickname: 'tester',
    status: 'ACTIVE'
  }
})

// READ (단건)
const user = await prisma.user.findUnique({
  where: { id: 1 }
})

// READ (다건)
const users = await prisma.user.findMany({
  where: { status: 'ACTIVE' }
})

// UPDATE
const updated = await prisma.user.update({
  where: { id: 1 },
  data: { nickname: 'newname' }
})

// DELETE (Hard Delete)
const deleted = await prisma.user.delete({
  where: { id: 1 }
})
```

### 4.2 관계 조회 (include vs select)

**include: 관계 데이터 포함**

```typescript
// ✅ Good: 앱과 개발자 정보 조회
const app = await prisma.app.findUnique({
  where: { id: 1 },
  include: {
    developer: true,       // 개발자 전체 필드
    category: true,        // 카테고리 전체 필드
    participations: true   // 참여자 목록
  }
})
```

**select: 필요한 필드만 선택 (성능 최적화)**

```typescript
// ✅ Good: 필요한 필드만 조회
const app = await prisma.app.findUnique({
  where: { id: 1 },
  select: {
    id: true,
    appName: true,
    developer: {
      select: {
        id: true,
        nickname: true,
        profileImageUrl: true
      }
    },
    category: {
      select: {
        name: true,
        icon: true
      }
    }
  }
})
```

**❌ Bad: 불필요한 데이터 조회**

```typescript
// 전체 필드 조회 (email, password 등 민감 정보 포함)
const app = await prisma.app.findUnique({
  where: { id: 1 },
  include: {
    developer: true  // ❌ 모든 필드 (비밀번호, 이메일 등)
  }
})
```

### 4.3 필터링 (where)

```typescript
// 단순 조건
const users = await prisma.user.findMany({
  where: { status: 'ACTIVE' }
})

// AND 조건
const apps = await prisma.app.findMany({
  where: {
    status: 'RECRUITING',
    testType: 'PAID_REWARD',
    rewardAmount: { gte: 5000 }  // gte: 이상
  }
})

// OR 조건
const users = await prisma.user.findMany({
  where: {
    OR: [
      { status: 'ACTIVE' },
      { status: 'SUSPENDED' }
    ]
  }
})

// 문자열 검색 (LIKE)
const apps = await prisma.app.findMany({
  where: {
    appName: {
      contains: '게임',       // LIKE '%게임%'
      mode: 'insensitive'     // 대소문자 무시
    }
  }
})

// NULL 체크
const apps = await prisma.app.findMany({
  where: {
    deletedAt: null  // IS NULL
  }
})
```

### 4.4 정렬 (orderBy)

```typescript
// 단일 정렬
const apps = await prisma.app.findMany({
  orderBy: { createdAt: 'desc' }
})

// 다중 정렬
const apps = await prisma.app.findMany({
  orderBy: [
    { status: 'asc' },
    { createdAt: 'desc' }
  ]
})

// 관계 기준 정렬
const apps = await prisma.app.findMany({
  orderBy: {
    developer: {
      nickname: 'asc'
    }
  }
})
```

### 4.5 페이지네이션

```typescript
// skip + take (OFFSET LIMIT)
const apps = await prisma.app.findMany({
  skip: 20,   // OFFSET 20
  take: 10,   // LIMIT 10
  orderBy: { createdAt: 'desc' }
})

// 총 개수 조회 (페이지 계산)
const total = await prisma.app.count({
  where: { status: 'RECRUITING' }
})

// ✅ Good: 페이지네이션 + 총 개수
const [apps, total] = await Promise.all([
  prisma.app.findMany({
    where: { status: 'RECRUITING' },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: 'desc' }
  }),
  prisma.app.count({
    where: { status: 'RECRUITING' }
  })
])

return {
  data: apps,
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit)
}
```

### 4.6 집계 (Aggregation)

```typescript
// 개수 세기
const count = await prisma.app.count({
  where: { status: 'RECRUITING' }
})

// 평균 계산
const avg = await prisma.feedback.aggregate({
  _avg: {
    overallRating: true
  },
  where: { appId: 1 }
})

// 집계 + 그룹화
const stats = await prisma.participation.groupBy({
  by: ['status'],
  _count: {
    id: true
  },
  where: { appId: 1 }
})
// 결과: [{ status: 'ACTIVE', _count: { id: 15 } }, ...]
```

### 4.7 관계 카운트 (_count)

```typescript
// ✅ Good: 앱별 참여자 수 조회
const apps = await prisma.app.findMany({
  include: {
    _count: {
      select: {
        participations: true,
        feedbacks: true
      }
    }
  }
})

// 결과:
// [
//   {
//     id: 1,
//     appName: 'My App',
//     _count: { participations: 20, feedbacks: 15 }
//   }
// ]
```

---

## 5. 성능 최적화

### 5.1 N+1 문제 및 해결

**❌ Bad: N+1 쿼리 (20개 앱 → 21회 쿼리)**

```typescript
const apps = await prisma.app.findMany({
  take: 20
})

// ❌ 각 앱마다 개발자 조회 (N번 쿼리)
for (const app of apps) {
  const developer = await prisma.user.findUnique({
    where: { id: app.developerId }
  })
}
```

**✅ Good: include로 해결 (1회 쿼리 - JOIN)**

```typescript
const apps = await prisma.app.findMany({
  take: 20,
  include: {
    developer: {
      select: {
        id: true,
        nickname: true,
        profileImageUrl: true
      }
    }
  }
})
```

### 5.2 인덱스 전략

**자주 검색하는 컬럼에 인덱스 추가:**

```prisma
model App {
  status    AppStatus
  categoryId Int

  @@index([status])                            // 단일 인덱스
  @@index([status, createdAt(sort: Desc)])     // 복합 인덱스
  @@index([categoryId])                        // FK 인덱스
}
```

**실제 프로젝트 예시 (04-data-model.md 참고):**

```sql
-- apps 테이블 인덱스
CREATE INDEX idx_apps_developer_id ON apps(developer_id);
CREATE INDEX idx_apps_status ON apps(status);
CREATE INDEX idx_apps_category_id ON apps(category_id);
CREATE INDEX idx_apps_status_created ON apps(status, created_at DESC);

-- participations 테이블 인덱스
CREATE INDEX idx_participations_app_id ON participations(app_id);
CREATE INDEX idx_participations_tester_id ON participations(tester_id);
CREATE INDEX idx_participations_active ON participations(tester_id, status)
  WHERE status = 'ACTIVE';
```

### 5.3 select로 필요한 필드만 조회

**❌ Bad: 전체 필드 조회**

```typescript
const users = await prisma.user.findMany({
  where: { status: 'ACTIVE' }
})
// ❌ email, password, phone 등 불필요한 필드 포함
```

**✅ Good: 필요한 필드만 조회**

```typescript
const users = await prisma.user.findMany({
  where: { status: 'ACTIVE' },
  select: {
    id: true,
    nickname: true,
    profileImageUrl: true
  }
})
```

### 5.4 쿼리 성능 분석

```typescript
// Prisma 쿼리 로그 활성화 (개발 환경)
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error']
})

// PostgreSQL EXPLAIN 사용
const result = await prisma.$queryRaw`
  EXPLAIN ANALYZE
  SELECT * FROM apps WHERE status = 'RECRUITING';
`
```

---

## 6. 트랜잭션

### 6.1 기본 트랜잭션 ($transaction)

**사용 사례: 피드백 작성 + 리워드 지급**

```typescript
// ✅ Good: 트랜잭션으로 원자성 보장
const result = await prisma.$transaction(async (tx) => {
  // 1. 피드백 생성
  const feedback = await tx.feedback.create({
    data: {
      appId: 1,
      testerId: userId,
      participationId: 10,
      overallRating: 5,
      comment: '좋은 앱입니다.'
    }
  })

  // 2. 사용자 포인트 증가
  const user = await tx.user.update({
    where: { id: userId },
    data: {
      pointBalance: { increment: 3000 }
    }
  })

  // 3. 리워드 이력 생성
  await tx.rewardHistory.create({
    data: {
      userId,
      appId: 1,
      type: 'EARNED',
      amount: 3000,
      balance: user.pointBalance,
      description: 'Feedback reward'
    }
  })

  return feedback
})
```

### 6.2 Interactive Transaction

**긴 트랜잭션 (타임아웃 설정):**

```typescript
await prisma.$transaction(
  async (tx) => {
    // 복잡한 비즈니스 로직...
  },
  {
    maxWait: 5000,    // 대기 최대 5초
    timeout: 10000    // 실행 최대 10초
  }
)
```

### 6.3 롤백 처리

**에러 발생 시 자동 롤백:**

```typescript
try {
  await prisma.$transaction(async (tx) => {
    await tx.user.update({ ... })

    // ❌ 에러 발생 → 전체 롤백
    throw new Error('Business rule violation')
  })
} catch (error) {
  console.error('Transaction rolled back:', error)
}
```

**조건부 롤백:**

```typescript
const result = await prisma.$transaction(async (tx) => {
  const participation = await tx.participation.findUnique({
    where: { id: participationId }
  })

  if (!participation) {
    // ⚠️ 에러 반환 (트랜잭션 롤백)
    return { error: 'Participation not found', status: 404 }
  }

  if (participation.status !== 'COMPLETED') {
    return { error: 'Not completed', status: 400 }
  }

  // ✅ 정상 처리
  const feedback = await tx.feedback.create({ ... })
  return { data: feedback, status: 201 }
})

// 에러 체크
if ('error' in result) {
  return NextResponse.json({ error: result.error }, { status: result.status })
}
```

---

## 7. Soft Delete

### 7.1 deletedAt 패턴

**스키마 정의:**

```prisma
model User {
  id        Int       @id @default(autoincrement())
  email     String
  deletedAt DateTime? @map("deleted_at")

  @@index([deletedAt])
  @@map("users")
}
```

**Soft Delete 구현:**

```typescript
// ✅ Soft Delete (deletedAt 설정)
const deleted = await prisma.user.update({
  where: { id: 1 },
  data: { deletedAt: new Date() }
})

// ❌ Hard Delete (권장하지 않음)
await prisma.user.delete({ where: { id: 1 } })
```

### 7.2 삭제된 데이터 제외

```typescript
// ✅ Good: 삭제되지 않은 사용자만 조회
const users = await prisma.user.findMany({
  where: { deletedAt: null }
})

// ✅ Good: 삭제된 사용자 조회
const deletedUsers = await prisma.user.findMany({
  where: {
    deletedAt: { not: null }
  }
})
```

### 7.3 Unique 제약과 Soft Delete

**문제:** deletedAt이 있어도 UNIQUE 제약 충돌

```sql
-- ❌ Bad: 삭제 후 같은 이메일 재가입 불가
CREATE UNIQUE INDEX idx_users_email ON users(email);

-- ✅ Good: 삭제되지 않은 레코드만 UNIQUE
CREATE UNIQUE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
```

**Prisma 스키마:**

```prisma
model User {
  email String @unique

  // ⚠️ Partial Unique Index는 마이그레이션에서 수동 추가
}
```

**마이그레이션 수정:**

```sql
-- prisma/migrations/.../migration.sql

-- 기본 UNIQUE 제거
DROP INDEX users_email_key;

-- Partial UNIQUE 추가
CREATE UNIQUE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
```

---

## 8. Seeding

### 8.1 시드 데이터 생성

**prisma/seed.ts:**

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // 1. 카테고리 생성
  const categories = await Promise.all([
    prisma.category.create({
      data: { name: '게임', icon: '🎮', sortOrder: 1 }
    }),
    prisma.category.create({
      data: { name: '생산성', icon: '📊', sortOrder: 2 }
    }),
    prisma.category.create({
      data: { name: '소셜', icon: '💬', sortOrder: 3 }
    })
  ])

  console.log('✅ Categories created:', categories.length)

  // 2. 테스트 사용자 생성
  const testUser = await prisma.user.create({
    data: {
      email: 'test@example.com',
      emailHash: 'hash123',
      nickname: 'tester1',
      role: 'BOTH',
      status: 'ACTIVE',
      provider: 'GOOGLE',
      providerId: 'google123'
    }
  })

  console.log('✅ Test user created:', testUser.id)

  // 3. 테스트 앱 생성
  const testApp = await prisma.app.create({
    data: {
      developerId: testUser.id,
      appName: 'Sample Game App',
      packageName: 'com.example.samplegame',
      categoryId: categories[0].id,
      description: 'A fun game for testing',
      testType: 'PAID_REWARD',
      targetTesters: 20,
      testLink: 'https://play.google.com/apps/testing/com.example.samplegame',
      rewardType: 'BASIC',
      rewardAmount: 3000,
      status: 'RECRUITING'
    }
  })

  console.log('✅ Test app created:', testApp.id)
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

### 8.2 시드 실행

**package.json:**

```json
{
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

**실행:**

```bash
# 마이그레이션 + 시드 실행
npx prisma migrate reset

# 시드만 실행
npx prisma db seed
```

---

## 9. 베스트 프랙티스

### 9.1 Connection Pool 관리

**lib/prisma.ts:**

```typescript
import { PrismaClient } from '@prisma/client'

// ✅ Good: 싱글톤 패턴 (커넥션 재사용)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

**환境 변수 (.env):**

```bash
# PostgreSQL 커넥션 풀 설정
DATABASE_URL="postgresql://user:password@localhost:5432/testbridge?schema=public&connection_limit=10"
```

### 9.2 쿼리 타임아웃 설정

```typescript
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + '&statement_timeout=5000'  // 5초
    }
  }
})
```

### 9.3 에러 처리

```typescript
// ✅ Good: Prisma 에러 처리
import { Prisma } from '@prisma/client'

try {
  const user = await prisma.user.create({
    data: { email: 'duplicate@example.com', ... }
  })
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique 제약 위반
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      )
    }

    // Foreign Key 제약 위반
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Referenced record not found' },
        { status: 404 }
      )
    }
  }

  // 기타 에러
  console.error('Database error:', error)
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}
```

**주요 에러 코드:**

| 코드 | 의미 | HTTP Status |
|------|------|-------------|
| P2002 | Unique 제약 위반 | 409 Conflict |
| P2003 | Foreign Key 제약 위반 | 404 Not Found |
| P2025 | Record not found | 404 Not Found |

### 9.4 타입 추출

**쿼리 결과 타입 재사용:**

```typescript
// ✅ Good: 쿼리 결과 타입 추출
const appWithRelations = await prisma.app.findUnique({
  where: { id: 1 },
  include: {
    developer: { select: { id: true, nickname: true } },
    category: { select: { name: true, icon: true } }
  }
})

type AppWithRelations = typeof appWithRelations
// type AppWithRelations = {
//   id: number
//   appName: string
//   developer: { id: number, nickname: string }
//   category: { name: string, icon: string }
// }

// 재사용
function processApp(app: AppWithRelations) {
  // ...
}
```

### 9.5 환경별 설정

**.env.development:**

```bash
DATABASE_URL="postgresql://localhost:5432/testbridge_dev"
LOG_LEVEL="query"
```

**.env.production:**

```bash
DATABASE_URL="postgresql://prod-server:5432/testbridge_prod"
LOG_LEVEL="error"
```

### 9.6 마이그레이션 주의사항

**✅ Do:**
- 개발: `npx prisma migrate dev`
- 프로덕션: `npx prisma migrate deploy`
- 마이그레이션 파일 버전 관리 (Git)

**❌ Don't:**
- 프로덕션에서 `migrate reset` (데이터 손실)
- 마이그레이션 파일 수동 삭제
- 이미 배포된 마이그레이션 수정

---

## 10. 실전 예제 (TestBridge)

### 10.1 피드백 생성 + 리워드 지급 (트랜잭션)

**파일:** `src/app/api/feedbacks/route.ts`

```typescript
// @TASK P5-R7.1 - Feedbacks Resource API
export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = parseInt(session.user.id)
  const { participationId, overallRating, comment } = await request.json()

  // ✅ 트랜잭션으로 원자성 보장
  const result = await prisma.$transaction(async (tx) => {
    // 1. Participation 조회 (Lock)
    const participation = await tx.participation.findUnique({
      where: { id: participationId },
      include: { feedback: true, app: true }
    })

    if (!participation) {
      return { error: 'Participation not found', status: 404 }
    }

    if (participation.testerId !== userId) {
      return { error: 'Forbidden', status: 403 }
    }

    if (participation.status !== 'COMPLETED') {
      return { error: 'Participation must be COMPLETED', status: 400 }
    }

    if (participation.feedback) {
      return { error: 'Feedback already submitted', status: 409 }
    }

    // 2. Feedback 생성
    const feedback = await tx.feedback.create({
      data: {
        appId: participation.appId,
        testerId: userId,
        participationId: participation.id,
        overallRating,
        comment: comment || null
      }
    })

    // 3. 리워드 지급 (PAID_REWARD만)
    if (participation.app.testType === 'PAID_REWARD' && participation.app.rewardAmount) {
      const rewardAmount = participation.app.rewardAmount

      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { pointBalance: true }
      })

      const newBalance = (user?.pointBalance || 0) + rewardAmount

      // 포인트 증가
      await tx.user.update({
        where: { id: userId },
        data: { pointBalance: { increment: rewardAmount } }
      })

      // 이력 생성
      await tx.rewardHistory.create({
        data: {
          userId,
          appId: participation.appId,
          type: 'EARNED',
          amount: rewardAmount,
          balance: newBalance,
          description: `Feedback reward for app #${participation.appId}`
        }
      })

      // Participation 상태 업데이트
      await tx.participation.update({
        where: { id: participation.id },
        data: { rewardStatus: 'PAID' }
      })
    } else {
      await tx.participation.update({
        where: { id: participation.id },
        data: { rewardStatus: 'SKIPPED' }
      })
    }

    return { data: feedback, status: 201 }
  })

  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }

  return NextResponse.json(result.data, { status: 201 })
}
```

### 10.2 앱 목록 조회 (필터링 + 페이지네이션)

**파일:** `src/app/api/apps/route.ts`

```typescript
// @TASK T-01 - 앱 탐색 필터링
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const categoryId = searchParams.get('categoryId')
  const search = searchParams.get('search')
  const rewardMin = searchParams.get('rewardMin')
  const limit = searchParams.get('limit')

  // ✅ where 조건 동적 생성
  const where: {
    status?: string
    categoryId?: number
    appName?: { contains: string; mode: 'insensitive' }
    rewardAmount?: { gte: number }
  } = {}

  if (status) where.status = status
  if (categoryId) where.categoryId = parseInt(categoryId)
  if (search) where.appName = { contains: search.trim(), mode: 'insensitive' }
  if (rewardMin) where.rewardAmount = { gte: parseInt(rewardMin) }

  // ✅ select로 필요한 필드만 조회
  const apps = await prisma.app.findMany({
    where,
    take: limit ? parseInt(limit) : undefined,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      appName: true,
      description: true,
      rewardAmount: true,
      createdAt: true,
      developer: {
        select: {
          id: true,
          nickname: true,
          profileImageUrl: true
        }
      },
      category: {
        select: {
          name: true,
          icon: true
        }
      },
      _count: {
        select: {
          participations: true
        }
      }
    }
  })

  return NextResponse.json({ apps }, { status: 200 })
}
```

### 10.3 참여자 목록 (include + 정렬)

**파일:** `src/app/api/participations/route.ts`

```typescript
// @TASK P3-S9 - Participations API
export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = parseInt(session.user.id)
  const { searchParams } = new URL(request.url)
  const appIdParam = searchParams.get('appId')
  const statusParam = searchParams.get('status')

  const where: { testerId: number; appId?: number; status?: string } = {
    testerId: userId
  }
  if (appIdParam) where.appId = parseInt(appIdParam)
  if (statusParam) where.status = statusParam

  // ✅ include로 관계 데이터 조회
  const participations = await prisma.participation.findMany({
    where,
    include: {
      app: {
        select: {
          id: true,
          appName: true,
          testStartDate: true,
          testEndDate: true,
          rewardAmount: true,
          rewardType: true,
          images: {
            select: { url: true, type: true }
          }
        }
      },
      tester: {
        select: {
          id: true,
          nickname: true,
          email: true,
          profileImageUrl: true
        }
      },
      feedback: true
    },
    orderBy: { joinedAt: 'desc' }
  })

  return NextResponse.json(participations, { status: 200 })
}
```

---

## 참고 문서

- [Prisma 공식 문서](https://www.prisma.io/docs)
- [TestBridge 데이터 모델](../planning/04-data-model.md)
- [PostgreSQL 16 문서](https://www.postgresql.org/docs/16/)

---

**작성자:** Database Specialist
**최종 수정:** 2026-03-01
