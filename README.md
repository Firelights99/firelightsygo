# Firelight Sygo TCG Website - Local Recreation

This is a local recreation of the Firelight Sygo Trading Card Game website originally hosted at https://firelightsygo.square.site/

## About

Firelight Sygo appears to be a trading card game shop that offers:
- TCG products and merchandise
- Local membership programs
- Limited operating hours (Sunday 12:00 AM - 1:00 PM only)
- Secure checkout through Square

## Files Structure

```
Harrison-Website/
├── index.html          # Main HTML structure
├── styles.css          # CSS styling and responsive design
├── script.js           # JavaScript functionality and interactivity
└── README.md           # This documentation file
```

## Features

### Website Sections
- **Header Navigation**: Site title and shopping cart access
- **Hero Section**: Main promotional content with call-to-action
- **Membership Section**: Local membership offering (currently out of stock)
- **Testimonial**: Customer feedback
- **Location & Hours**: Business hours (mostly closed, open Sunday 12-1 PM)
- **Returns Policy**: Detailed policy information
- **Footer**: Payment methods and secure checkout information

### Interactive Features
- **Shopping Cart Modal**: Click the cart icon to view cart (currently empty)
- **Smooth Scrolling**: Navigation links scroll smoothly to sections
- **Responsive Design**: Mobile-friendly layout
- **Hover Effects**: Interactive buttons and cards
- **Fade-in Animations**: Sections animate as you scroll
- **Keyboard Navigation**: ESC key closes modals

### Technical Features
- Fully responsive design (mobile, tablet, desktop)
- Modern CSS with flexbox and grid layouts
- Intersection Observer API for scroll animations
- Accessible keyboard navigation
- Cross-browser compatible

## How to View

Simply open `index.html` in any modern web browser to view the website locally.

## Live Demo

The website is now live and accessible at:
- **Custom Domain**: https://www.firelightsygo-tcg.com (once DNS is configured)
- **GitHub Pages**: https://firelights99.github.io/firelightsygo/

**Custom Domain Setup**: The domain `www.firelightsygo-tcg.com` is configured in the CNAME file. To make it work, you need to:
1. Configure DNS records with your domain provider to point to GitHub Pages
2. Add a CNAME record: `www.firelightsygo-tcg.com` → `firelights99.github.io`
3. GitHub will automatically provision SSL certificate once DNS propagates

The site is automatically deployed via GitHub Actions whenever changes are pushed to the main branch.

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Original Website Information

- **Original URL**: https://firelightsygo.square.site/
- **Business**: Trading Card Game shop
- **Payment Processing**: Square
- **Accepted Payments**: Apple Pay, Google Pay, Visa, Mastercard, American Express, Discover, JCB, Interac, Afterpay

## Notes

- This is a static recreation for local viewing
- No actual e-commerce functionality is implemented
- Payment processing and checkout are simulated
- All orders mentioned as "FINAL" in original policy
- Business appears to have very limited hours (Sunday only, 1 hour)

## Development

The website uses vanilla HTML, CSS, and JavaScript with no external dependencies, making it easy to modify and extend.

### Key CSS Classes
- `.hero` - Main promotional section
- `.membership-card` - Membership offering display
- `.cart-modal` - Shopping cart overlay
- `.returns-policy` - Policy information section

### Key JavaScript Functions
- `toggleCart()` - Shows/hides shopping cart modal
- `showNotification()` - Utility for displaying notifications
- `validateEmail()` - Email validation helper

---

*This recreation was created to preserve the content and design of the original Firelight Sygo website for local viewing and reference.*
