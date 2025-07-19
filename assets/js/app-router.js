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

    async loadPage(pageName, pushState = true) {
        if (!this.routes[pageName]) {
            console.error(`Page "${pageName}" not found`);
            pageName = 'home';
        }

        // Show loading state
        this.showLoading();

        try {
            // Load page content
            const content = await this.fetchPageContent(pageName);
            
            // Update page
            this.renderPage(content);
            this.updateMetadata(pageName);
            this.updateNavigation(pageName);
            
            // Update URL
            if (pushState) {
                const url = pageName === 'home' ? '#' : `#page=${pageName}`;
                history.pushState({ page: pageName }, '', url);
            }
            
            // Execute page-specific JavaScript
            this.executePageScript(pageName);
            
            this.currentPage = pageName;
            
        } catch (error) {
            console.error('Error loading page:', error);
            this.showError('Failed to load page. Please try again.');
        }
    }

    async fetchPageContent(pageName) {
        // Check cache first
        if (this.pageCache.has(pageName)) {
            return this.pageCache.get(pageName);
        }

        // For now, we'll generate content dynamically
        // In a real implementation, you'd fetch from templates/
        const content = this.generatePageContent(pageName);
        
        // Cache the content
        this.pageCache.set(pageName, content);
        
        return content;
    }

    generatePageContent(pageName) {
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
                return this.getProductContent();
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
        <section style="text-align: center; margin-bottom: var(--space-12);">
            <h1 style="font-size: 3rem; font-weight: 700; color: var(--gray-900); margin-bottom: var(--space-4);">
                Popular Yu-Gi-Oh! Decks
            </h1>
            <p style="font-size: 1.125rem; color: var(--gray-600); max-width: 600px; margin: 0 auto;">
                Discover the latest meta decks and competitive strategies from tournament winners
            </p>
        </section>

        <!-- Deck Categories -->
        <section style="margin-bottom: var(--space-12);">
            <div style="display: flex; justify-content: center; gap: var(--space-4); margin-bottom: var(--space-8); flex-wrap: wrap;">
                <button class="filter-btn active" onclick="showCategory('meta')" id="meta-btn">Meta Decks</button>
                <button class="filter-btn" onclick="showCategory('budget')" id="budget-btn">Budget Builds</button>
                <button class="filter-btn" onclick="showCategory('rogue')" id="rogue-btn">Rogue Decks</button>
                <button class="filter-btn" onclick="showCategory('classic')" id="classic-btn">Classic Decks</button>
            </div>
        </section>

        <!-- Meta Decks Section -->
        <section id="meta-decks" class="deck-section">
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
                            <button style="flex: 1; padding: var(--space-3); background: var(--primary-color); color: white; border: none; border-radius: var(--radius-md); font-weight: 600; cursor: pointer;" onclick="viewDeck('snake-eye')">View Deck</button>
                            <button style="flex: 1; padding: var(--space-3); background: var(--gray-100); color: var(--gray-700); border: none; border-radius: var(--radius-md); font-weight: 600; cursor: pointer;" onclick="buyDeck('snake-eye')">Buy Singles</button>
                        </div>
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
        return `
        <!-- Page Header -->
        <section style="text-align: center; margin-bottom: var(--space-12);">
            <h1 style="font-size: 3rem; font-weight: 700; color: var(--gray-900); margin-bottom: var(--space-4);">
                My Account
            </h1>
            <p style="font-size: 1.125rem; color: var(--gray-600); max-width: 600px; margin: 0 auto;">
                Manage your account settings, view order history, and track your purchases
            </p>
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
                    <button style="width: 100%; padding: var(--space-3) var(--space-6); background: var(--primary-color); color: white; border: none; border-radius: var(--radius-md); font-weight: 600; cursor: pointer; transition: var(--transition-fast);" onmouseover="this.style.background='var(--primary-dark)'" onmouseout="this.style.background='var(--primary-color)'">View Orders</button>
                </div>
            </div>
            
            <div style="background: white; border-radius: var(--radius-xl); box-shadow: var(--shadow-lg); overflow: hidden; border: 1px solid var(--gray-200);" class="interactive-hover">
                <div style="background: linear-gradient(135deg, var(--secondary-color) 0%, var(--secondary-dark) 100%); padding: var(--space-6); text-align: center;">
                    <div style="font-size: 3rem; margin-bottom: var(--space-3);">⚙️</div>
                    <h3 style="font-size: 1.5rem; font-weight: 600; color: var(--gray-900); margin-bottom: var(--space-2);">Account Settings</h3>
                </div>
                <div style="padding: var(--space-6);">
                    <p style="color: var(--gray-600); margin-bottom: var(--space-4); line-height: 1.6;">Update your profile information, change password, and manage your notification preferences.</p>
                    <button style="width: 100%; padding: var(--space-3) var(--space-6); background: var(--secondary-color); color: var(--gray-900); border: none; border-radius: var(--radius-md); font-weight: 600; cursor: pointer; transition: var(--transition-fast);" onmouseover="this.style.background='var(--secondary-dark)'" onmouseout="this.style.background='var(--secondary-color)'">Edit Profile</button>
                </div>
            </div>

            <div style="background: white; border-radius: var(--radius-xl); box-shadow: var(--shadow-lg); overflow: hidden; border: 1px solid var(--gray-200);" class="interactive-hover">
                <div style="background: linear-gradient(135deg, var(--accent-color) 0%, var(--accent-dark) 100%); padding: var(--space-6); text-align: center;">
                    <div style="font-size: 3rem; margin-bottom: var(--space-3);">❤️</div>
                    <h3 style="font-size: 1.5rem; font-weight: 600; color: var(--gray-900); margin-bottom: var(--space-2);">Wishlist</h3>
                </div>
                <div style="padding: var(--space-6);">
                    <p style="color: var(--gray-600); margin-bottom: var(--space-4); line-height: 1.6;">Save cards you want to purchase later and get notified when prices drop.</p>
                    <button style="width: 100%; padding: var(--space-3) var(--space-6); background: var(--accent-color); color: var(--gray-900); border: none; border-radius: var(--radius-md); font-weight: 600; cursor: pointer; transition: var(--transition-fast);" onmouseover="this.style.background='var(--accent-dark)'" onmouseout="this.style.background='var(--accent-color)'">View Wishlist</button>
                </div>
            </div>

            <div style="background: white; border-radius: var(--radius-xl); box-shadow: var(--shadow-lg); overflow: hidden; border: 1px solid var(--gray-200);" class="interactive-hover">
                <div style="background: linear-gradient(135deg, var(--gray-600) 0%, var(--gray-700) 100%); padding: var(--space-6); text-align: center;">
                    <div style="font-size: 3rem; margin-bottom: var(--space-3);">🏆</div>
                    <h3 style="font-size: 1.5rem; font-weight: 600; color: white; margin-bottom: var(--space-2);">Tournament History</h3>
                </div>
                <div style="padding: var(--space-6);">
                    <p style="color: var(--gray-600); margin-bottom: var(--space-4); line-height: 1.6;">View your tournament results, rankings, and upcoming event registrations.</p>
                    <button style="width: 100%; padding: var(--space-3) var(--space-6); background: var(--gray-600); color: white; border: none; border-radius: var(--radius-md); font-weight: 600; cursor: pointer; transition: var(--transition-fast);" onmouseover="this.style.background='var(--gray-700)'" onmouseout="this.style.background='var(--gray-600)'">View Results</button>
                </div>
            </div>
        </section>

        <!-- Quick Actions -->
        <section style="background: white; border-radius: var(--radius-2xl); box-shadow: var(--shadow-lg); padding: var(--space-12); margin-bottom: var(--space-16); border: 1px solid var(--gray-200);">
            <div style="text-align: center; margin-bottom: var(--space-8);">
                <h2 style="font-size: 2.5rem; font-weight: 700; color: var(--gray-900); margin-bottom: var(--space-4);">
                    Quick Actions
                </h2>
                <p style="font-size: 1.125rem; color: var(--gray-600);">
                    Common tasks and shortcuts for your account
                </p>
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
                
                <div style="text-align: center; padding: var(--space-4); border: 1px solid var(--gray-200); border-radius: var(--radius-lg); transition: var(--transition-fast); cursor: pointer;" class="interactive-hover" onclick="navigateTo('events')">
                    <div style="font-size: 2rem; margin-bottom: var(--space-3);">🏆</div>
                    <h4 style="font-size: 1.125rem; font-weight: 600; color: var(--gray-900); margin-bottom: var(--space-2);">Join Events</h4>
                    <p style="color: var(--gray-600); font-size: 0.875rem;">Register for tournaments</p>
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

    getProductContent() {
        return `
        <!-- Page Header -->
        <section style="text-align: center; margin-bottom: var(--space-12);">
            <h1 style="font-size: 3rem; font-weight: 700; color: var(--gray-900); margin-bottom: var(--space-4);">
                Card Details
            </h1>
            <p style="font-size: 1.125rem; color: var(--gray-600); max-width: 600px; margin: 0 auto;">
                Detailed information about this Yu-Gi-Oh! card
            </p>
        </section>

        <!-- Product Details -->
        <section style="display: grid; grid-template-columns: 1fr 2fr; gap: var(--space-8); margin-bottom: var(--space-16);">
            <div style="background: white; border-radius: var(--radius-xl); box-shadow: var(--shadow-md); padding: var(--space-6); text-align: center;">
                <img src="https://images.ygoprodeck.com/images/cards/89631139.jpg" alt="Card Image" style="width: 100%; max-width: 300px; border-radius: var(--radius-lg);">
            </div>
            
            <div style="background: white; border-radius: var(--radius-xl); box-shadow: var(--shadow-md); padding: var(--space-6);">
                <h2 style="font-size: 2rem; font-weight: 600; color: var(--gray-900); margin-bottom: var(--space-4);">Card Name</h2>
                <p style="color: var(--gray-600); margin-bottom: var(--space-6);">Card description and details will be loaded here.</p>
                <div style="display: flex; gap: var(--space-4);">
                    <button style="flex: 1; padding: var(--space-4); background: var(--primary-color); color: white; border: none; border-radius: var(--radius-md); font-weight: 600; cursor: pointer;">Add to Cart</button>
                    <button style="flex: 1; padding: var(--space-4); background: var(--gray-100); color: var(--gray-700); border: none; border-radius: var(--radius-md); font-weight: 600; cursor: pointer;">Add to Wishlist</button>
                </div>
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

    executePageScript(pageName) {
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
                break;
        }
    }
}

// Global navigation function
function navigateTo(page, params = '') {
    if (window.appRouter) {
        window.appRouter.loadPage(page);
    }
}

// Initialize router when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.appRouter = new AppRouter();
});
