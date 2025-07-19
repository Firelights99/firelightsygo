/**
 * Crystal Commerce API Integration
 * Provides card price fetching and store integration
 */

class CrystalCommerceAPI {
    constructor() {
        this.baseUrl = 'https://api.crystalcommerce.com/v1';
        this.storeUrl = null; // Will be set based on configuration
        this.apiKey = null;
        this.csrfToken = null;
        
        // Initialize CSRF token for API requests
        this.initializeCSRF();
        
        console.log('Crystal Commerce API initialized');
    }

    /**
     * Initialize CSRF token for authenticated requests
     */
    initializeCSRF() {
        // Get CSRF token from meta tag if available
        const csrfMeta = document.querySelector('meta[name="csrf-token"]');
        if (csrfMeta) {
            this.csrfToken = csrfMeta.getAttribute('content');
        }

        // Set up jQuery AJAX prefilter for CSRF token
        if (typeof jQuery !== 'undefined') {
            jQuery.ajaxPrefilter((options, originalOptions, xhr) => {
                if (this.csrfToken) {
                    xhr.setRequestHeader('X-CSRF-Token', this.csrfToken);
                }
            });
        }
    }

    /**
     * Configure the API with store URL and credentials
     */
    configure(config) {
        this.storeUrl = config.storeUrl;
        this.apiKey = config.apiKey;
        
        console.log('Crystal Commerce API configured for store:', this.storeUrl);
    }

    /**
     * Make API request with proper headers and error handling
     */
    async makeRequest(endpoint, options = {}) {
        const url = this.storeUrl ? `${this.storeUrl}${endpoint}` : endpoint;
        
        const defaultOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Accept': 'application/json'
            }
        };

        // Add CSRF token for non-GET requests
        if (options.method && options.method !== 'GET' && this.csrfToken) {
            defaultOptions.headers['X-CSRF-Token'] = this.csrfToken;
        }

        const requestOptions = { ...defaultOptions, ...options };

        try {
            const response = await fetch(url, requestOptions);
            
            if (!response.ok) {
                throw new Error(`Crystal Commerce API error: ${response.status} ${response.statusText}`);
            }

            // Handle 204 No Content responses
            if (response.status === 204) {
                return { success: true };
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Crystal Commerce API request failed:', error);
            throw error;
        }
    }

    /**
     * Search for cards by name
     */
    async searchCards(query, options = {}) {
        try {
            // Use the store's search endpoint
            const searchUrl = `/search.json?q=${encodeURIComponent(query)}`;
            const params = new URLSearchParams({
                q: query,
                format: 'json',
                ...options
            });

            const response = await this.makeRequest(`/search.json?${params}`);
            return this.formatSearchResults(response);
        } catch (error) {
            console.error('Error searching cards:', error);
            return [];
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
            console.error('Error getting card details:', error);
            return null;
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
            console.error('Error getting card prices:', error);
            return [];
        }
    }

    /**
     * Get cards by category
     */
    async getCardsByCategory(categoryId, options = {}) {
        try {
            const params = new URLSearchParams({
                category_id: categoryId,
                format: 'json',
                ...options
            });

            const response = await this.makeRequest(`/categories/${categoryId}/products.json?${params}`);
            return this.formatSearchResults(response);
        } catch (error) {
            console.error('Error getting cards by category:', error);
            return [];
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

            const searchParams = {
                ...options,
                game: 'yugioh'
            };

            return await this.searchCards(query, searchParams);
        } catch (error) {
            console.error('Error getting Yu-Gi-Oh! cards:', error);
            return [];
        }
    }

    /**
     * Get card buylist prices
     */
    async getBuylistPrices(productId) {
        try {
            const response = await this.makeRequest(`/buylist/products/${productId}.json`);
            return this.formatBuylistData(response);
        } catch (error) {
            console.error('Error getting buylist prices:', error);
            return [];
        }
    }

    // Cart Management Methods (using Crystal Commerce API)

    /**
     * Get current cart
     */
    async getCart() {
        try {
            const response = await this.makeRequest('/api/v1/cart');
            return response.carts?.[0] || null;
        } catch (error) {
            console.error('Error getting cart:', error);
            return null;
        }
    }

    /**
     * Add items to cart
     */
    async addToCart(items) {
        try {
            const lineItems = Array.isArray(items) ? items : [items];
            const requestData = {
                line_items: lineItems.map(item => ({
                    variant_id: item.variantId,
                    qty: item.quantity || 1
                }))
            };

            const response = await this.makeRequest('/api/v1/cart/line_items', {
                method: 'POST',
                body: JSON.stringify(requestData)
            });

            return {
                success: response.errors?.length === 0,
                cart: response.carts?.[0],
                lineItems: response.line_items,
                errors: response.errors
            };
        } catch (error) {
            console.error('Error adding to cart:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Update cart item quantity
     */
    async updateCartItem(lineItemId, quantity) {
        try {
            const patchData = [{
                op: "replace",
                path: `/cart/0/line_items/${lineItemId}/qty`,
                value: quantity
            }];

            const response = await this.makeRequest('/api/v1/cart/line_items/update', {
                method: 'PUT',
                body: JSON.stringify(patchData)
            });

            return {
                success: response.errors?.length === 0,
                cart: response.carts?.[0],
                lineItems: response.line_items,
                errors: response.errors
            };
        } catch (error) {
            console.error('Error updating cart item:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Remove item from cart
     */
    async removeFromCart(lineItemId) {
        try {
            await this.makeRequest(`/api/v1/cart/line_items/${lineItemId}`, {
                method: 'DELETE'
            });

            return { success: true };
        } catch (error) {
            console.error('Error removing from cart:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Clear entire cart
     */
    async clearCart() {
        try {
            const response = await this.makeRequest('/api/v1/cart/empty', {
                method: 'POST'
            });

            return { success: true, cart: response.carts?.[0] };
        } catch (error) {
            console.error('Error clearing cart:', error);
            return { success: false, error: error.message };
        }
    }

    // Buylist Management Methods

    /**
     * Get current buylist
     */
    async getBuylist() {
        try {
            const response = await this.makeRequest('/api/v1/buylist');
            return response.buylists?.[0] || null;
        } catch (error) {
            console.error('Error getting buylist:', error);
            return null;
        }
    }

    /**
     * Add items to buylist
     */
    async addToBuylist(items) {
        try {
            const lineItems = Array.isArray(items) ? items : [items];
            const requestData = {
                line_items: lineItems.map(item => ({
                    variant_id: item.variantId,
                    qty: item.quantity || 1
                }))
            };

            const response = await this.makeRequest('/api/v1/buylist/line_items', {
                method: 'POST',
                body: JSON.stringify(requestData)
            });

            return {
                success: response.errors?.length === 0,
                buylist: response.buylists?.[0],
                lineItems: response.line_items,
                errors: response.errors
            };
        } catch (error) {
            console.error('Error adding to buylist:', error);
            return { success: false, error: error.message };
        }
    }

    // Utility Methods

    /**
     * Format search results from Crystal Commerce
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
            variants: product.variants || [],
            url: product.url,
            game: this.detectGame(product.category_name || product.name)
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
                quantity: variant.quantity
            })) || [],
            specifications: product.specifications || {},
            game: this.detectGame(product.category_name || product.name)
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
            descriptors: variant.descriptors
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
            maxQuantity: variant.max_buy_quantity
        }));
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
        }
        
        return 'unknown';
    }

    /**
     * Get server time
     */
    async getServerTime() {
        try {
            const response = await this.makeRequest('/api/v1/server_time');
            return new Date(response.server_time);
        } catch (error) {
            console.error('Error getting server time:', error);
            return new Date();
        }
    }

    /**
     * Health check
     */
    async healthCheck() {
        try {
            await this.getServerTime();
            return { status: 'healthy', connected: true };
        } catch (error) {
            return { status: 'unhealthy', connected: false, error: error.message };
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CrystalCommerceAPI;
} else {
    window.CrystalCommerceAPI = CrystalCommerceAPI;
}
