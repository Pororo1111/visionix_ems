# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🌏 Language and Communication Guidelines

**Always respond in Korean 🇰🇷**
- Use Korean for all technical explanations, code reviews, and problem-solving discussions
- Include English technical terms in parentheses when necessary (e.g., 데이터베이스(Database))
- Use friendly and easily understandable Korean expressions

**Use emojis appropriately 😊**
- Include relevant emojis in responses for friendly and intuitive communication
- Use emojis for visual distinction of technical content (🔧 development, 🐛 bugs, ✅ completed, ⚠️ warnings, etc.)
- Avoid excessive use, but utilize at a level that enhances readability

## Project Overview

Visionix EMS is a Next.js 15 web application for IoT device management and monitoring. It provides real-time dashboard functionality with Prometheus metrics integration, device registration/management, and OCR monitoring capabilities.

**Tech Stack:**
- **Frontend:** Next.js 15 (App Router), React 19, TypeScript
- **UI:** Tailwind CSS v4, shadcn/ui components
- **Database:** PostgreSQL with TimescaleDB, Drizzle ORM
- **Monitoring:** Prometheus API integration
- **Package Manager:** pnpm

## Development Commands

```bash
# Development
pnpm dev          # Start development server with Turbopack
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # Run ESLint

# Database Operations
pnpm sync         # Push schema changes to database (development)
pnpm generate     # Generate migration files
pnpm migrate      # Run migrations (production)

# Docker Development
docker-compose up -d                                    # Start local services (PostgreSQL, Prometheus)
docker-compose -f docker-compose.prod.yml up -d       # Production deployment

# Production Scripts (Docker-based)
./start-production.sh    # Start production environment (recommended)
./stop-production.sh     # Stop production environment
```

## Architecture Overview

### Domain-Driven Structure
```
domain/
  device/
    dto/         # Data transfer objects
    model/       # Database schema (Drizzle)
    repository/  # Data access layer
    service/     # Business logic
```

### Key Components

**Database Layer:**
- Drizzle ORM with PostgreSQL/TimescaleDB
- Schema: `domain/device/model/device.ts`
- Connection: `lib/db.ts`

**Prometheus Integration:**
- API client: `lib/prometheus-api.ts`
- Real-time dashboard with 5-second auto-refresh
- Metrics: device status, CPU/memory usage, OCR monitoring

**Dashboard System:**
- Server component: `app/page.tsx` (initial data fetch)
- Client component: `components/dashboard/dashboard-client.tsx` (real-time updates)
- Panel types: statistics, system resources, trend charts, device tables

**UI Components:**
- shadcn/ui library in `components/ui/`
- Custom dashboard panels in `components/dashboard/`
- Responsive design with mobile/desktop sidebar

## Environment Configuration

**Required Environment Variables:**
```
DATABASE_URL=postgres://user:pass@host:port/dbname
PROMETHEUS_URL=http://prometheus:9090
NODE_ENV=production  # for production
```

## Key Development Notes

**Database Schema Management:**
- Schema files in `domain/**/model/*.ts`
- Use `pnpm sync` for development schema changes
- Use `pnpm migrate` for production deployments

**Prometheus Queries:**
- Instant queries for current values (counters, gauges)
- Range queries for trend data (time series)
- Auto-detection logic in `PrometheusAPI.getMultiplePanelData()`

**Real-time Updates:**
- Dashboard refreshes every 5 seconds via `/api/dashboard/all-panels`
- Batch API calls for performance
- Error handling with fallback data

**Styling:**
- Tailwind CSS v4 with CSS variables
- Korean language support (`lang="ko"`)
- Dark/light theme ready

**Path Aliases:**
```
@/* -> ./*
@/components -> ./components
@/lib -> ./lib
@/hooks -> ./hooks
```

## Production Deployment

The application is designed for Docker deployment with:
- Multi-service setup (app, database, prometheus)
- Nginx reverse proxy (production)
- Health checks and monitoring
- Automated start/stop scripts

Always use `./start-production.sh` for production deployments as it handles environment setup, builds, and service orchestration.