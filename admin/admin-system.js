/**
 * Admin System JavaScript
 * Comprehensive admin dashboard for store management
 */

// Game Toggle Functions - Define these first so they're available immediately
function switchInventoryGame(game) {
    if (window.adminSystem) {
        adminSystem.currentInventoryGame = game;
        
        // Update button styles
        const yugioBtn = document.getElementById('inventory-yugioh-btn');
        const pokemonBtn = document.getElementById('inventory-pokemon-btn');
        
        if (game === 'yugioh') {
            yugioBtn.style.background = 'var(--primary-color)';
            yugioBtn.style.color = 'white';
            pokemonBtn.style.background = 'transparent';
            pokemonBtn.style.color = 'var(--gray-600)';
        } else {
            pokemonBtn.style.background = 'var(--primary-color)';
            pokemonBtn.style.color = 'white';
            yugioBtn.style.background = 'transparent';
            yugioBtn.style.color = 'var(--gray-600)';
        }
        
        // Load cards for the selected game
        loadCardsFromAPI();
        adminSystem.showToast(`Switched to ${game === 'yugioh' ? 'Yu-Gi-Oh!' : 'Pokemon'}`, 'info');
    }
}

function switchBuylistGame(game) {
    if (window.adminSystem) {
        adminSystem.currentBuylistGame = game;
        
        // Filter buylist by game
        const gameFilter = document.getElementById('game-filter');
        if (gameFilter) {
            gameFilter.value = game;
            filterBuylistByGame();
        }
        
        adminSystem.showToast(`Filtered buylist to ${game === 'yugioh' ? 'Yu-Gi-Oh!' : 'Pokemon'}`, 'info');
    }
}

async function loadCardsFromAPI() {
    if (!window.adminSystem) return;
    
    const game = adminSystem.currentInventoryGame;
    adminSystem.showToast(`Loading ${game === 'yugioh' ? 'Yu-Gi-Oh!' : 'Pokemon'} cards from API...`, 'info');
    
    try {
        let newCards = [];
        
        if (game === 'yugioh') {
            // Load Yu-Gi-Oh! cards from YGOPRODeck API
            const metaCards = await window.ygoproAPI.getMetaCards();
            
            if (metaCards && metaCards.length > 0) {
                newCards = metaCards.map((card, index) => {
                    const formattedCard = window.ygoproAPI.formatCardForDisplay(card);
                    
                    return {
                        id: Date.now() + index,
                        name: card.name,
                        price: parseFloat(formattedCard.price),
                        quantity: adminSystem.generateRandomQuantity(),
                        category: adminSystem.getCardCategory(card),
                        rarity: formattedCard.rarity,
                        set: adminSystem.getCardSet(card),
                        lowStockThreshold: 5,
                        image: formattedCard.image,
                        game: 'yugioh',
                        apiData: card
                    };
                });
            }
        } else if (game === 'pokemon') {
            // Generate Pokemon cards (since we don't have a Pokemon API)
            const pokemonCards = [
                { name: 'Charizard', rarity: 'Holo Rare', set: 'Base Set', category: 'Pokemon', price: 45.99 },
                { name: 'Blastoise', rarity: 'Holo Rare', set: 'Base Set', category: 'Pokemon', price: 32.50 },
                { name: 'Venusaur', rarity: 'Holo Rare', set: 'Base Set', category: 'Pokemon', price: 28.75 },
                { name: 'Pikachu', rarity: 'Common', set: 'Base Set', category: 'Pokemon', price: 12.99 },
                { name: 'Mewtwo', rarity: 'Holo Rare', set: 'Base Set', category: 'Pokemon', price: 55.00 },
                { name: 'Mew', rarity: 'Holo Rare', set: 'Fossil', category: 'Pokemon', price: 38.50 },
                { name: 'Alakazam', rarity: 'Holo Rare', set: 'Base Set', category: 'Pokemon', price: 25.99 },
                { name: 'Machamp', rarity: 'Holo Rare', set: 'Base Set', category: 'Pokemon', price: 22.50 },
                { name: 'Gengar', rarity: 'Holo Rare', set: 'Fossil', category: 'Pokemon', price: 35.75 },
                { name: 'Dragonite', rarity: 'Holo Rare', set: 'Fossil', category: 'Pokemon', price: 42.00 }
            ];
            
            newCards = pokemonCards.map((card, index) => ({
                id: Date.now() + index,
                name: card.name,
                price: card.price,
                quantity: adminSystem.generateRandomQuantity(),
                category: card.category,
                rarity: card.rarity,
                set: card.set,
                lowStockThreshold: 5,
                image: 'https://images.pokemontcg.io/base1/4_hires.png', // Placeholder Pokemon image
                game: 'pokemon'
            }));
        }
        
        // Replace current inventory with new cards for the selected game
        const existingInventory = JSON.parse(localStorage.getItem('tcg-inventory') || '[]');
        const otherGameCards = existingInventory.filter(item => item.game && item.game !== game);
        const updatedInventory = [...otherGameCards, ...newCards];
        
        localStorage.setItem('tcg-inventory', JSON.stringify(updatedInventory));
        adminSystem.inventory = updatedInventory;
        
        // Update display to show only current game cards
        const currentGameCards = updatedInventory.filter(item => !item.game || item.game === game);
        const container = document.getElementById('inventory-list');
        if (container) {
            container.innerHTML = currentGameCards.map(item => adminSystem.generateInventoryHTML(item)).join('');
        }
        
        adminSystem.showToast(`Loaded ${newCards.length} ${game === 'yugioh' ? 'Yu-Gi-Oh!' : 'Pokemon'} cards`, 'success');
        
    } catch (error) {
        console.error('Error loading cards from API:', error);
        adminSystem.showToast('Error loading cards from API', 'error');
    }
}

// Make functions globally available immediately
window.switchInventoryGame = switchInventoryGame;
window.switchBuylistGame = switchBuylistGame;
window.loadCardsFromAPI = loadCardsFromAPI;

class AdminSystem {
    constructor() {
        this.currentAdmin = null;
        this.orders = [];
        this.customers = [];
        this.inventory = [];
        this.analytics = {};
        this.currentInventoryGame = 'yugioh';
        this.currentBuylistGame = 'yugioh';
        
        // Pagination settings
        this.pagination = {
            orders: {
                currentPage: 1,
                itemsPerPage: 10,
                totalItems: 0,
                totalPages: 0
            },
            customers: {
                currentPage: 1,
                itemsPerPage: 15,
                totalItems: 0,
                totalPages: 0
            },
            inventory: {
                currentPage: 1,
                itemsPerPage: 20,
                totalItems: 0,
                totalPages: 0
            },
            buylist: {
                currentPage: 1,
                itemsPerPage: 20,
                totalItems: 0,
                totalPages: 0
            }
        };
        
        // Filters and search
        this.filters = {
            orders: {
                status: '',
                dateRange: '',
                searchQuery: ''
            },
            customers: {
                status: '',
                searchQuery: ''
            },
            inventory: {
                category: '',
                lowStock: false,
                searchQuery: ''
            },
            buylist: {
                game: '',
                status: '',
                searchQuery: ''
            }
        };
        
        // Performance optimization flags
        this.isLoading = false;
        this.loadingStates = {
            orders: false,
            customers: false,
            inventory: false,
            buylist: false,
            analytics: false
        };
        
        this.init();
    }

    async init() {
        console.log('🔧 Admin System Initializing...');
        
        // Show initial loading state
        this.showGlobalLoading('Initializing admin dashboard...');
        
        try {
            // Check admin authentication
            this.checkAdminAuth();
            console.log('✅ Admin authentication verified');
            
            // Load all data with loading states
            await this.loadAllDataWithLoading();
            console.log('📊 Admin data loaded successfully');
            
            // Update dashboard
            this.updateDashboard();
            console.log('🎛️ Dashboard updated');
            
            // Set up periodic refresh (less frequent for performance)
            setInterval(() => {
                this.refreshDataInBackground();
            }, 60000); // Refresh every 60 seconds instead of 30
            
            console.log('⚡ Admin System fully initialized and ready');
            console.log(`📈 System Status:
- Total Orders: ${this.orders.length}
- Total Customers: ${this.customers.length}
- Inventory Items: ${this.inventory.length}
- Admin: ${this.currentAdmin?.firstName} ${this.currentAdmin?.lastName}`);
            
        } catch (error) {
            console.error('❌ Error initializing admin system:', error);
            this.showToast('Error initializing admin dashboard', 'error');
        } finally {
            this.hideGlobalLoading();
        }
    }

    checkAdminAuth() {
        const adminData = localStorage.getItem('tcg-admin');
        if (!adminData) {
            this.redirectToLogin();
            return;
        }

        try {
            this.currentAdmin = JSON.parse(adminData);
            if (!this.currentAdmin.isAdmin || !this.currentAdmin.isActive) {
                this.redirectToLogin();
                return;
            }
        } catch (error) {
            console.error('Invalid admin data:', error);
            this.redirectToLogin();
        }
    }

    redirectToLogin() {
        window.location.href = 'admin-login.html';
    }

    async loadAllData() {
        // Load orders (both user and guest orders)
        const userOrders = JSON.parse(localStorage.getItem('tcg-orders') || '[]');
        const guestOrders = JSON.parse(localStorage.getItem('tcg-guest-orders') || '[]');
        this.orders = [...userOrders, ...guestOrders].sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
        );

        // Load customers
        const users = JSON.parse(localStorage.getItem('tcg-users') || '{}');
        this.customers = Object.values(users).filter(user => !user.isAdmin);

        // Load inventory from API
        await this.loadInventoryData();

        // Load buylist data
        this.loadBuylistData();

        // Calculate analytics
        this.calculateAnalytics();
    }

    async loadAllDataWithLoading() {
        try {
            // Show loading for orders
            this.showSectionLoading('orders', 'Loading orders...');
            const userOrders = JSON.parse(localStorage.getItem('tcg-orders') || '[]');
            const guestOrders = JSON.parse(localStorage.getItem('tcg-guest-orders') || '[]');
            this.orders = [...userOrders, ...guestOrders].sort((a, b) => 
                new Date(b.createdAt) - new Date(a.createdAt)
            );
            this.hideSectionLoading('orders');

            // Show loading for customers
            this.showSectionLoading('customers', 'Loading customers...');
            const users = JSON.parse(localStorage.getItem('tcg-users') || '{}');
            this.customers = Object.values(users).filter(user => !user.isAdmin);
            this.hideSectionLoading('customers');

            // Show loading for inventory
            this.showSectionLoading('inventory', 'Loading inventory...');
            await this.loadInventoryData();
            this.hideSectionLoading('inventory');

            // Show loading for buylist
            this.showSectionLoading('buylist', 'Loading buylist...');
            this.loadBuylistData();
            this.hideSectionLoading('buylist');

            // Calculate analytics
            this.showSectionLoading('analytics', 'Calculating analytics...');
            this.calculateAnalytics();
            this.hideSectionLoading('analytics');

        } catch (error) {
            console.error('Error loading data:', error);
            this.hideAllSectionLoading();
            throw error;
        }
    }

    async refreshDataInBackground() {
        if (this.isLoading) return;
        
        try {
            this.isLoading = true;
            await this.loadAllData();
            this.updateDashboard();
        } catch (error) {
            console.error('Error refreshing data:', error);
        } finally {
            this.isLoading = false;
        }
    }

    showGlobalLoading(message = 'Loading...') {
        const loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'global-loading';
        loadingOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255, 255, 255, 0.9);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            font-family: inherit;
        `;
        
        loadingOverlay.innerHTML = `
            <div style="
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 20px;
                padding: 40px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            ">
                <div style="
                    width: 40px;
                    height: 40px;
                    border: 4px solid #e5e7eb;
                    border-top: 4px solid var(--primary-color);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                "></div>
                <div style="
                    font-size: 1.125rem;
                    font-weight: 600;
                    color: var(--gray-700);
                ">${message}</div>
            </div>
        `;

        // Add spin animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(loadingOverlay);
    }

    hideGlobalLoading() {
        const loadingOverlay = document.getElementById('global-loading');
        if (loadingOverlay) {
            loadingOverlay.remove();
        }
    }

    showSectionLoading(section, message = 'Loading...') {
        this.loadingStates[section] = true;
        
        const containers = {
            orders: ['pending-orders-list', 'processing-orders-list', 'completed-orders-list', 'all-orders-list'],
            customers: ['customers-list'],
            inventory: ['inventory-list'],
            buylist: ['buylist-items'],
            analytics: ['sales-chart', 'top-cards-list']
        };

        const sectionContainers = containers[section] || [];
        
        sectionContainers.forEach(containerId => {
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = `
                    <div style="
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        padding: 40px;
                        color: var(--gray-500);
                    ">
                        <div style="
                            width: 24px;
                            height: 24px;
                            border: 3px solid #e5e7eb;
                            border-top: 3px solid var(--primary-color);
                            border-radius: 50%;
                            animation: spin 1s linear infinite;
                            margin-bottom: 12px;
                        "></div>
                        <div style="font-size: 0.875rem;">${message}</div>
                    </div>
                `;
            }
        });
    }

    hideSectionLoading(section) {
        this.loadingStates[section] = false;
    }

    hideAllSectionLoading() {
        Object.keys(this.loadingStates).forEach(section => {
            this.loadingStates[section] = false;
        });
    }

    async loadInventoryData() {
        // Always try to load fresh data from API for better user experience
        console.log('🔄 Loading inventory from API...');
        
        try {
            // Check if API is available
            if (!window.ygoproAPI) {
                console.warn('⚠️ YGOPRODeck API not available, using fallback data');
                this.inventory = this.getFallbackInventory();
                return;
            }

            // Load meta cards from API with timeout
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('API timeout')), 5000)
            );
            
            const apiPromise = window.ygoproAPI.getMetaCards();
            const metaCards = await Promise.race([apiPromise, timeoutPromise]);
            
            if (metaCards && metaCards.length > 0) {
                const inventory = metaCards.map((card, index) => {
                    const formattedCard = window.ygoproAPI.formatCardForDisplay(card);
                    
                    return {
                        id: card.id || (Date.now() + index),
                        name: card.name,
                        price: parseFloat(formattedCard.price),
                        quantity: this.generateRandomQuantity(),
                        category: this.getCardCategory(card),
                        rarity: formattedCard.rarity,
                        set: this.getCardSet(card),
                        lowStockThreshold: 5,
                        image: formattedCard.image,
                        game: 'yugioh',
                        apiData: card // Store original API data
                    };
                });
                
                // Save to localStorage for future use
                localStorage.setItem('tcg-inventory', JSON.stringify(inventory));
                this.inventory = inventory;
                console.log(`✅ Loaded ${inventory.length} cards from API`);
            } else {
                console.warn('⚠️ No cards returned from API, using fallback data');
                this.inventory = this.getFallbackInventory();
            }
        } catch (error) {
            console.error('❌ Error loading cards from API:', error);
            
            // Try to load from localStorage first, then fallback
            const cachedInventory = JSON.parse(localStorage.getItem('tcg-inventory') || '[]');
            if (cachedInventory.length > 0) {
                console.log('📦 Using cached inventory data');
                this.inventory = cachedInventory;
            } else {
                console.log('🔄 Using fallback inventory data');
                this.inventory = this.getFallbackInventory();
            }
        }
    }

    generateRandomQuantity() {
        // Generate realistic inventory quantities
        const quantities = [0, 1, 2, 3, 4, 5, 8, 12, 15, 20, 25];
        return quantities[Math.floor(Math.random() * quantities.length)];
    }

    getCardCategory(card) {
        if (!card.type) return 'Unknown';
        
        if (card.type.includes('Monster')) return 'Monster';
        if (card.type.includes('Spell')) return 'Spell';
        if (card.type.includes('Trap')) return 'Trap';
        return 'Unknown';
    }

    getCardSet(card) {
        if (card.card_sets && card.card_sets.length > 0) {
            return card.card_sets[0].set_code || 'Unknown';
        }
        return 'Unknown';
    }

    getFallbackInventory() {
        return [
            {
                id: 1,
                name: 'Snake-Eye Ash',
                price: 45.99,
                quantity: 12,
                category: 'Monster',
                rarity: 'Ultra Rare',
                set: 'FIRE',
                lowStockThreshold: 5,
                image: 'https://images.ygoprodeck.com/images/cards/back.jpg'
            },
            {
                id: 2,
                name: 'Kashtira Fenrir',
                price: 32.50,
                quantity: 8,
                category: 'Monster',
                rarity: 'Secret Rare',
                set: 'PHHY',
                lowStockThreshold: 5,
                image: 'https://images.ygoprodeck.com/images/cards/back.jpg'
            },
            {
                id: 3,
                name: 'Ash Blossom & Joyous Spring',
                price: 28.75,
                quantity: 25,
                category: 'Monster',
                rarity: 'Ultra Rare',
                set: 'MAGO',
                lowStockThreshold: 10,
                image: 'https://images.ygoprodeck.com/images/cards/back.jpg'
            }
        ];
    }

    loadBuylistData() {
        // Load existing buylist or create sample data
        let buylist = JSON.parse(localStorage.getItem('tcg-buylist') || '[]');
        
        if (buylist.length === 0) {
            // Create sample buylist data
            buylist = [
                {
                    id: 1,
                    name: 'Blue-Eyes White Dragon',
                    game: 'yugioh',
                    cashPrice: 15.00,
                    creditPrice: 18.75,
                    category: 'Monster',
                    rarity: 'Ultra Rare',
                    set: 'LOB',
                    status: 'active',
                    maxQuantity: 4,
                    currentStock: 0,
                    image: 'https://images.ygoprodeck.com/images/cards/back.jpg',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 2,
                    name: 'Ash Blossom & Joyous Spring',
                    game: 'yugioh',
                    cashPrice: 22.00,
                    creditPrice: 27.50,
                    category: 'Monster',
                    rarity: 'Ultra Rare',
                    set: 'MAGO',
                    status: 'active',
                    maxQuantity: 4,
                    currentStock: 2,
                    image: 'https://images.ygoprodeck.com/images/cards/back.jpg',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 3,
                    name: 'Lightning Bolt',
                    game: 'magic',
                    cashPrice: 8.50,
                    creditPrice: 10.63,
                    category: 'Instant',
                    rarity: 'Common',
                    set: 'LEA',
                    status: 'active',
                    maxQuantity: 4,
                    currentStock: 1,
                    image: 'https://images.ygoprodeck.com/images/cards/back.jpg',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 4,
                    name: 'Charizard',
                    game: 'pokemon',
                    cashPrice: 45.00,
                    creditPrice: 56.25,
                    category: 'Pokemon',
                    rarity: 'Holo Rare',
                    set: 'Base Set',
                    status: 'out-of-stock',
                    maxQuantity: 2,
                    currentStock: 2,
                    image: 'https://images.ygoprodeck.com/images/cards/back.jpg',
                    createdAt: new Date().toISOString()
                }
            ];
            
            localStorage.setItem('tcg-buylist', JSON.stringify(buylist));
        }
        
        this.buylist = buylist;
        
        // Load buylist submissions
        this.buylistSubmissions = JSON.parse(localStorage.getItem('tcg-buylist-submissions') || '[]');
    }

    calculateAnalytics() {
        const totalOrders = this.orders.length;
        const totalRevenue = this.orders.reduce((sum, order) => sum + (order.total || 0), 0);
        const pendingOrders = this.orders.filter(order => order.status === 'pending').length;
        const totalCustomers = this.customers.length;

        // Calculate monthly revenue
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlyRevenue = this.orders
            .filter(order => {
                const orderDate = new Date(order.createdAt);
                return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
            })
            .reduce((sum, order) => sum + (order.total || 0), 0);

        // Top selling cards
        const cardSales = {};
        this.orders.forEach(order => {
            if (order.items) {
                order.items.forEach(item => {
                    if (cardSales[item.name]) {
                        cardSales[item.name] += item.quantity;
                    } else {
                        cardSales[item.name] = item.quantity;
                    }
                });
            }
        });

        const topCards = Object.entries(cardSales)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([name, quantity]) => ({ name, quantity }));

        this.analytics = {
            totalOrders,
            totalRevenue,
            pendingOrders,
            totalCustomers,
            monthlyRevenue,
            topCards
        };
    }

    updateDashboard() {
        // Update statistics cards with null checks
        const totalOrdersEl = document.getElementById('total-orders');
        const totalRevenueEl = document.getElementById('total-revenue');
        const pendingOrdersEl = document.getElementById('pending-orders');
        const totalCustomersEl = document.getElementById('total-customers');

        if (totalOrdersEl) totalOrdersEl.textContent = this.analytics?.totalOrders || 0;
        if (totalRevenueEl) totalRevenueEl.textContent = `$${(this.analytics?.totalRevenue || 0).toFixed(2)}`;
        if (pendingOrdersEl) pendingOrdersEl.textContent = this.analytics?.pendingOrders || 0;
        if (totalCustomersEl) totalCustomersEl.textContent = this.analytics?.totalCustomers || 0;

        // Update content based on current tab
        const activeTab = document.querySelector('.admin-tab.active');
        if (activeTab) {
            const tabName = activeTab.textContent.trim().toLowerCase();
            if (tabName.includes('orders')) {
                this.updateOrdersTab();
            } else if (tabName.includes('inventory')) {
                this.updateInventoryTab();
            } else if (tabName.includes('customers')) {
                this.updateCustomersTab();
            } else if (tabName.includes('analytics')) {
                this.updateAnalyticsTab();
            }
        }
    }

    updateOrdersTab() {
        // Update pending orders (limited display)
        const pendingOrders = this.orders.filter(order => order.status === 'pending');
        this.renderOrdersList(pendingOrders.slice(0, 5), 'pending-orders-list');

        // Update processing orders (limited display)
        const processingOrders = this.orders.filter(order => order.status === 'processing');
        this.renderOrdersList(processingOrders.slice(0, 5), 'processing-orders-list');

        // Update completed orders (limited display)
        const completedOrders = this.orders.filter(order => order.status === 'delivered');
        this.renderOrdersList(completedOrders.slice(0, 5), 'completed-orders-list');

        // Update all orders with pagination
        this.renderPaginatedOrders();
    }

    renderOrdersList(orders, containerId, showAll = false) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (orders.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--gray-500); padding: var(--space-4);">No orders found</p>';
            return;
        }

        const ordersToShow = showAll ? orders : orders.slice(0, 5);
        
        container.innerHTML = ordersToShow.map(order => this.generateOrderHTML(order)).join('');
    }

    renderPaginatedOrders() {
        const container = document.getElementById('all-orders-list');
        if (!container) return;

        // Apply filters
        let filteredOrders = this.applyOrderFilters(this.orders);
        
        // Update pagination info
        this.pagination.orders.totalItems = filteredOrders.length;
        this.pagination.orders.totalPages = Math.ceil(filteredOrders.length / this.pagination.orders.itemsPerPage);
        
        // Ensure current page is valid
        if (this.pagination.orders.currentPage > this.pagination.orders.totalPages) {
            this.pagination.orders.currentPage = Math.max(1, this.pagination.orders.totalPages);
        }

        // Get orders for current page
        const startIndex = (this.pagination.orders.currentPage - 1) * this.pagination.orders.itemsPerPage;
        const endIndex = startIndex + this.pagination.orders.itemsPerPage;
        const pageOrders = filteredOrders.slice(startIndex, endIndex);

        // Show loading state
        container.innerHTML = '<div style="text-align: center; padding: var(--space-4); color: var(--gray-500);">Loading orders...</div>';

        // Render immediately for better performance
        if (pageOrders.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--gray-500); padding: var(--space-4);">No orders found</p>';
        } else {
            container.innerHTML = pageOrders.map(order => this.generateOrderHTML(order)).join('');
        }
        
        // Update pagination controls
        this.updatePaginationControls('orders');
    }

    applyOrderFilters(orders) {
        let filtered = [...orders];
        
        // Apply status filter - include all statuses if no specific filter is set
        if (this.filters.orders.status && this.filters.orders.status !== 'all') {
            filtered = filtered.filter(order => order.status === this.filters.orders.status);
        }
        
        // Apply search filter
        if (this.filters.orders.searchQuery) {
            const query = this.filters.orders.searchQuery.toLowerCase();
            filtered = filtered.filter(order => {
                const customerName = order.guestInfo ? 
                    `${order.guestInfo.firstName} ${order.guestInfo.lastName}`.toLowerCase() : 
                    `customer #${order.userId}`.toLowerCase();
                const customerEmail = order.guestInfo ? order.guestInfo.email.toLowerCase() : '';
                
                return order.id.toString().includes(query) ||
                       customerName.includes(query) ||
                       customerEmail.includes(query);
            });
        }
        
        // Apply date range filter
        if (this.filters.orders.dateRange) {
            const now = new Date();
            let startDate;
            
            switch (this.filters.orders.dateRange) {
                case 'today':
                    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    break;
                case 'week':
                    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case 'month':
                    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                    break;
                case 'year':
                    startDate = new Date(now.getFullYear(), 0, 1);
                    break;
                default:
                    startDate = null;
            }
            
            if (startDate) {
                filtered = filtered.filter(order => new Date(order.createdAt) >= startDate);
            }
        }
        
        return filtered;
    }

    updatePaginationControls(type) {
        const pagination = this.pagination[type];
        const container = document.getElementById(`${type}-pagination`);
        
        if (!container || pagination.totalPages <= 1) {
            if (container) container.style.display = 'none';
            return;
        }
        
        container.style.display = 'flex';
        container.innerHTML = `
            <div style="display: flex; align-items: center; gap: var(--space-2); justify-content: space-between; width: 100%; padding: var(--space-3); background: var(--gray-50); border-radius: var(--radius-lg); margin-top: var(--space-4);">
                <div style="display: flex; align-items: center; gap: var(--space-2);">
                    <button class="admin-btn btn-secondary" 
                            onclick="adminSystem.changePage('${type}', ${pagination.currentPage - 1})"
                            ${pagination.currentPage <= 1 ? 'disabled' : ''}>
                        ← Previous
                    </button>
                    <span style="font-size: 0.875rem; color: var(--gray-600);">
                        Page ${pagination.currentPage} of ${pagination.totalPages}
                    </span>
                    <button class="admin-btn btn-secondary" 
                            onclick="adminSystem.changePage('${type}', ${pagination.currentPage + 1})"
                            ${pagination.currentPage >= pagination.totalPages ? 'disabled' : ''}>
                        Next →
                    </button>
                </div>
                
                <div style="display: flex; align-items: center; gap: var(--space-2);">
                    <span style="font-size: 0.875rem; color: var(--gray-600);">Items per page:</span>
                    <select onchange="adminSystem.changeItemsPerPage('${type}', this.value)" 
                            style="padding: var(--space-1) var(--space-2); border: 1px solid var(--gray-300); border-radius: var(--radius-sm); font-size: 0.875rem;">
                        <option value="5" ${pagination.itemsPerPage === 5 ? 'selected' : ''}>5</option>
                        <option value="10" ${pagination.itemsPerPage === 10 ? 'selected' : ''}>10</option>
                        <option value="20" ${pagination.itemsPerPage === 20 ? 'selected' : ''}>20</option>
                        <option value="50" ${pagination.itemsPerPage === 50 ? 'selected' : ''}>50</option>
                    </select>
                </div>
                
                <div style="font-size: 0.875rem; color: var(--gray-600);">
                    Showing ${((pagination.currentPage - 1) * pagination.itemsPerPage) + 1}-${Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of ${pagination.totalItems} items
                </div>
            </div>
        `;
    }

    changePage(type, newPage) {
        const pagination = this.pagination[type];
        
        if (newPage < 1 || newPage > pagination.totalPages) return;
        
        pagination.currentPage = newPage;
        
        // Re-render the appropriate content
        if (type === 'orders') {
            this.renderPaginatedOrders();
        } else if (type === 'customers') {
            this.renderPaginatedCustomers();
        } else if (type === 'inventory') {
            this.renderPaginatedInventory();
        } else if (type === 'buylist') {
            this.renderPaginatedBuylist();
        }
    }

    changeItemsPerPage(type, newItemsPerPage) {
        const pagination = this.pagination[type];
        pagination.itemsPerPage = parseInt(newItemsPerPage);
        pagination.currentPage = 1; // Reset to first page
        
        // Re-render the appropriate content
        if (type === 'orders') {
            this.renderPaginatedOrders();
        } else if (type === 'customers') {
            this.renderPaginatedCustomers();
        } else if (type === 'inventory') {
            this.renderPaginatedInventory();
        } else if (type === 'buylist') {
            this.renderPaginatedBuylist();
        }
    }

    // Enhanced search with real-time filtering
    searchOrders() {
        const query = document.getElementById('order-search')?.value || '';
        this.filters.orders.searchQuery = query;
        this.pagination.orders.currentPage = 1; // Reset to first page
        this.renderPaginatedOrders();
    }

    filterOrdersByStatus(status) {
        this.filters.orders.status = status;
        this.pagination.orders.currentPage = 1; // Reset to first page
        this.renderPaginatedOrders();
    }

    filterOrdersByDateRange(dateRange) {
        this.filters.orders.dateRange = dateRange;
        this.pagination.orders.currentPage = 1; // Reset to first page
        this.renderPaginatedOrders();
    }

    generateOrderHTML(order) {
        const orderDate = new Date(order.createdAt).toLocaleDateString();
        const customerName = order.guestInfo ? 
            `${order.guestInfo.firstName} ${order.guestInfo.lastName}` : 
            `Customer #${order.userId}`;
        const customerEmail = order.guestInfo ? order.guestInfo.email : 'N/A';
        const itemCount = order.items ? order.items.reduce((sum, item) => sum + item.quantity, 0) : 0;

        return `
            <div class="order-item">
                <div class="order-info">
                    <h4>Order #${order.id}</h4>
                    <p><strong>${customerName}</strong> - ${customerEmail}</p>
                    <p>${itemCount} items • ${orderDate} • $${(order.total || 0).toFixed(2)}</p>
                </div>
                <div style="display: flex; flex-direction: column; gap: var(--space-2); align-items: flex-end;">
                    <span class="order-status status-${order.status}">${order.status}</span>
                    <div style="display: flex; gap: var(--space-2);">
                        <button class="admin-btn btn-primary" onclick="adminSystem.viewOrderDetails(${order.id})">
                            View
                        </button>
                        <button class="admin-btn btn-success" onclick="adminSystem.updateOrderStatus(${order.id})">
                            Update
                        </button>
                        <button class="admin-btn btn-danger" onclick="adminSystem.deleteOrder(${order.id})" title="Delete Order">
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    updateInventoryTab() {
        const container = document.getElementById('inventory-list');
        if (!container) return;

        if (this.inventory.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--gray-500); padding: var(--space-4);">No inventory items found</p>';
            return;
        }

        container.innerHTML = this.inventory.map(item => this.generateInventoryHTML(item)).join('');
    }

    generateInventoryHTML(item) {
        const isLowStock = item.quantity <= item.lowStockThreshold;
        const stockStatus = isLowStock ? 'Low Stock' : 'In Stock';
        const stockColor = isLowStock ? 'var(--error-color)' : 'var(--success-color)';

        return `
            <div class="inventory-item">
                <div class="inventory-info">
                    <h4>${item.name}</h4>
                    <p>${item.category} • ${item.rarity} • ${item.set}</p>
                    <p style="color: ${stockColor}; font-weight: 600;">${stockStatus} (${item.quantity} available)</p>
                </div>
                <div class="inventory-controls">
                    <span style="font-size: 0.875rem; color: var(--gray-600);">Price:</span>
                    <input type="number" class="price-input" value="${item.price}" 
                           onchange="adminSystem.updateItemPrice(${item.id}, this.value)" step="0.01" min="0">
                    <span style="font-size: 0.875rem; color: var(--gray-600);">Qty:</span>
                    <input type="number" class="quantity-input" value="${item.quantity}" 
                           onchange="adminSystem.updateItemQuantity(${item.id}, this.value)" min="0">
                    <button class="admin-btn btn-secondary" onclick="adminSystem.editInventoryItem(${item.id})">
                        Edit
                    </button>
                </div>
            </div>
        `;
    }

    updateCustomersTab() {
        const container = document.getElementById('customers-list');
        if (!container) return;

        if (this.customers.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--gray-500); padding: var(--space-4);">No customers found</p>';
            return;
        }

        container.innerHTML = this.customers.map(customer => this.generateCustomerHTML(customer)).join('');
    }

    generateCustomerHTML(customer) {
        const joinDate = new Date(customer.createdAt).toLocaleDateString();
        const customerOrders = this.orders.filter(order => order.userId === customer.id);
        const totalSpent = customerOrders.reduce((sum, order) => sum + (order.total || 0), 0);

        return `
            <div class="order-item">
                <div class="order-info">
                    <h4>${customer.firstName} ${customer.lastName}</h4>
                    <p><strong>Email:</strong> ${customer.email}</p>
                    <p><strong>Phone:</strong> ${customer.phone || 'N/A'}</p>
                    <p>Joined: ${joinDate} • ${customerOrders.length} orders • $${totalSpent.toFixed(2)} spent</p>
                </div>
                <div style="display: flex; flex-direction: column; gap: var(--space-2); align-items: flex-end;">
                    <span class="order-status ${customer.isActive ? 'status-delivered' : 'status-pending'}">
                        ${customer.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <div style="display: flex; gap: var(--space-2);">
                        <button class="admin-btn btn-primary" onclick="adminSystem.viewCustomerDetails('${customer.id}')">
                            View
                        </button>
                        <button class="admin-btn btn-secondary" onclick="adminSystem.toggleCustomerStatus('${customer.id}')">
                            ${customer.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    updateAnalyticsTab() {
        // Update sales chart (simple text-based for now)
        const salesChart = document.getElementById('sales-chart');
        if (salesChart) {
            salesChart.innerHTML = `
                <div style="text-align: center; padding: var(--space-6);">
                    <h4 style="font-size: 1.5rem; font-weight: 700; color: var(--primary-color); margin-bottom: var(--space-4);">
                        $${this.analytics.monthlyRevenue.toFixed(2)}
                    </h4>
                    <p style="color: var(--gray-600);">Revenue This Month</p>
                    <div style="margin-top: var(--space-4); padding: var(--space-4); background: var(--gray-50); border-radius: var(--radius-lg);">
                        <p style="font-size: 0.875rem; color: var(--gray-600); margin: 0;">
                            <strong>Total Orders:</strong> ${this.analytics.totalOrders}<br>
                            <strong>Average Order Value:</strong> $${this.analytics.totalOrders > 0 ? (this.analytics.totalRevenue / this.analytics.totalOrders).toFixed(2) : '0.00'}
                        </p>
                    </div>
                </div>
            `;
        }

        // Update top cards list
        const topCardsList = document.getElementById('top-cards-list');
        if (topCardsList) {
            if (this.analytics.topCards.length === 0) {
                topCardsList.innerHTML = '<p style="text-align: center; color: var(--gray-500); padding: var(--space-4);">No sales data available</p>';
            } else {
                topCardsList.innerHTML = this.analytics.topCards.map((card, index) => `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: var(--space-2); border-bottom: 1px solid var(--gray-200);">
                        <div>
                            <span style="font-weight: 600; color: var(--primary-color); margin-right: var(--space-2);">#${index + 1}</span>
                            <span style="font-size: 0.875rem;">${card.name}</span>
                        </div>
                        <span style="font-weight: 600; color: var(--success-color);">${card.quantity} sold</span>
                    </div>
                `).join('');
            }
        }
    }

    // Order Management Functions
    viewOrderDetails(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) return;

        this.showModal('Order Details', this.generateOrderDetailsHTML(order));
    }

    generateOrderDetailsHTML(order) {
        const orderDate = new Date(order.createdAt).toLocaleDateString();
        const customerInfo = order.guestInfo ? order.guestInfo : { firstName: 'Customer', lastName: `#${order.userId}`, email: 'N/A' };
        
        return `
            <div style="max-width: 600px;">
                <div style="margin-bottom: var(--space-4); padding: var(--space-4); background: var(--gray-50); border-radius: var(--radius-lg);">
                    <h4 style="margin: 0 0 var(--space-2) 0;">Order #${order.id}</h4>
                    <p style="margin: 0; color: var(--gray-600);">Placed on ${orderDate}</p>
                    <p style="margin: var(--space-2) 0 0 0;"><strong>Status:</strong> <span class="order-status status-${order.status}">${order.status}</span></p>
                </div>

                <div style="margin-bottom: var(--space-4);">
                    <h5 style="margin: 0 0 var(--space-2) 0;">Customer Information</h5>
                    <p style="margin: 0;"><strong>Name:</strong> ${customerInfo.firstName} ${customerInfo.lastName}</p>
                    <p style="margin: 0;"><strong>Email:</strong> ${customerInfo.email}</p>
                    ${customerInfo.phone ? `<p style="margin: 0;"><strong>Phone:</strong> ${customerInfo.phone}</p>` : ''}
                    ${customerInfo.address ? `
                        <p style="margin: var(--space-2) 0 0 0;"><strong>Shipping Address:</strong><br>
                        ${customerInfo.address.street}<br>
                        ${customerInfo.address.street2 ? customerInfo.address.street2 + '<br>' : ''}
                        ${customerInfo.address.city}, ${customerInfo.address.province} ${customerInfo.address.postalCode}</p>
                    ` : ''}
                </div>

                <div style="margin-bottom: var(--space-4);">
                    <h5 style="margin: 0 0 var(--space-2) 0;">Order Items</h5>
                    ${order.items ? order.items.map(item => {
                        // Enhanced item name recovery
                        let itemName = item.name;
                        if (!itemName || itemName === 'Unknown Item' || itemName.trim() === '') {
                            // Try to recover from other possible properties
                            itemName = item.cardName || item.title || item.productName || 'Unnamed Item';
                        }
                        
                        return `
                            <div style="display: flex; justify-content: space-between; padding: var(--space-2); border-bottom: 1px solid var(--gray-200);">
                                <div>
                                    <strong>${itemName}</strong><br>
                                    <small>Qty: ${item.quantity || 0} × $${(item.price || 0).toFixed(2)}</small>
                                    ${item.setCode && item.rarity ? `<br><small style="color: var(--gray-500);">${item.setCode} - ${item.rarity}</small>` : ''}
                                </div>
                                <div style="font-weight: 600;">$${((item.price || 0) * (item.quantity || 0)).toFixed(2)}</div>
                            </div>
                        `;
                    }).join('') : '<p>No items found</p>'}
                </div>

                <div style="padding: var(--space-4); background: var(--gray-50); border-radius: var(--radius-lg);">
                    <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-1);">
                        <span>Subtotal:</span>
                        <span>$${(order.subtotal || 0).toFixed(2)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-1);">
                        <span>Shipping:</span>
                        <span>${(order.shipping || 0) === 0 ? 'FREE' : '$' + (order.shipping || 0).toFixed(2)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-2);">
                        <span>Tax:</span>
                        <span>$${(order.tax || 0).toFixed(2)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 1.125rem; border-top: 1px solid var(--gray-300); padding-top: var(--space-2);">
                        <span>Total:</span>
                        <span style="color: var(--primary-color);">$${(order.total || 0).toFixed(2)}</span>
                    </div>
                </div>

                <div style="margin-top: var(--space-4); display: flex; gap: var(--space-3); justify-content: center;">
                    <button class="admin-btn btn-success" onclick="adminSystem.updateOrderStatus(${order.id})">
                        Update Status
                    </button>
                    ${order.status === 'shipped' && order.trackingNumber ? `
                        <button class="admin-btn btn-primary" onclick="adminSystem.editTrackingNumber(${order.id})">
                            Edit Tracking
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    updateOrderStatus(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) return;

        const statusOptions = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        const currentIndex = statusOptions.indexOf(order.status);
        
        const modalContent = `
            <div style="text-align: center;">
                <h4 style="margin-bottom: var(--space-4);">Update Order #${orderId} Status</h4>
                <div style="margin-bottom: var(--space-4);">
                    <label style="display: block; margin-bottom: var(--space-2); font-weight: 600;">Current Status: ${order.status}</label>
                    <select id="new-status" style="width: 100%; padding: var(--space-3); border: 1px solid var(--gray-300); border-radius: var(--radius-md);">
                        ${statusOptions.map(status => `
                            <option value="${status}" ${status === order.status ? 'selected' : ''}>${status.charAt(0).toUpperCase() + status.slice(1)}</option>
                        `).join('')}
                    </select>
                </div>
                <div id="tracking-section" style="display: ${order.status === 'shipped' || document.getElementById('new-status')?.value === 'shipped' ? 'block' : 'none'}; margin-bottom: var(--space-4);">
                    <label style="display: block; margin-bottom: var(--space-2); font-weight: 600;">Tracking Number:</label>
                    <input type="text" id="tracking-number" value="${order.trackingNumber || ''}" 
                           style="width: 100%; padding: var(--space-3); border: 1px solid var(--gray-300); border-radius: var(--radius-md);" 
                           placeholder="Enter tracking number">
                </div>
                <div style="display: flex; gap: var(--space-3); justify-content: center;">
                    <button class="admin-btn btn-secondary" onclick="adminSystem.closeModal()">Cancel</button>
                    <button class="admin-btn btn-success" onclick="adminSystem.confirmStatusUpdate(${orderId})">Update</button>
                </div>
            </div>
        `;

        this.showModal('Update Order Status', modalContent);

        // Add event listener for status change
        setTimeout(() => {
            const statusSelect = document.getElementById('new-status');
            const trackingSection = document.getElementById('tracking-section');
            if (statusSelect && trackingSection) {
                statusSelect.addEventListener('change', (e) => {
                    trackingSection.style.display = e.target.value === 'shipped' ? 'block' : 'none';
                });
            }
        }, 100);
    }

    confirmStatusUpdate(orderId) {
        const newStatus = document.getElementById('new-status')?.value;
        const trackingNumber = document.getElementById('tracking-number')?.value;
        
        if (!newStatus) return;

        // Update order in both possible locations
        let updated = false;
        
        // Update in user orders
        const userOrders = JSON.parse(localStorage.getItem('tcg-orders') || '[]');
        const userOrderIndex = userOrders.findIndex(o => o.id === orderId);
        if (userOrderIndex !== -1) {
            userOrders[userOrderIndex].status = newStatus;
            userOrders[userOrderIndex].updatedAt = new Date().toISOString();
            if (newStatus === 'shipped' && trackingNumber) {
                userOrders[userOrderIndex].trackingNumber = trackingNumber;
            }
            localStorage.setItem('tcg-orders', JSON.stringify(userOrders));
            updated = true;
        }

        // Update in guest orders
        const guestOrders = JSON.parse(localStorage.getItem('tcg-guest-orders') || '[]');
        const guestOrderIndex = guestOrders.findIndex(o => o.id === orderId);
        if (guestOrderIndex !== -1) {
            guestOrders[guestOrderIndex].status = newStatus;
            guestOrders[guestOrderIndex].updatedAt = new Date().toISOString();
            if (newStatus === 'shipped' && trackingNumber) {
                guestOrders[guestOrderIndex].trackingNumber = trackingNumber;
            }
            localStorage.setItem('tcg-guest-orders', JSON.stringify(guestOrders));
            updated = true;
        }

        if (updated) {
            this.closeModal();
            this.loadAllData();
            this.updateDashboard();
            this.showToast(`Order #${orderId} status updated to ${newStatus}`, 'success');
        } else {
            this.showToast('Order not found', 'error');
        }
    }

    deleteOrder(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) {
            this.showToast('Order not found', 'error');
            return;
        }

        const customerName = order.guestInfo ? 
            `${order.guestInfo.firstName} ${order.guestInfo.lastName}` : 
            `Customer #${order.userId}`;

        const modalContent = `
            <div style="max-width: 500px; text-align: center;">
                <div style="font-size: 3rem; margin-bottom: var(--space-4); color: var(--error-color);">⚠️</div>
                <h4 style="margin-bottom: var(--space-4); color: var(--error-color);">Delete Order #${orderId}?</h4>
                <div style="background: var(--gray-50); border-radius: var(--radius-lg); padding: var(--space-4); margin-bottom: var(--space-4); text-align: left;">
                    <p style="margin: 0; font-size: 0.875rem; color: var(--gray-700);"><strong>Customer:</strong> ${customerName}</p>
                    <p style="margin: 0; font-size: 0.875rem; color: var(--gray-700);"><strong>Total:</strong> $${(order.total || 0).toFixed(2)}</p>
                    <p style="margin: 0; font-size: 0.875rem; color: var(--gray-700);"><strong>Status:</strong> ${order.status}</p>
                    <p style="margin: 0; font-size: 0.875rem; color: var(--gray-700);"><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <p style="color: var(--error-color); font-weight: 600; margin-bottom: var(--space-6);">
                    This action cannot be undone. The order will be permanently deleted from the system.
                </p>
                <div style="display: flex; gap: var(--space-3); justify-content: center;">
                    <button class="admin-btn btn-secondary" onclick="adminSystem.closeModal()">Cancel</button>
                    <button class="admin-btn btn-danger" onclick="adminSystem.confirmDeleteOrder(${orderId})">
                        <i class="fas fa-trash"></i> Delete Order
                    </button>
                </div>
            </div>
        `;

        this.showModal('Delete Order', modalContent);
    }

    confirmDeleteOrder(orderId) {
        let deleted = false;
        
        // Delete from user orders
        const userOrders = JSON.parse(localStorage.getItem('tcg-orders') || '[]');
        const userOrderIndex = userOrders.findIndex(o => o.id === orderId);
        if (userOrderIndex !== -1) {
            userOrders.splice(userOrderIndex, 1);
            localStorage.setItem('tcg-orders', JSON.stringify(userOrders));
            deleted = true;
        }

        // Delete from guest orders
        const guestOrders = JSON.parse(localStorage.getItem('tcg-guest-orders') || '[]');
        const guestOrderIndex = guestOrders.findIndex(o => o.id === orderId);
        if (guestOrderIndex !== -1) {
            guestOrders.splice(guestOrderIndex, 1);
            localStorage.setItem('tcg-guest-orders', JSON.stringify(guestOrders));
            deleted = true;
        }

        if (deleted) {
            this.closeModal();
            this.loadAllData();
            this.updateDashboard();
            this.showToast(`Order #${orderId} deleted successfully`, 'success');
        } else {
            this.showToast('Order not found', 'error');
        }
    }

    // Inventory Management Functions
    updateItemPrice(itemId, newPrice) {
        const item = this.inventory.find(i => i.id === itemId);
        if (!item) return;

        const price = parseFloat(newPrice);
        if (isNaN(price) || price < 0) {
            this.showToast('Invalid price', 'error');
            return;
        }

        item.price = price;
        localStorage.setItem('tcg-inventory', JSON.stringify(this.inventory));
        this.showToast(`Price updated for ${item.name}`, 'success');
    }

    updateItemQuantity(itemId, newQuantity) {
        const item = this.inventory.find(i => i.id === itemId);
        if (!item) return;

        const quantity = parseInt(newQuantity);
        if (isNaN(quantity) || quantity < 0) {
            this.showToast('Invalid quantity', 'error');
            return;
        }

        item.quantity = quantity;
        localStorage.setItem('tcg-inventory', JSON.stringify(this.inventory));
        this.showToast(`Quantity updated for ${item.name}`, 'success');
        
        // Refresh inventory display to update stock status
        this.updateInventoryTab();
    }

    addNewCard() {
        const modalContent = `
            <div style="max-width: 500px;">
                <h4 style="margin-bottom: var(--space-4); text-align: center;">Add New Card</h4>
                <form id="add-card-form" onsubmit="adminSystem.submitNewCard(event)">
                    <div style="margin-bottom: var(--space-3);">
                        <label style="display: block; margin-bottom: var(--space-1); font-weight: 600;">Card Name *</label>
                        <input type="text" id="card-name" required style="width: 100%; padding: var(--space-2); border: 1px solid var(--gray-300); border-radius: var(--radius-md);">
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); margin-bottom: var(--space-3);">
                        <div>
                            <label style="display: block; margin-bottom: var(--space-1); font-weight: 600;">Price *</label>
                            <input type="number" id="card-price" required step="0.01" min="0" style="width: 100%; padding: var(--space-2); border: 1px solid var(--gray-300); border-radius: var(--radius-md);">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: var(--space-1); font-weight: 600;">Quantity *</label>
                            <input type="number" id="card-quantity" required min="0" style="width: 100%; padding: var(--space-2); border: 1px solid var(--gray-300); border-radius: var(--radius-md);">
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); margin-bottom: var(--space-3);">
                        <div>
                            <label style="display: block; margin-bottom: var(--space-1); font-weight: 600;">Category</label>
                            <select id="card-category" style="width: 100%; padding: var(--space-2); border: 1px solid var(--gray-300); border-radius: var(--radius-md);">
                                <option value="Monster">Monster</option>
                                <option value="Spell">Spell</option>
                                <option value="Trap">Trap</option>
                            </select>
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: var(--space-1); font-weight: 600;">Rarity</label>
                            <select id="card-rarity" style="width: 100%; padding: var(--space-2); border: 1px solid var(--gray-300); border-radius: var(--radius-md);">
                                <option value="Common">Common</option>
                                <option value="Rare">Rare</option>
                                <option value="Super Rare">Super Rare</option>
                                <option value="Ultra Rare">Ultra Rare</option>
                                <option value="Secret Rare">Secret Rare</option>
                            </select>
                        </div>
                    </div>
                    <div style="margin-bottom: var(--space-3);">
                        <label style="display: block; margin-bottom: var(--space-1); font-weight: 600;">Set Code</label>
                        <input type="text" id="card-set" style="width: 100%; padding: var(--space-2); border: 1px solid var(--gray-300); border-radius: var(--radius-md);" placeholder="e.g., LOB, MRD">
                    </div>
                    <div style="margin-bottom: var(--space-4);">
                        <label style="display: block; margin-bottom: var(--space-1); font-weight: 600;">Low Stock Threshold</label>
                        <input type="number" id="card-threshold" value="5" min="0" style="width: 100%; padding: var(--space-2); border: 1px solid var(--gray-300); border-radius: var(--radius-md);">
                    </div>
                    <div style="display: flex; gap: var(--space-3); justify-content: center;">
                        <button type="button" class="admin-btn btn-secondary" onclick="adminSystem.closeModal()">Cancel</button>
                        <button type="submit" class="admin-btn btn-primary">Add Card</button>
                    </div>
                </form>
            </div>
        `;

        this.showModal('Add New Card', modalContent);
    }

    submitNewCard(event) {
        event.preventDefault();
        
        const name = document.getElementById('card-name').value;
        const price = parseFloat(document.getElementById('card-price').value);
        const quantity = parseInt(document.getElementById('card-quantity').value);
        const category = document.getElementById('card-category').value;
        const rarity = document.getElementById('card-rarity').value;
        const set = document.getElementById('card-set').value;
        const threshold = parseInt(document.getElementById('card-threshold').value);

        if (!name || isNaN(price) || isNaN(quantity) || isNaN(threshold)) {
            this.showToast('Please fill in all required fields correctly', 'error');
            return;
        }

        const newCard = {
            id: Date.now(),
            name,
            price,
            quantity,
            category,
            rarity,
            set,
            lowStockThreshold: threshold,
            image: 'https://images.ygoprodeck.com/images/cards/back.jpg'
        };

        this.inventory.push(newCard);
        localStorage.setItem('tcg-inventory', JSON.stringify(this.inventory));
        
        this.closeModal();
        this.updateInventoryTab();
        this.showToast(`${name} added to inventory`, 'success');
    }

    editInventoryItem(itemId) {
        const item = this.inventory.find(i => i.id === itemId);
        if (!item) return;

        const modalContent = `
            <div style="max-width: 500px;">
                <h4 style="margin-bottom: var(--space-4); text-align: center;">Edit ${item.name}</h4>
                <form id="edit-card-form" onsubmit="adminSystem.submitEditCard(event, ${itemId})">
                    <div style="margin-bottom: var(--space-3);">
                        <label style="display: block; margin-bottom: var(--space-1); font-weight: 600;">Card Name *</label>
                        <input type="text" id="edit-card-name" value="${item.name}" required style="width: 100%; padding: var(--space-2); border: 1px solid var(--gray-300); border-radius: var(--radius-md);">
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); margin-bottom: var(--space-3);">
                        <div>
                            <label style="display: block; margin-bottom: var(--space-1); font-weight: 600;">Price *</label>
                            <input type="number" id="edit-card-price" value="${item.price}" required step="0.01" min="0" style="width: 100%; padding: var(--space-2); border: 1px solid var(--gray-300); border-radius: var(--radius-md);">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: var(--space-1); font-weight: 600;">Quantity *</label>
                            <input type="number" id="edit-card-quantity" value="${item.quantity}" required min="0" style="width: 100%; padding: var(--space-2); border: 1px solid var(--gray-300); border-radius: var(--radius-md);">
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); margin-bottom: var(--space-3);">
                        <div>
                            <label style="display: block; margin-bottom: var(--space-1); font-weight: 600;">Category</label>
                            <select id="edit-card-category" style="width: 100%; padding: var(--space-2); border: 1px solid var(--gray-300); border-radius: var(--radius-md);">
                                <option value="Monster" ${item.category === 'Monster' ? 'selected' : ''}>Monster</option>
                                <option value="Spell" ${item.category === 'Spell' ? 'selected' : ''}>Spell</option>
                                <option value="Trap" ${item.category === 'Trap' ? 'selected' : ''}>Trap</option>
                            </select>
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: var(--space-1); font-weight: 600;">Rarity</label>
                            <select id="edit-card-rarity" style="width: 100%; padding: var(--space-2); border: 1px solid var(--gray-300); border-radius: var(--radius-md);">
                                <option value="Common" ${item.rarity === 'Common' ? 'selected' : ''}>Common</option>
                                <option value="Rare" ${item.rarity === 'Rare' ? 'selected' : ''}>Rare</option>
                                <option value="Super Rare" ${item.rarity === 'Super Rare' ? 'selected' : ''}>Super Rare</option>
                                <option value="Ultra Rare" ${item.rarity === 'Ultra Rare' ? 'selected' : ''}>Ultra Rare</option>
                                <option value="Secret Rare" ${item.rarity === 'Secret Rare' ? 'selected' : ''}>Secret Rare</option>
                            </select>
                        </div>
                    </div>
                    <div style="margin-bottom: var(--space-3);">
                        <label style="display: block; margin-bottom: var(--space-1); font-weight: 600;">Set Code</label>
                        <input type="text" id="edit-card-set" value="${item.set}" style="width: 100%; padding: var(--space-2); border: 1px solid var(--gray-300); border-radius: var(--radius-md);">
                    </div>
                    <div style="margin-bottom: var(--space-4);">
                        <label style="display: block; margin-bottom: var(--space-1); font-weight: 600;">Low Stock Threshold</label>
                        <input type="number" id="edit-card-threshold" value="${item.lowStockThreshold}" min="0" style="width: 100%; padding: var(--space-2); border: 1px solid var(--gray-300); border-radius: var(--radius-md);">
                    </div>
                    <div style="display: flex; gap: var(--space-3); justify-content: center;">
                        <button type="button" class="admin-btn btn-danger" onclick="adminSystem.deleteInventoryItem(${itemId})">Delete</button>
                        <button type="button" class="admin-btn btn-secondary" onclick="adminSystem.closeModal()">Cancel</button>
                        <button type="submit" class="admin-btn btn-primary">Save Changes</button>
                    </div>
                </form>
            </div>
        `;

        this.showModal('Edit Card', modalContent);
    }

    submitEditCard(event, itemId) {
        event.preventDefault();
        
        const item = this.inventory.find(i => i.id === itemId);
        if (!item) return;

        const name = document.getElementById('edit-card-name').value;
        const price = parseFloat(document.getElementById('edit-card-price').value);
        const quantity = parseInt(document.getElementById('edit-card-quantity').value);
        const category = document.getElementById('edit-card-category').value;
        const rarity = document.getElementById('edit-card-rarity').value;
        const set = document.getElementById('edit-card-set').value;
        const threshold = parseInt(document.getElementById('edit-card-threshold').value);

        if (!name || isNaN(price) || isNaN(quantity) || isNaN(threshold)) {
            this.showToast('Please fill in all required fields correctly', 'error');
            return;
        }

        item.name = name;
        item.price = price;
        item.quantity = quantity;
        item.category = category;
        item.rarity = rarity;
        item.set = set;
        item.lowStockThreshold = threshold;

        localStorage.setItem('tcg-inventory', JSON.stringify(this.inventory));
        
        this.closeModal();
        this.updateInventoryTab();
        this.showToast(`${name} updated successfully`, 'success');
    }

    deleteInventoryItem(itemId) {
        const item = this.inventory.find(i => i.id === itemId);
        if (!item) return;

        if (confirm(`Are you sure you want to delete ${item.name} from inventory?`)) {
            this.inventory = this.inventory.filter(i => i.id !== itemId);
            localStorage.setItem('tcg-inventory', JSON.stringify(this.inventory));
            
            this.closeModal();
            this.updateInventoryTab();
            this.showToast(`${item.name} deleted from inventory`, 'success');
        }
    }

    bulkUpdatePrices() {
        const modalContent = `
            <div style="max-width: 400px; text-align: center;">
                <h4 style="margin-bottom: var(--space-4);">Bulk Update Prices</h4>
                <p style="margin-bottom: var(--space-4); color: var(--gray-600);">Apply a percentage change to all inventory prices</p>
                <div style="margin-bottom: var(--space-4);">
                    <label style="display: block; margin-bottom: var(--space-2); font-weight: 600;">Price Change (%)</label>
                    <input type="number" id="price-change" step="0.1" placeholder="e.g., 10 for +10%, -5 for -5%" style="width: 100%; padding: var(--space-3); border: 1px solid var(--gray-300); border-radius: var(--radius-md); text-align: center;">
                </div>
                <div style="display: flex; gap: var(--space-3); justify-content: center;">
                    <button class="admin-btn btn-secondary" onclick="adminSystem.closeModal()">Cancel</button>
                    <button class="admin-btn btn-primary" onclick="adminSystem.confirmBulkPriceUpdate()">Update Prices</button>
                </div>
            </div>
        `;

        this.showModal('Bulk Price Update', modalContent);
    }

    confirmBulkPriceUpdate() {
        const changePercent = parseFloat(document.getElementById('price-change').value);
        
        if (isNaN(changePercent)) {
            this.showToast('Please enter a valid percentage', 'error');
            return;
        }

        const multiplier = 1 + (changePercent / 100);
        let updatedCount = 0;

        this.inventory.forEach(item => {
            const newPrice = item.price * multiplier;
            if (newPrice > 0) {
                item.price = Math.round(newPrice * 100) / 100; // Round to 2 decimal places
                updatedCount++;
            }
        });

        localStorage.setItem('tcg-inventory', JSON.stringify(this.inventory));
        
        this.closeModal();
        this.updateInventoryTab();
        this.showToast(`${updatedCount} prices updated by ${changePercent}%`, 'success');
    }

    // Customer Management Functions
    viewCustomerDetails(customerId) {
        const customer = this.customers.find(c => c.id === customerId);
        if (!customer) return;

        const customerOrders = this.orders.filter(order => order.userId === customerId);
        const totalSpent = customerOrders.reduce((sum, order) => sum + (order.total || 0), 0);

        const modalContent = `
            <div style="max-width: 600px;">
                <div style="margin-bottom: var(--space-4); padding: var(--space-4); background: var(--gray-50); border-radius: var(--radius-lg);">
                    <h4 style="margin: 0 0 var(--space-2) 0;">${customer.firstName} ${customer.lastName}</h4>
                    <p style="margin: 0; color: var(--gray-600);">Customer since ${new Date(customer.createdAt).toLocaleDateString()}</p>
                </div>

                <div style="margin-bottom: var(--space-4);">
                    <h5 style="margin: 0 0 var(--space-2) 0;">Contact Information</h5>
                    <p style="margin: 0;"><strong>Email:</strong> ${customer.email}</p>
                    <p style="margin: 0;"><strong>Phone:</strong> ${customer.phone || 'N/A'}</p>
                    <p style="margin: 0;"><strong>Status:</strong> ${customer.isActive ? 'Active' : 'Inactive'}</p>
                    ${customer.favoriteArchetype ? `<p style="margin: 0;"><strong>Favorite Archetype:</strong> ${customer.favoriteArchetype}</p>` : ''}
                </div>

                <div style="margin-bottom: var(--space-4);">
                    <h5 style="margin: 0 0 var(--space-2) 0;">Order Statistics</h5>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-4); text-align: center;">
                        <div style="padding: var(--space-3); background: var(--gray-50); border-radius: var(--radius-md);">
                            <div style="font-size: 1.5rem; font-weight: 700; color: var(--primary-color);">${customerOrders.length}</div>
                            <div style="font-size: 0.875rem; color: var(--gray-600);">Total Orders</div>
                        </div>
                        <div style="padding: var(--space-3); background: var(--gray-50); border-radius: var(--radius-md);">
                            <div style="font-size: 1.5rem; font-weight: 700; color: var(--success-color);">$${totalSpent.toFixed(2)}</div>
                            <div style="font-size: 0.875rem; color: var(--gray-600);">Total Spent</div>
                        </div>
                        <div style="padding: var(--space-3); background: var(--gray-50); border-radius: var(--radius-md);">
                            <div style="font-size: 1.5rem; font-weight: 700; color: var(--info-color);">$${customerOrders.length > 0 ? (totalSpent / customerOrders.length).toFixed(2) : '0.00'}</div>
                            <div style="font-size: 0.875rem; color: var(--gray-600);">Avg Order</div>
                        </div>
                    </div>
                </div>

                ${customerOrders.length > 0 ? `
                    <div style="margin-bottom: var(--space-4);">
                        <h5 style="margin: 0 0 var(--space-2) 0;">Recent Orders</h5>
                        ${customerOrders.slice(0, 5).map(order => `
                            <div style="display: flex; justify-content: space-between; padding: var(--space-2); border-bottom: 1px solid var(--gray-200);">
                                <div>
                                    <strong>Order #${order.id}</strong><br>
                                    <small>${new Date(order.createdAt).toLocaleDateString()}</small>
                                </div>
                                <div style="text-align: right;">
                                    <div style="font-weight: 600;">$${(order.total || 0).toFixed(2)}</div>
                                    <div class="order-status status-${order.status}" style="font-size: 0.75rem;">${order.status}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}

                <div style="display: flex; gap: var(--space-3); justify-content: center;">
                    <button class="admin-btn btn-secondary" onclick="adminSystem.closeModal()">Close</button>
                    <button class="admin-btn ${customer.isActive ? 'btn-warning' : 'btn-success'}" onclick="adminSystem.toggleCustomerStatus('${customerId}')">
                        ${customer.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                </div>
            </div>
        `;

        this.showModal('Customer Details', modalContent);
    }

    toggleCustomerStatus(customerId) {
        const users = JSON.parse(localStorage.getItem('tcg-users') || '{}');
        const customer = Object.values(users).find(u => u.id === customerId);
        
        if (!customer) {
            this.showToast('Customer not found', 'error');
            return;
        }

        customer.isActive = !customer.isActive;
        users[customer.email] = customer;
        localStorage.setItem('tcg-users', JSON.stringify(users));

        this.loadAllData();
        this.updateDashboard();
        this.closeModal();
        
        const status = customer.isActive ? 'activated' : 'deactivated';
        this.showToast(`Customer ${customer.firstName} ${customer.lastName} ${status}`, 'success');
    }

    // Search Functions
    searchOrders() {
        const query = document.getElementById('order-search').value.toLowerCase();
        const filteredOrders = this.orders.filter(order => {
            const customerName = order.guestInfo ? 
                `${order.guestInfo.firstName} ${order.guestInfo.lastName}`.toLowerCase() : 
                `customer #${order.userId}`.toLowerCase();
            const customerEmail = order.guestInfo ? order.guestInfo.email.toLowerCase() : '';
            
            return order.id.toString().includes(query) ||
                   customerName.includes(query) ||
                   customerEmail.includes(query);
        });

        this.renderOrdersList(filteredOrders, 'all-orders-list', true);
    }

    searchInventory() {
        const query = document.getElementById('inventory-search').value.toLowerCase();
        const filteredInventory = this.inventory.filter(item => 
            item.name.toLowerCase().includes(query) ||
            item.category.toLowerCase().includes(query) ||
            item.set.toLowerCase().includes(query)
        );

        const container = document.getElementById('inventory-list');
        if (container) {
            container.innerHTML = filteredInventory.map(item => this.generateInventoryHTML(item)).join('');
        }
    }

    searchCustomers() {
        const query = document.getElementById('customer-search').value.toLowerCase();
        const filteredCustomers = this.customers.filter(customer => 
            `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(query) ||
            customer.email.toLowerCase().includes(query)
        );

        const container = document.getElementById('customers-list');
        if (container) {
            container.innerHTML = filteredCustomers.map(customer => this.generateCustomerHTML(customer)).join('');
        }
    }

    // Modal Functions
    showModal(title, content) {
        const modalContainer = document.getElementById('modal-container');
        modalContainer.innerHTML = `
            <div class="admin-modal-overlay" onclick="adminSystem.closeModal()">
                <div class="admin-modal-content" onclick="event.stopPropagation()">
                    <div class="admin-modal-header">
                        <h3 style="margin: 0; font-size: 1.25rem; font-weight: 700;">${title}</h3>
                        <button onclick="adminSystem.closeModal()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--gray-500);">×</button>
                    </div>
                    <div class="admin-modal-body">
                        ${content}
                    </div>
                </div>
            </div>
        `;

        // Add modal styles
        const style = document.createElement('style');
        style.textContent = `
            .admin-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                padding: var(--space-4);
            }
            
            .admin-modal-content {
                background: white;
                border-radius: var(--radius-xl);
                box-shadow: var(--shadow-2xl);
                max-width: 90vw;
                max-height: 90vh;
                overflow-y: auto;
            }
            
            .admin-modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: var(--space-4);
                border-bottom: 1px solid var(--gray-200);
            }
            
            .admin-modal-body {
                padding: var(--space-4);
            }

            /* Store-style modal */
            .store-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                padding: var(--space-4);
            }
            
            .store-modal-content {
                background: white;
                border-radius: var(--radius-xl);
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                max-width: 90vw;
                max-height: 90vh;
                overflow-y: auto;
                animation: modalSlideIn 0.3s ease-out;
            }
            
            .store-modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: var(--space-6) var(--space-6) 0 var(--space-6);
            }
            
            .store-modal-body {
                padding: var(--space-6);
            }

            @keyframes modalSlideIn {
                from {
                    opacity: 0;
                    transform: translateY(-20px) scale(0.95);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }

            /* Button styles matching main store */
            .primary-btn {
                background: var(--primary-color);
                color: white;
                border: none;
                padding: var(--space-3) var(--space-4);
                border-radius: var(--radius-md);
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                display: inline-flex;
                align-items: center;
                gap: var(--space-2);
                font-size: 0.875rem;
            }

            .primary-btn:hover {
                background: var(--primary-dark);
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }

            .secondary-btn {
                background: var(--gray-200);
                color: var(--gray-700);
                border: none;
                padding: var(--space-3) var(--space-4);
                border-radius: var(--radius-md);
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                display: inline-flex;
                align-items: center;
                gap: var(--space-2);
                font-size: 0.875rem;
            }

            .secondary-btn:hover {
                background: var(--gray-300);
                transform: translateY(-1px);
            }

            .danger-btn {
                background: var(--error-color);
                color: white;
                border: none;
                padding: var(--space-3) var(--space-4);
                border-radius: var(--radius-md);
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                display: inline-flex;
                align-items: center;
                gap: var(--space-2);
                font-size: 0.875rem;
            }

            .danger-btn:hover {
                background: var(--error-dark);
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
            }
        `;
        document.head.appendChild(style);

        modalContainer.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    // Store-style modal (matching main website)
    showStoreStyleModal(title, content) {
        const modalContainer = document.getElementById('modal-container');
        modalContainer.innerHTML = `
            <div class="store-modal-overlay" onclick="adminSystem.closeStoreStyleModal()">
                <div class="store-modal-content" onclick="event.stopPropagation()">
                    <div class="store-modal-header">
                        <h2 style="font-size: 1.5rem; font-weight: 700; color: var(--gray-900); margin: 0;">${title}</h2>
                        <button onclick="adminSystem.closeStoreStyleModal()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--gray-500); padding: var(--space-2);">×</button>
                    </div>
                    <div class="store-modal-body">
                        ${content}
                    </div>
                </div>
            </div>
        `;

        modalContainer.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        const modalContainer = document.getElementById('modal-container');
        modalContainer.innerHTML = '';
        modalContainer.style.display = 'none';
        document.body.style.overflow = '';
    }

    closeStoreStyleModal() {
        const modalContainer = document.getElementById('modal-container');
        modalContainer.innerHTML = '';
        modalContainer.style.display = 'none';
        document.body.style.overflow = '';
    }

    // Enhanced delete with animation
    deleteOrderWithAnimation(orderId) {
        const orderElement = document.querySelector(`[data-order-id="${orderId}"]`);
        if (orderElement) {
            // Add delete animation
            orderElement.style.transition = 'all 0.3s ease-out';
            orderElement.style.transform = 'translateX(100%)';
            orderElement.style.opacity = '0';
            orderElement.style.height = '0';
            orderElement.style.padding = '0';
            orderElement.style.margin = '0';
            orderElement.style.overflow = 'hidden';
            
            // Remove from DOM after animation
            setTimeout(() => {
                if (orderElement.parentNode) {
                    orderElement.parentNode.removeChild(orderElement);
                }
            }, 300);
        }
        
        // Actually delete the order
        this.confirmDeleteOrder(orderId);
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `admin-toast toast-${type}`;
        toast.textContent = message;
        
        const style = `
            position: fixed;
            top: var(--space-4);
            right: var(--space-4);
            background: ${type === 'success' ? 'var(--success-color)' : 
                        type === 'error' ? 'var(--error-color)' : 
                        type === 'warning' ? 'var(--warning-color)' : 'var(--info-color)'};
            color: white;
            padding: var(--space-3) var(--space-4);
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-lg);
            z-index: 1001;
            font-weight: 600;
            animation: slideInRight 0.3s ease-out;
        `;
        
        toast.setAttribute('style', style);
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease-out forwards';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
}

// Global Functions
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[onclick="switchTab('${tabName}')"]`).classList.add('active');

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');

    // Update content
    adminSystem.updateDashboard();
}

function ensureModalStyles() {
    // Add modal animation styles if not already present
    if (!document.getElementById('modal-animations')) {
        const style = document.createElement('style');
        style.id = 'modal-animations';
        style.textContent = `
            @keyframes modalSlideIn {
                from {
                    opacity: 0;
                    transform: translateY(-20px) scale(0.95);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }
        `;
        document.head.appendChild(style);
    }
}

function returnToWebsite() {
    // Ensure modal styles are added first
    ensureModalStyles();
    
    // Create modal with store-style animation and behavior
    const modal = document.createElement('div');
    modal.id = 'return-website-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 20px;
    `;
    
    modal.innerHTML = `
        <div style="
            background: white;
            border-radius: 12px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            max-width: 90vw;
            max-height: 90vh;
            overflow-y: auto;
            animation: modalSlideIn 0.3s ease-out;
        " onclick="event.stopPropagation()">
            <div style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 24px 24px 0 24px;
            ">
                <h2 style="font-size: 1.5rem; font-weight: 700; color: #111827; margin: 0;">Return to Website</h2>
                <button onclick="closeReturnWebsiteModal()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #6b7280; padding: 8px;">×</button>
            </div>
            <div style="padding: 24px;">
                <div style="text-align: center; padding: 24px;">
                    <div style="font-size: 4rem; margin-bottom: 16px; color: #3b82f6;">🏠</div>
                    <h3 style="font-size: 1.5rem; font-weight: 700; color: #111827; margin-bottom: 12px;">
                        Return to Main Website?
                    </h3>
                    <p style="color: #6b7280; margin-bottom: 24px; line-height: 1.5;">
                        You will be redirected to the main Firelight Duel Academy website. Your admin session will remain active so you can return to the dashboard anytime.
                    </p>
                    
                    <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                        <div style="display: flex; align-items: center; justify-content: center; gap: 8px; color: #6b7280; font-size: 0.875rem;">
                            <i class="fas fa-info-circle"></i>
                            <span>Note: Admin accounts cannot make purchases or use the buylist on the main site</span>
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 12px; justify-content: center;">
                        <button onclick="closeReturnWebsiteModal()" style="
                            background: #e5e7eb;
                            color: #374151;
                            border: none;
                            padding: 12px 16px;
                            border-radius: 6px;
                            font-weight: 600;
                            cursor: pointer;
                            transition: all 0.2s ease;
                            display: inline-flex;
                            align-items: center;
                            gap: 8px;
                            font-size: 0.875rem;
                            min-width: 120px;
                            justify-content: center;
                        ">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                        <button onclick="confirmReturnToWebsite()" style="
                            background: #3b82f6;
                            color: white;
                            border: none;
                            padding: 12px 16px;
                            border-radius: 6px;
                            font-weight: 600;
                            cursor: pointer;
                            transition: all 0.2s ease;
                            display: inline-flex;
                            align-items: center;
                            gap: 8px;
                            font-size: 0.875rem;
                            min-width: 120px;
                            justify-content: center;
                        ">
                            <i class="fas fa-home"></i> Go to Website
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add to body and show with animation
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    // Add click outside to close
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeReturnWebsiteModal();
        }
    });
    
    // Add escape key to close
    const escapeHandler = (e) => {
        if (e.key === 'Escape') {
            closeReturnWebsiteModal();
            document.removeEventListener('keydown', escapeHandler);
        }
    };
    document.addEventListener('keydown', escapeHandler);
}

function closeReturnWebsiteModal() {
    const modal = document.getElementById('return-website-modal');
    if (modal) {
        modal.style.display = 'none';
        modal.remove();
        document.body.style.overflow = '';
    }
}

function confirmReturnToWebsite() {
    // Close the modal
    closeReturnWebsiteModal();
    
    // Show a brief message using admin system toast
    if (window.adminSystem && adminSystem.showToast) {
        adminSystem.showToast('Redirecting to main website...', 'info');
    }
    
    // Redirect to main website after a short delay
    setTimeout(() => {
        window.location.href = '../app.html';
    }, 1000);
}

function adminLogout() {
    // Ensure modal styles are added first
    ensureModalStyles();
    
    // Create modal with store-style animation and behavior
    const modal = document.createElement('div');
    modal.id = 'admin-logout-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 20px;
    `;
    
    modal.innerHTML = `
        <div style="
            background: white;
            border-radius: 12px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            max-width: 90vw;
            max-height: 90vh;
            overflow-y: auto;
            animation: modalSlideIn 0.3s ease-out;
        " onclick="event.stopPropagation()">
            <div style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 24px 24px 0 24px;
            ">
                <h2 style="font-size: 1.5rem; font-weight: 700; color: #111827; margin: 0;">Admin Logout</h2>
                <button onclick="closeAdminLogoutModal()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #6b7280; padding: 8px;">×</button>
            </div>
            <div style="padding: 24px;">
                <div style="text-align: center; padding: 24px;">
                    <div style="font-size: 4rem; margin-bottom: 16px; color: #f59e0b;">🚪</div>
                    <h3 style="font-size: 1.5rem; font-weight: 700; color: #111827; margin-bottom: 12px;">
                        Sign Out of Admin Dashboard?
                    </h3>
                    <p style="color: #6b7280; margin-bottom: 24px; line-height: 1.5;">
                        You will be logged out of the admin dashboard and redirected to the login page. Any unsaved changes will be lost.
                    </p>
                    
                    <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                        <div style="display: flex; align-items: center; justify-content: center; gap: 8px; color: #6b7280; font-size: 0.875rem;">
                            <i class="fas fa-info-circle"></i>
                            <span>You can sign back in anytime with your admin credentials</span>
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 12px; justify-content: center;">
                        <button onclick="closeAdminLogoutModal()" style="
                            background: #e5e7eb;
                            color: #374151;
                            border: none;
                            padding: 12px 16px;
                            border-radius: 6px;
                            font-weight: 600;
                            cursor: pointer;
                            transition: all 0.2s ease;
                            display: inline-flex;
                            align-items: center;
                            gap: 8px;
                            font-size: 0.875rem;
                            min-width: 120px;
                            justify-content: center;
                        ">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                        <button onclick="confirmAdminLogout()" style="
                            background: #dc2626;
                            color: white;
                            border: none;
                            padding: 12px 16px;
                            border-radius: 6px;
                            font-weight: 600;
                            cursor: pointer;
                            transition: all 0.2s ease;
                            display: inline-flex;
                            align-items: center;
                            gap: 8px;
                            font-size: 0.875rem;
                            min-width: 120px;
                            justify-content: center;
                        ">
                            <i class="fas fa-sign-out-alt"></i> Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add to body and show with animation
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    // Add click outside to close
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeAdminLogoutModal();
        }
    });
    
    // Add escape key to close
    const escapeHandler = (e) => {
        if (e.key === 'Escape') {
            closeAdminLogoutModal();
            document.removeEventListener('keydown', escapeHandler);
        }
    };
    document.addEventListener('keydown', escapeHandler);
}

function closeAdminLogoutModal() {
    const modal = document.getElementById('admin-logout-modal');
    if (modal) {
        modal.style.display = 'none';
        modal.remove();
        document.body.style.overflow = '';
    }
}

function confirmAdminLogout() {
    // Close the modal
    closeAdminLogoutModal();
    
    // Show a brief "signing out" message using admin system toast
    if (window.adminSystem && adminSystem.showToast) {
        adminSystem.showToast('Signing out...', 'info');
    }
    
    // Clear both admin and user sessions completely
    setTimeout(() => {
        localStorage.removeItem('tcg-admin');
        localStorage.removeItem('tcg-user');
        
        // Also clear any other session-related data
        localStorage.removeItem('tcg-cart');
        
        // Redirect to admin login
        window.location.href = 'admin-login.html';
    }, 1000);
}

// Make functions globally available
window.returnToWebsite = returnToWebsite;
window.adminLogout = adminLogout;
window.confirmReturnToWebsite = confirmReturnToWebsite;
window.confirmAdminLogout = confirmAdminLogout;
window.closeReturnWebsiteModal = closeReturnWebsiteModal;
window.closeAdminLogoutModal = closeAdminLogoutModal;

// Debug function to test if functions are working
window.testModalFunctions = function() {
    console.log('Testing modal functions...');
    console.log('returnToWebsite function:', typeof returnToWebsite);
    console.log('adminLogout function:', typeof adminLogout);
    
    // Test if modal container exists
    const modalContainer = document.getElementById('modal-container');
    console.log('Modal container exists:', !!modalContainer);
    
    if (!modalContainer) {
        console.error('Modal container not found! This could be the issue.');
    }
};

// Buylist Management Functions
function searchBuylist() {
    const query = document.getElementById('buylist-search').value.toLowerCase();
    const gameFilter = document.getElementById('game-filter').value;
    const statusFilter = document.getElementById('status-filter').value;
    
    let filteredBuylist = adminSystem.buylist.filter(item => {
        const matchesQuery = item.name.toLowerCase().includes(query) ||
                           item.category.toLowerCase().includes(query) ||
                           item.set.toLowerCase().includes(query);
        const matchesGame = !gameFilter || item.game === gameFilter;
        const matchesStatus = !statusFilter || item.status === statusFilter;
        
        return matchesQuery && matchesGame && matchesStatus;
    });
    
    renderBuylistItems(filteredBuylist);
}

function renderBuylistItems(items = null) {
    const container = document.getElementById('buylist-items');
    if (!container) return;
    
    const buylistItems = items || adminSystem.buylist;
    
    if (buylistItems.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--gray-500); padding: var(--space-4);">No buylist items found</p>';
        return;
    }
    
    container.innerHTML = buylistItems.map(item => generateBuylistItemHTML(item)).join('');
}

function generateBuylistItemHTML(item) {
    const statusColor = {
        'active': 'var(--success-color)',
        'inactive': 'var(--gray-500)',
        'out-of-stock': 'var(--error-color)'
    }[item.status] || 'var(--gray-500)';
    
    const gameIcon = {
        'yugioh': '🃏',
        'magic': '🔮',
        'pokemon': '⚡',
        'lorcana': '✨',
        'onepiece': '🏴‍☠️'
    }[item.game] || '🎮';
    
    return `
        <div class="inventory-item" style="border-left: 4px solid ${statusColor};">
            <div class="inventory-info">
                <h4>${gameIcon} ${item.name}</h4>
                <p>${item.category} • ${item.rarity} • ${item.set}</p>
                <p style="color: ${statusColor}; font-weight: 600; text-transform: capitalize;">${item.status.replace('-', ' ')} (${item.currentStock}/${item.maxQuantity})</p>
            </div>
            <div class="inventory-controls">
                <div style="display: flex; flex-direction: column; gap: var(--space-1); margin-right: var(--space-3);">
                    <span style="font-size: 0.75rem; color: var(--gray-600);">Cash:</span>
                    <input type="number" class="price-input" value="${item.cashPrice}" 
                           onchange="updateBuylistPrice(${item.id}, 'cash', this.value)" step="0.01" min="0">
                </div>
                <div style="display: flex; flex-direction: column; gap: var(--space-1); margin-right: var(--space-3);">
                    <span style="font-size: 0.75rem; color: var(--gray-600);">Credit:</span>
                    <input type="number" class="price-input" value="${item.creditPrice}" 
                           onchange="updateBuylistPrice(${item.id}, 'credit', this.value)" step="0.01" min="0">
                </div>
                <div style="display: flex; flex-direction: column; gap: var(--space-1); margin-right: var(--space-3);">
                    <span style="font-size: 0.75rem; color: var(--gray-600);">Max Qty:</span>
                    <input type="number" class="quantity-input" value="${item.maxQuantity}" 
                           onchange="updateBuylistMaxQuantity(${item.id}, this.value)" min="0">
                </div>
                <button class="admin-btn btn-secondary" onclick="editBuylistItem(${item.id})">
                    Edit
                </button>
                <button class="admin-btn ${item.status === 'active' ? 'btn-warning' : 'btn-success'}" 
                        onclick="toggleBuylistStatus(${item.id})">
                    ${item.status === 'active' ? 'Deactivate' : 'Activate'}
                </button>
            </div>
        </div>
    `;
}

function addToBuylist() {
    const modalContent = `
        <div style="max-width: 500px;">
            <h4 style="margin-bottom: var(--space-4); text-align: center;">Add Card to Buylist</h4>
            <form id="add-buylist-form" onsubmit="submitNewBuylistItem(event)">
                <div style="margin-bottom: var(--space-3);">
                    <label style="display: block; margin-bottom: var(--space-1); font-weight: 600;">Card Name *</label>
                    <input type="text" id="buylist-card-name" required style="width: 100%; padding: var(--space-2); border: 1px solid var(--gray-300); border-radius: var(--radius-md);">
                </div>
                <div style="margin-bottom: var(--space-3);">
                    <label style="display: block; margin-bottom: var(--space-1); font-weight: 600;">Game *</label>
                    <select id="buylist-game" required style="width: 100%; padding: var(--space-2); border: 1px solid var(--gray-300); border-radius: var(--radius-md);">
                        <option value="">Select Game</option>
                        <option value="yugioh">Yu-Gi-Oh!</option>
                        <option value="pokemon">Pokemon</option>
                        <option value="bulk">Bulk Orders</option>
                    </select>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); margin-bottom: var(--space-3);">
                    <div>
                        <label style="display: block; margin-bottom: var(--space-1); font-weight: 600;">Cash Price *</label>
                        <input type="number" id="buylist-cash-price" required step="0.01" min="0" style="width: 100%; padding: var(--space-2); border: 1px solid var(--gray-300); border-radius: var(--radius-md);">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: var(--space-1); font-weight: 600;">Credit Price *</label>
                        <input type="number" id="buylist-credit-price" required step="0.01" min="0" style="width: 100%; padding: var(--space-2); border: 1px solid var(--gray-300); border-radius: var(--radius-md);">
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); margin-bottom: var(--space-3);">
                    <div>
                        <label style="display: block; margin-bottom: var(--space-1); font-weight: 600;">Category</label>
                        <input type="text" id="buylist-category" style="width: 100%; padding: var(--space-2); border: 1px solid var(--gray-300); border-radius: var(--radius-md);" placeholder="e.g., Monster, Spell">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: var(--space-1); font-weight: 600;">Rarity</label>
                        <input type="text" id="buylist-rarity" style="width: 100%; padding: var(--space-2); border: 1px solid var(--gray-300); border-radius: var(--radius-md);" placeholder="e.g., Ultra Rare">
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); margin-bottom: var(--space-4);">
                    <div>
                        <label style="display: block; margin-bottom: var(--space-1); font-weight: 600;">Set Code</label>
                        <input type="text" id="buylist-set" style="width: 100%; padding: var(--space-2); border: 1px solid var(--gray-300); border-radius: var(--radius-md);" placeholder="e.g., LOB, MRD">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: var(--space-1); font-weight: 600;">Max Quantity</label>
                        <input type="number" id="buylist-max-qty" value="4" min="1" style="width: 100%; padding: var(--space-2); border: 1px solid var(--gray-300); border-radius: var(--radius-md);">
                    </div>
                </div>
                <div style="display: flex; gap: var(--space-3); justify-content: center;">
                    <button type="button" class="admin-btn btn-secondary" onclick="adminSystem.closeModal()">Cancel</button>
                    <button type="submit" class="admin-btn btn-primary">Add to Buylist</button>
                </div>
            </form>
        </div>
    `;

    adminSystem.showModal('Add to Buylist', modalContent);
}

function submitNewBuylistItem(event) {
    event.preventDefault();
    
    const name = document.getElementById('buylist-card-name').value;
    const game = document.getElementById('buylist-game').value;
    const cashPrice = parseFloat(document.getElementById('buylist-cash-price').value);
    const creditPrice = parseFloat(document.getElementById('buylist-credit-price').value);
    const category = document.getElementById('buylist-category').value || 'Unknown';
    const rarity = document.getElementById('buylist-rarity').value || 'Common';
    const set = document.getElementById('buylist-set').value || 'Unknown';
    const maxQuantity = parseInt(document.getElementById('buylist-max-qty').value);

    if (!name || !game || isNaN(cashPrice) || isNaN(creditPrice) || isNaN(maxQuantity)) {
        adminSystem.showToast('Please fill in all required fields correctly', 'error');
        return;
    }

    const newItem = {
        id: Date.now(),
        name,
        game,
        cashPrice,
        creditPrice,
        category,
        rarity,
        set,
        status: 'active',
        maxQuantity,
        currentStock: 0,
        image: 'https://images.ygoprodeck.com/images/cards/back.jpg',
        createdAt: new Date().toISOString()
    };

    adminSystem.buylist.push(newItem);
    localStorage.setItem('tcg-buylist', JSON.stringify(adminSystem.buylist));
    
    adminSystem.closeModal();
    renderBuylistItems();
    adminSystem.showToast(`${name} added to buylist`, 'success');
}

function updateBuylistPrice(itemId, priceType, newPrice) {
    const item = adminSystem.buylist.find(i => i.id === itemId);
    if (!item) return;

    const price = parseFloat(newPrice);
    if (isNaN(price) || price < 0) {
        adminSystem.showToast('Invalid price', 'error');
        return;
    }

    if (priceType === 'cash') {
        item.cashPrice = price;
    } else if (priceType === 'credit') {
        item.creditPrice = price;
    }

    localStorage.setItem('tcg-buylist', JSON.stringify(adminSystem.buylist));
    adminSystem.showToast(`${priceType} price updated for ${item.name}`, 'success');
}

function updateBuylistMaxQuantity(itemId, newQuantity) {
    const item = adminSystem.buylist.find(i => i.id === itemId);
    if (!item) return;

    const quantity = parseInt(newQuantity);
    if (isNaN(quantity) || quantity < 0) {
        adminSystem.showToast('Invalid quantity', 'error');
        return;
    }

    item.maxQuantity = quantity;
    localStorage.setItem('tcg-buylist', JSON.stringify(adminSystem.buylist));
    adminSystem.showToast(`Max quantity updated for ${item.name}`, 'success');
}

function editBuylistItem(itemId) {
    const item = adminSystem.buylist.find(i => i.id === itemId);
    if (!item) return;

    const modalContent = `
        <div style="max-width: 500px;">
            <h4 style="margin-bottom: var(--space-4); text-align: center;">Edit ${item.name}</h4>
            <form id="edit-buylist-form" onsubmit="submitEditBuylistItem(event, ${itemId})">
                <div style="margin-bottom: var(--space-3);">
                    <label style="display: block; margin-bottom: var(--space-1); font-weight: 600;">Card Name *</label>
                    <input type="text" id="edit-buylist-name" value="${item.name}" required style="width: 100%; padding: var(--space-2); border: 1px solid var(--gray-300); border-radius: var(--radius-md);">
                </div>
                <div style="margin-bottom: var(--space-3);">
                    <label style="display: block; margin-bottom: var(--space-1); font-weight: 600;">Game *</label>
                    <select id="edit-buylist-game" required style="width: 100%; padding: var(--space-2); border: 1px solid var(--gray-300); border-radius: var(--radius-md);">
                        <option value="yugioh" ${item.game === 'yugioh' ? 'selected' : ''}>Yu-Gi-Oh!</option>
                        <option value="pokemon" ${item.game === 'pokemon' ? 'selected' : ''}>Pokemon</option>
                        <option value="bulk" ${item.game === 'bulk' ? 'selected' : ''}>Bulk Orders</option>
                    </select>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); margin-bottom: var(--space-3);">
                    <div>
                        <label style="display: block; margin-bottom: var(--space-1); font-weight: 600;">Cash Price *</label>
                        <input type="number" id="edit-buylist-cash" value="${item.cashPrice}" required step="0.01" min="0" style="width: 100%; padding: var(--space-2); border: 1px solid var(--gray-300); border-radius: var(--radius-md);">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: var(--space-1); font-weight: 600;">Credit Price *</label>
                        <input type="number" id="edit-buylist-credit" value="${item.creditPrice}" required step="0.01" min="0" style="width: 100%; padding: var(--space-2); border: 1px solid var(--gray-300); border-radius: var(--radius-md);">
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); margin-bottom: var(--space-3);">
                    <div>
                        <label style="display: block; margin-bottom: var(--space-1); font-weight: 600;">Category</label>
                        <input type="text" id="edit-buylist-category" value="${item.category}" style="width: 100%; padding: var(--space-2); border: 1px solid var(--gray-300); border-radius: var(--radius-md);">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: var(--space-1); font-weight: 600;">Rarity</label>
                        <input type="text" id="edit-buylist-rarity" value="${item.rarity}" style="width: 100%; padding: var(--space-2); border: 1px solid var(--gray-300); border-radius: var(--radius-md);">
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); margin-bottom: var(--space-4);">
                    <div>
                        <label style="display: block; margin-bottom: var(--space-1); font-weight: 600;">Set Code</label>
                        <input type="text" id="edit-buylist-set" value="${item.set}" style="width: 100%; padding: var(--space-2); border: 1px solid var(--gray-300); border-radius: var(--radius-md);">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: var(--space-1); font-weight: 600;">Max Quantity</label>
                        <input type="number" id="edit-buylist-max" value="${item.maxQuantity}" min="1" style="width: 100%; padding: var(--space-2); border: 1px solid var(--gray-300); border-radius: var(--radius-md);">
                    </div>
                </div>
                <div style="display: flex; gap: var(--space-3); justify-content: center;">
                    <button type="button" class="admin-btn btn-danger" onclick="deleteBuylistItem(${itemId})">Delete</button>
                    <button type="button" class="admin-btn btn-secondary" onclick="adminSystem.closeModal()">Cancel</button>
                    <button type="submit" class="admin-btn btn-primary">Save Changes</button>
                </div>
            </form>
        </div>
    `;

    adminSystem.showModal('Edit Buylist Item', modalContent);
}

function submitEditBuylistItem(event, itemId) {
    event.preventDefault();
    
    const item = adminSystem.buylist.find(i => i.id === itemId);
    if (!item) return;

    const name = document.getElementById('edit-buylist-name').value;
    const game = document.getElementById('edit-buylist-game').value;
    const cashPrice = parseFloat(document.getElementById('edit-buylist-cash').value);
    const creditPrice = parseFloat(document.getElementById('edit-buylist-credit').value);
    const category = document.getElementById('edit-buylist-category').value;
    const rarity = document.getElementById('edit-buylist-rarity').value;
    const set = document.getElementById('edit-buylist-set').value;
    const maxQuantity = parseInt(document.getElementById('edit-buylist-max').value);

    if (!name || !game || isNaN(cashPrice) || isNaN(creditPrice) || isNaN(maxQuantity)) {
        adminSystem.showToast('Please fill in all required fields correctly', 'error');
        return;
    }

    item.name = name;
    item.game = game;
    item.cashPrice = cashPrice;
    item.creditPrice = creditPrice;
    item.category = category;
    item.rarity = rarity;
    item.set = set;
    item.maxQuantity = maxQuantity;

    localStorage.setItem('tcg-buylist', JSON.stringify(adminSystem.buylist));
    
    adminSystem.closeModal();
    renderBuylistItems();
    adminSystem.showToast(`${name} updated successfully`, 'success');
}

function toggleBuylistStatus(itemId) {
    const item = adminSystem.buylist.find(i => i.id === itemId);
    if (!item) return;

    item.status = item.status === 'active' ? 'inactive' : 'active';
    localStorage.setItem('tcg-buylist', JSON.stringify(adminSystem.buylist));
    
    renderBuylistItems();
    adminSystem.showToast(`${item.name} ${item.status === 'active' ? 'activated' : 'deactivated'}`, 'success');
}

function deleteBuylistItem(itemId) {
    const item = adminSystem.buylist.find(i => i.id === itemId);
    if (!item) return;

    if (confirm(`Are you sure you want to delete ${item.name} from the buylist?`)) {
        adminSystem.buylist = adminSystem.buylist.filter(i => i.id !== itemId);
        localStorage.setItem('tcg-buylist', JSON.stringify(adminSystem.buylist));
        
        adminSystem.closeModal();
        renderBuylistItems();
        adminSystem.showToast(`${item.name} deleted from buylist`, 'success');
    }
}

function filterBuylistByGame() {
    searchBuylist();
}

function filterBuylistByStatus() {
    searchBuylist();
}

function bulkUpdateBuylistPrices() {
    const modalContent = `
        <div style="max-width: 400px; text-align: center;">
            <h4 style="margin-bottom: var(--space-4);">Bulk Update Buylist Prices</h4>
            <p style="margin-bottom: var(--space-4); color: var(--gray-600);">Apply a percentage change to all buylist prices</p>
            <div style="margin-bottom: var(--space-4);">
                <label style="display: block; margin-bottom: var(--space-2); font-weight: 600;">Price Change (%)</label>
                <input type="number" id="buylist-price-change" step="0.1" placeholder="e.g., 10 for +10%, -5 for -5%" style="width: 100%; padding: var(--space-3); border: 1px solid var(--gray-300); border-radius: var(--radius-md); text-align: center;">
            </div>
            <div style="margin-bottom: var(--space-4);">
                <label style="display: block; margin-bottom: var(--space-2); font-weight: 600;">Apply to:</label>
                <div style="display: flex; gap: var(--space-2); justify-content: center;">
                    <label style="display: flex; align-items: center; gap: var(--space-1);">
                        <input type="checkbox" id="update-cash" checked> Cash Prices
                    </label>
                    <label style="display: flex; align-items: center; gap: var(--space-1);">
                        <input type="checkbox" id="update-credit" checked> Credit Prices
                    </label>
                </div>
            </div>
            <div style="display: flex; gap: var(--space-3); justify-content: center;">
                <button class="admin-btn btn-secondary" onclick="adminSystem.closeModal()">Cancel</button>
                <button class="admin-btn btn-primary" onclick="confirmBulkBuylistPriceUpdate()">Update Prices</button>
            </div>
        </div>
    `;

    adminSystem.showModal('Bulk Buylist Price Update', modalContent);
}

function confirmBulkBuylistPriceUpdate() {
    const changePercent = parseFloat(document.getElementById('buylist-price-change').value);
    const updateCash = document.getElementById('update-cash').checked;
    const updateCredit = document.getElementById('update-credit').checked;
    
    if (isNaN(changePercent)) {
        adminSystem.showToast('Please enter a valid percentage', 'error');
        return;
    }

    if (!updateCash && !updateCredit) {
        adminSystem.showToast('Please select at least one price type to update', 'error');
        return;
    }

    const multiplier = 1 + (changePercent / 100);
    let updatedCount = 0;

    adminSystem.buylist.forEach(item => {
        if (updateCash) {
            const newCashPrice = item.cashPrice * multiplier;
            if (newCashPrice > 0) {
                item.cashPrice = Math.round(newCashPrice * 100) / 100;
                updatedCount++;
            }
        }
        if (updateCredit) {
            const newCreditPrice = item.creditPrice * multiplier;
            if (newCreditPrice > 0) {
                item.creditPrice = Math.round(newCreditPrice * 100) / 100;
                if (!updateCash) updatedCount++;
            }
        }
    });

    localStorage.setItem('tcg-buylist', JSON.stringify(adminSystem.buylist));
    
    adminSystem.closeModal();
    renderBuylistItems();
    adminSystem.showToast(`${updatedCount} buylist prices updated by ${changePercent}%`, 'success');
}

function importBuylistFromAPI() {
    adminSystem.showToast('API import feature coming soon!', 'info');
}

function exportBuylist() {
    // Create CSV headers
    const headers = [
        'Card Name',
        'Game',
        'Cash Price',
        'Credit Price',
        'Category',
        'Rarity',
        'Set',
        'Status',
        'Max Quantity',
        'Current Stock',
        'Date Added'
    ];
    
    // Convert buylist data to CSV format
    const csvRows = [headers.join(',')];
    
    adminSystem.buylist.forEach(item => {
        const row = [
            `"${item.name.replace(/"/g, '""')}"`, // Escape quotes in card names
            item.game,
            item.cashPrice.toFixed(2),
            item.creditPrice.toFixed(2),
            `"${item.category.replace(/"/g, '""')}"`,
            `"${item.rarity.replace(/"/g, '""')}"`,
            `"${item.set.replace(/"/g, '""')}"`,
            item.status,
            item.maxQuantity,
            item.currentStock,
            new Date(item.createdAt).toLocaleDateString()
        ];
        csvRows.push(row.join(','));
    });
    
    // Create CSV content
    const csvContent = csvRows.join('\n');
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `buylist-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    adminSystem.showToast('Buylist exported to CSV successfully', 'success');
}

// Initialize admin system
let adminSystem;
document.addEventListener('DOMContentLoaded', () => {
    adminSystem = new AdminSystem();
    
    // Load buylist items when buylist tab is active
    setTimeout(() => {
        if (document.getElementById('buylist-items')) {
            renderBuylistItems();
        }
    }, 1000);
});

// Mobile Navigation Functions
function toggleMobileNav() {
    const sidebar = document.getElementById('mobile-sidebar');
    const overlay = document.getElementById('mobile-overlay');
    
    if (sidebar && overlay) {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
        
        // Prevent body scroll when sidebar is open
        if (sidebar.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }
}

function closeMobileNav() {
    const sidebar = document.getElementById('mobile-sidebar');
    const overlay = document.getElementById('mobile-overlay');
    
    if (sidebar && overlay) {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Update mobile nav active state when switching tabs
function updateMobileNavActiveState(activeTabName) {
    const navItems = document.querySelectorAll('.mobile-nav-item');
    navItems.forEach(item => {
        item.classList.remove('active');
        const itemText = item.textContent.toLowerCase().trim();
        if (itemText.includes(activeTabName.toLowerCase())) {
            item.classList.add('active');
        }
    });
}

// Enhanced switchTab function with mobile nav support
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    const activeTabButton = document.querySelector(`[onclick="switchTab('${tabName}')"]`);
    if (activeTabButton) {
        activeTabButton.classList.add('active');
    }

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    const activeTabContent = document.getElementById(`${tabName}-tab`);
    if (activeTabContent) {
        activeTabContent.classList.add('active');
    }

    // Update mobile nav active state
    updateMobileNavActiveState(tabName);

    // Update content
    if (window.adminSystem) {
        adminSystem.updateDashboard();
    }
}

// Add CSS animations
const animationStyle = document.createElement('style');
animationStyle.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(animationStyle);

// Game Toggle Functions
function switchInventoryGame(game) {
    if (window.adminSystem) {
        adminSystem.currentInventoryGame = game;
        
        // Update button styles
        const yugioBtn = document.getElementById('inventory-yugioh-btn');
        const pokemonBtn = document.getElementById('inventory-pokemon-btn');
        
        if (game === 'yugioh') {
            yugioBtn.style.background = 'var(--primary-color)';
            yugioBtn.style.color = 'white';
            pokemonBtn.style.background = 'transparent';
            pokemonBtn.style.color = 'var(--gray-600)';
        } else {
            pokemonBtn.style.background = 'var(--primary-color)';
            pokemonBtn.style.color = 'white';
            yugioBtn.style.background = 'transparent';
            yugioBtn.style.color = 'var(--gray-600)';
        }
        
        // Load cards for the selected game
        loadCardsFromAPI();
        adminSystem.showToast(`Switched to ${game === 'yugioh' ? 'Yu-Gi-Oh!' : 'Pokemon'}`, 'info');
    }
}

function switchBuylistGame(game) {
    if (window.adminSystem) {
        adminSystem.currentBuylistGame = game;
        
        // Filter buylist by game
        const gameFilter = document.getElementById('game-filter');
        if (gameFilter) {
            gameFilter.value = game;
            filterBuylistByGame();
        }
        
        adminSystem.showToast(`Filtered buylist to ${game === 'yugioh' ? 'Yu-Gi-Oh!' : 'Pokemon'}`, 'info');
    }
}

async function loadCardsFromAPI() {
    if (!window.adminSystem) return;
    
    const game = adminSystem.currentInventoryGame;
    adminSystem.showToast(`Loading ${game === 'yugioh' ? 'Yu-Gi-Oh!' : 'Pokemon'} cards from API...`, 'info');
    
    try {
        let newCards = [];
        
        if (game === 'yugioh') {
            // Load Yu-Gi-Oh! cards from YGOPRODeck API
            const metaCards = await window.ygoproAPI.getMetaCards();
            
            if (metaCards && metaCards.length > 0) {
                newCards = metaCards.map((card, index) => {
                    const formattedCard = window.ygoproAPI.formatCardForDisplay(card);
                    
                    return {
                        id: Date.now() + index,
                        name: card.name,
                        price: parseFloat(formattedCard.price),
                        quantity: adminSystem.generateRandomQuantity(),
                        category: adminSystem.getCardCategory(card),
                        rarity: formattedCard.rarity,
                        set: adminSystem.getCardSet(card),
                        lowStockThreshold: 5,
                        image: formattedCard.image,
                        game: 'yugioh',
                        apiData: card
                    };
                });
            }
        } else if (game === 'pokemon') {
            // Generate Pokemon cards (since we don't have a Pokemon API)
            const pokemonCards = [
                { name: 'Charizard', rarity: 'Holo Rare', set: 'Base Set', category: 'Pokemon', price: 45.99 },
                { name: 'Blastoise', rarity: 'Holo Rare', set: 'Base Set', category: 'Pokemon', price: 32.50 },
                { name: 'Venusaur', rarity: 'Holo Rare', set: 'Base Set', category: 'Pokemon', price: 28.75 },
                { name: 'Pikachu', rarity: 'Common', set: 'Base Set', category: 'Pokemon', price: 12.99 },
                { name: 'Mewtwo', rarity: 'Holo Rare', set: 'Base Set', category: 'Pokemon', price: 55.00 },
                { name: 'Mew', rarity: 'Holo Rare', set: 'Fossil', category: 'Pokemon', price: 38.50 },
                { name: 'Alakazam', rarity: 'Holo Rare', set: 'Base Set', category: 'Pokemon', price: 25.99 },
                { name: 'Machamp', rarity: 'Holo Rare', set: 'Base Set', category: 'Pokemon', price: 22.50 },
                { name: 'Gengar', rarity: 'Holo Rare', set: 'Fossil', category: 'Pokemon', price: 35.75 },
                { name: 'Dragonite', rarity: 'Holo Rare', set: 'Fossil', category: 'Pokemon', price: 42.00 }
            ];
            
            newCards = pokemonCards.map((card, index) => ({
                id: Date.now() + index,
                name: card.name,
                price: card.price,
                quantity: adminSystem.generateRandomQuantity(),
                category: card.category,
                rarity: card.rarity,
                set: card.set,
                lowStockThreshold: 5,
                image: 'https://images.pokemontcg.io/base1/4_hires.png', // Placeholder Pokemon image
                game: 'pokemon'
            }));
        }
        
        // Replace current inventory with new cards for the selected game
        const existingInventory = JSON.parse(localStorage.getItem('tcg-inventory') || '[]');
        const otherGameCards = existingInventory.filter(item => item.game && item.game !== game);
        const updatedInventory = [...otherGameCards, ...newCards];
        
        localStorage.setItem('tcg-inventory', JSON.stringify(updatedInventory));
        adminSystem.inventory = updatedInventory;
        
        // Update display to show only current game cards
        const currentGameCards = updatedInventory.filter(item => !item.game || item.game === game);
        const container = document.getElementById('inventory-list');
        if (container) {
            container.innerHTML = currentGameCards.map(item => adminSystem.generateInventoryHTML(item)).join('');
        }
        
        adminSystem.showToast(`Loaded ${newCards.length} ${game === 'yugioh' ? 'Yu-Gi-Oh!' : 'Pokemon'} cards`, 'success');
        
    } catch (error) {
        console.error('Error loading cards from API:', error);
        adminSystem.showToast('Error loading cards from API', 'error');
    }
}

// Make search functions globally available
window.searchInventory = function() {
    if (window.adminSystem) {
        adminSystem.searchInventory();
    }
};

window.searchCustomers = function() {
    if (window.adminSystem) {
        adminSystem.searchCustomers();
    }
};

window.searchBuylist = searchBuylist;

// Make other admin functions globally available
window.addNewCard = function() {
    if (window.adminSystem) {
        adminSystem.addNewCard();
    }
};

window.bulkUpdatePrices = function() {
    if (window.adminSystem) {
        adminSystem.bulkUpdatePrices();
    }
};

window.addToBuylist = addToBuylist;
window.bulkUpdateBuylistPrices = bulkUpdateBuylistPrices;
window.importBuylistFromAPI = importBuylistFromAPI;
window.exportBuylist = exportBuylist;
window.filterBuylistByGame = filterBuylistByGame;
window.filterBuylistByStatus = filterBuylistByStatus;

// Make game toggle functions globally available
window.switchInventoryGame = switchInventoryGame;
window.switchBuylistGame = switchBuylistGame;
window.loadCardsFromAPI = loadCardsFromAPI;

// Make mobile navigation functions globally available
window.toggleMobileNav = toggleMobileNav;
window.closeMobileNav = closeMobileNav;
window.switchTab = switchTab;
