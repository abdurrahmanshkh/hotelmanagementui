/* ===================================================================
   validation.js — Reusable validation helpers
   =================================================================== */

const isRequired      = v => v !== undefined && v !== null && String(v).trim() !== '';
const isValidEmail    = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isValidPhone    = v => /^\d{10}$/.test(v);
const isStrongPassword = v => v && v.length >= 8;
const doPasswordsMatch = (a, b) => a === b;
const isPositiveNumber = v => !isNaN(v) && Number(v) > 0;
const isValidCardNumber = v => /^\d{16}$/.test(String(v).replace(/\s/g, ''));
const isValidCVV      = v => /^\d{3}$/.test(v);
const isValidUPI      = v => /^[\w.\-]+@[\w]+$/.test(v);
const isValidRating   = v => Number(v) >= 1 && Number(v) <= 5;

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
  input.parentNode.appendChild(span);
}

/** Remove inline error from a form field. */
function clearInlineError(input) {
  input.classList.remove('input-error');
  const existing = input.parentNode.querySelector('.error-message');
  if (existing) existing.remove();
}

/** Clear all inline errors inside a form element. */
function clearFormErrors(form) {
  form.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
  form.querySelectorAll('.error-message').forEach(el => el.remove());
}
