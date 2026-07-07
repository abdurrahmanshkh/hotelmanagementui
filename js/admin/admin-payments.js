/* ===================================================================
   admin-payments.js — Payments & Refunds
   =================================================================== */

let allPayments = [];
let allBookingsForPayments = [];

function initPaymentsPage() {
  allPayments = getData('stayEasePro_payments', []);
  allBookingsForPayments = getData('stayEasePro_bookings', []);
  renderPayments(allPayments);
  renderPaymentMetrics();

  const searchInput = document.querySelector('.search-bar input');
  const statusSelect = document.querySelectorAll('.admin-form-control')[1];

  function filterPayments() {
    const q = searchInput ? searchInput.value.toLowerCase() : '';
    const status = statusSelect ? statusSelect.value : 'All Statuses';

    const filtered = allPayments.filter(p => {
      const bInfo = allBookingsForPayments.find(b => b.id === p.bookingId);
      const matchQ = p.id.toLowerCase().includes(q) || (bInfo && bInfo.guestName.toLowerCase().includes(q));
      const matchStatus = status === 'All Statuses' || p.status === status;
      return matchQ && matchStatus;
    });
    renderPayments(filtered);
  }

  if (searchInput) searchInput.addEventListener('input', filterPayments);
  if (statusSelect) statusSelect.addEventListener('change', filterPayments);
}

function renderPayments(payments) {
  const tbody = document.querySelector('.admin-table tbody');
  if (!tbody) return;

  tbody.innerHTML = '';
  
  if (payments.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted" style="padding: 40px;">No payments found.</td></tr>`;
    return;
  }

  // Sort descending by date
  payments.sort((a, b) => new Date(b.paidAt || 0) - new Date(a.paidAt || 0));

  payments.forEach(pay => {
    let statusBadge = 'badge-warning';
    if (pay.status === 'Paid') statusBadge = 'badge-success';
    if (pay.status === 'Refunded') statusBadge = 'badge-danger';

    const booking = allBookingsForPayments.find(b => b.id === pay.bookingId);
    const guestName = booking ? booking.guestName : 'Unknown Guest';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td data-label="Payment ID"><strong>${pay.id}</strong></td>
      <td data-label="Booking ID">${pay.bookingId}</td>
      <td data-label="Guest Name">${guestName}</td>
      <td data-label="Amount">${formatAdminCurrency(pay.amount)}</td>
      <td data-label="Method">${pay.method}</td>
      <td data-label="Status"><span class="admin-badge ${statusBadge}">${pay.status}</span></td>
      <td data-label="Date">${formatAdminDate(pay.paidAt)}</td>
      <td data-label="Actions">
        <div class="d-flex gap-sm">
          ${pay.status === 'Paid' ? `<button class="admin-btn admin-btn-icon text-danger" title="Mark Refund" onclick="markRefund('${pay.id}')"><span class="material-symbols-outlined" style="font-size:18px;">undo</span></button>` : ''}
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function markRefund(id) {
  if (confirm('Are you sure you want to mark this payment as Refunded?')) {
    updateItem('stayEasePro_payments', id, { status: 'Refunded' });
    
    // Also update booking status
    const pay = allPayments.find(p => p.id === id);
    if (pay) {
      updateItem('stayEasePro_bookings', pay.bookingId, { paymentStatus: 'Refunded' });
    }
    
    showToast('Payment refunded.', 'success');
    initPaymentsPage();
  }
}

function renderPaymentMetrics() {
  const cards = document.querySelectorAll('.admin-bento-grid .admin-card');
  if (cards.length < 3) return;

  const today = new Date().toISOString().split('T')[0];
  const thisMonth = today.substring(0, 7); // YYYY-MM

  // 1. Revenue Today
  const revenueToday = allPayments
    .filter(p => p.status === 'Paid' && p.paidAt && p.paidAt.startsWith(today))
    .reduce((sum, p) => sum + p.amount, 0);

  // 2. Pending Payments
  const pendingPayments = allBookingsForPayments
    .filter(b => b.status !== 'Cancelled' && (b.paymentStatus === 'Pending' || b.paymentStatus === 'Unpaid' || b.paymentStatus === 'Pending Payment'))
    .reduce((sum, b) => sum + b.totalAmount, 0);

  // 3. Refunds This Month
  const refundsMonth = allPayments
    .filter(p => p.status === 'Refunded' && p.paidAt && p.paidAt.startsWith(thisMonth))
    .reduce((sum, p) => sum + p.amount, 0);

  cards[0].querySelector('.metric-value').textContent = formatAdminCurrency(revenueToday);
  cards[1].querySelector('.metric-value').textContent = formatAdminCurrency(pendingPayments);
  cards[2].querySelector('.metric-value').textContent = formatAdminCurrency(refundsMonth);
}
