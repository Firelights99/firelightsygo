// Product Page JavaScript - Enhanced Card Display and Functionality
class ProductPage {
    constructor() {
        this.currentCard = null;
        this.currentQuantity = 1;
        this.currentCondition = 'near_mint';
        this.apiService = new YugiohApiService();
        this.tcgPlayerService = new TCGPlayerApiService();
        this.init();
    }

    async init() {
        // Get card ID from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const cardId = urlParams.get('id');
        const cardName = urlParams.get('name');

        if (cardId) {
            await this.loadCardById(cardId);
        } else if (cardName) {
            await this.loadCardByName(cardName);
        } else {
            this.showError('No card specified');
            return;
        }

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Image zoom functionality
        const mainImage = document.getElementById('main-card-image');
        if (mainImage) {
            mainImage.addEventListener('click', () => this.openImageZoom());
        }

        // Thumbnail switching
        const thumbnails = document.querySelectorAll('.thumbnail');
        thumbnails.forEach(thumb => {
            thumb.addEventListener('click', (e) => this.switchImage(e.target));
        });

        // Quantity controls
        const quantityInput = document.getElementById('quantity');
        if (quantityInput) {
            quantityInput.addEventListener('change', (e) => {
                this.currentQuantity = parseInt(e.target.value) || 1;
            });
        }

        // Condition selector
        const conditionSelect = document.getElementById('condition');
        if (conditionSelect) {
            conditionSelect.addEventListener('change', (e) => {
                this.currentCondition = e.target.value;
                this.updatePricing();
            });
        }

        // Close modals on outside click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }

    async loadCardById(cardId) {
        try {
            this.showLoading();
            const card = await this.apiService.getCardById(cardId);
            
            if (!card) {
                this.showError('Card not found');
                return;
            }

            this.currentCard = this.apiService.formatCardForDisplay(card);
            await this.displayCard();
            await this.loadRelatedCards();
        } catch (error) {
            console.error('Error loading card:', error);
            this.showError('Failed to load card details');
        }
    }

    async loadCardByName(cardName) {
        try {
            this.showLoading();
            const cards = await this.apiService.searchCards(cardName);
            
            if (!cards || cards.length === 0) {
                this.showError('Card not found');
                return;
            }

            // Find exact match or use first result
            const card = cards.find(c => c.name.toLowerCase() === cardName.toLowerCase()) || cards[0];
            this.currentCard = this.apiService.formatCardForDisplay(card);
            await this.displayCard();
            await this.loadRelatedCards();
        } catch (error) {
            console.error('Error loading card:', error);
            this.showError('Failed to load card details');
        }
    }

    async displayCard() {
        if (!this.currentCard) return;

        // Update page title and breadcrumb
        document.title = `${this.currentCard.name} - Firelight Duel Academy`;
        const breadcrumbName = document.getElementById('breadcrumb-card-name');
        if (breadcrumbName) {
            breadcrumbName.textContent = this.currentCard.name;
        }

        // Display card images
        this.displayImages();

        // Display card information
        this.displayCardInfo();

        // Display card stats
        this.displayCardStats();

        // Load and display pricing
        await this.loadPricing();

        // Display card description
        this.displayDescription();

        // Display set information
        this.displaySetInfo();

        // Show the content
        this.showContent();
    }

    displayImages() {
        const mainImage = document.getElementById('main-card-image');
        const thumbNormal = document.getElementById('thumb-normal');
        const thumbCropped = document.getElementById('thumb-cropped');

        if (mainImage && this.currentCard.image) {
            mainImage.src = this.currentCard.image;
            mainImage.alt = this.currentCard.name;
        }

        if (thumbNormal && this.currentCard.image) {
            thumbNormal.src = this.currentCard.image;
            thumbNormal.alt = `${this.currentCard.name} - Normal view`;
        }

        if (thumbCropped && this.currentCard.imageSmall) {
            thumbCropped.src = this.currentCard.imageSmall;
            thumbCropped.alt = `${this.currentCard.name} - Cropped view`;
        }
    }

    displayCardInfo() {
        const title = document.getElementById('product-title');
        const type = document.getElementById('product-type');
        const rarity = document.getElementById('product-rarity');

        if (title) title.textContent = this.currentCard.name;
        if (type) {
            type.textContent = this.currentCard.type;
            // Add card type class for styling
            document.body.className = this.getCardTypeClass(this.currentCard.type);
        }
        if (rarity && this.currentCard.rarity) {
            rarity.textContent = this.currentCard.rarity;
            rarity.className = `product-rarity ${this.getRarityClass(this.currentCard.rarity)}`;
        }
    }

    displayCardStats() {
        const statsContainer = document.getElementById('card-stats');
        if (!statsContainer) return;

        const stats = [];

        // Add relevant stats based on card type
        if (this.currentCard.atk !== undefined) {
            stats.push({ label: 'ATK', value: this.currentCard.atk });
        }
        if (this.currentCard.def !== undefined) {
            stats.push({ label: 'DEF', value: this.currentCard.def });
        }
        if (this.currentCard.level) {
            stats.push({ label: 'Level', value: this.currentCard.level });
        }
        if (this.currentCard.race) {
            stats.push({ label: 'Race', value: this.currentCard.race });
        }
        if (this.currentCard.attribute) {
            stats.push({ label: 'Attribute', value: this.currentCard.attribute });
        }

        if (stats.length > 0) {
            statsContainer.innerHTML = `
                <div class="stats-grid">
                    ${stats.map(stat => `
                        <div class="stat-item">
                            <div class="stat-label">${stat.label}</div>
                            <div class="stat-value">${stat.value}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            statsContainer.style.display = 'none';
        }
    }

    async loadPricing() {
        const pricingTable = document.getElementById('pricing-table');
        if (!pricingTable) return;

        try {
            // Show loading state
            pricingTable.innerHTML = '<div class="loading-spinner"></div>';

            // Get pricing from store
            const pricing = await this.getPricingForAllConditions();

            // Create pricing table
            const conditions = [
                { key: 'near_mint', name: 'Near Mint' },
                { key: 'lightly_played', name: 'Lightly Played' },
                { key: 'moderately_played', name: 'Moderately Played' },
                { key: 'heavily_played', name: 'Heavily Played' },
                { key: 'damaged', name: 'Damaged' }
            ];

            const pricingHTML = `
                <div class="pricing-row pricing-header">
                    <div>Condition</div>
                    <div>Price</div>
                    <div>Stock</div>
                    <div>Action</div>
                </div>
                ${conditions.map(condition => {
                    const price = pricing[condition.key] || 0;
                    const stock = this.getStockStatus(condition.key);
                    
                    return `
                        <div class="pricing-row">
                            <div class="condition-name">${condition.name}</div>
                            <div class="condition-price">$${price.toFixed(2)}</div>
                            <div class="stock-status ${stock.class}">${stock.text}</div>
                            <div>
                                <button class="quick-add-btn" 
                                        onclick="productPage.quickAddToCart('${condition.key}')"
                                        ${stock.available ? '' : 'disabled'}>
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    `;
                }).join('')}
            `;

            pricingTable.innerHTML = pricingHTML;
        } catch (error) {
            console.error('Error loading pricing:', error);
            pricingTable.innerHTML = '<p class="error-message">Unable to load pricing information</p>';
        }
    }

    async getPricingForAllConditions() {
        const pricing = {};
        const conditions = ['near_mint', 'lightly_played', 'moderately_played', 'heavily_played', 'damaged'];

        for (const condition of conditions) {
            try {
                pricing[condition] = await window.yugiohStore.getCardPrice(this.currentCard, condition);
            } catch (error) {
                console.error(`Error getting price for ${condition}:`, error);
                pricing[condition] = 1.00; // Fallback price
            }
        }

        return pricing;
    }

    getStockStatus(condition) {
        // Simulate stock levels - in a real app, this would come from inventory
        const random = Math.random();
        if (random > 0.8) {
            return { class: 'out-of-stock', text: 'Out of Stock', available: false };
        } else if (random > 0.6) {
            return { class: 'low-stock', text: 'Low Stock', available: true };
        } else {
            return { class: 'in-stock', text: 'In Stock', available: true };
        }
    }

    displayDescription() {
        const descriptionText = document.getElementById('card-description-text');
        if (descriptionText && this.currentCard.desc) {
            descriptionText.textContent = this.currentCard.desc;
        }
    }

    displaySetInfo() {
        const setDetails = document.getElementById('set-details');
        if (!setDetails) return;

        const setInfo = [];

        if (this.currentCard.card_sets && this.currentCard.card_sets.length > 0) {
            const firstSet = this.currentCard.card_sets[0];
            if (firstSet.set_name) setInfo.push({ label: 'Set Name', value: firstSet.set_name });
            if (firstSet.set_code) setInfo.push({ label: 'Set Code', value: firstSet.set_code });
            if (firstSet.set_rarity) setInfo.push({ label: 'Rarity', value: firstSet.set_rarity });
            if (firstSet.set_price) setInfo.push({ label: 'Set Price', value: `$${firstSet.set_price}` });
        }

        if (this.currentCard.archetype) {
            setInfo.push({ label: 'Archetype', value: this.currentCard.archetype });
        }

        if (setInfo.length > 0) {
            setDetails.innerHTML = setInfo.map(info => `
                <div class="set-detail">
                    <span class="set-label">${info.label}:</span>
                    <span class="set-value">${info.value}</span>
                </div>
            `).join('');
        } else {
            document.getElementById('set-info').style.display = 'none';
        }
    }

    async loadRelatedCards() {
        const relatedContainer = document.getElementById('related-cards');
        if (!relatedContainer) return;

        try {
            let relatedCards = [];

            // Try to find cards from the same archetype
            if (this.currentCard.archetype) {
                const archetypeCards = await this.apiService.searchCards(this.currentCard.archetype);
                relatedCards = archetypeCards.filter(card => card.id !== this.currentCard.id).slice(0, 6);
            }

            // If no archetype cards, get random cards of the same type
            if (relatedCards.length === 0) {
                const typeCards = await this.apiService.getRandomCards(6);
                relatedCards = typeCards.filter(card => card.id !== this.currentCard.id);
            }

            if (relatedCards.length > 0) {
                const relatedHTML = await Promise.all(relatedCards.map(async (card) => {
                    const formattedCard = this.apiService.formatCardForDisplay(card);
                    const price = await window.yugiohStore.getCardPrice(formattedCard);
                    
                    return `
                        <div class="related-card" onclick="productPage.navigateToCard(${card.id})">
                            <img src="${formattedCard.imageSmall}" alt="${formattedCard.name}" class="related-card-image">
                            <div class="related-card-info">
                                <div class="related-card-name">${formattedCard.name}</div>
                                <div class="related-card-price">$${price.toFixed(2)}</div>
                            </div>
                        </div>
                    `;
                }));

                relatedContainer.innerHTML = relatedHTML.join('');
            } else {
                document.querySelector('.related-cards-section').style.display = 'none';
            }
        } catch (error) {
            console.error('Error loading related cards:', error);
            document.querySelector('.related-cards-section').style.display = 'none';
        }
    }

    // Event Handlers
    switchImage(thumbnail) {
        const mainImage = document.getElementById('main-card-image');
        if (mainImage && thumbnail.src) {
            mainImage.src = thumbnail.src;
            
            // Update active thumbnail
            document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
            thumbnail.classList.add('active');
        }
    }

    openImageZoom() {
        const modal = document.getElementById('image-zoom-modal');
        const zoomedImage = document.getElementById('zoomed-image');
        const mainImage = document.getElementById('main-card-image');

        if (modal && zoomedImage && mainImage) {
            zoomedImage.src = mainImage.src;
            zoomedImage.alt = mainImage.alt;
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    closeImageZoom() {
        const modal = document.getElementById('image-zoom-modal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    changeQuantity(delta) {
        const quantityInput = document.getElementById('quantity');
        if (quantityInput) {
            const newQuantity = Math.max(1, Math.min(99, this.currentQuantity + delta));
            quantityInput.value = newQuantity;
            this.currentQuantity = newQuantity;
        }
    }

    async updatePricing() {
        // Update pricing display when condition changes
        await this.loadPricing();
    }

    quickAddToCart(condition) {
        if (this.currentCard && window.yugiohStore) {
            window.yugiohStore.addToCart(this.currentCard, condition, 1);
        }
    }

    addCurrentCardToCart() {
        if (this.currentCard && window.yugiohStore) {
            window.yugiohStore.addToCart(this.currentCard, this.currentCondition, this.currentQuantity);
        }
    }

    navigateToCard(cardId) {
        window.location.href = `product.html?id=${cardId}`;
    }

    // Utility Methods
    getCardTypeClass(type) {
        if (!type) return '';
        
        const typeMap = {
            'Effect Monster': 'monster-card',
            'Normal Monster': 'monster-card',
            'Ritual Monster': 'monster-card',
            'Fusion Monster': 'fusion-card',
            'Synchro Monster': 'synchro-card',
            'XYZ Monster': 'xyz-card',
            'Link Monster': 'link-card',
            'Spell Card': 'spell-card',
            'Trap Card': 'trap-card'
        };

        return typeMap[type] || 'monster-card';
    }

    getRarityClass(rarity) {
        if (!rarity) return '';
        
        const rarityMap = {
            'Common': 'common-rarity',
            'Rare': 'rare-rarity',
            'Super Rare': 'super-rare-rarity',
            'Ultra Rare': 'ultra-rare-rarity',
            'Secret Rare': 'secret-rare-rarity'
        };

        return rarityMap[rarity] || 'common-rarity';
    }

    // State Management
    showLoading() {
        document.getElementById('product-loading').style.display = 'flex';
        document.getElementById('product-error').style.display = 'none';
        document.getElementById('product-content').style.display = 'none';
    }

    showError(message) {
        document.getElementById('product-loading').style.display = 'none';
        document.getElementById('product-error').style.display = 'flex';
        document.getElementById('product-content').style.display = 'none';
        
        const errorMessage = document.querySelector('.error-message p');
        if (errorMessage) {
            errorMessage.textContent = message;
        }
    }

    showContent() {
        document.getElementById('product-loading').style.display = 'none';
        document.getElementById('product-error').style.display = 'none';
        document.getElementById('product-content').style.display = 'block';
    }
}

// Global functions for HTML onclick handlers
function changeQuantity(delta) {
    if (window.productPage) {
        window.productPage.changeQuantity(delta);
    }
}

function addCurrentCardToCart() {
    if (window.productPage) {
        window.productPage.addCurrentCardToCart();
    }
}

function closeImageZoom() {
    if (window.productPage) {
        window.productPage.closeImageZoom();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.productPage = new ProductPage();
});
