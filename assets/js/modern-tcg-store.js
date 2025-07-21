/**
 * Modern TCG Store - Interactive JavaScript Framework
 * Handles all modern interactions, animations, and API integration
 */

class ModernTCGStore {
    constructor() {
        this.apiBaseURL = 'https://db.ygoprodeck.com/api/v7';
        this.cache = new Map();
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
        this.cart = JSON.parse(localStorage.getItem('tcg-cart') || '[]');
        this.isLoading = false;
        this.currentCards = [];
        this.filteredCards = [];
        this.currentPage = 1;
        this.cardsPerPage = 20;
        
        // Account system - integrated with database service
        this.currentUser = JSON.parse(localStorage.getItem('tcg-user') || 'null');
        this.dbService = window.dbService; // Reference to database service
        this.orders = JSON.parse(localStorage.getItem('tcg-orders') || '[]');
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateCartBadge();
        this.initializeToastContainer();
        this.loadInitialData();
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce(this.handleSearchDropdown.bind(this), 300));
            searchInput.addEventListener('focus', this.handleSearchFocus.bind(this));
            searchInput.addEventListener('keydown', this.handleSearchKeydown.bind(this));
        }

        // Close search dropdown when clicking outside
        document.addEventListener('click', (e) => {
            const searchSection = document.querySelector('.search-section');
            if (searchSection && !searchSection.contains(e.target)) {
                this.hideSearchDropdown();
            }
        });

        // Filter functionality
        this.setupFilterListeners();

        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const href = anchor.getAttribute('href');
                if (href && href !== '#') {
                    const target = document.querySelector(href);
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            });
        });
    }

    setupFilterListeners() {
        const filterInputs = document.querySelectorAll('.filter-input, .filter-select');
        filterInputs.forEach(input => {
            input.addEventListener('change', this.debounce(this.applyFilters.bind(this), 300));
        });

        const filterBtn = document.querySelector('.filter-btn');
        if (filterBtn) {
            filterBtn.addEventListener('click', this.applyFilters.bind(this));
        }
    }

    async loadInitialData() {
        const cardsGrid = document.querySelector('.modern-card-grid, #meta-cards-grid, #cards-grid');
        if (!cardsGrid) return;

        this.showLoading(cardsGrid);

        try {
            // Get URL parameters for specific filtering
            const urlParams = new URLSearchParams(window.location.search);
            const archetype = urlParams.get('archetype');
            const category = urlParams.get('category');
            
            let cards = [];
            
            if (archetype) {
                cards = await this.getCardsByArchetype(archetype);
            } else if (category === 'Hand-Traps') {
                cards = await this.getHandTrapCards();
            } else {
                cards = await this.getMetaCards();
            }

            this.currentCards = await Promise.all(cards.map(card => this.formatCardForDisplay(card)));
            this.filteredCards = [...this.currentCards];
            
            this.displayCards(cardsGrid);
            this.setupPagination();
            
        } catch (error) {
            console.error('Error loading cards:', error);
            this.showError(cardsGrid, 'Failed to load cards. Please try again later.');
        }
    }

    async getMetaCards() {
        const metaCardNames = [
            'Snake-Eye Ash',
            'Kashtira Fenrir', 
            'Ash Blossom & Joyous Spring',
            'Nibiru, the Primal Being',
            'Infinite Impermanence',
            'Maxx "C"',
            'Triple Tactics Talent',
            'Pot of Prosperity',
            'Effect Veiler',
            'Ghost Ogre & Snow Rabbit',
            'Blue-Eyes White Dragon',
            'Dark Magician'
        ];

        const cards = [];
        for (const name of metaCardNames) {
            try {
                const card = await this.getCardByName(name);
                if (card) {
                    cards.push(card);
                }
            } catch (error) {
                console.warn(`Could not fetch card: ${name}`);
            }
        }

        return cards;
    }

    async getHandTrapCards() {
        const handTrapNames = [
            'Ash Blossom & Joyous Spring',
            'Effect Veiler',
            'Ghost Ogre & Snow Rabbit',
            'Nibiru, the Primal Being',
            'Droll & Lock Bird',
            'Infinite Impermanence'
        ];

        const cards = [];
        for (const name of handTrapNames) {
            try {
                const card = await this.getCardByName(name);
                if (card) cards.push(card);
            } catch (error) {
                console.warn(`Could not fetch ${name}`);
            }
        }

        return cards;
    }

    async getCardByName(name) {
        const cacheKey = `card_name_${name}`;
        const cached = this.cache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
            return cached.data;
        }

        try {
            const response = await fetch(`${this.apiBaseURL}/cardinfo.php?name=${encodeURIComponent(name)}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const result = await response.json();
            const card = result.data ? result.data[0] : null;
            
            if (card) {
                this.cache.set(cacheKey, {
                    data: card,
                    timestamp: Date.now()
                });
            }
            
            return card;
        } catch (error) {
            console.error(`Error fetching card ${name}:`, error);
            return null;
        }
    }

    async getCardById(id) {
        const cacheKey = `card_id_${id}`;
        const cached = this.cache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
            return cached.data;
        }

        try {
            const response = await fetch(`${this.apiBaseURL}/cardinfo.php?id=${id}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const result = await response.json();
            const card = result.data ? result.data[0] : null;
            
            if (card) {
                this.cache.set(cacheKey, {
                    data: card,
                    timestamp: Date.now()
                });
            }
            
            return card;
        } catch (error) {
            console.error(`Error fetching card ${id}:`, error);
            return null;
        }
    }

    async getCardsByArchetype(archetype) {
        const cacheKey = `archetype_${archetype}`;
        const cached = this.cache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
            return cached.data;
        }

        try {
            const response = await fetch(`${this.apiBaseURL}/cardinfo.php?archetype=${encodeURIComponent(archetype)}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const result = await response.json();
            const cards = result.data || [];
            
            this.cache.set(cacheKey, {
                data: cards,
                timestamp: Date.now()
            });
            
            return cards;
        } catch (error) {
            console.error(`Error fetching archetype ${archetype}:`, error);
            return [];
        }
    }

    async formatCardForDisplay(card) {
        if (!card) return null;

        const price = await this.getCardPrice(card);

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
            rarity: this.getCardRarity(card),
            sets: card.card_sets || []
        };
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

    async getCardPrice(card) {
        try {
            // Try to get price from YGOPRODeck API
            const response = await fetch(`${this.apiBaseURL}/cardinfo.php?id=${card.id}`);
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
                        // Convert USD to CAD (approximate rate: 1 USD = 1.35 CAD)
                        const cadPrice = usdPrice * 1.35;
                        return cadPrice.toFixed(2);
                    }
                }
            }
        } catch (error) {
            console.warn('Error fetching price from API:', error);
        }
        
        // Fallback to mock pricing in CAD
        return this.getMockPriceCAD(card.name);
    }

    getMockPriceCAD(cardName) {
        const hash = this.hashCode(cardName);
        const basePrice = Math.abs(hash % 80) + 1; // Reduced base for more realistic CAD prices
        
        if (cardName.includes('Ash') || cardName.includes('Snake-Eye')) {
            return (basePrice * 2.5 + 65).toFixed(2); // Higher for meta cards in CAD
        }
        if (cardName.includes('Blue-Eyes') || cardName.includes('Dark Magician')) {
            return (basePrice * 0.7 + 8).toFixed(2); // Classic cards
        }
        if (cardName.includes('Kashtira') || cardName.includes('Infinite')) {
            return (basePrice * 2 + 30).toFixed(2); // Meta staples
        }
        if (cardName.includes('Nibiru') || cardName.includes('Effect Veiler')) {
            return (basePrice * 1.8 + 25).toFixed(2); // Hand traps
        }
        
        return (basePrice * 1.35).toFixed(2); // Base conversion to CAD
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
        
        const rarities = ['Common', 'Rare', 'Super Rare', 'Ultra Rare', 'Secret Rare'];
        return rarities[Math.floor(Math.random() * rarities.length)];
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

    displayCards(container) {
        if (!container) return;

        container.classList.remove('loading');
        
        const startIndex = (this.currentPage - 1) * this.cardsPerPage;
        const endIndex = startIndex + this.cardsPerPage;
        const cardsToShow = this.filteredCards.slice(startIndex, endIndex);
        
        if (cardsToShow.length === 0) {
            container.innerHTML = '<div class="loading-container"><p class="loading-text">No cards found matching your criteria.</p></div>';
            return;
        }

        container.innerHTML = '';
        
        cardsToShow.forEach((card, index) => {
            const cardElement = this.createModernCardElement(card);
            cardElement.style.animationDelay = `${index * 50}ms`;
            cardElement.classList.add('fade-in-up');
            container.appendChild(cardElement);
        });
    }

    createModernCardElement(card) {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'modern-card interactive-hover';
        cardDiv.onclick = () => this.navigateToProduct(card);
        
        const isHot = parseFloat(card.price) > 50;
        const priceChangeSymbol = card.priceChange.direction === 'up' ? '↗' : 
                                card.priceChange.direction === 'down' ? '↘' : '→';
        const priceChangeText = card.priceChange.direction === 'stable' ? '$0.00' : 
                              (card.priceChange.direction === 'up' ? '+' : '-') + '$' + card.priceChange.amount;

        const isInWishlist = this.isInWishlist(card.name);
        const wishlistIcon = isInWishlist ? '❤️' : '🤍';
        const wishlistTitle = isInWishlist ? 'Remove from wishlist' : 'Add to wishlist';

        // Ensure all values are properly escaped and converted to strings
        const safeName = String(card.name || '').replace(/'/g, "\\'");
        const safePrice = parseFloat(card.price) || 0;
        const safeImage = String(card.image || '').replace(/'/g, "\\'");
        const safeId = String(card.id || '');

        cardDiv.innerHTML = `
            <div class="card-image-container">
                <img src="${safeImage}" alt="${safeName}" class="card-image" loading="lazy">
                ${isHot ? '<div class="card-badge">HOT</div>' : ''}
                <button class="wishlist-btn" onclick="event.stopPropagation(); tcgStore.toggleWishlist('${safeName}', ${safePrice}, '${safeImage}', '${safeId}')" title="${wishlistTitle}">
                    ${wishlistIcon}
                </button>
            </div>
            <div class="card-info">
                <h3 class="card-name">${safeName}</h3>
                <p class="card-type">${card.type}</p>
                <div class="price-section">
                    <span class="card-price">$${card.price}</span>
                    <span class="price-trend ${card.priceChange.direction}">
                        ${priceChangeSymbol} ${priceChangeText}
                    </span>
                </div>
                <div class="card-actions">
                    <button class="add-to-cart-btn" onclick="event.stopPropagation(); tcgStore.addToCart('${safeName}', ${safePrice}, '${safeImage}')">
                        Add to Cart
                    </button>
                    <button class="wishlist-toggle-btn" onclick="event.stopPropagation(); tcgStore.toggleWishlist('${safeName}', ${safePrice}, '${safeImage}', '${safeId}')" title="${wishlistTitle}">
                        ${wishlistIcon}
                    </button>
                </div>
            </div>
        `;
        
        return cardDiv;
    }

    navigateToProduct(card) {
        // Use the SPA router instead of direct navigation
        if (window.appRouter) {
            window.appRouter.loadPage('product', true, `?id=${card.id}`);
        } else if (window.navigateTo) {
            // Use global navigation function
            window.navigateTo('product', `?id=${card.id}`);
        } else {
            // Fallback to direct navigation if router not available
            const productUrl = `pages/product.html?id=${card.id}`;
            window.location.href = productUrl;
        }
    }

    showLoading(container) {
        if (!container) return;
        
        container.classList.add('loading');
        container.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <p class="loading-text">Loading cards...</p>
            </div>
        `;
    }

    showError(container, message) {
        if (!container) return;
        
        container.innerHTML = `
            <div class="loading-container">
                <p class="loading-text" style="color: var(--error-color);">${message}</p>
            </div>
        `;
    }

    async handleSearch() {
        const searchInput = document.querySelector('.search-input');
        if (!searchInput) return;

        const query = searchInput.value.trim();
        if (query.length < 2) {
            this.filteredCards = [...this.currentCards];
            this.displayCards(document.querySelector('.modern-card-grid, #meta-cards-grid, #cards-grid'));
            return;
        }

        try {
            const searchResults = await this.searchCards(query);
            this.currentCards = await Promise.all(searchResults.map(card => this.formatCardForDisplay(card)));
            this.filteredCards = [...this.currentCards];
            this.currentPage = 1;
            
            const container = document.querySelector('.modern-card-grid, #meta-cards-grid, #cards-grid');
            this.displayCards(container);
            this.setupPagination();
            
        } catch (error) {
            console.error('Search error:', error);
            this.showToast('Search failed. Please try again.', 'error');
        }
    }

    async searchCards(query) {
        const cacheKey = `search_${query}`;
        const cached = this.cache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
            return cached.data;
        }

        try {
            const response = await fetch(`${this.apiBaseURL}/cardinfo.php?fname=${encodeURIComponent(query)}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const result = await response.json();
            const cards = result.data || [];
            
            this.cache.set(cacheKey, {
                data: cards,
                timestamp: Date.now()
            });
            
            return cards;
        } catch (error) {
            console.error(`Error searching for ${query}:`, error);
            return [];
        }
    }

    applyFilters() {
        // Implementation for filtering logic
        this.currentPage = 1;
        this.displayCards(document.querySelector('.modern-card-grid, #meta-cards-grid, #cards-grid'));
        this.setupPagination();
    }

    setupPagination() {
        const totalPages = Math.ceil(this.filteredCards.length / this.cardsPerPage);
        const paginationContainer = document.querySelector('.pagination-container');
        
        if (!paginationContainer || totalPages <= 1) return;

        const prevBtn = paginationContainer.querySelector('.pagination-btn:first-child');
        const nextBtn = paginationContainer.querySelector('.pagination-btn:last-child');
        const pageInfo = paginationContainer.querySelector('.pagination-info');

        if (pageInfo) {
            pageInfo.textContent = `Page ${this.currentPage} of ${totalPages}`;
        }

        if (prevBtn) {
            prevBtn.disabled = this.currentPage === 1;
            prevBtn.onclick = () => this.changePage(-1);
        }

        if (nextBtn) {
            nextBtn.disabled = this.currentPage === totalPages;
            nextBtn.onclick = () => this.changePage(1);
        }
    }

    changePage(delta) {
        const totalPages = Math.ceil(this.filteredCards.length / this.cardsPerPage);
        const newPage = this.currentPage + delta;
        
        if (newPage >= 1 && newPage <= totalPages) {
            this.currentPage = newPage;
            this.displayCards(document.querySelector('.modern-card-grid, #meta-cards-grid, #cards-grid'));
            this.setupPagination();
            
            // Smooth scroll to top of cards
            const cardsContainer = document.querySelector('.modern-card-grid, #meta-cards-grid, #cards-grid');
            if (cardsContainer) {
                cardsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }

    addToCart(cardName, price, image) {
        // Ensure price is a valid number, default to 0 if null/undefined
        const validPrice = parseFloat(price) || 0;
        const existingItem = this.cart.find(item => item.name === cardName);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                name: cardName,
                price: validPrice,
                image: image,
                quantity: 1,
                id: Date.now()
            });
        }
        
        this.saveCart();
        this.updateCartBadge();
        this.showToast(`${cardName} added to cart!`, 'success');
        
        // Live update the cart modal if it's open
        const cartModal = document.getElementById('cart-modal');
        if (cartModal && cartModal.style.display !== 'none') {
            if (existingItem) {
                // Update existing item display
                this.updateCartItemDisplay(existingItem.id, existingItem);
                this.updateCartSummary();
            } else {
                // Regenerate entire modal for new items
                this.updateCartModalContent();
            }
        }
    }

    removeFromCart(itemId) {
        const item = this.cart.find(item => item.id === itemId);
        if (!item) return;
        
        const itemName = item.name;
        this.cart = this.cart.filter(item => item.id !== itemId);
        this.saveCart();
        this.updateCartBadge();
        this.showToast(`${itemName} removed from cart`, 'info');
        
        // Live update the cart modal if it's open
        const cartModal = document.getElementById('cart-modal');
        if (cartModal && cartModal.style.display !== 'none') {
            // Add a smooth transition effect
            const cartItem = document.querySelector(`[data-item-id="${itemId}"]`);
            if (cartItem) {
                cartItem.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
                cartItem.style.opacity = '0';
                cartItem.style.transform = 'translateX(100%)';
                
                setTimeout(() => {
                    this.updateCartModalContent();
                }, 300);
            } else {
                this.updateCartModalContent();
            }
        }
    }

    updateCartQuantity(itemId, newQuantity) {
        const item = this.cart.find(item => item.id === itemId);
        if (!item) return;
        
        // Ensure quantity is a positive integer
        newQuantity = Math.max(1, Math.floor(newQuantity));
        
        // Set maximum quantity limit (e.g., 99 per item)
        const maxQuantity = 99;
        newQuantity = Math.min(newQuantity, maxQuantity);
        
        item.quantity = newQuantity;
        this.saveCart();
        this.updateCartBadge();
        
        // Live update the cart modal if it's open
        const cartModal = document.getElementById('cart-modal');
        if (cartModal && cartModal.style.display !== 'none') {
            // Update specific elements instead of regenerating entire modal for better UX
            this.updateCartItemDisplay(itemId, item);
            this.updateCartSummary();
        }
    }

    decreaseQuantity(itemId) {
        const item = this.cart.find(item => item.id === itemId);
        if (!item || item.quantity <= 1) return;
        
        this.updateCartQuantity(itemId, item.quantity - 1);
    }

    increaseQuantity(itemId) {
        const item = this.cart.find(item => item.id === itemId);
        if (!item) return;
        
        this.updateCartQuantity(itemId, item.quantity + 1);
    }

    updateCartModalContent() {
        const cartModal = document.getElementById('cart-modal');
        if (!cartModal) return;

        // Get the modal content container
        const modalContent = cartModal.querySelector('.cart-modal-content');
        if (!modalContent) return;

        // Generate new modal content HTML
        const newContentHTML = this.generateCartModalHTML().match(/<div class="cart-modal-content"[^>]*>([\s\S]*)<\/div>$/)[1];
        
        // Replace the modal content
        modalContent.innerHTML = newContentHTML;
        
        // Re-setup event listeners for the new content
        this.setupCartModalEventListeners();
    }

    addToCartWithDetails(cardName, price, image, setCode = '', rarity = '', setName = '') {
        // Create a unique identifier for items with different sets/rarities
        const itemKey = `${cardName}_${setCode}_${rarity}`;
        const existingItem = this.cart.find(item => item.itemKey === itemKey);
        
        // Ensure price is a valid number, default to 0 if null/undefined
        const validPrice = parseFloat(price) || 0;
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                name: cardName,
                price: validPrice,
                image: image,
                quantity: 1,
                id: Date.now() + Math.random(), // Ensure unique ID
                itemKey: itemKey,
                setCode: setCode,
                rarity: rarity,
                setName: setName
            });
        }
        
        this.saveCart();
        this.updateCartBadge();
        
        const displayName = setCode && rarity ? 
            `${cardName} (${setCode} - ${rarity})` : cardName;
        this.showToast(`${displayName} added to cart!`, 'success');
        
        // Live update the cart modal if it's open
        const cartModal = document.getElementById('cart-modal');
        if (cartModal && cartModal.style.display !== 'none') {
            if (existingItem) {
                // Update existing item display
                this.updateCartItemDisplay(existingItem.id, existingItem);
                this.updateCartSummary();
            } else {
                // Regenerate entire modal for new items
                this.updateCartModalContent();
            }
        }
    }

    saveCart() {
        localStorage.setItem('tcg-cart', JSON.stringify(this.cart));
    }

    updateCartBadge() {
        const badge = document.querySelector('.cart-badge');
        if (badge) {
            const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
            badge.textContent = totalItems;
            badge.style.display = totalItems > 0 ? 'block' : 'none';
        }
    }

    openCart() {
        this.createCartModal();
        this.displayCartModal();
    }

    createCartModal() {
        // Remove existing modal if it exists
        const existingModal = document.getElementById('cart-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.id = 'cart-modal';
        modal.className = 'cart-modal';
        modal.innerHTML = this.generateCartModalHTML();
        document.body.appendChild(modal);

        // Add event listeners
        this.setupCartModalEventListeners();
    }

    generateCartModalHTML() {
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        return `
            <div class="cart-modal-overlay" onclick="tcgStore.closeCart()">
                <div class="cart-modal-content" onclick="event.stopPropagation()">
                    <div class="cart-modal-header">
                        <h2 style="font-size: 1.5rem; font-weight: 700; color: var(--gray-900); margin: 0;">
                            Shopping Cart (${totalItems} items)
                        </h2>
                        <button class="cart-close-btn" onclick="tcgStore.closeCart()">×</button>
                    </div>
                    
                    <div class="cart-modal-body">
                        ${this.cart.length === 0 ? this.generateEmptyCartHTML() : this.generateCartItemsHTML()}
                    </div>
                    
                    ${this.cart.length > 0 ? this.generateCartFooterHTML(totalPrice) : ''}
                </div>
            </div>
        `;
    }

    generateEmptyCartHTML() {
        return `
            <div class="empty-cart">
                <div style="text-align: center; padding: var(--space-12) var(--space-6);">
                    <div style="font-size: 4rem; margin-bottom: var(--space-4); opacity: 0.5;">🛒</div>
                    <h3 style="font-size: 1.25rem; font-weight: 600; color: var(--gray-900); margin-bottom: var(--space-3);">Your cart is empty</h3>
                    <p style="color: var(--gray-600); margin-bottom: var(--space-6);">Add some Yu-Gi-Oh! cards to get started!</p>
                    <button class="primary-btn" onclick="tcgStore.closeCart(); navigateTo('singles')">
                        Browse Singles
                    </button>
                </div>
            </div>
        `;
    }

    generateCartItemsHTML() {
        return `
            <div class="cart-items">
                ${this.cart.map(item => this.generateCartItemHTML(item)).join('')}
            </div>
        `;
    }

    generateCartItemHTML(item) {
        // Debug logging to see what we're working with
        console.log('Cart item data:', item);
        
        // Ensure safe values with null checks and proper string conversion
        const price = parseFloat(item.price) || 0;
        const quantity = parseInt(item.quantity) || 1;
        const itemTotal = (price * quantity).toFixed(2);
        const hasSetInfo = item.setCode && item.rarity;
        
        // Ensure all display values are properly converted to strings
        const safeName = this.ensureString(item.name) || 'Unknown Item';
        let safeImage = this.ensureString(item.image);
        
        // If image is still empty or invalid, use fallback
        if (!safeImage || safeImage === '' || safeImage === 'undefined') {
            safeImage = 'https://images.ygoprodeck.com/images/cards/back.jpg';
        }
        
        console.log('Processed cart item:', { safeName, safeImage, price, quantity, itemTotal });
        
        return `
            <div class="cart-item" data-item-id="${item.id}">
                <div class="cart-item-image">
                    <img src="${safeImage}" alt="${safeName}" style="width: 60px; height: 84px; object-fit: contain; border-radius: var(--radius-md);">
                </div>
                <div class="cart-item-details">
                    <h4 style="font-size: 1rem; font-weight: 600; color: var(--gray-900); margin-bottom: var(--space-1); line-height: 1.3;">${safeName}</h4>
                    ${hasSetInfo ? `
                        <div style="display: flex; gap: var(--space-2); margin-bottom: var(--space-1);">
                            <span style="background: var(--primary-color); color: white; padding: 2px 6px; border-radius: var(--radius-sm); font-size: 0.75rem; font-weight: 600;">${item.setCode}</span>
                            <span style="background: var(--secondary-color); color: var(--gray-900); padding: 2px 6px; border-radius: var(--radius-sm); font-size: 0.75rem; font-weight: 600;">${item.rarity}</span>
                        </div>
                    ` : ''}
                    <p style="font-size: 0.875rem; color: var(--gray-600); margin-bottom: var(--space-2);">$${price.toFixed(2)} each</p>
                    <div class="cart-item-controls">
                        <div class="quantity-controls">
                            <button class="quantity-btn" onclick="tcgStore.updateCartQuantity(${item.id}, ${quantity - 1})">-</button>
                            <span class="quantity-display">${quantity}</span>
                            <button class="quantity-btn" onclick="tcgStore.updateCartQuantity(${item.id}, ${quantity + 1})">+</button>
                        </div>
                        <button class="remove-btn" onclick="tcgStore.removeFromCart(${item.id})" title="Remove from cart">
                            🗑️
                        </button>
                    </div>
                </div>
                <div class="cart-item-total">
                    <span style="font-size: 1.125rem; font-weight: 700; color: var(--primary-color);">$${itemTotal}</span>
                </div>
            </div>
        `;
    }

    generateCartFooterHTML(totalPrice) {
        const shipping = totalPrice >= 75 ? 0 : 9.99;
        const tax = totalPrice * 0.13; // 13% HST for Ontario
        const finalTotal = totalPrice + shipping + tax;

        return `
            <div class="cart-modal-footer">
                <div class="cart-summary">
                    <div class="summary-row">
                        <span>Subtotal:</span>
                        <span>$${totalPrice.toFixed(2)}</span>
                    </div>
                    <div class="summary-row">
                        <span>Shipping:</span>
                        <span>${shipping === 0 ? 'FREE' : '$' + shipping.toFixed(2)}</span>
                    </div>
                    <div class="summary-row">
                        <span>Tax (HST):</span>
                        <span>$${tax.toFixed(2)}</span>
                    </div>
                    <div class="summary-row total-row">
                        <span>Total:</span>
                        <span>$${finalTotal.toFixed(2)}</span>
                    </div>
                    ${totalPrice < 75 ? `<p class="shipping-notice">Add $${(75 - totalPrice).toFixed(2)} more for free shipping!</p>` : ''}
                </div>
                <div class="cart-actions">
                    <button class="secondary-btn" onclick="tcgStore.clearCart()" style="background: var(--error-color); color: white;">
                        Clear Cart
                    </button>
                    <button class="secondary-btn" onclick="tcgStore.closeCart()">Continue Shopping</button>
                    <button class="primary-btn" onclick="tcgStore.proceedToCheckout()">Proceed to Checkout</button>
                </div>
            </div>
        `;
    }

    setupCartModalEventListeners() {
        // Close modal when clicking outside
        const overlay = document.querySelector('.cart-modal-overlay');
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.closeCart();
                }
            });
        }

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.getElementById('cart-modal')) {
                this.closeCart();
            }
        });
    }

    displayCartModal() {
        const modal = document.getElementById('cart-modal');
        if (modal) {
            modal.style.display = 'flex';
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
        }
    }

    closeCart() {
        const modal = document.getElementById('cart-modal');
        if (modal) {
            modal.style.display = 'none';
            modal.remove();
            // Restore body scroll
            document.body.style.overflow = '';
        }
    }

    proceedToCheckout() {
        if (this.cart.length === 0) {
            this.showToast('Your cart is empty!', 'error');
            return;
        }

        if (!this.currentUser) {
            this.showToast('Please log in to proceed to checkout.', 'error');
            this.closeCart();
            this.openLoginModal();
            return;
        }

        // Create order from current cart
        const order = this.createOrder([...this.cart]);
        
        if (order) {
            // Clear cart after successful order creation
            this.cart = [];
            this.saveCart();
            this.updateCartBadge();
            this.closeCart();
            
            // Show success message and redirect to order confirmation
            this.showToast(`Order #${order.id} placed successfully!`, 'success', 5000);
            
            // Simulate order processing
            setTimeout(() => {
                this.updateOrderStatus(order.id, 'processing');
                this.showToast('Your order is now being processed!', 'info');
            }, 2000);
            
            // Open order history to show the new order
            setTimeout(() => {
                this.openOrderHistoryModal();
            }, 3000);
        }
    }

    updateCartItemDisplay(itemId, item) {
        const cartItemElement = document.querySelector(`[data-item-id="${itemId}"]`);
        if (!cartItemElement) return;

        // Update quantity input field
        const quantityInput = cartItemElement.querySelector('.quantity-input');
        if (quantityInput) {
            quantityInput.value = item.quantity;
        }

        // Update quantity display (for backward compatibility)
        const quantityDisplay = cartItemElement.querySelector('.quantity-display');
        if (quantityDisplay) {
            quantityDisplay.textContent = item.quantity;
        }

        // Update minus button disabled state
        const minusBtn = cartItemElement.querySelector('.quantity-btn:first-child');
        if (minusBtn) {
            minusBtn.disabled = item.quantity <= 1;
        }

        // Update item total
        const itemTotal = cartItemElement.querySelector('.cart-item-total span');
        if (itemTotal) {
            itemTotal.textContent = `$${(item.price * item.quantity).toFixed(2)}`;
        }
    }

    updateCartSummary() {
        const totalPrice = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = totalPrice >= 75 ? 0 : 9.99;
        const tax = totalPrice * 0.13;
        const finalTotal = totalPrice + shipping + tax;

        // Update cart header
        const cartHeader = document.querySelector('.cart-modal-header h2');
        if (cartHeader) {
            const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
            cartHeader.innerHTML = `Shopping Cart (${totalItems} items)`;
        }

        // Update summary rows
        const summaryRows = document.querySelectorAll('.summary-row');
        summaryRows.forEach(row => {
            const label = row.querySelector('span:first-child').textContent;
            const valueSpan = row.querySelector('span:last-child');
            
            if (label === 'Subtotal:') {
                valueSpan.textContent = `$${totalPrice.toFixed(2)}`;
            } else if (label === 'Shipping:') {
                valueSpan.textContent = shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`;
            } else if (label === 'Tax (HST):') {
                valueSpan.textContent = `$${tax.toFixed(2)}`;
            } else if (label === 'Total:') {
                valueSpan.textContent = `$${finalTotal.toFixed(2)}`;
            }
        });

        // Update shipping notice
        const shippingNotice = document.querySelector('.shipping-notice');
        if (shippingNotice) {
            if (totalPrice >= 75) {
                shippingNotice.style.display = 'none';
            } else {
                shippingNotice.style.display = 'block';
                shippingNotice.textContent = `Add $${(75 - totalPrice).toFixed(2)} more for free shipping!`;
            }
        }
    }

    clearCart() {
        if (this.cart.length === 0) {
            this.showToast('Cart is already empty!', 'info');
            return;
        }
        
        // Confirm before clearing
        if (confirm('Are you sure you want to remove all items from your cart?')) {
            this.cart = [];
            this.saveCart();
            this.updateCartBadge();
            this.showToast('Cart cleared!', 'info');
            
            // Update cart modal if it's open
            const cartModal = document.getElementById('cart-modal');
            if (cartModal && cartModal.style.display !== 'none') {
                this.updateCartModalContent();
            }
        }
    }

    // Account System Methods
    openLoginModal() {
        this.createAccountModal('login');
    }

    openRegisterModal() {
        this.createAccountModal('register');
    }

    openEditProfileModal() {
        if (!this.currentUser) {
            this.showToast('Please log in to edit your profile.', 'error');
            return;
        }
        this.createEditProfileModal();
    }

    createAccountModal(type = 'login') {
        // Remove existing modal if it exists
        const existingModal = document.getElementById('account-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.id = 'account-modal';
        modal.className = 'account-modal';
        modal.innerHTML = this.generateAccountModalHTML(type);
        document.body.appendChild(modal);

        // Add event listeners
        this.setupAccountModalEventListeners();
    }

    generateAccountModalHTML(type) {
        const isLogin = type === 'login';
        const title = isLogin ? 'Sign In' : 'Create Account';
        const switchText = isLogin ? "Don't have an account?" : "Already have an account?";
        const switchAction = isLogin ? 'register' : 'login';
        const switchLabel = isLogin ? 'Sign Up' : 'Sign In';

        return `
            <div class="account-modal-overlay" onclick="tcgStore.closeAccountModal()">
                <div class="account-modal-content" onclick="event.stopPropagation()">
                    <div class="account-modal-header">
                        <h2 style="font-size: 1.75rem; font-weight: 700; color: var(--gray-900); margin: 0;">
                            ${title}
                        </h2>
                        <button class="account-close-btn" onclick="tcgStore.closeAccountModal()">×</button>
                    </div>
                    
                    <div class="account-modal-body">
                        <form id="account-form" onsubmit="tcgStore.handleAccountSubmit(event, '${type}')">
                            ${!isLogin ? `
                                <div class="form-group">
                                    <label for="firstName">First Name</label>
                                    <input type="text" id="firstName" name="firstName" required>
                                </div>
                                <div class="form-group">
                                    <label for="lastName">Last Name</label>
                                    <input type="text" id="lastName" name="lastName" required>
                                </div>
                            ` : ''}
                            
                            <div class="form-group">
                                <label for="email">Email Address</label>
                                <input type="email" id="email" name="email" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="password">Password</label>
                                <input type="password" id="password" name="password" required minlength="6">
                            </div>
                            
                            ${!isLogin ? `
                                <div class="form-group">
                                    <label for="confirmPassword">Confirm Password</label>
                                    <input type="password" id="confirmPassword" name="confirmPassword" required minlength="6">
                                </div>
                                <div class="form-group">
                                    <label for="phone">Phone Number (Optional)</label>
                                    <input type="tel" id="phone" name="phone">
                                </div>
                            ` : ''}
                            
                            <button type="submit" class="primary-btn" style="width: 100%; margin-bottom: var(--space-4);">
                                ${title}
                            </button>
                        </form>
                        
                        <div class="account-switch">
                            <p style="text-align: center; color: var(--gray-600);">
                                ${switchText} 
                                <button type="button" onclick="tcgStore.createAccountModal('${switchAction}')" 
                                        style="background: none; border: none; color: var(--primary-color); font-weight: 600; cursor: pointer; text-decoration: underline;">
                                    ${switchLabel}
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setupAccountModalEventListeners() {
        // Close modal when clicking outside
        const overlay = document.querySelector('.account-modal-overlay');
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.closeAccountModal();
                }
            });
        }

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.getElementById('account-modal')) {
                this.closeAccountModal();
            }
        });
    }

    createEditProfileModal() {
        // Remove existing modal if it exists
        const existingModal = document.getElementById('edit-profile-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.id = 'edit-profile-modal';
        modal.className = 'account-modal';
        modal.innerHTML = this.generateEditProfileModalHTML();
        document.body.appendChild(modal);

        // Add event listeners
        this.setupEditProfileModalEventListeners();
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    generateEditProfileModalHTML() {
        const user = this.currentUser;
        
        return `
            <div class="account-modal-overlay" onclick="tcgStore.closeEditProfileModal()">
                <div class="account-modal-content" onclick="event.stopPropagation()">
                    <div class="account-modal-header">
                        <h2 style="font-size: 1.75rem; font-weight: 700; color: var(--gray-900); margin: 0;">
                            Edit Profile
                        </h2>
                        <button class="account-close-btn" onclick="tcgStore.closeEditProfileModal()">×</button>
                    </div>
                    
                    <div class="account-modal-body">
                        <form id="edit-profile-form" onsubmit="tcgStore.handleEditProfileSubmit(event)">
                            <div class="form-group">
                                <label for="editFirstName">First Name</label>
                                <input type="text" id="editFirstName" name="firstName" value="${user.firstName}" required>
                            </div>
                            <div class="form-group">
                                <label for="editLastName">Last Name</label>
                                <input type="text" id="editLastName" name="lastName" value="${user.lastName}" required>
                            </div>
                            <div class="form-group">
                                <label for="editEmail">Email Address</label>
                                <input type="email" id="editEmail" name="email" value="${user.email}" required>
                            </div>
                            <div class="form-group">
                                <label for="editPhone">Phone Number</label>
                                <input type="tel" id="editPhone" name="phone" value="${user.phone || ''}">
                            </div>
                            <div class="form-group">
                                <label for="editArchetype">Favorite Archetype</label>
                                <input type="text" id="editArchetype" name="favoriteArchetype" value="${user.favoriteArchetype || ''}" placeholder="e.g., Blue-Eyes, Dark Magician">
                            </div>
                            
                            <hr style="margin: var(--space-6) 0; border: none; border-top: 1px solid var(--gray-200);">
                            
                            <h3 style="font-size: 1.25rem; font-weight: 600; color: var(--gray-900); margin-bottom: var(--space-4);">Change Password (Optional)</h3>
                            <div class="form-group">
                                <label for="editCurrentPassword">Current Password</label>
                                <input type="password" id="editCurrentPassword" name="currentPassword" placeholder="Leave blank to keep current password">
                            </div>
                            <div class="form-group">
                                <label for="editNewPassword">New Password</label>
                                <input type="password" id="editNewPassword" name="newPassword" minlength="6" placeholder="Leave blank to keep current password">
                            </div>
                            <div class="form-group">
                                <label for="editConfirmPassword">Confirm New Password</label>
                                <input type="password" id="editConfirmPassword" name="confirmPassword" minlength="6" placeholder="Leave blank to keep current password">
                            </div>
                            
                            <button type="submit" class="primary-btn" style="width: 100%; margin-bottom: var(--space-4);">
                                Update Profile
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        `;
    }

    setupEditProfileModalEventListeners() {
        // Close modal when clicking outside
        const overlay = document.querySelector('.account-modal-overlay');
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.closeEditProfileModal();
                }
            });
        }

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.getElementById('edit-profile-modal')) {
                this.closeEditProfileModal();
            }
        });
    }

    closeEditProfileModal() {
        const modal = document.getElementById('edit-profile-modal');
        if (modal) {
            modal.style.display = 'none';
            modal.remove();
            document.body.style.overflow = '';
        }
    }

    handleEditProfileSubmit(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData.entries());
        this.updateUserProfile(data);
    }

    async updateUserProfile(data) {
        try {
            // Validate password change if provided
            if (data.newPassword || data.currentPassword) {
                if (!data.currentPassword) {
                    this.showToast('Current password is required to change password.', 'error');
                    return;
                }
                if (data.newPassword !== data.confirmPassword) {
                    this.showToast('New passwords do not match!', 'error');
                    return;
                }
                if (data.newPassword.length < 6) {
                    this.showToast('New password must be at least 6 characters long.', 'error');
                    return;
                }
                
                // Verify current password
                if (!this.dbService.verifyPassword(data.currentPassword, this.currentUser.passwordHash)) {
                    this.showToast('Current password is incorrect.', 'error');
                    return;
                }
            }

            // Update user data
            const updatedUser = {
                ...this.currentUser,
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                phone: data.phone || '',
                favoriteArchetype: data.favoriteArchetype || null,
                updatedAt: new Date().toISOString()
            };

            // Update password if provided
            if (data.newPassword) {
                updatedUser.passwordHash = this.dbService.hashPassword(data.newPassword);
            }

            // Update in database service
            const users = JSON.parse(localStorage.getItem('tcg-users') || '{}');
            
            // If email changed, remove old entry and add new one
            if (data.email !== this.currentUser.email) {
                delete users[this.currentUser.email];
            }
            
            users[data.email] = updatedUser;
            localStorage.setItem('tcg-users', JSON.stringify(users));

            // Update current user
            this.currentUser = updatedUser;
            localStorage.setItem('tcg-user', JSON.stringify(updatedUser));

            // Track profile update event
            this.dbService.trackEvent('profile_updated', {
                userId: updatedUser.id,
                email: updatedUser.email
            });

            this.closeEditProfileModal();
            this.updateAccountUI();
            this.showToast('Profile updated successfully!', 'success');

            // Refresh account page if currently viewing it
            if (window.location.hash.includes('account')) {
                navigateTo('account');
            }

        } catch (error) {
            console.error('Profile update error:', error);
            this.showToast('Failed to update profile. Please try again.', 'error');
        }
    }

    closeAccountModal() {
        const modal = document.getElementById('account-modal');
        if (modal) {
            modal.style.display = 'none';
            modal.remove();
            document.body.style.overflow = '';
        }
    }

    handleAccountSubmit(event, type) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData.entries());

        if (type === 'register') {
            this.registerUser(data);
        } else {
            this.loginUser(data);
        }
    }

    async registerUser(data) {
        try {
            // Validate passwords match
            if (data.password !== data.confirmPassword) {
                this.showToast('Passwords do not match!', 'error');
                return;
            }

            // Use database service to create user
            const newUser = await this.dbService.createUser({
                email: data.email,
                password: data.password,
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone || '',
                favoriteArchetype: null
            });

            // Auto-login the new user
            this.currentUser = newUser;
            localStorage.setItem('tcg-user', JSON.stringify(newUser));

            // Track registration event
            this.dbService.trackEvent('user_registered', {
                userId: newUser.id,
                email: newUser.email,
                registrationMethod: 'website'
            });

            this.closeAccountModal();
            this.updateAccountUI();
            this.showToast(`Welcome to Firelight Duel Academy, ${newUser.firstName}!`, 'success');

        } catch (error) {
            console.error('Registration error:', error);
            this.showToast(error.message || 'Registration failed. Please try again.', 'error');
        }
    }

    async loginUser(data) {
        try {
            // Use database service to authenticate user
            const user = await this.dbService.authenticateUser(data.email, data.password);

            // Login successful
            this.currentUser = user;
            localStorage.setItem('tcg-user', JSON.stringify(user));

            // Track login event
            this.dbService.trackEvent('user_login', {
                userId: user.id,
                email: user.email,
                loginMethod: 'website'
            });

            this.closeAccountModal();
            this.updateAccountUI();
            this.showToast(`Welcome back, ${user.firstName}!`, 'success');

        } catch (error) {
            console.error('Login error:', error);
            this.showToast(error.message || 'Login failed. Please try again.', 'error');
        }
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('tcg-user');
        this.updateAccountUI();
        this.showToast('You have been logged out.', 'info');
        
        // Redirect to home if on account page
        if (window.location.hash.includes('account')) {
            navigateTo('home');
        }
    }

    updateAccountUI() {
        // Update account button in header
        const accountBtn = document.getElementById('account-btn');
        if (accountBtn) {
            if (this.currentUser) {
                accountBtn.innerHTML = `<i class="fas fa-user"></i> ${this.currentUser.firstName}`;
                // Don't set onclick here - it's handled by handleAccountClick() in app.html
            } else {
                accountBtn.innerHTML = '<i class="fas fa-user"></i> Account';
                // Don't set onclick here - it's handled by handleAccountClick() in app.html
            }
        }
    }

    validateCurrentUser() {
        // Check if current user still exists in the database
        if (!this.currentUser) {
            return false;
        }

        try {
            const users = JSON.parse(localStorage.getItem('tcg-users') || '{}');
            const userExists = users[this.currentUser.email];
            
            if (!userExists) {
                console.warn('Current user no longer exists in database');
                return false;
            }

            // Check if user account is still active
            if (!userExists.isActive) {
                console.warn('Current user account is deactivated');
                return false;
            }

            // Update current user data if it exists (in case of changes)
            this.currentUser = userExists;
            localStorage.setItem('tcg-user', JSON.stringify(userExists));
            
            return true;
        } catch (error) {
            console.error('Error validating current user:', error);
            return false;
        }
    }

    getUserOrders() {
        if (!this.currentUser) return [];
        return this.orders.filter(order => order.userId === this.currentUser.id);
    }

    createOrder(cartItems) {
        if (!this.currentUser) {
            this.showToast('Please log in to place an order.', 'error');
            return null;
        }

        const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = subtotal >= 75 ? 0 : 9.99;
        const tax = subtotal * 0.13;
        const total = subtotal + shipping + tax;

        const order = {
            id: Date.now(),
            userId: this.currentUser.id,
            items: cartItems.map(item => ({...item})),
            subtotal: subtotal,
            shipping: shipping,
            tax: tax,
            total: total,
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            shippingAddress: null,
            trackingNumber: null,
            estimatedDelivery: this.calculateEstimatedDelivery()
        };

        this.orders.push(order);
        localStorage.setItem('tcg-orders', JSON.stringify(this.orders));

        // Track order creation event
        if (this.dbService) {
            this.dbService.trackEvent('order_created', {
                userId: this.currentUser.id,
                orderId: order.id,
                total: total,
                itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0)
            });
        }

        return order;
    }

    updateOrderStatus(orderId, newStatus) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) return;

        order.status = newStatus;
        order.updatedAt = new Date().toISOString();

        // Add tracking number for shipped orders
        if (newStatus === 'shipped' && !order.trackingNumber) {
            order.trackingNumber = this.generateTrackingNumber();
        }

        localStorage.setItem('tcg-orders', JSON.stringify(this.orders));

        // Track status update event
        if (this.dbService) {
            this.dbService.trackEvent('order_status_updated', {
                userId: order.userId,
                orderId: orderId,
                status: newStatus
            });
        }
    }

    calculateEstimatedDelivery() {
        const now = new Date();
        const deliveryDate = new Date(now);
        deliveryDate.setDate(now.getDate() + 5); // 5 business days
        return deliveryDate.toISOString();
    }

    generateTrackingNumber() {
        const prefix = 'FD';
        const timestamp = Date.now().toString().slice(-8);
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `${prefix}${timestamp}${random}`;
    }

    openOrderHistoryModal() {
        if (!this.currentUser) {
            this.showToast('Please log in to view your order history.', 'error');
            this.openLoginModal();
            return;
        }

        this.createOrderHistoryModal();
        this.displayOrderHistoryModal();
    }

    createOrderHistoryModal() {
        // Remove existing modal if it exists
        const existingModal = document.getElementById('order-history-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.id = 'order-history-modal';
        modal.className = 'order-history-modal';
        modal.innerHTML = this.generateOrderHistoryModalHTML();
        document.body.appendChild(modal);

        // Add event listeners
        this.setupOrderHistoryModalEventListeners();
    }

    generateOrderHistoryModalHTML() {
        const userOrders = this.getUserOrders().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const totalSpent = userOrders.reduce((sum, order) => sum + order.total, 0);

        return `
            <div class="order-history-modal-overlay" onclick="tcgStore.closeOrderHistoryModal()">
                <div class="order-history-modal-content" onclick="event.stopPropagation()">
                    <div class="order-history-modal-header">
                        <h2 style="font-size: 1.5rem; font-weight: 700; color: var(--gray-900); margin: 0;">
                            <i class="fas fa-receipt" style="color: var(--primary-color); margin-right: var(--space-2);"></i>
                            Order History (${userOrders.length} orders)
                        </h2>
                        <button class="order-history-close-btn" onclick="tcgStore.closeOrderHistoryModal()">×</button>
                    </div>
                    
                    <div class="order-history-modal-body">
                        ${userOrders.length === 0 ? this.generateEmptyOrderHistoryHTML() : this.generateOrderHistoryItemsHTML(userOrders)}
                    </div>
                    
                    ${userOrders.length > 0 ? this.generateOrderHistoryFooterHTML(totalSpent, userOrders.length) : ''}
                </div>
            </div>
        `;
    }

    generateEmptyOrderHistoryHTML() {
        return `
            <div class="empty-order-history">
                <div style="text-align: center; padding: var(--space-12) var(--space-6);">
                    <div style="font-size: 4rem; margin-bottom: var(--space-4); opacity: 0.5;">📦</div>
                    <h3 style="font-size: 1.25rem; font-weight: 600; color: var(--gray-900); margin-bottom: var(--space-3);">No orders yet</h3>
                    <p style="color: var(--gray-600); margin-bottom: var(--space-6);">Start shopping to see your order history here!</p>
                    <button class="primary-btn" onclick="tcgStore.closeOrderHistoryModal(); navigateTo('singles')">
                        Browse Singles
                    </button>
                </div>
            </div>
        `;
    }

    generateOrderHistoryItemsHTML(orders) {
        return `
            <div class="order-history-items">
                ${orders.map(order => this.generateOrderHistoryItemHTML(order)).join('')}
            </div>
        `;
    }

    generateOrderHistoryItemHTML(order) {
        const orderDate = new Date(order.createdAt).toLocaleDateString();
        const statusColor = this.getOrderStatusColor(order.status);
        const statusIcon = this.getOrderStatusIcon(order.status);
        const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

        return `
            <div class="order-history-item" data-order-id="${order.id}">
                <div class="order-header">
                    <div class="order-info">
                        <h4 style="font-size: 1.125rem; font-weight: 600; color: var(--gray-900); margin-bottom: var(--space-1);">
                            Order #${order.id}
                        </h4>
                        <p style="font-size: 0.875rem; color: var(--gray-600);">
                            Placed on ${orderDate} • ${itemCount} item${itemCount !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <div class="order-status">
                        <span style="background: ${statusColor}; color: white; padding: var(--space-1) var(--space-3); border-radius: var(--radius-full); font-size: 0.75rem; font-weight: 600; text-transform: uppercase; display: flex; align-items: center; gap: var(--space-1);">
                            ${statusIcon} ${order.status}
                        </span>
                        <div style="font-size: 1.25rem; font-weight: 700; color: var(--primary-color); margin-top: var(--space-1);">
                            $${order.total.toFixed(2)}
                        </div>
                    </div>
                </div>
                
                <div class="order-items-preview">
                    ${order.items.slice(0, 3).map(item => `
                        <div class="order-item-preview">
                            <img src="${item.image}" alt="${item.name}" style="width: 40px; height: 56px; object-fit: contain; border-radius: var(--radius-sm);">
                            <div style="flex: 1; min-width: 0;">
                                <div style="font-size: 0.875rem; font-weight: 600; color: var(--gray-900); margin-bottom: 2px; line-height: 1.2;">${item.name}</div>
                                <div style="font-size: 0.75rem; color: var(--gray-600);">Qty: ${item.quantity} • $${item.price.toFixed(2)} each</div>
                            </div>
                        </div>
                    `).join('')}
                    ${order.items.length > 3 ? `
                        <div style="font-size: 0.875rem; color: var(--gray-600); text-align: center; padding: var(--space-2);">
                            +${order.items.length - 3} more item${order.items.length - 3 !== 1 ? 's' : ''}
                        </div>
                    ` : ''}
                </div>
                
                <div class="order-actions">
                    <button class="secondary-btn" onclick="tcgStore.viewOrderDetails(${order.id})" style="padding: var(--space-2) var(--space-4); font-size: 0.875rem;">
                        View Details
                    </button>
                    ${order.status === 'shipped' && order.trackingNumber ? `
                        <button class="secondary-btn" onclick="tcgStore.trackOrder('${order.trackingNumber}')" style="padding: var(--space-2) var(--space-4); font-size: 0.875rem;">
                            Track Package
                        </button>
                    ` : ''}
                    ${order.status === 'delivered' ? `
                        <button class="primary-btn" onclick="tcgStore.reorderItems(${order.id})" style="padding: var(--space-2) var(--space-4); font-size: 0.875rem;">
                            Reorder
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    generateOrderHistoryFooterHTML(totalSpent, orderCount) {
        return `
            <div class="order-history-modal-footer">
                <div class="order-history-summary">
                    <div class="summary-row">
                        <span>Total Orders:</span>
                        <span>${orderCount}</span>
                    </div>
                    <div class="summary-row">
                        <span>Total Spent:</span>
                        <span>$${totalSpent.toFixed(2)}</span>
                    </div>
                    <div class="summary-row">
                        <span>Average Order:</span>
                        <span>$${(totalSpent / orderCount).toFixed(2)}</span>
                    </div>
                </div>
                <div class="order-history-actions">
                    <button class="secondary-btn" onclick="tcgStore.closeOrderHistoryModal()">Close</button>
                    <button class="primary-btn" onclick="tcgStore.closeOrderHistoryModal(); navigateTo('singles')">Continue Shopping</button>
                </div>
            </div>
        `;
    }

    getOrderStatusColor(status) {
        const colors = {
            'pending': 'var(--warning-color)',
            'processing': 'var(--info-color)',
            'shipped': 'var(--primary-color)',
            'delivered': 'var(--success-color)',
            'cancelled': 'var(--error-color)'
        };
        return colors[status] || 'var(--gray-500)';
    }

    getOrderStatusIcon(status) {
        const icons = {
            'pending': '⏳',
            'processing': '⚙️',
            'shipped': '🚚',
            'delivered': '✅',
            'cancelled': '❌'
        };
        return icons[status] || '📦';
    }

    setupOrderHistoryModalEventListeners() {
        // Close modal when clicking outside
        const overlay = document.querySelector('.order-history-modal-overlay');
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.closeOrderHistoryModal();
                }
            });
        }

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.getElementById('order-history-modal')) {
                this.closeOrderHistoryModal();
            }
        });
    }

    displayOrderHistoryModal() {
        const modal = document.getElementById('order-history-modal');
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    closeOrderHistoryModal() {
        const modal = document.getElementById('order-history-modal');
        if (modal) {
            modal.style.display = 'none';
            modal.remove();
            document.body.style.overflow = '';
        }
    }

    viewOrderDetails(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) return;

        this.createOrderDetailsModal(order);
    }

    createOrderDetailsModal(order) {
        // Remove existing modal if it exists
        const existingModal = document.getElementById('order-details-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.id = 'order-details-modal';
        modal.className = 'order-details-modal';
        modal.innerHTML = this.generateOrderDetailsModalHTML(order);
        document.body.appendChild(modal);

        // Add event listeners
        this.setupOrderDetailsModalEventListeners();
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    generateOrderDetailsModalHTML(order) {
        const orderDate = new Date(order.createdAt).toLocaleDateString();
        const statusColor = this.getOrderStatusColor(order.status);
        const statusIcon = this.getOrderStatusIcon(order.status);

        return `
            <div class="order-details-modal-overlay" onclick="tcgStore.closeOrderDetailsModal()">
                <div class="order-details-modal-content" onclick="event.stopPropagation()">
                    <div class="order-details-modal-header">
                        <h2 style="font-size: 1.5rem; font-weight: 700; color: var(--gray-900); margin: 0;">
                            Order #${order.id} Details
                        </h2>
                        <button class="order-details-close-btn" onclick="tcgStore.closeOrderDetailsModal()">×</button>
                    </div>
                    
                    <div class="order-details-modal-body">
                        <!-- Order Status -->
                        <div style="background: var(--gray-50); border-radius: var(--radius-lg); padding: var(--space-4); margin-bottom: var(--space-6);">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-3);">
                                <span style="background: ${statusColor}; color: white; padding: var(--space-2) var(--space-4); border-radius: var(--radius-full); font-size: 0.875rem; font-weight: 600; text-transform: uppercase; display: flex; align-items: center; gap: var(--space-2);">
                                    ${statusIcon} ${order.status}
                                </span>
                                <span style="font-size: 0.875rem; color: var(--gray-600);">Placed on ${orderDate}</span>
                            </div>
                            ${order.trackingNumber ? `
                                <div style="margin-bottom: var(--space-2);">
                                    <strong>Tracking Number:</strong> ${order.trackingNumber}
                                    <button onclick="tcgStore.trackOrder('${order.trackingNumber}')" style="margin-left: var(--space-2); padding: var(--space-1) var(--space-2); background: var(--primary-color); color: white; border: none; border-radius: var(--radius-sm); font-size: 0.75rem; cursor: pointer;">Track</button>
                                </div>
                            ` : ''}
                            ${order.estimatedDelivery ? `
                                <div style="font-size: 0.875rem; color: var(--gray-600);">
                                    <strong>Estimated Delivery:</strong> ${new Date(order.estimatedDelivery).toLocaleDateString()}
                                </div>
                            ` : ''}
                        </div>

                        <!-- Order Items -->
                        <div style="margin-bottom: var(--space-6);">
                            <h3 style="font-size: 1.125rem; font-weight: 600; color: var(--gray-900); margin-bottom: var(--space-4);">Items Ordered</h3>
                            <div class="order-details-items">
                                ${order.items.map(item => `
                                    <div style="display: flex; gap: var(--space-3); padding: var(--space-3); border: 1px solid var(--gray-200); border-radius: var(--radius-md); margin-bottom: var(--space-3);">
                                        <img src="${item.image}" alt="${item.name}" style="width: 60px; height: 84px; object-fit: contain; border-radius: var(--radius-md);">
                                        <div style="flex: 1;">
                                            <h4 style="font-size: 1rem; font-weight: 600; color: var(--gray-900); margin-bottom: var(--space-1);">${item.name}</h4>
                                            ${item.setCode && item.rarity ? `
                                                <div style="display: flex; gap: var(--space-2); margin-bottom: var(--space-1);">
                                                    <span style="background: var(--primary-color); color: white; padding: 2px 6px; border-radius: var(--radius-sm); font-size: 0.75rem; font-weight: 600;">${item.setCode}</span>
                                                    <span style="background: var(--secondary-color); color: var(--gray-900); padding: 2px 6px; border-radius: var(--radius-sm); font-size: 0.75rem; font-weight: 600;">${item.rarity}</span>
                                                </div>
                                            ` : ''}
                                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                                <span style="font-size: 0.875rem; color: var(--gray-600);">Quantity: ${item.quantity}</span>
                                                <span style="font-size: 1rem; font-weight: 600; color: var(--primary-color);">$${(item.price * item.quantity).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Order Summary -->
                        <div style="background: var(--gray-50); border-radius: var(--radius-lg); padding: var(--space-4);">
                            <h3 style="font-size: 1.125rem; font-weight: 600; color: var(--gray-900); margin-bottom: var(--space-4);">Order Summary</h3>
                            <div style="display: flex; flex-direction: column; gap: var(--space-2);">
                                <div style="display: flex; justify-content: space-between;">
                                    <span>Subtotal:</span>
                                    <span>$${order.subtotal.toFixed(2)}</span>
                                </div>
                                <div style="display: flex; justify-content: space-between;">
                                    <span>Shipping:</span>
                                    <span>${order.shipping === 0 ? 'FREE' : '$' + order.shipping.toFixed(2)}</span>
                                </div>
                                <div style="display: flex; justify-content: space-between;">
                                    <span>Tax (HST):</span>
                                    <span>$${order.tax.toFixed(2)}</span>
                                </div>
                                <hr style="margin: var(--space-2) 0; border: none; border-top: 1px solid var(--gray-300);">
                                <div style="display: flex; justify-content: space-between; font-size: 1.125rem; font-weight: 700;">
                                    <span>Total:</span>
                                    <span style="color: var(--primary-color);">$${order.total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="order-details-modal-footer">
                        <button class="secondary-btn" onclick="tcgStore.closeOrderDetailsModal()">Close</button>
                        ${order.status === 'delivered' ? `
                            <button class="primary-btn" onclick="tcgStore.reorderItems(${order.id})">Reorder Items</button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    setupOrderDetailsModalEventListeners() {
        // Close modal when clicking outside
        const overlay = document.querySelector('.order-details-modal-overlay');
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.closeOrderDetailsModal();
                }
            });
        }

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.getElementById('order-details-modal')) {
                this.closeOrderDetailsModal();
            }
        });
    }

    closeOrderDetailsModal() {
        const modal = document.getElementById('order-details-modal');
        if (modal) {
            modal.style.display = 'none';
            modal.remove();
            document.body.style.overflow = '';
        }
    }

    trackOrder(trackingNumber) {
        // Simulate tracking information
        const trackingInfo = this.generateTrackingInfo(trackingNumber);
        this.showTrackingModal(trackingNumber, trackingInfo);
    }

    generateTrackingInfo(trackingNumber) {
        return [
            {
                status: 'Order Placed',
                date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toLocaleDateString(),
                description: 'Your order has been received and is being processed.'
            },
            {
                status: 'Processing',
                date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toLocaleDateString(),
                description: 'Your items are being picked and packed.'
            },
            {
                status: 'Shipped',
                date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString(),
                description: 'Your package has been shipped and is on its way.'
            },
            {
                status: 'In Transit',
                date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toLocaleDateString(),
                description: 'Your package is in transit to the destination.'
            }
        ];
    }

    showTrackingModal(trackingNumber, trackingInfo) {
        const modal = document.createElement('div');
        modal.id = 'tracking-modal';
        modal.className = 'tracking-modal';
        modal.innerHTML = `
            <div class="tracking-modal-overlay" onclick="tcgStore.closeTrackingModal()">
                <div class="tracking-modal-content" onclick="event.stopPropagation()">
                    <div class="tracking-modal-header">
                        <h2 style="font-size: 1.5rem; font-weight: 700; color: var(--gray-900); margin: 0;">
                            Package Tracking
                        </h2>
                        <button onclick="tcgStore.closeTrackingModal()">×</button>
                    </div>
                    <div class="tracking-modal-body">
                        <div style="margin-bottom: var(--space-4);">
                            <strong>Tracking Number:</strong> ${trackingNumber}
                        </div>
                        <div class="tracking-timeline">
                            ${trackingInfo.map((event, index) => `
                                <div class="tracking-event ${index === trackingInfo.length - 1 ? 'current' : ''}">
                                    <div class="tracking-dot"></div>
                                    <div class="tracking-content">
                                        <div class="tracking-status">${event.status}</div>
                                        <div class="tracking-date">${event.date}</div>
                                        <div class="tracking-description">${event.description}</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="tracking-modal-footer">
                        <button class="secondary-btn" onclick="tcgStore.closeTrackingModal()">Close</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    closeTrackingModal() {
        const modal = document.getElementById('tracking-modal');
        if (modal) {
            modal.style.display = 'none';
            modal.remove();
            document.body.style.overflow = '';
        }
    }

    reorderItems(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) return;

        // Add all items from the order to cart
        let addedCount = 0;
        order.items.forEach(item => {
            this.addToCartWithDetails(
                item.name,
                item.price,
                item.image,
                item.setCode || '',
                item.rarity || '',
                item.setName || ''
            );
            addedCount += item.quantity;
        });

        this.closeOrderDetailsModal();
        this.closeOrderHistoryModal();
        this.showToast(`${addedCount} items from order #${orderId} added to cart!`, 'success');
    }

    // Enhanced Wishlist Functionality
    addToWishlist(cardName, price, image, cardId = null, setCode = '', rarity = '', setName = '') {
        if (!this.currentUser) {
            this.showToast('Please log in to add items to your wishlist.', 'error');
            this.openLoginModal();
            return;
        }

        // Initialize wishlist if it doesn't exist
        if (!this.currentUser.wishlist) {
            this.currentUser.wishlist = [];
        }

        // Create unique identifier for items with different sets/rarities
        const itemKey = `${cardName}_${setCode}_${rarity}`;
        const existingItem = this.currentUser.wishlist.find(item => item.itemKey === itemKey);
        
        if (existingItem) {
            this.showToast('Item is already in your wishlist!', 'info');
            return;
        }

        const wishlistItem = {
            id: Date.now() + Math.random(),
            cardId: cardId,
            name: cardName,
            price: parseFloat(price),
            image: image,
            setCode: setCode,
            rarity: rarity,
            setName: setName,
            itemKey: itemKey,
            addedAt: new Date().toISOString(),
            priceAlerts: true, // Enable price alerts by default
            targetPrice: null // User can set a target price for notifications
        };

        this.currentUser.wishlist.push(wishlistItem);
        this.saveUserData();

        // Track wishlist event
        if (this.dbService) {
            this.dbService.trackEvent('wishlist_add', {
                userId: this.currentUser.id,
                cardName: cardName,
                cardId: cardId,
                price: price
            });
        }

        const displayName = setCode && rarity ? 
            `${cardName} (${setCode} - ${rarity})` : cardName;
        this.showToast(`${displayName} added to wishlist!`, 'success');
        
        // Update wishlist UI if currently viewing wishlist
        this.updateWishlistUI();
    }

    removeFromWishlist(itemId) {
        if (!this.currentUser || !this.currentUser.wishlist) return;

        const item = this.currentUser.wishlist.find(item => item.id === itemId);
        if (!item) return;

        this.currentUser.wishlist = this.currentUser.wishlist.filter(item => item.id !== itemId);
        this.saveUserData();

        // Track wishlist removal event
        if (this.dbService) {
            this.dbService.trackEvent('wishlist_remove', {
                userId: this.currentUser.id,
                cardName: item.name,
                cardId: item.cardId
            });
        }

        this.showToast('Item removed from wishlist.', 'info');
        this.updateWishlistUI();
    }

    moveWishlistItemToCart(itemId) {
        if (!this.currentUser || !this.currentUser.wishlist) return;

        const item = this.currentUser.wishlist.find(item => item.id === itemId);
        if (!item) return;

        // Add to cart with all details
        this.addToCartWithDetails(
            item.name, 
            item.price, 
            item.image, 
            item.setCode, 
            item.rarity, 
            item.setName
        );

        // Remove from wishlist
        this.removeFromWishlist(itemId);
    }

    updateWishlistItemPrice(itemId, newPrice) {
        if (!this.currentUser || !this.currentUser.wishlist) return;

        const item = this.currentUser.wishlist.find(item => item.id === itemId);
        if (!item) return;

        const oldPrice = item.price;
        item.price = parseFloat(newPrice);
        item.lastPriceUpdate = new Date().toISOString();

        // Check if price dropped below target price
        if (item.targetPrice && newPrice <= item.targetPrice && item.priceAlerts) {
            this.showToast(`Price Alert: ${item.name} is now $${newPrice} (Target: $${item.targetPrice})!`, 'success', 5000);
        }

        this.saveUserData();
        this.updateWishlistUI();
    }

    setWishlistItemTargetPrice(itemId, targetPrice) {
        if (!this.currentUser || !this.currentUser.wishlist) return;

        const item = this.currentUser.wishlist.find(item => item.id === itemId);
        if (!item) return;

        item.targetPrice = targetPrice ? parseFloat(targetPrice) : null;
        this.saveUserData();
        this.updateWishlistUI();
        
        if (targetPrice) {
            this.showToast(`Price alert set for ${item.name} at $${targetPrice}`, 'success');
        } else {
            this.showToast(`Price alert removed for ${item.name}`, 'info');
        }
    }

    toggleWishlistPriceAlerts(itemId) {
        if (!this.currentUser || !this.currentUser.wishlist) return;

        const item = this.currentUser.wishlist.find(item => item.id === itemId);
        if (!item) return;

        item.priceAlerts = !item.priceAlerts;
        this.saveUserData();
        this.updateWishlistUI();
        
        const status = item.priceAlerts ? 'enabled' : 'disabled';
        this.showToast(`Price alerts ${status} for ${item.name}`, 'info');
    }

    openWishlistModal() {
        if (!this.currentUser) {
            this.showToast('Please log in to view your wishlist.', 'error');
            this.openLoginModal();
            return;
        }

        this.createWishlistModal();
        this.displayWishlistModal();
    }

    createWishlistModal() {
        // Remove existing modal if it exists
        const existingModal = document.getElementById('wishlist-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.id = 'wishlist-modal';
        modal.className = 'wishlist-modal';
        modal.innerHTML = this.generateWishlistModalHTML();
        document.body.appendChild(modal);

        // Add event listeners
        this.setupWishlistModalEventListeners();
    }

    generateWishlistModalHTML() {
        const wishlist = this.currentUser?.wishlist || [];
        const totalItems = wishlist.length;
        const totalValue = wishlist.reduce((sum, item) => sum + item.price, 0);

        return `
            <div class="wishlist-modal-overlay" onclick="tcgStore.closeWishlistModal()">
                <div class="wishlist-modal-content" onclick="event.stopPropagation()">
                    <div class="wishlist-modal-header">
                        <h2 style="font-size: 1.5rem; font-weight: 700; color: var(--gray-900); margin: 0;">
                            <i class="fas fa-heart" style="color: var(--error-color); margin-right: var(--space-2);"></i>
                            My Wishlist (${totalItems} items)
                        </h2>
                        <button class="wishlist-close-btn" onclick="tcgStore.closeWishlistModal()">×</button>
                    </div>
                    
                    <div class="wishlist-modal-body">
                        ${wishlist.length === 0 ? this.generateEmptyWishlistHTML() : this.generateWishlistItemsHTML()}
                    </div>
                    
                    ${wishlist.length > 0 ? this.generateWishlistFooterHTML(totalValue) : ''}
                </div>
            </div>
        `;
    }

    generateEmptyWishlistHTML() {
        return `
            <div class="empty-wishlist">
                <div style="text-align: center; padding: var(--space-12) var(--space-6);">
                    <div style="font-size: 4rem; margin-bottom: var(--space-4); opacity: 0.5;">💝</div>
                    <h3 style="font-size: 1.25rem; font-weight: 600; color: var(--gray-900); margin-bottom: var(--space-3);">Your wishlist is empty</h3>
                    <p style="color: var(--gray-600); margin-bottom: var(--space-6);">Save cards you want to purchase later and get notified when prices drop!</p>
                    <button class="primary-btn" onclick="tcgStore.closeWishlistModal(); navigateTo('singles')">
                        Browse Singles
                    </button>
                </div>
            </div>
        `;
    }

    generateWishlistItemsHTML() {
        const wishlist = this.currentUser.wishlist || [];
        
        return `
            <div class="wishlist-items">
                ${wishlist.map(item => this.generateWishlistItemHTML(item)).join('')}
            </div>
        `;
    }

    generateWishlistItemHTML(item) {
        const hasSetInfo = item.setCode && item.rarity;
        const addedDate = new Date(item.addedAt).toLocaleDateString();
        const hasTargetPrice = item.targetPrice && item.targetPrice > 0;
        const isPriceBelow = hasTargetPrice && item.price <= item.targetPrice;
        
        return `
            <div class="wishlist-item" data-item-id="${item.id}">
                <div class="wishlist-item-image">
                    <img src="${item.image}" alt="${item.name}" style="width: 60px; height: 84px; object-fit: contain; border-radius: var(--radius-md); cursor: pointer;" onclick="tcgStore.navigateToProduct({id: '${item.cardId || item.name}'})">
                </div>
                <div class="wishlist-item-details">
                    <h4 style="font-size: 1rem; font-weight: 600; color: var(--gray-900); margin-bottom: var(--space-1); line-height: 1.3; cursor: pointer;" onclick="tcgStore.navigateToProduct({id: '${item.cardId || item.name}'})">${item.name}</h4>
                    ${hasSetInfo ? `
                        <div style="display: flex; gap: var(--space-2); margin-bottom: var(--space-1);">
                            <span style="background: var(--primary-color); color: white; padding: 2px 6px; border-radius: var(--radius-sm); font-size: 0.75rem; font-weight: 600;">${item.setCode}</span>
                            <span style="background: var(--secondary-color); color: var(--gray-900); padding: 2px 6px; border-radius: var(--radius-sm); font-size: 0.75rem; font-weight: 600;">${item.rarity}</span>
                        </div>
                    ` : ''}
                    <div style="display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-2);">
                        <span style="font-size: 1.125rem; font-weight: 700; color: var(--primary-color);">$${item.price.toFixed(2)}</span>
                        ${isPriceBelow ? '<span style="background: var(--success-color); color: white; padding: 2px 6px; border-radius: var(--radius-sm); font-size: 0.75rem; font-weight: 600;">TARGET REACHED!</span>' : ''}
                    </div>
                    <p style="font-size: 0.75rem; color: var(--gray-500); margin-bottom: var(--space-2);">Added ${addedDate}</p>
                    
                    <!-- Price Alert Section -->
                    <div style="margin-bottom: var(--space-3);">
                        <div style="display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-1);">
                            <label style="font-size: 0.875rem; color: var(--gray-700);">Price Alert:</label>
                            <input type="checkbox" ${item.priceAlerts ? 'checked' : ''} onchange="tcgStore.toggleWishlistPriceAlerts(${item.id})" style="margin: 0;">
                        </div>
                        <div style="display: flex; align-items: center; gap: var(--space-2);">
                            <input type="number" 
                                   placeholder="Target price" 
                                   value="${item.targetPrice || ''}" 
                                   step="0.01" 
                                   min="0" 
                                   style="width: 100px; padding: 4px 8px; border: 1px solid var(--gray-300); border-radius: var(--radius-sm); font-size: 0.875rem;"
                                   onchange="tcgStore.setWishlistItemTargetPrice(${item.id}, this.value)">
                            <span style="font-size: 0.75rem; color: var(--gray-500);">Alert when price drops to this amount</span>
                        </div>
                    </div>
                    
                    <div class="wishlist-item-controls">
                        <button class="primary-btn" style="padding: var(--space-2) var(--space-3); font-size: 0.875rem;" onclick="tcgStore.moveWishlistItemToCart(${item.id})">
                            Add to Cart
                        </button>
                        <button class="secondary-btn" style="padding: var(--space-2) var(--space-3); font-size: 0.875rem;" onclick="tcgStore.removeFromWishlist(${item.id})">
                            Remove
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    generateWishlistFooterHTML(totalValue) {
        const wishlist = this.currentUser.wishlist || [];
        const itemsWithAlerts = wishlist.filter(item => item.priceAlerts).length;
        
        return `
            <div class="wishlist-modal-footer">
                <div class="wishlist-summary">
                    <div class="summary-row">
                        <span>Total Items:</span>
                        <span>${wishlist.length}</span>
                    </div>
                    <div class="summary-row">
                        <span>Total Value:</span>
                        <span>$${totalValue.toFixed(2)}</span>
                    </div>
                    <div class="summary-row">
                        <span>Price Alerts Active:</span>
                        <span>${itemsWithAlerts}</span>
                    </div>
                </div>
                <div class="wishlist-actions">
                    <button class="secondary-btn" onclick="tcgStore.closeWishlistModal()">Close</button>
                    <button class="primary-btn" onclick="tcgStore.addAllWishlistToCart()">Add All to Cart</button>
                </div>
            </div>
        `;
    }

    setupWishlistModalEventListeners() {
        // Close modal when clicking outside
        const overlay = document.querySelector('.wishlist-modal-overlay');
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.closeWishlistModal();
                }
            });
        }

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.getElementById('wishlist-modal')) {
                this.closeWishlistModal();
            }
        });
    }

    displayWishlistModal() {
        const modal = document.getElementById('wishlist-modal');
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    closeWishlistModal() {
        const modal = document.getElementById('wishlist-modal');
        if (modal) {
            modal.style.display = 'none';
            modal.remove();
            document.body.style.overflow = '';
        }
    }

    addAllWishlistToCart() {
        if (!this.currentUser || !this.currentUser.wishlist || this.currentUser.wishlist.length === 0) {
            this.showToast('Your wishlist is empty.', 'info');
            return;
        }

        let addedCount = 0;
        const wishlistCopy = [...this.currentUser.wishlist];
        
        wishlistCopy.forEach(item => {
            this.addToCartWithDetails(
                item.name, 
                item.price, 
                item.image, 
                item.setCode, 
                item.rarity, 
                item.setName
            );
            addedCount++;
        });

        // Clear wishlist after adding all to cart
        this.currentUser.wishlist = [];
        this.saveUserData();
        this.updateWishlistUI();

        this.showToast(`${addedCount} items added to cart from wishlist!`, 'success');
        this.closeWishlistModal();
    }

    updateWishlistUI() {
        // Update wishlist badge/counter if it exists
        const wishlistBadge = document.querySelector('.wishlist-badge');
        if (wishlistBadge && this.currentUser) {
            const wishlistCount = this.currentUser.wishlist ? this.currentUser.wishlist.length : 0;
            wishlistBadge.textContent = wishlistCount;
            wishlistBadge.style.display = wishlistCount > 0 ? 'block' : 'none';
        }

        // Update wishlist modal content if it's open
        const wishlistModal = document.getElementById('wishlist-modal');
        if (wishlistModal && wishlistModal.style.display !== 'none') {
            this.updateWishlistModalContent();
        }
    }

    updateWishlistModalContent() {
        const wishlistModal = document.getElementById('wishlist-modal');
        if (!wishlistModal) return;

        const modalContent = wishlistModal.querySelector('.wishlist-modal-content');
        if (modalContent) {
            modalContent.innerHTML = this.generateWishlistModalHTML().match(/<div class="wishlist-modal-content"[^>]*>([\s\S]*)<\/div>$/)[1];
            this.setupWishlistModalEventListeners();
        }
    }

    saveUserData() {
        if (!this.currentUser) return;

        // Update user in localStorage
        localStorage.setItem('tcg-user', JSON.stringify(this.currentUser));

        // Update user in users database if using database service
        if (this.dbService) {
            const users = JSON.parse(localStorage.getItem('tcg-users') || '{}');
            users[this.currentUser.email] = this.currentUser;
            localStorage.setItem('tcg-users', JSON.stringify(users));
        }
    }

    isInWishlist(cardName, setCode = '', rarity = '') {
        if (!this.currentUser || !this.currentUser.wishlist) return false;
        
        const itemKey = `${cardName}_${setCode}_${rarity}`;
        return this.currentUser.wishlist.some(item => item.itemKey === itemKey);
    }

    toggleWishlist(cardName, price, image, cardId = null, setCode = '', rarity = '', setName = '') {
        if (!this.currentUser) {
            this.showToast('Please log in to manage your wishlist.', 'error');
            this.openLoginModal();
            return;
        }

        const itemKey = `${cardName}_${setCode}_${rarity}`;
        const existingItem = this.currentUser.wishlist?.find(item => item.itemKey === itemKey);
        
        if (existingItem) {
            // Remove from wishlist
            this.removeFromWishlist(existingItem.id);
        } else {
            // Add to wishlist
            this.addToWishlist(cardName, price, image, cardId, setCode, rarity, setName);
        }

        // Refresh the cards display to update wishlist icons
        this.refreshCardsDisplay();
    }

    refreshCardsDisplay() {
        // Refresh the current cards display to update wishlist icons
        const container = document.querySelector('.modern-card-grid, #meta-cards-grid, #cards-grid');
        if (container && this.filteredCards.length > 0) {
            this.displayCards(container);
        }
    }

    initializeToastContainer() {
        if (!document.querySelector('.toast-container')) {
            const toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container';
            document.body.appendChild(toastContainer);
        }
    }

    showToast(message, type = 'info', duration = 3000) {
        const toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span>${this.getToastIcon(type)}</span>
                <span>${message}</span>
            </div>
        `;

        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease-out forwards';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, duration);
    }

    getToastIcon(type) {
        const icons = {
            success: '<i class="fas fa-check-circle"></i>',
            error: '<i class="fas fa-times-circle"></i>',
            warning: '<i class="fas fa-exclamation-triangle"></i>',
            info: '<i class="fas fa-info-circle"></i>'
        };
        return icons[type] || icons.info;
    }

    // Search Dropdown Methods
    async handleSearchDropdown() {
        const searchInput = document.querySelector('.search-input');
        if (!searchInput) return;

        const query = searchInput.value.trim();
        const dropdown = document.getElementById('search-dropdown');
        
        if (query.length < 2) {
            this.hideSearchDropdown();
            return;
        }

        this.showSearchDropdown();
        this.showSearchLoading();

        try {
            const searchResults = await this.searchCards(query);
            const limitedResults = searchResults.slice(0, 8); // Show max 8 results
            const formattedResults = await Promise.all(limitedResults.map(card => this.formatCardForDisplay(card)));
            
            this.displaySearchResults(formattedResults, query);
        } catch (error) {
            console.error('Search dropdown error:', error);
            this.showSearchError();
        }
    }

    handleSearchFocus() {
        const searchInput = document.querySelector('.search-input');
        if (searchInput && searchInput.value.trim().length >= 2) {
            this.handleSearchDropdown();
        }
    }

    handleSearchKeydown(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const query = e.target.value.trim();
            if (query.length >= 2) {
                this.hideSearchDropdown();
                // Navigate to singles page with search query
                navigateTo('singles', `?search=${encodeURIComponent(query)}`);
            }
        } else if (e.key === 'Escape') {
            this.hideSearchDropdown();
        }
    }

    showSearchDropdown() {
        const dropdown = document.getElementById('search-dropdown');
        if (dropdown) {
            dropdown.style.display = 'block';
        }
    }

    hideSearchDropdown() {
        const dropdown = document.getElementById('search-dropdown');
        if (dropdown) {
            dropdown.style.display = 'none';
        }
    }

    showSearchLoading() {
        const resultsContainer = document.getElementById('search-results');
        if (resultsContainer) {
            resultsContainer.innerHTML = '<div class="search-loading">Searching cards...</div>';
        }
    }

    showSearchError() {
        const resultsContainer = document.getElementById('search-results');
        if (resultsContainer) {
            resultsContainer.innerHTML = '<div class="search-no-results">Search failed. Please try again.</div>';
        }
    }

    displaySearchResults(results, query) {
        const resultsContainer = document.getElementById('search-results');
        if (!resultsContainer) return;

        if (results.length === 0) {
            resultsContainer.innerHTML = '<div class="search-no-results">No cards found matching your search.</div>';
            return;
        }

        const resultsHTML = results.map(card => this.generateSearchResultHTML(card)).join('');
        const seeAllHTML = `
            <div class="search-see-all">
                <a href="#" class="search-see-all-btn" onclick="tcgStore.hideSearchDropdown(); navigateTo('singles', '?search=${encodeURIComponent(query)}')">
                    See all results for "${query}"
                </a>
            </div>
        `;

        resultsContainer.innerHTML = resultsHTML + seeAllHTML;
    }

    generateSearchResultHTML(card) {
        return `
            <a href="#" class="search-result-item" onclick="tcgStore.hideSearchDropdown(); tcgStore.navigateToProduct(${JSON.stringify(card).replace(/"/g, '&quot;')})">
                <img src="${card.imageSmall}" alt="${card.name}" class="search-result-image" loading="lazy">
                <div class="search-result-info">
                    <div class="search-result-name">${card.name}</div>
                    <div class="search-result-type">${card.type}</div>
                    <div class="search-result-price">$${card.price}</div>
                </div>
            </a>
        `;
    }

    ensureString(value) {
        // Convert any value to a safe string, handling objects, null, undefined, etc.
        if (value === null || value === undefined) {
            return '';
        }
        if (typeof value === 'object') {
            // If it's an object, try to extract a meaningful string
            if (value.name) return String(value.name);
            if (value.toString && typeof value.toString === 'function') {
                const str = value.toString();
                return str === '[object Object]' ? '' : str;
            }
            return '';
        }
        return String(value);
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Initialize the store when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.tcgStore = new ModernTCGStore();
});

// Add slideOutRight animation
const style = document.createElement('style');
style.textContent = `
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
document.head.appendChild(style);
