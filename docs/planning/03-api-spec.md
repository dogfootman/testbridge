# API Specification

**프로젝트명**: TestBridge
**Base URL**: `https://api.testbridge.kr/v1`
**인증**: `Authorization: Bearer {accessToken}`
**응답 형식**: JSON
**버전**: v1.0
**작성일**: 2026-02-28

---

## 목차

1. [공통 규칙](#1-공통-규칙)
2. [인증 API](#2-인증-api)
3. [개발자 API](#3-개발자-api)
4. [테스터 API](#4-테스터-api)
5. [공통 API](#5-공통-api)
6. [관리자 API](#6-관리자-api)
7. [에러 코드](#7-에러-코드)

---

## 1. 공통 규칙

### 1.1 인증 헤더

```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

### 1.2 성공 응답

**단일 리소스**:
```json
{
  "data": {
    "id": 1,
    "name": "MyApp"
  }
}
```

**리스트 (페이지네이션)**:
```json
{
  "data": [
    { "id": 1, "name": "MyApp" }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### 1.3 에러 응답

```json
{
  "error": {
    "code": "AUTH-001",
    "message": "Google 인증에 실패했습니다.",
    "details": {}
  }
}
```

### 1.4 HTTP 상태 코드

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

## 2. 인증 API

### 2.1 소셜 로그인 (Google)

**Endpoint**: `POST /auth/google`

**Request**:
```json
{
  "idToken": "eyJhbGc..."
}
```

**Response (200 - 신규 사용자)**:
```json
{
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "홍길동",
      "role": null,
      "isNewUser": true
    }
  }
}
```

**Response (200 - 기존 사용자)**:
```json
{
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "홍길동",
      "nickname": "tester1",
      "role": "TESTER",
      "isNewUser": false
    }
  }
}
```

---

### 2.2 역할 선택

**Endpoint**: `POST /auth/role`

**Request**:
```json
{
  "role": "DEVELOPER"
}
```

**Response (200)**:
```json
{
  "data": {
    "id": 1,
    "role": "DEVELOPER"
  }
}
```

---

### 2.3 토큰 갱신

**Endpoint**: `POST /auth/refresh`

**Request**:
```json
{
  "refreshToken": "..."
}
```

**Response (200)**:
```json
{
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "..."
  }
}
```

---

## 3. 개발자 API

### 3.1 앱 등록

**Endpoint**: `POST /developer/apps`

**Request**:
```json
{
  "appName": "MyAwesomeApp",
  "packageName": "com.example.myawesomeapp",
  "categoryId": 3,
  "description": "할 일 관리 앱...",
  "testType": "PAID_REWARD",
  "targetTesters": 20,
  "testLink": "https://play.google.com/apps/testing/...",
  "rewardType": "WITH_FEEDBACK",
  "rewardAmount": 3000,
  "feedbackRequired": true,
  "testGuide": "할 일 추가 기능을 테스트해주세요...",
  "iconUrl": "https://cdn.testbridge.kr/apps/icon-123.png",
  "screenshotUrls": [
    "https://cdn.testbridge.kr/apps/screen-1.png",
    "https://cdn.testbridge.kr/apps/screen-2.png"
  ],
  "feedbackItems": ["UI_UX", "PERFORMANCE", "FUNCTIONALITY", "STABILITY"]
}
```

**Response (201)**:
```json
{
  "data": {
    "id": 100,
    "appName": "MyAwesomeApp",
    "status": "PENDING_APPROVAL",
    "createdAt": "2026-02-27T10:00:00Z"
  }
}
```

---

### 3.2 내 앱 목록 조회

**Endpoint**: `GET /developer/apps?status=RECRUITING&page=1&limit=10`

**Response (200)**:
```json
{
  "data": [
    {
      "id": 100,
      "appName": "MyAwesomeApp",
      "packageName": "com.example.myawesomeapp",
      "status": "RECRUITING",
      "targetTesters": 20,
      "currentApplicants": 15,
      "iconUrl": "...",
      "createdAt": "2026-02-27T10:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 3,
    "totalPages": 1
  }
}
```

---

### 3.3 지원자 목록 조회

**Endpoint**: `GET /developer/apps/{appId}/applications?status=PENDING`

**Response (200)**:
```json
{
  "data": [
    {
      "id": 500,
      "tester": {
        "id": 10,
        "nickname": "tester1",
        "profileImageUrl": "...",
        "trustScore": 85,
        "trustBadge": "GOLD",
        "totalTests": 12,
        "completionRate": 92
      },
      "deviceInfo": "Galaxy S23",
      "message": "앱 개발에 관심이 많습니다...",
      "status": "PENDING",
      "appliedAt": "2026-02-28T10:00:00Z"
    }
  ]
}
```

---

### 3.4 지원자 승인

**Endpoint**: `POST /developer/apps/{appId}/applications/{applicationId}/approve`

**Response (200)**:
```json
{
  "data": {
    "id": 500,
    "status": "APPROVED",
    "approvedAt": "2026-02-28T11:00:00Z"
  }
}
```

---

### 3.5 테스트 현황 조회

**Endpoint**: `GET /developer/apps/{appId}/status`

**Response (200)**:
```json
{
  "data": {
    "appId": 100,
    "status": "IN_TESTING",
    "testStartDate": "2026-02-28T00:00:00Z",
    "testEndDate": "2026-03-14T23:59:59Z",
    "daysRemaining": 10,
    "participationStats": {
      "total": 20,
      "active": 18,
      "dropped": 2,
      "completionRate": 90
    },
    "participants": [
      {
        "tester": {
          "id": 10,
          "nickname": "tester1"
        },
        "status": "ACTIVE",
        "lastAppRunAt": "2026-03-04T10:00:00Z",
        "joinedAt": "2026-02-28T00:00:00Z"
      }
    ]
  }
}
```

---

### 3.6 피드백 목록 조회

**Endpoint**: `GET /developer/apps/{appId}/feedbacks`

**Response (200)**:
```json
{
  "data": {
    "summary": {
      "totalFeedbacks": 18,
      "averageRating": 4.2,
      "itemRatings": {
        "UI_UX": 4.5,
        "PERFORMANCE": 4.0,
        "FUNCTIONALITY": 4.3,
        "STABILITY": 3.8
      }
    },
    "feedbacks": [
      {
        "id": 1000,
        "tester": {
          "id": 10,
          "nickname": "tester1"
        },
        "overallRating": 4,
        "comment": "전반적으로 좋은데 삭제 시 크래시가 발생합니다.",
        "ratings": {
          "UI_UX": 5,
          "PERFORMANCE": 4,
          "FUNCTIONALITY": 4,
          "STABILITY": 3
        },
        "bugReport": {
          "title": "할 일 삭제 시 크래시",
          "description": "할 일 5개 추가 후 3번째 삭제 시 크래시",
          "imageUrls": ["..."]
        },
        "createdAt": "2026-03-08T10:00:00Z"
      }
    ]
  }
}
```

---

### 3.7 프로덕션 등록 완료

**Endpoint**: `POST /developer/apps/{appId}/production-confirm`

**Response (200)**:
```json
{
  "data": {
    "appId": 100,
    "status": "PRODUCTION",
    "productionConfirmedAt": "2026-03-15T10:00:00Z",
    "rewardsIssued": 18,
    "totalRewardAmount": 54000
  }
}
```

---

## 4. 테스터 API

### 4.1 앱 목록 조회 (탐색)

**Endpoint**: `GET /tester/apps?categoryId=3&rewardMin=3000&sort=reward&page=1&limit=20`

**Query Parameters**:
- `categoryId`: 카테고리 ID
- `rewardMin`: 최소 리워드 금액
- `rewardMax`: 최대 리워드 금액
- `sort`: `latest` | `reward` | `popular`
- `page`, `limit`: 페이지네이션

**Response (200)**:
```json
{
  "data": [
    {
      "id": 100,
      "appName": "MyAwesomeApp",
      "categoryId": 3,
      "categoryName": "유틸리티",
      "iconUrl": "...",
      "description": "할 일 관리 앱...",
      "rewardAmount": 3000,
      "rewardType": "WITH_FEEDBACK",
      "targetTesters": 20,
      "remainingSlots": 5,
      "isHot": true,
      "developer": {
        "nickname": "dev1"
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

---

### 4.2 앱 상세 조회

**Endpoint**: `GET /tester/apps/{appId}`

**Response (200)**:
```json
{
  "data": {
    "id": 100,
    "appName": "MyAwesomeApp",
    "packageName": "com.example.myawesomeapp",
    "categoryName": "유틸리티",
    "description": "할 일 관리 앱...",
    "iconUrl": "...",
    "screenshotUrls": ["...", "..."],
    "testGuide": "할 일 추가 기능을 테스트해주세요...",
    "rewardAmount": 3000,
    "rewardType": "WITH_FEEDBACK",
    "feedbackRequired": true,
    "feedbackItems": ["UI_UX", "PERFORMANCE", "FUNCTIONALITY", "STABILITY"],
    "targetTesters": 20,
    "remainingSlots": 5,
    "developer": {
      "nickname": "dev1",
      "profileImageUrl": "..."
    }
  }
}
```

---

### 4.3 테스트 지원

**Endpoint**: `POST /tester/apps/{appId}/apply`

**Request**:
```json
{
  "deviceInfo": "Galaxy S23",
  "message": "앱 개발에 관심이 많습니다..."
}
```

**Response (201)**:
```json
{
  "data": {
    "id": 500,
    "appId": 100,
    "status": "PENDING",
    "appliedAt": "2026-02-28T10:00:00Z"
  }
}
```

---

### 4.4 내 테스트 현황 조회

**Endpoint**: `GET /tester/participations?status=ACTIVE`

**Query Parameters**:
- `status`: `ACTIVE` | `COMPLETED`

**Response (200)**:
```json
{
  "data": [
    {
      "id": 1000,
      "app": {
        "id": 100,
        "appName": "MyAwesomeApp",
        "iconUrl": "..."
      },
      "status": "ACTIVE",
      "testStartDate": "2026-02-28T00:00:00Z",
      "testEndDate": "2026-03-14T23:59:59Z",
      "daysRemaining": 10,
      "rewardAmount": 3000,
      "lastAppRunAt": "2026-03-04T10:00:00Z",
      "feedbackSubmitted": false,
      "testLink": "https://play.google.com/apps/testing/..."
    }
  ]
}
```

---

### 4.5 피드백 작성

**Endpoint**: `POST /tester/participations/{participationId}/feedback`

**Request**:
```json
{
  "overallRating": 4,
  "comment": "전반적으로 좋은데 삭제 시 크래시가 발생합니다.",
  "ratings": {
    "UI_UX": 5,
    "PERFORMANCE": 4,
    "FUNCTIONALITY": 4,
    "STABILITY": 3
  },
  "bugReport": {
    "title": "할 일 삭제 시 크래시",
    "description": "할 일 5개 추가 후 3번째 삭제 시 크래시",
    "imageUrls": ["https://cdn.testbridge.kr/bugs/bug-1.png"]
  }
}
```

**Response (201)**:
```json
{
  "data": {
    "id": 1000,
    "participationId": 1000,
    "createdAt": "2026-03-08T10:00:00Z"
  }
}
```

---

### 4.6 리워드 내역 조회

**Endpoint**: `GET /tester/rewards?page=1&limit=20`

**Response (200)**:
```json
{
  "data": {
    "balance": 15000,
    "history": [
      {
        "id": 5000,
        "type": "EARNED",
        "amount": 3000,
        "balance": 15000,
        "description": "MyAwesomeApp 테스트 완료",
        "createdAt": "2026-03-15T10:00:00Z"
      }
    ]
  },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1
  }
}
```

---

### 4.7 출금 신청

**Endpoint**: `POST /tester/withdrawals`

**Request**:
```json
{
  "method": "BANK_TRANSFER",
  "amount": 15000,
  "bankCode": "088",
  "accountNumber": "110-123-456789",
  "accountHolder": "홍길동"
}
```

**Response (201)**:
```json
{
  "data": {
    "id": 10000,
    "amount": 15000,
    "status": "REQUESTED",
    "requestedAt": "2026-03-15T11:00:00Z"
  }
}
```

---

## 5. 공통 API

### 5.1 프로필 조회

**Endpoint**: `GET /users/me`

**Response (200)**:
```json
{
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "홍길동",
    "nickname": "tester1",
    "bio": "앱 테스터입니다.",
    "profileImageUrl": "...",
    "role": "TESTER",
    "status": "ACTIVE",
    "currentPlan": "FREE",
    "pointBalance": 15000,
    "creditBalance": 30,
    "trustScore": 85,
    "trustBadge": "GOLD",
    "createdAt": "2026-01-01T00:00:00Z"
  }
}
```

---

### 5.2 프로필 수정

**Endpoint**: `PATCH /users/me`

**Request**:
```json
{
  "nickname": "newtester1",
  "bio": "안드로이드 앱 테스터",
  "profileImageUrl": "..."
}
```

**Response (200)**:
```json
{
  "data": {
    "id": 1,
    "nickname": "newtester1",
    "bio": "안드로이드 앱 테스터",
    "profileImageUrl": "...",
    "updatedAt": "2026-03-15T12:00:00Z"
  }
}
```

---

### 5.3 알림 목록 조회

**Endpoint**: `GET /notifications?isRead=false&page=1&limit=20`

**Response (200)**:
```json
{
  "data": [
    {
      "id": 10000,
      "type": "SELECTED",
      "title": "축하합니다!",
      "message": "MyAwesomeApp 테스터로 선정되었습니다.",
      "linkUrl": "/tester/participations/1000",
      "isRead": false,
      "createdAt": "2026-02-28T11:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1
  }
}
```

---

## 6. 관리자 API

### 6.1 대시보드 통계

**Endpoint**: `GET /admin/dashboard`

**Response (200)**:
```json
{
  "data": {
    "totalUsers": 10000,
    "dau": 500,
    "mau": 3000,
    "activeTests": 50,
    "thisMonthRevenue": 5000000,
    "pendingApprovals": 3,
    "pendingWithdrawals": 10
  }
}
```

---

### 6.2 앱 승인

**Endpoint**: `POST /admin/apps/{appId}/approve`

**Response (200)**:
```json
{
  "data": {
    "id": 100,
    "status": "RECRUITING",
    "approvedAt": "2026-02-27T10:00:00Z"
  }
}
```

---

### 6.3 앱 반려

**Endpoint**: `POST /admin/apps/{appId}/reject`

**Request**:
```json
{
  "reason": "도박 콘텐츠는 플랫폼 정책 위반"
}
```

**Response (200)**:
```json
{
  "data": {
    "id": 100,
    "status": "REJECTED",
    "rejectedReason": "도박 콘텐츠는..."
  }
}
```

---

## 7. 에러 코드

### 7.1 인증 에러 (AUTH-XXX)

| 코드 | 메시지 | HTTP |
|------|--------|------|
| AUTH-001 | Google 인증에 실패했습니다. | 401 |
| AUTH-002 | 토큰이 만료되었습니다. | 401 |
| AUTH-003 | 유효하지 않은 토큰입니다. | 401 |
| AUTH-004 | 권한이 없습니다. | 403 |

### 7.2 유효성 에러 (VAL-XXX)

| 코드 | 메시지 | HTTP |
|------|--------|------|
| VAL-001 | 필수 필드가 누락되었습니다. | 400 |
| VAL-002 | 유효하지 않은 이메일 형식입니다. | 400 |
| VAL-003 | 닉네임은 2~20자여야 합니다. | 400 |
| VAL-004 | 유효하지 않은 리워드 금액입니다. (1000~8000) | 400 |

### 7.3 비즈니스 에러 (BIZ-XXX)

| 코드 | 메시지 | HTTP |
|------|--------|------|
| BIZ-001 | 이미 지원한 앱입니다. | 409 |
| BIZ-002 | 잔액이 부족합니다. | 400 |
| BIZ-003 | 동시 테스트는 최대 5개입니다. | 400 |
| BIZ-004 | 신뢰도 점수가 부족합니다. (최소 30점) | 403 |
| BIZ-005 | 이미 승인된 지원입니다. | 409 |

### 7.4 리소스 에러 (RES-XXX)

| 코드 | 메시지 | HTTP |
|------|--------|------|
| RES-001 | 앱을 찾을 수 없습니다. | 404 |
| RES-002 | 사용자를 찾을 수 없습니다. | 404 |
| RES-003 | 파일 업로드에 실패했습니다. | 500 |

---

**작성자**: TestBridge 기획팀
**최종 업데이트**: 2026-02-28
