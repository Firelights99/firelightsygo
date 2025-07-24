/**
 * Production Database Service - Connects to Backend API
 * This service replaces localStorage with real database operations
 */

class ProductionDatabaseService {
    constructor() {
        // Production API endpoint - update this with your deployed backend URL
        this.apiBaseURL = this.getApiBaseURL();
        this.token = localStorage.getItem('auth-token');
        this.cache = new Map();
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
        
        this.init();
    }

    getApiBaseURL() {
        // Determine API URL based on environment
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return 'http://localhost:3001/api/v1';
        } else {
            // Update this with your production API URL
            return 'https://your-api-domain.com/api/v1';
        }
    }

    init() {
        console.log('🔗 Production Database Service initialized');
        console.log('📡 API Base URL:', this.apiBaseURL);
        
        // Test connection on initialization
        this.testConnection();
    }

    async testConnection() {
        try {
            const response = await fetch(this.apiBaseURL.replace('/api/v1', '/health'));
            if (response.ok) {
                const health = await response.json();
                
            }
        } catch (error) {
            console.warn('⚠️ Backend connection failed:', error.message);
            console.log('📱 Falling back to localStorage mode');
        }
    }

    // Helper method to make authenticated requests
    async makeRequest(endpoint, options = {}) {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(this.token && { 'Authorization': `Bearer ${this.token}` })
            },
            ...options
        };

        if (options.body && typeof options.body === 'object') {
            config.body = JSON.stringify(options.body);
        }

        const response = await fetch(`${this.apiBaseURL}${endpoint}`, config);
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Network error' }));
            throw new Error(error.error || `HTTP ${response.status}`);
        }

        return await response.json();
    }

    // User Management
    async createUser(userData) {
        try {
            const response = await this.makeRequest('/auth/register', {
                method: 'POST',
                body: {
                    email: userData.email,
                    password: userData.password,
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    phone: userData.phone
                }
            });

            if (response.success) {
                this.token = response.data.token;
                localStorage.setItem('auth-token', this.token);
                return response.data.user;
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    async authenticateUser(email, password) {
        try {
            const response = await this.makeRequest('/auth/login', {
                method: 'POST',
                body: { email, password }
            });

            if (response.success) {
                this.token = response.data.token;
                localStorage.setItem('auth-token', this.token);
                return response.data.user;
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            console.error('Error authenticating user:', error);
            throw error;
        }
    }

    async getCurrentUser() {
        if (!this.token) return null;

        try {
            const response = await this.makeRequest('/users/profile');
            return response.success ? response.data.user : null;
        } catch (error) {
            console.error('Error getting current user:', error);
            // Token might be expired, clear it
            this.logout();
            return null;
        }
    }

    async updateUser(userData) {
        try {
            const response = await this.makeRequest('/users/profile', {
                method: 'PUT',
                body: userData
            });

            return response.success ? response.data.user : null;
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }

    // Product Management
    async getProducts(filters = {}) {
        try {
            const queryParams = new URLSearchParams();
            
            if (filters.search) queryParams.append('search', filters.search);
            if (filters.category) queryParams.append('category', filters.category);
            if (filters.featured) queryParams.append('featured', 'true');
            if (filters.limit) queryParams.append('limit', filters.limit);

            const endpoint = `/products${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
            const response = await this.makeRequest(endpoint);

            return response.success ? response.data.products : [];
        } catch (error) {
            console.error('Error getting products:', error);
            return [];
        }
    }

    async getProductById(id) {
        try {
            const response = await this.makeRequest(`/products/${id}`);
            return response.success ? response.data.product : null;
        } catch (error) {
            console.error('Error getting product:', error);
            return null;
        }
    }

    // Cart Management
    async getCart() {
        try {
            const response = await this.makeRequest('/cart');
            return response.success ? response.data : { items: [], total: 0, itemCount: 0 };
        } catch (error) {
            console.error('Error getting cart:', error);
            return { items: [], total: 0, itemCount: 0 };
        }
    }

    async addToCart(productId, quantity = 1) {
        try {
            const response = await this.makeRequest('/cart/add', {
                method: 'POST',
                body: { productId, quantity }
            });

            return response.success;
        } catch (error) {
            console.error('Error adding to cart:', error);
            throw error;
        }
    }

    async updateCartItem(cartId, quantity) {
        try {
            const response = await this.makeRequest(`/cart/update/${cartId}`, {
                method: 'PUT',
                body: { quantity }
            });

            return response.success;
        } catch (error) {
            console.error('Error updating cart item:', error);
            throw error;
        }
    }

    async removeFromCart(cartId) {
        try {
            const response = await this.makeRequest(`/cart/remove/${cartId}`, {
                method: 'DELETE'
            });

            return response.success;
        } catch (error) {
            console.error('Error removing from cart:', error);
            throw error;
        }
    }

    async clearCart() {
        try {
            const response = await this.makeRequest('/cart/clear', {
                method: 'DELETE'
            });

            return response.success;
        } catch (error) {
            console.error('Error clearing cart:', error);
            throw error;
        }
    }

    // Order Management
    async getUserOrders() {
        try {
            const response = await this.makeRequest('/users/orders');
            return response.success ? response.data.orders : [];
        } catch (error) {
            console.error('Error getting user orders:', error);
            return [];
        }
    }

    async createOrder(orderData) {
        try {
            const response = await this.makeRequest('/orders', {
                method: 'POST',
                body: orderData
            });

            return response.success ? response.data.order : null;
        } catch (error) {
            console.error('Error creating order:', error);
            throw error;
        }
    }

    // Authentication helpers
    logout() {
        this.token = null;
        localStorage.removeItem('auth-token');
        
        // Make logout request to backend
        this.makeRequest('/auth/logout', { method: 'POST' }).catch(() => {
            // Ignore errors on logout
        });
    }

    isAuthenticated() {
        return !!this.token;
    }

    async verifyToken() {
        if (!this.token) return false;

        try {
            const response = await this.makeRequest('/auth/verify');
            return response.success;
        } catch (error) {
            this.logout();
            return false;
        }
    }

    // Legacy compatibility methods (for existing frontend code)
    async getUserByEmail(email) {
        // This would typically be handled by authentication
        console.warn('getUserByEmail called - use authenticateUser instead');
        return null;
    }

    async getUserById(id) {
        // This would typically be handled by getCurrentUser
        console.warn('getUserById called - use getCurrentUser instead');
        return await this.getCurrentUser();
    }

    validateCurrentUser() {
        // Check if current user token is still valid
        return this.verifyToken();
    }

    // Settings (can be cached locally for performance)
    getSettings() {
        const cached = localStorage.getItem('app-settings');
        if (cached) {
            return JSON.parse(cached);
        }

        // Default settings
        const defaultSettings = {
            siteName: 'Firelight Duel Academy',
            currency: 'CAD',
            taxRate: 0.13,
            freeShippingThreshold: 75.00
        };

        localStorage.setItem('app-settings', JSON.stringify(defaultSettings));
        return defaultSettings;
    }

    setSettings(settings) {
        const currentSettings = this.getSettings();
        const updatedSettings = { ...currentSettings, ...settings };
        localStorage.setItem('app-settings', JSON.stringify(updatedSettings));
    }

    getSetting(key, defaultValue = null) {
        const settings = this.getSettings();
        return settings[key] !== undefined ? settings[key] : defaultValue;
    }

    setSetting(key, value) {
        const settings = this.getSettings();
        settings[key] = value;
        this.setSettings(settings);
    }

    // Analytics (send to backend)
    async trackEvent(eventType, eventData = {}) {
        try {
            // Send analytics to backend
            await this.makeRequest('/analytics/event', {
                method: 'POST',
                body: {
                    eventType,
                    eventData,
                    timestamp: new Date().toISOString()
                }
            });
        } catch (error) {
            // Don't fail if analytics fails
            console.warn('Analytics tracking failed:', error);
        }
    }

    // Health check
    async healthCheck() {
        try {
            const response = await fetch(this.apiBaseURL.replace('/api/v1', '/health'));
            const health = await response.json();
            
            return {
                status: 'healthy',
                backend: health,
                frontend: {
                    authenticated: this.isAuthenticated(),
                    apiUrl: this.apiBaseURL
                }
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                error: error.message,
                frontend: {
                    authenticated: this.isAuthenticated(),
                    apiUrl: this.apiBaseURL
                }
            };
        }
    }

    // Migration helpers
    exportData() {
        console.warn('exportData not available in production mode - data is stored in backend database');
        return {};
    }

    importData(data) {
        console.warn('importData not available in production mode - data is stored in backend database');
    }
}

// Initialize production database service
window.dbService = new ProductionDatabaseService();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProductionDatabaseService;
}
