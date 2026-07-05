/* ===================================================================
   admin-guests.js — Guests Management
   =================================================================== */

let allGuests = [];
let allBookingsForGuests = [];

function initGuestsPage() {
  const users = getData('stayEasePro_users', []);
  allBookingsForGuests = getData('stayEasePro_bookings', []);
  
  // Filter out non-customers if roles exist, though currently all users are customers in mock data (admins are in stayEasePro_admins)
  allGuests = users.filter(u => u.role !== 'admin');
  
  // Enhance guest objects with their current status based on bookings
  allGuests.forEach(guest => {
    const guestBookings = allBookingsForGuests.filter(b => b.userId === guest.id);
    guest.totalStays = guestBookings.filter(b => b.status === 'Completed').length;
    
    // Determine Status
    guest.currentStatus = 'Past Guest';
    if (guestBookings.some(b => b.status === 'Checked In')) {
      guest.currentStatus = 'Active Guest';
      const activeBooking = guestBookings.find(b => b.status === 'Checked In');
      guest.currentRoom = activeBooking.roomNumber;
    } else if (guestBookings.some(b => b.status === 'Confirmed')) {
      guest.currentStatus = 'Upcoming Guest';
      guest.currentRoom = '-';
    } else {
      guest.currentRoom = '-';
    }
  });

  renderGuests(allGuests);
  bindGuestEvents();
}

function renderGuests(guestsList) {
  const tbody = document.querySelector('.admin-table tbody');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (guestsList.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted" style="padding: 40px;">No guests found.</td></tr>`;
    return;
  }

  guestsList.forEach(g => {
    let statusBadge = 'badge-neutral';
    if (g.currentStatus === 'Active Guest') statusBadge = 'badge-success';
    if (g.currentStatus === 'Upcoming Guest') statusBadge = 'badge-warning';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td data-label="Guest Name"><strong>${g.fullName}</strong></td>
      <td data-label="Contact">${g.email}<br><span class="text-muted">+91 ${g.phone}</span></td>
      <td data-label="Current Room">${g.currentRoom}</td>
      <td data-label="Total Stays">${g.totalStays}</td>
      <td data-label="Status"><span class="admin-badge ${statusBadge}">${g.currentStatus}</span></td>
      <td data-label="Actions">
        <div class="d-flex gap-sm">
          <button class="admin-btn admin-btn-icon chat-btn" data-id="${g.id}" title="Chat"><span class="material-symbols-outlined" style="font-size:18px;">chat</span></button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });


  
  document.querySelectorAll('.chat-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      window.location.href = 'chats.html';
    });
  });
}

function bindGuestEvents() {
  const searchInput = document.querySelector('.search-bar input');
  const statusSelect = document.querySelector('select.admin-form-control');

  function filterGuests() {
    const q = searchInput ? searchInput.value.toLowerCase() : '';
    const status = statusSelect ? statusSelect.value : 'All Guests';

    const filtered = allGuests.filter(g => {
      const matchQ = g.fullName.toLowerCase().includes(q) || g.email.toLowerCase().includes(q) || g.phone.includes(q);
      const matchStatus = status === 'All Guests' || g.currentStatus === status;
      return matchQ && matchStatus;
    });
    renderGuests(filtered);
  }

  if (searchInput) searchInput.addEventListener('input', filterGuests);
  if (statusSelect) statusSelect.addEventListener('change', filterGuests);
}
