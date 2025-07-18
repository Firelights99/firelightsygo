// PriceCharting API Service - Card pricing integration
class PriceChartingService {
    constructor() {
        this.baseUrl = 'https://www.pricecharting.com/api';
        this.apiToken = null; // Will need to be set with actual token
        this.cache = new Map();
        this.cacheExpiry = 30 * 60 * 1000; // 30 minutes
        this.rateLimitDelay = 1000; // 1 second between requests
        this.lastRequestTime = 0;
        
        // Console ID for Yu-Gi-Oh! cards from the API documentation
        this.yugiohConsoleId = 'G58494'; // YuGiOh Cards console ID
    }

    /**
     * Set the API token for authentication
     * @param {string} token - PriceCharting API token
     */
    setApiToken(token) {
        this.apiToken = token;
    }

    /**
     * Rate limiting helper
     */
    async enforceRateLimit() {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        
        if (timeSinceLastRequest < this.rateLimitDelay) {
            const delay = this.rateLimitDelay - timeSinceLastRequest;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        this.lastRequestTime = Date.now();
    }

    /**
     * Make authenticated API request
     * @param {string} endpoint - API endpoint
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} API response
     */
    async makeRequest(endpoint, params = {}) {
        if (!this.apiToken) {
            throw new Error('PriceCharting API token not set. Please configure your API token.');
        }

        await this.enforceRateLimit();

        const url = new URL(`${this.baseUrl}${endpoint}`);
        url.searchParams.append('t', this.apiToken);
        
        // Add additional parameters
        Object.entries(params).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                url.searchParams.append(key, value);
            }
        });

        try {
            const response = await fetch(url.toString());
            const data = await response.json();

            if (data.status === 'error') {
                throw new Error(data['error-message'] || 'API request failed');
            }

            return data;
        } catch (error) {
            console.error('PriceCharting API Error:', error);
            throw error;
        }
    }

    /**
     * Get cached data or fetch from API
     * @param {string} cacheKey - Cache key
     * @param {Function} fetchFunction - Function to fetch data
     * @returns {Promise<Object>} Cached or fresh data
     */
    async getCachedOrFetch(cacheKey, fetchFunction) {
        const cached = this.cache.get(cacheKey);
        
        if (cached && (Date.now() - cached.timestamp) < this.cacheExpiry) {
            return cached.data;
        }

        const data = await fetchFunction();
        this.cache.set(cacheKey, {
            data,
            timestamp: Date.now()
        });

        return data;
    }

    /**
     * Search for Yu-Gi-Oh! cards by name
     * @param {string} cardName - Name of the card to search for
     * @returns {Promise<Array>} Array of matching cards
     */
    async searchYugiohCards(cardName) {
        const cacheKey = `search_${cardName.toLowerCase()}`;
        
        return this.getCachedOrFetch(cacheKey, async () => {
            const response = await this.makeRequest('/products', {
                q: `${cardName} yugioh`
            });

            return response.products || [];
        });
    }

    /**
     * Get detailed pricing for a specific card
     * @param {string|number} productId - PriceCharting product ID
     * @returns {Promise<Object>} Card pricing details
     */
    async getCardPricing(productId) {
        const cacheKey = `pricing_${productId}`;
        
        return this.getCachedOrFetch(cacheKey, async () => {
            const response = await this.makeRequest('/product', {
                id: productId
            });

            return this.formatPricingData(response);
        });
    }

    /**
     * Search for card by UPC if available
     * @param {string} upc - Universal Product Code
     * @returns {Promise<Object>} Card pricing details
     */
    async getCardPricingByUPC(upc) {
        const cacheKey = `upc_${upc}`;
        
        return this.getCachedOrFetch(cacheKey, async () => {
            const response = await this.makeRequest('/product', {
                upc: upc
            });

            return this.formatPricingData(response);
        });
    }

    /**
     * Format pricing data for consistent use
     * @param {Object} rawData - Raw API response
     * @returns {Object} Formatted pricing data
     */
    formatPricingData(rawData) {
        return {
            id: rawData.id,
            name: rawData['product-name'],
            console: rawData['console-name'],
            releaseDate: rawData['release-date'],
            prices: {
                ungraded: this.formatPrice(rawData['loose-price']),
                grade7: this.formatPrice(rawData['cib-price']),
                grade8: this.formatPrice(rawData['new-price']),
                grade9: this.formatPrice(rawData['graded-price']),
                grade95: this.formatPrice(rawData['box-only-price']),
                grade10: this.formatPrice(rawData['manual-only-price']),
                bgs10: this.formatPrice(rawData['bgs-10-price']),
                cgc10: this.formatPrice(rawData['condition-17-price']),
                sgc10: this.formatPrice(rawData['condition-18-price'])
            },
            upc: rawData.upc,
            lastUpdated: new Date().toISOString()
        };
    }

    /**
     * Format price from cents to dollars
     * @param {number} cents - Price in cents
     * @returns {Object} Formatted price object
     */
    formatPrice(cents) {
        if (!cents || cents === 0) {
            return { value: 0, display: 'N/A', cents: 0 };
        }

        const dollars = cents / 100;
        return {
            value: dollars,
            display: `$${dollars.toFixed(2)}`,
            cents: cents
        };
    }

    /**
     * Get market trends for a card
     * @param {string|number} productId - PriceCharting product ID
     * @returns {Promise<Object>} Market trend data
     */
    async getMarketTrends(productId) {
        // Note: This would require additional API endpoints or data analysis
        // For now, return basic trend information
        try {
            const pricing = await this.getCardPricing(productId);
            
            return {
                productId,
                trend: 'stable', // Would need historical data to determine
                recommendation: this.generatePriceRecommendation(pricing),
                lastUpdated: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error getting market trends:', error);
            return null;
        }
    }

    /**
     * Generate price recommendation based on current market data
     * @param {Object} pricing - Formatted pricing data
     * @returns {Object} Price recommendation
     */
    generatePriceRecommendation(pricing) {
        const ungradedPrice = pricing.prices.ungraded.value;
        
        if (ungradedPrice === 0) {
            return {
                buyPrice: 0,
                sellPrice: 0,
                recommendation: 'No market data available'
            };
        }

        // Basic recommendation logic (can be enhanced)
        const buyPrice = Math.max(0.1, ungradedPrice * 0.6); // 60% of market price
        const sellPrice = ungradedPrice * 1.1; // 110% of market price

        return {
            buyPrice: Math.round(buyPrice * 100) / 100,
            sellPrice: Math.round(sellPrice * 100) / 100,
            recommendation: `Buy at $${buyPrice.toFixed(2)} or below, sell at $${sellPrice.toFixed(2)} or above`
        };
    }

    /**
     * Batch search for multiple cards
     * @param {Array<string>} cardNames - Array of card names to search
     * @returns {Promise<Array>} Array of search results
     */
    async batchSearchCards(cardNames) {
        const results = [];
        
        for (const cardName of cardNames) {
            try {
                const searchResults = await this.searchYugiohCards(cardName);
                results.push({
                    searchTerm: cardName,
                    results: searchResults,
                    success: true
                });
            } catch (error) {
                results.push({
                    searchTerm: cardName,
                    results: [],
                    success: false,
                    error: error.message
                });
            }
        }

        return results;
    }

    /**
     * Get popular Yu-Gi-Oh! cards (mock implementation)
     * @returns {Promise<Array>} Popular cards data
     */
    async getPopularCards() {
        // This would typically come from a specific API endpoint
        // For now, we'll search for some popular Yu-Gi-Oh! cards
        const popularCardNames = [
            'Blue-Eyes White Dragon',
            'Dark Magician',
            'Exodia the Forbidden One',
            'Red-Eyes Black Dragon',
            'Elemental Hero Sparkman'
        ];

        try {
            const results = await this.batchSearchCards(popularCardNames);
            return results.filter(result => result.success && result.results.length > 0);
        } catch (error) {
            console.error('Error getting popular cards:', error);
            return [];
        }
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * Get cache statistics
     * @returns {Object} Cache statistics
     */
    getCacheStats() {
        return {
            size: this.cache.size,
            entries: Array.from(this.cache.keys())
        };
    }
}

// Create global instance
const priceChartingService = new PriceChartingService();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PriceChartingService;
}

// Make available globally
window.priceChartingService = priceChartingService;
window.PriceChartingService = PriceChartingService;

// Demo/Development functions
window.priceChartingDemo = {
    /**
     * Demo function to test the service (requires API token)
     */
    async testSearch(cardName = 'Blue-Eyes White Dragon') {
        try {
            console.log('Searching for:', cardName);
            const results = await priceChartingService.searchYugiohCards(cardName);
            console.log('Search results:', results);
            
            if (results.length > 0) {
                const pricing = await priceChartingService.getCardPricing(results[0].id);
                console.log('Pricing data:', pricing);
            }
        } catch (error) {
            console.error('Demo test failed:', error);
            console.log('Make sure to set API token: priceChartingService.setApiToken("your-token-here")');
        }
    },

    /**
     * Set API token for testing
     */
    setToken(token) {
        priceChartingService.setApiToken(token);
        console.log('API token set successfully');
    }
};

console.log('🔥 PriceCharting API Service loaded!');
console.log('Use priceChartingDemo.setToken("your-token") to set API token');
console.log('Use priceChartingDemo.testSearch("card-name") to test the service');
