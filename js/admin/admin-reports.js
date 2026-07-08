/* ===================================================================
   admin-reports.js — Reports and Analytics Module
   =================================================================== */

let bookingsData = [];
let roomsData = [];
let paymentsData = [];
let serviceRequestsData = [];
let guestsData = [];

function initReportsPage() {
  // Load data from localStorage
  bookingsData = getData('stayEasePro_bookings', []);
  roomsData = getData('stayEasePro_rooms', []);
  paymentsData = getData('stayEasePro_payments', []);
  serviceRequestsData = getData('stayEasePro_serviceRequests', []);
  guestsData = getData('stayEasePro_users', []).filter(u => u.role === 'customer');

  // Setup tab switcher
  setupReportTabs();

  // Load metrics & initial report (Revenue)
  renderSummaryMetrics();
  renderRevenueReport();
  renderBookingsReport();
  renderOccupancyReport();
  renderServicesReport();
}

// ── Tab Switcher ───────────────────────────────────────────────────
function setupReportTabs() {
  const tabs = document.querySelectorAll('.report-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active from all tabs & sections
      tabs.forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.report-section').forEach(sec => sec.classList.remove('active'));

      // Add active to current
      tab.classList.add('active');
      const targetSection = document.getElementById(`tab-${tab.dataset.tab}`);
      if (targetSection) {
        targetSection.classList.add('active');
      }
    });
  });
}

// ── Summary Metrics ────────────────────────────────────────────────
function renderSummaryMetrics() {
  // Total Revenue (Only from Paid payments)
  const paidPayments = paymentsData.filter(p => p.status === 'Paid');
  const totalRevenue = paidPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  
  // Total Bookings (Excluding Cancelled)
  const activeBookings = bookingsData.filter(b => b.status !== 'Cancelled');
  const totalBookings = activeBookings.length;

  // Average Occupancy
  // Calculated based on nights booked / capacity over the last 30 days
  let totalNightsBooked = 0;
  activeBookings.forEach(b => {
    const checkIn = new Date(b.checkIn);
    const checkOut = new Date(b.checkOut);
    const diffTime = Math.abs(checkOut - checkIn);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    totalNightsBooked += diffDays;
  });
  const totalCapacityNights = (roomsData.length || 1) * 30; // standard 30 days window
  const avgOccupancy = Math.min(100, Math.round((totalNightsBooked / totalCapacityNights) * 100)) || 0;

  // Unique Guests who have booked
  const uniqueGuestIds = new Set(bookingsData.map(b => b.userId));
  const uniqueGuestsCount = uniqueGuestIds.size;

  // Update UI Elements
  document.getElementById('metricTotalRevenue').textContent = formatAdminCurrency(totalRevenue);
  document.getElementById('metricTotalBookings').textContent = totalBookings;
  document.getElementById('metricOccupancy').textContent = `${avgOccupancy}%`;
  document.getElementById('metricTotalGuests').textContent = uniqueGuestsCount;
}

// ── Revenue Report ─────────────────────────────────────────────────
function renderRevenueReport() {
  const typeRevenue = {};
  const typeBookings = {};

  // Initialize types
  roomsData.forEach(r => {
    typeRevenue[r.type] = 0;
    typeBookings[r.type] = 0;
  });

  // Calculate
  bookingsData.forEach(b => {
    if (b.status !== 'Cancelled') {
      const type = b.roomType || 'Standard';
      if (typeRevenue[type] === undefined) {
        typeRevenue[type] = 0;
        typeBookings[type] = 0;
      }
      typeBookings[type]++;
      
      // Add corresponding paid payment
      const p = paymentsData.find(pay => pay.bookingId === b.id && pay.status === 'Paid');
      if (p) {
        typeRevenue[type] += p.amount;
      }
    }
  });

  // Render Chart
  const chartContainer = document.getElementById('revenueChart');
  if (chartContainer) {
    chartContainer.innerHTML = '';
    const maxVal = Math.max(...Object.values(typeRevenue), 1);
    
    Object.keys(typeRevenue).forEach(type => {
      const val = typeRevenue[type];
      const pct = Math.round((val / maxVal) * 100);
      
      const barWrapper = document.createElement('div');
      barWrapper.className = 'chart-bar-wrapper';
      barWrapper.innerHTML = `
        <span class="chart-bar-value">${formatAdminCurrency(val)}</span>
        <div class="chart-bar" style="height: ${Math.max(5, pct)}%;"></div>
        <span class="chart-bar-label" title="${type}">${type}</span>
      `;
      chartContainer.appendChild(barWrapper);
    });
  }

  // Render Table
  const tbody = document.getElementById('revenueTableBody');
  if (tbody) {
    tbody.innerHTML = '';
    const totalRevAll = Object.values(typeRevenue).reduce((a, b) => a + b, 0) || 1;
    
    Object.keys(typeRevenue).forEach(type => {
      const rev = typeRevenue[type];
      const bCount = typeBookings[type];
      const avg = bCount > 0 ? Math.round(rev / bCount) : 0;
      const share = Math.round((rev / totalRevAll) * 100);
      
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight:600;">${type}</td>
        <td>${bCount}</td>
        <td class="text-success">${formatAdminCurrency(rev)}</td>
        <td>${formatAdminCurrency(avg)}</td>
        <td>
          <div class="d-flex align-center gap-xs">
            <span style="font-weight:600; min-width:30px;">${share}%</span>
            <div style="flex:1; height:6px; background:var(--admin-surface-alt); border-radius:3px; overflow:hidden;">
              <div style="width:${share}%; height:100%; background:var(--admin-primary); border-radius:3px;"></div>
            </div>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }
}

// ── Bookings Report ────────────────────────────────────────────────
function renderBookingsReport() {
  const statusCounts = {
    'Confirmed': 0,
    'Checked In': 0,
    'Checked Out': 0,
    'Completed': 0,
    'Cancelled': 0
  };

  bookingsData.forEach(b => {
    const status = b.status || 'Confirmed';
    if (statusCounts[status] !== undefined) {
      statusCounts[status]++;
    } else {
      statusCounts[status] = 1;
    }
  });

  // Render Chart
  const chartContainer = document.getElementById('bookingStatusChart');
  if (chartContainer) {
    chartContainer.innerHTML = '';
    const maxVal = Math.max(...Object.values(statusCounts), 1);

    Object.keys(statusCounts).forEach(status => {
      const val = statusCounts[status];
      const pct = Math.round((val / maxVal) * 100);
      
      const barWrapper = document.createElement('div');
      barWrapper.className = 'chart-bar-wrapper';
      barWrapper.innerHTML = `
        <span class="chart-bar-value">${val}</span>
        <div class="chart-bar" style="height: ${Math.max(5, pct)}%; background: ${status === 'Cancelled' ? 'var(--admin-danger)' : 'var(--admin-primary)'};"></div>
        <span class="chart-bar-label" title="${status}">${status}</span>
      `;
      chartContainer.appendChild(barWrapper);
    });
  }

  // Render Recent Bookings Table
  const tbody = document.getElementById('bookingsTableBody');
  if (tbody) {
    tbody.innerHTML = '';
    const recent = [...bookingsData]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);
    
    recent.forEach(b => {
      let statusBadge = '';
      if (b.status === 'Confirmed') statusBadge = '<span class="admin-badge badge-info">Confirmed</span>';
      else if (b.status === 'Checked In') statusBadge = '<span class="admin-badge badge-success">Checked In</span>';
      else if (b.status === 'Checked Out' || b.status === 'Completed') statusBadge = '<span class="admin-badge badge-neutral">Completed</span>';
      else if (b.status === 'Cancelled') statusBadge = '<span class="admin-badge badge-danger">Cancelled</span>';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight:600;">${b.id}</td>
        <td>${b.guestName}</td>
        <td>Room ${b.roomNumber} (${b.roomType})</td>
        <td>${formatAdminDate(b.checkIn).split(',')[0]}</td>
        <td>${formatAdminDate(b.checkOut).split(',')[0]}</td>
        <td style="font-weight:600;">${formatAdminCurrency(b.totalAmount)}</td>
        <td>${statusBadge}</td>
      `;
      tbody.appendChild(tr);
    });
  }
}

// ── Occupancy Report ───────────────────────────────────────────────
function renderOccupancyReport() {
  // Occupancy by room type progress bars
  const typeNights = {};
  const typeCapacity = {};
  roomsData.forEach(r => {
    typeNights[r.type] = 0;
    typeCapacity[r.type] = (typeCapacity[r.type] || 0) + 30; // 30 nights capacity per room
  });

  bookingsData.forEach(b => {
    if (b.status !== 'Cancelled') {
      const type = b.roomType || 'Standard';
      const checkIn = new Date(b.checkIn);
      const checkOut = new Date(b.checkOut);
      const diffTime = Math.abs(checkOut - checkIn);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
      if (typeNights[type] !== undefined) {
        typeNights[type] += diffDays;
      }
    }
  });

  const occupancyBars = document.getElementById('occupancyBars');
  if (occupancyBars) {
    occupancyBars.innerHTML = '';
    Object.keys(typeCapacity).forEach(type => {
      const capacity = typeCapacity[type];
      const nights = typeNights[type] || 0;
      const pct = Math.min(100, Math.round((nights / capacity) * 100));

      const row = document.createElement('div');
      row.className = 'occupancy-row';
      row.innerHTML = `
        <span class="occupancy-label" title="${type}">${type}</span>
        <div class="occupancy-bar-track">
          <div class="occupancy-bar-fill" style="width: ${pct}%;"></div>
        </div>
        <span class="occupancy-pct">${pct}%</span>
      `;
      occupancyBars.appendChild(row);
    });
  }

  // Room Status Distribution
  const statusCounts = {
    'Available': 0,
    'Occupied': 0,
    'Dirty': 0,
    'Maintenance': 0
  };

  roomsData.forEach(r => {
    const status = r.status || 'Available';
    if (statusCounts[status] !== undefined) {
      statusCounts[status]++;
    }
  });

  const roomStatusBars = document.getElementById('roomStatusBars');
  if (roomStatusBars) {
    roomStatusBars.innerHTML = '';
    const totalRooms = roomsData.length || 1;
    Object.keys(statusCounts).forEach(status => {
      const count = statusCounts[status];
      const pct = Math.round((count / totalRooms) * 100);

      let barColor = 'var(--admin-primary)';
      if (status === 'Available') barColor = 'var(--admin-success)';
      else if (status === 'Occupied') barColor = 'var(--admin-info)';
      else if (status === 'Dirty') barColor = '#e11d48';
      else if (status === 'Maintenance') barColor = 'var(--admin-secondary)';

      const row = document.createElement('div');
      row.className = 'occupancy-row';
      row.innerHTML = `
        <span class="occupancy-label" style="min-width:100px;">${status}</span>
        <div class="occupancy-bar-track">
          <div class="occupancy-bar-fill" style="width: ${pct}%; background: ${barColor};"></div>
        </div>
        <span class="occupancy-pct" style="min-width:60px;">${count} (${pct}%)</span>
      `;
      roomStatusBars.appendChild(row);
    });
  }

  // Render Table: Top Performing Rooms
  const tbody = document.getElementById('occupancyTableBody');
  if (tbody) {
    tbody.innerHTML = '';
    
    // Sort by revenue descending
    const roomPerformance = roomsData.map(r => {
      const roomBookings = bookingsData.filter(b => b.roomId === r.id && b.status !== 'Cancelled');
      let nightsBooked = 0;
      let rev = 0;
      roomBookings.forEach(b => {
        const ms = new Date(b.checkOut) - new Date(b.checkIn);
        const nights = Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
        nightsBooked += nights;
        
        const p = paymentsData.find(pay => pay.bookingId === b.id && pay.status === 'Paid');
        if (p) rev += p.amount;
      });
      const occupancyPct = Math.min(100, Math.round((nightsBooked / 30) * 100));

      return {
        roomNumber: r.roomNumber,
        type: r.type,
        nightsBooked,
        occupancy: occupancyPct,
        revenue: rev
      };
    });

    roomPerformance.sort((a, b) => b.revenue - a.revenue);

    roomPerformance.forEach(s => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight:600;">Room ${s.roomNumber}</td>
        <td>${s.type}</td>
        <td>${s.nightsBooked} / 30 nights</td>
        <td>
          <div class="d-flex align-center gap-xs">
            <span style="font-weight:600; min-width:35px;">${s.occupancy}%</span>
            <div style="flex:1; height:6px; background:var(--admin-surface-alt); border-radius:3px; overflow:hidden; max-width:80px;">
              <div style="width:${s.occupancy}%; height:100%; background:var(--admin-info); border-radius:3px;"></div>
            </div>
          </div>
        </td>
        <td class="text-success" style="font-weight:600;">${formatAdminCurrency(s.revenue)}</td>
      `;
      tbody.appendChild(tr);
    });
  }
}

// ── Services Report ────────────────────────────────────────────────
function renderServicesReport() {
  const serviceCategories = {};
  const serviceStatus = {
    'Total': 0,
    'Completed': 0,
    'Pending': 0
  };

  serviceRequestsData.forEach(sr => {
    const cat = sr.category || 'Other';
    serviceCategories[cat] = (serviceCategories[cat] || 0) + 1;
    
    serviceStatus.Total++;
    if (sr.status === 'Completed') {
      serviceStatus.Completed++;
    } else {
      serviceStatus.Pending++;
    }
  });

  // Render Category Chart
  const chartContainer = document.getElementById('serviceChart');
  if (chartContainer) {
    chartContainer.innerHTML = '';
    const maxVal = Math.max(...Object.values(serviceCategories), 1);

    Object.keys(serviceCategories).forEach(cat => {
      const val = serviceCategories[cat];
      const pct = Math.round((val / maxVal) * 100);

      const barWrapper = document.createElement('div');
      barWrapper.className = 'chart-bar-wrapper';
      barWrapper.innerHTML = `
        <span class="chart-bar-value">${val}</span>
        <div class="chart-bar" style="height: ${Math.max(5, pct)}%; background: var(--admin-secondary);"></div>
        <span class="chart-bar-label" title="${cat}">${cat}</span>
      `;
      chartContainer.appendChild(barWrapper);
    });
  }

  // Render Service Performance Table
  const tbody = document.getElementById('serviceTableBody');
  if (tbody) {
    tbody.innerHTML = '';
    
    // Group requests by category to show detail breakdown
    const breakdown = {};
    serviceRequestsData.forEach(sr => {
      const cat = sr.category || 'Other';
      if (!breakdown[cat]) {
        breakdown[cat] = { total: 0, completed: 0, pending: 0 };
      }
      breakdown[cat].total++;
      if (sr.status === 'Completed') {
        breakdown[cat].completed++;
      } else {
        breakdown[cat].pending++;
      }
    });

    Object.keys(breakdown).forEach(cat => {
      const data = breakdown[cat];
      const rate = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight:600;">${cat}</td>
        <td>${data.total}</td>
        <td class="text-success">${data.completed}</td>
        <td class="text-warning">${data.pending}</td>
        <td>
          <div class="d-flex align-center gap-xs">
            <span style="font-weight:600; min-width:35px;">${rate}%</span>
            <div style="flex:1; height:6px; background:var(--admin-surface-alt); border-radius:3px; overflow:hidden; max-width:100px;">
              <div style="width:${rate}%; height:100%; background:var(--admin-success); border-radius:3px;"></div>
            </div>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }
}

// ── Export Options ─────────────────────────────────────────────────
function exportCSV() {
  let csvContent = "data:text/csv;charset=utf-8,";
  
  // Create CSV from bookings data
  csvContent += "Booking ID,Guest Name,Room Number,Room Type,Check In,Check Out,Total Amount,Status\n";
  bookingsData.forEach(b => {
    csvContent += `"${b.id}","${b.guestName}","${b.roomNumber}","${b.roomType}","${b.checkIn}","${b.checkOut}",${b.totalAmount},"${b.status}"\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `stayease_bookings_report_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('CSV export successful', 'success');
}

function exportJSON() {
  const exportData = {
    generatedAt: new Date().toISOString(),
    summary: {
      totalRevenue: paymentsData.filter(p => p.status === 'Paid').reduce((a, b) => a + b.amount, 0),
      totalBookings: bookingsData.filter(b => b.status !== 'Cancelled').length,
      totalRooms: roomsData.length,
      totalServiceRequests: serviceRequestsData.length
    },
    bookings: bookingsData,
    payments: paymentsData,
    serviceRequests: serviceRequestsData
  };

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
  const link = document.createElement("a");
  link.setAttribute("href", dataStr);
  link.setAttribute("download", `stayease_full_report_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('JSON export successful', 'success');
}

function printReport() {
  window.print();
}
