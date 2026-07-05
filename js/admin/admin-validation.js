/* ===================================================================
   admin-validation.js — Form validation helpers
   =================================================================== */

function isRequired(value) {
  return value !== null && value !== undefined && String(value).trim() !== '';
}

function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

function isValidPhone(phone) {
  const re = /^\d{10}$/;
  return re.test(String(phone).trim());
}

function isPositiveNumber(value) {
  const num = Number(value);
  return !isNaN(num) && num > 0;
}

function isValidPercentage(value) {
  const num = Number(value);
  return !isNaN(num) && num >= 0 && num <= 100;
}

function showInlineError(inputElement, message) {
  inputElement.classList.add('is-invalid');
  
  let errorEl = inputElement.parentElement.querySelector('.error-message');
  if (!errorEl) {
    errorEl = document.createElement('span');
    errorEl.className = 'error-message';
    inputElement.parentElement.appendChild(errorEl);
  }
  errorEl.textContent = message;
  errorEl.style.display = 'block';
}

function clearInlineError(inputElement) {
  inputElement.classList.remove('is-invalid');
  const errorEl = inputElement.parentElement.querySelector('.error-message');
  if (errorEl) {
    errorEl.style.display = 'none';
    errorEl.textContent = '';
  }
}

function clearAllErrors(formElement) {
  const inputs = formElement.querySelectorAll('.admin-form-control');
  inputs.forEach(input => clearInlineError(input));
}
