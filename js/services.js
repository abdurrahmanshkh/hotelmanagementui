/* ===================================================================
   services.js — Service Request Submission & History
   =================================================================== */

function initServices() {
  const form = document.getElementById('serviceRequestForm');
  if (!form) return;
  if (!requireAuth()) return;

  const user = getCurrentUser();
  // Find active booking for auto-fill
  refreshPasscodeStatuses();
  const bookings = getData('stayEasePro_bookings', [])
    .filter(b => b.userId === user.id && (b.status === 'Checked In' || b.status === 'Confirmed'));
  const activeBooking = bookings[0];

  if (!activeBooking) {
    showToast('You need an active booking to request services.', 'warning');
  }

  // Auto-fill room number
  const roomInput = document.getElementById('srRoom');
  if (roomInput && activeBooking) roomInput.value = activeBooking.roomNumber;

  // Submit handler
  const submitBtn = form.querySelector('.btn-primary');
  if (submitBtn) submitBtn.addEventListener('click', e => {
    e.preventDefault();
    handleServiceSubmit(activeBooking);
  });

  renderServiceHistory();
}

function handleServiceSubmit(activeBooking) {
  const user = getCurrentUser();
  if (!user) return;
  if (!activeBooking) { showToast('No active booking found.', 'error'); return; }

  const form = document.getElementById('serviceRequestForm');
  clearFormErrors(form);

  const typeEl  = document.getElementById('srType');
  const prioEl  = document.getElementById('srPriority');
  const timeEl  = document.getElementById('srTime');
  const descEl  = document.getElementById('srDescription');

  let valid = true;
  if (!isRequired(typeEl?.value) || typeEl.value === 'Select a service') { showToast('Please select a service type.', 'warning'); valid = false; }
  if (!isRequired(prioEl?.value)) { showToast('Please select priority.', 'warning'); valid = false; }
  const needsDesc = ['Other', 'Technical Issue', 'Medical Assistance'].includes(typeEl?.value) || prioEl?.value === 'Emergency';
  if (needsDesc && !isRequired(descEl?.value)) { showInlineError(descEl, 'Description required for this type/priority.'); valid = false; }
  if (!valid) return;

  const request = {
    id: generateId('SR'),
    userId: user.id,
    bookingId: activeBooking.id,
    roomNumber: activeBooking.roomNumber,
    serviceType: typeEl.value,
    priority: prioEl.value,
    preferredTime: timeEl?.value || '',
    description: descEl?.value || '',
    status: 'New',
    adminResponse: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  addItem('stayEasePro_serviceRequests', request);
  addItem('stayEasePro_notifications', {
    id: generateId('NTF'), userId: user.id, type: 'service',
    message: `Service request "${request.serviceType}" submitted for Room ${request.roomNumber}.`,
    read: false, createdAt: new Date().toISOString(), relatedId: request.id
  });

  showToast('Service request submitted successfully!', 'success');

  // Clear form
  if (typeEl) typeEl.selectedIndex = 0;
  if (prioEl) prioEl.value = 'Medium';
  if (timeEl) timeEl.value = '';
  if (descEl) descEl.value = '';

  renderServiceHistory();
}

function renderServiceHistory() {
  const container = document.getElementById('srHistory');
  if (!container) return;
  const user = getCurrentUser();
  if (!user) return;

  const requests = getData('stayEasePro_serviceRequests', [])
    .filter(s => s.userId === user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (!requests.length) {
    container.innerHTML = '<div class="empty-state p-lg"><p class="text-muted">No service requests yet.</p></div>';
    return;
  }

  container.innerHTML = requests.map(s => {
    const statusClass = { 'New':'badge-info','Accepted':'badge-primary','In Progress':'badge-warning','Completed':'badge-success','Rejected':'badge-danger' }[s.status] || 'badge-primary';
    return `
      <div class="booking-list-item" style="padding:var(--space-sm) 0;">
        <div class="w-100">
          <div class="d-flex justify-content-between align-items-start mb-xs">
            <h5 style="margin:0;">${s.serviceType}</h5>
            <span class="badge ${statusClass}">${s.status}</span>
          </div>
          <p class="text-muted" style="font-size:0.8rem;">${s.id} • ${s.priority} • ${formatDateOnly(s.createdAt)}</p>
          ${s.adminResponse ? `<p style="font-size:0.85rem;background:var(--background);padding:var(--space-sm);border-radius:var(--radius-sm);margin-top:4px;"><strong>Admin:</strong> ${s.adminResponse}</p>` : ''}
        </div>
      </div>`;
  }).join('');
}
