# TestBridge API 설계

**Base URL**: `https://api.testbridge.kr/v1`  
**인증**: `Authorization: Bearer {accessToken}`  
**응답 형식**: JSON  
**에러 형식**: `{ "error": { "code": "AUTH-001", "message": "..." } }`  
**페이지네이션**: `?page=1&limit=20` → `{ "data": [...], "meta": { "page", "limit", "total", "totalPages" } }`

---

# 공통 규칙

### 인증 헤더
```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

### 성공 응답
```json
{ "data": { ... } }
{ "data": [...], "meta": { "page": 1, "limit": 20, "total": 100, "totalPages": 5 } }
```

### 에러 응답
```json
{
  "error": {
    "code": "AUTH-001",
    "message": "Google 인증에 실패했습니다.",
    "details": {}
  }
}
```

### HTTP 상태 코드
| 코드 | 용도 |
|------|------|
| 200 | 성공 (조회, 수정) |
| 201 | 생성 성공 |
| 204 | 삭제 성공 (본문 없음) |
| 400 | 유효성 실패 |
| 401 | 인증 실패/만료 |
| 403 | 권한 없음 |
| 404 | 리소스 없음 |
| 409 | 충돌 (중복) |
| 429 | Rate Limit |
| 500 | 서버 오류 |

---

# 1. 인증 (AUTH)

---

### POST /auth/google
소셜 로그인 (Google)

```
요청:
{ "idToken": "google_oauth_id_token" }

응답 200:
{
  "data": {
    "accessToken": "jwt...",
    "refreshToken": "jwt...",
    "isNewUser": false,
    "user": {
      "id": 1,
      "email": "user@gmail.com",
      "name": "홍길동",
      "nickname": "testuser",
      "profileImageUrl": "https://cdn.../profile.webp",
      "role": "DEVELOPER",
      "currentPlan": "FREE"
    }
  }
}

에러:
401 AUTH-001 토큰 검증 실패
403 AUTH-002 정지 계정
403 AUTH-004 탈퇴 처리 중
```

---

### POST /auth/kakao
```
요청: { "authCode": "kakao_auth_code" }
응답: 동일 구조
추가 에러: 409 AUTH-006 이메일 충돌
```

---

### POST /auth/naver
```
요청: { "authCode": "naver_auth_code", "state": "csrf_token" }
응답: 동일 구조
```

---

### POST /auth/signup
역할 선택 + 약관 동의 + 프로필 설정 (가입 완료)

```
요청:
{
  "role": "DEVELOPER",
  "termsAgreed": true,
  "privacyAgreed": true,
  "marketingAgreed": false,
  "nickname": "testuser",
  "bio": "안녕하세요",
  "profileImage": (multipart file, 선택)
}

응답 201:
{
  "data": {
    "user": { "id": 1, "nickname": "testuser", "role": "DEVELOPER", ... }
  }
}

에러:
409 PRF-002 닉네임 중복
400 PRF-003 닉네임 금칙어
```

---

### POST /auth/refresh
토큰 갱신

```
요청: { "refreshToken": "jwt..." }
응답 200: { "data": { "accessToken": "new_jwt...", "refreshToken": "new_jwt..." } }
에러: 401 AUTH-012 Refresh 만료
```

---

### POST /auth/logout
```
요청: (Authorization 헤더만)
응답: 204 No Content
```

---

### DELETE /auth/withdraw
회원 탈퇴

```
요청: { "reason": "NO_LONGER_NEEDED", "reasonDetail": "...", "confirmText": "탈퇴합니다" }
응답: 204
에러:
409 AUTH-009 진행 중 테스트
400 AUTH-010 확인 텍스트 불일치
```

---

# 2. 프로필 (PROFILE)

---

### GET /profile/me
내 프로필 조회

```
응답:
{
  "data": {
    "id": 1,
    "email": "u***@gmail.com",
    "nickname": "testuser",
    "bio": "...",
    "profileImageUrl": "...",
    "role": "BOTH",
    "currentPlan": "BASIC",
    "pointBalance": 15000,
    "creditBalance": 30,
    "trustScore": 75,
    "trustBadge": "GOLD",
    "remainingApps": 8,
    "stats": {
      "developer": { "totalApps": 3, "productionSuccess": 1, "inProgress": 2 },
      "tester": { "completedTests": 12, "completionRate": 92.3, "totalReward": 48000 }
    },
    "subscription": {
      "plan": "BASIC",
      "price": 19900,
      "nextBillingDate": "2026-04-01"
    }
  }
}
```

---

### PATCH /profile/me
프로필 수정

```
요청: (multipart/form-data)
{
  "nickname": "newname",
  "bio": "새 소개",
  "profileImage": (file, 선택)
}

응답 200: { "data": { ...updated user } }
에러: 429 PRF-001 닉네임 30일 제한
```

---

### DELETE /profile/me/image
프로필 이미지 삭제 → 기본 아바타

```
응답: 200 { "data": { "profileImageUrl": null } }
```

---

### PATCH /profile/role
역할 전환

```
요청: { "targetRole": "TESTER" }
응답 200: { "data": { "role": "BOTH", "redirectPath": "/tester" } }
```

---

### GET /profile/nickname/check?nickname=xxx
닉네임 중복 확인

```
응답: { "data": { "available": true } }
```

---

# 3. 알림 (NOTIFICATIONS)

---

### GET /notifications?page=1&limit=20
알림 목록

```
응답:
{
  "data": [
    {
      "id": 1,
      "type": "SELECTED",
      "title": "테스트에 선정되었습니다!",
      "message": "MyApp 테스트에 선정되었습니다.",
      "linkUrl": "/tester/my-tests?tab=active",
      "isRead": false,
      "relatedAppId": 5,
      "createdAt": "2026-02-28T10:00:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 45, "totalPages": 3, "unreadCount": 8 }
}
```

---

### PATCH /notifications/:id/read
읽음 처리

```
응답: 204
```

---

### PATCH /notifications/read-all
전체 읽음

```
응답: 204
```

---

### GET /notifications/settings
알림 설정 조회

```
응답: { "data": { "pushEnabled": true, "emailEnabled": true, "smsEnabled": false } }
```

---

### PATCH /notifications/settings
알림 설정 변경

```
요청: { "pushEnabled": false }
응답: 200
```

---

# 4. 개발자 — 대시보드 (DEV/DASHBOARD)

---

### GET /dev/dashboard
대시보드 요약

```
응답:
{
  "data": {
    "summary": {
      "inProgressCount": 2,
      "recruitingCount": 1,
      "completedCount": 5,
      "creditBalance": 30
    },
    "activeTests": [
      {
        "appId": 1,
        "appIcon": "https://cdn.../icon.webp",
        "appName": "MyApp",
        "status": "IN_TESTING",
        "currentDay": 7,
        "totalDays": 14,
        "activeTesters": 18,
        "targetTesters": 20,
        "progressPercent": 50
      }
    ],
    "recentFeedbacks": [
      {
        "appName": "MyApp",
        "testerNickname": "tester01",
        "rating": 4,
        "message": "UI가 깔끔하고...",
        "createdAt": "2026-02-27T15:00:00Z"
      }
    ]
  }
}
```

---

# 5. 개발자 — 앱 등록 (DEV/APPS)

---

### GET /dev/apps?status=ALL&page=1&limit=10
내 앱 목록

```
응답:
{
  "data": [
    {
      "id": 1,
      "appIcon": "...",
      "appName": "MyApp",
      "status": "IN_TESTING",
      "progressPercent": 50,
      "activeTesters": 18,
      "targetTesters": 20,
      "createdAt": "2026-02-01"
    }
  ],
  "meta": { ... }
}
```

---

### POST /dev/apps
앱 등록 (전체 데이터 한번에)

```
요청: (multipart/form-data)
{
  "appName": "MyApp",
  "packageName": "com.example.myapp",
  "categoryId": 1,
  "description": "앱 설명...",
  "appIcon": (file),
  "screenshots": [(file), (file)],
  "testType": "PAID_REWARD",
  "targetTesters": 20,
  "testLink": "https://play.google.com/apps/testing/com.example.myapp",
  "rewardType": "WITH_FEEDBACK",
  "rewardAmount": 3000,
  "feedbackRequired": true,
  "feedbackItems": ["UI_UX", "PERFORMANCE", "STABILITY"],
  "testGuide": "테스트 가이드 내용..."
}

응답 201:
{
  "data": {
    "id": 1,
    "status": "PENDING_APPROVAL",
    "paymentRequired": true,
    "estimatedCost": {
      "rewardTotal": 60000,
      "platformFee": 6000,
      "totalCost": 66000
    }
  }
}

에러:
409 APP-001 패키지명 중복
403 APP-002 월 등록 한도 초과
403 APP-003 크레딧 부족
403 APP-004 Free 유료 불가
```

---

### GET /dev/apps/package-check?name=com.example.myapp
패키지명 중복 확인

```
응답: { "data": { "available": true } }
```

---

### GET /dev/apps/cost-estimate?targetTesters=20&rewardAmount=3000
예상 비용 계산

```
응답:
{
  "data": {
    "rewardTotal": 60000,
    "platformFee": 6000,
    "feeRate": 0.10,
    "totalCost": 66000
  }
}
```

---

### GET /dev/apps/:id
앱 상세

```
응답:
{
  "data": {
    "id": 1,
    "appName": "MyApp",
    "packageName": "com.example.myapp",
    "category": { "id": 1, "name": "게임" },
    "description": "...",
    "appIcon": "...",
    "screenshots": [{ "url": "...", "thumbnailUrl": "...", "order": 1 }],
    "testType": "PAID_REWARD",
    "targetTesters": 20,
    "testLink": "...",
    "rewardType": "WITH_FEEDBACK",
    "rewardAmount": 3000,
    "feedbackRequired": true,
    "feedbackItems": ["UI_UX", "PERFORMANCE"],
    "testGuide": "...",
    "status": "IN_TESTING",
    "testStartDate": "2026-02-15",
    "testEndDate": "2026-03-01",
    "currentDay": 13,
    "activeTesters": 18,
    "droppedTesters": 2,
    "waitlistTesters": 3,
    "createdAt": "2026-02-01"
  }
}
```

---

### PATCH /dev/apps/:id
앱 수정

```
요청: (변경 필드만)
{ "description": "수정된 설명", "testGuide": "수정된 가이드" }

응답 200: { "data": { ...updated } }
에러: 403 MNG-001 수정 불가 상태
```

---

### DELETE /dev/apps/:id
앱 삭제/취소

```
응답: 204
에러: 403 MNG-001 삭제 불가 상태 (IN_TESTING 이후)
```

---

### POST /dev/apps/:id/production-confirm
프로덕션 등록 확인 → 리워드 자동 지급

```
요청: { "confirm": true }
응답 200:
{
  "data": {
    "status": "PRODUCTION",
    "rewardResult": {
      "totalPaid": 16,
      "totalAmount": 48000,
      "pendingFeedback": 2,
      "skipped": 2
    }
  }
}
에러: 400 이미 PRODUCTION / 조건 미충족
```

---

# 6. 개발자 — 지원자/참여자 관리

---

### GET /dev/apps/:id/applicants?status=PENDING
지원자 목록

```
응답:
{
  "data": [
    {
      "applicationId": 10,
      "testerId": 5,
      "nickname": "tester01",
      "profileImageUrl": "...",
      "trustScore": 82,
      "trustBadge": "GOLD",
      "completedTests": 15,
      "completionRate": 93.3,
      "deviceInfo": "Galaxy S24",
      "message": "테스트하고 싶습니다",
      "status": "PENDING",
      "appliedAt": "2026-02-10"
    }
  ],
  "meta": { ... }
}
```

---

### POST /dev/apps/:id/applicants/:applicationId/approve
지원자 승인

```
응답 200: { "data": { "applicationId": 10, "status": "APPROVED" } }
```

---

### POST /dev/apps/:id/applicants/:applicationId/reject
지원자 거절

```
응답 200: { "data": { "applicationId": 10, "status": "REJECTED" } }
```

---

### POST /dev/apps/:id/applicants/approve-all
일괄 승인 (상위 N명)

```
요청: { "count": 20 }
응답 200: { "data": { "approvedCount": 20, "testStarted": true } }
```

---

### GET /dev/apps/:id/participants
참여자 모니터링

```
응답:
{
  "data": [
    {
      "participationId": 1,
      "nickname": "tester01",
      "status": "ACTIVE",
      "participationDay": 7,
      "lastAppRunAt": "2026-02-27T10:00:00Z",
      "feedbackSubmitted": false,
      "isInactive": false
    }
  ]
}
```

---

### POST /dev/apps/:id/message
참여자 메시지 발송

```
요청: { "targetType": "ALL", "message": "업데이트 안내..." }
또는: { "targetType": "INDIVIDUAL", "testerId": 5, "message": "..." }
응답 200: { "data": { "sentCount": 18 } }
에러: 429 1일 3회 제한
```

---

### GET /dev/apps/:id/feedbacks?filter=ALL&sort=LATEST&page=1
피드백 목록

```
응답:
{
  "data": {
    "summary": {
      "averageRating": 4.2,
      "totalFeedbacks": 16,
      "itemAverages": { "UI_UX": 4.5, "PERFORMANCE": 3.8 }
    },
    "feedbacks": [
      {
        "id": 1,
        "testerNickname": "tester01",
        "overallRating": 5,
        "itemRatings": { "UI_UX": 5, "PERFORMANCE": 4 },
        "comment": "정말 좋은 앱입니다...",
        "bugReport": {
          "title": "로그인 오류",
          "description": "...",
          "screenshots": ["url1"],
          "deviceInfo": "Galaxy S24, Android 15"
        },
        "createdAt": "2026-02-28"
      }
    ]
  },
  "meta": { ... }
}
```

---

# 7. 테스터 — 앱 탐색

---

### GET /tester/apps?category=1&rewardType=PAID_REWARD&sort=LATEST&keyword=게임&page=1&limit=10
앱 목록 (탐색)

```
응답:
{
  "data": [
    {
      "id": 1,
      "appIcon": "...",
      "appName": "MyApp",
      "categoryName": "게임",
      "rewardAmount": 3000,
      "rewardType": "PAID_REWARD",
      "remainingSlots": 5,
      "targetTesters": 20,
      "isHot": true,
      "hasApplied": false,
      "createdAt": "2026-02-01"
    }
  ],
  "meta": { ... }
}
```

---

### GET /tester/apps/:id
앱 상세 (테스터용)

```
응답:
{
  "data": {
    "id": 1,
    "appIcon": "...",
    "appName": "MyApp",
    "category": { "id": 1, "name": "게임" },
    "description": "...",
    "screenshots": [...],
    "developer": { "nickname": "dev01", "totalApps": 5 },
    "testInfo": {
      "duration": 14,
      "rewardAmount": 3000,
      "rewardType": "WITH_FEEDBACK",
      "feedbackRequired": true,
      "feedbackItems": ["UI_UX", "PERFORMANCE"],
      "remainingSlots": 5,
      "targetTesters": 20
    },
    "testGuide": "...",
    "applicationStatus": null
  }
}
```

---

### POST /tester/apps/:id/apply
테스트 지원

```
요청: { "deviceInfo": "Galaxy S24", "message": "테스트하고 싶습니다" }

응답 201:
{
  "data": {
    "applicationId": 10,
    "status": "PENDING",
    "appliedAt": "2026-02-28T10:00:00Z"
  }
}

에러:
403 TST-001 본인 앱
403 TST-002 동시 5개 초과
409 TST-003 모집 마감
409 TST-004 중복 지원
```

---

### DELETE /tester/applications/:id
지원 취소

```
응답: 204
에러: 403 PENDING에서만 취소 가능
```

---

# 8. 테스터 — 내 테스트

---

### GET /tester/my-tests?tab=active
진행 중 테스트

```
응답:
{
  "data": [
    {
      "participationId": 1,
      "appId": 1,
      "appIcon": "...",
      "appName": "MyApp",
      "currentDay": 7,
      "totalDays": 14,
      "rewardAmount": 3000,
      "ranToday": true,
      "testLink": "https://play.google.com/apps/testing/com.example.myapp",
      "testEndDate": "2026-03-01"
    }
  ]
}
```

---

### GET /tester/my-tests?tab=completed
완료 테스트

```
응답:
{
  "data": [
    {
      "appId": 2,
      "appIcon": "...",
      "appName": "OtherApp",
      "rewardAmount": 2000,
      "rewardStatus": "PAID",
      "completedAt": "2026-02-20",
      "feedbackSubmitted": true
    }
  ]
}
```

---

### GET /tester/my-tests?tab=pending
대기 중

```
응답:
{
  "data": [
    {
      "applicationId": 15,
      "appId": 3,
      "appIcon": "...",
      "appName": "NewApp",
      "rewardAmount": 4000,
      "status": "PENDING",
      "appliedAt": "2026-02-27"
    }
  ]
}
```

---

### POST /tester/apps/:id/run
앱 실행 기록

```
응답: 200 { "data": { "lastAppRunAt": "2026-02-28T10:00:00Z" } }
```

---

# 9. 테스터 — 피드백

---

### POST /tester/apps/:appId/feedback
피드백 작성

```
요청: (multipart/form-data)
{
  "overallRating": 4,
  "itemRatings": { "UI_UX": 5, "PERFORMANCE": 3, "STABILITY": 4 },
  "comment": "전반적으로 좋지만 로딩이 느립니다...",
  "bugTitle": "로그인 화면 크래시",
  "bugDescription": "Google 로그인 시 간헐적으로...",
  "bugScreenshots": [(file), (file)]
}

응답 201:
{
  "data": {
    "feedbackId": 1,
    "createdAt": "2026-02-28T10:00:00Z"
  }
}

에러:
400 기한 초과 (종료+3일)
400 필수 항목 미입력
409 이미 제출
```

---

### PATCH /tester/feedbacks/:id
피드백 수정

```
요청: { "comment": "수정된 피드백...", "overallRating": 5 }
응답 200: { "data": { ...updated } }
에러: 403 수정 기한 초과
```

---

### GET /tester/feedbacks/:id
내 피드백 조회

```
응답: { "data": { ...feedback detail } }
```

---

# 10. 카테고리

---

### GET /categories
카테고리 목록 (공용, 캐싱 24시간)

```
응답:
{
  "data": [
    { "id": 1, "name": "게임", "icon": "🎮" },
    { "id": 2, "name": "유틸리티", "icon": "🔧" },
    ...
  ]
}
```
