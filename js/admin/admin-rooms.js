/* ===================================================================
   admin-rooms.js — Rooms Management
   =================================================================== */

let allRooms = [];
let editRoomId = null;

function initRoomsPage() {
  allRooms = getData('stayEasePro_rooms', []);
  renderRooms(allRooms);
  bindRoomEvents();
}

function renderRooms(rooms) {
  const tbody = document.querySelector('.admin-table tbody');
  if (!tbody) return;

  tbody.innerHTML = '';
  
  if (rooms.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" class="text-center text-muted" style="padding: 40px;">No rooms found matching criteria.</td></tr>`;
    return;
  }

  rooms.forEach(room => {
    // Status Badges
    let statusBadge = 'badge-success';
    if (room.status === 'Occupied') statusBadge = 'badge-warning';
    if (room.status === 'Maintenance') statusBadge = 'badge-danger';
    if (room.status === 'Under Cleaning') statusBadge = 'badge-info';
    
    let cleaningBadge = 'badge-success';
    if (room.cleaningStatus === 'Pending' || room.cleaningStatus === 'Required') cleaningBadge = 'badge-warning';
    if (room.cleaningStatus === 'In Progress') cleaningBadge = 'badge-info';

    let dynPriceHtml = `₹ ${room.dynamicPrice}`;
    if (room.dynamicPrice > room.basePrice) {
      dynPriceHtml = `<span class="text-success">₹ ${room.dynamicPrice}</span> <span class="material-symbols-outlined" style="font-size:12px; color:var(--admin-success);">trending_up</span>`;
    } else if (room.dynamicPrice < room.basePrice) {
      dynPriceHtml = `<span class="text-danger">₹ ${room.dynamicPrice}</span> <span class="material-symbols-outlined" style="font-size:12px; color:var(--admin-danger);">trending_down</span>`;
    }

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td data-label="Room No"><strong>${room.roomNumber}</strong></td>
      <td data-label="Type">${room.type}</td>
      <td data-label="Floor">${room.floor}</td>
      <td data-label="Capacity">${room.capacity} Guests</td>
      <td data-label="Base Price">${formatAdminCurrency(room.basePrice)}</td>
      <td data-label="Dynamic Price">${dynPriceHtml}</td>
      <td data-label="Status"><span class="admin-badge ${statusBadge}">${room.status}</span></td>
      <td data-label="Cleaning"><span class="admin-badge ${cleaningBadge}">${room.cleaningStatus}</span></td>
      <td data-label="Actions">
        <div class="d-flex gap-sm">
          <button class="admin-btn admin-btn-icon edit-btn" data-id="${room.id}" title="Edit"><span class="material-symbols-outlined" style="font-size:18px;">edit</span></button>
          <button class="admin-btn admin-btn-icon maint-btn" data-id="${room.id}" title="Set Maintenance"><span class="material-symbols-outlined" style="font-size:18px;">build</span></button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Re-bind dynamically created buttons
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      openRoomModal(id);
    });
  });

  document.querySelectorAll('.maint-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      toggleMaintenance(id);
    });
  });
}

function bindRoomEvents() {
  // Search and Filters
  const searchInput = document.querySelector('.search-bar input');
  const typeFilter = document.querySelectorAll('.admin-form-control')[0]; // Second select is type if we index properly. Wait, index 0 is type? Let's check HTML.
  // Actually, better to query by position or add IDs. I'll just use querySelectorAll.
  const selects = document.querySelectorAll('.admin-card select');
  const typeSelect = selects[0];
  const statusSelect = selects[1];

  function filterRooms() {
    const q = searchInput ? searchInput.value.toLowerCase() : '';
    const type = typeSelect ? typeSelect.value : 'All Types';
    const status = statusSelect ? statusSelect.value : 'All Statuses';

    const filtered = allRooms.filter(r => {
      const matchQ = r.roomNumber.toLowerCase().includes(q) || r.floor.toString().includes(q);
      const matchType = type === 'All Types' || r.type === type;
      const matchStatus = status === 'All Statuses' || r.status === status;
      return matchQ && matchType && matchStatus;
    });
    renderRooms(filtered);
  }

  if (searchInput) searchInput.addEventListener('input', filterRooms);
  if (typeSelect) typeSelect.addEventListener('change', filterRooms);
  if (statusSelect) statusSelect.addEventListener('change', filterRooms);

  // Add Room Button
  const addBtn = document.querySelector('.page-header .admin-btn-primary');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      editRoomId = null;
      document.querySelector('#addRoomModal h3').textContent = 'Add New Room';
      document.getElementById('roomForm').reset();
      openModal('addRoomModal');
    });
  }

  // Save Form
  const saveBtn = document.getElementById('saveRoomBtn');
  if (saveBtn) {
    saveBtn.addEventListener('click', saveRoom);
  }

}

function openRoomModal(id) {
  const room = allRooms.find(r => r.id === id);
  if (!room) return;
  editRoomId = id;
  document.querySelector('#addRoomModal h3').textContent = 'Edit Room ' + room.roomNumber;
  
  const form = document.getElementById('roomForm');
  form.elements['roomNumber'].value = room.roomNumber;
  form.elements['type'].value = room.type;
  form.elements['capacity'].value = room.capacity;
  form.elements['basePrice'].value = room.basePrice;
  form.elements['floor'].value = room.floor;
  
  // check amenities
  const checkboxes = form.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(cb => {
    cb.checked = room.amenities.includes(cb.value);
  });
  
  openModal('addRoomModal');
}

function saveRoom() {
  const form = document.getElementById('roomForm');
  clearAllErrors(form);

  const roomNum = form.elements['roomNumber'].value;
  const type = form.elements['type'].value;
  const capacity = form.elements['capacity'].value;
  const basePrice = form.elements['basePrice'].value;
  const floor = form.elements['floor'].value;

  let hasError = false;
  if (!isRequired(roomNum)) { showInlineError(form.elements['roomNumber'], 'Required'); hasError = true; }
  if (!isPositiveNumber(capacity)) { showInlineError(form.elements['capacity'], 'Invalid'); hasError = true; }
  if (!isPositiveNumber(basePrice)) { showInlineError(form.elements['basePrice'], 'Invalid'); hasError = true; }
  if (!isRequired(floor)) { showInlineError(form.elements['floor'], 'Required'); hasError = true; }

  // Check unique room number
  if (isRequired(roomNum)) {
    const existing = allRooms.find(r => r.roomNumber === roomNum && r.id !== editRoomId);
    if (existing) {
      showInlineError(form.elements['roomNumber'], 'Room number must be unique');
      hasError = true;
    }
  }

  if (hasError) return;

  const amenities = [];
  form.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => amenities.push(cb.value));
  if (amenities.length === 0) {
    showToast('Please select at least one amenity', 'warning');
    return;
  }

  if (editRoomId) {
    updateItem('stayEasePro_rooms', editRoomId, {
      roomNumber: roomNum,
      type, capacity: Number(capacity),
      basePrice: Number(basePrice),
      floor: Number(floor),
      amenities
    });
    showToast('Room updated successfully.', 'success');
  } else {
    const newRoom = {
      id: generateId('RM'),
      roomNumber: roomNum,
      type, capacity: Number(capacity),
      basePrice: Number(basePrice),
      dynamicPrice: Number(basePrice),
      floor: Number(floor),
      amenities,
      status: 'Available',
      cleaningStatus: 'Clean',
      bedType: 'Standard Bed',
      description: 'Newly added room.'
    };
    addItem('stayEasePro_rooms', newRoom);
    showToast('Room added successfully.', 'success');
  }

  closeModal('addRoomModal');
  initRoomsPage(); // reload data
}

function toggleMaintenance(id) {
  const room = allRooms.find(r => r.id === id);
  if (!room) return;

  if (room.status === 'Occupied' || room.status === 'Checked In') {
    showToast('Cannot modify maintenance status of an occupied room.', 'error');
    return;
  }

  if (confirm(`Change maintenance status for Room ${room.roomNumber}?`)) {
    const newStatus = room.status === 'Maintenance' ? 'Available' : 'Maintenance';
    updateItem('stayEasePro_rooms', id, { status: newStatus });
    showToast(`Room marked as ${newStatus}.`, 'success');
    initRoomsPage();
  }
}
