#!/bin/bash

# Questify - Development Environment Setup Script

set -e

echo "🎓 Questify Development Environment Setup"
echo "=========================================="
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."

command -v docker >/dev/null 2>&1 || { echo "❌ Docker is required but not installed. Aborting." >&2; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo "❌ Docker Compose is required but not installed. Aborting." >&2; exit 1; }
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed. Aborting." >&2; exit 1; }

echo "✅ All prerequisites met!"
echo ""

# Copy environment files if they don't exist
echo "📝 Setting up environment files..."

if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env"
else
    echo "⏭️  backend/.env already exists"
fi

if [ ! -f frontend/.env ]; then
    cp frontend/.env.example frontend/.env
    echo "✅ Created frontend/.env"
else
    echo "⏭️  frontend/.env already exists"
fi

echo ""

# Start Docker services
echo "🐳 Starting Docker services..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be healthy (this may take a minute)..."
sleep 10

# Check service health
echo "🏥 Checking service health..."
docker-compose ps

echo ""
echo "📦 Installing backend dependencies..."
cd backend
npm install || pnpm install || yarn install
cd ..

echo ""
echo "📦 Installing frontend dependencies..."
cd frontend
npm install || pnpm install || yarn install
cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 Quick Start Commands:"
echo ""
echo "  Start Backend:"
echo "  $ cd backend && npm run dev"
echo ""
echo "  Start Frontend:"
echo "  $ cd frontend && npm run dev"
echo ""
echo "📍 Service URLs:"
echo "  - Frontend:        http://localhost:3000"
echo "  - Backend API:     http://localhost:3001"
echo "  - API Docs:        http://localhost:3001/api/docs"
echo "  - Keycloak:        http://localhost:8081 (admin/admin)"
echo "  - Kafka UI:        http://localhost:8080"
echo "  - Grafana:         http://localhost:3003 (admin/admin)"
echo "  - Metabase:        http://localhost:3004"
echo ""
echo "📚 Documentation:"
echo "  - Setup Guide:     SETUP.md"
echo "  - Architecture:    docs/architecture.md"
echo "  - API Contracts:   docs/api-contracts.md"
echo ""
echo "🎉 Happy coding!"
