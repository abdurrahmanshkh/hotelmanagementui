# StayEase Pro — Java Console App Prompts

> **Instructions**: Copy each prompt below one at a time into your AI tool on your office laptop. Start with **Prompt 1** (project overview), then proceed sequentially through all prompts. Each prompt creates specific Java files. Do NOT skip any prompt. After all prompts are completed, the project will be ready to import into Eclipse IDE and run.

---

## Prompt 1 — Project Overview & Structure (DO NOT GENERATE CODE YET)

```
I want you to help me build a complete Java console application called "StayEase Pro — Hotel Management System". This is a comprehensive hotel management system with TWO user roles: Customer and Admin. I will give you prompts one by one to create each file. Do NOT generate any code yet — just acknowledge this overview.

PROJECT STRUCTURE (Eclipse Java Project):
```
StayEaseProConsole/
├── src/
│   ├── models/
│   │   ├── User.java
│   │   ├── Admin.java
│   │   ├── Room.java
│   │   ├── Booking.java
│   │   ├── Payment.java
│   │   ├── ServiceRequest.java
│   │   ├── ChatThread.java
│   │   ├── ChatMessage.java
│   │   ├── PricingRule.java
│   │   ├── Notification.java
│   │   ├── Feedback.java
│   │   └── HotelSettings.java
│   ├── services/
│   │   ├── StorageService.java
│   │   ├── AuthService.java
│   │   ├── RoomService.java
│   │   ├── BookingService.java
│   │   ├── PaymentService.java
│   │   ├── ServiceRequestService.java
│   │   ├── ChatService.java
│   │   ├── PricingService.java
│   │   ├── NotificationService.java
│   │   ├── ReportService.java
│   │   └── ValidationService.java
│   ├── ui/
│   │   ├── ConsoleUI.java
│   │   ├── CustomerMenu.java
│   │   └── AdminMenu.java
│   ├── data/
│   │   └── DataSeeder.java
│   └── Main.java
├── data/
│   ├── users.json
│   ├── admins.json
│   ├── rooms.json
│   ├── bookings.json
│   ├── payments.json
│   ├── service_requests.json
│   ├── chats.json
│   ├── pricing_rules.json
│   ├── notifications.json
│   ├── feedback.json
│   └── settings.json
```

DATA PERSISTENCE:
- All data is stored in JSON files inside a `data/` folder at the project root.
- Use the Gson library (com.google.gson) for JSON serialization/deserialization.
- On first run, if JSON files don't exist, seed them with sample data.

KEY FEATURES — CUSTOMER PANEL:
1. Signup with full validation (name, email, phone 10 digits, password with uppercase+digit+8 chars, government ID with Aadhaar/PAN/Passport/DL format validation), password hashing with SHA-256
2. Login with email + hashed password comparison
3. Browse rooms with filtering (by type: Standard/Deluxe/Suite/Family, by availability) and sorting (by price low/high, by rating)
4. View room details (amenities, capacity, bed type, dynamic price, demand level)
5. Book a room with date validation (future dates, check-out after check-in, date conflict detection, guest count ≤ room capacity)
6. Price calculation: roomPrice × nights + 12% taxes + 5% service fee
7. Payment simulation (Card/UPI/Cash methods with validation — 16 digit card, 3 digit CVV, UPI format user@bank)
8. Passcode generation (6-digit) on successful payment with status tracking (Not Active Yet → Active → Expired)
9. My Bookings — view active/upcoming/completed/cancelled bookings with tabs
10. Booking details with check-in/check-out actions, cancel with auto-refund
11. Service requests (housekeeping, room service, maintenance, concierge) with priority assignment and status tracking (Pending → Accepted → In Progress → Completed)
12. Chat — dual mode: AI Concierge (auto-replies based on keywords like wifi, towel, food, pool, gym, checkout, breakfast, transport) and Front Desk (admin replies manually)
13. Notifications (booking confirmations, payment receipts, passcode alerts, welcome messages)
14. Feedback/rating for completed stays (overall rating 1-5, cleanliness, service, comfort, value for money, comment)
15. Logout

KEY FEATURES — ADMIN PANEL:
1. Admin login with email + password + optional staff code
2. Dashboard — show metrics: total rooms, available rooms, occupancy rate, today's revenue, pending service requests, unread chat count
3. Room management — CRUD: add/edit/delete rooms with validation (unique room number, positive price, at least 1 amenity), toggle maintenance status
4. Booking management — view all bookings with search/filter, view details, mark check-in (only if paid), mark check-out (sets room to Under Cleaning), cancel booking with auto-refund
5. Guest directory — list all customers with current status (Active Guest/Upcoming Guest/Past Guest), total stays count
6. Service requests — Kanban-style status management: move requests through Pending → Accepted → In Progress → Completed
7. Chat — view and reply to customer admin-mode chat threads
8. Dynamic pricing — view pricing rules per room type, toggle enabled/disabled, recalculate prices based on occupancy (< 30% = Low Demand with discount, > 70% = High Demand with markup, clamped to min/max prices)
9. Housekeeping — view all rooms with cleaning status, start cleaning, mark as cleaned (sets room back to Available)
10. Payments — view all transactions with search/filter, mark refunds
11. Reports — revenue by room type, bookings by status, occupancy by room type, service completion rates, export to CSV file
12. Settings — view/edit hotel name, email, address, check-in/check-out times, auto-confirm toggle
13. Admin logout

SAMPLE DATA TO SEED:
- 2 customers: Aarav Sharma (guest@example.com / Guest@123), Emily Chen (emily@example.com / Guest@123)
- 3 admins: Priya Mehta (admin@example.com / Admin@123 / STAFF2026), Rajesh Kumar (manager@example.com / Manager@123 / STAFF2027), Sneha Patel (staff@example.com / Staff@123 / STAFF2028)
- 10 rooms across 4 types: Standard (101,102,103), Deluxe (205,208,305), Suite (310,312), Family (410,412) — with varying prices, amenities, statuses
- 4 pricing rules (Standard/Deluxe/Suite/Family) with base prices, discount/markup percentages, min/max limits
- 4 sample bookings, 4 sample payments, 2 service requests, 2 chat threads, 3 notifications, 1 feedback entry

IMPORTANT RULES:
- All passwords must be hashed using SHA-256 before storing. Login compares hashed input with stored hash.
- All IDs follow format: PREFIX-YEAR-RANDOM4DIGITS (e.g., BK-2026-4829, USR-2026-1001)
- Currency is INR (₹), formatted as Indian numbering (e.g., ₹ 1,24,500)
- Use Scanner for all user input
- Clean console output with borders, headers, and formatted tables
- Proper input validation everywhere with meaningful error messages

Please acknowledge this overview and confirm you understand. I will send prompts for each file next.
```

---

## Prompt 2 — Model Classes (Part 1: User, Admin, Room)

```
Create the following 3 Java model classes for the StayEase Pro Hotel Management Console App. These are POJO classes used for JSON serialization with Gson. All fields should have getters and setters.

FILE 1: src/models/User.java
package models;
Fields:
- String id (e.g., "USR-2026-1001")
- String fullName
- String email
- String phone (10 digits)
- String passwordHash (SHA-256 hashed password — never store plain text)
- String governmentIdType (one of: "Aadhaar", "PAN", "Passport", "Driving License")
- String governmentIdNumber
- String role (always "customer")
- String createdAt (ISO 8601 format string like "2026-07-01T10:00:00")

Include a constructor that takes all fields, and also a no-arg constructor for Gson.

FILE 2: src/models/Admin.java
package models;
Fields:
- String id (e.g., "ADM-2026-1001")
- String fullName
- String email
- String phone
- String passwordHash (SHA-256 hashed)
- String staffCode (e.g., "STAFF2026")
- String role (one of: "admin", "manager", "staff")
- String createdAt

FILE 3: src/models/Room.java
package models;
Fields:
- String id (e.g., "RM-101")
- String roomNumber (e.g., "101")
- String type (one of: "Standard", "Deluxe", "Suite", "Family")
- int floor
- int capacity (max guests)
- String bedType (e.g., "Queen Bed", "King Bed", "Twin Beds", "2 King Beds", "1 King + 2 Single")
- double basePrice (e.g., 1800.0)
- double dynamicPrice (calculated from pricing rules)
- String demandLevel ("Normal", "Low Demand", "High Demand")
- String dynamicReason (explanation text)
- List<String> amenities (e.g., ["Wi-Fi", "AC", "Smart TV", "Mini Bar"])
- String status (one of: "Available", "Occupied", "Reserved", "Under Cleaning", "Maintenance")
- String cleaningStatus (one of: "Clean", "Pending", "In Progress", "Required")
- double rating (1.0 to 5.0)
- String description (room description text)

Include constructors and all getters/setters. Also include a toString() method that formats the room nicely for console display showing: Room Number, Type, Price (₹ formatted), Status, and Rating.
```

---

## Prompt 3 — Model Classes (Part 2: Booking, Payment, ServiceRequest)

```
Create the following 3 Java model classes for StayEase Pro. All are POJOs with Gson serialization support. Include getters, setters, no-arg constructor, and full constructor.

FILE 1: src/models/Booking.java
package models;
Fields:
- String id (e.g., "BK-2026-1042")
- String userId (references User.id)
- String guestName
- String roomId (references Room.id)
- String roomNumber
- String roomType
- String checkIn (ISO date-time string like "2026-07-05T14:00")
- String checkOut (ISO date-time string like "2026-07-08T11:00")
- int guests (number of guests)
- String specialRequest (free text, can be empty)
- String status (one of: "Pending Payment", "Confirmed", "Checked In", "Completed", "Cancelled")
- String paymentStatus (one of: "Unpaid", "Paid", "Failed", "Refunded")
- String passcode (6-digit string like "482913", empty string if not generated)
- String passcodeStatus (one of: "Not Generated", "Not Active Yet", "Active", "Locked", "Expired")
- double totalAmount (total including taxes and fees)
- String createdAt (ISO 8601)

FILE 2: src/models/Payment.java
package models;
Fields:
- String id (e.g., "PAY-2026-8930")
- String bookingId (references Booking.id)
- String userId (references User.id)
- double amount
- String method (one of: "Card", "UPI", "Cash")
- String status (one of: "Paid", "Failed", "Refunded")
- String paidAt (ISO 8601 timestamp)

FILE 3: src/models/ServiceRequest.java
package models;
Fields:
- String id (e.g., "SR-2026-4021")
- String userId
- String bookingId
- String roomNumber
- String serviceType (free text description like "Extra Towels", "Room Cleaning")
- String category (one of: "housekeeping", "room_service", "maintenance", "concierge")
- String description (detailed description)
- String priority (one of: "Low", "Medium", "High", "Emergency")
- String status (one of: "Pending", "Accepted", "In Progress", "Completed")
- String adminResponse (admin's reply text, initially empty)
- String createdAt
- String updatedAt

Include toString() for each that shows a clean formatted summary suitable for console output.
```

---

## Prompt 4 — Model Classes (Part 3: Chat, Pricing, Notification, Feedback, Settings)

```
Create the following 6 Java model classes for StayEase Pro.

FILE 1: src/models/ChatMessage.java
package models;
Fields:
- String id (e.g., "MSG-2026-001")
- String sender (one of: "customer", "admin")
- String text (message content)
- String timestamp (ISO 8601)
- boolean read

FILE 2: src/models/ChatThread.java
package models;
Fields:
- String id (e.g., "CHAT-2026-305")
- String userId (references User.id)
- String bookingId (references Booking.id)
- String roomNumber
- String guestName
- String chatType (one of: "ai", "admin")
- boolean archived
- List<ChatMessage> messages (list of ChatMessage objects)

FILE 3: src/models/PricingRule.java
package models;
Fields:
- String id (e.g., "PRICING-001")
- String roomType (one of: "Standard", "Deluxe", "Suite", "Family")
- double basePrice
- double minPrice
- double maxPrice
- int highDemandIncrease (percentage, e.g., 25 means +25%)
- int lowDemandDiscount (percentage, e.g., 15 means -15%)
- boolean enabled
- String createdAt

FILE 4: src/models/Notification.java
package models;
Fields:
- String id
- String userId
- String type (one of: "booking", "payment", "passcode", "welcome", "refund", "service")
- String message
- boolean read
- String createdAt
- String relatedId

FILE 5: src/models/Feedback.java
package models;
Fields:
- String id
- String userId
- String bookingId
- int rating (1-5)
- int cleanliness (1-5)
- int service (1-5)
- int comfort (1-5)
- int valueForMoney (1-5)
- String comment
- String createdAt

FILE 6: src/models/HotelSettings.java
package models;
Fields:
- String hotelName (default "StayEase Pro")
- String address
- String phone
- String email
- String checkInTime (default "14:00")
- String checkOutTime (default "11:00")
- String currency (default "INR")
- int taxRate (default 12, representing 12%)
- int serviceFeeRate (default 5, representing 5%)
- boolean autoConfirmBookings (default true)

All classes need no-arg constructors, full constructors, getters, and setters.
```

---

## Prompt 5 — StorageService & ValidationService

```
Create the following 2 Java service classes for StayEase Pro.

FILE 1: src/services/StorageService.java
package services;

This is the core persistence layer. It reads/writes all data to JSON files using Gson.

Requirements:
- Has a static final String DATA_DIR = "data" (folder path)
- On construction, creates the data/ directory if it doesn't exist
- Generic methods:
  - <T> List<T> loadList(String filename, Class<T[]> clazz) — reads a JSON array file and returns a List<T>. Returns empty list if file doesn't exist.
  - <T> void saveList(String filename, List<T> list) — writes a List<T> as a JSON array to file with pretty printing
  - <T> T loadObject(String filename, Class<T> clazz) — reads a single JSON object. Returns null if file doesn't exist.
  - <T> void saveObject(String filename, T obj) — writes a single object to JSON file
- File mapping constants:
  - USERS_FILE = "users.json"
  - ADMINS_FILE = "admins.json"
  - ROOMS_FILE = "rooms.json"
  - BOOKINGS_FILE = "bookings.json"
  - PAYMENTS_FILE = "payments.json"
  - SERVICE_REQUESTS_FILE = "service_requests.json"
  - CHATS_FILE = "chats.json"
  - PRICING_RULES_FILE = "pricing_rules.json"
  - NOTIFICATIONS_FILE = "notifications.json"
  - FEEDBACK_FILE = "feedback.json"
  - SETTINGS_FILE = "settings.json"
- Convenience methods for each entity:
  - List<User> loadUsers() / void saveUsers(List<User>)
  - List<Admin> loadAdmins() / void saveAdmins(List<Admin>)
  - List<Room> loadRooms() / void saveRooms(List<Room>)
  - List<Booking> loadBookings() / void saveBookings(List<Booking>)
  - List<Payment> loadPayments() / void savePayments(List<Payment>)
  - List<ServiceRequest> loadServiceRequests() / void saveServiceRequests(List<ServiceRequest>)
  - List<ChatThread> loadChats() / void saveChats(List<ChatThread>)
  - List<PricingRule> loadPricingRules() / void savePricingRules(List<PricingRule>)
  - List<Notification> loadNotifications() / void saveNotifications(List<Notification>)
  - List<Feedback> loadFeedback() / void saveFeedback(List<Feedback>)
  - HotelSettings loadSettings() / void saveSettings(HotelSettings)
- Utility:
  - static String generateId(String prefix) — returns PREFIX-YEAR-RANDOM4DIGITS format (e.g., "BK-2026-4829")
  - static String now() — returns current date-time in ISO 8601 format
  - static String formatCurrency(double amount) — formats as Indian currency "₹ X,XX,XXX" using Indian numbering system (NumberFormat with Locale "en-IN")

FILE 2: src/services/ValidationService.java
package services;

Static utility methods for validation:
- boolean isRequired(String val) — not null, not empty after trim
- boolean isValidEmail(String val) — matches pattern ^[^\s@]+@[^\s@]+\.[^\s@]+$
- boolean isValidPhone(String val) — matches exactly 10 digits
- boolean isStrongPassword(String val) — at least 8 chars, at least 1 uppercase letter, at least 1 digit
- boolean isValidCardNumber(String val) — exactly 16 digits (ignoring spaces)
- boolean isValidCVV(String val) — exactly 3 digits
- boolean isValidUPI(String val) — matches pattern like username@bankname
- boolean isValidRating(int val) — between 1 and 5 inclusive
- boolean isValidAadhaar(String val) — 12 digits (ignoring spaces/hyphens)
- boolean isValidPAN(String val) — 5 letters + 4 digits + 1 letter (case insensitive)
- boolean isValidPassport(String val) — 1 letter + 7 digits
- boolean isValidDL(String val) — 2 letters + 2 digits + 4 digits + 7 digits
- boolean isFutureOrToday(String dateStr) — parses yyyy-MM-dd and checks if date is today or in the future
- boolean isDateAfter(String start, String end) — checks that end date is strictly after start date
- String hashPassword(String password) — SHA-256 hash, returned as lowercase hex string. Use java.security.MessageDigest.
- String generatePasscode() — random 6-digit string (e.g., "482913")
```

---

## Prompt 6 — DataSeeder

```
Create the data seeder class for StayEase Pro.

FILE: src/data/DataSeeder.java
package data;

This class seeds all JSON files with sample data ONLY if the files are empty or don't exist. It uses StorageService for persistence and ValidationService.hashPassword() to hash all passwords.

Method: public static void seedAll(StorageService storage)

It should check if each file already has data (list is non-empty). If empty, seed with the following:

USERS (2 customers):
1. id="USR-1001", fullName="Aarav Sharma", email="guest@example.com", phone="9876543210", password=hash("Guest@123"), governmentIdType="Aadhaar", governmentIdNumber="XXXX-XXXX-1234", role="customer"
2. id="USR-1002", fullName="Emily Chen", email="emily@example.com", phone="9876543211", password=hash("Guest@123"), governmentIdType="Passport", governmentIdNumber="L8932018", role="customer"

ADMINS (3):
1. id="ADM-1001", fullName="Priya Mehta", email="admin@example.com", password=hash("Admin@123"), staffCode="STAFF2026", role="admin"
2. id="ADM-1002", fullName="Rajesh Kumar", email="manager@example.com", password=hash("Manager@123"), staffCode="STAFF2027", role="manager"
3. id="ADM-1003", fullName="Sneha Patel", email="staff@example.com", password=hash("Staff@123"), staffCode="STAFF2028", role="staff"

ROOMS (10 rooms):
1. RM-101, room 101, Standard, floor 1, cap 2, Queen Bed, base ₹1800, amenities [Wi-Fi, AC, TV, Telephone], Available, Clean, rating 4.3
2. RM-102, room 102, Standard, floor 1, cap 2, Twin Beds, base ₹1800, amenities [Wi-Fi, AC, TV], Available, Clean, rating 4.1
3. RM-103, room 103, Standard, floor 1, cap 2, Queen Bed, base ₹1800, amenities [Wi-Fi, AC, TV, Work Desk], Under Cleaning, Pending, rating 4.2
4. RM-205, room 205, Deluxe, floor 2, cap 3, King Bed, base ₹2800, amenities [Wi-Fi, AC, Smart TV, Mini Bar, Rain Shower], Available, Clean, rating 4.6
5. RM-208, room 208, Deluxe, floor 2, cap 3, King Bed, base ₹2800, amenities [Wi-Fi, AC, Smart TV, Bathtub, Work Desk], Available, Clean, rating 4.7
6. RM-305, room 305, Deluxe, floor 3, cap 3, King Bed, base ₹2800, amenities [Wi-Fi, AC, Smart TV, Rain Shower, Coffee Maker, In-room Safe], Occupied, Clean, rating 4.8
7. RM-310, room 310, Suite, floor 3, cap 4, 2 King Beds, base ₹4500, amenities [Wi-Fi, AC, Smart TV, Living Area, Kitchenette, Bathtub, City View], Occupied, Clean, rating 4.9
8. RM-312, room 312, Suite, floor 3, cap 4, 2 King Beds, base ₹4500, amenities [Wi-Fi, AC, Smart TV, Living Area, Jacuzzi, Mini Bar], Occupied, Clean, rating 5.0
9. RM-410, room 410, Family, floor 4, cap 5, 1 King + 2 Single, base ₹5200, amenities [Wi-Fi, AC, Smart TV, Kids Area, Extra Towels, Refrigerator], Available, Clean, rating 4.5
10. RM-412, room 412, Family, floor 4, cap 6, 2 King + 2 Single, base ₹5200, amenities [Wi-Fi, AC, Smart TV, Kids Area, Kitchenette, Balcony], Available, Clean, rating 4.4
- Set dynamicPrice = basePrice and demandLevel = "Normal" for all rooms initially.

PRICING RULES (4):
1. Standard: base ₹1800, min ₹1400, max ₹2500, highDemandIncrease 25%, lowDemandDiscount 15%, enabled true
2. Deluxe: base ₹2800, min ₹2200, max ₹4000, highDemandIncrease 25%, lowDemandDiscount 15%, enabled true
3. Suite: base ₹4500, min ₹3800, max ₹6500, highDemandIncrease 30%, lowDemandDiscount 10%, enabled true
4. Family: base ₹5200, min ₹4500, max ₹7000, highDemandIncrease 25%, lowDemandDiscount 10%, enabled true

BOOKINGS (4):
1. BK-2026-1042: USR-1001 Aarav, room RM-305 #305 Deluxe, checkin 2026-07-05T14:00, checkout 2026-07-08T11:00, 2 guests, status Checked In, Paid, passcode 482913 Active, total 11446
2. BK-2026-1043: USR-1002 Emily, room RM-310 #310 Suite, checkin 2026-07-06T14:00, checkout 2026-07-09T11:00, 2 guests, Checked In, Paid, passcode 109483 Active, total 15930
3. BK-2026-1044: USR-1002 Emily, room RM-312 #312 Suite, checkin 2026-07-06T14:00, checkout 2026-07-09T11:00, 3 guests, Checked In, Paid, passcode 839201 Active, total 15930
4. BK-2026-1015: USR-1001 Aarav, room RM-101 #101 Standard, checkin 2026-06-20T14:00, checkout 2026-06-22T11:00, 1 guest, Completed, Paid, passcode 371856 Expired, total 4248

PAYMENTS (4 matching the bookings above):
1. PAY-893021: booking BK-2026-1042, user USR-1001, amount 11446, Card, Paid
2. PAY-893022: booking BK-2026-1043, user USR-1002, amount 15930, UPI, Paid
3. PAY-893023: booking BK-2026-1044, user USR-1002, amount 15930, Card, Paid
4. PAY-870112: booking BK-2026-1015, user USR-1001, amount 4248, UPI, Paid

SERVICE REQUESTS (2):
1. SR-4021: USR-1001, booking BK-2026-1042, room 305, Extra Towels, housekeeping, Medium priority, In Progress, admin response "Housekeeping is on the way."
2. SR-4022: USR-1001, booking BK-2026-1042, room 305, Room Cleaning, housekeeping, Low priority, Completed, admin response "Room has been cleaned."

CHATS (2 threads, both with chatType "admin"):
1. CHAT-305-1042: USR-1001, booking BK-2026-1042, room 305, Aarav Sharma, 4 messages (admin welcome → customer asks for water → admin confirms → customer thanks)
2. CHAT-310-1043: USR-1002, booking BK-2026-1043, room 310, Emily Chen, 3 messages (customer asks about pool → admin responds hours → customer asks about late checkout)

NOTIFICATIONS (3):
1. NTF-001: USR-1001, booking type, "Booking BK-2026-1042 confirmed. Have a great stay!", unread
2. NTF-002: USR-1001, payment type, "Payment of ₹11,446 received successfully.", read
3. NTF-003: USR-1001, passcode type, "Your room passcode is now active for Room 305.", unread

FEEDBACK (1):
1. FB-001: USR-1001, booking BK-2026-1015, rating 5, cleanliness 5, service 4, comfort 5, value 4, "Excellent stay! The room was spotless and the staff were very helpful."

SETTINGS:
- hotelName "StayEase Pro", address "123 Luxury Avenue, Downtown", phone "1800-STAYEASE", email "support@stayeasepro.com", checkInTime "14:00", checkOutTime "11:00", currency "INR", taxRate 12, serviceFeeRate 5, autoConfirmBookings true
```

---

## Prompt 7 — AuthService

```
Create the AuthService class for StayEase Pro.

FILE: src/services/AuthService.java
package services;

This handles all authentication logic for both customers and admins. It keeps a reference to StorageService and tracks the currently logged-in user (either User or Admin).

Fields:
- StorageService storage
- User currentUser (null if not logged in)
- Admin currentAdmin (null if not logged in)

Methods:

CUSTOMER AUTH:
- SignupResult signup(String fullName, String email, String phone, String password, String confirmPassword, String govIdType, String govIdNumber)
  - Validates ALL fields using ValidationService:
    - fullName: required, min 3 chars
    - email: valid email format, must be unique (not already registered)
    - phone: exactly 10 digits
    - password: strong password (8+ chars, 1 uppercase, 1 digit)
    - confirmPassword: must match password
    - govIdType: must be one of Aadhaar, PAN, Passport, Driving License
    - govIdNumber: validated by type (Aadhaar=12 digits, PAN=ABCDE1234F, Passport=A1234567, DL=DL1420110012345)
  - If valid: creates User with hashed password, saves to users.json, sets currentUser, creates welcome notification
  - Returns SignupResult (success boolean + message string)

- LoginResult login(String email, String password)
  - Validates email format and password not empty
  - Loads users, finds by email (case-insensitive), compares SHA-256 hash of input password with stored passwordHash
  - If match: sets currentUser, returns success
  - If not: returns failure with "Invalid email or password."

- void logout() — clears currentUser
- User getCurrentUser() — returns currentUser
- boolean isLoggedIn() — returns currentUser != null

ADMIN AUTH:
- LoginResult adminLogin(String email, String password, String staffCode)
  - Loads admins, finds by email + hashed password match
  - If staffCode is provided and doesn't match admin's staffCode, fail with "Invalid staff code."
  - Sets currentAdmin on success

- void adminLogout() — clears currentAdmin
- Admin getCurrentAdmin() — returns currentAdmin
- boolean isAdminLoggedIn() — returns currentAdmin != null

Create inner classes or simple result objects:
- SignupResult: boolean success, String message
- LoginResult: boolean success, String message
```

---

## Prompt 8 — RoomService & PricingService

```
Create the following 2 service classes for StayEase Pro.

FILE 1: src/services/RoomService.java
package services;

Manages all room operations. Takes StorageService in constructor.

Methods:
- List<Room> getAllRooms()
- List<Room> getAvailableRooms()
- Room getRoomById(String roomId)
- List<Room> filterRooms(String type, String status) — filter by room type (or "All") and status (or "All")
- List<Room> sortRooms(List<Room> rooms, String sortBy) — sortBy can be "priceLow", "priceHigh", "ratingHigh", "ratingLow"
- void displayRoomList(List<Room> rooms) — prints a formatted table showing: #, Room No, Type, Bed, Capacity, Price (₹ formatted with dynamic price), Status, Rating. Use printf with column alignment.
- void displayRoomDetails(Room room) — prints full details: all fields including description, amenities list, demand level, dynamic pricing reason
- boolean addRoom(String roomNumber, String type, int floor, int capacity, String bedType, double basePrice, List<String> amenities, String description)
  - Validates: room number unique, capacity > 0, price > 0, at least 1 amenity
  - Creates room with status Available, cleaningStatus Clean, dynamicPrice = basePrice
- boolean editRoom(String roomId, String roomNumber, String type, int floor, int capacity, double basePrice, List<String> amenities)
  - Validates same as above + room must exist + room number unique (excluding self)
- boolean toggleMaintenance(String roomId) — toggles between Available ↔ Maintenance (blocks if room is Occupied)
- void updateRoomStatus(String roomId, String newStatus) — updates status and saves

FILE 2: src/services/PricingService.java
package services;

Handles dynamic pricing calculations.

Methods:
- List<PricingRule> getAllRules()
- void displayPricingRules() — formatted table showing room type, base price, discount %, markup %, min-max prices, enabled status, current occupancy percentage and demand level
- void toggleRule(String roomType) — toggles enabled/disabled for a pricing rule
- void recalculateDynamicPrices()
  - For each room type that has an enabled rule:
    1. Count rooms of that type
    2. Count rooms with status "Occupied" or "Reserved"
    3. Calculate occupancy percentage
    4. If < 30%: Low Demand → apply lowDemandDiscount
    5. If >= 70%: High Demand → apply highDemandIncrease
    6. Else: Normal → use base price
    7. Clamp result between minPrice and maxPrice
    8. Update each room's dynamicPrice, demandLevel, dynamicReason
    9. Save rooms
```

---

## Prompt 9 — BookingService

```
Create the BookingService class for StayEase Pro.

FILE: src/services/BookingService.java
package services;

Manages all booking operations. Takes StorageService and PricingService in constructor.

Methods:

CUSTOMER SIDE:
- BookingResult createBooking(User user, String roomId, String checkInDate, String checkOutDate, int guests, String specialRequest)
  - Validates:
    - Room exists and is Available
    - checkInDate is today or future
    - checkOutDate is after checkInDate
    - guests >= 1 and <= room capacity
    - No date conflict with existing bookings for same room (overlap check: newCheckIn < existingCheckOut AND newCheckOut > existingCheckIn, excluding cancelled bookings)
  - Calculates price: 
    - nights = difference in days between check-in and check-out
    - roomAmount = room.dynamicPrice × nights
    - taxes = roomAmount × 12% (round to int)
    - serviceFee = roomAmount × 5% (round to int)
    - totalAmount = roomAmount + taxes + serviceFee
  - Creates Booking with status "Pending Payment", paymentStatus "Unpaid", passcode empty, passcodeStatus "Not Generated"
  - Saves booking
  - Creates notification: "Booking {id} created. Proceed to payment."
  - Returns BookingResult with the booking object and price breakdown (nights, roomAmount, taxes, fee, total)

- void displayBookingSummary(Booking booking, int nights, double roomAmt, double taxes, double fee) — prints a nicely formatted booking confirmation summary with all price details

- List<Booking> getMyBookings(String userId, String tab) — returns user's bookings filtered by tab:
  - "active": status is "Checked In" or (status is "Confirmed" and current date is between check-in and check-out)
  - "upcoming": status is "Confirmed" or "Pending Payment" and check-in is in the future
  - "completed": status is "Completed" or current date is past check-out
  - "cancelled": status is "Cancelled"

- void displayBookingList(List<Booking> bookings) — formatted table with: Booking ID, Room, Type, Check-in, Check-out, Status, Payment, Amount

- void displayBookingDetails(Booking booking) — full details with all fields including passcode info

ADMIN SIDE:
- List<Booking> getAllBookings()
- List<Booking> filterBookings(String searchQuery, String statusFilter) — search by booking ID, guest name, or room number; filter by status
- boolean markCheckIn(String bookingId) — only if paymentStatus is "Paid"; sets status to "Checked In", passcodeStatus to "Active"; sets room status to "Occupied"
- boolean markCheckOut(String bookingId) — sets status to "Completed", passcodeStatus to "Expired"; sets room status to "Under Cleaning", cleaningStatus to "Required"
- boolean cancelBooking(String bookingId) — sets status to "Cancelled"; if paid, sets paymentStatus to "Refunded" and also marks the corresponding payment as Refunded; sets room status back to "Available" if it was Reserved/Occupied

SHARED:
- boolean cancelBookingByCustomer(String bookingId, String userId) — same as cancelBooking but verifies userId matches
- void refreshPasscodeStatuses() — updates passcodeStatus for all bookings based on current time:
  - Before check-in → "Not Active Yet"
  - During stay (between check-in and check-out) → "Active"
  - After check-out → "Expired"
  - If status is "Completed" → "Expired"

Create BookingResult inner class: boolean success, String message, Booking booking, int nights, double roomAmt, double taxes, double fee, double total
```

---

## Prompt 10 — PaymentService

```
Create the PaymentService class for StayEase Pro.

FILE: src/services/PaymentService.java
package services;

Handles payment processing and transaction management. Takes StorageService in constructor.

Methods:

CUSTOMER PAYMENT FLOW:
- PaymentResult processPayment(Booking booking, String method, String cardNumber, String expiryDate, String cvv, String upiId)
  - method is one of: "Card", "UPI", "Cash"
  - Validation based on method:
    - Card: cardNumber must be 16 digits (use ValidationService.isValidCardNumber), CVV must be 3 digits, expiryDate must be in format MM/YY and not expired (month/year >= current month/year)
    - UPI: upiId must match format username@bankname (use ValidationService.isValidUPI)
    - Cash: no validation needed (pay at front desk)
  - Simulates payment processing (print "Processing payment..." with a 1-second Thread.sleep)
  - On success:
    1. Creates Payment record with status "Paid"
    2. Updates booking: status → "Confirmed", paymentStatus → "Paid"
    3. Generates a 6-digit passcode using ValidationService.generatePasscode()
    4. Sets booking passcodeStatus based on check-in date (if check-in is today or past → "Active", if future → "Not Active Yet")
    5. Updates booking passcode and passcodeStatus
    6. If room status was Available, updates room to "Reserved"
    7. Creates payment notification: "Payment of ₹{amount} received successfully."
    8. Creates passcode notification: "Your room passcode for Room {number} is now {status}."
  - Returns PaymentResult with success, message, payment, passcode

ADMIN PAYMENT MANAGEMENT:
- List<Payment> getAllPayments()
- List<Payment> filterPayments(String searchQuery, String statusFilter, String methodFilter) — search by payment ID or guest name (cross-reference with bookings); filter by status and method
- void displayPaymentList(List<Payment> payments) — formatted table with: Payment ID, Booking ID, Guest Name (lookup from bookings), Amount (₹), Method, Status, Date
- boolean markRefund(String paymentId) — marks payment as "Refunded", also updates booking paymentStatus to "Refunded"
- PaymentMetrics getPaymentMetrics() — returns:
  - todayRevenue: sum of Paid payments made today
  - pendingPayments: sum of totalAmount for unpaid bookings
  - monthRefunds: sum of Refunded payment amounts this month

Create PaymentResult inner class: boolean success, String message, Payment payment, String passcode
Create PaymentMetrics inner class: double todayRevenue, double pendingPayments, double monthRefunds
```

---

## Prompt 11 — ServiceRequestService, ChatService, NotificationService

```
Create the following 3 service classes for StayEase Pro.

FILE 1: src/services/ServiceRequestService.java
package services;

Takes StorageService in constructor.

Methods:
- CUSTOMER:
  - boolean submitRequest(String userId, String bookingId, String roomNumber, String category, String details)
    - category must be one of: "housekeeping", "room_service", "maintenance", "concierge"
    - Assigns priority automatically: maintenance → "High", room_service → "Medium", else → "Low"
    - Status starts as "Pending"
  - List<ServiceRequest> getMyRequests(String userId)
  - void displayRequestHistory(List<ServiceRequest> requests) — formatted list with: ID, Service Type, Room, Status, Priority, Time

- ADMIN:
  - List<ServiceRequest> getAllRequests()
  - Map<String, List<ServiceRequest>> getRequestsByStatus() — groups by status for Kanban display (Pending, Accepted, In Progress, Completed)
  - void displayKanbanBoard(Map<String, List<ServiceRequest>> groups) — displays each status column with count and cards showing: priority badge, service type, description, room number, time ago
  - boolean updateRequestStatus(String requestId, String newStatus) — validates transition: Pending→Accepted, Accepted→In Progress, In Progress→Completed; updates status and updatedAt
  - List<ServiceRequest> searchRequests(String query) — search by ID, room number, or service type

FILE 2: src/services/ChatService.java
package services;

Handles dual-mode chat (AI + Admin). Takes StorageService in constructor.

AI auto-reply keywords and responses (same as in the web app):
- "clean" → "We have received your cleaning request. Housekeeping will be there shortly."
- "wifi"/"wi-fi"/"internet"/"password" → "The Wi-Fi network is 'StayEase_Guest' (no password) or 'StayEase_Pro_Fast' with password 'Welcome2026'."
- "towel" → "Extra towels will be sent to your room within 10 minutes."
- "food"/"order"/"menu"/"dining" → "Our staff will assist you with food ordering. Check the in-room menu card."
- "passcode"/"key"/"code" → "Please check your booking details for your current passcode status."
- "checkout"/"check-out"/"late" → "Late check-out can be arranged (up to 1PM free, ₹1000/extra hour). We'll confirm shortly."
- "gym"/"fitness"/"workout" → "Fitness Center is on 2nd Floor, open 24/7. Room keycard grants access."
- "pool"/"swim" → "Rooftop pool on 12th Floor. Hours: 6AM-10PM. Towels provided."
- "taxi"/"transport"/"cab"/"airport" → "We can arrange taxi/car/airport transfers. Provide destination and time."
- "breakfast"/"eat"/"restaurant" → "Complimentary breakfast at 'Spice Route' restaurant, lobby level, 7AM-10:30AM."
- default → "Thank you for contacting support. We will assist you shortly."

Methods:
- CUSTOMER:
  - ChatThread getOrCreateAIChat(String userId, String bookingId, String roomNumber, String guestName)
    - Finds existing AI chat thread for this booking, or creates one with welcome message
  - ChatThread getOrCreateAdminChat(String userId, String bookingId, String roomNumber, String guestName)
    - Same but for admin chat type with "You're connected to Front Desk" welcome
  - void sendMessage(String chatId, String text, String chatType)
    - Validates: text not empty, max 500 chars
    - Adds customer message
    - If chatType is "ai": generates auto-reply using keyword matching after the customer message
    - Saves chats
  - void displayChat(ChatThread chat) — prints messages with timestamps, customer messages right-aligned, admin messages left-aligned (use formatting)

- ADMIN:
  - List<ChatThread> getAdminChats() — returns only chatType="admin" threads, sorted by most recent message
  - void displayChatList(List<ChatThread> chats) — numbered list with: guest name, room number, last message preview, unread count
  - void replyToChat(String chatId, String text)
    - Adds admin message to the thread, marks all customer messages as read
    - Saves chats
  - int getUnreadChatCount() — counts threads that have unread customer messages

FILE 3: src/services/NotificationService.java
package services;

Takes StorageService in constructor.

Methods:
- void addNotification(String userId, String type, String message, String relatedId)
  - Creates and saves a new notification (unread by default)
- List<Notification> getUserNotifications(String userId) — sorted by createdAt descending, limit to 10 most recent
- void displayNotifications(List<Notification> notifications) — formatted list with: type icon (📋 booking, 💳 payment, 🔑 passcode, 👋 welcome, 💰 refund, 🛎️ service), message, time, read/unread indicator
- void markAllRead(String userId) — marks all user's notifications as read
- int getUnreadCount(String userId) — count of unread notifications
```

---

## Prompt 12 — ReportService

```
Create the ReportService class for StayEase Pro.

FILE: src/services/ReportService.java
package services;

Generates analytics reports from actual data. Takes StorageService in constructor.

Methods:

- void displayDashboardMetrics()
  - Loads all data and prints:
    - Total Rooms: count
    - Available Rooms: rooms with status "Available"
    - Occupancy Rate: (Occupied rooms / Total rooms) × 100, formatted as XX%
    - Today's Revenue: sum of Paid payments where paidAt starts with today's date, formatted as ₹
    - Pending Service Requests: count where status is not "Completed" and not "Rejected"
    - Emergency Requests: count of pending requests with priority "Emergency"
    - Unread Chats: count of admin chat threads with unread customer messages

- void displayRevenueReport()
  - Groups bookings by room type (excluding Cancelled)
  - For each type: count of bookings, total revenue from paid payments, average per booking, percentage share of total revenue
  - Prints as formatted table with a bar chart (using # characters to visualize share)

- void displayBookingsReport()
  - Groups bookings by status (Confirmed, Checked In, Completed, Cancelled)
  - Shows count per status as table and simple bar chart
  - Shows 10 most recent bookings as summary table

- void displayOccupancyReport()
  - Groups rooms by type
  - For each type: count total rooms, count occupied rooms, calculate occupancy percentage
  - Shows progress bars using ASCII art (e.g., [████████░░] 80%)
  - Also shows room status distribution: Available, Occupied, Under Cleaning, Maintenance — with counts and percentages

- void displayServiceReport()
  - Groups service requests by category (housekeeping, room_service, maintenance, concierge)
  - For each category: total, completed, pending, completion rate percentage
  - Shows as formatted table

- void exportRevenueReportCSV()
  - Exports booking data to a CSV file at "data/reports/revenue_report_YYYY-MM-DD.csv"
  - Columns: Booking ID, Guest Name, Room Number, Room Type, Check In, Check Out, Total Amount, Status
  - Creates the reports directory if needed
  - Prints confirmation message with file path

- void exportFullReportCSV()
  - Same but includes all data: bookings + payments + service requests in separate sections
```

---

## Prompt 13 — ConsoleUI (Utility Class)

```
Create the ConsoleUI utility class for StayEase Pro.

FILE: src/ui/ConsoleUI.java
package ui;

This is a static utility class for all console display formatting.

Methods:
- static void clearScreen() — prints 50 blank lines to simulate clearing the console
- static void printHeader(String title) — prints a bordered header like:
  ╔══════════════════════════════════════════════════════╗
  ║        🏨 StayEase Pro - Hotel Management          ║
  ║              {title centered}                       ║
  ╚══════════════════════════════════════════════════════╝

- static void printSubHeader(String text) — prints a section header:
  ── {text} ──────────────────────────────────

- static void printMenuOption(int number, String text) — prints "  [number] text"
- static void printSuccess(String msg) — prints "  ✅ " + msg
- static void printError(String msg) — prints "  ❌ " + msg
- static void printWarning(String msg) — prints "  ⚠️ " + msg
- static void printInfo(String msg) — prints "  ℹ️ " + msg
- static void printDivider() — prints a line of dashes
- static void printTableHeader(String... columns) — prints formatted table header with column alignment
- static void printTableRow(String... values) — prints formatted table row
- static void pressEnterToContinue(Scanner scanner) — prints "Press Enter to continue..." and waits
- static int readInt(Scanner scanner, String prompt, int min, int max) — reads an integer with validation loop, shows error on invalid input, retries until valid
- static String readLine(Scanner scanner, String prompt) — prints prompt and reads a line
- static String readNonEmpty(Scanner scanner, String prompt) — keeps asking until non-empty input
- static double readDouble(Scanner scanner, String prompt) — reads a double with validation
- static void printProgressBar(int percent) — prints ASCII progress bar like [████████░░░░░░░░░░░░] 40%

Use these color constants (ANSI escape codes, works in most terminals):
- RESET = "\033[0m"
- RED = "\033[0;31m"
- GREEN = "\033[0;32m"
- YELLOW = "\033[0;33m"
- BLUE = "\033[0;34m"
- CYAN = "\033[0;36m"
- BOLD = "\033[1m"
- DIM = "\033[2m"
```

---

## Prompt 14 — CustomerMenu

```
Create the CustomerMenu class for StayEase Pro.

FILE: src/ui/CustomerMenu.java
package ui;

This class handles the entire customer-facing menu flow. It takes references to all services in its constructor: StorageService, AuthService, RoomService, BookingService, PaymentService, ServiceRequestService, ChatService, NotificationService, PricingService.

It uses a Scanner for all input (passed in constructor or created).

Methods:

- void showLoginOrSignup()
  Main entry: asks user to Login, Signup, or Go Back.
  SIGNUP FLOW:
    1. Prompt for full name (min 3 chars)
    2. Prompt for email (validate format)
    3. Prompt for phone (10 digits)
    4. Prompt for password (show requirements: 8+ chars, 1 uppercase, 1 digit)
    5. Prompt to confirm password
    6. Prompt to select government ID type (1=Aadhaar, 2=PAN, 3=Passport, 4=DL) — show format hints
    7. Prompt for government ID number (validate by type)
    8. Call authService.signup() — show result message
  LOGIN FLOW:
    1. Prompt for email
    2. Prompt for password
    3. Call authService.login() — show result
    4. On success → showMainMenu()

- void showMainMenu()
  Loops showing menu until logout:
    [1] 🏨 Browse Rooms
    [2] 📋 My Bookings
    [3] 🛎️ Service Requests
    [4] 💬 Chat
    [5] 🔔 Notifications (show unread count)
    [6] 👤 My Profile
    [7] 🚪 Logout

- void browseRooms()
  1. Show filter options: by type (All/Standard/Deluxe/Suite/Family), by availability (All/Available only)
  2. Show sort options: 1=Price Low→High, 2=Price High→Low, 3=Rating High→Low
  3. Display filtered/sorted room list
  4. Ask: "Enter room number to view details (or 0 to go back)"
  5. If room selected: show full details then ask "Book this room? (y/n)"
  6. If yes → bookRoom flow

- void bookRoom(Room room)
  1. Prompt check-in date (yyyy-MM-dd format, must be today or future)
  2. Prompt check-out date (must be after check-in)
  3. Prompt number of guests (1 to room capacity)
  4. Prompt special request (optional, can be empty)
  5. Call bookingService.createBooking() — display price breakdown
  6. Ask "Proceed to payment? (y/n)"
  7. If yes → processPayment flow
  8. If no → booking stays as "Pending Payment"

- void processPayment(Booking booking)
  1. Display booking summary with total
  2. Ask payment method: [1] Card, [2] UPI, [3] Cash
  3. Based on method, collect details:
     Card: card number (16 digits), expiry (MM/YY), CVV (3 digits)
     UPI: UPI ID (user@bank format)
     Cash: no input needed
  4. Call paymentService.processPayment()
  5. On success: display passcode, show confirmation message
  6. On failure: show error, ask to retry

- void showMyBookings()
  1. Show tabs: [1] Active, [2] Upcoming, [3] Completed, [4] Cancelled
  2. Display bookings for selected tab
  3. Ask: "Enter booking ID to view details (or 0 to go back)"
  4. If selected: show full details with options:
     - Active/Upcoming: [1] Cancel Booking
     - Completed: [1] Leave Feedback
     - Pending Payment: [1] Pay Now

- void showServiceRequests()
  1. Show service request history
  2. Prompt: [1] Request Housekeeping, [2] Request Room Service, [3] Request Maintenance, [4] Request Concierge, [5] Custom Request, [0] Back
  3. For quick requests (1-4): auto-fill category and ask for description/details
  4. For custom: ask for category and details
  5. Select which active booking the request is for (dropdown if multiple)

- void showChat()
  1. Show chat mode: [1] AI Concierge, [2] Front Desk (Admin)
  2. Display existing conversation messages
  3. Show input prompt. Type message and press Enter to send. Type "/back" to exit chat.
  4. For AI: show auto-reply immediately
  5. For Admin: show "Message sent. Staff will respond shortly." (admin replies appear when admin uses admin panel)

- void showNotifications()
  Display notifications list, then mark all as read.

- void showProfile()
  Display current user profile (name, email, phone, ID type, ID number, joined date).
  Option to update name or phone.

- void leaveFeedback(String bookingId)
  1. Prompt for overall rating (1-5)
  2. Prompt for cleanliness rating (1-5)
  3. Prompt for service rating (1-5)
  4. Prompt for comfort rating (1-5)
  5. Prompt for value for money (1-5)
  6. Prompt for comment (optional)
  7. Save feedback
```

---

## Prompt 15 — AdminMenu

```
Create the AdminMenu class for StayEase Pro.

FILE: src/ui/AdminMenu.java
package ui;

Handles the admin panel menu. Takes references to all services in constructor.

Methods:

- void showAdminLogin()
  1. Prompt email, password, staff code (optional)
  2. Call authService.adminLogin()
  3. On success → showAdminMainMenu()

- void showAdminMainMenu()
  Shows dashboard metrics first (total rooms, available, occupancy rate, today's revenue, pending requests, unread chats), then menu:
    [1] 🏨 Room Management
    [2] 📋 Booking Management
    [3] 👥 Guest Directory
    [4] 🛎️ Service Requests
    [5] 💬 Chats
    [6] 💰 Dynamic Pricing
    [7] 🧹 Housekeeping
    [8] 💳 Payments
    [9] 📊 Reports
    [10] ⚙️ Settings
    [11] 🚪 Logout

- void manageRooms()
  Loop:
    Display all rooms table
    [1] Add New Room, [2] Edit Room, [3] Toggle Maintenance, [4] Search/Filter Rooms, [0] Back
  ADD: Prompt for room number (unique), type (select Standard/Deluxe/Suite/Family), floor, capacity, bed type, base price. Show checkbox-style amenity selection (list numbered amenities, user enters comma-separated numbers).
  EDIT: Enter room ID → show current values → prompt for new values (press Enter to keep current)
  TOGGLE MAINTENANCE: Enter room ID → toggle between Available ↔ Maintenance (block if Occupied)
  FILTER: filter by type and/or status

- void manageBookings()
  Loop:
    Display all bookings table (sorted by date descending)
    [1] Search/Filter, [2] View Booking Details, [0] Back
  SEARCH: prompt for search query (ID/guest name/room number) and status filter
  VIEW DETAILS: enter booking ID → show full details → actions:
    [1] Mark Check-in (only if status=Confirmed and payment=Paid)
    [2] Mark Check-out (only if status=Checked In)
    [3] Cancel Booking (not if already Cancelled/Completed)
    [0] Back

- void showGuestDirectory()
  Load all users (customers only), cross-reference with bookings to determine:
  - currentStatus: "Active Guest" if has Checked In booking, "Upcoming Guest" if has Confirmed booking, else "Past Guest"
  - totalStays: count of Completed bookings
  - currentRoom: room number if Checked In, else "-"
  Display table: Guest Name, Email, Phone, Current Room, Total Stays, Status

- void manageServiceRequests()
  Display Kanban board (4 columns: Pending, Accepted, In Progress, Completed — each showing count and cards)
  Options: [1] Accept Request, [2] Start Progress, [3] Complete Request, [4] Search, [0] Back
  Each action prompts for request ID and transitions the status.

- void manageChats()
  List all admin chat threads with guest name, room, last message preview, unread badge
  Enter chat number to open conversation
  In conversation: display all messages, then prompt for reply (type message and Enter, "/back" to exit)
  Admin replies are saved to the shared chat data.

- void manageDynamicPricing()
  Display pricing rules table
  [1] Toggle Enable/Disable for a room type, [2] Recalculate All Prices, [0] Back
  Show recalculation results: which rooms changed price and why

- void manageHousekeeping()
  Display rooms table with: Room Number, Type, Room Status, Cleaning Status, Actions
  [1] Start Cleaning (for rooms with Pending/Required cleaning), [2] Mark Cleaned (for In Progress rooms — sets status back to Available), [3] Search by room, [0] Back

- void managePayments()
  Display summary metrics: Today's Revenue, Pending Payments, Refunds This Month
  Display all payments table
  [1] Search/Filter, [2] Mark Refund, [0] Back
  REFUND: Enter payment ID → confirm → mark as Refunded + update booking paymentStatus

- void viewReports()
  [1] Revenue Report (by room type)
  [2] Bookings Report (by status)
  [3] Occupancy Report (by room type + status distribution)
  [4] Service Performance Report
  [5] Export Revenue to CSV
  [6] Export Full Report to CSV
  [0] Back

- void manageSettings()
  Display current settings
  [1] Edit Hotel Name, [2] Edit Email, [3] Edit Address, [4] Edit Check-in Time, [5] Edit Check-out Time, [6] Toggle Auto-Confirm, [0] Back
  Each option prompts for new value, validates, saves
```

---

## Prompt 16 — Main.java (Entry Point)

```
Create the Main entry point class for StayEase Pro.

FILE: src/Main.java (no package, or use a default package)

This is the application entry point. On startup:
1. Initialize StorageService
2. Call DataSeeder.seedAll(storage) to seed data if not present
3. Call pricingService.recalculateDynamicPrices() to ensure prices are up to date
4. Initialize all other services: AuthService, RoomService, BookingService, PaymentService, ServiceRequestService, ChatService, NotificationService, PricingService, ReportService
5. Initialize UI classes: ConsoleUI, CustomerMenu, AdminMenu
6. Show welcome screen and main portal selection loop

Welcome Screen:
╔══════════════════════════════════════════════════════╗
║        🏨 StayEase Pro - Hotel Management           ║
║           Welcome to StayEase Pro                    ║
╚══════════════════════════════════════════════════════╝

  [1] 🧑 Customer Portal
  [2] 🔒 Admin Portal
  [3] 🔄 Reset All Data (re-seed with defaults)
  [0] ❌ Exit

Customer Portal → calls customerMenu.showLoginOrSignup()
Admin Portal → calls adminMenu.showAdminLogin()
Reset Data → confirms with "Are you sure? This will delete all data. (y/n)" → calls storage to delete all JSON files → calls DataSeeder.seedAll()
Exit → prints goodbye message and exits

IMPORTANT NOTES FOR ECLIPSE:
- Create this as a standard Java project (not Maven/Gradle)
- Download gson-2.10.1.jar from Maven Central and add it to the build path:
  Right-click project → Build Path → Add External JARs → select gson jar
- Make sure the "data/" folder exists at the project root level (not inside src/)
- Run Main.java as a Java Application
- All System.out.println should use UTF-8. Add this at the start of main():
  System.setOut(new java.io.PrintStream(System.out, true, "UTF-8"));
- Use try-catch around the main loop to handle unexpected errors gracefully

Also ensure the main loop keeps running until the user selects Exit. After each portal session (customer logout or admin logout), return to the main portal selection screen.

IMPORTANT: Make sure to include proper import statements in ALL files. All model classes should import java.util.List and java.util.ArrayList where needed. All service classes should import the models they use.
```

---

## ✅ Setup Checklist (After All Prompts)

After running all prompts, follow these steps in Eclipse:

1. **Create a new Java Project** named `StayEaseProConsole`
2. **Download Gson**: Get `gson-2.10.1.jar` from [Maven Central](https://search.maven.org/artifact/com.google.gson/gson/2.10.1/jar)
3. **Add Gson to Build Path**: Right-click project → Build Path → Add External JARs → select `gson-2.10.1.jar`
4. **Create packages** under `src/`: `models`, `services`, `ui`, `data`
5. **Create all Java files** in their respective packages
6. **Create `data/` folder** at the project root (same level as `src/`)
7. **Run `Main.java`** as Java Application
8. **Test login credentials**:
   - Customer: `guest@example.com` / `Guest@123`
   - Admin: `admin@example.com` / `Admin@123` (staff code: `STAFF2026`)