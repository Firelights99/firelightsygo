// Crystal Commerce Compatible Integration System
// Designed to work with Crystal Commerce data structures and eventual migration

class CrystalCommerceIntegration {
    constructor() {
        this.apiEndpoint = 'https://api.crystalcommerce.com/v1/'; // Placeholder - would need actual endpoint
        this.storeId = null; // Would be set when Crystal Commerce account is created
        this.apiKey = null; // Would be provided by Crystal Commerce
        this.cache = new Map();
        this.cacheExpiry = 15 * 60 * 1000; // 15 minutes for inventory data
        this.syncInterval = null;
        this.isConnected = false;
    }

    // Initialize Crystal Commerce connection
    async initialize(storeId, apiKey) {
        this.storeId = storeId;
        this.apiKey = apiKey;
        
        try {
            await this.testConnection();
            this.isConnected = true;
            this.startSyncInterval();
            console.log('Crystal Commerce integration initialized successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize Crystal Commerce integration:', error);
            this.isConnected = false;
            return false;
        }
    }

    // Test API connection
    async testConnection() {
        if (!this.storeId || !this.apiKey) {
            throw new Error('Store ID and API key required');
        }

        // Simulate API call - replace with actual Crystal Commerce endpoint
        const response = await this.makeRequest('GET', 'store/info');
        return response;
    }

    // Generic API request handler
    async makeRequest(method, endpoint, data = null) {
        if (!this.isConnected && endpoint !== 'store/info') {
            throw new Error('Crystal Commerce not connected');
        }

        const url = `${this.apiEndpoint}${endpoint}`;
        const options = {
            method: method,
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
                'X-Store-ID': this.storeId
            }
        };

        if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, options);
            
            if (!response.ok) {
                throw new Error(`Crystal Commerce API error: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Crystal Commerce API request failed:', error);
            throw error;
        }
    }

    // Get inventory from Crystal Commerce
    async getInventory(filters = {}) {
        const cacheKey = `inventory_${JSON.stringify(filters)}`;
        
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheExpiry) {
                return cached.data;
            }
        }

        try {
            const queryParams = new URLSearchParams();
            
            if (filters.game) queryParams.append('game', filters.game);
            if (filters.set) queryParams.append('set', filters.set);
            if (filters.rarity) queryParams.append('rarity', filters.rarity);
            if (filters.condition) queryParams.append('condition', filters.condition);
            if (filters.inStock) queryParams.append('in_stock', 'true');
            if (filters.limit) queryParams.append('limit', filters.limit);
            if (filters.offset) queryParams.append('offset', filters.offset);

            const endpoint = `inventory?${queryParams.toString()}`;
            const response = await this.makeRequest('GET', endpoint);
            
            // Cache the result
            this.cache.set(cacheKey, {
                data: response.inventory || [],
                timestamp: Date.now()
            });

            return response.inventory || [];
        } catch (error) {
            console.error('Error fetching Crystal Commerce inventory:', error);
            return [];
        }
    }

    // Search products in Crystal Commerce catalog
    async searchProducts(query, filters = {}) {
        try {
            const queryParams = new URLSearchParams();
            queryParams.append('q', query);
            
            if (filters.game) queryParams.append('game', filters.game);
            if (filters.category) queryParams.append('category', filters.category);
            if (filters.limit) queryParams.append('limit', filters.limit || 50);

            const endpoint = `catalog/search?${queryParams.toString()}`;
            const response = await this.makeRequest('GET', endpoint);
            
            return response.products || [];
        } catch (error) {
            console.error('Error searching Crystal Commerce catalog:', error);
            return [];
        }
    }

    // Get product details
    async getProduct(productId) {
        const cacheKey = `product_${productId}`;
        
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheExpiry) {
                return cached.data;
            }
        }

        try {
            const response = await this.makeRequest('GET', `catalog/products/${productId}`);
            
            this.cache.set(cacheKey, {
                data: response.product,
                timestamp: Date.now()
            });

            return response.product;
        } catch (error) {
            console.error('Error fetching product details:', error);
            return null;
        }
    }

    // Update inventory quantity
    async updateInventory(inventoryId, updates) {
        try {
            const response = await this.makeRequest('PATCH', `inventory/${inventoryId}`, updates);
            
            // Clear related cache entries
            this.clearInventoryCache();
            
            return response;
        } catch (error) {
            console.error('Error updating inventory:', error);
            throw error;
        }
    }

    // Add new inventory item
    async addInventoryItem(productData) {
        try {
            const response = await this.makeRequest('POST', 'inventory', productData);
            
            // Clear inventory cache
            this.clearInventoryCache();
            
            return response;
        } catch (error) {
            console.error('Error adding inventory item:', error);
            throw error;
        }
    }

    // Get pricing data
    async getPricing(productId, condition = 'near_mint') {
        try {
            const endpoint = `pricing/${productId}?condition=${condition}`;
            const response = await this.makeRequest('GET', endpoint);
            
            return {
                market_price: response.market_price,
                low_price: response.low_price,
                high_price: response.high_price,
                suggested_price: response.suggested_price,
                buylist_price: response.buylist_price,
                last_updated: response.last_updated
            };
        } catch (error) {
            console.error('Error fetching pricing data:', error);
            return null;
        }
    }

    // Sync local inventory with Crystal Commerce
    async syncInventory() {
        if (!this.isConnected) {
            console.warn('Cannot sync - Crystal Commerce not connected');
            return false;
        }

        try {
            console.log('Starting inventory sync with Crystal Commerce...');
            
            // Get all inventory from Crystal Commerce
            const ccInventory = await this.getInventory({ limit: 10000 });
            
            // Update local database with Crystal Commerce data
            await this.updateLocalInventory(ccInventory);
            
            console.log(`Synced ${ccInventory.length} items from Crystal Commerce`);
            return true;
        } catch (error) {
            console.error('Inventory sync failed:', error);
            return false;
        }
    }

    // Update local database with Crystal Commerce inventory
    async updateLocalInventory(ccInventory) {
        // This would integrate with your local database
        // For now, we'll store in localStorage as a demo
        
        const localInventory = ccInventory.map(item => ({
            id: item.id,
            product_id: item.product_id,
            name: item.name,
            set: item.set,
            rarity: item.rarity,
            condition: item.condition,
            quantity: item.quantity,
            price: item.price,
            cost: item.cost,
            image_url: item.image_url,
            last_updated: new Date().toISOString(),
            source: 'crystal_commerce'
        }));

        localStorage.setItem('cc_inventory', JSON.stringify(localInventory));
        
        // Trigger inventory update event
        window.dispatchEvent(new CustomEvent('inventoryUpdated', {
            detail: { source: 'crystal_commerce', count: localInventory.length }
        }));
    }

    // Get local inventory (from localStorage for demo)
    getLocalInventory() {
        const inventory = localStorage.getItem('cc_inventory');
        return inventory ? JSON.parse(inventory) : [];
    }

    // Start automatic sync interval
    startSyncInterval() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }

        // Sync every 30 minutes
        this.syncInterval = setInterval(() => {
            this.syncInventory();
        }, 30 * 60 * 1000);
    }

    // Stop automatic sync
    stopSyncInterval() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
    }

    // Clear inventory-related cache
    clearInventoryCache() {
        for (const [key] of this.cache) {
            if (key.startsWith('inventory_')) {
                this.cache.delete(key);
            }
        }
    }

    // Clear all cache
    clearCache() {
        this.cache.clear();
    }

    // Get connection status
    getStatus() {
        return {
            connected: this.isConnected,
            storeId: this.storeId,
            hasApiKey: !!this.apiKey,
            cacheSize: this.cache.size,
            syncRunning: !!this.syncInterval
        };
    }

    // Disconnect from Crystal Commerce
    disconnect() {
        this.isConnected = false;
        this.stopSyncInterval();
        this.clearCache();
        this.storeId = null;
        this.apiKey = null;
        console.log('Disconnected from Crystal Commerce');
    }

    // Format product data for display (Crystal Commerce compatible)
    formatProductForDisplay(product) {
        return {
            id: product.id,
            name: product.name,
            set: product.set,
            rarity: product.rarity,
            condition: product.condition,
            price: parseFloat(product.price || 0),
            quantity: parseInt(product.quantity || 0),
            image: product.image_url || product.image,
            game: product.game || 'Yu-Gi-Oh!',
            category: product.category,
            description: product.description,
            last_updated: product.last_updated
        };
    }

    // Create order in Crystal Commerce
    async createOrder(orderData) {
        try {
            const response = await this.makeRequest('POST', 'orders', {
                customer: orderData.customer,
                items: orderData.items,
                shipping_address: orderData.shipping_address,
                billing_address: orderData.billing_address,
                payment_method: orderData.payment_method,
                notes: orderData.notes
            });

            return response.order;
        } catch (error) {
            console.error('Error creating order in Crystal Commerce:', error);
            throw error;
        }
    }

    // Get order status
    async getOrder(orderId) {
        try {
            const response = await this.makeRequest('GET', `orders/${orderId}`);
            return response.order;
        } catch (error) {
            console.error('Error fetching order:', error);
            return null;
        }
    }
}

// Export for use in other modules
window.CrystalCommerceIntegration = CrystalCommerceIntegration;
