# 📡 Event Schemas and Flows

## Event-Driven Architecture

Questify uses Apache Kafka as the event backbone. All significant state changes produce events that are consumed by various services for analytics, notifications, and real-time updates.

## Event Design Principles

1. **Immutable**: Events cannot be changed once published
2. **Self-Contained**: All necessary context included in event payload
3. **Versioned**: Schema evolution supported via version field
4. **Timestamped**: All events include ISO 8601 timestamp
5. **Traceable**: Correlation IDs for distributed tracing

## Event Structure

All events follow this base structure:

```typescript
interface BaseEvent {
  eventId: string;           // UUID
  eventType: string;         // e.g., "task.assigned"
  eventVersion: string;      // Semantic version, e.g., "1.0.0"
  timestamp: string;         // ISO 8601
  correlationId?: string;    // For tracing related events
  userId?: string;           // Actor who triggered the event
  familyId?: string;         // Family context
  payload: object;           // Event-specific data
  metadata?: {
    source: string;          // Service that produced event
    environment: string;     // dev, staging, production
  };
}
```

## Kafka Topics

### Topic: `task-events`

All task lifecycle events.

#### Event: `task.created`

```typescript
{
  eventId: "550e8400-e29b-41d4-a716-446655440000",
  eventType: "task.created",
  eventVersion: "1.0.0",
  timestamp: "2025-12-15T10:30:00Z",
  userId: "guardian-uuid",
  familyId: "family-uuid",
  payload: {
    taskId: "task-uuid",
    title: "Complete Chapter 5 Math Problems",
    description: "Solve problems 1-20 on page 87",
    objective: "Master quadratic equations",
    difficulty: 3,
    expectedEffortMinutes: 45,
    deadline: "2025-12-20T23:59:59Z",
    createdBy: "guardian-uuid",
    proofType: "file" // file, text, quiz, photo, explanation
  }
}
```

#### Event: `task.assigned`

```typescript
{
  eventId: "...",
  eventType: "task.assigned",
  eventVersion: "1.0.0",
  timestamp: "2025-12-15T10:31:00Z",
  userId: "guardian-uuid",
  familyId: "family-uuid",
  payload: {
    taskId: "task-uuid",
    assignedTo: "learner-uuid",
    assignedBy: "guardian-uuid",
    dueDate: "2025-12-20T23:59:59Z"
  }
}
```

#### Event: `task.started`

```typescript
{
  eventId: "...",
  eventType: "task.started",
  eventVersion: "1.0.0",
  timestamp: "2025-12-16T14:00:00Z",
  userId: "learner-uuid",
  familyId: "family-uuid",
  payload: {
    taskId: "task-uuid",
    startedAt: "2025-12-16T14:00:00Z"
  }
}
```

#### Event: `task.completed`

```typescript
{
  eventId: "...",
  eventType: "task.completed",
  eventVersion: "1.0.0",
  timestamp: "2025-12-16T14:45:00Z",
  userId: "learner-uuid",
  familyId: "family-uuid",
  payload: {
    taskId: "task-uuid",
    completedAt: "2025-12-16T14:45:00Z",
    timeTakenMinutes: 45,
    expectedMinutes: 45,
    isLate: false,
    retryCount: 0
  }
}
```

### Topic: `submission-events`

Submission lifecycle and review events.

#### Event: `submission.created`

```typescript
{
  eventId: "...",
  eventType: "submission.created",
  eventVersion: "1.0.0",
  timestamp: "2025-12-16T14:45:00Z",
  userId: "learner-uuid",
  familyId: "family-uuid",
  payload: {
    submissionId: "submission-uuid",
    taskId: "task-uuid",
    submittedBy: "learner-uuid",
    contentType: "file", // file, text, quiz, photo, explanation
    content: "s3://bucket/submissions/...",
    submittedAt: "2025-12-16T14:45:00Z",
    isLate: false,
    attemptNumber: 1
  }
}
```

#### Event: `submission.reviewed`

```typescript
{
  eventId: "...",
  eventType: "submission.reviewed",
  eventVersion: "1.0.0",
  timestamp: "2025-12-16T18:00:00Z",
  userId: "guardian-uuid",
  familyId: "family-uuid",
  payload: {
    submissionId: "submission-uuid",
    taskId: "task-uuid",
    reviewedBy: "guardian-uuid",
    grade: 85,
    maxGrade: 100,
    feedback: "Great work! Watch out for sign errors.",
    status: "approved", // approved, needs_revision, rejected
    reviewedAt: "2025-12-16T18:00:00Z"
  }
}
```

#### Event: `submission.revision_requested`

```typescript
{
  eventId: "...",
  eventType: "submission.revision_requested",
  eventVersion: "1.0.0",
  timestamp: "2025-12-16T18:00:00Z",
  userId: "guardian-uuid",
  familyId: "family-uuid",
  payload: {
    submissionId: "submission-uuid",
    taskId: "task-uuid",
    requestedBy: "guardian-uuid",
    revisionNotes: "Please redo problems 3, 7, and 15",
    newDeadline: "2025-12-18T23:59:59Z"
  }
}
```

### Topic: `user-events`

User activity and profile events.

#### Event: `user.registered`

```typescript
{
  eventId: "...",
  eventType: "user.registered",
  eventVersion: "1.0.0",
  timestamp: "2025-12-15T09:00:00Z",
  userId: "new-user-uuid",
  familyId: "family-uuid",
  payload: {
    userId: "new-user-uuid",
    email: "learner@example.com",
    name: "Alex Smith",
    role: "learner",
    registeredBy: "guardian-uuid"
  }
}
```

#### Event: `user.logged_in`

```typescript
{
  eventId: "...",
  eventType: "user.logged_in",
  eventVersion: "1.0.0",
  timestamp: "2025-12-16T08:00:00Z",
  userId: "user-uuid",
  familyId: "family-uuid",
  payload: {
    userId: "user-uuid",
    loginMethod: "keycloak",
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0..."
  }
}
```

### Topic: `notification-events`

Notification triggers and delivery events.

#### Event: `notification.deadline_approaching`

```typescript
{
  eventId: "...",
  eventType: "notification.deadline_approaching",
  eventVersion: "1.0.0",
  timestamp: "2025-12-19T09:00:00Z",
  userId: "learner-uuid",
  familyId: "family-uuid",
  payload: {
    taskId: "task-uuid",
    taskTitle: "Complete Chapter 5 Math Problems",
    deadline: "2025-12-20T23:59:59Z",
    hoursRemaining: 39,
    notificationType: "deadline_24h",
    channels: ["email", "websocket", "push"]
  }
}
```

#### Event: `notification.streak_broken`

```typescript
{
  eventId: "...",
  eventType: "notification.streak_broken",
  eventVersion: "1.0.0",
  timestamp: "2025-12-17T00:00:01Z",
  userId: "learner-uuid",
  familyId: "family-uuid",
  payload: {
    userId: "learner-uuid",
    previousStreak: 14,
    lastActivityDate: "2025-12-15",
    streakType: "daily_completion"
  }
}
```

#### Event: `notification.achievement_unlocked`

```typescript
{
  eventId: "...",
  eventType: "notification.achievement_unlocked",
  eventVersion: "1.0.0",
  timestamp: "2025-12-16T14:45:00Z",
  userId: "learner-uuid",
  familyId: "family-uuid",
  payload: {
    achievementId: "achievement-uuid",
    achievementType: "first_perfect_score",
    title: "Perfect Score!",
    description: "Earned your first 100% grade",
    icon: "🏆",
    points: 50
  }
}
```

### Topic: `analytics-events`

Analytical and metrics events.

#### Event: `analytics.task_time_tracked`

```typescript
{
  eventId: "...",
  eventType: "analytics.task_time_tracked",
  eventVersion: "1.0.0",
  timestamp: "2025-12-16T14:45:00Z",
  userId: "learner-uuid",
  familyId: "family-uuid",
  payload: {
    taskId: "task-uuid",
    userId: "learner-uuid",
    actualMinutes: 45,
    expectedMinutes: 45,
    efficiency: 1.0, // expectedMinutes / actualMinutes
    completedOnTime: true
  }
}
```

#### Event: `analytics.streak_updated`

```typescript
{
  eventId: "...",
  eventType: "analytics.streak_updated",
  eventVersion: "1.0.0",
  timestamp: "2025-12-16T23:59:59Z",
  userId: "learner-uuid",
  familyId: "family-uuid",
  payload: {
    userId: "learner-uuid",
    streakType: "daily_completion",
    currentStreak: 15,
    bestStreak: 21,
    lastActivityDate: "2025-12-16"
  }
}
```

## Event Flows

### Flow 1: Task Assignment to Completion

```
Guardian creates task
  ↓
[task.created] → Kafka
  ↓
Analytics Consumer → ClickHouse
  ↓
Guardian assigns to learner
  ↓
[task.assigned] → Kafka
  ↓
├─ Notification Consumer → Email to learner
└─ Stats Consumer → Update Redis (pending tasks +1)
  ↓
Learner starts task
  ↓
[task.started] → Kafka
  ↓
Analytics Consumer → Log start time
  ↓
Learner submits work
  ↓
[submission.created] → Kafka
  ↓
├─ Notification Consumer → Notify guardian
└─ Analytics Consumer → Calculate time taken
  ↓
[task.completed] → Kafka
  ↓
├─ Stats Consumer → Update completion rate
├─ Analytics Consumer → Update metrics
└─ Achievement Consumer → Check for unlocks
```

### Flow 2: Deadline Reminder System

```
Cron Job (runs every hour)
  ↓
Query PostgreSQL for tasks with:
  - deadline within 24h
  - status = 'pending'
  - not yet notified
  ↓
For each task:
  ↓
[notification.deadline_approaching] → Kafka
  ↓
Notification Consumer
  ↓
├─ Send email reminder
├─ Create in-app notification
├─ WebSocket push to frontend
└─ Mark as notified in DB
```

### Flow 3: Streak Calculation

```
Daily Cron Job (midnight)
  ↓
For each active learner:
  ↓
Query: Did learner complete any task yesterday?
  ↓
YES ─┐                NO ─┐
     │                    │
     ↓                    ↓
Increment streak     Reset streak
     │                    │
     ↓                    ↓
Update Redis        [notification.streak_broken]
     │                    ↓
     ↓               Email notification
[analytics.streak_updated]
     ↓
Check for achievements
     ↓
If streak milestone (7, 30, 100 days):
  ↓
[notification.achievement_unlocked]
```

## Event Consumer Implementation

### Analytics Consumer (Go to ClickHouse)

```typescript
// Pseudocode
consumer.on('task.completed', async (event) => {
  await clickhouse.insert('task_completions', {
    date: event.timestamp,
    task_id: event.payload.taskId,
    user_id: event.userId,
    family_id: event.familyId,
    time_taken: event.payload.timeTakenMinutes,
    expected_time: event.payload.expectedMinutes,
    is_late: event.payload.isLate,
    retry_count: event.payload.retryCount
  });
});
```

### Notification Consumer (Send Emails/WebSockets)

```typescript
consumer.on('notification.deadline_approaching', async (event) => {
  const { taskTitle, deadline, hoursRemaining } = event.payload;
  
  // Send email
  await emailService.send({
    to: event.userId,
    subject: `⏰ Task due in ${hoursRemaining} hours`,
    template: 'deadline-reminder',
    data: { taskTitle, deadline }
  });
  
  // WebSocket push
  await websocketService.emit(event.userId, 'notification', {
    type: 'deadline',
    message: `${taskTitle} is due soon!`,
    taskId: event.payload.taskId
  });
});
```

## Event Monitoring

### Key Metrics

- **Kafka Lag**: Consumer lag per topic
- **Event Throughput**: Events/second per topic
- **Processing Time**: Time from event publish to consumer completion
- **Error Rate**: Failed event processing rate
- **Dead Letter Queue Size**: Failed events requiring manual intervention

### Alerts

- Consumer lag > 1000 messages
- Event processing time > 5 seconds
- Error rate > 1%
- DLQ size > 100 messages

---

**Event Schema Version**: 1.0  
**Last Updated**: December 2025
