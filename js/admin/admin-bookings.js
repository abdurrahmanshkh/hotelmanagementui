/* ===================================================================
   admin-bookings.js — Bookings Management
   =================================================================== */

let allBookings = [];
let bookingToView = null;

function initBookingsPage() {
  allBookings = getData('stayEasePro_bookings', []);
  renderBookings(allBookings);
  bindBookingEvents();
}

function renderBookings(bookingsList) {
  const tbody = document.querySelector('.admin-table tbody');
  if (!tbody) return;

  tbody.innerHTML = '';
  
  // Sort descending by creation date
  bookingsList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (bookingsList.length === 0) {
    tbody.innerHTML = `<tr><td colspan="10" class="text-center text-muted" style="padding: 40px;">No bookings found.</td></tr>`;
    return;
  }

  bookingsList.forEach(b => {
    let statusBadge = 'badge-warning';
    if (b.status === 'Checked In') statusBadge = 'badge-info';
    if (b.status === 'Completed') statusBadge = 'badge-success';
    if (b.status === 'Cancelled') statusBadge = 'badge-danger';

    let payBadge = 'badge-warning';
    if (b.paymentStatus === 'Paid') payBadge = 'badge-success';
    if (b.paymentStatus === 'Refunded') payBadge = 'badge-danger';

    let passBadge = 'badge-neutral';
    if (b.passcodeStatus === 'Active') passBadge = 'badge-success';
    if (b.passcodeStatus === 'Locked') passBadge = 'badge-warning';
    if (b.passcodeStatus === 'Expired') passBadge = 'badge-danger';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td data-label="Booking ID"><strong>${b.id}</strong></td>
      <td data-label="Guest Name">${b.guestName}</td>
      <td data-label="Room">${b.roomNumber}</td>
      <td data-label="Check-in">${formatDateOnly(b.checkIn)}</td>
      <td data-label="Check-out">${formatDateOnly(b.checkOut)}</td>
      <td data-label="Status"><span class="admin-badge ${statusBadge}">${b.status}</span></td>
      <td data-label="Payment"><span class="admin-badge ${payBadge}">${b.paymentStatus}</span></td>
      <td data-label="Passcode"><span class="admin-badge ${passBadge}">${b.passcodeStatus || 'N/A'}</span></td>
      <td data-label="Total">${formatAdminCurrency(b.totalAmount)}</td>
      <td data-label="Actions">
        <div class="d-flex gap-sm">
          <button class="admin-btn admin-btn-icon view-btn" data-id="${b.id}" title="View Details"><span class="material-symbols-outlined" style="font-size:18px;">visibility</span></button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      openBookingDetails(id);
    });
  });
}

function bindBookingEvents() {
  const searchInput = document.querySelector('.search-bar input');
  const statusSelect = document.querySelectorAll('.admin-form-control')[1]; // assuming 2nd input is status select

  function filterBookings() {
    const q = searchInput ? searchInput.value.toLowerCase() : '';
    const status = statusSelect ? statusSelect.value : 'All Statuses';

    const filtered = allBookings.filter(b => {
      const matchQ = b.id.toLowerCase().includes(q) || b.guestName.toLowerCase().includes(q) || b.roomNumber.toString().includes(q);
      const matchStatus = status === 'All Statuses' || b.status === status;
      return matchQ && matchStatus;
    });
    renderBookings(filtered);
  }

  if (searchInput) searchInput.addEventListener('input', filterBookings);
  if (statusSelect) statusSelect.addEventListener('change', filterBookings);
}

function openBookingDetails(id) {
  bookingToView = allBookings.find(b => b.id === id);
  if (!bookingToView) return;

  document.querySelector('#bookingDetailModal h3').textContent = 'Booking #' + bookingToView.id;
  
  const bBody = document.querySelector('#bookingDetailModal .admin-modal-body');
  bBody.innerHTML = `
    <div class="admin-grid-half" style="margin-bottom:0;">
      <div class="admin-card" style="box-shadow:none; border-color:var(--admin-surface-border);">
        <h4 style="margin:0 0 16px 0;">Stay Details</h4>
        <p><strong>Guest:</strong> ${bookingToView.guestName}</p>
        <p><strong>Room:</strong> ${bookingToView.roomNumber} (${bookingToView.roomType})</p>
        <p><strong>Check-in:</strong> ${formatAdminDate(bookingToView.checkIn)}</p>
        <p><strong>Check-out:</strong> ${formatAdminDate(bookingToView.checkOut)}</p>
        <p><strong>Special Request:</strong> ${bookingToView.specialRequest || 'None'}</p>
      </div>
      <div class="admin-card" style="box-shadow:none; border-color:var(--admin-surface-border);">
        <h4 style="margin:0 0 16px 0;">Status</h4>
        <div class="d-flex justify-between mb-sm">
          <span>Booking</span> <span class="admin-badge badge-info">${bookingToView.status}</span>
        </div>
        <div class="d-flex justify-between mb-sm">
          <span>Payment</span> <span class="admin-badge badge-success">${bookingToView.paymentStatus}</span>
        </div>
        <div class="d-flex justify-between">
          <span>Passcode</span> <span class="admin-badge badge-success">${bookingToView.passcodeStatus || 'N/A'}</span>
          <button class="admin-btn admin-btn-outline" style="padding:2px 6px; font-size:10px;" onclick="alert('Passcode: ${bookingToView.passcode || 'Not Generated'}')">View Code</button>
        </div>
        <hr style="border:0; border-top:1px solid var(--admin-surface-border); margin:16px 0;">
        <div class="d-flex justify-between" style="font-size:1.25rem; font-weight:700;">
          <span>Total</span> <span>${formatAdminCurrency(bookingToView.totalAmount)}</span>
        </div>
      </div>
    </div>
  `;

  // Update Footer buttons
  const footer = document.querySelector('#bookingDetailModal .admin-modal-footer');
  footer.innerHTML = `
    ${bookingToView.status !== 'Cancelled' && bookingToView.status !== 'Completed' ? 
      `<button class="admin-btn admin-btn-outline text-danger cancel-booking-btn" style="margin-right:auto; border-color:transparent;">Cancel Booking</button>` : ''}
    <button class="admin-btn admin-btn-outline" data-modal-close>Close</button>
    ${bookingToView.status === 'Confirmed' ? `<button class="admin-btn admin-btn-primary checkin-btn">Mark Check-in</button>` : ''}
    ${bookingToView.status === 'Checked In' ? `<button class="admin-btn admin-btn-primary checkout-btn">Mark Check-out</button>` : ''}
  `;

  const cancelBtn = footer.querySelector('.cancel-booking-btn');
  if (cancelBtn) cancelBtn.addEventListener('click', cancelBooking);

  const checkinBtn = footer.querySelector('.checkin-btn');
  if (checkinBtn) checkinBtn.addEventListener('click', markCheckIn);

  const checkoutBtn = footer.querySelector('.checkout-btn');
  if (checkoutBtn) checkoutBtn.addEventListener('click', markCheckOut);

  openModal('bookingDetailModal');
}

function cancelBooking() {
  if (confirm('Are you sure you want to cancel this booking? If it is paid, it will be marked as Refunded.')) {
    let payStatus = bookingToView.paymentStatus;
    if (payStatus === 'Paid') {
      payStatus = 'Refunded';
      // Find and refund payment in payments array
      const payments = getData('stayEasePro_payments', []);
      const payRec = payments.find(p => p.bookingId === bookingToView.id);
      if (payRec) {
        payRec.status = 'Refunded';
        setData('stayEasePro_payments', payments);
      }
    }
    
    updateItem('stayEasePro_bookings', bookingToView.id, {
      status: 'Cancelled',
      paymentStatus: payStatus,
      passcodeStatus: 'Expired'
    });

    // Make room available
    const rooms = getData('stayEasePro_rooms', []);
    const room = rooms.find(r => r.id === bookingToView.roomId);
    if (room && room.status === 'Reserved') {
      room.status = 'Available';
      setData('stayEasePro_rooms', rooms);
    }

    showToast('Booking cancelled.', 'error');
    closeModal('bookingDetailModal');
    initBookingsPage();
  }
}

function markCheckIn() {
  if (bookingToView.paymentStatus !== 'Paid') {
    showToast('Cannot check in. Payment is not paid.', 'warning');
    return;
  }
  
  updateItem('stayEasePro_bookings', bookingToView.id, {
    status: 'Checked In',
    passcodeStatus: 'Active'
  });

  const rooms = getData('stayEasePro_rooms', []);
  const room = rooms.find(r => r.id === bookingToView.roomId);
  if (room) {
    room.status = 'Occupied';
    setData('stayEasePro_rooms', rooms);
  }

  showToast('Guest checked in successfully.', 'success');
  closeModal('bookingDetailModal');
  initBookingsPage();
}

function markCheckOut() {
  updateItem('stayEasePro_bookings', bookingToView.id, {
    status: 'Completed',
    passcodeStatus: 'Expired'
  });

  const rooms = getData('stayEasePro_rooms', []);
  const room = rooms.find(r => r.id === bookingToView.roomId);
  if (room) {
    room.status = 'Under Cleaning';
    room.cleaningStatus = 'Required';
    setData('stayEasePro_rooms', rooms);
  }

  showToast('Guest checked out. Room marked for cleaning.', 'success');
  closeModal('bookingDetailModal');
  initBookingsPage();
}
