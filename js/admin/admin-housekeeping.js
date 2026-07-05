/* ===================================================================
   admin-housekeeping.js — Room Cleaning Status Management
   =================================================================== */

let roomsForHousekeeping = [];

function initHousekeepingPage() {
  roomsForHousekeeping = getData('stayEasePro_rooms', []);
  renderHousekeeping(roomsForHousekeeping);
  
  const searchInput = document.querySelector('.search-bar input');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.toLowerCase();
      const filtered = roomsForHousekeeping.filter(r => r.roomNumber.toString().includes(q));
      renderHousekeeping(filtered);
    });
  }
}

function renderHousekeeping(rooms) {
  const tbody = document.querySelector('.admin-table tbody');
  if (!tbody) return;

  tbody.innerHTML = '';
  
  if (rooms.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted" style="padding: 40px;">No rooms found.</td></tr>`;
    return;
  }

  rooms.forEach(room => {
    let cleanBadge = 'badge-success';
    if (room.cleaningStatus === 'Pending' || room.cleaningStatus === 'Required') cleanBadge = 'badge-warning';
    if (room.cleaningStatus === 'In Progress') cleanBadge = 'badge-info';

    let occBadge = 'badge-success';
    if (room.status === 'Occupied') occBadge = 'badge-warning';
    if (room.status === 'Maintenance') occBadge = 'badge-danger';

    let actionBtn = '';
    if (room.cleaningStatus === 'Pending' || room.cleaningStatus === 'Required') {
      actionBtn = `<button class="admin-btn admin-btn-outline" style="padding:4px 8px; font-size:0.75rem;" onclick="startCleaning('${room.id}')">Start</button>`;
    } else if (room.cleaningStatus === 'In Progress') {
      actionBtn = `<button class="admin-btn admin-btn-success" style="background:var(--admin-success); color:white; border:none; padding:4px 8px; font-size:0.75rem;" onclick="markCleaned('${room.id}')">Cleaned</button>`;
    }

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td data-label="Room"><strong>${room.roomNumber}</strong> <span class="text-muted">(${room.type})</span></td>
      <td data-label="Occupancy"><span class="admin-badge ${occBadge}">${room.status}</span></td>
      <td data-label="Cleaning Status"><span class="admin-badge ${cleanBadge}">${room.cleaningStatus}</span></td>
      <td data-label="Assigned Staff"><span class="text-muted">Not Assigned</span></td>
      <td data-label="Last Cleaned"><span class="text-muted">Unknown</span></td>
      <td data-label="Actions">
        <div class="d-flex gap-sm">
          ${actionBtn}

        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function startCleaning(id) {
  updateItem('stayEasePro_rooms', id, { cleaningStatus: 'In Progress' });
  showToast('Cleaning started.', 'info');
  initHousekeepingPage();
}

function markCleaned(id) {
  const room = roomsForHousekeeping.find(r => r.id === id);
  if (!room) return;
  
  let newStatus = room.status;
  if (room.status === 'Under Cleaning') newStatus = 'Available';

  updateItem('stayEasePro_rooms', id, { cleaningStatus: 'Clean', status: newStatus });
  showToast('Room marked as cleaned.', 'success');
  initHousekeepingPage();
}
