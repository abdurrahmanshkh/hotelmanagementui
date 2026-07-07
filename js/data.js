/* ===================================================================
   data.js — Mock Data & Seeding for StayEase Pro Customer Portal
   =================================================================== */

const MOCK_DATA = {
  /* ── Users ──────────────────────────────────────────────────────── */
  users: [
    {
      id: "USR-1001",
      fullName: "Aarav Sharma",
      email: "guest@example.com",
      phone: "9876543210",
      password: "Guest@123",
      governmentIdType: "Aadhaar",
      governmentIdNumber: "XXXX-XXXX-1234",
      role: "customer",
      createdAt: "2026-07-01T10:00:00"
    }
  ],

  /* ── Rooms ──────────────────────────────────────────────────────── */
  rooms: [
    {
      id: "RM-101", roomNumber: "101", type: "Standard", floor: 1,
      capacity: 2, bedType: "Queen Bed", basePrice: 1800,
      dynamicPrice: 1800, demandLevel: "Normal", dynamicReason: "Normal pricing active.",
      amenities: ["Wi-Fi", "AC", "TV", "Telephone"],
      status: "Available", cleaningStatus: "Clean", rating: 4.3,
      description: "A comfortable standard room with all essential amenities for a pleasant stay.",
      image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500&h=400&fit=crop",
      bookedDates: []
    },
    {
      id: "RM-102", roomNumber: "102", type: "Standard", floor: 1,
      capacity: 2, bedType: "Twin Beds", basePrice: 1800,
      dynamicPrice: 1800, demandLevel: "Normal", dynamicReason: "Normal pricing active.",
      amenities: ["Wi-Fi", "AC", "TV"],
      status: "Available", cleaningStatus: "Clean", rating: 4.1,
      description: "Bright twin-bed standard room ideal for friends or colleagues travelling together.",
      image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500&h=400&fit=crop",
      bookedDates: []
    },
    {
      id: "RM-205", roomNumber: "205", type: "Deluxe", floor: 2,
      capacity: 3, bedType: "King Bed", basePrice: 2800,
      dynamicPrice: 2800, demandLevel: "Normal", dynamicReason: "Normal pricing active.",
      amenities: ["Wi-Fi", "AC", "Smart TV", "Mini Bar", "Rain Shower"],
      status: "Available", cleaningStatus: "Clean", rating: 4.6,
      description: "Spacious deluxe room with a king bed, city view, and premium in-room amenities.",
      image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500&h=400&fit=crop",
      bookedDates: []
    },
    {
      id: "RM-208", roomNumber: "208", type: "Deluxe", floor: 2,
      capacity: 3, bedType: "King Bed", basePrice: 2800,
      dynamicPrice: 2800, demandLevel: "Normal", dynamicReason: "Normal pricing active.",
      amenities: ["Wi-Fi", "AC", "Smart TV", "Bathtub", "Work Desk"],
      status: "Available", cleaningStatus: "Clean", rating: 4.7,
      description: "Our popular deluxe room featuring a relaxing bathtub and a dedicated work desk.",
      image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500&h=400&fit=crop",
      bookedDates: []
    },
    {
      id: "RM-305", roomNumber: "305", type: "Deluxe", floor: 3,
      capacity: 3, bedType: "King Bed", basePrice: 2800,
      dynamicPrice: 2800, demandLevel: "Normal", dynamicReason: "Normal pricing active.",
      amenities: ["Wi-Fi", "AC", "Smart TV", "Rain Shower", "Coffee Maker", "In-room Safe"],
      status: "Occupied", cleaningStatus: "Clean", rating: 4.8,
      description: "Premium corner deluxe room with panoramic windows and top-tier furnishings.",
      image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500&h=400&fit=crop",
      bookedDates: []
    },
    {
      id: "RM-310", roomNumber: "310", type: "Suite", floor: 3,
      capacity: 4, bedType: "2 King Beds", basePrice: 4500,
      dynamicPrice: 4500, demandLevel: "Normal", dynamicReason: "Normal pricing active.",
      amenities: ["Wi-Fi", "AC", "Smart TV", "Living Area", "Kitchenette", "Bathtub", "City View"],
      status: "Available", cleaningStatus: "Clean", rating: 4.9,
      description: "Luxury suite with a separate living area, kitchenette, and breathtaking city view.",
      image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500&h=400&fit=crop",
      bookedDates: []
    },
    {
      id: "RM-312", roomNumber: "312", type: "Suite", floor: 3,
      capacity: 4, bedType: "2 King Beds", basePrice: 4500,
      dynamicPrice: 4500, demandLevel: "Normal", dynamicReason: "Normal pricing active.",
      amenities: ["Wi-Fi", "AC", "Smart TV", "Living Area", "Jacuzzi", "Mini Bar"],
      status: "Maintenance", cleaningStatus: "Pending", rating: 5.0,
      description: "Our finest suite with a private jacuzzi and world-class finishes throughout.",
      image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500&h=400&fit=crop",
      bookedDates: []
    },
    {
      id: "RM-410", roomNumber: "410", type: "Family", floor: 4,
      capacity: 5, bedType: "1 King + 2 Single", basePrice: 5200,
      dynamicPrice: 5200, demandLevel: "Normal", dynamicReason: "Normal pricing active.",
      amenities: ["Wi-Fi", "AC", "Smart TV", "Kids Area", "Extra Towels", "Refrigerator"],
      status: "Available", cleaningStatus: "Clean", rating: 4.5,
      description: "Spacious family room with a dedicated kids area and extra sleeping arrangements.",
      image: "https://images.unsplash.com/photo-1629632072367-48b5b8e22ca2?w=500&h=400&fit=crop",
      bookedDates: []
    },
    {
      id: "RM-412", roomNumber: "412", type: "Family", floor: 4,
      capacity: 6, bedType: "2 King + 2 Single", basePrice: 5200,
      dynamicPrice: 5200, demandLevel: "Normal", dynamicReason: "Normal pricing active.",
      amenities: ["Wi-Fi", "AC", "Smart TV", "Kids Area", "Kitchenette", "Balcony"],
      status: "Available", cleaningStatus: "Clean", rating: 4.4,
      description: "Our largest family room with a private balcony and full kitchenette for extended stays.",
      image: "https://images.unsplash.com/photo-1629632072367-48b5b8e22ca2?w=500&h=400&fit=crop",
      bookedDates: []
    },
    {
      id: "RM-103", roomNumber: "103", type: "Standard", floor: 1,
      capacity: 2, bedType: "Queen Bed", basePrice: 1800,
      dynamicPrice: 1800, demandLevel: "Normal", dynamicReason: "Normal pricing active.",
      amenities: ["Wi-Fi", "AC", "TV", "Work Desk"],
      status: "Under Cleaning", cleaningStatus: "Pending", rating: 4.2,
      description: "A cozy standard room with a work desk, perfect for business travellers.",
      image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500&h=400&fit=crop",
      bookedDates: []
    }
  ],

  /* ── Pricing Rules ──────────────────────────────────────────────── */
  pricingRules: [
    { roomType: "Standard",  basePrice: 1800, lowDemandDiscount: 15, highDemandIncrease: 25, minPrice: 1400, maxPrice: 2500, enabled: true },
    { roomType: "Deluxe",    basePrice: 2800, lowDemandDiscount: 15, highDemandIncrease: 25, minPrice: 2200, maxPrice: 4000, enabled: true },
    { roomType: "Suite",     basePrice: 4500, lowDemandDiscount: 10, highDemandIncrease: 30, minPrice: 3800, maxPrice: 6500, enabled: true },
    { roomType: "Family",    basePrice: 5200, lowDemandDiscount: 10, highDemandIncrease: 25, minPrice: 4500, maxPrice: 7000, enabled: true }
  ],

  /* ── Bookings (sample pre-seeded) ───────────────────────────────── */
  bookings: [
    {
      id: "BK-2026-1042",
      userId: "USR-1001",
      guestName: "Aarav Sharma",
      roomId: "RM-305",
      roomNumber: "305",
      roomType: "Deluxe",
      checkIn: "2026-07-05T14:00",
      checkOut: "2026-07-08T11:00",
      guests: 2,
      specialRequest: "High floor room with extra pillows.",
      status: "Checked In",
      paymentStatus: "Paid",
      passcode: "482913",
      passcodeStatus: "Active",
      totalAmount: 11446,
      createdAt: "2026-07-04T12:00:00"
    },
    {
      id: "BK-2026-1015",
      userId: "USR-1001",
      guestName: "Aarav Sharma",
      roomId: "RM-101",
      roomNumber: "101",
      roomType: "Standard",
      checkIn: "2026-06-20T14:00",
      checkOut: "2026-06-22T11:00",
      guests: 1,
      specialRequest: "",
      status: "Completed",
      paymentStatus: "Paid",
      passcode: "371856",
      passcodeStatus: "Expired",
      totalAmount: 4248,
      createdAt: "2026-06-18T09:00:00"
    }
  ],

  /* ── Payments ───────────────────────────────────────────────────── */
  payments: [
    { id: "PAY-893021", bookingId: "BK-2026-1042", userId: "USR-1001", amount: 11446, method: "Card", status: "Paid", paidAt: "2026-07-04T12:15:00" },
    { id: "PAY-870112", bookingId: "BK-2026-1015", userId: "USR-1001", amount: 4248,  method: "UPI",  status: "Paid", paidAt: "2026-06-18T09:30:00" }
  ],

  /* ── Service Requests ───────────────────────────────────────────── */
  serviceRequests: [
    {
      id: "SR-4021", userId: "USR-1001", bookingId: "BK-2026-1042",
      roomNumber: "305", serviceType: "Extra Towels", priority: "Medium",
      preferredTime: "15:30", description: "Need 2 extra bath towels.",
      status: "In Progress", adminResponse: "Housekeeping is on the way.",
      createdAt: "2026-07-05T15:30:00", updatedAt: "2026-07-05T15:35:00"
    },
    {
      id: "SR-4022", userId: "USR-1001", bookingId: "BK-2026-1042",
      roomNumber: "305", serviceType: "Room Cleaning", priority: "Low",
      preferredTime: "10:00", description: "",
      status: "Completed", adminResponse: "Room has been cleaned.",
      createdAt: "2026-07-06T10:00:00", updatedAt: "2026-07-06T10:45:00"
    }
  ],

  /* ── Chats ──────────────────────────────────────────────────────── */
  chats: [
    {
      id: "CHAT-305-1042", userId: "USR-1001", bookingId: "BK-2026-1042",
      roomNumber: "305", guestName: "Aarav Sharma", archived: false,
      messages: [
        { id: "MSG-001", sender: "admin",    text: "Hello Aarav! Welcome to StayEase Pro. How can we help you today?", timestamp: "2026-07-05T14:05:00", read: true },
        { id: "MSG-002", sender: "customer", text: "Hi, I just checked into Room 305. Can I get two extra water bottles?", timestamp: "2026-07-05T14:10:00", read: true },
        { id: "MSG-003", sender: "admin",    text: "Absolutely! I will send someone up with water right away. Anything else?", timestamp: "2026-07-05T14:11:00", read: true },
        { id: "MSG-004", sender: "customer", text: "No, that's it. Thanks!", timestamp: "2026-07-05T14:12:00", read: true }
      ]
    }
  ],

  /* ── Notifications ──────────────────────────────────────────────── */
  notifications: [
    { id: "NTF-001", userId: "USR-1001", type: "booking",  message: "Booking BK-2026-1042 confirmed. Have a great stay!", read: false, createdAt: "2026-07-04T12:15:00", relatedId: "BK-2026-1042" },
    { id: "NTF-002", userId: "USR-1001", type: "payment",  message: "Payment of ₹11,446 received successfully.",         read: true,  createdAt: "2026-07-04T12:15:00", relatedId: "PAY-893021" },
    { id: "NTF-003", userId: "USR-1001", type: "passcode", message: "Your room passcode is now active for Room 305.",     read: false, createdAt: "2026-07-05T14:00:00", relatedId: "BK-2026-1042" }
  ],

  /* ── Feedback ───────────────────────────────────────────────────── */
  feedback: [
    {
      id: "FB-001", userId: "USR-1001", bookingId: "BK-2026-1015",
      rating: 5, cleanliness: 5, service: 4, comfort: 5, valueForMoney: 4,
      comment: "Excellent stay! The room was spotless and the staff were very helpful.",
      createdAt: "2026-06-22T12:00:00"
    }
  ]
};

/**
 * Seeds localStorage with mock data on first load only.
 * Call this on every page load via app.js.
 */
function seedData() {
  if (localStorage.getItem('stayEasePro_initialized')) return;

  localStorage.setItem('stayEasePro_users',           JSON.stringify(MOCK_DATA.users));
  localStorage.setItem('stayEasePro_rooms',           JSON.stringify(MOCK_DATA.rooms));
  localStorage.setItem('stayEasePro_pricingRules',    JSON.stringify(MOCK_DATA.pricingRules));
  localStorage.setItem('stayEasePro_bookings',        JSON.stringify(MOCK_DATA.bookings));
  localStorage.setItem('stayEasePro_payments',        JSON.stringify(MOCK_DATA.payments));
  localStorage.setItem('stayEasePro_serviceRequests', JSON.stringify(MOCK_DATA.serviceRequests));
  localStorage.setItem('stayEasePro_chats',           JSON.stringify(MOCK_DATA.chats));
  localStorage.setItem('stayEasePro_notifications',   JSON.stringify(MOCK_DATA.notifications));
  localStorage.setItem('stayEasePro_feedback',        JSON.stringify(MOCK_DATA.feedback));
  localStorage.setItem('stayEasePro_initialized',     'true');
}

/** Wipe ALL app data and re-seed with defaults. */
function resetAllData() {
  const keys = [
    'stayEasePro_users','stayEasePro_rooms','stayEasePro_pricingRules',
    'stayEasePro_bookings','stayEasePro_payments','stayEasePro_serviceRequests',
    'stayEasePro_chats','stayEasePro_notifications','stayEasePro_feedback',
    'stayEasePro_initialized','stayEasePro_currentUser'
  ];
  keys.forEach(k => localStorage.removeItem(k));
  sessionStorage.clear();
  seedData();
}
