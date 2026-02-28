# TestBridge 테스트 가이드

**프로젝트**: TestBridge
**문서 목적**: 테스트 환경 설정 및 실행 방법 안내
**작성일**: 2026-03-01

---

## 목차

1. [테스트 환경 설정](#1-테스트-환경-설정)
2. [테스트 실행 방법](#2-테스트-실행-방법)
3. [테스트 종류](#3-테스트-종류)
4. [테스트 작성 가이드](#4-테스트-작성-가이드)
5. [CI/CD 설정](#5-cicd-설정)
6. [트러블슈팅](#6-트러블슈팅)

---

## 1. 테스트 환경 설정

### 1.1 사전 요구사항

| 항목 | 버전 | 확인 명령어 |
|------|------|------------|
| Node.js | 18.x 이상 | `node --version` |
| npm | 9.x 이상 | `npm --version` |
| PostgreSQL | 16.x | `psql --version` |

### 1.2 초기 설정

```bash
# 1. 저장소 클론
git clone <repository-url>
cd testers

# 2. 의존성 설치
npm install

# 3. 환경 변수 설정
cp .env.example .env
```

### 1.3 환경 변수 (.env)

테스트 실행에 필요한 최소 환경 변수:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/testbridge_test"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-for-testing"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (테스트용)
GOOGLE_CLIENT_ID="test-client-id"
GOOGLE_CLIENT_SECRET="test-client-secret"
```

**주의**: 테스트는 별도의 테스트 데이터베이스(`testbridge_test`)를 사용하는 것을 권장합니다.

### 1.4 데이터베이스 설정

```bash
# 테스트 DB 생성
createdb testbridge_test

# Prisma 마이그레이션
npx prisma migrate dev --name init

# (선택) 테스트 데이터 시드
npx prisma db seed
```

---

## 2. 테스트 실행 방법

### 2.1 기본 명령어

```bash
# 전체 테스트 실행
npm test

# 특정 파일 테스트
npm test -- path/to/test.test.ts

# 특정 패턴 매칭
npm test -- --testPathPattern="api/apps"

# Watch 모드 (파일 변경 시 자동 재실행)
npm run test:watch

# 커버리지 리포트 생성
npm run test:coverage
```

### 2.2 테스트 필터링

```bash
# API 테스트만 실행
npm test -- --testPathPattern="api"

# Frontend 테스트만 실행
npm test -- --testPathPattern="(components|app/.*page)"

# 특정 Phase 테스트
npm test -- --testPathPattern="(feedbacks|rewards|tester)"

# 실패한 테스트만 재실행
npm test -- --onlyFailures
```

### 2.3 E2E 테스트 (Playwright)

```bash
# Playwright 브라우저 설치 (최초 1회)
npx playwright install

# E2E 테스트 실행
npm run test:e2e

# 특정 E2E 테스트
npx playwright test e2e/login.spec.ts

# UI 모드 (디버깅용)
npx playwright test --ui

# 헤드풀 모드 (브라우저 표시)
npx playwright test --headed
```

---

## 3. 테스트 종류

### 3.1 단위 테스트 (Unit Tests)

**위치**: `src/**/*.test.ts(x)`
**도구**: Jest + React Testing Library
**목적**: 개별 함수, 컴포넌트, API 핸들러 테스트

**예시**:
```bash
# API 핸들러 테스트
npm test -- api/apps/route.test.ts

# 컴포넌트 테스트
npm test -- components/layout/Header.test.tsx
```

**작성 예시** (API):
```typescript
// src/app/api/apps/route.test.ts
import { GET } from './route'

describe('GET /api/apps', () => {
  it('should return apps list', async () => {
    const request = new Request('http://localhost/api/apps')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(Array.isArray(data)).toBe(true)
  })
})
```

### 3.2 통합 테스트 (Integration Tests)

**위치**: `src/__tests__/integration/*.test.tsx`
**목적**: 여러 컴포넌트/API 간 연동 테스트

**예시**:
```bash
# 로그인 플로우 통합 테스트
npm test -- __tests__/integration/login-flow.test.tsx
```

### 3.3 E2E 테스트 (End-to-End Tests)

**위치**: `e2e/*.spec.ts`
**도구**: Playwright
**목적**: 실제 사용자 시나리오 테스트

**예시**:
```bash
# 개발자 플로우 E2E
npx playwright test e2e/developer-flow.spec.ts

# 테스터 플로우 E2E
npx playwright test e2e/tester-flow.spec.ts
```

---

## 4. 테스트 작성 가이드

### 4.1 TDD 사이클 (Phase 4-5 적용)

```
1. RED: 테스트 먼저 작성 (실패 확인)
2. GREEN: 최소한의 구현 (테스트 통과)
3. REFACTOR: 코드 개선 (테스트 유지)
```

**예시**:
```typescript
// 1. RED: 테스트 작성 (실패)
describe('POST /api/feedbacks', () => {
  it('should create feedback', async () => {
    const response = await POST(request)
    expect(response.status).toBe(201)
  })
})

// 2. GREEN: 최소 구현
export async function POST(req: Request) {
  // ... 최소한의 로직
  return NextResponse.json({}, { status: 201 })
}

// 3. REFACTOR: 개선
export async function POST(req: Request) {
  const body = await req.json()
  const feedback = await prisma.feedback.create({ data: body })
  return NextResponse.json(feedback, { status: 201 })
}
```

### 4.2 테스트 네이밍 컨벤션

```typescript
// ✅ 좋은 예
describe('GET /api/apps', () => {
  it('should return apps list with default pagination', () => {})
  it('should filter apps by status', () => {})
  it('should return 400 when invalid status', () => {})
})

// ❌ 나쁜 예
describe('Apps API', () => {
  it('test 1', () => {})
  it('works', () => {})
})
```

### 4.3 Mocking

#### Prisma Mock
```typescript
import { mockPrisma } from '@/lib/prisma'

jest.mock('@/lib/prisma', () => ({
  prisma: {
    app: {
      findMany: jest.fn(),
      create: jest.fn(),
    }
  }
}))

it('should create app', async () => {
  mockPrisma.app.create.mockResolvedValue({ id: 1, name: 'Test App' })
  // ... test logic
})
```

#### NextAuth Session Mock
```typescript
import { getServerSession } from 'next-auth'

jest.mock('next-auth', () => ({
  getServerSession: jest.fn()
}))

it('should return 401 when not authenticated', async () => {
  (getServerSession as jest.Mock).mockResolvedValue(null)
  // ... test logic
})
```

### 4.4 React Testing Library

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

describe('Tester Home', () => {
  it('should filter apps by category', async () => {
    render(<TesterHome />)

    const categoryFilter = screen.getByLabelText(/카테고리/)
    await userEvent.selectOptions(categoryFilter, '게임')

    await waitFor(() => {
      expect(screen.getByText('게임 앱 1')).toBeInTheDocument()
    })
  })
})
```

---

## 5. CI/CD 설정

### 5.1 GitHub Actions (예시)

`.github/workflows/test.yml`:

```yaml
name: Test

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: testbridge_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run Prisma migration
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/testbridge_test

      - name: Run tests
        run: npm test -- --coverage
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/testbridge_test
          NEXTAUTH_SECRET: test-secret
          NEXTAUTH_URL: http://localhost:3000

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

### 5.2 Pre-commit Hook (Husky)

```bash
# Husky 설치
npm install --save-dev husky

# Git hooks 활성화
npx husky install

# Pre-commit hook 추가
npx husky add .husky/pre-commit "npm test -- --bail"
```

---

## 6. 트러블슈팅

### 6.1 자주 발생하는 오류

#### 오류 1: "Cannot find module '@/lib/prisma'"
```bash
# 해결: tsconfig.json 경로 확인
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

#### 오류 2: "Database connection failed"
```bash
# 해결: PostgreSQL 실행 확인
brew services start postgresql@16  # macOS
sudo systemctl start postgresql    # Linux

# DATABASE_URL 확인
echo $DATABASE_URL
```

#### 오류 3: "Module not found: next-auth"
```bash
# 해결: transformIgnorePatterns 확인 (jest.config.js)
transformIgnorePatterns: [
  'node_modules/(?!(next-auth|@next-auth)/)'
]
```

#### 오류 4: "Test timeout exceeded"
```bash
# 해결: 개별 테스트 타임아웃 증가
it('slow test', async () => {
  // ... test logic
}, 10000) // 10초
```

### 6.2 테스트 격리 문제

```typescript
// 각 테스트 전후 정리
beforeEach(() => {
  jest.clearAllMocks()
})

afterEach(() => {
  jest.restoreAllMocks()
})

// 전역 fetch mock 리셋
global.fetch = jest.fn()
afterEach(() => {
  (global.fetch as jest.Mock).mockClear()
})
```

### 6.3 비동기 테스트 디버깅

```typescript
// waitFor 사용
await waitFor(() => {
  expect(screen.getByText('Success')).toBeInTheDocument()
}, { timeout: 5000 })

// act 경고 해결
await act(async () => {
  fireEvent.click(button)
})
```

---

## 7. 테스트 커버리지 목표

### 7.1 현재 커버리지

| 카테고리 | 목표 | 현재 | 상태 |
|---------|------|------|------|
| 전체 | 80% | 89.8% | ✅ |
| Backend API | 90% | 95%+ | ✅ |
| Frontend | 70% | 85% | ✅ |
| E2E | 핵심 플로우 | 일부 | ⚠️ |

### 7.2 커버리지 확인

```bash
# 커버리지 리포트 생성
npm run test:coverage

# 리포트 확인
open coverage/lcov-report/index.html
```

**출력 예시**:
```
--------------------------|---------|----------|---------|---------|
File                      | % Stmts | % Branch | % Funcs | % Lines |
--------------------------|---------|----------|---------|---------|
All files                 |   89.8  |   85.2   |   87.4  |   90.1  |
 src/app/api/apps         |   95.2  |   92.1   |   94.3  |   96.0  |
 src/app/api/feedbacks    |   98.5  |   96.8   |   97.2  |   99.1  |
 src/components/layout    |   82.3  |   78.5   |   80.1  |   83.2  |
--------------------------|---------|----------|---------|---------|
```

---

## 8. 베스트 프랙티스

### 8.1 DO ✅

1. **테스트는 독립적으로 작성**
   - 다른 테스트에 의존하지 않음
   - 실행 순서에 무관하게 통과

2. **명확한 테스트 이름**
   - "should return 200" ❌
   - "should return apps list with pagination when valid request" ✅

3. **AAA 패턴 사용**
   ```typescript
   it('should create feedback', async () => {
     // Arrange
     const request = createMockRequest()

     // Act
     const response = await POST(request)

     // Assert
     expect(response.status).toBe(201)
   })
   ```

4. **Edge case 테스트**
   - 빈 배열, null, undefined
   - 경계값 (0, 1, MAX_INT)
   - 에러 케이스

### 8.2 DON'T ❌

1. **테스트 간 의존성**
   ```typescript
   // ❌ 나쁜 예
   let userId;
   it('should create user', () => {
     userId = createUser()
   })
   it('should get user', () => {
     getUser(userId) // 이전 테스트에 의존
   })
   ```

2. **하드코딩된 데이터**
   ```typescript
   // ❌ 나쁜 예
   expect(users.length).toBe(5) // 데이터에 의존

   // ✅ 좋은 예
   expect(users.length).toBeGreaterThan(0)
   ```

3. **테스트 코드 중복**
   - `beforeEach`, `afterEach` 활용
   - 헬퍼 함수 작성

---

## 9. 참고 자료

### 9.1 공식 문서
- [Jest](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright](https://playwright.dev/)
- [Next.js Testing](https://nextjs.org/docs/app/building-your-application/testing)

### 9.2 내부 문서
- [FEATURES.md](./FEATURES.md) - 기능 목록
- [TESTING_API.md](./TESTING_API.md) - API 테스트 항목 (다음)
- [TESTING_FRONTEND.md](./TESTING_FRONTEND.md) - Frontend 테스트 항목
- [TESTING_SUMMARY.md](./TESTING_SUMMARY.md) - 테스트 결과 요약

---

**작성일**: 2026-03-01
**작성자**: Claude Code
**다음 문서**: [TESTING_API.md](./TESTING_API.md)
