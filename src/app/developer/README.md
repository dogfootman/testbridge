# P3-S6: Developer Dashboard (개발자 대시보드)

## 📋 개요

개발자가 진행 중인 테스트 현황, 최근 피드백, 구독 플랜, 크레딧을 한눈에 볼 수 있는 대시보드입니다.

## 🎯 주요 기능

### 1. 진행 중인 테스트 요약
- 상태별 앱 카드 표시 (RECRUITING, IN_TESTING)
- D-Day 계산 (모집 중: "N일 후 시작", 테스트 중: "D-N")
- 참여자 수 / 목표 테스터 수 (예: "3/20")
- 앱 카드 클릭 시 상세 페이지 이동

### 2. 최근 피드백 5개
- 테스터 닉네임
- 별점 (1-5)
- 코멘트
- 작성일

### 3. 구독 플랜 정보
- 현재 플랜 (FREE, PRO, PREMIUM)
- 남은 앱 등록 수

### 4. 크레딧 잔액
- 상호 테스트용 크레딧 표시
- 충전 버튼

## 🧪 테스트

```bash
npm test developer/page.test.tsx
```

### 테스트 커버리지
- ✅ 진행 중인 앱 카드 렌더링
- ✅ D-Day 계산 로직 (RECRUITING, IN_TESTING)
- ✅ 참여자 수 집계 (ACTIVE 상태만)
- ✅ 최근 피드백 5개 표시
- ✅ 빈 상태 처리 (앱 없음, 피드백 없음)
- ✅ 구독 플랜 정보 표시
- ✅ 에러 상태 처리

**결과**: 10/10 테스트 통과 ✅

## 📺 데모

```bash
npm run dev
```

데모 페이지: http://localhost:3000/demo/phase-3/p3-s6-developer-dashboard

### 데모 상태
1. **Loading** (⏳): 로딩 중 상태
2. **Empty** (📭): 진행 중인 앱 없음
3. **Normal** (📊): 앱 2개 + 피드백 2개
4. **With Data** (📈): 앱 3개 + 피드백 5개

## 🏗️ 컴포넌트 구조

```
src/app/developer/
├── page.tsx              # 메인 대시보드 (클라이언트 컴포넌트)
└── page.test.tsx         # 테스트

src/components/developer/
├── AppCard.tsx           # 앱 카드 컴포넌트
├── FeedbackList.tsx      # 피드백 목록
├── StatCard.tsx          # 통계 카드 (구독, 크레딧)
└── EmptyState.tsx        # 빈 상태 표시

src/demo/phase-3/p3-s6-developer-dashboard/
└── page.tsx              # 데모 페이지
```

## 🔌 API 연동

### 사용하는 엔드포인트
| 엔드포인트 | 메서드 | 용도 |
|-----------|--------|------|
| `/api/apps` | GET | 진행 중인 앱 목록 (status=RECRUITING,IN_TESTING) |
| `/api/participations` | GET | 앱별 참여자 목록 (appId 필터) |
| `/api/feedbacks` | GET | 최근 피드백 5개 (limit=5) |
| `/api/users/:id` | GET | 사용자 정보 (구독, 크레딧) |

### API 요청 흐름
1. 앱 목록 fetch → `apps`
2. 각 앱별 participations fetch → `apps.participations`
3. 피드백 목록 fetch → `feedbacks`
4. 사용자 정보 fetch → `userData`

## 📐 디자인 시스템

### MOVIN Design System 적용
- 다크 배경 (`bg-bg-primary`)
- 네온 강조색 (`accent-neon`)
- 카드 스타일 (`bg-bg-secondary`, `border-white/10`)
- 반응형 그리드 (lg:grid-cols-4)

### 색상 사용
- **모집 중**: `bg-blue-500/20 text-blue-400`
- **테스트 중**: `bg-green-500/20 text-green-400`
- **강조**: `text-accent-neon`

## 🎨 D-Day 계산 로직

```typescript
// RECRUITING: 시작일까지 남은 일수
if (status === 'RECRUITING') {
  const diffDays = Math.ceil((startDate - now) / (1000 * 60 * 60 * 24))
  return `${diffDays}일 후 시작`
}

// IN_TESTING: 종료일까지 남은 일수
const diffDays = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24))
return `D-${diffDays}`
```

## 📊 TDD 프로세스

### 🔴 RED
- 테스트 먼저 작성 (10개 테스트)
- 실행 → 모두 실패 확인

### 🟢 GREEN
- 최소 구현 (클라이언트 컴포넌트)
- API 연동
- D-Day 계산 함수
- 실행 → 모두 통과 확인

### 🔵 REFACTOR
- 컴포넌트 분리 (AppCard, FeedbackList, StatCard, EmptyState)
- 코드 정리
- 실행 → 여전히 모두 통과 확인

## 🔗 관련 명세

- **Screen Spec**: `specs/screens/developer-dashboard.yaml`
- **API Spec**:
  - P3-R4: Apps API
  - P3-R6: Participations API

## ✅ 완료 조건

- [x] 모든 테스트 통과 (10/10)
- [x] npm run build 성공
- [x] 컴포넌트 분리 완료
- [x] 데모 페이지 생성
- [x] D-Day 계산 정확성 검증
- [x] API 통합 확인

## 🚀 다음 단계

1. 개발 서버 실행: `npm run dev`
2. 데모 확인: http://localhost:3000/demo/phase-3/p3-s6-developer-dashboard
3. 실제 페이지 확인: http://localhost:3000/developer (인증 필요)
