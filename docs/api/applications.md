# Applications API Documentation

## Overview

The Applications API allows testers to submit applications to test apps and developers to approve/reject applications.

## Endpoints

### POST /api/applications

Submit an application to test an app.

**Authentication**: Required (Tester)

**Request Body**:
```json
{
  "appId": number (required),
  "deviceInfo": string (optional, max 100 characters),
  "message": string (optional, max 200 characters)
}
```

**Success Response (201 Created)**:
```json
{
  "id": 1,
  "appId": 1,
  "testerId": 2,
  "deviceInfo": "Samsung Galaxy S23",
  "message": "Excited to test this app!",
  "status": "APPROVED",  // or "WAITLISTED"
  "appliedAt": "2024-01-15T10:30:00Z",
  "approvedAt": "2024-01-15T10:30:00Z",  // null if WAITLISTED
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

**Error Responses**:
- `401 Unauthorized`: Not authenticated
- `400 Bad Request`: Invalid input
  - `appId is required`
  - `appId must be a number`
  - `deviceInfo must be a string`
  - `deviceInfo must not exceed 100 characters`
  - `message must be a string`
  - `message must not exceed 200 characters`
  - `App is not currently recruiting testers`
- `404 Not Found`: `App not found`
- `409 Conflict`: `You have already applied to this app`

**Business Logic**:
- If approved applications count < targetTesters: status = APPROVED
- Otherwise: status = WAITLISTED
- Auto-approval: When an application is submitted and slots are available, it's automatically approved

---

### GET /api/applications

Get all applications for the current user, optionally filtered by appId.

**Authentication**: Required (Tester)

**Query Parameters**:
- `appId` (optional): Filter applications by app ID

**Success Response (200 OK)**:
```json
[
  {
    "id": 1,
    "appId": 1,
    "testerId": 2,
    "deviceInfo": "Samsung Galaxy S23",
    "message": "Excited to test!",
    "status": "APPROVED",
    "appliedAt": "2024-01-15T10:30:00Z",
    "approvedAt": "2024-01-15T10:30:00Z",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z",
    "app": {
      "id": 1,
      "appName": "Test App 1",
      "packageName": "com.test.app1",
      "categoryId": 1,
      "description": "Description...",
      "status": "RECRUITING"
    }
  }
]
```

**Error Responses**:
- `401 Unauthorized`: Not authenticated

**Business Logic**:
- Returns applications sorted by appliedAt (descending)
- Includes basic app information for each application

---

### PATCH /api/applications/[id]

Approve or reject an application (developer only).

**Authentication**: Required (Developer who owns the app)

**Path Parameters**:
- `id`: Application ID

**Request Body**:
```json
{
  "status": "APPROVED" | "REJECTED"
}
```

**Success Response (200 OK)**:
```json
{
  "id": 1,
  "appId": 1,
  "testerId": 2,
  "deviceInfo": "Samsung Galaxy S23",
  "message": "Excited to test!",
  "status": "APPROVED",
  "appliedAt": "2024-01-15T10:30:00Z",
  "approvedAt": "2024-01-15T10:35:00Z",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:35:00Z"
}
```

**Error Responses**:
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: User is not the app developer
- `404 Not Found`: `Application not found`
- `400 Bad Request`:
  - `status is required`
  - `status must be either APPROVED or REJECTED`
  - `Application cannot be updated from current status`
  - `Application is already APPROVED/REJECTED`

**Business Logic**:
- Can update applications in PENDING, WAITLISTED, or APPROVED status
- When rejecting an APPROVED application, automatically approves the first WAITLISTED application (if any)
- Uses database transactions to prevent race conditions
- Sets `approvedAt` to current timestamp when approving, null when rejecting

**Auto-Approval Flow**:
1. Developer rejects an APPROVED application
2. System finds first WAITLISTED application (ordered by appliedAt)
3. System automatically approves that application
4. This maintains the targetTesters count

---

## Application Status Flow

```
PENDING → APPROVED → (can be) REJECTED
   ↓                      ↑
WAITLISTED → APPROVED ────┘
              (auto-approved when slot opens)
```

**Status Descriptions**:
- `PENDING`: Application submitted, awaiting manual approval
- `WAITLISTED`: Submitted when slots are full, waiting for opening
- `APPROVED`: Accepted for testing
- `REJECTED`: Declined by developer

---

## Examples

### Submit Application
```bash
curl -X POST http://localhost:3000/api/applications \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -d '{
    "appId": 1,
    "deviceInfo": "Samsung Galaxy S23",
    "message": "I have 5 years of testing experience!"
  }'
```

### Get My Applications
```bash
curl http://localhost:3000/api/applications \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"
```

### Get Applications for Specific App
```bash
curl "http://localhost:3000/api/applications?appId=1" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"
```

### Approve Application
```bash
curl -X PATCH http://localhost:3000/api/applications/1 \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=DEVELOPER_TOKEN" \
  -d '{"status": "APPROVED"}'
```

### Reject Application
```bash
curl -X PATCH http://localhost:3000/api/applications/1 \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=DEVELOPER_TOKEN" \
  -d '{"status": "REJECTED"}'
```

---

## Related Models

### Application (Prisma Schema)
```prisma
model Application {
  id          Int               @id @default(autoincrement())
  appId       Int               @map("app_id")
  testerId    Int               @map("tester_id")
  deviceInfo  String?           @map("device_info") @db.VarChar(100)
  message     String?           @db.VarChar(200)
  status      ApplicationStatus @default(PENDING)
  appliedAt   DateTime          @default(now()) @map("applied_at")
  approvedAt  DateTime?         @map("approved_at")
  createdAt   DateTime          @default(now()) @map("created_at")
  updatedAt   DateTime          @updatedAt @map("updated_at")

  app           App            @relation(fields: [appId], references: [id])
  tester        User           @relation(fields: [testerId], references: [id])
  participation Participation?

  @@unique([appId, testerId])
  @@index([appId, status])
  @@map("applications")
}

enum ApplicationStatus {
  PENDING
  APPROVED
  REJECTED
  WAITLISTED
}
```

---

## Security

- **Authentication**: All endpoints require valid session
- **Authorization**:
  - POST/GET: Any authenticated tester
  - PATCH: Only the developer who owns the app
- **Input Validation**:
  - Type checking (appId must be number)
  - Length limits (deviceInfo ≤ 100, message ≤ 200)
  - Status enum validation
- **SQL Injection**: Protected by Prisma ORM parameterization
- **Race Conditions**: PATCH uses transactions for auto-approval logic

---

## Notes

- Applications are unique per (appId, testerId) - one application per app per tester
- Auto-approval happens immediately when slots are available
- Auto-approval from waitlist happens when an approved application is rejected
- Developers cannot modify their own applications
- Rejected applications cannot be re-approved (would need new application)
