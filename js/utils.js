/* ============================================================
   Shared Utility Functions
   Used across all pages
   ============================================================ */

/* ── Currency Formatting ────────────────────────────────────── */
function formatCurrency(amount, currency = '₹') {
  if (amount >= 100000) {
    return `${currency}${(amount / 100000).toFixed(2)}L`;
  }
  if (amount >= 1000) {
    return `${currency}${amount.toLocaleString('en-IN')}`;
  }
  return `${currency}${amount.toFixed(2)}`;
}

/* ── Date Formatting ────────────────────────────────────────── */
function formatDate(dateStr, style = 'medium') {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  const opts = {
    short:  { day: '2-digit', month: 'short' },
    medium: { day: '2-digit', month: 'short', year: 'numeric' },
    long:   { weekday: 'short', day: '2-digit', month: 'long', year: 'numeric' },
  };
  return d.toLocaleDateString('en-IN', opts[style] || opts.medium);
}

function relativeDate(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now - d;
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7)  return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return formatDate(dateStr, 'short');
}

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

/* ── Toast Notifications ────────────────────────────────────── */
function showToast(message, type = 'info', duration = 3500) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = {
    success: `<svg class="toast-svg" style="color:var(--clr-green);" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
    error: `<svg class="toast-svg" style="color:var(--clr-red);" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
    info: `<svg class="toast-svg" style="color:var(--clr-teal);" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
    warning: `<svg class="toast-svg" style="color:var(--clr-amber);" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`
  };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.info}</span>
    <span class="toast-msg">${message}</span>
    <button class="toast-close" onclick="removeToast(this.parentElement)">✕</button>
  `;
  container.appendChild(toast);

  setTimeout(() => removeToast(toast), duration);
  return toast;
}

function removeToast(el) {
  if (!el) return;
  el.classList.add('removing');
  el.addEventListener('animationend', () => el.remove(), { once: true });
}

/* ── Mobile sidebar toggle ──────────────────────────────────── */
function initMobileMenu() {
  const toggle = document.getElementById('menu-toggle');
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.getElementById('sidebar-overlay');

  if (toggle && sidebar) {
    toggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      if (overlay) overlay.classList.toggle('visible');
    });
  }
  if (overlay) {
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('visible');
    });
  }
}

/* ── Populate Sidebar User Info ─────────────────────────────── */
function populateSidebarUser() {
  const user = typeof getUser === 'function' ? getUser() : null;
  if (!user) return;

  const nameEls = document.querySelectorAll('[data-user-name]');
  const roleEls = document.querySelectorAll('[data-user-role]');
  const initEls = document.querySelectorAll('[data-user-initials]');
  nameEls.forEach(el => el.textContent = user.name);
  roleEls.forEach(el => el.textContent = user.role);
  initEls.forEach(el => el.textContent = user.initials);
}

/* ── Category Icon Map ──────────────────────────────────────── */
const CATEGORY_ICONS = {
  'Food & Dining':  `<svg class="cat-svg" style="color:var(--clr-teal);" viewBox="0 0 24 24"><path d="M4 3v7a6 6 0 0 0 4 5.65v5.35a1 1 0 0 0 2 0v-5.35A6 6 0 0 0 14 10V3M8 3v4M12 3v4M20 3v18h-2V3z"/></svg>`,
  'Transportation': `<svg class="cat-svg" style="color:var(--clr-indigo);" viewBox="0 0 24 24"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M13 17h2M9 17h4"/></svg>`,
  'Entertainment':  `<svg class="cat-svg" style="color:var(--clr-pink);" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>`,
  'Shopping':       `<svg class="cat-svg" style="color:var(--clr-amber);" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
  'Healthcare':     `<svg class="cat-svg" style="color:var(--clr-red);" viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`,
  'Utilities':      `<svg class="cat-svg" style="color:var(--clr-teal);" viewBox="0 0 24 24"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1 .3 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/></svg>`,
  'Rent':           `<svg class="cat-svg" style="color:var(--clr-violet);" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  'Education':      `<svg class="cat-svg" style="color:var(--clr-pink);" viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
  'Salary':         `<svg class="cat-svg" style="color:var(--clr-green);" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
  'Freelance':      `<svg class="cat-svg" style="color:var(--clr-indigo);" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
  'Investments':    `<svg class="cat-svg" style="color:var(--clr-violet);" viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`,
  'Other':          `<svg class="cat-svg" style="color:var(--clr-amber);" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v12M9 9h4.5a1.5 1.5 0 0 1 0 3H10.5a1.5 1.5 0 0 0 0 3H15"/></svg>`,
};

function getCategoryIcon(category) {
  return CATEGORY_ICONS[category] || CATEGORY_ICONS['Other'];
}

/* ── Number Animations ──────────────────────────────────────── */
function animateNumber(el, targetValue, duration = 1000, prefix = '₹') {
  const start = 0;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(start + (targetValue - start) * eased);
    el.textContent = prefix + current.toLocaleString('en-IN');
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = prefix + targetValue.toLocaleString('en-IN');
  }

  requestAnimationFrame(update);
}

const API_URL = window.location.origin.startsWith('file://') || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api'
  : '/api';

async function fetchWithAuth(endpoint, options = {}) {
  const auth = localStorage.getItem('fem_auth');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (auth) {
    headers['Authorization'] = `Bearer ${auth}`;
  }
  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers
    });
    if (res.status === 401) {
      localStorage.removeItem('fem_auth');
      window.location.href = 'login.html';
      return null;
    }
    return res;
  } catch (err) {
    console.error('API request failed:', err);
    throw err;
  }
}

/* ── Logout ─────────────────────────────────────────────────── */
function logout() {
  localStorage.removeItem('fem_auth');
  window.location.href = 'login.html';
}

/* ── Auth Guard ─────────────────────────────────────────────── */
function requireAuth() {
  const auth = localStorage.getItem('fem_auth');
  if (!auth) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

/* ── Debounce ───────────────────────────────────────────────── */
function debounce(fn, delay = 300) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/* ── DOM Ready ──────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  populateSidebarUser();
});
