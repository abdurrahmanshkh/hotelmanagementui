/* ===================================================================
   payment.js — Dummy Payment Flow
   =================================================================== */

function initPayment() {
  const form = document.getElementById('paymentForm');
  if (!form) return;
  if (!requireAuth()) return;

  // Load booking
  let booking;
  const params = new URLSearchParams(window.location.search);
  const bookingId = params.get('id');
  if (bookingId) {
    booking = findById('stayEasePro_bookings', bookingId);
  } else {
    const raw = sessionStorage.getItem('stayEasePro_pendingBooking');
    booking = raw ? JSON.parse(raw) : null;
  }

  if (!booking) { showToast('No booking found for payment.', 'error'); return; }

  // Populate order summary
  const el = id => document.getElementById(id);
  if (el('payRoomInfo'))  el('payRoomInfo').textContent = `${booking.roomType} Room`;
  if (el('payDates'))     el('payDates').textContent = `${formatDateOnly(booking.checkIn)} – ${formatDateOnly(booking.checkOut)}`;
  if (el('payTotal'))     el('payTotal').textContent = formatCurrency(booking.totalAmount);
  if (el('payBtnText'))   el('payBtnText').textContent = `Pay ${formatCurrency(booking.totalAmount)}`;

  // Tab switching
  document.querySelectorAll('[data-pay-tab]').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('[data-pay-tab]').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll('.payment-method-content').forEach(c => c.classList.remove('active'));
      document.getElementById(`pay-${tab.dataset.payTab}`)?.classList.add('active');
    });
  });

  // Pay Now
  el('payNowBtn')?.addEventListener('click', () => processPayment(booking, false));
  el('payFailBtn')?.addEventListener('click', () => processPayment(booking, true));
}

function processPayment(booking, simulateFail) {
  // Validate active payment method
  const activeTab = document.querySelector('[data-pay-tab].active')?.dataset.payTab || 'card';
  let valid = true;
  const form = document.getElementById('paymentForm');
  if (form) clearFormErrors(form);

  if (activeTab === 'card') {
    const name = document.getElementById('cardName');
    const num  = document.getElementById('cardNumber');
    const exp  = document.getElementById('cardExpiry');
    const cvv  = document.getElementById('cardCVV');
    if (!isRequired(name?.value)) { showInlineError(name, 'Cardholder name required.'); valid = false; }
    if (!isValidCardNumber(num?.value)) { showInlineError(num, 'Card number must be 16 digits.'); valid = false; }
    if (!isRequired(exp?.value)) { showInlineError(exp, 'Expiry date required.'); valid = false; }
    if (!isValidCVV(cvv?.value)) { showInlineError(cvv, 'CVV must be 3 digits.'); valid = false; }
  } else if (activeTab === 'upi') {
    const upi = document.getElementById('upiId');
    if (!isValidUPI(upi?.value)) { showInlineError(upi, 'Valid UPI ID required (e.g. name@bank).'); valid = false; }
  } else if (activeTab === 'netbanking') {
    const bank = document.getElementById('bankSelect');
    if (!isRequired(bank?.value)) { showToast('Please select a bank.', 'warning'); valid = false; }
  } else if (activeTab === 'wallet') {
    const wallet = document.getElementById('walletSelect');
    if (!isRequired(wallet?.value)) { showToast('Please select a wallet.', 'warning'); valid = false; }
  }
  if (!valid) return;

  // Show processing
  const payBtn = document.getElementById('payNowBtn');
  if (payBtn) setButtonLoading(payBtn, 'Processing…');
  showToast('Processing payment…', 'info');

  setTimeout(() => {
    if (payBtn) clearButtonLoading(payBtn);

    if (simulateFail) {
      // Failed payment
      updateItem('stayEasePro_bookings', booking.id, { paymentStatus: 'Failed' });
      addItem('stayEasePro_payments', {
        id: generateId('PAY'), bookingId: booking.id, userId: booking.userId,
        amount: booking.totalAmount, method: activeTab, status: 'Failed',
        paidAt: new Date().toISOString()
      });
      addItem('stayEasePro_notifications', {
        id: generateId('NTF'), userId: booking.userId, type: 'payment',
        message: `Payment failed for booking ${booking.id}. Please retry.`,
        read: false, createdAt: new Date().toISOString(), relatedId: booking.id
      });
      showPaymentResult('failed', booking);
      return;
    }

    // Successful payment
    const passcode = generateUniquePasscode();
    const passcodeStatus = getPasscodeStatus({ ...booking, passcode });

    const paymentId = generateId('PAY');
    addItem('stayEasePro_payments', {
      id: paymentId, bookingId: booking.id, userId: booking.userId,
      amount: booking.totalAmount, method: activeTab, status: 'Paid',
      paidAt: new Date().toISOString()
    });

    updateItem('stayEasePro_bookings', booking.id, {
      status: 'Confirmed',
      paymentStatus: 'Paid',
      passcode: passcode,
      passcodeStatus: passcodeStatus
    });

    // Update room status to Reserved (for future bookings)
    const room = findById('stayEasePro_rooms', booking.roomId);
    if (room && room.status === 'Available') {
      const now = new Date();
      const checkIn = new Date(booking.checkIn);
      if (checkIn > now) {
        updateItem('stayEasePro_rooms', booking.roomId, { status: 'Reserved' });
      }
    }

    // Notifications
    addItem('stayEasePro_notifications', {
      id: generateId('NTF'), userId: booking.userId, type: 'payment',
      message: `Payment of ${formatCurrency(booking.totalAmount)} received. Booking ${booking.id} confirmed!`,
      read: false, createdAt: new Date().toISOString(), relatedId: paymentId
    });
    addItem('stayEasePro_notifications', {
      id: generateId('NTF'), userId: booking.userId, type: 'passcode',
      message: `Your room passcode has been generated for Room ${booking.roomNumber}.`,
      read: false, createdAt: new Date().toISOString(), relatedId: booking.id
    });

    recalculateDynamicPricing();
    sessionStorage.removeItem('stayEasePro_pendingBooking');
    showPaymentResult('success', booking, paymentId);

  }, 1500);
}

function showPaymentResult(result, booking, paymentId) {
  const modal = document.getElementById('paymentResultModal');
  if (!modal) return;
  const body = document.getElementById('paymentResultBody');

  if (result === 'success') {
    body.innerHTML = `
      <div style="width:80px;height:80px;border-radius:50%;background-color:var(--success-bg);color:var(--success);display:flex;align-items:center;justify-content:center;font-size:3rem;margin:0 auto var(--space-lg) auto;">✓</div>
      <h2 class="mb-sm" style="color:var(--success);">Payment Successful!</h2>
      <p class="text-muted mb-lg">Your booking is confirmed.</p>
      <div class="bg-background p-md text-left mb-lg" style="border-radius:var(--radius-md);">
        <div class="d-flex justify-content-between mb-xs"><span class="text-muted">Payment ID:</span><span class="font-weight-600">${paymentId}</span></div>
        <div class="d-flex justify-content-between mb-xs"><span class="text-muted">Booking ID:</span><span class="font-weight-600">${booking.id}</span></div>
        <div class="d-flex justify-content-between mb-xs"><span class="text-muted">Amount Paid:</span><span class="font-weight-600">${formatCurrency(booking.totalAmount)}</span></div>
      </div>
      <p style="font-size:0.85rem;color:var(--primary);background:var(--info-bg);padding:var(--space-sm);border-radius:var(--radius-sm);" class="mb-lg">
        ℹ️ Your digital room passcode will activate at check-in time.
      </p>
      <div class="d-flex gap-md justify-content-center">
        <a href="dashboard.html" class="btn btn-secondary">Go to Dashboard</a>
        <a href="booking-details.html?id=${booking.id}" class="btn btn-primary">View Booking</a>
      </div>`;
  } else {
    body.innerHTML = `
      <div style="width:80px;height:80px;border-radius:50%;background-color:var(--error-bg);color:var(--error);display:flex;align-items:center;justify-content:center;font-size:3rem;margin:0 auto var(--space-lg) auto;">✕</div>
      <h2 class="mb-sm" style="color:var(--error);">Payment Failed</h2>
      <p class="text-muted mb-lg">The payment could not be processed. Please try again.</p>
      <div class="d-flex gap-md justify-content-center">
        <button class="btn btn-primary" onclick="closeModal('paymentResultModal')">Retry Payment</button>
        <a href="dashboard.html" class="btn btn-secondary">Go to Dashboard</a>
      </div>`;
  }
  openModal('paymentResultModal');
}
