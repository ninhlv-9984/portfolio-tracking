# Crypto Portfolio Tracker - Setup Guide

Complete setup guide for the crypto portfolio tracking application.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 14+ installed and running
- OKX account with API credentials

## Step 1: Get OKX API Credentials

1. Go to https://www.okx.com/account/my-api
2. Create a new API key
3. Set read permissions (for reading trade history and prices)
4. Save your:
   - API Key
   - Secret Key
   - Passphrase

## Step 2: Set Up PostgreSQL

1. Make sure PostgreSQL is running

2. Create the database:
```bash
psql -U postgres
CREATE DATABASE crypto_portfolio;
\q
```

Or if using a cloud provider, create a database named `crypto_portfolio`.

## Step 3: Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` and fill in your credentials:
```env
# OKX API Credentials
OKX_API_KEY=your_actual_api_key
OKX_SECRET_KEY=your_actual_secret_key
OKX_PASSPHRASE=your_actual_passphrase

# PostgreSQL Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=crypto_portfolio
DB_USER=postgres
DB_PASSWORD=your_postgres_password

# Server
PORT=3000
```

## Step 4: Set Up Backend

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies (already done):
```bash
npm install
```

3. Run database migrations:
```bash
npm run migrate up
```

You should see:
```
✅ Migration 001_init completed successfully
```

4. Start the backend server:
```bash
npm run dev
```

You should see:
```
✅ Connected to PostgreSQL database
🚀 Server running on http://localhost:3000
📊 API available at http://localhost:3000/api
```

## Step 5: Initial Data Sync

1. In a new terminal, sync your fills from OKX:
```bash
curl -X POST http://localhost:3000/api/portfolio/sync
```

This will:
- Fetch all your trade fills from OKX (last 3 months)
- Store them in PostgreSQL
- Calculate your current holdings
- Fetch current prices
- Calculate P&L

2. Check your portfolio:
```bash
curl http://localhost:3000/api/portfolio/current
```

## Step 6: Set Up Frontend (Next Steps)

The frontend will be created with React + Vite in the `/frontend` directory.

## Useful Commands

### Backend

```bash
# Start development server
cd backend && npm run dev

# Run migrations
cd backend && npm run migrate up

# Build for production
cd backend && npm run build

# Start production server
cd backend && npm start
```

### API Testing

```bash
# Sync portfolio
curl -X POST http://localhost:3000/api/portfolio/sync

# Get current portfolio
curl http://localhost:3000/api/portfolio/current

# Get all holdings
curl http://localhost:3000/api/holdings

# Get specific holding
curl http://localhost:3000/api/holdings/BTC

# Get portfolio history
curl http://localhost:3000/api/portfolio/history?limit=30

# Create snapshot
curl -X POST http://localhost:3000/api/portfolio/snapshot
```

## Troubleshooting

### PostgreSQL connection error

- Make sure PostgreSQL is running: `pg_isready`
- Check your database credentials in `.env`
- Ensure the database `crypto_portfolio` exists

### OKX API errors

- Verify your API credentials are correct
- Ensure your API key has read permissions
- Check if your API key is not expired

### No fills found

- Make sure you have trade history in the last 3 months
- Check that your API key has permission to view trade history
- Try syncing again

## What's Next?

1. Frontend dashboard (in progress)
2. Charts for portfolio history
3. Rebalancing recommendations
4. Auto-sync scheduler
5. Export features

Current progress: **Backend Complete** ✅
