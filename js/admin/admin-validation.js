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

function isValidCardNumber(cardNumber) {
  const cleaned = String(cardNumber).replace(/\s/g, '');
  return /^\d{16}$/.test(cleaned);
}

function isValidCVV(cvv) {
  return /^\d{3,4}$/.test(String(cvv).trim());
}

function isValidUPI(upi) {
  return /^[\w.-]+@[\w.-]+$/.test(String(upi).toLowerCase().trim());
}

function isValidURL(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function isValidName(name) {
  return isRequired(name) && name.length >= 2;
}

function isValidRoomNumber(roomNumber) {
  return /^[A-Z0-9-]+$/.test(String(roomNumber).toUpperCase());
}

function isValidPrice(price) {
  const num = Number(price);
  return !isNaN(num) && num >= 0;
}
