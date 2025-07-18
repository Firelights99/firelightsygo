// TCGPlayer API Service - Real Market Pricing Integration
class TCGPlayerApiService {
    constructor() {
        this.baseUrl = 'https://api.tcgplayer.com/';
        this.apiVersion = 'v1.39.0';
        this.publicKey = null; // Set via admin panel
        this.privateKey = null; // Set via admin panel
        this.bearerToken = null;
        this.tokenExpiry = null;
        this.cache = new Map();
        this.cacheExpiry = 2 * 24 * 60 * 60 * 1000; // 2 days for pricing data
        this.pricingCacheKey = 'tcgplayer_pricing_cache';
        this.loadPricingCache();
        this.exchangeRate = 1.35; // USD to CAD - updated automatically
        this.lastExchangeRateUpdate = null;
    }

    // Initialize TCGPlayer API connection
    async initialize(publicKey, privateKey) {
        this.publicKey = publicKey;
        this.privateKey = privateKey;
        
        try {
            await this.authenticate();
            await this.updateExchangeRate();
            console.log('TCGPlayer API initialized successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize TCGPlayer API:', error);
            return false;
        }
    }

    // Authenticate with TCGPlayer API
    async authenticate() {
        if (!this.publicKey || !this.privateKey) {
            throw new Error('TCGPlayer API keys required');
        }

        const credentials = btoa(`${this.publicKey}:${this.privateKey}`);
        
        try {
            const response = await fetch(`${this.baseUrl}token`, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${credentials}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    grant_type: 'client_credentials'
                })
            });

            if (!response.ok) {
                throw new Error(`Authentication failed: ${response.status}`);
            }

            const data = await response.json();
            this.bearerToken = data.access_token;
            this.tokenExpiry = Date.now() + (data.expires_in * 1000);
            
            return true;
        } catch (error) {
            console.error('TCGPlayer authentication error:', error);
            throw error;
        }
    }

    // Check if token needs refresh
    async ensureValidToken() {
        if (!this.bearerToken || Date.now() >= this.tokenExpiry - 60000) { // Refresh 1 minute early
            await this.authenticate();
        }
    }

    // Make authenticated API request
    async makeRequest(endpoint, params = {}) {
        await this.ensureValidToken();

        const queryParams = new URLSearchParams(params);
        const url = `${this.baseUrl}${this.apiVersion}/${endpoint}?${queryParams.toString()}`;

        try {
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${this.bearerToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`TCGPlayer API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('TCGPlayer API request failed:', error);
            throw error;
        }
    }

    // Get current USD to CAD exchange rate
    async updateExchangeRate() {
        // Skip if updated recently (once per hour)
        if (this.lastExchangeRateUpdate && 
            Date.now() - this.lastExchangeRateUpdate < 60 * 60 * 1000) {
            return this.exchangeRate;
        }

        try {
            // Using a free exchange rate API
            const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
            const data = await response.json();
            
            if (data.rates && data.rates.CAD) {
                this.exchangeRate = data.rates.CAD;
                this.lastExchangeRateUpdate = Date.now();
                console.log(`Exchange rate updated: 1 USD = ${this.exchangeRate} CAD`);
            }
        } catch (error) {
            console.warn('Failed to update exchange rate, using cached value:', error);
        }

        return this.exchangeRate;
    }

    // Load pricing cache from localStorage
    loadPricingCache() {
        try {
            const cachedData = localStorage.getItem(this.pricingCacheKey);
            if (cachedData) {
                const parsedData = JSON.parse(cachedData);
                
                // Restore cache entries that haven't expired
                Object.entries(parsedData).forEach(([key, value]) => {
                    if (Date.now() - value.timestamp < this.cacheExpiry) {
                        this.cache.set(key, value);
                    }
                });
                
                console.log(`Loaded ${this.cache.size} cached pricing entries from localStorage`);
            }
        } catch (error) {
            console.warn('Failed to load pricing cache from localStorage:', error);
        }
    }

    // Save pricing cache to localStorage
    savePricingCache() {
        try {
            const cacheData = {};
            
            // Only save pricing-related cache entries
            this.cache.forEach((value, key) => {
                if (key.startsWith('pricing_') || key.startsWith('product_')) {
                    cacheData[key] = value;
                }
            });
            
            localStorage.setItem(this.pricingCacheKey, JSON.stringify(cacheData));
        } catch (error) {
            console.warn('Failed to save pricing cache to localStorage:', error);
        }
    }

    // Convert USD to CAD
    convertToCAD(usdAmount) {
        return usdAmount * this.exchangeRate;
    }

    // Search for Yu-Gi-Oh! products by name
    async searchProducts(cardName, options = {}) {
        const cacheKey = `search_${cardName}_${JSON.stringify(options)}`;
        
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheExpiry) {
                return cached.data;
            }
        }

        try {
            const params = {
                productName: cardName,
                categoryId: 2, // Yu-Gi-Oh! category ID
                limit: options.limit || 50,
                offset: options.offset || 0
            };

            const response = await this.makeRequest('catalog/products', params);
            const products = response.results || [];

            // Cache the result
            this.cache.set(cacheKey, {
                data: products,
                timestamp: Date.now()
            });

            // Save to localStorage for persistence
            this.savePricingCache();

            return products;
        } catch (error) {
            console.error('Error searching TCGPlayer products:', error);
            return [];
        }
    }

    // Get product details by TCGPlayer product ID
    async getProduct(productId) {
        const cacheKey = `product_${productId}`;
        
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheExpiry) {
                return cached.data;
            }
        }

        try {
            const response = await this.makeRequest(`catalog/products/${productId}`);
            const product = response.results[0];

            this.cache.set(cacheKey, {
                data: product,
                timestamp: Date.now()
            });

            // Save to localStorage for persistence
            this.savePricingCache();

            return product;
        } catch (error) {
            console.error('Error fetching product details:', error);
            return null;
        }
    }

    // Get current market pricing for a product
    async getProductPricing(productId) {
        const cacheKey = `pricing_${productId}`;
        
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheExpiry) {
                return cached.data;
            }
        }

        try {
            const response = await this.makeRequest(`pricing/product/${productId}`);
            const pricing = response.results[0];

            if (pricing) {
                // Convert all prices to CAD
                const cadPricing = {
                    productId: pricing.productId,
                    lowPrice: this.convertToCAD(pricing.lowPrice || 0),
                    midPrice: this.convertToCAD(pricing.midPrice || 0),
                    highPrice: this.convertToCAD(pricing.highPrice || 0),
                    marketPrice: this.convertToCAD(pricing.marketPrice || 0),
                    directLowPrice: this.convertToCAD(pricing.directLowPrice || 0),
                    subTypeName: pricing.subTypeName,
                    lastUpdated: new Date().toISOString(),
                    exchangeRate: this.exchangeRate
                };

                this.cache.set(cacheKey, {
                    data: cadPricing,
                    timestamp: Date.now()
                });

                // Save to localStorage for persistence
                this.savePricingCache();

                return cadPricing;
            }

            return null;
        } catch (error) {
            console.error('Error fetching product pricing:', error);
            return null;
        }
    }

    // Get pricing for multiple products (batch request)
    async getBatchPricing(productIds) {
        if (!Array.isArray(productIds) || productIds.length === 0) {
            return [];
        }

        // Check cache first
        const cachedResults = [];
        const uncachedIds = [];

        productIds.forEach(id => {
            const cacheKey = `pricing_${id}`;
            if (this.cache.has(cacheKey)) {
                const cached = this.cache.get(cacheKey);
                if (Date.now() - cached.timestamp < this.cacheExpiry) {
                    cachedResults.push(cached.data);
                    return;
                }
            }
            uncachedIds.push(id);
        });

        // Fetch uncached pricing
        if (uncachedIds.length > 0) {
            try {
                const params = {
                    productIds: uncachedIds.join(',')
                };

                const response = await this.makeRequest('pricing/product', params);
                const pricingResults = response.results || [];

                // Convert to CAD and cache
                pricingResults.forEach(pricing => {
                    const cadPricing = {
                        productId: pricing.productId,
                        lowPrice: this.convertToCAD(pricing.lowPrice || 0),
                        midPrice: this.convertToCAD(pricing.midPrice || 0),
                        highPrice: this.convertToCAD(pricing.highPrice || 0),
                        marketPrice: this.convertToCAD(pricing.marketPrice || 0),
                        directLowPrice: this.convertToCAD(pricing.directLowPrice || 0),
                        subTypeName: pricing.subTypeName,
                        lastUpdated: new Date().toISOString(),
                        exchangeRate: this.exchangeRate
                    };

                    const cacheKey = `pricing_${pricing.productId}`;
                    this.cache.set(cacheKey, {
                        data: cadPricing,
                        timestamp: Date.now()
                    });

                    cachedResults.push(cadPricing);
                });

                // Save batch updates to localStorage
                this.savePricingCache();
            } catch (error) {
                console.error('Error fetching batch pricing:', error);
            }
        }

        return cachedResults;
    }

    // Get pricing by condition (Near Mint, Lightly Played, etc.)
    async getPricingByCondition(productId, condition = 'Near Mint') {
        try {
            const pricing = await this.getProductPricing(productId);
            
            if (!pricing) return null;

            // TCGPlayer condition multipliers (approximate)
            const conditionMultipliers = {
                'Near Mint': 1.0,
                'Lightly Played': 0.85,
                'Moderately Played': 0.70,
                'Heavily Played': 0.55,
                'Damaged': 0.40
            };

            const multiplier = conditionMultipliers[condition] || 1.0;

            return {
                productId: pricing.productId,
                condition: condition,
                lowPrice: pricing.lowPrice * multiplier,
                midPrice: pricing.midPrice * multiplier,
                highPrice: pricing.highPrice * multiplier,
                marketPrice: pricing.marketPrice * multiplier,
                directLowPrice: pricing.directLowPrice * multiplier,
                lastUpdated: pricing.lastUpdated,
                exchangeRate: pricing.exchangeRate
            };
        } catch (error) {
            console.error('Error getting condition pricing:', error);
            return null;
        }
    }

    // Match Yu-Gi-Oh! card name to TCGPlayer product
    async findCardProduct(cardName, setName = null) {
        try {
            const products = await this.searchProducts(cardName, { limit: 20 });
            
            if (products.length === 0) {
                return null;
            }

            // If set name provided, try to find exact match
            if (setName) {
                const exactMatch = products.find(product => 
                    product.name.toLowerCase().includes(cardName.toLowerCase()) &&
                    product.groupName.toLowerCase().includes(setName.toLowerCase())
                );
                
                if (exactMatch) {
                    return exactMatch;
                }
            }

            // Return best name match
            const bestMatch = products.find(product => 
                product.name.toLowerCase() === cardName.toLowerCase()
            ) || products[0];

            return bestMatch;
        } catch (error) {
            console.error('Error finding card product:', error);
            return null;
        }
    }

    // Get comprehensive card pricing (all conditions)
    async getCardPricing(cardName, setName = null) {
        try {
            const product = await this.findCardProduct(cardName, setName);
            
            if (!product) {
                return null;
            }

            const basePricing = await this.getProductPricing(product.productId);
            
            if (!basePricing) {
                return null;
            }

            // Generate pricing for all conditions
            const conditions = ['Near Mint', 'Lightly Played', 'Moderately Played', 'Heavily Played', 'Damaged'];
            const conditionPricing = {};

            for (const condition of conditions) {
                const conditionData = await this.getPricingByCondition(product.productId, condition);
                if (conditionData) {
                    conditionPricing[condition.toLowerCase().replace(' ', '_')] = conditionData;
                }
            }

            return {
                productId: product.productId,
                productName: product.name,
                setName: product.groupName,
                imageUrl: product.imageUrl,
                conditions: conditionPricing,
                lastUpdated: basePricing.lastUpdated,
                exchangeRate: basePricing.exchangeRate
            };
        } catch (error) {
            console.error('Error getting comprehensive card pricing:', error);
            return null;
        }
    }

    // Get buylist pricing (estimated at 40-60% of market price)
    getBuylistPrice(marketPrice, condition = 'Near Mint') {
        const buylistMultipliers = {
            'Near Mint': 0.60,
            'Lightly Played': 0.50,
            'Moderately Played': 0.45,
            'Heavily Played': 0.35,
            'Damaged': 0.25
        };

        const multiplier = buylistMultipliers[condition] || 0.50;
        return Math.max(0.25, marketPrice * multiplier);
    }

    // Clear pricing cache
    clearCache() {
        this.cache.clear();
        localStorage.removeItem(this.pricingCacheKey);
        console.log('Pricing cache cleared');
    }

    // Get cache statistics
    getCacheStats() {
        const pricingEntries = Array.from(this.cache.keys()).filter(key => 
            key.startsWith('pricing_') || key.startsWith('product_')
        );
        
        const oldestEntry = pricingEntries.reduce((oldest, key) => {
            const entry = this.cache.get(key);
            return !oldest || entry.timestamp < oldest ? entry.timestamp : oldest;
        }, null);

        const newestEntry = pricingEntries.reduce((newest, key) => {
            const entry = this.cache.get(key);
            return !newest || entry.timestamp > newest ? entry.timestamp : newest;
        }, null);

        return {
            totalCacheSize: this.cache.size,
            pricingCacheSize: pricingEntries.length,
            exchangeRate: this.exchangeRate,
            lastExchangeUpdate: this.lastExchangeRateUpdate,
            tokenExpiry: this.tokenExpiry,
            cacheExpiry: this.cacheExpiry,
            cacheDurationDays: this.cacheExpiry / (24 * 60 * 60 * 1000),
            oldestPriceData: oldestEntry ? new Date(oldestEntry).toISOString() : null,
            newestPriceData: newestEntry ? new Date(newestEntry).toISOString() : null
        };
    }

    // Get user-friendly cache information
    getCacheInfo() {
        const stats = this.getCacheStats();
        const now = Date.now();
        
        let nextUpdateTime = null;
        if (stats.newestPriceData) {
            nextUpdateTime = new Date(new Date(stats.newestPriceData).getTime() + this.cacheExpiry);
        }

        return {
            message: `Prices are cached for ${stats.cacheDurationDays} days to ensure stability`,
            cachedPrices: stats.pricingCacheSize,
            nextUpdate: nextUpdateTime ? nextUpdateTime.toLocaleDateString('en-CA') : 'When new cards are viewed',
            priceStability: 'Prices remain consistent during cache period for better shopping experience',
            lastRefresh: stats.newestPriceData ? new Date(stats.newestPriceData).toLocaleDateString('en-CA') : 'No cached prices'
        };
    }

    // Check API connection status
    getConnectionStatus() {
        return {
            connected: !!this.bearerToken,
            tokenValid: this.tokenExpiry && Date.now() < this.tokenExpiry,
            hasKeys: !!(this.publicKey && this.privateKey),
            exchangeRate: this.exchangeRate,
            cacheSize: this.cache.size
        };
    }

    // Format price for display in CAD
    formatPrice(amount) {
        return new Intl.NumberFormat('en-CA', {
            style: 'currency',
            currency: 'CAD'
        }).format(amount);
    }
}

// Export for use in other modules
window.TCGPlayerApiService = TCGPlayerApiService;
