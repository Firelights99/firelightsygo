// Firelight Duel Academy - Main Store JavaScript
class YugiohStore {
    constructor() {
        this.apiService = new YugiohApiService();
        this.tcgPlayerService = null; // Disabled per user request - using YGOPRODeck only
        this.cart = JSON.parse(localStorage.getItem('yugioh_cart')) || [];
        this.user = JSON.parse(localStorage.getItem('yugioh_user')) || null;
        this.init();
    }

    // TCGPlayer service initialization disabled - using YGOPRODeck API only
    async initializeTCGPlayerService() {
        console.log('TCGPlayer API disabled - using YGOPRODeck API for all card data and pricing');
        this.tcgPlayerService = null;
    }

    async init() {
        this.setupEventListeners();
        this.updateCartDisplay();
        await this.loadFeaturedCards();
        this.setupSearch();
    }

    setupEventListeners() {
        // Cart functionality
        document.addEventListener('click', (e) => {
            if (e.target.matches('.cart-close') || e.target.matches('#cart-modal')) {
                this.closeCart();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeCart();
            }
            if (e.key === '/' && !e.target.matches('input')) {
                e.preventDefault();
                document.getElementById('card-search').focus();
            }
        });

        // Search input
        const searchInput = document.getElementById('card-search');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.performLiveSearch(e.target.value);
                }, 300);
            });
        }
    }

    // Cart Management
    openCart() {
        const cartModal = document.getElementById('cart-modal');
        if (cartModal) {
            cartModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            this.updateCartDisplay();
        }
    }

    closeCart() {
        const cartModal = document.getElementById('cart-modal');
        if (cartModal) {
            cartModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    clearCart() {
        this.cart = [];
        this.saveCart();
        this.updateCartDisplay();
        this.showNotification('Cart cleared', 'info');
    }

    getCartTotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    getCartItemCount() {
        return this.cart.reduce((count, item) => count + item.quantity, 0);
    }

    applyDiscount(code) {
        // Placeholder for discount functionality
        const discountCodes = {
            'WELCOME10': 0.10,
            'STUDENT15': 0.15,
            'BULK20': 0.20
        };

        const discount = discountCodes[code.toUpperCase()];
        if (discount) {
            this.showNotification(`Discount applied: ${(discount * 100)}% off!`, 'success');
            return discount;
        } else {
            this.showNotification('Invalid discount code', 'error');
            return 0;
        }
    }

    proceedToCheckout() {
        if (this.cart.length === 0) {
            this.showNotification('Your cart is empty', 'warning');
            return;
        }

        // Store cart for checkout process
        localStorage.setItem('checkout_cart', JSON.stringify(this.cart));
        
        // Navigate to checkout (placeholder)
        this.showNotification('Redirecting to checkout...', 'info');
        
        // In a real implementation, this would redirect to a checkout page
        setTimeout(() => {
            window.location.href = 'checkout.html';
        }, 1500);
    }

    addToCart(card, condition = 'near_mint', quantity = 1) {
        const existingItem = this.cart.find(item => 
            item.id === card.id && item.condition === condition
        );

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push({
                id: card.id,
                name: card.name,
                image: card.imageSmall || card.image,
                condition: condition,
                quantity: quantity,
                price: this.getCardPrice(card, condition),
                addedAt: new Date().toISOString()
            });
        }

        this.saveCart();
        this.updateCartDisplay();
        this.showNotification(`${card.name} added to cart!`, 'success');
    }

    removeFromCart(cardId, condition) {
        this.cart = this.cart.filter(item => 
            !(item.id === cardId && item.condition === condition)
        );
        this.saveCart();
        this.updateCartDisplay();
    }

    updateCartQuantity(cardId, condition, newQuantity) {
        const item = this.cart.find(item => 
            item.id === cardId && item.condition === condition
        );
        
        if (item) {
            if (newQuantity <= 0) {
                this.removeFromCart(cardId, condition);
            } else {
                item.quantity = newQuantity;
                this.saveCart();
                this.updateCartDisplay();
            }
        }
    }

    updateCartDisplay() {
        const cartCount = document.querySelector('.cart-count');
        const cartItems = document.getElementById('cart-items');
        const cartSummary = document.querySelector('.cart-summary');
        const cartSubtotal = document.getElementById('cart-subtotal');

        // Update cart count
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        if (cartCount) {
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'inline' : 'none';
        }

        // Update cart items display
        if (cartItems) {
            if (this.cart.length === 0) {
                cartItems.innerHTML = '<p class="empty-cart">Your cart is empty. Start browsing our Yu-Gi-Oh! singles!</p>';
                if (cartSummary) cartSummary.style.display = 'none';
            } else {
                cartItems.innerHTML = this.cart.map(item => `
                    <div class="cart-item">
                        <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                        <div class="cart-item-info">
                            <h4>${item.name}</h4>
                            <p class="cart-item-condition">${this.formatCondition(item.condition)}</p>
                            <div class="cart-item-controls">
                                <button onclick="yugiohStore.updateCartQuantity(${item.id}, '${item.condition}', ${item.quantity - 1})">-</button>
                                <span class="quantity">${item.quantity}</span>
                                <button onclick="yugiohStore.updateCartQuantity(${item.id}, '${item.condition}', ${item.quantity + 1})">+</button>
                            </div>
                        </div>
                        <div class="cart-item-price">
                            <span>$${(item.price * item.quantity).toFixed(2)}</span>
                            <button onclick="yugiohStore.removeFromCart(${item.id}, '${item.condition}')" class="remove-btn">×</button>
                        </div>
                    </div>
                `).join('');

                // Update subtotal
                const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                if (cartSubtotal) cartSubtotal.textContent = subtotal.toFixed(2);
                if (cartSummary) cartSummary.style.display = 'block';
            }
        }
    }

    saveCart() {
        localStorage.setItem('yugioh_cart', JSON.stringify(this.cart));
    }

    // Featured Cards - Meta-relevant and frequently purchased
    async loadFeaturedCards() {
        const featuredGrid = document.getElementById('featured-cards-grid');
        if (!featuredGrid) return;

        try {
            console.log('Loading featured meta-relevant cards...');
            
            // Get meta-relevant cards first, then try API for additional cards
            let cards = [];
            const metaCards = this.getFallbackCards(); // Our curated meta cards
            
            try {
                // Try to get specific meta cards from API by ID
                const apiCards = [];
                for (const metaCard of metaCards.slice(0, 12)) {
                    try {
                        const apiCard = await this.apiService.getCardById(metaCard.id);
                        if (apiCard) {
                            apiCards.push(apiCard);
                        }
                    } catch (cardError) {
                        console.warn(`Failed to load card ${metaCard.id} from API, using fallback`);
                        apiCards.push(metaCard);
                    }
                }
                cards = apiCards;
                console.log('Meta cards loaded:', cards.length);
            } catch (apiError) {
                console.warn('API failed, using all fallback meta cards:', apiError);
                cards = metaCards.slice(0, 12);
            }
            
            featuredGrid.classList.remove('loading');
            
            if (cards.length === 0) {
                featuredGrid.innerHTML = '<p class="error-message">No cards available at the moment.</p>';
                return;
            }
            
            // Process cards with pricing and ensure full card images are visible
            const cardElements = cards.map((card) => {
                const formattedCard = this.apiService ? this.apiService.formatCardForDisplay(card) : this.formatFallbackCard(card);
                const price = this.getSimpleCardPrice(formattedCard);
                
                // Use full card image (not cropped) for better visibility
                const cardImageUrl = formattedCard.image || `https://images.ygoprodeck.com/images/cards/${card.id}.jpg`;
                const fallbackImageUrl = `https://images.ygoprodeck.com/images/cards_small/${card.id}.jpg`;
                
                return `
                    <div class="card-item featured-meta-card" onclick="yugiohStore.showCardDetails(${card.id})" data-card-id="${card.id}">
                        <div class="card-image-container">
                            <img src="${cardImageUrl}" alt="${formattedCard.name}" class="card-image" loading="lazy" 
                                 onerror="this.onerror=null; this.src='${fallbackImageUrl}';">
                        </div>
                        <div class="card-info">
                            <h3 class="card-name">${formattedCard.name}</h3>
                            <p class="card-type">${formattedCard.type}</p>
                            <div class="card-price">$${price.toFixed(2)}</div>
                            <div class="card-meta-badge">Meta</div>
                        </div>
                    </div>
                `;
            });
            
            featuredGrid.innerHTML = cardElements.join('');
            console.log('Featured meta cards loaded successfully');
        } catch (error) {
            console.error('Error loading featured cards:', error);
            featuredGrid.classList.remove('loading');
            featuredGrid.innerHTML = '<p class="error-message">Unable to load featured cards. Please try again later.</p>';
        }
    }

    // Meta-relevant and frequently purchased cards
    getFallbackCards() {
        return [
            // Modern Meta Tier 1
            {
                id: 76375976,
                name: "Snake-Eye Ash",
                type: "Effect Monster",
                desc: "You can Normal Summon this card without Tributing. If this card is Normal Summoned: You can add 1 \"Snake-Eye\" card from your Deck to your hand, except \"Snake-Eye Ash\".",
                atk: 1200,
                def: 600,
                level: 4,
                race: "Pyro",
                attribute: "FIRE"
            },
            {
                id: 28776350,
                name: "Kashtira Fenrir",
                type: "Effect Monster",
                desc: "You can Special Summon this card (from your hand) by banishing 3 face-up cards you control. You can only Special Summon \"Kashtira Fenrir\" once per turn this way.",
                atk: 2400,
                def: 2100,
                level: 7,
                race: "Beast",
                attribute: "FIRE"
            },
            {
                id: 95286165,
                name: "Purrely",
                type: "Effect Monster",
                desc: "You can reveal this card in your hand; Special Summon 1 Level 1 monster from your Deck, except \"Purrely\".",
                atk: 300,
                def: 100,
                level: 1,
                race: "Beast",
                attribute: "DARK"
            },
            // Hand Traps (Most Popular)
            {
                id: 14558127,
                name: "Ash Blossom & Joyous Spring",
                type: "Effect Monster",
                desc: "When a card or effect is activated that includes any of these effects (Quick Effect): You can discard this card; negate that effect.",
                atk: 0,
                def: 1800,
                level: 3,
                race: "Zombie",
                attribute: "FIRE"
            },
            {
                id: 27204311,
                name: "Nibiru, the Primal Being",
                type: "Effect Monster",
                desc: "During the Main Phase, if your opponent Normal or Special Summoned 5 or more monsters this turn (Quick Effect): You can Tribute as many face-up monsters on the field as possible, and if you do, Special Summon this card from your hand, then Special Summon 1 \"Primal Being Token\".",
                atk: 3000,
                def: 600,
                level: 11,
                race: "Rock",
                attribute: "LIGHT"
            },
            {
                id: 97268402,
                name: "Effect Veiler",
                type: "Effect Monster",
                desc: "During your opponent's Main Phase (Quick Effect): You can send this card from your hand to the GY; negate the effects of 1 Effect Monster your opponent controls, until the end of this turn.",
                atk: 0,
                def: 0,
                level: 1,
                race: "Spellcaster",
                attribute: "LIGHT"
            },
            // Extra Deck Staples
            {
                id: 86066372,
                name: "Accesscode Talker",
                type: "Link Monster",
                desc: "2+ monsters with different names. If this card is Link Summoned: You can destroy cards your opponent controls, up to the number of monsters co-linked to this card.",
                atk: 2300,
                def: 0,
                level: 0,
                race: "Cyberse",
                attribute: "DARK"
            },
            {
                id: 56405614,
                name: "Apollousa, Bow of the Goddess",
                type: "Link Monster",
                desc: "2+ monsters with different names. You can only Link Summon \"Apollousa, Bow of the Goddess\" once per turn.",
                atk: 800,
                def: 0,
                level: 0,
                race: "Fairy",
                attribute: "LIGHT"
            },
            // Modern Fusion Support
            {
                id: 44362883,
                name: "Branded Fusion",
                type: "Spell Card",
                desc: "Fusion Summon 1 Fusion Monster from your Extra Deck, using monsters from your hand or Deck as material.",
                race: "Spell",
                attribute: "SPELL"
            },
            // Sky Striker (Popular Archetype)
            {
                id: 26077387,
                name: "Sky Striker Ace - Raye",
                type: "Effect Monster",
                desc: "If you control no monsters in your Main Monster Zone: You can Special Summon this card from your hand.",
                atk: 1500,
                def: 1500,
                level: 4,
                race: "Warrior",
                attribute: "DARK"
            },
            // Eldlich (Control Deck)
            {
                id: 95440946,
                name: "Eldlich the Golden Lord",
                type: "Effect Monster",
                desc: "You can Special Summon this card (from your hand or GY) by sending 1 Spell/Trap you control to the GY.",
                atk: 2500,
                def: 2800,
                level: 10,
                race: "Zombie",
                attribute: "LIGHT"
            },
            // Tearlaments
            {
                id: 572850,
                name: "Tearlaments Scheiren",
                type: "Effect Monster",
                desc: "You can Fusion Summon 1 \"Tearlaments\" Fusion Monster from your Extra Deck, using monsters from your hand or field as material.",
                atk: 1500,
                def: 1000,
                level: 4,
                race: "Aqua",
                attribute: "WATER"
            }
        ];
    }

    // Format fallback card data
    formatFallbackCard(card) {
        return {
            id: card.id,
            name: card.name,
            type: card.type,
            desc: card.desc,
            atk: card.atk,
            def: card.def,
            level: card.level,
            race: card.race,
            attribute: card.attribute,
            image: `https://images.ygoprodeck.com/images/cards/${card.id}.jpg`,
            imageSmall: `https://images.ygoprodeck.com/images/cards/${card.id}_small.jpg`
        };
    }

    // Simple price calculation
    getSimpleCardPrice(card) {
        let basePrice = 1.0;
        
        if (card.type && card.type.includes('Monster')) {
            if (card.atk >= 3000) basePrice += 2.0;
            else if (card.atk >= 2500) basePrice += 1.5;
            else if (card.atk >= 2000) basePrice += 1.0;
        }
        
        if (card.type && card.type.includes('Spell')) basePrice += 0.5;
        if (card.type && card.type.includes('Trap')) basePrice += 0.5;
        
        // Add some randomness
        basePrice += Math.random() * 2;
        
        return Math.max(0.25, basePrice);
    }

    // Search Functionality
    setupSearch() {
        const searchInput = document.getElementById('card-search');
        if (searchInput) {
            // Create search results dropdown
            const searchResults = document.createElement('div');
            searchResults.className = 'search-results';
            searchResults.style.display = 'none';
            searchInput.parentNode.appendChild(searchResults);
        }
    }

    async performLiveSearch(query) {
        if (!query || query.length < 2) {
            this.hideSearchResults();
            return;
        }

        try {
            const cards = await this.apiService.searchCards(query);
            this.showSearchResults(cards.slice(0, 8)); // Show top 8 results
        } catch (error) {
            console.error('Search error:', error);
        }
    }

    showSearchResults(cards) {
        const searchResults = document.querySelector('.search-results');
        if (!searchResults) return;

        if (cards.length === 0) {
            searchResults.innerHTML = '<div class="search-result-item">No cards found</div>';
        } else {
            searchResults.innerHTML = cards.map(card => {
                const formattedCard = this.apiService.formatCardForDisplay(card);
                const price = this.getCardPrice(formattedCard);
                
                return `
                    <div class="search-result-item" onclick="yugiohStore.showCardDetails(${card.id})">
                        <img src="${formattedCard.imageSmall}" alt="${formattedCard.name}" class="search-result-image">
                        <div class="search-result-info">
                            <h4>${formattedCard.name}</h4>
                            <p>${formattedCard.type}</p>
                            <span class="search-result-price">$${price.toFixed(2)}</span>
                        </div>
                    </div>
                `;
            }).join('');
        }

        searchResults.style.display = 'block';
    }

    hideSearchResults() {
        const searchResults = document.querySelector('.search-results');
        if (searchResults) {
            searchResults.style.display = 'none';
        }
    }

    async performSearch() {
        const searchInput = document.getElementById('card-search');
        if (!searchInput || !searchInput.value.trim()) return;

        const query = searchInput.value.trim();
        
        // For now, just show an alert. In a full implementation, this would navigate to a search results page
        this.showNotification(`Searching for "${query}"...`, 'info');
        
        try {
            const cards = await this.apiService.searchCards(query);
            console.log(`Found ${cards.length} cards for "${query}"`);
            // TODO: Navigate to search results page or update current page with results
        } catch (error) {
            this.showNotification('Search failed. Please try again.', 'error');
        }
    }

    // Card Details
    async showCardDetails(cardId) {
        // Navigate to product page instead of showing modal
        window.location.href = `product.html?id=${cardId}`;
    }

    async showCardDetailsModal(cardId) {
        try {
            this.showNotification('Loading card details...', 'info');
            
            const card = await this.apiService.getCardById(cardId);
            const formattedCard = this.apiService.formatCardForDisplay(card);
            const pricing = await this.apiService.getTCGPlayerPricing(cardId);
            
            this.openCardModal(formattedCard, pricing);
        } catch (error) {
            console.error('Error loading card details:', error);
            this.showNotification('Unable to load card details', 'error');
        }
    }

    openCardModal(card, pricing) {
        // Create modal HTML
        const modalHTML = `
            <div class="card-modal" onclick="this.remove()">
                <div class="card-modal-content" onclick="event.stopPropagation()">
                    <button class="modal-close" onclick="this.closest('.card-modal').remove()">×</button>
                    <div class="card-modal-body">
                        <div class="card-modal-image">
                            <img src="${card.image}" alt="${card.name}" class="modal-card-image">
                        </div>
                        <div class="card-modal-info">
                            <h2>${card.name}</h2>
                            <p class="card-modal-type">${card.type}</p>
                            ${card.atk !== undefined ? `<p><strong>ATK:</strong> ${card.atk} <strong>DEF:</strong> ${card.def}</p>` : ''}
                            ${card.level ? `<p><strong>Level:</strong> ${card.level}</p>` : ''}
                            ${card.race ? `<p><strong>Race:</strong> ${card.race}</p>` : ''}
                            ${card.attribute ? `<p><strong>Attribute:</strong> ${card.attribute}</p>` : ''}
                            <div class="card-description">
                                <p>${card.desc}</p>
                            </div>
                            <div class="card-pricing">
                                <h3>Pricing</h3>
                                <div class="condition-prices">
                                    ${this.generateConditionPricing(card, pricing)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
    }

    generateConditionPricing(card, pricing) {
        const conditions = ['near_mint', 'lightly_played', 'moderately_played', 'heavily_played', 'damaged'];
        
        return conditions.map(condition => {
            const price = this.getCardPrice(card, condition);
            const conditionName = this.formatCondition(condition);
            
            return `
                <div class="condition-price-row">
                    <span class="condition-name">${conditionName}</span>
                    <span class="condition-price">$${price.toFixed(2)}</span>
                    <button class="add-to-cart-btn" onclick="yugiohStore.addToCart(${JSON.stringify(card).replace(/"/g, '&quot;')}, '${condition}')">
                        Add to Cart
                    </button>
                </div>
            `;
        }).join('');
    }

    // Utility Functions
    formatPrice(amount, currency = 'CAD') {
        return new Intl.NumberFormat('en-CA', {
            style: 'currency',
            currency: currency
        }).format(amount);
    }

    async getCardPrice(card, condition = 'near_mint') {
        try {
            // Try to get real pricing data first
            const pricing = await this.apiService.getTCGPlayerPricing(card.id);
            
            if (pricing && pricing.pricing && pricing.pricing[condition]) {
                return pricing.pricing[condition].market || pricing.pricing[condition].low || 1.0;
            }
            
            // Fallback to calculated pricing
            const basePrice = this.apiService.calculateBasePrice(card);
            const conditionMultipliers = {
                'near_mint': 1.0,
                'lightly_played': 0.85,
                'moderately_played': 0.70,
                'heavily_played': 0.55,
                'damaged': 0.40
            };
            
            return Math.max(0.25, basePrice * conditionMultipliers[condition]);
        } catch (error) {
            console.error('Error getting card price:', error);
            // Fallback to basic calculation
            const basePrice = this.apiService.calculateBasePrice(card);
            const conditionMultipliers = {
                'near_mint': 1.0,
                'lightly_played': 0.85,
                'moderately_played': 0.70,
                'heavily_played': 0.55,
                'damaged': 0.40
            };
            
            return Math.max(0.25, basePrice * conditionMultipliers[condition]);
        }
    }

    formatCondition(condition) {
        const conditionNames = {
            'near_mint': 'Near Mint',
            'lightly_played': 'Lightly Played',
            'moderately_played': 'Moderately Played',
            'heavily_played': 'Heavily Played',
            'damaged': 'Damaged'
        };
        
        return conditionNames[condition] || condition;
    }

    // Archetype browsing
    browseArchetype(archetype) {
        this.showNotification(`Browsing ${archetype} cards...`, 'info');
        // TODO: Navigate to archetype page or filter current results
        console.log(`Browsing archetype: ${archetype}`);
    }

    // User Authentication (placeholder)
    showLogin() {
        this.showNotification('Login system coming soon!', 'info');
        // TODO: Implement login modal
    }

    // Notifications
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '100px',
            right: '20px',
            background: type === 'error' ? 'var(--danger-color)' : 
                       type === 'success' ? 'var(--success-color)' : 
                       type === 'warning' ? 'var(--warning-color)' : 'var(--primary-color)',
            color: 'white',
            padding: '1rem 1.5rem',
            borderRadius: 'var(--border-radius)',
            zIndex: '3000',
            boxShadow: 'var(--shadow-hover)',
            transform: 'translateX(400px)',
            transition: 'transform 0.3s ease',
            fontSize: '0.9rem',
            fontWeight: '500',
            maxWidth: '350px'
        });
        
        notification.querySelector('.notification-content').style.cssText = `
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
        `;
        
        notification.querySelector('.notification-close').style.cssText = `
            background: none;
            border: none;
            color: white;
            font-size: 1.2rem;
            cursor: pointer;
            padding: 0;
            line-height: 1;
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Auto remove after 4 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }
}

// Global functions for HTML onclick handlers
function openCart() {
    if (window.yugiohStore) {
        window.yugiohStore.openCart();
    }
}

function closeCart() {
    if (window.yugiohStore) {
        window.yugiohStore.closeCart();
    }
}

function performSearch() {
    if (window.yugiohStore) {
        window.yugiohStore.performSearch();
    }
}

function showLogin() {
    if (window.yugiohStore) {
        window.yugiohStore.showLogin();
    }
}

function browseArchetype(archetype) {
    if (window.yugiohStore) {
        window.yugiohStore.browseArchetype(archetype);
    }
}

function applyDiscountCode() {
    const discountInput = document.getElementById('discount-code');
    if (discountInput && window.yugiohStore) {
        const code = discountInput.value.trim();
        if (code) {
            const discount = window.yugiohStore.applyDiscount(code);
            if (discount > 0) {
                window.yugiohStore.updateCartTotals(discount);
                discountInput.value = '';
            }
        }
    }
}

// Initialize the store when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.yugiohStore = new YugiohStore();
});

// Handle page visibility changes to refresh data
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && window.yugiohStore) {
        // Refresh cart display when page becomes visible
        window.yugiohStore.updateCartDisplay();
    }
});
