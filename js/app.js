/* ===================================================================
   app.js — Page-level initialization & routing
   =================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Seed mock data on first load
  seedData();

  // Refresh booking & passcode statuses globally
  refreshPasscodeStatuses();
  recalculateDynamicPricing();

  // Auth-aware navbar
  updateNavbar();

  // Notification badge
  initNotifications();

  // ── Page-specific initializers ──
  // Detect page by the presence of key elements

  // Login
  if (document.getElementById('loginForm')) initLogin();

  // Signup
  if (document.getElementById('signupForm')) initSignup();

  // Home / Index  (featured rooms + stats)
  if (document.getElementById('featuredRoomGrid')) initHomeFeaturedRooms();
  if (document.getElementById('homeStats')) initHomeStats();

  // Rooms listing
  if (document.getElementById('roomGrid')) initRoomsPage();

  // Room details
  if (document.getElementById('rdBookBtn') || document.getElementById('roomDetailPage')) initRoomDetails();

  // Booking confirmation
  if (document.getElementById('confirmationContent')) initBookingConfirmation();

  // Payment
  if (document.getElementById('paymentForm')) initPayment();

  // Dashboard
  if (document.getElementById('dashboardContent')) initDashboard();

  // My Bookings
  if (document.getElementById('bookingsContainer')) initMyBookings();

  // Booking Details
  if (document.getElementById('bdContent')) initBookingDetails();

  // Services
  if (document.getElementById('serviceRequestForm')) initServices();

  // Chat
  if (document.getElementById('chatMessages')) initChat();

  // Feedback
  if (document.getElementById('feedbackForm')) initFeedback();
});

/* ── Dashboard Init ───────────────────────────────────────────────── */
function initDashboard() {
  if (!requireAuth()) return;
  const user = getCurrentUser();

  // Welcome
  const welcome = document.getElementById('dashWelcome');
  if (welcome) welcome.textContent = `Welcome back, ${user.fullName.split(' ')[0]}!`;

  refreshPasscodeStatuses();
  const bookings = getData('stayEasePro_bookings', []).filter(b => b.userId === user.id);

  // Active booking
  const active = bookings.find(b => b.status === 'Checked In' || (b.status === 'Confirmed' && new Date() >= new Date(b.checkIn) && new Date() <= new Date(b.checkOut)));
  const upcoming = bookings.filter(b => (b.status === 'Confirmed' || b.status === 'Pending Payment') && new Date(b.checkIn) > new Date());

  const activeContainer = document.getElementById('dashActiveBooking');
  const emptyContainer = document.getElementById('dashEmptyState');

  if (active && activeContainer) {
    if (emptyContainer) emptyContainer.style.display = 'none';
    activeContainer.style.display = '';
    document.getElementById('dashBookingId').textContent = active.id;
    document.getElementById('dashRoomInfo').textContent = `${active.roomType} Room - ${active.roomNumber}`;
    document.getElementById('dashCheckIn').textContent = formatDateTime(active.checkIn);
    document.getElementById('dashCheckOut').textContent = formatDateTime(active.checkOut);
    document.getElementById('dashPayAmt').textContent = `Paid: ${formatCurrency(active.totalAmount)}`;

    // Passcode
    const pcDisplay = document.getElementById('dashPasscode');
    const pcStatus = document.getElementById('dashPasscodeStatus');
    const status = getPasscodeStatus(active);
    if (pcDisplay && pcStatus) {
      if (status === 'Active') {
        pcDisplay.textContent = active.passcode;
        pcDisplay.style.color = 'var(--success)';
        pcStatus.textContent = 'Active';
        pcStatus.className = 'badge badge-success';
      } else if (status === 'Locked') {
        pcDisplay.textContent = '🔒 Locked';
        pcDisplay.style.cssText = 'color:var(--text-muted);font-size:1.5rem;letter-spacing:normal;';
        pcStatus.textContent = 'Locked';
        pcStatus.className = 'badge badge-warning';
      } else {
        pcDisplay.textContent = active.passcode;
        pcDisplay.style.color = 'var(--error)';
        pcStatus.textContent = status;
        pcStatus.className = 'badge badge-danger';
      }
    }
  } else {
    if (activeContainer) activeContainer.style.display = 'none';
    if (emptyContainer) emptyContainer.style.display = 'flex';
  }

  // Upcoming stay
  const upcomingContainer = document.getElementById('dashUpcoming');
  if (upcomingContainer && upcoming.length) {
    const u = upcoming[0];
    upcomingContainer.innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-sm">
        <div>
          <p class="font-weight-600">${u.roomType}</p>
          <p class="text-muted" style="font-size:0.85rem;">${formatDateOnly(u.checkIn)} – ${formatDateOnly(u.checkOut)}</p>
        </div>
        <span class="badge badge-warning">${u.status}</span>
      </div>
      ${u.status === 'Pending Payment' ? `<a href="payment.html?id=${u.id}" class="text-primary" style="font-weight:500;font-size:0.875rem;">Complete Payment →</a>` : ''}`;
  } else if (upcomingContainer) {
    upcomingContainer.innerHTML = '<p class="text-muted" style="font-size:0.85rem;">No upcoming bookings.</p>';
  }

  // Notifications
  renderNotificationList('dashNotifications');
}

/* ── Home Stats ───────────────────────────────────────────────────── */
function initHomeStats() {
  const rooms = getData('stayEasePro_rooms', []);
  const available = rooms.filter(r => r.status === 'Available').length;
  const avgRating = rooms.length ? (rooms.reduce((s, r) => s + r.rating, 0) / rooms.length).toFixed(1) : '—';

  const stats = document.getElementById('homeStats');
  if (!stats) return;
  const cards = stats.querySelectorAll('.stat-card h2');
  if (cards[0]) cards[0].textContent = rooms.length;
  if (cards[1]) cards[1].textContent = available;
  if (cards[2]) cards[2].textContent = avgRating;
}

/* ── Feedback ─────────────────────────────────────────────────────── */
function initFeedback() {
  const form = document.getElementById('feedbackForm');
  if (!form) return;
  if (!requireAuth()) return;

  const user = getCurrentUser();
  const params = new URLSearchParams(window.location.search);
  const bookingId = params.get('bookingId');
  const booking = bookingId ? findById('stayEasePro_bookings', bookingId) : null;

  // Check duplicate
  if (bookingId) {
    const existing = getData('stayEasePro_feedback', []).find(f => f.bookingId === bookingId && f.userId === user.id);
    if (existing) {
      showToast('You have already submitted feedback for this booking.', 'info');
      form.innerHTML = `<div class="empty-state"><div class="empty-state-icon">⭐</div><h3>Feedback Submitted</h3><p class="text-muted mt-sm">Rating: ${'★'.repeat(existing.rating)}${'☆'.repeat(5 - existing.rating)}</p><p class="text-muted mt-sm">${existing.comment}</p></div>`;
      return;
    }
  }

  form.querySelector('.btn-primary')?.addEventListener('click', e => {
    e.preventDefault();
    const rating = Number(document.getElementById('fbRating')?.value);
    const comment = document.getElementById('fbComment')?.value || '';

    if (!isValidRating(rating)) { showToast('Please provide a rating (1-5).', 'warning'); return; }

    const fb = {
      id: generateId('FB'), userId: user.id, bookingId: bookingId || '',
      rating, cleanliness: rating, service: rating, comfort: rating, valueForMoney: rating,
      comment, createdAt: new Date().toISOString()
    };
    addItem('stayEasePro_feedback', fb);
    addItem('stayEasePro_notifications', {
      id: generateId('NTF'), userId: user.id, type: 'feedback',
      message: 'Feedback submitted successfully. Thank you!',
      read: false, createdAt: new Date().toISOString(), relatedId: fb.id
    });
    showToast('Thank you for your feedback!', 'success');
    form.innerHTML = `<div class="empty-state"><div class="empty-state-icon">⭐</div><h3>Thank You!</h3><p class="text-muted mt-sm">Your feedback has been submitted.</p></div>`;
  });
}
