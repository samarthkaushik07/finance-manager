/* ============================================================
   Dashboard JavaScript
   Author: Tanji Sood (Member 1)
   ============================================================ */

let barChart    = null;
let donutChart  = null;
let currentPeriod = 6;

/* ── Init ───────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth()) return;
  setDateLabel();
  await syncAppData();
  loadDashboard();
  initSearch();
  initModals();
});

function setDateLabel() {
  const el = document.getElementById('dash-date');
  if (el) {
    const now = new Date();
    el.textContent = now.toLocaleDateString('en-IN', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  }
}

/* ── Main Loader ────────────────────────────────────────────── */
function loadDashboard() {
  loadStats();
  renderBarChart(currentPeriod);
  renderDonutChart();
  renderRecentTransactions();
  renderBudgetList();
}

async function refreshDashboard() {
  await syncAppData();
  loadDashboard();
  showToast('Dashboard refreshed!', 'success');
}

/* ── Stats Cards ────────────────────────────────────────────── */
function loadStats() {
  const stats = getMonthlyStats();
  const user  = getUser();
  const cur   = user.currency || '₹';

  const prevMonth = new Date();
  prevMonth.setMonth(prevMonth.getMonth() - 1);
  const prevStats = getMonthlyStats(prevMonth.getFullYear(), prevMonth.getMonth() + 1);

  // Animate values
  animateNumber(document.getElementById('stat-income'),       stats.income,  1200, cur);
  animateNumber(document.getElementById('stat-expense'),      stats.expense, 1200, cur);
  animateNumber(document.getElementById('stat-savings'),      stats.savings, 1200, cur);
  animateNumber(document.getElementById('stat-transactions'), stats.count,   800,  '');

  // Change badges
  setChangeBadge('income-change',  stats.income,  prevStats.income,  true);
  setChangeBadge('expense-change', stats.expense, prevStats.expense, false);
  setChangeBadge('savings-change', stats.savings, prevStats.savings, true);

  const budgetEl = document.getElementById('budget-change');
  if (budgetEl) {
    budgetEl.textContent = `${stats.count} txns`;
  }
}

function setChangeBadge(id, current, prev, positiveIsGood) {
  const el = document.getElementById(id);
  if (!el || prev === 0) return;
  const pct  = Math.round(((current - prev) / Math.abs(prev)) * 100);
  const isUp = pct >= 0;
  const good = positiveIsGood ? isUp : !isUp;
  el.textContent = `${isUp ? '↑' : '↓'} ${Math.abs(pct)}%`;
  el.className = `stat-change ${good ? 'up' : 'down'}`;
}

/* ── Bar Chart ──────────────────────────────────────────────── */
function renderBarChart(months = 6) {
  const data = getLast6MonthsData().slice(-months);
  const ctx  = document.getElementById('bar-chart');
  if (!ctx) return;

  if (barChart) barChart.destroy();

  Chart.defaults.color = '#8892aa';
  Chart.defaults.font.family = 'Inter, sans-serif';

  barChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(d => d.label),
      datasets: [
        {
          label: 'Income',
          data: data.map(d => d.income),
          backgroundColor: 'rgba(0,212,170,0.75)',
          hoverBackgroundColor: 'rgba(0,212,170,1)',
          borderRadius: 6,
          borderSkipped: false,
        },
        {
          label: 'Expenses',
          data: data.map(d => d.expense),
          backgroundColor: 'rgba(239,68,68,0.65)',
          hoverBackgroundColor: 'rgba(239,68,68,0.9)',
          borderRadius: 6,
          borderSkipped: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          labels: { usePointStyle: true, pointStyle: 'circle', padding: 20, font: { size: 12 } },
        },
        tooltip: {
          backgroundColor: '#0e1628',
          borderColor: 'rgba(255,255,255,0.08)',
          borderWidth: 1,
          padding: 12,
          callbacks: {
            label: ctx => ` ${ctx.dataset.label}: ₹${ctx.raw.toLocaleString('en-IN')}`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
        },
        y: {
          grid: { color: 'rgba(255,255,255,0.05)', drawBorder: false },
          border: { display: false },
          ticks: {
            callback: v => '₹' + (v >= 1000 ? (v / 1000) + 'K' : v),
          },
        },
      },
    },
  });
}

function setPeriod(months, el) {
  document.querySelectorAll('.period-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  currentPeriod = months;
  renderBarChart(months);
}

/* ── Donut Chart ────────────────────────────────────────────── */
function renderDonutChart() {
  const categories = getCategoryTotals('expense').slice(0, 6);
  const ctx = document.getElementById('donut-chart');
  if (!ctx || categories.length === 0) return;

  if (donutChart) donutChart.destroy();

  const COLORS = [
    '#00d4aa', '#4f46e5', '#7c3aed', '#ec4899', '#f59e0b', '#ef4444'
  ];

  donutChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: categories.map(c => c.category),
      datasets: [{
        data: categories.map(c => c.total),
        backgroundColor: COLORS,
        hoverBackgroundColor: COLORS.map(c => c + 'cc'),
        borderWidth: 0,
        hoverOffset: 8,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '70%',
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0e1628',
          borderColor: 'rgba(255,255,255,0.08)',
          borderWidth: 1,
          callbacks: {
            label: ctx => ` ₹${ctx.raw.toLocaleString('en-IN')}`,
          },
        },
      },
    },
  });

  // Custom legend
  const legend = document.getElementById('donut-legend');
  if (legend) {
    legend.innerHTML = categories.map((c, i) => `
      <div class="legend-item">
        <div class="legend-dot-label">
          <div class="legend-dot" style="background:${COLORS[i]}"></div>
          <span>${c.category}</span>
        </div>
        <span class="legend-value">₹${c.total.toLocaleString('en-IN')}</span>
      </div>
    `).join('');
  }
}

/* ── Recent Transactions ────────────────────────────────────── */
function renderRecentTransactions(filterText = '') {
  const list = document.getElementById('tx-list');
  const countLabel = document.getElementById('tx-count-label');
  if (!list) return;

  let recent = getRecentExpenses(10);
  if (filterText) {
    recent = recent.filter(t =>
      t.description.toLowerCase().includes(filterText.toLowerCase()) ||
      t.category.toLowerCase().includes(filterText.toLowerCase())
    );
  }

  if (countLabel) countLabel.textContent = `${recent.length} recent entries`;

  if (recent.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon-spinner" style="color:var(--txt-secondary);">
          <svg viewBox="0 0 24 24" width="36" height="36" stroke="currentColor" stroke-width="2" fill="none"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </div>
        <h3>No transactions</h3>
        <p>${filterText ? 'No results for your search.' : 'Add your first transaction!'}</p>
      </div>
    `;
    return;
  }

  list.innerHTML = recent.map(t => `
    <div class="tx-item" role="listitem">
      <div class="tx-icon">${getCategoryIcon(t.category)}</div>
      <div class="tx-info">
        <div class="tx-description">${escHtml(t.description)}</div>
        <div class="tx-category">${escHtml(t.category)}</div>
      </div>
      <div class="tx-right">
        <div class="tx-amount ${t.type}">${t.type === 'income' ? '+' : '-'}₹${t.amount.toLocaleString('en-IN')}</div>
        <div class="tx-date">${relativeDate(t.date)}</div>
      </div>
    </div>
  `).join('');
}

/* ── Budget List ────────────────────────────────────────────── */
function renderBudgetList() {
  const list = document.getElementById('budget-list');
  if (!list) return;

  const budgets = getBudgetUtilization().slice(0, 5);

  if (budgets.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon-spinner" style="color:var(--txt-secondary);">
          <svg viewBox="0 0 24 24" width="36" height="36" stroke="currentColor" stroke-width="2.5" fill="none"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
        </div>
        <h3>No budgets set</h3>
        <p>Set budget goals in Reports</p>
      </div>
    `;
    return;
  }

  list.innerHTML = budgets.map(b => {
    const cls = b.percent >= 90 ? 'over' : b.percent >= 70 ? 'warning' : 'safe';
    return `
      <div class="budget-item">
        <div class="budget-item-header">
          <div class="budget-item-label">
            <span>${getCategoryIcon(b.category)}</span>
            <span>${escHtml(b.category)}</span>
          </div>
          <div class="budget-item-amounts">₹${b.spent.toLocaleString('en-IN')} / ₹${b.limit.toLocaleString('en-IN')}</div>
        </div>
        <div class="budget-bar">
          <div class="budget-bar-fill ${cls}" style="width:${b.percent}%"></div>
        </div>
      </div>
    `;
  }).join('');
}

/* ── Search ─────────────────────────────────────────────────── */
function initSearch() {
  const input = document.getElementById('dash-search');
  if (!input) return;
  const handler = debounce((e) => renderRecentTransactions(e.target.value), 250);
  input.addEventListener('input', handler);
}

/* ── Profile & Settings Modals ──────────────────────────────── */
function showProfileModal() {
  const user = getUser();
  document.getElementById('profile-name').value  = user.name || '';
  document.getElementById('profile-email').value = user.email || '';
  document.getElementById('profile-modal').classList.add('open');
}

async function saveProfile() {
  const name  = document.getElementById('profile-name').value.trim();
  const email = document.getElementById('profile-email').value.trim();
  if (!name || !email) { showToast('Please fill in all fields', 'error'); return; }

  try {
    const res = await fetchWithAuth('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify({ name, email }),
    });
    if (res) {
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('fem_user', JSON.stringify(data.user));
        populateSidebarUser();
        document.getElementById('profile-modal').classList.remove('open');
        showToast('Profile updated!', 'success');
      } else {
        showToast(data.error || 'Failed to update profile', 'error');
      }
    }
  } catch (err) {
    console.error(err);
    showToast('Failed to update profile on server', 'error');
  }
}

function showSettingsModal() {
  const user = getUser();
  const sel = document.getElementById('setting-currency');
  if (sel && user.currency) sel.value = user.currency;
  document.getElementById('settings-modal').classList.add('open');
}

async function saveSettings() {
  const currency = document.getElementById('setting-currency').value;
  try {
    const res = await fetchWithAuth('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify({ currency }),
    });
    if (res) {
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('fem_user', JSON.stringify(data.user));
        document.getElementById('settings-modal').classList.remove('open');
        showToast('Settings saved!', 'success');
        loadStats();
      } else {
        showToast(data.error || 'Failed to save settings', 'error');
      }
    }
  } catch (err) {
    console.error(err);
    showToast('Failed to save settings on server', 'error');
  }
}

function initModals() {
  ['profile-modal', 'settings-modal'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', e => { if (e.target === el) el.classList.remove('open'); });
  });
}

/* ── Helpers ────────────────────────────────────────────────── */
function escHtml(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}
