# Role-Based Dashboard Implementation Guide

## 🎯 Overview

This guide documents the complete implementation of a role-based dashboard system for Questify, featuring:

- **Deep Navy (#1a2332)** sidebar and headers
- **Vibrant Yellow (#FDD835)** accents and CTAs
- **Tailwind CSS v4** with CSS-based configuration
- **Separate dashboards** for students and teachers
- **Authentication-gated access** - login required

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── globals.css              # Tailwind v4 @theme configuration
│   │   ├── page.tsx                 # Landing page (auth-gated)
│   │   └── dashboard/
│   │       └── page.tsx             # Role-based dashboard router
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx          # Updated with accent variant
│   │   │   ├── dropdown-menu.tsx    # Radix UI dropdown
│   │   │   └── table.tsx            # Table components
│   │   └── dashboard/
│   │       ├── TopNavigation.tsx    # Header with user profile
│   │       ├── MetricCard.tsx       # Circular gauge cards
│   │       ├── StudentDashboard.tsx # Student-specific view
│   │       └── TeacherDashboard.tsx # Teacher-specific view
```

---

## 🎨 Design System

### Color Palette

```css
/* Primary Colors */
--color-primary: #1a2332           /* Deep navy - sidebar/headers */
--color-primary-foreground: #f1f5f9

/* Accent Colors */
--color-accent: #fdd835             /* Vibrant yellow - CTAs */
--color-accent-foreground: #1a2332

/* Metric Colors (for gauges) */
--color-metric-red: #ef4444
--color-metric-green: #10b981
--color-metric-blue: #3b82f6
--color-metric-purple: #a855f7
--color-metric-yellow: #fbbf24
--color-metric-cyan: #06b6d4

/* Background */
--color-background: #f5f5f5         /* Light gray main area */
--color-card: #ffffff               /* Clean white cards */
```

### Tailwind CSS v4 Migration

**Key Changes:**
1. **No more `tailwind.config.ts`** - Configuration now in `globals.css`
2. **`@theme` directive** - Define custom colors/tokens in CSS
3. **CSS variables** - All design tokens as CSS custom properties

**globals.css Structure:**
```css
@import "tailwindcss";

@theme {
  --color-primary: #1a2332;
  --color-accent: #fdd835;
  /* ... all other tokens */
}

@media (prefers-color-scheme: dark) {
  @theme {
    /* Dark mode overrides */
  }
}
```

---

## 🧩 Component Architecture

### 1. TopNavigation Component

**File:** `src/components/dashboard/TopNavigation.tsx`

**Features:**
- Navy background (`bg-primary`)
- Questify logo (yellow accent circle)
- Language selector dropdown
- Notification bell with indicator
- User profile with avatar/initials
- "Upgrade Pro" CTA button (yellow)
- Responsive mobile menu toggle

**Props:**
```typescript
interface TopNavigationProps {
  onMenuToggle?: () => void
}
```

**Usage:**
```tsx
<TopNavigation onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
```

---

### 2. MetricCard Component

**File:** `src/components/dashboard/MetricCard.tsx`

**Features:**
- SVG circular progress gauge
- 6 color variants (red, green, blue, purple, yellow, cyan)
- Animated gauge fill
- Title, value, subtitle, percentage display
- Hover effects

**Props:**
```typescript
interface MetricCardProps {
  title: string
  value: string | number
  subtitle: string
  color: "red" | "green" | "blue" | "purple" | "yellow" | "cyan"
  percentage: number
  className?: string
}
```

**Example:**
```tsx
<MetricCard
  title="Active Courses"
  value={5}
  subtitle="Currently teaching"
  color="green"
  percentage={100}
/>
```

---

### 3. StudentDashboard Component

**File:** `src/components/dashboard/StudentDashboard.tsx`

**Metrics Shown:**
1. **Courses Enrolled** - Blue gauge (80%)
2. **Completed** - Green gauge (62%)
3. **In Progress** - Yellow gauge (38%)
4. **Average Score** - Purple gauge (87%)
5. **Study Hours** - Cyan gauge (70%)
6. **Achievements** - Red gauge (60%)

**Content Sections:**
- **Recent Courses** - Table with progress bars
- **Upcoming Assignments** - Prioritized task list (high/medium/low)
- **Recent Achievements** - Badge gallery with emoji icons

**Features:**
- Course progress tracking
- Assignment deadlines
- Priority indicators (color-coded)
- Badge collection display

---

### 4. TeacherDashboard Component

**File:** `src/components/dashboard/TeacherDashboard.tsx`

**Metrics Shown:**
1. **Total Students** - Blue gauge (78%)
2. **Active Courses** - Green gauge (100%)
3. **Avg. Completion** - Purple gauge (82%)
4. **Avg. Rating** - Yellow gauge (96%)
5. **Pending Reviews** - Red gauge (45%)
6. **Response Rate** - Cyan gauge (95%)

**Content Sections:**
- **Course Statistics** - Table with completion rates
- **Recent Submissions** - "Grade Now" quick actions
- **Student Highlights** - Most active, top performer, needs support

**Features:**
- Quick grading access
- Course performance overview
- Student activity monitoring
- "Create New Course" button
- "Send Announcement" action

---

## 🔐 Authentication Flow

### Landing Page (Unauthenticated)

**File:** `src/app/page.tsx`

**Behavior:**
1. Checks authentication status
2. If authenticated → redirect to `/dashboard`
3. If not → show landing page

**Landing Page Features:**
- Hero section with gradient background
- "Transform Your Learning Journey" headline
- 4 feature cards (Rich Content, Track Progress, Earn Achievements, Learn Together)
- Stats section (10,000+ Students, 500+ Teachers, 1,000+ Courses)
- CTA section with "Create Your Account" button

---

### Dashboard Page (Authenticated)

**File:** `src/app/dashboard/page.tsx`

**Authentication Logic:**
```typescript
const { user, isAuthenticated, isLoading } = useAuth()

useEffect(() => {
  if (!isLoading && !isAuthenticated) {
    router.push('/auth/login') // Redirect to login
  }
}, [isAuthenticated, isLoading, router])
```

**Role-Based Rendering:**
```typescript
const isTeacher = user.role === 'teacher'

return (
  <div>
    <TopNavigation />
    {isTeacher ? <TeacherDashboard /> : <StudentDashboard />}
  </div>
)
```

---

## 🚀 Getting Started

### 1. Install Dependencies

```bash
cd frontend
pnpm install
```

**New Dependencies Added:**
- `@radix-ui/react-dropdown-menu` - Dropdown component

### 2. Start Development Server

```bash
pnpm dev
```

### 3. Test Authentication Flow

**Student User:**
```bash
# Login as student
# Should see: StudentDashboard with 6 metrics
# - Courses Enrolled, Completed, In Progress, etc.
```

**Teacher User:**
```bash
# Login as teacher  
# Should see: TeacherDashboard with 6 metrics
# - Total Students, Active Courses, Pending Reviews, etc.
```

---

## 📊 Dashboard Comparison

| Feature | Student Dashboard | Teacher Dashboard |
|---------|------------------|-------------------|
| **Primary Focus** | Learning progress | Teaching effectiveness |
| **Metric 1** | Courses Enrolled (8) | Total Students (156) |
| **Metric 2** | Completed (5) | Active Courses (5) |
| **Metric 3** | In Progress (3) | Avg. Completion (82%) |
| **Metric 4** | Average Score (87%) | Avg. Rating (4.8) |
| **Metric 5** | Study Hours (42) | Pending Reviews (23) |
| **Metric 6** | Achievements (12) | Response Rate (95%) |
| **Main Action** | Continue Learning | Grade Assignments |
| **Secondary Action** | View Assignments | Create New Course |
| **Special Feature** | Achievement Badges | Student Highlights |

---

## 🎯 Key Features

### 1. Circular Gauge Metrics

**Visual Design:**
- Smooth SVG animations
- Color-coded progress rings
- Large center value
- Percentage display below
- Hover scale effect

**Implementation:**
```typescript
// Circle calculations
const radius = 40
const circumference = 2 * Math.PI * radius
const strokeDashoffset = circumference - (percentage / 100) * circumference

<motion.circle
  r={radius}
  strokeDashoffset={strokeDashoffset}
  // Animated from full circumference to calculated offset
/>
```

### 2. Data Tables

**Features:**
- Hover row highlighting
- Progress bars (inline)
- Priority badges (color-coded)
- Action buttons
- Responsive design

**Student Table Example:**
```tsx
<Table>
  <TableHead>Course | Progress | Last Accessed</TableHead>
  <TableBody>
    {courses.map(course => (
      <TableRow>
        <TableCell>{course.name}</TableCell>
        <TableCell>
          <ProgressBar value={course.progress} />
        </TableCell>
        <TableCell>{course.lastAccessed}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### 3. Priority Indicators

**Color Mapping:**
```typescript
{assignment.priority === 'high' ? 'bg-metric-red/10 text-metric-red' : ''}
{assignment.priority === 'medium' ? 'bg-metric-yellow/10 text-metric-yellow' : ''}
{assignment.priority === 'low' ? 'bg-metric-green/10 text-metric-green' : ''}
```

---

## 🔧 Customization Guide

### Change Primary Color

```css
/* globals.css */
@theme {
  --color-primary: #1a2332;  /* Change to your color */
}
```

### Change Accent Color

```css
@theme {
  --color-accent: #fdd835;  /* Change to your color */
}
```

### Add Custom Metric Color

```css
@theme {
  --color-metric-orange: #f97316;
}
```

Then use in MetricCard:
```tsx
<MetricCard color="orange" ... />
```

### Customize Metrics

**Student Dashboard:**
```typescript
// src/components/dashboard/StudentDashboard.tsx
const studentMetrics = [
  { title: "Your Metric", value: 42, color: "blue", percentage: 75 },
  // Add more...
]
```

**Teacher Dashboard:**
```typescript
// src/components/dashboard/TeacherDashboard.tsx
const teacherMetrics = [
  { title: "Your Metric", value: 100, color: "green", percentage: 90 },
  // Add more...
]
```

---

## 🧪 Testing Checklist

### Authentication
- [ ] Unauthenticated user sees landing page
- [ ] Login redirects to `/dashboard`
- [ ] Dashboard requires authentication
- [ ] Logout returns to landing page

### Role-Based Views
- [ ] Student role shows StudentDashboard
- [ ] Teacher role shows TeacherDashboard
- [ ] Metrics display correctly
- [ ] Tables load data
- [ ] Actions are role-appropriate

### Responsive Design
- [ ] Mobile: Sidebar toggles
- [ ] Mobile: Stats stack vertically
- [ ] Tablet: 2-column layout
- [ ] Desktop: Full 6-column grid

### Visual Design
- [ ] Navy headers render correctly
- [ ] Yellow accent buttons visible
- [ ] Circular gauges animate
- [ ] Progress bars work
- [ ] Priority badges color-coded

---

## 🐛 Troubleshooting

### Issue: Tailwind classes not working

**Solution:** Ensure Tailwind v4 is properly configured:
```css
/* globals.css - Must have @import at top */
@import "tailwindcss";

@theme {
  /* Your theme config */
}
```

### Issue: Dropdown menu not showing

**Solution:** Install Radix UI:
```bash
pnpm add @radix-ui/react-dropdown-menu
```

### Issue: Colors not matching design

**Solution:** Check CSS variable values in `@theme`:
```css
--color-primary: #1a2332;  /* Deep navy */
--color-accent: #fdd835;    /* Vibrant yellow */
```

### Issue: Dashboard not redirecting

**Solution:** Check useAuth hook:
```typescript
const { isAuthenticated, isLoading } = useAuth()

// Wait for loading to finish
if (!isLoading && !isAuthenticated) {
  router.push('/auth/login')
}
```

---

## 📝 API Integration (Next Steps)

### Student Dashboard APIs

```typescript
// Fetch student metrics
GET /api/student/metrics
Response: {
  coursesEnrolled: 8,
  completed: 5,
  inProgress: 3,
  averageScore: 87,
  studyHours: 42,
  achievements: 12
}

// Fetch recent courses
GET /api/student/recent-courses
Response: [
  { id, name, progress, lastAccessed, instructor }
]

// Fetch upcoming assignments
GET /api/student/assignments
Response: [
  { id, title, course, dueDate, priority }
]
```

### Teacher Dashboard APIs

```typescript
// Fetch teacher metrics
GET /api/teacher/metrics
Response: {
  totalStudents: 156,
  activeCourses: 5,
  avgCompletion: 82,
  avgRating: 4.8,
  pendingReviews: 23,
  responseRate: 95
}

// Fetch course statistics
GET /api/teacher/course-stats
Response: [
  { id, name, students, completion, avgScore }
]

// Fetch recent submissions
GET /api/teacher/submissions
Response: [
  { id, student, assignment, course, submittedAt, status }
]
```

---

## 🎓 Learning Resources

### Tailwind CSS v4
- [Tailwind v4 Documentation](https://tailwindcss.com/docs)
- [@theme directive](https://tailwindcss.com/docs/theme)

### Radix UI
- [Dropdown Menu](https://www.radix-ui.com/primitives/docs/components/dropdown-menu)

### Next.js 15
- [App Router](https://nextjs.org/docs/app)
- [Client Components](https://nextjs.org/docs/app/building-your-application/rendering/client-components)

---

## ✅ Completion Checklist

- [x] Tailwind v4 configuration with @theme
- [x] Button component with accent variant
- [x] Dropdown menu component (Radix UI)
- [x] Table component
- [x] TopNavigation with user profile
- [x] MetricCard with circular gauges
- [x] StudentDashboard component
- [x] TeacherDashboard component
- [x] Authentication-gated routing
- [x] Role-based dashboard rendering
- [x] Landing page for unauthenticated users

---

## 🚀 Next Features to Implement

1. **Sidebar Navigation** - Add collapsible sidebar with menu items
2. **Settings Page** - User profile editing
3. **Real-time Notifications** - WebSocket integration
4. **Dark Mode Toggle** - Manual theme switcher
5. **Data Visualization** - Charts.js integration
6. **Export Functionality** - PDF/CSV downloads
7. **Search & Filters** - Table search/filter
8. **Pagination** - Large dataset handling

---

## 📞 Support

For questions or issues, refer to:
- `DASHBOARD_IMPLEMENTATION.md` - Original dashboard docs
- `TESTING_GUIDE.md` - Testing documentation
- `MODERN_AUTH_DESIGN.md` - Authentication design docs

---

**Last Updated:** October 8, 2025
**Version:** 1.0.0
**Author:** Questify Development Team
