# Firelight Duel Academy - Shopify Theme

A comprehensive Yu-Gi-Oh! Trading Card Game e-commerce theme for Shopify with modern web development practices, API integrations, and professional store management features.

## 🎯 Features

### 🗄️ Yu-Gi-Oh! TCG Store Integration
- **Complete Card Database**: Integration with YGOPRODeck API for comprehensive card data
- **Dynamic Card Loading**: Automatically loads card information, images, and details
- **Advanced Filtering**: Filter by card type, attribute, level, race, and more
- **Meta-Relevant Cards**: Curated selection of competitive and tournament cards
- **Card Search**: Powerful search functionality with real-time results
- **Price Generation**: Dynamic pricing based on card type and rarity

### 🛒 E-commerce Functionality
- **Shopify Integration**: Full compatibility with Shopify's e-commerce platform
- **Cart Management**: Advanced cart functionality with quantity controls
- **Wishlist System**: Customer wishlist with localStorage persistence
- **Product Variants**: Support for different card conditions and rarities
- **Inventory Management**: Real-time stock tracking and updates
- **Payment Processing**: Seamless integration with Shopify's payment system

### 🎨 Modern Design System
- **Responsive Design**: Mobile-first approach with CSS Grid and Flexbox
- **Yu-Gi-Oh! Theming**: Custom color schemes and card-specific styling
- **Accessibility**: ARIA labels, semantic HTML, keyboard navigation
- **Performance**: Optimized CSS and JavaScript with minimal dependencies
- **Custom Properties**: CSS custom properties for easy theme customization

### 🔧 Technical Features
- **Liquid Templates**: Professional Shopify theme structure
- **ES6+ JavaScript**: Modern JavaScript with classes and modules
- **API Integration**: Yu-Gi-Oh! database integration with fallback systems
- **Local Storage**: Client-side data persistence for user preferences
- **Progressive Enhancement**: Works without JavaScript, enhanced with it

## 📁 Theme Structure

```
shopify/
├── layout/
│   └── theme.liquid              # Main theme layout
├── templates/
│   ├── index.liquid              # Homepage template
│   ├── product.liquid            # Product page template
│   └── collection.liquid         # Collection page template
├── sections/
│   └── (Shopify sections)        # Reusable content sections
├── snippets/
│   └── product-card.liquid       # Product card component
├── assets/
│   ├── base.css                  # Base theme styles
│   ├── global.js                 # Main theme JavaScript
│   ├── yugioh-store.css          # Yu-Gi-Oh! specific styles
│   ├── yugioh-api-service.js     # API integration
│   └── yugioh-pricing-service.js # Pricing logic
├── config/
│   └── settings_schema.json      # Theme settings configuration
├── locales/
│   └── (Translation files)       # Multi-language support
└── README.md                     # This file
```

## 🚀 Installation

### Method 1: Upload to Shopify Admin
1. Compress the `shopify/` folder into a ZIP file
2. Go to your Shopify Admin → Online Store → Themes
3. Click "Upload theme" and select the ZIP file
4. Once uploaded, click "Customize" to configure settings

### Method 2: Shopify CLI (Recommended for Development)
```bash
# Install Shopify CLI
npm install -g @shopify/cli @shopify/theme

# Navigate to the shopify directory
cd shopify

# Connect to your store
shopify theme dev --store your-store-name.myshopify.com

# Deploy to production
shopify theme push
```

## ⚙️ Configuration

### Theme Settings
Access theme settings through Shopify Admin → Online Store → Themes → Customize:

#### Yu-Gi-Oh! Store Settings
- **Store Name**: Customize your store name (default: "Firelight Duel Academy")
- **Store Description**: Set your store description
- **Currency**: Choose your preferred currency (CAD, USD, EUR)
- **Free Shipping Threshold**: Set minimum order for free shipping

#### API Configuration
- **Enable Yu-Gi-Oh! API**: Toggle YGOPRODeck API integration
- **API Endpoint**: Configure API endpoint (default: YGOPRODeck)
- **Enable TCGPlayer API**: Optional real-time pricing (requires API key)
- **TCGPlayer API Key**: Enter your TCGPlayer API key

#### Featured Cards
- **Featured Card Names**: List of cards to feature on homepage
- **Meta Card Names**: List of current meta-relevant cards

#### Store Features
- **Enable Wishlist**: Toggle wishlist functionality
- **Enable Advanced Card Search**: Toggle search features
- **Enable Deck Builder**: Toggle deck building tools
- **Show Card Details**: Display ATK/DEF, Level, Type information

#### Pricing Strategy
- **Fixed Pricing**: Use set prices for all cards
- **Dynamic Pricing**: Price based on card type and rarity
- **API-based Pricing**: Use TCGPlayer for real-time pricing
- **Base Card Price**: Starting price for common cards

### Color Customization
- **Primary Color**: Main brand color (default: #3498db)
- **Secondary Color**: Accent color (default: #e74c3c)
- **Background Colors**: Light and dark background options
- **Text Colors**: Customizable text colors

### Typography
- **Header Font**: Choose from Shopify's font library
- **Body Font**: Select body text font
- **Font Scaling**: Adjust font sizes globally

## 🎴 Yu-Gi-Oh! Integration

### Card Data Sources
- **Primary**: YGOPRODeck API (free, comprehensive database)
- **Secondary**: TCGPlayer API (requires subscription, real-time pricing)
- **Fallback**: Manual product entry through Shopify admin

### Supported Card Types
- Effect Monsters, Normal Monsters, Ritual Monsters
- Fusion Monsters, Synchro Monsters, XYZ Monsters
- Link Monsters, Pendulum Monsters
- Spell Cards, Trap Cards

### Card Attributes
- DARK, LIGHT, FIRE, WATER, EARTH, WIND, DIVINE

### Monster Types/Races
- Dragon, Spellcaster, Warrior, Beast, Machine
- Fiend, Fairy, Zombie, Aqua, Psychic, Thunder
- Rock, Plant, Insect, Fish, Sea Serpent, Reptile
- Pyro, Dinosaur, Divine-Beast, Winged Beast, Beast-Warrior

## 🛠️ Customization

### Adding Custom Styles
Create additional CSS files in the `assets/` folder:

```css
/* assets/custom-styles.css */
.custom-card-style {
  border: 2px solid var(--color-base-accent-1);
  border-radius: 8px;
}
```

Include in `layout/theme.liquid`:
```liquid
{{ 'custom-styles.css' | asset_url | stylesheet_tag }}
```

### Custom JavaScript
Add custom functionality in `assets/` folder:

```javascript
// assets/custom-functionality.js
document.addEventListener('DOMContentLoaded', function() {
  // Your custom code here
});
```

Include in `layout/theme.liquid`:
```liquid
<script src="{{ 'custom-functionality.js' | asset_url }}" defer></script>
```

### Creating New Templates
1. Create new `.liquid` file in `templates/` folder
2. Use existing templates as reference
3. Include necessary sections and snippets

### Adding Sections
1. Create new `.liquid` file in `sections/` folder
2. Include schema for customization options
3. Add to templates using `{% section 'section-name' %}`

## 📱 Responsive Design

### Breakpoints
- **Mobile**: 320px - 749px
- **Tablet**: 750px - 989px
- **Desktop**: 990px+

### Mobile Optimizations
- Touch-friendly buttons and navigation
- Optimized card grid layouts
- Compressed images for faster loading
- Simplified navigation menus

## 🔍 SEO Features

### Built-in SEO
- Semantic HTML structure
- Meta tags and Open Graph support
- Structured data for products
- Optimized page titles and descriptions

### Performance
- Lazy loading images
- Minified CSS and JavaScript
- Optimized font loading
- Efficient API calls with caching

## 🧪 Testing

### Browser Support
- **Chrome**: 60+
- **Firefox**: 55+
- **Safari**: 12+
- **Edge**: 79+
- **Mobile**: iOS Safari 12+, Chrome Mobile 60+

### Testing Checklist
- [ ] Homepage loads correctly
- [ ] Product pages display card information
- [ ] Collection pages show filtering options
- [ ] Cart functionality works
- [ ] Wishlist saves items
- [ ] Search returns results
- [ ] Mobile navigation functions
- [ ] Forms validate properly

## 🚀 Performance Optimization

### Image Optimization
- Use Shopify's image transformation
- Implement lazy loading
- Provide appropriate alt text
- Use responsive images with srcset

### JavaScript Optimization
- Load scripts asynchronously
- Use event delegation
- Implement debouncing for search
- Cache API responses

### CSS Optimization
- Use CSS custom properties
- Minimize unused styles
- Implement critical CSS
- Use efficient selectors

## 🔒 Security

### Best Practices
- Sanitize user inputs
- Use HTTPS for all requests
- Implement Content Security Policy
- Validate API responses

### Data Protection
- Store minimal user data locally
- Use secure API endpoints
- Implement proper error handling
- Follow GDPR compliance guidelines

## 🐛 Troubleshooting

### Common Issues

#### Cards Not Loading
- Check API endpoint configuration
- Verify internet connection
- Check browser console for errors
- Ensure API limits aren't exceeded

#### Styling Issues
- Clear browser cache
- Check CSS custom properties
- Verify theme settings
- Test in different browsers

#### JavaScript Errors
- Check browser console
- Verify script loading order
- Test with JavaScript disabled
- Check for conflicting scripts

### Debug Mode
Enable debug mode by adding to `layout/theme.liquid`:
```liquid
<script>
  window.yugiohStore.debug = true;
</script>
```

## 📞 Support

### Documentation
- [Shopify Theme Development](https://shopify.dev/themes)
- [Liquid Template Language](https://shopify.github.io/liquid/)
- [YGOPRODeck API](https://ygoprodeck.com/api-guide/)

### Community
- Shopify Partners Community
- Yu-Gi-Oh! Developer Forums
- GitHub Issues and Discussions

## 📄 License

This theme is created for educational and demonstration purposes. All Yu-Gi-Oh! related content is property of Konami Digital Entertainment.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📈 Roadmap

### Planned Features
- Advanced deck builder
- Tournament management
- Live chat support
- Mobile app integration
- Multi-language support
- Advanced analytics

### Technical Improvements
- Progressive Web App features
- Service worker implementation
- Advanced caching strategies
- Real-time inventory updates
- Machine learning price predictions

---

**Firelight Duel Academy Theme** - Bringing the world of Yu-Gi-Oh! to Shopify with professional e-commerce functionality and modern web standards.
