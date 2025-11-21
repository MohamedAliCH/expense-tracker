# 💰 Expense Tracker

A modern, full-stack expense tracking application built with **Laravel** and **React**. Manage your finances, track expenses and income, set budgets, and visualize your spending habits with beautiful charts.

![Expense Tracker Dashboard](https://via.placeholder.com/800x400?text=Expense+Tracker+Dashboard)

## ✨ Features

- **📊 Dashboard**: Real-time overview of your financial health with interactive charts.
- **💸 Transaction Management**: Easily add, edit, and delete income and expense transactions.
- **📦 Category Management**: Organize transactions with customizable categories featuring **Emoji Support** 🎨.
- **💰 Budgeting**: Set monthly, weekly, or yearly budgets for specific categories to keep your spending in check.
- **📈 Analytics**: Visual breakdown of your spending by category and time period.
- **📄 Export**: Export your financial data to PDF and CSV formats.
- **🔐 Authentication**: Secure user registration and login.

## 🛠️ Tech Stack

### Backend (API)

- **Framework**: Laravel 10+
- **Database**: MySQL
- **Authentication**: Laravel Sanctum

### Frontend

- **Framework**: React.js
- **Styling**: CSS Modules / Styled Components
- **Icons**: Lucide React
- **Charts**: Recharts
- **HTTP Client**: Axios

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

- PHP >= 8.1
- Composer
- Node.js & npm
- MySQL

### 1. Clone the Repository

```bash
git clone https://github.com/MohamedAliCH/expense-tracker.git
cd expense-tracker
```

### 2. Backend Setup (Laravel)

Navigate to the backend directory:

```bash
cd expense-tracker-api
```

Install PHP dependencies:

```bash
composer install
```

Set up environment variables:

```bash
cp .env.example .env
```

_Configure your database credentials in the `.env` file._

Generate application key:

```bash
php artisan key:generate
```

Run database migrations and seeders (adds default categories with emojis):

```bash
php artisan migrate --seed
```

Start the backend server:

```bash
php artisan serve
```

_The API will run at `http://localhost:8000`_

### 3. Frontend Setup (React)

Open a new terminal and navigate to the frontend directory:

```bash
cd expense-tracker-frontend
```

Install JavaScript dependencies:

```bash
npm install
```

Start the frontend development server:

```bash
npm start
```

_The application will open at `http://localhost:3000`_

## 📝 Usage

1.  Register a new account.
2.  Go to **Categories** to customize your expense and income categories (add emojis!).
3.  Set up **Budgets** for your categories.
4.  Start adding **Transactions** on the Dashboard or Transactions page.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
