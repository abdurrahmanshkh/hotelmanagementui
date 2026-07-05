/* ===================================================================
   bookings.js — Booking confirmation, My Bookings, Booking Details
   =================================================================== */

/* ── Booking Confirmation Page ────────────────────────────────────── */
function initBookingConfirmation() {
  const container = document.getElementById('confirmationContent');
  if (!container) return;
  if (!requireAuth()) return;

  const raw = sessionStorage.getItem('stayEasePro_pendingBooking');
  if (!raw) { showToast('No pending booking found.', 'warning'); setTimeout(() => { window.location.href = 'rooms.html'; }, 800); return; }

  const booking = JSON.parse(raw);
  const nights = Math.ceil((new Date(booking.checkOut) - new Date(booking.checkIn)) / (1000 * 60 * 60 * 24));
  const room = findById('stayEasePro_rooms', booking.roomId);
  const roomPrice = room ? room.dynamicPrice : Math.round(booking.totalAmount / 1.17 / nights);
  const roomAmt = roomPrice * nights;
  const taxes = Math.round(roomAmt * 0.12);
  const fee = Math.round(roomAmt * 0.05);

  // Render summary
  document.getElementById('cfBookingId').textContent = booking.id;
  document.getElementById('cfGuestName').textContent = booking.guestName;
  document.getElementById('cfRoomInfo').textContent = `${booking.roomType} - ${booking.roomNumber}`;
  document.getElementById('cfGuests').textContent = `${booking.guests} Guest${booking.guests > 1 ? 's' : ''}`;
  document.getElementById('cfCheckIn').textContent = formatDateTime(booking.checkIn);
  document.getElementById('cfCheckOut').textContent = formatDateTime(booking.checkOut);
  document.getElementById('cfNights').textContent = `→ ${nights} Night${nights > 1 ? 's' : ''} →`;
  document.getElementById('cfRoomAmt').textContent = formatCurrency(roomAmt);
  document.getElementById('cfTaxes').textContent = formatCurrency(taxes);
  document.getElementById('cfFee').textContent = formatCurrency(fee);
  document.getElementById('cfTotal').textContent = formatCurrency(booking.totalAmount);

  // Proceed to Payment
  document.getElementById('cfProceedBtn')?.addEventListener('click', () => {
    const policyCheck = document.getElementById('cfPolicy');
    if (policyCheck && !policyCheck.checked) { showToast('Please accept the hotel policies.', 'warning'); return; }

    // Update special request if user edited it
    const sr = document.getElementById('cfSpecialRequest');
    if (sr) booking.specialRequest = sr.value;

    // Save booking to localStorage
    addItem('stayEasePro_bookings', booking);
    sessionStorage.setItem('stayEasePro_pendingBooking', JSON.stringify(booking));

    // Notification
    addItem('stayEasePro_notifications', {
      id: generateId('NTF'), userId: booking.userId, type: 'booking',
      message: `Booking ${booking.id} created. Proceed to payment.`,
      read: false, createdAt: new Date().toISOString(), relatedId: booking.id
    });

    window.location.href = 'payment.html';
  });

  // Cancel
  document.getElementById('cfCancelBtn')?.addEventListener('click', () => openModal('cancelModal'));
  document.getElementById('cfCancelConfirm')?.addEventListener('click', () => {
    sessionStorage.removeItem('stayEasePro_pendingBooking');
    // Remove booking if already saved
    deleteItem('stayEasePro_bookings', booking.id);
    showToast('Booking cancelled.', 'info');
    closeModal('cancelModal');
    setTimeout(() => { window.location.href = 'rooms.html'; }, 600);
  });
}

/* ── My Bookings Page ─────────────────────────────────────────────── */
function initMyBookings() {
  const container = document.getElementById('bookingsContainer');
  if (!container) return;
  if (!requireAuth()) return;

  refreshPasscodeStatuses();
  renderMyBookings('active');

  // Tab switching
  document.querySelectorAll('[data-booking-tab]').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('[data-booking-tab]').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderMyBookings(tab.dataset.bookingTab);
    });
  });
}

function classifyBooking(b) {
  const now = new Date();
  if (b.status === 'Cancelled') return 'cancelled';
  if (b.status === 'Completed' || now > new Date(b.checkOut)) return 'completed';
  if (b.status === 'Checked In' || (b.status === 'Confirmed' && now >= new Date(b.checkIn) && now <= new Date(b.checkOut))) return 'active';
  if (b.status === 'Confirmed' || b.status === 'Pending Payment') return 'upcoming';
  return 'upcoming';
}

function renderMyBookings(tab = 'active') {
  const container = document.getElementById('bookingsContainer');
  if (!container) return;
  const user = getCurrentUser();
  if (!user) return;

  const all = getData('stayEasePro_bookings', []).filter(b => b.userId === user.id);
  const filtered = all.filter(b => classifyBooking(b) === tab);

  if (!filtered.length) {
    const msgs = {
      active: 'No active stays right now.',
      upcoming: 'No upcoming bookings.',
      completed: 'No completed stays yet.',
      cancelled: 'No cancelled bookings.'
    };
    showEmptyState(container, '🏨', 'No Bookings', msgs[tab] || 'No bookings found.',
      tab !== 'cancelled' ? '<a href="rooms.html" class="btn btn-primary">Explore Rooms</a>' : '');
    return;
  }

  container.innerHTML = filtered.map(b => {
    const statusClass = { 'Checked In': 'badge-success', 'Confirmed': 'badge-info', 'Pending Payment': 'badge-warning', 'Completed': 'badge-primary', 'Cancelled': 'badge-danger' }[b.status] || 'badge-primary';
    const payClass = { 'Paid': 'badge-success', 'Unpaid': 'badge-danger', 'Failed': 'badge-danger', 'Refunded': 'badge-warning' }[b.paymentStatus] || 'badge-primary';

    let actions = `<a href="booking-details.html?id=${b.id}" class="btn btn-secondary">View Details</a>`;
    if (b.status === 'Pending Payment') actions += ` <a href="payment.html?id=${b.id}" class="btn btn-primary">Pay Now</a>`;
    if (tab === 'active' || tab === 'upcoming') actions += ` <button class="btn btn-ghost text-error" onclick="cancelBookingFromList('${b.id}')">Cancel</button>`;
    if (tab === 'completed') actions += ` <a href="booking-details.html?id=${b.id}#feedback" class="btn btn-ghost">Leave Feedback</a>`;

    return `
      <div class="card p-md d-flex justify-content-between align-items-center flex-wrap gap-md">
        <div class="d-flex gap-md align-items-center">
          <div class="bg-primary-light text-primary p-sm" style="border-radius: var(--radius-sm);">
            <span class="material-symbols-outlined" style="font-size: 2rem;">king_bed</span>
          </div>
          <div>
            <div class="d-flex align-items-center gap-sm mb-xs flex-wrap">
              <h4 class="mb-0">${b.roomType} - #${b.roomNumber}</h4>
              <span class="badge ${statusClass}">${b.status}</span>
            </div>
            <p class="text-muted font-size-sm mb-xs">Booking ID: ${b.id}</p>
            <p class="text-muted font-size-sm d-flex align-items-center gap-xs">
              <span class="material-symbols-outlined" style="font-size: 16px;">calendar_month</span> ${formatDateOnly(b.checkIn)} – ${formatDateOnly(b.checkOut)}
            </p>
            <div class="mt-sm d-flex gap-sm flex-wrap">
              <span class="badge ${payClass}"><span class="material-symbols-outlined" style="font-size:14px; margin-right:4px;">payments</span> ${b.paymentStatus}: ${formatCurrency(b.totalAmount)}</span>
              ${b.passcode ? `<span class="badge badge-info"><span class="material-symbols-outlined" style="font-size:14px; margin-right:4px;">key</span> Passcode: ${b.passcodeStatus}</span>` : ''}
            </div>
          </div>
        </div>
        <div class="d-flex flex-wrap gap-sm justify-content-end">${actions}</div>
      </div>`;
  }).join('');
}

function cancelBookingFromList(bookingId) {
  if (!confirm('Are you sure you want to cancel this booking?')) return;
  const b = findById('stayEasePro_bookings', bookingId);
  if (!b) return;

  const updates = { status: 'Cancelled' };
  if (b.paymentStatus === 'Paid') {
    updates.paymentStatus = 'Refunded';
    updateItem('stayEasePro_payments', getData('stayEasePro_payments', []).find(p => p.bookingId === bookingId)?.id, { status: 'Refunded' });
    addItem('stayEasePro_notifications', {
      id: generateId('NTF'), userId: b.userId, type: 'refund',
      message: `Dummy refund of ${formatCurrency(b.totalAmount)} initiated for ${b.id}.`,
      read: false, createdAt: new Date().toISOString(), relatedId: bookingId
    });
  }
  updateItem('stayEasePro_bookings', bookingId, updates);

  // Update room status back to Available
  const room = findById('stayEasePro_rooms', b.roomId);
  if (room && (room.status === 'Reserved' || room.status === 'Occupied')) {
    updateItem('stayEasePro_rooms', b.roomId, { status: 'Available' });
  }

  showToast('Booking cancelled successfully.', 'success');
  renderMyBookings(document.querySelector('[data-booking-tab].active')?.dataset.bookingTab || 'active');
}

/* ── Booking Details Page ─────────────────────────────────────────── */
function initBookingDetails() {
  const container = document.getElementById('bdContent');
  if (!container) return;
  if (!requireAuth()) return;

  refreshPasscodeStatuses();
  const params = new URLSearchParams(window.location.search);
  const bookingId = params.get('id') || sessionStorage.getItem('stayEasePro_viewBooking');
  if (!bookingId) { showToast('No booking selected.', 'warning'); return; }

  sessionStorage.setItem('stayEasePro_viewBooking', bookingId);
  const b = findById('stayEasePro_bookings', bookingId);
  if (!b) { showToast('Booking not found.', 'error'); return; }

  const user = getCurrentUser();
  const payment = getData('stayEasePro_payments', []).find(p => p.bookingId === bookingId);

  // Populate elements
  const el = id => document.getElementById(id);
  if (el('bdBookingId'))  el('bdBookingId').textContent = b.id;
  if (el('bdStatus'))     { el('bdStatus').textContent = b.status; el('bdStatus').className = 'badge ' + ({'Checked In':'badge-success','Confirmed':'badge-info','Pending Payment':'badge-warning','Completed':'badge-primary','Cancelled':'badge-danger'}[b.status] || 'badge-primary'); }
  if (el('bdRoomInfo'))   el('bdRoomInfo').textContent = `${b.roomType} Room #${b.roomNumber}`;
  if (el('bdGuests'))     el('bdGuests').textContent = `${b.guests} Guest${b.guests > 1 ? 's' : ''}`;
  if (el('bdCheckIn'))    el('bdCheckIn').textContent = formatDateTime(b.checkIn);
  if (el('bdCheckOut'))   el('bdCheckOut').textContent = formatDateTime(b.checkOut);
  if (el('bdGuestName'))  el('bdGuestName').textContent = b.guestName;
  if (el('bdEmail'))      el('bdEmail').textContent = user?.email || '';
  if (el('bdPhone'))      el('bdPhone').textContent = user?.phone || '';
  if (el('bdTotalAmt'))   el('bdTotalAmt').textContent = formatCurrency(b.totalAmount);
  if (el('bdPayStatus'))  { el('bdPayStatus').textContent = b.paymentStatus; el('bdPayStatus').className = 'badge ' + ({'Paid':'badge-success','Unpaid':'badge-danger','Failed':'badge-danger','Refunded':'badge-warning'}[b.paymentStatus] || 'badge-primary'); }
  if (el('bdPayId'))      el('bdPayId').textContent = payment ? `${payment.id} (${payment.method})` : '—';

  // Passcode rendering
  const pcContainer = el('bdPasscode');
  if (pcContainer) {
    const status = getPasscodeStatus(b);
    if (status === 'Active') {
      pcContainer.innerHTML = `
        <div class="passcode-active" style="border:2px solid var(--success);border-radius:var(--radius-lg);padding:var(--space-md);margin-bottom:var(--space-md);">
          <div class="passcode-display mb-xs" style="color:var(--success);">${b.passcode}</div>
          <span class="badge badge-success">Active</span>
          <p class="text-muted" style="font-size:0.85rem;" class="mt-sm">Use this passcode for room entry on the keypad.</p>
        </div>`;
    } else if (status === 'Locked') {
      pcContainer.innerHTML = `
        <div style="border-radius:var(--radius-lg);padding:var(--space-md);margin-bottom:var(--space-md);background:var(--background);">
          <div class="passcode-display mb-xs" style="color:var(--text-muted);font-size:1.5rem;letter-spacing:normal;">🔒 Locked</div>
          <span class="badge badge-warning">Locked</span>
          <p class="text-muted" style="font-size:0.85rem;" class="mt-sm">Your passcode will become active at check-in time.</p>
        </div>`;
    } else if (status === 'Expired') {
      pcContainer.innerHTML = `
        <div style="border-radius:var(--radius-lg);padding:var(--space-md);margin-bottom:var(--space-md);">
          <div class="passcode-display mb-xs" style="color:var(--error);text-decoration:line-through;">${b.passcode}</div>
          <span class="badge badge-danger">Expired</span>
          <p class="text-muted" style="font-size:0.85rem;" class="mt-sm">This passcode has expired.</p>
        </div>`;
    } else {
      pcContainer.innerHTML = `<p class="text-muted">Passcode will be generated after payment.</p>`;
    }
  }

  // Service requests for this booking
  const srContainer = el('bdServiceRequests');
  if (srContainer) {
    const requests = getData('stayEasePro_serviceRequests', []).filter(s => s.bookingId === bookingId);
    if (requests.length) {
      srContainer.innerHTML = requests.map(s => `
        <div class="booking-list-item" style="padding:var(--space-sm) 0;">
          <div><p class="font-weight-600">${s.serviceType}</p><p class="text-muted" style="font-size:0.8rem;">${formatDateOnly(s.createdAt)}</p></div>
          <span class="badge ${{ 'New':'badge-info','Accepted':'badge-primary','In Progress':'badge-warning','Completed':'badge-success','Rejected':'badge-danger' }[s.status] || 'badge-primary'}">${s.status}</span>
        </div>`).join('');
    } else {
      srContainer.innerHTML = '<p class="text-muted" style="font-size:0.85rem;">No service requests for this booking.</p>';
    }
  }

  // Invoice button
  el('bdInvoiceBtn')?.addEventListener('click', () => showInvoiceModal(b, payment));

  // Chat shortcut
  el('bdChatBtn')?.addEventListener('click', () => {
    sessionStorage.setItem('stayEasePro_chatBooking', bookingId);
    window.location.href = 'chat.html';
  });
}

/* ── Invoice Modal ────────────────────────────────────────────────── */
function showInvoiceModal(booking, payment) {
  const el = id => document.getElementById(id);
  if (!el('invoiceModal')) {
    // Create modal dynamically
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'invoiceModal';
    overlay.innerHTML = `<div class="modal modal-lg" style="max-width:600px;"><div id="invoiceBody"></div></div>`;
    document.body.appendChild(overlay);
  }

  const nights = Math.ceil((new Date(booking.checkOut) - new Date(booking.checkIn)) / (1000 * 60 * 60 * 24));
  const room = findById('stayEasePro_rooms', booking.roomId);
  const roomPrice = room ? room.dynamicPrice : Math.round(booking.totalAmount / 1.17 / nights);

  document.getElementById('invoiceBody').innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-lg">
      <h3>StayEase Pro — Invoice</h3>
      <button class="btn btn-ghost" onclick="closeModal('invoiceModal')">✕</button>
    </div>
    <div class="bg-background p-md mb-md" style="border-radius:var(--radius-md);">
      <div class="d-flex justify-content-between mb-xs"><span class="text-muted">Invoice #</span><span>INV-${booking.id.replace('BK-','')}</span></div>
      <div class="d-flex justify-content-between mb-xs"><span class="text-muted">Payment ID</span><span>${payment?.id || '—'}</span></div>
      <div class="d-flex justify-content-between mb-xs"><span class="text-muted">Booking ID</span><span>${booking.id}</span></div>
      <div class="d-flex justify-content-between mb-xs"><span class="text-muted">Guest</span><span>${booking.guestName}</span></div>
      <div class="d-flex justify-content-between mb-xs"><span class="text-muted">Room</span><span>${booking.roomType} #${booking.roomNumber}</span></div>
      <div class="d-flex justify-content-between mb-xs"><span class="text-muted">Stay</span><span>${formatDateOnly(booking.checkIn)} – ${formatDateOnly(booking.checkOut)} (${nights}N)</span></div>
      <div class="d-flex justify-content-between mb-xs"><span class="text-muted">Payment Method</span><span>${payment?.method || '—'}</span></div>
    </div>
    <div class="mb-md">
      <div class="price-summary-row"><span class="text-muted">Room Charges</span><span>${formatCurrency(roomPrice * nights)}</span></div>
      <div class="price-summary-row"><span class="text-muted">Taxes (12%)</span><span>${formatCurrency(Math.round(roomPrice * nights * 0.12))}</span></div>
      <div class="price-summary-row"><span class="text-muted">Service Fee (5%)</span><span>${formatCurrency(Math.round(roomPrice * nights * 0.05))}</span></div>
      <div class="price-summary-row price-summary-total"><span>Total Paid</span><span>${formatCurrency(booking.totalAmount)}</span></div>
    </div>
    <div class="d-flex justify-content-between mb-xs"><span class="text-muted">Status</span><span class="badge badge-success">${booking.paymentStatus}</span></div>
    <div class="d-flex gap-sm mt-lg justify-content-end">
      <button class="btn btn-secondary" onclick="window.print()">Print</button>
      <button class="btn btn-primary" onclick="closeModal('invoiceModal')">Close</button>
    </div>`;

  openModal('invoiceModal');
}
