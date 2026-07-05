/* ===================================================================
   admin-auth.js — Admin Authentication and Page Protection
   =================================================================== */

/** Check if there is an active admin session */
function getActiveAdmin() {
  const adminStr = sessionStorage.getItem('stayEasePro_currentAdmin');
  return adminStr ? JSON.parse(adminStr) : null;
}

/** Login logic to check credentials and set session */
function adminLogin(email, password, staffCode) {
  const admins = getData('stayEasePro_admins', []);
  const admin = admins.find(a => a.email === email && a.password === password);
  
  if (admin) {
    if (staffCode && admin.staffCode !== staffCode) {
      return { success: false, message: "Invalid staff code." };
    }
    sessionStorage.setItem('stayEasePro_currentAdmin', JSON.stringify(admin));
    return { success: true, admin };
  }
  return { success: false, message: "Invalid email or password." };
}

/** Logout logic */
function adminLogout() {
  sessionStorage.removeItem('stayEasePro_currentAdmin');
  window.location.href = 'admin-login.html';
}

/** Protect pages by redirecting unauthenticated users */
function requireAdminAuth() {
  const currentPath = window.location.pathname;
  // If we are on the login page, don't require auth (but redirect if already logged in)
  if (currentPath.includes('admin-login.html')) {
    if (getActiveAdmin()) {
      window.location.href = 'dashboard.html';
    }
    return;
  }
  
  // For all other pages, redirect to login if no active session
  if (!getActiveAdmin()) {
    window.location.href = 'admin-login.html';
  }
}

// Automatically enforce auth on script load
requireAdminAuth();
