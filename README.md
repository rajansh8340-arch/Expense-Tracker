# Ledgerly — Full-Stack MERN Expense Tracker

Ledgerly is a full-stack personal finance and expense tracking application built using the **MERN** stack (**M**ongoDB, **E**xpress, **R**eact, **N**ode.js) with **Vite**, **Mongoose**, **JWT Authentication**, and **Recharts**.

It includes seamless zero-config database startup (automatically connects to local MongoDB/Atlas or spins up embedded MongoDB), instant demo login, interactive cash flow charts, category breakdown donut charts, search/filter ledger tables, CSV export, and a dark/light mode UI.

---

## Features

- **Authentication & Security:**
  - User registration with bcrypt (12 rounds) password hashing.
  - JWT (JSON Web Token) session authentication with 7-day expiry.
  - **Instant 1-Click Demo Login:** Try the application immediately with pre-loaded realistic financial data.
  - Strict user-isolated MongoDB document queries (users can never read or write another user's transactions).

- **Financial Analytics & Dashboard:**
  - **Net Balance Hero Card** with real-time positive cash flow / deficit status.
  - **Income & Expense Cards** with net savings rate tracking.
  - **Monthly Budget Progress Tracker** with visual healthy / warning / danger indicator bars.
  - **Monthly Income vs Expenses Bar Chart** powered by Recharts.
  - **Top Expense Categories Donut Chart** with percentage breakdowns and custom legends.
  - **Deep-Dive Analytics View:** Income composition, ranked expense categories, and payment method distribution (Credit Card, Debit Card, UPI, etc.).

- **Transaction Ledger & CRUD:**
  - Real-time instant search across titles and notes.
  - Filter by Type (All / Income / Expense) and Category.
  - Sort by Newest, Oldest, Highest Amount, and Lowest Amount.
  - Add / Edit Transaction modal with quick preset buttons (Groceries, Coffee, Salary, Rent, etc.).
  - Confirmation modals before deleting or clearing transactions.
  - **CSV Export:** Download a complete transaction record file with one click.
  - **Sample Data Seeder:** Populate 20 realistic transactions across multiple months anytime.

- **Design & Experience:**
  - **Dark Mode & Light Mode:** Toggleable with persistent localStorage settings.
  - **Multi-Currency Support:** USD ($), EUR (€), GBP (£), INR (₹), JPY (¥), CAD (CA$), AUD (A$).
  - Responsive mobile drawer navigation and fluid desktop layouts.

---

## Tech Stack

- **Frontend:** React 18, Vite, Lucide React icons, Recharts, Axios, Vanilla CSS with custom design tokens.
- **Backend:** Node.js (ES Modules), Express 4, Mongoose 8, JWT, bcryptjs, CORS.
- **Database:** MongoDB (works with local MongoDB, MongoDB Atlas, or automatic embedded MongoDB).

---

## Project Structure

```text
expense-tracker/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Charts.jsx             # Recharts Bar & Donut components
│   │   │   ├── Header.jsx             # Top bar, breadcrumbs, theme toggle
│   │   │   ├── Sidebar.jsx            # Responsive navigation & user profile
│   │   │   ├── StatCard.jsx           # Balance, income, expense, and budget cards
│   │   │   ├── Toast.jsx              # Animated notification toasts
│   │   │   ├── TransactionModal.jsx   # Add/Edit modal with quick presets
│   │   │   └── TransactionTable.jsx   # Filterable ledger table with CSV export
│   │   ├── context/
│   │   │   ├── AuthContext.jsx        # User state, JWT storage, currency formatting
│   │   │   └── ThemeContext.jsx       # Dark / Light theme toggle
│   │   ├── pages/
│   │   │   ├── AnalyticsPage.jsx      # Advanced financial health metrics & rankings
│   │   │   ├── AuthPage.jsx           # Sign in, Sign up & Instant Demo login
│   │   │   ├── Dashboard.jsx          # Overview cards, charts & recent activity
│   │   │   ├── SettingsPage.jsx       # Profile, currency, budget & data management
│   │   │   └── TransactionsPage.jsx   # Full transaction ledger view
│   │   ├── services/
│   │   │   └── api.js                 # Axios instance with auth interceptors
│   │   ├── utils/
│   │   │   └── constants.js           # Categories, payment methods & quick presets
│   │   ├── App.jsx                    # Root view orchestrator
│   │   ├── main.jsx                   # React 18 createRoot entry
│   │   └── styles.css                 # Masterclass CSS design system
│   ├── index.html
│   └── package.json
├── server/
│   ├── config/
│   │   └── db.js                      # MongoDB connection with zero-config fallback
│   ├── middleware/
│   │   └── auth.js                    # JWT Bearer token protection middleware
│   ├── models/
│   │   └── models.js                  # Mongoose User and Transaction schemas
│   ├── routes/
│   │   ├── auth.js                    # Register, Login, Demo, and Me routes
│   │   └── transactions.js            # Transaction CRUD, summary analytics & CSV export
│   ├── utils/
│   │   └── seedData.js                # Realistic sample data generator
│   ├── server.js                      # Express application entry point
│   ├── .env                           # Environment configuration
│   └── package.json
├── package.json                       # Root orchestration scripts (concurrently)
└── README.md
```

---

## Quick Start

### 1. Install Dependencies

From the project root:

```bash
npm run install:all
```

*(Or individually: `npm install` in root, `client`, and `server`)*

### 2. Configure Environment

The `server/.env` file is already created with default values:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/expense_tracker
JWT_SECRET=super_secret_ledgerly_jwt_key_2026_dev
CLIENT_URL=http://localhost:5173
```

> **Note:** If a local MongoDB instance is not running on port 27017, the server will **automatically spin up an embedded MongoDB instance** so you can start developing immediately with zero additional setup!

### 3. Run the App

Start both the backend server and frontend client concurrently from the root directory:

```bash
npm run dev
```

- **Frontend Client:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000](http://localhost:5000)
- **Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## REST API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new user account |
| `POST` | `/api/auth/login` | Public | Login with email and password |
| `POST` | `/api/auth/demo` | Public | 1-Click Instant Demo Login with seeded data |
| `GET` | `/api/auth/me` | JWT | Get current user profile |
| `PATCH` | `/api/auth/me` | JWT | Update name, currency, or budget |
| `GET` | `/api/transactions` | JWT | Fetch transactions (supports `search`, `type`, `category`, `sort`) |
| `POST` | `/api/transactions` | JWT | Create new transaction |
| `PATCH` | `/api/transactions/:id` | JWT | Update an existing transaction |
| `DELETE` | `/api/transactions/:id` | JWT | Delete a single transaction |
| `GET` | `/api/transactions/analytics/summary` | JWT | Aggregate balances, monthly trends & categories |
| `POST` | `/api/transactions/actions/seed` | JWT | Seed sample transactions |
| `DELETE` | `/api/transactions/actions/clear-all` | JWT | Delete all transactions for user |
| `GET` | `/api/transactions/actions/export` | JWT | Download transactions as CSV |
