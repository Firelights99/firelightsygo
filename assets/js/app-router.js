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
                    <!-- View Events button hidden - store not hosting events -->
                    <!-- <a href="#" onclick="navigateTo('events')" style="padding: var(--space-4) var(--space-8); background: rgba(255,255,255,0.1); color: white; text-decoration: none; border-radius: var(--radius-lg); font-weight: 600; transition: var(--transition-fast); text-transform: uppercase; letter-spacing: 0.05em; border: 1px solid rgba(255,255,255,0.2);">
                        View Events
                    </a> -->
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
                
                <!-- Tournament Events feature hidden - store not hosting events -->
                <!--
                <div style="text-align: center; padding: var(--space-6);">
                    <div style="width: 80px; height: 80px; background: linear-gradient(135deg, var(--accent-color) 0%, var(--accent-dark) 100%); border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; margin: 0 auto var(--space-4); font-size: 2rem;">
                        🎯
                    </div>
                    <h3 style="font-size: 1.5rem; font-weight: 600; color: var(--gray-900); margin-bottom: var(--space-3);">Tournament Events</h3>
                    <p style="color: var(--gray-600); line-height: 1.6;">Weekly locals, monthly championships, and special events for duelists of all skill levels.</p>
                </div>
                -->
                
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
                <!-- Join Events button hidden - store not hosting events -->
                <!-- <a href="#" onclick="navigateTo('events')" style="padding: var(--space-4) var(--space-8); background: transparent; color: white; text-decoration: none; border-radius: var(--radius-lg); font-weight: 600; transition: var(--transition-fast); text-transform: uppercase; letter-spacing: 0.05em; border: 1px solid rgba(255,255,255,0.3);">
                    Join Events
                </a> -->
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
                Deck Builder & Popular Decks
            </h1>
            <p style="font-size: 1.125rem; color: var(--gray-600); max-width: 600px; margin: 0 auto;">
                Build your own deck or explore popular strategies from tournament winners
            </p>
        </section>

        <!-- Deck Builder Toggle -->
        <section style="margin-bottom: var(--space-8);">
            <div style="display: flex; justify-content: center; gap: var(--space-4); margin-bottom: var(--space-6);">
                <button class="filter-btn active" onclick="showDeckBuilder()" id="builder-btn">Deck Builder</button>
                <button class="filter-btn" onclick="showPopularDecks()" id="popular-btn">Popular Decks</button>
            </div>
        </section>

        <!-- Deck Builder Interface -->
        <section id="deck-builder-section" style="display: block;">
            <link rel="stylesheet" href="assets/css/components/deck-builder.css">
            
            <div class="deck-builder-container">
                <!-- Card Search Panel -->
                <div class="card-search-panel">
                    <div class="search-header">
                        <h3>Card Search</h3>
                        <input type="text" class="card-search-input" id="card-search" placeholder="Search cards..." onkeyup="searchCards()">
                        <div class="search-filters">
                            <select class="filter-select" id="type-filter" onchange="searchCards()">
                                <option value="">All Types</option>
                                <option value="Monster">Monster</option>
                                <option value="Spell">Spell</option>
                                <option value="Trap">Trap</option>
                            </select>
                            <select class="filter-select" id="race-filter" onchange="searchCards()">
                                <option value="">All Races</option>
                                <option value="Dragon">Dragon</option>
                                <option value="Spellcaster">Spellcaster</option>
                                <option value="Warrior">Warrior</option>
                                <option value="Beast">Beast</option>
                                <option value="Fiend">Fiend</option>
                                <option value="Machine">Machine</option>
                            </select>
                            <select class="filter-select" id="attribute-filter" onchange="searchCards()">
                                <option value="">All Attributes</option>
                                <option value="DARK">DARK</option>
                                <option value="LIGHT">LIGHT</option>
                                <option value="FIRE">FIRE</option>
                                <option value="WATER">WATER</option>
                                <option value="EARTH">EARTH</option>
                                <option value="WIND">WIND</option>
                            </select>
                            <select class="filter-select" id="level-filter" onchange="searchCards()">
                                <option value="">All Levels</option>
                                <option value="1">Level 1</option>
                                <option value="2">Level 2</option>
                                <option value="3">Level 3</option>
                                <option value="4">Level 4</option>
                                <option value="5">Level 5</option>
                                <option value="6">Level 6</option>
                                <option value="7">Level 7</option>
                                <option value="8">Level 8</option>
                                <option value="9">Level 9</option>
                                <option value="10">Level 10</option>
                                <option value="11">Level 11</option>
                                <option value="12">Level 12</option>
                            </select>
                        </div>
                    </div>
                    <div class="search-results" id="search-results">
                        <div style="text-align: center; padding: var(--space-8); color: var(--gray-500);">
                            <div style="font-size: 2rem; margin-bottom: var(--space-2);">🔍</div>
                            <p>Search for cards to add to your deck</p>
                        </div>
                    </div>
                </div>

                <!-- Deck Builder Main -->
                <div class="deck-builder-main">
                    <div class="deck-builder-header">
                        <div class="deck-title" id="deck-title">Untitled Deck</div>
                        <div class="deck-actions">
                            <button class="deck-btn" onclick="deckBuilder.newDeck()">New</button>
                            <button class="deck-btn secondary" onclick="deckBuilder.openLoadDeckModal()">Load</button>
                            <button class="deck-btn" onclick="deckBuilder.saveDeck()">Save</button>
                            <button class="deck-btn secondary" onclick="deckBuilder.downloadYDK()">Export YDK</button>
                        </div>
                    </div>
                    
                    <div class="deck-sections">
                        <!-- Main Deck -->
                        <div class="deck-section main-deck">
                            <div class="deck-section-header">
                                <span class="deck-section-title">Main Deck</span>
                                <span class="deck-section-count" id="main-count">0</span>
                            </div>
                            <div class="deck-section-body" id="main-deck">
                                <div class="deck-section-empty">
                                    <div class="deck-section-empty-icon">🃏</div>
                                    <div class="deck-section-empty-text">Add cards to your main deck</div>
                                </div>
                            </div>
                        </div>

                        <!-- Extra Deck -->
                        <div class="deck-section extra-deck">
                            <div class="deck-section-header">
                                <span class="deck-section-title">Extra Deck</span>
                                <span class="deck-section-count" id="extra-count">0</span>
                            </div>
                            <div class="deck-section-body" id="extra-deck">
                                <div class="deck-section-empty">
                                    <div class="deck-section-empty-icon">⭐</div>
                                    <div class="deck-section-empty-text">Add extra deck monsters</div>
                                </div>
                            </div>
                        </div>

                        <!-- Side Deck -->
                        <div class="deck-section side-deck">
                            <div class="deck-section-header">
                                <span class="deck-section-title">Side Deck</span>
                                <span class="deck-section-count" id="side-count">0</span>
                            </div>
                            <div class="deck-section-body" id="side-deck">
                                <div class="deck-section-empty">
                                    <div class="deck-section-empty-icon">🔄</div>
                                    <div class="deck-section-empty-text">Add side deck cards</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Deck Info Panel -->
                <div class="deck-info-panel">
                    <div class="deck-info-header">
                        <h3>Deck Statistics</h3>
                    </div>
                    <div class="deck-info-body">
                        <div id="deck-stats">
                            <div class="deck-stats-grid">
                                <div class="stat-card">
                                    <h4>Main Deck</h4>
                                    <div class="stat-number invalid">0</div>
                                    <div class="stat-breakdown">
                                        <span>Monsters: 0</span>
                                        <span>Spells: 0</span>
                                        <span>Traps: 0</span>
                                    </div>
                                </div>
                                
                                <div class="stat-card">
                                    <h4>Extra Deck</h4>
                                    <div class="stat-number valid">0</div>
                                    <div class="stat-breakdown">
                                        <span>Fusion: 0</span>
                                        <span>Synchro: 0</span>
                                        <span>Xyz: 0</span>
                                        <span>Link: 0</span>
                                    </div>
                                </div>
                                
                                <div class="stat-card">
                                    <h4>Side Deck</h4>
                                    <div class="stat-number valid">0</div>
                                </div>
                            </div>
                        </div>
                        
                        <div id="deck-price">
                            <div class="price-summary">
                                <h4>Deck Price</h4>
                                <div class="total-price">$0.00 CAD</div>
                                <div class="price-breakdown">
                                    <div>Main: $0.00</div>
                                    <div>Extra: $0.00</div>
                                    <div>Side: $0.00</div>
                                </div>
                                <button class="primary-btn" onclick="deckBuilder.addDeckToCart()">
                                    Add Deck to Cart
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Keyboard Shortcuts Help -->
            <div class="shortcuts-help">
                <strong>Shortcuts:</strong><br>
                Ctrl+S: Save | Ctrl+O: Load | Ctrl+N: New | Ctrl+Z: Undo
            </div>
        </section>

        <!-- Popular Decks Section -->
        <section id="popular-decks-section" style="display: none;">
            <div style="display: flex; justify-content: center; gap: var(--space-4); margin-bottom: var(--space-8); flex-wrap: wrap;">
                <button class="filter-btn active" onclick="showCategory('meta')" id="meta-btn">Meta Decks</button>
                <button class="filter-btn" onclick="showCategory('budget')" id="budget-btn">Budget Builds</button>
                <button class="filter-btn" onclick="showCategory('rogue')" id="rogue-btn">Rogue Decks</button>
                <button class="filter-btn" onclick="showCategory('classic')" id="classic-btn">Classic Decks</button>
            </div>

            <div id="meta-decks" class="deck-section">
                <div class="modern-card-grid">
                    <div style="background: white; border-radius: var(--radius-xl); box-shadow: var(--shadow-lg); overflow: hidden; border: 1px solid var(--gray-200);" class="interactive-hover">
                        <div style="aspect-ratio: 16/9; background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%); display: flex; align-items: center; justify-content: center; position: relative;">
                            <img src="https://images.ygoprodeck.com/images/cards/76375976.jpg" alt="Snake-Eye Fire King" style="width: 120px; height: auto; border-radius: var(--radius-md); box-shadow: var(--shadow-md);">
                            <div style="position: absolute; top: var(--space-3); right: var(--space-3); background: var(--secondary-color); color: var(--gray-900); padding: var(--space-1) var(--space-3); border-radius: var(--radius-full); font-size: 0.75rem; font-weight: 700;">TIER 1</div>
                        </div>
                        <div style="padding: var(--space-6);">
                            <h3 style="font-size: 1.5rem; font-weight: 600; color: var(--gray-900); margin-bottom: var(--space-2);">Snake-Eye Fire King</h3>
                            <p style="color: var(--gray-600); margin-bottom: var(--space-4); line-height: 1.5;">Dominant combo deck featuring Snake-Eye engine with Fire King support for consistent disruption.</p>
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4);">
                                <span style="background: var(--success-color); color: white; padding: var(--space-1) var(--space-3); border-radius: var(--radius-full); font-size: 0.875rem; font-weight: 600;">68% Win Rate</span>
                                <span style="font-size: 1.25rem; font-weight: 700; color: var(--primary-color);">~$450</span>
                            </div>
                            <div style="display: flex; gap: var(--space-3);">
                                <button style="flex: 1; padding: var(--space-3); background: var(--primary-color); color: white; border: none; border-radius: var(--radius-md); font-weight: 600; cursor: pointer;" onclick="loadSampleDeck('snake-eye')">Load in Builder</button>
                                <button style="flex: 1; padding: var(--space-3); background: var(--gray-100); color: var(--gray-700); border: none; border-radius: var(--radius-md); font-weight: 600; cursor: pointer;" onclick="buyDeck('snake-eye')">Buy Singles</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <script>
            // Initialize deck builder when page loads
            if (!window.deckBuilder) {
                window.deckBuilder = new DeckBuilderService();
            }

            // Search functionality
            let searchTimeout;
            async function searchCards() {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(async () => {
                    const query = document.getElementById('card-search').value;
                    const filters = {
                        type: document.getElementById('type-filter').value,
                        race: document.getElementById('race-filter').value,
                        attribute: document.getElementById('attribute-filter').value,
                        level: document.getElementById('level-filter').value
                    };

                    if (query.length >= 2 || Object.values(filters).some(f => f)) {
                        const results = await window.deckBuilder.searchCards(query, filters);
                        displaySearchResults(results);
                    } else {
                        document.getElementById('search-results').innerHTML = \`
                            <div style="text-align: center; padding: var(--space-8); color: var(--gray-500);">
                                <div style="font-size: 2rem; margin-bottom: var(--space-2);">🔍</div>
                                <p>Search for cards to add to your deck</p>
                            </div>
                        \`;
                    }
                }, 300);
            }

            function displaySearchResults(results) {
                const container = document.getElementById('search-results');
                
                if (results.length === 0) {
                    container.innerHTML = \`
                        <div style="text-align: center; padding: var(--space-8); color: var(--gray-500);">
                            <div style="font-size: 2rem; margin-bottom: var(--space-2);">❌</div>
                            <p>No cards found</p>
                        </div>
                    \`;
                    return;
                }

                container.innerHTML = results.slice(0, 50).map(card => \`
                    <div class="search-result-card" onclick="addCardToDeck(\${JSON.stringify(card).replace(/"/g, '&quot;')})">
                        <img src="\${card.card_images ? card.card_images[0].image_url_small : 'https://images.ygoprodeck.com/images/cards/back.jpg'}" 
                             alt="\${card.name}" class="search-result-image" loading="lazy">
                        <div class="search-result-info">
                            <div class="search-result-name">\${card.name}</div>
                            <div class="search-result-type">\${getCardTypeDisplay(card)}</div>
                            <div class="search-result-stats">\${getCardStats(card)}</div>
                        </div>
                    </div>
                \`).join('');
            }

            function addCardToDeck(card) {
                const section = determineCardSection(card);
                window.deckBuilder.addCardToDeck(card, section, 1);
            }

            function determineCardSection(card) {
                if (card.type.includes('Fusion') || card.type.includes('Synchro') || 
                    card.type.includes('Xyz') || card.type.includes('Link')) {
                    return 'extra';
                }
                return 'main';
            }

            function getCardTypeDisplay(card) {
                if (card.type.includes('Monster')) {
                    if (card.type.includes('Effect')) return 'Effect Monster';
                    if (card.type.includes('Normal')) return 'Normal Monster';
                    if (card.type.includes('Fusion')) return 'Fusion Monster';
                    if (card.type.includes('Synchro')) return 'Synchro Monster';
                    if (card.type.includes('Xyz')) return 'Xyz Monster';
                    if (card.type.includes('Link')) return 'Link Monster';
                    return 'Monster';
                }
                if (card.type.includes('Spell')) return 'Spell Card';
                if (card.type.includes('Trap')) return 'Trap Card';
                return card.type;
            }

            function getCardStats(card) {
                if (card.type.includes('Monster')) {
                    if (card.type.includes('Link')) {
                        return \`LINK-\${card.linkval || '?'} | ATK: \${card.atk || '?'}\`;
                    } else {
                        return \`Level \${card.level || '?'} | ATK: \${card.atk || '?'} | DEF: \${card.def || '?'}\`;
                    }
                }
                return '';
            }

            function showDeckBuilder() {
                document.getElementById('deck-builder-section').style.display = 'block';
                document.getElementById('popular-decks-section').style.display = 'none';
                document.getElementById('builder-btn').classList.add('active');
                document.getElementById('popular-btn').classList.remove('active');
            }

            function showPopularDecks() {
                document.getElementById('deck-builder-section').style.display = 'none';
                document.getElementById('popular-decks-section').style.display = 'block';
                document.getElementById('builder-btn').classList.remove('active');
                document.getElementById('popular-btn').classList.add('active');
            }

            function loadSampleDeck(deckType) {
                showDeckBuilder();
                // Load a sample deck based on type
                if (deckType === 'snake-eye') {
                    loadSnakeEyeDeck();
                }
            }

            async function loadSnakeEyeDeck() {
                // Sample Snake-Eye deck list
                const sampleYDK = \`#created by Firelight Duel Academy
#main
89631139
89631139
89631139
76375976
76375976
76375976
14558127
14558127
14558127
23434538
23434538
23434538
40044918
40044918
40044918
97268402
97268402
97268402
#extra
63767246
63767246
63767246
86066372
86066372
86066372
#side
14558127
14558127
23434538
23434538
\`;
                await window.deckBuilder.loadFromYDK(sampleYDK);
                window.deckBuilder.deckMetadata.name = 'Snake-Eye Fire King';
                document.getElementById('deck-title').textContent = 'Snake-Eye Fire King';
                window.deckBuilder.showToast('Sample Snake-Eye deck loaded!', 'success');
            }

            function showCategory(category) {
                // Handle popular deck categories
                console.log('Showing category:', category);
            }

            function buyDeck(deckType) {
                alert('This would add all cards from the ' + deckType + ' deck to your cart.');
            }
        </script>
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

        <!-- Upcoming Events -->
        <section style="margin-bottom: var(--space-16);">
            <div style="text-align: center; margin-bottom: var(--space-8);">
                <h2 style="font-size: 2.5rem; font-weight: 700; color: var(--gray-900); margin-bottom: var(--space-4);">
                    Upcoming Events
                </h2>
                <p style="font-size: 1.125rem; color: var(--gray-600);">
                    Register now for our exciting tournaments and events
                </p>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: var(--space-6);">
                <div style="background: white; border-radius: var(--radius-xl); box-shadow: var(--shadow-lg); overflow: hidden; border: 2px solid var(--secondary-color); position: relative;" class="interactive-hover">
                    <div style="position: absolute; top: var(--space-4); right: var(--space-4); background: var(--secondary-color); color: var(--gray-900); padding: var(--space-1) var(--space-3); border-radius: var(--radius-full); font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">FEATURED</div>
                    <div style="padding: var(--space-6);">
                        <div style="display: flex; align-items: center; gap: var(--space-4); margin-bottom: var(--space-4);">
                            <div style="background: var(--primary-color); color: white; padding: var(--space-3); border-radius: var(--radius-lg); text-align: center; min-width: 80px;">
                                <div style="font-size: 0.875rem; font-weight: 600;">JAN</div>
                                <div style="font-size: 1.5rem; font-weight: 700;">25</div>
                            </div>
                            <div>
                                <h3 style="font-size: 1.5rem; font-weight: 600; color: var(--gray-900); margin-bottom: var(--space-2);">Weekly Locals Tournament</h3>
                                <p style="color: var(--gray-600); font-size: 0.875rem;">📅 Friday, 7:00 PM - 11:00 PM</p>
                            </div>
                        </div>
                        <div style="margin-bottom: var(--space-4);">
                            <p style="color: var(--gray-700); margin-bottom: var(--space-1);">🎯 Format: Advanced (TCG)</p>
                            <p style="color: var(--gray-700); margin-bottom: var(--space-1);">💰 Entry: $10 CAD</p>
                            <p style="color: var(--gray-700);">🏆 Prizes: Store Credit + Packs</p>
                        </div>
                        <button style="width: 100%; padding: var(--space-3) var(--space-4); background: var(--primary-color); color: white; border: none; border-radius: var(--radius-md); font-weight: 600; cursor: pointer; text-transform: uppercase;" onclick="registerEvent('weekly-locals')">Register Now</button>
                    </div>
                </div>
            </div>
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

        <!-- Benefits of Creating Account -->
        <section style="margin-bottom: var(--space-16);">
            <div style="text-align: center; margin-bottom: var(--space-8);">
                <h2 style="font-size: 2.5rem; font-weight: 700; color: var(--gray-900); margin-bottom: var(--space-4);">
                    Why Create an Account?
                </h2>
                <p style="font-size: 1.125rem; color: var(--gray-600);">
                    Unlock exclusive features and enhance your shopping experience
                </p>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: var(--space-6);">
                <div style="background: white; border-radius: var(--radius-xl); box-shadow: var(--shadow-lg); overflow: hidden; border: 1px solid var(--gray-200); text-align: center; padding: var(--space-8);">
                    <div style="font-size: 3rem; margin-bottom: var(--space-4);">📦</div>
                    <h3 style="font-size: 1.5rem; font-weight: 600; color: var(--gray-900); margin-bottom: var(--space-3);">Order Tracking</h3>
                    <p style="color: var(--gray-600); line-height: 1.6;">Track your orders, view purchase history, and manage returns all in one place.</p>
                </div>
                
                <div style="background: white; border-radius: var(--radius-xl); box-shadow: var(--shadow-lg); overflow: hidden; border: 1px solid var(--gray-200); text-align: center; padding: var(--space-8);">
                    <div style="font-size: 3rem; margin-bottom: var(--space-4);">❤️</div>
                    <h3 style="font-size: 1.5rem; font-weight: 600; color: var(--gray-900); margin-bottom: var(--space-3);">Wishlist</h3>
                    <p style="color: var(--gray-600); line-height: 1.6;">Save your favorite cards and get notified when prices drop or items go on sale.</p>
                </div>
                
                <div style="background: white; border-radius: var(--radius-xl); box-shadow: var(--shadow-lg); overflow: hidden; border: 1px solid var(--gray-200); text-align: center; padding: var(--space-8);">
                    <div style="font-size: 3rem; margin-bottom: var(--space-4);">🚀</div>
                    <h3 style="font-size: 1.5rem; font-weight: 600; color: var(--gray-900); margin-bottom: var(--space-3);">Faster Checkout</h3>
                    <p style="color: var(--gray-600); line-height: 1.6;">Save your shipping and billing information for lightning-fast checkout.</p>
                </div>
            </div>
        </section>
        `;
    }

    getLoggedInAccountContent(user) {
        // Safely get orders and wishlist data
        let orders = [];
        let wishlistCount = 0;
        
        try {
            if (window.tcgStore && typeof window.tcgStore.getUserOrders === 'function') {
                orders = window.tcgStore.getUserOrders();
            } else {
                // Fallback: get orders from localStorage
                const allOrders = JSON.parse(localStorage.getItem('tcg-orders') || '[]');
                orders = allOrders.filter(order => order.userId === user.id);
            }
            
            wishlistCount = user.wishlist ? user.wishlist.length : 0;
        } catch (error) {
            console.warn('Error getting user data:', error);
            orders = [];
            wishlistCount = 0;
        }
        
        return `
        <!-- Welcome Header -->
        <section style="text-align: center; margin-bottom: var(--space-12);">
            <div style="background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%); border-radius: var(--radius-2xl); color: white; padding: var(--space-12); margin-bottom: var(--space-8);">
                <h1 style="font-size: 3rem; font-weight: 700; margin-bottom: var(--space-4);">
                    Welcome back, ${user.firstName}!
                </h1>
                <p style="font-size: 1.125rem; opacity: 0.9;">
                    Member since ${new Date(user.createdAt).toLocaleDateString()}
                </p>
            </div>
        </section>

        <!-- Account Stats -->
        <section style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-4); margin-bottom: var(--space-12);">
            <div style="background: white; border-radius: var(--radius-lg); box-shadow: var(--shadow-md); padding: var(--space-6); text-align: center; border: 1px solid var(--gray-200);">
                <div style="font-size: 2rem; font-weight: 700; color: var(--primary-color); margin-bottom: var(--space-2);">${orders.length}</div>
                <div style="font-size: 0.875rem; color: var(--gray-600); text-transform: uppercase; letter-spacing: 0.05em;">Total Orders</div>
            </div>
            <div style="background: white; border-radius: var(--radius-lg); box-shadow: var(--shadow-md); padding: var(--space-6); text-align: center; border: 1px solid var(--gray-200);">
                <div style="font-size: 2rem; font-weight: 700; color: var(--secondary-color); margin-bottom: var(--space-2);">${wishlistCount}</div>
                <div style="font-size: 0.875rem; color: var(--gray-600); text-transform: uppercase; letter-spacing: 0.05em;">Wishlist Items</div>
            </div>
            <div style="background: white; border-radius: var(--radius-lg); box-shadow: var(--shadow-md); padding: var(--space-6); text-align: center; border: 1px solid var(--gray-200);">
                <div style="font-size: 2rem; font-weight: 700; color: var(--accent-color); margin-bottom: var(--space-2);">$${this.calculateTotalSpent(orders)}</div>
                <div style="font-size: 0.875rem; color: var(--gray-600); text-transform: uppercase; letter-spacing: 0.05em;">Total Spent</div>
            </div>
        </section>

        <!-- Account Dashboard -->
        <section style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: var(--space-6); margin-bottom: var(--space-16);">
            <div style="background: white; border-radius: var(--radius-xl); box-shadow: var(--shadow-lg); overflow: hidden; border: 1px solid var(--gray-200);" class="interactive-hover">
                <div style="background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%); padding: var(--space-6); text-align: center;">
                    <div style="font-size: 3rem; margin-bottom: var(--space-3);">📦</div>
                    <h3 style="font-size: 1.5rem; font-weight: 600; color: white; margin-bottom: var(--space-2);">Order History</h3>
                </div>
                <div style="padding: var(--space-6);">
                    <p style="color: var(--gray-600); margin-bottom: var(--space-4); line-height: 1.6;">View your recent purchases, track current orders, and download invoices for your records.</p>
                    ${orders.length > 0 ? `
                        <div style="margin-bottom: var(--space-4);">
                            <div style="font-size: 0.875rem; color: var(--gray-500); margin-bottom: var(--space-2);">Recent Order:</div>
                            <div style="font-weight: 600; color: var(--gray-900);">Order #${orders[0].id}</div>
                            <div style="font-size: 0.875rem; color: var(--gray-600);">${new Date(orders[0].createdAt).toLocaleDateString()} - $${orders[0].total.toFixed(2)}</div>
                        </div>
                    ` : ''}
                    <button style="width: 100%; padding: var(--space-3) var(--space-6); background: var(--primary-color); color: white; border: none; border-radius: var(--radius-md); font-weight: 600; cursor: pointer; transition: var(--transition-fast);" onclick="alert('Order history feature coming soon!')">View All Orders</button>
                </div>
            </div>
            
            <div style="background: white; border-radius: var(--radius-xl); box-shadow: var(--shadow-lg); overflow: hidden; border: 1px solid var(--gray-200);" class="interactive-hover">
                <div style="background: linear-gradient(135deg, var(--accent-color) 0%, var(--accent-dark) 100%); padding: var(--space-6); text-align: center;">
                    <div style="font-size: 3rem; margin-bottom: var(--space-3);">❤️</div>
                    <h3 style="font-size: 1.5rem; font-weight: 600; color: var(--gray-900); margin-bottom: var(--space-2);">Wishlist</h3>
                </div>
                <div style="padding: var(--space-6);">
                    <p style="color: var(--gray-600); margin-bottom: var(--space-4); line-height: 1.6;">Save cards you want to purchase later and get notified when prices drop.</p>
                    ${wishlistCount > 0 ? `
                        <div style="margin-bottom: var(--space-4);">
                            <div style="font-size: 0.875rem; color: var(--gray-500); margin-bottom: var(--space-2);">Latest Addition:</div>
                            <div style="font-weight: 600; color: var(--gray-900);">${user.wishlist[user.wishlist.length - 1].name}</div>
                            <div style="font-size: 0.875rem; color: var(--gray-600);">$${user.wishlist[user.wishlist.length - 1].price.toFixed(2)}</div>
                        </div>
                    ` : ''}
                    <button style="width: 100%; padding: var(--space-3) var(--space-6); background: var(--accent-color); color: var(--gray-900); border: none; border-radius: var(--radius-md); font-weight: 600; cursor: pointer; transition: var(--transition-fast);" onclick="window.tcgStore.openWishlistModal()">View Wishlist (${wishlistCount})</button>
                </div>
            </div>

            <div style="background: white; border-radius: var(--radius-xl); box-shadow: var(--shadow-lg); overflow: hidden; border: 1px solid var(--gray-200);" class="interactive-hover">
                <div style="background: linear-gradient(135deg, var(--secondary-color) 0%, var(--secondary-dark) 100%); padding: var(--space-6); text-align: center;">
                    <div style="font-size: 3rem; margin-bottom: var(--space-3);">⚙️</div>
                    <h3 style="font-size: 1.5rem; font-weight: 600; color: var(--gray-900); margin-bottom: var(--space-2);">Account Settings</h3>
                </div>
                <div style="padding: var(--space-6);">
                    <p style="color: var(--gray-600); margin-bottom: var(--space-4); line-height: 1.6;">Update your profile information, change password, and manage your preferences.</p>
                    <div style="margin-bottom: var(--space-4);">
                        <div style="font-size: 0.875rem; color: var(--gray-500); margin-bottom: var(--space-1);">Email:</div>
                        <div style="font-weight: 600; color: var(--gray-900);">${user.email}</div>
                    </div>
                    <button style="width: 100%; padding: var(--space-3) var(--space-6); background: var(--secondary-color); color: var(--gray-900); border: none; border-radius: var(--radius-md); font-weight: 600; cursor: pointer; transition: var(--transition-fast);" onclick="window.tcgStore.openEditProfileModal()">Edit Profile</button>
                </div>
            </div>
        </section>

        <!-- Account Actions -->
        <section style="background: white; border-radius: var(--radius-2xl); box-shadow: var(--shadow-lg); padding: var(--space-12); margin-bottom: var(--space-16); border: 1px solid var(--gray-200);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-8);">
                <div>
                    <h2 style="font-size: 2rem; font-weight: 700; color: var(--gray-900); margin-bottom: var(--space-2);">
                        Account Actions
                    </h2>
                    <p style="font-size: 1rem; color: var(--gray-600);">
                        Quick access to common account functions
                    </p>
                </div>
                <button style="padding: var(--space-3) var(--space-6); background: var(--error-color); color: white; border: none; border-radius: var(--radius-md); font-weight: 600; cursor: pointer; transition: var(--transition-fast);" onclick="tcgStore.logout()">
                    Sign Out
                </button>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: var(--space-6);">
                <div style="text-align: center; padding: var(--space-4); border: 1px solid var(--gray-200); border-radius: var(--radius-lg); transition: var(--transition-fast); cursor: pointer;" class="interactive-hover" onclick="navigateTo('singles')">
                    <div style="font-size: 2rem; margin-bottom: var(--space-3);">🛒</div>
                    <h4 style="font-size: 1.125rem; font-weight: 600; color: var(--gray-900); margin-bottom: var(--space-2);">Continue Shopping</h4>
                    <p style="color: var(--gray-600); font-size: 0.875rem;">Browse our latest Yu-Gi-Oh! singles</p>
                </div>
                
                <div style="text-align: center; padding: var(--space-4); border: 1px solid var(--gray-200); border-radius: var(--radius-lg); transition: var(--transition-fast); cursor: pointer;" class="interactive-hover" onclick="navigateTo('decks')">
                    <div style="font-size: 2rem; margin-bottom: var(--space-3);">🃏</div>
                    <h4 style="font-size: 1.125rem; font-weight: 600; color: var(--gray-900); margin-bottom: var(--space-2);">Browse Decks</h4>
                    <p style="color: var(--gray-600); font-size: 0.875rem;">Explore popular deck strategies</p>
                </div>
                
                <div style="text-align: center; padding: var(--space-4); border: 1px solid var(--gray-200); border-radius: var(--radius-lg); transition: var(--transition-fast); cursor: pointer;" class="interactive-hover">
                    <div style="font-size: 2rem; margin-bottom: var(--space-3);">📞</div>
                    <h4 style="font-size: 1.125rem; font-weight: 600; color: var(--gray-900); margin-bottom: var(--space-2);">Contact Support</h4>
                    <p style="color: var(--gray-600); font-size: 0.875rem;">Get help with your account</p>
                </div>
            </div>
        </section>
        `;
    }

    calculateTotalSpent(orders) {
        const total = orders.reduce((sum, order) => sum + order.total, 0);
        return total.toFixed(2);
    }

    async getProductContent(params = '') {
        // Parse the card ID from params
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
            // Load card data directly from API instead of relying on tcgStore
            let card = null;
            const apiBaseURL = 'https://db.ygoprodeck.com/api/v7';
            
            if (!isNaN(cardId)) {
                // Fetch by ID
                const response = await fetch(`${apiBaseURL}/cardinfo.php?id=${cardId}`);
                if (response.ok) {
                    const result = await response.json();
                    card = result.data ? result.data[0] : null;
                }
            } else {
                // Fetch by name
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

            const formattedCard = await this.formatCardForDisplay(card);
            return this.generateProductHTML(formattedCard);

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

    async formatCardForDisplay(card) {
        if (!card) return null;

        // Get all available sets and their rarities
        const cardSets = this.processCardSets(card.card_sets || []);
        const defaultSet = cardSets.length > 0 ? cardSets[0] : null;
        const price = await this.getCardPrice(card, defaultSet);

        return {
            id: card.id,
            name: card.name,
            type: this.getCardTypeDisplay(card),
            race: card.race,
            attribute: card.attribute,
            level: card.level,
            atk: card.atk,
            def: card.def,
            desc: card.desc,
            archetype: card.archetype,
            image: this.getCardImageURL(card),
            imageSmall: this.getCardImageURL(card, 'small'),
            price: price,
            priceChange: this.getMockPriceChange(),
            rarity: defaultSet ? defaultSet.rarity : 'Common',
            sets: cardSets,
            selectedSet: defaultSet
        };
    }

    processCardSets(cardSets) {
        console.log('Processing card sets:', cardSets); // Debug log
        
        if (!cardSets || cardSets.length === 0) {
            console.log('No card sets found, using fallback');
            return [{
                set_name: 'Unknown Set',
                set_code: 'UNKNOWN',
                rarity: 'Common',
                rarity_code: 'C',
                price: '0.50'
            }];
        }

        const processedSets = cardSets.map(set => {
            console.log('Processing set:', set); // Debug log
            return {
                set_name: set.set_name || 'Unknown Set',
                set_code: set.set_code || 'UNKNOWN',
                rarity: set.set_rarity || 'Common',
                rarity_code: set.set_rarity_code || 'C',
                price: set.set_price || this.calculateSetPrice(set.set_rarity || 'Common')
            };
        }).sort((a, b) => {
            // Sort by rarity value (higher rarity first)
            const rarityOrder = {
                'Secret Rare': 6,
                'Ultra Rare': 5,
                'Super Rare': 4,
                'Rare': 3,
                'Short Print': 2,
                'Common': 1
            };
            return (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0);
        });

        console.log('Processed sets:', processedSets); // Debug log
        return processedSets;
    }

    calculateSetPrice(rarity) {
        const basePrices = {
            'Secret Rare': 45.00,
            'Ultra Rare': 25.00,
            'Super Rare': 12.00,
            'Rare': 5.00,
            'Short Print': 3.00,
            'Common': 0.50
        };
        
        const basePrice = basePrices[rarity] || 1.00;
        // Add some randomness to make prices more realistic
        const variation = (Math.random() - 0.5) * 0.4; // ±20% variation
        return (basePrice * (1 + variation)).toFixed(2);
    }

    getCardImageURL(card, size = 'normal') {
        if (!card || !card.card_images || card.card_images.length === 0) {
            return 'https://images.ygoprodeck.com/images/cards/back.jpg';
        }

        const image = card.card_images[0];
        switch (size) {
            case 'small':
                return image.image_url_small;
            case 'cropped':
                return image.image_url_cropped;
            default:
                return image.image_url;
        }
    }

    getCardTypeDisplay(card) {
        if (card.type.includes('Monster')) {
            if (card.type.includes('Effect')) return 'Effect Monster';
            if (card.type.includes('Normal')) return 'Normal Monster';
            if (card.type.includes('Fusion')) return 'Fusion Monster';
            if (card.type.includes('Synchro')) return 'Synchro Monster';
            if (card.type.includes('Xyz')) return 'Xyz Monster';
            if (card.type.includes('Link')) return 'Link Monster';
            return 'Monster';
        }
        if (card.type.includes('Spell')) return 'Spell Card';
        if (card.type.includes('Trap')) return 'Trap Card';
        return card.type;
    }

    async getCardPrice(card, selectedSet = null) {
        try {
            // Try to get price from YGOPRODeck API
            const apiBaseURL = 'https://db.ygoprodeck.com/api/v7';
            const response = await fetch(`${apiBaseURL}/cardinfo.php?id=${card.id}`);
            if (response.ok) {
                const result = await response.json();
                const cardData = result.data ? result.data[0] : null;
                
                if (cardData && cardData.card_prices && cardData.card_prices.length > 0) {
                    const prices = cardData.card_prices[0];
                    // Use TCGPlayer market price as base (USD)
                    let usdPrice = parseFloat(prices.tcgplayer_price) || 
                                  parseFloat(prices.ebay_price) || 
                                  parseFloat(prices.amazon_price) || 
                                  parseFloat(prices.coolstuffinc_price);
                    
                    if (usdPrice && usdPrice > 0) {
                        // Convert USD to CAD and adjust for rarity
                        let cadPrice = usdPrice * 1.35;
                        if (selectedSet) {
                            cadPrice = this.adjustPriceForRarity(cadPrice, selectedSet.rarity);
                        }
                        return cadPrice.toFixed(2);
                    }
                }
            }
        } catch (error) {
            console.warn('Error fetching price from API:', error);
        }
        
        // Fallback to set-specific pricing or mock pricing
        if (selectedSet && selectedSet.price) {
            return selectedSet.price;
        }
        
        return this.getMockPriceCAD(card.name, selectedSet ? selectedSet.rarity : 'Common');
    }

    adjustPriceForRarity(basePrice, rarity) {
        const rarityMultipliers = {
            'Secret Rare': 3.5,
            'Ultra Rare': 2.2,
            'Super Rare': 1.5,
            'Rare': 1.0,
            'Short Print': 0.8,
            'Common': 0.3
        };
        
        const multiplier = rarityMultipliers[rarity] || 1.0;
        return basePrice * multiplier;
    }

    getMockPriceCAD(cardName, rarity = 'Common') {
        const hash = this.hashCode(cardName);
        const basePrice = Math.abs(hash % 30) + 1; // Base price before rarity adjustment
        
        // Card-specific adjustments
        let cardMultiplier = 1.0;
        if (cardName.includes('Ash') || cardName.includes('Snake-Eye')) {
            cardMultiplier = 3.0; // Meta cards
        } else if (cardName.includes('Blue-Eyes') || cardName.includes('Dark Magician')) {
            cardMultiplier = 1.5; // Classic cards
        } else if (cardName.includes('Kashtira') || cardName.includes('Infinite')) {
            cardMultiplier = 2.5; // Meta staples
        } else if (cardName.includes('Nibiru') || cardName.includes('Effect Veiler')) {
            cardMultiplier = 2.0; // Hand traps
        }
        
        // Rarity-based pricing
        const rarityPrices = {
            'Secret Rare': basePrice * cardMultiplier * 4.0 + 20,
            'Ultra Rare': basePrice * cardMultiplier * 2.5 + 10,
            'Super Rare': basePrice * cardMultiplier * 1.8 + 5,
            'Rare': basePrice * cardMultiplier * 1.2 + 2,
            'Short Print': basePrice * cardMultiplier * 0.8 + 1,
            'Common': basePrice * cardMultiplier * 0.4 + 0.25
        };
        
        const finalPrice = rarityPrices[rarity] || rarityPrices['Common'];
        return Math.max(0.25, finalPrice).toFixed(2); // Minimum 25 cents
    }

    getMockPriceChange() {
        const changes = [
            { direction: 'up', amount: (Math.random() * 10).toFixed(2) },
            { direction: 'down', amount: (Math.random() * 5).toFixed(2) },
            { direction: 'stable', amount: '0.00' }
        ];
        
        return changes[Math.floor(Math.random() * changes.length)];
    }

    getCardRarity(card) {
        if (!card.card_sets || card.card_sets.length === 0) return 'Common';
        
        // Return the rarity from the first (highest rarity) set
        return card.card_sets[0].set_rarity || 'Common';
    }

    hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash;
    }

    generateProductHTML(card) {
        const statsHTML = this.generateCardStatsHTML(card);
        const priceChangeSymbol = card.priceChange.direction === 'up' ? '↗' : 
                                card.priceChange.direction === 'down' ? '↘' : '→';
        const priceChangeText = card.priceChange.direction === 'stable' ? '$0.00' : 
                              (card.priceChange.direction === 'up' ? '+' : '-') + '$' + card.priceChange.amount;

        return `
        <!-- Breadcrumb -->
        <div style="margin-bottom: var(--space-6);">
            <nav style="display: flex; align-items: center; gap: var(--space-2); font-size: 0.875rem; color: var(--gray-600);">
                <a href="#" onclick="navigateTo('home')" style="color: var(--primary-color); text-decoration: none;">Home</a>
                <span>›</span>
                <a href="#" onclick="navigateTo('singles')" style="color: var(--primary-color); text-decoration: none;">Singles</a>
                <span>›</span>
                <span>${card.name}</span>
            </nav>
        </div>

        <!-- Product Details -->
        <section style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-12); margin-bottom: var(--space-16);">
            
            <!-- Product Images -->
            <div>
                <div style="background: white; border-radius: var(--radius-xl); box-shadow: var(--shadow-lg); padding: var(--space-8); border: 1px solid var(--gray-200);">
                    <div style="aspect-ratio: 3/4; background: linear-gradient(135deg, var(--gray-100) 0%, var(--gray-200) 100%); border-radius: var(--radius-lg); overflow: hidden; margin-bottom: var(--space-4); cursor: pointer;" onclick="openImageZoom('${card.image}', '${card.name}')">
                        <img src="${card.image}" alt="${card.name}" style="width: 100%; height: 100%; object-fit: contain; padding: var(--space-2);">
                    </div>
                    <div style="display: flex; gap: var(--space-2); justify-content: center;">
                        <img src="${card.image}" alt="Normal view" style="width: 60px; height: 80px; object-fit: contain; border-radius: var(--radius-md); border: 2px solid var(--primary-color); cursor: pointer;">
                        <img src="${card.imageSmall}" alt="Small view" style="width: 60px; height: 80px; object-fit: contain; border-radius: var(--radius-md); border: 2px solid var(--gray-300); cursor: pointer;">
                    </div>
                </div>
            </div>

            <!-- Product Information -->
            <div>
                <div style="background: white; border-radius: var(--radius-xl); box-shadow: var(--shadow-lg); padding: var(--space-8); border: 1px solid var(--gray-200);">
                    
                    <!-- Product Header -->
                    <div style="margin-bottom: var(--space-6);">
                        <h1 style="font-size: 2.5rem; font-weight: 700; color: var(--gray-900); margin-bottom: var(--space-3); line-height: 1.2;">${card.name}</h1>
                        <div style="display: flex; gap: var(--space-4); margin-bottom: var(--space-4);">
                            <span style="background: var(--primary-color); color: white; padding: var(--space-1) var(--space-3); border-radius: var(--radius-full); font-size: 0.875rem; font-weight: 600;">${card.type}</span>
                            <span style="background: var(--secondary-color); color: var(--gray-900); padding: var(--space-1) var(--space-3); border-radius: var(--radius-full); font-size: 0.875rem; font-weight: 600;">${card.rarity}</span>
                        </div>
                    </div>

                    <!-- Card Stats -->
                    <div style="margin-bottom: var(--space-6);">
                        ${statsHTML}
                    </div>

                    <!-- Pricing Section -->
                    <div style="background: var(--gray-50); border-radius: var(--radius-lg); padding: var(--space-6); margin-bottom: var(--space-6);">
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-4);">
                            <span style="font-size: 2rem; font-weight: 700; color: var(--primary-color);">$${card.price}</span>
                            <span style="font-size: 0.875rem; font-weight: 600; padding: var(--space-1) var(--space-3); border-radius: var(--radius-md);" class="price-trend ${card.priceChange.direction}">
                                ${priceChangeSymbol} ${priceChangeText}
                            </span>
                        </div>
                    </div>

                    <!-- Set/Rarity Selection -->
                    <div style="margin-bottom: var(--space-6);">
                        <h3 style="font-size: 1.25rem; font-weight: 600; color: var(--gray-900); margin-bottom: var(--space-4);">Available Sets & Rarities</h3>
                        <div id="set-selector" style="display: grid; gap: var(--space-3);">
                            ${this.generateSetSelectorHTML(card.sets, card.selectedSet)}
                        </div>
                    </div>

                    <!-- Add to Cart Section -->
                    <div style="margin-bottom: var(--space-6);">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); margin-bottom: var(--space-4);">
                            <div>
                                <label style="display: block; font-weight: 600; color: var(--gray-700); margin-bottom: var(--space-2);">Quantity:</label>
                                <div style="display: flex; align-items: center; border: 1px solid var(--gray-300); border-radius: var(--radius-md); overflow: hidden;">
                                    <button style="padding: var(--space-3); background: var(--gray-100); border: none; cursor: pointer;" onclick="changeProductQuantity(-1)">-</button>
                                    <input type="number" id="product-quantity" value="1" min="1" max="99" style="flex: 1; padding: var(--space-3); border: none; text-align: center; font-weight: 600;">
                                    <button style="padding: var(--space-3); background: var(--gray-100); border: none; cursor: pointer;" onclick="changeProductQuantity(1)">+</button>
                                </div>
                            </div>
                            <div>
                                <label style="display: block; font-weight: 600; color: var(--gray-700); margin-bottom: var(--space-2);">Condition:</label>
                                <select id="product-condition" style="width: 100%; padding: var(--space-3); border: 1px solid var(--gray-300); border-radius: var(--radius-md); font-size: 0.875rem;">
                                    <option value="1.0">Near Mint</option>
                                    <option value="0.9">Lightly Played (-10%)</option>
                                    <option value="0.8">Moderately Played (-20%)</option>
                                    <option value="0.65">Heavily Played (-35%)</option>
                                    <option value="0.5">Damaged (-50%)</option>
                                </select>
                            </div>
                        </div>
                        <button style="width: 100%; padding: var(--space-4); background: var(--primary-color); color: white; border: none; border-radius: var(--radius-md); font-weight: 600; font-size: 1.125rem; cursor: pointer; transition: var(--transition-fast); text-transform: uppercase; letter-spacing: 0.05em;" onclick="addProductToCart('${card.name}', ${card.price}, '${card.image}')">
                            Add to Cart
                        </button>
                    </div>

                    <!-- Card Description -->
                    <div>
                        <h3 style="font-size: 1.25rem; font-weight: 600; color: var(--gray-900); margin-bottom: var(--space-3);">Card Description</h3>
                        <p style="color: var(--gray-700); line-height: 1.6;">${card.desc || 'No description available.'}</p>
                    </div>

                </div>
            </div>
        </section>

        <!-- Related Cards Section -->
        <div>
            <h2 style="font-size: 2rem; font-weight: 600; color: var(--gray-900); margin-bottom: var(--space-8); text-align: center;">You May Also Like</h2>
            <div id="related-cards-grid" class="modern-card-grid">
                <div class="loading-container">
                    <div class="loading-spinner"></div>
                    <p class="loading-text">Loading related cards...</p>
                </div>
            </div>
        </div>

        <!-- Image Zoom Modal -->
        <div id="image-zoom-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 1000; align-items: center; justify-content: center;">
            <div style="position: relative; max-width: 90vw; max-height: 90vh;">
                <button onclick="closeImageZoom()" style="position: absolute; top: -40px; right: 0; background: none; border: none; color: white; font-size: 2rem; cursor: pointer;">×</button>
                <img id="zoomed-image" src="" alt="" style="max-width: 100%; max-height: 100%; object-fit: contain;">
            </div>
        </div>
        `;
    }

    generateCardStatsHTML(card) {
        let statsHTML = '';

        if (card.type.includes('Monster')) {
            if (card.atk !== undefined) {
                statsHTML += `<div style="display: flex; justify-content: space-between; padding: var(--space-2) 0; border-bottom: 1px solid var(--gray-200);"><span style="font-weight: 600; color: var(--gray-700);">ATK:</span><span style="color: var(--gray-900);">${card.atk}</span></div>`;
            }
            if (card.def !== undefined) {
                statsHTML += `<div style="display: flex; justify-content: space-between; padding: var(--space-2) 0; border-bottom: 1px solid var(--gray-200);"><span style="font-weight: 600; color: var(--gray-700);">DEF:</span><span style="color: var(--gray-900);">${card.def}</span></div>`;
            }
            if (card.level !== undefined) {
                statsHTML += `<div style="display: flex; justify-content: space-between; padding: var(--space-2) 0; border-bottom: 1px solid var(--gray-200);"><span style="font-weight: 600; color: var(--gray-700);">Level:</span><span style="color: var(--gray-900);">${card.level}</span></div>`;
            }
            if (card.attribute) {
                statsHTML += `<div style="display: flex; justify-content: space-between; padding: var(--space-2) 0; border-bottom: 1px solid var(--gray-200);"><span style="font-weight: 600; color: var(--gray-700);">Attribute:</span><span style="color: var(--gray-900);">${card.attribute}</span></div>`;
            }
            if (card.race) {
                statsHTML += `<div style="display: flex; justify-content: space-between; padding: var(--space-2) 0;"><span style="font-weight: 600; color: var(--gray-700);">Type:</span><span style="color: var(--gray-900);">${card.race}</span></div>`;
            }
        }

        if (card.archetype) {
            statsHTML += `<div style="display: flex; justify-content: space-between; padding: var(--space-2) 0;"><span style="font-weight: 600; color: var(--gray-700);">Archetype:</span><span style="color: var(--gray-900);">${card.archetype}</span></div>`;
        }

        return statsHTML;
    }

    generateSetSelectorHTML(sets, selectedSet) {
        console.log('Generating set selector HTML for sets:', sets); // Debug log
        
        if (!sets || sets.length === 0) {
            console.log('No sets provided to generateSetSelectorHTML');
            return '<p style="color: var(--gray-600); font-style: italic;">No set information available</p>';
        }

        const html = sets.map((set, index) => {
            console.log(`Generating HTML for set ${index}:`, set); // Debug log
            const isSelected = selectedSet && selectedSet.set_code === set.set_code;
            const rarityColor = this.getRarityColor(set.rarity);
            
            return `
                <div class="set-option ${isSelected ? 'selected' : ''}" 
                     style="border: 2px solid ${isSelected ? 'var(--primary-color)' : 'var(--gray-300)'}; 
                            border-radius: var(--radius-lg); 
                            padding: var(--space-4); 
                            cursor: pointer; 
                            transition: var(--transition-fast);
                            background: ${isSelected ? 'var(--primary-color)' : 'white'};
                            color: ${isSelected ? 'white' : 'var(--gray-900)'};"
                     onclick="selectSet('${set.set_code}', '${set.rarity}', '${set.price}', '${set.set_name.replace(/'/g, "\\'")}')">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-weight: 600; margin-bottom: var(--space-1);">${set.set_name}</div>
                            <div style="font-size: 0.875rem; opacity: 0.8;">${set.set_code}</div>
                        </div>
                        <div style="text-align: right;">
                            <div style="background: ${rarityColor}; color: white; padding: var(--space-1) var(--space-2); border-radius: var(--radius-md); font-size: 0.75rem; font-weight: 600; margin-bottom: var(--space-1);">
                                ${set.rarity}
                            </div>
                            <div style="font-size: 1.125rem; font-weight: 700;">$${set.price}</div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        console.log('Generated HTML:', html); // Debug log
        return html;
    }

    getRarityColor(rarity) {
        const rarityColors = {
            'Secret Rare': '#8B5CF6',
            'Ultra Rare': '#F59E0B',
            'Super Rare': '#3B82F6',
            'Rare': '#10B981',
            'Short Print': '#6B7280',
            'Common': '#374151'
        };
        return rarityColors[rarity] || '#6B7280';
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
            document.getElementById('page-title').textContent = route.title;
            document.getElementById('page-description').setAttribute('content', route.description);
            document.getElementById('og-title').setAttribute('content', route.title);
            document.getElementById('og-description').setAttribute('content', route.description);
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
                // Initialize deck-specific functionality
                break;
            case 'events':
                // Initialize events-specific functionality
                break;
            case 'account':
                // Initialize account-specific functionality
                break;
            case 'product':
                // Initialize product-specific functionality
                this.initializeProductPage(params);
                break;
        }
    }

    async initializeProductPage(params) {
        // Load related cards
        const urlParams = new URLSearchParams(params);
        const cardId = urlParams.get('id');
        
        if (cardId && window.tcgStore) {
            try {
                let card = null;
                if (!isNaN(cardId)) {
                    card = await window.tcgStore.getCardById(cardId);
                } else {
                    const cardName = cardId.replace(/-/g, ' ');
                    card = await window.tcgStore.getCardByName(cardName);
                }

                if (card) {
                    const formattedCard = await window.tcgStore.formatCardForDisplay(card);
                    await this.loadRelatedCards(formattedCard);
                }
            } catch (error) {
                console.error('Error initializing product page:', error);
            }
        }
    }

    async loadRelatedCards(card) {
        const relatedContainer = document.getElementById('related-cards-grid');
        if (!relatedContainer) return;
        
        try {
            let relatedCards = [];
            
            if (card.archetype) {
                relatedCards = await window.tcgStore.getCardsByArchetype(card.archetype);
                relatedCards = relatedCards.filter(c => c.id !== card.id).slice(0, 4);
            }
            
            if (relatedCards.length < 4) {
                const metaCards = await window.tcgStore.getMetaCards();
                const additionalCards = metaCards.filter(c => c.id !== card.id).slice(0, 4 - relatedCards.length);
                relatedCards = [...relatedCards, ...additionalCards];
            }

            if (relatedCards.length === 0) {
                relatedContainer.innerHTML = '<p style="text-align: center; color: var(--gray-600);">No related cards found.</p>';
                return;
            }

            relatedContainer.innerHTML = '';
            for (const relatedCard of relatedCards) {
                const formatted = await window.tcgStore.formatCardForDisplay(relatedCard);
                const cardElement = window.tcgStore.createModernCardElement(formatted);
                relatedContainer.appendChild(cardElement);
            }
            
        } catch (error) {
            console.error('Error loading related cards:', error);
            relatedContainer.innerHTML = '<p style="text-align: center; color: var(--gray-600);">Unable to load related cards.</p>';
        }
    }

    getShippingPolicyContent() {
        return `
        <!-- Page Header -->
        <section style="text-align: center; margin-bottom: var(--space-12);">
            <div style="background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%); border-radius: var(--radius-2xl); color: white; padding: var(--space-12); margin-bottom: var(--space-8);">
                <h1 style="font-size: 3rem; font-weight: 700; margin-bottom: var(--space-4);">
                    Shipping Policy
                </h1>
                <p style="font-size: 1.125rem; opacity: 0.9; max-width: 600px; margin: 0 auto;">
                    Fast, reliable shipping across Canada and the USA with competitive rates and tracking
                </p>
            </div>
        </section>

        <!-- Quick Reference -->
        <section style="margin-bottom: var(--space-16);">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: var(--space-6);">
                <div style="background: white; border-radius: var(--radius-xl); box-shadow: var(--shadow-lg); padding: var(--space-6); text-align: center; border: 1px solid var(--gray-200);">
                    <div style="font-size: 3rem; margin-bottom: var(--space-3);">🚚</div>
                    <h3 style="font-size: 1.25rem; font-weight: 600; color: var(--gray-900); margin-bottom: var(--space-2);">Free Shipping</h3>
                    <p style="color: var(--gray-600);">Orders $75+ CAD within Canada</p>
                    <p style="color: var(--gray-600);">Orders $100+ CAD to USA</p>
                </div>
                
                <div style="background: white; border-radius: var(--radius-xl); box-shadow: var(--shadow-lg); padding: var(--space-6); text-align: center; border: 1px solid var(--gray-200);">
                    <div style="font-size: 3rem; margin-bottom: var(--space-3);">⚡</div>
                    <h3 style="font-size: 1.25rem; font-weight: 600; color: var(--gray-900); margin-bottom: var(--space-2);">Fast Processing</h3>
                    <p style="color: var(--gray-600);">Orders ship within 1-2 business days</p>
                    <p style="color: var(--gray-600);">Same-day processing for orders before 2 PM EST</p>
                </div>
                
                <div style="background: white; border-radius: var(--radius-xl); box-shadow: var(--shadow-lg); padding: var(--space-6); text-align: center; border: 1px solid var(--gray-200);">
                    <div style="font-size: 3rem; margin-bottom: var(--space-3);">📦</div>
                    <h3 style="font-size: 1.25rem; font-weight: 600; color: var(--gray-900); margin-bottom: var(--space-2);">Secure Packaging</h3>
                    <p style="color: var(--gray-600);">Cards protected in toploaders</p>
                    <p style="color: var(--gray-600);">Bubble mailers and tracking included</p>
                </div>
                
                <div style="background: white; border-radius: var(--radius-xl); box-shadow: var(--shadow-lg); padding: var(--space-6); text-align: center; border: 1px solid var(--gray-200);">
                    <div style="font-size: 3rem; margin-bottom: var(--space-3);">🔍</div>
                    <h3 style="font-size: 1.25rem; font-weight: 600; color: var(--gray-900); margin-bottom: var(--space-2);">Full Tracking</h3>
                    <p style="color: var(--gray-600);">Track your order from ship to delivery</p>
                    <p style="color: var(--gray-600);">Email notifications at every step</p>
                </div>
            </div>
        </section>

        <!-- Shipping Rates -->
        <section style="margin-bottom: var(--space-16);">
            <div style="background: white; border-radius: var(--radius-2xl); box-shadow: var(--shadow-lg); padding: var(--space-12); border: 1px solid var(--gray-200);">
                <h2 style="font-size: 2.5rem; font-weight: 700; color: var(--gray-900); margin-bottom: var(--space-8); text-align: center;">
                    Shipping Rates & Delivery Times
                </h2>
                
                <!-- Canada Shipping -->
                <div style="margin-bottom: var(--space-10);">
                    <h3 style="font-size: 1.75rem; font-weight: 600; color: var(--primary-color); margin-bottom: var(--space-6); display: flex; align-items: center; gap: var(--space-3);">
                        🇨🇦 Canada Shipping
                    </h3>
                    
                    <div style="overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse; margin-bottom: var(--space-6);">
                            <thead>
                                <tr style="background: var(--gray-50);">
                                    <th style="padding: var(--space-4); text-align: left; font-weight: 600; color: var(--gray-900); border-bottom: 2px solid var(--gray-200);">Service</th>
                                    <th style="padding: var(--space-4); text-align: left; font-weight: 600; color: var(--gray-900); border-bottom: 2px solid var(--gray-200);">Delivery Time</th>
                                    <th style="padding: var(--space-4); text-align: left; font-weight: 600; color: var(--gray-900); border-bottom: 2px solid var(--gray-200);">Cost</th>
                                    <th style="padding: var(--space-4); text-align: left; font-weight: 600; color: var(--gray-900); border-bottom: 2px solid var(--gray-200);">Tracking</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style="padding: var(--space-4); border-bottom: 1px solid var(--gray-200);"><strong>Standard Shipping</strong></td>
                                    <td style="padding: var(--space-4); border-bottom: 1px solid var(--gray-200);">3-7 business days</td>
                                    <td style="padding: var(--space-4); border-bottom: 1px solid var(--gray-200);">$8.99 CAD<br><span style="color: var(--success-color); font-weight: 600;">FREE on orders $75+</span></td>
                                    <td style="padding: var(--space-4); border-bottom: 1px solid var(--gray-200);">✅ Included</td>
                                </tr>
                                <tr>
                                    <td style="padding: var(--space-4); border-bottom: 1px solid var(--gray-200);"><strong>Expedited Shipping</strong></td>
                                    <td style="padding: var(--space-4); border-bottom: 1px solid var(--gray-200);">2-3 business days</td>
                                    <td style="padding: var(--space-4); border-bottom: 1px solid var(--gray-200);">$15.99 CAD</td>
                                    <td style="padding: var(--space-4); border-bottom: 1px solid var(--gray-200);">✅ Included</td>
                                </tr>
                                <tr>
                                    <td style="padding: var(--space-4); border-bottom: 1px solid var(--gray-200);"><strong>Express Shipping</strong></td>
                                    <td style="padding: var(--space-4); border-bottom: 1px solid var(--gray-200);">1-2 business days</td>
                                    <td style="padding: var(--space-4); border-bottom: 1px solid var(--gray-200);">$24.99 CAD</td>
                                    <td style="padding: var(--space-4); border-bottom: 1px solid var(--gray-200);">✅ Included</td>
                                </tr>
                                <tr style="background: var(--secondary-color); color: var(--gray-900);">
                                    <td style="padding: var(--space-4);"><strong>Local Pickup (GTA)</strong></td>
                                    <td style="padding: var(--space-4);">Same day available</td>
                                    <td style="padding: var(--space-4);"><strong>FREE</strong></td>
                                    <td style="padding: var(--space-4);">N/A</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- USA Shipping -->
                <div style="margin-bottom: var(--space-10);">
                    <h3 style="font-size: 1.75rem; font-weight: 600; color: var(--primary-color); margin-bottom: var(--space-6); display: flex; align-items: center; gap: var(--space-3);">
                        🇺🇸 USA Shipping
                    </h3>
                    
                    <div style="overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse; margin-bottom: var(--space-6);">
                            <thead>
                                <tr style="background: var(--gray-50);">
                                    <th style="padding: var(--space-4); text-align: left; font-weight: 600; color: var(--gray-900); border-bottom: 2px solid var(--gray-200);">Service</th>
                                    <th style="padding: var(--space-4); text-align: left; font-weight: 600; color: var(--gray-900); border-bottom: 2px solid var(--gray-200);">Delivery Time</th>
                                    <th style="padding: var(--space-4); text-align: left; font-weight: 600; color: var(--gray-900); border-bottom: 2px solid var(--gray-200);">Cost</th>
                                    <th style="padding: var(--space-4); text-align: left; font-weight: 600; color: var(--gray-900); border-bottom: 2px solid var(--gray-200);">Tracking</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style="padding: var(--space-4); border-bottom: 1px solid var(--gray-200);"><strong>Standard International</strong></td>
                                    <td style="padding: var(--space-4); border-bottom: 1px solid var(--gray-200);">7-14 business days</td>
                                    <td style="padding: var(--space-4); border-bottom: 1px solid var(--gray-200);">$12.99 CAD<br><span style="color: var(--success-color); font-weight: 600;">FREE on orders $100+</span></td>
                                    <td style="padding: var(--space-4); border-bottom: 1px solid var(--gray-200);">✅ Included</td>
                                </tr>
                                <tr>
                                    <td style="padding: var(--space-4); border-bottom: 1px solid var(--gray-200);"><strong>Expedited International</strong></td>
                                    <td style="padding: var(--space-4); border-bottom: 1px solid var(--gray-200);">5-8 business days</td>
                                    <td style="padding: var(--space-4); border-bottom: 1px solid var(--gray-200);">$22.99 CAD</td>
                                    <td style="padding: var(--space-4); border-bottom: 1px solid var(--gray-200);">✅ Included</td>
                                </tr>
                                <tr>
                                    <td style="padding: var(--space-4);"><strong>Express International</strong></td>
                                    <td style="padding: var(--space-4);">3-5 business days</td>
                                    <td style="padding: var(--space-4);">$34.99 CAD</td>
                                    <td style="padding: var(--space-4);">✅ Included</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <div style="background: var(--accent-color); border-radius: var(--radius-lg); padding: var(--space-4); margin-top: var(--space-4);">
                        <p style="color: var(--gray-900); font-weight: 600; margin: 0;">
                            📋 <strong>Important:</strong> USA customers are responsible for any customs duties or taxes imposed by their local customs office. These fees are not included in our shipping costs.
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Packaging & Protection -->
        <section style="margin-bottom: var(--space-16);">
            <div style="background: white; border-radius: var(--radius-2xl); box-shadow: var(--shadow-lg); padding: var(--space-12); border: 1px solid var(--gray-200);">
                <h2 style="font-size: 2.5rem; font-weight: 700; color: var(--gray-900); margin-bottom: var(--space-8); text-align: center;">
                    Card Protection & Packaging
                </h2>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: var(--space-8);">
                    <div style="text-align: center;">
                        <div style="font-size: 4rem; margin-bottom: var(--space-4);">🛡️</div>
                        <h3 style="font-size: 1.5rem; font-weight: 600; color: var(--gray-900); margin-bottom: var(--space-3);">Individual Protection</h3>
                        <p style="color: var(--gray-600); line-height: 1.6;">Every single card is placed in a protective toploader or card sleeve to prevent damage during shipping. High-value cards receive additional protection with team bags.</p>
                    </div>
                    
                    <div style="text-align: center;">
                        <div style="font-size: 4rem; margin-bottom: var(--space-4);">📦</div>
                        <h3 style="font-size: 1.5rem; font-weight: 600; color: var(--gray-900); margin-bottom: var(--space-3);">Secure Packaging</h3>
                        <p style="color: var(--gray-600); line-height: 1.6;">Orders are shipped in bubble mailers or boxes depending on size. All packages include tracking and are marked as fragile when containing high-value items.</p>
                    </div>
                    
                    <div style="text-align: center;">
                        <div style="font-size: 4rem; margin-bottom: var(--space-4);">💎</div>
                        <h3 style="font-size: 1.5rem; font-weight: 600; color: var(--gray-900); margin-bottom: var(--space-3);">High-Value Orders</h3>
                        <p style="color: var(--gray-600); line-height: 1.6;">Orders over $200 CAD are automatically shipped with signature confirmation and additional insurance for your peace of mind.</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Processing Times -->
        <section style="margin-bottom: var(--space-16);">
            <div style="background: white; border-radius: var(--radius-2xl); box-shadow: var(--shadow-lg); padding: var(--space-12); border: 1px solid var(--gray-200);">
                <h2 style="font-size: 2.5rem; font-weight: 700; color: var(--gray-900); margin-bottom: var(--space-8); text-align: center;">
                    Order Processing
                </h2>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: var(--space-6);">
                    <div style="background: var(--success-color); color: white; border-radius: var(--radius-lg); padding: var(--space-6); text-align: center;">
                        <div style="font-size: 2rem; margin-bottom: var(--space-3);">⚡</div>
                        <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: var(--space-2);">Same-Day Processing</h3>
                        <p style="opacity: 0.9;">Orders placed before 2:00 PM EST on business days are processed and shipped the same day.</p>
                    </div>
                    
                    <div style="background: var(--primary-color); color: white; border-radius: var(--radius-lg); padding: var(--space-6); text-align: center;">
                        <div style="font-size: 2rem; margin-bottom: var(--space-3);">📅</div>
                        <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: var(--space-2);">Standard Processing</h3>
                        <p style="opacity: 0.9;">All other orders are processed within 1-2 business days. You'll receive tracking information via email.</p>
                    </div>
                    
                    <div style="background: var(--secondary-color); color: var(--gray-900); border-radius: var(--radius-lg); padding: var(--space-6); text-align: center;">
                        <div style="font-size: 2rem; margin-bottom: var(--space-3);">🏪</div>
                        <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: var(--space-2);">Business Hours</h3>
                        <p>Orders are processed Monday-Friday, 9 AM - 5 PM EST. Weekend orders are processed on the next business day.</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Special Policies -->
        <section style="margin-bottom: var(--space-16);">
            <div style="background: white; border-radius: var(--radius-2xl); box-shadow: var(--shadow-lg); padding: var(--space-12); border: 1px solid var(--gray-200);">
                <h2 style="font-size: 2.5rem; font-weight: 700; color: var(--gray-900); margin-bottom: var(--space-8); text-align: center;">
                    Special Shipping Policies
                </h2>
                
                <div style="display: grid; gap: var(--space-6);">
                    <div style="border-left: 4px solid var(--primary-color); padding-left: var(--space-4);">
                        <h3 style="font-size: 1.25rem; font-weight: 600; color: var(--gray-900); margin-bottom: var(--space-2);">🎯 Pre-Orders</h3>
                        <p style="color: var(--gray-600); line-height: 1.6;">Pre-order items ship on their official release date. If your order contains both in-stock and pre-order items, we'll hold the entire order unless you request split shipping (additional shipping charges may apply).</p>
                    </div>
                    
                    <div style="border-left: 4px solid var(--accent-color); padding-left: var(--space-4);">
                        <h3 style="font-size: 1.25rem; font-weight: 600; color: var(--gray-900); margin-bottom: var(--space-2);">🏪 Local Pickup</h3>
                        <p style="color: var(--gray-600); line-height: 1.6;">Available for customers in the Greater Toronto Area. Orders are ready for pickup within 2-4 hours during business hours. We'll send you a confirmation email when your order is ready. Pickup available at both our Queen Street West and Yonge Street locations.</p>
                    </div>
                    
                    <div style="border-left: 4px solid var(--secondary-color); padding-left: var(--space-4);">
                        <h3 style="font-size: 1.25rem; font-weight: 600; color: var(--gray-900); margin-bottom: var(--space-2);">🌍 International Shipping</h3>
                        <p style="color: var(--gray-600); line-height: 1.6;">Currently, we only ship to Canada and the USA. We're working on expanding to other countries. International customers are responsible for customs duties, taxes, and any additional fees imposed by their country's customs office.</p>
                    </div>
                    
                    <div style="border-left: 4px solid var(--error-color); padding-left: var(--space-4);">
                        <h3 style="font-size: 1.25rem; font-weight: 600; color: var(--gray-900); margin-bottom: var(--space-2);">📦 Lost or Damaged Packages</h3>
                        <p style="color: var(--gray-600); line-height: 1.6;">If your package is lost or damaged during shipping, please contact us immediately. We'll work with the shipping carrier to resolve the issue and ensure you receive your cards. All packages include tracking and insurance for your protection.</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Contact Information -->
        <section style="margin-bottom: var(--space-16);">
            <div style="background: linear-gradient(135deg, var(--gray-900) 0%, var(--gray-800) 100%); border-radius: var(--radius-2xl); color: white; padding: var(--space-12); text-align: center;">
                <h2 style="font-size: 2.5rem; font-weight: 700; margin-bottom: var(--space-6);">
                    Questions About Shipping?
                </h2>
                <p style="font-size: 1.125rem; margin-bottom: var(--space-8); opacity: 0.9; max-width: 600px; margin-left: auto; margin-right: auto;">
                    Our customer service team is here to help with any shipping questions or concerns.
                </p>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: var(--space-6); margin-bottom: var(--space-8);">
                    <div>
                        <div style="font-size: 2rem; margin-bottom: var(--space-2);">📧</div>
                        <h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: var(--space-1);">Email Support</h3>
                        <p style="opacity: 0.8;">shipping@firelightduelacademy.com</p>
                    </div>
                    
                    <div>
                        <div style="font-size: 2rem; margin-bottom: var(--space-2);">📞</div>
                        <h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: var(--space-1);">Phone Support</h3>
                        <p style="opacity: 0.8;">(647) 555-DUEL</p>
                    </div>
                    
                    <div>
                        <div style="font-size: 2rem; margin-bottom: var(--space-2);">⏰</div>
                        <h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: var(--space-1);">Business Hours</h3>
                        <p style="opacity: 0.8;">Mon-Fri: 9 AM - 5 PM EST</p>
                    </div>
                </div>
                
                <div style="display: flex; gap: var(--space-4); justify-content: center; flex-wrap: wrap;">
                    <a href="mailto:shipping@firelightduelacademy.com" style="padding: var(--space-4) var(--space-8); background: var(--primary-color); color: white; text-decoration: none; border-radius: var(--radius-lg); font-weight: 600; transition: var(--transition-fast);">
                        Contact Support
                    </a>
                    <a href="#" onclick="navigateTo('singles')" style="padding: var(--space-4) var(--space-8); background: transparent; color: white; text-decoration: none; border-radius: var(--radius-lg); font-weight: 600; transition: var(--transition-fast); border: 1px solid rgba(255,255,255,0.3);">
                        Continue Shopping
                    </a>
                </div>
            </div>
        </section>
        `;
    }

    getReturnPolicyContent() {
        return `
        <!-- Page Header -->
        <section style="text-align: center; margin-bottom: var(--space-12);">
            <div style="background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%); border-radius: var(--radius-2xl); color: white; padding: var(--space-12); margin-bottom: var(--space-8);">
                <h1 style="font-size: 3rem; font-weight: 700; margin-bottom: var(--space-4);">
                    Return Policy
                </h1>
                <p style="font-size: 1.125rem; opacity: 0.9; max-width: 600px; margin: 0 auto;">
                    Your satisfaction is our priority. Learn about our flexible return and refund policies.
                </p>
            </div>
        </section>

        <!-- Quick Reference -->
        <section style="margin-bottom: var(--space-16);">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: var(--space-6);">
                <div style="background: white; border-radius: var(--radius-xl); box-shadow: var(--shadow-lg); padding: var(--space-6); text-align: center; border: 1px solid var(--gray-200);">
                    <div style="font-size: 3rem; margin-bottom: var(--space-3);">📅</div>
                    <h3 style="font-size: 1.25rem; font-weight: 600; color: var(--gray-900); margin-bottom: var(--space-2);">30-Day Returns</h3>
                    <p style="color: var(--gray-600);">Return most items within 30 days</p>
                    <p style="color: var(--gray-600);">of purchase for full refund</p>
                </div>
                
                <div style="background: white; border-radius: var(--radius-xl); box-shadow: var(--shadow-lg); padding: var(--space-6); text-align: center; border: 1px solid var(--gray-200);">
                    <div style="font-size: 3rem; margin-bottom: var(--space-3);">💳</div>
                    <h3 style="font-size: 1.25rem; font-weight: 600; color: var(--gray-900); margin-bottom: var(--space-2);">Easy Refunds</h3>
                    <p style="color: var(--gray-600);">Refunds processed within 3-5 business days</p>
                    <p style="color: var(--gray-600);">to original payment method</p>
                </div>
                
                <div style="background: white; border-radius: var(--radius-xl); box-shadow: var(--shadow-lg); padding: var(--space-6); text-align: center; border: 1px solid var(--gray-200);">
                    <div style="font-size: 3rem; margin-bottom: var(--space-3);">🔄</div>
                    <h3 style="font-size: 1.25rem; font-weight: 600; color: var(--gray-900); margin-bottom: var(--space-2);">Free Exchanges</h3>
                    <p style="color: var(--gray-600);">Exchange for different condition</p>
                    <p style="color: var(--gray-600);">or set at no extra cost</p>
                </div>
                
                <div style="background: white; border-radius: var(--radius-xl); box-shadow: var(--shadow-lg); padding: var(--space-6); text-align: center; border: 1px solid var(--gray-200);">
                    <div style="font-size: 3rem; margin-bottom: var(--space-3);">🛡️</div>
                    <h3 style="font-size: 1.25rem; font-weight: 600; color: var(--gray-900); margin-bottom: var(--space-2);">Condition Guarantee</h3>
                    <p style="color: var(--gray-600);">Cards not as described?</p>
                    <p style="color: var(--gray-600);">Full refund guaranteed</p>
                </div>
            </div>
        </section>

        <!-- Return Eligibility -->
        <section style="margin-bottom: var(--space-16);">
            <div style="background: white; border-radius: var(--radius-2xl); box-shadow: var(--shadow-lg); padding: var(--space-12); border: 1px solid var(--gray-200);">
                <h2 style="font-size: 2.5rem; font-weight: 700; color: var(--gray-900); margin-bottom: var(--space-8); text-align: center;">
                    Return Eligibility
                </h2>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-8);">
                    <div>
                        <h3 style="font-size: 1.5rem; font-weight: 600; color: var(--success-color); margin-bottom: var(--space-4);">✅ Returnable Items</h3>
                        <ul style="list-style: none; padding: 0; margin: 0;">
                            <li style="padding: var(--space-3); border-bottom: 1px solid var(--gray-200); display: flex; align-items: center; gap: var(--space-3);">
                                <span style="color: var(--success-color);">✓</span>
                                <span>Single cards in original condition</span>
                            </li>
                            <li style="padding: var(--space-3); border-bottom: 1px solid var(--gray-200); display: flex; align-items: center; gap: var(--space-3);">
                                <span style="color: var(--success-color);">✓</span>
                                <span>Sealed products (unopened)</span>
                            </li>
                            <li style="padding: var(--space-3); border-bottom: 1px solid var(--gray-200); display: flex; align-items: center; gap: var(--space-3);">
                                <span style="color: var(--success-color);">✓</span>
                                <span>Accessories and supplies</span>
                            </li>
                            <li style="padding: var(--space-3); border-bottom: 1px solid var(--gray-200); display: flex; align-items: center; gap: var(--space-3);">
                                <span style="color: var(--success-color);">✓</span>
                                <span>Items not as described</span>
                            </li>
                            <li style="padding: var(--space-3); display: flex; align-items: center; gap: var(--space-3);">
                                <span style="color: var(--success-color);">✓</span>
                                <span>Damaged during shipping</span>
                            </li>
                        </ul>
                    </div>
                    
                    <div>
                        <h3 style="font-size: 1.5rem; font-weight: 600; color: var(--error-color); margin-bottom: var(--space-4);">❌ Non-Returnable Items</h3>
                        <ul style="list-style: none; padding: 0; margin: 0;">
                            <li style="padding: var(--space-3); border-bottom: 1px solid var(--gray-200); display: flex; align-items: center; gap: var(--space-3);">
                                <span style="color: var(--error-color);">✗</span>
                                <span>Opened booster packs or boxes</span>
                            </li>
                            <li style="padding: var(--space-3); border-bottom: 1px solid var(--gray-200); display: flex; align-items: center; gap: var(--space-3);">
                                <span style="color: var(--error-color);">✗</span>
                                <span>Cards damaged by customer</span>
                            </li>
                            <li style="padding: var(--space-3); border-bottom: 1px solid var(--gray-200); display: flex; align-items: center; gap: var(--space-3);">
                                <span style="color: var(--error-color);">✗</span>
                                <span>Items returned after 30 days</span>
                            </li>
                            <li style="padding: var(--space-3); border-bottom: 1px solid var(--gray-200); display: flex; align-items: center; gap: var(--space-3);">
                                <span style="color: var(--error-color);">✗</span>
                                <span>Custom or special orders</span>
                            </li>
                            <li style="padding: var(--space-3); display: flex; align-items: center; gap: var(--space-3);">
                                <span style="color: var(--error-color);">✗</span>
                                <span>Items without original packaging</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>

        <!-- Return Process -->
        <section style="margin-bottom: var(--space-16);">
            <div style="background: white; border-radius: var(--radius-2xl); box-shadow: var(--shadow-lg); padding: var(--space-12); border: 1px solid var(--gray-200);">
                <h2 style="font-size: 2.5rem; font-weight: 700; color: var(--gray-900); margin-bottom: var(--space-8); text-align: center;">
                    How to Return Items
                </h2>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: var(--space-6);">
                    <div style="text-align: center; padding: var(--space-6); border: 1px solid var(--gray-200); border-radius: var(--radius-lg);">
                        <div style="width: 60px; height: 60px; background: var(--primary-color); color: white; border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; margin: 0 auto var(--space-4); font-size: 1.5rem; font-weight: 700;">1</div>
                        <h3 style="font-size: 1.25rem; font-weight: 600; color: var(--gray-900); margin-bottom: var(--space-3);">Contact Us</h3>
                        <p style="color: var(--gray-600); line-height: 1.6;">Email us at returns@firelightduelacademy.com or call (647) 555-DUEL to initiate your return.</p>
                    </div>
                    
                    <div style="text-align: center; padding: var(--space-6); border: 1px solid var(--gray-200); border-radius: var(--radius-lg);">
                        <div style="width: 60px; height: 60px; background: var(--primary-color); color: white; border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; margin: 0 auto var(--space-4); font-size: 1.5rem; font-weight: 700;">2</div>
                        <h3 style="font-size: 1.25rem; font-weight: 600; color: var(--gray-900); margin-bottom: var(--space-3);">Get RMA Number</h3>
                        <p style="color: var(--gray-600); line-height: 1.6;">We'll provide you with a Return Merchandise Authorization (RMA) number and return instructions.</p>
                    </div>
                    
                    <div style="text-align: center; padding: var(--space-6); border: 1px solid var(--gray-200); border-radius: var(--radius-lg);">
                        <div style="width: 60px; height: 60px; background: var(--primary-color); color: white; border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; margin: 0 auto var(--space-4); font-size: 1.5rem; font-weight: 700;">3</div>
                        <h3 style="font-size: 1.25rem; font-weight: 600; color: var(--gray-900); margin-bottom: var(--space-3);">Package & Ship</h3>
                        <p style="color: var(--gray-600); line-height: 1.6;">Securely package your items with the RMA number and ship to our returns center using the provided label.</p>
                    </div>
                    
                    <div style="text-align: center; padding: var(--space-6); border: 1px solid var(--gray-200); border-radius: var(--radius-lg);">
                        <div style="width: 60px; height: 60px; background: var(--primary-color); color: white; border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; margin: 0 auto var(--space-4); font-size: 1.5rem; font-weight: 700;">4</div>
                        <h3 style="font-size: 1.25rem; font-weight: 600; color: var(--gray-900); margin-bottom: var(--space-3);">Receive Refund</h3>
                        <p style="color: var(--gray-600); line-height: 1.6;">Once we receive and inspect your return, we'll process your refund within 3-5 business days.</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Contact Information -->
        <section style="margin-bottom: var(--space-16);">
            <div style="background: linear-gradient(135deg, var(--gray-900) 0%, var(--gray-800) 100%); border-radius: var(--radius-2xl); color: white; padding: var(--space-12); text-align: center;">
                <h2 style="font-size: 2.5rem; font-weight: 700; margin-bottom: var(--space-6);">
                    Need Help with a Return?
                </h2>
                <p style="font-size: 1.125rem; margin-bottom: var(--space-8); opacity: 0.9; max-width: 600px; margin-left: auto; margin-right: auto;">
                    Our customer service team is ready to assist you with any return questions.
                </p>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: var(--space-6); margin-bottom: var(--space-8);">
                    <div>
                        <div style="font-size: 2rem; margin-bottom: var(--space-2);">📧</div>
                        <h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: var(--space-1);">Returns Email</h3>
                        <p style="opacity: 0.8;">returns@firelightduelacademy.com</p>
                    </div>
                    
                    <div>
                        <div style="font-size: 2rem; margin-bottom: var(--space-2);">📞</div>
                        <h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: var(--space-1);">Phone Support</h3>
                        <p style="opacity: 0.8;">(647) 555-DUEL</p>
                    </div>
                    
                    <div>
                        <div style="font-size: 2rem; margin-bottom: var(--space-2);">⏰</div>
                        <h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: var(--space-1);">Support Hours</h3>
                        <p style="opacity: 0.8;">Mon-Fri: 9 AM - 5 PM EST</p>
                    </div>
                </div>
                
                <div style="display: flex; gap: var(--space-4); justify-content: center; flex-wrap: wrap;">
                    <a href="mailto:returns@firelightduelacademy.com" style="padding: var(--space-4) var(--space-8); background: var(--primary-color); color: white; text-decoration: none; border-radius: var(--radius-lg); font-weight: 600; transition: var(--transition-fast);">
                        Start Return
                    </a>
                    <a href="#" onclick="navigateTo('faq')" style="padding: var(--space-4) var(--space-8); background: transparent; color: white; text-decoration: none; border-radius: var(--radius-lg); font-weight: 600; transition: var(--transition-fast); border: 1px solid rgba(255,255,255,0.3);">
                        View FAQ
                    </a>
                </div>
            </div>
        </section>
        `;
    }

    getFAQContent() {
        return `
        <!-- Page Header -->
        <section style="text-align: center; margin-bottom: var(--space-12);">
            <div style="background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%); border-radius: var(--radius-2xl); color: white; padding: var(--space-12); margin-bottom: var(--space-8);">
                <h1 style="font-size: 3rem; font-weight: 700; margin-bottom: var(--space-4);">
                    Frequently Asked Questions
                </h1>
                <p style="font-size: 1.125rem; opacity: 0.9; max-width: 600px; margin: 0 auto;">
                    Find answers to common questions about ordering, shipping, cards, and our services.
                </p>
            </div>
        </section>

        <!-- Quick Help Cards -->
        <section style="margin-bottom: var(--space-16);">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: var(--space-6);">
                <div style="background: white; border-radius: var(--radius-xl); box-shadow: var(--shadow-lg); padding: var(--space-6); text-align: center; border: 1px solid var(--gray-200);">
                    <div style="font-size: 3rem; margin-bottom: var(--space-3);">🛒</div>
                    <h3 style="font-size: 1.25rem; font-weight: 600; color: var(--gray-900); margin-bottom: var(--space-2);">Ordering Help</h3>
                    <p style="color: var(--gray-600);">Questions about placing orders,</p>
                    <p style="color: var(--gray-600);">payment methods, and checkout</p>
                </div>
                
                <div style="background: white; border-radius: var(--radius-xl); box-shadow: var(--shadow-lg); padding: var(--space-6); text-align: center; border: 1px solid var(--gray-200);">
                    <div style="font-size: 3rem; margin-bottom: var(--space-3);">🚚</div>
                    <h3 style="font-size: 1.25rem; font-weight: 600; color: var(--gray-900); margin-bottom: var(--space-2);">Shipping Info</h3>
                    <p style="color: var(--gray-600);">Delivery times, tracking,</p>
                    <p style="color: var(--gray-600);">and shipping costs</p>
                </div>
                
                <div style="background: white; border-radius: var(--radius-xl); box-shadow: var(--shadow-lg); padding: var(--space-6); text-align: center; border: 1px solid var(--gray-200);">
                    <div style="font-size: 3rem; margin-bottom: var(--space-3);">🃏</div>
                    <h3 style="font-size: 1.25rem; font-weight: 600; color: var(--gray-900); margin-bottom: var(--space-2);">Card Conditions</h3>
                    <p style="color: var(--gray-600);">Understanding card grades,</p>
                    <p style="color: var(--gray-600);">authenticity, and quality</p>
                </div>
                
                <div style="background: white; border-radius: var(--radius-xl); box-shadow: var(--shadow-lg); padding: var(--space-6); text-align: center; border: 1px solid var(--gray-200);">
                    <div style="font-size: 3rem; margin-bottom: var(--space-3);">🔄</div>
                    <h3 style="font-size: 1.25rem; font-weight: 600; color: var(--gray-900); margin-bottom: var(--space-2);">Returns & Refunds</h3>
                    <p style="color: var(--gray-600);">Return policies, exchanges,</p>
                    <p style="color: var(--gray-600);">and refund processes</p>
                </div>
            </div>
        </section>

        <!-- Ordering FAQ -->
        <section style="margin-bottom: var(--space-16);">
            <div style="background: white; border-radius: var(--radius-2xl); box-shadow: var(--shadow-lg); padding: var(--space-12); border: 1px solid var(--gray-200);">
                <h2 style="font-size: 2.5rem; font-weight: 700; color: var(--gray-900); margin-bottom: var(--space-8); text-align: center;">
                    🛒 Ordering Questions
                </h2>
                
                <div style="display: grid; gap: var(--space-4);">
                    <div style="border: 1px solid var(--gray-200); border-radius: var(--radius-lg); overflow: hidden;">
                        <button style="width: 100%; padding: var(--space-4); background: var(--gray-50); border: none; text-align: left; font-weight: 600; color: var(--gray-900); cursor: pointer; display: flex; justify-content: space-between; align-items: center;" onclick="toggleFAQ(this)">
                            How do I place an order?
                            <span style="font-size: 1.5rem;">+</span>
                        </button>
                        <div style="padding: var(--space-4); display: none;">
                            <p style="color: var(--gray-700); line-height: 1.6; margin-bottom: var(--space-3);">Placing an order is simple:</p>
                            <ol style="color: var(--gray-700); line-height: 1.6; margin-left: var(--space-4);">
                                <li>Browse our singles collection using the search bar or filters</li>
                                <li>Click on any card to view details, condition, and pricing</li>
                                <li>Select your preferred condition and quantity, then click "Add to Cart"</li>
                                <li>Review your cart and proceed to checkout</li>
                                <li>Enter shipping information and payment details</li>
                                <li>Confirm your order and receive an email confirmation</li>
                            </ol>
                            <p style="color: var(--gray-700); line-height: 1.6; margin-top: var(--space-3);">You can create an account for faster future orders or checkout as a guest. All payments are processed securely.</p>
                        </div>
                    </div>
                    
                    <div style="border: 1px solid var(--gray-200); border-radius: var(--radius-lg); overflow: hidden;">
                        <button style="width: 100%; padding: var(--space-4); background: var(--gray-50); border: none; text-align: left; font-weight: 600; color: var(--gray-900); cursor: pointer; display: flex; justify-content: space-between; align-items: center;" onclick="toggleFAQ(this)">
                            What payment methods do you accept?
                            <span style="font-size: 1.5rem;">+</span>
                        </button>
                        <div style="padding: var(--space-4); display: none;">
                            <p style="color: var(--gray-700); line-height: 1.6; margin-bottom: var(--space-3);">We accept multiple secure payment methods:</p>
                            <ul style="color: var(--gray-700); line-height: 1.6; margin-left: var(--space-4);">
                                <li><strong>Credit Cards:</strong> Visa, Mastercard, American Express, Discover</li>
                                <li><strong>Digital Wallets:</strong> PayPal, Apple Pay, Google Pay</li>
                                <li><strong>Store Credit:</strong> Earned from returns or promotions</li>
                                <li><strong>Interac e-Transfer:</strong> For Canadian customers</li>
                            </ul>
                            <p style="color: var(--gray-700); line-height: 1.6; margin-top: var(--space-3);">All payments are processed through our encrypted checkout system with SSL protection. We never store your payment information on our servers.</p>
                        </div>
                    </div>
                    
                    <div style="border: 1px solid var(--gray-200); border-radius: var(--radius-lg); overflow: hidden;">
                        <button style="width: 100%; padding: var(--space-4); background: var(--gray-50); border: none; text-align: left; font-weight: 600; color: var(--gray-900); cursor: pointer; display: flex; justify-content: space-between; align-items: center;" onclick="toggleFAQ(this)">
                            Can I modify or cancel my order?
                            <span style="font-size: 1.5rem;">+</span>
                        </button>
                        <div style="padding: var(--space-4); display: none;">
                            <p style="color: var(--gray-700); line-height: 1.6; margin-bottom: var(--space-3);">Order modifications depend on the processing status:</p>
                            <ul style="color: var(--gray-700); line-height: 1.6; margin-left: var(--space-4);">
                                <li><strong>Within 2 hours:</strong> Full modifications or cancellations available</li>
                                <li><strong>After 2 hours:</strong> Limited changes possible if not yet shipped</li>
                                <li><strong>After shipping:</strong> Changes not possible, but returns are accepted</li>
                            </ul>
                            <p style="color: var(--gray-700); line-height: 1.6; margin-top: var(--space-3);">To request changes, contact us immediately at (647) 555-DUEL or orders@firelightduelacademy.com with your order number. Our team processes orders quickly, so early contact is essential.</p>
                        </div>
                    </div>
                    
                    <div style="border: 1px solid var(--gray-200); border-radius: var(--radius-lg); overflow: hidden;">
                        <button style="width: 100%; padding: var(--space-4); background: var(--gray-50); border: none; text-align: left; font-weight: 600; color: var(--gray-900); cursor: pointer; display: flex; justify-content: space-between; align-items: center;" onclick="toggleFAQ(this)">
                            Do you offer bulk discounts?
                            <span style="font-size: 1.5rem;">+</span>
                        </button>
                        <div style="padding: var(--space-4); display: none;">
                            <p style="color: var(--gray-700); line-height: 1.6; margin-bottom: var(--space-3);">Yes! We offer several bulk discount options:</p>
                            <ul style="color: var(--gray-700); line-height: 1.6; margin-left: var(--space-4);">
                                <li><strong>$500+ CAD:</strong> 5% discount on entire order</li>
                                <li><strong>$1000+ CAD:</strong> 8% discount on entire order</li>
                                <li><strong>$2000+ CAD:</strong> 12% discount + free expedited shipping</li>
                                <li><strong>Complete Deck Builds:</strong> Custom pricing available</li>
                                <li><strong>Store Inventory:</strong> Wholesale pricing for retailers</li>
                            </ul>
                            <p style="color: var(--gray-700); line-height: 1.6; margin-top: var(--space-3);">Educational institutions, tournament organizers, and content creators may qualify for additional discounts. Contact us at bulk@firelightduelacademy.com for custom quotes.</p>
                        </div>
                    </div>
                    
                    <div style="border: 1px solid var(--gray-200); border-radius: var(--radius-lg); overflow: hidden;">
                        <button style="width: 100%; padding: var(--space-4); background: var(--gray-50); border: none; text-align: left; font-weight: 600; color: var(--gray-900); cursor: pointer; display: flex; justify-content: space-between; align-items: center;" onclick="toggleFAQ(this)">
                            How do I track my order?
                            <span style="font-size: 1.5rem;">+</span>
                        </button>
                        <div style="padding: var(--space-4); display: none;">
                            <p style="color: var(--gray-700); line-height: 1.6; margin-bottom: var(--space-3);">Tracking your order is easy with multiple options:</p>
                            <ul style="color: var(--gray-700); line-height: 1.6; margin-left: var(--space-4);">
                                <li><strong>Email Updates:</strong> Automatic notifications at each shipping milestone</li>
                                <li><strong>Account Dashboard:</strong> Real-time status updates when logged in</li>
                                <li><strong>Tracking Number:</strong> Direct carrier tracking via Canada Post or courier</li>
                                <li><strong>SMS Notifications:</strong> Optional text updates (opt-in during checkout)</li>
                            </ul>
                            <p style="color: var(--gray-700); line-height: 1.6; margin-top: var(--space-3);">All orders include tracking at no extra cost. You'll receive your tracking number within 24 hours of shipment, usually much sooner.</p>
                        </div>
                    </div>
                    
                    <div style="border: 1px solid var(--gray-200); border-radius: var(--radius-lg); overflow: hidden;">
                        <button style="width: 100%; padding: var(--space-4); background: var(--gray-50); border: none; text-align: left; font-weight: 600; color: var(--gray-900); cursor: pointer; display: flex; justify-content: space-between; align-items: center;" onclick="toggleFAQ(this)">
                            What if an item is out of stock?
                            <span style="font-size: 1.5rem;">+</span>
                        </button>
                        <div style="padding: var(--space-4); display: none;">
                            <p style="color: var(--gray-700); line-height: 1.6; margin-bottom: var(--space-3);">When items are out of stock, you have several options:</p>
                            <ul style="color: var(--gray-700); line-height: 1.6; margin-left: var(--space-4);">
                                <li><strong>Wishlist:</strong> Add items to your wishlist for restock notifications</li>
                                <li><strong>Backorder:</strong> Pre-order items with expected restock dates</li>
                                <li><strong>Substitutions:</strong> We can suggest similar cards or different conditions</li>
                                <li><strong>Partial Shipment:</strong> Ship available items now, rest when restocked</li>
                            </ul>
                            <p style="color: var(--gray-700); line-height: 1.6; margin-top: var(--space-3);">Our inventory updates in real-time, but high-demand cards can sell quickly. We restock popular items weekly and can often source specific cards within 1-2 weeks.</p>
                        </div>
                    </div>
                    
                    <div style="border: 1px solid var(--gray-200); border-radius: var(--radius-lg); overflow: hidden;">
                        <button style="width: 100%; padding: var(--space-4); background: var(--gray-50); border: none; text-align: left; font-weight: 600; color: var(--gray-900); cursor: pointer; display: flex; justify-content: space-between; align-items: center;" onclick="toggleFAQ(this)">
                            Do you price match?
                            <span style="font-size: 1.5rem;">+</span>
                        </button>
                        <div style="padding: var(--space-4); display: none;">
                            <p style="color: var(--gray-700); line-height: 1.6; margin-bottom: var(--space-3);">We offer competitive price matching on identical items:</p>
                            <ul style="color: var(--gray-700); line-height: 1.6; margin-left: var(--space-4);">
                                <li><strong>Requirements:</strong> Same card, condition, and set from authorized retailers</li>
                                <li><strong>Verification:</strong> Provide link or screenshot of competitor's price</li>
                                <li><strong>Exclusions:</strong> Auction sites, damaged items, or clearance sales</li>
                                <li><strong>Time Limit:</strong> Must be requested before order completion</li>
                            </ul>
                            <p style="color: var(--gray-700); line-height: 1.6; margin-top: var(--space-3);">Contact us at pricematch@firelightduelacademy.com with your request. We'll match legitimate prices and often beat them by 5% when possible.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Shipping FAQ -->
        <section style="margin-bottom: var(--space-16);">
            <div style="background: white; border-radius: var(--radius-2xl); box-shadow: var(--shadow-lg); padding: var(--space-12); border: 1px solid var(--gray-200);">
                <h2 style="font-size: 2.5rem; font-weight: 700; color: var(--gray-900); margin-bottom: var(--space-8); text-align: center;">
                    🚚 Shipping Questions
                </h2>
                
                <div style="display: grid; gap: var(--space-4);">
                    <div style="border: 1px solid var(--gray-200); border-radius: var(--radius-lg); overflow: hidden;">
                        <button style="width: 100%; padding: var(--space-4); background: var(--gray-50); border: none; text-align: left; font-weight: 600; color: var(--gray-900); cursor: pointer; display: flex; justify-content: space-between; align-items: center;" onclick="toggleFAQ(this)">
                            How much does shipping cost?
                            <span style="font-size: 1.5rem;">+</span>
                        </button>
                        <div style="padding: var(--space-4); display: none;">
                            <p style="color: var(--gray-700); line-height: 1.6; margin-bottom: var(--space-3);">Our shipping rates are competitive and transparent:</p>
                            <ul style="color: var(--gray-700); line-height: 1.6; margin-left: var(--space-4);">
                                <li><strong>Canada Standard:</strong> $8.99 CAD (FREE on orders $75+)</li>
                                <li><strong>Canada Expedited:</strong> $15.99 CAD (2-3 business days)</li>
                                <li><strong>Canada Express:</strong> $24.99 CAD (1-2 business days)</li>
                                <li><strong>USA Standard:</strong> $12.99 CAD (FREE on orders $100+)</li>
                                <li><strong>USA Expedited:</strong> $22.99 CAD (5-8 business days)</li>
                                <li><strong>Local Pickup (GTA):</strong> FREE</li>
                            </ul>
                            <p style="color: var(--gray-700); line-height: 1.6; margin-top: var(--space-3);">All orders include tracking and insurance. High-value orders over $200 CAD automatically include signature confirmation.</p>
                        </div>
                    </div>
                    
                    <div style="border: 1px solid var(--gray-200); border-radius: var(--radius-lg); overflow: hidden;">
                        <button style="width: 100%; padding: var(--space-4); background: var(--gray-50); border: none; text-align: left; font-weight: 600; color: var(--gray-900); cursor: pointer; display: flex; justify-content: space-between; align-items: center;" onclick="toggleFAQ(this)">
                            How long does shipping take?
                            <span style="font-size: 1.5rem;">+</span>
                        </button>
                        <div style="padding: var(--space-4); display: none;">
                            <p style="color: var(--gray-700); line-height: 1.6; margin-bottom: var(--space-3);">Delivery times vary by location and service level:</p>
                            <ul style="color: var(--gray-700); line-height: 1.6; margin-left: var(--space-4);">
                                <li><strong>Canada Standard:</strong> 3-7 business days</li>
                                <li><strong>Canada Expedited:</strong> 2-3 business days</li>
                                <li><strong>Canada Express:</strong> 1-2 business days</li>
                                <li><strong>USA Standard:</strong> 7-14 business days</li>
                                <li><strong>USA Expedited:</strong> 5-8 business days</li>
                                <li><strong>USA Express:</strong> 3-5 business days</li>
                            </ul>
                            <p style="color: var(--gray-700); line-height: 1.6; margin-top: var(--space-3);">Orders placed before 2 PM EST ship the same day. Weekend orders are processed on the next business day. Remote areas may require additional 1-2 days.</p>
                        </div>
                    </div>
                    
                    <div style="border: 1px solid var(--gray-200); border-radius: var(--radius-lg); overflow: hidden;">
                        <button style="width: 100%; padding: var(--space-4); background: var(--gray-50); border: none; text-align: left; font-weight: 600; color: var(--gray-900); cursor: pointer; display: flex; justify-content: space-between; align-items: center;" onclick="toggleFAQ(this)">
                            Do you ship internationally?
                            <span style="font-size: 1.5rem;">+</span>
                        </button>
                        <div style="padding: var(--space-4); display: none;">
                            <p style="color: var(--gray-700); line-height: 1.6; margin-bottom: var(--space-3);">Currently, we ship to Canada and the USA only. We're actively working on expanding to other countries including:</p>
                            <ul style="color: var(--gray-700); line-height: 1.6; margin-left: var(--space-4);">
                                <li><strong>Coming Soon:</strong> United Kingdom, Australia, Japan</li>
                                <li><strong>Under Review:</strong> European Union countries</li>
                                <li><strong>Future Plans:</strong> Additional international markets</li>
                            </ul>
                            <p style="color: var(--gray-700); line-height: 1.6; margin-top: var(--space-3);">International customers are responsible for customs duties, taxes, and any additional fees imposed by their country's customs office. We'll notify our mailing list when international shipping becomes available.</p>
                        </div>
                    </div>
                    
                    <div style="border: 1px solid var(--gray-200); border-radius: var(--radius-lg); overflow: hidden;">
                        <button style="width: 100%; padding: var(--space-4); background: var(--gray-50); border: none; text-align: left; font-weight: 600; color: var(--gray-900); cursor: pointer; display: flex; justify-content: space-between; align-items: center;" onclick="toggleFAQ(this)">
                            How are cards protected during shipping?
                            <span style="font-size: 1.5rem;">+</span>
                        </button>
                        <div style="padding: var(--space-4); display: none;">
                            <p style="color: var(--gray-700); line-height: 1.6; margin-bottom: var(--space-3);">We take card protection seriously with multiple layers of security:</p>
                            <ul style="color: var(--gray-700); line-height: 1.6; margin-left: var(--space-4);">
                                <li><strong>Individual Protection:</strong> Every card in protective toploader or sleeve</li>
                                <li><strong>Team Bags:</strong> High-value cards get additional team bag protection</li>
                                <li><strong>Bubble Mailers:</strong> Padded envelopes for all orders</li>
                                <li><strong>Fragile Marking:</strong> High-value packages marked as fragile</li>
                                <li><strong>Signature Required:</strong> Orders over $200 CAD require signature</li>
                                <li><strong>Insurance:</strong> All packages include tracking and insurance</li>
                            </ul>
                            <p style="color: var(--gray-700); line-height: 1.6; margin-top: var(--space-3);">We've shipped thousands of cards with a 99.8% safe delivery rate. If anything arrives damaged, we'll make it right immediately.</p>
                        </div>
                    </div>
                    
                    <div style="border: 1px solid var(--gray-200); border-radius: var(--radius-lg); overflow: hidden;">
                        <button style="width: 100%; padding: var(--space-4); background: var(--gray-50); border: none; text-align: left; font-weight: 600; color: var(--gray-900); cursor: pointer; display: flex; justify-content: space-between; align-items: center;" onclick="toggleFAQ(this)">
                            What if my package is lost or damaged?
                            <span style="font-size: 1.5rem;">+</span>
                        </button>
                        <div style="padding: var(--space-4); display: none;">
                            <p style="color: var(--gray-700); line-height: 1.6; margin-bottom: var(--space-3);">We stand behind every shipment and will resolve any issues:</p>
                            <ul style="color: var(--gray-700); line-height: 1.6; margin-left: var(--space-4);">
                                <li><strong>Lost Packages:</strong> We'll file insurance claims and send replacements</li>
                                <li><strong>Damaged Items:</strong> Full refund or replacement at your choice</li>
                                <li><strong>Delayed Delivery:</strong> We'll track down your package and provide updates</li>
                                <li><strong>Wrong Address:</strong> We'll help redirect packages when possible</li>
                            </ul>
                            <p style="color: var(--gray-700); line-height: 1.6; margin-top: var(--space-3);">Contact us immediately at shipping@firelightduelacademy.com or (647) 555-DUEL if you experience any shipping issues. We typically resolve problems within 24 hours.</p>
                        </div>
                    </div>
                    
                    <div style="border: 1px solid var(--gray-200); border-radius: var(--radius-lg); overflow: hidden;">
                        <button style="width: 100%; padding: var(--space-4); background: var(--gray-50); border: none; text-align: left; font-weight: 600; color: var(--gray-900); cursor: pointer; display: flex; justify-content: space-between; align-items: center;" onclick="toggleFAQ(this)">
                            Can I change my shipping address after ordering?
                            <span style="font-size: 1.5rem;">+</span>
                        </button>
                        <div style="padding: var(--space-4); display: none;">
                            <p style="color: var(--gray-700); line-height: 1.6; margin-bottom: var(--space-3);">Address changes depend on order status:</p>
                            <ul style="color: var(--gray-700); line-height: 1.6; margin-left: var(--space-4);">
                                <li><strong>Before Processing:</strong> Full address changes available (within 2 hours)</li>
                                <li><strong>After Processing:</strong> Limited to same city/postal code changes</li>
                                <li><strong>After Shipping:</strong> Contact carrier directly for delivery changes</li>
                                <li><strong>Emergency Changes:</strong> We'll do our best to help with urgent requests</li>
                            </ul>
                            <p style="color: var(--gray-700); line-height: 1.6; margin-top: var(--space-3);">Contact us immediately at orders@firelightduelacademy.com with your order number and new address. The sooner you contact us, the more options we have to help.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Card Condition FAQ -->
        <section style="margin-bottom: var(--space-16);">
            <div style="background: white; border-radius: var(--radius-2xl); box-shadow: var(--shadow-lg); padding: var(--space-12); border: 1px solid var(--gray-200);">
                <h2 style="font-size: 2.5rem; font-weight: 700; color: var(--gray-900); margin-bottom: var(--space-8); text-align: center;">
                    🃏 Card Condition & Quality
                </h2>
                
                <div style="display: grid; gap: var(--space-4);">
                    <div style="border: 1px solid var(--gray-200); border-radius: var(--radius-lg); overflow: hidden;">
                        <button style="width: 100%; padding: var(--space-4); background: var(--gray-50); border: none; text-align: left; font-weight: 600; color: var(--gray-900); cursor: pointer; display: flex; justify-content: space-between; align-items: center;" onclick="toggleFAQ(this)">
                            What do the condition grades mean?
                            <span style="font-size: 1.5rem;">+</span>
                        </button>
                        <div style="padding: var(--space-4); display: none;">
                            <p style="color: var(--gray-700); line-height: 1.6; margin-bottom: var(--space-3);"><strong>Near Mint (NM):</strong> Cards appear fresh from pack with minimal wear. May have very slight edge wear or minor printing imperfections.</p>
                            <p style="color: var(--gray-700); line-height: 1.6; margin-bottom: var(--space-3);"><strong>Lightly Played (LP):</strong> Light edge wear, slight corner wear, or minor scratches. Still tournament playable.</p>
                            <p style="color: var(--gray-700); line-height: 1.6; margin-bottom: var(--space-3);"><strong>Moderately Played (MP):</strong> Moderate edge/corner wear, light scratches, or minor creases. Playable with sleeves.</p>
                            <p style="color: var(--gray-700); line-height: 1.6;"><strong>Heavily Played (HP) / Damaged (DMG):</strong> Significant wear, creases, or damage. Priced for collectors or casual play.</p>
                        </div>
                    </div>
                    
                    <div style="border: 1px solid var(--gray-200); border-radius: var(--radius-lg); overflow: hidden;">
                        <button style="width: 100%; padding: var(--space-4); background: var(--gray-50); border: none; text-align: left; font-weight: 600; color: var(--gray-900); cursor: pointer; display: flex; justify-content: space-between; align-items: center;" onclick="toggleFAQ(this)">
                            Are all cards authentic?
                            <span style="font-size: 1.5rem;">+</span>
                        </button>
                        <div style="padding: var(--space-4); display: none;">
                            <p style="color: var(--gray-700); line-height: 1.6;">Yes, we guarantee 100% authentic Yu-Gi-Oh! cards. All cards are sourced from official distributors and verified for authenticity. We do not sell proxy, counterfeit, or reproduction cards.</p>
                        </div>
                    </div>
                    
                    <div style="border: 1px solid var(--gray-200); border-radius: var(--radius-lg); overflow: hidden;">
                        <button style="width: 100%; padding: var(--space-4); background: var(--gray-50); border: none; text-align: left; font-weight: 600; color: var(--gray-900); cursor: pointer; display: flex; justify-content: space-between; align-items: center;" onclick="toggleFAQ(this)">
                            What if a card arrives in worse condition than described?
                            <span style="font-size: 1.5rem;">+</span>
                        </button>
                        <div style="padding: var(--space-4); display: none;">
                            <p style="color: var(--gray-700); line-height: 1.6;">If a card doesn't match our condition description, contact us within 7 days for a full refund or replacement. We stand behind our condition grading and want you to be completely satisfied.</p>
                        </div>
                    </div>
                    
                    <div style="border: 1px solid var(--gray-200); border-radius: var(--radius-lg); overflow: hidden;">
                        <button style="width: 100%; padding: var(--space-4); background: var(--gray-50); border: none; text-align: left; font-weight: 600; color: var(--gray-900); cursor: pointer; display: flex; justify-content: space-between; align-items: center;" onclick="toggleFAQ(this)">
                            Do you offer grading services?
                            <span style="font-size: 1.5rem;">+</span>
                        </button>
                        <div style="padding: var(--space-4); display: none;">
                            <p style="color: var(--gray-700); line-height: 1.6;">Currently, we don't offer in-house grading services, but we can recommend trusted grading companies like PSA and BGS. We do carry some pre-graded cards from these services.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Returns & Account FAQ -->
        <section style="margin-bottom: var(--space-16);">
            <div style="background: white; border-radius: var(--radius-2xl); box-shadow: var(--shadow-lg); padding: var(--space-12); border: 1px solid var(--gray-200);">
                <h2 style="font-size: 2.5rem; font-weight: 700; color: var(--gray-900); margin-bottom: var(--space-8); text-align: center;">
                    🔄 Returns & Account
                </h2>
                
                <div style="display: grid; gap: var(--space-4);">
                    <div style="border: 1px solid var(--gray-200); border-radius: var(--radius-lg); overflow: hidden;">
                        <button style="width: 100%; padding: var(--space-4); background: var(--gray-50); border: none; text-align: left; font-weight: 600; color: var(--gray-900); cursor: pointer; display: flex; justify-content: space-between; align-items: center;" onclick="toggleFAQ(this)">
                            How do I create an account?
                            <span style="font-size: 1.5rem;">+</span>
                        </button>
                        <div style="padding: var(--space-4); display: none;">
                            <p style="color: var(--gray-700); line-height: 1.6;">Click "Sign In" in the top navigation, then select "Create Account." You'll need to provide your email, create a password, and fill in your shipping information. Account creation is free and gives you access to order tracking, wishlists, and faster checkout.</p>
                        </div>
                    </div>
                    
                    <div style="border: 1px solid var(--gray-200); border-radius: var(--radius-lg); overflow: hidden;">
                        <button style="width: 100%; padding: var(--space-4); background: var(--gray-50); border: none; text-align: left; font-weight: 600; color: var(--gray-900); cursor: pointer; display: flex; justify-content: space-between; align-items: center;" onclick="toggleFAQ(this)">
                            What is your return policy?
                            <span style="font-size: 1.5rem;">+</span>
                        </button>
                        <div style="padding: var(--space-4); display: none;">
                            <p style="color: var(--gray-700); line-height: 1.6;">We offer 30-day returns on most items in original condition. Sealed products must remain unopened. Contact us for a Return Merchandise Authorization (RMA) number before shipping items back. Refunds are processed within 3-5 business days of receiving your return.</p>
                        </div>
                    </div>
                    
                    <div style="border: 1px solid var(--gray-200); border-radius: var(--radius-lg); overflow: hidden;">
                        <button style="width: 100%; padding: var(--space-4); background: var(--gray-50); border: none; text-align: left; font-weight: 600; color: var(--gray-900); cursor: pointer; display: flex; justify-content: space-between; align-items: center;" onclick="toggleFAQ(this)">
                            Do you offer store credit?
                            <span style="font-size: 1.5rem;">+</span>
                        </button>
                        <div style="padding: var(--space-4); display: none;">
                            <p style="color: var(--gray-700); line-height: 1.6;">Yes! Store credit never expires and can be used for any purchase. We also offer store credit as an option for returns, which processes faster than refunds to your original payment method.</p>
                        </div>
                    </div>
                    
                    <div style="border: 1px solid var(--gray-200); border-radius: var(--radius-lg); overflow: hidden;">
                        <button style="width: 100%; padding: var(--space-4); background: var(--gray-50); border: none; text-align: left; font-weight: 600; color: var(--gray-900); cursor: pointer; display: flex; justify-content: space-between; align-items: center;" onclick="toggleFAQ(this)">
                            How do I reset my password?
                            <span style="font-size: 1.5rem;">+</span>
                        </button>
                        <div style="padding: var(--space-4); display: none;">
                            <p style="color: var(--gray-700); line-height: 1.6;">On the sign-in page, click "Forgot Password?" and enter your email address. We'll send you a secure link to reset your password. If you don't receive the email within a few minutes, check your spam folder or contact support.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Contact Support -->
        <section style="margin-bottom: var(--space-16);">
            <div style="background: linear-gradient(135deg, var(--gray-900) 0%, var(--gray-800) 100%); border-radius: var(--radius-2xl); color: white; padding: var(--space-12); text-align: center;">
                <h2 style="font-size: 2.5rem; font-weight: 700; margin-bottom: var(--space-6);">
                    Still Have Questions?
                </h2>
                <p style="font-size: 1.125rem; margin-bottom: var(--space-8); opacity: 0.9; max-width: 600px; margin-left: auto; margin-right: auto;">
                    Our knowledgeable team is here to help with any questions about Yu-Gi-Oh! cards, orders, or our services.
                </p>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: var(--space-6); margin-bottom: var(--space-8);">
                    <div>
                        <div style="font-size: 2rem; margin-bottom: var(--space-2);">📧</div>
                        <h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: var(--space-1);">Email Support</h3>
                        <p style="opacity: 0.8;">support@firelightduelacademy.com</p>
                    </div>
                    
                    <div>
                        <div style="font-size: 2rem; margin-bottom: var(--space-2);">📞</div>
                        <h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: var(--space-1);">Phone Support</h3>
                        <p style="opacity: 0.8;">(647) 555-DUEL</p>
                    </div>
                    
                    <div>
                        <div style="font-size: 2rem; margin-bottom: var(--space-2);">💬</div>
                        <h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: var(--space-1);">Live Chat</h3>
                        <p style="opacity: 0.8;">Available during business hours</p>
                    </div>
                </div>
                
                <div style="display: flex; gap: var(--space-4); justify-content: center; flex-wrap: wrap;">
                    <a href="mailto:support@firelightduelacademy.com" style="padding: var(--space-4) var(--space-8); background: var(--primary-color); color: white; text-decoration: none; border-radius: var(--radius-lg); font-weight: 600; transition: var(--transition-fast);">
                        Contact Support
                    </a>
                    <a href="#" onclick="navigateTo('singles')" style="padding: var(--space-4) var(--space-8); background: transparent; color: white; text-decoration: none; border-radius: var(--radius-lg); font-weight: 600; transition: var(--transition-fast); border: 1px solid rgba(255,255,255,0.3);">
                        Start Shopping
                    </a>
                </div>
            </div>
        </section>

        <script>
            function toggleFAQ(button) {
                const content = button.nextElementSibling;
                const icon = button.querySelector('span');
                
                if (content.style.display === 'none' || content.style.display === '') {
                    content.style.display = 'block';
                    icon.textContent = '−';
                } else {
                    content.style.display = 'none';
                    icon.textContent = '+';
                }
            }
            
            function showFAQCategory(category) {
                // This would show different FAQ categories
                console.log('Showing FAQ category:', category);
            }
        </script>
        `;
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
