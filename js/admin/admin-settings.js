/* ===================================================================
   admin-settings.js — Hotel & Admin Settings
   =================================================================== */

function initSettingsPage() {
  const currentSettings = getData('stayEasePro_settings', {
    hotelName: "StayEase Pro Bengaluru",
    email: "support@stayease.com",
    address: "123 Tech Park Road, Whitefield, Bengaluru, Karnataka 560066",
    checkInTime: "14:00",
    checkOutTime: "11:00",
    autoConfirmBookings: true
  });

  const hotelNameEl = document.getElementById('setHotelName');
  const emailEl = document.getElementById('setSupportEmail');
  const addressEl = document.getElementById('setAddress');
  const checkInEl = document.getElementById('setCheckInTime');
  const checkOutEl = document.getElementById('setCheckOutTime');
  const autoConfirmEl = document.getElementById('setAllowEarlyCheckIn');

  if (hotelNameEl) hotelNameEl.value = currentSettings.hotelName || '';
  if (emailEl) emailEl.value = currentSettings.email || currentSettings.supportEmail || '';
  if (addressEl) addressEl.value = currentSettings.address || '';
  if (checkInEl) checkInEl.value = currentSettings.checkInTime || '14:00';
  if (checkOutEl) checkOutEl.value = currentSettings.checkOutTime || '11:00';
  if (autoConfirmEl) autoConfirmEl.checked = currentSettings.autoConfirmBookings !== false;

  const saveBtn = document.querySelector('.page-header .admin-btn-primary');
  if (saveBtn) {
    saveBtn.addEventListener('click', (e) => {
      e.preventDefault();
      
      const newSettings = {
        ...currentSettings,
        hotelName: hotelNameEl ? hotelNameEl.value.trim() : currentSettings.hotelName,
        email: emailEl ? emailEl.value.trim() : currentSettings.email,
        address: addressEl ? addressEl.value.trim() : currentSettings.address,
        checkInTime: checkInEl ? checkInEl.value : currentSettings.checkInTime,
        checkOutTime: checkOutEl ? checkOutEl.value : currentSettings.checkOutTime,
        autoConfirmBookings: autoConfirmEl ? autoConfirmEl.checked : currentSettings.autoConfirmBookings
      };

      setData('stayEasePro_settings', newSettings);
      showToast('Settings saved successfully.', 'success');
    });
  }

  // Bind settings sidebar to show toast for now, since it's a single form layout mock
  const navBtns = document.querySelectorAll('.admin-settings-layout .admin-btn-outline');
  navBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      navBtns.forEach(b => {
        b.style.background = 'transparent';
      });
      e.currentTarget.style.background = 'var(--admin-surface-alt)';
    });
  });
}
