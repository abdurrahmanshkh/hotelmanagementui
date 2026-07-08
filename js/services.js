/* ===================================================================
   services.js — Concierge Services Request & History
   =================================================================== */

function initServices() {
  const container = document.getElementById('srvList');
  if (!container) return;
  if (!requireAuth()) return;

  const user = getCurrentUser();
  refreshPasscodeStatuses();
  
  // Populate active bookings dropdown
  const bookings = getData('stayEasePro_bookings', [])
    .filter(b => b.userId === user.id && (b.status === 'Checked In' || b.status === 'Confirmed'));
  
  const select = document.getElementById('srvBookingSelect');
  if (select) {
    if (bookings.length > 0) {
      select.innerHTML = bookings.map(b => `<option value="${b.id}">${b.roomType} #${b.roomNumber} (${formatDateOnly(b.checkIn)})</option>`).join('');
    } else {
      select.innerHTML = '<option value="">No active stays found</option>';
    }
  }

  // Bind custom form
  const form = document.getElementById('srvCustomForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const cat = document.getElementById('srvCategory').value;
      const details = document.getElementById('srvDetails').value;
      submitServiceRequest(cat, details);
    });
  }

  renderServiceHistory();
}

function requestQuickService(serviceName, category) {
  submitServiceRequest(category, serviceName);
}

function submitServiceRequest(category, details) {
  const user = getCurrentUser();
  if (!user) return;
  
  const select = document.getElementById('srvBookingSelect');
  const bookingId = select ? select.value : null;
  
  if (!bookingId) {
    showToast('You must have an active stay to request services.', 'warning');
    return;
  }

  const booking = findById('stayEasePro_bookings', bookingId);
  if (!booking) return;

  const request = {
    id: generateId('SR'),
    userId: user.id,
    bookingId: booking.id,
    roomNumber: booking.roomNumber,
    category: category,
    details: details,
    serviceType: details,
    description: details,
    priority: category === 'maintenance' ? 'High' : (category === 'room_service' ? 'Medium' : 'Low'),
    status: 'Pending',
    adminResponse: '',
    createdAt: new Date().toISOString()
  };

  addItem('stayEasePro_serviceRequests', request);
  showToast(`Requested: ${details}`, 'success');
  
  // Reset form if applicable
  const detailsInput = document.getElementById('srvDetails');
  if (detailsInput) detailsInput.value = '';

  renderServiceHistory();
}

function renderServiceHistory() {
  const container = document.getElementById('srvList');
  if (!container) return;
  const user = getCurrentUser();
  if (!user) return;

  const requests = getData('stayEasePro_serviceRequests', [])
    .filter(s => s.userId === user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (!requests.length) {
    container.innerHTML = `
      <div class="card text-center p-xl">
        <span class="material-symbols-outlined text-muted mb-sm" style="font-size: 3rem;">inbox</span>
        <p class="text-muted">You have no active requests.</p>
      </div>`;
    return;
  }

  container.innerHTML = requests.map(req => {
    const icon = req.category === 'housekeeping' ? 'cleaning_services' :
                 req.category === 'room_service' ? 'restaurant' :
                 req.category === 'maintenance' ? 'build' : 'concierge';
    
    const statusBadge = req.status === 'Pending' ? '<span class="badge badge-warning">Pending</span>' :
                        req.status === 'In Progress' ? '<span class="badge badge-info">In Progress</span>' :
                        '<span class="badge badge-success">Completed</span>';

    return `
      <div class="card p-md d-flex justify-content-between align-items-center gap-md flex-wrap">
        <div class="d-flex gap-sm align-items-center">
          <div class="bg-surface-alt p-sm text-muted" style="border-radius: 50%;"><span class="material-symbols-outlined">${icon}</span></div>
          <div>
            <h4 class="mb-xs font-size-sm">${req.details}</h4>
            <p class="text-muted font-size-sm">Room #${req.roomNumber} • ${new Date(req.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
          </div>
        </div>
        <div>${statusBadge}</div>
      </div>`;
  }).join('');
}
