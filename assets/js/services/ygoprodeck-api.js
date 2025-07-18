/**
 * YGOPRODeck API Service
 * Handles all interactions with the YGOPRODeck API for card data, images, and prices
 */

class YGOProDeckAPI {
    constructor() {
        this.baseURL = 'https://db.ygoprodeck.com/api/v7';
        this.cache = new Map();
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
    }

    /**
     * Get card data from cache or API
     */
    async getFromCacheOrAPI(url, cacheKey) {
        const cached = this.cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
            return cached.data;
        }

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            this.cache.set(cacheKey, {
                data: data,
                timestamp: Date.now()
            });
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            return null;
        }
    }

    /**
     * Get all cards or search by name
     */
    async getCards(searchParams = {}) {
        let url = `${this.baseURL}/cardinfo.php`;
        const params = new URLSearchParams();

        if (searchParams.name) {
            params.append('fname', searchParams.name);
        }
        if (searchParams.type) {
            params.append('type', searchParams.type);
        }
        if (searchParams.race) {
            params.append('race', searchParams.race);
        }
        if (searchParams.archetype) {
            params.append('archetype', searchParams.archetype);
        }
        if (searchParams.level) {
            params.append('level', searchParams.level);
        }
        if (searchParams.attribute) {
            params.append('attribute', searchParams.attribute);
        }

        if (params.toString()) {
            url += '?' + params.toString();
        }

        const cacheKey = `cards_${params.toString()}`;
        const result = await this.getFromCacheOrAPI(url, cacheKey);
        
        return result ? result.data : [];
    }

    /**
     * Get a specific card by ID
     */
    async getCardById(id) {
        const url = `${this.baseURL}/cardinfo.php?id=${id}`;
        const cacheKey = `card_${id}`;
        const result = await this.getFromCacheOrAPI(url, cacheKey);
        
        return result && result.data ? result.data[0] : null;
    }

    /**
     * Get card by name (exact match)
     */
    async getCardByName(name) {
        const url = `${this.baseURL}/cardinfo.php?name=${encodeURIComponent(name)}`;
        const cacheKey = `card_name_${name}`;
        const result = await this.getFromCacheOrAPI(url, cacheKey);
        
        return result && result.data ? result.data[0] : null;
    }

    /**
     * Get meta cards (popular competitive cards)
     */
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
            'Droll & Lock Bird',
            'Called by the Grave'
        ];

        const cards = [];
        for (const name of metaCardNames) {
            try {
                const card = await this.getCardByName(name);
                if (card) {
                    // Add mock pricing data (in a real app, this would come from a pricing API)
                    card.price = this.getMockPrice(card.name);
                    card.priceChange = this.getMockPriceChange();
                    cards.push(card);
                }
            } catch (error) {
                console.warn(`Could not fetch card: ${name}`, error);
            }
        }

        return cards;
    }

    /**
     * Get cards by archetype
     */
    async getCardsByArchetype(archetype) {
        return await this.getCards({ archetype });
    }

    /**
     * Get cards by type
     */
    async getCardsByType(type) {
        return await this.getCards({ type });
    }

    /**
     * Search cards by partial name
     */
    async searchCards(query) {
        if (!query || query.length < 2) return [];
        return await this.getCards({ name: query });
    }

    /**
     * Get card image URL
     */
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

    /**
     * Format card for display
     */
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
            imageCropped: this.getCardImageURL(card, 'cropped'),
            price: card.price || this.getMockPrice(card.name),
            priceChange: card.priceChange || this.getMockPriceChange(),
            rarity: this.getCardRarity(card),
            sets: card.card_sets || []
        };
    }

    /**
     * Get display-friendly card type
     */
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

    /**
     * Get card rarity (mock data for now)
     */
    getCardRarity(card) {
        if (!card.card_sets || card.card_sets.length === 0) return 'Common';
        
        const rarities = ['Common', 'Rare', 'Super Rare', 'Ultra Rare', 'Secret Rare'];
        const randomRarity = rarities[Math.floor(Math.random() * rarities.length)];
        return randomRarity;
    }

    /**
     * Generate mock price based on card name/type
     */
    getMockPrice(cardName) {
        const hash = this.hashCode(cardName);
        const basePrice = Math.abs(hash % 100) + 1;
        
        // Adjust price based on card name patterns
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

    /**
     * Generate mock price change
     */
    getMockPriceChange() {
        const changes = [
            { direction: 'up', amount: (Math.random() * 10).toFixed(2) },
            { direction: 'down', amount: (Math.random() * 5).toFixed(2) },
            { direction: 'stable', amount: '0.00' }
        ];
        
        return changes[Math.floor(Math.random() * changes.length)];
    }

    /**
     * Simple hash function for consistent mock data
     */
    hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash;
    }

    /**
     * Get popular archetypes
     */
    getPopularArchetypes() {
        return [
            'Snake-Eye',
            'Kashtira',
            'Branded',
            'Purrely',
            'Salamangreat',
            'Sky Striker',
            'Eldlich',
            'Tri-Brigade',
            'Virtual World',
            'Drytron'
        ];
    }

    /**
     * Generate product page URL for a card
     */
    getProductPageURL(card) {
        const cardId = card.id || card.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
        return `pages/product.html?id=${cardId}`;
    }
}

// Create global instance
window.ygoproAPI = new YGOProDeckAPI();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = YGOProDeckAPI;
}
