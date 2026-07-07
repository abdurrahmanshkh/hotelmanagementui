/* ===================================================================
   admin-pricing.js — Dynamic Pricing Management
   =================================================================== */

let pricingRules = [];
let allRoomsForPricing = [];

function initDynamicPricingPage() {
  pricingRules = getData('stayEasePro_pricingRules', []);
  allRoomsForPricing = getData('stayEasePro_rooms', []);
  
  renderPricingRules();
  recalculateDynamicPrices();
}

function renderPricingRules() {
  const tbody = document.querySelector('.admin-table tbody');
  if (!tbody) return;

  tbody.innerHTML = '';
  
  pricingRules.forEach((rule, index) => {
    // Count rooms of this type
    const typedRooms = allRoomsForPricing.filter(r => r.type === rule.roomType);
    const total = typedRooms.length;
    const occupied = typedRooms.filter(r => r.status === 'Occupied' || r.status === 'Checked In').length;
    const occPercentage = total > 0 ? Math.round((occupied / total) * 100) : 0;

    let demandStr = 'Normal';
    let demandBadge = 'badge-success';
    if (occPercentage < 30) {
      demandStr = 'Low Demand';
      demandBadge = 'badge-info';
    } else if (occPercentage >= 70) {
      demandStr = 'High Demand';
      demandBadge = 'badge-danger';
    }

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td data-label="Room Type"><strong>${rule.roomType}</strong></td>
      <td data-label="Base Price">${formatAdminCurrency(rule.basePrice)}</td>
      <td data-label="Low Demand">-${rule.lowDemandDiscount}%</td>
      <td data-label="High Demand">+${rule.highDemandIncrease}%</td>
      <td data-label="Limits">${formatAdminCurrency(rule.minPrice)} - ${formatAdminCurrency(rule.maxPrice)}</td>
      <td data-label="Current Occupancy"><span class="admin-badge ${demandBadge}">${occPercentage}% (${demandStr})</span></td>
      <td data-label="Status">
        <label style="display:inline-flex; align-items:center; cursor:pointer;">
          <input type="checkbox" ${rule.enabled ? 'checked' : ''} class="toggle-rule" data-index="${index}" style="width:16px; height:16px; accent-color:var(--admin-primary);">
        </label>
      </td>
      <td data-label="Actions">
        <!-- Edit modal removed to simplify UI -->
      </td>
    `;
    tbody.appendChild(tr);
  });

  document.querySelectorAll('.toggle-rule').forEach(cb => {
    cb.addEventListener('change', (e) => {
      const idx = e.currentTarget.getAttribute('data-index');
      pricingRules[idx].enabled = e.currentTarget.checked;
      setData('stayEasePro_pricingRules', pricingRules);
      recalculateDynamicPrices();
      showToast('Dynamic pricing rules updated.', 'success');
    });
  });
}

function recalculateDynamicPrices() {
  let pricesChanged = false;
  
  allRoomsForPricing.forEach(room => {
    const rule = pricingRules.find(r => r.roomType === room.type);
    if (!rule) return;

    let newDynPrice = room.basePrice;
    let demandLevel = 'Normal';
    let dynamicReason = 'Normal pricing active.';

    if (rule.enabled) {
      // Calculate occupancy for this room type again
      const typedRooms = allRoomsForPricing.filter(r => r.type === rule.roomType);
      const total = typedRooms.length;
      const occupied = typedRooms.filter(r => r.status === 'Occupied' || r.status === 'Checked In').length;
      const occPercentage = total > 0 ? Math.round((occupied / total) * 100) : 0;

      if (occPercentage < 30) {
        demandLevel = 'Low Demand';
        dynamicReason = `Low demand (${occPercentage}% occupancy). Applied ${rule.lowDemandDiscount}% discount.`;
        newDynPrice = room.basePrice * (1 - rule.lowDemandDiscount / 100);
      } else if (occPercentage >= 70) {
        demandLevel = 'High Demand';
        dynamicReason = `High demand (${occPercentage}% occupancy). Applied ${rule.highDemandIncrease}% markup.`;
        newDynPrice = room.basePrice * (1 + rule.highDemandIncrease / 100);
      }
      
      // Clamp to min/max
      if (newDynPrice < rule.minPrice) newDynPrice = rule.minPrice;
      if (newDynPrice > rule.maxPrice) newDynPrice = rule.maxPrice;
    } else {
      dynamicReason = 'Dynamic pricing is disabled for this room type.';
    }

    newDynPrice = Math.round(newDynPrice);

    if (room.dynamicPrice !== newDynPrice || room.demandLevel !== demandLevel) {
      room.dynamicPrice = newDynPrice;
      room.demandLevel = demandLevel;
      room.dynamicReason = dynamicReason;
      pricesChanged = true;
    }
  });

  if (pricesChanged) {
    setData('stayEasePro_rooms', allRoomsForPricing);
  }
}
