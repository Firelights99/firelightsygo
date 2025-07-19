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
        if (!cardSets || cardSets.length === 0) {
            return [{
                set_name: 'Unknown Set',
                set_code: 'UNKNOWN',
                rarity: 'Common',
                rarity_code: 'C',
                price: '0.50'
            }];
        }

        return cardSets.map(set => ({
            set_name: set.set_name,
            set_code: set.set_code,
            rarity: set.set_rarity,
            rarity_code: set.set_rarity_code,
            price: set.set_price || this.calculateSetPrice(set.set_rarity)
        })).sort((a, b) => {
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
        if (!sets || sets.length === 0) {
            return '<p style="color: var(--gray-600); font-style: italic;">No set information available</p>';
        }

        return sets.map(set => {
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
                            color: ${isSelected ? 'white' : 'var(--gray-900)'}"
                     onclick="selectSet('${set.set_code}', '${set.rarity}', '${set.price}', '${set.set_name}')">
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
