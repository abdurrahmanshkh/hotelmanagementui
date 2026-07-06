# StayEase Pro Admin Panel - Quick Start Guide

## Login to Admin Console

### Step 1: Open Admin Login Page
Navigate to: `http://localhost:3000/admin/admin-login.html`

### Step 2: Enter Credentials
Use the demo admin account:
```
Email: admin@example.com
Password: Admin@123
```

Optionally enter Staff Code: `STAFF2026`

### Step 3: Click "Sign In to Dashboard"
You'll be redirected to the admin dashboard.

---

## Dashboard Overview

Once logged in, you'll see the main admin dashboard with key metrics:

### Metric Cards (Top Section)
1. **Total Rooms** - Total number of rooms in the hotel
2. **Available Rooms** - Currently available rooms for booking
3. **Occupancy Rate** - Percentage of occupied rooms
4. **Revenue Today** - Total revenue collected today
5. **Service Requests** - Number of pending service requests
6. **Unread Chats** - Number of chats needing attention

### Recent Bookings Table
Shows the 5 most recent bookings with:
- Booking ID
- Guest name
- Room details
- Check-in/Check-out dates
- Booking status
- Payment status
- Quick actions (view, chat)

---

## Main Features

### 1. Rooms Management
**Navigate to**: Sidebar → Rooms

#### Available Actions
- **View All Rooms**: See complete room inventory
- **Add Room**: Click "Add Room" button to add new rooms
- **Edit Room**: Click edit icon to modify room details
- **Set Maintenance**: Mark rooms for maintenance
- **Filter Options**:
  - Search by room number or floor
  - Filter by room type (Standard, Deluxe, Suite, Family)
  - Filter by status (Available, Occupied, Maintenance)

#### Sample Rooms Included
```
Standard Rooms (₹1,800/night):
  - Room 101 (Floor 1)
  - Room 102 (Floor 1)
  - Room 103 (Floor 1)

Deluxe Rooms (₹2,800/night):
  - Room 205 (Floor 2)
  - Room 208 (Floor 2)
  - Room 305 (Floor 3)

Suite Rooms (₹4,500/night):
  - Room 310 (Floor 3)
  - Room 312 (Floor 3)

Family Rooms (₹5,200/night):
  - Room 410 (Floor 4)
  - Room 412 (Floor 4)
```

---

### 2. Bookings Management
**Navigate to**: Sidebar → Bookings

#### Available Actions
- **View All Bookings**: See complete booking list
- **Search**: Find bookings by ID, guest name, or room number
- **Filter by Status**: 
  - Confirmed
  - Checked In
  - Completed
  - Cancelled
- **View Details**: Click view icon to see full booking information
- **Chat with Guest**: Contact the guest directly

#### Booking Status Indicators
- 🟨 **Confirmed** - Booking confirmed, awaiting check-in
- 🔵 **Checked In** - Guest has checked in
- 🟩 **Completed** - Booking completed, guest checked out
- 🔴 **Cancelled** - Booking cancelled

#### Payment Status Indicators
- 🟩 **Paid** - Payment received
- 🟨 **Pending** - Payment awaiting
- 🔴 **Refunded** - Payment refunded

---

### 3. Guests Management
**Navigate to**: Sidebar → Guests

#### Features
- View all registered guests
- Search guests by name or email
- View guest profiles
- Check booking history
- Add notes for guests
- Manage guest preferences

---

### 4. Service Requests
**Navigate to**: Sidebar → Service Requests

#### Features
- View all service requests from guests
- Filter by status (Pending, In Progress, Completed)
- Filter by priority (Normal, High, Emergency)
- Assign staff to requests
- Add notes and updates
- Mark as completed

#### Priority Levels
- Normal: Standard requests
- High: Urgent but not critical
- Emergency: Critical - needs immediate attention

---

### 5. Chat Management
**Navigate to**: Sidebar → Chats

#### Features
- View all active chats with guests
- Send messages to guests
- Track conversation history
- Mark messages as read
- See guest typing indicators

---

### 6. Dynamic Pricing
**Navigate to**: Sidebar → Dynamic Pricing

#### Configuration
Set pricing rules for each room type:

**Current Rules**:
```
Standard Rooms:
  Base Price: ₹1,800
  Min Price: ₹1,500
  Max Price: ₹2,500
  High Demand: +25%
  Low Demand: -15%

Deluxe Rooms:
  Base Price: ₹2,800
  Min Price: ₹2,400
  Max Price: ₹3,800
  High Demand: +30%
  Low Demand: -20%

Suite Rooms:
  Base Price: ₹4,500
  Min Price: ₹3,800
  Max Price: ₹5,500
  High Demand: +35%
  Low Demand: -25%

Family Rooms:
  Base Price: ₹5,200
  Min Price: ₹4,500
  Max Price: ₹6,500
  High Demand: +30%
  Low Demand: -20%
```

#### How to Update Pricing
1. Navigate to Dynamic Pricing
2. Select room type
3. Adjust base price, min/max limits
4. Set high demand and low demand percentages
5. Save changes

---

### 7. Housekeeping
**Navigate to**: Sidebar → Housekeeping

#### Features
- Track cleaning status of all rooms
- Assign housekeeping staff
- Set cleaning priority
- View cleaning history
- Add maintenance notes

#### Room Cleaning Status
- 🟩 **Clean** - Ready for guests
- 🟨 **Pending** - Needs cleaning
- 🔵 **In Progress** - Currently being cleaned
- 🔴 **Issue** - Issue found during cleaning

---

### 8. Payments
**Navigate to**: Sidebar → Payments

#### Features
- View all payment records
- Search by booking ID or guest name
- Filter by payment method (Card, UPI, Net Banking, Wallet)
- Filter by status (Paid, Pending, Refunded)
- View payment details
- Process refunds

---

### 9. Reports
**Navigate to**: Sidebar → Reports

#### Available Reports
- Occupancy reports
- Revenue reports
- Guest analytics
- Service request analytics
- Payment reports
- Custom date range reports

---

### 10. Settings
**Navigate to**: Sidebar → Settings

#### Hotel Information
- Hotel name
- Address
- Phone number
- Email
- Website

#### Operational Settings
- Check-in time (default: 15:00)
- Check-out time (default: 11:00)
- Timezone
- Currency

#### Financial Settings
- Tax rate (default: 12%)
- Service fee rate (default: 5%)

#### Notification Preferences
- Email notifications (toggle)
- SMS notifications (toggle)
- Notification email address
- Emergency contact number

---

## Common Tasks

### Add a New Room
1. Go to Rooms Management
2. Click "Add Room" button
3. Enter room details:
   - Room Number
   - Room Type
   - Floor
   - Capacity
   - Base Price
   - Select Amenities
4. Click Save

### Check Occupancy
1. Dashboard → Occupancy Rate metric
2. See real-time occupancy percentage
3. Click to view detailed occupancy breakdown

### Handle Service Request
1. Go to Service Requests
2. Find the request
3. Click on it to view details
4. Assign to staff member
5. Update status as work progresses
6. Mark as completed

### Process Payment
1. Go to Payments
2. Find pending payment
3. Click on booking to view details
4. Verify amount and guest
5. Mark as paid

### Configure Dynamic Pricing
1. Go to Dynamic Pricing
2. Select room type
3. Adjust pricing parameters
4. Save changes
5. Prices automatically update for new bookings

---

## Sample Test Data

The admin panel comes pre-populated with:

### Users
- Admin User: admin@example.com
- Manager: manager@example.com
- Staff: staff@example.com

### Rooms
- 10 sample rooms across 4 types
- All with high-quality Unsplash images
- Various amenities configured

### Bookings
- 2 sample bookings to test workflows
- Different statuses and payment states

### Service Requests
- Sample requests at different priority levels
- Various statuses for testing

### Payments
- Sample payment records
- Different payment methods

---

## Tips & Tricks

1. **Search Everywhere**: Most pages have search functionality - use it!
2. **Filters**: Combine multiple filters for precise data views
3. **Notifications**: Watch for toast notifications for action feedback
4. **Sidebar**: Click hotel logo to collapse/expand sidebar on mobile
5. **Profile Menu**: Click your profile icon to access settings and logout

---

## Troubleshooting

### Issue: Can't login
**Solution**: 
- Verify email and password are correct
- Clear browser cache and cookies
- Check localStorage is enabled

### Issue: Data not showing
**Solution**:
- Refresh the page
- Check browser console for errors
- Verify localStorage has data (F12 → Application → Local Storage)

### Issue: Changes not saving
**Solution**:
- Check browser console for errors
- Verify localStorage is not full
- Try clearing unused data

### Issue: Logout not working
**Solution**:
- Click profile menu → Logout
- Manually navigate to admin-login.html
- Clear session storage and reload

---

## Data Export/Import

Currently, data is stored in browser's localStorage. To backup:

1. Open Browser DevTools (F12)
2. Go to Application → Local Storage
3. Find entries starting with `stayEasePro_`
4. Right-click and copy values
5. Save to a text file for backup

To restore:
1. Open Browser DevTools
2. Go to Application → Local Storage
3. Paste the backed-up JSON values

---

## Next Steps

1. Explore the dashboard and familiarize yourself with the layout
2. Test adding a new room in the Rooms Management section
3. View the sample bookings to understand the booking workflow
4. Check out Service Requests to see how to handle guest needs
5. Configure Dynamic Pricing for your business model
6. Set up hotel information in Settings

---

## Support & Help

For detailed information about specific features, refer to:
- `ADMIN_IMPROVEMENTS.md` - Comprehensive feature documentation
- Browser Console (F12) - For debugging information
- LocalStorage Inspector - For data verification

Enjoy using StayEase Pro Admin Console!
