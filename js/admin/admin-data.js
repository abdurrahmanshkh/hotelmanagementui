/* ===================================================================
   admin-data.js — Default Admin Credentials and Mock Data Seeding
   =================================================================== */

/**
 * Ensures admin data (admins, pricing rules, etc.) is seeded in localStorage.
 * Does not overwrite if data already exists.
 */
function seedAdminData() {
  // Seed Admins
  const admins = getData('stayEasePro_admins', []);
  if (admins.length === 0) {
    const defaultAdmins = [
      {
        id: "ADM-1001",
        fullName: "Priya Mehta",
        email: "admin@example.com",
        phone: "9876500001",
        password: "Admin@123",
        staffCode: "STAFF2026",
        role: "admin",
        createdAt: "2026-07-01T10:00:00"
      },
      {
        id: "ADM-1002",
        fullName: "Rajesh Kumar",
        email: "manager@example.com",
        phone: "9876500002",
        password: "Manager@123",
        staffCode: "STAFF2027",
        role: "manager",
        createdAt: "2026-07-02T10:00:00"
      },
      {
        id: "ADM-1003",
        fullName: "Sneha Patel",
        email: "staff@example.com",
        phone: "9876500003",
        password: "Staff@123",
        staffCode: "STAFF2028",
        role: "staff",
        createdAt: "2026-07-03T10:00:00"
      }
    ];
    setData('stayEasePro_admins', defaultAdmins);
  }

  // Seed Dynamic Pricing Rules
  const pricingRules = getData('stayEasePro_pricingRules', []);
  if (pricingRules.length === 0) {
    const rules = [
      {
        id: "PRICING-001",
        roomType: "Standard",
        basePrice: 1800,
        minPrice: 1500,
        maxPrice: 2500,
        highDemandIncrease: 25,
        lowDemandDiscount: 15,
        enabled: true,
        createdAt: new Date().toISOString()
      },
      {
        id: "PRICING-002",
        roomType: "Deluxe",
        basePrice: 2800,
        minPrice: 2400,
        maxPrice: 3800,
        highDemandIncrease: 30,
        lowDemandDiscount: 20,
        enabled: true,
        createdAt: new Date().toISOString()
      },
      {
        id: "PRICING-003",
        roomType: "Suite",
        basePrice: 4500,
        minPrice: 3800,
        maxPrice: 5500,
        highDemandIncrease: 35,
        lowDemandDiscount: 25,
        enabled: true,
        createdAt: new Date().toISOString()
      },
      {
        id: "PRICING-004",
        roomType: "Family",
        basePrice: 5200,
        minPrice: 4500,
        maxPrice: 6500,
        highDemandIncrease: 30,
        lowDemandDiscount: 20,
        enabled: true,
        createdAt: new Date().toISOString()
      }
    ];
    setData('stayEasePro_pricingRules', rules);
  }

  // Seed Hotel Settings
  const settings = getData('stayEasePro_settings', {});
  if (!settings.hotelName) {
    const defaultSettings = {
      hotelName: "StayEase Pro",
      address: "123 Luxury Avenue, Downtown",
      phone: "1800-STAYEASE",
      email: "support@stayeasepro.com",
      checkInTime: "15:00",
      checkOutTime: "11:00",
      timezone: "Asia/Kolkata",
      currency: "INR",
      taxRate: 12,
      serviceFeeRate: 5,
      autoConfirmBookings: true,
      sendEmailNotifications: true,
      sendSMSNotifications: false,
      maintenanceContactEmail: "maintenance@stayeasepro.com",
      emergencyNumber: "999-EMERGENCY",
      createdAt: new Date().toISOString()
    };
    setData('stayEasePro_settings', defaultSettings);
  }
}

// Immediately run seeding on script load (assuming storage.js is loaded before this)
if (typeof getData === 'function') {
  seedAdminData();
}
