# 🎓 Questify Project - Quick Start Guide

## Prerequisites

- Docker & Docker Compose
- Node.js 20+
- pnpm (recommended) or npm

## 🚀 Getting Started

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd questify

# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 2. Start Infrastructure Services

```bash
# Start all infrastructure services (Kafka, PostgreSQL, Redis, ClickHouse, Keycloak)
docker-compose up -d

# Check services are running
docker-compose ps

# View logs
docker-compose logs -f
```

**Services will be available at:**
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`
- ClickHouse: `localhost:8123`
- Kafka: `localhost:9092`
- Kafka UI: `http://localhost:8080`
- Keycloak: `http://localhost:8081`
- Grafana: `http://localhost:3003`
- Metabase: `http://localhost:3004`

### 3. Setup Backend

```bash
cd backend

# Install dependencies
pnpm install

# Run database migrations (optional - auto-sync in dev mode)
pnpm run migration:run

# Start development server
pnpm run dev
```

Backend will run on: `http://localhost:3001`
API Docs: `http://localhost:3001/api/docs`

### 4. Setup Frontend

```bash
cd frontend

# Install dependencies
pnpm install

# Start development server
pnpm run dev
```

Frontend will run on: `http://localhost:3000`

## 📝 Default Credentials

### Keycloak Admin
- URL: `http://localhost:8081`
- Username: `admin`
- Password: `admin`

### Demo Users
After Keycloak imports the realm:

**Guardian**
- Email: `guardian@demo.com`
- Password: `guardian123`

**Learner**
- Email: `learner@demo.com`
- Password: `learner123`

### Grafana
- URL: `http://localhost:3003`
- Username: `admin`
- Password: `admin`

## 🧪 Testing the Setup

### 1. Check Backend Health

```bash
curl http://localhost:3001/api/health
```

### 2. Check Kafka Topics

Visit Kafka UI at `http://localhost:8080` and verify these topics exist:
- `task-events`
- `submission-events`
- `user-events`
- `notification-events`
- `analytics-events`

### 3. Test Database Connection

```bash
# PostgreSQL
docker exec -it questify-postgres psql -U questify_user -d questify

# List tables
\dt

# Exit
\q
```

### 4. Test Redis

```bash
docker exec -it questify-redis redis-cli

# Test command
PING
# Should return: PONG

# Exit
exit
```

## 📁 Project Structure

```
questify/
├── backend/               # NestJS backend
│   ├── src/
│   │   ├── modules/      # Feature modules
│   │   ├── config/       # Configuration
│   │   ├── common/       # Shared utilities
│   │   └── main.ts       # Entry point
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/             # Next.js frontend
│   ├── src/
│   │   ├── app/         # App Router pages
│   │   ├── components/  # React components
│   │   ├── hooks/       # Custom hooks
│   │   ├── lib/         # Utilities
│   │   └── types/       # TypeScript types
│   ├── package.json
│   └── tsconfig.json
│
├── infra/               # Infrastructure configs
│   ├── postgres/        # PostgreSQL init scripts
│   ├── clickhouse/      # ClickHouse schemas
│   ├── keycloak/        # Keycloak realm export
│   ├── kafka/           # Kafka configurations
│   └── monitoring/      # Prometheus & Grafana
│
├── docs/                # Documentation
│   ├── architecture.md
│   ├── api-contracts.md
│   ├── events.md
│   └── roles.md
│
└── docker-compose.yml   # Docker services
```

## 🔧 Development Workflow

### Backend Development

```bash
cd backend

# Watch mode (auto-reload)
pnpm run dev

# Run tests
pnpm run test

# Lint code
pnpm run lint

# Format code
pnpm run format

# Generate migration
pnpm run migration:generate -- -n MigrationName

# Run migration
pnpm run migration:run
```

### Frontend Development

```bash
cd frontend

# Development server
pnpm run dev

# Build for production
pnpm run build

# Start production server
pnpm run start

# Type check
pnpm run type-check

# Format code
pnpm run format
```

## 🐛 Troubleshooting

### Port Already in Use

If you get port conflicts, stop conflicting services or change ports in `docker-compose.yml`

```bash
# Check what's using a port
lsof -i :5432
```

### Docker Services Not Starting

```bash
# Stop all services
docker-compose down

# Remove volumes (⚠️ deletes data)
docker-compose down -v

# Rebuild and start
docker-compose up -d --build
```

### Backend Can't Connect to Services

Ensure all Docker services are healthy:

```bash
docker-compose ps
```

All services should show "Up (healthy)".

### Kafka Connection Issues

```bash
# Check Kafka logs
docker-compose logs kafka

# Restart Kafka
docker-compose restart kafka
```

### Database Migration Issues

```bash
cd backend

# Revert last migration
pnpm run migration:revert

# Drop database and recreate (⚠️ deletes data)
docker-compose down
docker volume rm questify_postgres_data
docker-compose up -d postgres
```

## 📚 Next Steps

1. **Read the Documentation**
   - [Architecture Overview](docs/architecture.md)
   - [API Contracts](docs/api-contracts.md)
   - [Event Schemas](docs/events.md)
   - [Roles & Permissions](docs/roles.md)

2. **Explore the Code**
   - Backend: Start with `backend/src/modules/tasks/`
   - Frontend: Start with `frontend/src/app/page.tsx`

3. **Run the Example**
   - Log in as Guardian
   - Create a task
   - Log in as Learner (different browser/incognito)
   - Submit the task
   - Check Kafka UI for events
   - View analytics in Metabase

4. **Customize**
   - Add new event types
   - Create custom dashboards
   - Extend the API
   - Build new features

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Write tests
4. Submit a pull request

## 📄 License

MIT

---

**Need Help?** Check the [docs/](docs/) directory or open an issue.
