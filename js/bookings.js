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


  if (el('bdPaymentId')) {
    el('bdPaymentId').textContent = payment
      ? `${payment.id} (${payment.method})`
      : '—';
  }


  refreshPasscodeStatuses();


  const params = new URLSearchParams(window.location.search);
  const bookingId = params.get('id') || sessionStorage.getItem('stayEasePro_viewBooking');


  if (!bookingId) {
    showToast('No booking selected.', 'warning');
    setTimeout(() => {
      window.location.href = 'my-bookings.html';
    }, 800);
    return;
  }


  sessionStorage.setItem('stayEasePro_viewBooking', bookingId);


  const booking = findById('stayEasePro_bookings', bookingId);


  if (!booking) {
    showToast('Booking not found.', 'error');
    setTimeout(() => {
      window.location.href = 'my-bookings.html';
    }, 800);
    return;
  }


  const currentUser = getCurrentUser();


  if (!currentUser || booking.userId !== currentUser.id) {
    showToast('You are not allowed to view this booking.', 'error');
    setTimeout(() => {
      window.location.href = 'my-bookings.html';
    }, 800);
    return;
  }


  const payment = getData('stayEasePro_payments', [])
    .find(p => p.bookingId === booking.id);


  const room = findById('stayEasePro_rooms', booking.roomId);


  const el = id => document.getElementById(id);


  const statusClassMap = {
    'Checked In': 'badge-success',
    'Confirmed': 'badge-info',
    'Pending Payment': 'badge-warning',
    'Completed': 'badge-primary',
    'Cancelled': 'badge-danger'
  };


  const paymentClassMap = {
    'Paid': 'badge-success',
    'Unpaid': 'badge-danger',
    'Failed': 'badge-danger',
    'Refunded': 'badge-warning'
  };


  // Header
  if (el('bdBookingId')) {
    el('bdBookingId').textContent = booking.id;
  }


  if (el('bdStatus')) {
    el('bdStatus').textContent = booking.status || '—';
    el('bdStatus').className = 'badge ' + (statusClassMap[booking.status] || 'badge-primary');
  }


  // Room image
  const fallbackImages = {
    Standard: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&h=700&fit=crop',
    Deluxe: 'https://images.unsplash.com/photo-1582719478250-c89404bb8a0e?q=80&w=1200&auto=format&fit=crop',
    Suite: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1200&auto=format&fit=crop',
    Family: 'https://images.unsplash.com/photo-1629632072367-48b5b8e22ca2?w=1200&h=700&fit=crop'
  };


  if (el('bdRoomImage')) {
    const img = room && room.image && String(room.image).startsWith('http')
      ? room.image
      : fallbackImages[booking.roomType] || fallbackImages.Standard;


    el('bdRoomImage').src = img;
    el('bdRoomImage').alt = `${booking.roomType || 'Room'} ${booking.roomNumber || ''}`;
  }


  // Room and stay details
  if (el('bdRoomInfo')) {
    el('bdRoomInfo').textContent = `${booking.roomType || 'Room'} Room #${booking.roomNumber || '—'}`;
  }


  if (el('bdGuests')) {
    const guests = Number(booking.guests || 0);
    el('bdGuests').textContent = guests
      ? `${guests} Guest${guests > 1 ? 's' : ''}`
      : '—';
  }


  if (el('bdCheckIn')) {
    el('bdCheckIn').textContent = formatDateTime(booking.checkIn);
  }


  if (el('bdCheckOut')) {
    el('bdCheckOut').textContent = formatDateTime(booking.checkOut);
  }


  // Guest details
  if (el('bdGuestName')) {
    el('bdGuestName').textContent = booking.guestName || currentUser.fullName || '—';
  }


  if (el('bdEmail')) {
    el('bdEmail').textContent = currentUser.email || '—';
  }


  if (el('bdSpecial')) {
    el('bdSpecial').textContent = booking.specialRequest && booking.specialRequest.trim()
      ? booking.specialRequest
      : 'No special request added.';
  }


  // Payment details
  if (el('bdPaymentStatus')) {
    el('bdPaymentStatus').textContent = booking.paymentStatus || '—';
    el('bdPaymentStatus').className = 'badge ' + (paymentClassMap[booking.paymentStatus] || 'badge-primary');
  }


  if (el('bdTotalAmount')) {
    el('bdTotalAmount').textContent = formatCurrency(booking.totalAmount || 0);
  }


  // Digital key
  renderBookingDetailsPasscode(booking);


  // Action buttons
  renderBookingDetailsActions(booking, payment);


  // Feedback visibility
  const feedbackSection = el('feedbackSection');


  if (feedbackSection) {
    if (booking.status === 'Completed') {
      feedbackSection.style.display = 'block';
    } else {
      feedbackSection.style.display = 'none';
    }
  }
}


function renderBookingDetailsPasscode(booking) {
  const keyCard = document.getElementById('bdKeyCard');
  const display = document.getElementById('bdPasscodeDisplay');


  if (!keyCard || !display) return;


  if (!booking.passcode) {
    keyCard.style.display = 'block';
    display.innerHTML = `
      <p class="text-muted font-size-sm">
        Digital key will be generated after successful payment.
      </p>
    `;
    return;
  }


  const status = getPasscodeStatus(booking);


  keyCard.style.display = 'block';


  if (status === 'Active') {
    display.innerHTML = `
      <div class="passcode-display" style="color: var(--success);">
        ${booking.passcode}
      </div>
      <span class="badge badge-success">Active</span>
      <p class="text-muted font-size-sm mt-sm">
        Use this passcode for room entry during your stay.
      </p>
    `;
  } else if (status === 'Expired') {
    display.innerHTML = `
      <div class="passcode-display" style="color: var(--error); text-decoration: line-through;">
        ${booking.passcode}
      </div>
      <span class="badge badge-error">Expired</span>
      <p class="text-muted font-size-sm mt-sm">
        This passcode has expired after checkout.
      </p>
    `;
  } else {
    display.innerHTML = `
      <div class="passcode-display" style="color: var(--text-muted); font-size: 1.5rem; letter-spacing: normal;">
        🔒 Locked
      </div>
      <span class="badge badge-warning">${status}</span>
      <p class="text-muted font-size-sm mt-sm">
        Your passcode will become active at check-in time.
      </p>
    `;
  }
}


function renderBookingDetailsActions(booking, payment) {
  const actions = document.getElementById('bdActions');


  if (!actions) return;


  let html = '';


  if (booking.status === 'Pending Payment') {
    html += `
      payment.html?id=${booking.id}
        <span class="material-symbols-outlined">payments</span>
        Complete Payment
      </a>
    `;
  }


  if (booking.status === 'Confirmed' || booking.status === 'Checked In') {
    html += `
      services.html?booking=${booking.id}
        <span class="material-symbols-outlined">room_service</span>
        Request Service
      </a>


      chat.html?booking=${booking.id}
        <span class="material-symbols-outlined">chat</span>
        Chat with Admin
      </a>
    `;
  }


  if (
    booking.status !== 'Completed' &&
    booking.status !== 'Cancelled' &&
    booking.status !== 'Checked In'
  ) {
    html += `
      <button class="btn btn-ghost text-error" onclick="cancelBookingFromDetails('${booking.id}')">
        <span class="material-symbols-outlined">cancel</span>
        Cancel Booking
      </button>
    `;
  }


  if (payment) {
    html += `
      <button class="btn btn-secondary" id="bdInvoiceBtn">
        <span class="material-symbols-outlined">receipt_long</span>
        View Invoice
      </button>
    `;
  }


  if (!html) {
    html = `
      <p class="text-muted font-size-sm">
        No actions available for this booking.
      </p>
    `;
  }


  actions.innerHTML = html;


  const invoiceBtn = document.getElementById('bdInvoiceBtn');


  if (invoiceBtn) {
    invoiceBtn.addEventListener('click', () => {
      showInvoiceModal(booking, payment);
    });
  }
}


function cancelBookingFromDetails(bookingId) {
  if (!confirm('Are you sure you want to cancel this booking?')) return;


  const booking = findById('stayEasePro_bookings', bookingId);


  if (!booking) {
    showToast('Booking not found.', 'error');
    return;
  }


  if (booking.status === 'Completed' || booking.status === 'Checked In') {
    showToast('This booking cannot be cancelled now.', 'error');
    return;
  }


  const updates = {
    status: 'Cancelled'
  };


  if (booking.paymentStatus === 'Paid') {
    updates.paymentStatus = 'Refunded';


    const payment = getData('stayEasePro_payments', [])
      .find(p => p.bookingId === bookingId);


    if (payment) {
      updateItem('stayEasePro_payments', payment.id, {
        status: 'Refunded'
      });
    }


    addItem('stayEasePro_notifications', {
      id: generateId('NTF'),
      userId: booking.userId,
      type: 'refund',
      message: `Dummy refund of ${formatCurrency(booking.totalAmount)} initiated for booking ${booking.id}.`,
      read: false,
      createdAt: new Date().toISOString(),
      relatedId: booking.id
    });
  }


  updateItem('stayEasePro_bookings', bookingId, updates);


  const room = findById('stayEasePro_rooms', booking.roomId);


  if (room && (room.status === 'Reserved' || room.status === 'Occupied')) {
    updateItem('stayEasePro_rooms', booking.roomId, {
      status: 'Available'
    });
  }


  addItem('stayEasePro_notifications', {
    id: generateId('NTF'),
    userId: booking.userId,
    type: 'booking',
    message: `Booking ${booking.id} has been cancelled.`,
    read: false,
    createdAt: new Date().toISOString(),
    relatedId: booking.id
  });


  showToast('Booking cancelled successfully.', 'success');


  setTimeout(() => {
    window.location.reload();
  }, 700);
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
      <div class="d-flex justify-content-between mb-xs"><span class="text-muted">Invoice #</span><span>INV-${booking.id.replace('BK-', '')}</span></div>
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
