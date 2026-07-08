/* ===================================================================
   admin-ui.js — Global Admin UI functionality
   =================================================================== */

/** Global Toast Notification */
function showToast(message, type = 'info') {
  // Check if toast container exists, if not create it
  let container = document.getElementById('admin-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'admin-toast-container';
    container.style.position = 'fixed';
    container.style.bottom = '24px';
    container.style.right = '24px';
    container.style.zIndex = '9999';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '8px';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  let bgColor = 'var(--admin-primary)';
  if (type === 'success') bgColor = 'var(--admin-success)';
  if (type === 'error') bgColor = 'var(--admin-danger)';
  if (type === 'warning') bgColor = 'var(--admin-warning)';

  toast.style.backgroundColor = bgColor;
  toast.style.color = '#fff';
  toast.style.padding = '12px 20px';
  toast.style.borderRadius = '8px';
  toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
  toast.style.fontSize = '14px';
  toast.style.display = 'flex';
  toast.style.alignItems = 'center';
  toast.style.gap = '8px';
  toast.style.opacity = '0';
  toast.style.transform = 'translateY(20px)';
  toast.style.transition = 'all 0.3s ease';

  // Determine Icon
  let iconName = 'info';
  if (type === 'success') iconName = 'check_circle';
  if (type === 'error') iconName = 'error';
  if (type === 'warning') iconName = 'warning';

  toast.innerHTML = `
    <span class="material-symbols-outlined" style="font-size:20px;">${iconName}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  // Animate in
  setTimeout(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  }, 10);

  // Auto remove after 3s
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/** Global Modal Logic */
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
  }
}

function closeAllModals() {
  document.querySelectorAll('.admin-modal-overlay').forEach(overlay => {
    overlay.classList.remove('active');
  });
}

/** Sidebar Toggle */
function toggleSidebar() {
  const sidebar = document.getElementById('adminSidebar');
  if (!sidebar) return;

  sidebar.classList.toggle('open');

  let overlay = document.getElementById('adminSidebarOverlay');
  if (sidebar.classList.contains('open')) {
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'adminSidebarOverlay';
      overlay.className = 'admin-sidebar-overlay';
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.45);
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
        z-index: 35;
      `;
      overlay.addEventListener('click', toggleSidebar);
      document.body.appendChild(overlay);
    }
  } else {
    if (overlay) {
      overlay.remove();
    }
  }
}

/** Format currency utility (proxy to storage.js if exists) */
function formatAdminCurrency(amount) {
  if (typeof formatCurrency === 'function') return formatCurrency(amount);
  return '₹ ' + Number(amount).toLocaleString('en-IN');
}

/** Format Date utility (proxy to storage.js if exists) */
function formatAdminDate(iso) {
  if (typeof formatDateTime === 'function') return formatDateTime(iso);
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN');
}

/** Empty state renderer */
function renderEmptyState(container, message, icon = 'inbox') {
  container.innerHTML = `
    <div style="text-align:center; padding: 40px 20px; color: var(--admin-text-muted);">
      <span class="material-symbols-outlined" style="font-size:48px; opacity:0.5; margin-bottom:12px; display:block;">${icon}</span>
      <p style="margin:0; font-size:16px;">${message}</p>
    </div>
  `;
}

// Global UI Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  // Sidebar toggle
  const menuToggle = document.querySelector('.menu-toggle');
  if (menuToggle) {
    menuToggle.addEventListener('click', toggleSidebar);
  }

  // Set current admin profile name
  if (typeof getActiveAdmin === 'function') {
    const currentAdmin = getActiveAdmin();
    const profileName = document.querySelector('.admin-profile-name');
    if (currentAdmin && profileName) {
      profileName.textContent = currentAdmin.fullName;
    }
  }

  // Close modals on overlay click or close button
  document.addEventListener('click', (e) => {
    // Close on overlay background click
    if (e.target.classList.contains('admin-modal-overlay')) {
      closeAllModals();
    }
    // Close on any close button click inside a modal header
    if (e.target.closest('.admin-modal-header .admin-btn-icon') || e.target.closest('[data-modal-close]')) {
      closeAllModals();
    }
  });



  // Bind Logout
  const profileDropdown = document.querySelector('.admin-profile');
  if (profileDropdown) {
    profileDropdown.addEventListener('click', () => {
      if (confirm('Are you sure you want to log out?')) {
        if (typeof adminLogout === 'function') adminLogout();
      }
    });
  }
});
