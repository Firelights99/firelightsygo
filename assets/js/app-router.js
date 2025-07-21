/**
 * Single Page Application Router
 * Handles dynamic page loading within the skeleton layout
 */

class AppRouter {
    constructor() {
        this.currentPage = null;
        this.pageCache = new Map();
        this.routes = {
            'home': {
                title: 'Firelight Duel Academy | Modern Yu-Gi-Oh! TCG Store',
                description: 'Your premier destination for Yu-Gi-Oh! single cards, competitive play, and tournament events.',
                template: 'templates/home.html'
            },
            'singles': {
                title: 'Singles | Firelight Duel Academy - Yu-Gi-Oh! Single Cards',
                description: 'Browse our extensive collection of Yu-Gi-Oh! single cards. Find meta cards, staples, and rare collectibles.',
                template: 'templates/singles.html'
            },
            'decks': {
                title: 'Popular Decks | Firelight Duel Academy - Yu-Gi-Oh! Deck Lists',
                description: 'Explore popular Yu-Gi-Oh! deck lists and strategies. Find meta decks, budget builds, and competitive tournament lists.',
                template: 'templates/decks.html'
            },
            'events': {
                title: 'Events | Firelight Duel Academy - Yu-Gi-Oh! Tournaments',
                description: 'Join our Yu-Gi-Oh! tournaments and events. Weekly locals, special events, and competitive play.',
                template: 'templates/events.html'
            },
            'account': {
                title: 'Account | Firelight Duel Academy - My Account',
                description: 'Manage your account, view order history, and update your preferences.',
                template: 'templates/account.html'
            },
            'product': {
                title: 'Product | Firelight Duel Academy',
                description: 'View detailed information about Yu-Gi-Oh! cards.',
                template: 'templates/product.html'
            },
            'shipping-policy': {
                title: 'Shipping Policy | Firelight Duel Academy',
                description: 'Learn about our shipping rates, delivery times, and policies for Canada and USA.',
                template: 'templates/shipping-policy.html'
            },
            'return-policy': {
                title: 'Return Policy | Firelight Duel Academy',
                description: 'Understand our return and refund policies for Yu-Gi-Oh! cards and merchandise.',
                template: 'templates/return-policy.html'
            },
            'faq': {
                title: 'FAQ | Firelight Duel Academy',
                description: 'Frequently asked questions about ordering, shipping, cards, and our services.',
                template: 'templates/faq.html'
            }
        };
        
        this.init();
    }

    init() {
        // Handle browser back/forward buttons
        window.addEventListener('popstate', (event) => {
            const page = event.state?.page || 'home';
            this.loadPage(page, false);
        });

        // Load initial page based on URL hash or default to home
        const initialPage = this.getPageFromURL() || 'home';
        this.loadPage(initialPage, true);
    }

    getPageFromURL() {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        return params.get('page') || hash || null;
    }

    async loadPage(pageName, pushState = true, params = '') {
        if (!this.routes[pageName]) {
            console.error('Page "' + pageName + '" not found');
            pageName = 'home';
        }

        // Show loading state
        this.showLoading();

        try {
            // Load page content
            const content = await this.fetchPageContent(pageName, params);
            
            // Update page
            this.renderPage(content);
            this.updateMetadata(pageName);
            this.updateNavigation(pageName);
            
            // Update URL
            if (pushState) {
                const url = pageName === 'home' ? '#' : '#page=' + pageName + params;
                history.pushState({ page: pageName, params: params }, '', url);
            }
            
            // Execute page-specific JavaScript
            this.executePageScript(pageName, params);
            
            this.currentPage = pageName;
            
        } catch (error) {
            console.error('Error loading page:', error);
            this.showError('Failed to load page. Please try again.');
        }
    }

    async fetchPageContent(pageName, params = '') {
        // Don't cache product pages as they have dynamic content
        if (pageName === 'product') {
            return await this.generatePageContent(pageName, params);
        }

        // Check cache first for other pages
        if (this.pageCache.has(pageName)) {
            return this.pageCache.get(pageName);
        }

        // For now, we'll generate content dynamically
        const content = await this.generatePageContent(pageName, params);
        
        // Cache the content
        this.pageCache.set(pageName, content);
        
        return content;
    }

    async generatePageContent(pageName, params = '') {
        switch (pageName) {
            case 'home':
                return this.getHomeContent();
            case 'singles':
                return this.getSinglesContent();
            case 'decks':
                return this.getDecksContent();
            case 'events':
                return this.getEventsContent();
            case 'account':
                return this.getAccountContent();
            case 'product':
                return await this.getProductContent(params);
            case 'shipping-policy':
                return this.getShippingPolicyContent();
            case 'return-policy':
                return this.getReturnPolicyContent();
            case 'faq':
                return this.getFAQContent();
            default:
                return this.getHomeContent();
        }
    }

    getHomeContent() {
        return '<section style="text-align: center; padding: var(--space-20) 0; background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%); border-radius: var(--radius-2xl); color: white; margin-bottom: var(--space-12);"><div style="max-width: 800px; margin: 0 auto; padding: 0 var(--space-6);"><h1 style="font-size: 3.5rem; font-weight: 700; margin-bottom: var(--space-6); line-height: 1.1;">Premium Yu-Gi-Oh! Singles</h1><p style="font-size: 1.25rem; margin-bottom: var(--space-8); opacity: 0.9; line-height: 1.6;">Discover the latest meta cards, competitive staples, and rare collectibles. Real-time pricing powered by YGOPRODeck API.</p><div style="display: flex; gap: var(--space-4); justify-content: center; flex-wrap: wrap;"><a href="#" onclick="navigateTo(\'singles\')" style="padding: var(--space-4) var(--space-8); background: var(--secondary-color); color: var(--gray-900); text-decoration: none; border-radius: var(--radius-lg); font-weight: 600; transition: var(--transition-fast); text-transform: uppercase; letter-spacing: 0.05em;">Browse Singles</a></div></div></section><section style="margin-bottom: var(--space-16);"><div style="text-align: center; margin-bottom: var(--space-8);"><h2 style="font-size: 2.5rem; font-weight: 700; color: var(--gray-900); margin-bottom: var(--space-4);">Meta Cards & Live Pricing</h2><p style="font-size: 1.125rem; color: var(--gray-600); max-width: 600px; margin: 0 auto;">Current competitive staples with real-time market data and price trends</p></div><div id="meta-cards-grid" class="modern-card-grid"><div class="loading-container"><div class="loading-spinner"></div><p class="loading-text">Loading meta cards...</p></div></div></section>';
    }

    getSinglesContent() {
        return '<section style="text-align: center; margin-bottom: var(--space-12);"><h1 style="font-size: 3rem; font-weight: 700; color: var(--gray-900); margin-bottom: var(--space-4);">Yu-Gi-Oh! Single Cards</h1><p style="font-size: 1.125rem; color: var(--gray-600); max-width: 600px; margin: 0 auto;">Browse our extensive collection of single cards with real-time pricing and advanced filtering</p></section><section class="filters-container"><div class="filters-grid"><div class="filter-group"><label class="filter-label" for="card-name">Card Name</label><input type="text" id="card-name" class="filter-input" placeholder="Search by card name..."></div><div class="filter-group"><label class="filter-label" for="card-type">Type</label><select id="card-type" class="filter-select"><option value="">All Types</option><option value="monster">Monster</option><option value="spell">Spell</option><option value="trap">Trap</option></select></div><div class="filter-group"><button class="filter-btn" onclick="tcgStore.applyFilters()">Apply Filters</button></div></div></section><section><div id="cards-grid" class="modern-card-grid"><div class="loading-container"><div class="loading-spinner"></div><p class="loading-text">Loading cards...</p></div></div></section>';
    }

    getDecksContent() {
        return '<section style="text-align: center; margin-bottom: var(--space-8);"><h1 style="font-size: 3rem; font-weight: 700; color: var(--gray-900); margin-bottom: var(--space-4);">Deck Editor</h1><p style="font-size: 1.125rem; color: var(--gray-600); max-width: 600px; margin: 0 auto;">Manage your decks, build new strategies, and explore popular deck lists</p></section><section style="margin-bottom: var(--space-8);"><div style="display: flex; justify-content: center; gap: var(--space-4); margin-bottom: var(--space-6); flex-wrap: wrap;"><button class="filter-btn active" onclick="showMyDecks()" id="my-decks-btn">My Decks</button><button class="filter-btn" onclick="showDeckBuilder()" id="builder-btn">Deck Builder</button><button class="filter-btn" onclick="showPopularDecks()" id="popular-btn">Popular Decks</button></div></section><section id="my-decks-section" style="display: block;"><div id="user-decks-grid" class="deck-grid"></div></section>';
    }

    getEventsContent() {
        return '<section style="text-align: center; margin-bottom: var(--space-12);"><h1 style="font-size: 3rem; font-weight: 700; color: var(--gray-900); margin-bottom: var(--space-4);">Yu-Gi-Oh! Events & Tournaments</h1><p style="font-size: 1.125rem; color: var(--gray-600); max-width: 600px; margin: 0 auto;">Join our competitive community and test your skills in weekly tournaments and special events</p></section>';
    }

    getAccountContent() {
        const currentUser = window.tcgStore ? window.tcgStore.currentUser : null;
        
        if (!currentUser) {
            return '<section style="text-align: center; margin-bottom: var(--space-16);"><div style="background: white; border-radius: var(--radius-2xl); box-shadow: var(--shadow-lg); padding: var(--space-16); border: 1px solid var(--gray-200); max-width: 600px; margin: 0 auto;"><div style="font-size: 4rem; margin-bottom: var(--space-6); opacity: 0.7;">👤</div><h1 style="font-size: 2.5rem; font-weight: 700; color: var(--gray-900); margin-bottom: var(--space-4);">Sign In Required</h1><p style="font-size: 1.125rem; color: var(--gray-600); margin-bottom: var(--space-8); line-height: 1.6;">Please sign in to access your account dashboard, view order history, and manage your wishlist.</p><div style="display: flex; gap: var(--space-4); justify-content: center; flex-wrap: wrap;"><button class="primary-btn" onclick="tcgStore.openLoginModal()" style="padding: var(--space-4) var(--space-8);">Sign In</button><button class="secondary-btn" onclick="tcgStore.openRegisterModal()" style="padding: var(--space-4) var(--space-8);">Create Account</button></div></div></section>';
        }
        
        return '<section style="text-align: center; margin-bottom: var(--space-12);"><div style="background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%); border-radius: var(--radius-2xl); color: white; padding: var(--space-12); margin-bottom: var(--space-8);"><h1 style="font-size: 3rem; font-weight: 700; margin-bottom: var(--space-4);">Welcome back, ' + currentUser.firstName + '!</h1><p style="font-size: 1.125rem; opacity: 0.9;">Member since ' + new Date(currentUser.createdAt).toLocaleDateString() + '</p></div></section>';
    }

    async getProductContent(params = '') {
        const urlParams = new URLSearchParams(params);
        const cardId = urlParams.get('id');
        
        if (!cardId) {
            return '<div class="loading-container"><p class="loading-text" style="color: var(--error-color);">Card ID not provided. Please try again.</p></div>';
        }

        try {
            let card = null;
            const apiBaseURL = 'https://db.ygoprodeck.com/api/v7';
            
            if (!isNaN(cardId)) {
                const response = await fetch(apiBaseURL + '/cardinfo.php?id=' + cardId);
                if (response.ok) {
                    const result = await response.json();
                    card = result.data ? result.data[0] : null;
                }
            } else {
                const cardName = cardId.replace(/-/g, ' ');
                const response = await fetch(apiBaseURL + '/cardinfo.php?name=' + encodeURIComponent(cardName));
                if (response.ok) {
                    const result = await response.json();
                    card = result.data ? result.data[0] : null;
                }
            }

            if (!card) {
                return '<div class="loading-container"><p class="loading-text" style="color: var(--error-color);">Card not found in database.</p></div>';
            }

            return this.generateProductHTML(card);

        } catch (error) {
            console.error('Error loading product:', error);
            return '<div class="loading-container"><p class="loading-text" style="color: var(--error-color);">Error loading card: ' + error.message + '</p></div>';
        }
    }

    generateProductHTML(card) {
        const imageUrl = card.card_images && card.card_images.length > 0 ? card.card_images[0].image_url : 'https://images.ygoprodeck.com/images/cards/back.jpg';
        
        return '<section style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-12); margin-bottom: var(--space-16);"><div><div style="background: white; border-radius: var(--radius-xl); box-shadow: var(--shadow-lg); padding: var(--space-8); border: 1px solid var(--gray-200);"><div style="aspect-ratio: 3/4; background: linear-gradient(135deg, var(--gray-100) 0%, var(--gray-200) 100%); border-radius: var(--radius-lg); overflow: hidden; margin-bottom: var(--space-4);"><img src="' + imageUrl + '" alt="' + card.name + '" style="width: 100%; height: 100%; object-fit: contain; padding: var(--space-2);"></div></div></div><div><div style="background: white; border-radius: var(--radius-xl); box-shadow: var(--shadow-lg); padding: var(--space-8); border: 1px solid var(--gray-200);"><h1 style="font-size: 2.5rem; font-weight: 700; color: var(--gray-900); margin-bottom: var(--space-6);">' + card.name + '</h1><p style="color: var(--gray-700); line-height: 1.6;">' + (card.desc || 'No description available.') + '</p></div></div></section>';
    }

    getShippingPolicyContent() {
        return '<section style="text-align: center; margin-bottom: var(--space-12);"><h1 style="font-size: 3rem; font-weight: 700; color: var(--gray-900); margin-bottom: var(--space-4);">Shipping Policy</h1><p style="font-size: 1.125rem; color: var(--gray-600);">Fast, reliable shipping across Canada and the USA</p></section>';
    }

    getReturnPolicyContent() {
        return '<section style="text-align: center; margin-bottom: var(--space-12);"><h1 style="font-size: 3rem; font-weight: 700; color: var(--gray-900); margin-bottom: var(--space-4);">Return Policy</h1><p style="font-size: 1.125rem; color: var(--gray-600);">Your satisfaction is our priority</p></section>';
    }

    getFAQContent() {
        return '<section style="text-align: center; margin-bottom: var(--space-12);"><h1 style="font-size: 3rem; font-weight: 700; color: var(--gray-900); margin-bottom: var(--space-4);">Frequently Asked Questions</h1><p style="font-size: 1.125rem; color: var(--gray-600);">Find answers to common questions</p></section>';
    }

    showLoading() {
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.innerHTML = '<div class="loading-container"><div class="loading-spinner"></div><p class="loading-text">Loading...</p></div>';
        }
    }

    showError(message) {
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.innerHTML = '<div class="loading-container"><p class="loading-text" style="color: var(--error-color);">' + message + '</p></div>';
        }
    }

    renderPage(content) {
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.innerHTML = content;
        }
    }

    updateMetadata(pageName) {
        const route = this.routes[pageName];
        if (route) {
            document.getElementById('page-title').textContent = route.title;
            document.getElementById('page-description').setAttribute('content', route.description);
            document.getElementById('og-title').setAttribute('content', route.title);
            document.getElementById('og-description').setAttribute('content', route.description);
        }
    }

    updateNavigation(pageName) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        const activeLink = document.getElementById('nav-' + pageName);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    executePageScript(pageName, params = '') {
        switch (pageName) {
            case 'home':
                if (window.tcgStore) {
                    window.tcgStore.loadInitialData();
                }
                break;
            case 'singles':
                if (window.tcgStore) {
                    window.tcgStore.loadInitialData();
                }
                break;
            case 'decks':
                this.initializeDeckFunctions();
                break;
        }
    }

    initializeDeckFunctions() {
        if (!window.deckBuilder) {
            window.deckBuilder = new DeckBuilderService();
        }
        
        window.showMyDecks = function() {
            console.log('showMyDecks called');
        };

        window.showDeckBuilder = function() {
            console.log('showDeckBuilder called');
        };

        window.showPopularDecks = function() {
            console.log('showPopularDecks called');
        };
    }
}

// Global navigation function
function navigateTo(page, params = '') {
    if (window.appRouter) {
        window.appRouter.loadPage(page, true, params);
    }
}

// Initialize router when DOM is loaded, but wait for other scripts
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (!window.appRouter) {
            window.appRouter = new AppRouter();
        }
    }, 100);
});

// Also provide a manual initialization function
window.initializeAppRouter = function() {
    if (!window.appRouter) {
        window.appRouter = new AppRouter();
    }
};
