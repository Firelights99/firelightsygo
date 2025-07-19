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
        
        // Account system
        this.currentUser = JSON.parse(localStorage.getItem('tcg-user') || 'null');
        this.users = JSON.parse(localStorage.getItem('tcg-users') || '{}');
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
            searchInput.addEventListener('input', this.debounce(this.handleSearch.bind(this), 300));
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleSearch();
                }
            });
        }

        // Cart functionality
        const cartBtn = document.querySelector('.action-btn[onclick*="cart"]');
        if (cartBtn) {
            cartBtn.addEventListener('click', this.openCart.bind(this));
        }

        // Filter functionality
        this.setupFilterListeners();

        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
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

        cardDiv.innerHTML = `
            <div class="card-image-container">
                <img src="${card.image}" alt="${card.name}" class="card-image" loading="lazy">
                ${isHot ? '<div class="card-badge">HOT</div>' : ''}
            </div>
            <div class="card-info">
                <h3 class="card-name">${card.name}</h3>
                <p class="card-type">${card.type}</p>
                <div class="price-section">
                    <span class="card-price">$${card.price}</span>
                    <span class="price-trend ${card.priceChange.direction}">
                        ${priceChangeSymbol} ${priceChangeText}
                    </span>
                </div>
                <button class="add-to-cart-btn" onclick="event.stopPropagation(); tcgStore.addToCart('${card.name}', ${card.price}, '${card.image}')">
                    Add to Cart
                </button>
            </div>
        `;
        
        return cardDiv;
    }

    navigateToProduct(card) {
        // Use the SPA router instead of direct navigation
        if (window.appRouter) {
            window.appRouter.loadPage('product', true, `?id=${card.id}`);
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
        const existingItem = this.cart.find(item => item.name === cardName);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                name: cardName,
                price: parseFloat(price),
                image: image,
                quantity: 1,
                id: Date.now()
            });
        }
        
        this.saveCart();
        this.updateCartBadge();
        this.showToast(`${cardName} added to cart!`, 'success');
    }

    removeFromCart(itemId) {
        this.cart = this.cart.filter(item => item.id !== itemId);
        this.saveCart();
        this.updateCartBadge();
        this.showToast('Item removed from cart', 'info');
        
        // Live update the cart modal if it's open
        const cartModal = document.getElementById('cart-modal');
        if (cartModal && cartModal.style.display !== 'none') {
            this.updateCartModalContent();
        }
    }

    updateCartQuantity(itemId, newQuantity) {
        const item = this.cart.find(item => item.id === itemId);
        if (item) {
            if (newQuantity <= 0) {
                this.removeFromCart(itemId);
            } else {
                item.quantity = newQuantity;
                this.saveCart();
                this.updateCartBadge();
                
                // Live update the cart modal if it's open
                const cartModal = document.getElementById('cart-modal');
                if (cartModal && cartModal.style.display !== 'none') {
                    this.updateCartModalContent();
                }
            }
        }
    }

    updateCartModalContent() {
        const cartModal = document.getElementById('cart-modal');
        if (!cartModal) return;

        const modalContent = cartModal.querySelector('.cart-modal-content');
        if (modalContent) {
            modalContent.innerHTML = this.generateCartModalHTML().match(/<div class="cart-modal-content"[^>]*>([\s\S]*)<\/div>$/)[1];
        }
    }

    addToCartWithDetails(cardName, price, image, setCode = '', rarity = '', setName = '') {
        // Create a unique identifier for items with different sets/rarities
        const itemKey = `${cardName}_${setCode}_${rarity}`;
        const existingItem = this.cart.find(item => item.itemKey === itemKey);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                name: cardName,
                price: parseFloat(price),
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
        const itemTotal = (item.price * item.quantity).toFixed(2);
        const hasSetInfo = item.setCode && item.rarity;
        
        return `
            <div class="cart-item" data-item-id="${item.id}">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}" style="width: 60px; height: 84px; object-fit: contain; border-radius: var(--radius-md);">
                </div>
                <div class="cart-item-details">
                    <h4 style="font-size: 1rem; font-weight: 600; color: var(--gray-900); margin-bottom: var(--space-1); line-height: 1.3;">${item.name}</h4>
                    ${hasSetInfo ? `
                        <div style="display: flex; gap: var(--space-2); margin-bottom: var(--space-1);">
                            <span style="background: var(--primary-color); color: white; padding: 2px 6px; border-radius: var(--radius-sm); font-size: 0.75rem; font-weight: 600;">${item.setCode}</span>
                            <span style="background: var(--secondary-color); color: var(--gray-900); padding: 2px 6px; border-radius: var(--radius-sm); font-size: 0.75rem; font-weight: 600;">${item.rarity}</span>
                        </div>
                    ` : ''}
                    <p style="font-size: 0.875rem; color: var(--gray-600); margin-bottom: var(--space-2);">$${item.price.toFixed(2)} each</p>
                    <div class="cart-item-controls">
                        <div class="quantity-controls">
                            <button class="quantity-btn" onclick="tcgStore.updateCartQuantity(${item.id}, ${item.quantity - 1})">-</button>
                            <span class="quantity-display">${item.quantity}</span>
                            <button class="quantity-btn" onclick="tcgStore.updateCartQuantity(${item.id}, ${item.quantity + 1})">+</button>
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
        this.showToast('Redirecting to secure checkout...', 'info');
        // In a real implementation, this would redirect to a payment processor
        setTimeout(() => {
            this.showToast('Checkout functionality coming soon!', 'info');
        }, 1500);
    }

    clearCart() {
        this.cart = [];
        this.saveCart();
        this.updateCartBadge();
        this.closeCart();
        this.showToast('Cart cleared!', 'info');
    }

    // Account System Methods
    openLoginModal() {
        this.createAccountModal('login');
    }

    openRegisterModal() {
        this.createAccountModal('register');
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

    registerUser(data) {
        // Validate passwords match
        if (data.password !== data.confirmPassword) {
            this.showToast('Passwords do not match!', 'error');
            return;
        }

        // Check if user already exists
        if (this.users[data.email]) {
            this.showToast('An account with this email already exists!', 'error');
            return;
        }

        // Create new user
        const newUser = {
            id: Date.now(),
            email: data.email,
            password: data.password, // In real app, this would be hashed
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone || '',
            createdAt: new Date().toISOString(),
            orders: [],
            wishlist: [],
            addresses: []
        };

        // Save user
        this.users[data.email] = newUser;
        localStorage.setItem('tcg-users', JSON.stringify(this.users));

        // Auto-login the new user
        this.currentUser = newUser;
        localStorage.setItem('tcg-user', JSON.stringify(newUser));

        this.closeAccountModal();
        this.updateAccountUI();
        this.showToast(`Welcome to Firelight Duel Academy, ${newUser.firstName}!`, 'success');
    }

    loginUser(data) {
        const user = this.users[data.email];
        
        if (!user || user.password !== data.password) {
            this.showToast('Invalid email or password!', 'error');
            return;
        }

        // Login successful
        this.currentUser = user;
        localStorage.setItem('tcg-user', JSON.stringify(user));

        this.closeAccountModal();
        this.updateAccountUI();
        this.showToast(`Welcome back, ${user.firstName}!`, 'success');
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
                accountBtn.innerHTML = `👤 ${this.currentUser.firstName}`;
                accountBtn.onclick = () => navigateTo('account');
            } else {
                accountBtn.innerHTML = '👤 Account';
                accountBtn.onclick = () => this.openLoginModal();
            }
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
            shippingAddress: null,
            trackingNumber: null
        };

        this.orders.push(order);
        localStorage.setItem('tcg-orders', JSON.stringify(this.orders));

        return order;
    }

    addToWishlist(cardName, price, image) {
        if (!this.currentUser) {
            this.showToast('Please log in to add items to your wishlist.', 'error');
            return;
        }

        const existingItem = this.currentUser.wishlist.find(item => item.name === cardName);
        if (existingItem) {
            this.showToast('Item is already in your wishlist!', 'info');
            return;
        }

        this.currentUser.wishlist.push({
            name: cardName,
            price: parseFloat(price),
            image: image,
            addedAt: new Date().toISOString()
        });

        // Update user in storage
        this.users[this.currentUser.email] = this.currentUser;
        localStorage.setItem('tcg-users', JSON.stringify(this.users));
        localStorage.setItem('tcg-user', JSON.stringify(this.currentUser));

        this.showToast(`${cardName} added to wishlist!`, 'success');
    }

    removeFromWishlist(cardName) {
        if (!this.currentUser) return;

        this.currentUser.wishlist = this.currentUser.wishlist.filter(item => item.name !== cardName);

        // Update user in storage
        this.users[this.currentUser.email] = this.currentUser;
        localStorage.setItem('tcg-users', JSON.stringify(this.users));
        localStorage.setItem('tcg-user', JSON.stringify(this.currentUser));

        this.showToast('Item removed from wishlist.', 'info');
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
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
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
