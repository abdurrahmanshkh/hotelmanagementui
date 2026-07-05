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
  else if (currentPath.includes('admin-login.html')) {
    // Basic login bind
    const loginBtn = document.querySelector('.admin-btn-primary');
    if (loginBtn) {
      loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const pass = document.getElementById('password').value;
        
        const res = adminLogin(email, pass);
        if (res.success) {
          window.location.href = 'dashboard.html';
        } else {
          showToast(res.message, 'error');
        }
      });
    }
  }

});
