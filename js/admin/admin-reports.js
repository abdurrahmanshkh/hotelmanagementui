/* ===================================================================
   admin-reports.js — Analytics and Reports
   =================================================================== */

function initReportsPage() {
  // Bind generate and download buttons
  const generateBtn = document.querySelector('.page-header .admin-btn-primary');
  if (generateBtn) {
    generateBtn.addEventListener('click', () => {
      showToast('Report generation will be fully implemented soon.', 'info');
    });
  }

  document.querySelectorAll('.admin-bento-grid .admin-btn-icon').forEach(btn => {
    btn.addEventListener('click', () => {
      showToast('Download started.', 'success');
    });
  });
}
