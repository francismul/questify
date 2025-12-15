# 🎓 Questify - Home Edition E-Learning Platform

> **A home edition university-style e-learning system with event-driven architecture, multi-role support, and comprehensive progress tracking.**

## 🚀 Overview

Questify is an e-learning platform designed for families, enabling guardians to assign learning tasks, learners to complete them, and the system to maintain accountability through automated nudges and progress tracking.

## 👥 User Roles

- **Guardian** – Assigns tasks, reviews submissions, monitors progress, and provides guidance
- **Learner** – Receives tasks, submits work, tracks personal progress
- **System** – Automated accountability through reminders, deadline notifications, and progress nudges
- **Superuser** – Manages system monitoring, logs, accounts, and platform health

## 🏗️ Architecture

### Tech Stack

- **Frontend**: Next.js 14 (React, TypeScript)
- **Backend**: NestJS (Node.js, TypeScript)
- **Event Streaming**: Apache Kafka
- **Databases**:
  - PostgreSQL – Core relational data (users, tasks, submissions)
  - Redis – Sessions, real-time stats, streaks, caching
  - ClickHouse – Analytics and time-series data
- **Authentication**: Keycloak (OAuth2/OIDC)
- **Real-time**: WebSockets (Socket.io)
- **Notifications**: Email (SMTP), WebSockets
- **Analytics**: Metabase / Superset
- **Containerization**: Docker & Docker Compose

### Design Principles

- **Event-Driven**: All significant actions produce events (Kafka)
- **Polyglot Persistence**: Right database for the right job
- **Microservices-Ready**: Modular architecture for future scaling
- **Real-time First**: Instant feedback for learners and guardians

## 📂 Project Structure

```
questify/
├── backend/              # NestJS backend application
├── frontend/             # Next.js frontend application
├── infra/                # Infrastructure configurations
│   ├── kafka/            # Kafka brokers and topics
│   ├── postgres/         # PostgreSQL schemas and migrations
│   ├── clickhouse/       # ClickHouse schemas
│   ├── keycloak/         # Keycloak realm configurations
│   └── monitoring/       # Prometheus, Grafana configs
├── docs/                 # Documentation
└── docker-compose.yml    # Local development environment
```

## 🎯 Core Features

### Task & Learning Engine
- **Objectives**: Skill-based learning goals
- **Difficulty Levels**: Adaptive complexity
- **Deadlines**: Time-bound commitments
- **Expected Effort**: Time estimates for planning
- **Proof of Completion**: Multiple submission types (answers, files, quizzes, photos, explanations)

### Progress & Accountability
- **Task Completion Rate**: Success metrics
- **Time Tracking**: Expected vs actual time
- **Consistency Streaks**: Daily/weekly engagement
- **Late Submissions**: Accountability tracking
- **Retry Counts**: Learning persistence metrics

### Event-Driven Data Flow

All significant actions emit events to Kafka:
- `task.assigned`
- `task.submitted`
- `task.reviewed`
- `deadline.approaching`
- `streak.broken`
- `achievement.unlocked`

Events are consumed by:
- Analytics service (→ ClickHouse)
- Notification service (→ Email/WebSocket)
- Real-time stats (→ Redis)

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 20+
- pnpm (recommended) or npm

### Start Infrastructure

```bash
# Start all services
docker-compose up -d

# Check service health
docker-compose ps
```

### Backend Setup

```bash
cd backend
pnpm install
pnpm run dev
```

Backend runs on `http://localhost:3001`

### Frontend Setup

```bash
cd frontend
pnpm install
pnpm run dev
```

Frontend runs on `http://localhost:3000`

## 🔧 Development

### Environment Variables

Create `.env` files in both `backend/` and `frontend/` directories. See `.env.example` files for required variables.

### Database Migrations

```bash
cd backend
pnpm run migration:run
```

### Kafka Topics

Topics are auto-created on startup, or manually:

```bash
docker-compose exec kafka kafka-topics --create \
  --topic task-events \
  --bootstrap-server localhost:9092
```

## 📊 Monitoring & Analytics

- **Grafana**: http://localhost:3003 (metrics & monitoring)
- **Keycloak**: http://localhost:8080 (identity management)
- **Metabase**: http://localhost:3004 (analytics dashboards)

## 🧪 Testing

```bash
# Backend tests
cd backend
pnpm run test
pnpm run test:e2e

# Frontend tests
cd frontend
pnpm run test
```

## 📖 Documentation

- [Architecture](./docs/architecture.md) - System design and patterns
- [API Contracts](./docs/api-contracts.md) - REST API documentation
- [Events](./docs/events.md) - Event schemas and flows
- [Roles](./docs/roles.md) - User roles and permissions

## 🛣️ Roadmap

- [ ] Core task management system
- [ ] Guardian and Learner dashboards
- [ ] Event streaming and analytics
- [ ] Automated notifications and nudges
- [ ] Mobile app (React Native)
- [ ] Gamification (badges, leaderboards)
- [ ] AI-powered task recommendations

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md)

---

**Built with ❤️ for families who value learning and accountability**
