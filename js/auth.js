/* ============================================================
   Auth Page JavaScript
   Author: Samarth Kaushik (Team Lead)
   ============================================================ */

/* ── On Load ────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  // If already logged in, go to dashboard
  if (localStorage.getItem('fem_auth')) {
    window.location.href = 'dashboard.html';
    return;
  }
});

/* ── Tab Switching ──────────────────────────────────────────── */
function switchTab(tab) {
  const loginPanel    = document.getElementById('panel-login');
  const registerPanel = document.getElementById('panel-register');
  const tabLogin      = document.getElementById('tab-login');
  const tabRegister   = document.getElementById('tab-register');
  const title         = document.getElementById('form-title');
  const subtitle      = document.getElementById('form-subtitle');

  if (tab === 'login') {
    loginPanel.classList.remove('hidden');
    registerPanel.classList.add('hidden');
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    tabLogin.setAttribute('aria-selected', 'true');
    tabRegister.setAttribute('aria-selected', 'false');
    title.textContent = 'Welcome Back';
    subtitle.textContent = 'Sign in to your account to continue';
  } else {
    loginPanel.classList.add('hidden');
    registerPanel.classList.remove('hidden');
    tabLogin.classList.remove('active');
    tabRegister.classList.add('active');
    tabLogin.setAttribute('aria-selected', 'false');
    tabRegister.setAttribute('aria-selected', 'true');
    title.textContent = 'Create Account';
    subtitle.textContent = 'Join GraphicCodeHackers team tracker';
  }
}

/* ── Password Visibility Toggle ─────────────────────────────── */
function togglePassword(inputId, toggleEl) {
  const input = document.getElementById(inputId);
  if (input.type === 'password') {
    input.type = 'text';
    toggleEl.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" style="display:inline-block; vertical-align:middle;"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;
  } else {
    input.type = 'password';
    toggleEl.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" style="display:inline-block; vertical-align:middle;"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
  }
}

/* ── Password Strength Checker ──────────────────────────────── */
function checkStrength(value) {
  const fill  = document.getElementById('strength-fill');
  const label = document.getElementById('strength-label');
  if (!fill) return;

  let score = 0;
  if (value.length >= 8)           score++;
  if (/[A-Z]/.test(value))         score++;
  if (/[0-9]/.test(value))         score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;

  const levels = [
    { pct: '25%',  color: '#ef4444', text: 'Weak' },
    { pct: '50%',  color: '#f59e0b', text: 'Fair' },
    { pct: '75%',  color: '#06b6d4', text: 'Good' },
    { pct: '100%', color: '#22c55e', text: 'Strong' },
  ];
  const lvl = levels[score - 1] || { pct: '0%', color: '#ef4444', text: '' };
  fill.style.width      = lvl.pct;
  fill.style.background = lvl.color;
  label.textContent     = lvl.text;
  label.style.color     = lvl.color;
}

/* ── Login Handler ──────────────────────────────────────────── */
async function handleLogin(e) {
  e.preventDefault();

  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const btnText  = document.getElementById('login-btn-text');
  const spinner  = document.getElementById('login-spinner');
  const arrow    = document.getElementById('login-arrow');

  if (!email || !password) {
    showToast('Please fill in all fields', 'error');
    return;
  }
  if (!isValidEmail(email)) {
    showToast('Please enter a valid email address', 'error');
    return;
  }

  btnText.textContent = 'Signing in...';
  spinner.classList.remove('hidden');
  if (arrow) arrow.classList.add('hidden');

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (data.success) {
      localStorage.setItem('fem_auth', data.token);
      localStorage.setItem('fem_user', JSON.stringify(data.user));

      showToast(`Welcome back, ${data.user.name.split(' ')[0]}!`, 'success');
      await delay(800);
      window.location.href = 'dashboard.html';
    } else {
      btnText.textContent = 'Sign In';
      spinner.classList.add('hidden');
      if (arrow) arrow.classList.remove('hidden');
      showToast(data.error || 'Invalid email or password', 'error');
    }
  } catch (err) {
    console.error('Login error:', err);
    btnText.textContent = 'Sign In';
    spinner.classList.add('hidden');
    if (arrow) arrow.classList.remove('hidden');
    showToast('Cannot connect to server. Check if backend is running.', 'error');
  }
}

/* ── Demo Login ─────────────────────────────────────────────── */
async function loginDemo() {
  document.getElementById('login-email').value    = 'demo@financemanager.com';
  document.getElementById('login-password').value  = 'Demo@1234';
  showToast('Demo credentials filled! Logging in...', 'info');
  await delay(400);
  document.getElementById('login-form').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
}

/* ── Register Handler ───────────────────────────────────────── */
async function handleRegister(e) {
  e.preventDefault();

  const name     = document.getElementById('reg-name').value.trim();
  const email    = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  const confirm  = document.getElementById('reg-confirm').value;
  const btnText  = document.getElementById('reg-btn-text');
  const spinner  = document.getElementById('reg-spinner');

  if (!name || !email || !password || !confirm) {
    showToast('Please fill in all fields', 'error');
    return;
  }
  if (!isValidEmail(email)) {
    showToast('Please enter a valid email address', 'error');
    return;
  }
  if (password.length < 8) {
    showToast('Password must be at least 8 characters', 'error');
    return;
  }
  if (password !== confirm) {
    showToast('Passwords do not match', 'error');
    return;
  }

  btnText.textContent = 'Creating account...';
  spinner.classList.remove('hidden');

  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();

    if (data.success) {
      localStorage.setItem('fem_auth', data.token);
      localStorage.setItem('fem_user', JSON.stringify(data.user));

      showToast(`Account created! Welcome, ${name.split(' ')[0]}`, 'success');
      await delay(800);
      window.location.href = 'dashboard.html';
    } else {
      btnText.textContent = 'Create Account';
      spinner.classList.add('hidden');
      showToast(data.error || 'Registration failed', 'error');
    }
  } catch (err) {
    console.error('Register error:', err);
    btnText.textContent = 'Create Account';
    spinner.classList.add('hidden');
    showToast('Cannot connect to server. Check if backend is running.', 'error');
  }
}

/* ── Forgot Password Modal ──────────────────────────────────── */
function showForgotModal() {
  document.getElementById('forgot-modal').classList.add('open');
}
function closeForgotModal() {
  document.getElementById('forgot-modal').classList.remove('open');
}
async function sendReset() {
  const email = document.getElementById('forgot-email').value.trim();
  if (!email || !isValidEmail(email)) {
    showToast('Please enter a valid email', 'error');
    return;
  }
  showToast(`Reset link sent to ${email}`, 'success');
  closeForgotModal();
}

/* ── Helpers ────────────────────────────────────────────────── */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Unicode-safe base64 encode.
 * Plain btoa() crashes on characters outside Latin-1 (e.g. ₹, emojis).
 * This encodes to UTF-8 bytes first, then to base64.
 */
function safeEncode(obj) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(obj))));
}

function getRegisteredUsers() {
  return JSON.parse(localStorage.getItem('fem_registered_users') || '[]');
}

function saveRegisteredUser(user) {
  const users = getRegisteredUsers();
  const exists = users.findIndex(u => u.email === user.email);
  if (exists !== -1) users[exists] = user;
  else users.push(user);
  localStorage.setItem('fem_registered_users', JSON.stringify(users));
}

// Close modal on overlay click
document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('forgot-modal');
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeForgotModal();
    });
  }
});
