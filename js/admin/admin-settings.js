/* ===================================================================
   admin-settings.js — Hotel & Admin Settings
   =================================================================== */

function initSettingsPage() {
  const saveBtn = document.querySelector('.page-header .admin-btn-primary');
  if (saveBtn) {
    saveBtn.addEventListener('click', (e) => {
      e.preventDefault();
      // Mock saving mechanism
      showToast('Settings saved successfully.', 'success');
    });
  }

  // Bind settings sidebar to show toast for now, since it's a single form layout mock
  const navBtns = document.querySelectorAll('.admin-bento-grid .admin-btn-outline');
  navBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      navBtns.forEach(b => {
        b.style.background = 'transparent';
      });
      e.currentTarget.style.background = 'var(--admin-surface-alt)';
    });
  });
}
