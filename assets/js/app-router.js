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

        // Get user orders and wishlist
        const userOrders = window.tcgStore.getUserOrders ? window.tcgStore.getUserOrders() : [];
        const userWishlist = currentUser.wishlist || [];
        const storeCreditBalance = window.tcgStore.dbService ? window.tcgStore.dbService.getStoreCreditBalance(currentUser.id) : 0;

        return `
        <section style="margin-bottom: var(--space-12);">
            <div style="background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%); border-radius: var(--radius-2xl); color: white; padding: var(--space-12); margin-bottom: var(--space-8);">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-4);">
                    <div>
                        <h1 style="font-size: 3rem; font-weight: 700; margin-bottom: var(--space-2);">
                            Welcome back, ${currentUser.firstName}!
                        </h1>
                        <p style="font-size: 1.125rem; opacity: 0.9; margin-bottom: var(--space-2);">
                            ${currentUser.isAdmin ? '👑 Administrator Account' : '🎯 Member Account'}
                        </p>
                        <p style="font-size: 1rem; opacity: 0.8;">
                            Member since ${new Date(currentUser.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                    <div style="display: flex; gap: var(--space-3); flex-wrap: wrap;">
                        ${currentUser.isAdmin ? `
                            <button class="secondary-btn" onclick="window.open('admin/admin-dashboard.html', '_blank')" style="background: var(--secondary-color); color: var(--gray-900); border: none; padding: var(--space-3) var(--space-6); border-radius: var(--radius-lg); font-weight: 600; cursor: pointer; transition: var(--transition-fast);">
                                <i class="fas fa-cog"></i> Admin Dashboard
                            </button>
                        ` : ''}
                        <button class="secondary-btn" onclick="tcgStore.openEditProfileModal()" style="background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.3); padding: var(--space-3) var(--space-6); border-radius: var(--radius-lg); font-weight: 600; cursor: pointer; transition: var(--transition-fast);">
                            <i class="fas fa-edit"></i> Edit Profile
                        </button>
                        <button class="secondary-btn" onclick="tcgStore.logout()" style="background: rgba(220,38,38,0.8); color: white; border: 1px solid rgba(220,38,38,0.5); padding: var(--space-3) var(--space-6); border-radius: var(--radius-lg); font-weight: 600; cursor: pointer; transition: var(--transition-fast);">
                            <i class="fas fa-sign-out-alt"></i> Logout
                        </button>
                    </div>
                </div>
            </div>
        </section>

        <section style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: var(--space-8); margin-bottom: var(--space-12);">
            <!-- Account Overview -->
            <div style="background: white; border-radius: var(--radius-xl); box-shadow: var(--shadow-lg); padding: var(--space-8); border: 1px solid var(--gray-200);">
                <h2 style="font-size: 1.5rem; font-weight: 700; color: var(--gray-900); margin-bottom: var(--space-6); display: flex; align-items: center; gap: var(--space-2);">
                    <i class="fas fa-user-circle" style="color: var(--primary-color);"></i>
                    Account Information
                </h2>
                <div style="space-y: var(--space-4);">
                    <div style="margin-bottom: var(--space-4);">
                        <label style="font-size: 0.875rem; font-weight: 600; color: var(--gray-600); text-transform: uppercase; letter-spacing: 0.05em;">Full Name</label>
                        <p style="font-size: 1.125rem; font-weight: 600; color: var(--gray-900); margin: var(--space-1) 0 0 0;">${currentUser.firstName} ${currentUser.lastName}</p>
                    </div>
                    <div style="margin-bottom: var(--space-4);">
                        <label style="font-size: 0.875rem; font-weight: 600; color: var(--gray-600); text-transform: uppercase; letter-spacing: 0.05em;">Email Address</label>
                        <p style="font-size: 1.125rem; font-weight: 600; color: var(--gray-900); margin: var(--space-1) 0 0 0;">${currentUser.email}</p>
                    </div>
                    ${currentUser.phone ? `
                        <div style="margin-bottom: var(--space-4);">
                            <label style="font-size: 0.875rem; font-weight: 600; color: var(--gray-600); text-transform: uppercase; letter-spacing: 0.05em;">Phone Number</label>
                            <p style="font-size: 1.125rem; font-weight: 600; color: var(--gray-900); margin: var(--space-1) 0 0 0;">${currentUser.phone}</p>
                        </div>
                    ` : ''}
                    ${currentUser.favoriteArchetype ? `
                        <div style="margin-bottom: var(--space-4);">
                            <label style="font-size: 0.875rem; font-weight: 600; color: var(--gray-600); text-transform: uppercase; letter-spacing: 0.05em;">Favorite Archetype</label>
                            <p style="font-size: 1.125rem; font-weight: 600; color: var(--gray-900); margin: var(--space-1) 0 0 0;">${currentUser.favoriteArchetype}</p>
                        </div>
                    ` : ''}
                    <div style="margin-bottom: var(--space-4);">
                        <label style="font-size: 0.875rem; font-weight: 600; color: var(--gray-600); text-transform: uppercase; letter-spacing: 0.05em;">Account Status</label>
                        <p style="font-size: 1.125rem; font-weight: 600; color: var(--success-color); margin: var(--space-1) 0 0 0;">
                            <i class="fas fa-check-circle"></i> Active ${currentUser.isAdmin ? '(Administrator)' : '(Member)'}
                        </p>
                    </div>
                </div>
            </div>

            <!-- Store Credit -->
            <div style="background: white; border-radius: var(--radius-xl); box-shadow: var(--shadow-lg); padding: var(--space-8); border: 1px solid var(--gray-200);">
                <h2 style="font-size: 1.5rem; font-weight: 700; color: var(--gray-900); margin-bottom: var(--space-6); display: flex; align-items: center; gap: var(--space-2);">
                    <i class="fas fa-coins" style="color: var(--warning-color);"></i>
                    Store Credit
                </h2>
                <div style="text-align: center; padding: var(--space-6);">
                    <div style="font-size: 3rem; font-weight: 700; color: var(--primary-color); margin-bottom: var(--space-2);">
                        $${storeCreditBalance.toFixed(2)}
                    </div>
                    <p style="color: var(--gray-600); margin-bottom: var(--space-4);">Available Balance</p>
                    <p style="font-size: 0.875rem; color: var(--gray-500); line-height: 1.5;">
                        Store credit can be used at checkout and is earned through returns and special promotions.
                    </p>
                </div>
            </div>
        </section>

        <section style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: var(--space-8); margin-bottom: var(--space-12);">
            <!-- Recent Orders -->
            <div style="background: white; border-radius: var(--radius-xl); box-shadow: var(--shadow-lg); padding: var(--space-8); border: 1px solid var(--gray-200);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-6);">
                    <h2 style="font-size: 1.5rem; font-weight: 700; color: var(--gray-900); display: flex; align-items: center; gap: var(--space-2); margin: 0;">
                        <i class="fas fa-shopping-bag" style="color: var(--info-color);"></i>
                        Recent Orders
                    </h2>
                    <button class="secondary-btn" onclick="tcgStore.openOrderHistoryModal()" style="padding: var(--space-2) var(--space-4); font-size: 0.875rem;">
                        View All
                    </button>
                </div>
                ${userOrders.length === 0 ? `
                    <div style="text-align: center; padding: var(--space-8); color: var(--gray-500);">
                        <div style="font-size: 3rem; margin-bottom: var(--space-4); opacity: 0.5;">📦</div>
                        <p style="font-size: 1.125rem; font-weight: 600; margin-bottom: var(--space-2);">No Orders Yet</p>
                        <p style="margin-bottom: var(--space-4);">Start shopping to see your orders here!</p>
                        <button class="primary-btn" onclick="navigateTo('singles')" style="padding: var(--space-3) var(--space-6);">
                            Browse Singles
                        </button>
                    </div>
                ` : `
                    <div style="space-y: var(--space-4);">
                        ${userOrders.slice(0, 3).map(order => `
                            <div style="border: 1px solid var(--gray-200); border-radius: var(--radius-lg); padding: var(--space-4); margin-bottom: var(--space-3);">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2);">
                                    <span style="font-weight: 600; color: var(--gray-900);">Order #${order.id}</span>
                                    <span style="background: var(--info-color); color: white; padding: var(--space-1) var(--space-2); border-radius: var(--radius-sm); font-size: 0.75rem; font-weight: 600; text-transform: uppercase;">
                                        ${order.status}
                                    </span>
                                </div>
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <span style="color: var(--gray-600); font-size: 0.875rem;">
                                        ${new Date(order.createdAt).toLocaleDateString()}
                                    </span>
                                    <span style="font-weight: 700; color: var(--primary-color);">
                                        $${order.total.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>

            <!-- Wishlist -->
            <div style="background: white; border-radius: var(--radius-xl); box-shadow: var(--shadow-lg); padding: var(--space-8); border: 1px solid var(--gray-200);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-6);">
                    <h2 style="font-size: 1.5rem; font-weight: 700; color: var(--gray-900); display: flex; align-items: center; gap: var(--space-2); margin: 0;">
                        <i class="fas fa-heart" style="color: var(--error-color);"></i>
                        Wishlist
                    </h2>
                    <button class="secondary-btn" onclick="tcgStore.openWishlistModal()" style="padding: var(--space-2) var(--space-4); font-size: 0.875rem;">
                        View All
                    </button>
                </div>
                ${userWishlist.length === 0 ? `
                    <div style="text-align: center; padding: var(--space-8); color: var(--gray-500);">
                        <div style="font-size: 3rem; margin-bottom: var(--space-4); opacity: 0.5;">💝</div>
                        <p style="font-size: 1.125rem; font-weight: 600; margin-bottom: var(--space-2);">No Wishlist Items</p>
                        <p style="margin-bottom: var(--space-4);">Save cards you want to purchase later!</p>
                        <button class="primary-btn" onclick="navigateTo('singles')" style="padding: var(--space-3) var(--space-6);">
                            Browse Singles
                        </button>
                    </div>
                ` : `
                    <div style="space-y: var(--space-4);">
                        ${userWishlist.slice(0, 3).map(item => `
                            <div style="display: flex; align-items: center; gap: var(--space-3); border: 1px solid var(--gray-200); border-radius: var(--radius-lg); padding: var(--space-3); margin-bottom: var(--space-3);">
                                <img src="${item.image}" alt="${item.name}" style="width: 40px; height: 56px; object-fit: contain; border-radius: var(--radius-sm);">
                                <div style="flex: 1; min-width: 0;">
                                    <div style="font-weight: 600; color: var(--gray-900); font-size: 0.875rem; margin-bottom: var(--space-1); line-height: 1.2;">${item.name}</div>
                                    <div style="font-weight: 700; color: var(--primary-color); font-size: 0.875rem;">$${item.price.toFixed(2)}</div>
                                </div>
                            </div>
                        `).join('')}
                        ${userWishlist.length > 3 ? `
                            <p style="text-align: center; color: var(--gray-600); font-size: 0.875rem; margin-top: var(--space-3);">
                                +${userWishlist.length - 3} more items
                            </p>
                        ` : ''}
                    </div>
                `}
            </div>
        </section>

        <section style="background: white; border-radius: var(--radius-xl); box-shadow: var(--shadow-lg); padding: var(--space-8); border: 1px solid var(--gray-200);">
            <h2 style="font-size: 1.5rem; font-weight: 700; color: var(--gray-900); margin-bottom: var(--space-6); display: flex; align-items: center; gap: var(--space-2);">
                <i class="fas fa-cogs" style="color: var(--gray-600);"></i>
                Quick Actions
            </h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-4);">
                <button class="secondary-btn" onclick="tcgStore.openEditProfileModal()" style="padding: var(--space-4); text-align: center; display: flex; flex-direction: column; align-items: center; gap: var(--space-2);">
                    <i class="fas fa-user-edit" style="font-size: 1.5rem; color: var(--primary-color);"></i>
                    <span>Edit Profile</span>
                </button>
                <button class="secondary-btn" onclick="tcgStore.openOrderHistoryModal()" style="padding: var(--space-4); text-align: center; display: flex; flex-direction: column; align-items: center; gap: var(--space-2);">
                    <i class="fas fa-history" style="font-size: 1.5rem; color: var(--info-color);"></i>
                    <span>Order History</span>
                </button>
                <button class="secondary-btn" onclick="tcgStore.openWishlistModal()" style="padding: var(--space-4); text-align: center; display: flex; flex-direction: column; align-items: center; gap: var(--space-2);">
                    <i class="fas fa-heart" style="font-size: 1.5rem; color: var(--error-color);"></i>
                    <span>Manage Wishlist</span>
                </button>
                ${currentUser.isAdmin ? `
                    <button class="secondary-btn" onclick="window.open('admin/admin-dashboard.html', '_blank')" style="padding: var(--space-4); text-align: center; display: flex; flex-direction: column; align-items: center; gap: var(--space-2); background: var(--primary-color); color: white;">
                        <i class="fas fa-shield-alt" style="font-size: 1.5rem;"></i>
                        <span>Admin Dashboard</span>
                    </button>
                ` : ''}
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

    async generateProductHTML(card) {
        const image = card.card_images && card.card_images.length > 0 ? 
            card.card_images[0].image_url : 
            'https://images.ygoprodeck.com/images/cards/back.jpg';

        // Get real pricing from YGOPRODeck API
        const realPrice = await this.getRealCardPrice(card);
        
        // Get available sets and rarities
        const cardSets = card.card_sets || [];
        const hasMultipleSets = cardSets.length > 1;
        
        // Default rarity and price
        const defaultRarity = cardSets.length > 0 ? cardSets[0].set_rarity || 'Common' : 'Common';
        const defaultPrice = this.calculateRealPriceByRarity(realPrice, defaultRarity);

        // Get card type and rarity colors
        const cardTypeColor = this.getCardTypeColor(card.type);
        const rarityColor = this.getRarityColor(defaultRarity);

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
                            <span style="background: ${cardTypeColor}; color: white; padding: var(--space-1) var(--space-3); border-radius: var(--radius-full); font-size: 0.875rem; font-weight: 600; text-shadow: 0 1px 2px rgba(0,0,0,0.3);">${card.type}</span>
                            <span id="rarity-badge" style="background: ${rarityColor}; color: white; padding: var(--space-1) var(--space-3); border-radius: var(--radius-full); font-size: 0.875rem; font-weight: 600; text-shadow: 0 1px 2px rgba(0,0,0,0.3);">${defaultRarity}</span>
                        </div>
                    </div>

                    <div style="background: var(--gray-50); border-radius: var(--radius-lg); padding: var(--space-6); margin-bottom: var(--space-6); border-left: 4px solid var(--primary-color);">
                        <h3 style="font-size: 1.25rem; font-weight: 600; color: var(--gray-900); margin-bottom: var(--space-3);">
                            Card Description
                        </h3>
                        <div style="background: white; padding: var(--space-4); border-radius: var(--radius-md); border: 1px solid var(--gray-200);">
                            <p style="color: var(--gray-700); line-height: 1.8; font-size: 0.95rem; margin: 0;">${card.desc || 'No description available.'}</p>
                        </div>
                    </div>

                    ${hasMultipleSets ? `
                    <div style="margin-bottom: var(--space-6);">
                        <h3 style="font-size: 1.25rem; font-weight: 600; color: var(--gray-900); margin-bottom: var(--space-4);">Available Sets & Rarities</h3>
                        <div id="set-selector" style="display: grid; gap: var(--space-3);">
                            ${this.generateSetSelectorHTML(cardSets, cardSets[0])}
                        </div>
                    </div>
                    ` : ''}

                    <div style="background: var(--gray-50); border-radius: var(--radius-lg); padding: var(--space-6); margin-bottom: var(--space-6);">
                        <span id="product-price" style="font-size: 2rem; font-weight: 700; color: var(--primary-color);">$${defaultPrice}</span>
                        <div style="margin-top: var(--space-2);">
                            <span style="font-size: 0.875rem; color: var(--gray-600);">Price from YGOPRODeck API</span>
                        </div>
                    </div>

                    <div style="margin-bottom: var(--space-6);">
                        <div style="display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-4);">
                            <label style="font-weight: 600; color: var(--gray-700);">Quantity:</label>
                            <div style="display: flex; align-items: center; gap: var(--space-2);">
                                <button onclick="changeQuantity(-1)" style="width: 32px; height: 32px; border: 1px solid var(--gray-300); background: white; border-radius: var(--radius-md); cursor: pointer; font-weight: 600;">-</button>
                                <input type="number" id="quantity" value="1" min="1" max="99" style="width: 60px; height: 32px; text-align: center; border: 1px solid var(--gray-300); border-radius: var(--radius-md);">
                                <button onclick="changeQuantity(1)" style="width: 32px; height: 32px; border: 1px solid var(--gray-300); background: white; border-radius: var(--radius-md); cursor: pointer; font-weight: 600;">+</button>
                            </div>
                        </div>
                        <button id="add-to-cart-btn" style="width: 100%; padding: var(--space-4); background: var(--primary-color); color: white; border: none; border-radius: var(--radius-md); font-weight: 600; font-size: 1.125rem; cursor: pointer; transition: var(--transition-fast); text-transform: uppercase; letter-spacing: 0.05em;" onclick="addProductToCartWithDetails('${card.name}', ${defaultPrice}, '${image}', '${defaultRarity}')">
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        </section>

        `;
    }

    async calculatePriceByRarity(basePrice, rarity, cardData = null) {
        // If we have real price data, use it
        if (basePrice && parseFloat(basePrice) > 0) {
            return parseFloat(basePrice).toFixed(2);
        }
        
        // If no real price available, return 0.00
        return '0.00';
    }

    generateSetSelectorHTML(sets, selectedSet) {
        if (!sets || sets.length === 0) {
            return '<p style="color: var(--gray-600); font-style: italic;">No set information available</p>';
        }

        // Process sets with simple pricing (show $0.00 if no real price available)
        const processedSets = sets.map(set => ({
            set_name: set.set_name,
            set_code: set.set_code,
            rarity: set.set_rarity || 'Common',
            rarity_code: set.set_rarity_code,
            price: '0.00' // Default to $0.00, will be updated with real pricing if available
        }));

        return processedSets.map(set => {
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
        // YGOPRODeck-style rarity colors
        const rarityColors = {
            'Common': '#374151',
            'Rare': '#3B82F6', 
            'Super Rare': '#10B981',
            'Ultra Rare': '#F59E0B',
            'Secret Rare': '#8B5CF6',
            'Ultimate Rare': '#DC2626',
            'Ghost Rare': '#6B7280',
            'Starlight Rare': '#EC4899',
            'Short Print': '#6B7280'
        };
        return rarityColors[rarity] || '#374151';
    }

    getCardTypeColor(cardType) {
        // YGOPRODeck-style card type colors
        if (cardType.includes('Effect Monster')) return '#FF8B00';
        if (cardType.includes('Normal Monster')) return '#FFC649';
        if (cardType.includes('Fusion Monster')) return '#A086B7';
        if (cardType.includes('Synchro Monster')) return '#CCCCCC';
        if (cardType.includes('Xyz Monster')) return '#000000';
        if (cardType.includes('Link Monster')) return '#00008B';
        if (cardType.includes('Ritual Monster')) return '#9DB5CC';
        if (cardType.includes('Pendulum')) return '#008080';
        if (cardType.includes('Spell')) return '#1D9E74';
        if (cardType.includes('Trap')) return '#BC5A84';
        if (cardType.includes('Monster')) return '#FF8B00'; // Default monster
        return '#6B7280'; // Default
    }

    async getRealCardPrice(card) {
        try {
            // Use the real pricing service if available
            if (window.yugiohPricingService) {
                const priceData = await window.yugiohPricingService.getCardPrice(card);
                if (priceData && priceData.price > 0) {
                    return priceData.price.toFixed(2);
                }
            }
            
            // Fallback: Use the card's existing price data if available
            if (card.card_prices && card.card_prices.length > 0) {
                const prices = card.card_prices[0];
                let usdPrice = null;

                // Try different price sources in order of preference
                if (prices.tcgplayer_price && parseFloat(prices.tcgplayer_price) > 0) {
                    usdPrice = parseFloat(prices.tcgplayer_price);
                } else if (prices.cardmarket_price && parseFloat(prices.cardmarket_price) > 0) {
                    usdPrice = parseFloat(prices.cardmarket_price);
                } else if (prices.ebay_price && parseFloat(prices.ebay_price) > 0) {
                    usdPrice = parseFloat(prices.ebay_price);
                } else if (prices.amazon_price && parseFloat(prices.amazon_price) > 0) {
                    usdPrice = parseFloat(prices.amazon_price);
                } else if (prices.coolstuffinc_price && parseFloat(prices.coolstuffinc_price) > 0) {
                    usdPrice = parseFloat(prices.coolstuffinc_price);
                }

                if (usdPrice && usdPrice > 0) {
                    // Convert USD to CAD (approximate rate)
                    return (usdPrice * 1.35).toFixed(2);
                }
            }
        } catch (error) {
            console.warn('Error getting real card price:', error);
        }
        
        // Fallback - try to get fresh API data
        try {
            const response = await fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?id=${card.id}`);
            if (response.ok) {
                const result = await response.json();
                const cardData = result.data ? result.data[0] : null;
                if (cardData && cardData.card_prices && cardData.card_prices.length > 0) {
                    const prices = cardData.card_prices[0];
                    let usdPrice = null;

                    // Try different price sources in order of preference
                    if (prices.tcgplayer_price && parseFloat(prices.tcgplayer_price) > 0) {
                        usdPrice = parseFloat(prices.tcgplayer_price);
                    } else if (prices.cardmarket_price && parseFloat(prices.cardmarket_price) > 0) {
                        usdPrice = parseFloat(prices.cardmarket_price);
                    } else if (prices.ebay_price && parseFloat(prices.ebay_price) > 0) {
                        usdPrice = parseFloat(prices.ebay_price);
                    } else if (prices.amazon_price && parseFloat(prices.amazon_price) > 0) {
                        usdPrice = parseFloat(prices.amazon_price);
                    } else if (prices.coolstuffinc_price && parseFloat(prices.coolstuffinc_price) > 0) {
                        usdPrice = parseFloat(prices.coolstuffinc_price);
                    }

                    if (usdPrice && usdPrice > 0) {
                        return (usdPrice * 1.35).toFixed(2);
                    }
                }
            }
        } catch (error) {
            console.warn('Error fetching fresh price data:', error);
        }
        
        // If no real price available, return null instead of fallback
        console.warn(`No real price available for card: ${card.name || card.id}`);
        return null;
    }

    calculateRealPriceByRarity(basePrice, rarity) {
        const base = parseFloat(basePrice);
        if (isNaN(base) || base <= 0) {
            // If we don't have a valid base price, return 0.00 instead of mock pricing
            console.warn(`No real price available for rarity: ${rarity}`);
            return '0.00';
        }
        
        // If we have real price data, return it as-is (no multipliers needed)
        return base.toFixed(2);
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

// Global product page functions
function selectSet(setCode, rarity, price, setName, clickedElement) {
    console.log('selectSet called with:', { setCode, rarity, price, setName });
    console.log('Event object:', event);
    
    // Update all set options to remove selected state
    document.querySelectorAll('.set-option').forEach(option => {
        option.classList.remove('selected');
        option.style.border = '2px solid var(--gray-300)';
        option.style.background = 'white';
        option.style.color = 'var(--gray-900)';
    });
    
    // Find the clicked set option - try multiple approaches
    let selectedOption = null;
    if (event && event.target) {
        selectedOption = event.target.closest('.set-option');
        console.log('Found selected option via event.target.closest:', selectedOption);
    }
    
    // Fallback: find by set code if event approach fails
    if (!selectedOption) {
        selectedOption = document.querySelector(`[onclick*="${setCode}"]`);
        console.log('Found selected option via querySelector:', selectedOption);
    }
    
    // Add selected state to clicked option
    if (selectedOption) {
        selectedOption.classList.add('selected');
        selectedOption.style.border = '2px solid var(--primary-color)';
        selectedOption.style.background = 'var(--primary-color)';
        selectedOption.style.color = 'white';
        console.log('Applied selected styles to option');
    } else {
        console.error('Could not find selected option element!');
    }
    
    // Update price and rarity displays with animations
    const priceElement = document.getElementById('product-price');
    const rarityBadge = document.getElementById('rarity-badge');
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    
    console.log('Found elements:', { 
        priceElement: !!priceElement, 
        rarityBadge: !!rarityBadge, 
        addToCartBtn: !!addToCartBtn 
    });
    
    // Animate price update
    if (priceElement) {
        console.log('Updating price from', priceElement.textContent, 'to $' + price);
        priceElement.classList.add('price-update');
        priceElement.textContent = '$' + price;
        setTimeout(() => {
            priceElement.classList.remove('price-update');
        }, 500);
    } else {
        console.error('Price element not found!');
    }
    
    // Animate rarity badge update with smooth JavaScript animations
    if (rarityBadge) {
        console.log('Current rarity badge:', {
            textContent: rarityBadge.textContent,
            backgroundColor: rarityBadge.style.backgroundColor,
            id: rarityBadge.id
        });
        console.log('Updating rarity badge from', rarityBadge.textContent, 'to', rarity);
        
        const rarityColor = getRarityColor(rarity);
        console.log('Setting rarity color to:', rarityColor);
        
        // Animate the rarity badge update with smooth transitions
        animateRarityBadgeUpdate(rarityBadge, rarity, rarityColor);
        
    } else {
        console.error('Rarity badge element not found! Looking for element with id "rarity-badge"');
        console.log('Available elements with "rarity" in id:', 
            Array.from(document.querySelectorAll('[id*="rarity"]')).map(el => ({ id: el.id, element: el }))
        );
    }
    
    // Update add to cart button with new details
    if (addToCartBtn) {
        const cardName = document.querySelector('h1').textContent;
        const cardImage = document.getElementById('main-card-image').src;
        addToCartBtn.setAttribute('onclick', `addProductToCartWithDetails('${cardName}', ${price}, '${cardImage}', '${rarity}')`);
        console.log('Updated add to cart button with new rarity:', rarity);
    } else {
        console.error('Add to cart button not found!');
    }
}

// Helper function to get rarity colors (same as in app-router class)
function getRarityColor(rarity) {
    const rarityColors = {
        'Common': '#374151',
        'Rare': '#3B82F6', 
        'Super Rare': '#10B981',
        'Ultra Rare': '#F59E0B',
        'Secret Rare': '#8B5CF6',
        'Ultimate Rare': '#DC2626',
        'Ghost Rare': '#6B7280',
        'Starlight Rare': '#EC4899',
        'Short Print': '#6B7280'
    };
    return rarityColors[rarity] || '#374151';
}

// Smooth JavaScript animation for rarity badge updates
function animateRarityBadgeUpdate(rarityBadge, newRarity, newColor) {
    console.log('Starting rarity badge animation:', { newRarity, newColor });
    
    // Store original values
    const originalText = rarityBadge.textContent;
    const originalColor = window.getComputedStyle(rarityBadge).backgroundColor;
    
    // Create animation timeline
    const animationDuration = 600; // Total animation duration in ms
    const scalePhase = 200; // Scale animation phase
    const colorPhase = 300; // Color transition phase
    const textPhase = 100; // Text change phase
    
    // Phase 1: Scale down and fade out slightly
    rarityBadge.style.transition = `transform ${scalePhase}ms cubic-bezier(0.4, 0, 0.2, 1), opacity ${scalePhase}ms ease-out`;
    rarityBadge.style.transform = 'scale(0.85)';
    rarityBadge.style.opacity = '0.7';
    
    setTimeout(() => {
        // Phase 2: Change text and start color transition
        rarityBadge.textContent = newRarity;
        
        // Force style override with multiple approaches
        rarityBadge.style.setProperty('background', newColor, 'important');
        rarityBadge.style.setProperty('background-color', newColor, 'important');
        
        // Also update style attribute directly
        const currentStyle = rarityBadge.getAttribute('style') || '';
        const cleanedStyle = currentStyle.replace(/background[^;]*;?/g, '').replace(/background-color[^;]*;?/g, '');
        rarityBadge.setAttribute('style', cleanedStyle + `background: ${newColor} !important; background-color: ${newColor} !important;`);
        
        // Add a subtle glow effect during transition
        rarityBadge.style.boxShadow = `0 0 20px ${newColor}40, 0 4px 12px rgba(0,0,0,0.15)`;
        
        // Phase 3: Scale back up and restore opacity with bounce effect
        rarityBadge.style.transition = `transform ${colorPhase}ms cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity ${colorPhase}ms ease-out, box-shadow ${colorPhase}ms ease-out`;
        rarityBadge.style.transform = 'scale(1.05)';
        rarityBadge.style.opacity = '1';
        
        setTimeout(() => {
            // Phase 4: Settle to final state
            rarityBadge.style.transition = `transform ${textPhase}ms ease-out, box-shadow ${textPhase}ms ease-out`;
            rarityBadge.style.transform = 'scale(1)';
            rarityBadge.style.boxShadow = '0 1px 2px rgba(0,0,0,0.3)';
            
            setTimeout(() => {
                // Clean up transition styles
                rarityBadge.style.transition = '';
                console.log('Rarity badge animation completed');
                
                // Log final state
                console.log('Final rarity badge state:', {
                    textContent: rarityBadge.textContent,
                    backgroundColor: rarityBadge.style.backgroundColor,
                    computedStyle: window.getComputedStyle(rarityBadge).backgroundColor,
                    styleAttribute: rarityBadge.getAttribute('style')
                });
            }, textPhase);
        }, colorPhase);
    }, scalePhase);
    
    // Add a subtle pulse effect that repeats twice
    let pulseCount = 0;
    const pulseInterval = setInterval(() => {
        if (pulseCount >= 2) {
            clearInterval(pulseInterval);
            return;
        }
        
        rarityBadge.style.transform = 'scale(1.02)';
        setTimeout(() => {
            rarityBadge.style.transform = 'scale(1)';
        }, 150);
        
        pulseCount++;
    }, 300);
}

function changeQuantity(change) {
    const quantityInput = document.getElementById('quantity');
    if (quantityInput) {
        const currentValue = parseInt(quantityInput.value) || 1;
        const newValue = Math.max(1, Math.min(99, currentValue + change));
        quantityInput.value = newValue;
    }
}

function addProductToCartWithDetails(cardName, price, image, rarity) {
    const quantityInput = document.getElementById('quantity');
    const quantity = quantityInput ? parseInt(quantityInput.value) || 1 : 1;
    const numericPrice = parseFloat(price) || 0;
    
    // Add to cart using the correct method with individual parameters
    if (window.tcgStore && window.tcgStore.addToCartWithDetails) {
        // Add each item individually for the specified quantity
        for (let i = 0; i < quantity; i++) {
            window.tcgStore.addToCartWithDetails(cardName, numericPrice, image, '', rarity, '');
        }
    } else if (window.tcgStore && window.tcgStore.addToCart) {
        // Fallback to basic addToCart method
        for (let i = 0; i < quantity; i++) {
            window.tcgStore.addToCart(cardName, numericPrice, image);
        }
    }
}

// Modern toast notification system
function showToastNotification(options) {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
            pointer-events: none;
        `;
        document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.style.cssText = `
        background: white;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        padding: 16px;
        min-width: 320px;
        max-width: 400px;
        border-left: 4px solid #16a34a;
        transform: translateX(100%);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        pointer-events: auto;
        position: relative;
        overflow: hidden;
    `;
    
    toast.innerHTML = `
        <div style="display: flex; align-items: flex-start; gap: 12px;">
            <img src="${options.image}" alt="${options.title}" style="width: 48px; height: 64px; object-fit: contain; border-radius: 6px; flex-shrink: 0;">
            <div style="flex: 1; min-width: 0;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
                    <h4 style="margin: 0; font-size: 14px; font-weight: 600; color: #16a34a;">✓ ${options.title}</h4>
                    <button onclick="this.closest('[id^=toast-]').remove()" style="background: none; border: none; font-size: 18px; color: #6b7280; cursor: pointer; padding: 0; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;">×</button>
                </div>
                <p style="margin: 0 0 4px 0; font-size: 13px; color: #374151; line-height: 1.4;">${options.message}</p>
                <p style="margin: 0; font-size: 14px; font-weight: 600; color: #dc2626;">${options.price}</p>
            </div>
        </div>
        <div style="position: absolute; bottom: 0; left: 0; height: 3px; background: #16a34a; width: 100%; transform-origin: left; animation: toastProgress 4s linear forwards;"></div>
    `;
    
    // Add unique ID
    toast.id = `toast-${Date.now()}`;
    
    // Add CSS animation for progress bar
    if (!document.getElementById('toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            @keyframes toastProgress {
                from { transform: scaleX(1); }
                to { transform: scaleX(0); }
            }
            @keyframes toastSlideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes toastSlideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    toastContainer.appendChild(toast);
    
    // Trigger slide-in animation
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
        toast.style.opacity = '1';
    }, 10);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
        toast.style.animation = 'toastSlideOut 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 300);
    }, 4000);
}

// Initialize router when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.appRouter = new AppRouter();
});
