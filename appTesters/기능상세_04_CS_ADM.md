# TestBridge 기능 상세 정의서 ④ CS + ADM

---

# 6. 고객지원 (CS) — 14건 (전체 P2)

---

## CS-INQ-001 | 문의 유형 선택 | P2

| 코드 | 유형 | 자동 우선순위 |
|------|------|-------------|
| BUG | 버그 신고 | 보통 |
| PAYMENT | 결제/환불 | 높음 |
| ACCOUNT | 계정 문제 | 높음 |
| TEST | 테스트 관련 | 보통 |
| REWARD | 리워드/출금 | 높음 |
| REPORT | 신고/제보 | 긴급 |
| FEATURE | 기능 제안 | 낮음 |
| OTHER | 기타 | 보통 |

---

## CS-INQ-002 | 문의 작성 | P2

### 입력값

| 항목 | 타입 | 필수 | 제약 | 설명 |
|------|------|------|------|------|
| inquiryType | Enum | Y | 8개 | 유형 |
| title | String | Y | 5~100자 | 제목 |
| relatedAppId | Number | N | 존재 ID | 관련 앱 |
| content | String | Y | 10~3,000자 | 내용 |
| attachments | File[] | N | JPG/PNG/PDF, 각10MB, 3개 | 첨부 |

### 비즈니스 규칙

| 규칙 ID | 규칙 | 상세 |
|---------|------|------|
| BR-287 | 티켓 번호 | CS-{4자리 자동증가} |
| BR-288 | 접수 이메일 | 확인 이메일(티켓번호 포함) |
| BR-289 | 관리자 알림 | 신규 문의 알림 |
| BR-290 | 우선순위 | 유형별 자동 배정 |
| BR-291 | 1일 5건 | 스팸 방지 |
| BR-292 | 앱 자동 첨부 | relatedAppId 선택 시 앱 정보 첨부 |

### 에러: CS-001(429) 한도초과, CS-002(413) 파일크기

### 티켓 상태 전이

```
SUBMITTED → IN_PROGRESS → ANSWERED → CLOSED(7일 자동)
                                   ↗ REOPENED → ANSWERED
```

---

## CS-INQ-003 | 문의 제출 | P2

접수 토스트("CS-XXXX 접수"), 확인 이메일 비동기, "내 문의" 탭 자동 이동

---

## CS-INQ-004 | 내 문의 조회 | P2

### 출력값: ticketId, title, status, messageCount, createdAt

최신순, 상태 색상(SUBMITTED:주황, IN_PROGRESS:파랑, ANSWERED:초록, CLOSED:회색), 클릭→대화 히스토리

---

## CS-INQ-005 | 빠른 연락 | P2

| 채널 | 연락처 | 시간 |
|------|--------|------|
| 이메일 | support@testbridge.kr | 24시간 |
| 카카오 | @TestBridge | 평일 09~18 |

"평균 응답 2시간" 표시

---

## CS-FAQ-001 | FAQ 목록 | P2

아코디언 펼침/접기, 카테고리 배지, 관리자 CRUD

---

## CS-FAQ-002 | FAQ 카테고리 필터 | P2

category: ALL/TEST/REWARD/PAYMENT/ACCOUNT. 기본 ALL. 칩 버튼.

---

## CS-FAQ-003 | FAQ 관리 (관리자) | P2

CRUD + 드래그앤드롭 순서 + 즉시 반영

---

## CS-NTC-001 | 공지사항 목록 | P2

### 출력값: id, tag(IMPORTANT/NOTICE/UPDATE/EVENT), title, date, preview, isPinned

고정 상단→최신순, 태그 색상(빨강/파랑/초록/주황)

---

## CS-NTC-002 | 공지사항 상세 | P2

title, content(HTML 렌더링), date, tag

---

## CS-NTC-003 | 공지사항 관리 | P2

에디터 작성, 태그/고정 설정, 수정/삭제

---

## CS-RPT-001 | 사용자 신고 | P2

### 입력값

| 항목 | 타입 | 필수 | 설명 |
|------|------|------|------|
| targetUserId | Number | Y | 대상 |
| reason | Enum | Y | FAKE_REVIEW/NO_PARTICIPATION/ABUSE/SPAM/OTHER |
| detail | String | N | 500자 |

### 비즈니스 규칙

| 규칙 ID | 규칙 | 상세 |
|---------|------|------|
| BR-315 | 본인 불가 | 자기 자신 불가 |
| BR-316 | 중복 제한 | 동일 대상 24시간 재신고 불가 |
| BR-317 | 관리자 | 긴급 알림 |
| BR-318 | 누적 | 3건↑ 자동 플래그 |

---

## CS-RPT-002 | 앱 신고 | P2

### 입력값

| 항목 | 타입 | 필수 | 설명 |
|------|------|------|------|
| targetAppId | Number | Y | 앱 |
| reason | Enum | Y | GAMBLING/ILLEGAL/FRAUD/INAPPROPRIATE/OTHER |
| detail | String | N | 500자 |

본인 앱 불가, 3건↑ 자동 플래그+긴급 알림

---

## CS-RPT-003 | 신고 처리 알림 | P2

접수 알림→결과 알림(상세 비공개)

---

---

# 7. 관리자 (ADM) — 23건 (P2: 22건, P3: 1건)

---

## ADM-DSH-001 | 핵심 지표 | P2

### 출력값

| 항목 | 산출 |
|------|------|
| totalUsers | COUNT(ACTIVE users) |
| dau | 오늘 로그인 |
| mau | 30일 로그인 |
| activeTests | COUNT(IN_TESTING apps) |
| monthlyRevenue | 이번 달 결제 합 |

전월 대비 증감률 표시

---

## ADM-DSH-002 | 수익 현황 | P2

### 출력값: 구독료/수수료/건별 분류, 12개월 추이 차트

---

## ADM-DSH-003 | 긴급 알림 | P2

| 유형 | 조건 | 심각도 |
|------|------|--------|
| 신고 누적 | 3건↑ | 높음 |
| 이탈률 | >25% | 중간 |
| 대량 출금 | ≥300,000 | 높음 |
| 승인 대기 | 3일↑ | 보통 |

클릭→해당 관리 탭

---

## ADM-DSH-004 | 플랜별 분포 | P2

Free/Basic/Pro/Enterprise별 사용자 수+비율 프로그레스 바

---

## ADM-USR-001 | 사용자 검색 | P2

keyword (이름/이메일/닉네임) LIKE 검색

---

## ADM-USR-002 | 사용자 필터 | P2

filter: ALL/DEVELOPER/TESTER/SUSPENDED

---

## ADM-USR-003 | 사용자 상세 | P2

프로필, 역할, 플랜, 가입일, 앱수/테스트수, 신뢰도, 신고이력, 결제이력

---

## ADM-USR-004 | 사용자 경고 | P2

### 입력값

| 항목 | 타입 | 필수 | 설명 |
|------|------|------|------|
| userId | Number | Y | 대상 |
| reason | String | Y | 사유 (500자) |

경고 이력 기록, 이메일+인앱 알림, 3회 누적→정지 검토

---

## ADM-USR-005 | 사용자 정지 | P2

### 입력값

| 항목 | 타입 | 필수 | 설명 |
|------|------|------|------|
| userId | Number | Y | 대상 |
| type | Enum | Y | TEMPORARY/PERMANENT |
| duration | Number | TEMP시 | 일수 |
| reason | String | Y | 사유 |

### 비즈니스 규칙

| 규칙 ID | 규칙 | 상세 |
|---------|------|------|
| BR-330 | 일시정지 | 기간 후 자동 해제 |
| BR-331 | 영구정지 | 수동 해제만 |
| BR-332 | 즉시 효과 | 로그인 차단, 진행 테스트 이탈 처리 |
| BR-333 | 알림 | 정지 이메일(사유+문의 안내) |

---

## ADM-APM-001 | 앱 승인 대기 목록 | P2

앱 정보, 개발자, 등록일, 리워드, 경과. 오래된 순, 3일↑ 경고 배지.

---

## ADM-APM-002 | 앱 승인/반려 | P2

### 입력값

| 항목 | 타입 | 필수 | 설명 |
|------|------|------|------|
| appId | Number | Y | 앱 |
| action | Enum | Y | APPROVE/REJECT |
| rejectReason | String | REJECT시 | 반려 사유 |

### 비즈니스 규칙

| 규칙 ID | 규칙 | 상세 |
|---------|------|------|
| BR-340 | 승인 | PENDING→RECRUITING + 개발자 알림 |
| BR-341 | 반려 | PENDING→REJECTED + 사유 이메일 |
| BR-342 | 검토 | 설명, 링크, 카테고리, 도박/불법 여부 |

---

## ADM-APM-003 | 앱 상태 필터 | P2

filter: PENDING/ACTIVE/REPORTED/BLOCKED

---

## ADM-APM-004 | 앱 차단 | P2

### 입력값

| 항목 | 타입 | 필수 | 설명 |
|------|------|------|------|
| appId | Number | Y | 앱 |
| reason | String | Y | 차단 사유 |

### 비즈니스 규칙

| 규칙 ID | 규칙 | 상세 |
|---------|------|------|
| BR-345 | 상태 | → BLOCKED |
| BR-346 | 진행 중 | IN_TESTING이면 강제 종료, 테스터 리워드 지급 |
| BR-347 | 알림 | 차단 사유 이메일 |

---

## ADM-STL-001 | 정산 요약 | P2

| 항목 | 설명 |
|------|------|
| unpaidReward | 미지급 리워드 총액 |
| pendingWithdrawal | 출금 대기 총액 |
| monthlyPaid | 이번 달 지급 총액 |

---

## ADM-STL-002 | 출금 요청 처리 | P2

### 입력값

| 항목 | 타입 | 필수 | 설명 |
|------|------|------|------|
| withdrawalId | Number | Y | 출금 ID |
| action | Enum | Y | APPROVE/HOLD/REJECT |
| reason | String | HOLD/REJECT시 | 사유 |

### 이상 거래 자동 감지 (flagged=true)

| 조건 | 사유 |
|------|------|
| 1회 ≥300,000 | "1회 30만↑" |
| 일 누적 ≥500,000 | "일일 50만↑" |
| 가입 ≤7일 | "가입 7일 이내" |
| 신뢰도 ≤30 | "신뢰도 낮음" |
| 첫 출금 ≥100,000 | "첫 출금 10만↑" |

### 비즈니스 규칙

| 규칙 ID | 규칙 | 상세 |
|---------|------|------|
| BR-401 | 감지 | 조건별 자동 플래그 |
| BR-402 | 승인 | REQUESTED → PROCESSING |
| BR-403 | 보류 | 사유 이메일 + 추가 확인 요청 |
| BR-404 | 거절 | 포인트 복원 + 사유 이메일 |
| BR-405 | 배치 | 매 영업일 14:00 이체 |
| BR-406 | 완료 | PROCESSING → COMPLETED + 알림 |
| BR-407 | 실패 | PROCESSING → FAILED + 재확인 |

### 상태 전이

```
REQUESTED ─승인→ PROCESSING ─이체성공→ COMPLETED
                            ─이체실패→ FAILED
REQUESTED ─보류→ ON_HOLD ─승인→ PROCESSING
                        ─거절→ REJECTED (포인트복원)
REQUESTED ─거절→ REJECTED (포인트복원)
```

---

## ADM-STL-003 | 리워드 대기 목록 | P2

앱별 테스터 수, 총액, 예정일. "즉시 지급" 버튼(긴급 수동 지급).

---

## ADM-STL-004 | 수수료 수익 현황 | P2

플랜별 수수료율, 총 수익, 월별 추이

---

## ADM-CSM-001 | CS 현황 통계 | P2

미답변 수, 처리 중 수, 오늘 완료 수

---

## ADM-CSM-002 | 미답변 문의 목록 | P2

우선순위(긴급/높음/보통), 유형, 제목, 작성자, 시간. 24시간↑ 빨간 경고.

---

## ADM-CSM-003 | 문의 답변 | P2

### 입력값

| 항목 | 타입 | 필수 | 제약 | 설명 |
|------|------|------|------|------|
| ticketId | String | Y | CS-XXXX | 티켓 |
| answer | String | Y | 10~5,000자 | 답변 |
| attachments | File[] | N | 3개, 각10MB | 첨부 |

### 비즈니스 규칙

| 규칙 ID | 규칙 | 상세 |
|---------|------|------|
| BR-350 | 상태 변경 | IN_PROGRESS → ANSWERED |
| BR-351 | 이메일 발송 | 사용자에게 답변 이메일 (답변 전문 포함) |
| BR-352 | 대화 이력 | 이전 대화 이력 조회 가능 |

---

## ADM-CSM-004 | 담당자 배정 | P3

### 비즈니스 규칙

| 규칙 ID | 규칙 | 상세 |
|---------|------|------|
| BR-353 | 배정 | 문의별 담당 관리자 지정 |
| BR-354 | 자동 배정 | 유형별 담당자 자동 배정 (설정 가능) |
| BR-355 | 재배정 | 다른 담당자로 이관 가능 |

---

## ADM-CSM-005 | 신고 처리 | P2

### 입력값

| 항목 | 타입 | 필수 | 설명 |
|------|------|------|------|
| reportId | Number | Y | 신고 ID |
| action | Enum | Y | WARNING/SUSPEND/BLOCK_APP/DISMISS |
| reason | String | Y | 처리 사유 |

### 비즈니스 규칙

| 규칙 ID | 규칙 | 상세 |
|---------|------|------|
| BR-356 | WARNING | 대상에게 경고 (ADM-USR-004) |
| BR-357 | SUSPEND | 대상 정지 (ADM-USR-005) |
| BR-358 | BLOCK_APP | 앱 차단 (ADM-APM-004) |
| BR-359 | DISMISS | 신고 기각. 신고자에게 "처리 완료" 알림 |
| BR-360 | 처리 이력 | 모든 처리 이력 기록 |
