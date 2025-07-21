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
                template: 'pages/shipping-policy.html'
            },
            'return-policy': {
                title: 'Return Policy | Firelight Duel Academy',
                description: 'Understand our return and refund policies for Yu-Gi-Oh! cards and merchandise.',
                template: 'pages/return-policy.html'
            },
            'faq': {
                title: 'FAQ | Firelight Duel Academy',
                description: 'Frequently asked questions about ordering, shipping, cards, and our services.',
                template: 'pages/faq.html'
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
        if (!hash) return null;
        
        const params = new URLSearchParams(hash);
        return params.get('page') || hash || null;
    }

    async loadPage(pageName, pushState = true, params = '') {
        if (!this.routes[pageName]) {
            console.error(`Page "${pageName}" not found`);
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
                const url = pageName === 'home' ? '#' : `#page=${pageName}${params}`;
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
        // Check if we have a template file for this page
        const route = this.routes[pageName];
        if (!route || !route.template) {
            throw new Error(`No template found for page: ${pageName}`);
        }

        // For product pages, generate dynamic content
        if (pageName === 'product') {
            return await this.generateProductContent(params);
        }

        // Try to fetch from template file first
        try {
            const response = await fetch(route.template);
            if (response.ok) {
                const content = await response.text();
                // Cache static content
                if (pageName !== 'product') {
                    this.pageCache.set(pageName, content);
                }
                return content;
            }
        } catch (error) {
            console.warn(`Failed to load template ${route.template}:`, error);
        }

        // Fallback to generated content
        return await this.generatePageContent(pageName, params);
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
                return await this.generateProductContent(params);
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
        return `
        <section style="text-align: center; padding: var(--space-20) 0; background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%); border-radius: var(--radius-2xl); color: white; margin-bottom: var(--space-12);">
            <div style="max-width: 800px; margin: 0 auto; padding: 0 var(--space-6);">
                <h1 style="font-size: 3.5rem; font-weight: 700; margin-bottom: var(--space-6); line-height: 1.1;">
                    Premium Yu-Gi-Oh! Singles
                </h1>
                <p style="font-size: 1.25rem; margin-bottom: var(--space-8); opacity: 0.9; line-height: 1.6;">
                    Discover the latest meta cards, competitive staples, and rare collectibles. 
                    Real-time pricing powered by YGOPRODeck API.
                </p>
                <div style="display: flex; gap: var(--space-4); justify-content: center; flex-wrap: wrap;">
                    <a href="#" onclick="navigateTo('singles')" style="padding: var(--space-4) var(--space-8); background: var(--secondary-color); color: var(--gray-900); text-decoration: none; border-radius: var(--radius-lg); font-weight: 600; transition: var(--transition-fast); text-transform: uppercase; letter-spacing: 0.05em;">
                        Browse Singles
                    </a>
                </div>
            </div>
        </section>

        <section style="margin-bottom: var(--space-16);">
            <div style="text-align: center; margin-bottom: var(--space-8);">
                <h2 style="font-size: 2.5rem; font-weight: 700; color: var(--gray-900); margin-bottom: var(--space-4);">
                    Meta Cards & Live Pricing
                </h2>
                <p style="font-size: 1.125rem; color: var(--gray-600); max-width: 600px; margin: 0 auto;">
                    Current competitive staples with real-time market data and price trends
                </p>
            </div>
            
            <div id="meta-cards-grid" class="modern-card-grid">
                <div class="loading-container">
                    <div class="loading-spinner"></div>
                    <p class="loading-text">Loading meta cards...</p>
                </div>
            </div>
        </section>
        `;
    }

    getSinglesContent() {
        return `
        <section style="text-align: center; margin-bottom: var(--space-12);">
            <h1 style="font-size: 3rem; font-weight: 700; color: var(--gray-900); margin-bottom: var(--space-4);">
                Yu-Gi-Oh! Single Cards
            </h1>
            <p style="font-size: 1.125rem; color: var(--gray-600); max-width: 600px; margin: 0 auto;">
                Browse our extensive collection of single cards with real-time pricing and advanced filtering
            </p>
        </section>

        <section class="filters-container">
            <div class="filters-grid">
                <div class="filter-group">
                    <label class="filter-label" for="card-name">Card Name</label>
                    <input type="text" id="card-name" class="filter-input" placeholder="Search by card name...">
                </div>
                <div class="filter-group">
                    <label class="filter-label" for="card-type">Type</label>
                    <select id="card-type" class="filter-select">
                        <option value="">All Types</option>
                        <option value="monster">Monster</option>
                        <option value="spell">Spell</option>
                        <option value="trap">Trap</option>
                    </select>
                </div>
                <div class="filter-group">
                    <button class="filter-btn" onclick="tcgStore.applyFilters()">Apply Filters</button>
                </div>
            </div>
        </section>

        <section>
            <div id="cards-grid" class="modern-card-grid">
                <div class="loading-container">
                    <div class="loading-spinner"></div>
                    <p class="loading-text">Loading cards...</p>
                </div>
            </div>
        </section>
        `;
    }

    getDecksContent() {
        return `
        <section style="text-align: center; margin-bottom: var(--space-8);">
            <h1 style="font-size: 3rem; font-weight: 700; color: var(--gray-900); margin-bottom: var(--space-4);">
                Deck Editor
            </h1>
            <p style="font-size: 1.125rem; color: var(--gray-600); max-width: 600px; margin: 0 auto;">
                Manage your decks, build new strategies, and explore popular deck lists
            </p>
        </section>

        <section style="margin-bottom: var(--space-8);">
            <div style="display: flex; justify-content: center; gap: var(--space-4); margin-bottom: var(--space-6); flex-wrap: wrap;">
                <button class="filter-btn active" onclick="showMyDecks()" id="my-decks-btn">My Decks</button>
                <button class="filter-btn" onclick="showDeckBuilder()" id="builder-btn">Deck Builder</button>
                <button class="filter-btn" onclick="showPopularDecks()" id="popular-btn">Popular Decks</button>
            </div>
        </section>

        <section id="my-decks-section" style="display: block;">
            <div id="user-decks-grid" class="deck-grid">
                <div class="loading-container">
                    <div class="loading-spinner"></div>
                    <p class="loading-text">Loading decks...</p>
                </div>
            </div>
        </section>

        <section id="deck-builder-section" style="display: none;">
            <div class="deck-builder-container">
                <p>Deck builder interface will be loaded here...</p>
            </div>
        </section>

        <section id="popular-decks-section" style="display: none;">
            <div class="popular-decks-container">
                <p>Popular decks will be loaded here...</p>
            </div>
        </section>
        `;
    }

    getEventsContent() {
        return `
        <section style="text-align: center; margin-bottom: var(--space-12);">
            <h1 style="font-size: 3rem; font-weight: 700; color: var(--gray-900); margin-bottom: var(--space-4);">
                Yu-Gi-Oh! Events & Tournaments
            </h1>
            <p style="font-size: 1.125rem; color: var(--gray-600); max-width: 600px; margin: 0 auto;">
                Join our competitive community and test your skills in weekly tournaments and special events
            </p>
        </section>
        `;
    }

    getAccountContent() {
        const currentUser = window.tcgStore ? window.tcgStore.currentUser : null;

        if (!currentUser) {
            return `
            <section style="text-align: center; margin-bottom: var(--space-16);">
                <div style="background: white; border-radius: var(--radius-2xl); box-shadow: var(--shadow-lg); padding: var(--space-16); border: 1px solid var(--gray-200); max-width: 600px; margin: 0 auto;">
                    <div style="font-size: 4rem; margin-bottom: var(--space-6); opacity: 0.7;">👤</div>
                    <h1 style="font-size: 2.5rem; font-weight: 700; color: var(--gray-900); margin-bottom: var(--space-4);">
                        Sign In Required
                    </h1>
                    <p style="font-size: 1.125rem; color: var(--gray-600); margin-bottom: var(--space-8); line-height: 1.6;">
                        Please sign in to access your account dashboard, view order history, and manage your wishlist.
                    </p>
                    <div style="display: flex; gap: var(--space-4); justify-content: center; flex-wrap: wrap;">
                        <button class="primary-btn" onclick="tcgStore.openLoginModal()" style="padding: var(--space-4) var(--space-8);">
                            Sign In
                        </button>
                        <button class="secondary-btn" onclick="tcgStore.openRegisterModal()" style="padding: var(--space-4) var(--space-8);">
                            Create Account
                        </button>
                    </div>
                </div>
            </section>
            `;
        }

        return `
        <section style="text-align: center; margin-bottom: var(--space-12);">
            <div style="background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%); border-radius: var(--radius-2xl); color: white; padding: var(--space-12); margin-bottom: var(--space-8);">
                <h1 style="font-size: 3rem; font-weight: 700; margin-bottom: var(--space-4);">
                    Welcome back, ${currentUser.firstName}!
                </h1>
                <p style="font-size: 1.125rem; opacity: 0.9;">
                    Member since ${new Date(currentUser.createdAt).toLocaleDateString()}
                </p>
            </div>
        </section>
        `;
    }

    async generateProductContent(params = '') {
        const urlParams = new URLSearchParams(params);
        const cardId = urlParams.get('id');

        if (!cardId) {
            return `
                <div class="loading-container">
                    <p class="loading-text" style="color: var(--error-color);">Card ID not provided. Please try again.</p>
                    <a href="#" onclick="navigateTo('singles')" style="padding: var(--space-3) var(--space-6); background: var(--primary-color); color: white; text-decoration: none; border-radius: var(--radius-md); font-weight: 600; margin-top: var(--space-4); display: inline-block;">Browse All Cards</a>
                </div>
            `;
        }

        try {
            let card = null;
            const apiBaseURL = 'https://db.ygoprodeck.com/api/v7';

            if (!isNaN(cardId)) {
                const response = await fetch(`${apiBaseURL}/cardinfo.php?id=${cardId}`);
                if (response.ok) {
                    const result = await response.json();
                    card = result.data ? result.data[0] : null;
                }
            } else {
                const cardName = cardId.replace(/-/g, ' ');
                const response = await fetch(`${apiBaseURL}/cardinfo.php?name=${encodeURIComponent(cardName)}`);
                if (response.ok) {
                    const result = await response.json();
                    card = result.data ? result.data[0] : null;
                }
            }

            if (!card) {
                return `
                    <div class="loading-container">
                        <p class="loading-text" style="color: var(--error-color);">Card not found in database. Card ID: ${cardId}</p>
                        <a href="#" onclick="navigateTo('singles')" style="padding: var(--space-3) var(--space-6); background: var(--primary-color); color: white; text-decoration: none; border-radius: var(--radius-md); font-weight: 600; margin-top: var(--space-4); display: inline-block;">Browse All Cards</a>
                    </div>
                `;
            }

            return this.generateProductHTML(card);

        } catch (error) {
            console.error('Error loading product:', error);
            return `
                <div class="loading-container">
                    <p class="loading-text" style="color: var(--error-color);">Error loading card: ${error.message}</p>
                    <a href="#" onclick="navigateTo('singles')" style="padding: var(--space-3) var(--space-6); background: var(--primary-color); color: white; text-decoration: none; border-radius: var(--radius-md); font-weight: 600; margin-top: var(--space-4); display: inline-block;">Browse All Cards</a>
                </div>
            `;
        }
    }

    generateProductHTML(card) {
        const image = card.card_images && card.card_images.length > 0 ? 
            card.card_images[0].image_url : 
            'https://images.ygoprodeck.com/images/cards/back.jpg';

        return `
        <div style="margin-bottom: var(--space-6);">
            <nav style="display: flex; align-items: center; gap: var(--space-2); font-size: 0.875rem; color: var(--gray-600);">
                <a href="#" onclick="navigateTo('home')" style="color: var(--primary-color); text-decoration: none;">Home</a>
                <span>›</span>
                <a href="#" onclick="navigateTo('singles')" style="color: var(--primary-color); text-decoration: none;">Singles</a>
                <span>›</span>
                <span>${card.name}</span>
            </nav>
        </div>

        <section style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-12); margin-bottom: var(--space-16);">
            <div>
                <div style="background: white; border-radius: var(--radius-xl); box-shadow: var(--shadow-lg); padding: var(--space-8); border: 1px solid var(--gray-200);">
                    <div id="image-container" class="product-image-container" style="max-width: 420px; width: 420px; height: 580px; margin: 0 auto; background: linear-gradient(135deg, var(--gray-100) 0%, var(--gray-200) 100%); border-radius: var(--radius-lg); overflow: hidden; margin-bottom: var(--space-4);">
                        <img id="main-card-image" class="product-card-image" src="${image}" alt="${card.name}" style="width: 400px; height: auto; max-width: 400px; object-fit: contain; padding: 10px; margin: 0 auto; display: block;">
                    </div>
                </div>
            </div>

            <div>
                <div style="background: white; border-radius: var(--radius-xl); box-shadow: var(--shadow-lg); padding: var(--space-8); border: 1px solid var(--gray-200);">
                    <div style="margin-bottom: var(--space-6);">
                        <h1 style="font-size: 2.5rem; font-weight: 700; color: var(--gray-900); margin-bottom: var(--space-3); line-height: 1.2;">${card.name}</h1>
                        <div style="display: flex; gap: var(--space-4); margin-bottom: var(--space-4);">
                            <span style="background: var(--primary-color); color: white; padding: var(--space-1) var(--space-3); border-radius: var(--radius-full); font-size: 0.875rem; font-weight: 600;">${card.type}</span>
                        </div>
                    </div>

                    <div style="background: var(--gray-50); border-radius: var(--radius-lg); padding: var(--space-6); margin-bottom: var(--space-6);">
                        <span style="font-size: 2rem; font-weight: 700; color: var(--primary-color);">$25.99</span>
                    </div>

                    <div style="margin-bottom: var(--space-6);">
                        <button style="width: 100%; padding: var(--space-4); background: var(--primary-color); color: white; border: none; border-radius: var(--radius-md); font-weight: 600; font-size: 1.125rem; cursor: pointer; transition: var(--transition-fast); text-transform: uppercase; letter-spacing: 0.05em;" onclick="addProductToCart('${card.name}', 25.99, '${image}')">
                            Add to Cart
                        </button>
                    </div>

                    <div>
                        <h3 style="font-size: 1.25rem; font-weight: 600; color: var(--gray-900); margin-bottom: var(--space-3);">Card Description</h3>
                        <p style="color: var(--gray-700); line-height: 1.6;">${card.desc || 'No description available.'}</p>
                    </div>
                </div>
            </div>
        </section>
        `;
    }

    getShippingPolicyContent() {
        return `
        <section style="text-align: center; margin-bottom: var(--space-12);">
            <h1 style="font-size: 3rem; font-weight: 700; color: var(--gray-900); margin-bottom: var(--space-4);">
                Shipping Policy
            </h1>
            <p style="font-size: 1.125rem; color: var(--gray-600); max-width: 600px; margin: 0 auto;">
                Fast, reliable shipping across Canada and the USA with competitive rates and tracking
            </p>
        </section>
        `;
    }

    getReturnPolicyContent() {
        return `
        <section style="text-align: center; margin-bottom: var(--space-12);">
            <h1 style="font-size: 3rem; font-weight: 700; color: var(--gray-900); margin-bottom: var(--space-4);">
                Return Policy
            </h1>
            <p style="font-size: 1.125rem; color: var(--gray-600); max-width: 600px; margin: 0 auto;">
                Your satisfaction is our priority. Learn about our flexible return and refund policies.
            </p>
        </section>
        `;
    }

    getFAQContent() {
        return `
        <section style="text-align: center; margin-bottom: var(--space-12);">
            <h1 style="font-size: 3rem; font-weight: 700; color: var(--gray-900); margin-bottom: var(--space-4);">
                Frequently Asked Questions
            </h1>
            <p style="font-size: 1.125rem; color: var(--gray-600); max-width: 600px; margin: 0 auto;">
                Find answers to common questions about ordering, shipping, cards, and our services.
            </p>
        </section>
        `;
    }

    showLoading() {
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="loading-container">
                    <div class="loading-spinner"></div>
                    <p class="loading-text">Loading...</p>
                </div>
            `;
        }
    }

    showError(message) {
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="loading-container">
                    <p class="loading-text" style="color: var(--error-color);">${message}</p>
                </div>
            `;
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
            const titleElement = document.getElementById('page-title');
            const descriptionElement = document.getElementById('page-description');
            const ogTitleElement = document.getElementById('og-title');
            const ogDescriptionElement = document.getElementById('og-description');

            if (titleElement) titleElement.textContent = route.title;
            if (descriptionElement) descriptionElement.setAttribute('content', route.description);
            if (ogTitleElement) ogTitleElement.setAttribute('content', route.title);
            if (ogDescriptionElement) ogDescriptionElement.setAttribute('content', route.description);
        }
    }

    updateNavigation(pageName) {
        // Remove active class from all nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Add active class to current page
        const activeLink = document.getElementById(`nav-${pageName}`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    executePageScript(pageName, params = '') {
        // Execute page-specific JavaScript based on the page
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
                this.initializeDecksPage();
                break;
            case 'product':
                this.initializeProductPage(params);
                break;
        }
    }

    initializeDecksPage() {
        // Initialize deck-specific functionality
        if (window.deckBuilder) {
            setTimeout(() => {
                this.loadUserDecks();
            }, 100);
        }
    }

    loadUserDecks() {
        const savedDecks = window.deckBuilder ? window.deckBuilder.getSavedDecks() : {};
        const container = document.getElementById('user-decks-grid');
        
        if (!container) return;
        
        if (Object.keys(savedDecks).length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: var(--space-12); color: var(--gray-500);">
                    <div style="font-size: 4rem; margin-bottom: var(--space-4);">🃏</div>
                    <h3 style="font-size: 1.5rem; font-weight: 600; margin-bottom: var(--space-3);">No Decks Yet</h3>
                    <p style="margin-bottom: var(--space-6);">Create your first deck to get started!</p>
                    <button class="primary-btn" onclick="createNewDeck()">Create New Deck</button>
                </div>
            `;
        } else {
            // Load deck cards here
            container.innerHTML = '<p>Your saved decks will appear here.</p>';
        }
    }

    async initializeProductPage(params) {
        // Initialize product-specific functionality
        const urlParams = new URLSearchParams(params);
        const cardId = urlParams.get('id');

        if (cardId && window.tcgStore) {
            try {
                // Load related cards or other product-specific features
                console.log('Initializing product page for card:', cardId);
            } catch (error) {
                console.error('Error initializing product page:', error);
            }
        }
    }
}

// Global navigation function
function navigateTo(page, params = '') {
    if (window.appRouter) {
        window.appRouter.loadPage(page, true, params);
    }
}

// Global deck functions
function showMyDecks() {
    document.getElementById('my-decks-section').style.display = 'block';
    document.getElementById('deck-builder-section').style.display = 'none';
    document.getElementById('popular-decks-section').style.display = 'none';
    
    document.getElementById('my-decks-btn').classList.add('active');
    document.getElementById('builder-btn').classList.remove('active');
    document.getElementById('popular-btn').classList.remove('active');
}

function showDeckBuilder() {
    document.getElementById('my-decks-section').style.display = 'none';
    document.getElementById('deck-builder-section').style.display = 'block';
    document.getElementById('popular-decks-section').style.display = 'none';
    
    document.getElementById('my-decks-btn').classList.remove('active');
    document.getElementById('builder-btn').classList.add('active');
    document.getElementById('popular-btn').classList.remove('active');
}

function showPopularDecks() {
    document.getElementById('my-decks-section').style.display = 'none';
    document.getElementById('deck-builder-section').style.display = 'none';
    document.getElementById('popular-decks-section').style.display = 'block';
    
    document.getElementById('my-decks-btn').classList.remove('active');
    document.getElementById('builder-btn').classList.remove('active');
    document.getElementById('popular-btn').classList.add('active');
}

function createNewDeck() {
    if (window.deckBuilder) {
        window.deckBuilder.newDeck();
        showDeckBuilder();
    }
}

// Initialize router when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.appRouter = new AppRouter();
});
