# Applications API Manual Testing Guide

## Setup

1. Start PostgreSQL database
2. Run migrations: `npx prisma migrate dev`
3. Seed test data (see below)
4. Start dev server: `npm run dev`

## Seed Data

```sql
-- Insert test users
INSERT INTO users (id, email, email_hash, name, nickname, role, provider, provider_id, created_at, updated_at)
VALUES
  (1, 'dev@test.com', 'hash1', 'Developer', 'dev1', 'DEVELOPER', 'GOOGLE', 'google-dev-1', NOW(), NOW()),
  (2, 'tester@test.com', 'hash2', 'Tester', 'tester1', 'TESTER', 'GOOGLE', 'google-tester-1', NOW(), NOW()),
  (3, 'tester2@test.com', 'hash3', 'Tester 2', 'tester2', 'TESTER', 'GOOGLE', 'google-tester-2', NOW(), NOW());

-- Insert test category
INSERT INTO categories (id, name, icon, sort_order, is_active, created_at, updated_at)
VALUES (1, 'Games', '🎮', 1, true, NOW(), NOW());

-- Insert test app (RECRUITING status)
INSERT INTO apps (id, developer_id, app_name, package_name, category_id, description, test_type, target_testers, test_link, status, created_at, updated_at)
VALUES (1, 1, 'Test App 1', 'com.test.app1', 1, 'Test app for manual testing', 'PAID_REWARD', 10, 'https://testflight.apple.com/test', 'RECRUITING', NOW(), NOW());
```

## Test Scenarios

### POST /api/applications

#### 1. Unauthorized (401)
```bash
curl -X POST http://localhost:3000/api/applications \
  -H "Content-Type: application/json" \
  -d '{"appId":1,"deviceInfo":"Samsung Galaxy S23"}'

# Expected: {"error":"Unauthorized"}
```

#### 2. Missing appId (400)
```bash
# Login first as tester (use browser or set session cookie)
curl -X POST http://localhost:3000/api/applications \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{"deviceInfo":"Samsung Galaxy S23"}'

# Expected: {"error":"appId is required"}
```

#### 3. Invalid appId type (400)
```bash
curl -X POST http://localhost:3000/api/applications \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{"appId":"invalid","deviceInfo":"Samsung Galaxy S23"}'

# Expected: {"error":"appId must be a number"}
```

#### 4. App not found (404)
```bash
curl -X POST http://localhost:3000/api/applications \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{"appId":999,"deviceInfo":"Samsung Galaxy S23"}'

# Expected: {"error":"App not found"}
```

#### 5. Successful application with APPROVED status (201)
```bash
curl -X POST http://localhost:3000/api/applications \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{"appId":1,"deviceInfo":"Samsung Galaxy S23","message":"Excited to test!"}'

# Expected:
# {
#   "id": 1,
#   "appId": 1,
#   "testerId": 2,
#   "deviceInfo": "Samsung Galaxy S23",
#   "message": "Excited to test!",
#   "status": "APPROVED",
#   "approvedAt": "2024-..."
# }
```

#### 6. Duplicate application (409)
```bash
# Run same request again
curl -X POST http://localhost:3000/api/applications \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{"appId":1,"deviceInfo":"Samsung Galaxy S23"}'

# Expected: {"error":"You have already applied to this app"}
```

#### 7. WAITLISTED status when slots full
```bash
# After 10 approved applications, next one should be waitlisted
# Login as tester3 and apply
curl -X POST http://localhost:3000/api/applications \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=TESTER3_SESSION_TOKEN" \
  -d '{"appId":1,"deviceInfo":"iPhone 14 Pro"}'

# Expected: status should be "WAITLISTED"
```

### GET /api/applications

#### 1. Unauthorized (401)
```bash
curl http://localhost:3000/api/applications

# Expected: {"error":"Unauthorized"}
```

#### 2. Get all applications for current user
```bash
curl http://localhost:3000/api/applications \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"

# Expected: Array of applications with app details
```

#### 3. Filter by appId
```bash
curl "http://localhost:3000/api/applications?appId=1" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"

# Expected: Array filtered by appId=1
```

### PATCH /api/applications/[id]

#### 1. Unauthorized (401)
```bash
curl -X PATCH http://localhost:3000/api/applications/1 \
  -H "Content-Type: application/json" \
  -d '{"status":"APPROVED"}'

# Expected: {"error":"Unauthorized"}
```

#### 2. Missing status (400)
```bash
curl -X PATCH http://localhost:3000/api/applications/1 \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=DEVELOPER_SESSION_TOKEN" \
  -d '{}'

# Expected: {"error":"status is required"}
```

#### 3. Invalid status (400)
```bash
curl -X PATCH http://localhost:3000/api/applications/1 \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=DEVELOPER_SESSION_TOKEN" \
  -d '{"status":"INVALID"}'

# Expected: {"error":"status must be either APPROVED or REJECTED"}
```

#### 4. Application not found (404)
```bash
curl -X PATCH http://localhost:3000/api/applications/999 \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=DEVELOPER_SESSION_TOKEN" \
  -d '{"status":"APPROVED"}'

# Expected: {"error":"Application not found"}
```

#### 5. Forbidden - not app developer (403)
```bash
# Login as different developer and try to approve application for app 1
curl -X PATCH http://localhost:3000/api/applications/1 \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=OTHER_DEVELOPER_SESSION" \
  -d '{"status":"APPROVED"}'

# Expected: {"error":"Forbidden"}
```

#### 6. Approve application (200)
```bash
curl -X PATCH http://localhost:3000/api/applications/1 \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=DEVELOPER_SESSION_TOKEN" \
  -d '{"status":"APPROVED"}'

# Expected: Updated application with status="APPROVED" and approvedAt set
```

#### 7. Reject application (200)
```bash
curl -X PATCH http://localhost:3000/api/applications/1 \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=DEVELOPER_SESSION_TOKEN" \
  -d '{"status":"REJECTED"}'

# Expected: Updated application with status="REJECTED" and approvedAt=null
```

#### 8. Auto-approve waitlisted when approved rejected
```bash
# 1. Create waitlisted application (when slots full)
# 2. Reject an approved application
# 3. Check that waitlisted application is now approved

# This requires checking database or calling GET /api/applications
```

## Notes

- Use browser DevTools to get session token after logging in
- Or use Postman/Insomnia for easier cookie management
- Check database directly for auto-approval logic: `SELECT * FROM applications WHERE app_id = 1 ORDER BY applied_at;`
