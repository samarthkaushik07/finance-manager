# 💰 Finance & Expense Manager

**Team:** GraphicCodeHackers &nbsp;|&nbsp; **Submitted To:** Deepak Rana &nbsp;|&nbsp; **Platform:** Vercel

---

## 🚀 How to Open the Project

> **No installation required.** This is a pure HTML/CSS/JS project.

### Option 1 — Double Click (Easiest)
1. Open the `finance/` folder
2. Double-click **`index.html`**
3. It opens directly in your browser ✅

### Option 2 — VS Code Live Server (Recommended)
1. Open the `finance/` folder in **VS Code**
2. Install the **Live Server** extension (by Ritwick Dey)
3. Right-click `index.html` → **"Open with Live Server"**
4. Auto-reloads on every save ✅

### Option 3 — Browser File Open
1. Open any browser (Chrome, Edge, Firefox)
2. Press `Ctrl + O`
3. Navigate to `finance/index.html` and open it ✅

---

## 🔑 Demo Login

| Field    | Value                          |
|----------|-------------------------------|
| Email    | `demo@financemanager.com`      |
| Password | `Demo@1234`                    |

Or just click the **"Try Demo Account"** button on the login page — it auto-fills and logs in.

---

## ✅ What Is Working (Phase 2 — Frontend Complete)

### 🔐 Authentication (`index.html`)
- [x] Login form with email + password validation
- [x] Register form with password strength meter
- [x] Tab switching between Login ↔ Register
- [x] **Demo auto-login** button
- [x] Forgot password modal (UI only — email triggers toast)
- [x] Mock JWT token stored in `localStorage`
- [x] Auth guard — protected pages redirect to login if not logged in
- [x] Logout button in sidebar
- [x] Password show/hide toggle

### 🏠 Dashboard (`dashboard.html`)
- [x] 4 summary stat cards (Income, Expenses, Savings, Transactions) with **animated counters**
- [x] Month-over-month **percentage change** badges
- [x] **Bar chart** — Income vs Expenses (last 6 months) via Chart.js
- [x] **Donut chart** — Expense breakdown by category
- [x] Period toggle: 6-Month / 3-Month view
- [x] Recent transactions list with icons and relative dates ("Today", "Yesterday")
- [x] Budget progress bars
- [x] Quick action buttons (→ Add Income, Add Expense, Reports, Budget)
- [x] Live **search** filter on recent transactions
- [x] Profile edit modal (name, email)
- [x] Currency settings modal
- [x] Responsive sidebar with mobile hamburger menu

### 💳 Expenses (`expenses.html`)
- [x] Full **CRUD** — Add, Edit, Delete transactions
- [x] Visual **category picker** (icon grid)
- [x] Type toggle — Income / Expense (changes available categories)
- [x] Sortable table (by date, amount — asc/desc)
- [x] **Search** filter with debounce
- [x] Filter by type, category, and **date range**
- [x] **Pagination** (10 per page) with smart page numbers
- [x] **CSV export** (exports filtered data)
- [x] Summary pills (total income, expense, net balance)
- [x] Delete confirmation modal
- [x] Pre-fill modal from URL param (`?type=income`)
- [x] Clear all filters button

### 📊 Reports (`reports.html`)
- [x] **Period selector** (This Month / Last Month / 3M / 6M / All Time)
- [x] 4 KPI cards (Income, Expenses, Savings, Savings Rate)
- [x] **Line chart** — Monthly income vs expense trend
- [x] **Horizontal bar chart** — Top expense categories
- [x] **Category ranking list** with animated progress bars
- [x] **SVG savings rate gauge** with gradient animation
- [x] **6 Smart Insights** auto-generated from real data
- [x] **Budget management** — Add, Edit, Delete budget goals
- [x] Budget progress cards with status (Safe / Warning / Over)
- [x] Duplicate budget prevention
- [x] Print report button

### 🗄️ Data Layer (`js/data.js`)
- [x] **15 seeded mock transactions** (income + expenses across categories)
- [x] **6 seeded budget goals**
- [x] Full localStorage CRUD for expenses and budgets
- [x] Analytics helpers: monthly stats, category totals, 6-month trends, budget utilization
- [x] All data **persists across page reloads**

---

## ❌ What Is Left (Phase 3 — Backend)

### 🖥️ Backend — Node.js + Express.js *(Samarth + Simran)*
- [ ] Set up Node.js project with Express.js
- [ ] Create REST API routes:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `GET/POST/PUT/DELETE /api/expenses`
  - `GET/POST/PUT/DELETE /api/budgets`
  - `GET /api/reports/summary`
- [ ] Request validation with `express-validator`
- [ ] Error handling middleware
- [ ] CORS configuration for Vercel

### 🔐 Authentication — JWT *(Simran)*
- [ ] Real JWT token generation (`jsonwebtoken`)
- [ ] JWT middleware to protect routes
- [ ] Token refresh / expiry handling
- [ ] Password hashing with `bcrypt`
- [ ] Postman API collection for testing

### 🗃️ Database — MongoDB *(Yuviks)*
- [ ] Design MongoDB schemas:
  - `User` (name, email, passwordHash, currency)
  - `Expense` (userId, type, amount, category, date, description)
  - `Budget` (userId, category, limit)
- [ ] Connect with `mongoose`
- [ ] CRUD operations on real database
- [ ] Seed script for demo data

### 🔗 Frontend API Integration *(Samarth)*
- [ ] Replace all `localStorage` calls with `fetch()` / `axios` API calls
- [ ] Handle loading states and API error messages
- [ ] JWT token sent in `Authorization: Bearer <token>` header
- [ ] Auto-logout on token expiry (401 response)

### 🎨 UI Polish *(Tanji)*
- [ ] Skeleton loading screens (instead of "Loading...")
- [ ] Animated page transitions
- [ ] Full mobile responsiveness audit
- [ ] Dark/Light mode toggle
- [ ] Empty state illustrations
- [ ] Micro-interaction improvements

### ☁️ Deployment — Vercel *(Samarth)*
- [ ] Deploy Node.js backend as Vercel serverless functions
- [ ] Configure environment variables (MongoDB URI, JWT secret)
- [ ] Connect frontend to deployed API
- [ ] Set up CI/CD from GitHub
- [ ] Custom domain (optional)

### 📄 Documentation *(Yuviks)*
- [ ] Final project README with full setup guide
- [ ] API documentation (Postman or Swagger)
- [ ] Database ER diagram
- [ ] Deployment guide

---

## 📁 Project File Structure

```
finance/
├── index.html              ← Login & Landing       (open this to start)
├── dashboard.html          ← Main Dashboard
├── expenses.html           ← Add / Manage Expenses
├── reports.html            ← Analytics & Budgets
│
├── styles/
│   ├── main.css            ← Global design system
│   ├── auth.css            ← Login page styles
│   ├── dashboard.css       ← Dashboard styles
│   ├── expenses.css        ← Expenses page styles
│   └── reports.css         ← Reports page styles
│
├── js/
│   ├── data.js             ← Data layer (localStorage CRUD)
│   ├── utils.js            ← Shared utilities
│   ├── auth.js             ← Login / Register logic
│   ├── dashboard.js        ← Dashboard charts & stats
│   ├── expenses.js         ← Full CRUD logic
│   └── reports.js          ← Analytics & budget logic
│
├── README.md               ← This file
└── TASK_DISTRIBUTION.md    ← Team task tracker
```

---

## 🛠️ Tech Stack

| Technology        | Used For                        | Phase   |
|-------------------|---------------------------------|---------|
| HTML5             | Page structure                  | ✅ Done |
| CSS3 + Variables  | Styling, animations, responsive | ✅ Done |
| Vanilla JavaScript| All frontend logic              | ✅ Done |
| Chart.js 4.x      | Charts and data visualization   | ✅ Done |
| localStorage      | Mock database                   | ✅ Done |
| Node.js           | Backend server                  | ⏳ Next |
| Express.js        | REST API                        | ⏳ Next |
| MongoDB           | Database                        | ⏳ Next |
| Mongoose          | ODM for MongoDB                 | ⏳ Next |
| JWT               | Authentication tokens           | ⏳ Next |
| bcrypt            | Password hashing                | ⏳ Next |
| Vercel            | Cloud deployment                | ⏳ Next |

---

## 👥 Team Members

| Member  | Role       | Phase 2 Responsibility                              |
|---------|------------|-----------------------------------------------------|
| Samarth | Team Lead  | Auth page, global design system, project structure  |
| Tanji   | Member 1   | Dashboard, charts, stat cards                       |
| Simran  | Member 2   | Expense CRUD, filters, table, CSV export            |
| Yuviks  | Member 3   | Reports, analytics, budget manager, data layer      |
