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
        console.log('AppRouter initializing...'); // Debug log
        
        // Handle browser back/forward buttons
        window.addEventListener('popstate', (event) => {
            const page = event.state?.page || 'home';
            this.loadPage(page, false);
        });

        // Load initial page based on URL hash or default to home
        const initialPage = this.getPageFromURL() || 'home';
        console.log('Loading initial page:', initialPage); // Debug log
        this.loadPage(initialPage, true);
    }

    getPageFromURL() {
        const hash = window.location.hash.substring(1);
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
        // Don't cache product pages as they have dynamic content
        if (pageName === 'product') {
            return await this.generatePageContent(pageName, params);
        }

        // Check cache first for other pages
        if (this.pageCache.has(pageName)) {
            return this.pageCache.get(pageName);
        }

        // For now, we'll generate content dynamically
        // In a real implementation, you'd fetch from templates/
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
        return `
        <!-- Hero Section -->
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

        <!-- Featured Meta Cards -->
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

        <!-- Quick Categories -->
        <section style="margin-bottom: var(--space-16);">
            <div style="text-align: center; margin-bottom: var(--space-8);">
                <h2 style="font-size: 2.5rem; font-weight: 700; color: var(--gray-900); margin-bottom: var(--space-4);">
                    Popular Categories
                </h2>
                <p style="font-size: 1.125rem; color: var(--gray-600);">
                    Explore our most sought-after card categories
                </p>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: var(--space-6);">
                <a href="#" onclick="navigateTo('singles', '?archetype=Snake-Eye')" style="background: white; border-radius: var(--radius-xl); box-shadow: var(--shadow-md); overflow: hidden; text-decoration: none; transition: var(--transition-normal); border: 1px solid var(--gray-200);" class="interactive-hover">
                    <div style="aspect-ratio: 16/9; background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%); display: flex; align-items: center; justify-content: center;">
                        <span style="font-size: 3rem;">🔥</span>
                    </div>
                    <div style="padding: var(--space-5);">
                        <h3 style="font-size: 1.25rem; font-weight: 600; color: var(--gray-900); margin-bottom: var(--space-2);">Snake-Eye</h3>
                        <p style="color: var(--gray-600); font-size: 0.875rem;">Latest meta archetype dominating tournaments</p>
                    </div>
                </a>
                
                <a href="#" onclick="navigateTo('singles', '?archetype=Kashtira')" style="background: white; border-radius: var(--radius-xl); box-shadow: var(--shadow-md); overflow: hidden; text-decoration: none; transition: var(--transition-normal); border: 1px solid var(--gray-200);" class="interactive-hover">
                    <div style="aspect-ratio: 16/9; background: linear-gradient(135deg, var(--accent-color) 0%, var(--accent-dark) 100%); display: flex; align-items: center; justify-content: center;">
                        <span style="font-size: 3rem;">⚡</span>
                    </div>
                    <div style="padding: var(--space-5);">
                        <h3 style="font-size: 1.25rem; font-weight: 600; color: var(--gray-900); margin-bottom: var(--space-2);">Kashtira</h3>
                        <p style="color: var(--gray-600); font-size: 0.875rem;">Powerful banish-based strategy</p>
                    </div>
                </a>
                
                <a href="#" onclick="navigateTo('singles', '?category=Hand-Traps')" style="background: white; border-radius: var(--radius-xl); box-shadow: var(--shadow-md); overflow: hidden; text-decoration: none; transition: var(--transition-normal); border: 1px solid var(--gray-200);" class="interactive-hover">
                    <div style="aspect-ratio: 16/9; background: linear-gradient(135deg, var(--secondary-color) 0%, var(--secondary-dark) 100%); display: flex; align-items: center; justify-content: center;">
                        <span style="font-size: 3rem;">🛡️</span>
                    </div>
                    <div style="padding: var(--space-5);">
                        <h3 style="font-size: 1.25rem; font-weight: 600; color: var(--gray-900); margin-bottom: var(--space-2);">Hand Traps</h3>
                        <p style="color: var(--gray-600); font-size: 0.875rem;">Essential competitive staples</p>
                    </div>
                </a>
                
                <a href="#" onclick="navigateTo('singles', '?filter=classic')" style="background: white; border-radius: var(--radius-xl); box-shadow: var(--shadow-md); overflow: hidden; text-decoration: none; transition: var(--transition-normal); border: 1px solid var(--gray-200);" class="interactive-hover">
                    <div style="aspect-ratio: 16/9; background: linear-gradient(135deg, var(--gray-600) 0%, var(--gray-700) 100%); display: flex; align-items: center; justify-content: center;">
                        <span style="font-size: 3rem;">⭐</span>
                    </div>
                    <div style="padding: var(--space-5);">
                        <h3 style="font-size: 1.25rem; font-weight: 600; color: var(--gray-900); margin-bottom: var(--space-2);">Classic Cards</h3>
                        <p style="color: var(--gray-600); font-size: 0.875rem;">Nostalgic favorites and iconic monsters</p>
                    </div>
                </a>
            </div>
        </section>

        <!-- Store Features -->
        <section style="background: white; border-radius: var(--radius-2xl); box-shadow: var(--shadow-lg); padding: var(--space-12); margin-bottom: var(--space-16); border: 1px solid var(--gray-200);">
            <div style="text-align: center; margin-bottom: var(--space-10);">
                <h2 style="font-size: 2.5rem; font-weight: 700; color: var(--gray-900); margin-bottom: var(--space-4);">
                    Why Choose Firelight Duel Academy?
                </h2>
                <p style="font-size: 1.125rem; color: var(--gray-600); max-width: 600px; margin: 0 auto;">
                    Experience the future of Yu-Gi-Oh! card shopping with our modern platform
                </p>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: var(--space-8);">
                <div style="text-align: center; padding: var(--space-6);">
                    <div style="width: 80px; height: 80px; background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%); border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; margin: 0 auto var(--space-4); font-size: 2rem;">
                        🚀
                    </div>
                    <h3 style="font-size: 1.5rem; font-weight: 600; color: var(--gray-900); margin-bottom: var(--space-3);">Real-Time Pricing</h3>
                    <p style="color: var(--gray-600); line-height: 1.6;">Live market data powered by YGOPRODeck API ensures you always get competitive prices on every card.</p>
                </div>
                
                <div style="text-align: center; padding: var(--space-6);">
                    <div style="width: 80px; height: 80px; background: linear-gradient(135deg, var(--secondary-color) 0%, var(--secondary-dark) 100%); border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; margin: 0 auto var(--space-4); font-size: 2rem;">
                        ⚡
                    </div>
                    <h3 style="font-size: 1.5rem; font-weight: 600; color: var(--gray-900); margin-bottom: var(--space-3);">Lightning Fast</h3>
                    <p style="color: var(--gray-600); line-height: 1.6;">Modern interface with instant search, advanced filtering, and seamless card browsing experience.</p>
                </div>
            </div>
        </section>

        <!-- Call to Action -->
        <section style="text-align: center; padding: var(--space-16) var(--space-6); background: linear-gradient(135deg, var(--gray-900) 0%, var(--gray-800) 100%); border-radius: var(--radius-2xl); color: white;">
            <h2 style="font-size: 2.5rem; font-weight: 700; margin-bottom: var(--space-4);">
                Ready to Duel?
            </h2>
            <p style="font-size: 1.125rem; margin-bottom: var(--space-8); opacity: 0.9; max-width: 500px; margin-left: auto; margin-right: auto;">
                Join thousands of duelists who trust Firelight Duel Academy for their Yu-Gi-Oh! needs.
            </p>
            <div style="display: flex; gap: var(--space-4); justify-content: center; flex-wrap: wrap;">
                <a href="#" onclick="navigateTo('singles')" style="padding: var(--space-4) var(--space-8); background: var(--primary-color); color: white; text-decoration: none; border-radius: var(--radius-lg); font-weight: 600; transition: var(--transition-fast); text-transform: uppercase; letter-spacing: 0.05em;">
                    Start Shopping
                </a>
            </div>
        </section>
        `;
    }

    getSinglesContent() {
        return `
        <!-- Page Header -->
        <section style="text-align: center; margin-bottom: var(--space-12);">
            <h1 style="font-size: 3rem; font-weight: 700; color: var(--gray-900); margin-bottom: var(--space-4);">
                Yu-Gi-Oh! Single Cards
            </h1>
            <p style="font-size: 1.125rem; color: var(--gray-600); max-width: 600px; margin: 0 auto;">
                Browse our extensive collection of single cards with real-time pricing and advanced filtering
            </p>
        </section>

        <!-- Modern Filters -->
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
                    <label class="filter-label" for="rarity">Rarity</label>
                    <select id="rarity" class="filter-select">
                        <option value="">All Rarities</option>
                        <option value="common">Common</option>
                        <option value="rare">Rare</option>
                        <option value="super">Super Rare</option>
                        <option value="ultra">Ultra Rare</option>
                        <option value="secret">Secret Rare</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label class="filter-label" for="price-range">Price Range</label>
                    <select id="price-range" class="filter-select">
                        <option value="">All Prices</option>
                        <option value="0-5">$0 - $5</option>
                        <option value="5-15">$5 - $15</option>
                        <option value="15-50">$15 - $50</option>
                        <option value="50+">$50+</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label class="filter-label" for="sort-by">Sort By</label>
                    <select id="sort-by" class="filter-select">
                        <option value="name">Name A-Z</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="newest">Newest First</option>
                    </select>
                </div>
                <div class="filter-group">
                    <button class="filter-btn" onclick="tcgStore.applyFilters()">Apply Filters</button>
                </div>
            </div>
        </section>

        <!-- Cards Grid -->
        <section>
            <div id="cards-grid" class="modern-card-grid">
                <div class="loading-container">
                    <div class="loading-spinner"></div>
                    <p class="loading-text">Loading cards...</p>
                </div>
            </div>

            <!-- Pagination -->
            <div class="pagination-container">
                <button class="pagination-btn" disabled>Previous</button>
                <span class="pagination-info">Page 1 of 1</span>
                <button class="pagination-btn" disabled>Next</button>
            </div>
        </section>
        `;
    }

    getDecksContent() {
        return `
        <!-- Page Header -->
        <section style="text-align: center; margin-bottom: var(--space-8);">
            <h1 style="font-size: 3rem; font-weight: 700; color: var(--gray-900); margin-bottom: var(--space-4);">
                Deck Editor
            </h1>
            <p style="font-size: 1.125rem; color: var(--gray-600); max-width: 600px; margin: 0 auto;">
                Manage your decks, build new strategies, and explore popular deck lists
            </p>
        </section>

        <!-- Deck Management Actions -->
        <section style="margin-bottom: var(--space-8);">
            <div style="display: flex; justify-content: center; gap: var(--space-4); margin-bottom: var(--space-6); flex-wrap: wrap;">
                <button class="filter-btn active" onclick="showMyDecks()" id="my-decks-btn">My Decks</button>
                <button class="filter-btn" onclick="showDeckBuilder()" id="builder-btn">Deck Builder</button>
                <button class="filter-btn" onclick="showPopularDecks()" id="popular-btn">Popular Decks</button>
            </div>
            
            <!-- Quick Actions -->
            <div style="display: flex; justify-content: center; gap: var(--space-3); margin-bottom: var(--space-6); flex-wrap: wrap;">
                <button class="primary-btn" onclick="createNewDeck()" style="padding: var(--space-3) var(--space-6);">
                    <span style="margin-right: var(--space-2);">➕</span> New Deck
                </button>
                <button class="secondary-btn" onclick="importDeck()" style="padding: var(--space-3) var(--space-6);">
                    <span style="margin-right: var(--space-2);">📁</span> Import Deck
                </button>
                <button class="secondary-btn" onclick="showDeckTemplates()" style="padding: var(--space-3) var(--space-6);">
                    <span style="margin-right: var(--space-2);">📋</span> Templates
                </button>
            </div>
        </section>

        <!-- My Decks Section -->
        <section id="my-decks-section" style="display: block;">
            <div style="background: white; border-radius: var(--radius-2xl); box-shadow: var(--shadow-lg); padding: var(--space-8); border: 1px solid var(--gray-200); margin-bottom: var(--space-8);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-6);">
                    <h2 style="font-size: 2rem; font-weight: 700; color: var(--gray-900);">My Decks</h2>
                    <div style="display: flex; gap: var(--space-3);">
                        <select id="deck-sort" style="padding: var(--space-2) var(--space-3); border: 1px solid var(--gray-300); border-radius: var(--radius-md);" onchange="sortDecks()">
                            <option value="updated">Last Modified</option>
                            <option value="created">Date Created</option>
                            <option value="name">Name A-Z</option>
                        </select>
                        <button class="secondary-btn" onclick="refreshDeckList()" style="padding: var(--space-2) var(--space-3);">
                            🔄 Refresh
                        </button>
                    </div>
                </div>
                
                <div id="user-decks-grid" class="deck-grid">
                    <!-- Decks will be loaded here -->
                </div>
            </div>
        </section>

        <!-- Deck Builder Interface -->
        <section id="deck-builder-section" style="display: none;">
            <div style="text-align: center; padding: var(--space-12); color: var(--gray-500);">
                <div style="font-size: 4rem; margin-bottom: var(--space-4);">🃏</div>
                <h3 style="font-size: 1.5rem; font-weight: 600; margin-bottom: var(--space-3);">Deck Builder Coming Soon</h3>
                <p>Advanced deck building tools are in development!</p>
            </div>
        </section>

        <!-- Popular Decks Section -->
        <section id="popular-decks-section" style="display: none;">
            <div style="background: white; border-radius: var(--radius-2xl); box-shadow: var(--shadow-lg); padding: var(--space-8); border: 1px solid var(--gray-200);">
                <h2 style="font-size: 2rem; font-weight: 700; color: var(--gray-900); margin-bottom: var(--space-6);">🃏 Popular Deck Lists</h2>
                
                <div id="templates-container">
                    <div style="text-align: center; padding: var(--space-12); color: var(--gray-500);">
                        <div style="font-size: 4rem; margin-bottom: var(--space-4);">📋</div>
                        <h3 style="font-size: 1.5rem; font-weight: 600; margin-bottom: var(--space-3);">Deck Templates Coming Soon</h3>
                        <p>Popular tournament-winning deck lists will be available here!</p>
                    </div>
                </div>
            </div>
        </section>
        `;
    }

    getEventsContent() {
        return `
        <!-- Page Header -->
        <section style="text-align: center; margin-bottom: var(--space-12);">
            <h1 style="font-size: 3rem; font-weight: 700; color: var(--gray-900); margin-bottom: var(--space-4);">
                Yu-Gi-Oh! Events & Tournaments
            </h1>
            <p style="font-size: 1.125rem; color: var(--gray-600); max-width: 600px; margin: 0 auto;">
                Join our competitive community and test your skills in weekly tournaments and special events
            </p>
        </section>

        <!-- Coming Soon -->
        <section style="text-align: center; padding: var(--space-16); background: white; border-radius: var(--radius-2xl); box-shadow: var(--shadow-lg); border: 1px solid var(--gray-200);">
            <div style="font-size: 4rem; margin-bottom: var(--space-6);">🏆</div>
            <h2 style="font-size: 2.5rem; font-weight: 700; color: var(--gray-900); margin-bottom: var(--space-4);">
                Events Coming Soon
            </h2>
            <p style="font-size: 1.125rem; color: var(--gray-600); max-width: 500px; margin: 0 auto var(--space-8);">
                We're working on bringing you exciting Yu-Gi-Oh! tournaments and events. Stay tuned for updates!
            </p>
            <a href="#" onclick="navigateTo('singles')" style="padding: var(--space-4) var(--space-8); background: var(--primary-color); color: white; text-decoration: none; border-radius: var(--radius-lg); font-weight: 600; transition: var(--transition-fast);">
                Browse Cards Instead
            </a>
        </section>
        `;
    }

    getAccountContent() {
        // Check if user is logged in
        const currentUser = window.tcgStore ? window.tcgStore.currentUser : null;
        
        if (!currentUser) {
            return this.getLoginPromptContent();
        }
        
        return this.getLoggedInAccountContent(currentUser);
    }

    getLoginPromptContent() {
        return `
        <!-- Login Prompt -->
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

    getLoggedInAccountContent(user) {
        return `
        <!-- Account Dashboard -->
        <section style="text-align: center; margin-bottom: var(--space-16);">
            <div style="background: white; border-radius: var(--radius-2xl); box-shadow: var(--shadow-lg); padding: var(--space-16); border: 1px solid var(--gray-200);">
                <h1 style="font-size: 2.5rem; font-weight: 700; color: var(--gray-900); margin-bottom: var(--space-4);">
                    Welcome, ${user.firstName || 'User'}!
                </h1>
                <p style="font-size: 1.125rem; color: var(--gray-600); margin-bottom: var(--space-8);">
                    Manage your account and view your order history
                </p>
                <button class="primary-btn" onclick="tcgStore.logout()" style="padding: var(--space-4) var(--space-8);">
                    Sign Out
                </button>
            </div>
        </section>
        `;
    }

    async getProductContent(params = '') {
        return `
        <!-- Product Page -->
        <section style="text-align: center; margin-bottom: var(--space-16);">
            <div style="background: white; border-radius: var(--radius-2xl); box-shadow: var(--shadow-lg); padding: var(--space-16); border: 1px solid var(--gray-200);">
                <h1 style="font-size: 2.5rem; font-weight: 700; color: var(--gray-900); margin-bottom: var(--space-4);">
                    Product Details
                </h1>
                <p style="font-size: 1.125rem; color: var(--gray-600);">
                    Product information will be displayed here
                </p>
            </div>
        </section>
        `;
    }

    getShippingPolicyContent() {
        return `
        <!-- Shipping Policy -->
        <section style="text-align: center; margin-bottom: var(--space-16);">
            <div style="background: white; border-radius: var(--radius-2xl); box-shadow: var(--shadow-lg); padding: var(--space-16); border: 1px solid var(--gray-200);">
                <h1 style="font-size: 2.5rem; font-weight: 700; color: var(--gray-900); margin-bottom: var(--space-4);">
                    Shipping Policy
                </h1>
                <p style="font-size: 1.125rem; color: var(--gray-600);">
                    Our shipping policy information will be displayed here
                </p>
            </div>
        </section>
        `;
    }

    getReturnPolicyContent() {
        return `
        <!-- Return Policy -->
        <section style="text-align: center; margin-bottom: var(--space-16);">
            <div style="background: white; border-radius: var(--radius-2xl); box-shadow: var(--shadow-lg); padding: var(--space-16); border: 1px solid var(--gray-200);">
                <h1 style="font-size: 2.5rem; font-weight: 700; color: var(--gray-900); margin-bottom: var(--space-4);">
                    Return Policy
                </h1>
                <p style="font-size: 1.125rem; color: var(--gray-600);">
                    Our return policy information will be displayed here
                </p>
            </div>
        </section>
        `;
    }

    getFAQContent() {
        return `
        <!-- FAQ -->
        <section style="text-align: center; margin-bottom: var(--space-16);">
            <div style="background: white; border-radius: var(--radius-2xl); box-shadow: var(--shadow-lg); padding: var(--space-16); border: 1px solid var(--gray-200);">
                <h1 style="font-size: 2.5rem; font-weight: 700; color: var(--gray-900); margin-bottom: var(--space-4);">
                    Frequently Asked Questions
                </h1>
                <p style="font-size: 1.125rem; color: var(--gray-600);">
                    Common questions and answers will be displayed here
                </p>
            </div>
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
                this.initializeDeckFunctions();
                break;
            case 'events':
                // Initialize events-specific functionality
                break;
            case 'account':
                // Initialize account-specific functionality
                break;
            case 'product':
                // Initialize product-specific functionality
                break;
        }
    }

    initializeDeckFunctions() {
        // Define global deck management functions
        window.showMyDecks = function() {
            console.log('showMyDecks called');
            const myDecksSection = document.getElementById('my-decks-section');
            const builderSection = document.getElementById('deck-builder-section');
            const popularSection = document.getElementById('popular-decks-section');
            
            if (myDecksSection) myDecksSection.style.display = 'block';
            if (builderSection) builderSection.style.display = 'none';
            if (popularSection) popularSection.style.display = 'none';
            
            const myDecksBtn = document.getElementById('my-decks-btn');
            const builderBtn = document.getElementById('builder-btn');
            const popularBtn = document.getElementById('popular-btn');
            
            if (myDecksBtn) myDecksBtn.classList.add('active');
            if (builderBtn) builderBtn.classList.remove('active');
            if (popularBtn) popularBtn.classList.remove('active');
        };

        window.showDeckBuilder = function() {
            console.log('showDeckBuilder called');
            const myDecksSection = document.getElementById('my-decks-section');
            const builderSection = document.getElementById('deck-builder-section');
            const popularSection = document.getElementById('popular-decks-section');
            
            if (myDecksSection) myDecksSection.style.display = 'none';
            if (builderSection) builderSection.style.display = 'block';
            if (popularSection) popularSection.style.display = 'none';
            
            const myDecksBtn = document.getElementById('my-decks-btn');
            const builderBtn = document.getElementById('builder-btn');
            const popularBtn = document.getElementById('popular-btn');
            
            if (myDecksBtn) myDecksBtn.classList.remove('active');
            if (builderBtn) builderBtn.classList.add('active');
            if (popularBtn) popularBtn.classList.remove('active');
        };

        window.showPopularDecks = function() {
            console.log('showPopularDecks called');
            const myDecksSection = document.getElementById('my-decks-section');
            const builderSection = document.getElementById('deck-builder-section');
            const popularSection = document.getElementById('popular-decks-section');
            
            if (myDecksSection) myDecksSection.style.display = 'none';
            if (builderSection) builderSection.style.display = 'none';
            if (popularSection) popularSection.style.display = 'block';
            
            const myDecksBtn = document.getElementById('my-decks-btn');
            const builderBtn = document.getElementById('builder-btn');
            const popularBtn = document.getElementById('popular-btn');
            
            if (myDecksBtn) myDecksBtn.classList.remove('active');
            if (builderBtn) builderBtn.classList.remove('active');
            if (popularBtn) popularBtn.classList.add('active');
        };

        window.createNewDeck = function() {
            console.log('createNewDeck called');
            alert('Deck creation feature coming soon!');
        };

        window.importDeck = function() {
            console.log('importDeck called');
            alert('Deck import feature coming soon!');
        };

        window.showDeckTemplates = function() {
            console.log('showDeckTemplates called');
            alert('Deck templates feature coming soon!');
        };

        window.sortDecks = function() {
            console.log('sortDecks called');
        };

        window.refreshDeckList = function() {
            console.log('refreshDeckList called');
        };
    }
}

// Global navigation function
function navigateTo(page, params = '') {
    if (window.appRouter) {
        window.appRouter.loadPage(page, true, params);
    }
}

// Initialize router when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.appRouter = new AppRouter();
});
