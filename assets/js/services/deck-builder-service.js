/**
 * Deck Builder Service
 * Comprehensive deck building functionality similar to YGOProDeck and Dueling Book
 */

class DeckBuilderService {
    constructor() {
        this.apiBaseURL = 'https://db.ygoprodeck.com/api/v7';
        this.currentDeck = {
            main: [],
            extra: [],
            side: []
        };
        this.deckMetadata = {
            name: 'Untitled Deck',
            description: '',
            author: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        this.searchResults = [];
        this.cardDatabase = new Map();
        this.deckHistory = [];
        this.maxHistorySize = 50;
        
        this.init();
    }

    init() {
        this.loadSavedDecks();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 's':
                        e.preventDefault();
                        this.saveDeck();
                        break;
                    case 'o':
                        e.preventDefault();
                        this.openLoadDeckModal();
                        break;
                    case 'n':
                        e.preventDefault();
                        this.newDeck();
                        break;
                    case 'z':
                        e.preventDefault();
                        this.undo();
                        break;
                    case 'y':
                        e.preventDefault();
                        this.redo();
                        break;
                }
            }
        });
    }

    // Deck Management
    newDeck() {
        this.saveToHistory();
        this.currentDeck = {
            main: [],
            extra: [],
            side: []
        };
        this.deckMetadata = {
            name: 'Untitled Deck',
            description: '',
            author: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        this.updateDeckDisplay();
        this.updateDeckStats();
    }

    async loadDeck(deckData) {
        this.saveToHistory();
        
        if (typeof deckData === 'string') {
            // Load from YDK format
            await this.loadFromYDK(deckData);
        } else {
            // Load from JSON format
            this.currentDeck = deckData.deck || { main: [], extra: [], side: [] };
            this.deckMetadata = deckData.metadata || this.deckMetadata;
        }
        
        this.updateDeckDisplay();
        this.updateDeckStats();
        this.calculateDeckPrice();
    }

    saveDeck() {
        const deckData = {
            deck: this.currentDeck,
            metadata: {
                ...this.deckMetadata,
                updatedAt: new Date().toISOString()
            }
        };
        
        const savedDecks = this.getSavedDecks();
        const deckId = this.deckMetadata.id || Date.now().toString();
        
        if (!this.deckMetadata.id) {
            this.deckMetadata.id = deckId;
        }
        
        savedDecks[deckId] = deckData;
        localStorage.setItem('tcg-saved-decks', JSON.stringify(savedDecks));
        
        this.showToast(`Deck "${this.deckMetadata.name}" saved successfully!`, 'success');
        return deckId;
    }

    getSavedDecks() {
        return JSON.parse(localStorage.getItem('tcg-saved-decks') || '{}');
    }

    loadSavedDecks() {
        return this.getSavedDecks();
    }

    deleteDeck(deckId) {
        const savedDecks = this.getSavedDecks();
        delete savedDecks[deckId];
        localStorage.setItem('tcg-saved-decks', JSON.stringify(savedDecks));
        this.showToast('Deck deleted successfully!', 'info');
    }

    // YDK File Support
    exportToYDK() {
        let ydkContent = '#created by Firelight Duel Academy Deck Builder\n';
        ydkContent += `#main\n`;
        
        this.currentDeck.main.forEach(card => {
            for (let i = 0; i < card.quantity; i++) {
                ydkContent += `${card.id}\n`;
            }
        });
        
        ydkContent += `#extra\n`;
        this.currentDeck.extra.forEach(card => {
            for (let i = 0; i < card.quantity; i++) {
                ydkContent += `${card.id}\n`;
            }
        });
        
        ydkContent += `!side\n`;
        this.currentDeck.side.forEach(card => {
            for (let i = 0; i < card.quantity; i++) {
                ydkContent += `${card.id}\n`;
            }
        });
        
        return ydkContent;
    }

    async loadFromYDK(ydkContent) {
        const lines = ydkContent.split('\n');
        let currentSection = null;
        const cardIds = { main: [], extra: [], side: [] };
        
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('#main')) {
                currentSection = 'main';
            } else if (trimmed.startsWith('#extra')) {
                currentSection = 'extra';
            } else if (trimmed.startsWith('!side')) {
                currentSection = 'side';
            } else if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('!') && currentSection) {
                const cardId = parseInt(trimmed);
                if (!isNaN(cardId)) {
                    cardIds[currentSection].push(cardId);
                }
            }
        }
        
        // Convert card IDs to card objects with quantities
        this.currentDeck = { main: [], extra: [], side: [] };
        
        for (const section of ['main', 'extra', 'side']) {
            const idCounts = {};
            cardIds[section].forEach(id => {
                idCounts[id] = (idCounts[id] || 0) + 1;
            });
            
            for (const [cardId, quantity] of Object.entries(idCounts)) {
                try {
                    const cardData = await this.getCardById(parseInt(cardId));
                    if (cardData) {
                        this.currentDeck[section].push({
                            ...cardData,
                            quantity: quantity
                        });
                    }
                } catch (error) {
                    console.warn(`Could not load card with ID ${cardId}:`, error);
                }
            }
        }
    }

    downloadYDK() {
        const ydkContent = this.exportToYDK();
        const blob = new Blob([ydkContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.deckMetadata.name.replace(/[^a-z0-9]/gi, '_')}.ydk`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showToast('YDK file downloaded!', 'success');
    }

    // Card Search and Database
    async searchCards(query, filters = {}) {
        try {
            let url = `${this.apiBaseURL}/cardinfo.php?`;
            const params = new URLSearchParams();
            
            if (query) {
                params.append('fname', query);
            }
            
            if (filters.type) {
                params.append('type', filters.type);
            }
            
            if (filters.race) {
                params.append('race', filters.race);
            }
            
            if (filters.attribute) {
                params.append('attribute', filters.attribute);
            }
            
            if (filters.level) {
                params.append('level', filters.level);
            }
            
            if (filters.archetype) {
                params.append('archetype', filters.archetype);
            }
            
            const response = await fetch(url + params.toString());
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const result = await response.json();
            this.searchResults = result.data || [];
            
            // Cache cards in database
            this.searchResults.forEach(card => {
                this.cardDatabase.set(card.id, card);
            });
            
            return this.searchResults;
        } catch (error) {
            console.error('Search error:', error);
            return [];
        }
    }

    async getCardById(cardId) {
        // Check cache first
        if (this.cardDatabase.has(cardId)) {
            return this.cardDatabase.get(cardId);
        }
        
        try {
            const response = await fetch(`${this.apiBaseURL}/cardinfo.php?id=${cardId}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const result = await response.json();
            const card = result.data ? result.data[0] : null;
            
            if (card) {
                this.cardDatabase.set(cardId, card);
            }
            
            return card;
        } catch (error) {
            console.error(`Error fetching card ${cardId}:`, error);
            return null;
        }
    }

    // Deck Building Operations
    addCardToDeck(card, section = 'main', quantity = 1) {
        this.saveToHistory();
        
        const targetSection = this.currentDeck[section];
        const existingCard = targetSection.find(c => c.id === card.id);
        
        if (existingCard) {
            const maxQuantity = this.getMaxQuantity(card, section);
            existingCard.quantity = Math.min(existingCard.quantity + quantity, maxQuantity);
        } else {
            const maxQuantity = this.getMaxQuantity(card, section);
            targetSection.push({
                ...card,
                quantity: Math.min(quantity, maxQuantity)
            });
        }
        
        this.updateDeckDisplay();
        this.updateDeckStats();
        this.calculateDeckPrice();
    }

    removeCardFromDeck(cardId, section, quantity = 1) {
        this.saveToHistory();
        
        const targetSection = this.currentDeck[section];
        const cardIndex = targetSection.findIndex(c => c.id === cardId);
        
        if (cardIndex !== -1) {
            const card = targetSection[cardIndex];
            card.quantity -= quantity;
            
            if (card.quantity <= 0) {
                targetSection.splice(cardIndex, 1);
            }
        }
        
        this.updateDeckDisplay();
        this.updateDeckStats();
        this.calculateDeckPrice();
    }

    moveCard(cardId, fromSection, toSection, quantity = 1) {
        const fromDeck = this.currentDeck[fromSection];
        const cardIndex = fromDeck.findIndex(c => c.id === cardId);
        
        if (cardIndex !== -1) {
            const card = fromDeck[cardIndex];
            const moveQuantity = Math.min(quantity, card.quantity);
            
            // Remove from source
            this.removeCardFromDeck(cardId, fromSection, moveQuantity);
            
            // Add to destination
            this.addCardToDeck(card, toSection, moveQuantity);
        }
    }

    getMaxQuantity(card, section) {
        // Check banlist restrictions
        const banlistLimit = this.getBanlistLimit(card);
        
        // Extra deck cards have different limits
        if (section === 'extra') {
            return Math.min(banlistLimit, 15); // Extra deck limit
        }
        
        return Math.min(banlistLimit, 3); // Normal limit
    }

    getBanlistLimit(card) {
        // This would normally check against a banlist API or database
        // For now, return default limit of 3
        // TODO: Implement actual banlist checking
        return 3;
    }

    // Deck Statistics
    getDeckStats() {
        const stats = {
            main: {
                total: this.currentDeck.main.reduce((sum, card) => sum + card.quantity, 0),
                monsters: 0,
                spells: 0,
                traps: 0
            },
            extra: {
                total: this.currentDeck.extra.reduce((sum, card) => sum + card.quantity, 0),
                fusion: 0,
                synchro: 0,
                xyz: 0,
                link: 0
            },
            side: {
                total: this.currentDeck.side.reduce((sum, card) => sum + card.quantity, 0)
            }
        };
        
        // Count card types in main deck
        this.currentDeck.main.forEach(card => {
            if (card.type.includes('Monster')) {
                stats.main.monsters += card.quantity;
            } else if (card.type.includes('Spell')) {
                stats.main.spells += card.quantity;
            } else if (card.type.includes('Trap')) {
                stats.main.traps += card.quantity;
            }
        });
        
        // Count extra deck types
        this.currentDeck.extra.forEach(card => {
            if (card.type.includes('Fusion')) {
                stats.extra.fusion += card.quantity;
            } else if (card.type.includes('Synchro')) {
                stats.extra.synchro += card.quantity;
            } else if (card.type.includes('Xyz')) {
                stats.extra.xyz += card.quantity;
            } else if (card.type.includes('Link')) {
                stats.extra.link += card.quantity;
            }
        });
        
        return stats;
    }

    updateDeckStats() {
        const stats = this.getDeckStats();
        const statsContainer = document.getElementById('deck-stats');
        
        if (statsContainer) {
            statsContainer.innerHTML = this.generateDeckStatsHTML(stats);
        }
    }

    generateDeckStatsHTML(stats) {
        return `
            <div class="deck-stats-grid">
                <div class="stat-card">
                    <h4>Main Deck</h4>
                    <div class="stat-number ${stats.main.total < 40 ? 'invalid' : stats.main.total > 60 ? 'invalid' : 'valid'}">${stats.main.total}</div>
                    <div class="stat-breakdown">
                        <span>Monsters: ${stats.main.monsters}</span>
                        <span>Spells: ${stats.main.spells}</span>
                        <span>Traps: ${stats.main.traps}</span>
                    </div>
                </div>
                
                <div class="stat-card">
                    <h4>Extra Deck</h4>
                    <div class="stat-number ${stats.extra.total > 15 ? 'invalid' : 'valid'}">${stats.extra.total}</div>
                    <div class="stat-breakdown">
                        <span>Fusion: ${stats.extra.fusion}</span>
                        <span>Synchro: ${stats.extra.synchro}</span>
                        <span>Xyz: ${stats.extra.xyz}</span>
                        <span>Link: ${stats.extra.link}</span>
                    </div>
                </div>
                
                <div class="stat-card">
                    <h4>Side Deck</h4>
                    <div class="stat-number ${stats.side.total > 15 ? 'invalid' : 'valid'}">${stats.side.total}</div>
                </div>
            </div>
        `;
    }

    // Deck Pricing
    async calculateDeckPrice() {
        let totalPrice = 0;
        const priceBreakdown = { main: 0, extra: 0, side: 0 };
        
        for (const section of ['main', 'extra', 'side']) {
            for (const card of this.currentDeck[section]) {
                const price = await this.getCardPrice(card);
                const cardTotal = price * card.quantity;
                priceBreakdown[section] += cardTotal;
                totalPrice += cardTotal;
            }
        }
        
        this.updatePriceDisplay(totalPrice, priceBreakdown);
        return { total: totalPrice, breakdown: priceBreakdown };
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
                    let usdPrice = parseFloat(prices.tcgplayer_price) || 
                                  parseFloat(prices.ebay_price) || 
                                  parseFloat(prices.amazon_price) || 
                                  parseFloat(prices.coolstuffinc_price);
                    
                    if (usdPrice && usdPrice > 0) {
                        // Convert USD to CAD
                        return usdPrice * 1.35;
                    }
                }
            }
        } catch (error) {
            console.warn('Error fetching price:', error);
        }
        
        // Fallback to mock pricing
        return this.getMockPrice(card);
    }

    getMockPrice(card) {
        const hash = this.hashCode(card.name);
        const basePrice = Math.abs(hash % 30) + 1;
        
        if (card.name.includes('Ash') || card.name.includes('Snake-Eye')) {
            return basePrice * 3.0 + 20;
        } else if (card.type.includes('Extra Deck')) {
            return basePrice * 2.0 + 10;
        } else {
            return basePrice * 1.35 + 2;
        }
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

    updatePriceDisplay(totalPrice, breakdown) {
        const priceContainer = document.getElementById('deck-price');
        if (priceContainer) {
            priceContainer.innerHTML = `
                <div class="price-summary">
                    <h4>Deck Price</h4>
                    <div class="total-price">$${totalPrice.toFixed(2)} CAD</div>
                    <div class="price-breakdown">
                        <div>Main: $${breakdown.main.toFixed(2)}</div>
                        <div>Extra: $${breakdown.extra.toFixed(2)}</div>
                        <div>Side: $${breakdown.side.toFixed(2)}</div>
                    </div>
                    <button class="primary-btn" onclick="deckBuilder.addDeckToCart()">
                        Add Deck to Cart
                    </button>
                </div>
            `;
        }
    }

    addDeckToCart() {
        if (!window.tcgStore) {
            this.showToast('Shopping cart not available', 'error');
            return;
        }
        
        let addedCount = 0;
        
        for (const section of ['main', 'extra', 'side']) {
            for (const card of this.currentDeck[section]) {
                for (let i = 0; i < card.quantity; i++) {
                    window.tcgStore.addToCart(card.name, this.getMockPrice(card), this.getCardImageURL(card));
                    addedCount++;
                }
            }
        }
        
        this.showToast(`${addedCount} cards added to cart!`, 'success');
    }

    getCardImageURL(card) {
        if (card.card_images && card.card_images.length > 0) {
            return card.card_images[0].image_url;
        }
        return 'https://images.ygoprodeck.com/images/cards/back.jpg';
    }

    // History Management (Undo/Redo)
    saveToHistory() {
        const state = {
            deck: JSON.parse(JSON.stringify(this.currentDeck)),
            metadata: JSON.parse(JSON.stringify(this.deckMetadata)),
            timestamp: Date.now()
        };
        
        this.deckHistory.push(state);
        
        if (this.deckHistory.length > this.maxHistorySize) {
            this.deckHistory.shift();
        }
    }

    undo() {
        if (this.deckHistory.length > 0) {
            const previousState = this.deckHistory.pop();
            this.currentDeck = previousState.deck;
            this.deckMetadata = previousState.metadata;
            this.updateDeckDisplay();
            this.updateDeckStats();
            this.calculateDeckPrice();
            this.showToast('Undo successful', 'info');
        }
    }

    // UI Updates
    updateDeckDisplay() {
        this.updateDeckSection('main');
        this.updateDeckSection('extra');
        this.updateDeckSection('side');
    }

    updateDeckSection(section) {
        const container = document.getElementById(`${section}-deck`);
        if (!container) return;
        
        const cards = this.currentDeck[section];
        container.innerHTML = cards.map(card => this.generateDeckCardHTML(card, section)).join('');
    }

    generateDeckCardHTML(card, section) {
        const imageUrl = this.getCardImageURL(card);
        
        return `
            <div class="deck-card" data-card-id="${card.id}" data-section="${section}">
                <div class="deck-card-image">
                    <img src="${imageUrl}" alt="${card.name}" loading="lazy">
                    <div class="card-quantity">${card.quantity}</div>
                </div>
                <div class="deck-card-info">
                    <div class="card-name">${card.name}</div>
                    <div class="card-type">${this.getCardTypeDisplay(card)}</div>
                </div>
                <div class="deck-card-controls">
                    <button onclick="deckBuilder.removeCardFromDeck(${card.id}, '${section}', 1)" title="Remove one">-</button>
                    <button onclick="deckBuilder.addCardToDeck(${JSON.stringify(card).replace(/"/g, '&quot;')}, '${section}', 1)" title="Add one">+</button>
                    <button onclick="deckBuilder.removeCardFromDeck(${card.id}, '${section}', ${card.quantity})" title="Remove all">×</button>
                </div>
            </div>
        `;
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

    // Utility Methods
    showToast(message, type = 'info') {
        if (window.tcgStore && typeof window.tcgStore.showToast === 'function') {
            window.tcgStore.showToast(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    // Modal Management
    openLoadDeckModal() {
        this.createLoadDeckModal();
    }

    createLoadDeckModal() {
        const modal = document.createElement('div');
        modal.id = 'load-deck-modal';
        modal.className = 'deck-modal';
        modal.innerHTML = this.generateLoadDeckModalHTML();
        document.body.appendChild(modal);
        
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    generateLoadDeckModalHTML() {
        const savedDecks = this.getSavedDecks();
        
        return `
            <div class="deck-modal-overlay" onclick="deckBuilder.closeLoadDeckModal()">
                <div class="deck-modal-content" onclick="event.stopPropagation()">
                    <div class="deck-modal-header">
                        <h2>Load Deck</h2>
                        <button onclick="deckBuilder.closeLoadDeckModal()">×</button>
                    </div>
                    <div class="deck-modal-body">
                        <div class="load-options">
                            <div class="load-section">
                                <h3>Saved Decks</h3>
                                <div class="saved-decks-list">
                                    ${Object.entries(savedDecks).map(([id, deck]) => `
                                        <div class="saved-deck-item">
                                            <div class="deck-info">
                                                <div class="deck-name">${deck.metadata.name}</div>
                                                <div class="deck-date">${new Date(deck.metadata.updatedAt).toLocaleDateString()}</div>
                                            </div>
                                            <div class="deck-actions">
                                                <button onclick="deckBuilder.loadSavedDeck('${id}')">Load</button>
                                                <button onclick="deckBuilder.deleteDeck('${id}')" class="delete-btn">Delete</button>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                            
                            <div class="load-section">
                                <h3>Import YDK File</h3>
                                <input type="file" id="ydk-file-input" accept=".ydk" onchange="deckBuilder.handleYDKUpload(event)">
                                <label for="ydk-file-input" class="file-upload-btn">Choose YDK File</label>
                            </div>
                            
                            <div class="load-section">
                                <h3>Paste YDK Content</h3>
                                <textarea id="ydk-content" placeholder="Paste YDK file content here..." rows="10"></textarea>
                                <button onclick="deckBuilder.loadFromYDKContent()">Load from YDK</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    closeLoadDeckModal() {
        const modal = document.getElementById('load-deck-modal');
        if (modal) {
            modal.remove();
            document.body.style.overflow = '';
        }
    }

    loadSavedDeck(deckId) {
        const savedDecks = this.getSavedDecks();
        const deckData = savedDecks[deckId];
        
        if (deckData) {
            this.loadDeck(deckData);
            this.closeLoadDeckModal();
            this.showToast(`Deck "${deckData.metadata.name}" loaded!`, 'success');
        }
    }

    handleYDKUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.loadFromYDK(e.target.result);
                this.closeLoadDeckModal();
                this.showToast('YDK file loaded!', 'success');
            };
            reader.readAsText(file);
        }
    }

    loadFromYDKContent() {
        const content = document.getElementById('ydk-content').value;
        if (content.trim()) {
            this.loadFromYDK(content);
            this.closeLoadDeckModal();
            this.showToast('YDK content loaded!', 'success');
        }
    }
}

// Initialize deck builder when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.hash.includes('decks')) {
        window.deckBuilder = new DeckBuilderService();
    }
});
