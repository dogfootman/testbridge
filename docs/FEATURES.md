# TestBridge 기능 목록

**프로젝트**: TestBridge - Google Play 테스터 매칭 플랫폼
**버전**: v1.0 MVP
**작성일**: 2026-03-01
**문서 목적**: 구현된 기능의 전체 목록 및 설명

---

## 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [공통 기능](#2-공통-기능)
3. [개발자 기능](#3-개발자-기능)
4. [테스터 기능](#4-테스터-기능)
5. [Backend API](#5-backend-api)
6. [기술 스택](#6-기술-스택)

---

## 1. 프로젝트 개요

### 1.1 서비스 소개
- **서비스명**: TestBridge
- **목적**: Google Play 비공개 테스트 요건(14일/14명) 충족 지원
- **핵심 가치**: 개발자와 테스터를 연결하여 양쪽의 니즈 해결

### 1.2 해결하는 문제
**개발자 고충**:
- 주변에 20명의 테스터 구하기 어려움
- 14일간 지속적 참여 유도 어려움
- 테스터 이탈 시 처음부터 다시 시작

**테스터 니즈**:
- 신규 앱 조기 체험 기회
- 리워드 수령
- 앱 개발 생태계 기여

### 1.3 주요 지표
- **총 화면**: 12개 (공통 5개, 개발자 4개, 테스터 4개)
- **Backend API**: 10개 리소스
- **테스트 커버리지**: 89.8% (1,469/1,635 tests)

---

## 2. 공통 기능

### 2.1 인증 및 회원가입

#### S-01: 랜딩 페이지 (`/`)
**구현 상태**: ✅ 완료
**주요 기능**:
- 서비스 핵심 가치 소개 (히어로 섹션)
- "개발자로 시작" / "테스터로 시작" CTA 버튼
- 서비스 이용 플로우 시각화
- 샘플 앱 6개 표시 (모집 중인 앱 미리보기)

**API 연동**:
- `GET /api/apps?status=RECRUITING&limit=6`

---

#### S-02: 회원가입 (`/auth/signup`)
**구현 상태**: ✅ 완료
**주요 기능**:
- Google OAuth 2.0 소셜 로그인
- 역할 선택 (개발자 / 테스터 / 둘 다)
- 기본 프로필 입력 (닉네임, 프로필 이미지)
- 이용약관 동의

**API 연동**:
- NextAuth.js 세션 기반 인증
- `POST /api/users` (사용자 생성)

---

#### S-03: 로그인 (`/auth/login`)
**구현 상태**: ✅ 완료
**주요 기능**:
- Google OAuth 로그인
- 역할별 대시보드 자동 리다이렉트
  - 개발자 → `/developer`
  - 테스터 → `/tester`

**API 연동**:
- NextAuth.js `signIn()`
- `GET /api/users/me`

---

### 2.2 프로필 및 설정

#### S-04: 마이페이지 (`/profile`)
**구현 상태**: ✅ 완료
**주요 기능**:
- 프로필 편집 (닉네임, 소개, 프로필 이미지)
- 역할 전환 (개발자 ↔ 테스터)
- 구독 플랜 정보 표시
- 크레딧 잔액 (개발자)
- 리워드 포인트 잔액 (테스터)
- 알림 설정
- 로그아웃

**API 연동**:
- `GET /api/users/me`
- `PATCH /api/users/[id]`
- `GET /api/tester-profiles` (테스터)
- `GET /api/developer-profiles` (개발자)

---

#### S-05: 알림 센터 (`/notifications`)
**구현 상태**: ✅ 완료
**주요 기능**:
- 알림 목록 (페이지네이션)
- 읽음/안읽음 필터링
- 전체 읽음 처리
- 알림 클릭 시 해당 페이지 이동
- 알림 타입별 라우팅:
  - `APPLICATION_APPROVED` → 앱 상세
  - `FEEDBACK_RECEIVED` → 피드백 확인
  - `REWARD_PAID` → 리워드 내역

**API 연동**:
- `GET /api/notifications?page=1&limit=20`
- `PATCH /api/notifications/[id]` (읽음 처리)
- `PATCH /api/notifications/mark-all-read`

---

### 2.3 공통 레이아웃

#### 헤더 (Header)
**구현 상태**: ✅ 완료
**주요 기능**:
- 로고 (클릭 시 홈으로)
- 네비게이션 메뉴 (역할별 동적 표시)
- 알림 아이콘 (미읽음 뱃지)
- 프로필 드롭다운 (마이페이지, 로그아웃)

#### 사이드바 (Sidebar)
**구현 상태**: ✅ 완료
**주요 기능**:
- 역할별 메뉴 표시
- 개발자: 대시보드, 내 앱, 앱 등록
- 테스터: 홈, 내 테스트, 리워드
- 모바일 반응형 (햄버거 메뉴)

---

## 3. 개발자 기능

### 3.1 대시보드

#### D-01: 개발자 대시보드 (`/developer`)
**구현 상태**: ✅ 완료
**주요 기능**:
- 진행 중인 테스트 요약 (카드 형태)
- 최근 피드백 3개 표시
- D-Day 카운트다운 (테스트 종료까지)
- 구독 플랜 정보
- 크레딧 잔액
- Quick Actions (앱 등록, 지원자 관리)

**API 연동**:
- `GET /api/apps?developerId=[id]&status=IN_TESTING`
- `GET /api/participations?appId=[id]`
- `GET /api/feedbacks?appId=[id]&limit=3`
- `GET /api/developer-profiles/[id]`

**주요 지표**:
- 진행 중인 앱 수
- 총 참여자 수
- 평균 별점
- 피드백 수

---

### 3.2 앱 관리

#### D-02: 앱 등록 (`/developer/apps/new`)
**구현 상태**: ✅ 완료
**주요 기능**:
- **4단계 위저드 폼**:
  1. 기본 정보 (앱 이름, 설명, 카테고리, 패키지명)
  2. 테스트 설정 (목표 인원, 테스트 기간, Google Play 링크)
  3. 리워드 설정 (리워드 타입, 금액)
  4. 피드백 설정 (피드백 항목 선택)
- 앱 스크린샷 업로드 (최대 5장)
- 폼 검증 (필수 필드, 패키지명 형식)
- 미리보기 모드

**API 연동**:
- `POST /api/apps`
- `POST /api/app-images` (스크린샷 업로드)
- `GET /api/categories`
- `POST /api/payments` (결제 연동, 옵션)

**검증 규칙**:
- 패키지명: `com.example.app` 형식
- 목표 인원: 14~100명
- 테스트 기간: 14일 이상
- 리워드 금액: 1,000원 이상

---

#### D-03: 내 앱 목록 (`/developer/apps`)
**구현 상태**: ✅ 완료
**주요 기능**:
- 앱 카드 리스트 (그리드 레이아웃)
- 상태별 필터링:
  - `PENDING_APPROVAL` (검토 중)
  - `RECRUITING` (모집 중)
  - `IN_TESTING` (테스트 중)
  - `COMPLETED` (완료)
  - `IN_PRODUCTION` (프로덕션 배포)
- 진행률 프로그레스 바 (승인된 참여자 / 목표 인원)
- D-Day 표시
- 앱 클릭 시 상세 페이지 이동

**API 연동**:
- `GET /api/apps?developerId=[id]&status=[filter]`
- `GET /api/participations?appId=[id]` (진행률 계산용)

**표시 정보**:
- 앱 이름, 아이콘
- 상태 뱃지
- 진행률 (예: 12/20명)
- D-Day (예: D-7)
- 평균 별점

---

#### D-04: 앱 상세 / 테스트 관리 (`/developer/apps/[id]`)
**구현 상태**: ✅ 완료
**주요 기능**:
- **5개 탭**:
  1. **현황**: 실시간 통계 (총 지원자, 승인된 인원, 평균 별점)
  2. **지원자**: 대기 중인 지원자 목록, 승인/거절 버튼
  3. **참여자**: 승인된 참여자 목록, 옵트인 상태, 이탈 알림
  4. **피드백**: 제출된 피드백 목록, 별점/코멘트/버그 리포트
  5. **가이드**: Google Play Console 설정 가이드
- 지원자 프로필 확인 (신뢰도 점수, 테스트 완료율)
- 일괄 승인 기능
- 프로덕션 확인 버튼 (14일 완료 시)

**API 연동**:
- `GET /api/apps/[id]`
- `GET /api/applications?appId=[id]`
- `PATCH /api/applications/[id]` (승인/거절)
- `GET /api/participations?appId=[id]`
- `GET /api/feedbacks?appId=[id]`

**자동 상태 전환**:
- 승인 인원 = 목표 인원 → `IN_TESTING`
- 14일 경과 + 피드백 수집 → `COMPLETED`

---

## 4. 테스터 기능

### 4.1 앱 탐색

#### T-01: 테스터 홈 / 앱 탐색 (`/tester`)
**구현 상태**: ✅ 완료 (Phase 4)
**주요 기능**:
- 모집 중인 앱 카드 목록 (그리드 레이아웃)
- **필터링**:
  - 카테고리 (게임, 유틸리티, 교육 등)
  - 리워드 금액 범위 (슬라이더)
  - 정렬 (최신순, 리워드 높은순, 마감임박순)
- **검색**: 앱 이름, 설명 키워드 검색 (Debounce 적용)
- 남은 자리 표시 (예: 5명 남음)
- 앱 클릭 시 상세 페이지 이동

**API 연동**:
- `GET /api/apps?status=RECRUITING&category=[id]&search=[keyword]`
- `GET /api/categories`

**카드 표시 정보**:
- 앱 이름, 아이콘
- 카테고리
- 리워드 금액
- 남은 자리 (목표 인원 - 승인된 인원)
- 마감일 (D-Day)

---

#### T-02: 앱 상세 (테스터뷰) (`/tester/apps/[id]`)
**구현 상태**: ✅ 완료 (Phase 4)
**주요 기능**:
- 앱 정보:
  - 앱 이름, 설명, 카테고리
  - 개발자 정보
  - 리워드 금액
  - 테스트 기간
  - 목표 인원 / 남은 자리
- 스크린샷 갤러리 (Carousel)
- **지원하기 버튼**:
  - 클릭 시 모달 폼 표시
  - 간단한 자기소개, 기기 정보 입력
  - 이미 지원한 경우 비활성화
- 테스트 가이드 (Google Play 옵트인 방법)

**API 연동**:
- `GET /api/apps/[id]`
- `GET /api/app-images?appId=[id]`
- `POST /api/applications` (지원하기)
- `GET /api/applications?userId=[id]&appId=[id]` (중복 지원 체크)

**지원 모달 폼**:
- 자기소개 (선택, 최대 200자)
- 기기 정보 (예: Galaxy S24 / Android 14)
- 개인정보 동의

---

### 4.2 참여 관리

#### T-03: 내 테스트 현황 (`/tester/participations`)
**구현 상태**: ✅ 완료 (Phase 4)
**주요 기능**:
- **3개 탭**:
  1. **진행 중**: 승인되어 테스트 중인 앱
  2. **완료**: 피드백 제출 완료한 앱
  3. **지원 중**: 승인 대기 중인 앱
- 각 항목 표시:
  - 앱 이름, 아이콘
  - D-Day 계산 (예: D-7, D-Day, +3일 경과)
  - 프로그레스 바 (진행률)
  - 리워드 금액
  - 피드백 작성 버튼 (완료 탭)
- 항목 클릭 시 앱 상세 또는 피드백 작성 페이지 이동

**API 연동**:
- `GET /api/participations?userId=[id]&status=[filter]`
- `GET /api/applications?userId=[id]`
- `GET /api/feedbacks?participationId=[id]` (피드백 제출 여부 확인)

**D-Day 계산 로직**:
- 테스트 시작일 + 14일 - 현재 날짜
- 예시: `2026-03-01 → D-7`, `2026-03-08 → D-Day`, `2026-03-10 → +2일 경과`

---

### 4.3 피드백 작성

#### T-04: 피드백 작성 폼 (`/tester/participations/[id]/feedback`)
**구현 상태**: ✅ 완료 (Phase 5)
**주요 기능**:
- **전체 별점** (1~5점, 필수)
- **항목별 별점** (각 1~5점, 필수):
  - UI/UX
  - 성능 (Performance)
  - 기능성 (Functionality)
  - 안정성 (Stability)
- **텍스트 코멘트** (필수, 최소 10자)
- **버그 리포트** (선택):
  - 버그 제목
  - 상세 설명
  - 기기 정보 (자동 입력)
  - 스크린샷 업로드 (선택)
- 폼 검증 (필수 필드, 최소 글자 수)
- 제출 버튼

**API 연동 (순차 호출)**:
1. `POST /api/feedbacks` (피드백 생성)
2. `POST /api/feedback-ratings` (항목별 별점 벌크 생성)
3. `POST /api/bug-reports` (버그 리포트, 선택 시)

**제출 후 동작**:
- 참여 상태 업데이트 (`FEEDBACK_SUBMITTED`)
- 리워드 자동 지급 (예정)
- 개발자에게 알림 발송 (예정)
- 내 테스트 현황 페이지로 리다이렉트

---

## 5. Backend API

### 5.1 Users Resource (P1-R1)
**엔드포인트**:
- `GET /api/users/[id]` - 사용자 조회
- `PATCH /api/users/[id]` - 프로필 수정
- `GET /api/users/me` - 현재 사용자 조회

**기능**:
- 사용자 CRUD
- 역할 관리 (DEVELOPER, TESTER, BOTH)
- 크레딧/포인트 잔액 관리

---

### 5.2 Categories Resource (P1-R2)
**엔드포인트**:
- `GET /api/categories` - 카테고리 목록

**기능**:
- 앱 카테고리 조회
- 캐싱 (In-Memory)
- 정렬 (sortOrder)

---

### 5.3 Notifications Resource (P2-R3)
**엔드포인트**:
- `GET /api/notifications` - 알림 목록 (페이지네이션)
- `PATCH /api/notifications/[id]` - 읽음 처리
- `PATCH /api/notifications/mark-all-read` - 전체 읽음

**기능**:
- 알림 CRUD
- 필터링 (isRead)
- 페이지네이션
- 타입별 라우팅

---

### 5.4 Apps Resource (P3-R4)
**엔드포인트**:
- `GET /api/apps` - 앱 목록 (필터링, 페이지네이션)
- `POST /api/apps` - 앱 등록
- `GET /api/apps/[id]` - 앱 상세
- `PATCH /api/apps/[id]` - 앱 수정
- `DELETE /api/apps/[id]` - 앱 삭제

**기능**:
- 앱 CRUD
- 상태 관리 (PENDING_APPROVAL, RECRUITING, IN_TESTING, COMPLETED, IN_PRODUCTION)
- 패키지명 중복 검증
- 이미지 업로드

---

### 5.5 Applications Resource (P3-R5)
**엔드포인트**:
- `GET /api/applications` - 지원서 목록 (appId 필터)
- `POST /api/applications` - 지원서 제출
- `PATCH /api/applications/[id]` - 승인/거절

**기능**:
- 테스트 지원서 관리
- 상태 관리 (PENDING, APPROVED, REJECTED)
- 승인 시 participation 자동 생성
- 대기열 자동 승인 (목표 인원 미달 시)

---

### 5.6 Participations Resource (P3-R6)
**엔드포인트**:
- `GET /api/participations` - 참여 목록
- `GET /api/participations/[id]` - 참여 상세
- `PATCH /api/participations/[id]` - 상태 업데이트

**기능**:
- 참여 관리
- 상태 관리 (ACTIVE, DROPPED_OUT, FEEDBACK_SUBMITTED, REWARD_PAID)
- 이탈 감지 로직
- D-Day 계산

---

### 5.7 Feedbacks Resource (P5-R7)
**엔드포인트**:
- `GET /api/feedbacks` - 피드백 목록
- `POST /api/feedbacks` - 피드백 제출
- `GET /api/feedbacks/[id]` - 피드백 상세

**기능**:
- 피드백 CRUD
- 전체 별점 저장
- 피드백 제출 시 participation 상태 업데이트
- 리워드 자동 지급 트리거 (예정)

**테스트**: 28/28 통과 (100%)

---

### 5.8 Feedback Ratings Resource (P5-R8)
**엔드포인트**:
- `GET /api/feedback-ratings?feedbackId=[id]` - 항목별 별점 조회 + 평균
- `POST /api/feedback-ratings` - 항목별 별점 벌크 생성

**기능**:
- 항목별 별점 관리 (UI_UX, PERFORMANCE, FUNCTIONALITY, STABILITY)
- 평균 점수 자동 계산
- 벌크 생성 (트랜잭션)

**테스트**: 21/21 통과 (100%)

---

### 5.9 Bug Reports Resource (P5-R9)
**엔드포인트**:
- `GET /api/bug-reports` - 버그 리포트 목록
- `POST /api/bug-reports` - 버그 리포트 생성

**기능**:
- 버그 리포트 CRUD
- 이미지 업로드 (BugReportImage 테이블)
- 중복 방지 (feedbackId 1:1 관계)

**테스트**: 17/17 통과 (100%)

---

### 5.10 Rewards Resource (P5-R10)
**엔드포인트**:
- `GET /api/rewards` - 리워드 이력
- `POST /api/rewards/payout` - 리워드 지급/차감

**기능**:
- 리워드 지급 및 이력 관리
- 타입별 처리:
  - `EARNED` (획득): 잔액 증가
  - `WITHDRAWN` (출금): 잔액 감소
  - `WITHDRAWAL_REFUND` (환불): 잔액 증가
  - `EXCHANGED` (교환): 잔액 감소
- 잔액 부족 시 400 에러
- 트랜잭션 기반 원자적 처리

**테스트**: 20/20 통과 (100%)

---

## 6. 기술 스택

### 6.1 Frontend
| 기술 | 버전 | 용도 |
|------|------|------|
| Next.js | 14.2.21 | React 프레임워크 (App Router) |
| React | 18.3.1 | UI 라이브러리 |
| TypeScript | 5.x | 타입 안전성 |
| Tailwind CSS | 3.4.1 | 스타일링 |
| Zustand | 5.0.2 | 상태 관리 (클라이언트) |
| Zod | 3.24.1 | 폼 검증 |

### 6.2 Backend
| 기술 | 버전 | 용도 |
|------|------|------|
| Next.js API Routes | 14.2.21 | RESTful API |
| Prisma ORM | 6.1.0 | 데이터베이스 ORM |
| PostgreSQL | 16.x | 관계형 데이터베이스 |
| NextAuth.js | 4.24.11 | 인증 (Google OAuth) |

### 6.3 테스트
| 기술 | 버전 | 용도 |
|------|------|------|
| Jest | 29.7.0 | 단위 테스트 프레임워크 |
| React Testing Library | 16.1.0 | 컴포넌트 테스트 |
| Playwright | 1.49.1 | E2E 테스트 |

### 6.4 개발 도구
| 기술 | 버전 | 용도 |
|------|------|------|
| ESLint | 8.x | 코드 린팅 |
| Prettier | (내장) | 코드 포맷팅 |
| Git | - | 버전 관리 |
| Docker | (선택) | 컨테이너화 |

---

## 7. 구현 통계

### 7.1 파일 및 코드
- **총 파일 수**: 200+ 개
- **총 코드 라인**: 15,000+ 라인
- **컴포넌트**: 50+ 개
- **API 엔드포인트**: 30+ 개

### 7.2 화면 구성
| 카테고리 | 화면 수 | 상태 |
|---------|---------|------|
| 공통 | 5개 | ✅ 완료 |
| 개발자 | 4개 | ✅ 완료 |
| 테스터 | 4개 | ✅ 완료 (Phase 4-5) |
| **총합** | **13개** | **100%** |

### 7.3 Backend API
| 리소스 | 엔드포인트 수 | 테스트 | 상태 |
|---------|--------------|--------|------|
| Users | 3개 | - | ✅ |
| Categories | 1개 | - | ✅ |
| Notifications | 3개 | - | ✅ |
| Apps | 5개 | - | ✅ |
| Applications | 3개 | - | ✅ |
| Participations | 3개 | - | ✅ |
| Feedbacks | 3개 | 28/28 | ✅ |
| Feedback Ratings | 2개 | 21/21 | ✅ |
| Bug Reports | 2개 | 17/17 | ✅ |
| Rewards | 2개 | 20/20 | ✅ |
| **총합** | **27개** | **86/86** | **100%** |

---

## 8. 다음 단계 (선택 기능)

### 8.1 기능 완성도 향상
- [ ] 리워드 자동 지급 완성 (Feedbacks API → Rewards)
- [ ] 실시간 알림 (WebSocket 또는 SSE)
- [ ] 프로덕션 확인 버튼 기능 구현
- [ ] 1:1 메시지 기능
- [ ] 신뢰도 점수 시스템

### 8.2 관리자 기능
- [ ] 관리자 대시보드
- [ ] 사용자 관리 (검색, 필터, 정지)
- [ ] 앱 관리 (승인/반려)
- [ ] 정산 관리 (출금 요청 처리)
- [ ] CS 관리 (문의 티켓)

### 8.3 성능 최적화
- [ ] 이미지 최적화 (Next.js Image)
- [ ] API 응답 캐싱 (Redis)
- [ ] 무한 스크롤 (앱 목록)
- [ ] SSR/ISR 최적화

### 8.4 보안 강화
- [ ] OWASP ZAP 보안 스캔
- [ ] Rate Limiting (API 요청 제한)
- [ ] CORS 설정
- [ ] XSS/CSRF 추가 검증

---

**문서 작성일**: 2026-03-01
**작성자**: Claude Code
**다음 문서**: [TESTING_GUIDE.md](./TESTING_GUIDE.md)
