/* ============================================================
   Shared Data Layer & localStorage Utilities
   Author: Yuvika (Member 3)
   ============================================================ */

const DB_KEYS = {
  expenses:     'fem_expenses',
  budgets:      'fem_budgets',
  user:         'fem_user',
  settings:     'fem_settings',
};

const SEED_USER = {
  name: 'Demo User',
  email: 'demo@financemanager.com',
  role: 'Admin',
  initials: 'DU',
  currency: '₹'
};


/* ── Seed Data ──────────────────────────────────────────────── */
const SEED_EXPENSES = [
  { id: '1', type: 'expense', amount: 1200, category: 'Food & Dining',   description: 'Grocery shopping',      date: '2026-03-28', icon: '🛒' },
  { id: '2', type: 'income',  amount: 55000, category: 'Salary',         description: 'Monthly salary',        date: '2026-03-01', icon: '💼' },
  { id: '3', type: 'expense', amount: 800,  category: 'Transportation',  description: 'Uber rides',             date: '2026-03-27', icon: '🚗' },
  { id: '4', type: 'expense', amount: 2500, category: 'Utilities',       description: 'Electricity bill',      date: '2026-03-25', icon: '💡' },
  { id: '5', type: 'expense', amount: 3200, category: 'Entertainment',   description: 'Netflix & Spotify',     date: '2026-03-22', icon: '🎬' },
  { id: '6', type: 'income',  amount: 8000, category: 'Freelance',       description: 'Web design project',    date: '2026-03-20', icon: '💻' },
  { id: '7', type: 'expense', amount: 1800, category: 'Healthcare',      description: 'Pharmacy',              date: '2026-03-18', icon: '💊' },
  { id: '8', type: 'expense', amount: 4500, category: 'Shopping',        description: 'Clothes & accessories', date: '2026-03-15', icon: '🛍️' },
  { id: '9', type: 'expense', amount: 600,  category: 'Food & Dining',   description: 'Restaurant dinner',     date: '2026-03-14', icon: '🍽️' },
  { id: '10',type: 'income',  amount: 2000, category: 'Investments',     description: 'Dividend received',     date: '2026-03-10', icon: '📈' },
  { id: '11',type: 'expense', amount: 12000,'category': 'Rent',          description: 'Monthly rent',          date: '2026-03-05', icon: '🏠' },
  { id: '12',type: 'expense', amount: 300,  category: 'Food & Dining',   description: 'Coffee & snacks',       date: '2026-03-03', icon: '☕' },
  { id: '13',type: 'expense', amount: 950,  category: 'Transportation',  description: 'Fuel',                  date: '2026-02-28', icon: '⛽' },
  { id: '14',type: 'income',  amount: 55000,category: 'Salary',          description: 'February salary',       date: '2026-02-01', icon: '💼' },
  { id: '15',type: 'expense', amount: 2200, category: 'Education',       description: 'Online courses',        date: '2026-02-20', icon: '📚' },
];

const SEED_BUDGETS = [
  { id: '1', category: 'Food & Dining',  limit: 5000,  icon: '🛒' },
  { id: '2', category: 'Transportation', limit: 3000,  icon: '🚗' },
  { id: '3', category: 'Entertainment',  limit: 2000,  icon: '🎬' },
  { id: '4', category: 'Shopping',       limit: 6000,  icon: '🛍️' },
  { id: '5', category: 'Healthcare',     limit: 3000,  icon: '💊' },
  { id: '6', category: 'Utilities',      limit: 4000,  icon: '💡' },
];

let expensesCache = [];
let budgetsCache = [];

/* ── DB Initializer & Sync ──────────────────────────────────── */
async function syncAppData() {
  try {
    if (!localStorage.getItem('fem_auth')) return;

    // Fetch transactions
    const expRes = await fetchWithAuth('/expenses');
    if (expRes) {
      const expData = await expRes.json();
      if (expData.success) {
        expensesCache = expData.data.map(e => ({
          ...e,
          id: e._id,
          date: e.date ? e.date.split('T')[0] : ''
        }));
      }
    }

    // Fetch budgets
    const budRes = await fetchWithAuth('/budgets');
    if (budRes) {
      const budData = await budRes.json();
      if (budData.success) {
        budgetsCache = budData.data.map(b => ({
          ...b,
          id: b._id
        }));
      }
    }
  } catch (err) {
    console.error('Failed to sync app data:', err);
  }
}

function initDB() {
  // Retained as a dummy function for legacy script compatibilities
}

/* ── CRUD: Expenses ─────────────────────────────────────────── */
function getAllExpenses() {
  return expensesCache;
}

function getExpenseById(id) {
  return expensesCache.find(e => e.id === id);
}

async function addExpense(expense) {
  try {
    const res = await fetchWithAuth('/expenses', {
      method: 'POST',
      body: JSON.stringify(expense),
    });
    if (res) {
      const data = await res.json();
      if (data.success) {
        const newEntry = {
          ...data.data,
          id: data.data._id,
          date: data.data.date.split('T')[0],
        };
        expensesCache.unshift(newEntry);
        return newEntry;
      }
    }
  } catch (err) {
    console.error('Error adding transaction:', err);
    showToast('Failed to add transaction to server', 'error');
  }
}

async function updateExpense(id, updates) {
  try {
    const res = await fetchWithAuth(`/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    if (res) {
      const data = await res.json();
      if (data.success) {
        const idx = expensesCache.findIndex(e => e.id === id);
        if (idx !== -1) {
          expensesCache[idx] = {
            ...data.data,
            id: data.data._id,
            date: data.data.date.split('T')[0],
          };
        }
        return expensesCache[idx];
      }
    }
  } catch (err) {
    console.error('Error updating transaction:', err);
    showToast('Failed to update transaction on server', 'error');
  }
}

async function deleteExpense(id) {
  try {
    const res = await fetchWithAuth(`/expenses/${id}`, {
      method: 'DELETE',
    });
    if (res) {
      const data = await res.json();
      if (data.success) {
        expensesCache = expensesCache.filter(e => e.id !== id);
        return true;
      }
    }
  } catch (err) {
    console.error('Error deleting transaction:', err);
    showToast('Failed to delete transaction from server', 'error');
  }
  return false;
}

/* ── CRUD: Budgets ──────────────────────────────────────────── */
function getAllBudgets() {
  return budgetsCache;
}

async function addBudget(budget) {
  try {
    const res = await fetchWithAuth('/budgets', {
      method: 'POST',
      body: JSON.stringify(budget),
    });
    if (res) {
      const data = await res.json();
      if (data.success) {
        const newBudget = { ...data.data, id: data.data._id };
        budgetsCache.push(newBudget);
        return newBudget;
      }
    }
  } catch (err) {
    console.error('Error adding budget:', err);
    showToast('Failed to add budget to server', 'error');
  }
}

async function updateBudget(id, updates) {
  try {
    const res = await fetchWithAuth(`/budgets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    if (res) {
      const data = await res.json();
      if (data.success) {
        const idx = budgetsCache.findIndex(b => b.id === id);
        if (idx !== -1) {
          budgetsCache[idx] = { ...data.data, id: data.data._id };
        }
        return budgetsCache[idx];
      }
    }
  } catch (err) {
    console.error('Error updating budget:', err);
    showToast('Failed to update budget on server', 'error');
  }
}

async function deleteBudget(id) {
  try {
    const res = await fetchWithAuth(`/budgets/${id}`, {
      method: 'DELETE',
    });
    if (res) {
      const data = await res.json();
      if (data.success) {
        budgetsCache = budgetsCache.filter(b => b.id !== id);
        return true;
      }
    }
  } catch (err) {
    console.error('Error deleting budget:', err);
    showToast('Failed to delete budget from server', 'error');
  }
  return false;
}

/* ── User ───────────────────────────────────────────────────── */
function getUser() {
  return JSON.parse(localStorage.getItem('fem_user') || 'null') || SEED_USER;
}

function updateUser(updates) {
  const user = { ...getUser(), ...updates };
  localStorage.setItem(DB_KEYS.user, JSON.stringify(user));
  return user;
}

/* ── Analytics helpers ──────────────────────────────────────── */
function getMonthlyStats(year = new Date().getFullYear(), month = new Date().getMonth() + 1) {
  const all = getAllExpenses();
  const monthStr = `${year}-${String(month).padStart(2, '0')}`;
  const filtered = all.filter(e => e.date && e.date.startsWith(monthStr));

  const income  = filtered.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0);
  const expense = filtered.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0);
  const savings = income - expense;
  return { income, expense, savings, count: filtered.length };
}

function getCategoryTotals(type = 'expense') {
  const all = getAllExpenses().filter(e => e.type === type);
  const map = {};
  all.forEach(e => {
    map[e.category] = (map[e.category] || 0) + e.amount;
  });
  return Object.entries(map)
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);
}

function getLast6MonthsData() {
  const all = getAllExpenses();
  const months = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleString('default', { month: 'short' });
    const income  = all.filter(e => e.type === 'income' && e.date && e.date.startsWith(key))
                       .reduce((s, e) => s + e.amount, 0);
    const expense = all.filter(e => e.type === 'expense' && e.date && e.date.startsWith(key))
                       .reduce((s, e) => s + e.amount, 0);
    months.push({ label, key, income, expense });
  }
  return months;
}

function getBudgetUtilization() {
  const budgets = getAllBudgets();
  const categoryTotals = getCategoryTotals('expense');
  const totalMap = Object.fromEntries(categoryTotals.map(c => [c.category, c.total]));

  return budgets.map(b => ({
    ...b,
    spent: totalMap[b.category] || 0,
    remaining: Math.max(0, b.limit - (totalMap[b.category] || 0)),
    percent: Math.min(100, Math.round(((totalMap[b.category] || 0) / b.limit) * 100)),
  }));
}

function getRecentExpenses(n = 5) {
  return getAllExpenses()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, n);
}

/* Initialize on load */
initDB();
