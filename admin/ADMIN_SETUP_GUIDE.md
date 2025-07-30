# Admin System Setup Guide

## Overview

The Firelight Duel Academy admin system provides comprehensive store management capabilities for website administrators. This system allows admins to manage orders, inventory, customers, and view analytics.

## Features

### 🔐 Authentication System
- Secure admin login with session management
- Demo admin account for testing
- Automatic session validation and redirect protection

### 📊 Dashboard Overview
- Real-time statistics (orders, revenue, customers)
- Quick access to pending orders and low stock items
- Monthly revenue tracking and analytics

### 🛒 Order Management
- View all orders (user and guest orders)
- Update order status (pending → processing → shipped → delivered)
- Add tracking numbers for shipped orders
- Detailed order information with customer details
- Search orders by ID, customer name, or email

### 📦 Inventory Management
- Add, edit, and delete inventory items
- Real-time price and quantity updates
- Low stock alerts and thresholds
- Bulk price update functionality
- Search inventory by name, category, or set

### 👥 Customer Management
- View all registered customers
- Customer order history and statistics
- Activate/deactivate customer accounts
- Search customers by name or email

### 📈 Analytics
- Sales analytics and revenue tracking
- Top-selling cards identification
- Monthly performance metrics
- Customer lifetime value tracking

## Setup Instructions

### 1. Access the Admin System

Navigate to: `admin/admin-login.html`

### 2. Demo Login Credentials

For testing purposes, use these credentials:
- **Email:** admin@firelightygo.com
- **Password:** admin123

### 3. Creating Additional Admin Accounts

To create additional admin accounts, you need to manually add them to localStorage:

```javascript
// Get existing users
const users = JSON.parse(localStorage.getItem('tcg-users') || '{}');

// Add new admin user
users['newadmin@example.com'] = {
    id: 'admin-' + Date.now(),
    email: 'newadmin@example.com',
    password: 'securepassword', // In production, use proper hashing
    firstName: 'Admin',
    lastName: 'User',
    isAdmin: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    permissions: ['orders', 'inventory', 'customers', 'analytics']
};

// Save back to localStorage
localStorage.setItem('tcg-users', JSON.stringify(users));
```

## File Structure

```
admin/
├── admin-login.html          # Admin login page
├── admin-dashboard.html      # Main admin dashboard
├── admin-system.js          # Core admin functionality
├── ADMIN_SETUP_GUIDE.md     # This setup guide
├── crystal-commerce-admin.html
├── pricecharting-setup.html
└── tcgplayer-setup.html
```

## Key Components

### AdminSystem Class

The main `AdminSystem` class handles all admin functionality:

- **Authentication:** Session management and login validation
- **Data Loading:** Loads orders, customers, and inventory from localStorage
- **Dashboard Updates:** Real-time statistics and content updates
- **Order Management:** Status updates, tracking numbers, detailed views
- **Inventory Management:** CRUD operations for inventory items
- **Customer Management:** Customer details and account management
- **Search Functions:** Search across orders, inventory, and customers
- **Modal System:** Professional modal dialogs for detailed operations

### Data Storage

The admin system uses localStorage for data persistence:

- `tcg-admin`: Current admin session data
- `tcg-users`: All user accounts (including admins)
- `tcg-orders`: User orders
- `tcg-guest-orders`: Guest orders
- `tcg-inventory`: Inventory items

## Security Considerations

### Current Implementation (Demo)
- Passwords stored in plain text (localStorage)
- Client-side authentication only
- No server-side validation

### Production Recommendations
- Implement proper password hashing (bcrypt)
- Server-side authentication with JWT tokens
- HTTPS-only admin access
- Rate limiting on login attempts
- Session timeout and refresh tokens
- Database storage instead of localStorage
- Input validation and sanitization
- CSRF protection
- Role-based permissions system

## Usage Guide

### Managing Orders

1. **View Orders:** Navigate to the Orders tab to see all orders
2. **Update Status:** Click "Update" on any order to change its status
3. **Add Tracking:** When marking as "shipped", add tracking numbers
4. **Search Orders:** Use the search bar to find specific orders

### Managing Inventory

1. **Add Items:** Click "Add New Card" to add inventory
2. **Edit Items:** Click "Edit" on any item to modify details
3. **Update Prices:** Use inline price inputs or bulk update feature
4. **Monitor Stock:** Low stock items are highlighted in red

### Managing Customers

1. **View Details:** Click "View" to see customer information and order history
2. **Account Status:** Activate or deactivate customer accounts
3. **Search Customers:** Find customers by name or email

### Analytics

1. **Revenue Tracking:** View monthly and total revenue
2. **Top Cards:** See best-selling inventory items
3. **Customer Metrics:** Track customer acquisition and retention

## Troubleshooting

### Common Issues

1. **Login Issues**
   - Verify credentials match demo account
   - Check browser console for errors
   - Clear localStorage if needed

2. **Data Not Loading**
   - Ensure localStorage has required data
   - Check browser console for JavaScript errors
   - Refresh the page to reload data

3. **Orders Not Updating**
   - Verify order exists in localStorage
   - Check both user and guest order storage
   - Ensure proper order ID format

### Browser Compatibility

- Modern browsers with ES6+ support
- localStorage support required
- JavaScript enabled

## Development Notes

### Extending the System

To add new features:

1. **New Tabs:** Add tab button and content div to dashboard
2. **New Functions:** Add methods to AdminSystem class
3. **New Modals:** Use existing modal system for consistency
4. **New Data:** Extend localStorage structure as needed

### Code Organization

- **admin-login.html:** Standalone login page with embedded JavaScript
- **admin-dashboard.html:** Main dashboard HTML structure and styling
- **admin-system.js:** All JavaScript functionality in AdminSystem class

## Future Enhancements

### Planned Features
- Real-time notifications for new orders
- Advanced analytics with charts
- Bulk operations for inventory management
- Email notifications for order updates
- Export functionality for reports
- Multi-admin role management
- Audit logging for admin actions

### Integration Opportunities
- Payment processor integration
- Shipping provider APIs
- Email service integration
- Database migration tools
- Backup and restore functionality

## Support

For technical support or questions about the admin system:

1. Check this documentation first
2. Review browser console for errors
3. Test with demo credentials
4. Verify localStorage data structure

## Version History

- **v1.0.0:** Initial admin system implementation
  - Basic authentication and dashboard
  - Order, inventory, and customer management
  - Search and analytics functionality
  - Mobile-responsive design
