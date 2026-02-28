# TestBridge API 설계 — Part 2: 리워드·결제·CS·관리자

---

# 11. 리워드/포인트

---

### GET /tester/rewards/balance
포인트 잔액

```
응답:
{
  "data": {
    "pointBalance": 15000,
    "creditBalance": 30,
    "stats": {
      "completedTests": 12,
      "totalEarned": 48000,
      "totalWithdrawn": 30000
    }
  }
}
```

---

### GET /tester/rewards/history?type=ALL&page=1&limit=20
포인트 내역

```
type: ALL, EARNED, WITHDRAWN, EXCHANGED

응답:
{
  "data": [
    {
      "id": 1,
      "date": "2026-02-28",
      "appName": "MyApp",
      "type": "EARNED",
      "amount": "+3,000",
      "balance": 15000,
      "description": "MyApp 테스트 리워드"
    }
  ],
  "meta": { ... }
}
```

---

### GET /tester/rewards/credits?page=1&limit=20
크레딧 내역

```
응답:
{
  "data": [
    {
      "id": 1,
      "date": "2026-02-28",
      "type": "EARNED_TEST",
      "amount": "+20C",
      "balance": 30,
      "description": "OtherApp 테스트 완료"
    }
  ],
  "meta": { ... }
}
```

---

# 12. 출금

---

### POST /tester/withdrawals
출금 신청

```
요청:
{
  "method": "BANK_TRANSFER",
  "bankAccountId": 1,
  "amount": 10000
}
또는 (새 계좌):
{
  "method": "BANK_TRANSFER",
  "bankCode": "088",
  "accountNumber": "1234567890",
  "accountHolder": "홍길동",
  "amount": 10000
}

응답 201:
{
  "data": {
    "withdrawalId": 1,
    "amount": 10000,
    "fee": 0,
    "netAmount": 10000,
    "status": "REQUESTED",
    "estimatedDate": "영업일 1~3일"
  }
}

에러:
400 WDR-001 최소 10,000
400 WDR-002 잔액 초과
429 WDR-003 일일 한도
```

---

### GET /tester/withdrawals?page=1&limit=20
출금 내역

```
응답:
{
  "data": [
    {
      "id": 1,
      "date": "2026-02-25",
      "amount": 10000,
      "method": "BANK_TRANSFER",
      "account": "신한 ****7890",
      "status": "COMPLETED",
      "completedAt": "2026-02-27"
    }
  ],
  "meta": { ... }
}
```

---

### GET /tester/bank-accounts
내 계좌 목록

```
응답:
{
  "data": [
    {
      "id": 1,
      "method": "BANK_TRANSFER",
      "bankName": "신한은행",
      "accountNumber": "****7890",
      "accountHolder": "홍**",
      "isVerified": true,
      "isDefault": true
    }
  ]
}
```

---

### POST /tester/bank-accounts
계좌 등록

```
요청:
{
  "method": "BANK_TRANSFER",
  "bankCode": "088",
  "accountNumber": "1234567890",
  "accountHolder": "홍길동"
}

응답 201: { "data": { "id": 1, "isVerified": false } }
```

---

### POST /tester/bank-accounts/:id/verify
1원 인증

```
요청: { "verificationCode": "테스트브릿지" }
응답 200: { "data": { "isVerified": true } }
```

---

# 13. 기프티콘

---

### GET /tester/gifticons
기프티콘 목록

```
응답:
{
  "data": [
    { "id": 1, "name": "스타벅스 아메리카노", "brand": "스타벅스", "price": 4500, "imageUrl": "..." },
    { "id": 2, "name": "CU 5,000원", "brand": "CU", "price": 5000, "imageUrl": "..." }
  ]
}
```

---

### POST /tester/gifticons/:id/exchange
기프티콘 교환

```
응답 200:
{
  "data": {
    "exchangeId": 1,
    "productName": "스타벅스 아메리카노",
    "amount": 4500,
    "deliveryMethod": "SMS",
    "estimatedTime": "5분 이내"
  }
}

에러: 400 포인트 부족
```

---

### GET /tester/gifticons/history?page=1
교환 내역

```
응답: { "data": [{ "date": "...", "productName": "...", "amount": 4500, "status": "SENT" }], "meta": {...} }
```

---

# 14. 결제/구독

---

### GET /billing/plans
플랜 비교표

```
응답:
{
  "data": {
    "currentPlan": "BASIC",
    "plans": [
      { "plan": "FREE", "price": 0, "maxApps": 1, "maxTesters": 20, "feeRate": 0.15, ... },
      { "plan": "BASIC", "price": 19900, "maxApps": 10, "maxTesters": 25, "feeRate": 0.10, ... },
      { "plan": "PRO", "price": 49900, "maxApps": 50, "maxTesters": 30, "feeRate": 0.07, ... },
      { "plan": "ENTERPRISE", "price": 99900, "maxApps": 100, "maxTesters": 40, "feeRate": 0.05, ... }
    ]
  }
}
```

---

### POST /billing/subscribe
구독 시작/변경

```
요청: { "plan": "PRO", "paymentMethodId": 1 }

응답 200:
{
  "data": {
    "subscriptionId": 1,
    "plan": "PRO",
    "price": 49900,
    "startDate": "2026-02-28",
    "nextBillingDate": "2026-03-28",
    "chargedAmount": 30000,
    "isUpgrade": true
  }
}

에러:
402 SUB-001 결제 실패
400 SUB-002 수단 미등록
```

---

### DELETE /billing/subscribe
구독 해지

```
응답 200:
{
  "data": {
    "status": "CANCELLING",
    "effectiveDate": "2026-03-28",
    "message": "다음 결제일부터 Free로 전환됩니다."
  }
}
```

---

### GET /billing/payment-methods
결제 수단 목록

```
응답:
{
  "data": [
    { "id": 1, "type": "CARD", "label": "신한 ****1234", "isDefault": true },
    { "id": 2, "type": "TOSS_PAY", "label": "토스페이", "isDefault": false }
  ]
}
```

---

### POST /billing/payment-methods
결제 수단 등록 (PG SDK 연동 후)

```
요청: { "type": "CARD", "billingKey": "pg_billing_key_xxx", "label": "신한 ****1234", "last4": "1234" }
응답 201: { "data": { "id": 3, "isDefault": false } }
```

---

### DELETE /billing/payment-methods/:id
결제 수단 삭제

```
에러: 403 활성 구독 기본 수단 삭제 불가
```

---

### PATCH /billing/payment-methods/:id/default
기본 수단 변경

```
응답: 200
```

---

### GET /billing/payments?page=1&limit=20
결제 내역

```
응답:
{
  "data": [
    {
      "id": 1,
      "date": "2026-02-28",
      "description": "Basic 구독 (3월)",
      "amount": 19900,
      "status": "SUCCESS",
      "receiptUrl": "https://dashboard.tosspayments.com/..."
    }
  ],
  "meta": { ... }
}
```

---

### POST /billing/payments/one-time
건별 결제 (앱 등록)

```
요청:
{
  "appId": 1,
  "paymentMethod": "CARD",
  "amount": 29000,
  "successUrl": "https://testbridge.kr/payment/success",
  "failUrl": "https://testbridge.kr/payment/fail"
}

응답 200:
{
  "data": {
    "paymentUrl": "https://pay.toss...",
    "orderId": "TB-20260228-A1B2"
  }
}
```

---

### POST /billing/payments/confirm
결제 승인 (PG 리디렉트 후 서버 확인)

```
요청: { "paymentKey": "pg_key_xxx", "orderId": "TB-20260228-A1B2", "amount": 29000 }

응답 200:
{
  "data": {
    "paymentId": 1,
    "status": "SUCCESS",
    "receiptUrl": "...",
    "appId": 1,
    "appStatus": "PENDING_APPROVAL"
  }
}

에러:
400 PAY-001 금액 불일치
402 PAY-002 잔액 부족
408 PAY-003 타임아웃
409 PAY-004 중복 결제
```

---

### POST /billing/payments/:id/refund
환불 요청

```
요청: { "reason": "앱 삭제" }
응답 200: { "data": { "refundAmount": 29000, "status": "REFUNDED" } }
에러: 403 환불 불가 (진행 중)
```

---

### POST /billing/boost
긴급 부스트

```
요청: { "appId": 1, "paymentMethodId": 1 }

응답 200:
{
  "data": {
    "boostActiveUntil": "2026-03-01T10:00:00Z",
    "chargedAmount": 5000
  }
}

에러:
403 BST-001 Free 불가
429 BST-002 월간 한도
```

---

# 15. 고객센터 (CS)

---

### GET /support/faqs?category=ALL
FAQ 목록

```
응답:
{
  "data": [
    {
      "id": 1,
      "category": "TEST",
      "question": "테스트 기간은 얼마나 되나요?",
      "answer": "모든 테스트는 14일간 진행됩니다..."
    }
  ]
}
```

---

### GET /support/notices?page=1&limit=10
공지사항 목록

```
응답:
{
  "data": [
    {
      "id": 1,
      "tag": "IMPORTANT",
      "title": "서비스 점검 안내",
      "preview": "2월 28일 새벽 2시...",
      "isPinned": true,
      "publishedAt": "2026-02-27"
    }
  ],
  "meta": { ... }
}
```

---

### GET /support/notices/:id
공지 상세

```
응답:
{
  "data": {
    "id": 1,
    "tag": "IMPORTANT",
    "title": "서비스 점검 안내",
    "content": "<p>2월 28일...</p>",
    "publishedAt": "2026-02-27"
  }
}
```

---

### POST /support/tickets
문의 작성

```
요청: (multipart/form-data)
{
  "inquiryType": "BUG",
  "title": "로그인 오류",
  "relatedAppId": 1,
  "content": "Google 로그인 시...",
  "attachments": [(file), (file)]
}

응답 201:
{
  "data": {
    "ticketId": "CS-0042",
    "status": "SUBMITTED",
    "createdAt": "2026-02-28T10:00:00Z"
  }
}

에러: 429 CS-001 1일 5건
```

---

### GET /support/tickets?page=1&limit=10
내 문의 목록

```
응답:
{
  "data": [
    {
      "ticketId": "CS-0042",
      "title": "로그인 오류",
      "status": "ANSWERED",
      "messageCount": 3,
      "createdAt": "2026-02-28"
    }
  ],
  "meta": { ... }
}
```

---

### GET /support/tickets/:ticketId
문의 상세 (대화 이력)

```
응답:
{
  "data": {
    "ticketId": "CS-0042",
    "title": "로그인 오류",
    "inquiryType": "BUG",
    "status": "ANSWERED",
    "messages": [
      { "id": 1, "senderRole": "USER", "content": "Google 로그인 시...", "createdAt": "..." },
      { "id": 2, "senderRole": "ADMIN", "content": "확인했습니다...", "createdAt": "..." }
    ],
    "attachments": [{ "fileName": "screenshot.png", "fileUrl": "..." }]
  }
}
```

---

### POST /support/tickets/:ticketId/reply
추가 문의 (ANSWERED 상태에서)

```
요청: { "content": "추가 질문..." }
응답 200: → 상태 REOPENED
```

---

### POST /support/reports
신고

```
요청:
{
  "targetType": "USER",
  "targetUserId": 5,
  "reason": "ABUSE",
  "detail": "테스트 참여 후..."
}
또는:
{
  "targetType": "APP",
  "targetAppId": 3,
  "reason": "FRAUD",
  "detail": "..."
}

응답 201: { "data": { "reportId": 1 } }
에러: 403 본인 불가, 429 24시간 중복
```

---

# 16. 관리자 (ADMIN)

---

### GET /admin/dashboard
관리자 대시보드

```
응답:
{
  "data": {
    "metrics": {
      "totalUsers": 1200,
      "dau": 340,
      "mau": 890,
      "activeTests": 15,
      "monthlyRevenue": 2450000
    },
    "revenue": {
      "subscription": 1500000,
      "fee": 600000,
      "oneTime": 350000,
      "monthlyChart": [{ "month": "2026-01", "amount": 2100000 }, ...]
    },
    "alerts": [
      { "type": "REPORT", "message": "신고 누적 3건: tester05", "severity": "HIGH", "targetId": 5 }
    ],
    "planDistribution": {
      "FREE": 800, "BASIC": 250, "PRO": 120, "ENTERPRISE": 30
    }
  }
}
```

---

### GET /admin/users?keyword=&filter=ALL&page=1
사용자 목록

```
응답: { "data": [{ "id", "nickname", "email" (마스킹), "role", "status", "plan", "trustScore", "createdAt" }], "meta": {...} }
```

---

### GET /admin/users/:id
사용자 상세

```
응답: 프로필 + 역할 + 플랜 + 활동 통계 + 신고이력 + 경고이력 + 결제이력
```

---

### POST /admin/users/:id/warn
경고

```
요청: { "reason": "부적절한 리뷰 작성" }
응답 200: { "data": { "warningId": 1, "totalWarnings": 2 } }
```

---

### POST /admin/users/:id/suspend
정지

```
요청: { "type": "TEMPORARY", "duration": 7, "reason": "반복 이탈" }
또는: { "type": "PERMANENT", "reason": "사기 행위" }
응답 200: { "data": { "status": "SUSPENDED", "until": "2026-03-07" } }
```

---

### POST /admin/users/:id/unsuspend
정지 해제

```
응답 200: { "data": { "status": "ACTIVE" } }
```

---

### GET /admin/apps?filter=PENDING&page=1
앱 목록 (관리자)

```
응답: { "data": [{ appId, appName, developer, status, createdAt, daysPending }], "meta": {...} }
```

---

### POST /admin/apps/:id/approve
앱 승인

```
응답 200: { "data": { "status": "RECRUITING" } }
```

---

### POST /admin/apps/:id/reject
앱 반려

```
요청: { "reason": "도박 관련 앱으로 판단..." }
응답 200: { "data": { "status": "REJECTED" } }
```

---

### POST /admin/apps/:id/block
앱 차단

```
요청: { "reason": "불법 콘텐츠" }
응답 200: { "data": { "status": "BLOCKED", "forceEndedTest": true, "rewardPaidCount": 15 } }
```

---

### GET /admin/settlements/withdrawals?status=REQUESTED&page=1
출금 요청 목록

```
응답:
{
  "data": [
    {
      "id": 1,
      "testerNickname": "tester01",
      "amount": 50000,
      "method": "BANK_TRANSFER",
      "account": "신한 ****7890",
      "flagged": true,
      "flagReason": "1회 30만↑",
      "requestedAt": "2026-02-28"
    }
  ],
  "meta": { ... }
}
```

---

### POST /admin/settlements/withdrawals/:id/approve
출금 승인

```
응답 200: { "data": { "status": "PROCESSING" } }
```

---

### POST /admin/settlements/withdrawals/:id/hold
출금 보류

```
요청: { "reason": "추가 확인 필요" }
응답 200: { "data": { "status": "ON_HOLD" } }
```

---

### POST /admin/settlements/withdrawals/:id/reject
출금 거절 (포인트 복원)

```
요청: { "reason": "이상 거래 확인" }
응답 200: { "data": { "status": "REJECTED", "pointRestored": true } }
```

---

### GET /admin/settlements/summary
정산 요약

```
응답:
{
  "data": {
    "unpaidReward": 350000,
    "pendingWithdrawal": 120000,
    "monthlyPaid": 890000,
    "feeRevenue": { "total": 600000, "byPlan": { "FREE": 100000, "BASIC": 250000, ... } }
  }
}
```

---

### GET /admin/cs/tickets?status=SUBMITTED&page=1
미답변 문의

```
응답: { "data": [{ ticketId, title, inquiryType, priority, userName, createdAt, hoursWaiting }], "meta": {...} }
```

---

### POST /admin/cs/tickets/:ticketId/reply
문의 답변

```
요청: (multipart)
{ "answer": "확인했습니다. ...", "attachments": [(file)] }
응답 200: { "data": { "status": "ANSWERED" } }
```

---

### POST /admin/cs/tickets/:ticketId/assign
담당자 배정

```
요청: { "assignTo": 99 }
응답 200
```

---

### GET /admin/cs/reports?status=SUBMITTED&page=1
신고 목록

```
응답: { "data": [{ reportId, targetType, targetId, reason, reporterNickname, count, createdAt }], "meta": {...} }
```

---

### POST /admin/cs/reports/:id/process
신고 처리

```
요청: { "action": "WARNING", "reason": "경고 처리" }
action: WARNING, SUSPEND, BLOCK_APP, DISMISS
응답 200: { "data": { "status": "WARNING" } }
```

---

### CRUD /admin/faqs
```
GET    /admin/faqs           → 목록
POST   /admin/faqs           → { category, question, answer }
PATCH  /admin/faqs/:id       → 수정
DELETE /admin/faqs/:id       → 삭제
PATCH  /admin/faqs/reorder   → { orderedIds: [3,1,2] }
```

---

### CRUD /admin/notices
```
GET    /admin/notices         → 목록
POST   /admin/notices         → { tag, title, content, isPinned }
PATCH  /admin/notices/:id     → 수정
DELETE /admin/notices/:id     → 삭제
```

---

# API 엔드포인트 총정리

| 도메인 | 엔드포인트 수 | 주요 메서드 |
|--------|-------------|-----------|
| 인증 | 7 | POST, DELETE |
| 프로필 | 5 | GET, PATCH, DELETE |
| 알림 | 5 | GET, PATCH |
| 개발자 대시보드 | 1 | GET |
| 개발자 앱 | 7 | GET, POST, PATCH, DELETE |
| 지원자/참여자 | 6 | GET, POST |
| 테스터 탐색 | 3 | GET, POST, DELETE |
| 테스터 내 테스트 | 4 | GET, POST |
| 피드백 | 3 | GET, POST, PATCH |
| 카테고리 | 1 | GET |
| 리워드/포인트 | 3 | GET |
| 출금 | 5 | GET, POST |
| 기프티콘 | 3 | GET, POST |
| 결제/구독 | 10 | GET, POST, PATCH, DELETE |
| 고객센터 | 7 | GET, POST |
| 관리자 | 20 | GET, POST, PATCH, DELETE |
| **합계** | **~90** | |
