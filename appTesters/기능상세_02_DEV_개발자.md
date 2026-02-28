# TestBridge 기능 상세 정의서 ② 개발자 (DEV)

**업무분류**: DEV (개발자)  
**요구사항 수**: 25건 (P1: 22건, P2: 3건)

---

## DEV-DSH-001 | 대시보드 요약 카드 | P1

### 출력값

| 항목 | 산출 |
|------|------|
| inProgressCount | COUNT(apps WHERE status=IN_TESTING) |
| recruitingCount | COUNT(apps WHERE status=RECRUITING) |
| completedCount | COUNT(apps WHERE status IN (COMPLETED, PRODUCTION)) |
| creditBalance | user.creditBalance |

### 비즈니스 규칙

| 규칙 ID | 규칙 | 상세 |
|---------|------|------|
| BR-073 | 실시간 조회 | 진입 시 최신 데이터 |
| BR-074 | 빈 상태 | 0건 → "첫 앱을 등록해보세요!" + 등록 버튼 |
| BR-075 | 카드 클릭 | D-03 해당 필터로 이동 |

### 연관: DEV-MNG-001, RWD-CRD-003

---

## DEV-DSH-002 | 진행 중 테스트 목록 | P1

### 출력값 (각 카드)

| 항목 | 타입 | 설명 |
|------|------|------|
| appId | Number | 앱 ID |
| appIcon | URL | 아이콘 |
| appName | String | 앱 이름 |
| status | Enum | RECRUITING, IN_TESTING |
| currentDay | Number | 경과 일수 |
| activeTesters / targetTesters | Number | 유지/목표 수 |
| progressPercent | Number | (currentDay/14)×100 |

### 비즈니스 규칙

| 규칙 ID | 규칙 | 상세 |
|---------|------|------|
| BR-076 | 정렬 | D-Day 적은 순 → 모집 중 하단 |
| BR-077 | 카드 클릭 | D-04 앱 상세 이동 |
| BR-078 | 최대 10개 | 초과 시 "더보기" → D-03 |

### 연관: DEV-MNG-001, DEV-TSM-001

---

## DEV-DSH-003 | 최근 피드백 미리보기 | P1

### 출력값 (3건)

| 항목 | 타입 | 설명 |
|------|------|------|
| appName | String | 앱 이름 |
| testerNickname | String | 테스터 |
| rating | Number | 별점 (1~5) |
| message | String | 텍스트 (100자 잘림) |
| createdAt | DateTime | 작성 시간 |

### 비즈니스 규칙

| 규칙 ID | 규칙 | 상세 |
|---------|------|------|
| BR-079 | 최신 3건 | 전체 앱 피드백 중 |
| BR-080 | 클릭 | D-04 피드백 탭 이동 |
| BR-081 | 빈 상태 | "수신된 피드백이 없습니다" |

### 연관: DEV-TSM-008

---

## DEV-APP-001 | 앱 기본 정보 입력 | P1

### 입력값

| 항목 | 타입 | 필수 | 제약 | 설명 |
|------|------|------|------|------|
| appName | String | Y | 2~50자 | 앱 이름 |
| packageName | String | Y | `^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*){2,}$`, 150자 | 패키지명 |
| categoryId | Number | Y | categories 테이블 ID | 카테고리 |
| description | String | Y | 10~500자 | 설명 |

### 비즈니스 규칙

| 규칙 ID | 규칙 | 상세 |
|---------|------|------|
| BR-082 | 패키지명 중복 | 전체 DB 중복 불가 |
| BR-083 | 실시간 검증 | blur 시 중복+형식 |
| BR-084 | 임시 저장 | 세션에 Step1 저장, 뒤로가기 복원 |
| BR-085 | 등록 한도 | 진입 시 월 한도 확인 |

### 유효성 검증

| 항목 | 규칙 | 에러 메시지 |
|------|------|-----------|
| appName | 빈 값 | "앱 이름을 입력해주세요." |
| appName | 2~50자 | "2~50자로 입력해주세요." |
| packageName | 빈 값 | "패키지명을 입력해주세요." |
| packageName | 형식 | "올바른 형식이 아닙니다. (예: com.example.myapp)" |
| packageName | 중복 | "이미 등록된 패키지명입니다." |
| categoryId | 미선택 | "카테고리를 선택해주세요." |
| description | 10~500자 | "10~500자로 입력해주세요." |

### 에러 처리

| 에러 코드 | HTTP | 상황 | 응답 메시지 |
|----------|------|------|-----------|
| APP-001 | 409 | 중복 | "이미 등록된 패키지명입니다." |
| APP-002 | 403 | 한도 초과 | "이번 달 등록 한도를 초과했습니다." |

### 화면 연결: D-01→"새 앱 등록"→D-02 Step1→"다음"→Step2

### 연관: DEV-APP-002~003, DEV-APP-014~015

---

## DEV-APP-002 | 앱 아이콘 업로드 | P1

### 입력값

| 항목 | 타입 | 필수 | 제약 | 설명 |
|------|------|------|------|------|
| appIcon | File | Y | JPG/PNG, 2MB, 128px 이상 | 아이콘 |

### 비즈니스 규칙

| 규칙 ID | 규칙 | 상세 |
|---------|------|------|
| BR-086 | 다중 크기 | 128/256/512px 자동 생성 |
| BR-087 | 정사각형 | 비정사각 → 중앙 크롭 |
| BR-088 | CDN | S3→CloudFront URL |
| BR-089 | 미리보기 | 업로드 전 미리보기 |

### 유효성 검증

| 항목 | 규칙 | 에러 메시지 |
|------|------|-----------|
| appIcon | 미업로드 | "아이콘을 업로드해주세요." |
| appIcon | 2MB | "2MB 이하여야 합니다." |
| appIcon | JPG/PNG | "JPG 또는 PNG만 가능합니다." |
| appIcon | 128px | "128x128px 이상이어야 합니다." |

### 연관: DEV-APP-001, NFR-INF-003

---

## DEV-APP-003 | 스크린샷 업로드 | P1

### 입력값

| 항목 | 타입 | 필수 | 제약 | 설명 |
|------|------|------|------|------|
| screenshots | File[] | N | JPG/PNG, 각 5MB, 최대 5장 | 스크린샷 |

### 비즈니스 규칙

| 규칙 ID | 규칙 | 상세 |
|---------|------|------|
| BR-090 | 순서 | 드래그앤드롭 순서 변경 |
| BR-091 | 개별 삭제 | X 버튼 삭제 |
| BR-092 | 썸네일 | 원본 + 320xAuto 자동 |

### 연관: DEV-APP-001

---

## DEV-APP-004 | 테스트 유형 선택 | P1

### 입력값

| 항목 | 타입 | 필수 | 설명 |
|------|------|------|------|
| testType | Enum | Y | PAID_REWARD, CREDIT_EXCHANGE |

### 비즈니스 규칙

| 규칙 ID | 규칙 | 상세 |
|---------|------|------|
| BR-093 | PAID_REWARD | Step3 리워드 설정 + 결제 |
| BR-094 | CREDIT_EXCHANGE | 크레딧 50 차감, Step3 건너뜀 |
| BR-095 | 크레딧 부족 | 잔액<50 → 안내 + 테스트 참여 유도 |
| BR-096 | Free 제한 | Free → CREDIT_EXCHANGE만 |

### 에러 처리

| 에러 코드 | HTTP | 상황 | 응답 메시지 |
|----------|------|------|-----------|
| APP-003 | 403 | 크레딧 부족 | "크레딧 부족. 현재: {N}/필요: 50" |
| APP-004 | 403 | Free 유료 | "Free는 상호 테스트만 가능" |

### 연관: RWD-CRD-002, PAY-SUB-001

---

## DEV-APP-005 | 테스터 수 설정 | P1

### 입력값

| 항목 | 타입 | 필수 | 제약 | 설명 |
|------|------|------|------|------|
| targetTesters | Number | Y | 20~플랜상한, 정수 | 테스터 수 |

### 비즈니스 규칙

| 규칙 ID | 규칙 | 상세 |
|---------|------|------|
| BR-097 | 최소 20명 | Google Play 정책 |
| BR-098 | 플랜 상한 | FREE:20, BASIC:25, PRO:30, ENTERPRISE:40 |
| BR-099 | 권장 안내 | "이탈 대비 25명 이상 권장" |

### 유효성 검증

| 항목 | 규칙 | 에러 메시지 |
|------|------|-----------|
| targetTesters | 20 미만 | "최소 20명 이상" |
| targetTesters | 플랜 초과 | "{plan}에서 최대 {max}명" |

### 연관: DEV-APP-004, PAY-SUB-001

---

## DEV-APP-006 | 테스트 기간 설정 | P1

### 비즈니스 규칙

| 규칙 ID | 규칙 | 상세 |
|---------|------|------|
| BR-101 | 14일 고정 | 변경 불가. UI "14일 (고정)" 표시 |
| BR-102 | 시작일 | 전원 승인 시점 |
| BR-103 | 종료 | 시작일 + 14일차 23:59:59 |

### 연관: DEV-TSM-001

---

## DEV-APP-007 | Google Play 테스트 링크 | P1

### 입력값

| 항목 | 타입 | 필수 | 제약 | 설명 |
|------|------|------|------|------|
| testLink | URL | Y | `https://play.google.com/apps/testing/` 시작 | 링크 |

### 비즈니스 규칙

| 규칙 ID | 규칙 | 상세 |
|---------|------|------|
| BR-104 | URL 형식 | play.google.com/apps/testing/{pkg} 만 |
| BR-105 | 패키지 일치 | URL 패키지 = Step1 packageName 비교 |
| BR-106 | 변경 불가 | IN_TESTING 이후 변경 불가 |

### 유효성 검증

| 항목 | 규칙 | 에러 메시지 |
|------|------|-----------|
| testLink | 형식 | "올바른 Google Play 테스트 링크를 입력해주세요." |
| testLink | 패키지 불일치 | "패키지명이 일치하지 않습니다." |

### 연관: DEV-APP-001, TST-MYT-002

---

## DEV-APP-008 | 리워드 유형 선택 | P1

### 입력값

| 항목 | 타입 | 필수 | 설명 |
|------|------|------|------|
| rewardType | Enum | Y | BASIC, WITH_FEEDBACK, ADVANCED |

### 비즈니스 규칙

| 규칙 ID | 규칙 | 상세 |
|---------|------|------|
| BR-107 | BASIC | 옵트인만. 1,000~2,000원 |
| BR-108 | WITH_FEEDBACK | 옵트인+피드백. 2,000~4,000원 |
| BR-109 | ADVANCED | 옵트인+리뷰+버그. 4,000~8,000원 |
| BR-110 | Step4 연동 | 유형에 따라 피드백 필수항목 자동 설정 |

### 연관: DEV-APP-009, DEV-APP-011

---

## DEV-APP-009 | 리워드 금액 설정 | P1

### 입력값

| 항목 | 타입 | 필수 | 제약 | 설명 |
|------|------|------|------|------|
| rewardAmount | Number | Y | 유형별 범위, 500원 단위 | 1인당 |

### 비즈니스 규칙

| 규칙 ID | 규칙 | 상세 |
|---------|------|------|
| BR-111 | 범위 | BASIC:1k~2k, FEEDBACK:2k~4k, ADVANCED:4k~8k |
| BR-112 | 500원 단위 | 500원 단위만 |
| BR-113 | 변경 불가 | 모집 시작 후 변경 불가 |

### 연관: DEV-APP-008, DEV-APP-010

---

## DEV-APP-010 | 예상 비용 계산 | P1

### 출력값

| 항목 | 공식 |
|------|------|
| rewardTotal | targetTesters × rewardAmount |
| platformFee | rewardTotal × feeRate |
| totalCost | rewardTotal + platformFee (VAT 포함) |

### 비즈니스 규칙

| 규칙 ID | 규칙 | 상세 |
|---------|------|------|
| BR-114 | 수수료율 | FREE:15%, BASIC:10%, PRO:7%, ENTERPRISE:5% |
| BR-115 | 실시간 | 입력 변경 즉시 재계산 |
| BR-116 | VAT 포함 | 표시 금액 = 부가세 10% 포함 |

### 연관: DEV-APP-005, DEV-APP-009

---

## DEV-APP-011 | 피드백 필수 여부 | P1

### 입력값

| 항목 | 타입 | 필수 | 설명 |
|------|------|------|------|
| feedbackRequired | Boolean | Y | 피드백 필수 여부 |

### 비즈니스 규칙

| 규칙 ID | 규칙 | 상세 |
|---------|------|------|
| BR-117 | 유형 연동 | WITH_FEEDBACK/ADVANCED → 자동 true (변경불가) |
| BR-118 | 리워드 조건 | true면 미제출 시 미지급 |
| BR-119 | 제출 기한 | 종료일+3일 |

### 연관: DEV-APP-008, TST-FDB-001

---

## DEV-APP-012 | 피드백 항목 설정 | P1

### 입력값

| 항목 | 타입 | 필수 | 설명 |
|------|------|------|------|
| feedbackItems | String[] | Y (1개↑) | UI_UX, PERFORMANCE, FUNCTIONALITY, STABILITY |

### 비즈니스 규칙

| 규칙 ID | 규칙 | 상세 |
|---------|------|------|
| BR-120 | 최소 1개 | 필수 |
| BR-121 | 항목별 1~5점 | 테스터 별점 부여 |

### 연관: DEV-APP-011, TST-FDB-002

---

## DEV-APP-013 | 테스트 가이드 작성 | P1

### 입력값

| 항목 | 타입 | 필수 | 제약 | 설명 |
|------|------|------|------|------|
| testGuide | String | N | 2,000자 | 테스트 가이드 |

### 비즈니스 규칙

| 규칙 ID | 규칙 | 상세 |
|---------|------|------|
| BR-122 | 일반 텍스트 | 줄바꿈 허용, 마크다운 미지원 |
| BR-123 | 수정 가능 | 모집/테스트 중에도 수정. 변경 시 참여자 알림 |

### 연관: TST-DTL-003

---

## DEV-APP-014 | 앱 등록 검증 | P1

### 비즈니스 규칙

| 규칙 ID | 규칙 | 상세 |
|---------|------|------|
| BR-124 | 필수 필드 | Step1~4 전체 검증 |
| BR-125 | 한도 확인 | 월 등록 수 초과 시 불가 |
| BR-126 | 결제 확인 | PAID_REWARD → 결제 완료 필수 |
| BR-127 | 크레딧 확인 | CREDIT_EXCHANGE → 50크레딧 차감 |
| BR-128 | 초기 상태 | status=PENDING_APPROVAL |
| BR-129 | 승인 후 | → RECRUITING |

### 에러 처리

| 에러 코드 | HTTP | 상황 | 응답 메시지 |
|----------|------|------|-----------|
| APP-005 | 400 | 필드 누락 | 해당 Step 이동 |
| APP-006 | 403 | 한도 초과 | "등록 한도 초과" |
| APP-007 | 402 | 결제 실패 | "결제에 실패했습니다." |

### 상태 변화: (없음)→PENDING_APPROVAL→(관리자 승인)→RECRUITING

### 연관: DEV-APP-001~013, ADM-APM-002

---

## DEV-APP-015 | 카테고리 목록 | P1

### 목록: 게임🎮, 유틸리티🔧, 소셜💬, 건강🏃, 교육📚, 금융💰, 라이프🏠, 사진📷, 음악🎵, 생산성📋, 여행✈️, 쇼핑🛒, 뉴스📰, 기타📱 (14개)

### 비즈니스 규칙

| 규칙 ID | 규칙 | 상세 |
|---------|------|------|
| BR-130 | 관리자 편집 | 추가/수정/삭제/순서 |
| BR-131 | 삭제 제한 | 앱 존재 시 불가 |
| BR-132 | 캐싱 | 24시간 클라이언트 캐싱 |

### 연관: DEV-APP-001

---

## DEV-MNG-001 | 내 앱 목록 | P1

### 출력값 (각 카드)

| 항목 | 타입 | 설명 |
|------|------|------|
| appId, appIcon, appName | - | 기본 정보 |
| status | Enum | 6개 상태 |
| progressPercent | Number | 진행률 |
| activeTesters / targetTesters | Number | 유지/목표 |
| createdAt | DateTime | 등록일 |

### 비즈니스 규칙

| 규칙 ID | 규칙 | 상세 |
|---------|------|------|
| BR-133 | 정렬 | 최신순 |
| BR-134 | 10개/페이지 | 페이지네이션 |
| BR-135 | 상태 색상 | PENDING:회, RECRUITING:주황, IN_TESTING:파랑, COMPLETED:초록, PRODUCTION:진한초록, REJECTED:빨강 |
| BR-136 | 카드 클릭 | D-04 이동 |

### 연관: DEV-MNG-002, DEV-DSH-002

---

## DEV-MNG-002 | 상태 필터링 | P1

### 입력값

| 항목 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| statusFilter | Enum | ALL | ALL/RECRUITING/IN_TESTING/COMPLETED/PRODUCTION |

### 비즈니스 규칙: 필터 유지 (화면 이동 후 복귀 시)

### 연관: DEV-MNG-001

---

## DEV-MNG-003 | 앱 수정 | P1

### 비즈니스 규칙

| 규칙 ID | 규칙 | 상세 |
|---------|------|------|
| BR-138 | 수정 가능 상태 | PENDING_APPROVAL, RECRUITING만 |
| BR-139 | 불가 필드 | IN_TESTING 이후: 패키지명, 유형, 금액, 수 |
| BR-140 | 항상 수정 가능 | 설명, 스크린샷, 가이드 |
| BR-141 | 재승인 불필요 | RECRUITING 수정 → 즉시 반영 |

### 에러: MNG-001 (403) "현재 상태에서 수정 불가"

### 연관: DEV-APP-001~013

---

## DEV-MNG-004 | 앱 삭제/취소 | P2

### 비즈니스 규칙

| 규칙 ID | 규칙 | 상세 |
|---------|------|------|
| BR-142 | 가능 상태 | PENDING_APPROVAL, RECRUITING만 |
| BR-143 | 전액 환불 | 지원자 없을 때 |
| BR-144 | 비례 환불 | 지원자 있을 때 미매칭분 |
| BR-145 | 확인 | "삭제하면 복구 불가" |

### 상태: → CANCELLED

### 연관: DEV-MNG-001

---

## DEV-TSM-001 | 테스트 현황 개요 | P1

### 출력값

| 항목 | 타입 | 설명 |
|------|------|------|
| status | Enum | 상태 |
| startDate / endDate | Date | 시작/종료 |
| currentDay | Number | 경과 일수 |
| activeTesters | Number | 유지 수 |
| droppedTesters | Number | 이탈 수 |
| waitlistTesters | Number | 대기열 |
| targetTesters | Number | 목표 |

### 비즈니스 규칙

| 규칙 ID | 규칙 | 상세 |
|---------|------|------|
| BR-146 | D-Day | today - startDate + 1 |
| BR-147 | 자동 종료 | D+14 23:59:59 → COMPLETED (스케줄러) |
| BR-148 | 성공 기준 | "12명 이상 유지 필요" |
| BR-149 | 위험 표시 | active<12 → 빨간 경고 |

### 연관: DEV-APP-006, DEV-TSM-002

---

## DEV-TSM-002 | 이탈 알림 | P1

### 출력값

| 항목 | 타입 | 설명 |
|------|------|------|
| testerNickname | String | 이탈자 |
| reason | String | 사유 |
| autoReplaced | Boolean | 자동 교체 여부 |
| replacedBy | String | 교체 테스터 |

### 비즈니스 규칙

| 규칙 ID | 규칙 | 상세 |
|---------|------|------|
| BR-150 | 자동 교체 | 대기열 있으면 교체 |
| BR-151 | 위험 | active < target×0.7 → "위험" |
| BR-152 | 페널티 | 이탈 테스터 신뢰도 -10 |

### 연관: DEV-TSM-005, TST-TRS-003

---

## DEV-TSM-003 | 지원자 목록 | P1

### 출력값 (각 지원자)

| 항목 | 타입 | 설명 |
|------|------|------|
| testerId, nickname, profileImage | - | 기본 |
| trustScore | Number | 신뢰도 0~100 |
| badgeLevel | Enum | BRONZE~DIAMOND |
| completedTests, completionRate | Number | 이력 |
| deviceInfo | String | 기기 |
| appliedAt | DateTime | 지원일 |
| status | Enum | PENDING/APPROVED/REJECTED |

### 비즈니스 규칙

| 규칙 ID | 규칙 | 상세 |
|---------|------|------|
| BR-153 | 정렬 | 신뢰도 DESC |
| BR-154 | 정보 제한 | 이메일 비노출 |

### 연관: DEV-TSM-004

---

## DEV-TSM-004 | 지원자 승인/거절 | P1

### 입력값

| 항목 | 타입 | 필수 | 설명 |
|------|------|------|------|
| testerId | Number | Y | 대상 |
| action | Enum | Y | APPROVE, REJECT |

### 비즈니스 규칙

| 규칙 ID | 규칙 | 상세 |
|---------|------|------|
| BR-155 | 인원 제한 | targetTesters까지만 승인 |
| BR-156 | 승인 알림 | 선정 알림 + 테스트 링크 |
| BR-157 | 거절 알림 | 미선정 알림 |
| BR-158 | 일괄 승인 | "전체 승인" (상위 N명) |
| BR-159 | 시작 트리거 | 전원 승인 → IN_TESTING + 14일 시작 |

### 상태 변화
- Application: PENDING → APPROVED/REJECTED
- App: RECRUITING → IN_TESTING (전원 시)

### 연관: DEV-TSM-003, COM-NTF-001

---

## DEV-TSM-005 | 대기열 관리 | P1

### 비즈니스 규칙

| 규칙 ID | 규칙 | 상세 |
|---------|------|------|
| BR-160 | 대기열 규모 | target의 20% 추가 |
| BR-161 | 자동 교체 | 이탈 시 1순위 자동 선정 |
| BR-162 | 교체 기한 | D+10 이후 이탈 → 교체 안 함 |
| BR-163 | 순서 | 신뢰도 높은 순 |

### 연관: DEV-TSM-002, DEV-TSM-004

---

## DEV-TSM-006 | 참여자 모니터링 | P1

### 출력값 (각 참여자)

| 항목 | 타입 | 설명 |
|------|------|------|
| nickname | String | 닉네임 |
| status | Enum | ACTIVE, DROPPED |
| participationDay | Number | 일차 |
| lastAppRunAt | DateTime | 최근 실행 |
| feedbackSubmitted | Boolean | 피드백 제출 |

### 비즈니스 규칙

| 규칙 ID | 규칙 | 상세 |
|---------|------|------|
| BR-164 | 색상 | ACTIVE:초록, DROPPED:빨강 |
| BR-165 | 미실행 경고 | 48시간 미실행 → 주황 |

### 연관: DEV-TSM-001

---

## DEV-TSM-007 | 참여자 메시지 발송 | P2

### 입력값

| 항목 | 타입 | 필수 | 제약 | 설명 |
|------|------|------|------|------|
| targetType | Enum | Y | INDIVIDUAL, ALL | 대상 |
| testerId | Number | 조건부 | | 개별 |
| message | String | Y | 10~500자 | 내용 |

### 비즈니스 규칙

| 규칙 ID | 규칙 | 상세 |
|---------|------|------|
| BR-166 | 1일 3회 | 스팸 방지 |
| BR-167 | 이메일 | 인앱 채팅 미구현, 이메일로 |

### 연관: DEV-TSM-006, COM-NTF-001

---

## DEV-TSM-008 | 피드백 목록 조회 | P1

### 출력값

| 항목 | 타입 | 설명 |
|------|------|------|
| averageRating | Number | 평균 별점 |
| totalFeedbacks | Number | 총 수 |
| feedbacks[] | Array | 피드백 리스트 (닉네임, 별점, 항목별, 텍스트, 버그, 시간) |

### 비즈니스 규칙

| 규칙 ID | 규칙 | 상세 |
|---------|------|------|
| BR-168 | 정렬 | 최신순 (별점순 가능) |
| BR-169 | 필터 | 전체/피드백만/버그만 |
| BR-170 | 항목별 평균 | 각 항목 평균 표시 |

### 연관: TST-FDB-001~004

---

## DEV-TSM-009 | 프로덕션 등록 가이드 | P1

### 체크리스트

| 항목 | 자동 | 설명 |
|------|------|------|
| 12명 이상 14일 유지 | Y | active≥12 확인 |
| 피드백 수집 완료 | Y | feedbackRequired 시 |
| 피드백 반영 업데이트 | N | 수동 체크 |
| 프로덕션 액세스 신청 | N | 수동 |
| Google 질문 답변 | N | 수동 (템플릿 제공) |

### 비즈니스 규칙

| 규칙 ID | 규칙 | 상세 |
|---------|------|------|
| BR-171 | 자동 체크 | 조건 충족 시 |
| BR-172 | 답변 템플릿 | 복사 가능한 템플릿 |

### 연관: DEV-TSM-010

---

## DEV-TSM-010 | 프로덕션 등록 완료 확인 | P1

### 비즈니스 규칙

| 규칙 ID | 규칙 | 상세 |
|---------|------|------|
| BR-173 | 활성 조건 | COMPLETED + 자동항목 충족 시 버튼 활성화 |
| BR-174 | 리워드 트리거 | 확인 → 조건 충족 전원 리워드 지급 |
| BR-175 | 취소 불가 | 확인 후 취소 불가. 최종 확인 다이얼로그 |

### 상태 변화: COMPLETED → PRODUCTION + 테스터별 리워드

### 연관: DEV-TSM-009, RWD-PNT-003
