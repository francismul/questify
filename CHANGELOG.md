# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and this project adheres to [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

### Added
- N/A

### Changed
- N/A

### Deprecated
- N/A

### Removed
- N/A

### Fixed
- N/A

### Security
- N/A

---

## [0.1.1] - 2025-12-15

### Added

#### Frontend Scaffolding
- **Guardian Portal**: Created dashboard, task management, submission review, analytics, and family settings pages
- **Learner Portal**: Created dashboard, task list, submission interface, and profile pages
- **Superuser Portal**: Created dashboard, user management, and system logs pages
- **Authentication**: Added Sign In and Callback page placeholders
- **Route Structure**: Implemented Next.js App Router folders for split-role routing

### Changed
- Refined project task list to reflect frontend implementation progress

---

## [0.1.0] – 2025-12-15

### Added

#### Documentation
- Comprehensive README.md with project overview and quick start guide
- Architecture documentation with system diagrams and design patterns
- Complete API contracts with all REST endpoints documented
- Event schemas and Kafka flow documentation
- Roles and permissions matrix with detailed access control
- SETUP.md guide with troubleshooting and development workflow
- LICENSE file (MIT)

#### Backend (NestJS)
- Core application structure with modular architecture
- Database configuration with TypeORM and PostgreSQL
- Redis configuration for caching and sessions
- Winston logging service with file and console transports
- Health check endpoints

**Modules:**
- Auth module with JWT and Keycloak integration
- Users module with CRUD operations
- Tasks module with full lifecycle management
- Submissions module with review workflow
- Families module for household management
- Events module with Kafka producer and consumer
- Notifications module with email service
- Analytics module for metrics and reporting
- Upload module for file handling
- WebSocket module for real-time updates

**Database Entities:**
- User entity with role-based access (Guardian, Learner, Superuser, System)
- Family entity for household grouping
- Task entity with difficulty levels, deadlines, and proof types
- Submission entity with versioning and review states
- Complete entity relationships and indexes

**Security & Authorization:**
- JWT authentication guards
- Role-based authorization guards
- Roles decorator for route protection
- Family-scoped data access control

**Event System:**
- Kafka event service with base event schema
- Event consumer with topic subscription
- Event versioning and correlation IDs
- Automatic event metadata injection

**API Features:**
- Swagger/OpenAPI documentation
- Global validation pipes
- CORS configuration
- Helmet security headers
- Compression middleware
- Request/response interceptors

#### Frontend (Next.js 14)
- App Router setup with TypeScript
- Landing page with feature showcase and role cards
- Global layout with providers
- Tailwind CSS configuration with custom theme
- PostCSS and Autoprefixer setup

**State Management:**
- React Query (TanStack Query) setup
- Session provider (NextAuth)
- Global query client configuration

**API Integration:**
- Axios-based API client with interceptors
- Automatic token injection
- Error handling and 401 redirect
- Base URL configuration

**Custom Hooks:**
- useTasks - fetch all tasks with filters
- useTask - fetch single task by ID
- useCreateTask - create new task mutation
- useUpdateTask - update task mutation
- useDeleteTask - delete task mutation
- Automatic cache invalidation on mutations
- Toast notifications for user feedback

**TypeScript Types:**
- User, Task, Submission, Analytics interfaces
- Complete type safety across frontend
- Shared types matching backend entities

#### Infrastructure (Docker Compose)

**Database Services:**
- PostgreSQL 16 with initialization scripts
- Redis 7 for caching and sessions
- ClickHouse for analytics and time-series data

**Event Streaming:**
- Apache Kafka with Zookeeper
- Kafka UI for topic monitoring and management
- Pre-configured topics for all event types

**Authentication:**
- Keycloak 23 with dev mode
- Pre-configured realm export (questify-realm)
- Demo users (Guardian and Learner)
- Client configurations for frontend and backend
- Role mappings and permissions

**Monitoring & Analytics:**
- Prometheus for metrics collection
- Grafana for visualization and dashboards
- Metabase for business analytics
- Health checks on all critical services

**Database Schemas:**

*PostgreSQL:*
- Complete schema with all tables (users, families, tasks, submissions, achievements, streaks, notifications)
- Foreign key relationships
- Indexes for performance optimization
- Triggers for updated_at timestamps
- UUID primary keys
- Demo/seed data for development

*ClickHouse:*
- Events table for raw event storage
- task_completions_daily aggregation table
- time_logs table for time tracking
- streak_history table
- submission_analytics table
- user_engagement_daily metrics
- Materialized views for real-time aggregations
- Partitioning by month for performance

#### Development Tools
- Automated setup script (setup.sh) with dependency checks
- Environment template files (.env.example)
- Comprehensive .gitignore configurations
- ESLint and Prettier configurations
- TypeScript strict mode enabled
- Hot reload for both frontend and backend

#### CI/CD Ready
- Docker Compose with health checks
- Volume persistence for data
- Network isolation
- Service dependencies properly configured
- Port mappings for local development

### Changed
- N/A

### Deprecated
- N/A

### Removed
- N/A

### Fixed
- N/A

### Security
- Helmet middleware for security headers
- CORS properly configured
- JWT token validation
- Role-based access control enforced
- SQL injection prevention via TypeORM
- Input validation with class-validator

