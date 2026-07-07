function initReportsPage() {
  const rooms = getData('stayEasePro_rooms', []);
  const bookings = getData('stayEasePro_bookings', []);
  const payments = getData('stayEasePro_payments', []);

  // Compute stats for each room
  const stats = rooms.map(r => {
    const roomBookings = bookings.filter(b => b.roomId === r.id && b.status !== 'Cancelled');
    const roomPayments = payments.filter(p => p.status === 'Paid' && roomBookings.some(b => b.id === p.bookingId));
    const revenue = roomPayments.reduce((sum, p) => sum + p.amount, 0);
    
    let nightsBooked = 0;
    roomBookings.forEach(b => {
      const ms = new Date(b.checkOut) - new Date(b.checkIn);
      const nights = Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
      nightsBooked += nights;
    });
    const occupancyPct = Math.min(100, Math.round((nightsBooked / 30) * 100));

    return {
      roomNumber: r.roomNumber,
      type: r.type,
      occupancy: occupancyPct,
      revenue: revenue
    };
  });

  // Sort by revenue descending
  stats.sort((a, b) => b.revenue - a.revenue);

  // Render top 3 to table
  const tbody = document.querySelector('.admin-table tbody');
  if (tbody) {
    tbody.innerHTML = '';
    stats.slice(0, 3).forEach(s => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${s.roomNumber} (${s.type})</td>
        <td>${s.occupancy}%</td>
        <td class="text-success">${formatAdminCurrency(s.revenue)}</td>
      `;
      tbody.appendChild(tr);
    });
  }
}
