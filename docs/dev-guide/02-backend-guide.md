# TestBridge Backend API 개발 가이드

**프로젝트**: TestBridge
**문서 목적**: Next.js API Routes 백엔드 개발 표준 가이드
**작성일**: 2026-03-01

---

## 목차

1. [API 설계 원칙](#1-api-설계-원칙)
2. [Route Handler 작성](#2-route-handler-작성)
3. [인증 및 인가](#3-인증-및-인가)
4. [입력 검증](#4-입력-검증)
5. [데이터베이스 연동](#5-데이터베이스-연동)
6. [에러 처리](#6-에러-처리)
7. [트랜잭션](#7-트랜잭션)
8. [TDD 적용](#8-tdd-적용)
9. [성능 최적화](#9-성능-최적화)

---

## 1. API 설계 원칙

### 1.1 RESTful API 설계

**리소스 중심 설계**:
- URL은 명사를 사용하여 리소스를 표현
- 동사는 HTTP 메서드로 표현

```typescript
✅ Good
GET /api/apps                  // 앱 목록 조회
POST /api/apps                 // 앱 생성
GET /api/apps/[id]             // 특정 앱 조회
PATCH /api/apps/[id]           // 앱 수정
DELETE /api/apps/[id]          // 앱 삭제

❌ Bad
GET /api/getApps
POST /api/createApp
GET /api/apps/get/[id]
```

### 1.2 HTTP 메서드 사용 규칙

| 메서드 | 용도 | 멱등성 | 요청 본문 | 응답 본문 |
|--------|------|--------|----------|----------|
| GET | 조회 | ✅ | ❌ | ✅ |
| POST | 생성 | ❌ | ✅ | ✅ |
| PATCH | 부분 수정 | ❌ | ✅ | ✅ |
| PUT | 전체 수정 | ✅ | ✅ | ✅ |
| DELETE | 삭제 | ✅ | ❌ | ✅/❌ |

**멱등성 (Idempotence)**: 같은 요청을 여러 번 실행해도 결과가 같음

### 1.3 상태 코드 사용 가이드

| 코드 | 용도 | 사용 예시 |
|------|------|----------|
| **200 OK** | 성공 (조회, 수정) | GET, PATCH |
| **201 Created** | 생성 성공 | POST |
| **204 No Content** | 삭제 성공 (본문 없음) | DELETE |
| **400 Bad Request** | 유효성 실패 | 필수 필드 누락, 형식 오류 |
| **401 Unauthorized** | 인증 실패/만료 | 세션 없음, 토큰 만료 |
| **403 Forbidden** | 권한 없음 | 다른 사용자 리소스 접근 |
| **404 Not Found** | 리소스 없음 | 존재하지 않는 ID |
| **409 Conflict** | 충돌 (중복) | 이메일 중복, 패키지명 중복 |
| **500 Internal Server Error** | 서버 오류 | 예상치 못한 에러 |

### 1.4 응답 형식

**단일 리소스 조회**:
```typescript
// GET /api/apps/1
{
  "id": 1,
  "appName": "MyApp",
  "status": "RECRUITING",
  "createdAt": "2026-03-01T10:00:00Z"
}
```

**리스트 조회 (페이지네이션)**:
```typescript
// GET /api/apps?page=1&limit=20
{
  "apps": [
    { "id": 1, "appName": "MyApp" },
    { "id": 2, "appName": "YourApp" }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

**에러 응답**:
```typescript
{
  "error": "appName is required"
}
```

---

## 2. Route Handler 작성

### 2.1 파일 구조

```
src/app/api/
├── apps/
│   ├── route.ts              // GET /api/apps, POST /api/apps
│   ├── route.test.ts         // 테스트
│   └── [id]/
│       ├── route.ts          // GET, PATCH, DELETE /api/apps/[id]
│       └── route.test.ts
└── feedbacks/
    ├── route.ts              // GET, POST /api/feedbacks
    └── [id]/
        └── route.ts          // GET /api/feedbacks/[id]
```

### 2.2 GET 구현

**기본 목록 조회**:
```typescript
// src/app/api/apps/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const categoryId = searchParams.get('categoryId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Build where clause
    const where: any = {}
    if (status) where.status = status
    if (categoryId) where.categoryId = parseInt(categoryId)

    const apps = await prisma.app.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        developer: {
          select: { id: true, nickname: true }
        },
        category: true,
      },
    })

    const total = await prisma.app.count({ where })

    return NextResponse.json({
      apps,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('GET /api/apps error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch apps' },
      { status: 500 }
    )
  }
}
```

**단일 리소스 조회 (Dynamic Route)**:
```typescript
// src/app/api/apps/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid ID format' },
        { status: 400 }
      )
    }

    const app = await prisma.app.findUnique({
      where: { id },
      include: {
        developer: {
          select: { id: true, nickname: true, profileImageUrl: true }
        },
        category: true,
        _count: {
          select: { participations: true }
        },
      },
    })

    if (!app) {
      return NextResponse.json(
        { error: 'App not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(app)
  } catch (error) {
    console.error('GET /api/apps/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch app' },
      { status: 500 }
    )
  }
}
```

### 2.3 POST 구현 (리소스 생성)

```typescript
// src/app/api/apps/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // 1. 인증 확인
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const developerId = parseInt(session.user.id)

    // 2. 요청 본문 파싱
    const body = await request.json()
    const {
      appName,
      packageName,
      categoryId,
      description,
      testType,
      targetTesters,
      testLink,
    } = body

    // 3. 입력 검증 (Layer 1)
    if (!appName || typeof appName !== 'string' || appName.trim().length === 0) {
      return NextResponse.json({ error: 'appName is required' }, { status: 400 })
    }

    if (!packageName || typeof packageName !== 'string') {
      return NextResponse.json({ error: 'packageName is required' }, { status: 400 })
    }

    // Package name format validation
    if (!/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/.test(packageName)) {
      return NextResponse.json(
        { error: 'Invalid package name format' },
        { status: 400 }
      )
    }

    if (!categoryId || typeof categoryId !== 'number') {
      return NextResponse.json(
        { error: 'categoryId is required and must be a number' },
        { status: 400 }
      )
    }

    if (!targetTesters || typeof targetTesters !== 'number' || targetTesters < 1 || targetTesters > 100) {
      return NextResponse.json(
        { error: 'targetTesters must be between 1 and 100' },
        { status: 400 }
      )
    }

    // 4. 비즈니스 로직 검증 (Layer 2)
    // 패키지명 중복 확인
    const existingApp = await prisma.app.findUnique({
      where: { packageName },
    })

    if (existingApp) {
      return NextResponse.json(
        { error: 'Package name already exists' },
        { status: 409 }
      )
    }

    // 카테고리 존재 확인
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    // 5. 리소스 생성
    const app = await prisma.app.create({
      data: {
        developerId,
        appName: appName.trim(),
        packageName: packageName.trim(),
        categoryId,
        description: description.trim(),
        testType,
        targetTesters,
        testLink: testLink.trim(),
        status: 'PENDING_APPROVAL',
      },
    })

    return NextResponse.json(app, { status: 201 })
  } catch (error) {
    console.error('POST /api/apps error:', error)
    return NextResponse.json(
      { error: 'Failed to create app' },
      { status: 500 }
    )
  }
}
```

### 2.4 PATCH 구현 (부분 수정)

```typescript
// src/app/api/apps/[id]/route.ts
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. 인증 확인
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = parseInt(session.user.id)
    const id = parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    // 2. 리소스 존재 확인
    const app = await prisma.app.findUnique({ where: { id } })

    if (!app) {
      return NextResponse.json({ error: 'App not found' }, { status: 404 })
    }

    // 3. 권한 확인 (본인 소유만 수정 가능)
    if (app.developerId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 4. 요청 본문 파싱
    const body = await request.json()
    const { appName, description, testGuide } = body

    // 5. 수정 가능한 필드만 업데이트
    const updateData: any = {}
    if (appName !== undefined) updateData.appName = appName.trim()
    if (description !== undefined) updateData.description = description.trim()
    if (testGuide !== undefined) updateData.testGuide = testGuide.trim()

    const updatedApp = await prisma.app.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(updatedApp)
  } catch (error) {
    console.error('PATCH /api/apps/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to update app' },
      { status: 500 }
    )
  }
}
```

### 2.5 DELETE 구현

```typescript
// src/app/api/apps/[id]/route.ts
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. 인증 확인
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = parseInt(session.user.id)
    const id = parseInt(params.id)

    // 2. 리소스 존재 확인
    const app = await prisma.app.findUnique({ where: { id } })

    if (!app) {
      return NextResponse.json({ error: 'App not found' }, { status: 404 })
    }

    // 3. 권한 확인
    if (app.developerId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 4. 비즈니스 로직 검증
    if (app.status === 'IN_TESTING') {
      return NextResponse.json(
        { error: 'Cannot delete app in testing' },
        { status: 400 }
      )
    }

    // 5. 삭제
    await prisma.app.delete({ where: { id } })

    return NextResponse.json({ message: 'App deleted successfully' })
  } catch (error) {
    console.error('DELETE /api/apps/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to delete app' },
      { status: 500 }
    )
  }
}
```

### 2.6 Request/Response 타입

```typescript
// types/api.ts
export interface CreateAppRequest {
  appName: string
  packageName: string
  categoryId: number
  description: string
  testType: 'PAID_REWARD' | 'CREDIT_EXCHANGE'
  targetTesters: number
  testLink: string
  rewardType?: 'WITH_FEEDBACK' | 'NO_FEEDBACK'
  rewardAmount?: number
  feedbackRequired?: boolean
  testGuide?: string
}

export interface AppResponse {
  id: number
  appName: string
  packageName: string
  categoryId: number
  description: string
  status: string
  createdAt: string
  developer?: {
    id: number
    nickname: string
  }
  category?: {
    id: number
    name: string
  }
}

export interface ErrorResponse {
  error: string
}
```

---

## 3. 인증 및 인가

### 3.1 NextAuth 세션 검증

**세션 가져오기**:
```typescript
// lib/auth.ts
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function getSession() {
  return await getServerSession(authOptions)
}
```

**Route Handler에서 인증 확인**:
```typescript
import { getSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  // 1. 세션 확인
  const session = await getSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = parseInt(session.user.id)
  // ... 나머지 로직
}
```

### 3.2 역할 기반 권한 검증

**DEVELOPER vs TESTER 구분**:
```typescript
export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: parseInt(session.user.id) },
    select: { role: true },
  })

  // DEVELOPER 권한 필요
  if (user?.role !== 'DEVELOPER') {
    return NextResponse.json(
      { error: 'Only developers can create apps' },
      { status: 403 }
    )
  }

  // ... 앱 생성 로직
}
```

**리소스 소유자 확인**:
```typescript
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = parseInt(session.user.id)
  const appId = parseInt(params.id)

  const app = await prisma.app.findUnique({
    where: { id: appId },
    select: { developerId: true },
  })

  if (!app) {
    return NextResponse.json({ error: 'App not found' }, { status: 404 })
  }

  // 본인 소유 앱만 수정 가능
  if (app.developerId !== userId) {
    return NextResponse.json(
      { error: 'You can only modify your own apps' },
      { status: 403 }
    )
  }

  // ... 수정 로직
}
```

### 3.3 401 vs 403 에러 처리

| 상태 코드 | 의미 | 사용 예시 |
|-----------|------|----------|
| **401 Unauthorized** | 인증 실패 | 세션 없음, 토큰 만료 |
| **403 Forbidden** | 인증은 됐지만 권한 없음 | 다른 사용자 리소스 접근, 역할 부족 |

```typescript
✅ Good
// 세션 없음 → 401
if (!session) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

// 본인 리소스 아님 → 403
if (resource.ownerId !== userId) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

// 역할 부족 → 403
if (user.role !== 'ADMIN') {
  return NextResponse.json(
    { error: 'Only admins can access this resource' },
    { status: 403 }
  )
}
```

---

## 4. 입력 검증

### 4.1 필수 필드 검증

```typescript
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { appName, packageName, categoryId, description } = body

  // 필수 필드 확인
  if (!appName || typeof appName !== 'string' || appName.trim().length === 0) {
    return NextResponse.json({ error: 'appName is required' }, { status: 400 })
  }

  if (!categoryId || typeof categoryId !== 'number') {
    return NextResponse.json(
      { error: 'categoryId is required and must be a number' },
      { status: 400 }
    )
  }

  // ... 나머지 로직
}
```

### 4.2 타입 및 형식 검증

**정규식 검증**:
```typescript
// 패키지명 형식 (com.example.app)
const packageNamePattern = /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/
if (!packageNamePattern.test(packageName)) {
  return NextResponse.json(
    { error: 'Invalid package name format' },
    { status: 400 }
  )
}

// 이메일 형식
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
if (!emailPattern.test(email)) {
  return NextResponse.json(
    { error: 'Invalid email format' },
    { status: 400 }
  )
}
```

**범위 검증**:
```typescript
// 별점 (1~5)
if (
  typeof overallRating !== 'number' ||
  overallRating < 1 ||
  overallRating > 5 ||
  !Number.isInteger(overallRating)
) {
  return NextResponse.json(
    { error: 'overallRating must be an integer between 1 and 5' },
    { status: 400 }
  )
}

// 테스터 수 (1~100)
if (
  typeof targetTesters !== 'number' ||
  targetTesters < 1 ||
  targetTesters > 100
) {
  return NextResponse.json(
    { error: 'targetTesters must be between 1 and 100' },
    { status: 400 }
  )
}
```

### 4.3 Zod를 사용한 입력 검증 (선택)

**Zod 스키마 정의**:
```typescript
import { z } from 'zod'

const createAppSchema = z.object({
  appName: z.string().min(1, 'appName is required').max(100),
  packageName: z.string().regex(
    /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/,
    'Invalid package name format'
  ),
  categoryId: z.number().int().positive(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  testType: z.enum(['PAID_REWARD', 'CREDIT_EXCHANGE']),
  targetTesters: z.number().int().min(1).max(100),
  testLink: z.string().url('testLink must be a valid URL'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Zod로 검증
    const result = createAppSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      )
    }

    const validatedData = result.data
    // ... 나머지 로직
  } catch (error) {
    // ...
  }
}
```

### 4.4 커스텀 에러 메시지

```typescript
✅ Good (명확한 에러 메시지)
{ error: 'appName is required' }
{ error: 'targetTesters must be between 1 and 100' }
{ error: 'Invalid package name format (e.g., com.example.app)' }

❌ Bad (모호한 에러 메시지)
{ error: 'Invalid input' }
{ error: 'Validation failed' }
{ error: 'Bad request' }
```

---

## 5. 데이터베이스 연동

### 5.1 Prisma Client 사용

**Prisma Client 초기화**:
```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### 5.2 CRUD 작업

**Create (생성)**:
```typescript
const app = await prisma.app.create({
  data: {
    developerId: userId,
    appName: 'MyApp',
    packageName: 'com.example.myapp',
    categoryId: 1,
    description: 'My awesome app',
    status: 'PENDING_APPROVAL',
  },
})
```

**Read (조회)**:
```typescript
// 단일 조회
const app = await prisma.app.findUnique({
  where: { id: 1 },
})

// 조건부 조회
const apps = await prisma.app.findMany({
  where: {
    status: 'RECRUITING',
    categoryId: 1,
  },
})

// 첫 번째 결과만
const firstApp = await prisma.app.findFirst({
  where: { status: 'RECRUITING' },
})
```

**Update (수정)**:
```typescript
const updatedApp = await prisma.app.update({
  where: { id: 1 },
  data: {
    appName: 'Updated Name',
    description: 'Updated description',
  },
})
```

**Delete (삭제)**:
```typescript
await prisma.app.delete({
  where: { id: 1 },
})
```

### 5.3 관계 데이터 조회 (include, select)

**include로 관계 데이터 포함**:
```typescript
const app = await prisma.app.findUnique({
  where: { id: 1 },
  include: {
    developer: true,           // 개발자 정보 포함
    category: true,            // 카테고리 정보 포함
    participations: true,      // 참여자 목록 포함
  },
})

// 중첩 include
const app = await prisma.app.findUnique({
  where: { id: 1 },
  include: {
    participations: {
      include: {
        tester: true,          // 참여자의 테스터 정보 포함
        feedback: true,        // 참여자의 피드백 포함
      },
    },
  },
})
```

**select로 필요한 필드만 선택**:
```typescript
const app = await prisma.app.findUnique({
  where: { id: 1 },
  select: {
    id: true,
    appName: true,
    status: true,
    developer: {
      select: {
        id: true,
        nickname: true,
        profileImageUrl: true,
        // password, email 등 민감 정보 제외
      },
    },
  },
})
```

**_count로 관계 개수 조회**:
```typescript
const apps = await prisma.app.findMany({
  include: {
    _count: {
      select: {
        participations: true,  // 참여자 수
        feedbacks: true,       // 피드백 수
      },
    },
  },
})

// 결과
// { id: 1, appName: 'MyApp', _count: { participations: 15, feedbacks: 10 } }
```

### 5.4 페이지네이션 구현

**skip과 take 사용**:
```typescript
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')

  const where = { status: 'RECRUITING' }

  // 데이터 조회
  const apps = await prisma.app.findMany({
    where,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: 'desc' },
  })

  // 총 개수 조회
  const total = await prisma.app.count({ where })

  return NextResponse.json({
    apps,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  })
}
```

### 5.5 필터링 및 정렬

**동적 where 절 구성**:
```typescript
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const categoryId = searchParams.get('categoryId')
  const search = searchParams.get('search')

  const where: any = {}

  if (status) {
    where.status = status
  }

  if (categoryId) {
    where.categoryId = parseInt(categoryId)
  }

  if (search && search.trim().length > 0) {
    where.appName = {
      contains: search.trim(),
      mode: 'insensitive',  // 대소문자 무시
    }
  }

  const apps = await prisma.app.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ apps })
}
```

**복합 정렬**:
```typescript
const apps = await prisma.app.findMany({
  orderBy: [
    { status: 'asc' },        // 상태 오름차순
    { createdAt: 'desc' },    // 생성일 내림차순
  ],
})
```

---

## 6. 에러 처리

### 6.1 Defense-in-Depth 4계층

**Layer 1: 입력 검증**
```typescript
// 필수 필드, 타입, 형식 검증
if (!appName || typeof appName !== 'string' || appName.trim().length === 0) {
  return NextResponse.json({ error: 'appName is required' }, { status: 400 })
}

if (!/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/.test(packageName)) {
  return NextResponse.json(
    { error: 'Invalid package name format' },
    { status: 400 }
  )
}
```

**Layer 2: 비즈니스 로직 검증**
```typescript
// 중복 확인
const existingApp = await prisma.app.findUnique({
  where: { packageName },
})

if (existingApp) {
  return NextResponse.json(
    { error: 'Package name already exists' },
    { status: 409 }
  )
}

// 상태 전환 검증
if (app.status !== 'RECRUITING') {
  return NextResponse.json(
    { error: 'App is not in recruiting status' },
    { status: 400 }
  )
}
```

**Layer 3: 인증/인가 검증**
```typescript
// 인증 확인
const session = await getSession()
if (!session?.user?.id) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

// 권한 확인
if (app.developerId !== userId) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
```

**Layer 4: 에러 로깅**
```typescript
try {
  // ... API 로직
} catch (error) {
  console.error('POST /api/apps error:', error)
  return NextResponse.json(
    { error: 'Failed to create app' },
    { status: 500 }
  )
}
```

### 6.2 Try-Catch 패턴

**표준 Try-Catch 구조**:
```typescript
export async function POST(request: NextRequest) {
  try {
    // 1. 인증 확인
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. 요청 파싱
    const body = await request.json()

    // 3. 입력 검증
    if (!body.appName) {
      return NextResponse.json({ error: 'appName is required' }, { status: 400 })
    }

    // 4. 비즈니스 로직
    const app = await prisma.app.create({
      data: { /* ... */ },
    })

    return NextResponse.json(app, { status: 201 })
  } catch (error) {
    // 5. 에러 로깅
    console.error('POST /api/apps error:', error)

    // 6. 사용자 친화적 에러 메시지
    return NextResponse.json(
      { error: 'Failed to create app' },
      { status: 500 }
    )
  }
}
```

### 6.3 일관된 에러 응답 형식

**에러 응답 구조**:
```typescript
{
  "error": "Error message here"
}
```

**예시**:
```typescript
// 400 Bad Request
{ "error": "appName is required" }

// 401 Unauthorized
{ "error": "Unauthorized" }

// 403 Forbidden
{ "error": "You can only modify your own apps" }

// 404 Not Found
{ "error": "App not found" }

// 409 Conflict
{ "error": "Package name already exists" }

// 500 Internal Server Error
{ "error": "Failed to create app" }
```

---

## 7. 트랜잭션

### 7.1 Prisma 트랜잭션 사용

**기본 트랜잭션 (Sequential)**:
```typescript
await prisma.$transaction([
  prisma.app.create({ data: { /* ... */ } }),
  prisma.notification.create({ data: { /* ... */ } }),
])
```

**Interactive Transaction (권장)**:
```typescript
const result = await prisma.$transaction(async (tx) => {
  // 1. 참여 정보 조회
  const participation = await tx.participation.findUnique({
    where: { id: participationId },
    include: { app: true },
  })

  if (!participation) {
    return { error: 'Participation not found', status: 404 }
  }

  // 2. 피드백 생성
  const feedback = await tx.feedback.create({
    data: {
      appId: participation.appId,
      testerId: userId,
      participationId: participation.id,
      overallRating,
      comment,
    },
  })

  // 3. 리워드 지급 (조건부)
  if (participation.app.rewardAmount > 0) {
    await tx.rewardHistory.create({
      data: {
        userId,
        appId: participation.appId,
        type: 'EARNED',
        amount: participation.app.rewardAmount,
      },
    })

    await tx.user.update({
      where: { id: userId },
      data: {
        pointBalance: { increment: participation.app.rewardAmount },
      },
    })
  }

  return { data: feedback, status: 201 }
})

// 트랜잭션 결과 처리
if ('error' in result) {
  return NextResponse.json(
    { error: result.error },
    { status: result.status }
  )
}

return NextResponse.json(result.data, { status: 201 })
```

### 7.2 원자성 보장

**원자성 (Atomicity)**: 모든 작업이 성공하거나 모두 실패

**사용 예시**:
- 피드백 생성 + 리워드 지급
- 앱 승인 + 알림 생성
- 지원서 승인 + 참여 레코드 생성

```typescript
// 실제 예시: 피드백 생성 시 리워드 자동 지급
const result = await prisma.$transaction(async (tx) => {
  // 피드백 생성
  const feedback = await tx.feedback.create({ /* ... */ })

  // 리워드 지급
  const rewardAmount = 5000
  await tx.rewardHistory.create({
    data: {
      userId,
      type: 'EARNED',
      amount: rewardAmount,
    },
  })

  await tx.user.update({
    where: { id: userId },
    data: {
      pointBalance: { increment: rewardAmount },
    },
  })

  return { data: feedback, status: 201 }
})
```

### 7.3 실제 예제: 리워드 지급

```typescript
// POST /api/feedbacks - 피드백 생성 시 리워드 자동 지급
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = parseInt(session.user.id)
    const body = await request.json()
    const { participationId, overallRating, comment } = body

    // Layer 1: Input validation
    if (!participationId) {
      return NextResponse.json(
        { error: 'participationId is required' },
        { status: 400 }
      )
    }

    if (
      typeof overallRating !== 'number' ||
      overallRating < 1 ||
      overallRating > 5
    ) {
      return NextResponse.json(
        { error: 'overallRating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Transaction: Feedback + Reward
    const result = await prisma.$transaction(async (tx) => {
      // Fetch participation with app info
      const participation = await tx.participation.findUnique({
        where: { id: participationId },
        include: {
          feedback: true,
          app: {
            select: {
              id: true,
              testType: true,
              rewardAmount: true,
            },
          },
        },
      })

      if (!participation) {
        return { error: 'Participation not found', status: 404 }
      }

      // Layer 2: Authorization
      if (participation.testerId !== userId) {
        return { error: 'Forbidden', status: 403 }
      }

      // Layer 2: Business rule - no duplicate feedback
      if (participation.feedback) {
        return {
          error: 'Feedback already submitted',
          status: 409,
        }
      }

      // Create feedback
      const feedback = await tx.feedback.create({
        data: {
          appId: participation.appId,
          testerId: userId,
          participationId: participation.id,
          overallRating,
          comment: comment || null,
        },
      })

      // Auto-payout reward if applicable
      const isPaidReward =
        participation.app.testType === 'PAID_REWARD' &&
        participation.app.rewardAmount &&
        participation.app.rewardAmount > 0

      if (isPaidReward) {
        const user = await tx.user.findUnique({
          where: { id: userId },
          select: { pointBalance: true },
        })

        const rewardAmount = participation.app.rewardAmount!
        const newBalance = (user?.pointBalance || 0) + rewardAmount

        // Create reward history
        await tx.rewardHistory.create({
          data: {
            userId,
            appId: participation.appId,
            type: 'EARNED',
            amount: rewardAmount,
            balance: newBalance,
            description: `Feedback reward for app #${participation.appId}`,
          },
        })

        // Update user balance
        await tx.user.update({
          where: { id: userId },
          data: {
            pointBalance: { increment: rewardAmount },
          },
        })

        // Update participation reward status
        await tx.participation.update({
          where: { id: participation.id },
          data: {
            rewardStatus: 'PAID',
          },
        })
      } else {
        await tx.participation.update({
          where: { id: participation.id },
          data: {
            rewardStatus: 'SKIPPED',
          },
        })
      }

      return { data: feedback, status: 201 }
    })

    // Handle transaction result
    if ('error' in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      )
    }

    return NextResponse.json(result.data, { status: 201 })
  } catch (error) {
    console.error('POST /api/feedbacks error:', error)
    return NextResponse.json(
      { error: 'Failed to create feedback' },
      { status: 500 }
    )
  }
}
```

---

## 8. TDD 적용

### 8.1 RED-GREEN-REFACTOR

**1. 🔴 RED: 실패하는 테스트 작성**
```typescript
// src/app/api/feedbacks/route.test.ts
describe('POST /api/feedbacks', () => {
  it('should create feedback successfully', async () => {
    const mockSession = {
      user: { id: '1', email: 'tester@example.com' },
    }
    ;(getSession as jest.Mock).mockResolvedValue(mockSession)

    const mockParticipation = {
      id: 1,
      appId: 1,
      testerId: 1,
      status: 'COMPLETED',
      feedback: null,
      app: {
        id: 1,
        testType: 'PAID_REWARD',
        rewardAmount: 5000,
      },
    }

    const mockFeedback = {
      id: 1,
      participationId: 1,
      appId: 1,
      testerId: 1,
      overallRating: 5,
      comment: 'Great app!',
    }

    ;(prisma.$transaction as jest.Mock).mockResolvedValue({
      data: mockFeedback,
      status: 201,
    })

    const response = await POST(
      new NextRequest('http://localhost/api/feedbacks', {
        method: 'POST',
        body: JSON.stringify({
          participationId: 1,
          overallRating: 5,
          comment: 'Great app!',
        }),
      })
    )

    expect(response.status).toBe(201)
    const data = await response.json()
    expect(data.id).toBe(1)
    expect(data.overallRating).toBe(5)
  })
})
```

**2. 🟢 GREEN: 테스트를 통과하는 최소 코드 작성**
```typescript
export async function POST(request: NextRequest) {
  // 최소 구현으로 테스트 통과
  const body = await request.json()
  const feedback = await prisma.feedback.create({
    data: {
      participationId: body.participationId,
      overallRating: body.overallRating,
      comment: body.comment,
    },
  })
  return NextResponse.json(feedback, { status: 201 })
}
```

**3. 🔵 REFACTOR: 코드 개선 (테스트 유지)**
```typescript
export async function POST(request: NextRequest) {
  try {
    // 인증, 검증, 트랜잭션 로직 추가
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ... (완전한 구현)
  } catch (error) {
    console.error('POST /api/feedbacks error:', error)
    return NextResponse.json(
      { error: 'Failed to create feedback' },
      { status: 500 }
    )
  }
}
```

### 8.2 API 테스트 작성법

**Jest + Prisma Mock 사용**:
```typescript
// src/app/api/apps/route.test.ts
import { NextRequest } from 'next/server'
import { POST, GET } from './route'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

jest.mock('@/lib/prisma', () => ({
  prisma: {
    app: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
    },
    category: {
      findUnique: jest.fn(),
    },
  },
}))

jest.mock('@/lib/auth', () => ({
  getSession: jest.fn(),
}))

describe('POST /api/apps', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create app successfully', async () => {
    const mockSession = {
      user: { id: '1', email: 'dev@example.com' },
    }
    ;(getSession as jest.Mock).mockResolvedValue(mockSession)

    const mockCategory = {
      id: 1,
      name: 'Utility',
    }
    ;(prisma.category.findUnique as jest.Mock).mockResolvedValue(mockCategory)

    const mockApp = {
      id: 1,
      appName: 'MyApp',
      packageName: 'com.example.myapp',
      status: 'PENDING_APPROVAL',
    }
    ;(prisma.app.create as jest.Mock).mockResolvedValue(mockApp)

    const request = new NextRequest('http://localhost/api/apps', {
      method: 'POST',
      body: JSON.stringify({
        appName: 'MyApp',
        packageName: 'com.example.myapp',
        categoryId: 1,
        description: 'My awesome app',
        testType: 'PAID_REWARD',
        targetTesters: 20,
        testLink: 'https://example.com/test',
      }),
    })

    const response = await POST(request)

    expect(response.status).toBe(201)
    const data = await response.json()
    expect(data.id).toBe(1)
    expect(data.status).toBe('PENDING_APPROVAL')
  })

  it('should return 400 if appName is missing', async () => {
    const mockSession = {
      user: { id: '1', email: 'dev@example.com' },
    }
    ;(getSession as jest.Mock).mockResolvedValue(mockSession)

    const request = new NextRequest('http://localhost/api/apps', {
      method: 'POST',
      body: JSON.stringify({
        packageName: 'com.example.myapp',
        categoryId: 1,
      }),
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('appName is required')
  })

  it('should return 409 if package name already exists', async () => {
    const mockSession = {
      user: { id: '1', email: 'dev@example.com' },
    }
    ;(getSession as jest.Mock).mockResolvedValue(mockSession)

    const mockExistingApp = {
      id: 2,
      packageName: 'com.example.myapp',
    }
    ;(prisma.app.findUnique as jest.Mock).mockResolvedValue(mockExistingApp)

    const request = new NextRequest('http://localhost/api/apps', {
      method: 'POST',
      body: JSON.stringify({
        appName: 'MyApp',
        packageName: 'com.example.myapp',
        categoryId: 1,
        description: 'My awesome app',
        testType: 'PAID_REWARD',
        targetTesters: 20,
        testLink: 'https://example.com/test',
      }),
    })

    const response = await POST(request)

    expect(response.status).toBe(409)
    const data = await response.json()
    expect(data.error).toBe('Package name already exists')
  })
})
```

### 8.3 Mock 사용

**Prisma Mock**:
```typescript
jest.mock('@/lib/prisma', () => ({
  prisma: {
    app: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}))
```

**NextAuth Mock**:
```typescript
jest.mock('@/lib/auth', () => ({
  getSession: jest.fn(),
}))

// 테스트에서 사용
;(getSession as jest.Mock).mockResolvedValue({
  user: { id: '1', email: 'user@example.com' },
})
```

---

## 9. 성능 최적화

### 9.1 N+1 문제 해결

**❌ Bad (N+1 문제 발생)**:
```typescript
const apps = await prisma.app.findMany()

// 각 앱마다 개발자 정보를 개별 조회 (N+1)
for (const app of apps) {
  const developer = await prisma.user.findUnique({
    where: { id: app.developerId },
  })
  // ...
}
```

**✅ Good (include로 한 번에 조회)**:
```typescript
const apps = await prisma.app.findMany({
  include: {
    developer: {
      select: {
        id: true,
        nickname: true,
        profileImageUrl: true,
      },
    },
  },
})
```

### 9.2 필요한 필드만 select

**❌ Bad (모든 필드 조회)**:
```typescript
const users = await prisma.user.findMany()
// { id, email, password, name, role, createdAt, updatedAt, ... }
```

**✅ Good (필요한 필드만 조회)**:
```typescript
const users = await prisma.user.findMany({
  select: {
    id: true,
    nickname: true,
    profileImageUrl: true,
    // password, email 등 민감 정보 제외
  },
})
```

### 9.3 캐싱 전략

**In-Memory 캐시 (카테고리)**:
```typescript
// src/app/api/categories/route.ts
const cache = { data: null as any, timestamp: 0 }
const CACHE_TTL = 5 * 60 * 1000 // 5분

export async function GET() {
  try {
    const now = Date.now()

    // 캐시 유효성 확인
    if (cache.data && now - cache.timestamp < CACHE_TTL) {
      return NextResponse.json(cache.data, {
        headers: {
          'Cache-Control': 'public, max-age=300',
        },
      })
    }

    // 캐시 미스 시 DB 조회
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    })

    // 캐시 업데이트
    cache.data = categories
    cache.timestamp = now

    return NextResponse.json(categories, {
      headers: {
        'Cache-Control': 'public, max-age=300',
      },
    })
  } catch (error) {
    console.error('GET /api/categories error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

// 캐시 리셋 함수 (테스트용)
export function resetCategoryCache() {
  cache.data = null
  cache.timestamp = 0
}
```

### 9.4 인덱스 활용

**Prisma Schema 인덱스 정의**:
```prisma
model App {
  id             Int      @id @default(autoincrement())
  packageName    String   @unique  // 유니크 인덱스
  status         String
  categoryId     Int
  developerId    Int

  @@index([status])           // 단일 인덱스
  @@index([categoryId])
  @@index([developerId])
  @@index([status, categoryId])  // 복합 인덱스
}
```

**인덱스 활용 쿼리**:
```typescript
// status 인덱스 활용
const apps = await prisma.app.findMany({
  where: { status: 'RECRUITING' },
})

// 복합 인덱스 활용
const apps = await prisma.app.findMany({
  where: {
    status: 'RECRUITING',
    categoryId: 1,
  },
})
```

### 9.5 페이지네이션 기본값

**기본 limit 설정**:
```typescript
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = Math.min(
    parseInt(searchParams.get('limit') || '20'),
    100  // 최대 100개로 제한
  )

  const apps = await prisma.app.findMany({
    skip: (page - 1) * limit,
    take: limit,
  })

  // ...
}
```

---

## 10. Phase 5 API 100% 통과 사례

### 10.1 Feedbacks API (28/28 통과)

**구현 포인트**:
- ✅ Layer 1: 입력 검증 (participationId, overallRating 필수)
- ✅ Layer 2: 비즈니스 로직 (중복 피드백 방지, 참여 상태 확인)
- ✅ Layer 3: 인증/인가 (본인 참여만 피드백 작성 가능)
- ✅ Layer 4: 트랜잭션 (피드백 생성 + 리워드 자동 지급)

**핵심 코드**:
```typescript
// POST /api/feedbacks
const result = await prisma.$transaction(async (tx) => {
  const participation = await tx.participation.findUnique({
    where: { id: participationId },
    include: { feedback: true, app: true },
  })

  if (!participation) {
    return { error: 'Participation not found', status: 404 }
  }

  if (participation.testerId !== userId) {
    return { error: 'Forbidden', status: 403 }
  }

  if (participation.feedback) {
    return { error: 'Feedback already submitted', status: 409 }
  }

  const feedback = await tx.feedback.create({ data: { /* ... */ } })

  // Auto-payout reward
  if (participation.app.rewardAmount > 0) {
    await tx.rewardHistory.create({ /* ... */ })
    await tx.user.update({ /* ... */ })
  }

  return { data: feedback, status: 201 }
})
```

### 10.2 Feedback Ratings API (21/21 통과)

**구현 포인트**:
- ✅ 벌크 생성 (배열로 여러 별점 한 번에 생성)
- ✅ 중복 ratingType 방지
- ✅ 평균 점수 자동 계산
- ✅ 트랜잭션 처리

**핵심 코드**:
```typescript
// POST /api/feedback-ratings
const ratings = await prisma.$transaction(
  body.ratings.map((rating: any) =>
    prisma.feedbackRating.create({
      data: {
        feedbackId: body.feedbackId,
        ratingType: rating.ratingType,
        score: rating.score,
      },
    })
  )
)

const average = ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length
return NextResponse.json({ ratings, average }, { status: 201 })
```

### 10.3 Bug Reports API (17/17 통과)

**구현 포인트**:
- ✅ 1:1 관계 (feedbackId unique)
- ✅ 이미지 업로드 처리 (BugReportImage 관계)
- ✅ 선택 필드 처리 (deviceInfo, screenshotUrl)

### 10.4 Rewards API (20/20 통과)

**구현 포인트**:
- ✅ 타입별 잔액 증감 (EARNED → 증가, WITHDRAWN → 감소)
- ✅ 잔액 부족 검증
- ✅ 트랜잭션 (RewardHistory + User balance 업데이트)

---

## 11. 체크리스트

### 11.1 API 작성 전 체크리스트

- [ ] API 명세 확인 (docs/planning/03-api-spec.md)
- [ ] 데이터 모델 확인 (prisma/schema.prisma)
- [ ] 유사 API 구현 참고
- [ ] TAG 시스템 적용 (@TASK, @SPEC)

### 11.2 API 작성 중 체크리스트

- [ ] 인증 검증 (getSession)
- [ ] 입력 검증 (필수 필드, 타입, 형식)
- [ ] 비즈니스 로직 검증 (중복, 권한, 상태)
- [ ] 적절한 HTTP 상태 코드 사용
- [ ] 일관된 에러 메시지
- [ ] 트랜잭션 사용 (여러 DB 작업 시)
- [ ] Try-Catch 에러 처리
- [ ] 성능 최적화 (include, select, 페이지네이션)

### 11.3 API 작성 후 체크리스트

- [ ] 테스트 작성 (route.test.ts)
- [ ] 모든 테스트 통과 (jest --coverage)
- [ ] 보안 검증 (Defense-in-Depth 4계층)
- [ ] API 문서 업데이트 (필요 시)
- [ ] Lessons Learned 기록 (삽질한 경우)

---

**작성일**: 2026-03-01
**작성자**: Claude Code
**관련 문서**:
- [API 명세](../planning/03-api-spec.md)
- [API 테스트 문서](../TESTING_API.md)
- [프론트엔드 개발 가이드](./01-frontend-guide.md)
