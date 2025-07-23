/**
 * Modern TCG Store - Interactive JavaScript Framework
 * Handles all modern interactions, animations, and API integration
 */

class ModernTCGStore {
    constructor() {
        this.apiBaseURL = 'https://db.ygoprodeck.com/api/v7';
        this.cache = new Map();
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
        
        // Force clear corrupted cart data and start fresh
        this.clearCorruptedCartData();
        this.cart = this.loadAndCleanCart();
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

    clearCorruptedCartData() {
        try {
            // Force clear any existing cart data to start fresh
            localStorage.removeItem('tcg-cart');
            console.log('Cart data cleared for fresh start');
        } catch (error) {
            console.error('Error clearing cart data:', error);
        }
    }

    loadAndCleanCart() {
        try {
            const cartData = JSON.parse(localStorage.getItem('tcg-cart') || '[]');
            
            // Clean and validate each cart item
            return cartData.map(item => {
                return {
                    id: item.id || Date.now() + Math.random(),
                    name: String(item.name || 'Unknown Item'),
                    price: parseFloat(item.price) || 0,
                    image: String(item.image || 'https://images.ygoprodeck.com/images/cards/back.jpg'),
                    quantity: parseInt(item.quantity) || 1,
                    setCode: item.setCode || '',
                    rarity: item.rarity || '',
                    setName: item.setName || '',
                    itemKey: item.itemKey || `${item.name}_${item.setCode || ''}_${item.rarity || ''}`
                };
            }).filter(item => item.name !== 'Unknown Item' || item.price > 0); // Remove completely invalid items
        } catch (error) {
            console.error('Error loading cart data:', error);
            // Clear corrupted cart data
            localStorage.removeItem('tcg-cart');
            return [];
        }
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

        const priceData = await this.getCardPrice(card);

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
            price: priceData ? priceData.price.toFixed(2) : 'N/A',
            priceData: priceData,
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

    async getCardPrice(card, setCode = null, rarity = null) {
        // Use the real pricing service
        if (window.yugiohPricingService) {
            try {
                const priceData = await window.yugiohPricingService.getCardPrice(card, setCode, rarity);
                if (priceData && priceData.price > 0) {
                    return priceData;
                }
            } catch (error) {
                console.error('Error fetching price from pricing service:', error);
            }
        }
        
        // Fallback: try to get price directly from YGOPRODeck API if pricing service fails
        try {
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
                    const cadPrice = (usdPrice * 1.35).toFixed(2);
                    return {
                        price: parseFloat(cadPrice),
                        currency: 'CAD',
                        source: 'YGOPRODeck',
                        originalPrice: usdPrice,
                        originalCurrency: 'USD'
                    };
                }
            }
        } catch (error) {
            console.error('Error getting fallback price:', error);
        }
        
        // If no real price available, return null instead of mock price
        console.warn(`No real price available for card: ${card.name || card.id}`);
        return null;
    }

    getMockPriceChange() {
        // Generate realistic price change based on actual market trends
        const changes = [
            { direction: 'up', amount: (Math.random() * 5 + 0.5).toFixed(2) },
            { direction: 'down', amount: (Math.random() * 3 + 0.25).toFixed(2) },
            { direction: 'stable', amount: '0.00' }
        ];
        
        // Weight towards stable prices (60% stable, 25% up, 15% down)
        const rand = Math.random();
        if (rand < 0.6) return changes[2]; // stable
        if (rand < 0.85) return changes[0]; // up
        return changes[1]; // down
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

        // Get card sets and rarity information
        const cardSets = card.sets || [];
        const hasMultipleSets = cardSets.length > 1;
        const defaultRarity = cardSets.length > 0 ? (cardSets[0].set_rarity || 'Common') : 'Common';
        const rarityColor = this.getRarityColor(defaultRarity);

        // Generate unique ID for this card element
        const cardElementId = `card-${safeId}-${Date.now()}`;

        cardDiv.innerHTML = `
            <div class="card-image-container">
                <img src="${safeImage}" alt="${safeName}" class="card-image" loading="lazy">
                ${isHot ? '<div class="card-badge">HOT</div>' : ''}
            </div>
            <div class="card-info">
                <h3 class="card-name">${safeName}</h3>
                <div class="card-type-rarity">
                    <span class="card-type-badge" style="background: ${this.getCardTypeColor(card.type)}; color: white; padding: 2px 6px; border-radius: var(--radius-sm); font-size: 0.75rem; font-weight: 600; margin-right: var(--space-2);">${card.type}</span>
                    <span class="rarity-badge" id="rarity-badge-${cardElementId}" style="background: ${rarityColor}; color: white; padding: 2px 6px; border-radius: var(--radius-sm); font-size: 0.75rem; font-weight: 600;">${defaultRarity}</span>
                </div>
                ${hasMultipleSets ? `
                    <div class="set-selector-mini" style="margin: var(--space-2) 0;">
                        <select class="set-selector-dropdown" onchange="tcgStore.updateCardRarityFromSet(this, '${cardElementId}', '${safeName}', '${safeImage}')" style="width: 100%; padding: 4px 6px; border: 1px solid var(--gray-300); border-radius: var(--radius-sm); font-size: 0.75rem; background: white;">
                            ${cardSets.map((set, index) => `
                                <option value="${set.set_code || ''}" data-rarity="${set.set_rarity || 'Common'}" data-price="${this.calculateSetPrice(card.price, set.set_rarity)}" ${index === 0 ? 'selected' : ''}>
                                    ${set.set_name || set.set_code || 'Unknown Set'} (${set.set_rarity || 'Common'})
                                </option>
                            `).join('')}
                        </select>
                    </div>
                ` : ''}
                <div class="price-section">
                    <span class="card-price" id="card-price-${cardElementId}">$${card.price}</span>
                    <span class="price-trend ${card.priceChange.direction}">
                        ${priceChangeSymbol} ${priceChangeText}
                    </span>
                </div>
                <div class="card-actions">
                    <button class="add-to-cart-btn" id="add-to-cart-${cardElementId}" onclick="event.stopPropagation(); tcgStore.addToCartFromCard('${cardElementId}', '${safeName}', ${safePrice}, '${safeImage}', '${defaultRarity}')">
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
        // Ensure we have a valid card object with an ID
        if (!card || (!card.id && !card.name)) {
            console.error('Invalid card data for navigation:', card);
            return;
        }
        
        // Use card ID if available, otherwise use card name as fallback
        const cardIdentifier = card.id || card.name;
        
        // Use the global navigation function which is more reliable
        if (typeof navigateTo === 'function') {
            navigateTo('product', `?id=${cardIdentifier}`);
        } else if (window.navigateTo && typeof window.navigateTo === 'function') {
            window.navigateTo('product', `?id=${cardIdentifier}`);
        } else if (window.appRouter && typeof window.appRouter.loadPage === 'function') {
            window.appRouter.loadPage('product', true, `?id=${cardIdentifier}`);
        } else {
            // Final fallback - direct navigation
            console.warn('No navigation method available, using direct navigation');
            window.location.href = `#page=product&id=${cardIdentifier}`;
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
        const fullModalHTML = this.generateCartModalHTML();
        const match = fullModalHTML.match(/<div class="cart-modal-content"[^>]*>([\s\S]*)<\/div>\s*<\/div>\s*$/);
        
        if (match && match[1]) {
            // Replace the modal content
            modalContent.innerHTML = match[1];
            
            // Re-setup event listeners for the new content
            this.setupCartModalEventListeners();
        } else {
            // Fallback: recreate the entire modal
            this.closeCart();
            this.openCart();
        }
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

        // Close cart and open checkout modal (supports both guest and logged-in users)
        this.closeCart();
        this.openCheckoutModal();
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
        
        // Show custom confirmation modal
        this.showClearCartConfirmation();
    }

    showClearCartConfirmation() {
        const modal = document.createElement('div');
        modal.id = 'clear-cart-confirmation';
        modal.className = 'confirmation-modal';
        modal.innerHTML = `
            <div class="confirmation-modal-overlay" onclick="tcgStore.closeClearCartConfirmation()">
                <div class="confirmation-modal-content" onclick="event.stopPropagation()">
                    <div class="confirmation-modal-header">
                        <div class="confirmation-icon">
                            <i class="fas fa-exclamation-triangle" style="color: var(--warning-color); font-size: 3rem;"></i>
                        </div>
                        <h3 style="font-size: 1.5rem; font-weight: 700; color: var(--gray-900); margin: var(--space-4) 0 var(--space-2) 0; text-align: center;">
                            Clear Shopping Cart?
                        </h3>
                        <p style="color: var(--gray-600); text-align: center; margin-bottom: var(--space-6); line-height: 1.5;">
                            This will remove all ${this.cart.length} item${this.cart.length !== 1 ? 's' : ''} from your cart. This action cannot be undone.
                        </p>
                    </div>
                    
                    <div class="confirmation-modal-actions">
                        <button class="secondary-btn" onclick="tcgStore.closeClearCartConfirmation()" style="flex: 1;">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                        <button class="danger-btn" onclick="tcgStore.confirmClearCart()" style="flex: 1;">
                            <i class="fas fa-trash"></i> Clear Cart
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Add animation
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
    }

    closeClearCartConfirmation() {
        const modal = document.getElementById('clear-cart-confirmation');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.remove();
                document.body.style.overflow = '';
            }, 300);
        }
    }

    confirmClearCart() {
        this.closeClearCartConfirmation();
        this.animatedClearCart();
    }

    animatedClearCart() {
        const cartItems = document.querySelectorAll('.cart-item');
        const totalItems = cartItems.length;
        
        if (totalItems === 0) {
            this.showToast('Cart is already empty!', 'info');
            return;
        }

        // Animate each item out with staggered timing - simpler fade out
        cartItems.forEach((item, index) => {
            setTimeout(() => {
                item.style.transition = 'all 0.3s ease-out';
                item.style.transform = 'translateY(-10px)';
                item.style.opacity = '0';
                item.style.height = '0';
                item.style.padding = '0';
                item.style.margin = '0';
                item.style.overflow = 'hidden';
            }, index * 80); // Stagger each item by 80ms
        });

        // Clear the cart data after all animations complete
        setTimeout(() => {
            this.cart = [];
            this.saveCart();
            this.updateCartBadge();
            
            // Update cart modal with empty state
            const cartModal = document.getElementById('cart-modal');
            if (cartModal && cartModal.style.display !== 'none') {
                this.updateCartModalContent();
            }
            
            // Show success message
            this.showToast('Cart cleared successfully!', 'success');
            
        }, (totalItems * 80) + 400); // Wait for all animations plus buffer
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

            // Check if user is admin and redirect to admin dashboard
            if (user.isAdmin && user.isActive) {
                // Store admin session for admin dashboard
                const adminSession = {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    isAdmin: true,
                    isActive: true,
                    permissions: user.permissions || ['orders', 'inventory', 'customers', 'analytics'],
                    loginTime: new Date().toISOString()
                };
                
                localStorage.setItem('tcg-admin', JSON.stringify(adminSession));
                
                this.showToast(`Welcome back, Admin ${user.firstName}!`, 'success');
                
                // Redirect to admin dashboard
                setTimeout(() => {
                    window.location.href = 'admin/admin-dashboard.html';
                }, 1500);
            } else {
                this.showToast(`Welcome back, ${user.firstName}!`, 'success');
            }

        } catch (error) {
            console.error('Login error:', error);
            this.showToast(error.message || 'Login failed. Please try again.', 'error');
        }
    }

    logout() {
        // Clear current user
        this.currentUser = null;
        localStorage.removeItem('tcg-user');
        
        // Clear admin session if it exists
        localStorage.removeItem('tcg-admin');
        
        // Update UI
        this.updateAccountUI();
        this.showToast('You have been logged out successfully.', 'info');
        
        // Track logout event
        if (this.dbService) {
            this.dbService.trackEvent('user_logout', {
                timestamp: new Date().toISOString()
            });
        }
        
        // Redirect to home if on account page
        if (window.location.hash.includes('account')) {
            if (typeof navigateTo === 'function') {
                navigateTo('home');
            } else if (window.appRouter) {
                window.appRouter.loadPage('home', true);
            } else {
                window.location.hash = '#';
                window.location.reload();
            }
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

    // Guest Checkout Functionality
    openCheckoutModal() {
        this.createCheckoutModal();
        this.displayCheckoutModal();
    }

    createCheckoutModal() {
        // Remove existing modal if it exists
        const existingModal = document.getElementById('checkout-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.id = 'checkout-modal';
        modal.className = 'checkout-modal';
        modal.innerHTML = this.generateCheckoutModalHTML();
        document.body.appendChild(modal);

        // Add event listeners
        this.setupCheckoutModalEventListeners();
    }

    generateCheckoutModalHTML() {
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = subtotal >= 75 ? 0 : 9.99;
        const tax = subtotal * 0.13; // 13% HST for Ontario
        const finalTotal = subtotal + shipping + tax;

        return `
            <div class="checkout-modal-overlay" onclick="tcgStore.closeCheckoutModal()">
                <div class="checkout-modal-content" onclick="event.stopPropagation()">
                    <div class="checkout-modal-header">
                        <h2 style="font-size: 1.75rem; font-weight: 700; color: var(--gray-900); margin: 0;">
                            <i class="fas fa-credit-card" style="color: var(--primary-color); margin-right: var(--space-2);"></i>
                            Checkout
                        </h2>
                        <button class="checkout-close-btn" onclick="tcgStore.closeCheckoutModal()">×</button>
                    </div>
                    
                    <div class="checkout-modal-body">
                        <!-- Checkout Options -->
                        <div class="checkout-options" style="margin-bottom: var(--space-6);">
                            <div class="checkout-option-tabs" style="display: flex; border-bottom: 1px solid var(--gray-200); margin-bottom: var(--space-6);">
                                <button class="checkout-tab active" id="guest-tab" onclick="tcgStore.switchCheckoutTab('guest')" style="flex: 1; padding: var(--space-4); border: none; background: none; font-weight: 600; color: var(--primary-color); border-bottom: 2px solid var(--primary-color); cursor: pointer;">
                                    <i class="fas fa-user-clock"></i> Guest Checkout
                                </button>
                                <button class="checkout-tab" id="account-tab" onclick="tcgStore.switchCheckoutTab('account')" style="flex: 1; padding: var(--space-4); border: none; background: none; font-weight: 600; color: var(--gray-600); border-bottom: 2px solid transparent; cursor: pointer;">
                                    <i class="fas fa-user"></i> ${this.currentUser ? 'My Account' : 'Sign In'}
                                </button>
                            </div>
                        </div>

                        <!-- Guest Checkout Form -->
                        <div id="guest-checkout" class="checkout-section">
                            <form id="guest-checkout-form" onsubmit="tcgStore.handleGuestCheckout(event)">
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); margin-bottom: var(--space-4);">
                                    <div class="form-group">
                                        <label for="guest-first-name">First Name *</label>
                                        <input type="text" id="guest-first-name" name="firstName" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="guest-last-name">Last Name *</label>
                                        <input type="text" id="guest-last-name" name="lastName" required>
                                    </div>
                                </div>
                                
                                <div class="form-group">
                                    <label for="guest-email">Email Address *</label>
                                    <input type="email" id="guest-email" name="email" required>
                                </div>
                                
                                <div class="form-group">
                                    <label for="guest-phone">Phone Number</label>
                                    <input type="tel" id="guest-phone" name="phone">
                                </div>

                                <h3 style="font-size: 1.25rem; font-weight: 600; color: var(--gray-900); margin: var(--space-6) 0 var(--space-4) 0;">Shipping Address</h3>
                                
                                <div class="form-group">
                                    <label for="guest-address">Street Address *</label>
                                    <input type="text" id="guest-address" name="address" required>
                                </div>
                                
                                <div class="form-group">
                                    <label for="guest-address2">Apartment, Suite, etc.</label>
                                    <input type="text" id="guest-address2" name="address2">
                                </div>
                                
                                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--space-4); margin-bottom: var(--space-4);">
                                    <div class="form-group">
                                        <label for="guest-city">City *</label>
                                        <input type="text" id="guest-city" name="city" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="guest-province">Province *</label>
                                        <select id="guest-province" name="province" required>
                                            <option value="">Select Province</option>
                                            <option value="AB">Alberta</option>
                                            <option value="BC">British Columbia</option>
                                            <option value="MB">Manitoba</option>
                                            <option value="NB">New Brunswick</option>
                                            <option value="NL">Newfoundland and Labrador</option>
                                            <option value="NS">Nova Scotia</option>
                                            <option value="ON">Ontario</option>
                                            <option value="PE">Prince Edward Island</option>
                                            <option value="QC">Quebec</option>
                                            <option value="SK">Saskatchewan</option>
                                            <option value="NT">Northwest Territories</option>
                                            <option value="NU">Nunavut</option>
                                            <option value="YT">Yukon</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label for="guest-postal">Postal Code *</label>
                                        <input type="text" id="guest-postal" name="postalCode" required pattern="[A-Za-z][0-9][A-Za-z] [0-9][A-Za-z][0-9]" placeholder="A1A 1A1">
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label style="display: flex; align-items: center; gap: var(--space-2); cursor: pointer;">
                                        <input type="checkbox" name="createAccount" style="margin: 0;">
                                        <span>Create an account for faster checkout next time</span>
                                    </label>
                                </div>

                                <div class="form-group" id="password-fields" style="display: none;">
                                    <label for="guest-password">Password (6+ characters)</label>
                                    <input type="password" id="guest-password" name="password" minlength="6">
                                </div>
                            </form>
                        </div>

                        <!-- Account Checkout Section -->
                        <div id="account-checkout" class="checkout-section" style="display: none;">
                            ${this.currentUser ? this.generateAccountCheckoutHTML() : this.generateLoginPromptHTML()}
                        </div>

                        <!-- Order Summary -->
                        <div class="checkout-order-summary" style="background: var(--gray-50); border-radius: var(--radius-lg); padding: var(--space-6); margin-top: var(--space-6);">
                            <h3 style="font-size: 1.25rem; font-weight: 600; color: var(--gray-900); margin-bottom: var(--space-4);">Order Summary</h3>
                            
                            <!-- Cart Items Preview -->
                            <div class="checkout-items-preview" style="margin-bottom: var(--space-4); max-height: 200px; overflow-y: auto;">
                                ${this.cart.map(item => `
                                    <div style="display: flex; align-items: center; gap: var(--space-3); padding: var(--space-2) 0; border-bottom: 1px solid var(--gray-200);">
                                        <img src="${item.image}" alt="${item.name}" style="width: 40px; height: 56px; object-fit: contain; border-radius: var(--radius-sm);">
                                        <div style="flex: 1; min-width: 0;">
                                            <div style="font-size: 0.875rem; font-weight: 600; color: var(--gray-900); margin-bottom: 2px; line-height: 1.2;">${item.name}</div>
                                            <div style="font-size: 0.75rem; color: var(--gray-600);">Qty: ${item.quantity} × $${item.price.toFixed(2)}</div>
                                        </div>
                                        <div style="font-size: 0.875rem; font-weight: 600; color: var(--primary-color);">$${(item.price * item.quantity).toFixed(2)}</div>
                                    </div>
                                `).join('')}
                            </div>

                            <!-- Totals -->
                            <div style="display: flex; flex-direction: column; gap: var(--space-2);">
                                <div style="display: flex; justify-content: space-between;">
                                    <span>Subtotal (${totalItems} items):</span>
                                    <span>$${subtotal.toFixed(2)}</span>
                                </div>
                                <div style="display: flex; justify-content: space-between;">
                                    <span>Shipping:</span>
                                    <span>${shipping === 0 ? 'FREE' : '$' + shipping.toFixed(2)}</span>
                                </div>
                                <div style="display: flex; justify-content: space-between;">
                                    <span>Tax (HST):</span>
                                    <span>$${tax.toFixed(2)}</span>
                                </div>
                                <hr style="margin: var(--space-2) 0; border: none; border-top: 1px solid var(--gray-300);">
                                <div style="display: flex; justify-content: space-between; font-size: 1.125rem; font-weight: 700;">
                                    <span>Total:</span>
                                    <span style="color: var(--primary-color);">$${finalTotal.toFixed(2)}</span>
                                </div>
                                ${subtotal < 75 ? `<p style="font-size: 0.875rem; color: var(--primary-color); font-weight: 600; text-align: center; margin-top: var(--space-2);">Add $${(75 - subtotal).toFixed(2)} more for free shipping!</p>` : ''}
                            </div>
                        </div>
                    </div>
                    
                    <div class="checkout-modal-footer">
                        <div class="checkout-actions">
                            <button class="secondary-btn" onclick="tcgStore.closeCheckoutModal()">Back to Cart</button>
                            <button class="primary-btn" onclick="tcgStore.completeCheckout()" style="min-width: 200px;">
                                <i class="fas fa-lock"></i> Complete Order - $${finalTotal.toFixed(2)}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    generateAccountCheckoutHTML() {
        const user = this.currentUser;
        return `
            <div style="text-align: center; padding: var(--space-6);">
                <div style="font-size: 3rem; margin-bottom: var(--space-4); color: var(--success-color);">✓</div>
                <h3 style="font-size: 1.25rem; font-weight: 600; color: var(--gray-900); margin-bottom: var(--space-3);">Welcome back, ${user.firstName}!</h3>
                <p style="color: var(--gray-600); margin-bottom: var(--space-4);">Your account information will be used for this order.</p>
                <div style="background: white; border-radius: var(--radius-lg); padding: var(--space-4); text-align: left; border: 1px solid var(--gray-200);">
                    <div style="margin-bottom: var(--space-2);"><strong>Email:</strong> ${user.email}</div>
                    <div style="margin-bottom: var(--space-2);"><strong>Name:</strong> ${user.firstName} ${user.lastName}</div>
                    ${user.phone ? `<div><strong>Phone:</strong> ${user.phone}</div>` : ''}
                </div>
                <p style="font-size: 0.875rem; color: var(--gray-500); margin-top: var(--space-4);">
                    Need to update your information? <a href="#" onclick="tcgStore.closeCheckoutModal(); tcgStore.openEditProfileModal();" style="color: var(--primary-color); text-decoration: none;">Edit Profile</a>
                </p>
            </div>
        `;
    }

    generateLoginPromptHTML() {
        return `
            <div style="text-align: center; padding: var(--space-6);">
                <div style="font-size: 3rem; margin-bottom: var(--space-4); opacity: 0.7;">👤</div>
                <h3 style="font-size: 1.25rem; font-weight: 600; color: var(--gray-900); margin-bottom: var(--space-3);">Sign In to Your Account</h3>
                <p style="color: var(--gray-600); margin-bottom: var(--space-6);">Sign in for faster checkout with saved information and order history.</p>
                <div style="display: flex; gap: var(--space-3); justify-content: center;">
                    <button class="primary-btn" onclick="tcgStore.closeCheckoutModal(); tcgStore.openLoginModal();">
                        Sign In
                    </button>
                    <button class="secondary-btn" onclick="tcgStore.closeCheckoutModal(); tcgStore.openRegisterModal();">
                        Create Account
                    </button>
                </div>
                <p style="font-size: 0.875rem; color: var(--gray-500); margin-top: var(--space-4);">
                    Or continue with guest checkout using the Guest tab above.
                </p>
            </div>
        `;
    }

    setupCheckoutModalEventListeners() {
        // Close modal when clicking outside
        const overlay = document.querySelector('.checkout-modal-overlay');
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.closeCheckoutModal();
                }
            });
        }

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.getElementById('checkout-modal')) {
                this.closeCheckoutModal();
            }
        });

        // Handle create account checkbox
        const createAccountCheckbox = document.querySelector('input[name="createAccount"]');
        const passwordFields = document.getElementById('password-fields');
        if (createAccountCheckbox && passwordFields) {
            createAccountCheckbox.addEventListener('change', (e) => {
                passwordFields.style.display = e.target.checked ? 'block' : 'none';
                const passwordInput = document.getElementById('guest-password');
                if (passwordInput) {
                    passwordInput.required = e.target.checked;
                }
            });
        }
    }

    displayCheckoutModal() {
        const modal = document.getElementById('checkout-modal');
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    closeCheckoutModal() {
        const modal = document.getElementById('checkout-modal');
        if (modal) {
            modal.style.display = 'none';
            modal.remove();
            document.body.style.overflow = '';
        }
    }

    switchCheckoutTab(tab) {
        // Update tab appearance
        document.querySelectorAll('.checkout-tab').forEach(tabBtn => {
            tabBtn.classList.remove('active');
            tabBtn.style.color = 'var(--gray-600)';
            tabBtn.style.borderBottomColor = 'transparent';
        });

        const activeTab = document.getElementById(`${tab}-tab`);
        if (activeTab) {
            activeTab.classList.add('active');
            activeTab.style.color = 'var(--primary-color)';
            activeTab.style.borderBottomColor = 'var(--primary-color)';
        }

        // Show/hide sections
        document.getElementById('guest-checkout').style.display = tab === 'guest' ? 'block' : 'none';
        document.getElementById('account-checkout').style.display = tab === 'account' ? 'block' : 'none';
    }

    handleGuestCheckout(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData.entries());
        
        // Validate required fields
        const requiredFields = ['firstName', 'lastName', 'email', 'address', 'city', 'province', 'postalCode'];
        for (const field of requiredFields) {
            if (!data[field] || data[field].trim() === '') {
                this.showToast(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field.`, 'error');
                return;
            }
        }

        // Validate postal code format (Canadian)
        const postalCodeRegex = /^[A-Za-z]\d[A-Za-z] \d[A-Za-z]\d$/;
        if (!postalCodeRegex.test(data.postalCode)) {
            this.showToast('Please enter a valid Canadian postal code (e.g., A1A 1A1).', 'error');
            return;
        }

        // Create guest order
        this.completeGuestOrder(data);
    }

    completeGuestOrder(guestData) {
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = subtotal >= 75 ? 0 : 9.99;
        const tax = subtotal * 0.13;
        const total = subtotal + shipping + tax;

        // Show payment processing modal instead of immediately creating order
        this.showPaymentProcessingModal(guestData, total);
    }
    completeUserOrder() {
        // Create order from current cart for logged-in user
        const order = this.createOrder([...this.cart]);
        
        if (order) {
            // Clear cart after successful order creation
            this.cart = [];
            this.saveCart();
            this.updateCartBadge();
            this.closeCheckoutModal();
            
            // Show success message
            this.showToast(`Order #${order.id} placed successfully!`, 'success', 5000);
            
            // Simulate order processing
            setTimeout(() => {
                this.updateOrderStatus(order.id, 'processing');
                this.showToast('Your order is now being processed!', 'info');
            }, 2000);
        }
    }
    completeUserOrder() {
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = subtotal >= 75 ? 0 : 9.99;
        const tax = subtotal * 0.13;
        const total = subtotal + shipping + tax;

        // Show payment processing modal instead of immediately creating order
        this.showPaymentProcessingModal(null, total);
    }

    async createAccountFromGuestOrder(guestData, order) {
        try {
            if (!this.dbService) return;

            const newUser = await this.dbService.createUser({
                email: guestData.email,
                password: guestData.password,
                firstName: guestData.firstName,
                lastName: guestData.lastName,
                phone: guestData.phone || '',
                favoriteArchetype: null
            });

            // Transfer guest order to user account
            order.userId = newUser.id;
            order.isGuestOrder = false;
            
            // Move order from guest orders to user orders
            this.orders.push(order);
            localStorage.setItem('tcg-orders', JSON.stringify(this.orders));
            
            // Remove from guest orders
            const guestOrders = JSON.parse(localStorage.getItem('tcg-guest-orders') || '[]');
            const updatedGuestOrders = guestOrders.filter(o => o.id !== order.id);
            localStorage.setItem('tcg-guest-orders', JSON.stringify(updatedGuestOrders));

            // Auto-login the new user
            this.currentUser = newUser;
            localStorage.setItem('tcg-user', JSON.stringify(newUser));
            this.updateAccountUI();

            this.showToast(`Account created successfully! Welcome, ${newUser.firstName}!`, 'success');

        } catch (error) {
            console.error('Error creating account from guest order:', error);
            // Don't show error to user as the order was still successful
        }
    }

    updateGuestOrderStatus(orderId, newStatus) {
        const guestOrders = JSON.parse(localStorage.getItem('tcg-guest-orders') || '[]');
        const order = guestOrders.find(o => o.id === orderId);
        
        if (order) {
            order.status = newStatus;
            order.updatedAt = new Date().toISOString();
            
            if (newStatus === 'shipped' && !order.trackingNumber) {
                order.trackingNumber = this.generateTrackingNumber();
            }
            
            localStorage.setItem('tcg-guest-orders', JSON.stringify(guestOrders));
        }
    }

    showPaymentProcessingModal(guestData, total) {
        // Close checkout modal first
        this.closeCheckoutModal();
        
        // Create payment processing modal
        const modal = document.createElement('div');
        modal.id = 'payment-processing-modal';
        modal.className = 'payment-processing-modal';
        modal.innerHTML = `
            <div class="payment-modal-overlay">
                <div class="payment-modal-content" style="max-width: 500px; text-align: center; padding: var(--space-8);">
                    <div class="payment-processing-header">
                        <div style="font-size: 4rem; margin-bottom: var(--space-4); color: var(--primary-color);">💳</div>
                        <h2 style="font-size: 1.75rem; font-weight: 700; color: var(--gray-900); margin-bottom: var(--space-4);">
                            Processing Payment
                        </h2>
                        <p style="color: var(--gray-600); margin-bottom: var(--space-6);">
                            Please wait while we securely process your payment of $${total.toFixed(2)}...
                        </p>
                    </div>
                    
                    <div class="payment-progress" style="margin-bottom: var(--space-6);">
                        <div class="progress-bar" style="width: 100%; height: 8px; background: var(--gray-200); border-radius: var(--radius-full); overflow: hidden;">
                            <div class="progress-fill" style="height: 100%; background: var(--primary-color); width: 0%; transition: width 0.5s ease-out; border-radius: var(--radius-full);"></div>
                        </div>
                        <div class="progress-text" style="margin-top: var(--space-3); font-size: 0.875rem; color: var(--gray-600);">
                            Initializing payment...
                        </div>
                    </div>
                    
                    <div class="payment-security" style="display: flex; align-items: center; justify-content: center; gap: var(--space-2); color: var(--gray-500); font-size: 0.875rem;">
                        <i class="fas fa-lock"></i>
                        <span>Your payment information is secure and encrypted</span>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Simulate payment processing steps
        this.simulatePaymentProcessing(guestData, total);
    }

    simulatePaymentProcessing(guestData, total) {
        const progressFill = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');
        
        const steps = [
            { progress: 20, text: 'Validating payment information...', delay: 1000 },
            { progress: 40, text: 'Contacting payment processor...', delay: 1500 },
            { progress: 60, text: 'Authorizing transaction...', delay: 1200 },
            { progress: 80, text: 'Confirming payment...', delay: 1000 },
            { progress: 100, text: 'Payment successful!', delay: 800 }
        ];
        
        let currentStep = 0;
        
        const processStep = () => {
            if (currentStep >= steps.length) {
                // Payment successful - now create the order
                setTimeout(() => {
                    this.finalizeOrder(guestData, total);
                }, 500);
                return;
            }
            
            const step = steps[currentStep];
            
            if (progressFill) {
                progressFill.style.width = `${step.progress}%`;
            }
            
            if (progressText) {
                progressText.textContent = step.text;
                
                // Change color to green for success
                if (step.progress === 100) {
                    progressText.style.color = 'var(--success-color)';
                    progressText.style.fontWeight = '600';
                }
            }
            
            currentStep++;
            setTimeout(processStep, step.delay);
        };
        
        // Start processing after a brief delay
        setTimeout(processStep, 500);
    }

    finalizeOrder(guestData, total) {
        // Close payment processing modal
        const paymentModal = document.getElementById('payment-processing-modal');
        if (paymentModal) {
            paymentModal.remove();
            document.body.style.overflow = '';
        }
        
        // Now create the actual order since payment was "successful"
        if (guestData) {
            // Create guest order
            this.createGuestOrderAfterPayment(guestData, total);
        } else {
            // Create user order
            this.createUserOrderAfterPayment(total);
        }
    }

    createGuestOrderAfterPayment(guestData, total) {
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = subtotal >= 75 ? 0 : 9.99;
        const tax = subtotal * 0.13;

        // Create guest order
        const order = {
            id: Date.now(),
            userId: null, // Guest order
            guestInfo: {
                firstName: guestData.firstName,
                lastName: guestData.lastName,
                email: guestData.email,
                phone: guestData.phone || '',
                address: {
                    street: guestData.address,
                    street2: guestData.address2 || '',
                    city: guestData.city,
                    province: guestData.province,
                    postalCode: guestData.postalCode.toUpperCase()
                }
            },
            items: this.cart.map(item => ({...item})),
            subtotal: subtotal,
            shipping: shipping,
            tax: tax,
            total: total,
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            trackingNumber: null,
            estimatedDelivery: this.calculateEstimatedDelivery(),
            isGuestOrder: true,
            paymentProcessed: true // Mark that payment was processed
        };

        // Save order to guest orders
        const guestOrders = JSON.parse(localStorage.getItem('tcg-guest-orders') || '[]');
        guestOrders.push(order);
        localStorage.setItem('tcg-guest-orders', JSON.stringify(guestOrders));

        // If user wants to create account, do it now
        if (guestData.createAccount && guestData.password) {
            this.createAccountFromGuestOrder(guestData, order);
        }

        // Clear cart and show success
        this.cart = [];
        this.saveCart();
        this.updateCartBadge();

        // Show success message
        this.showToast(`Order #${order.id} placed successfully! Check your email for confirmation.`, 'success', 5000);

        // Simulate order processing
        setTimeout(() => {
            this.updateGuestOrderStatus(order.id, 'processing');
            this.showToast('Your order is now being processed!', 'info');
        }, 2000);
    }

    createUserOrderAfterPayment(total) {
        // Create order from current cart for logged-in user
        const order = this.createOrder([...this.cart]);
        
        if (order) {
            // Mark that payment was processed
            order.paymentProcessed = true;
            
            // Update the order in storage
            localStorage.setItem('tcg-orders', JSON.stringify(this.orders));
            
            // Clear cart after successful order creation
            this.cart = [];
            this.saveCart();
            this.updateCartBadge();
            
            // Show success message
            this.showToast(`Order #${order.id} placed successfully!`, 'success', 5000);
            
            // Simulate order processing
            setTimeout(() => {
                this.updateOrderStatus(order.id, 'processing');
                this.showToast('Your order is now being processed!', 'info');
            }, 2000);
        }
    }

    completeCheckout() {
        const activeTab = document.querySelector('.checkout-tab.active');
        if (!activeTab) return;

        if (activeTab.id === 'guest-tab') {
            // Trigger guest checkout form submission
            const form = document.getElementById('guest-checkout-form');
            if (form) {
                form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
            }
        } else if (activeTab.id === 'account-tab') {
            if (this.currentUser) {
                // Complete order with logged-in user
                this.completeUserOrder();
            } else {
                this.showToast('Please sign in to complete checkout with your account.', 'error');
            }
        }
    }

    completeUserOrder() {
        // Create order from current cart for logged-in user
        const order = this.createOrder([...this.cart]);
        
        if (order) {
            // Clear cart after successful order creation
            this.cart = [];
            this.saveCart();
            this.updateCartBadge();
            this.closeCheckoutModal();
            
            // Show success message
            this.showToast(`Order #${order.id} placed successfully!`, 'success', 5000);
            
            // Simulate order processing
            setTimeout(() => {
                this.updateOrderStatus(order.id, 'processing');
                this.showToast('Your order is now being processed!', 'info');
            }, 2000);
        }
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

    // Advanced search functionality for singles page
    async performAdvancedSearch() {
        const searchInput = document.getElementById('card-search-input');
        const resultsTitle = document.getElementById('results-title');
        const resultsCount = document.getElementById('results-count');
        const cardsGrid = document.getElementById('cards-grid');
        
        if (!cardsGrid) return;

        // Get search parameters
        const searchQuery = searchInput ? searchInput.value.trim() : '';
        const filters = this.getAdvancedFilters();
        
        // Show loading
        this.showLoading(cardsGrid);
        
        // Update results title
        if (resultsTitle) {
            resultsTitle.textContent = searchQuery ? `Search Results for "${searchQuery}"` : 'All Cards';
        }

        try {
            let searchResults = [];
            
            if (searchQuery.length >= 2) {
                // Perform text search
                searchResults = await this.searchCards(searchQuery);
            } else {
                // Get all cards if no search query
                searchResults = await this.getAllCards();
            }

            // Apply filters
            const filteredResults = this.applyAdvancedFilters(searchResults, filters);
            
            // Format cards for display
            this.currentCards = await Promise.all(filteredResults.map(card => this.formatCardForDisplay(card)));
            this.filteredCards = [...this.currentCards];
            this.currentPage = 1;
            
            // Update results count
            if (resultsCount) {
                resultsCount.textContent = `${this.filteredCards.length} cards found`;
            }
            
            // Display results
            this.displayCards(cardsGrid);
            this.setupPagination();
            
        } catch (error) {
            console.error('Advanced search error:', error);
            this.showError(cardsGrid, 'Search failed. Please try again.');
            
            if (resultsCount) {
                resultsCount.textContent = 'Search failed';
            }
        }
    }

    getAdvancedFilters() {
        return {
            type: document.getElementById('type-filter')?.value || '',
            race: document.getElementById('race-filter')?.value || '',
            attribute: document.getElementById('attribute-filter')?.value || '',
            level: document.getElementById('level-filter')?.value || '',
            linkval: document.getElementById('linkval-filter')?.value || '',
            atk: document.getElementById('atk-filter')?.value || '',
            def: document.getElementById('def-filter')?.value || '',
            archetype: document.getElementById('archetype-filter')?.value || '',
            banlist: document.getElementById('banlist-filter')?.value || '',
            cardset: document.getElementById('cardset-filter')?.value || '',
            sort: document.getElementById('sort-filter')?.value || 'name',
            limit: parseInt(document.getElementById('limit-filter')?.value) || 20,
            misc: document.getElementById('misc-filter')?.checked || false
        };
    }

    applyAdvancedFilters(cards, filters) {
        let filtered = [...cards];

        // Filter by type
        if (filters.type) {
            filtered = filtered.filter(card => 
                card.type && card.type.toLowerCase().includes(filters.type.toLowerCase())
            );
        }

        // Filter by race
        if (filters.race) {
            filtered = filtered.filter(card => 
                card.race && card.race.toLowerCase() === filters.race.toLowerCase()
            );
        }

        // Filter by attribute
        if (filters.attribute) {
            filtered = filtered.filter(card => 
                card.attribute && card.attribute.toLowerCase() === filters.attribute.toLowerCase()
            );
        }

        // Filter by level
        if (filters.level) {
            const targetLevel = parseInt(filters.level);
            filtered = filtered.filter(card => 
                card.level === targetLevel
            );
        }

        // Filter by link value
        if (filters.linkval) {
            const targetLink = parseInt(filters.linkval);
            filtered = filtered.filter(card => 
                card.linkval === targetLink
            );
        }

        // Filter by ATK range
        if (filters.atk) {
            filtered = this.filterByStatRange(filtered, 'atk', filters.atk);
        }

        // Filter by DEF range
        if (filters.def) {
            filtered = this.filterByStatRange(filtered, 'def', filters.def);
        }

        // Filter by archetype
        if (filters.archetype) {
            filtered = filtered.filter(card => 
                card.archetype && card.archetype.toLowerCase().includes(filters.archetype.toLowerCase())
            );
        }

        // Filter by card set
        if (filters.cardset) {
            filtered = filtered.filter(card => 
                card.card_sets && card.card_sets.some(set => 
                    set.set_code && set.set_code.toLowerCase().includes(filters.cardset.toLowerCase())
                )
            );
        }

        // Filter by price availability
        if (filters.misc) {
            filtered = filtered.filter(card => 
                card.card_prices && card.card_prices.length > 0
            );
        }

        // Sort results
        filtered = this.sortCards(filtered, filters.sort);

        // Limit results
        return filtered.slice(0, filters.limit);
    }

    filterByStatRange(cards, stat, range) {
        return cards.filter(card => {
            const value = card[stat];
            if (value === null || value === undefined) return false;
            
            switch (range) {
                case '0-999':
                    return value >= 0 && value <= 999;
                case '1000-1999':
                    return value >= 1000 && value <= 1999;
                case '2000-2499':
                    return value >= 2000 && value <= 2499;
                case '2500-2999':
                    return value >= 2500 && value <= 2999;
                case '3000+':
                    return value >= 3000;
                default:
                    return true;
            }
        });
    }

    sortCards(cards, sortBy) {
        return cards.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'name-desc':
                    return b.name.localeCompare(a.name);
                case 'level':
                    return (a.level || 0) - (b.level || 0);
                case 'level-desc':
                    return (b.level || 0) - (a.level || 0);
                case 'atk':
                    return (a.atk || 0) - (b.atk || 0);
                case 'atk-desc':
                    return (b.atk || 0) - (a.atk || 0);
                case 'def':
                    return (a.def || 0) - (b.def || 0);
                case 'def-desc':
                    return (b.def || 0) - (a.def || 0);
                default:
                    return a.name.localeCompare(b.name);
            }
        });
    }

    async getAllCards() {
        const cacheKey = 'all_cards';
        const cached = this.cache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
            return cached.data;
        }

        try {
            // Get a variety of cards from different archetypes
            const archetypes = ['Blue-Eyes', 'Dark Magician', 'Elemental HERO', 'Blackwing', 'Sky Striker'];
            let allCards = [];
            
            for (const archetype of archetypes) {
                try {
                    const cards = await this.getCardsByArchetype(archetype);
                    allCards = allCards.concat(cards.slice(0, 10)); // Limit per archetype
                } catch (error) {
                    console.warn(`Failed to fetch ${archetype} cards:`, error);
                }
            }
            
            // Add some meta cards
            const metaCards = await this.getMetaCards();
            allCards = allCards.concat(metaCards);
            
            // Remove duplicates
            const uniqueCards = allCards.filter((card, index, self) => 
                index === self.findIndex(c => c.id === card.id)
            );
            
            this.cache.set(cacheKey, {
                data: uniqueCards,
                timestamp: Date.now()
            });
            
            return uniqueCards;
        } catch (error) {
            console.error('Error fetching all cards:', error);
            return [];
        }
    }

    async searchByCategory(category) {
        const cardsGrid = document.getElementById('cards-grid');
        const resultsTitle = document.getElementById('results-title');
        const resultsCount = document.getElementById('results-count');
        
        if (!cardsGrid) return;

        this.showLoading(cardsGrid);

        try {
            let cards = [];
            let categoryName = '';

            switch (category) {
                case 'meta':
                    cards = await this.getMetaCards();
                    categoryName = 'Meta Cards';
                    break;
                case 'hand-traps':
                    cards = await this.getHandTrapCards();
                    categoryName = 'Hand Traps';
                    break;
                case 'boss-monsters':
                    cards = await this.getBossMonsters();
                    categoryName = 'Boss Monsters';
                    break;
                case 'classic':
                    cards = await this.getClassicCards();
                    categoryName = 'Classic Cards';
                    break;
                default:
                    cards = await this.getMetaCards();
                    categoryName = 'Featured Cards';
            }

            this.currentCards = await Promise.all(cards.map(card => this.formatCardForDisplay(card)));
            this.filteredCards = [...this.currentCards];
            this.currentPage = 1;

            if (resultsTitle) {
                resultsTitle.textContent = categoryName;
            }

            if (resultsCount) {
                resultsCount.textContent = `${this.filteredCards.length} cards found`;
            }

            this.displayCards(cardsGrid);
            this.setupPagination();

        } catch (error) {
            console.error('Category search error:', error);
            this.showError(cardsGrid, 'Failed to load category. Please try again.');
        }
    }

    async getBossMonsters() {
        const bossMonsterNames = [
            'Blue-Eyes Ultimate Dragon',
            'Red-Eyes Black Dragon',
            'Exodia the Forbidden One',
            'Dark Magician',
            'Elemental HERO Sparkman',
            'Stardust Dragon',
            'Number 39: Utopia',
            'Firewall Dragon'
        ];

        const cards = [];
        for (const name of bossMonsterNames) {
            try {
                const card = await this.getCardByName(name);
                if (card) cards.push(card);
            } catch (error) {
                console.warn(`Could not fetch ${name}`);
            }
        }

        return cards;
    }

    async getClassicCards() {
        const classicCardNames = [
            'Blue-Eyes White Dragon',
            'Dark Magician',
            'Red-Eyes Black Dragon',
            'Exodia the Forbidden One',
            'Mirror Force',
            'Mystical Space Typhoon',
            'Pot of Greed',
            'Raigeki'
        ];

        const cards = [];
        for (const name of classicCardNames) {
            try {
                const card = await this.getCardByName(name);
                if (card) cards.push(card);
            } catch (error) {
                console.warn(`Could not fetch ${name}`);
            }
        }

        return cards;
    }

    loadMoreCards() {
        // Increase the current page and display more cards
        const totalPages = Math.ceil(this.filteredCards.length / this.cardsPerPage);
        
        if (this.currentPage < totalPages) {
            this.currentPage++;
            const container = document.querySelector('.modern-card-grid, #meta-cards-grid, #cards-grid');
            if (container) {
                // Append new cards instead of replacing
                const startIndex = (this.currentPage - 1) * this.cardsPerPage;
                const endIndex = startIndex + this.cardsPerPage;
                const newCards = this.filteredCards.slice(startIndex, endIndex);
                
                newCards.forEach((card, index) => {
                    const cardElement = this.createModernCardElement(card);
                    cardElement.style.animationDelay = `${index * 50}ms`;
                    cardElement.classList.add('fade-in-up');
                    container.appendChild(cardElement);
                });
                
                // Update load more button visibility
                const loadMoreContainer = document.getElementById('load-more-container');
                if (loadMoreContainer) {
                    if (this.currentPage >= totalPages) {
                        loadMoreContainer.style.display = 'none';
                    }
                }
            }
        }
    }

    // Helper functions for rarity badge functionality on singles page
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

    calculateSetPrice(basePrice, rarity) {
        // Simple price calculation based on rarity
        const base = parseFloat(basePrice) || 0;
        if (base <= 0) return '0.00';
        
        // Rarity multipliers (simplified)
        const multipliers = {
            'Common': 1.0,
            'Rare': 1.2,
            'Super Rare': 1.5,
            'Ultra Rare': 2.0,
            'Secret Rare': 3.0,
            'Ultimate Rare': 4.0,
            'Ghost Rare': 5.0,
            'Starlight Rare': 10.0
        };
        
        const multiplier = multipliers[rarity] || 1.0;
        return (base * multiplier).toFixed(2);
    }

    updateCardRarityFromSet(selectElement, cardElementId, cardName, cardImage) {
        const selectedOption = selectElement.options[selectElement.selectedIndex];
        const newRarity = selectedOption.getAttribute('data-rarity') || 'Common';
        const newPrice = selectedOption.getAttribute('data-price') || '0.00';
        
        // Update rarity badge
        const rarityBadge = document.getElementById(`rarity-badge-${cardElementId}`);
        if (rarityBadge) {
            const rarityColor = this.getRarityColor(newRarity);
            
            // Animate the rarity badge update
            rarityBadge.style.transition = 'all 0.3s ease-out';
            rarityBadge.style.transform = 'scale(0.8)';
            rarityBadge.style.opacity = '0.7';
            
            setTimeout(() => {
                rarityBadge.textContent = newRarity;
                rarityBadge.style.backgroundColor = rarityColor;
                rarityBadge.style.transform = 'scale(1.1)';
                rarityBadge.style.opacity = '1';
                
                setTimeout(() => {
                    rarityBadge.style.transform = 'scale(1)';
                }, 200);
            }, 150);
        }
        
        // Update price
        const priceElement = document.getElementById(`card-price-${cardElementId}`);
        if (priceElement) {
            priceElement.style.transition = 'color 0.3s ease-out';
            priceElement.textContent = `$${newPrice}`;
        }
        
        // Update add to cart button
        const addToCartBtn = document.getElementById(`add-to-cart-${cardElementId}`);
        if (addToCartBtn) {
            const setCode = selectedOption.value;
            const setName = selectedOption.textContent.split(' (')[0]; // Extract set name
            addToCartBtn.setAttribute('onclick', 
                `event.stopPropagation(); tcgStore.addToCartFromCard('${cardElementId}', '${cardName}', ${newPrice}, '${cardImage}', '${newRarity}', '${setCode}', '${setName}')`
            );
        }
        
        console.log(`✅ Rarity badge updated: ${newRarity} (${rarityColor}) - $${newPrice}`);
    }

    addToCartFromCard(cardElementId, cardName, price, image, rarity, setCode = '', setName = '') {
        // Add to cart with set and rarity details
        this.addToCartWithDetails(cardName, price, image, setCode, rarity, setName);
        
        console.log(`Added to cart: ${cardName} (${setCode} - ${rarity}) - $${price}`);
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
