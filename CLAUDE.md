# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Crypto portfolio tracker that syncs trade fills from OKX exchange, calculates holdings using weighted average cost method, and displays a real-time dashboard. Monorepo with separate backend and frontend packages plus standalone root-level utility scripts.

## Commands

### Development

```bash
# Start both backend and frontend together
bash dev.sh

# Backend only (from backend/)
cd backend && npm run dev          # tsx watch mode, port 3000

# Frontend only (from frontend/)
cd frontend && npm run dev         # Vite dev server, port 5173
```

### Database

```bash
cd backend && npm run migrate up   # Run migrations
cd backend && npm run migrate down # Rollback migrations
```

Requires PostgreSQL running locally. Config via root `.env` file (backend reads `../.env`).

### Build & Lint

```bash
cd backend && npm run build        # tsc
cd frontend && npm run build       # tsc -b && vite build
cd frontend && npm run lint        # eslint
```

### Root-level utility scripts

```bash
npm test              # node test-okx-api.js
npm run fetch-fills   # node fetch-all-fills.js
npm run btc-average   # node calculate-btc-average-cost.js
```

## Architecture

**Backend** (`backend/src/`): Express + TypeScript server. Entry point is `index.ts`. Two route modules (`routes/portfolio.ts`, `routes/holdings.ts`) map to `/api/portfolio/*` and `/api/holdings/*`. Three services:
- `okx-auth.ts` — OKX API v5 authentication (HMAC-SHA256 signing) and API wrappers (fills, tickers, balances across trading/funding/savings accounts)
- `fill-sync.service.ts` — Fetches fills from OKX across all instrument types and upserts into `fills` table (dedup by `bill_id`)
- `portfolio-calculator.service.ts` — Core business logic: aggregates fills into holdings (weighted avg cost), merges with live OKX account balances, fetches current prices, computes P&L. Stablecoins (USD/USDT/USDC) are merged into a single "USD" holding

**Frontend** (`frontend/src/`): React 19 + Vite + TypeScript. Uses TanStack React Query for data fetching and Tailwind CSS for styling. Components: `Dashboard.tsx` (main layout), `HoldingsTable.tsx` (sortable table), `PortfolioSummary.tsx` (totals + pie chart via Recharts). API client in `api/client.ts` hits backend at `localhost:3000`.

**Database**: PostgreSQL with 4 tables — `fills` (trade history), `holdings` (calculated positions), `portfolio_snapshots` (historical JSON snapshots), `price_cache`. Migrations in `backend/src/migrations/`.

**Environment**: All config in root `.env` — OKX API credentials, PostgreSQL connection, server port. See `.env.example`.
