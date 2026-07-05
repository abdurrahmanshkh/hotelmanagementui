/* ===================================================================
   admin-dashboard.js — Dashboard metrics and charts
   =================================================================== */

function initDashboard() {
  const rooms = getData('stayEasePro_rooms', []);
  const bookings = getData('stayEasePro_bookings', []);
  const serviceReqs = getData('stayEasePro_serviceRequests', []);
  const payments = getData('stayEasePro_payments', []);
  const chats = getData('stayEasePro_chats', []);

  // 1. Calculate Metrics
  const totalRooms = rooms.length;
  const availableRooms = rooms.filter(r => r.status === 'Available').length;
  
  // Occupancy rate calculation (Occupied / Total)
  const occupiedRooms = rooms.filter(r => r.status === 'Occupied').length;
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  // Today's Revenue (Payments with status 'Paid' and date is today)
  const today = new Date().toISOString().split('T')[0];
  const todayRevenue = payments
    .filter(p => p.status === 'Paid' && p.paidAt && p.paidAt.startsWith(today))
    .reduce((sum, p) => sum + p.amount, 0);

  // Service Requests
  const pendingRequests = serviceReqs.filter(s => s.status !== 'Completed' && s.status !== 'Rejected');
  const emergencyReqs = pendingRequests.filter(s => s.priority === 'Emergency').length;

  // Unread Chats
  let unreadChatsCount = 0;
  chats.forEach(chat => {
    const unread = chat.messages.filter(m => m.sender === 'customer' && !m.read).length;
    if (unread > 0) unreadChatsCount++;
  });

  // 2. Render Metrics to DOM
  const metricCards = document.querySelectorAll('.admin-card');
  if (metricCards.length >= 6) {
    // Relying on DOM order based on admin/dashboard.html structure
    // [0] Total Rooms
    metricCards[0].querySelector('.metric-value').textContent = totalRooms;
    
    // [1] Available
    metricCards[1].querySelector('.metric-value').textContent = availableRooms;
    
    // [2] Occupancy Rate
    metricCards[2].querySelector('.metric-value').textContent = occupancyRate + '%';
    const progressBar = metricCards[2].querySelector('div > div');
    if (progressBar) progressBar.style.width = occupancyRate + '%';

    // [3] Revenue Today
    metricCards[3].querySelector('.metric-value').textContent = formatAdminCurrency(todayRevenue);
    
    // [4] Service Requests
    metricCards[4].querySelector('.metric-value').textContent = pendingRequests.length;
    const sReqTrend = metricCards[4].querySelector('.metric-trend');
    if (sReqTrend) {
      if (emergencyReqs > 0) {
        sReqTrend.className = 'metric-trend down';
        sReqTrend.innerHTML = `<span class="material-symbols-outlined" style="font-size:14px;">warning</span> ${emergencyReqs} High`;
      } else {
        sReqTrend.style.display = 'none';
      }
    }

    // [5] Unread Chats
    metricCards[5].querySelector('.metric-value').textContent = unreadChatsCount;
  }

  // 3. Render Recent Bookings Table
  const tbody = document.querySelector('.admin-table tbody');
  if (tbody) {
    tbody.innerHTML = '';
    const recentBookings = [...bookings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
    
    if (recentBookings.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted">No recent bookings</td></tr>`;
    } else {
      recentBookings.forEach(b => {
        const paymentBadge = b.paymentStatus === 'Paid' ? 'badge-success' : (b.paymentStatus === 'Refunded' ? 'badge-danger' : 'badge-warning');
        const statusBadge = b.status === 'Checked In' ? 'badge-info' : (b.status === 'Completed' ? 'badge-success' : 'badge-warning');
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td data-label="Booking ID"><strong>${b.id}</strong></td>
          <td data-label="Guest Name">${b.guestName}</td>
          <td data-label="Room">${b.roomNumber} (${b.roomType})</td>
          <td data-label="Check-in">${formatDateOnly(b.checkIn)}</td>
          <td data-label="Check-out">${formatDateOnly(b.checkOut)}</td>
          <td data-label="Status"><span class="admin-badge ${statusBadge}">${b.status}</span></td>
          <td data-label="Payment"><span class="admin-badge ${paymentBadge}">${b.paymentStatus}</span></td>
          <td data-label="Actions">
            <a href="bookings.html" class="admin-btn admin-btn-icon" title="View"><span class="material-symbols-outlined" style="font-size:18px;">visibility</span></a>
          </td>
        `;
        tbody.appendChild(tr);
      });
    }
  }

  // Bind placeholder buttons
  document.querySelectorAll('.page-header .admin-btn-outline').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      showToast('Date range filtering will be fully implemented later.', 'info');
    });
  });
}
