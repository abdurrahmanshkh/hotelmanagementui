/* ===================================================================
   admin-data.js — Default Admin Credentials and Mock Data Seeding
   =================================================================== */

/**
 * Ensures the default admin exists in localStorage.
 * Does not overwrite if admins already exist.
 */
function seedAdminData() {
  const admins = getData('stayEasePro_admins', []);
  
  if (admins.length === 0) {
    const defaultAdmin = {
      id: "ADM-1001",
      fullName: "Priya Mehta",
      email: "admin@example.com",
      phone: "9876500001",
      password: "Admin@123",
      staffCode: "STAFF2026",
      role: "admin",
      createdAt: "2026-07-01T10:00:00"
    };
    
    admins.push(defaultAdmin);
    setData('stayEasePro_admins', admins);
  }
}

// Immediately run seeding on script load (assuming storage.js is loaded before this)
if (typeof getData === 'function') {
  seedAdminData();
}
