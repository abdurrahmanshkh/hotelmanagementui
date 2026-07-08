/* ===================================================================
   validation.js — Reusable validation helpers
   =================================================================== */

const isRequired     = v => v !== undefined && v !== null && String(v).trim() !== '';
const isValidEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isValidPhone    = v => /^\d{10}$/.test(v);
const isStrongPassword = v => /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(v || '');
const doPasswordsMatch = (a, b) => a === b;
const isPositiveNumber = v => !isNaN(v) && Number(v) > 0;
const isValidCardNumber = v => /^\d{16}$/.test(String(v).replace(/\s/g, ''));
const isValidCVV      = v => /^\d{3}$/.test(v);
const isValidUPI      = v => /^[\w.-]+@[\w]+$/.test(v);
const isValidRating   = v => Number(v) >= 1 && Number(v) <= 5;

/* Government ID validation */
const isValidAadhaar  = v => /^\d{12}$/.test(String(v).replace(/[\s-]/g, ''));
const isValidPAN      = v => /^[A-Z]{5}\d{4}[A-Z]$/i.test(v);
const isValidPassport = v => /^[A-Z]\d{7}$/i.test(v);
const isValidDL       = v => /^[A-Z]{2}\d{2}\d{4}\d{7}$/i.test(String(v).replace(/[\s-]/g, ''));

/** Returns true if dateStr (YYYY-MM-DD or ISO) is today or in the future. */
function isFutureOrToday(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const today = new Date(); today.setHours(0,0,0,0);
  return d >= today;
}

/** Returns true if endISO is strictly after startISO. */
function isDateTimeAfter(startISO, endISO) {
  return new Date(endISO) > new Date(startISO);
}

/* ── DOM-level validation helpers ─────────────────────────────────── */

/** Show an inline error below a form field. */
function showInlineError(input, msg) {
  clearInlineError(input);
  input.classList.add('input-error');
  const span = document.createElement('span');
  span.className = 'error-message';
  span.textContent = msg;
  
  const wrap = input.closest('.auth-input-wrap, .rooms-input-icon');
  if (wrap) {
    wrap.parentNode.appendChild(span);
    wrap.classList.add('input-error');
  } else {
    input.parentNode.appendChild(span);
  }
}

/** Remove inline error from a form field. */
function clearInlineError(input) {
  input.classList.remove('input-error');
  const wrap = input.closest('.auth-input-wrap, .rooms-input-icon');
  if (wrap) {
    wrap.classList.remove('input-error');
    const existing = wrap.parentNode.querySelector('.error-message');
    if (existing) existing.remove();
  } else {
    const existing = input.parentNode.querySelector('.error-message');
    if (existing) existing.remove();
  }
}

/** Clear all inline errors inside a form element. */
function clearFormErrors(form) {
  form.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
  form.querySelectorAll('.error-message').forEach(el => el.remove());
}

/* ── Toast Notifications ────────────────────────────────────────────– */

/** Show a toast notification (success, error, warning, info). */
function showToast(message, type = 'info') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.style.cssText = `
      position: fixed; top: 20px; right: 20px; z-index: 9999; 
      display: flex; flex-direction: column; gap: 10px;
    `;
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  const bgColor = type === 'success' ? 'var(--success)' : 
                  type === 'error' ? 'var(--error)' : 
                  type === 'warning' ? 'var(--warning)' : 'var(--info)';
  toast.style.cssText = `
    padding: 12px 16px; border-radius: 8px; color: white; font-size: 0.9rem;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15); background: ${bgColor};
    animation: slideIn 0.3s ease;
  `;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/* ── Passcode Management ────────────────────────────────────────────– */

/** Get the status of a booking's passcode (Active, Locked, Expired, Not Active Yet). */
function getPasscodeStatus(booking) {
  const now = new Date();
  const checkIn = new Date(booking.checkIn);
  const checkOut = new Date(booking.checkOut);

  if (now < checkIn) return 'Not Active Yet';
  if (now > checkOut) return 'Expired';
  if (booking.status === 'Checked In' || (now >= checkIn && now <= checkOut)) return 'Active';
  if (booking.status === 'Completed') return 'Expired';
  return 'Locked';
}

/** Refresh passcode statuses for all bookings. */
function refreshPasscodeStatuses() {
  const bookings = getData('stayEasePro_bookings', []);
  bookings.forEach(b => {
    const status = getPasscodeStatus(b);
    if (status !== b.passcodeStatus) {
      updateItem('stayEasePro_bookings', b.id, { passcodeStatus: status });
    }
  });
}

/* ── Dynamic Pricing Calculation ────────────────────────────────────– */

/** Recalculate dynamic pricing for all rooms based on demand level. */
function recalculateDynamicPricing() {
  const rooms = getData('stayEasePro_rooms', []);
  const pricingRules = getData('stayEasePro_pricingRules', []);

  rooms.forEach(room => {
    const rule = pricingRules.find(r => r.roomType === room.type && r.enabled);
    if (!rule) return;

    let dynamicPrice = rule.basePrice;
    let reason = 'Normal pricing active.';

    if (room.demandLevel === 'High') {
      dynamicPrice = Math.round(rule.basePrice * (1 + rule.highDemandIncrease / 100));
      reason = `High demand: +${rule.highDemandIncrease}%`;
    } else if (room.demandLevel === 'Low') {
      dynamicPrice = Math.round(rule.basePrice * (1 - rule.lowDemandDiscount / 100));
      reason = `Low demand: -${rule.lowDemandDiscount}%`;
    }

    dynamicPrice = Math.max(rule.minPrice, Math.min(rule.maxPrice, dynamicPrice));
    updateItem('stayEasePro_rooms', room.id, { dynamicPrice, dynamicReason: reason });
  });
}

/* ── Notification Management ────────────────────────────────────────– */

/** Count unread notifications for the current user. */
function getUnreadNotificationCount() {
  const user = getCurrentUser();
  if (!user) return 0;
  const notifs = getData('stayEasePro_notifications', []);
  return notifs.filter(n => n.userId === user.id && !n.read).length;
}

/** Render notifications into a container. */
function renderNotificationList(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const user = getCurrentUser();
  if (!user) {
    container.innerHTML = '<p class="text-muted">Not logged in.</p>';
    return;
  }

  const notifs = getData('stayEasePro_notifications', [])
    .filter(n => n.userId === user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  if (notifs.length === 0) {
    container.innerHTML = '<p class="text-muted" style="font-size:0.85rem;">No notifications yet.</p>';
    return;
  }

  container.innerHTML = notifs.map(n => `
    <div class="notification-item" style="padding: 8px; border-bottom: 1px solid var(--border-color); ${!n.read ? 'background: var(--primary-light);' : ''}">
      <p class="text-muted font-size-sm mb-xs">${formatDateTime(n.createdAt)}</p>
      <p class="font-size-sm">${n.message}</p>
    </div>
  `).join('');
}

/* ── Calculate nights between dates ──────────────────────────────────– */

/** Calculate number of nights between check-in and check-out. */
function calculateNights(checkInStr, checkOutStr) {
  const checkIn = new Date(checkInStr);
  const checkOut = new Date(checkOutStr);
  const diffMs = checkOut - checkIn;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/* ── Toast Animation CSS ────────────────────────────────────────────– */

// Inject CSS for toast animations if not already present
if (!document.querySelector('style[data-toast-anim]')) {
  const style = document.createElement('style');
  style.setAttribute('data-toast-anim', 'true');
  style.innerHTML = `
    @keyframes slideIn {
      from { transform: translateX(400px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(400px); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}
