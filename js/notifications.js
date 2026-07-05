/* ===================================================================
   notifications.js — Notification creation, rendering & state
   =================================================================== */

function initNotifications() {
  renderNotificationBadge();
}

/** Show unread count badge on the navbar user avatar / bell icon. */
function renderNotificationBadge() {
  const user = getCurrentUser();
  if (!user) return;
  const unread = getData('stayEasePro_notifications', [])
    .filter(n => n.userId === user.id && !n.read).length;

  // Add or update badge
  let badge = document.getElementById('notifBadge');
  if (!badge) {
    const navUser = document.getElementById('navUserMenu');
    if (!navUser) return;
    badge = document.createElement('span');
    badge.id = 'notifBadge';
    badge.style.cssText = 'position:absolute;top:-4px;right:-4px;background:var(--error);color:white;font-size:0.65rem;font-weight:700;padding:2px 5px;border-radius:50%;min-width:16px;text-align:center;';
    const avatar = navUser.querySelector('div');
    if (avatar) { avatar.style.position = 'relative'; avatar.appendChild(badge); }
  }
  badge.textContent = unread > 0 ? unread : '';
  badge.style.display = unread > 0 ? 'block' : 'none';
}

/** Render the notification list (used on dashboard or a dedicated panel). */
function renderNotificationList(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const user = getCurrentUser();
  if (!user) return;

  const notifications = getData('stayEasePro_notifications', [])
    .filter(n => n.userId === user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10);

  if (!notifications.length) {
    container.innerHTML = '<p class="text-muted text-center p-md" style="font-size:0.85rem;">No notifications yet.</p>';
    return;
  }

  container.innerHTML = notifications.map(n => {
    const icon = { booking: '🏨', payment: '💳', passcode: '🔑', service: '🛎️', chat: '💬', welcome: '👋', refund: '↩️', feedback: '⭐' }[n.type] || '🔔';
    return `
      <div class="d-flex gap-sm align-items-start p-sm ${n.read ? '' : 'bg-background'}" style="border-bottom:1px solid var(--border-color);cursor:pointer;" onclick="markNotifRead('${n.id}', this)">
        <span style="font-size:1.2rem;">${icon}</span>
        <div>
          <p style="font-size:0.85rem;${n.read ? '' : 'font-weight:600;'}">${n.message}</p>
          <p class="text-muted" style="font-size:0.75rem;">${formatDateTime(n.createdAt)}</p>
        </div>
      </div>`;
  }).join('');
}

function markNotifRead(notifId, el) {
  updateItem('stayEasePro_notifications', notifId, { read: true });
  if (el) el.classList.remove('bg-background');
  renderNotificationBadge();
}

function markAllRead() {
  const user = getCurrentUser();
  if (!user) return;
  const notifications = getData('stayEasePro_notifications', []);
  notifications.forEach(n => { if (n.userId === user.id) n.read = true; });
  setData('stayEasePro_notifications', notifications);
  renderNotificationBadge();
  showToast('All notifications marked as read.', 'info');
}
