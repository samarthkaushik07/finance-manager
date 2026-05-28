/* ============================================================
   Expenses Page JavaScript — Full CRUD
   Author: Simran (Member 2)
   ============================================================ */

/* ── State ──────────────────────────────────────────────────── */
const PAGE_SIZE   = 10;
let currentPage   = 1;
let editingId     = null;
let filteredData  = [];

const ALL_CATEGORIES = {
  income:  ['Salary', 'Freelance', 'Investments', 'Other'],
  expense: ['Food & Dining', 'Transportation', 'Entertainment', 'Shopping', 'Healthcare', 'Utilities', 'Rent', 'Education', 'Other'],
};

/* ── Init ───────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth()) return;
  await syncAppData();

  // Pre-fill type from URL param e.g. expenses.html?type=income
  const urlType = new URLSearchParams(window.location.search).get('type');
  if (urlType === 'income' || urlType === 'expense') {
    openAddModal(urlType);
  }

  buildCategoryFilter();
  loadTable();
  loadSummary();
  attachFilterListeners();
});

/* ── Summary Pills ──────────────────────────────────────────── */
function loadSummary() {
  const all = getAllExpenses();
  const income  = all.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0);
  const expense = all.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0);
  const net = income - expense;
  const cur = getUser().currency || '₹';

  document.getElementById('sum-income').textContent  = cur + income.toLocaleString('en-IN');
  document.getElementById('sum-expense').textContent = cur + expense.toLocaleString('en-IN');
  const netEl = document.getElementById('sum-net');
  netEl.textContent = cur + Math.abs(net).toLocaleString('en-IN');
  netEl.style.color = net >= 0 ? 'var(--clr-teal)' : 'var(--clr-red)';
}

/* ── Filter Setup ───────────────────────────────────────────── */
function buildCategoryFilter() {
  const sel = document.getElementById('filter-category');
  const cats = [...new Set([...ALL_CATEGORIES.income, ...ALL_CATEGORIES.expense])].sort();
  cats.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c; opt.textContent = c;
    sel.appendChild(opt);
  });
}

function attachFilterListeners() {
  const ids = ['search-input', 'filter-type', 'filter-category', 'filter-sort', 'filter-date-from', 'filter-date-to'];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', () => { currentPage = 1; loadTable(); });
  });
}

function clearFilters() {
  document.getElementById('search-input').value   = '';
  document.getElementById('filter-type').value    = '';
  document.getElementById('filter-category').value= '';
  document.getElementById('filter-sort').value    = 'date-desc';
  document.getElementById('filter-date-from').value = '';
  document.getElementById('filter-date-to').value   = '';
  currentPage = 1;
  loadTable();
  showToast('Filters cleared', 'info');
}

/* ── Load & Render Table ─────────────────────────────────────── */
function loadTable() {
  const search    = document.getElementById('search-input').value.toLowerCase();
  const typeF     = document.getElementById('filter-type').value;
  const catF      = document.getElementById('filter-category').value;
  const sortF     = document.getElementById('filter-sort').value;
  const dateFrom  = document.getElementById('filter-date-from').value;
  const dateTo    = document.getElementById('filter-date-to').value;

  let data = getAllExpenses();

  // Filter
  if (search) data = data.filter(e =>
    e.description.toLowerCase().includes(search) ||
    e.category.toLowerCase().includes(search) ||
    String(e.amount).includes(search)
  );
  if (typeF) data = data.filter(e => e.type === typeF);
  if (catF)  data = data.filter(e => e.category === catF);
  if (dateFrom) data = data.filter(e => e.date >= dateFrom);
  if (dateTo)   data = data.filter(e => e.date <= dateTo);

  // Sort
  const [sortKey, sortDir] = sortF.split('-');
  data.sort((a, b) => {
    let valA = sortKey === 'date' ? new Date(a.date) : a.amount;
    let valB = sortKey === 'date' ? new Date(b.date) : b.amount;
    return sortDir === 'asc' ? valA - valB : valB - valA;
  });

  filteredData = data;
  renderTable();
  renderPagination();

  const totalStr = typeF || catF || search || dateFrom || dateTo
    ? `${data.length} filtered results`
    : `${data.length} transactions`;
  document.getElementById('table-count').textContent = totalStr;
  document.getElementById('table-title').textContent = typeF
    ? (typeF === 'income' ? 'Income' : 'Expenses')
    : 'All Transactions';
}

function renderTable() {
  const tbody = document.getElementById('expense-tbody');
  const start = (currentPage - 1) * PAGE_SIZE;
  const slice = filteredData.slice(start, start + PAGE_SIZE);

  if (slice.length === 0) {
    tbody.innerHTML = `
      <tr><td colspan="6">
        <div class="empty-state">
          <div class="empty-icon-spinner" style="color:var(--txt-secondary);">
            <svg viewBox="0 0 24 24" width="36" height="36" stroke="currentColor" stroke-width="2" fill="none"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
          <h3>No transactions found</h3>
          <p>Try adjusting your filters or add a new transaction.</p>
          <button class="btn btn-primary mt-16" onclick="openAddModal()">Add Transaction</button>
        </div>
      </td></tr>
    `;
    return;
  }

  tbody.innerHTML = slice.map(t => `
    <tr>
      <td>
        <div style="display:flex; align-items:center; gap:10px;">
          <span style="display:inline-flex; align-items:center;">${getCategoryIcon(t.category)}</span>
          <div>
            <div style="font-weight:600; font-size:14px;">${escHtml(t.description)}</div>
            ${t.note ? `<div style="font-size:11px; color:var(--txt-secondary);">${escHtml(t.note)}</div>` : ''}
          </div>
        </div>
      </td>
      <td>
        <span class="badge ${t.type === 'income' ? 'badge-income' : 'badge-expense'}">
          ${escHtml(t.category)}
        </span>
      </td>
      <td>
        <span class="type-dot ${t.type}"></span>
        <span style="font-size:13px; font-weight:500; text-transform:capitalize;">${t.type}</span>
      </td>
      <td style="color:var(--txt-secondary); font-size:13px;">${formatDate(t.date)}</td>
      <td class="amount-cell ${t.type === 'income' ? 'text-income' : 'text-expense'}">
        ${t.type === 'income' ? '+' : '−'}₹${t.amount.toLocaleString('en-IN')}
      </td>
      <td>
        <div class="action-btns">
          <button class="action-icon-btn edit-btn" onclick="openEditModal('${t.id}')" title="Edit" aria-label="Edit transaction"><svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z"/></svg></button>
          <button class="action-icon-btn del-btn"  onclick="openDeleteModal('${t.id}')" title="Delete" aria-label="Delete transaction"><svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg></button>
        </div>
      </td>
    </tr>
  `).join('');
}

/* ── Pagination ─────────────────────────────────────────────── */
function renderPagination() {
  const total     = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const start      = (currentPage - 1) * PAGE_SIZE + 1;
  const end        = Math.min(currentPage * PAGE_SIZE, total);

  document.getElementById('pagination-info').textContent =
    total === 0 ? 'No results' : `Showing ${start}–${end} of ${total}`;

  const container = document.getElementById('page-btns');
  container.innerHTML = '';

  const prevBtn = document.createElement('button');
  prevBtn.className = 'page-btn';
  prevBtn.textContent = '‹';
  prevBtn.disabled = currentPage === 1;
  prevBtn.onclick = () => { currentPage--; renderTable(); renderPagination(); };
  container.appendChild(prevBtn);

  for (let i = 1; i <= totalPages; i++) {
    if (totalPages > 7 && i > 2 && i < totalPages - 1 && Math.abs(i - currentPage) > 1) {
      if (i === 3 || i === totalPages - 2) {
        const dots = document.createElement('button');
        dots.className = 'page-btn'; dots.textContent = '…'; dots.disabled = true;
        container.appendChild(dots);
      }
      continue;
    }
    const btn = document.createElement('button');
    btn.className = 'page-btn' + (i === currentPage ? ' active' : '');
    btn.textContent = i;
    btn.onclick = () => { currentPage = i; renderTable(); renderPagination(); };
    container.appendChild(btn);
  }

  const nextBtn = document.createElement('button');
  nextBtn.className = 'page-btn';
  nextBtn.textContent = '›';
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.onclick = () => { currentPage++; renderTable(); renderPagination(); };
  container.appendChild(nextBtn);
}

/* ── Modal: Open Add ─────────────────────────────────────────── */
function openAddModal(forceType = null) {
  editingId = null;
  document.getElementById('modal-title').textContent = 'Add Transaction';
  document.getElementById('modal-save-btn').textContent = 'Save Transaction';
  document.getElementById('modal-id').value       = '';
  document.getElementById('modal-desc').value     = '';
  document.getElementById('modal-amount').value   = '';
  document.getElementById('modal-date').value     = todayISO();
  document.getElementById('modal-note').value     = '';
  document.getElementById('modal-category').value = '';

  setType(forceType || 'expense');
  document.getElementById('tx-modal').classList.add('open');
  setTimeout(() => document.getElementById('modal-desc').focus(), 100);
}

/* ── Modal: Open Edit ────────────────────────────────────────── */
function openEditModal(id) {
  const tx = getExpenseById(id);
  if (!tx) { showToast('Transaction not found', 'error'); return; }

  editingId = id;
  document.getElementById('modal-title').textContent = 'Edit Transaction';
  document.getElementById('modal-save-btn').textContent = 'Update Transaction';
  document.getElementById('modal-id').value       = tx.id;
  document.getElementById('modal-desc').value     = tx.description;
  document.getElementById('modal-amount').value   = tx.amount;
  document.getElementById('modal-date').value     = tx.date;
  document.getElementById('modal-note').value     = tx.note || '';

  setType(tx.type);
  setTimeout(() => selectCategory(tx.category), 10);
  document.getElementById('tx-modal').classList.add('open');
}

/* ── Modal: Close ────────────────────────────────────────────── */
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

/* Close on overlay click */
document.addEventListener('DOMContentLoaded', () => {
  ['tx-modal', 'delete-modal'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', e => { if (e.target === el) closeModal(id); });
  });
});

/* ── Type Toggle ─────────────────────────────────────────────── */
function setType(type) {
  document.getElementById('modal-type').value = type;
  const incBtn = document.getElementById('type-income');
  const expBtn = document.getElementById('type-expense');
  incBtn.className = 'type-toggle-btn' + (type === 'income'  ? ' active-income'  : '');
  expBtn.className = 'type-toggle-btn' + (type === 'expense' ? ' active-expense' : '');
  buildCategoryPicker(type);
}

/* ── Category Picker ─────────────────────────────────────────── */
function buildCategoryPicker(type) {
  const cats = ALL_CATEGORIES[type] || ALL_CATEGORIES.expense;
  const container = document.getElementById('category-picker');
  container.innerHTML = cats.map(c => `
    <button type="button" class="cat-pill" data-cat="${c}" onclick="selectCategory('${c}')">
      <span class="cat-icon">${getCategoryIcon(c)}</span>
      <span>${c}</span>
    </button>
  `).join('');
  document.getElementById('modal-category').value = '';
}

function selectCategory(cat) {
  document.getElementById('modal-category').value = cat;
  document.querySelectorAll('.cat-pill').forEach(p => {
    p.classList.toggle('selected', p.dataset.cat === cat);
  });
}

/* ── Save Transaction ────────────────────────────────────────── */
async function saveTransaction() {
  const desc     = document.getElementById('modal-desc').value.trim();
  const amount   = parseFloat(document.getElementById('modal-amount').value);
  const date     = document.getElementById('modal-date').value;
  const type     = document.getElementById('modal-type').value;
  const category = document.getElementById('modal-category').value;
  const note     = document.getElementById('modal-note').value.trim();

  // Validation
  if (!desc)           { showToast('Please enter a description', 'error'); return; }
  if (!amount || amount <= 0) { showToast('Please enter a valid amount', 'error'); return; }
  if (!date)           { showToast('Please choose a date', 'error'); return; }
  if (!category)       { showToast('Please select a category', 'error'); return; }

  const payload = {
    description: desc,
    amount,
    date,
    type,
    category,
    note,
    icon: getCategoryIcon(category),
  };

  if (editingId) {
    await updateExpense(editingId, payload);
    showToast('Transaction updated!', 'success');
  } else {
    await addExpense(payload);
    showToast('Transaction added!', 'success');
  }

  closeModal('tx-modal');
  loadTable();
  loadSummary();
  currentPage = 1;
}

/* ── Delete Flow ─────────────────────────────────────────────── */
function openDeleteModal(id) {
  document.getElementById('delete-id').value = id;
  document.getElementById('delete-modal').classList.add('open');
}

async function confirmDelete() {
  const id = document.getElementById('delete-id').value;
  await deleteExpense(id);
  closeModal('delete-modal');
  showToast('Transaction deleted', 'info');
  if (filteredData.length % PAGE_SIZE === 1 && currentPage > 1) currentPage--;
  loadTable();
  loadSummary();
}

/* ── CSV Export ──────────────────────────────────────────────── */
function exportCSV() {
  const headers = ['Description', 'Category', 'Type', 'Date', 'Amount', 'Note'];
  const rows = filteredData.map(t => [
    `"${t.description.replace(/"/g, '""')}"`,
    `"${t.category}"`,
    t.type,
    t.date,
    t.amount,
    `"${(t.note || '').replace(/"/g, '""')}"`,
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `transactions-${todayISO()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
  showToast(`Exported ${filteredData.length} transactions`, 'success');
}

/* ── Helpers ────────────────────────────────────────────────── */
function escHtml(str) {
  const d = document.createElement('div');
  d.textContent = str || '';
  return d.innerHTML;
}
