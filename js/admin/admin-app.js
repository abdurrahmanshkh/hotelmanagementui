/* ===================================================================
   admin-app.js — Main Router and Initializer
   =================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  
  const currentPath = window.location.pathname;

  if (currentPath.includes('dashboard.html')) {
    if (typeof initDashboard === 'function') initDashboard();
  } 
  else if (currentPath.includes('rooms.html')) {
    if (typeof initRoomsPage === 'function') initRoomsPage();
  }
  else if (currentPath.includes('bookings.html')) {
    if (typeof initBookingsPage === 'function') initBookingsPage();
  }
  else if (currentPath.includes('guests.html')) {
    if (typeof initGuestsPage === 'function') initGuestsPage();
  }
  else if (currentPath.includes('service-requests.html')) {
    if (typeof initServiceRequestsPage === 'function') initServiceRequestsPage();
  }
  else if (currentPath.includes('chats.html')) {
    if (typeof initAdminChatsPage === 'function') initAdminChatsPage();
  }
  else if (currentPath.includes('dynamic-pricing.html')) {
    if (typeof initDynamicPricingPage === 'function') initDynamicPricingPage();
  }
  else if (currentPath.includes('housekeeping.html')) {
    if (typeof initHousekeepingPage === 'function') initHousekeepingPage();
  }
  else if (currentPath.includes('reports.html')) {
    if (typeof initReportsPage === 'function') initReportsPage();
  }
  else if (currentPath.includes('admin-login.html')) {
    // Login form handler
    const loginForm = document.getElementById('adminLoginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();
        const staffCode = document.getElementById('staffCode').value.trim();
        
        if (!email || !password) {
          showToast('Please enter email and password.', 'warning');
          return;
        }
        
        const res = adminLogin(email, password, staffCode);
        if (res.success) {
          showToast('Login successful!', 'success');
          setTimeout(() => {
            window.location.href = 'dashboard.html';
          }, 500);
        } else {
          showToast(res.message || 'Login failed. Invalid credentials.', 'error');
        }
      });
    }
  }

});
