# Apps Resource API - 테스트 시나리오

## @TASK P3-R4 - Apps API 검증

### 사전 요구사항
1. PostgreSQL 실행 중 (포트 5434)
2. Next.js 개발 서버 실행: `npm run dev`
3. 데이터베이스 마이그레이션 완료: `npx prisma migrate dev`
4. 테스트용 카테고리 데이터 존재

---

## 1. POST /api/apps (앱 생성)

### ✅ 성공 케이스

```bash
# 1-1. 개발자가 새 앱 등록
curl -X POST http://localhost:3000/api/apps \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {DEVELOPER_TOKEN}" \
  -d '{
    "appName": "Test App",
    "packageName": "com.test.app",
    "categoryId": 1,
    "description": "This is a test app for TDD validation",
    "testType": "PAID_REWARD",
    "targetTesters": 20,
    "testLink": "https://play.google.com/store/apps/details?id=com.test.app",
    "rewardType": "BASIC",
    "rewardAmount": 50000,
    "feedbackRequired": true
  }'

# Expected: 201 Created
# {
#   "id": 1,
#   "appName": "Test App",
#   "packageName": "com.test.app",
#   "status": "PENDING_APPROVAL",
#   ...
# }
```

### ❌ 실패 케이스

```bash
# 1-2. 인증 없이 요청
curl -X POST http://localhost:3000/api/apps \
  -H "Content-Type: application/json" \
  -d '{...}'

# Expected: 401 Unauthorized

# 1-3. TESTER 역할로 요청
curl -X POST http://localhost:3000/api/apps \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {TESTER_TOKEN}" \
  -d '{...}'

# Expected: 403 Forbidden

# 1-4. 잘못된 패키지명 형식
curl -X POST http://localhost:3000/api/apps \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {DEVELOPER_TOKEN}" \
  -d '{
    "appName": "Test App",
    "packageName": "InvalidPackageName",
    "categoryId": 1,
    "description": "This is a test app for TDD validation",
    "testType": "PAID_REWARD",
    "targetTesters": 20,
    "testLink": "https://example.com/app"
  }'

# Expected: 400 Bad Request (Validation error)

# 1-5. 존재하지 않는 카테고리
curl -X POST http://localhost:3000/api/apps \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {DEVELOPER_TOKEN}" \
  -d '{
    "appName": "Test App",
    "packageName": "com.test.app2",
    "categoryId": 9999,
    "description": "This is a test app for TDD validation",
    "testType": "PAID_REWARD",
    "targetTesters": 20,
    "testLink": "https://example.com/app"
  }'

# Expected: 400 Bad Request (Invalid category)

# 1-6. 중복된 패키지명
curl -X POST http://localhost:3000/api/apps \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {DEVELOPER_TOKEN}" \
  -d '{
    "appName": "Duplicate App",
    "packageName": "com.test.app",
    "categoryId": 1,
    "description": "This is a duplicate app",
    "testType": "PAID_REWARD",
    "targetTesters": 20,
    "testLink": "https://example.com/app"
  }'

# Expected: 409 Conflict (Package name already exists)
```

---

## 2. GET /api/apps (앱 목록 조회)

### ✅ 성공 케이스

```bash
# 2-1. 기본 목록 조회 (페이지네이션)
curl http://localhost:3000/api/apps?page=1&limit=10

# Expected: 200 OK
# {
#   "apps": [...],
#   "total": 1,
#   "page": 1,
#   "limit": 10
# }

# 2-2. 상태 필터링
curl http://localhost:3000/api/apps?status=RECRUITING

# Expected: 200 OK (RECRUITING 상태 앱만 반환)

# 2-3. 카테고리 필터링
curl http://localhost:3000/api/apps?categoryId=1

# Expected: 200 OK (카테고리 1 앱만 반환)

# 2-4. 복합 필터링
curl "http://localhost:3000/api/apps?status=RECRUITING&categoryId=1&page=1&limit=5"

# Expected: 200 OK
```

---

## 3. GET /api/apps/[id] (앱 상세 조회)

### ✅ 성공 케이스

```bash
# 3-1. 앱 상세 조회
curl http://localhost:3000/api/apps/1

# Expected: 200 OK
# {
#   "id": 1,
#   "appName": "Test App",
#   "category": {...},
#   "developer": {...},
#   "images": [...],
#   ...
# }
```

### ❌ 실패 케이스

```bash
# 3-2. 존재하지 않는 앱
curl http://localhost:3000/api/apps/9999

# Expected: 404 Not Found

# 3-3. 잘못된 ID 형식
curl http://localhost:3000/api/apps/invalid

# Expected: 400 Bad Request
```

---

## 4. PATCH /api/apps/[id] (앱 수정)

### ✅ 성공 케이스

```bash
# 4-1. 앱 정보 수정
curl -X PATCH http://localhost:3000/api/apps/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {DEVELOPER_TOKEN}" \
  -d '{
    "appName": "Updated Test App",
    "description": "This is an updated description for testing",
    "targetTesters": 30
  }'

# Expected: 200 OK (업데이트된 앱 정보)
```

### ❌ 실패 케이스

```bash
# 4-2. 인증 없이 요청
curl -X PATCH http://localhost:3000/api/apps/1 \
  -H "Content-Type: application/json" \
  -d '{...}'

# Expected: 401 Unauthorized

# 4-3. 다른 개발자의 앱 수정 시도
curl -X PATCH http://localhost:3000/api/apps/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {OTHER_DEVELOPER_TOKEN}" \
  -d '{...}'

# Expected: 403 Forbidden

# 4-4. 잘못된 검증 데이터
curl -X PATCH http://localhost:3000/api/apps/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {DEVELOPER_TOKEN}" \
  -d '{
    "description": "short"
  }'

# Expected: 400 Bad Request (Validation error)
```

---

## 5. DELETE /api/apps/[id] (앱 삭제)

### ✅ 성공 케이스

```bash
# 5-1. 앱 소프트 삭제
curl -X DELETE http://localhost:3000/api/apps/1 \
  -H "Authorization: Bearer {DEVELOPER_TOKEN}"

# Expected: 200 OK
# { "message": "App deleted successfully" }
```

### ❌ 실패 케이스

```bash
# 5-2. 인증 없이 요청
curl -X DELETE http://localhost:3000/api/apps/1

# Expected: 401 Unauthorized

# 5-3. 다른 개발자의 앱 삭제 시도
curl -X DELETE http://localhost:3000/api/apps/1 \
  -H "Authorization: Bearer {OTHER_DEVELOPER_TOKEN}"

# Expected: 403 Forbidden

# 5-4. 이미 삭제된 앱 삭제 시도
curl -X DELETE http://localhost:3000/api/apps/1 \
  -H "Authorization: Bearer {DEVELOPER_TOKEN}"

# Expected: 404 Not Found
```

---

## 검증 완료 체크리스트

- [ ] 모든 Jest 테스트 통과 (24/24)
- [ ] POST /api/apps 성공 케이스 동작 확인
- [ ] POST /api/apps 실패 케이스 (401, 403, 400, 409) 동작 확인
- [ ] GET /api/apps 필터링 및 페이지네이션 동작 확인
- [ ] GET /api/apps/[id] 동작 확인
- [ ] PATCH /api/apps/[id] 권한 검증 동작 확인
- [ ] DELETE /api/apps/[id] 소프트 삭제 동작 확인
- [ ] Prisma로 DB 연결 확인
- [ ] 패키지명 중복 검증 동작 확인

---

## 참고사항

- 인증 토큰은 NextAuth를 통해 발급받아야 합니다
- 테스트 전 DB에 최소 1개의 카테고리가 존재해야 합니다
- 소프트 삭제된 앱은 `deletedAt` 필드가 null이 아닙니다
- 모든 API는 JSON 형식으로 응답합니다
