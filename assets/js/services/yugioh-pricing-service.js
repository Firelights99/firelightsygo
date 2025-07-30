/**
 * Yu-Gi-Oh! Card Pricing Service
 * Fetches real prices from YGOPRODeck API and yugiohcardprices.io
 */

class YugiohPricingService {
    constructor() {
        this.ygoprodeckAPI = 'https://db.ygoprodeck.com/api/v7';
        this.yugiohCardPricesAPI = 'https://yugiohcardprices.io/api';
        this.cache = new Map();
        this.cacheExpiry = 10 * 60 * 1000; // 10 minutes cache
        this.usdToCadRate = 1.35; // Approximate USD to CAD conversion rate
    }

    /**
     * Get card price with fallback to multiple sources
     * @param {Object} card - Card object with id, name, and sets
     * @param {string} setCode - Specific set code (optional)
     * @param {string} rarity - Specific rarity (optional)
     * @returns {Promise<Object>} Price object with CAD price and source
     */
    async getCardPrice(card, setCode = null, rarity = null) {
        try {
            // First try YGOPRODeck API
            const ygoprodeckPrice = await this.getYGOPRODeckPrice(card.id);
            if (ygoprodeckPrice && ygoprodeckPrice.price > 0) {
                return {
                    price: ygoprodeckPrice.price,
                    currency: 'CAD',
                    source: 'YGOPRODeck',
                    lastUpdated: new Date().toISOString(),
                    setCode: ygoprodeckPrice.setCode || setCode,
                    rarity: ygoprodeckPrice.rarity || rarity
                };
            }

            // Fallback to yugiohcardprices.io
            const cardPricesPrice = await this.getYugiohCardPricesPrice(card.name, setCode, rarity);
            if (cardPricesPrice && cardPricesPrice.price > 0) {
                return {
                    price: cardPricesPrice.price,
                    currency: 'CAD',
                    source: 'YugiohCardPrices',
                    lastUpdated: new Date().toISOString(),
                    setCode: cardPricesPrice.setCode || setCode,
                    rarity: cardPricesPrice.rarity || rarity
                };
            }

            // If no price found, return null instead of mock price
            console.warn(`No price found for card: ${card.name}`);
            return null;

        } catch (error) {
            console.error('Error fetching card price:', error);
            return null;
        }
    }

    /**
     * Get price from YGOPRODeck API
     * @param {number} cardId - Card ID
     * @returns {Promise<Object|null>} Price data or null
     */
    async getYGOPRODeckPrice(cardId) {
        const cacheKey = `ygoprodeck_${cardId}`;
        const cached = this.cache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
            return cached.data;
        }

        try {
            const response = await fetch(`${this.ygoprodeckAPI}/cardinfo.php?id=${cardId}`);
            if (!response.ok) {
                throw new Error(`YGOPRODeck API error: ${response.status}`);
            }
            
            const result = await response.json();
            const card = result.data ? result.data[0] : null;
            
            if (!card || !card.card_prices || card.card_prices.length === 0) {
                return null;
            }

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

            if (!usdPrice || usdPrice <= 0) {
                return null;
            }

            // Convert USD to CAD
            const cadPrice = (usdPrice * this.usdToCadRate).toFixed(2);
            
            const priceData = {
                price: parseFloat(cadPrice),
                originalPrice: usdPrice,
                currency: 'CAD',
                source: 'YGOPRODeck'
            };

            // Cache the result
            this.cache.set(cacheKey, {
                data: priceData,
                timestamp: Date.now()
            });

            return priceData;

        } catch (error) {
            console.error('YGOPRODeck API error:', error);
            return null;
        }
    }

    /**
     * Get price from yugiohcardprices.io API
     * @param {string} cardName - Card name
     * @param {string} setCode - Set code (optional)
     * @param {string} rarity - Rarity (optional)
     * @returns {Promise<Object|null>} Price data or null
     */
    async getYugiohCardPricesPrice(cardName, setCode = null, rarity = null) {
        const cacheKey = `cardprices_${cardName}_${setCode || 'any'}_${rarity || 'any'}`;
        const cached = this.cache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
            return cached.data;
        }

        try {
            // Search for the card first
            const searchUrl = `${this.yugiohCardPricesAPI}/search?name=${encodeURIComponent(cardName)}`;
            const searchResponse = await fetch(searchUrl);
            
            if (!searchResponse.ok) {
                throw new Error(`YugiohCardPrices search error: ${searchResponse.status}`);
            }
            
            const searchResult = await searchResponse.json();
            
            if (!searchResult.data || searchResult.data.length === 0) {
                return null;
            }

            // Find the best matching card
            let targetCard = searchResult.data[0]; // Default to first result
            
            // If set code and rarity specified, try to find exact match
            if (setCode && rarity) {
                const exactMatch = searchResult.data.find(card => 
                    card.set_code === setCode && 
                    card.rarity && card.rarity.toLowerCase() === rarity.toLowerCase()
                );
                if (exactMatch) {
                    targetCard = exactMatch;
                }
            } else if (setCode) {
                const setMatch = searchResult.data.find(card => card.set_code === setCode);
                if (setMatch) {
                    targetCard = setMatch;
                }
            }

            // Get price for the selected card
            if (!targetCard.price || parseFloat(targetCard.price) <= 0) {
                return null;
            }

            let finalPrice = parseFloat(targetCard.price);
            
            // If price is in USD, convert to CAD
            if (targetCard.currency === 'USD' || !targetCard.currency) {
                finalPrice = finalPrice * this.usdToCadRate;
            }

            const priceData = {
                price: parseFloat(finalPrice.toFixed(2)),
                currency: 'CAD',
                source: 'YugiohCardPrices',
                setCode: targetCard.set_code || setCode,
                rarity: targetCard.rarity || rarity,
                originalPrice: parseFloat(targetCard.price),
                originalCurrency: targetCard.currency || 'USD'
            };

            // Cache the result
            this.cache.set(cacheKey, {
                data: priceData,
                timestamp: Date.now()
            });

            return priceData;

        } catch (error) {
            console.error('YugiohCardPrices API error:', error);
            return null;
        }
    }

    /**
     * Get prices for multiple cards efficiently
     * @param {Array} cards - Array of card objects
     * @returns {Promise<Array>} Array of price objects
     */
    async getBulkPrices(cards) {
        const pricePromises = cards.map(card => this.getCardPrice(card));
        const results = await Promise.allSettled(pricePromises);
        
        return results.map((result, index) => {
            if (result.status === 'fulfilled' && result.value) {
                return {
                    cardId: cards[index].id,
                    cardName: cards[index].name,
                    ...result.value
                };
            } else {
                return {
                    cardId: cards[index].id,
                    cardName: cards[index].name,
                    price: null,
                    error: result.reason || 'Price not available'
                };
            }
        });
    }

    /**
     * Get set-specific pricing for a card
     * @param {Object} card - Card object
     * @param {string} setCode - Set code
     * @param {string} rarity - Rarity
     * @returns {Promise<Object|null>} Set-specific price data
     */
    async getSetSpecificPrice(card, setCode, rarity) {
        return await this.getCardPrice(card, setCode, rarity);
    }

    /**
     * Clear price cache
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * Update USD to CAD conversion rate
     * @param {number} rate - New conversion rate
     */
    updateConversionRate(rate) {
        this.usdToCadRate = rate;
        this.clearCache(); // Clear cache to use new rate
    }

    /**
     * Get cache statistics
     * @returns {Object} Cache stats
     */
    getCacheStats() {
        return {
            size: this.cache.size,
            entries: Array.from(this.cache.keys())
        };
    }
}

// Create global instance
window.yugiohPricingService = new YugiohPricingService();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = YugiohPricingService;
}
