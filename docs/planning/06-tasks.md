# TestBridge 개발 태스크
# Generated: 2026-02-28
# Mode: Domain-Guarded (Screen Spec 기반)

---

## 프로젝트 개요

**프로젝트명**: TestBridge
**목표**: Google Play 14일/14명 테스트 요건을 충족하는 테스터 매칭 플랫폼
**기술 스택**: Next.js 14 (App Router) + TypeScript + PostgreSQL 16 + Prisma ORM
**MVP 화면**: 12개 (공통 5개, 개발자 4개, 테스터 4개)

---

## Phase 구성

| Phase | 설명 | 병렬 가능 | 예상 시간 |
|-------|------|-----------|-----------|
| **P0** | 프로젝트 셋업 | ❌ | 2h |
| **P1** | 공통 인프라 (Auth, Layout) | 일부 | 6h |
| **P2** | 공통 화면 (Landing, Auth, Profile) | Backend 병렬 | 8h |
| **P3** | 개발자 기능 (App Register, Dashboard) | Backend 병렬 | 12h |
| **P4** | 테스터 기능 (App Discovery, Test) | Backend 병렬 | 12h |
| **P5** | 피드백 & 리워드 | Backend 병렬 | 10h |

**총 예상 시간**: 50h

---

## Phase 0: 프로젝트 셋업 (2h)

### P0-T0.1: Next.js 프로젝트 초기화
**목표**: Next.js 14 App Router + TypeScript 프로젝트 생성

```bash
npx create-next-app@latest testers --typescript --tailwind --app --src-dir --import-alias "@/*"
cd testers
```

**체크리스트**:
- ✅ src/app 디렉토리 생성
- ✅ TypeScript 설정 (tsconfig.json)
- ✅ Tailwind CSS 설정
- ✅ ESLint + Prettier 설정

**검증**:
```bash
npm run dev  # http://localhost:3000 정상 실행
```

---

### P0-T0.2: Prisma + PostgreSQL 설정
**목표**: Prisma ORM 설정 및 DB 연결

```bash
npm install prisma @prisma/client
npx prisma init
```

**작업**:
1. `schema.prisma`를 `/Users/nobang/ai_workspace/testers/appTesters/schema.prisma`에서 복사
2. `.env` 설정:
   ```
   DATABASE_URL="postgresql://user:pass@localhost:5432/testbridge"
   ```
3. 데이터베이스 마이그레이션:
   ```bash
   npx prisma migrate dev --name init
   ```

**검증**:
```bash
npx prisma studio  # Prisma Studio 실행
```

---

### P0-T0.3: NextAuth.js 설정
**목표**: NextAuth.js + Google OAuth 설정

```bash
npm install next-auth @next-auth/prisma-adapter
```

**작업**:
1. `src/app/api/auth/[...nextauth]/route.ts` 생성
2. Google Cloud Console에서 OAuth 2.0 클라이언트 ID 생성
3. `.env` 추가:
   ```
   GOOGLE_CLIENT_ID="your-client-id"
   GOOGLE_CLIENT_SECRET="your-client-secret"
   NEXTAUTH_SECRET="random-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

**검증**:
```bash
# http://localhost:3000/api/auth/signin 접속
# Google 로그인 버튼 표시 확인
```

---

### P0-T0.4: 프로젝트 구조 셋업
**목표**: Next.js 프로젝트 폴더 구조 생성

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   ├── (common)/
│   │   ├── profile/
│   │   └── notifications/
│   ├── developer/
│   │   ├── apps/
│   │   └── dashboard/
│   ├── tester/
│   │   ├── apps/
│   │   └── participations/
│   ├── api/
│   │   └── auth/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   └── shared/
├── lib/
│   ├── prisma.ts
│   └── auth.ts
└── types/
    └── index.ts
```

**검증**:
```bash
ls -R src/  # 폴더 구조 확인
```

---

## Phase 1: 공통 인프라 (6h)

### P1-R1: Users Resource API
**목표**: 사용자 CRUD API 구현

**TDD 단계**:
1. **RED**: `src/app/api/users/route.test.ts` 작성
   ```typescript
   describe('GET /api/users/[id]', () => {
     it('should return user by id', async () => {
       const user = await GET({ params: { id: '1' } })
       expect(user.id).toBe(1)
       expect(user.email).toBeDefined()
     })
   })
   ```

2. **GREEN**: `src/app/api/users/[id]/route.ts` 구현
   ```typescript
   export async function GET(
     req: Request,
     { params }: { params: { id: string } }
   ) {
     const user = await prisma.user.findUnique({
       where: { id: parseInt(params.id) }
     })
     return NextResponse.json(user)
   }
   ```

3. **REFACTOR**: 에러 핸들링, 유효성 검증 추가

**엔드포인트**:
- `GET /api/users/[id]` - 사용자 조회
- `PATCH /api/users/[id]` - 프로필 수정
- `GET /api/users/me` - 현재 사용자 조회

**의존성**: P0-T0.2 (Prisma), P0-T0.3 (NextAuth)

**검증**:
```bash
npm test -- users  # 테스트 통과 확인
curl http://localhost:3000/api/users/me  # JWT 토큰으로 요청
```

---

### P1-R2: Categories Resource API
**목표**: 카테고리 CRUD API 구현

**TDD 단계**:
1. **RED**: 테스트 작성
   ```typescript
   describe('GET /api/categories', () => {
     it('should return all active categories', async () => {
       const categories = await GET()
       expect(categories.length).toBeGreaterThan(0)
       expect(categories[0]).toHaveProperty('name')
     })
   })
   ```

2. **GREEN**: `src/app/api/categories/route.ts` 구현

3. **REFACTOR**: 캐싱 추가 (Redis 또는 In-Memory)

**엔드포인트**:
- `GET /api/categories` - 카테고리 목록

**의존성**: P0-T0.2 (Prisma)

**검증**:
```bash
npm test -- categories
curl http://localhost:3000/api/categories
```

---

### P1-S0: 공통 레이아웃 컴포넌트
**목표**: Header, Sidebar, Footer 등 공통 레이아웃

**TDD 단계**:
1. **RED**: `src/components/layout/Header.test.tsx` 작성
   ```typescript
   describe('Header', () => {
     it('should render logo and navigation', () => {
       render(<Header />)
       expect(screen.getByRole('navigation')).toBeInTheDocument()
     })
   })
   ```

2. **GREEN**: `src/components/layout/Header.tsx` 구현

3. **REFACTOR**: 반응형 디자인, 다크 모드 추가

**컴포넌트**:
- `src/components/layout/Header.tsx`
- `src/components/layout/Sidebar.tsx`
- `src/components/layout/Footer.tsx`
- `src/app/layout.tsx` (Root Layout)

**의존성**: P0-T0.1

**검증**:
```bash
npm test -- layout
# 브라우저에서 레이아웃 확인
```

---

### P1-S0-V: 공통 레이아웃 검증
**목표**: 레이아웃 컴포넌트 통합 테스트

**검증 항목**:
- ✅ Header에 로고 표시
- ✅ 로그인 상태에 따라 메뉴 변경
- ✅ Sidebar 열기/닫기 동작
- ✅ 반응형 디자인 (모바일/데스크톱)

**검증**:
```bash
npm run test:e2e -- layout  # Playwright E2E 테스트
```

---

## Phase 2: 공통 화면 (8h)

### P2-R3: Notifications Resource API
**목표**: 알림 CRUD API 구현

**TDD 단계**:
1. **RED**: 테스트 작성
   ```typescript
   describe('GET /api/notifications', () => {
     it('should return user notifications', async () => {
       const notifications = await GET({ userId: 1 })
       expect(notifications[0].type).toBeDefined()
     })
   })
   ```

2. **GREEN**: `src/app/api/notifications/route.ts` 구현

3. **REFACTOR**: 페이지네이션, 필터링 추가

**엔드포인트**:
- `GET /api/notifications` - 알림 목록 (페이지네이션)
- `PATCH /api/notifications/[id]` - 읽음 처리
- `PATCH /api/notifications/mark-all-read` - 전체 읽음

**의존성**: P1-R1 (Users)

**검증**:
```bash
npm test -- notifications
curl http://localhost:3000/api/notifications?page=1&limit=20
```

---

### P2-S1: S-01 Landing Page (랜딩 페이지)
**목표**: 서비스 소개 및 CTA 버튼

**TDD 단계**:
1. **RED**: `src/app/page.test.tsx` 작성
   ```typescript
   describe('Landing Page', () => {
     it('should render hero section and CTA buttons', () => {
       render(<LandingPage />)
       expect(screen.getByText(/Google Play 테스트 요건/)).toBeInTheDocument()
       expect(screen.getByRole('button', { name: /개발자로 시작/ })).toBeInTheDocument()
     })
   })
   ```

2. **GREEN**: `src/app/page.tsx` 구현

3. **REFACTOR**: 애니메이션, SEO 최적화

**화면 명세**: specs/screens/landing.yaml

**data_requirements**:
- apps (샘플 6개)

**의존성**: P1-S0 (Layout), P2-R4 (Apps - 샘플 데이터만)

**검증**:
```bash
npm test -- page
# http://localhost:3000/ 접속
```

---

### P2-S2: S-02 Signup (회원가입)
**목표**: OAuth + 역할 선택 + 프로필 입력

**TDD 단계**:
1. **RED**: `src/app/(auth)/signup/page.test.tsx` 작성
   ```typescript
   describe('Signup Page', () => {
     it('should render OAuth buttons', () => {
       render(<SignupPage />)
       expect(screen.getByText(/Google로 계속하기/)).toBeInTheDocument()
     })
   })
   ```

2. **GREEN**: `src/app/(auth)/signup/page.tsx` 구현

3. **REFACTOR**: 폼 유효성 검증 강화

**화면 명세**: specs/screens/signup.yaml

**data_requirements**:
- users (create)

**의존성**: P1-R1 (Users), P0-T0.3 (NextAuth)

**검증**:
```bash
npm test -- signup
# http://localhost:3000/auth/signup 접속
# Google 로그인 플로우 테스트
```

---

### P2-S3: S-03 Login (로그인)
**목표**: OAuth 로그인 + 리다이렉트

**TDD 단계**:
1. **RED**: 테스트 작성
2. **GREEN**: `src/app/(auth)/login/page.tsx` 구현
3. **REFACTOR**: 리다이렉트 로직 최적화

**화면 명세**: specs/screens/login.yaml

**data_requirements**:
- users (read)

**의존성**: P0-T0.3 (NextAuth)

**검증**:
```bash
npm test -- login
# http://localhost:3000/auth/login 접속
```

---

### P2-S4: S-04 Profile (마이페이지)
**목표**: 프로필 편집, 역할 전환, 크레딧/포인트 표시

**TDD 단계**:
1. **RED**: 테스트 작성
2. **GREEN**: `src/app/(common)/profile/page.tsx` 구현
3. **REFACTOR**: 이미지 업로드 최적화

**화면 명세**: specs/screens/profile.yaml

**data_requirements**:
- users (read, update)
- tester_profiles (read)
- developer_profiles (read)
- subscription_plans (read)
- notifications (update)

**의존성**: P1-R1 (Users)

**검증**:
```bash
npm test -- profile
# http://localhost:3000/profile 접속
```

---

### P2-S5: S-05 Notifications (알림 센터)
**목표**: 알림 목록, 읽음 처리, 타입별 라우팅

**TDD 단계**:
1. **RED**: 테스트 작성
2. **GREEN**: `src/app/(common)/notifications/page.tsx` 구현
3. **REFACTOR**: 실시간 알림 (WebSocket 또는 SSE)

**화면 명세**: specs/screens/notifications.yaml

**data_requirements**:
- notifications (read, update)

**의존성**: P2-R3 (Notifications)

**검증**:
```bash
npm test -- notifications
# http://localhost:3000/notifications 접속
```

---

### P2-S1-V ~ P2-S5-V: 공통 화면 연결점 검증
**목표**: Backend API ↔ Frontend 연결 확인

**검증 항목**:
- ✅ 랜딩 페이지에 샘플 앱 6개 표시
- ✅ 회원가입 플로우 (OAuth → 역할 선택 → 프로필)
- ✅ 로그인 후 역할별 대시보드 리다이렉트
- ✅ 프로필 수정 후 DB 반영 확인
- ✅ 알림 클릭 시 해당 페이지 이동

**검증**:
```bash
npm run test:integration -- phase2
```

---

## Phase 3: 개발자 기능 (12h)

### P3-R4: Apps Resource API
**목표**: 앱 CRUD API 구현

**TDD 단계**:
1. **RED**: 테스트 작성
   ```typescript
   describe('POST /api/apps', () => {
     it('should create new app', async () => {
       const app = await POST({ appName: 'Test App', ... })
       expect(app.id).toBeDefined()
       expect(app.status).toBe('PENDING_APPROVAL')
     })
   })
   ```

2. **GREEN**: `src/app/api/apps/route.ts` 구현

3. **REFACTOR**: 패키지명 중복 검증, 이미지 업로드

**엔드포인트**:
- `GET /api/apps` - 앱 목록 (필터링, 페이지네이션)
- `POST /api/apps` - 앱 등록
- `GET /api/apps/[id]` - 앱 상세
- `PATCH /api/apps/[id]` - 앱 수정
- `DELETE /api/apps/[id]` - 앱 삭제

**의존성**: P1-R1 (Users), P1-R2 (Categories)

**검증**:
```bash
npm test -- apps
curl -X POST http://localhost:3000/api/apps -d '{"appName":"Test"}'
```

---

### P3-R5: Applications Resource API
**목표**: 테스트 지원서 CRUD API

**TDD 단계**:
1. **RED**: 테스트 작성
2. **GREEN**: `src/app/api/applications/route.ts` 구현
3. **REFACTOR**: 승인/거절 로직, 대기열 자동 승인

**엔드포인트**:
- `GET /api/applications` - 지원서 목록 (appId 필터)
- `POST /api/applications` - 지원서 제출
- `PATCH /api/applications/[id]` - 승인/거절

**의존성**: P3-R4 (Apps), P1-R1 (Users)

**검증**:
```bash
npm test -- applications
```

---

### P3-R6: Participations Resource API
**목표**: 참여 관리 API

**TDD 단계**:
1. **RED**: 테스트 작성
2. **GREEN**: `src/app/api/participations/route.ts` 구현
3. **REFACTOR**: 이탈 감지 로직, 상태 전환

**엔드포인트**:
- `GET /api/participations` - 참여 목록
- `GET /api/participations/[id]` - 참여 상세
- `PATCH /api/participations/[id]` - 상태 업데이트

**의존성**: P3-R5 (Applications)

**검증**:
```bash
npm test -- participations
```

---

### P3-S6: D-01 Developer Dashboard (개발자 대시보드)
**목표**: 진행 중인 테스트 요약, 최근 피드백

**TDD 단계**:
1. **RED**: 테스트 작성
2. **GREEN**: `src/app/developer/page.tsx` 구현
3. **REFACTOR**: D-Day 계산 로직 최적화

**화면 명세**: specs/screens/developer-dashboard.yaml

**data_requirements**:
- apps (read)
- participations (read)
- feedbacks (read)
- subscription_plans (read)
- developer_profiles (read)

**의존성**: P3-R4, P3-R6

**검증**:
```bash
npm test -- developer/dashboard
```

---

### P3-S7: D-02 App Register (앱 등록 4단계)
**목표**: 위저드 폼 (기본정보 → 테스트설정 → 리워드 → 피드백)

**TDD 단계**:
1. **RED**: 테스트 작성
2. **GREEN**: `src/app/developer/apps/new/page.tsx` 구현
3. **REFACTOR**: 폼 상태 관리 (Zustand 또는 React Hook Form)

**화면 명세**: specs/screens/app-register.yaml

**data_requirements**:
- apps (create)
- app_images (create)
- categories (read)
- payments (create)

**의존성**: P3-R4 (Apps), P1-R2 (Categories)

**검증**:
```bash
npm test -- developer/apps/new
```

---

### P3-S8: D-03 Developer Apps (내 앱 목록)
**목표**: 상태 필터, 진행률 표시

**TDD 단계**:
1. **RED**: 테스트 작성
2. **GREEN**: `src/app/developer/apps/page.tsx` 구현
3. **REFACTOR**: 무한 스크롤 또는 페이지네이션

**화면 명세**: specs/screens/developer-apps.yaml

**data_requirements**:
- apps (read)
- participations (read)

**의존성**: P3-R4 (Apps), P3-R6 (Participations)

**검증**:
```bash
npm test -- developer/apps
```

---

### P3-S9: D-04 App Detail (앱 상세/테스트 관리)
**목표**: 탭 (현황/지원자/참여자/피드백/가이드)

**TDD 단계**:
1. **RED**: 테스트 작성
2. **GREEN**: `src/app/developer/apps/[id]/page.tsx` 구현
3. **REFACTOR**: 탭 상태 관리, 프로덕션 확인 로직

**화면 명세**: specs/screens/app-detail.yaml

**data_requirements**:
- apps (read)
- applications (read, update)
- participations (read)
- feedbacks (read)

**의존성**: P3-R4, P3-R5, P3-R6

**검증**:
```bash
npm test -- developer/apps/[id]
```

---

### P3-S6-V ~ P3-S9-V: 개발자 기능 연결점 검증
**목표**: Backend API ↔ Frontend 연결 확인

**검증 항목**:
- ✅ 대시보드에 진행 중인 앱 표시
- ✅ 앱 등록 4단계 플로우 (결제 포함)
- ✅ 앱 목록 필터링 (모집중/테스트중/완료/프로덕션)
- ✅ 지원자 승인 시 participation 생성
- ✅ 승인수 = targetTesters 시 상태 → IN_TESTING

**검증**:
```bash
npm run test:integration -- phase3
```

---

## Phase 4: 테스터 기능 (12h)

### P4-S10: T-01 Tester Home (테스터 홈/앱 탐색)
**목표**: 카테고리 필터, 리워드 금액 필터, 검색

**TDD 단계**:
1. **RED**: 테스트 작성
2. **GREEN**: `src/app/tester/page.tsx` 구현
3. **REFACTOR**: 검색 최적화 (Debounce)

**화면 명세**: specs/screens/tester-home.yaml

**data_requirements**:
- apps (read, filtered by status=RECRUITING)
- categories (read)

**의존성**: P3-R4 (Apps), P1-R2 (Categories)

**검증**:
```bash
npm test -- tester/home
```

---

### P4-S11: T-02 App Detail Tester (앱 상세 테스터뷰)
**목표**: 앱 정보, 스크린샷, 지원하기

**TDD 단계**:
1. **RED**: 테스트 작성
2. **GREEN**: `src/app/tester/apps/[id]/page.tsx` 구현
3. **REFACTOR**: 지원 모달 폼 검증

**화면 명세**: specs/screens/app-detail-tester.yaml

**data_requirements**:
- apps (read)
- app_images (read)
- applications (create, read)
- participations (read)
- users (read)

**의존성**: P3-R4 (Apps), P3-R5 (Applications)

**검증**:
```bash
npm test -- tester/apps/[id]
```

---

### P4-S12: T-03 Tester Participations (내 테스트 현황)
**목표**: 탭 (진행중/완료/지원중), D-Day, 프로그레스 바

**TDD 단계**:
1. **RED**: 테스트 작성
2. **GREEN**: `src/app/tester/participations/page.tsx` 구현
3. **REFACTOR**: D-Day 계산 로직 최적화

**화면 명세**: specs/screens/tester-participations.yaml

**data_requirements**:
- participations (read)
- applications (read)
- apps (read)
- feedbacks (read)
- rewards (read)

**의존성**: P3-R6 (Participations), P3-R5 (Applications)

**검증**:
```bash
npm test -- tester/participations
```

---

### P4-S10-V ~ P4-S12-V: 테스터 기능 연결점 검증
**목표**: Backend API ↔ Frontend 연결 확인

**검증 항목**:
- ✅ 테스터 홈에 모집 중인 앱 12개 표시
- ✅ 카테고리 필터링 동작
- ✅ 앱 상세에서 지원서 제출
- ✅ 지원 후 내 테스트 현황에 표시
- ✅ 진행 중 테스트 D-Day 계산

**검증**:
```bash
npm run test:integration -- phase4
```

---

## Phase 5: 피드백 & 리워드 (10h)

### P5-R7: Feedbacks Resource API
**목표**: 피드백 CRUD API

**TDD 단계**:
1. **RED**: 테스트 작성
2. **GREEN**: `src/app/api/feedbacks/route.ts` 구현
3. **REFACTOR**: 피드백 제출 시 리워드 자동 지급

**엔드포인트**:
- `GET /api/feedbacks` - 피드백 목록
- `POST /api/feedbacks` - 피드백 제출
- `GET /api/feedbacks/[id]` - 피드백 상세

**의존성**: P3-R6 (Participations)

**검증**:
```bash
npm test -- feedbacks
```

---

### P5-R8: Feedback Ratings Resource API
**목표**: 항목별 별점 API

**TDD 단계**:
1. **RED**: 테스트 작성
2. **GREEN**: `src/app/api/feedback-ratings/route.ts` 구현
3. **REFACTOR**: 평균 계산 로직

**엔드포인트**:
- `POST /api/feedback-ratings` - 항목별 별점 생성 (bulk)

**의존성**: P5-R7 (Feedbacks)

**검증**:
```bash
npm test -- feedback-ratings
```

---

### P5-R9: Bug Reports Resource API
**목표**: 버그 리포트 API

**TDD 단계**:
1. **RED**: 테스트 작성
2. **GREEN**: `src/app/api/bug-reports/route.ts` 구현
3. **REFACTOR**: 이미지 업로드

**엔드포인트**:
- `POST /api/bug-reports` - 버그 리포트 생성

**의존성**: P5-R7 (Feedbacks)

**검증**:
```bash
npm test -- bug-reports
```

---

### P5-R10: Rewards Resource API
**목표**: 리워드 지급 및 이력 API

**TDD 단계**:
1. **RED**: 테스트 작성
2. **GREEN**: `src/app/api/rewards/route.ts` 구현
3. **REFACTOR**: 리워드 자동 지급 로직

**엔드포인트**:
- `GET /api/rewards` - 리워드 이력
- `POST /api/rewards/payout` - 리워드 지급

**의존성**: P1-R1 (Users), P5-R7 (Feedbacks)

**검증**:
```bash
npm test -- rewards
```

---

### P5-S13: T-04 Feedback Form (피드백 작성)
**목표**: 전체 별점 + 항목별 별점 + 텍스트 + 버그 리포트

**TDD 단계**:
1. **RED**: 테스트 작성
2. **GREEN**: `src/app/tester/participations/[id]/feedback/page.tsx` 구현
3. **REFACTOR**: 폼 유효성 검증

**화면 명세**: specs/screens/feedback-form.yaml

**data_requirements**:
- participations (read)
- feedbacks (create)
- feedback_ratings (create)
- bug_reports (create)

**의존성**: P5-R7, P5-R8, P5-R9

**검증**:
```bash
npm test -- tester/participations/[id]/feedback
```

---

### P5-S13-V: 피드백 작성 연결점 검증
**목표**: Backend API ↔ Frontend 연결 확인

**검증 항목**:
- ✅ 피드백 제출 성공
- ✅ feedback_ratings 4개 생성 (UI_UX, PERFORMANCE, FUNCTIONALITY, STABILITY)
- ✅ 버그 리포트 선택 제출
- ✅ 제출 후 개발자에게 알림 발송
- ✅ 리워드 자동 지급

**검증**:
```bash
npm run test:integration -- phase5
```

---

## 전체 검증 (Phase 6)

### P6-V1: E2E 테스트 (개발자 플로우)
**목표**: 개발자 전체 플로우 E2E 테스트

**시나리오**:
1. Google 로그인 (role=DEVELOPER)
2. 앱 등록 (4단계 위저드)
3. 대시보드에서 앱 확인
4. 지원자 승인 (20명)
5. 상태 → IN_TESTING 자동 전환
6. 피드백 확인
7. 프로덕션 확인 버튼 클릭

**검증**:
```bash
npm run test:e2e -- developer-flow
```

---

### P6-V2: E2E 테스트 (테스터 플로우)
**목표**: 테스터 전체 플로우 E2E 테스트

**시나리오**:
1. Google 로그인 (role=TESTER)
2. 앱 탐색 (카테고리 필터)
3. 앱 상세 → 지원하기
4. 승인 대기
5. 승인 후 내 테스트 현황 확인
6. 피드백 작성
7. 리워드 수령 확인

**검증**:
```bash
npm run test:e2e -- tester-flow
```

---

### P6-V3: 성능 테스트
**목표**: 페이지 로딩, API 응답 시간 검증

**검증 항목**:
- ✅ 랜딩 페이지 LCP < 2.5s
- ✅ API 응답 시간 < 500ms (p95)
- ✅ Lighthouse 점수 > 90

**검증**:
```bash
npm run lighthouse
npm run k6  # API 부하 테스트
```

---

### P6-V4: 보안 테스트
**목표**: OWASP Top 10 검증

**검증 항목**:
- ✅ SQL Injection 방어 (Prisma parameterized queries)
- ✅ XSS 방어 (React auto-escaping)
- ✅ CSRF 방어 (NextAuth CSRF token)
- ✅ 인증/인가 검증

**검증**:
```bash
npm run security-scan
```

---

## 병렬 실행 계획

### 병렬 그룹 1 (Phase 1)
```
P1-R1 (Users API) ║ P1-R2 (Categories API) ║ P1-S0 (Layout)
```

### 병렬 그룹 2 (Phase 2)
```
P2-R3 (Notifications API) ║ P2-S1 (Landing) ║ P2-S2 (Signup) ║ P2-S3 (Login)
```

### 병렬 그룹 3 (Phase 3)
```
P3-R4 (Apps API) ║ P3-R5 (Applications API) ║ P3-R6 (Participations API)
     ↓                    ↓                          ↓
P3-S6 (Dashboard) ║ P3-S7 (App Register) ║ P3-S8 (Apps List) ║ P3-S9 (App Detail)
```

### 병렬 그룹 4 (Phase 4)
```
P4-S10 (Tester Home) ║ P4-S11 (App Detail Tester) ║ P4-S12 (Participations)
```

### 병렬 그룹 5 (Phase 5)
```
P5-R7 (Feedbacks) ║ P5-R8 (Ratings) ║ P5-R9 (Bug Reports) ║ P5-R10 (Rewards)
     ↓                    ↓                    ↓                    ↓
P5-S13 (Feedback Form)
```

---

## 주의사항

### TDD 필수 준수
- Phase 1+ 모든 태스크는 **RED → GREEN → REFACTOR** 순서 엄수
- 테스트 없이 구현 금지

### Backend 헌법 준수
- API 엔드포인트는 리소스 중심으로 설계
- 화면 명세에 종속되지 않음
- RESTful 원칙 준수

### 도메인 커버리지 검증
- 화면 `needs` ⊆ 리소스 `fields` 확인
- 누락된 필드 발견 시 즉시 리소스 정의 업데이트

### 연결점 검증 (Verification)
- 각 화면의 `-V` 태스크에서 Backend ↔ Frontend 연결 확인
- 데이터 흐름 끊김 없이 동작하는지 검증

---

## 다음 단계

✅ **TASKS.md 생성 완료**

📋 **권장 워크플로우**:
```
/tasks-generator → /project-bootstrap → /auto-orchestrate
```

**생성일**: 2026-02-28
**생성자**: Claude Code (tasks-generator v2.0)
**모드**: Domain-Guarded
