/* ===================================================================
   passcode.js — Digital Room Passcode generation & status
   =================================================================== */

/** Generate a unique 6-digit passcode not already active. */
function generateUniquePasscode() {
  const bookings = getData('stayEasePro_bookings', []);
  const active = new Set(bookings.filter(b => b.passcodeStatus === 'Active').map(b => b.passcode));
  let code;
  do { code = String(Math.floor(100000 + Math.random() * 900000)); } while (active.has(code));
  return code;
}

/**
 * Determine the current passcode status for a booking.
 * Returns: "Not Generated" | "Locked" | "Active" | "Expired"
 */
function getPasscodeStatus(booking) {
  if (!booking.passcode) return 'Not Generated';
  const now = new Date();
  const checkIn  = new Date(booking.checkIn);
  const checkOut = new Date(booking.checkOut);
  if (now < checkIn)  return 'Locked';
  if (now >= checkIn && now <= checkOut) return 'Active';
  return 'Expired';
}

/** Refresh passcode statuses for all non-cancelled bookings in localStorage. */
function refreshPasscodeStatuses() {
  const bookings = getData('stayEasePro_bookings', []);
  let changed = false;
  bookings.forEach(b => {
    if (b.status === 'Cancelled') return;
    const newStatus = getPasscodeStatus(b);
    if (b.passcodeStatus !== newStatus && b.passcode) {
      b.passcodeStatus = newStatus;
      changed = true;
    }
    // Auto-update booking status based on dates
    const now = new Date();
    if (b.status === 'Confirmed' && now >= new Date(b.checkIn) && now <= new Date(b.checkOut)) {
      b.status = 'Checked In'; changed = true;
    }
    if ((b.status === 'Checked In' || b.status === 'Confirmed') && now > new Date(b.checkOut)) {
      b.status = 'Completed'; changed = true;
    }
  });
  if (changed) setData('stayEasePro_bookings', bookings);
}
