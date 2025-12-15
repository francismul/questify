# 👥 Roles and Permissions

## Role Hierarchy

```
Superuser (Admin)
    │
    ├─ Guardian (Parent/Teacher)
    │   └─ Learner (Student/Child)
    │
    └─ System (Automated Service)
```

## Role Definitions

### 1. Guardian

**Purpose**: Assigns learning tasks, monitors progress, provides feedback

**Capabilities**:
- Create and manage tasks
- Assign tasks to learners in their family
- Review submissions and provide feedback
- Request revisions on submitted work
- Monitor learner progress and statistics
- Set deadlines and difficulty levels
- Create task templates
- View family-wide analytics
- Send encouragement messages

**Permissions**:
```typescript
permissions: [
  'task:create',
  'task:read:family',
  'task:update:own',
  'task:delete:own',
  'task:assign',
  'submission:read:family',
  'submission:review',
  'submission:grade',
  'analytics:read:family',
  'learner:read:family',
  'notification:send:family'
]
```

**UI Access**:
- Dashboard with family overview
- Task management interface
- Submission review queue
- Progress reports and analytics
- Learner profiles

**Example Users**:
- Parents managing children's homework
- Tutors assigning exercises
- Homeschool educators

---

### 2. Learner

**Purpose**: Receives tasks, completes work, tracks personal growth

**Capabilities**:
- View assigned tasks
- Submit work (text, files, photos, quizzes)
- Track personal progress
- View feedback from guardian
- Retry failed/rejected submissions
- View personal achievements and streaks
- Request deadline extensions (requires guardian approval)

**Permissions**:
```typescript
permissions: [
  'task:read:assigned',
  'submission:create:own',
  'submission:read:own',
  'submission:update:draft',
  'analytics:read:own',
  'profile:read:own',
  'profile:update:own'
]
```

**UI Access**:
- Personal task dashboard
- Task submission interface
- Progress tracker
- Achievement gallery
- Personal calendar

**Example Users**:
- School-aged children
- Siblings learning together
- Students in home education

---

### 3. System

**Purpose**: Automated agent for notifications, reminders, and accountability

**Capabilities**:
- Send deadline reminders
- Trigger streak notifications
- Generate daily/weekly reports
- Auto-archive completed tasks
- Calculate and update statistics
- Unlock achievements
- Send motivational messages

**Permissions**:
```typescript
permissions: [
  'notification:send:all',
  'analytics:write',
  'achievement:unlock',
  'stats:update',
  'task:archive',
  'report:generate'
]
```

**Triggered Actions**:
- **24 hours before deadline**: Email reminder to learner
- **Deadline passed**: Notify guardian and learner
- **Midnight daily**: Calculate streaks
- **Weekly**: Generate progress reports
- **Achievement earned**: Send congratulations

**Example Automations**:
- "⏰ Your math homework is due tomorrow!"
- "🔥 You've completed tasks 7 days in a row!"
- "⚠️ Your streak is at risk - no tasks completed today"

---

### 4. Superuser

**Purpose**: Platform administration, system monitoring, and account management

**Capabilities**:
- Manage all users and families
- View system-wide analytics
- Access application logs
- Monitor infrastructure health
- Configure system settings
- Handle support requests
- Review and moderate content
- Export data for compliance

**Permissions**:
```typescript
permissions: [
  '*'  // Full system access
]
```

**UI Access**:
- Admin dashboard with system metrics
- User management interface
- Logging and monitoring tools
- Configuration panel
- Support ticket system
- Database query interface (read-only)

**Example Users**:
- Platform administrators
- Technical support staff
- System operators

---

## Permission Matrix

| Action                      | Guardian | Learner | System | Superuser |
|----------------------------|----------|---------|--------|-----------|
| Create Task                | ✅       | ❌      | ❌     | ✅        |
| Assign Task                | ✅       | ❌      | ❌     | ✅        |
| View Own Tasks             | ✅       | ✅      | ✅     | ✅        |
| View Family Tasks          | ✅       | ❌      | ✅     | ✅        |
| Submit Work                | ❌       | ✅      | ❌     | ✅        |
| Review Submission          | ✅       | ❌      | ❌     | ✅        |
| View Own Progress          | ✅       | ✅      | ✅     | ✅        |
| View Family Analytics      | ✅       | ❌      | ✅     | ✅        |
| Send Notifications         | ✅ (family only) | ❌ | ✅ | ✅ |
| Unlock Achievements        | ❌       | ❌      | ✅     | ✅        |
| Manage Users               | ❌       | ❌      | ❌     | ✅        |
| View System Logs           | ❌       | ❌      | ❌     | ✅        |
| Configure Settings         | ❌       | ❌      | ❌     | ✅        |

## Role Assignment Flow

### New Family Registration

```
1. Guardian signs up
   ↓
2. Creates family profile
   ↓
3. Invites learners (by email)
   ↓
4. Learners receive invitation link
   ↓
5. Learners create account
   ↓
6. Auto-assigned to family with 'learner' role
```

### Role Changes

- **Guardian → Learner**: Not allowed (would lose task management)
- **Learner → Guardian**: Requires superuser approval
- **Any → Superuser**: Requires existing superuser approval
- **Revoke Access**: Superuser or family guardian can deactivate accounts

## Data Visibility Rules

### By Role

**Guardian sees**:
- All tasks they created
- All submissions from learners in their family
- Family-wide progress statistics
- Individual learner analytics

**Learner sees**:
- Only tasks assigned to them
- Only their own submissions
- Only their own progress and statistics
- Family leaderboard (if enabled)

**System sees**:
- All data necessary for automation
- No direct UI access

**Superuser sees**:
- All data across all families
- System logs and metrics
- Infrastructure status

## API Authorization

### Keycloak JWT Token Claims

```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "name": "Jane Doe",
  "realm_access": {
    "roles": ["guardian"]
  },
  "family_id": "family-uuid",
  "permissions": [
    "task:create",
    "task:assign",
    "submission:review"
  ]
}
```

### Backend Guards (NestJS)

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('guardian')
@Post('tasks')
async createTask(@Request() req, @Body() taskDto: CreateTaskDto) {
  // Only guardians can create tasks
}

@UseGuards(JwtAuthGuard, FamilyGuard)
@Get('tasks/:id')
async getTask(@Param('id') id: string, @Request() req) {
  // Can only view tasks within your family
}
```

## Role-Based UI Rendering

### Frontend (Next.js)

```typescript
// components/Dashboard.tsx
export function Dashboard({ user }) {
  if (user.role === 'guardian') {
    return <GuardianDashboard />;
  }
  
  if (user.role === 'learner') {
    return <LearnerDashboard />;
  }
  
  if (user.role === 'superuser') {
    return <SuperuserDashboard />;
  }
}
```

### Conditional Features

```typescript
{hasPermission('task:assign') && (
  <AssignTaskButton taskId={task.id} />
)}

{hasPermission('submission:review') && (
  <ReviewSubmissionPanel submission={submission} />
)}
```

## Multi-Family Support

### Guardian in Multiple Families

A guardian can belong to multiple families:
- Primary family (their own children)
- Extended family (nieces/nephews)
- Tutoring groups

**Scoping**:
- Must explicitly select active family context
- Can only view/manage current family's data
- Separate task lists per family

### Learner in Multiple Families

A learner can be in multiple families:
- Main household
- Tutoring group
- Extended family learning

**Task Aggregation**:
- All tasks from all families shown in unified list
- Tasks tagged with family identifier
- Can filter by family

## Security Considerations

### Row-Level Security (PostgreSQL)

```sql
-- Example policy: Guardians can only see their family's tasks
CREATE POLICY guardian_family_tasks ON tasks
  FOR SELECT
  TO guardian_role
  USING (
    family_id IN (
      SELECT family_id FROM user_families WHERE user_id = current_user_id()
    )
  );
```

### API Rate Limiting

- **Guardian**: 100 requests/minute
- **Learner**: 50 requests/minute
- **System**: Unlimited
- **Superuser**: Unlimited

### Audit Logging

All sensitive operations logged:
- Task assignment
- Grade changes
- Role modifications
- Account deletions
- Data exports

---

**Version**: 1.0  
**Last Updated**: December 2025
