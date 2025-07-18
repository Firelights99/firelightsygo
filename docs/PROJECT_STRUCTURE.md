# Project Structure

This document outlines the organized structure of the Harrison Website project.

## Directory Structure

```
Harrison-Website/
├── .github/                    # GitHub configuration
│   ├── workflows/             # GitHub Actions workflows
│   └── ISSUE_TEMPLATE/        # Issue templates
├── .nojekyll                  # GitHub Pages configuration
├── README.md                  # Project documentation
├── index.html                 # Main homepage
├── product.html               # Product page
├── shop.html                  # Shop page
├── admin/                     # Administrative tools
│   ├── crystal-commerce-admin.html
│   └── tcgplayer-setup.html
├── assets/                    # Static assets
│   ├── css/                   # Stylesheets
│   │   ├── components/        # Component-specific styles
│   │   │   ├── exact-square.css
│   │   │   ├── square-style.css
│   │   │   ├── tcgplayer-media-integration.css
│   │   │   └── yugioh-image-enhancements.css
│   │   ├── pages/             # Page-specific styles
│   │   │   ├── product-page.css
│   │   │   └── yugioh-store.css
│   │   ├── main.css           # Main stylesheet
│   │   └── styles.css         # Additional styles
│   ├── js/                    # JavaScript files
│   │   ├── services/          # Service layer files
│   │   │   ├── crystal-commerce-integration.js
│   │   │   ├── tcgplayer-api-service.js
│   │   │   ├── tcgplayer-media-service.js
│   │   │   ├── yugioh-api-service.js
│   │   │   └── yugioh-image-service.js
│   │   ├── pages/             # Page-specific JavaScript
│   │   │   ├── product-page.js
│   │   │   └── yugioh-store.js
│   │   ├── main.js            # Main JavaScript file
│   │   ├── script.js          # General scripts
│   │   └── square-functionality.js
│   ├── icons/                 # Icon assets
│   └── images/                # Image assets
├── config/                    # Configuration files
│   └── site.json             # Site configuration
├── data/                      # Data files
│   ├── database-schema.sql    # Database schema
│   ├── membership.json        # Membership data
│   └── yugioh-singles-schema.sql
└── docs/                      # Documentation
    ├── CHANGELOG.md           # Change log
    └── PROJECT_STRUCTURE.md   # This file
```

## File Organization Principles

### CSS Organization
- **Main styles**: `assets/css/main.css` and `assets/css/styles.css`
- **Component styles**: `assets/css/components/` - Reusable component styles
- **Page styles**: `assets/css/pages/` - Page-specific styles

### JavaScript Organization
- **Core functionality**: `assets/js/main.js` and `assets/js/script.js`
- **Services**: `assets/js/services/` - API integrations and service layer
- **Page scripts**: `assets/js/pages/` - Page-specific functionality
- **Components**: Root level for shared component functionality

### Data Organization
- **Configuration**: `config/` - Site and application configuration
- **Data files**: `data/` - JSON data files and database schemas
- **Documentation**: `docs/` - Project documentation and changelogs

## Best Practices

1. **Separation of Concerns**: Files are organized by functionality and scope
2. **Modular Structure**: Related files are grouped together
3. **Clear Naming**: File and directory names clearly indicate their purpose
4. **Scalability**: Structure supports easy addition of new features
5. **Maintainability**: Logical organization makes code easy to find and modify

## File Dependencies

When updating file paths due to reorganization, ensure the following files are updated:
- HTML files that reference moved CSS/JS files
- JavaScript files that import/reference other JS files
- Any build scripts or deployment configurations

## Development Guidelines

- Place new component styles in `assets/css/components/`
- Place new page-specific styles in `assets/css/pages/`
- Place new service integrations in `assets/js/services/`
- Place new page-specific scripts in `assets/js/pages/`
- Update this documentation when adding new directories or changing structure
