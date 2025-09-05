# Cryptocurrency Portfolio Tracker - Project Context

## 📋 Project Overview

A full-stack cryptocurrency portfolio tracking application that allows users to manage their crypto investments with real-time price tracking, profit/loss calculations, and transaction history.

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- React 18 with TypeScript
- Vite (build tool)
- TailwindCSS + shadcn/ui (styling)
- Zustand (state management - removed localStorage, now API-only)
- TanStack Query (React Query) for data fetching
- Recharts (data visualization)

**Backend:**
- Node.js + Express + TypeScript
- PostgreSQL database
- RESTful API architecture

## 📁 Project Structure

```
portfolio-tracking/
├── portfolio-app/              # Frontend React application
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── ui/           # Reusable UI components (shadcn)
│   │   │   ├── PortfolioTable.tsx
│   │   │   ├── AddEditModal.tsx
│   │   │   ├── AssetAllocation.tsx
│   │   │   ├── PositionHistory.tsx
│   │   │   └── ...
│   │   ├── stores/           # State management
│   │   │   ├── apiPortfolioStore.ts  # Main store (API-only)
│   │   │   └── apiHistoryStore.ts    # History store (API-only)
│   │   ├── services/         # External services
│   │   │   ├── api.ts        # Backend API client
│   │   │   ├── priceManager.ts # Crypto price fetching
│   │   │   └── scraperService.ts # Fallback price scraper
│   │   ├── hooks/            # Custom React hooks
│   │   │   └── usePortfolio.ts
│   │   ├── types/            # TypeScript definitions
│   │   ├── lib/              # Utilities
│   │   │   └── utils.ts      # Formatting functions
│   │   └── data/             # Static data
│   │       └── cryptoAssets.ts # Crypto metadata
│   └── package.json
│
└── portfolio-backend/          # Backend Node.js application
    ├── src/
    │   ├── server.ts          # Express server setup
    │   ├── db/
    │   │   ├── index.ts       # Database connection
    │   │   └── schema.sql     # PostgreSQL schema
    │   └── routes/
    │       ├── transactions.ts # Transaction CRUD endpoints
    │       └── history.ts     # History endpoints
    ├── .env                   # Environment variables
    └── package.json
```

## 🗄️ Database Schema

### PostgreSQL Tables

**transactions**
- `id` (UUID) - Primary key
- `asset` (VARCHAR) - Crypto symbol (BTC, ETH, etc.)
- `type` (ENUM) - 'buy' or 'sell'
- `quantity` (DECIMAL) - Amount of crypto
- `price_usd` (DECIMAL) - Price per unit in USD
- `destination_asset` (VARCHAR) - For sells, which stablecoin received
- `transaction_date` (DATE) - Optional transaction date
- `notes` (TEXT) - Optional notes
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**history**
- `id` (UUID) - Primary key
- `action` (VARCHAR) - 'add', 'update', or 'delete'
- `transaction_id` (UUID) - Foreign key to transactions
- `asset` (VARCHAR)
- `type` (ENUM) - 'buy' or 'sell'
- `quantity` (DECIMAL)
- `price_usd` (DECIMAL)
- `timestamp` (TIMESTAMP)
- Additional fields mirror transaction data

## 🔑 Key Features

### Core Functionality
1. **Transaction Management**
   - Add buy/sell transactions
   - Edit existing transactions
   - Delete transactions
   - Support for selling to stablecoins (USDT, USDC, BUSD)

2. **Portfolio Visualization**
   - Real-time portfolio value calculation
   - Profit/Loss tracking (total and per asset)
   - Asset allocation pie chart
   - Grouped view by asset with average prices

3. **Price Data**
   - Primary: CoinGecko API integration
   - Fallback: Web scraper (Binance, CoinMarketCap)
   - Real-time price updates every 60 seconds

4. **History Tracking**
   - Complete transaction history
   - Action timeline (adds, deletes)
   - Searchable and filterable

## 🔧 Configuration

### Backend (.env)
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=portfolio_tracker
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Frontend
- API endpoint: `http://localhost:3001/api`
- Configured in `src/services/api.ts`

## 🚀 Running the Application

### Prerequisites
1. PostgreSQL installed and running
2. Node.js 16+ installed

### Database Setup
```bash
# Create database
psql -U postgres
CREATE DATABASE portfolio_tracker;
\q
```

### Backend
```bash
cd portfolio-backend
npm install
npm run dev  # Runs on port 3001
```

### Frontend
```bash
cd portfolio-app
npm install
npm run dev  # Runs on port 5173
```

## 🎨 UI/UX Decisions

1. **Dark/Light Mode**: Automatic theme detection with manual toggle
2. **Responsive Design**: Works on desktop and mobile
3. **Number Formatting**: 
   - Currency: $1,234.56
   - Crypto amounts: Smart formatting (0.5, 1.25, 0.00012345)
   - Percentages: Clean display without unnecessary decimals
4. **Transaction Grouping**: Same assets grouped with weighted average prices

## 📝 Important Implementation Details

### State Management Evolution
- **Initially**: Used Zustand with localStorage persistence
- **Current**: API-only approach, no local storage
- All data stored in PostgreSQL database
- Removed hybrid store complexity

### API Communication
- RESTful endpoints for all CRUD operations
- CORS configured for development (allows all localhost ports)
- Error handling with user-friendly messages
- Automatic string-to-number conversion for database decimals

### Price Fetching Strategy
1. Try CoinGecko API first
2. If rate limited, fallback to scraper
3. Scraper uses Binance and CoinMarketCap public endpoints
4. Caches prices for 60 seconds

### Transaction Type Handling
- **Buy**: Adds to holdings
- **Sell**: Reduces holdings AND automatically creates stablecoin buy transaction
- Proper cost basis tracking with weighted averages

## 🐛 Known Issues & Solutions

### Issue 1: CORS Errors
**Solution**: Backend configured to allow all localhost ports in development

### Issue 2: PostgreSQL Decimal as Strings
**Solution**: `parseFloat()` conversion in API stores

### Issue 3: Number Formatting
**Solution**: Custom `formatCryptoAmount()` function handles various decimal places

## 🔄 Recent Changes

1. **Removed localStorage** - Now uses PostgreSQL exclusively
2. **Simplified stores** - Removed hybrid store pattern
3. **Added transaction types** - Buy/sell with stablecoin destinations
4. **Improved formatting** - Better number display for crypto amounts
5. **Fixed CORS** - Permissive development configuration

## 📚 API Endpoints

### Transactions
- `GET /api/transactions` - Get all transactions
- `GET /api/transactions/:id` - Get single transaction
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### History
- `GET /api/history` - Get all history
- `GET /api/history/asset/:asset` - Get history by asset
- `GET /api/history/transaction/:id` - Get history by transaction

## 🎯 Future Improvements

1. User authentication system
2. Multiple portfolio support
3. Export to CSV/Excel
4. More chart types (line charts, candlesticks)
5. Mobile app version
6. WebSocket for real-time prices
7. Tax reporting features
8. DeFi integration

## 🤝 Development Tips

1. **Database changes**: Update both `schema.sql` and TypeScript types
2. **Adding new crypto**: Update `cryptoAssets.ts` with metadata
3. **Price sources**: Can add more scrapers in `scraperService.ts`
4. **Component styling**: Uses TailwindCSS classes, check `tailwind.config.js`
5. **State updates**: All through API calls, no direct localStorage manipulation

## 📦 Dependencies to Note

**Critical Frontend**:
- `zustand` - State management (v4.5.5)
- `@tanstack/react-query` - Data fetching (v5.62.7)
- `recharts` - Charts (v2.13.3)
- `date-fns` - Date formatting (v4.1.0)

**Critical Backend**:
- `pg` - PostgreSQL client (v8.13.1)
- `express` - Web framework (v4.21.2)
- `cors` - CORS middleware (v2.8.5)
- `dotenv` - Environment variables (v16.4.7)

## 🔐 Security Considerations

1. No API keys stored in frontend
2. CORS restricted to development origins
3. SQL injection prevention via parameterized queries
4. Input validation on both frontend and backend
5. No sensitive data in localStorage

## 💡 Architectural Decisions

1. **API-First**: All data operations go through backend
2. **TypeScript Everywhere**: Type safety across full stack
3. **Component-Based**: Reusable UI components
4. **Responsive First**: Mobile-friendly from the start
5. **Real Database**: PostgreSQL for production-ready data persistence

---

*Last Updated: September 2025*
*This documentation provides context for AI assistants to understand and work with the project effectively.*