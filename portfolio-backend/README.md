# Portfolio Tracker Backend

## Database Setup

### Option 1: PostgreSQL (Recommended for Production)

1. **Install PostgreSQL:**
   - Mac: `brew install postgresql`
   - Windows/Linux: Download from https://www.postgresql.org/download/

2. **Create Database:**
   ```bash
   psql -U postgres
   CREATE DATABASE portfolio_tracker;
   \q
   ```

3. **Configure Environment:**
   - Copy `.env.example` to `.env`
   - Update database credentials

4. **Run the Backend:**
   ```bash
   npm run dev
   ```
   The server will automatically create tables on first run.

### Option 2: SQLite (Simple Alternative)

If you prefer a simpler setup without PostgreSQL, you can use SQLite:

1. **Install SQLite dependencies:**
   ```bash
   npm install sqlite3 @types/sqlite3
   ```

2. **The database file will be created automatically in `./database.sqlite`**

## API Endpoints

### Transactions
- `GET /api/transactions` - Get all transactions
- `GET /api/transactions/:id` - Get transaction by ID
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### History
- `GET /api/history` - Get all history entries
- `GET /api/history/asset/:asset` - Get history by asset
- `GET /api/history/transaction/:id` - Get history by transaction

## Running the Server

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## Environment Variables

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=portfolio_tracker

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```