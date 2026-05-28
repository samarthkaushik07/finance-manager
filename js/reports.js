/* ============================================================
   Reports & Analytics JavaScript
   Author: Yuvika (Member 3)
   ============================================================ */

let lineChart  = null;
let hbarChart  = null;
let activePeriod = '6-months';

/* ── Init ───────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth()) return;
  Chart.defaults.color = '#8892aa';
  Chart.defaults.font.family = 'Inter, sans-serif';

  await syncAppData();
  loadReports();
  initModals();

  // Scroll to budgets if hash present
  if (window.location.hash === '#budgets') {
    setTimeout(() => document.getElementById('budgets')?.scrollIntoView({ behavior: 'smooth' }), 300);
  }
});

/* ── Main Loader ────────────────────────────────────────────── */
function loadReports() {
  const data = getFilteredData(activePeriod);
  renderKPIs(data);
  renderLineChart(data);
  renderHBarChart();
  renderCategoryRankings();
  renderSavingsGauge(data);
  renderInsights(data);
  renderBudgetGrid();
}

function changePeriod(value) {
  activePeriod = value;
  loadReports();
}

/* ── Period Filter ──────────────────────────────────────────── */
function getFilteredData(period) {
  const all = getAllExpenses();
  const now = new Date();
  let from  = null;

  switch (period) {
    case 'this-month':
      from = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'last-month':
      from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      return all.filter(e => {
        const d = new Date(e.date);
        return d >= from && d <= lastMonthEnd;
      });
    case '3-months':
      from = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      break;
    case '6-months':
      from = new Date(now.getFullYear(), now.getMonth() - 6, 1);
      break;
    case 'all-time':
      return all;
    default:
      from = new Date(now.getFullYear(), now.getMonth() - 6, 1);
  }

  return all.filter(e => e.date && new Date(e.date) >= from);
}

/* ── KPIs ───────────────────────────────────────────────────── */
function renderKPIs(data) {
  const income  = data.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0);
  const expense = data.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0);
  const savings = income - expense;
  const rate    = income > 0 ? Math.round((savings / income) * 100) : 0;
  const cur     = getUser().currency || '₹';

  setText('kpi-income',  cur + income.toLocaleString('en-IN'));
  setText('kpi-expense', cur + expense.toLocaleString('en-IN'));
  setText('kpi-savings', cur + Math.abs(savings).toLocaleString('en-IN'));
  setText('kpi-rate',    rate + '%');

  const savEl = document.getElementById('kpi-savings');
  if (savEl) savEl.style.background = savings >= 0
    ? 'linear-gradient(135deg,#00d4aa,#4f46e5)'
    : 'linear-gradient(135deg,#ef4444,#dc2626)';
  if (savEl) {
    savEl.style.webkitBackgroundClip = 'text';
    savEl.style.webkitTextFillColor  = 'transparent';
  }
}

/* ── Line Chart ─────────────────────────────────────────────── */
function renderLineChart(data) {
  const monthsData = getLast6MonthsData();
  const ctx = document.getElementById('line-chart');
  if (!ctx) return;
  if (lineChart) lineChart.destroy();

  lineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: monthsData.map(m => m.label),
      datasets: [
        {
          label: 'Income',
          data: monthsData.map(m => m.income),
          borderColor: '#00d4aa',
          backgroundColor: 'rgba(0,212,170,0.08)',
          borderWidth: 2.5,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#00d4aa',
          pointRadius: 4,
          pointHoverRadius: 7,
        },
        {
          label: 'Expenses',
          data: monthsData.map(m => m.expense),
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239,68,68,0.06)',
          borderWidth: 2.5,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#ef4444',
          pointRadius: 4,
          pointHoverRadius: 7,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { labels: { usePointStyle: true, pointStyle: 'circle', padding: 20, font: { size: 12 } } },
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
        x: { grid: { display: false }, border: { display: false } },
        y: {
          grid: { color: 'rgba(255,255,255,0.05)' },
          border: { display: false },
          ticks: { callback: v => '₹' + (v >= 1000 ? v / 1000 + 'K' : v) },
        },
      },
    },
  });
}

/* ── Horizontal Bar Chart (Category) ────────────────────────── */
function renderHBarChart() {
  const cats = getCategoryTotals('expense').slice(0, 8);
  const ctx  = document.getElementById('hbar-chart');
  if (!ctx || cats.length === 0) return;
  if (hbarChart) hbarChart.destroy();

  const COLORS = ['#00d4aa','#4f46e5','#7c3aed','#ec4899','#f59e0b','#ef4444','#06b6d4','#22c55e'];

  hbarChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: cats.map(c => c.category),
      datasets: [{
        label: 'Spent',
        data: cats.map(c => c.total),
        backgroundColor: COLORS.slice(0, cats.length),
        borderRadius: 6,
        borderSkipped: false,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0e1628',
          borderColor: 'rgba(255,255,255,0.08)',
          borderWidth: 1,
          callbacks: { label: ctx => ` ₹${ctx.raw.toLocaleString('en-IN')}` },
        },
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.05)' },
          border: { display: false },
          ticks: { callback: v => '₹' + (v >= 1000 ? v / 1000 + 'K' : v) },
        },
        y: { grid: { display: false }, border: { display: false } },
      },
    },
  });
}

/* ── Category Rankings ──────────────────────────────────────── */
function renderCategoryRankings() {
  const cats    = getCategoryTotals('expense').slice(0, 6);
  const maxVal  = cats[0]?.total || 1;
  const list    = document.getElementById('cat-rank-list');
  if (!list) return;

  if (cats.length === 0) {
    list.innerHTML = `<div class="empty-state" style="padding:20px 0;"><p>No expense data yet</p></div>`;
    return;
  }

  list.innerHTML = cats.map((c, i) => `
    <div class="cat-rank-item">
      <div class="cat-rank-num">#${i + 1}</div>
      <div class="cat-rank-bar-wrap">
        <div class="cat-rank-label">
          <span>${getCategoryIcon(c.category)}</span>
          <span>${escHtml(c.category)}</span>
        </div>
        <div class="cat-rank-bar">
          <div class="cat-rank-fill" style="width:${Math.round((c.total / maxVal) * 100)}%"></div>
        </div>
      </div>
      <div class="cat-rank-amount">₹${c.total.toLocaleString('en-IN')}</div>
    </div>
  `).join('');
}

/* ── Savings Rate Gauge ─────────────────────────────────────── */
function renderSavingsGauge(data) {
  const income  = data.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0);
  const expense = data.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0);
  const rate    = income > 0 ? Math.max(0, Math.min(100, Math.round(((income - expense) / income) * 100))) : 0;

  // SVG circumference: 2 * PI * r = 2 * 3.14159 * 62 ≈ 389.56
  const circ   = 389.56;
  const offset = circ - (circ * rate / 100);

  const circle = document.getElementById('gauge-circle');
  const pctEl  = document.getElementById('gauge-pct');
  const descEl = document.getElementById('gauge-desc');

  if (circle) {
    // Animate with delay
    setTimeout(() => { circle.style.strokeDashoffset = offset; }, 200);
    // Change color if negative
    if (rate < 10)  circle.style.stroke = '#ef4444';
    else if (rate < 30) circle.style.stroke = '#f59e0b';
    else circle.style.stroke = 'url(#gauge-grad)';
  }
  if (pctEl) pctEl.textContent = rate + '%';

  const msgs = [
    { min: 80, text: 'Outstanding! You\'re saving over 80% — excellent financial discipline.' },
    { min: 50, text: 'Great job! More than half your income is being saved.' },
    { min: 30, text: 'Good savings rate — aim for 50%+ for financial freedom.' },
    { min: 10, text: 'Room to improve. Try reducing your biggest expense categories.' },
    { min: 0,  text: 'You\'re spending more than you earn. Review your budget goals.' },
  ];
  if (descEl) descEl.textContent = (msgs.find(m => rate >= m.min) || msgs[msgs.length - 1]).text;

  // Best month & avg
  const months = getLast6MonthsData();
  const withSavings = months.map(m => ({ ...m, savings: m.income - m.expense }));
  const best = withSavings.reduce((a, b) => b.savings > a.savings ? b : a, withSavings[0]);
  const avgExp = Math.round(months.reduce((s, m) => s + m.expense, 0) / (months.filter(m => m.expense > 0).length || 1));

  setText('best-month',   best ? `${best.label} (+₹${best.savings.toLocaleString('en-IN')})` : '—');
  setText('avg-monthly',  `₹${avgExp.toLocaleString('en-IN')}`);
}

/* ── Smart Insights ─────────────────────────────────────────── */
function renderInsights(data) {
  const container = document.getElementById('insights-grid');
  if (!container) return;

  const income   = data.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0);
  const expense  = data.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0);
  const topCats  = getCategoryTotals('expense');
  const topCat   = topCats[0];
  const budgUtil = getBudgetUtilization();
  const overBudget = budgUtil.filter(b => b.percent >= 100);

  const insights = [];

  // Insight 1: Top spender
  if (topCat) {
    const pct = income > 0 ? Math.round((topCat.total / income) * 100) : 0;
    insights.push({
      icon: getCategoryIcon(topCat.category),
      bg: 'rgba(239,68,68,0.1)',
      title: 'Top Expense Category',
      text: `${topCat.category} is your biggest spend at ₹${topCat.total.toLocaleString('en-IN')} (${pct}% of income).`,
    });
  }

  // Insight 2: Savings ratio
  const savRate = income > 0 ? Math.round(((income - expense) / income) * 100) : 0;
  insights.push({
    icon: savRate >= 30
      ? '<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>'
      : savRate >= 10
      ? '<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"/><line x1="8" y1="15" x2="16" y2="15"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>'
      : '<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>',
    bg: savRate >= 30 ? 'rgba(34,197,94,0.1)' : savRate >= 10 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
    title: 'Savings Health',
    text: savRate >= 30
      ? `Excellent! You're saving ${savRate}% of your income. Keep it up!`
      : savRate >= 10
      ? `You're saving ${savRate}%. Aim for 30% to build a solid emergency fund.`
      : `Only ${savRate}% savings rate. Consider cutting non-essential expenses.`,
  });

  // Insight 3: Over-budget alert
  if (overBudget.length > 0) {
    insights.push({
      icon: '<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2.5" fill="none"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
      bg: 'rgba(245,158,11,0.1)',
      title: `${overBudget.length} Budget${overBudget.length > 1 ? 's' : ''} Exceeded`,
      text: `You've gone over your limit in: ${overBudget.map(b => b.category).join(', ')}.`,
    });
  } else if (budgUtil.length > 0) {
    const nearBudget = budgUtil.filter(b => b.percent >= 70 && b.percent < 100);
    if (nearBudget.length > 0) {
      insights.push({
        icon: '<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2.5" fill="none"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
        bg: 'rgba(79,70,229,0.1)',
        title: 'Approaching Budget Limits',
        text: `${nearBudget.map(b => b.category).join(', ')} ${nearBudget.length === 1 ? 'is' : 'are'} above 70% of the limit.`,
      });
    } else {
      insights.push({
        icon: '<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2.5" fill="none"><polyline points="20 6 9 17 4 12"/></svg>',
        bg: 'rgba(34,197,94,0.1)',
        title: 'All Budgets On Track',
        text: 'Great discipline! All your budget goals are within their limits.',
      });
    }
  }

  // Insight 4: Transaction frequency
  const txCount = data.length;
  insights.push({
    icon: '<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2.5" fill="none"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
    bg: 'rgba(0,212,170,0.1)',
    title: 'Transaction Activity',
    text: `You have ${txCount} transaction${txCount !== 1 ? 's' : ''} in this period. ${txCount > 20 ? 'Very active!' : 'Keep logging for better insights.'}`,
  });

  // Insight 5: Income diversity
  const incomeSources = [...new Set(data.filter(e => e.type === 'income').map(e => e.category))];
  insights.push({
    icon: '<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2.5" fill="none"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
    bg: 'rgba(124,58,237,0.1)',
    title: 'Income Sources',
    text: incomeSources.length > 1
      ? `You have ${incomeSources.length} income sources: ${incomeSources.join(', ')}. Great diversification!`
      : incomeSources.length === 1
      ? `Single income source: ${incomeSources[0]}. Consider diversifying.`
      : 'No income recorded yet for this period.',
  });

  // Insight 6: Biggest single expense
  const biggestExpense = data
    .filter(e => e.type === 'expense')
    .sort((a, b) => b.amount - a.amount)[0];
  if (biggestExpense) {
    insights.push({
      icon: '<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2.5" fill="none"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1 .3 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/></svg>',
      bg: 'rgba(245,158,11,0.1)',
      title: 'Largest Single Expense',
      text: `"${biggestExpense.description}" at ₹${biggestExpense.amount.toLocaleString('en-IN')} on ${formatDate(biggestExpense.date, 'short')}.`,
    });
  }

  container.innerHTML = insights.map(ins => `
    <div class="insight-card">
      <div class="insight-icon-wrap" style="background:${ins.bg};">${ins.icon}</div>
      <div class="insight-text">
        <h4>${escHtml(ins.title)}</h4>
        <p>${escHtml(ins.text)}</p>
      </div>
    </div>
  `).join('');
}

/* ── Budget Grid ─────────────────────────────────────────────── */
function renderBudgetGrid() {
  const budgets  = getBudgetUtilization();
  const grid     = document.getElementById('budget-grid');
  if (!grid) return;

  const addCard = `
    <div class="budget-add-card" onclick="openBudgetModal()" role="button" aria-label="Add budget goal">
      <span class="add-icon">＋</span>
      <span>Add Budget Goal</span>
    </div>
  `;

  if (budgets.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1; padding:40px 0;">
        <div class="empty-icon">🎯</div>
        <h3>No budget goals yet</h3>
        <p>Set monthly spending limits for your categories.</p>
        <button class="btn btn-primary mt-16" onclick="openBudgetModal()">＋ Add First Budget</button>
      </div>
    ` + addCard;
    return;
  }

  grid.innerHTML = budgets.map(b => {
    const cls       = b.percent >= 100 ? 'over' : b.percent >= 70 ? 'warning' : 'safe';
    const pctClass  = b.percent >= 100 ? 'pct-over' : b.percent >= 70 ? 'pct-warning' : 'pct-safe';
    const fillClass = b.percent >= 100 ? 'fill-over' : b.percent >= 70 ? 'fill-warning' : 'fill-safe';
    const remaining = b.limit - b.spent;

    return `
      <div class="budget-card">
        <div class="budget-card-header">
          <div class="budget-card-title">
            <span>${getCategoryIcon(b.category)}</span>
            <span>${escHtml(b.category)}</span>
          </div>
          <div style="display:flex; gap:6px;">
            <button class="budget-edit-btn" onclick="openEditBudget('${b.id}')" title="Edit"><svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z"/></svg></button>
            <button class="budget-edit-btn" onclick="openDeleteBudget('${b.id}')" title="Remove" style="color:var(--clr-red);"><svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg></button>
          </div>
        </div>
        <div class="budget-amounts">
          <span>Spent: <span class="budget-spent-val">₹${b.spent.toLocaleString('en-IN')}</span></span>
          <span>Limit: ₹${b.limit.toLocaleString('en-IN')}</span>
        </div>
        <div class="budget-progress-bar">
          <div class="budget-progress-fill ${fillClass}" style="width:${b.percent}%"></div>
        </div>
        <div class="budget-footer">
          <span class="budget-remaining">
            ${remaining >= 0
              ? `₹${remaining.toLocaleString('en-IN')} left`
              : `₹${Math.abs(remaining).toLocaleString('en-IN')} over`}
          </span>
          <span class="budget-pct ${pctClass}">${b.percent}%</span>
        </div>
      </div>
    `;
  }).join('') + addCard;
}

/* ── Budget Modal (Add/Edit) ─────────────────────────────────── */
function openBudgetModal() {
  document.getElementById('budget-edit-id').value   = '';
  document.getElementById('budget-cat-select').value = '';
  document.getElementById('budget-limit').value      = '';
  document.getElementById('budget-modal-title').textContent = 'Add Budget Goal';
  document.getElementById('budget-modal').classList.add('open');
  setTimeout(() => document.getElementById('budget-limit').focus(), 100);
}

function openEditBudget(id) {
  const b = getAllBudgets().find(b => b.id === id);
  if (!b) return;
  document.getElementById('budget-edit-id').value    = b.id;
  document.getElementById('budget-cat-select').value = b.category;
  document.getElementById('budget-limit').value      = b.limit;
  document.getElementById('budget-modal-title').textContent = 'Edit Budget Goal';
  document.getElementById('budget-modal').classList.add('open');
}

async function saveBudget() {
  const id       = document.getElementById('budget-edit-id').value;
  const category = document.getElementById('budget-cat-select').value;
  const limit    = parseFloat(document.getElementById('budget-limit').value);
  const icon     = getCategoryIcon(category);

  if (!category) { showToast('Please select a category', 'error'); return; }
  if (!limit || limit <= 0) { showToast('Please enter a valid limit', 'error'); return; }

  if (id) {
    await updateBudget(id, { category, limit, icon });
    showToast('Budget updated!', 'success');
  } else {
    // Check for duplicate
    const exists = getAllBudgets().find(b => b.category === category);
    if (exists) {
      showToast('A budget for this category already exists. Edit it instead.', 'warning');
      return;
    }
    await addBudget({ category, limit, icon });
    showToast('Budget goal added!', 'success');
  }

  closeModal('budget-modal');
  renderBudgetGrid();
  renderInsights(getFilteredData(activePeriod));
}

function openDeleteBudget(id) {
  document.getElementById('del-budget-id').value = id;
  document.getElementById('del-budget-modal').classList.add('open');
}

async function confirmDeleteBudget() {
  const id = document.getElementById('del-budget-id').value;
  await deleteBudget(id);
  closeModal('del-budget-modal');
  showToast('Budget removed', 'info');
  renderBudgetGrid();
}

/* ── Print ───────────────────────────────────────────────────── */
function printReport() {
  window.print();
}

/* ── Modal Helpers ───────────────────────────────────────────── */
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

function initModals() {
  ['budget-modal', 'del-budget-modal'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', e => { if (e.target === el) closeModal(id); });
  });
}

/* ── Helpers ────────────────────────────────────────────────── */
function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function escHtml(str) {
  const d = document.createElement('div');
  d.textContent = str || '';
  return d.innerHTML;
}
