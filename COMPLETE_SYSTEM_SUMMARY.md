# StayEase Pro — Complete System Summary and AI Context

This document is the complete implementation map for the current StayEase Pro codebase. It is written as context for an AI tool that needs to update, refactor, or improve the project. It covers the customer portal, admin portal, HTML entry points, CSS systems, JavaScript modules, storage schema, feature logic, and important technical constraints.

---

## 1. Project Purpose

StayEase Pro is a browser-only hotel management demo application. It has two connected portals:

1. **Customer portal** for guests to browse rooms, sign up/login, book stays, pay, view digital passcodes, request services, chat with staff, and manage bookings.
2. **Admin portal** for hotel staff to manage rooms, bookings, guests, service requests, chats, dynamic pricing, housekeeping, payments, reports, and settings.

The app does **not** use a backend server or database. All persistence is implemented with `localStorage`, while temporary cross-page state is implemented with `sessionStorage`.

---

## 2. Technology and Runtime Model

- **HTML**: Static pages for customer and admin screens.
- **CSS**: Two standalone design systems:
  - `css/style.css` for customer-facing pages.
  - `css/admin.css` for admin pages.
- **JavaScript**: Plain ES5/ES6 browser scripts loaded directly with `<script>` tags. There is no bundler, package manager, module system, or framework.
- **Storage**: Browser `localStorage` keys prefixed with `stayEasePro_`.
- **Icons**: Google Material Symbols Outlined.
- **Fonts**: Google Fonts Inter.
- **Images**: Unsplash CDN URLs stored in data objects or inline backgrounds.
- **Execution**: Each page loads shared scripts and a page router script (`js/app.js` or `js/admin/admin-app.js`) that checks for specific DOM IDs/classes and initializes only the relevant feature.

---

## 3. Current File Structure

```text
/workspace/hotelmanagementui
├── index.html
├── login.html
├── signup.html
├── dashboard.html
├── rooms.html
├── room-details.html
├── booking-confirmation.html
├── payment.html
├── my-bookings.html
├── booking-details.html
├── services.html
├── chat.html
├── admin/
│   ├── admin-login.html
│   ├── dashboard.html
│   ├── rooms.html
│   ├── bookings.html
│   ├── guests.html
│   ├── service-requests.html
│   ├── chats.html
│   ├── dynamic-pricing.html
│   ├── housekeeping.html
│   ├── payments.html
│   ├── reports.html
│   └── settings.html
├── css/
│   ├── style.css
│   └── admin.css
├── js/
│   ├── app.js
│   ├── auth.js
│   ├── bookings.js
│   ├── chat.js
│   ├── data.js
│   ├── notifications.js
│   ├── passcode.js
│   ├── payment.js
│   ├── payments.js
│   ├── rooms.js
│   ├── services.js
│   ├── storage.js
│   ├── ui.js
│   ├── validation.js
│   └── admin/
│       ├── admin-app.js
│       ├── admin-auth.js
│       ├── admin-bookings.js
│       ├── admin-chats.js
│       ├── admin-dashboard.js
│       ├── admin-data.js
│       ├── admin-guests.js
│       ├── admin-housekeeping.js
│       ├── admin-payments.js
│       ├── admin-pricing.js
│       ├── admin-reports.js
│       ├── admin-rooms.js
│       ├── admin-service-requests.js
│       ├── admin-settings.js
│       ├── admin-ui.js
│       └── admin-validation.js
└── Documentation files
```

---

## 4. Data Storage Schema

### 4.1 Core keys in `localStorage`

| Key | Purpose |
|---|---|
| `stayEasePro_initialized` | Prevents customer seed data from being reinserted on every page load. |
| `stayEasePro_currentUser` | Current customer session object. |
| `stayEasePro_adminUser` | Current admin/staff session object. |
| `stayEasePro_users` | Customer accounts. |
| `stayEasePro_admins` | Admin, manager, and staff accounts. |
| `stayEasePro_rooms` | Room inventory and statuses. |
| `stayEasePro_pricingRules` | Dynamic pricing rules by room type. |
| `stayEasePro_bookings` | Customer booking records. |
| `stayEasePro_payments` | Payment records. |
| `stayEasePro_serviceRequests` | Guest service/housekeeping/concierge requests. |
| `stayEasePro_chats` | Chat threads with message arrays. |
| `stayEasePro_notifications` | Customer notifications. |
| `stayEasePro_feedback` | Customer feedback records. |
| `stayEasePro_settings` | Hotel/admin settings. |

### 4.2 Important `sessionStorage` keys

| Key | Purpose |
|---|---|
| `stayEasePro_pendingBooking` | Temporary booking object created on room details before confirmation/payment. |
| `stayEasePro_loginRedirect` | URL to return to after customer login. |
| `stayEasePro_viewBooking` | Booking selected for detail view. |

### 4.3 Seeded customer demo account

```text
Email: guest@example.com
Password: Guest@123
Role: customer
```

### 4.4 Seeded admin accounts

```text
Admin:   admin@example.com   / Admin@123
Manager: manager@example.com / Manager@123
Staff:   staff@example.com   / Staff@123
```

### 4.5 Seed data details

`js/data.js` defines `MOCK_DATA` and seeds:

- One customer, Aarav Sharma.
- Ten rooms across Standard, Deluxe, Suite, and Family categories.
- Room statuses include `Available`, `Occupied`, `Maintenance`, and `Under Cleaning`.
- Cleaning statuses include `Clean` and `Pending`.
- Dynamic pricing rules for Standard, Deluxe, Suite, and Family rooms.
- Two bookings:
  - `BK-2026-1042`, active checked-in Deluxe room 305 booking.
  - `BK-2026-1015`, completed Standard room 101 booking.
- Two payments linked to those bookings.
- Two service requests linked to the active booking.
- One chat thread for room 305.
- Three notifications.
- One feedback record.

`js/admin/admin-data.js` seeds admin users, pricing rules if absent, and hotel settings if absent. It runs automatically when `storage.js` has already provided `getData`.

---

## 5. Shared Customer JavaScript Modules

### 5.1 `js/storage.js` — persistence and formatting utilities

This is the lowest-level shared utility module. Other modules rely on it for reading/writing JSON data.

Functions:

- `getData(key, fallback = [])`: Parses JSON from `localStorage`; returns fallback if missing or invalid.
- `setData(key, data)`: JSON-stringifies and writes data to `localStorage`.
- `addItem(key, item)`: Appends an item to an array key and returns the inserted item.
- `updateItem(key, id, updates)`: Finds an array item by `id`, merges updates, writes the array, and returns the updated item.
- `deleteItem(key, id)`: Removes an item by `id` from an array key.
- `findById(key, id)`: Returns an item by `id` or `null`.
- `generateId(prefix)`: Creates IDs in the format `PREFIX-randomNumber`.
- `formatCurrency(n)`: Formats numbers as Indian Rupees with `en-IN` locale.
- `formatDateTime(iso, opts)`: Formats ISO date/time for display.
- `formatDateOnly(iso)`: Formats only date portions.

### 5.2 `js/data.js` — mock data and reset

Responsibilities:

- Defines the complete initial customer data model.
- Seeds `localStorage` on first load via `seedData()`.
- Provides `resetAllData()` to remove all customer app keys, clear session storage, and reseed defaults.

Important implementation detail: `seedData()` exits early if `stayEasePro_initialized` exists, so changes to seed arrays will not affect an already initialized browser unless storage is reset.

### 5.3 `js/validation.js` — customer validation and duplicated helpers

This file contains generic validators plus some cross-cutting business helpers.

Validation helpers:

- `isRequired`
- `isValidEmail`
- `isValidPhone`
- `isStrongPassword`
- `doPasswordsMatch`
- `isPositiveNumber`
- `isValidCardNumber`
- `isValidCVV`
- `isValidUPI`
- `isValidRating`
- `isFutureOrToday(dateStr)`
- `isDateTimeAfter(startISO, endISO)`

UI validation helpers:

- `showInlineError(input, msg)`: Adds `.input-error` and inserts an `.error-message` element.
- `clearInlineError(input)`
- `clearFormErrors(form)`

Business helpers also present here:

- `showToast(message, type)`: A customer toast implementation. Note: `js/ui.js` also defines `showToast`; the later-loaded script wins depending on script order.
- `getPasscodeStatus(booking)`: Derives whether a booking passcode is locked, active, expired, or inactive based on status and check-in/check-out times.
- `refreshPasscodeStatuses()`: Updates stored booking passcode statuses.
- `recalculateDynamicPricing()`: Updates room dynamic prices based on occupancy and pricing rules.
- `getUnreadNotificationCount()`
- `renderNotificationList(containerId)`
- `calculateNights(checkInStr, checkOutStr)`

Important improvement target: this file duplicates logic that also exists in `js/ui.js`, `js/passcode.js`, `js/rooms.js`, and `js/notifications.js`. Refactoring should consolidate these helpers to avoid order-dependent behavior.

### 5.4 `js/ui.js` — customer UI utilities

Responsibilities:

- `showToast(message, type, duration)`: Creates a toast container and animated toasts.
- `openModal(id)` / `closeModal(id)`: Adds/removes `.active` on modal overlays.
- Global click listener closes modal when clicking overlay background or `.modal-close`.
- Global Escape key listener closes customer modals.
- `setButtonLoading(btn, text)` and `clearButtonLoading(btn)`.
- `showEmptyState(container, icon, heading, message, btnHtml)`.
- `showLoadingSkeleton(container, count)`.
- `updateNavbar()`: Replaces `.nav-actions` content based on `getCurrentUser()`, showing dashboard/logout for authenticated customers or login/sign-up links for guests. Also marks current page nav link active.

### 5.5 `js/auth.js` — customer authentication

Responsibilities:

- `getCurrentUser()`: Parses `stayEasePro_currentUser`.
- `setCurrentUser(user)`: Saves the current customer session.
- `logout()`: Removes customer session, clears session storage, shows toast, redirects to `index.html`.
- `requireAuth()`: If no customer session exists, stores current URL in `stayEasePro_loginRedirect`, shows warning, and redirects to `login.html`.
- `initSignup()` / `handleSignup()`: Validates full name, email, phone, password, government ID, and terms; enforces unique email; creates user; signs in immediately; creates welcome notification; redirects to dashboard.
- `initLogin()` / `handleLogin()`: Validates credentials against seeded/stored users; stores session; redirects to saved redirect or dashboard.

Important caveat: passwords are stored in plain text because this is a browser-only demo. A production version must use a backend and hashed passwords.

### 5.6 `js/rooms.js` — customer room search, details, booking creation, featured rooms

Responsibilities:

- `recalculateDynamicPricing()`: Groups rooms by type, calculates occupancy percentage, applies low-demand discount, high-demand increase, or normal base price, clamps between min/max price, and writes demand level/reason to rooms.
- `initRoomsPage()`: Sets up listing page events for filters, reset, price range label, and rendering.
- `resetFilters()`: Clears filter controls and rerenders rooms.
- `getFilteredRooms()`: Reads search query, type checkboxes, max price, and sort select; filters available rooms; sorts by price or rating.
- `renderRooms()`: Renders room cards with image, type, rating, room number, occupancy, dynamic price, status/demand badges, amenities, and action buttons.
- `initRoomDetails()`: Reads room ID from URL/session, loads detailed room data, sets image/text/amenities/price, initializes date inputs, recalculates live price totals, and binds the booking button.
- `handleBookRoom(room)`: Requires login, validates dates and guest count, checks date conflicts against existing non-cancelled bookings for the same room, calculates room total + 12% tax + 5% service fee, creates a pending booking with status `Pending Payment`, and stores it in session before redirecting to booking confirmation.
- `initHomeFeaturedRooms()`: Renders the first three available rooms on the homepage.

Booking amount logic:

```text
nights = ceil((checkOut - checkIn) / oneDay)
roomTotal = room.dynamicPrice * nights
tax = round(roomTotal * 0.12)
serviceFee = round(roomTotal * 0.05)
totalAmount = roomTotal + tax + serviceFee
```

Conflict logic: a new booking conflicts when it overlaps an existing booking for the same room and that existing booking is not cancelled.

### 5.7 `js/bookings.js` — confirmation, customer bookings, details, cancellation, feedback links

Responsibilities:

- `initBookingConfirmation()`: Reads `stayEasePro_pendingBooking`, displays guest/room/date/price summary, requires policy checkbox, saves booking to `stayEasePro_bookings`, creates notification, and redirects to payment. Also supports cancellation by clearing session pending booking and deleting a stored booking with the same ID if present.
- `initMyBookings()`: Requires auth, refreshes passcode statuses, renders booking tabs, and binds tab switching.
- `classifyBooking(b)`: Categorizes bookings as `active`, `upcoming`, `completed`, or `cancelled` based on status and current date.
- `renderMyBookings(tab)`: Filters current user bookings by classification and renders cards with actions.
- `viewBookingDetails(id)`: Stores selected booking ID in session and routes to details page.
- `cancelBooking(id)`: Allows cancellation when a booking is not already completed/checked-in; updates booking status and room availability; creates notification.
- `initBookingDetails()`: Loads selected booking, displays full details, payment status, passcode, service links, chat links, cancellation options, and feedback options.
- `renderPasscodeForBooking(booking)`: Displays the passcode state based on time/status.
- `submitFeedback`/feedback-related rendering: integrates feedback for completed bookings where applicable.

Important behavior: bookings can be persisted during confirmation before payment, and payments later update booking status from `Pending Payment` to `Confirmed`.

### 5.8 `js/payments.js` — main payment page logic

Responsibilities:

- `initPayment()`: Requires auth, locates booking from URL `id`, session pending booking, or latest pending booking, renders payment summary, sets up payment method tabs, and binds pay/fail buttons.
- Payment tabs: card, UPI, net banking, wallet.
- `handlePayment(booking, user)`: Validates only the active payment method, shows loading, simulates asynchronous payment, creates payment record, updates booking status/payment status/passcode, updates room status when appropriate, creates notifications, clears pending booking, and shows result modal.
- `generatePasscode()`: Produces a six-digit passcode.
- Local validators for card number, CVV, and UPI.

Payment success effects:

- Creates `stayEasePro_payments` record.
- Updates booking to `Confirmed`, `Paid`, with generated passcode and passcode status.
- Creates payment/booking/passcode notification(s).
- Clears `stayEasePro_pendingBooking`.
- Opens a result modal with next-step links.

### 5.9 `js/payment.js` — alternate/simulation payment module

This file is also loaded by some customer pages. It provides another payment processing path:

- Initializes payment handling when payment-related elements exist.
- Supports a simulated fail button.
- `processPayment(booking, simulateFail)` simulates payment success/failure after a timeout.
- `showPaymentResult(result, booking, paymentId)` displays modal result content.

Important improvement target: the project currently has both `payment.js` and `payments.js`. Their responsibilities overlap. Future work should merge or clearly separate them to avoid conflicting payment flows.

### 5.10 `js/passcode.js` — digital room key helper

Responsibilities:

- Generates or evaluates six-digit digital passcodes.
- Determines passcode display status around check-in/check-out windows.
- Supports dashboard and booking-detail passcode presentation.

Important improvement target: passcode logic is partly duplicated in `validation.js` and `bookings.js`.

### 5.11 `js/services.js` — customer service requests

Responsibilities:

- `initServices()`: Requires auth, finds current user active/confirmed bookings, populates booking selector, binds custom request submission, and renders history.
- `requestQuickService(serviceName, category)`: Used by service cards such as Fresh Towels, Room Cleaning, Toiletries Refill, and Wake Up Call.
- `submitServiceRequest(category, details)`: Creates a request linked to the selected active booking with priority/status metadata, stores it, creates notification, and rerenders history.
- `renderServiceHistory()`: Shows current user service requests sorted newest first.

Service statuses used by customer/admin flows include `Pending`, `Accepted`, `In Progress`, and `Completed`.

### 5.12 `js/chat.js` — customer chat

Responsibilities:

- Requires auth and determines the active booking/thread.
- Creates a chat thread if none exists for the current user/booking.
- Renders messages with sender-specific styling.
- Sends customer messages by appending to the thread.
- Simulates/admin-support responses or supports admin-side replies through shared `stayEasePro_chats` data.
- Maintains message timestamps/read state where applicable.

### 5.13 `js/notifications.js` — notification badge/list logic

Responsibilities:

- Initializes notification badge on customer pages.
- Computes unread notification count for the current user.
- Renders notification list where a notification container exists.
- Marks notifications read depending on UI behavior.

Important improvement target: notification count/rendering also exists in `validation.js`; consolidate.

### 5.14 `js/app.js` — customer app router

This is the customer portal entrypoint. On `DOMContentLoaded`, it:

1. Calls `seedData()`.
2. Calls `refreshPasscodeStatuses()`.
3. Calls `recalculateDynamicPricing()`.
4. Calls `updateNavbar()`.
5. Calls `initNotifications()`.
6. Detects page features by DOM IDs and invokes page-specific initializers:
   - Login: `#loginForm` → `initLogin()`
   - Signup: `#signupForm` → `initSignup()`
   - Home featured rooms: `#featuredRoomGrid` → `initHomeFeaturedRooms()`
   - Home stats: `#homeStats` → `initHomeStats()`
   - Rooms listing: `#roomGrid` → `initRoomsPage()`
   - Room details: `#rdBookBtn` or `#roomDetailPage` → `initRoomDetails()`
   - Booking confirmation: `#confirmationContent` → `initBookingConfirmation()`
   - Payment: `#paymentForm` → `initPayment()`
   - Dashboard: `#dashboardContent` → `initDashboard()`
   - My bookings: `#bookingsContainer` → `initMyBookings()`
   - Booking details: `#bdContent` → `initBookingDetails()`
   - Services: `#serviceRequestForm` → `initServices()`
   - Chat: `#chatMessages` → `initChat()`
   - Feedback: `#feedbackForm` → `initFeedback()`

It also defines:

- `initDashboard()`: Customer dashboard summary with active booking, passcode, upcoming booking, and notifications.
- `initHomeStats()`: Updates homepage stats.
- `initFeedback()`: Handles feedback submission and duplicate prevention.

---

## 6. Customer HTML Pages

### 6.1 `index.html` — customer homepage

Purpose: marketing landing page and entry point.

Main areas:

- Shared customer navbar.
- Hero section with hotel value proposition and call-to-action buttons.
- Feature/value cards.
- Featured room grid (`#featuredRoomGrid`) populated by `initHomeFeaturedRooms()`.
- Stats section (`#homeStats`) populated by `initHomeStats()`.
- Footer.

Logic dependencies:

- Loads customer CSS and shared customer JS stack.
- `js/app.js` detects homepage elements and renders available room cards/stats.

### 6.2 `login.html` — customer login

Purpose: authenticate a customer.

Main areas:

- Split layout with image/marketing side and login form side.
- Form ID: `#loginForm`.
- Inputs: email and password.
- Link to signup.

Logic dependencies:

- `initLogin()` binds submit/click events.
- `handleLogin()` validates and checks `stayEasePro_users`.
- Successful login redirects to saved route or `dashboard.html`.

### 6.3 `signup.html` — customer registration

Purpose: create a new customer account.

Main areas:

- Split layout.
- Form ID: `#signupForm`.
- Fields for full name, email, phone, password, confirm password, government ID type/number, and terms.

Logic dependencies:

- `initSignup()` and `handleSignup()` validate form data.
- Creates user in `stayEasePro_users` and `stayEasePro_currentUser`.
- Creates welcome notification.

### 6.4 `dashboard.html` — customer dashboard

Purpose: authenticated guest control center.

Main areas:

- Welcome section (`#dashWelcome`).
- Active booking card (`#dashActiveBooking`) and empty state (`#dashEmptyState`).
- Booking metadata elements including booking ID, room info, check-in/out, paid amount.
- Digital passcode display (`#dashPasscode`, `#dashPasscodeStatus`).
- Upcoming stay area (`#dashUpcoming`).
- Notifications container (`#dashNotifications`).

Logic dependencies:

- Requires customer authentication.
- `initDashboard()` filters bookings for current user and computes active/upcoming states.

### 6.5 `rooms.html` — room listing and filtering

Purpose: browse available rooms.

Main areas:

- Hero/header area.
- Filter sidebar with search, room type checkboxes, price range, sort options.
- Apply/reset filter controls.
- Room grid (`#roomGrid`).

Logic dependencies:

- `initRoomsPage()` binds filter controls.
- `getFilteredRooms()` filters rooms by text, type, price, availability, and sort.
- `renderRooms()` creates cards and room detail links.

### 6.6 `room-details.html` — individual room detail and booking widget

Purpose: inspect room details and start a booking.

Main areas:

- Room title/type/status/description/image.
- Room facts such as capacity and bed type.
- Amenities container (`#rdAmenities`).
- Sticky booking widget.
- Date inputs, guest selector, nights/room total/tax/service fee/total calculation.
- Booking button (`#rdBookBtn`).

Logic dependencies:

- `initRoomDetails()` reads room ID, fills content, initializes date constraints, and updates price summary.
- `handleBookRoom()` validates booking and stores a pending booking in session.

### 6.7 `booking-confirmation.html` — booking review before payment

Purpose: review pending booking and accept policies.

Main areas:

- Confirmation container (`#confirmationContent`).
- Booking summary fields: ID, guest, room, guests, check-in, check-out, nights, room amount, taxes, fee, total.
- Special request field.
- Policy checkbox.
- Proceed/cancel controls.
- Cancel confirmation modal.

Logic dependencies:

- `initBookingConfirmation()` reads `stayEasePro_pendingBooking`.
- Proceed saves booking to `stayEasePro_bookings` and routes to payment.
- Cancel removes pending/stored booking.

### 6.8 `payment.html` — payment flow

Purpose: complete payment for pending or selected booking.

Main areas:

- Step indicator showing Room → Confirmation → Payment.
- Payment method tabs: card, UPI, net banking, wallet.
- Inputs for each method.
- Pay button and simulated failure control.
- Sticky booking/payment summary.
- Payment result modal (`#paymentResultModal`, `#paymentResultBody`).

Logic dependencies:

- `initPayment()` locates booking and binds tabs/buttons.
- `handlePayment()` validates selected method and simulates success.
- Payment success updates bookings, payments, passcodes, notifications, and session state.

### 6.9 `my-bookings.html` — booking history tabs

Purpose: list current customer bookings grouped by status.

Main areas:

- Tabs with `data-booking-tab`: active, upcoming, completed, cancelled.
- Container `#bookingsContainer`.

Logic dependencies:

- `initMyBookings()` requires auth and binds tabs.
- `renderMyBookings()` uses `classifyBooking()` to filter/render.

### 6.10 `booking-details.html` — booking detail page

Purpose: detailed customer view for one booking.

Main areas:

- Container `#bdContent`.
- Booking information, payment information, digital passcode, actions for cancellation/services/chat/feedback depending on status.

Logic dependencies:

- `initBookingDetails()` loads booking ID from URL/session and renders state-sensitive actions.

### 6.11 `services.html` — guest service requests

Purpose: allow checked-in/confirmed guests to request hotel services.

Main areas:

- Booking selector for active/confirmed bookings.
- Quick service cards: Fresh Towels, Room Cleaning, Toiletries Refill, Wake Up Call.
- Custom request form (`#srvCustomForm` / service request form elements).
- Service history container.

Logic dependencies:

- `initServices()` populates booking selector and renders history.
- Quick cards call `requestQuickService(...)` inline.
- Custom form calls `submitServiceRequest(...)`.

### 6.12 `chat.html` — guest support chat

Purpose: communicate with hotel staff.

Main areas:

- Chat messages container (`#chatMessages`).
- Message input/send controls.
- Booking/context display.

Logic dependencies:

- `initChat()` loads or creates chat thread for current booking/user.
- Messages persist in `stayEasePro_chats`.

---

## 7. Customer CSS — `css/style.css`

The customer stylesheet defines a full utility/design system.

Major responsibilities:

- CSS custom properties for colors, typography, spacing, shadows, borders, radius, and semantic statuses.
- Reset/base styles for body, links, headings, images, forms, and buttons.
- Layout primitives: `.container`, flex helpers, gaps, margins, padding, grid/room grid patterns.
- Navbar, hero sections, split auth layout, cards, badges, tabs, forms, modal overlays, toast notifications, empty states, skeleton loaders, step indicators, booking widgets, payment tabs, and footer.
- Responsive behavior for mobile layouts, stacked flex rows, room grids, auth split layout, and sticky widgets.

Important design conventions:

- Customer pages use variables such as `--primary`, `--secondary`, `--success`, `--warning`, `--error`, `--surface`, `--background`, and spacing tokens like `--space-md`.
- JavaScript expects classes such as `.active`, `.modal-overlay`, `.toast`, `.input-error`, `.error-message`, `.badge-*`, `.room-grid`, `.card`, and `.tab` to exist.

---

## 8. Admin JavaScript Modules

### 8.1 `js/admin/admin-app.js` — admin router

This is the admin portal entrypoint. On load it:

1. Seeds admin data via `seedAdminData()` when available.
2. Allows `admin-login.html` to initialize without requiring an existing admin session.
3. Calls `requireAdminAuth()` for protected admin pages.
4. Detects the current page by pathname or DOM and calls relevant initializer:
   - dashboard → `initAdminDashboard()`
   - rooms → `initRoomsPage()`
   - bookings → `initBookingsPage()`
   - guests → `initGuestsPage()`
   - service requests → `initServiceRequestsPage()`
   - chats → `initChatsPage()`
   - dynamic pricing → `initPricingPage()`
   - housekeeping → `initHousekeepingPage()`
   - payments → `initPaymentsPage()`
   - reports → `initReportsPage()`
   - settings → `initSettingsPage()`

### 8.2 `js/admin/admin-auth.js` — admin authentication

Responsibilities:

- Reads/writes admin session.
- Validates admin login against `stayEasePro_admins`.
- Redirects authenticated admins away from login page.
- Protects admin pages by redirecting unauthenticated users to `admin-login.html`.
- Logs out by removing admin session and redirecting.

### 8.3 `js/admin/admin-validation.js` — admin validation

Admin-specific validators and inline error helpers:

- Required, email, phone, positive number, percentage.
- Card/CVV/UPI helpers.
- URL, name, room number, and price validators.
- `showInlineError`, `clearInlineError`, and `clearAllErrors` for `.admin-form-control` fields.

### 8.4 `js/admin/admin-ui.js` — admin global UI

Responsibilities:

- Admin toast notifications.
- Admin modal open/close helpers.
- Close all modals on overlay click or close button click.
- Sidebar toggle for mobile/sidebar layout.
- Currency/date formatting proxies.
- Empty state renderer.
- Global profile click logout confirmation.

Important note: admin pages load `admin-ui.js`, whose `showToast` overrides customer `showToast` in the admin context.

### 8.5 `js/admin/admin-dashboard.js` — admin dashboard metrics

Responsibilities:

- Reads rooms, bookings, payments, service requests, and feedback.
- Computes operational metrics such as available/occupied rooms, occupancy, revenue, pending requests, and guest satisfaction.
- Updates dashboard cards and recent booking table where elements exist.
- Provides quick high-level operational state for hotel staff.

### 8.6 `js/admin/admin-rooms.js` — room inventory management

Responsibilities:

- Loads all rooms from `stayEasePro_rooms`.
- Renders room table with number, type, floor, capacity, base price, dynamic price, status, and cleaning status.
- Search/filter rooms by room number, floor, type, and status.
- Add room via modal form.
- Edit existing room values and amenities.
- Enforce required fields, positive capacity/price, unique room number, and at least one amenity.
- Toggle maintenance status unless room is occupied.
- Uses `updateItem`/`addItem` to persist changes.

Important improvement target: the initializer name `initRoomsPage()` is also used in customer `rooms.js`; because admin and customer pages load different script sets, it works now, but future bundling/modules should avoid global name collisions.

### 8.7 `js/admin/admin-bookings.js` — booking management

Responsibilities:

- Loads bookings and renders admin bookings table.
- Search/filter bookings by guest, ID, room, status, and/or dates.
- Displays booking detail modal.
- Updates booking status through admin controls.
- Handles check-in/check-out/cancel style transitions depending on current status.
- Synchronizes related room status when booking state changes where implemented.

### 8.8 `js/admin/admin-guests.js` — guest management

Responsibilities:

- Loads customer users and booking/payment history.
- Renders guest table with identity/contact/stay statistics.
- Supports search/filtering.
- Displays guest detail/summary information through action buttons.

### 8.9 `js/admin/admin-service-requests.js` — service request Kanban

Responsibilities:

- Loads `stayEasePro_serviceRequests`.
- Renders four Kanban columns: new/pending, accepted, in progress, completed.
- Displays priority badges, request age, service type, description, room number, and action button.
- Counts requests in each status.
- Search filters by request ID, room number, or service type.
- `changeRequestStatus(id, newStatus)` moves requests through `Accepted`, `In Progress`, and `Completed`.

### 8.10 `js/admin/admin-chats.js` — staff chat management

Responsibilities:

- Loads guest chat threads.
- Renders thread list/sidebar and selected conversation.
- Allows admin/staff replies to append messages into shared `stayEasePro_chats` data.
- Shows guest/room/booking context.
- Supports search and/or thread selection behavior.

### 8.11 `js/admin/admin-pricing.js` — dynamic pricing management

Responsibilities:

- Loads pricing rules by room type.
- Renders rule table/cards with base price, min/max, high-demand increase, low-demand discount, and enabled state.
- Supports editing pricing rules.
- Applies pricing rules to rooms using occupancy/demand calculations.
- Shows demand indicators and dynamic price values.

Dynamic price concept:

- High occupancy → apply percentage increase up to max price.
- Low occupancy → apply discount down to min price.
- Normal occupancy → use base price.

### 8.12 `js/admin/admin-housekeeping.js` — room cleaning operations

Responsibilities:

- Loads rooms and housekeeping statuses.
- Computes counts such as clean, pending, in progress, and maintenance/dirty depending on current data.
- Renders housekeeping table with room, type, status, cleaning status, and action buttons.
- Allows staff to update cleaning status.
- Filters/searches rooms by room number/type/status/cleaning state.

### 8.13 `js/admin/admin-payments.js` — payment records

Responsibilities:

- Loads `stayEasePro_payments`.
- Renders payment tables/cards and summary metrics.
- Filters/searches payments by booking/payment identifiers/status/method.
- Shows paid/failed/refund-related payment states as supported by the UI.

### 8.14 `js/admin/admin-reports.js` — reports placeholder

Currently minimal. It initializes the reports page and is a good target for future analytics work such as revenue charts, occupancy trends, ADR/RevPAR, service SLA, and export features.

### 8.15 `js/admin/admin-settings.js` — settings page interactions

Responsibilities:

- Binds save button and shows a success toast.
- Binds settings sidebar/category buttons visually.
- Currently behaves like a mock settings form and does not deeply persist all form values.

---

## 9. Admin HTML Pages

All admin pages share the same design language, sidebar navigation, topbar/profile area, and script loading pattern. Protected pages rely on `admin-app.js` and `requireAdminAuth()`.

### 9.1 `admin/admin-login.html`

Purpose: staff/admin login.

Main areas:

- Centered admin login card.
- Form `#adminLoginForm`.
- Email/password inputs.
- Demo credentials panel.
- Loads storage, customer seed data, admin seed/auth/validation/UI modules, and admin router.

### 9.2 `admin/dashboard.html`

Purpose: admin overview.

Main areas:

- Sidebar/topbar.
- KPI cards for operational metrics.
- Revenue/occupancy visual placeholders.
- Recent bookings table.
- Quick action buttons.

Logic dependencies:

- `initAdminDashboard()` computes metrics from rooms/bookings/payments/service requests.

### 9.3 `admin/rooms.html`

Purpose: room inventory CRUD.

Main areas:

- Filters/search.
- Rooms table.
- Add/edit room modal with fields for room number, type, capacity, base price, floor, and amenities.
- Row actions for edit and maintenance.

Logic dependencies:

- `initRoomsPage()` from admin rooms module.

### 9.4 `admin/bookings.html`

Purpose: manage reservations.

Main areas:

- Search and status/date filters.
- Bookings table with guest/room/date/status/payment/action data.
- Booking details modal.

Logic dependencies:

- `initBookingsPage()`.

### 9.5 `admin/guests.html`

Purpose: inspect customer records.

Main areas:

- Search/filter card.
- Guest table with contact/stay details.
- Action buttons for viewing details.

Logic dependencies:

- `initGuestsPage()`.

### 9.6 `admin/service-requests.html`

Purpose: service request operations board.

Main areas:

- Search controls.
- Kanban columns for pending/new, accepted, in progress, completed.
- Request cards with priority and action buttons.

Logic dependencies:

- `initServiceRequestsPage()`.

### 9.7 `admin/chats.html`

Purpose: staff messaging console.

Main areas:

- Chat sidebar/thread list.
- Conversation panel.
- Guest information panel.
- Reply composer and quick replies.

Logic dependencies:

- `initChatsPage()`.

### 9.8 `admin/dynamic-pricing.html`

Purpose: configure dynamic room pricing.

Main areas:

- Explanation/summary banner.
- Pricing metric cards.
- Rules table for room types.
- Edit/apply controls.

Logic dependencies:

- `initPricingPage()`.

### 9.9 `admin/housekeeping.html`

Purpose: manage cleaning and maintenance state.

Main areas:

- Housekeeping metric cards.
- Search/status/type filters.
- Room cleaning table.
- Action controls for status changes.

Logic dependencies:

- `initHousekeepingPage()`.

### 9.10 `admin/payments.html`

Purpose: review payment activity.

Main areas:

- Payment metric cards.
- Filters/search.
- Payment table.

Logic dependencies:

- `initPaymentsPage()`.

### 9.11 `admin/reports.html`

Purpose: analytics/reporting UI.

Main areas:

- Report filters and summary cards/placeholders.
- Intended future reporting sections.

Logic dependencies:

- `initReportsPage()` currently minimal.

### 9.12 `admin/settings.html`

Purpose: hotel/admin configuration UI.

Main areas:

- Settings navigation/category buttons.
- Hotel details, policies, notification preferences, and operational settings form layout.
- Save button.

Logic dependencies:

- `initSettingsPage()` currently shows success toast and visual category selection.

---

## 10. Admin CSS — `css/admin.css`

The admin stylesheet defines a separate dashboard-style design system.

Major responsibilities:

- Admin CSS variables for primary/secondary colors, surfaces, text, spacing, shadows, status colors, and radii.
- Base reset and typography.
- Admin layout: sidebar, topbar, content area, responsive sidebar behavior.
- Navigation and profile styles.
- Cards, KPI metric cards, bento grids, tables, badges, forms, buttons, modals, Kanban boards, chat layouts, chart placeholders, and utilities.
- Responsive admin tables that use `data-label` for mobile card-like rows.

Important design conventions:

- Admin JavaScript expects classes such as `.admin-modal-overlay`, `.admin-btn`, `.admin-btn-primary`, `.admin-form-control`, `.admin-badge`, `.kanban-col`, `.kanban-header`, `.admin-card`, and `.table-container`.
- Admin pages use Material Symbol icon text inside `.material-symbols-outlined` spans.

---

## 11. End-to-End Customer Flow Logic

### 11.1 Registration/login

1. User submits signup/login form.
2. Form validation runs client-side.
3. Signup creates a new user and stores it in `stayEasePro_users`.
4. Login matches email/password from `stayEasePro_users`.
5. Current session is saved to `stayEasePro_currentUser`.
6. Navbar updates based on current session.

### 11.2 Room browsing and pricing

1. App load calls dynamic pricing recalculation.
2. Rooms page displays only available rooms in the customer listing.
3. Filters narrow rooms by search text, type, price, and sort.
4. Room cards link to details.
5. Featured homepage rooms show first three available rooms.

### 11.3 Booking

1. User selects dates/guests on `room-details.html`.
2. Booking widget calculates nights and totals.
3. Booking button requires login.
4. Conflict detection checks existing bookings for same room and overlapping dates.
5. A pending booking is stored in `sessionStorage`.
6. Confirmation page displays summary and requires policy acceptance.
7. Proceed stores booking in `stayEasePro_bookings` with `Pending Payment`.

### 11.4 Payment

1. Payment page finds the booking.
2. User selects payment method tab.
3. Active method validation runs.
4. Simulated async payment completes.
5. Payment record is inserted.
6. Booking becomes `Confirmed`/`Paid`.
7. Passcode is generated.
8. Notifications are inserted.
9. Pending session booking is cleared.

### 11.5 Digital passcode

1. Passcode is generated after successful payment.
2. Status is derived from booking status and date/time.
3. Before valid check-in window, passcode is locked/inactive.
4. During active stay, passcode is shown as active.
5. After checkout/completion, passcode is expired.

### 11.6 Service requests

1. User must have an active/confirmed booking.
2. User selects booking and chooses quick service or custom request.
3. Request is stored with status `Pending` and priority/category metadata.
4. Admin Kanban moves request through accepted/progress/completed.
5. Customer service history reads the same data.

### 11.7 Chat

1. User opens chat while authenticated.
2. Existing thread is loaded or created.
3. Messages are appended to `stayEasePro_chats`.
4. Admin chat page reads the same thread and appends admin messages.

---

## 12. End-to-End Admin Flow Logic

### 12.1 Admin authentication

1. Admin login seeds admin data if absent.
2. Login validates email/password from `stayEasePro_admins`.
3. Session stored in `stayEasePro_adminUser`.
4. Protected admin pages redirect unauthenticated users.

### 12.2 Operations dashboard

1. Reads all operational storage keys.
2. Computes KPI metrics and table rows.
3. Displays recent bookings and statuses.

### 12.3 Room management

1. Admin loads rooms.
2. Table renders all rooms regardless of status.
3. Add/edit modal writes room data.
4. Maintenance toggle updates room status if not occupied.
5. Customer room listing immediately reflects changed room availability after reload.

### 12.4 Booking management

1. Admin sees all bookings.
2. Admin can inspect or update booking states.
3. Status changes should synchronize room states where implemented.

### 12.5 Service operations

1. Admin sees all service requests in Kanban.
2. Button click updates request status.
3. Request moves columns on rerender.

### 12.6 Dynamic pricing

1. Admin edits pricing rules.
2. Recalculation updates room `dynamicPrice`, demand level, and reason.
3. Customer cards/details use updated dynamic prices.

---

## 13. Known Technical Debt and Improvement Targets

These are important when giving this codebase to another AI tool:

1. **Global namespace collisions**: many functions are global; customer and admin scripts use some identical names such as `initRoomsPage`, `showToast`, `isRequired`, and `isValidEmail`.
2. **Duplicate logic**:
   - Toast logic exists in customer validation/UI and admin UI.
   - Dynamic pricing exists in `validation.js` and `rooms.js`/admin pricing.
   - Passcode logic appears in multiple places.
   - Payment logic is split between `payment.js` and `payments.js`.
3. **No backend/security**: localStorage is editable by users; passwords are plain text; payment is simulated. This is acceptable only for demos.
4. **Order-dependent scripts**: pages rely on scripts being loaded in the correct order. `storage.js`, `data.js`, validation/UI/auth modules must load before routers.
5. **Seed data persistence**: once initialized, localStorage will not pick up changed seed data unless reset.
6. **Inline styles and inline handlers**: HTML contains many inline styles and some inline `onclick` usage, making theming/refactoring harder.
7. **Limited accessibility**: modals, tabs, buttons, and forms could use stronger ARIA attributes, focus trapping, keyboard support, and labels.
8. **No automated tests**: current project has no unit, integration, or browser tests.
9. **Reports/settings are shallow**: admin reports and settings are mostly UI/mock behavior and need deeper persistence/analytics.
10. **Date/time consistency**: date logic uses browser local `Date`; timezone and check-in/out edge cases should be centralized.
11. **Data integrity**: booking, payment, room, and notification updates are separate localStorage writes and can become inconsistent if interrupted.
12. **No build/lint tooling**: there is no ESLint/Prettier/test runner configuration.

---

## 14. Recommended Refactor Plan for an AI Tool

If improving the project, prioritize these steps:

1. **Create a single data service layer** for users, admins, rooms, bookings, payments, notifications, service requests, chats, feedback, and settings.
2. **Create one shared utility module** for date, currency, IDs, toasts, modals, validation, passcodes, and dynamic pricing.
3. **Namespace global functions** under `StayEase.Customer` and `StayEase.Admin`, or convert to ES modules.
4. **Merge `payment.js` and `payments.js`** into one payment module.
5. **Centralize booking status transitions** so room status, payment status, notifications, and passcodes stay consistent.
6. **Improve accessibility** for modals, tabs, forms, and navigation.
7. **Persist admin settings** fully and make reports compute real metrics from stored data.
8. **Add tests** for validators, pricing, booking conflicts, payment transitions, passcode statuses, and admin service request transitions.
9. **Add a reset/demo-data control** for testing so seed changes can be applied easily.
10. **Separate inline CSS into stylesheets** and replace inline event handlers with JS listeners.

---

## 15. Script Loading Rules

Customer pages generally load:

```html
<script src="js/data.js"></script>
<script src="js/storage.js"></script>
<script src="js/validation.js"></script>
<script src="js/ui.js"></script>
<script src="js/auth.js"></script>
<!-- page feature modules -->
<script src="js/app.js"></script>
```

Admin pages generally load:

```html
<script src="../js/storage.js"></script>
<script src="../js/data.js"></script>
<script src="../js/admin/admin-data.js"></script>
<script src="../js/admin/admin-auth.js"></script>
<script src="../js/admin/admin-validation.js"></script>
<script src="../js/admin/admin-ui.js"></script>
<!-- admin feature modules -->
<script src="../js/admin/admin-app.js"></script>
```

Important: because scripts are not modules, later definitions with the same global function name can override earlier definitions.

---

## 16. Feature-to-File Map

| Feature | Primary files |
|---|---|
| Customer auth | `login.html`, `signup.html`, `js/auth.js`, `js/validation.js`, `js/ui.js` |
| Customer dashboard | `dashboard.html`, `js/app.js`, `js/bookings.js`, `js/passcode.js`, `js/notifications.js` |
| Room listing | `rooms.html`, `js/rooms.js`, `css/style.css` |
| Room details/booking start | `room-details.html`, `js/rooms.js` |
| Booking confirmation | `booking-confirmation.html`, `js/bookings.js` |
| Payment | `payment.html`, `js/payments.js`, `js/payment.js` |
| Booking history/details | `my-bookings.html`, `booking-details.html`, `js/bookings.js` |
| Customer services | `services.html`, `js/services.js` |
| Customer chat | `chat.html`, `js/chat.js` |
| Customer notifications | `js/notifications.js`, `js/validation.js`, `js/app.js` |
| Admin auth | `admin/admin-login.html`, `js/admin/admin-auth.js`, `js/admin/admin-data.js` |
| Admin dashboard | `admin/dashboard.html`, `js/admin/admin-dashboard.js` |
| Admin room management | `admin/rooms.html`, `js/admin/admin-rooms.js` |
| Admin booking management | `admin/bookings.html`, `js/admin/admin-bookings.js` |
| Admin guest management | `admin/guests.html`, `js/admin/admin-guests.js` |
| Admin service Kanban | `admin/service-requests.html`, `js/admin/admin-service-requests.js` |
| Admin chat | `admin/chats.html`, `js/admin/admin-chats.js` |
| Admin pricing | `admin/dynamic-pricing.html`, `js/admin/admin-pricing.js` |
| Admin housekeeping | `admin/housekeeping.html`, `js/admin/admin-housekeeping.js` |
| Admin payments | `admin/payments.html`, `js/admin/admin-payments.js` |
| Admin reports | `admin/reports.html`, `js/admin/admin-reports.js` |
| Admin settings | `admin/settings.html`, `js/admin/admin-settings.js` |
| Customer styling | `css/style.css` |
| Admin styling | `css/admin.css` |
| Storage/data foundation | `js/storage.js`, `js/data.js`, `js/admin/admin-data.js` |

---

## 17. Concise Context Prompt for Another AI Tool

Use this if another AI tool needs a short project brief:

> This is a static browser-only hotel management demo called StayEase Pro. It has customer and admin portals built with plain HTML/CSS/JS and no backend. Data is persisted in `localStorage` with `stayEasePro_` keys and seeded from `js/data.js` plus `js/admin/admin-data.js`. Customer flows include signup/login, room browsing/filtering, room details, pending booking creation in `sessionStorage`, booking confirmation, simulated payment, booking history/details, passcode display, service requests, chat, notifications, and feedback. Admin flows include login, dashboard metrics, room CRUD/maintenance, booking management, guest management, service-request Kanban, staff chats, dynamic pricing rules, housekeeping, payments, reports, and settings. The main routers are `js/app.js` and `js/admin/admin-app.js`, which initialize pages by checking DOM IDs. Major improvement needs are removing duplicated global functions, merging payment modules, centralizing booking/payment/passcode/pricing state transitions, improving accessibility, adding tests, and replacing localStorage-only demo security with backend APIs for production.
