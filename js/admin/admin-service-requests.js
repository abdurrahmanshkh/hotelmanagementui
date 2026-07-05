/* ===================================================================
   admin-service-requests.js — Service Requests Kanban
   =================================================================== */

let allRequests = [];

function initServiceRequestsPage() {
  allRequests = getData('stayEasePro_serviceRequests', []);
  renderKanban(allRequests);
  bindRequestEvents();
}

function renderKanban(requests) {
  // Columns
  const colNew = document.querySelectorAll('.kanban-col')[0];
  const colAccepted = document.querySelectorAll('.kanban-col')[1];
  const colProgress = document.querySelectorAll('.kanban-col')[2];
  const colCompleted = document.querySelectorAll('.kanban-col')[3];

  if (!colNew || !colAccepted || !colProgress || !colCompleted) return;

  // Clear current cards except header
  [colNew, colAccepted, colProgress, colCompleted].forEach(col => {
    const header = col.querySelector('.kanban-header');
    col.innerHTML = '';
    col.appendChild(header);
  });

  const counts = { new: 0, accepted: 0, progress: 0, completed: 0 };

  requests.forEach(req => {
    const card = document.createElement('div');
    card.className = `kanban-card ${req.priority === 'Emergency' ? 'priority-emergency' : ''}`;
    
    let priorityBadge = 'badge-info';
    if (req.priority === 'Emergency') priorityBadge = 'badge-danger';
    if (req.priority === 'High') priorityBadge = 'badge-warning';

    const timeAgo = Math.floor((new Date() - new Date(req.createdAt)) / 60000);
    const timeStr = timeAgo < 60 ? `${timeAgo}m ago` : `${Math.floor(timeAgo/60)}h ago`;

    // Build action buttons based on status
    let actionBtn = '';
    if (req.status === 'Pending') {
      actionBtn = `<button class="admin-btn admin-btn-primary action-btn" data-id="${req.id}" data-action="Accepted" style="padding:4px 8px; font-size:0.75rem;">Accept</button>`;
      counts.new++;
    } else if (req.status === 'Accepted') {
      actionBtn = `<button class="admin-btn admin-btn-outline action-btn" data-id="${req.id}" data-action="In Progress" style="padding:4px 8px; font-size:0.75rem;">Start</button>`;
      counts.accepted++;
    } else if (req.status === 'In Progress') {
      actionBtn = `<button class="admin-btn admin-btn-success action-btn" data-id="${req.id}" data-action="Completed" style="background:var(--admin-success); color:white; border:none; padding:4px 8px; font-size:0.75rem;">Complete</button>`;
      counts.progress++;
    } else if (req.status === 'Completed') {
      card.style.opacity = '0.7';
      counts.completed++;
    }

    card.innerHTML = `
      <div class="d-flex justify-between mb-sm">
        <span class="admin-badge ${priorityBadge}">${req.priority}</span>
        <span class="text-muted" style="font-size:0.75rem;">${timeStr}</span>
      </div>
      <h4 style="margin:0 0 8px 0;">${req.serviceType}</h4>
      <p class="text-muted" style="font-size:0.875rem; margin:0 0 12px 0;">${req.description || 'No additional details.'}</p>
      <div class="d-flex justify-between align-center">
        <span style="font-size:0.875rem; font-weight:600;">Room ${req.roomNumber}</span>
        ${actionBtn}
      </div>
    `;

    if (req.status === 'Pending') colNew.appendChild(card);
    else if (req.status === 'Accepted') colAccepted.appendChild(card);
    else if (req.status === 'In Progress') colProgress.appendChild(card);
    else if (req.status === 'Completed') colCompleted.appendChild(card);
  });

  // Update counts
  colNew.querySelector('.admin-badge').textContent = counts.new;
  colAccepted.querySelector('.admin-badge').textContent = counts.accepted;
  colProgress.querySelector('.admin-badge').textContent = counts.progress;
  colCompleted.querySelector('.admin-badge').textContent = counts.completed;

  // Add empty states if columns are empty
  if (counts.progress === 0) {
    const empty = document.createElement('div');
    empty.className = 'text-center text-muted';
    empty.style.cssText = 'padding:var(--admin-space-lg); font-size:0.875rem; border:1px dashed var(--admin-surface-border); border-radius:var(--admin-radius-md);';
    empty.textContent = 'No requests in progress';
    colProgress.appendChild(empty);
  }

  // Bind dynamically generated action buttons
  document.querySelectorAll('.action-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      const nextStatus = e.currentTarget.getAttribute('data-action');
      changeRequestStatus(id, nextStatus);
    });
  });
}

function bindRequestEvents() {
  const searchInput = document.querySelector('.search-bar input');
  
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.toLowerCase();
      const filtered = allRequests.filter(r => 
        r.id.toLowerCase().includes(q) || 
        r.roomNumber.toString().includes(q) || 
        r.serviceType.toLowerCase().includes(q)
      );
      renderKanban(filtered);
    });
  }
}

function changeRequestStatus(id, newStatus) {
  updateItem('stayEasePro_serviceRequests', id, {
    status: newStatus,
    updatedAt: new Date().toISOString()
  });
  showToast(`Request marked as ${newStatus}.`, 'success');
  initServiceRequestsPage();
}
