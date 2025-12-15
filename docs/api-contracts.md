# 🔌 API Contracts

## Base URL

- **Development**: `http://localhost:3001/api`
- **Production**: `https://api.questify.app/api`

## Authentication

All API requests (except auth endpoints) require a JWT Bearer token:

```
Authorization: Bearer <access_token>
```

Tokens obtained from Keycloak OAuth2 flow.

## Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2025-12-15T10:30:00Z",
    "version": "1.0"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid task deadline",
    "details": [
      {
        "field": "deadline",
        "message": "Deadline must be in the future"
      }
    ]
  },
  "meta": {
    "timestamp": "2025-12-15T10:30:00Z",
    "requestId": "req-uuid"
  }
}
```

## Error Codes

| Code                  | HTTP Status | Description                          |
|----------------------|-------------|--------------------------------------|
| `UNAUTHORIZED`       | 401         | Missing or invalid token             |
| `FORBIDDEN`          | 403         | Insufficient permissions             |
| `NOT_FOUND`          | 404         | Resource not found                   |
| `VALIDATION_ERROR`   | 400         | Invalid request data                 |
| `CONFLICT`           | 409         | Resource already exists              |
| `RATE_LIMIT`         | 429         | Too many requests                    |
| `INTERNAL_ERROR`     | 500         | Server error                         |

---

## Auth Endpoints

### POST `/auth/login`

Redirects to Keycloak login.

**Response:**
```json
{
  "loginUrl": "https://keycloak.questify.app/realms/questify/protocol/openid-connect/auth?..."
}
```

### POST `/auth/callback`

OAuth2 callback handler.

**Request Body:**
```json
{
  "code": "authorization_code",
  "state": "random_state"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "expiresIn": 3600,
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "Jane Doe",
    "role": "guardian",
    "familyId": "family-uuid"
  }
}
```

### POST `/auth/refresh`

Refresh access token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Response:**
```json
{
  "accessToken": "new_access_token",
  "expiresIn": 3600
}
```

---

## User Endpoints

### GET `/users/me`

Get current user profile.

**Response:**
```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "name": "Jane Doe",
  "role": "guardian",
  "familyId": "family-uuid",
  "avatar": "https://cdn.questify.app/avatars/...",
  "createdAt": "2025-01-01T00:00:00Z"
}
```

### PATCH `/users/me`

Update current user profile.

**Request Body:**
```json
{
  "name": "Jane Smith",
  "avatar": "https://cdn.questify.app/avatars/new.jpg"
}
```

### GET `/users/:id`

Get user by ID (family members only).

**Response:** Same as `/users/me`

---

## Family Endpoints

### GET `/families/:id`

Get family details.

**Response:**
```json
{
  "id": "family-uuid",
  "name": "Smith Family",
  "members": [
    {
      "id": "user-uuid-1",
      "name": "Jane Doe",
      "role": "guardian",
      "joinedAt": "2025-01-01T00:00:00Z"
    },
    {
      "id": "user-uuid-2",
      "name": "Alex Doe",
      "role": "learner",
      "joinedAt": "2025-01-02T00:00:00Z"
    }
  ],
  "createdAt": "2025-01-01T00:00:00Z"
}
```

### POST `/families/:id/invite`

Invite user to family (Guardian only).

**Request Body:**
```json
{
  "email": "learner@example.com",
  "role": "learner",
  "message": "Join our family learning group!"
}
```

**Response:**
```json
{
  "invitationId": "invite-uuid",
  "invitationLink": "https://questify.app/invite/token",
  "expiresAt": "2025-12-22T00:00:00Z"
}
```

---

## Task Endpoints

### GET `/tasks`

Get tasks (filtered by role).

**Query Parameters:**
- `status` - `pending`, `in_progress`, `completed`, `overdue`
- `assignedTo` - User ID (guardian only)
- `difficulty` - `1-5`
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

**Response:**
```json
{
  "tasks": [
    {
      "id": "task-uuid",
      "title": "Complete Chapter 5 Math Problems",
      "description": "Solve problems 1-20 on page 87",
      "objective": "Master quadratic equations",
      "difficulty": 3,
      "expectedEffortMinutes": 45,
      "deadline": "2025-12-20T23:59:59Z",
      "status": "pending",
      "assignedTo": {
        "id": "learner-uuid",
        "name": "Alex Doe"
      },
      "createdBy": {
        "id": "guardian-uuid",
        "name": "Jane Doe"
      },
      "proofType": "file",
      "createdAt": "2025-12-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

### POST `/tasks`

Create a new task (Guardian only).

**Request Body:**
```json
{
  "title": "Complete Chapter 5 Math Problems",
  "description": "Solve problems 1-20 on page 87",
  "objective": "Master quadratic equations",
  "difficulty": 3,
  "expectedEffortMinutes": 45,
  "deadline": "2025-12-20T23:59:59Z",
  "proofType": "file",
  "assignedTo": "learner-uuid",
  "tags": ["math", "homework"]
}
```

**Response:**
```json
{
  "id": "task-uuid",
  "title": "Complete Chapter 5 Math Problems",
  // ... full task object
}
```

### GET `/tasks/:id`

Get task by ID.

**Response:** Same as task object in GET `/tasks`

### PATCH `/tasks/:id`

Update task (Guardian only, own tasks).

**Request Body:**
```json
{
  "deadline": "2025-12-22T23:59:59Z",
  "difficulty": 4
}
```

### DELETE `/tasks/:id`

Delete task (Guardian only, own tasks).

**Response:**
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

---

## Submission Endpoints

### GET `/submissions`

Get submissions.

**Query Parameters:**
- `taskId` - Filter by task
- `status` - `draft`, `submitted`, `under_review`, `approved`, `needs_revision`
- `page`, `limit`

**Response:**
```json
{
  "submissions": [
    {
      "id": "submission-uuid",
      "taskId": "task-uuid",
      "submittedBy": {
        "id": "learner-uuid",
        "name": "Alex Doe"
      },
      "contentType": "file",
      "fileUrls": [
        "https://cdn.questify.app/submissions/file1.pdf"
      ],
      "content": "My written explanation...",
      "status": "submitted",
      "submittedAt": "2025-12-16T14:45:00Z",
      "attemptNumber": 1,
      "isLate": false
    }
  ]
}
```

### POST `/submissions`

Create/submit work (Learner).

**Request Body:**
```json
{
  "taskId": "task-uuid",
  "contentType": "file",
  "fileUrls": ["https://cdn.questify.app/submissions/upload.pdf"],
  "content": "Additional notes..."
}
```

**Response:**
```json
{
  "id": "submission-uuid",
  "taskId": "task-uuid",
  "status": "submitted",
  // ... full submission object
}
```

### POST `/submissions/:id/review`

Review submission (Guardian only).

**Request Body:**
```json
{
  "grade": 85,
  "maxGrade": 100,
  "feedback": "Great work! Watch out for sign errors in problem 7.",
  "status": "approved"
}
```

**Response:**
```json
{
  "id": "submission-uuid",
  "grade": 85,
  "feedback": "Great work!...",
  "status": "approved",
  "reviewedAt": "2025-12-16T18:00:00Z",
  "reviewedBy": {
    "id": "guardian-uuid",
    "name": "Jane Doe"
  }
}
```

### POST `/submissions/:id/request-revision`

Request revision (Guardian only).

**Request Body:**
```json
{
  "revisionNotes": "Please redo problems 3, 7, and 15",
  "newDeadline": "2025-12-18T23:59:59Z"
}
```

---

## Analytics Endpoints

### GET `/analytics/user/:userId`

Get user analytics.

**Query Parameters:**
- `from` - Start date (ISO 8601)
- `to` - End date (ISO 8601)

**Response:**
```json
{
  "userId": "learner-uuid",
  "period": {
    "from": "2025-12-01T00:00:00Z",
    "to": "2025-12-15T23:59:59Z"
  },
  "stats": {
    "tasksAssigned": 20,
    "tasksCompleted": 18,
    "completionRate": 0.90,
    "averageGrade": 87.5,
    "onTimeCompletions": 16,
    "lateCompletions": 2,
    "currentStreak": 7,
    "bestStreak": 14,
    "totalTimeSpentMinutes": 540,
    "averageTimeVsExpected": 0.95
  },
  "byDifficulty": {
    "1": { "completed": 3, "avg_grade": 95 },
    "2": { "completed": 5, "avg_grade": 90 },
    "3": { "completed": 7, "avg_grade": 85 },
    "4": { "completed": 2, "avg_grade": 80 },
    "5": { "completed": 1, "avg_grade": 78 }
  }
}
```

### GET `/analytics/family/:familyId`

Get family-wide analytics (Guardian only).

**Response:**
```json
{
  "familyId": "family-uuid",
  "period": { ... },
  "memberStats": [
    {
      "userId": "learner-uuid-1",
      "name": "Alex Doe",
      "completionRate": 0.90,
      "currentStreak": 7
    },
    {
      "userId": "learner-uuid-2",
      "name": "Sam Doe",
      "completionRate": 0.85,
      "currentStreak": 5
    }
  ],
  "totals": {
    "tasksAssigned": 45,
    "tasksCompleted": 38,
    "overallCompletionRate": 0.84
  }
}
```

---

## Notification Endpoints

### GET `/notifications`

Get user notifications.

**Query Parameters:**
- `read` - Filter by read status (`true`/`false`)
- `type` - `deadline`, `streak`, `achievement`, `review`
- `page`, `limit`

**Response:**
```json
{
  "notifications": [
    {
      "id": "notification-uuid",
      "type": "deadline",
      "title": "Task due soon",
      "message": "Complete Chapter 5 Math Problems is due in 24 hours",
      "data": {
        "taskId": "task-uuid",
        "deadline": "2025-12-20T23:59:59Z"
      },
      "read": false,
      "createdAt": "2025-12-19T09:00:00Z"
    }
  ]
}
```

### PATCH `/notifications/:id/read`

Mark notification as read.

**Response:**
```json
{
  "success": true
}
```

---

## WebSocket Events

### Connection

```javascript
const socket = io('wss://api.questify.app', {
  auth: {
    token: 'Bearer <access_token>'
  }
});
```

### Client → Server

#### Subscribe to updates
```javascript
socket.emit('subscribe', { userId: 'user-uuid' });
```

### Server → Client

#### New task assigned
```javascript
socket.on('task:assigned', (data) => {
  console.log('New task:', data.task);
});
```

#### Submission reviewed
```javascript
socket.on('submission:reviewed', (data) => {
  console.log('Feedback received:', data.review);
});
```

#### Notification
```javascript
socket.on('notification', (data) => {
  console.log('New notification:', data);
});
```

#### Streak update
```javascript
socket.on('streak:updated', (data) => {
  console.log('Streak:', data.currentStreak);
});
```

---

## File Upload

### POST `/upload`

Upload files (submissions, avatars).

**Request:**
- `Content-Type: multipart/form-data`
- `file` - The file to upload
- `type` - `submission`, `avatar`, `attachment`

**Response:**
```json
{
  "url": "https://cdn.questify.app/submissions/file-uuid.pdf",
  "filename": "homework.pdf",
  "size": 245678,
  "mimeType": "application/pdf"
}
```

---

## Rate Limits

| Endpoint Pattern        | Limit              |
|------------------------|-------------------|
| `/auth/*`              | 5 req/min         |
| `/tasks`, `/submissions` | 100 req/min     |
| `/analytics/*`         | 50 req/min        |
| `/upload`              | 10 req/min        |

---

**API Version**: 1.0  
**Last Updated**: December 2025
