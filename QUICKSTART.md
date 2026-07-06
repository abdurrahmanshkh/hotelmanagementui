# StayEase Pro - Quick Start Guide

## Getting Started

### Step 1: Open the Application
Navigate to `index.html` in your browser. You'll see the home page with featured rooms and hotel imagery.

### Step 2: Login or Browse
**Option A - Login First:**
1. Click "Login" in the navbar
2. Use demo credentials:
   - Email: `guest@example.com`
   - Password: `Guest@123`
3. You'll be redirected to the dashboard

**Option B - Browse as Guest:**
1. Click "Browse Our Rooms" on home page
2. View available rooms, prices, and ratings
3. When you try to book, you'll be prompted to login

---

## Demo User Journey

### 1. View Available Rooms
- **Page**: Home → "Browse Our Rooms" or Rooms navbar link
- **What You See**: 
  - 10+ rooms with images from Unsplash
  - Real pricing (₹1,800 to ₹5,200 per night)
  - Room ratings and amenities
  - Availability status (Available, Occupied, Maintenance)

### 2. Book a Room
- **Page**: Room Details
- **Steps**:
  1. Click any "Book Now" or "View Details" button
  2. Select check-in and check-out dates
  3. Select number of guests
  4. Add special requests (optional)
  5. Click "Proceed to Booking"

### 3. Confirm Booking
- **Page**: Booking Confirmation
- **What You See**:
  - Room details and pricing breakdown
  - GST (12%) and service fee (5%) calculated
  - Total amount
- **Action**: Click "Proceed to Payment"

### 4. Make Payment
- **Page**: Payment
- **Steps**:
  1. Choose payment method (Card/UPI/Net Banking/Wallet)
  2. Enter details (pre-filled demo data available)
  3. Click "Pay Now"
  4. Wait 2 seconds for processing
- **Result**: Success message, automatic redirect to booking details

### 5. View Your Booking
- **Page**: Booking Details
- **What You See**:
  - Booking ID and confirmation
  - Room passcode (auto-generated)
  - Passcode status (Active, Locked, Expired)
  - Invoice and payment details
  - Option to request services
  - Chat with support

### 6. Dashboard
- **Page**: Dashboard (after login)
- **What You See**:
  - Active booking (if checked in)
  - Upcoming bookings
  - Recent notifications
  - Quick stats

---

## Features to Test

### Authentication
- ✅ Login with demo credentials
- ✅ Create new account with signup
- ✅ Logout functionality
- ✅ Session persistence (refresh page - you stay logged in)

### Browsing
- ✅ Search rooms by name or type
- ✅ Filter by room type
- ✅ Sort by price or rating
- ✅ Filter by price range
- ✅ View room images and amenities

### Booking
- ✅ Select dates and guests
- ✅ Calculate nights and pricing live
- ✅ Dynamic pricing based on demand
- ✅ Booking confirmation summary
- ✅ Special requests

### Payment
- ✅ Multi-method payment options
- ✅ Payment form validation
- ✅ Simulated payment processing
- ✅ Payment receipt
- ✅ Automatic passcode generation

### Management
- ✅ View all your bookings
- ✅ Filter by status (Active, Upcoming, Completed, Cancelled)
- ✅ View booking details and passcode
- ✅ Download invoice
- ✅ Cancel bookings
- ✅ View notifications

---

## Demo Data Highlights

### Rooms Available
| Type | Room# | Floor | Price | Capacity | Status |
|------|-------|-------|-------|----------|--------|
| Standard | 101 | 1 | ₹1,800 | 2 | Available |
| Standard | 102 | 1 | ₹1,800 | 2 | Available |
| Deluxe | 205 | 2 | ₹2,800 | 3 | Available |
| Deluxe | 305 | 3 | ₹2,800 | 3 | Occupied |
| Suite | 310 | 3 | ₹4,500 | 4 | Available |
| Suite | 312 | 3 | ₹4,500 | 4 | Maintenance |
| Family | 410 | 4 | ₹5,200 | 5 | Available |
| Family | 412 | 4 | ₹5,200 | 6 | Available |

### Pre-existing Booking (Demo User)
- **Booking ID**: BK-2026-1042
- **Room**: Deluxe #305
- **Dates**: 2026-07-05 to 2026-07-08 (3 nights)
- **Passcode**: 482913
- **Status**: Checked In
- **Total**: ₹11,446

---

## Keyboard Shortcuts / Quick Actions

- Press `Esc` on modals to close
- `Enter` to submit forms
- `Tab` to navigate form fields
- Click navbar logo to return home

---

## What's All Using LocalStorage?

All data is stored in your browser's localStorage. It persists until you:
1. Clear browser data/cache
2. Click "Reset All Data" (if implemented)
3. Open in private/incognito mode (data is temporary)

**Keys Used:**
- `stayEasePro_users` - User accounts
- `stayEasePro_rooms` - Room listings
- `stayEasePro_bookings` - Your bookings
- `stayEasePro_payments` - Payment history
- `stayEasePro_notifications` - Notifications
- `stayEasePro_currentUser` - Current session user

---

## Troubleshooting

### I don't see any rooms
**Solution**: 
1. Refresh the page (hard refresh: Ctrl+Shift+R or Cmd+Shift+R)
2. Check browser console for errors
3. Ensure JavaScript is enabled
4. Try clearing cache and reload

### Login not working
**Solution**:
1. Verify you're using correct demo credentials:
   - Email: `guest@example.com`
   - Password: `Guest@123`
2. Case-sensitive - email must be lowercase
3. Check for extra spaces in password

### Images not loading
**Solution**:
1. Check internet connection (Unsplash CDN requires internet)
2. Firewall may be blocking images
3. Browser console (F12) will show any image errors

### Data disappeared after refresh
**Solution**:
1. Check if you opened in private/incognito mode (data doesn't persist)
2. localStorage may be disabled or full
3. Try using different browser

### Payment not proceeding
**Solution**:
1. Fill all required payment fields
2. Ensure check-in/check-out dates are selected
3. Guest count must be >= 1 and <= room capacity
4. Check console for errors (F12)

---

## Tips for Best Experience

1. **Use Full Screen**: Responsive design works best on full screen
2. **Enable DevTools**: Press F12 to see any console messages
3. **Test Different Rooms**: Each room type has different pricing
4. **Try Different Dates**: See dynamic pricing change based on availability
5. **Cancel and Rebook**: Test the cancellation flow
6. **Try Signup**: Create a new account and see new bookings

---

## System Requirements

- Modern browser (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- LocalStorage enabled
- Internet connection (for Unsplash images)
- Minimum 768px width for mobile responsiveness

---

## File Structure

```
/vercel/share/v0-project/
├── index.html                 (Home page)
├── login.html                (Login page)
├── signup.html               (Sign up page)
├── rooms.html                (Room listing)
├── room-details.html         (Room details & booking)
├── booking-confirmation.html (Confirm booking)
├── payment.html              (Payment page)
├── booking-details.html      (View booking)
├── my-bookings.html          (Bookings list)
├── dashboard.html            (User dashboard)
├── services.html             (Request services)
├── chat.html                 (Chat with support)
├── css/
│   └── style.css             (All styling)
├── js/
│   ├── data.js               (Sample data & seeding)
│   ├── storage.js            (localStorage helpers)
│   ├── validation.js         (Form validation)
│   ├── auth.js               (Authentication)
│   ├── rooms.js              (Room logic)
│   ├── bookings.js           (Booking logic)
│   ├── payments.js           (Payment logic)
│   ├── ui.js                 (UI helpers)
│   ├── app.js                (Page initialization)
│   ├── services.js           (Service requests)
│   ├── chat.js               (Chat functionality)
│   ├── notifications.js      (Notifications)
│   └── passcode.js           (Passcode logic)
└── IMPROVEMENTS.md           (Detailed changelog)
```

---

## Contact Support

For issues or questions about the StayEase Pro demo:
1. Check console (F12) for error messages
2. Review IMPROVEMENTS.md for detailed changes
3. Test in different browser if needed
4. Clear browser cache and try again

---

**Version**: 1.0
**Last Updated**: July 6, 2026
**Status**: All customer panel features working ✅
