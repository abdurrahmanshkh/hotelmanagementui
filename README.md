# StayEase Pro Customer Portal

## Purpose
This project provides the HTML and CSS implementation for the customer-facing UI of the StayEase Pro Hotel Management System. It is built strictly based on the Google Stitch project design (`projects/17557073624879417221`).

## Current Sprint Scope
This version contains **ONLY HTML and CSS**. No JavaScript logic, backend API integration, or database connections have been implemented yet. It focuses on structure, styling, responsiveness, and preparing the DOM with appropriate IDs and classes for future interactivity.

## Pages Included
- `index.html`: Landing/Home page with hotel stats, featured rooms, and booking search widget.
- `login.html`: Customer login form with a split visual layout.
- `signup.html`: Customer registration form with password strength visual placeholders.
- `dashboard.html`: Logged-in customer overview showing active bookings, upcoming stays, and quick actions.
- `rooms.html`: Available rooms listing with a responsive filter sidebar.
- `room-details.html`: Detailed view of a specific room, including image gallery placeholder and sticky booking panel.
- `booking-confirmation.html`: Pre-payment summary and details.
- `payment.html`: Dummy payment page with multiple payment method tabs and success/failure modal placeholders.
- `my-bookings.html`: Booking management with tabs for different booking statuses.
- `booking-details.html`: Detailed view of a booking, featuring the digital room passcode card with different states.
- `services.html`: Service request form and history list.
- `chat.html`: Real-time chat interface placeholder for customer-admin communication.

## Folder Structure
```
/
├── css/
│   └── style.css       # Complete stylesheet with variables, resets, layout, and components
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
└── README.md
```

## Design Principles
- **Modern Professionalism**: Follows the Stitch design system's blend of corporate efficiency and luxury hospitality.
- **Color Palette**: Deep Navy Blue (`#0F172A`) as primary, Gold (`#D4AF37`) as accent, with off-white and pure white backgrounds.
- **Typography**: Inter font used throughout for clean legibility.
- **Components**: Rounded containers (12px standard, 24px large) with soft shadows for depth and elevation. Ghost buttons, pills, and clean inputs.

## Responsiveness
The UI is fully responsive across all device sizes using CSS media queries (`@media`) in `style.css`. 
- **Desktop (1200px+)**: Full multi-column layouts, sidebars, and comprehensive navbars.
- **Tablet (992px & 768px)**: Stacked columns, adapted galleries, and simplified navigation.
- **Mobile (576px and below)**: Full-width elements, touch-friendly touchpoints, and hamburger menus.

## Preparation for JavaScript Integration
While JS is not included, the HTML contains semantic tags and explicit `id` and `class` attributes to make DOM selection easy:
- Form IDs like `id="loginForm"`, `id="signupForm"`, `id="roomBookingForm"`.
- Hidden placeholder structures for validation (e.g., `<span class="error-message">`, `.input-error`).
- Modal overlay skeletons.
- Reusable CSS classes for status badges (`.badge-success`, `.badge-warning`).