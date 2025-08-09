# Contributing to Firelight Duel Academy

Thank you for your interest in contributing to Firelight Duel Academy! This document provides guidelines and information for contributors.

## 🎯 Project Overview

Firelight Duel Academy is a comprehensive Yu-Gi-Oh! Trading Card Game e-commerce platform featuring:
- Modern web development practices
- API integrations (YGOPRODeck, TCGPlayer, Crystal Commerce)
- Square payment processing
- Professional store management features
- Responsive design and accessibility

## 🚀 Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Text editor or IDE (VS Code recommended)
- Basic knowledge of HTML, CSS, and JavaScript
- Git for version control

### Local Development Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Harrison-Website.git
   cd Harrison-Website
   ```
3. **Open the project** in your preferred editor
4. **Start development** by opening `index.html` in a browser or using a local server

### Recommended Development Tools

- **VS Code Extensions**:
  - Live Server (for local development)
  - HTML CSS Support
  - JavaScript (ES6) code snippets
  - Prettier (code formatting)
  - ESLint (code linting)

## 📋 How to Contribute

### 1. Choose an Issue

- Browse [open issues](https://github.com/firelights99/firelightsygo/issues)
- Look for issues labeled `good first issue` for beginners
- Comment on the issue to let others know you're working on it

### 2. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 3. Make Your Changes

Follow our coding standards and guidelines (see below).

### 4. Test Your Changes

- Test in multiple browsers
- Verify mobile responsiveness
- Check accessibility features
- Test any API integrations

### 5. Submit a Pull Request

- Use our [Pull Request Template](.github/pull_request_template.md)
- Provide clear description of changes
- Include screenshots for UI changes
- Reference related issues

## 🎨 Coding Standards

### HTML Guidelines

- Use semantic HTML5 elements
- Include proper DOCTYPE declaration
- Add meta charset and viewport tags
- Use meaningful alt text for images
- Ensure proper heading hierarchy (h1, h2, h3, etc.)
- Include ARIA labels for accessibility

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Page Title</title>
</head>
<body>
    <main>
        <h1>Main Heading</h1>
        <img src="image.jpg" alt="Descriptive alt text">
    </main>
</body>
</html>
```

### CSS Guidelines

- Use BEM methodology for class naming
- Organize CSS with logical sections
- Use CSS custom properties for theming
- Ensure responsive design with mobile-first approach
- Use modern CSS features (Grid, Flexbox)

```css
/* BEM Example */
.card {
    /* Block */
}

.card__title {
    /* Element */
}

.card--featured {
    /* Modifier */
}

/* CSS Custom Properties */
:root {
    --primary-color: #3498db;
    --secondary-color: #e74c3c;
}
```

### JavaScript Guidelines

- Use ES6+ features (const/let, arrow functions, classes)
- Write modular, reusable code
- Include proper error handling
- Use meaningful variable and function names
- Add comments for complex logic
- Remove console.log statements from production code

```javascript
// Good example
class YugiohCard {
    constructor(name, type, attack, defense) {
        this.name = name;
        this.type = type;
        this.attack = attack;
        this.defense = defense;
    }

    async fetchCardData() {
        try {
            const response = await fetch(`/api/cards/${this.name}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching card data:', error);
            throw error;
        }
    }
}
```

### File Organization

```
assets/
├── css/
│   ├── main.css              # Main stylesheet
│   ├── components/           # Component-specific styles
│   └── pages/               # Page-specific styles
├── js/
│   ├── main.js              # Main JavaScript
│   ├── components/          # Reusable components
│   ├── services/            # API services
│   └── pages/               # Page-specific scripts
└── images/                  # Image assets
```

## 🧪 Testing Guidelines

### Manual Testing Checklist

- [ ] Test in Chrome, Firefox, Safari, and Edge
- [ ] Verify mobile responsiveness (320px to 1920px)
- [ ] Check keyboard navigation
- [ ] Validate HTML and CSS
- [ ] Test JavaScript functionality
- [ ] Verify API integrations work correctly
- [ ] Check payment processing (if applicable)

### Browser Support

- **Desktop**: Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- **Mobile**: iOS Safari 12+, Chrome Mobile 60+

## 🔒 Security Guidelines

### Do NOT commit:
- API keys or secrets
- Personal information
- Database credentials
- Payment processing keys

### Security Best Practices:
- Validate all user inputs
- Use HTTPS for all external requests
- Sanitize data before displaying
- Follow OWASP security guidelines

## 📚 API Integration Guidelines

### YGOPRODeck API
- Primary data source for Yu-Gi-Oh! cards
- No authentication required
- Rate limiting: Be respectful with requests

### TCGPlayer API
- Requires API key configuration
- Used for pricing data
- Follow their terms of service

### Square API
- Payment processing integration
- Requires proper credentials
- Test in sandbox environment first

## 🎯 Feature Categories

When contributing, consider these feature areas:

### Store Functionality
- Product catalogue and search
- Shopping cart and checkout
- Inventory management
- Pricing and discounts

### Payment Processing
- Square integration
- Store credit system
- Transaction handling
- Error management

### User Experience
- Responsive design
- Accessibility features
- Performance optimization
- Mobile experience

### Admin Tools
- Inventory management
- Order processing
- Customer management
- Analytics and reporting

## 📖 Documentation

### When to Update Documentation

- Adding new features
- Changing existing functionality
- Updating API integrations
- Modifying configuration options

### Documentation Files to Update

- `README.md` - Main project documentation
- `CHANGELOG.md` - Track all changes
- `docs/PROJECT_STRUCTURE.md` - Technical documentation
- Code comments - Inline documentation

## 🐛 Bug Reports

When reporting bugs, include:

1. **Clear description** of the issue
2. **Steps to reproduce** the problem
3. **Expected behavior** vs actual behavior
4. **Environment details** (browser, OS, device)
5. **Screenshots** if applicable
6. **Console errors** from browser dev tools

Use our [Bug Report Template](.github/ISSUE_TEMPLATE/bug_report.md).

## 💡 Feature Requests

When suggesting features, include:

1. **Problem description** - What issue does this solve?
2. **Proposed solution** - How should it work?
3. **Alternative solutions** - Other approaches considered
4. **Use cases** - Who would benefit from this?
5. **Implementation complexity** - Simple, moderate, or complex

Use our [Feature Request Template](.github/ISSUE_TEMPLATE/feature_request.md).

## 🔄 Pull Request Process

1. **Create descriptive title** - Summarize the change
2. **Fill out PR template** - Provide all requested information
3. **Link related issues** - Reference issue numbers
4. **Add screenshots** - For UI/UX changes
5. **Request review** - Tag relevant reviewers
6. **Address feedback** - Respond to review comments
7. **Update documentation** - Keep docs current

### PR Review Criteria

- Code quality and style compliance
- Functionality works as expected
- No security vulnerabilities
- Performance impact is acceptable
- Documentation is updated
- Tests pass (manual and automated)
- Mobile responsiveness maintained
- Accessibility standards met

## 🏆 Recognition

Contributors will be recognized in:
- GitHub contributors list
- Project documentation
- Release notes (for significant contributions)

## 📞 Getting Help

- **GitHub Issues** - For bugs and feature requests
- **GitHub Discussions** - For questions and general discussion
- **Code Review** - Request feedback on your changes

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the same terms as the project.

## 🎉 Thank You!

Your contributions help make Firelight Duel Academy better for everyone. Whether you're fixing bugs, adding features, improving documentation, or helping other contributors, your efforts are appreciated!

---

**Happy Contributing!** 🎴✨
