# Coding Convention

**프로젝트명**: TestBridge
**버전**: v1.0
**작성일**: 2026-02-28

---

## 목차

1. [프로젝트 구조](#1-프로젝트-구조)
2. [TypeScript 코딩 스타일](#2-typescript-코딩-스타일)
3. [React 컴포넌트 작성 규칙](#3-react-컴포넌트-작성-규칙)
4. [API 작성 규칙](#4-api-작성-규칙)
5. [데이터베이스 작성 규칙](#5-데이터베이스-작성-규칙)
6. [Git 커밋 메시지](#6-git-커밋-메시지)
7. [테스트 작성 규칙](#7-테스트-작성-규칙)
8. [주석 및 문서화](#8-주석-및-문서화)

---

## 1. 프로젝트 구조

### 1.1 폴더 구조

```
testbridge/
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── (auth)/           # 인증 그룹
│   │   ├── developer/        # 개발자 페이지
│   │   ├── tester/           # 테스터 페이지
│   │   ├── admin/            # 관리자 페이지
│   │   └── api/              # API Routes
│   ├── components/           # 재사용 컴포넌트
│   │   ├── ui/               # 기본 UI 컴포넌트
│   │   ├── developer/        # 개발자 전용 컴포넌트
│   │   ├── tester/           # 테스터 전용 컴포넌트
│   │   └── common/           # 공통 컴포넌트
│   ├── lib/                  # 유틸리티, 헬퍼
│   │   ├── prisma.ts         # Prisma 클라이언트
│   │   ├── auth.ts           # NextAuth 설정
│   │   ├── utils.ts          # 공통 유틸
│   │   └── constants.ts      # 상수
│   ├── hooks/                # Custom React Hooks
│   ├── types/                # TypeScript 타입 정의
│   ├── styles/               # 글로벌 스타일
│   └── middleware.ts         # Next.js 미들웨어
├── prisma/
│   ├── schema.prisma         # Prisma 스키마
│   └── migrations/           # 마이그레이션
├── public/                   # 정적 파일
├── docs/                     # 기획 문서
└── tests/                    # 테스트 파일
```

### 1.2 파일 네이밍

```
components/ui/Button.tsx         (PascalCase)
lib/utils/formatDate.ts          (camelCase)
app/api/developer/apps/route.ts  (kebab-case for routes)
types/app.types.ts               (camelCase + .types.ts)
hooks/useApps.ts                 (camelCase, use- prefix)
```

---

## 2. TypeScript 코딩 스타일

### 2.1 변수 및 함수

```typescript
// ✅ Good: camelCase
const userId = 1;
function getUserById(id: number) {}

// ❌ Bad: snake_case, PascalCase
const user_id = 1;
function GetUserById(id: number) {}
```

### 2.2 타입 및 인터페이스

```typescript
// ✅ Good: PascalCase, Interface prefix 사용 안 함
interface User {
  id: number;
  name: string;
}

type UserRole = 'DEVELOPER' | 'TESTER' | 'BOTH' | 'ADMIN';

// ❌ Bad: IUser prefix
interface IUser {
  id: number;
}
```

### 2.3 Enum

```typescript
// ✅ Good: PascalCase
enum AppStatus {
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  RECRUITING = 'RECRUITING',
  IN_TESTING = 'IN_TESTING',
  COMPLETED = 'COMPLETED',
}

// Const enum (더 권장)
const enum Role {
  DEVELOPER = 'DEVELOPER',
  TESTER = 'TESTER',
}
```

### 2.4 타입 정의 위치

```typescript
// src/types/app.types.ts
export interface App {
  id: number;
  appName: string;
  status: AppStatus;
  developer: User;
}

// src/types/api.types.ts
export interface ApiResponse<T> {
  data: T;
  meta?: Pagination;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}
```

### 2.5 Optional vs Null

```typescript
// ✅ Good: Optional (?)로 표현
interface User {
  id: number;
  nickname?: string;  // undefined 가능
}

// ❌ Bad: null 사용 지양
interface User {
  id: number;
  nickname: string | null;
}
```

---

## 3. React 컴포넌트 작성 규칙

### 3.1 함수 컴포넌트 (Function Component)

```typescript
// ✅ Good: Arrow function
interface Props {
  appId: number;
  onApprove: () => void;
}

export const AppCard = ({ appId, onApprove }: Props) => {
  return <div>...</div>;
};

// ❌ Bad: function 키워드
export function AppCard({ appId, onApprove }: Props) {
  return <div>...</div>;
}
```

### 3.2 Props 타입 정의

```typescript
// ✅ Good: Interface 사용
interface ButtonProps {
  variant: 'primary' | 'secondary';
  onClick: () => void;
  children: React.ReactNode;
}

export const Button = ({ variant, onClick, children }: ButtonProps) => {
  return <button onClick={onClick}>{children}</button>;
};
```

### 3.3 State 관리

```typescript
// ✅ Good: useState 명확한 타입
const [apps, setApps] = useState<App[]>([]);
const [loading, setLoading] = useState<boolean>(false);

// ❌ Bad: 타입 추론에만 의존
const [apps, setApps] = useState([]);
```

### 3.4 useEffect

```typescript
// ✅ Good: 의존성 배열 명시
useEffect(() => {
  fetchApps();
}, [appId]); // appId 변경 시에만 실행

// ❌ Bad: 빈 의존성 배열 남용
useEffect(() => {
  fetchApps(appId); // appId를 사용하지만 의존성 배열에 없음
}, []);
```

### 3.5 조건부 렌더링

```typescript
// ✅ Good: 명확한 조건
{isLoading && <Spinner />}
{error && <ErrorMessage message={error} />}
{apps.length > 0 ? <AppList apps={apps} /> : <EmptyState />}

// ❌ Bad: 복잡한 조건
{isLoading ? <Spinner /> : error ? <ErrorMessage /> : apps.length > 0 ? <AppList /> : <EmptyState />}
```

---

## 4. API 작성 규칙

### 4.1 API Route 구조

```typescript
// app/api/developer/apps/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // 1. 인증 확인
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { error: { code: 'AUTH-001', message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    // 2. 파라미터 파싱
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // 3. 비즈니스 로직
    const apps = await prisma.app.findMany({
      where: { developerId: session.user.id },
      skip: (page - 1) * limit,
      take: limit,
    });

    // 4. 응답
    return NextResponse.json({
      data: apps,
      meta: { page, limit },
    });
  } catch (error) {
    console.error('GET /api/developer/apps error:', error);
    return NextResponse.json(
      { error: { code: 'RES-003', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
```

### 4.2 에러 처리

```typescript
// lib/errors.ts

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const errorResponse = (error: unknown) => {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: { code: error.code, message: error.message } },
      { status: error.statusCode }
    );
  }
  
  return NextResponse.json(
    { error: { code: 'UNKNOWN', message: 'Internal server error' } },
    { status: 500 }
  );
};
```

### 4.3 유효성 검증

```typescript
// lib/validation.ts (Zod 사용)

import { z } from 'zod';

export const AppCreateSchema = z.object({
  appName: z.string().min(1).max(50),
  packageName: z.string().regex(/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)*$/),
  categoryId: z.number().int().positive(),
  rewardAmount: z.number().int().min(1000).max(8000).optional(),
});

// API에서 사용
const body = await req.json();
const validatedData = AppCreateSchema.parse(body);
```

---

## 5. 데이터베이스 작성 규칙

### 5.1 Prisma 쿼리

```typescript
// ✅ Good: Select로 필요한 필드만 조회
const apps = await prisma.app.findMany({
  select: {
    id: true,
    appName: true,
    status: true,
    developer: {
      select: {
        nickname: true,
      },
    },
  },
});

// ❌ Bad: 모든 필드 조회 (N+1 문제)
const apps = await prisma.app.findMany({
  include: {
    developer: true,
  },
});
```

### 5.2 트랜잭션

```typescript
// ✅ Good: 트랜잭션으로 원자성 보장
await prisma.$transaction(async (tx) => {
  // 1. 포인트 차감
  await tx.user.update({
    where: { id: userId },
    data: { pointBalance: { decrement: amount } },
  });

  // 2. 출금 요청 생성
  await tx.withdrawal.create({
    data: { testerId: userId, amount, status: 'REQUESTED' },
  });
});
```

### 5.3 소프트 삭제

```typescript
// ✅ Good: deletedAt 사용
await prisma.app.update({
  where: { id: appId },
  data: { deletedAt: new Date() },
});

// 조회 시 deletedAt IS NULL 조건
const apps = await prisma.app.findMany({
  where: { deletedAt: null },
});

// ❌ Bad: 실제 DELETE
await prisma.app.delete({ where: { id: appId } });
```

---

## 6. Git 커밋 메시지

### 6.1 커밋 메시지 형식

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type**:
- `feat`: 새로운 기능
- `fix`: 버그 수정
- `docs`: 문서 수정
- `style`: 코드 포맷팅 (기능 변경 없음)
- `refactor`: 코드 리팩토링
- `test`: 테스트 추가/수정
- `chore`: 빌드, 설정 변경

**Scope**: `auth`, `developer`, `tester`, `admin`, `api`, `ui`

**예시**:
```
feat(developer): 앱 등록 4단계 폼 구현

- Step 1: 기본 정보 입력
- Step 2: 테스트 설정
- Step 3: 리워드 설정
- Step 4: 피드백 설정

Closes #123
```

---

## 7. 테스트 작성 규칙

### 7.1 단위 테스트 (Jest)

```typescript
// __tests__/lib/utils/formatDate.test.ts

import { formatDate } from '@/lib/utils/formatDate';

describe('formatDate', () => {
  it('should format date to YYYY-MM-DD', () => {
    const date = new Date('2026-02-28');
    expect(formatDate(date)).toBe('2026-02-28');
  });

  it('should handle invalid date', () => {
    expect(() => formatDate(null as any)).toThrow();
  });
});
```

### 7.2 컴포넌트 테스트 (React Testing Library)

```typescript
// __tests__/components/ui/Button.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should call onClick handler', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### 7.3 API 테스트 (Supertest)

```typescript
// __tests__/api/developer/apps.test.ts

import request from 'supertest';
import { app } from '@/app';

describe('POST /api/developer/apps', () => {
  it('should create app successfully', async () => {
    const res = await request(app)
      .post('/api/developer/apps')
      .set('Authorization', 'Bearer token')
      .send({
        appName: 'TestApp',
        packageName: 'com.test.app',
        categoryId: 1,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.appName).toBe('TestApp');
  });
});
```

---

## 8. 주석 및 문서화

### 8.1 JSDoc

```typescript
/**
 * 테스터 지원을 승인합니다.
 * 
 * @param appId - 앱 ID
 * @param applicationId - 지원 ID
 * @returns Participation 객체
 * @throws {ApiError} AUTH-004 - 권한 없음
 * @throws {ApiError} BIZ-005 - 이미 승인됨
 */
export async function approveApplication(
  appId: number,
  applicationId: number
): Promise<Participation> {
  // ...
}
```

### 8.2 TODO 주석

```typescript
// TODO(username): 2차 개발 시 크레딧 결제 추가
// FIXME: 이탈 감지 로직 개선 필요
// HACK: 임시 해결책, 리팩토링 예정
// NOTE: Google Play API 연동 시 주의
```

### 8.3 복잡한 로직 주석

```typescript
// ✅ Good: 복잡한 로직에 주석
// 신뢰도 점수 계산 공식:
// 완료율(40%) + 이탈(30%) + 피드백(20%) + 활동기간(10%)
const trustScore = 
  completionRate * 0.4 +
  (100 - dropoutRate) * 0.3 +
  feedbackQuality * 0.2 +
  activityPeriodBonus * 0.1;

// ❌ Bad: 자명한 코드에 주석
// userId를 1 증가시킴
userId += 1;
```

---

## 9. ESLint / Prettier 설정

### 9.1 .eslintrc.json

```json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/no-explicit-any": "error",
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  }
}
```

### 9.2 .prettierrc

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "arrowParens": "always"
}
```

---

## 10. 환경 변수 관리

### 10.1 .env.local

```
# 데이터베이스
DATABASE_URL="postgresql://user:password@localhost:5432/testbridge"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Google OAuth
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# 토스페이먼츠
TOSS_CLIENT_KEY="..."
TOSS_SECRET_KEY="..."

# AWS S3
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_S3_BUCKET="testbridge-uploads"
```

### 10.2 환경 변수 검증

```typescript
// lib/env.ts

import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
});

export const env = envSchema.parse(process.env);
```

---

**작성자**: TestBridge 기획팀
**최종 업데이트**: 2026-02-28
