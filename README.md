# Oceanic — Full-Stack Financial Operating System

A full-stack financial ledger, cashflow intelligence, and budgeting platform built with **Laravel 12** and **React 19**. Designed around the **Oceanic** aesthetic system (`#0B1622` deep obsidian navy and `#F6F9FC` cool alabaster), the application delivers real-time double-entry account transfers, interactive cashflow telemetry, automated recurring billing cycles, and bank statement reconciliation.

---

## Core Capabilities

- **Oceanic Design System & Adaptive Theme**: Calibrated dark (`#0B1622`) and light (`#F6F9FC`) palettes with automatic OS `prefers-color-scheme` synchronization, tabular monospace numerals (`JetBrains Mono`), and tactile glass surfaces.
- **Interactive Cashflow Wave & Bar Telemetry**: Custom SVG wave-area and grouped bar charts with fluid cubic-Bezier splines, vertical hover radar crosshairs, and timeframe filters (`All time`, `This month`, `Last 90d`, `YTD`).
- **Financial Pulse & Velocity Analytics**: Automatic month-over-month (MoM) income and spending velocity comparison, net savings rate badges, and proactive budget pacing alerts ($\ge 75\%$ utilization).
- **Multi-Account Ledger & Atomic Transfers**: Track balances across checking, savings, credit, and cash accounts (`AccountLedgerService`) with atomic double-entry funds transfers (`POST /api/accounts/transfer`) and one-click account ledger drill-downs.
- **Interactive Ledger Sorting & Bulk Operations**: Sort transactions by `Date`, `Description`, or `Amount`, filter by type/category/account/date range, and perform multi-row bulk CSV exports or batch deletions.
- **CSV Bank Statement Import**: Drag-and-drop CSV parser with automatic header detection (`Date`, `Description`, `Amount`, `Type`, `Category`), live preview table, and batch ledger ingestion (`POST /api/transactions/import`).
- **Receipt Attachment & Lightbox Preview**: Attach image or PDF receipts (`JPG`, `PNG`, `WEBP`, `PDF` up to 5 MB) to any transaction (`POST /api/transactions/{id}/receipt`) with instant modal preview.
- **Automated Recurring Commitments Engine**: Schedule daily, weekly, monthly, or yearly recurring transactions with an upcoming commitments dashboard widget and automated processing via `php artisan transactions:process-recurring` (`POST /api/transactions/process-recurring`).
- **Multi-Provider AI Financial Advisor & Auto-Categorizer**: Grounded financial analysis and Q&A engine powered by **Google Gemini 2.5 Flash**, **OpenAI (`gpt-4o-mini`)**, **Groq (`llama-3.3-70b-versatile`)**, and an automatic zero-key deterministic fallback. Features automated Capital Efficiency Scoring (0–100), Radar Watchlist alerts, 1-click optimization cards, natural language ledger queries (`A` hotkey), and batch AI categorization for Bank CSV imports.
- **Live Multi-Currency Formatting**: Instant workspace-wide currency switching (`$`, `€`, `£`, `DH`, `CA$`, `¥`) across all KPI cards, charts, tables, budgets, and PDF/CSV reports.
- **Global Command Finder & Keyboard Shortcuts**: Press `/` or `Ctrl+K` (`⌘K`) to search transactions, accounts, budgets, and quick actions, or trigger instant single-key shortcuts (`N`, `T`, `X`, `P`, `A`) anywhere in the workspace.
- **Stripe Pro Billing & Webhooks**: Integrated Stripe Checkout, Customer Portal, subscription lifecycle management, and payment-to-transaction syncing.

---

## Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `/` or `Ctrl + K` / `⌘K` | Open Global Command Finder |
| `N` | Log New Transaction |
| `A` | Open Oceanic AI Financial Advisor |
| `X` | Navigate to Accounts & Atomic Transfers |
| `P` | Open Profile, Security & Currency Modal |
| `T` | Toggle Dark / Light Theme |
| `Esc` | Close Active Modal or Command Finder |

---

## Tech Stack

- **Backend**: PHP 8.3+, Laravel 12.0, Laravel Sanctum, Stripe PHP SDK
- **Frontend**: React 19.2, React Router 7, Tailwind CSS 3.4, Framer Motion 12, Recharts 3.4, Phosphor Icons (`@phosphor-icons/react`), jsPDF & PapaParse
- **Database**: PostgreSQL (Production) / MySQL or SQLite (Development)
- **Testing**: PHPUnit 11 (Feature & Unit Suites)

---

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/MohamedAliCH/expense-tracker.git
cd expense-tracker
```

### 2. Backend Setup (`expense-tracker-api`)

```bash
cd expense-tracker-api
composer install
cp .env.example .env
php artisan key:generate
```

Configure your database credentials in `expense-tracker-api/.env`, then run migrations and seed the demo account:

```bash
php artisan migrate --seed
php artisan serve --host=127.0.0.1 --port=8000
```

**Demo Credentials** (seeded via `DemoUserSeeder`):
- **Email**: `john@example.com`
- **Password**: `password123`

### 3. Frontend Setup (`expense-tracker-frontend`)

In a separate terminal:

```bash
cd expense-tracker-frontend
npm install
```

Create `expense-tracker-frontend/.env` if needed:

```env
REACT_APP_API_URL=http://127.0.0.1:8000/api
```

Start the development server:

```bash
npm start
```

The application will be available at `http://localhost:3000`.

---

## Architecture Overview

```text
├── expense-tracker-api/                  # Laravel 12 REST API
│   ├── app/
│   │   ├── Console/Commands/             # ProcessRecurringTransactions CLI command
│   │   ├── Http/Controllers/Api/         # Auth, Transaction, Account, Category, Budget, Stripe
│   │   ├── Models/                       # User, Account, Transaction, Category, Budget, Subscription
│   │   └── Services/                     # AccountLedgerService (atomic balance & transfer invariants)
│   ├── database/
│   │   ├── migrations/                   # Full schema including accounts, recurring, and receipts
│   │   └── seeders/                      # CategorySeeder & DemoUserSeeder
│   ├── routes/api.php                    # Sanctum-protected API routes
│   └── tests/Feature/                    # Automated feature test suites (Ledger, Profile, Recurring)
│
├── expense-tracker-frontend/             # React 19 Client
│   ├── src/
│   │   ├── components/
│   │   │   ├── Accounts/                 # AccountPage, AccountCard, AccountModal, TransferModal
│   │   │   ├── Auth/                     # Login, Register, ProtectedRoute, ProfileModal
│   │   │   ├── Budgets/                  # BudgetPage, BudgetCard, BudgetModal
│   │   │   ├── Categories/               # CategoryModal
│   │   │   ├── Common/                   # AnimatedNumber, EmptyState, LoadingSpinner, ProgressBar
│   │   │   ├── Dashboard/                # Dashboard, StatCard, ChartSection, FinancialPulse, UpcomingRecurring
│   │   │   ├── Layout/                   # Header, CommandFinder
│   │   │   ├── Payments/                 # PaymentList
│   │   │   ├── Subscription/             # UpgradePage, SubscriptionBadge
│   │   │   └── Transactions/             # TransactionTable, TransactionRow, TransactionModal, ImportCsvModal
│   │   ├── contexts/                     # AuthContext, AppContext, ThemeContext
│   │   └── utils/                        # Consolidated API client (api.js), Export (CSV/PDF), helpers
│   └── package.json
│
└── render.yaml                           # Render Infrastructure-as-Code Blueprint
```

---

## Testing & Verification

Run the backend automated test suite (24 tests, 69 assertions covering authentication, profile/password security, double-entry ledger balance synchronization, atomic account transfers, CSV bulk imports, and recurring transaction cycles):

```bash
cd expense-tracker-api
php artisan test
```

Compile the production frontend bundle:

```bash
cd expense-tracker-frontend
npm run build
```

---

## License

This software is open source and available under the [MIT License](LICENSE).
