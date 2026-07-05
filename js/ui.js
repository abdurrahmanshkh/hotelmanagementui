/* ===================================================================
   ui.js — Toast notifications, modals, loading & empty states
   =================================================================== */

/* ── Toast System ─────────────────────────────────────────────────── */

function _getToastContainer() {
  let c = document.getElementById('toastContainer');
  if (!c) {
    c = document.createElement('div');
    c.id = 'toastContainer';
    c.setAttribute('aria-live', 'polite');
    document.body.appendChild(c);
  }
  return c;
}

function showToast(message, type = 'info', duration = 3500) {
  const container = _getToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let icon = 'info';
  if (type === 'success') icon = 'check_circle';
  if (type === 'error') icon = 'error';
  if (type === 'warning') icon = 'warning';

  toast.innerHTML = `
    <span class="material-symbols-outlined toast-icon">${icon}</span>
    <span style="flex-grow:1; font-size: 0.95rem;">${message}</span>
    <button style="background:none;border:none;cursor:pointer;color:var(--text-light);padding:0;" onclick="this.parentElement.remove()">
      <span class="material-symbols-outlined" style="font-size:20px;">close</span>
    </button>`;
  
  container.appendChild(toast);
  setTimeout(() => { if (toast.parentNode) toast.remove(); }, duration);
}

/* ── Modal Helpers ────────────────────────────────────────────────── */

function openModal(id) {
  const overlay = document.getElementById(id);
  if (!overlay) return;
  overlay.classList.add('active');
}

function closeModal(id) {
  const overlay = document.getElementById(id);
  if (!overlay) return;
  overlay.classList.remove('active');
}

document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('active');
  }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
  }
});

/* ── Button Loading State ─────────────────────────────────────────── */

function setButtonLoading(btn, text = 'Processing…') {
  btn.dataset.originalText = btn.innerHTML;
  btn.innerHTML = `<span class="material-symbols-outlined" style="animation: pulse 1s infinite;">sync</span> ${text}`;
  btn.disabled = true;
  btn.style.opacity = '0.7';
}
function clearButtonLoading(btn) {
  btn.innerHTML = btn.dataset.originalText || 'Submit';
  btn.disabled = false;
  btn.style.opacity = '1';
}

/* ── Empty & Loading Skeletons ────────────────────────────────────── */

function showEmptyState(container, icon, heading, message, btnHtml = '') {
  // If a string (like a single emoji) is passed, change it to material symbol if it's text
  let iconHtml = icon.length > 2 ? `<span class="material-symbols-outlined">${icon}</span>` : `<span style="font-size:1.5em">${icon}</span>`;
  if (icon === '🔍') iconHtml = `<span class="material-symbols-outlined">search_off</span>`;
  if (icon === '🏨') iconHtml = `<span class="material-symbols-outlined">location_city</span>`;

  container.innerHTML = `
    <div class="empty-state card w-100" style="display:flex; flex-direction:column; align-items:center;">
      <div class="empty-state-icon text-muted mb-sm">${iconHtml}</div>
      <h3 class="mb-xs">${heading}</h3>
      <p class="text-muted mt-sm mb-lg max-w-sm mx-auto">${message}</p>
      ${btnHtml}
    </div>`;
}

function showLoadingSkeleton(container, count = 3) {
  let html = '<div class="room-grid">';
  for (let i = 0; i < count; i++) {
    html += `
    <div class="card room-card p-0" style="box-shadow:none;border:1px solid var(--border-color);background:transparent;">
      <div class="room-card-img-wrapper skeleton" style="height:220px; border-radius:var(--radius-lg) var(--radius-lg) 0 0;"></div>
      <div class="p-md">
        <div class="skeleton mb-sm" style="height:24px;width:60%;border-radius:4px;"></div>
        <div class="skeleton mb-md" style="height:16px;width:40%;border-radius:4px;"></div>
        <div class="skeleton" style="height:16px;width:80%;border-radius:4px;"></div>
      </div>
    </div>`;
  }
  html += '</div>';
  container.innerHTML = html;
}

/* ── Navbar auth-aware rendering ──────────────────────────────────── */

function updateNavbar() {
  const user = getCurrentUser();
  // Update nav-actions
  document.querySelectorAll('.nav-actions').forEach(nav => {
    if (user) {
      nav.innerHTML = `
        <a href="dashboard.html" class="btn btn-primary d-none d-lg-inline-flex align-items-center gap-xs">Dashboard <span class="material-symbols-outlined" style="font-size:18px;">arrow_forward</span></a>
        <button class="btn btn-ghost btn-icon" id="logoutBtn" title="Logout"><span class="material-symbols-outlined">logout</span></button>
        <button class="hamburger"><span class="material-symbols-outlined">menu</span></button>`;
      const logoutBtn = nav.querySelector('#logoutBtn');
      if (logoutBtn) logoutBtn.addEventListener('click', logout);
    } else {
      nav.innerHTML = `
        <a href="login.html" class="btn btn-ghost">Sign In</a>
        <a href="rooms.html" class="btn btn-primary">Book Now</a>
        <button class="hamburger"><span class="material-symbols-outlined">menu</span></button>`;
    }
  });

  // Highlight active link
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.remove('active');
    if (a.getAttribute('href') === path) a.classList.add('active');
  });
}
