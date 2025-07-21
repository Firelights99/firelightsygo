/**
 * Crystal Commerce Backend Service
 * Server-side integration for Crystal Commerce API
 */

const axios = require('axios');
const logger = require('../utils/logger');

class CrystalCommerceService {
    constructor() {
        this.baseUrl = process.env.CRYSTAL_COMMERCE_BASE_URL || 'https://api.crystalcommerce.com/v1';
        this.storeUrl = process.env.CRYSTAL_COMMERCE_STORE_URL;
        this.apiKey = process.env.CRYSTAL_COMMERCE_API_KEY;
        this.timeout = 30000; // 30 seconds
        
        // Configure axios instance
        this.client = axios.create({
            timeout: this.timeout,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'Firelight-Duel-Academy/1.0'
            }
        });

        // Add request interceptor for logging
        this.client.interceptors.request.use(
            (config) => {
                logger.info('Crystal Commerce API request', {
                    method: config.method,
                    url: config.url,
                    params: config.params
                });
                return config;
            },
            (error) => {
                logger.error('Crystal Commerce API request error', error);
                return Promise.reject(error);
            }
        );

        // Add response interceptor for logging
        this.client.interceptors.response.use(
            (response) => {
                logger.info('Crystal Commerce API response', {
                    status: response.status,
                    url: response.config.url
                });
                return response;
            },
            (error) => {
                logger.error('Crystal Commerce API response error', {
                    status: error.response?.status,
                    message: error.message,
                    url: error.config?.url
                });
                return Promise.reject(error);
            }
        );

        logger.info('Crystal Commerce Service initialized', {
            storeUrl: this.storeUrl,
            hasApiKey: !!this.apiKey
        });
    }

    /**
     * Make API request to Crystal Commerce
     */
    async makeRequest(endpoint, options = {}) {
        try {
            const url = this.storeUrl ? `${this.storeUrl}${endpoint}` : `${this.baseUrl}${endpoint}`;
            
            const config = {
                url,
                method: options.method || 'GET',
                params: options.params,
                data: options.data,
                headers: {
                    ...options.headers
                }
            };

            // Add API key if available
            if (this.apiKey) {
                config.headers['Authorization'] = `Bearer ${this.apiKey}`;
            }

            const response = await this.client(config);
            return response.data;
        } catch (error) {
            logger.error('Crystal Commerce API request failed', {
                endpoint,
                error: error.message,
                status: error.response?.status
            });
            throw new Error(`Crystal Commerce API error: ${error.message}`);
        }
    }

    /**
     * Search for cards by name
     */
    async searchCards(query, options = {}) {
        try {
            const params = {
                q: query,
                format: 'json',
                limit: options.limit || 50,
                page: options.page || 1,
                ...options
            };

            const response = await this.makeRequest('/search.json', { params });
            return this.formatSearchResults(response);
        } catch (error) {
            logger.error('Error searching cards in Crystal Commerce', { query, error: error.message });
            throw error;
        }
    }

    /**
     * Get card details by product ID
     */
    async getCardDetails(productId) {
        try {
            const response = await this.makeRequest(`/products/${productId}.json`);
            return this.formatCardDetails(response);
        } catch (error) {
            logger.error('Error getting card details from Crystal Commerce', { productId, error: error.message });
            throw error;
        }
    }

    /**
     * Get card prices and variants
     */
    async getCardPrices(productId) {
        try {
            const response = await this.makeRequest(`/products/${productId}/variants.json`);
            return this.formatPriceData(response);
        } catch (error) {
            logger.error('Error getting card prices from Crystal Commerce', { productId, error: error.message });
            throw error;
        }
    }

    /**
     * Get cards by category
     */
    async getCardsByCategory(categoryId, options = {}) {
        try {
            const params = {
                format: 'json',
                limit: options.limit || 50,
                page: options.page || 1,
                ...options
            };

            const response = await this.makeRequest(`/categories/${categoryId}/products.json`, { params });
            return this.formatSearchResults(response);
        } catch (error) {
            logger.error('Error getting cards by category from Crystal Commerce', { categoryId, error: error.message });
            throw error;
        }
    }

    /**
     * Get Yu-Gi-Oh! specific cards
     */
    async getYugiohCards(setName = null, options = {}) {
        try {
            let query = 'yugioh';
            if (setName) {
                query += ` ${setName}`;
            }

            const searchOptions = {
                ...options,
                game: 'yugioh'
            };

            return await this.searchCards(query, searchOptions);
        } catch (error) {
            logger.error('Error getting Yu-Gi-Oh! cards from Crystal Commerce', { setName, error: error.message });
            throw error;
        }
    }

    /**
     * Get buylist prices for a product
     */
    async getBuylistPrices(productId) {
        try {
            const response = await this.makeRequest(`/buylist/products/${productId}.json`);
            return this.formatBuylistData(response);
        } catch (error) {
            logger.error('Error getting buylist prices from Crystal Commerce', { productId, error: error.message });
            throw error;
        }
    }

    /**
     * Get popular/trending cards
     */
    async getTrendingCards(game = 'yugioh', limit = 20) {
        try {
            const params = {
                format: 'json',
                sort: 'popularity',
                limit,
                game
            };

            const response = await this.makeRequest('/products/trending.json', { params });
            return this.formatSearchResults(response);
        } catch (error) {
            logger.error('Error getting trending cards from Crystal Commerce', { game, error: error.message });
            throw error;
        }
    }

    /**
     * Get new arrivals
     */
    async getNewArrivals(game = 'yugioh', limit = 20) {
        try {
            const params = {
                format: 'json',
                sort: 'created_at',
                order: 'desc',
                limit,
                game
            };

            const response = await this.makeRequest('/products/new.json', { params });
            return this.formatSearchResults(response);
        } catch (error) {
            logger.error('Error getting new arrivals from Crystal Commerce', { game, error: error.message });
            throw error;
        }
    }

    /**
     * Get price history for a card
     */
    async getPriceHistory(productId, days = 30) {
        try {
            const params = {
                format: 'json',
                days
            };

            const response = await this.makeRequest(`/products/${productId}/price_history.json`, { params });
            return this.formatPriceHistory(response);
        } catch (error) {
            logger.error('Error getting price history from Crystal Commerce', { productId, error: error.message });
            throw error;
        }
    }

    /**
     * Bulk price lookup
     */
    async bulkPriceLookup(productIds) {
        try {
            const params = {
                format: 'json',
                ids: Array.isArray(productIds) ? productIds.join(',') : productIds
            };

            const response = await this.makeRequest('/products/bulk_prices.json', { params });
            return this.formatBulkPrices(response);
        } catch (error) {
            logger.error('Error getting bulk prices from Crystal Commerce', { productIds, error: error.message });
            throw error;
        }
    }

    /**
     * Get store inventory levels
     */
    async getInventoryLevels(productIds = null) {
        try {
            const params = {
                format: 'json'
            };

            if (productIds) {
                params.ids = Array.isArray(productIds) ? productIds.join(',') : productIds;
            }

            const response = await this.makeRequest('/inventory.json', { params });
            return this.formatInventoryData(response);
        } catch (error) {
            logger.error('Error getting inventory levels from Crystal Commerce', { productIds, error: error.message });
            throw error;
        }
    }

    // Formatting Methods

    /**
     * Format search results
     */
    formatSearchResults(response) {
        if (!response || !response.products) {
            return [];
        }

        return response.products.map(product => ({
            id: product.id,
            name: product.name,
            description: product.description,
            category: product.category_name,
            image: product.thumbnail || product.image_url,
            price: product.price_cents ? product.price_cents / 100 : null,
            msrp: product.msrp_cents ? product.msrp_cents / 100 : null,
            inStock: product.in_stock || false,
            quantity: product.quantity || 0,
            variants: product.variants || [],
            url: product.url,
            game: this.detectGame(product.category_name || product.name),
            condition: product.condition,
            language: product.language,
            set: product.set_name,
            rarity: product.rarity,
            createdAt: product.created_at,
            updatedAt: product.updated_at
        }));
    }

    /**
     * Format card details
     */
    formatCardDetails(response) {
        if (!response || !response.product) {
            return null;
        }

        const product = response.product;
        return {
            id: product.id,
            name: product.name,
            description: product.description,
            category: product.category_name,
            images: product.images || [],
            variants: product.variants?.map(variant => ({
                id: variant.id,
                condition: variant.condition,
                language: variant.language,
                price: variant.price_cents / 100,
                msrp: variant.msrp_cents ? variant.msrp_cents / 100 : null,
                inStock: variant.in_stock,
                quantity: variant.quantity,
                descriptors: variant.descriptors
            })) || [],
            specifications: product.specifications || {},
            game: this.detectGame(product.category_name || product.name),
            set: product.set_name,
            rarity: product.rarity,
            cardNumber: product.card_number,
            artist: product.artist,
            flavorText: product.flavor_text,
            createdAt: product.created_at,
            updatedAt: product.updated_at
        };
    }

    /**
     * Format price data
     */
    formatPriceData(response) {
        if (!response || !response.variants) {
            return [];
        }

        return response.variants.map(variant => ({
            id: variant.id,
            condition: variant.condition || 'Near Mint',
            language: variant.language || 'English',
            price: variant.price_cents / 100,
            msrp: variant.msrp_cents ? variant.msrp_cents / 100 : null,
            buyPrice: variant.buy_price_cents ? variant.buy_price_cents / 100 : null,
            inStock: variant.in_stock || false,
            quantity: variant.quantity || 0,
            descriptors: variant.descriptors,
            lastUpdated: variant.updated_at
        }));
    }

    /**
     * Format buylist data
     */
    formatBuylistData(response) {
        if (!response || !response.variants) {
            return [];
        }

        return response.variants.map(variant => ({
            id: variant.id,
            condition: variant.condition,
            language: variant.language,
            buyPrice: variant.buy_price_cents / 100,
            acceptingBuys: variant.accepting_buys || false,
            maxQuantity: variant.max_buy_quantity,
            lastUpdated: variant.updated_at
        }));
    }

    /**
     * Format price history
     */
    formatPriceHistory(response) {
        if (!response || !response.price_history) {
            return [];
        }

        return response.price_history.map(entry => ({
            date: entry.date,
            price: entry.price_cents / 100,
            condition: entry.condition,
            language: entry.language
        }));
    }

    /**
     * Format bulk prices
     */
    formatBulkPrices(response) {
        if (!response || !response.products) {
            return {};
        }

        const prices = {};
        response.products.forEach(product => {
            prices[product.id] = {
                id: product.id,
                name: product.name,
                price: product.price_cents / 100,
                msrp: product.msrp_cents ? product.msrp_cents / 100 : null,
                inStock: product.in_stock,
                quantity: product.quantity
            };
        });

        return prices;
    }

    /**
     * Format inventory data
     */
    formatInventoryData(response) {
        if (!response || !response.inventory) {
            return {};
        }

        const inventory = {};
        response.inventory.forEach(item => {
            inventory[item.product_id] = {
                productId: item.product_id,
                quantity: item.quantity,
                inStock: item.quantity > 0,
                lastUpdated: item.updated_at
            };
        });

        return inventory;
    }

    /**
     * Detect game type from category or name
     */
    detectGame(text) {
        if (!text) return 'unknown';
        
        const lowerText = text.toLowerCase();
        
        if (lowerText.includes('yugioh') || lowerText.includes('yu-gi-oh')) {
            return 'yugioh';
        } else if (lowerText.includes('magic') || lowerText.includes('mtg')) {
            return 'magic';
        } else if (lowerText.includes('pokemon')) {
            return 'pokemon';
        } else if (lowerText.includes('dragon ball')) {
            return 'dragonball';
        } else if (lowerText.includes('digimon')) {
            return 'digimon';
        }
        
        return 'unknown';
    }

    /**
     * Health check
     */
    async healthCheck() {
        try {
            // Try to make a simple request to check connectivity
            await this.makeRequest('/api/v1/server_time');
            return {
                status: 'healthy',
                connected: true,
                storeUrl: this.storeUrl,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                connected: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Get service statistics
     */
    getStats() {
        return {
            service: 'Crystal Commerce',
            storeUrl: this.storeUrl,
            hasApiKey: !!this.apiKey,
            timeout: this.timeout,
            initialized: true
        };
    }
}

module.exports = CrystalCommerceService;
