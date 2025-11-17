# Crypto Portfolio Tracker - Backend

Backend API for tracking cryptocurrency portfolio from OKX exchange.

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Database

Make sure PostgreSQL is running and create a database:

```sql
CREATE DATABASE crypto_portfolio;
```

### 3. Environment Variables

Copy the `.env.example` from the root directory and update with your credentials:

```bash
# In root directory
cp .env.example .env
```

Edit `.env` and add:
- OKX API credentials
- PostgreSQL database credentials

### 4. Run Migrations

```bash
npm run migrate up
```

To rollback:
```bash
npm run migrate down
```

### 5. Start Server

Development mode (with hot reload):
```bash
npm run dev
```

Production mode:
```bash
npm run build
npm start
```

## API Endpoints

### Portfolio

#### `POST /api/portfolio/sync`
Sync fills from OKX and recalculate portfolio.

**Response:**
```json
{
  "success": true,
  "syncResult": {
    "newFills": 150,
    "totalFills": 150
  },
  "portfolio": {
    "holdings": [...],
    "totalValue": 10000,
    "totalCost": 8000,
    "totalPnl": 2000,
    "totalPnlPercentage": 25,
    "lastUpdated": "2025-11-17T12:00:00.000Z"
  }
}
```

#### `GET /api/portfolio/current`
Get current portfolio with live prices.

**Response:**
```json
{
  "success": true,
  "portfolio": {
    "holdings": [
      {
        "symbol": "BTC",
        "amount": 0.5,
        "avgCost": 50000,
        "totalCost": 25000,
        "currentPrice": 60000,
        "currentValue": 30000,
        "pnl": 5000,
        "pnlPercentage": 20,
        "weight": 75
      }
    ],
    "totalValue": 40000,
    "totalCost": 30000,
    "totalPnl": 10000,
    "totalPnlPercentage": 33.33,
    "lastUpdated": "2025-11-17T12:00:00.000Z"
  }
}
```

#### `GET /api/portfolio/history?limit=30`
Get historical portfolio snapshots.

**Query Parameters:**
- `limit` (optional): Number of snapshots to return (default: 30)

**Response:**
```json
{
  "success": true,
  "snapshots": [
    {
      "id": 1,
      "timestamp": "2025-11-17T00:00:00.000Z",
      "total_value": 40000,
      "total_pnl": 10000,
      "total_pnl_percentage": 33.33,
      "data": {...}
    }
  ]
}
```

#### `POST /api/portfolio/snapshot`
Create a portfolio snapshot manually.

**Response:**
```json
{
  "success": true,
  "message": "Snapshot created successfully"
}
```

### Holdings

#### `GET /api/holdings`
Get all holdings.

**Response:**
```json
{
  "success": true,
  "holdings": [
    {
      "id": 1,
      "symbol": "BTC",
      "total_amount": 0.5,
      "avg_cost": 50000,
      "total_cost": 25000,
      "updated_at": "2025-11-17T12:00:00.000Z"
    }
  ]
}
```

#### `GET /api/holdings/:symbol`
Get holding details and trade history for a specific symbol.

**Response:**
```json
{
  "success": true,
  "holding": {
    "id": 1,
    "symbol": "BTC",
    "total_amount": 0.5,
    "avg_cost": 50000,
    "total_cost": 25000,
    "updated_at": "2025-11-17T12:00:00.000Z"
  },
  "fills": [...]
}
```

## Database Schema

### fills
Stores all trade fills from OKX.

### holdings
Calculated current positions per cryptocurrency.

### portfolio_snapshots
Daily snapshots of portfolio for historical tracking.

### price_cache
Cached market prices from OKX.

## Services

### FillSyncService
- Syncs fills from OKX API to database
- Handles pagination and rate limiting
- Deduplicates fills

### PortfolioCalculatorService
- Calculates holdings from fills
- Fetches current prices from OKX
- Calculates P&L and portfolio weights
- Creates snapshots

## Technology Stack

- Node.js + TypeScript
- Express.js
- PostgreSQL with node-postgres
- OKX API v5
