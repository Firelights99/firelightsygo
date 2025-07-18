// Yu-Gi-Oh! API Service - Handles card data and TCGPlayer pricing
class YugiohApiService {
    constructor() {
        this.baseUrl = 'https://db.ygoprodeck.com/api/v7/';
        this.cardImageBase = 'https://images.ygoprodeck.com/images/cards/';
        this.cache = new Map();
        this.cacheExpiry = 30 * 60 * 1000; // 30 minutes
    }

    // Get all cards or search by name/archetype
    async getCards(params = {}) {
        const cacheKey = `cards_${JSON.stringify(params)}`;
        
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheExpiry) {
                return cached.data;
            }
        }

        try {
            const queryParams = new URLSearchParams();
            
            if (params.name) queryParams.append('name', params.name);
            if (params.fname) queryParams.append('fname', params.fname); // Fuzzy name search
            if (params.type) queryParams.append('type', params.type);
            if (params.race) queryParams.append('race', params.race);
            if (params.attribute) queryParams.append('attribute', params.attribute);
            if (params.archetype) queryParams.append('archetype', params.archetype);
            if (params.level) queryParams.append('level', params.level);
            if (params.atk) queryParams.append('atk', params.atk);
            if (params.def) queryParams.append('def', params.def);
            if (params.sort) queryParams.append('sort', params.sort);
            if (params.format) queryParams.append('format', params.format);
            if (params.misc) queryParams.append('misc', params.misc);

            const url = `${this.baseUrl}cardinfo.php?${queryParams.toString()}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }

            const result = await response.json();
            const cards = result.data || [];

            // Cache the result
            this.cache.set(cacheKey, {
                data: cards,
                timestamp: Date.now()
            });

            return cards;
        } catch (error) {
            console.error('Error fetching cards:', error);
            throw error;
        }
    }

    // Get specific card by ID
    async getCardById(id) {
        const cacheKey = `card_${id}`;
        
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheExpiry) {
                return cached.data;
            }
        }

        try {
            const response = await fetch(`${this.baseUrl}cardinfo.php?id=${id}`);
            
            if (!response.ok) {
                throw new Error(`Card not found: ${id}`);
            }

            const result = await response.json();
            const card = result.data[0];

            this.cache.set(cacheKey, {
                data: card,
                timestamp: Date.now()
            });

            return card;
        } catch (error) {
            console.error('Error fetching card:', error);
            throw error;
        }
    }

    // Search cards by name (fuzzy search)
    async searchCards(searchTerm) {
        if (!searchTerm || searchTerm.length < 2) {
            return [];
        }

        try {
            return await this.getCards({ fname: searchTerm });
        } catch (error) {
            console.error('Error searching cards:', error);
            return [];
        }
    }

    // Get cards by archetype
    async getCardsByArchetype(archetype) {
        try {
            return await this.getCards({ archetype: archetype });
        } catch (error) {
            console.error('Error fetching archetype cards:', error);
            return [];
        }
    }

    // Get random cards for featured section
    async getRandomCards(count = 12) {
        try {
            const allCards = await this.getCards({ sort: 'random' });
            return allCards.slice(0, count);
        } catch (error) {
            console.error('Error fetching random cards:', error);
            return [];
        }
    }

    // Get card image URL
    getCardImageUrl(cardId, imageType = 'normal') {
        // imageType can be 'normal', 'small', 'cropped'
        const suffix = imageType === 'small' ? '_small' : imageType === 'cropped' ? '_cropped' : '';
        return `${this.cardImageBase}${cardId}${suffix}.jpg`;
    }

    // Format card for display
    formatCardForDisplay(card) {
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
            archetype: card.archetype,
            image: this.getCardImageUrl(card.id),
            imageSmall: this.getCardImageUrl(card.id, 'small'),
            sets: card.card_sets || [],
            prices: card.card_prices || []
        };
    }

    // Get real pricing data from YGOPRODeck API (free)
    async getTCGPlayerPricing(cardId, setCode = null) {
        try {
            const card = await this.getCardById(cardId);
            
            // YGOPRODeck includes real pricing data from card_prices
            if (card && card.card_prices && card.card_prices.length > 0) {
                const prices = card.card_prices[0]; // Most recent pricing
                
                // Convert USD to CAD (approximate rate: 1.35)
                const exchangeRate = await this.getExchangeRate();
                
                const pricing = {
                    card_id: cardId,
                    set_code: setCode,
                    last_updated: new Date().toISOString(),
                    exchange_rate: exchangeRate,
                    pricing: {
                        near_mint: {
                            low: this.convertToCAD(parseFloat(prices.tcgplayer_price || prices.cardmarket_price || 1.0) * 0.8, exchangeRate),
                            market: this.convertToCAD(parseFloat(prices.tcgplayer_price || prices.cardmarket_price || 1.0), exchangeRate),
                            high: this.convertToCAD(parseFloat(prices.tcgplayer_price || prices.cardmarket_price || 1.0) * 1.3, exchangeRate),
                            direct_low: this.convertToCAD(parseFloat(prices.tcgplayer_price || prices.cardmarket_price || 1.0) * 0.9, exchangeRate)
                        }
                    }
                };
                
                // Apply condition multipliers
                const conditions = ['lightly_played', 'moderately_played', 'heavily_played', 'damaged'];
                const multipliers = [0.85, 0.70, 0.55, 0.40];
                
                conditions.forEach((condition, index) => {
                    const multiplier = multipliers[index];
                    pricing.pricing[condition] = {
                        low: pricing.pricing.near_mint.low * multiplier,
                        market: pricing.pricing.near_mint.market * multiplier,
                        high: pricing.pricing.near_mint.high * multiplier,
                        direct_low: pricing.pricing.near_mint.direct_low * multiplier
                    };
                });
                
                return pricing;
            }
            
            // Fallback to calculated pricing if no real data available
            const pricing = this.simulateTCGPlayerPricing(card, setCode);
            return pricing;
        } catch (error) {
            console.error('Error getting pricing:', error);
            return null;
        }
    }

    // Get current USD to CAD exchange rate (free API)
    async getExchangeRate() {
        const cacheKey = 'exchange_rate_usd_cad';
        
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            // Cache exchange rate for 1 hour
            if (Date.now() - cached.timestamp < 60 * 60 * 1000) {
                return cached.data;
            }
        }

        try {
            const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
            const data = await response.json();
            
            const rate = data.rates.CAD || 1.35; // Default to 1.35 if API fails
            
            this.cache.set(cacheKey, {
                data: rate,
                timestamp: Date.now()
            });
            
            return rate;
        } catch (error) {
            console.warn('Failed to get exchange rate, using default:', error);
            return 1.35; // Default CAD exchange rate
        }
    }

    // Convert USD to CAD
    convertToCAD(usdAmount, exchangeRate = 1.35) {
        return usdAmount * exchangeRate;
    }

    // Simulate TCGPlayer pricing (replace with real API calls)
    simulateTCGPlayerPricing(card, setCode = null) {
        const basePrice = this.calculateBasePrice(card);
        const conditions = ['near_mint', 'lightly_played', 'moderately_played', 'heavily_played', 'damaged'];
        const conditionMultipliers = {
            'near_mint': 1.0,
            'lightly_played': 0.85,
            'moderately_played': 0.70,
            'heavily_played': 0.55,
            'damaged': 0.40
        };

        const pricing = {};
        
        conditions.forEach(condition => {
            const conditionPrice = basePrice * conditionMultipliers[condition];
            pricing[condition] = {
                low: Math.max(0.25, conditionPrice * 0.8),
                market: conditionPrice,
                high: conditionPrice * 1.3,
                direct_low: conditionPrice * 0.9
            };
        });

        return {
            card_id: card.id,
            set_code: setCode,
            last_updated: new Date().toISOString(),
            pricing: pricing
        };
    }

    // Calculate base price based on card characteristics
    calculateBasePrice(card) {
        let basePrice = 0.50; // Minimum price

        // Price based on card type
        if (card.type.includes('Monster')) {
            if (card.type.includes('Effect')) basePrice += 1.0;
            if (card.type.includes('Fusion')) basePrice += 2.0;
            if (card.type.includes('Synchro')) basePrice += 2.5;
            if (card.type.includes('Xyz')) basePrice += 2.5;
            if (card.type.includes('Link')) basePrice += 3.0;
        } else if (card.type.includes('Spell')) {
            basePrice += 0.75;
        } else if (card.type.includes('Trap')) {
            basePrice += 0.75;
        }

        // Price based on ATK/DEF for monsters
        if (card.atk && card.atk >= 3000) basePrice += 1.0;
        if (card.def && card.def >= 3000) basePrice += 0.5;

        // Price based on level/rank
        if (card.level) {
            if (card.level >= 8) basePrice += 1.5;
            else if (card.level >= 6) basePrice += 1.0;
        }

        // Add some randomness to simulate market fluctuations
        const fluctuation = (Math.random() - 0.5) * 2; // -1 to +1
        basePrice += fluctuation;

        return Math.max(0.25, basePrice);
    }

    // Get popular archetypes
    getPopularArchetypes() {
        return [
            'Blue-Eyes', 'Dark Magician', 'Red-Eyes', 'Elemental HERO',
            'Cyber Dragon', 'Blackwing', 'Six Samurai', 'Lightsworn',
            'Burning Abyss', 'Shaddoll', 'Kozmo', 'Pendulum Magician',
            'True Draco', 'Sky Striker', 'Salamangreat', 'Orcust',
            'Thunder Dragon', 'Eldlich', 'Dogmatika', 'Tri-Brigade',
            'Virtual World', 'Drytron', 'Zoodiac', 'Invoked'
        ];
    }

    // Get card types for filtering
    getCardTypes() {
        return [
            'Effect Monster', 'Normal Monster', 'Ritual Monster',
            'Fusion Monster', 'Synchro Monster', 'Xyz Monster',
            'Pendulum Monster', 'Link Monster', 'Spell Card', 'Trap Card'
        ];
    }

    // Get card attributes
    getCardAttributes() {
        return ['DARK', 'LIGHT', 'EARTH', 'WATER', 'FIRE', 'WIND', 'DIVINE'];
    }

    // Get card races
    getCardRaces() {
        return [
            'Warrior', 'Spellcaster', 'Dragon', 'Beast', 'Beast-Warrior',
            'Fiend', 'Zombie', 'Machine', 'Aqua', 'Pyro', 'Rock',
            'Winged Beast', 'Plant', 'Insect', 'Thunder', 'Dinosaur',
            'Fish', 'Sea Serpent', 'Reptile', 'Psychic', 'Divine-Beast',
            'Creator-God', 'Wyrm', 'Cyberse'
        ];
    }

    // Clear cache
    clearCache() {
        this.cache.clear();
    }

    // Get cache stats
    getCacheStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }
}

// Export for use in other modules
window.YugiohApiService = YugiohApiService;
