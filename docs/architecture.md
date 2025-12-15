# 🏗️ Questify Architecture

## System Overview

Questify is an event-driven, polyglot-persistent e-learning platform designed for home use. The architecture emphasizes real-time feedback, accountability, and scalability.

```
┌─────────────┐
│   Browser   │
│  (Next.js)  │
└──────┬──────┘
       │ HTTP/WebSocket
       ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway / Backend                   │
│                         (NestJS)                             │
├─────────────┬─────────────┬─────────────┬──────────────────┤
│   Auth      │   Tasks     │ Submissions │  Notifications   │
│  Module     │   Module    │   Module    │     Module       │
└──────┬──────┴──────┬──────┴──────┬──────┴──────┬───────────┘
       │             │              │              │
       ▼             ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Event Bus (Kafka)                       │
│  Topics: task-events, submission-events, notification-events │
└─────────────┬──────────────────┬─────────────────────────────┘
              │                  │
              ▼                  ▼
    ┌──────────────────┐  ┌──────────────────┐
    │   Analytics      │  │   Notification   │
    │   Consumer       │  │   Consumer       │
    │   → ClickHouse   │  │   → Email/WS     │
    └──────────────────┘  └──────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                              │
├──────────────┬──────────────┬───────────────────────────────┤
│  PostgreSQL  │    Redis     │        ClickHouse             │
│              │              │                               │
│  • Users     │  • Sessions  │  • Event analytics            │
│  • Tasks     │  • Streaks   │  • Time-series metrics        │
│  • Submissions│ • Cache     │  • Historical data            │
│  • Reviews   │  • Real-time │  • Reporting                  │
└──────────────┴──────────────┴───────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   Identity & Access                          │
│                      (Keycloak)                              │
│  • OAuth2 / OpenID Connect                                   │
│  • Role-based access control (RBAC)                          │
│  • SSO support                                               │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Frontend (Next.js)

**Technology**: Next.js 14 with App Router, React Server Components, TypeScript

**Key Features**:
- Server-side rendering for performance
- Real-time updates via WebSockets
- Role-based UI rendering
- Progressive Web App (PWA) capabilities

**Pages**:
- `/guardian` - Task assignment, review submissions, progress monitoring
- `/learner` - Task list, submission interface, personal progress
- `/superuser` - System monitoring, user management, logs
- `/` - Landing page and authentication

**State Management**:
- React Server Components for data fetching
- Zustand for client-side state
- React Query for server state caching

### 2. Backend (NestJS)

**Technology**: NestJS with TypeScript, built on Express

**Architecture Pattern**: Modular monolith (microservices-ready)

**Modules**:

#### Auth Module
- Integration with Keycloak
- JWT validation
- Role-based guards
- Session management

#### Users Module
- User CRUD operations
- Profile management
- Family/household relationships
- Role assignments

#### Tasks Module
- Task creation and assignment
- Difficulty calculation
- Deadline management
- Task templates

#### Submissions Module
- Multiple submission types (text, file, quiz, photo)
- Review workflow
- Retry logic
- Grade calculation

#### Notifications Module
- Email notifications (SMTP)
- WebSocket broadcasts
- Notification preferences
- Scheduled reminders

#### Analytics Module
- Event aggregation
- Progress calculations
- Report generation
- Stats API

#### Events Module (Kafka Integration)
- Event producers
- Event consumers
- Dead letter queues
- Event replay capability

### 3. Event Streaming (Kafka)

**Purpose**: Decoupled, event-driven communication

**Topics**:

```typescript
task-events
├── task.created
├── task.assigned
├── task.updated
├── task.deleted
└── task.completed

submission-events
├── submission.created
├── submission.submitted
├── submission.reviewed
├── submission.graded
└── submission.returned

user-events
├── user.registered
├── user.logged_in
├── user.profile_updated
└── user.deleted

notification-events
├── notification.deadline_approaching
├── notification.streak_broken
├── notification.achievement_unlocked
└── notification.task_assigned

analytics-events
├── analytics.task_time_tracked
├── analytics.streak_updated
├── analytics.completion_recorded
└── analytics.engagement_tracked
```

**Consumer Groups**:
- `analytics-consumer` - Processes events → ClickHouse
- `notification-consumer` - Sends notifications
- `stats-consumer` - Updates Redis real-time stats

### 4. Database Layer

#### PostgreSQL (Transactional Data)

**Schema Design**:

```sql
-- Core entities
users (id, email, name, role, family_id, created_at)
families (id, name, plan_type, created_at)
tasks (id, title, description, objective, difficulty, deadline, expected_effort_minutes, created_by, assigned_to, status)
submissions (id, task_id, user_id, content, file_urls, submitted_at, reviewed_at, grade, feedback)
reviews (id, submission_id, reviewer_id, rating, comments, created_at)

-- Supporting tables
task_templates (id, name, category, default_difficulty, estimated_time)
achievements (id, user_id, type, earned_at, metadata)
streaks (id, user_id, streak_count, last_activity_date, best_streak)
```

**Relationships**:
- One family → Many users
- One user (guardian) → Many tasks created
- One user (learner) → Many tasks assigned
- One task → Many submissions (retry logic)

#### Redis (Cache & Real-time)

**Data Structures**:

```
# Sessions
session:{userId} → JWT metadata, permissions

# Streaks (sorted sets)
streak:{userId} → {date: score}

# Real-time stats (hashes)
stats:{userId} → {completed: 10, pending: 5, late: 2}

# Cache (strings with TTL)
task:{taskId} → JSON task object (TTL: 5min)
user:{userId} → JSON user profile (TTL: 10min)

# Leaderboard (sorted set)
leaderboard:family:{familyId} → {userId: score}
```

#### ClickHouse (Analytics)

**Tables**:

```sql
-- Event storage
events (
    event_id UUID,
    event_type String,
    user_id UUID,
    family_id UUID,
    timestamp DateTime64,
    payload String,
    INDEX idx_user_time (user_id, timestamp) TYPE minmax GRANULARITY 1
)

-- Aggregated metrics
task_completions_daily (
    date Date,
    user_id UUID,
    family_id UUID,
    completed_count UInt32,
    avg_time_taken Float32,
    late_count UInt32
) ENGINE = SummingMergeTree()
  PARTITION BY toYYYYMM(date)
  ORDER BY (date, user_id)

-- Time tracking
time_logs (
    task_id UUID,
    user_id UUID,
    start_time DateTime64,
    end_time DateTime64,
    duration_seconds UInt32
)
```

### 5. Authentication (Keycloak)

**Realm**: `questify-realm`

**Clients**:
- `questify-frontend` (Public client, PKCE flow)
- `questify-backend` (Confidential client, service account)

**Roles**:
- `guardian` - Can create/assign tasks, review submissions
- `learner` - Can view/complete tasks, submit work
- `superuser` - Full system access
- `system` - Service account for automated actions

**Role Mappings**:
```json
{
  "guardian": ["task:create", "task:assign", "submission:review"],
  "learner": ["task:view", "task:complete", "submission:create"],
  "superuser": ["*"],
  "system": ["notification:send", "analytics:write"]
}
```

## Data Flow Examples

### Example 1: Guardian Assigns Task

```
1. Guardian → POST /api/tasks
   ↓
2. Backend validates & saves to PostgreSQL
   ↓
3. Backend publishes event → Kafka (task.assigned)
   ↓
4. Consumers process event:
   ├─ Notification Consumer → Send email to learner
   ├─ Analytics Consumer → Record in ClickHouse
   └─ Stats Consumer → Update Redis stats
   ↓
5. WebSocket broadcasts to learner's browser
   ↓
6. Learner sees new task in real-time
```

### Example 2: Learner Submits Work

```
1. Learner → POST /api/submissions
   ↓
2. Backend saves submission to PostgreSQL
   ↓
3. Backend publishes event → Kafka (submission.submitted)
   ↓
4. Consumers process event:
   ├─ Notification Consumer → Notify guardian
   ├─ Analytics Consumer → Log submission time
   └─ Stats Consumer → Update completion stats
   ↓
5. WebSocket update to guardian dashboard
   ↓
6. Guardian reviews submission
```

### Example 3: Automated Deadline Reminder

```
1. Cron job checks PostgreSQL for approaching deadlines
   ↓
2. Publishes events → Kafka (notification.deadline_approaching)
   ↓
3. Notification Consumer:
   ├─ Sends email reminder
   ├─ Creates in-app notification
   └─ WebSocket push notification
```

## Scalability Considerations

### Horizontal Scaling
- Backend: Stateless design allows multiple instances behind load balancer
- Kafka: Multiple brokers for high throughput
- PostgreSQL: Read replicas for query scaling
- ClickHouse: Distributed mode for large datasets

### Caching Strategy
- Redis for frequently accessed data
- HTTP caching headers for static content
- Query result caching with TTL

### Event Processing
- Kafka consumer groups for parallel processing
- Idempotent event handlers
- Dead letter queues for failed events

## Security

### Authentication Flow
1. User login → Redirected to Keycloak
2. Keycloak validates credentials
3. Returns JWT access token + refresh token
4. Frontend stores tokens securely (httpOnly cookies)
5. Backend validates JWT on each request

### Authorization
- Role-Based Access Control (RBAC)
- Resource-level permissions
- Family-scoped data isolation

### Data Protection
- Passwords hashed (bcrypt)
- Sensitive data encrypted at rest
- HTTPS/TLS for all communications
- CORS policies enforced

## Monitoring & Observability

### Metrics (Prometheus + Grafana)
- Request rates, latency, error rates
- Database connection pool stats
- Kafka consumer lag
- Cache hit rates

### Logging (ELK Stack)
- Structured JSON logs
- Correlation IDs for request tracing
- Error stack traces
- Audit logs for sensitive operations

### Tracing (Jaeger)
- Distributed tracing across services
- Performance bottleneck identification

## Deployment

### Local Development
- Docker Compose for all services
- Hot reload for backend and frontend
- Seed data for testing

### Production (Cloud)
- **Frontend**: Vercel / Netlify
- **Backend**: AWS ECS / Google Cloud Run
- **Databases**: Managed services (RDS, ElastiCache, ClickHouse Cloud)
- **Kafka**: Confluent Cloud / AWS MSK
- **Keycloak**: Self-hosted on Kubernetes

---

**Architecture Version**: 1.0  
**Last Updated**: December 2025
