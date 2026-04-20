# 💰 Full-Stack Expense Tracker

A modern, production-ready, full-stack expense tracking application built with **Laravel 12** and **React 19**. This application enables users to manage their personal finances, track recurring subscriptions, set tight budgets, and visualize their spending habits with interactive charts.

## Key Features

- **📊 Interactive Dashboard**: Real-time overview of your financial health with animated charts (via Recharts).
- **💸 Transaction Management**: Granular control over income and expense tracking.
- **📦 Smart Categories**: Organize transactions with customizable categories equipped with emoji support.
- **💰 Budgeting**: Set limits on your spending and monitor budget health dynamically.
- **💳 Stripe Subscriptions**: Integrated Stripe payments for tracking premium subscriptions and payment histories, linked directly via Webhooks.
- **📄 Export Functionality**: Generate and download financial reports in PDF and CSV formats.
- **🔐 Secure Authentication**: Token-based API authentication utilizing Laravel Sanctum.
- **🚀 One-Click Deployment**: Pre-configured `render.yaml` for seamless Infrastructure-as-Code deployment on Render.

---

## Tech Stack

- **Language**: PHP 8.3+, JavaScript (ES6+)
- **Backend Framework**: Laravel 12.0
- **Frontend Library**: React 19.2 (Create React App)
- **Database**: PostgreSQL (Production) / SQLite or MySQL (Development)
- **Authentication**: Laravel Sanctum
- **Payments / Billing**: Stripe API
- **Charts / UI**: Recharts, Framer Motion, Lucide React
- **Deployment**: Render (Docker APIs + PostgreSQL Database)

---

## Prerequisites

Before setting up the project locally, ensure your system has the following installed:

- **PHP** >= 8.3
- **Composer** (PHP dependency manager)
- **Node.js** >= 18.x and **npm**
- **PostgreSQL** (Recommended) or MySQL / SQLite
- **Stripe Account** (Optional, required for executing payment/subscription workflows locally)

---

## Getting Started

Follow this step-by-step guide to get your local development environment up and running.

### 1. Clone the Repository

```bash
git clone https://github.com/MohamedAliCH/expense-tracker.git
cd expense-tracker
```

### 2. Backend Setup (Laravel API)

Navigate to the API folder and install dependencies:

```bash
cd expense-tracker-api
composer install
```

Configure your environment:

```bash
cp .env.example .env
php artisan key:generate
```

Update the `.env` file with your local database credentials. For example (PostgreSQL):
```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=expense_tracker
DB_USERNAME=postgres
DB_PASSWORD=your_password

FRONTEND_URL=http://localhost:3000
SANCTUM_STATEFUL_DOMAINS=localhost:3000
```

Run database migrations to build your schema, and seed default categories:

```bash
php artisan migrate --seed
```

Start the local backend development server:

```bash
php artisan serve
```
*The API will be accessible at `http://localhost:8000`*

### 3. Frontend Setup (React)

Open a **new terminal tab**, and navigate to the frontend directory:

```bash
cd expense-tracker-frontend
npm install
```

Configure the React environment:
Create an `.env` file in the `expense-tracker-frontend` directory and define the API connection:

```env
REACT_APP_API_URL=http://localhost:8000/api
```

Start the React development server:

```bash
npm start
```
*The application UI will run at `http://localhost:3000`*

---

## Architecture Overview

### Structure

```
├── expense-tracker-api/          # Laravel REST API Application
│   ├── app/                      
│   │   ├── Http/Controllers/Api/ # Endpoint controllers (CRUD, Stripe, Auth)
│   │   └── Models/               # Eloquent ORMs (User, Transaction, Category...)
│   ├── config/                   # Laravel configurations (CORS, DB, etc.)
│   ├── database/                 # Migrations & Seeders
│   ├── routes/                   # Contains api.php
│   └── Dockerfile                # Docker setup for Render Web Service
│
├── expense-tracker-frontend/     # React SPA Client
│   ├── src/
│   │   ├── components/           # Reusable UI elements (Modals, Buttons)
│   │   ├── contexts/             # React Contexts (AuthContext, ThemeContext)
│   │   ├── services/             # Axios API communication logic
│   │   └── utils/                # Utility formatting functions
│   └── package.json
│
└── render.yaml                   # Render Blueprint Infrastructure Config
```

### Data Flow

```
User Action → React Component → Axios Hook → Laravel API Controller → PostgreSQL Db
```

---

## Deployment Configuration (Render)

This project natively supports Infrastructure-as-Code via **Render**. The project is split into two deployment units: a Dockerized Laravel API + Managed Database, and a Static Frontend.

The included `render.yaml` creates two services in the `ohio` region:
1. **Managed PostgreSQL Database** 
2. **Docker Web Service** for the `expense-tracker-api`

### Deploying the Backend (Blueprint)

1. Sign up for [Render.com](https://render.com).
2. Go to your dashboard and click **New → Blueprint**.
3. Link this GitHub repository.
4. Render will read the `render.yaml` file, automatically provision the PostgreSQL database, and build the Docker image for the Laravel API. 

*Render Free Tier Note: You can populate dummy data without using the paid SSH shell by visiting `/api/seed-johndoe` on your live API URL (e.g. `https://your-api.onrender.com/api/seed-johndoe`) which automatically runs the built-in `JohnDoeSeeder` simulator.*

### Deploying the Frontend (Static Site)

1. In Render, click **New → Static Site**.
2. Connect this repository.
3. Configure the settings:
   - Root Directory: `expense-tracker-frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `expense-tracker-frontend/build`
4. Expand **Advanced**, and add environment variables:
   - `REACT_APP_API_URL` = `https://your-backend-render-url.onrender.com/api`
5. Click **Create Static Site**.

---

## Testing

For backend testing (PHPUnit/Pest are enabled):

```bash
cd expense-tracker-api
php artisan test
```

For frontend suite:
```bash
cd expense-tracker-frontend
npm test
```

## License

This software is open source and available under the [MIT License](LICENSE).
