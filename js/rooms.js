/* ===================================================================
   rooms.js — Room listing, filtering, sorting, dynamic pricing
   =================================================================== */

/* ── Dynamic Pricing Calculation ──────────────────────────────────── */
function recalculateDynamicPricing() {
  const rooms = getData('stayEasePro_rooms', []);
  const rules = getData('stayEasePro_pricingRules', []);
  const bookings = getData('stayEasePro_bookings', []);
  const now = new Date();

  // Group rooms by type
  const types = {};
  rooms.forEach(r => { if (!types[r.type]) types[r.type] = []; types[r.type].push(r); });

  Object.keys(types).forEach(type => {
    const rule = rules.find(r => r.roomType === type);
    if (!rule || !rule.enabled) return;
    const total = types[type].length;
    // Count rooms that are occupied or reserved right now
    const occupied = types[type].filter(r => r.status === 'Occupied' || r.status === 'Reserved').length;
    const pct = total > 0 ? (occupied / total) * 100 : 0;

    let demandLevel, dynamicPrice, reason;
    if (pct < 30) {
      demandLevel = 'Low Demand';
      dynamicPrice = Math.round(rule.basePrice * (1 - rule.lowDemandDiscount / 100));
      reason = 'Discount applied due to low occupancy.';
    } else if (pct > 70) {
      demandLevel = 'High Demand';
      dynamicPrice = Math.round(rule.basePrice * (1 + rule.highDemandIncrease / 100));
      reason = 'Price increased due to high demand.';
    } else {
      demandLevel = 'Normal';
      dynamicPrice = rule.basePrice;
      reason = 'Normal pricing active.';
    }
    dynamicPrice = Math.max(rule.minPrice, Math.min(rule.maxPrice, dynamicPrice));

    types[type].forEach(r => {
      r.dynamicPrice = dynamicPrice;
      r.demandLevel = demandLevel;
      r.dynamicReason = reason;
    });
  });

  setData('stayEasePro_rooms', rooms);
}

/* ── Room Listing Page ────────────────────────────────────────────── */
function initRoomsPage() {
  const grid = document.getElementById('roomGrid');
  if (!grid) return;

  recalculateDynamicPricing();
  renderRooms();

  // Attach filter/sort event listeners
  document.getElementById('roomSearch')?.addEventListener('input', renderRooms);
  document.getElementById('roomSort')?.addEventListener('change', renderRooms);
  document.getElementById('applyFilters')?.addEventListener('click', () => { showToast('Filters applied.', 'info'); renderRooms(); });
  document.getElementById('resetFilters')?.addEventListener('click', resetFilters);
}

function resetFilters() {
  document.querySelectorAll('.filter-sidebar input[type="checkbox"]').forEach(cb => cb.checked = false);
  const search = document.getElementById('roomSearch');
  if (search) search.value = '';
  const sort = document.getElementById('roomSort');
  if (sort) sort.value = 'recommended';
  const range = document.querySelector('.filter-sidebar input[type="range"]');
  if (range) range.value = range.max;
  showToast('Filters reset.', 'info');
  renderRooms();
}

function getFilteredRooms() {
  let rooms = getData('stayEasePro_rooms', []);

  // Search
  const q = (document.getElementById('roomSearch')?.value || '').toLowerCase();
  if (q) rooms = rooms.filter(r => r.roomNumber.includes(q) || r.type.toLowerCase().includes(q) || r.description.toLowerCase().includes(q));

  // Type filter checkboxes
  const typeChecks = document.querySelectorAll('[data-filter-type]');
  if (typeChecks.length) {
    const selected = [...typeChecks].filter(cb => cb.checked).map(cb => cb.dataset.filterType);
    if (selected.length) rooms = rooms.filter(r => selected.includes(r.type));
  }

  // Price range
  const priceRange = document.getElementById('priceRange');
  if (priceRange) rooms = rooms.filter(r => r.dynamicPrice <= Number(priceRange.value));

  // Sort
  const sort = document.getElementById('roomSort')?.value || 'recommended';
  switch (sort) {
    case 'priceLow':  rooms.sort((a, b) => a.dynamicPrice - b.dynamicPrice); break;
    case 'priceHigh': rooms.sort((a, b) => b.dynamicPrice - a.dynamicPrice); break;
    case 'rating':    rooms.sort((a, b) => b.rating - a.rating); break;
  }

  return rooms;
}

function renderRooms() {
  const grid = document.getElementById('roomGrid');
  if (!grid) return;

  const rooms = getFilteredRooms();

  if (!rooms.length) {
    showEmptyState(grid, '🔍', 'No Rooms Found', "We couldn't find any rooms matching your filters.", '<button class="btn btn-secondary" onclick="resetFilters()">Clear Filters</button>');
    return;
  }

  grid.innerHTML = rooms.map(r => {
    const statusBadge = r.status === 'Available'
      ? '<span class="badge badge-success room-card-badge">Available</span>'
      : r.status === 'Occupied'
        ? '<span class="badge badge-error room-card-badge">Occupied</span>'
        : r.status === 'Reserved'
          ? '<span class="badge badge-info room-card-badge">Reserved</span>'
          : r.status === 'Under Cleaning'
            ? '<span class="badge badge-warning room-card-badge">Cleaning</span>'
            : '<span class="badge badge-neutral room-card-badge">Maintenance</span>';

    const demandBadge = r.demandLevel === 'High Demand'
      ? '<span class="badge badge-warning"><span class="material-symbols-outlined" style="font-size:14px;">trending_up</span> High Demand</span>'
      : r.demandLevel === 'Low Demand'
        ? '<span class="badge badge-success"><span class="material-symbols-outlined" style="font-size:14px;">trending_down</span> Low Demand</span>'
        : '';

    const priceStrike = r.dynamicPrice !== r.basePrice
      ? `<span class="text-muted" style="text-decoration:line-through; font-size:0.9rem;">${formatCurrency(r.basePrice)}</span>` : '';

    const bookBtn = r.status === 'Available'
      ? `<a href="room-details.html?id=${r.id}" class="btn btn-primary">Book Now</a>`
      : `<span class="text-muted font-size-sm">${r.status}</span>`;

    // Map room types to beautiful Unsplash images
    let imgUrl = 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=800&auto=format&fit=crop';
    if (r.type === 'Deluxe') imgUrl = 'https://images.unsplash.com/photo-1582719478250-c89404bb8a0e?q=80&w=800&auto=format&fit=crop';
    else if (r.type === 'Suite') imgUrl = 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=800&auto=format&fit=crop';
    else if (r.type === 'Penthouse') imgUrl = 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?q=80&w=800&auto=format&fit=crop';

    // Use room image if available, otherwise use type-based image
    const displayImg = r.image || imgUrl;

    return `
      <div class="card room-card p-0 card-hover" data-room-id="${r.id}">
        <div class="room-card-img-wrapper">
          <img src="${displayImg}" alt="${r.type}" class="room-card-img" onerror="this.src='https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500&h=400&fit=crop'">
          ${statusBadge}
        </div>
        <div class="room-card-body">
          <div class="d-flex justify-content-between align-items-start mb-sm">
            <div>
              <h3 class="mb-xs">${r.type} <span class="text-muted font-size-sm">#${r.roomNumber}</span></h3>
              <p class="text-muted font-size-sm">Floor ${r.floor}</p>
            </div>
            <div class="d-flex align-items-center gap-xs text-secondary font-weight-600">
              <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">star</span> ${r.rating}
            </div>
          </div>
          
          <div class="room-features">
            <span><span class="material-symbols-outlined">group</span> ${r.capacity}</span>
            <span><span class="material-symbols-outlined">bed</span> ${r.bedType}</span>
            ${r.amenities.slice(0, 2).map(a => `<span><span class="material-symbols-outlined">check_circle</span> ${a}</span>`).join('')}
          </div>
          
          <div class="room-price-row mt-md pt-md border-top">
            <div>
              <div class="d-flex align-items-center gap-sm mb-xs">
                <span class="text-muted font-size-sm text-uppercase">Per Night</span> ${demandBadge}
              </div>
              <div class="d-flex align-items-end gap-sm">
                <span class="price-amount">${formatCurrency(r.dynamicPrice)}</span>
                ${priceStrike}
              </div>
            </div>
            ${bookBtn}
          </div>
        </div>
      </div>`;
  }).join('');
}

/* ── Room Details Page ────────────────────────────────────────────── */
function initRoomDetails() {
  const params = new URLSearchParams(window.location.search);
  const roomId = params.get('id') || sessionStorage.getItem('stayEasePro_selectedRoom');
  if (!roomId) { showToast('No room selected.', 'warning'); return; }

  sessionStorage.setItem('stayEasePro_selectedRoom', roomId);
  const room = findById('stayEasePro_rooms', roomId);
  if (!room) { showToast('Room not found.', 'error'); return; }

  // Populate page elements
  const el = (id) => document.getElementById(id);
  if (el('rdTitle'))      el('rdTitle').textContent = room.type;
  if (el('rdRoomNum'))    el('rdRoomNum').textContent = `Room ${room.roomNumber} • Floor ${room.floor}`;
  if (el('rdRating'))     el('rdRating').textContent = room.rating;
  if (el('rdDescription'))el('rdDescription').textContent = room.description;
  if (el('rdCapacity'))   el('rdCapacity').textContent = `${room.capacity} Guests`;
  if (el('rdBedType'))    el('rdBedType').textContent = room.bedType;
  if (el('rdPrice'))      el('rdPrice').textContent = formatCurrency(room.dynamicPrice);
  if (el('rdBasePrice'))  el('rdBasePrice').textContent = room.dynamicPrice !== room.basePrice ? formatCurrency(room.basePrice) : '';

  // Demand badge
  const demandEl = el('rdDemand');
  if (demandEl) {
    demandEl.textContent = room.demandLevel;
    demandEl.className = 'badge ' + (room.demandLevel === 'High Demand' ? 'badge-warning' : room.demandLevel === 'Low Demand' ? 'badge-success' : 'badge-primary');
  }
  if (el('rdDemandReason')) el('rdDemandReason').textContent = room.dynamicReason;

  // Amenities
  const amenList = el('rdAmenities');
  if (amenList) {
    amenList.innerHTML = room.amenities.map(a => `
      <div class="d-flex align-items-center gap-sm">
        <span class="material-symbols-outlined text-primary">check_circle</span>
        <span>${a}</span>
      </div>
    `).join('');
  }

  // Status badge
  const statusEl = el('rdStatus');
  if (statusEl) {
    statusEl.textContent = room.status;
    statusEl.className = 'badge ' + (room.status === 'Available' ? 'badge-success' : 'badge-danger');
  }

  // Max guests for the booking form select
  const guestSelect = document.getElementById('rdGuests');
  if (guestSelect) {
    guestSelect.innerHTML = '';
    for (let i = 1; i <= room.capacity; i++) {
      guestSelect.innerHTML += `<option value="${i}">${i} Guest${i > 1 ? 's' : ''}</option>`;
    }
  }

  // Date constraints
  const todayStr = new Date().toISOString().split('T')[0];
  const ciInput = document.getElementById('rdCheckInDate');
  const coInput = document.getElementById('rdCheckOutDate');
  if (ciInput) {
    ciInput.min = todayStr;
    ciInput.addEventListener('change', () => {
      if (ciInput.value) {
        const nextDay = new Date(ciInput.value);
        nextDay.setDate(nextDay.getDate() + 1);
        const nextDayStr = nextDay.toISOString().split('T')[0];
        if (coInput) {
          coInput.min = nextDayStr;
          if (coInput.value && coInput.value < nextDayStr) {
            coInput.value = nextDayStr;
            updatePrice();
          }
        }
      }
    });
  }
  if (coInput) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    coInput.min = tomorrow.toISOString().split('T')[0];
  }

  // Live price update
  const updatePrice = () => {
    const ciDate = document.getElementById('rdCheckInDate')?.value;
    const coDate = document.getElementById('rdCheckOutDate')?.value;
    if (!ciDate || !coDate) return;
    const nights = Math.ceil((new Date(coDate) - new Date(ciDate)) / (1000 * 60 * 60 * 24));
    if (nights <= 0) return;
    const roomAmt = room.dynamicPrice * nights;
    const adj = room.dynamicPrice !== room.basePrice ? (room.dynamicPrice - room.basePrice) * nights : 0;
    const taxes = Math.round(roomAmt * 0.12);
    const fee = Math.round(roomAmt * 0.05);
    const total = roomAmt + taxes + fee;
    if (el('rdNights'))      el('rdNights').textContent = nights;
    if (el('rdRoomTotal'))   el('rdRoomTotal').textContent = formatCurrency(roomAmt);
    if (el('rdTax'))         el('rdTax').textContent = formatCurrency(taxes);
    if (el('rdServiceFee'))  el('rdServiceFee').textContent = formatCurrency(fee);
    if (el('rdGrandTotal'))  el('rdGrandTotal').textContent = formatCurrency(total);
  };
  document.getElementById('rdCheckInDate')?.addEventListener('change', updatePrice);
  document.getElementById('rdCheckOutDate')?.addEventListener('change', updatePrice);

  // Book Now
  const bookBtn = document.getElementById('rdBookBtn');
  if (bookBtn) bookBtn.addEventListener('click', () => handleBookRoom(room));
}

function handleBookRoom(room) {
  const user = getCurrentUser();
  if (!user) { showToast('Please login to book a room.', 'warning'); setTimeout(() => { window.location.href = 'login.html'; }, 800); return; }
  if (room.status !== 'Available') { showToast('This room is not available.', 'error'); return; }

  const ciDate = document.getElementById('rdCheckInDate')?.value;
  const ciTime = document.getElementById('rdCheckInTime')?.value || '14:00';
  const coDate = document.getElementById('rdCheckOutDate')?.value;
  const coTime = document.getElementById('rdCheckOutTime')?.value || '11:00';
  const guests = document.getElementById('rdGuests')?.value;

  // Validation
  if (!ciDate) { showToast('Check-in date is required.', 'error'); return; }
  if (!isFutureOrToday(ciDate)) { showToast('Check-in cannot be in the past.', 'error'); return; }
  if (!coDate) { showToast('Check-out date is required.', 'error'); return; }
  const checkInISO = `${ciDate}T${ciTime}`;
  const checkOutISO = `${coDate}T${coTime}`;
  if (!isDateTimeAfter(checkInISO, checkOutISO)) { showToast('Check-out must be after check-in.', 'error'); return; }
  if (!guests || guests < 1) { showToast('At least 1 guest required.', 'error'); return; }
  if (Number(guests) > room.capacity) { showToast(`Maximum ${room.capacity} guests allowed.`, 'error'); return; }

  // Date conflict check
  const bookings = getData('stayEasePro_bookings', []);
  const conflict = bookings.find(b =>
    b.roomId === room.id && b.status !== 'Cancelled' &&
    new Date(checkInISO) < new Date(b.checkOut) && new Date(checkOutISO) > new Date(b.checkIn)
  );
  if (conflict) { showToast('Room is not available for selected dates.', 'error'); return; }

  const nights = Math.ceil((new Date(coDate) - new Date(ciDate)) / (1000 * 60 * 60 * 24));
  const roomAmt = room.dynamicPrice * nights;
  const taxes = Math.round(roomAmt * 0.12);
  const fee = Math.round(roomAmt * 0.05);
  const total = roomAmt + taxes + fee;

  const booking = {
    id: generateId('BK'),
    userId: user.id,
    guestName: user.fullName,
    roomId: room.id,
    roomNumber: room.roomNumber,
    roomType: room.type,
    checkIn: checkInISO,
    checkOut: checkOutISO,
    guests: Number(guests),
    specialRequest: document.getElementById('rdSpecialRequest')?.value || '',
    status: 'Pending Payment',
    paymentStatus: 'Unpaid',
    passcode: '',
    passcodeStatus: 'Not Generated',
    totalAmount: total,
    createdAt: new Date().toISOString()
  };

  // Store as pending so confirmation page can load it
  sessionStorage.setItem('stayEasePro_pendingBooking', JSON.stringify(booking));
  window.location.href = 'booking-confirmation.html';
}

/* ── Home Page: Featured Rooms ────────────────────────────────────── */
function initHomeFeaturedRooms() {
  const grid = document.getElementById('featuredRoomGrid');
  if (!grid) return;
  recalculateDynamicPricing();
  const rooms = getData('stayEasePro_rooms', []).filter(r => r.status === 'Available').slice(0, 3);
  
  grid.innerHTML = rooms.map(r => {
    // Map room types to images
    let imgUrl = r.image || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500&h=400&fit=crop';
    if (r.type === 'Deluxe') imgUrl = r.image || 'https://images.unsplash.com/photo-1582719478250-c89404bb8a0e?q=80&w=800&auto=format&fit=crop';
    else if (r.type === 'Suite') imgUrl = r.image || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=800&auto=format&fit=crop';
    else if (r.type === 'Family') imgUrl = r.image || 'https://images.unsplash.com/photo-1629632072367-48b5b8e22ca2?w=500&h=400&fit=crop';
    
    return `
    <div class="card room-card p-0">
      <div class="room-card-img-wrapper" style="height: 200px; overflow: hidden;">
        <img src="${imgUrl}" alt="${r.type}" class="room-card-img" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500&h=400&fit=crop'">
        <span class="badge badge-success room-card-badge">Available</span>
      </div>
      <div class="room-card-body">
        <div class="d-flex justify-content-between align-items-center mb-sm">
          <h3 class="mb-0">${r.type}</h3>
          <div class="d-flex align-items-center gap-xs" style="color: var(--secondary);">
            <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">star</span> ${r.rating}
          </div>
        </div>
        <p class="text-muted font-size-sm mb-md">${r.description}</p>
        <div class="room-features mb-md">
          <span><span class="material-symbols-outlined">group</span> ${r.capacity} Guests</span>
          <span><span class="material-symbols-outlined">bed</span> ${r.bedType}</span>
        </div>
        <div class="d-flex justify-content-between align-items-center mt-auto pt-md border-top">
          <div>
            <p class="text-muted font-size-sm mb-xs">Starting from</p>
            <div class="price-amount">${formatCurrency(r.dynamicPrice)}</div>
            ${r.dynamicPrice !== r.basePrice ? `<span class="text-muted" style="text-decoration:line-through; font-size:0.85rem;">${formatCurrency(r.basePrice)}</span>` : ''}
          </div>
          <a href="room-details.html?id=${r.id}" class="btn btn-primary">View Details</a>
        </div>
      </div>
    </div>`;
  }).join('');
}
