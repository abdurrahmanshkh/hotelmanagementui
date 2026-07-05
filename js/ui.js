/* ===================================================================
   ui.js — Toast notifications, modals, loading & empty states
   =================================================================== */

/* ── Toast System ─────────────────────────────────────────────────── */

/** Ensure a toast-container div exists in the DOM. */
function _getToastContainer() {
  let c = document.querySelector('.toast-container');
  if (!c) {
    c = document.createElement('div');
    c.className = 'toast-container';
    c.setAttribute('aria-live', 'polite');
    document.body.appendChild(c);
  }
  return c;
}

/**
 * Show a toast notification.
 * @param {string} message
 * @param {'success'|'error'|'warning'|'info'} type
 * @param {number} duration  ms before auto-dismiss (default 3500)
 */
function showToast(message, type = 'info', duration = 3500) {
  const container = _getToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${message}</span>
    <button style="margin-left:auto;background:none;border:none;cursor:pointer;font-size:1.1rem;color:inherit;">✕</button>`;
  toast.querySelector('button').addEventListener('click', () => toast.remove());
  container.appendChild(toast);
  setTimeout(() => { if (toast.parentNode) toast.remove(); }, duration);
}

/* ── Modal Helpers ────────────────────────────────────────────────── */

function openModal(id) {
  const overlay = document.getElementById(id);
  if (!overlay) return;
  overlay.classList.add('modal-open');
  overlay.style.opacity = '1';
  overlay.style.pointerEvents = 'all';
}

function closeModal(id) {
  const overlay = document.getElementById(id);
  if (!overlay) return;
  overlay.classList.remove('modal-open');
  overlay.style.opacity = '0';
  overlay.style.pointerEvents = 'none';
}

/* Close modal on overlay click or Escape key */
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('modal-open');
    e.target.style.opacity = '0';
    e.target.style.pointerEvents = 'none';
  }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay').forEach(m => {
      m.classList.remove('modal-open');
      m.style.opacity = '0';
      m.style.pointerEvents = 'none';
    });
  }
});

/* ── Button Loading State ─────────────────────────────────────────── */

function setButtonLoading(btn, text = 'Processing…') {
  btn.dataset.originalText = btn.textContent;
  btn.textContent = text;
  btn.disabled = true;
  btn.style.opacity = '0.7';
}
function clearButtonLoading(btn) {
  btn.textContent = btn.dataset.originalText || 'Submit';
  btn.disabled = false;
  btn.style.opacity = '1';
}

/* ── Empty & Loading Skeletons ────────────────────────────────────── */

function showEmptyState(container, icon, heading, message, btnHtml = '') {
  container.innerHTML = `
    <div class="empty-state card" style="display:flex;">
      <div class="empty-state-icon">${icon}</div>
      <h3>${heading}</h3>
      <p class="text-muted mt-sm mb-lg">${message}</p>
      ${btnHtml}
    </div>`;
}

function showLoadingSkeleton(container, count = 3) {
  let html = '<div class="room-grid">';
  for (let i = 0; i < count; i++) {
    html += `<div class="card room-card p-0" style="box-shadow:none;border:none;background:transparent;">
      <div class="room-card-img loading-skeleton" style="border-radius:var(--radius-lg);"></div>
      <div style="padding:var(--space-lg);">
        <div class="loading-skeleton mb-sm" style="height:24px;width:60%;border-radius:4px;"></div>
        <div class="loading-skeleton mb-md" style="height:16px;width:40%;border-radius:4px;"></div>
        <div class="loading-skeleton" style="height:16px;width:80%;border-radius:4px;"></div>
      </div>
    </div>`;
  }
  html += '</div>';
  container.innerHTML = html;
}

/* ── Navbar auth-aware rendering ──────────────────────────────────── */

function updateNavbar() {
  const user = getCurrentUser();
  // Update all nav-actions on the page
  document.querySelectorAll('.nav-actions').forEach(nav => {
    if (user) {
      nav.innerHTML = `
        <div class="d-flex align-items-center gap-sm" style="cursor:pointer;" id="navUserMenu">
          <div style="width:36px;height:36px;border-radius:50%;background-color:var(--primary-light);color:var(--surface);display:flex;align-items:center;justify-content:center;font-weight:bold;">
            ${user.fullName.charAt(0)}
          </div>
          <span class="text-muted" style="font-weight:500;">${user.fullName.split(' ')[0]}</span>
        </div>
        <button class="btn btn-ghost" id="logoutBtn" style="font-size:0.85rem;">Logout</button>
        <button class="hamburger">☰</button>`;
      const logoutBtn = nav.querySelector('#logoutBtn');
      if (logoutBtn) logoutBtn.addEventListener('click', logout);
    } else {
      nav.innerHTML = `
        <a href="login.html" class="btn btn-ghost">Login</a>
        <a href="rooms.html" class="btn btn-primary">Book Now</a>
        <button class="hamburger">☰</button>`;
    }
  });
}
