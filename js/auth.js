/* ===================================================================
   auth.js — Signup, Login, Logout & Session Management
   =================================================================== */

/** Get the currently logged-in user (or null). */
function getCurrentUser() {
  try {
    const raw = localStorage.getItem('stayEasePro_currentUser');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

/** Persist user session. */
function setCurrentUser(user) {
  localStorage.setItem('stayEasePro_currentUser', JSON.stringify(user));
}

/** Logout: clear session and redirect. */
function logout() {
  localStorage.removeItem('stayEasePro_currentUser');
  sessionStorage.clear();
  showToast('Logged out successfully.', 'success');
  setTimeout(() => { window.location.href = 'index.html'; }, 600);
}

/** Redirect to login if user is not authenticated (for protected pages). */
function requireAuth() {
  if (!getCurrentUser()) {
    sessionStorage.setItem('stayEasePro_loginRedirect', window.location.href);
    showToast('Please login to continue.', 'warning');
    setTimeout(() => { window.location.href = 'login.html'; }, 800);
    return false;
  }
  return true;
}

/* ── Signup ────────────────────────────────────────────────────────── */
function initSignup() {
  const form = document.getElementById('signupForm');
  if (!form) return;

  form.addEventListener('submit', function(e){
    e.preventDefault();
    handleSignup();
  });

  const btn = form.querySelector('.btn-primary');

  if (btn) {
    btn.addEventListener('click', function(e){
      e.preventDefault();
      handleSignup();
    });
  }
}

function handleSignup() {
  const form = document.getElementById('signupForm');
  clearFormErrors(form);
  let valid = true;

  const fullname = document.getElementById('fullname');
  const email    = document.getElementById('email');
  const phone    = document.getElementById('phone');
  const pwd      = document.getElementById('newPassword');
  const cpwd     = document.getElementById('confirmPassword');
  const idType   = document.getElementById('idType');
  const idNum    = document.getElementById('idNumber');
  const terms    = document.getElementById('terms');

  if (!isRequired(fullname?.value) || fullname.value.trim().length < 3)
    { showInlineError(fullname, 'Full name required (min 3 chars).'); valid = false; }
  if (!isValidEmail(email?.value))
    { showInlineError(email, 'Valid email is required.'); valid = false; }
  if (!isValidPhone(phone?.value))
    { showInlineError(phone, 'Phone must be exactly 10 digits.'); valid = false; }
  if (!isStrongPassword(pwd?.value))
    { showInlineError(pwd, 'Password must be at least 8 characters.'); valid = false; }
  if (!doPasswordsMatch(pwd?.value, cpwd?.value))
    { showInlineError(cpwd, 'Passwords do not match.'); valid = false; }
  if (!isRequired(idNum?.value))
    { showInlineError(idNum, 'Government ID number is required.'); valid = false; }
  if (terms && !terms.checked)
    { showToast('You must accept Terms and Conditions.', 'warning'); valid = false; }

  // Check unique email
  if (valid) {
    const users = getData('stayEasePro_users', []);
    if (users.find(u => u.email.toLowerCase() === email.value.trim().toLowerCase())) {
      showInlineError(email, 'An account with this email already exists.');
      valid = false;
    }
  }

  if (!valid) return;

  const newUser = {
    id: generateId('USR'),
    fullName: fullname.value.trim(),
    email: email.value.trim().toLowerCase(),
    phone: phone.value.trim(),
    password: pwd.value,
    governmentIdType: idType ? idType.value : 'Aadhaar',
    governmentIdNumber: idNum.value.trim(),
    role: 'customer',
    createdAt: new Date().toISOString()
  };

  addItem('stayEasePro_users', newUser);
  setCurrentUser(newUser);

  // Welcome notification
  addItem('stayEasePro_notifications', {
    id: generateId('NTF'), userId: newUser.id, type: 'welcome',
    message: `Welcome to StayEase Pro, ${newUser.fullName}!`,
    read: false, createdAt: new Date().toISOString(), relatedId: newUser.id
  });

  showToast('Account created successfully!', 'success');
  setTimeout(() => { window.location.href = 'dashboard.html'; }, 800);
}

/* ── Login ─────────────────────────────────────────────────────────── */
function initLogin() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  if (getCurrentUser()) {
    window.location.href = 'dashboard.html';
    return;
  }

  form.addEventListener('submit', function(e){
    e.preventDefault();
    handleLogin();
  });

  const btn = form.querySelector('.btn-primary');


  if (btn) {
    btn.addEventListener('click', function(e){
      e.preventDefault();
      handleLogin();
    });
  }
}

function handleLogin() {
  const form = document.getElementById('loginForm');
  clearFormErrors(form);
  let valid = true;

  const email = document.getElementById('email');
  const pwd   = document.getElementById('password');

  if (!isValidEmail(email?.value))
    { showInlineError(email, 'Valid email is required.'); valid = false; }
  if (!isRequired(pwd?.value) || pwd.value.length < 8)
    { showInlineError(pwd, 'Password must be at least 8 characters.'); valid = false; }
  if (!valid) return;

  const users = getData('stayEasePro_users', []);
  const user = users.find(u =>
    u.email.toLowerCase() === email.value.trim().toLowerCase() && u.password === pwd.value
  );

  if (!user) {
    showInlineError(pwd, 'Invalid email or password.');
    showToast('Invalid email or password.', 'error');
    return;
  }

  setCurrentUser(user);
  showToast('Login successful!', 'success');

  const redirect = sessionStorage.getItem('stayEasePro_loginRedirect');
  sessionStorage.removeItem('stayEasePro_loginRedirect');
  setTimeout(() => { window.location.href = redirect || 'dashboard.html'; }, 600);
}
