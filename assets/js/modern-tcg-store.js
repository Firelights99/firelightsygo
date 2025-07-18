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

            this.currentCards = cards.map(card => this.formatCardForDisplay(card));
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

    formatCardForDisplay(card) {
        if (!card) return null;

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
            price: this.getMockPrice(card.name),
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

    getMockPrice(cardName) {
        const hash = this.hashCode(cardName);
        const basePrice = Math.abs(hash % 100) + 1;
        
        if (cardName.includes('Ash') || cardName.includes('Snake-Eye')) {
            return (basePrice * 2 + 50).toFixed(2);
        }
        if (cardName.includes('Blue-Eyes') || cardName.includes('Dark Magician')) {
            return (basePrice * 0.5 + 5).toFixed(2);
        }
        if (cardName.includes('Kashtira') || cardName.includes('Infinite')) {
            return (basePrice * 1.5 + 20).toFixed(2);
        }
        
        return basePrice.toFixed(2);
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
        const productUrl = `pages/product.html?id=${card.id}`;
        window.location.href = productUrl;
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
            this.currentCards = searchResults.map(card => this.formatCardForDisplay(card));
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
        // Implementation for cart modal
        this.showToast('Cart functionality coming soon!', 'info');
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
