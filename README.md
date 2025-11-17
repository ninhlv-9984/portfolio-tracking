# Crypto Portfolio Tracker

A full-stack web application to track your cryptocurrency portfolio from OKX exchange with real-time prices, P&L calculations, and historical tracking.

## Features

- 🔄 **Auto-sync** fills from OKX (all instrument types: SPOT, MARGIN, SWAP, FUTURES, OPTION)
- 💰 **Portfolio tracking** with real-time prices
- 📊 **P&L calculation** (weighted average cost method)
- 📈 **Visual analytics** with pie charts and tables
- 📅 **Historical snapshots** for performance tracking over time
- ⚖️ **Portfolio weights** for rebalancing insights
- 🔐 **Secure** API credential management

## Screenshots

The dashboard displays:
- Total portfolio value
- Total cost basis
- Profit & Loss ($ and %)
- Portfolio allocation pie chart
- Holdings table with sortable columns
- Individual coin details

## Tech Stack

### Backend
- Node.js + Express + TypeScript
- PostgreSQL database
- OKX API v5 integration
- Automated fill synchronization
- RESTful API

### Frontend
- React + TypeScript
- Vite (fast build tool)
- Tailwind CSS (styling)
- Recharts (data visualization)
- React Query (data fetching)
- Axios (HTTP client)

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- OKX API credentials (read-only permissions)

### Installation

1. **Clone and setup:**
```bash
cd crypto_track
cp .env.example .env
```

2. **Configure `.env`** with your credentials:
```env
# OKX API
OKX_API_KEY=your_key
OKX_SECRET_KEY=your_secret
OKX_PASSPHRASE=your_passphrase

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=crypto_portfolio
DB_USER=your_user
DB_PASSWORD=your_password
```

3. **Setup backend:**
```bash
cd backend
npm install
npm run migrate up
npm run dev
```

4. **Setup frontend (in new terminal):**
```bash
cd frontend
npm install
npm run dev
```

5. **Open your browser:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## Usage

### First Time Setup

1. Open the frontend dashboard at http://localhost:5173
2. Click **"Sync from OKX"** button to fetch all your trades
3. Portfolio will be calculated automatically
4. View your holdings, P&L, and allocation

### Features

#### Sync Portfolio
- Click **"Sync from OKX"** to fetch latest fills
- Automatically calculates holdings and P&L
- Updates current prices

#### Refresh Data
- Click **"Refresh"** to update prices without syncing fills
- Auto-refreshes every minute

#### View Holdings
- Sortable table by asset, value, P&L%, weight
- Click column headers to sort
- Shows avg cost vs current price

#### Portfolio Allocation
- Pie chart showing weight of each asset
- Legend with percentages and values
- Hover for details

## API Endpoints

### Portfolio

**POST /api/portfolio/sync**
- Sync fills from OKX and recalculate portfolio
- Returns: syncResult + portfolio data

**GET /api/portfolio/current**
- Get current portfolio with live prices
- Returns: portfolio data

**GET /api/portfolio/history?limit=30**
- Get historical snapshots
- Returns: array of snapshots

**POST /api/portfolio/snapshot**
- Create manual snapshot
- Returns: success message

### Holdings

**GET /api/holdings**
- Get all holdings
- Returns: array of holdings

**GET /api/holdings/:symbol**
- Get specific holding details + fill history
- Returns: holding + fills array

## Project Structure

```
crypto_track/
├── backend/
│   ├── src/
│   │   ├── config/          # Database config
│   │   ├── migrations/      # Database migrations
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   └── index.ts         # Server entry
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/             # API client
│   │   ├── components/      # React components
│   │   ├── types.ts         # TypeScript types
│   │   └── App.tsx          # Main app
│   └── package.json
│
├── .env                     # Environment variables
└── README.md
```

## Database Schema

### fills
Stores all trade fills from OKX
- bill_id, inst_id, side, fill_px, fill_sz, fee, ts

### holdings
Calculated current positions
- symbol, total_amount, avg_cost, total_cost

### portfolio_snapshots
Historical snapshots
- timestamp, total_value, total_pnl, data (JSON)

### price_cache
Cached market prices
- symbol, price, updated_at

## How It Works

1. **Fill Sync**: Fetches all your trades from OKX (last 3 months)
2. **Holdings Calculation**: Aggregates fills to calculate current positions
3. **P&L Calculation**:
   - Weighted average cost for buys
   - Proportional cost reduction for sells
   - Current value = amount × current price
   - P&L = current value - total cost
4. **Price Updates**: Fetches current prices from OKX API
5. **Portfolio Weights**: Each asset % of total portfolio value

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT

## Support

For issues or questions:
1. Check the logs in backend terminal
2. Verify API credentials in `.env`
3. Ensure PostgreSQL is running
4. Check OKX API permissions

---

Built with ❤️ using Node.js, React, and OKX API
