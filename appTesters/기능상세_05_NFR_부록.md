# TestBridge 기능 상세 정의서 ⑤ NFR + 부록

---

# 8. 비기능 (NFR) — 20건 (P1: 13건, P2: 7건)

---

## NFR-PRF-001 | 페이지 로딩 3초 | P1

| 항목 | 기준 |
|------|------|
| 대상 | 모든 페이지 |
| 목표 | First Contentful Paint ≤ 3초 |
| 측정 | Lighthouse, WebPageTest |
| 조건 | 4G 네트워크 기준 |

### 달성 방법
- Next.js SSR/SSG 활용
- 이미지 lazy loading + WebP 변환
- JS 번들 Code Splitting
- CDN 캐싱 (정적 자원)

---

## NFR-PRF-002 | API 응답 200ms | P1

| 항목 | 기준 |
|------|------|
| 대상 | 모든 REST API |
| 목표 | p95 ≤ 200ms |
| 측정 | APM 도구 (DataDog / New Relic) |
| 예외 | 파일 업로드, 결제 API는 1초 허용 |

### 달성 방법
- DB 인덱싱 최적화
- 쿼리 N+1 방지
- Redis 캐시 (목록 API)
- Connection Pooling

---

## NFR-PRF-003 | 동시 접속 500명 | P1

| 항목 | 기준 |
|------|------|
| 목표 | 500 동시 사용자 정상 응답 |
| 측정 | k6 / Artillery 부하 테스트 |
| 스케일 | 트래픽 증가 시 수평 확장 |

### 달성 방법
- Auto Scaling (AWS ECS / EKS)
- Load Balancer (ALB)
- DB Read Replica (필요 시)
- Rate Limiting (사용자별 100req/min)

---

## NFR-PRF-004 | 이미지 최적화 | P2

| 항목 | 기준 |
|------|------|
| 형식 | WebP 변환 (클라이언트 미지원 시 JPG fallback) |
| 크기 | 원본 + 썸네일 자동 생성 |
| CDN | CloudFront 캐싱 (max-age: 1년) |
| 저장 | S3 Standard (원본), CloudFront (배포) |

---

## NFR-SEC-001 | HTTPS 적용 | P1

| 항목 | 기준 |
|------|------|
| 프로토콜 | TLS 1.3 (1.2 이하 비활성화) |
| 인증서 | Let's Encrypt 또는 AWS ACM |
| 리디렉션 | HTTP → HTTPS 301 강제 |
| HSTS | max-age=31536000; includeSubDomains |

### 적용 범위

| 대상 | 방식 |
|------|------|
| 프론트 (Vercel) | 기본 HTTPS |
| 백엔드 API | ALB/Nginx TLS 종료 |
| DB 연결 | PostgreSQL ssl=require |
| 외부 API | Google OAuth, 토스페이먼츠 모두 HTTPS |

### 검증: SSL Labs A+ 등급, HSTS 헤더 확인

---

## NFR-SEC-002 | 비밀번호 암호화 | P1

| 항목 | 기준 |
|------|------|
| 소셜 로그인 | 비밀번호 없음 (OAuth 토큰 기반) |
| 토큰 저장 | Refresh Token: DB bcrypt 해싱 저장 |
| 시크릿 키 | 환경 변수 관리 (AWS Secrets Manager) |

---

## NFR-SEC-003 | SQL Injection 방지 | P1

| 항목 | 기준 |
|------|------|
| ORM | Prisma / TypeORM Parameterized Query |
| 금지 | Raw SQL 직접 사용 금지 (코드 리뷰에서 차단) |
| 테스트 | OWASP ZAP 자동 스캔 |

---

## NFR-SEC-004 | XSS 방지 | P1

| 항목 | 기준 |
|------|------|
| 프론트 | React 기본 escape + DOMPurify (사용자 HTML 입력 시) |
| API | 입력값 sanitize (html-entities) |
| 헤더 | Content-Security-Policy, X-Content-Type-Options: nosniff |
| 쿠키 | HttpOnly, Secure, SameSite=Strict |

---

## NFR-SEC-005 | 결제 정보 보안 | P1

| 항목 | 기준 |
|------|------|
| 카드 정보 | 서버 미저장. PG(토스페이먼츠)에 위임 |
| 빌링키 | PG 발급 키만 저장 (AES-256 암호화) |
| PCI DSS | PG 위임으로 직접 인증 불필요 |
| 통신 | PG API 호출 시 mTLS (상호 인증) |

---

## NFR-SEC-006 | 개인정보 암호화 | P1

| 항목 | 암호화 방식 | 설명 |
|------|-----------|------|
| 이메일 | AES-256 | 검색 필요 → 양방향 |
| 전화번호 | AES-256 | 검색 필요 → 양방향 |
| 계좌번호 | AES-256 | 출금 시 복호화 |
| 주민번호 | 수집하지 않음 | - |

### 비즈니스 규칙

| 규칙 ID | 규칙 | 상세 |
|---------|------|------|
| BR-500 | 암호화 키 관리 | AWS KMS로 관리. 키 로테이션 90일 |
| BR-501 | 마스킹 | API 응답에서 이메일(a***@), 계좌(****1234) 마스킹 |
| BR-502 | 접근 로그 | 개인정보 조회 시 접근 로그 기록 |

---

## NFR-SEC-007 | Rate Limiting | P1

| 대상 | 제한 |
|------|------|
| 로그인 API | 5회/분 (IP 기준) |
| 회원가입 | 3회/시간 (IP 기준) |
| 일반 API | 100회/분 (사용자 기준) |
| 파일 업로드 | 20회/시간 (사용자 기준) |

### 비즈니스 규칙

| 규칙 ID | 규칙 | 상세 |
|---------|------|------|
| BR-503 | 응답 | 429 Too Many Requests + Retry-After 헤더 |
| BR-504 | 구현 | Redis 기반 Sliding Window |
| BR-505 | 로깅 | 제한 초과 시 로그 기록 (DDoS 감지용) |

---

## NFR-INF-001 | 서버 인프라 | P1

| 계층 | 기술 | 설명 |
|------|------|------|
| 프론트엔드 | Vercel | Next.js 배포 |
| 백엔드 | AWS ECS Fargate | Node.js (NestJS) 컨테이너 |
| 데이터베이스 | AWS RDS PostgreSQL | db.t3.medium (초기) |
| 캐시 | AWS ElastiCache Redis | 세션, API 캐싱 |
| 스토리지 | AWS S3 | 이미지, 파일 |
| CDN | CloudFront | 정적 자원 배포 |
| 메시지 큐 | AWS SQS | 이메일, 알림 비동기 처리 |
| 모니터링 | CloudWatch + Sentry | 에러 트래킹 |

---

## NFR-INF-002 | 데이터베이스 | P1

| 항목 | 기준 |
|------|------|
| DBMS | PostgreSQL 16 |
| 초기 사양 | db.t3.medium (2vCPU, 4GB) |
| 백업 | 자동 스냅샷 매일 (7일 보관) |
| 암호화 | 스토리지 암호화 (AES-256) |
| 연결 | SSL 필수, Connection Pooling (PgBouncer) |

---

## NFR-INF-003 | 파일 스토리지 | P1

| 항목 | 기준 |
|------|------|
| 서비스 | AWS S3 |
| 버킷 구조 | testbridge-{env}/icons/, screenshots/, profiles/, attachments/ |
| 접근 제어 | Pre-signed URL (업로드/다운로드) |
| 수명 주기 | 탈퇴 사용자 파일: 30일 후 삭제 |
| CDN | CloudFront 연결 (캐싱 1년) |

---

## NFR-INF-004 | 로그 수집 | P2

| 항목 | 기준 |
|------|------|
| 수집 | CloudWatch Logs (애플리케이션 로그) |
| 포맷 | JSON 구조화 로그 { timestamp, level, service, message, context } |
| 보관 | 90일 (이후 S3 Glacier 아카이브) |
| 검색 | CloudWatch Insights 쿼리 |

### 로그 레벨

| 레벨 | 용도 |
|------|------|
| ERROR | 에러, 예외 |
| WARN | 비정상 동작 (Rate Limit, 검증 실패) |
| INFO | 주요 이벤트 (가입, 결제, 지급) |
| DEBUG | 개발 디버깅 (운영 비활성화) |

---

## NFR-INF-005 | 백업 | P2

| 항목 | 기준 |
|------|------|
| DB 자동 백업 | 매일 03:00 KST 스냅샷 |
| 보관 기간 | 7일 (운영), 30일 (월 1회 장기) |
| 복구 테스트 | 분기 1회 복구 테스트 실시 |
| RPO | 24시간 |
| RTO | 4시간 |

---

## NFR-INF-006 | CI/CD | P2

| 항목 | 기준 |
|------|------|
| 도구 | GitHub Actions |
| 프론트 | main push → Vercel 자동 배포 |
| 백엔드 | main push → Docker Build → ECR → ECS 배포 |
| 테스트 | PR 시 자동 테스트 (Unit + Integration) |
| 환경 | dev / staging / production 3단계 |

### 배포 흐름

```
PR 생성 → 자동 테스트 → 코드 리뷰 → main 머지
→ Docker Build → ECR Push → ECS Rolling Update
→ Health Check → 배포 완료
```

---

## NFR-CMP-001 | 반응형 웹 | P1

| 항목 | 기준 |
|------|------|
| 최소 너비 | 360px (Galaxy S8) |
| 브레이크포인트 | Mobile: ~767px, Tablet: 768~1023px, Desktop: 1024px~ |
| 접근 방식 | Mobile First |
| 테스트 | Chrome DevTools 디바이스 에뮬레이션 |

---

## NFR-CMP-002 | 브라우저 호환 | P1

| 브라우저 | 최소 버전 |
|----------|----------|
| Chrome | 최근 2버전 |
| Safari | 최근 2버전 |
| Edge | 최근 2버전 |
| Firefox | 지원 안 함 (초기) |
| IE | 지원 안 함 |

---

## NFR-CMP-003 | 다국어 지원 | P2

| 항목 | 기준 |
|------|------|
| 1차 | 한국어 (기본) |
| 2차 | 영어 |
| 구현 | next-intl 또는 react-i18next |
| 구조 | /locales/ko.json, /locales/en.json |
| 전환 | 사용자 설정 또는 브라우저 언어 감지 |

---

---

# 부록

---

## 부록 A. 앱 상태 전이도

```
[등록] → PENDING_APPROVAL
              │
      ┌───────┼────────┐
      ▼                ▼
 RECRUITING         REJECTED
      │
  (전원 승인)
      ▼
  IN_TESTING
      │
  (14일 완료)
      ▼
  COMPLETED
      │
  (프로덕션 확인)
      ▼
  PRODUCTION

* 별도: CANCELLED (개발자 삭제), BLOCKED (관리자 차단)
```

| 상태 | 코드 | 전이 조건 |
|------|------|----------|
| 승인 대기 | PENDING_APPROVAL | 앱 등록 완료 |
| 모집 중 | RECRUITING | 관리자 승인 |
| 테스트 중 | IN_TESTING | 전원 승인 |
| 완료 | COMPLETED | D+14 자동 |
| 프로덕션 | PRODUCTION | 개발자 확인 |
| 반려 | REJECTED | 관리자 반려 |
| 취소 | CANCELLED | 개발자 삭제 |
| 차단 | BLOCKED | 관리자 차단 |

---

## 부록 B. 테스터 지원 상태 전이도

```
[지원] → PENDING
            │
    ┌───────┼───────┐
    ▼               ▼
 APPROVED        REJECTED
    │
 (참여 중)
    │
  ┌─┴──┐
  ▼    ▼
ACTIVE DROPPED

[슬롯 없음] → WAITLISTED → (이탈 교체) → APPROVED
```

| 상태 | 설명 |
|------|------|
| PENDING | 지원 대기 |
| WAITLISTED | 대기열 |
| APPROVED | 선정 |
| REJECTED | 미선정 |
| ACTIVE | 참여 중 (옵트인 유지) |
| DROPPED | 이탈 |

---

## 부록 C. 출금 상태 전이도

```
REQUESTED → PROCESSING → COMPLETED
                       → FAILED
REQUESTED → ON_HOLD → PROCESSING / REJECTED
REQUESTED → REJECTED (포인트 복원)
```

---

## 부록 D. 비즈니스 규칙 번호 체계

| 범위 | 업무분류 |
|------|---------|
| BR-001 ~ BR-072 | COM (공통) |
| BR-073 ~ BR-175 | DEV (개발자) |
| BR-176 ~ BR-219 | TST (테스터) |
| BR-220 ~ BR-250 | RWD (리워드) |
| BR-251 ~ BR-286 | PAY (결제) |
| BR-287 ~ BR-322 | CS (고객지원) |
| BR-330 ~ BR-407 | ADM (관리자) |
| BR-500 ~ BR-505 | NFR (비기능) |

---

## 부록 E. 에러 코드 체계

| 접두사 | 업무분류 | 예시 |
|--------|---------|------|
| AUTH- | 인증 | AUTH-001 토큰 실패 |
| PRF- | 프로필 | PRF-001 닉네임 제한 |
| APP- | 앱 등록 | APP-001 중복 패키지 |
| MNG- | 앱 관리 | MNG-001 수정 불가 |
| TST- | 테스터 | TST-001 본인 앱 |
| RWD- | 리워드 | RWD-001 이미 지급 |
| WDR- | 출금 | WDR-001 최소금액 |
| CRD- | 크레딧 | CRD-001 부족 |
| PAY- | 결제 | PAY-001 금액 불일치 |
| SUB- | 구독 | SUB-001 결제 실패 |
| BST- | 부스트 | BST-001 Free 불가 |
| CS- | 고객지원 | CS-001 한도 초과 |
| NTF- | 알림 | NTF-001 SMS 미인증 |
| ADM- | 관리자 | ADM-001 출금ID 없음 |

---

## 부록 F. 요구사항 통계 최종

| 업무분류 | P1 | P2 | P3 | 합계 |
|---------|----|----|----|----|
| COM (공통) | 11 | 6 | 0 | 17 |
| DEV (개발자) | 22 | 3 | 0 | 25 |
| TST (테스터) | 12 | 8 | 0 | 20 |
| RWD (리워드) | 3 | 12 | 0 | 15 |
| PAY (결제) | 4 | 5 | 1 | 10 |
| CS (고객지원) | 0 | 14 | 0 | 14 |
| ADM (관리자) | 0 | 22 | 1 | 23 |
| NFR (비기능) | 13 | 7 | 0 | 20 |
| **합계** | **65** | **77** | **2** | **144** |

### MVP (P1) 범위 — 65건, 예상 3~4개월

| 분류 | P1 건수 | 핵심 |
|------|--------|------|
| COM | 11 | 인증, 프로필, 알림 |
| DEV | 22 | 대시보드, 앱 등록 4단계, 테스트 관리 |
| TST | 12 | 탐색, 지원, 참여, 피드백 |
| RWD | 3 | 잔액, 내역, 자동 지급 |
| PAY | 4 | 건별 결제, 수단 등록, 내역 |
| NFR | 13 | 성능, 보안, 인프라, 반응형 |

---

## 부록 G. 다음 설계 단계

이 기능 상세 정의서를 기반으로 다음 순서대로 진행:

```
1. 데이터베이스 설계 (ERD)
   - 엔티티 도출, 관계 정의, 인덱스 설계
   
2. API 설계
   - RESTful 엔드포인트 정의
   - 요청/응답 스키마 (OpenAPI 3.0)
   
3. 시스템 아키텍처 설계
   - 인프라 다이어그램
   - 배포 아키텍처
   
4. 상세 UI 설계
   - 피그마 디자인 시스템
   - 컴포넌트 라이브러리
   
5. 개발 착수
```
