# Phase 2 — Team Task Distribution & Progress Tracker

**Project:** Finance & Expense Manager  
**Team:** GraphicCodeHackers  
**Submitted To:** Deepak Rana  
**Phase:** 2 — Frontend (HTML + CSS + JavaScript)  
**Phase 3 (Next):** Backend integration (Node.js, Express.js, MongoDB, JWT)

---

## 📁 Project File Structure

```
finance/
├── index.html              ← Login & Landing page    [Samarth]
├── dashboard.html          ← Main Dashboard          [Tanji]
├── expenses.html           ← Expense Management      [Simran]
├── reports.html            ← Reports & Analytics     [Yuviks]
├── styles/
│   ├── main.css            ← Global Design System    [Samarth]
│   ├── auth.css            ← Auth page styles        [Samarth]
│   ├── dashboard.css       ← Dashboard styles        [Tanji]
│   ├── expenses.css        ← Expenses page styles    [Simran]
│   └── reports.css         ← Reports page styles     [Yuviks]
└── js/
    ├── data.js             ← Data layer & mock DB    [Yuviks]
    ├── utils.js            ← Shared utilities        [Shared]
    ├── auth.js             ← Auth JS                 [Samarth]
    ├── dashboard.js        ← Dashboard JS            [Tanji]
    ├── expenses.js         ← Expenses CRUD JS        [Simran]
    └── reports.js          ← Reports & Analytics JS  [Yuviks]
```

---

## 👥 Member Task Breakdown

### 🟢 Samarth (Team Lead) — Auth & Project Architecture
**Files:** `index.html`, `styles/main.css`, `styles/auth.css`, `js/auth.js`

| Task | Status |
|------|--------|
| Global CSS design system (tokens, layout, sidebar, topbar, components) | ✅ Done |
| Login/signup dual-panel page HTML | ✅ Done |
| Auth page glassmorphism styling with animated background | ✅ Done |
| Login form with validation and loading state | ✅ Done |
| Register form with password strength checker | ✅ Done |
| Tab switching (Login ↔ Register) | ✅ Done |
| Forgot password modal | ✅ Done |
| Demo auto-login button | ✅ Done |
| Mock JWT token creation & localStorage auth | ✅ Done |
| Auth guard (`requireAuth()`) for protected pages | ✅ Done |
| Responsive sidebar with mobile hamburger menu | ✅ Done |
| Logout functionality | ✅ Done |

---

### 🔵 Tanji (Member 1) — Dashboard
**Files:** `dashboard.html`, `styles/dashboard.css`, `js/dashboard.js`

| Task | Status |
|------|--------|
| Dashboard HTML layout with sidebar and topbar | ✅ Done |
| 4 stat cards (Income, Expenses, Savings, Transactions) with animated counters | ✅ Done |
| Quick Actions grid (Add Income, Add Expense, Reports, Budget) | ✅ Done |
| Bar chart (Income vs Expenses, last 6 months) using Chart.js | ✅ Done |
| Donut chart (Expense categories breakdown) with custom legend | ✅ Done |
| Period toggle (6M / 3M) for bar chart | ✅ Done |
| Recent transactions list with icons and relative dates | ✅ Done |
| Budget progress bars on dashboard | ✅ Done |
| Live search filter for recent transactions | ✅ Done |
| Month-over-month change percentage badges | ✅ Done |
| Profile edit modal | ✅ Done |
| Currency settings modal | ✅ Done |
| Refresh button for re-fetching data | ✅ Done |

---

### 🟣 Simran (Member 2) — Expense Management (CRUD)
**Files:** `expenses.html`, `styles/expenses.css`, `js/expenses.js`

| Task | Status |
|------|--------|
| Expenses page HTML with summary pills | ✅ Done |
| Full sortable data table with icons and badges | ✅ Done |
| Search filter with debounce | ✅ Done |
| Filter by type (income/expense), category, date range | ✅ Done |
| Multi-column sort (date, amount) | ✅ Done |
| Pagination (10 per page) with smart page buttons | ✅ Done |
| Add transaction modal with validation | ✅ Done |
| Category picker grid (visual icon grid) | ✅ Done |
| Type toggle (Income ↔ Expense) with dynamic categories | ✅ Done |
| Edit transaction (pre-filled modal) | ✅ Done |
| Delete confirmation modal | ✅ Done |
| CSV export (filtered data) | ✅ Done |
| Summary pills (total income, expense, net balance) | ✅ Done |
| URL param to pre-open add modal (`?type=income`) | ✅ Done |
| Filter clear button | ✅ Done |

---

### 🟡 Yuviks (Member 3) — Reports, Analytics & Data Layer
**Files:** `reports.html`, `styles/reports.css`, `js/reports.js`, `js/data.js`

| Task | Status |
|------|--------|
| `data.js`: LocalStorage CRUD for expenses (add/update/delete/get) | ✅ Done |
| `data.js`: LocalStorage CRUD for budgets | ✅ Done |
| `data.js`: User management (get/update) | ✅ Done |
| `data.js`: 15 seeded mock transactions (income + expenses) | ✅ Done |
| `data.js`: 6 seeded budget goals | ✅ Done |
| Analytics: `getMonthlyStats()` helper | ✅ Done |
| Analytics: `getCategoryTotals()` aggregation | ✅ Done |
| Analytics: `getLast6MonthsData()` time-series | ✅ Done |
| Analytics: `getBudgetUtilization()` with spend tracking | ✅ Done |
| Reports page HTML (KPIs, charts, budgets, insights) | ✅ Done |
| 4 KPI cards with period filtering | ✅ Done |
| Line chart (Income vs Expense trend) using Chart.js | ✅ Done |
| Horizontal bar chart (Category breakdown) | ✅ Done |
| Category ranking list with animated progress bars | ✅ Done |
| SVG savings rate gauge with gradient animation | ✅ Done |
| 6 Smart Insights (auto-generated from data) | ✅ Done |
| Budget management grid (Add / Edit / Delete) | ✅ Done |
| Budget modal with duplicate prevention | ✅ Done |
| Period selector (This Month / Last Month / 3M / 6M / All Time) | ✅ Done |
| Print report button | ✅ Done |

---

## 🛠️ Shared Utilities (`js/utils.js`)
*(Contributed by all members, maintained as shared file)*

| Utility | Purpose |
|---------|---------|
| `formatCurrency()` | Rupee formatting with L (lakh) abbreviation |
| `formatDate()` | Date formatting (short / medium / long) |
| `relativeDate()` | "Today", "Yesterday", "3 days ago" |
| `todayISO()` | Returns today as `YYYY-MM-DD` |
| `showToast()` / `removeToast()` | Animated toast notification system |
| `initMobileMenu()` | Mobile hamburger toggle |
| `populateSidebarUser()` | Auto-fill sidebar user block from localStorage |
| `animateNumber()` | Smooth counter animation |
| `getCategoryIcon()` | Category → emoji icon map |
| `logout()` | Clears auth, redirects to login |
| `requireAuth()` | Guards protected pages |
| `debounce()` | Debounce utility for search inputs |

---

## 🌐 Technology Used (Phase 2)

| Technology | Purpose |
|-----------|---------|
| **HTML5** | Semantic page structure |
| **CSS3** | Glassmorphism, animations, CSS variables, grid/flex |
| **Vanilla JavaScript** | All interactivity, DOM manipulation, data management |
| **Chart.js 4.x** (CDN) | Bar, Line, Donut, Horizontal bar charts |
| **localStorage** | Mock database (replaced with MongoDB in Phase 3) |
| **Google Fonts (Inter)** | Typography |

---

## 🔗 Demo Login
- **Email:** `demo@financemanager.com`  
- **Password:** `Demo@1234`
- Or click **"Try Demo Account"** on the login page

---

## ➡️ Phase 3 Roadmap

| Feature | Assigned To |
|---------|------------|
| Backend with Node.js + Express.js | Samarth + Simran |
| MongoDB database schema & CRUD routes | Yuviks |
| JWT authentication endpoints | Simran |
| API integration (replace localStorage) | Samarth |
| UI polish & final responsive fixes | Tanji |
| Vercel deployment setup | Samarth |
| API testing (Postman) | Simran |
| Documentation & README | Yuviks |
