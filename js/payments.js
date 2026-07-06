/* ===================================================================
   payments.js — Payment processing for bookings
   =================================================================== */

/** Initialize payment page. */
function initPayment() {
  const form = document.getElementById('paymentForm');
  if (!form) return;
  if (!requireAuth()) return;

  const user = getCurrentUser();
  const params = new URLSearchParams(window.location.search);
  const bookingId = params.get('id');
  let booking = bookingId ? findById('stayEasePro_bookings', bookingId) : null;

  // Fallback to pending booking
  if (!booking) {
    const raw = sessionStorage.getItem('stayEasePro_pendingBooking');
    booking = raw ? JSON.parse(raw) : null;
  }

  if (!booking) {
    showToast('No booking found.', 'error');
    setTimeout(() => window.location.href = 'rooms.html', 1000);
    return;
  }

  const room = findById('stayEasePro_rooms', booking.roomId);
  const nights = Math.ceil((new Date(booking.checkOut) - new Date(booking.checkIn)) / (1000 * 60 * 60 * 24));
  const roomPrice = room ? room.dynamicPrice : Math.round(booking.totalAmount / 1.17 / nights);

  // Display payment details
  const el = (id) => document.getElementById(id);
  if (el('payRoomInfo')) el('payRoomInfo').textContent = `${booking.roomType} Room #${booking.roomNumber}`;
  if (el('payDates')) el('payDates').innerHTML = `<span class="material-symbols-outlined" style="font-size:16px;">calendar_month</span> ${formatDateOnly(booking.checkIn)} – ${formatDateOnly(booking.checkOut)} (${nights} night${nights > 1 ? 's' : ''})`;
  if (el('payTotal')) el('payTotal').textContent = formatCurrency(booking.totalAmount);

  // Tab switching for payment methods
  const tabs = document.querySelectorAll('.tab[data-pay-tab]');
  const contents = document.querySelectorAll('.payment-method-content');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => c.style.display = 'none');
      tab.classList.add('active');
      const tabName = tab.dataset.payTab;
      const content = document.getElementById(`pay-${tabName}`);
      if (content) content.style.display = 'block';
    });
  });

  // Pay Now button
  const payBtn = el('payNowBtn');
  if (payBtn) {
    payBtn.addEventListener('click', () => handlePayment(booking, user));
  }

  // Simulate Failed Payment button (for demo)
  const failBtn = el('payFailBtn');
  if (failBtn) {
    failBtn.addEventListener('click', () => {
      showToast('Simulated payment failure. Please try again.', 'error');
    });
  }
}



/** Handle payment processing. */
function handlePayment(booking, user) {
  // Determine active payment method tab
  const activeTab = document.querySelector('.tab.active');
  const method = activeTab?.dataset.payTab;
  
  if (!method) {
    showToast('Please select a payment method.', 'warning');
    return;
  }

  let valid = true;
  const el = (id) => document.getElementById(id);

  // Validate based on method
  if (method === 'card') {
    const cardName = el('cardName')?.value?.trim();
    const cardNumber = el('cardNumber')?.value?.trim();
    const cardExpiry = el('cardExpiry')?.value?.trim();
    const cardCVV = el('cardCVV')?.value?.trim();

    if (!cardName || cardName.length < 3) {
      showToast('Valid cardholder name required.', 'warning');
      valid = false;
    }
    if (!isValidCardNumber(cardNumber)) {
      showToast('Valid 16-digit card number required.', 'warning');
      valid = false;
    }
    if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
      showToast('Use MM/YY format for expiry.', 'warning');
      valid = false;
    }
    if (!isValidCVV(cardCVV)) {
      showToast('Valid 3-digit CVV required.', 'warning');
      valid = false;
    }
  } else if (method === 'upi') {
    const upiId = el('upiId')?.value?.trim();
    if (!isValidUPI(upiId)) {
      showToast('Valid UPI ID required (e.g., name@upi).', 'warning');
      valid = false;
    }
  } else if (method === 'netbanking') {
    const bank = el('bankSelect')?.value;
    if (!bank) {
      showToast('Please select a bank.', 'warning');
      valid = false;
    }
  } else if (method === 'wallet') {
    const wallet = el('walletSelect')?.value;
    if (!wallet) {
      showToast('Please select a wallet.', 'warning');
      valid = false;
    }
  }

  if (!valid) return;

  // Simulate payment processing
  const payBtn = el('payNowBtn');
  if (payBtn) {
    payBtn.disabled = true;
    payBtn.textContent = 'Processing...';
  }

  // Simulate API call delay
  setTimeout(() => {
    // Update booking status
    const updates = {
      status: 'Confirmed',
      paymentStatus: 'Paid',
      passcode: generatePasscode(),
      passcodeStatus: 'Active'
    };
    updateItem('stayEasePro_bookings', booking.id, updates);

    // Record payment
    const payment = {
      id: generateId('PAY'),
      bookingId: booking.id,
      userId: user.id,
      amount: booking.totalAmount,
      method: method.toUpperCase(),
      status: 'Paid',
      paidAt: new Date().toISOString()
    };
    addItem('stayEasePro_payments', payment);

    // Send notifications
    addItem('stayEasePro_notifications', {
      id: generateId('NTF'),
      userId: user.id,
      type: 'payment',
      message: `Payment of ${formatCurrency(booking.totalAmount)} received successfully.`,
      read: false,
      createdAt: new Date().toISOString(),
      relatedId: payment.id
    });

    addItem('stayEasePro_notifications', {
      id: generateId('NTF'),
      userId: user.id,
      type: 'passcode',
      message: `Your room passcode ${updates.passcode} is now active for Room ${booking.roomNumber}.`,
      read: false,
      createdAt: new Date().toISOString(),
      relatedId: booking.id
    });

    showToast('Payment successful!', 'success');
    
    // Clear session and redirect
    sessionStorage.removeItem('stayEasePro_pendingBooking');
    setTimeout(() => {
      window.location.href = `booking-details.html?id=${booking.id}`;
    }, 1000);
  }, 2000);
}

/** Generate a random 6-digit passcode. */
function generatePasscode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/** Validate card number format (16 digits). */
function isValidCardNumber(num) {
  if (!num) return false;
  const cleaned = String(num).replace(/\s/g, '');
  return /^\d{16}$/.test(cleaned);
}

/** Validate CVV format (3 digits). */
function isValidCVV(cvv) {
  if (!cvv) return false;
  return /^\d{3}$/.test(String(cvv).trim());
}

/** Validate UPI ID format. */
function isValidUPI(upi) {
  if (!upi) return false;
  return /^[\w.\-]+@[\w]+$/.test(String(upi).toLowerCase());
}
