# TestBridge 개발 가이드

**프로젝트**: TestBridge - Google Play 테스터 매칭 플랫폼
**버전**: v1.0 MVP
**작성일**: 2026-03-01
**목적**: 신규 개발자를 위한 프론트엔드/백엔드/데이터베이스 개발 가이드

---

## 📚 가이드 구성

본 개발 가이드는 **3개의 섹션**으로 구성되어 있습니다:

| 번호 | 문서 | 설명 | 라인 수 |
|------|------|------|---------|
| 01 | [프론트엔드 개발 가이드](./01-frontend-guide.md) | Next.js App Router, React, Tailwind CSS | 1,461줄 |
| 02 | [백엔드 API 개발 가이드](./02-backend-guide.md) | API Routes, Prisma, 인증/인가, TDD | 1,918줄 |
| 03 | [데이터베이스 개발 가이드](./03-database-guide.md) | Prisma 스키마, 마이그레이션, 쿼리 최적화 | 1,310줄 |

**총 라인 수**: 4,689줄

---

## 🚀 빠른 시작

### 1. 개발 환경 설정

```bash
# 저장소 클론
git clone <repository-url>
cd testbridge

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local
# .env.local 파일 수정 (DATABASE_URL, NEXTAUTH_SECRET 등)

# 데이터베이스 마이그레이션
npx prisma migrate dev

# 개발 서버 시작
npm run dev
```

### 2. 필수 요구사항

| 도구 | 버전 | 확인 명령어 |
|------|------|------------|
| Node.js | 18.x 이상 | `node --version` |
| npm | 9.x 이상 | `npm --version` |
| PostgreSQL | 16.x | `psql --version` |
| Git | 최신 | `git --version` |

---

## 📖 가이드별 주요 내용

### 01. 프론트엔드 개발 가이드

**대상**: React/Next.js 개발자

**주요 주제**:
- ✅ Next.js 14 App Router 기반 개발
- ✅ 서버 컴포넌트 vs 클라이언트 컴포넌트
- ✅ TypeScript 타입 안전성
- ✅ Tailwind CSS 스타일링
- ✅ NextAuth 인증 처리
- ✅ API 연동 및 에러 처리
- ✅ 성능 최적화 (이미지, 번들 사이즈)
- ✅ 접근성 (a11y) 및 SEO

**포함 내용**:
- 환경 설정 및 프로젝트 구조
- 페이지 및 컴포넌트 개발
- 상태 관리 (useState, Zustand)
- 실제 프로젝트 코드 기반 예제
- Good/Bad 코드 비교
- 트러블슈팅 가이드

### 02. 백엔드 API 개발 가이드

**대상**: Backend/API 개발자

**주요 주제**:
- ✅ RESTful API 설계 원칙
- ✅ Next.js API Routes (Route Handlers)
- ✅ Prisma ORM 활용
- ✅ NextAuth 인증/인가 (세션, 역할)
- ✅ Zod 입력 검증
- ✅ Defense-in-Depth 에러 처리 (4계층)
- ✅ 트랜잭션 및 원자성 보장
- ✅ TDD (RED-GREEN-REFACTOR)
- ✅ 성능 최적화 (N+1, 캐싱)

**포함 내용**:
- API 설계 및 Route Handler 작성
- 인증/인가 구현 (401, 403 처리)
- 입력 검증 및 에러 응답
- Prisma 쿼리 및 트랜잭션
- 실제 Phase 5 API 100% 테스트 통과 사례
- TDD 적용 예제
- 성능 최적화 전략

### 03. 데이터베이스 개발 가이드

**대상**: 데이터베이스/백엔드 개발자

**주요 주제**:
- ✅ Prisma 스키마 설계
- ✅ 관계 설정 (1:N, N:M)
- ✅ 마이그레이션 생성 및 적용
- ✅ 쿼리 작성 (CRUD, 필터링, 정렬, 페이지네이션)
- ✅ 성능 최적화 (N+1 해결, 인덱스)
- ✅ 트랜잭션 (Interactive Transaction)
- ✅ Soft Delete 패턴
- ✅ Seeding (테스트 데이터)

**포함 내용**:
- Prisma 개요 및 ORM vs Raw SQL
- 스키마 설계 규칙 및 제약 조건
- 마이그레이션 워크플로우
- include vs select 비교
- N+1 문제 해결
- 트랜잭션 및 롤백 처리
- Connection Pool 관리
- 실전 예제 (Feedback + Reward 트랜잭션)

---

## 🎯 학습 경로

### 초급 개발자 (신규 입사자)

1. **1주차**: 프론트엔드 가이드
   - 환경 설정 및 프로젝트 구조 파악
   - 컴포넌트 개발 연습
   - API 연동 실습

2. **2주차**: 백엔드 API 가이드
   - API 설계 원칙 학습
   - Route Handler 작성
   - 인증/인가 구현

3. **3주차**: 데이터베이스 가이드
   - Prisma 스키마 이해
   - 쿼리 작성 연습
   - 마이그레이션 실습

4. **4주차**: 통합 개발
   - 신규 기능 개발 (Feature Branch)
   - TDD 적용
   - 코드 리뷰

### 중급 개발자 (3개월 이상)

1. **성능 최적화**
   - N+1 쿼리 문제 해결
   - 번들 사이즈 최적화
   - 이미지 최적화

2. **보안 강화**
   - Defense-in-Depth 적용
   - OWASP Top 10 검증
   - 인증/인가 심화

3. **테스트 작성**
   - 단위 테스트 (Jest)
   - API 테스트 (Supertest)
   - E2E 테스트 (Playwright)

---

## 🛠️ 개발 도구 및 환경

### 필수 도구

- **에디터**: VS Code (권장)
- **확장 프로그램**:
  - Prisma (prisma.prisma)
  - Tailwind CSS IntelliSense
  - ESLint
  - Prettier - Code formatter
  - GitLens

### 개발 명령어

```bash
# 개발 서버 시작
npm run dev

# 빌드
npm run build

# 프로덕션 실행
npm start

# 린트 검사
npm run lint

# 테스트 실행
npm test

# Prisma Studio (DB 관리)
npx prisma studio

# 마이그레이션 생성
npx prisma migrate dev --name <migration-name>
```

---

## 📝 관련 문서

### 기획 문서
- [PRD (Product Requirements Document)](../planning/01-prd.md)
- [API 명세](../planning/03-api-spec.md)
- [데이터 모델](../planning/04-data-model.md)
- [코딩 컨벤션](../planning/07-coding-convention.md)

### 테스트 문서
- [TESTING_GUIDE.md](../TESTING_GUIDE.md) - 테스트 환경 설정
- [TESTING_API.md](../TESTING_API.md) - API 테스트
- [TESTING_FRONTEND.md](../TESTING_FRONTEND.md) - 프론트엔드 테스트
- [TESTING_SUMMARY.md](../TESTING_SUMMARY.md) - 테스트 결과 요약

### 기능 테스트 매뉴얼
- [공통 기능 매뉴얼](../manual/01-common-features.md)
- [개발자 기능 매뉴얼](../manual/02-developer-features.md)
- [테스터 기능 매뉴얼](../manual/03-tester-features.md)
- [통합 시나리오 매뉴얼](../manual/04-integration-scenarios.md)

---

## 💡 개발 원칙

### 1. 타입 안전성
- TypeScript를 사용하여 모든 코드에 타입 정의
- `any` 사용 금지
- Prisma 타입 자동 생성 활용

### 2. TDD (Test-Driven Development)
- Phase 1+ 모든 기능에 TDD 적용
- RED → GREEN → REFACTOR 사이클
- 테스트 커버리지 80% 이상 유지

### 3. Defense-in-Depth 보안
- 4계층 방어: 입력 검증 → 비즈니스 로직 → 인증/인가 → 에러 로깅
- OWASP Top 10 준수
- SQL Injection, XSS 방어

### 4. 성능 최적화
- N+1 쿼리 문제 해결 (Prisma include 활용)
- 이미지 최적화 (Next.js Image)
- 번들 사이즈 최적화 (Dynamic Import)
- API 응답 시간 < 500ms (p95)

### 5. 코드 리뷰
- 모든 PR은 코드 리뷰 필수
- 1명 이상 승인 후 병합
- 컨벤션 준수 확인

---

## 🐛 트러블슈팅

### 자주 발생하는 문제

| 문제 | 해결 방법 | 참조 문서 |
|------|----------|----------|
| Hydration failed | 서버/클라이언트 렌더링 차이 확인 | 프론트엔드 가이드 10장 |
| Prisma migration 실패 | schema.prisma 검증, DB 상태 확인 | 데이터베이스 가이드 3장 |
| 401 Unauthorized | NextAuth 세션 확인 | 백엔드 가이드 3장 |
| N+1 쿼리 문제 | include 사용, select 최적화 | 데이터베이스 가이드 5장 |
| Module not found | tsconfig paths 확인 | 프론트엔드 가이드 10장 |

---

## 🎓 추가 학습 자료

### 공식 문서
- [Next.js 14 Documentation](https://nextjs.org/docs)
- [React 18 Documentation](https://react.dev/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)

### 커뮤니티
- Next.js Discord
- Prisma Slack
- Stack Overflow

---

## 📞 도움 요청

### 질문하기
1. 먼저 해당 가이드 문서를 확인
2. 공식 문서 검색
3. Stack Overflow 검색
4. 팀 채널에 질문 (코드 스니펫 첨부)

### 버그 리포팅
- GitHub Issues에 등록
- 재현 절차, 스크린샷, 로그 포함

---

**작성자**: TestBridge 개발팀
**최종 수정**: 2026-03-01
**다음 업데이트**: 프로젝트 진행에 따라 지속 갱신
