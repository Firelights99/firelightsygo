/**
 * Database Service - Handles all database operations
 * This service provides a unified interface for database operations
 * and can be easily adapted to work with different backend systems
 */

class DatabaseService {
    constructor() {
        this.apiEndpoint = '/api'; // This would be your backend API endpoint
        this.isOfflineMode = true; // Set to false when backend is available
        this.cache = new Map();
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
        
        // Initialize local storage keys
        this.storageKeys = {
            users: 'tcg-users',
            orders: 'tcg-orders',
            inventory: 'tcg-inventory',
            cart: 'tcg-cart',
            wishlist: 'tcg-wishlist',
            settings: 'tcg-settings',
            analytics: 'tcg-analytics'
        };
        
        this.init();
    }

    init() {
        this.initializeDefaultData();
        this.setupPeriodicSync();
    }

    initializeDefaultData() {
        // Initialize default site settings if they don't exist
        const settings = this.getSettings();
        if (!settings.initialized) {
            this.setSettings({
                initialized: true,
                siteName: 'Firelight Duel Academy',
                currency: 'CAD',
                taxRate: 0.13, // HST for Ontario
                freeShippingThreshold: 75.00,
                storeCreditBonus: 0.10,
                buylistEnabled: true,
                priceUpdateFrequency: 24,
                defaultMarkup: 0.15,
                businessHours: {
                    sunday: '12:00 PM - 1:00 PM',
                    monday: 'Closed',
                    tuesday: 'Closed',
                    wednesday: 'Closed',
                    thursday: 'Closed',
                    friday: 'Closed',
                    saturday: 'Closed'
                }
            });
        }

        // Initialize membership plans
        this.initializeMembershipPlans();
    }

    initializeMembershipPlans() {
        const existingPlans = localStorage.getItem('tcg-membership-plans');
        if (!existingPlans) {
            const defaultPlans = [
                {
                    id: 'locals',
                    name: 'Locals',
                    description: 'Perfect for local TCG enthusiasts who want exclusive access and benefits.',
                    price: 10.00,
                    currency: 'CAD',
                    isActive: true,
                    isOnSale: true,
                    salePrice: 10.00,
                    maxMembers: null,
                    currentMembers: 0,
                    benefits: [
                        'Exclusive member benefits',
                        'Priority access to new releases',
                        'Member-only events',
                        'Special discounts'
                    ],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ];
            localStorage.setItem('tcg-membership-plans', JSON.stringify(defaultPlans));
        }
    }

    setupPeriodicSync() {
        // Sync with backend every 5 minutes if online
        if (!this.isOfflineMode) {
            setInterval(() => {
                this.syncWithBackend();
            }, 5 * 60 * 1000);
        }
    }

    // User Management
    async createUser(userData) {
        try {
            if (this.isOfflineMode) {
                return this.createUserLocal(userData);
            } else {
                return await this.createUserRemote(userData);
            }
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    createUserLocal(userData) {
        const users = JSON.parse(localStorage.getItem(this.storageKeys.users) || '{}');
        
        // Check if user already exists
        if (users[userData.email]) {
            throw new Error('User with this email already exists');
        }

        // Create new user
        const newUser = {
            id: Date.now(),
            username: userData.username || userData.email.split('@')[0],
            email: userData.email,
            passwordHash: this.hashPassword(userData.password), // Simple hash for demo
            firstName: userData.firstName,
            lastName: userData.lastName,
            phone: userData.phone || '',
            dateOfBirth: userData.dateOfBirth || null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isActive: true,
            emailVerified: false,
            isAdmin: false,
            profileImage: null,
            favoriteArchetype: userData.favoriteArchetype || null,
            addresses: [],
            orders: [],
            wishlist: [],
            storeCredit: {
                balance: 0.00,
                lifetimeEarned: 0.00,
                lifetimeSpent: 0.00
            }
        };

        // Save user
        users[userData.email] = newUser;
        localStorage.setItem(this.storageKeys.users, JSON.stringify(users));

        // Initialize user's store credit
        this.initializeStoreCredit(newUser.id);

        return newUser;
    }

    async createUserRemote(userData) {
        const response = await fetch(`${this.apiEndpoint}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            throw new Error('Failed to create user');
        }

        return await response.json();
    }

    async authenticateUser(email, password) {
        try {
            if (this.isOfflineMode) {
                return this.authenticateUserLocal(email, password);
            } else {
                return await this.authenticateUserRemote(email, password);
            }
        } catch (error) {
            console.error('Error authenticating user:', error);
            throw error;
        }
    }

    authenticateUserLocal(email, password) {
        const users = JSON.parse(localStorage.getItem(this.storageKeys.users) || '{}');
        const user = users[email];

        if (!user || !this.verifyPassword(password, user.passwordHash)) {
            throw new Error('Invalid email or password');
        }

        if (!user.isActive) {
            throw new Error('Account is deactivated');
        }

        // Update last login
        user.lastLoginAt = new Date().toISOString();
        users[email] = user;
        localStorage.setItem(this.storageKeys.users, JSON.stringify(users));

        return user;
    }

    async authenticateUserRemote(email, password) {
        const response = await fetch(`${this.apiEndpoint}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            throw new Error('Authentication failed');
        }

        return await response.json();
    }

    // Order Management
    async createOrder(orderData) {
        try {
            if (this.isOfflineMode) {
                return this.createOrderLocal(orderData);
            } else {
                return await this.createOrderRemote(orderData);
            }
        } catch (error) {
            console.error('Error creating order:', error);
            throw error;
        }
    }

    createOrderLocal(orderData) {
        const orders = JSON.parse(localStorage.getItem(this.storageKeys.orders) || '[]');
        
        const newOrder = {
            id: Date.now(),
            orderNumber: this.generateOrderNumber(),
            userId: orderData.userId,
            status: 'pending',
            paymentStatus: 'pending',
            items: orderData.items.map(item => ({
                id: Date.now() + Math.random(),
                inventoryId: item.inventoryId || null,
                cardName: item.name,
                setCode: item.setCode || '',
                rarity: item.rarity || '',
                conditionGrade: item.condition || 'near_mint',
                quantity: item.quantity,
                unitPrice: item.price,
                totalPrice: item.price * item.quantity
            })),
            totalAmount: orderData.totalAmount,
            subtotal: orderData.subtotal,
            taxAmount: orderData.taxAmount || 0,
            shippingAmount: orderData.shippingAmount || 0,
            storeCreditUsed: orderData.storeCreditUsed || 0,
            paymentMethod: orderData.paymentMethod || 'square',
            paymentId: null,
            shippingAddress: orderData.shippingAddress || null,
            billingAddress: orderData.billingAddress || null,
            trackingNumber: null,
            shippedAt: null,
            deliveredAt: null,
            notes: orderData.notes || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        orders.push(newOrder);
        localStorage.setItem(this.storageKeys.orders, JSON.stringify(orders));

        // Update inventory quantities
        this.updateInventoryForOrder(newOrder);

        // Track analytics
        this.trackEvent('order_created', {
            orderId: newOrder.id,
            userId: newOrder.userId,
            totalAmount: newOrder.totalAmount,
            itemCount: newOrder.items.length
        });

        return newOrder;
    }

    generateOrderNumber() {
        const timestamp = Date.now().toString();
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `FD${timestamp.slice(-6)}${random}`;
    }

    updateInventoryForOrder(order) {
        // In a real implementation, this would update actual inventory
        // For now, we'll just track the order items
        const inventory = JSON.parse(localStorage.getItem('tcg-inventory-transactions') || '[]');
        
        order.items.forEach(item => {
            inventory.push({
                id: Date.now() + Math.random(),
                inventoryId: item.inventoryId,
                type: 'out',
                quantity: item.quantity,
                referenceType: 'sale',
                referenceId: order.id,
                notes: `Sold via order ${order.orderNumber}`,
                createdAt: new Date().toISOString()
            });
        });

        localStorage.setItem('tcg-inventory-transactions', JSON.stringify(inventory));
    }

    // Store Credit Management
    initializeStoreCredit(userId) {
        const storeCredits = JSON.parse(localStorage.getItem('tcg-store-credits') || '{}');
        
        if (!storeCredits[userId]) {
            storeCredits[userId] = {
                userId: userId,
                balance: 0.00,
                lifetimeEarned: 0.00,
                lifetimeSpent: 0.00,
                lastUpdated: new Date().toISOString()
            };
            
            localStorage.setItem('tcg-store-credits', JSON.stringify(storeCredits));
        }
    }

    async addStoreCredit(userId, amount, description, referenceType = 'bonus', referenceId = null) {
        const storeCredits = JSON.parse(localStorage.getItem('tcg-store-credits') || '{}');
        const transactions = JSON.parse(localStorage.getItem('tcg-store-credit-transactions') || '[]');
        
        if (!storeCredits[userId]) {
            this.initializeStoreCredit(userId);
        }

        const credit = storeCredits[userId];
        const oldBalance = credit.balance;
        credit.balance += amount;
        credit.lifetimeEarned += amount;
        credit.lastUpdated = new Date().toISOString();

        // Create transaction record
        const transaction = {
            id: Date.now() + Math.random(),
            userId: userId,
            type: 'earned',
            amount: amount,
            balanceAfter: credit.balance,
            description: description,
            referenceType: referenceType,
            referenceId: referenceId,
            createdAt: new Date().toISOString(),
            expiresAt: null // Store credit doesn't expire by default
        };

        transactions.push(transaction);
        storeCredits[userId] = credit;

        localStorage.setItem('tcg-store-credits', JSON.stringify(storeCredits));
        localStorage.setItem('tcg-store-credit-transactions', JSON.stringify(transactions));

        return transaction;
    }

    async useStoreCredit(userId, amount, description, referenceType = 'purchase', referenceId = null) {
        const storeCredits = JSON.parse(localStorage.getItem('tcg-store-credits') || '{}');
        const transactions = JSON.parse(localStorage.getItem('tcg-store-credit-transactions') || '[]');
        
        if (!storeCredits[userId]) {
            throw new Error('No store credit account found');
        }

        const credit = storeCredits[userId];
        if (credit.balance < amount) {
            throw new Error('Insufficient store credit balance');
        }

        credit.balance -= amount;
        credit.lifetimeSpent += amount;
        credit.lastUpdated = new Date().toISOString();

        // Create transaction record
        const transaction = {
            id: Date.now() + Math.random(),
            userId: userId,
            type: 'spent',
            amount: amount,
            balanceAfter: credit.balance,
            description: description,
            referenceType: referenceType,
            referenceId: referenceId,
            createdAt: new Date().toISOString()
        };

        transactions.push(transaction);
        storeCredits[userId] = credit;

        localStorage.setItem('tcg-store-credits', JSON.stringify(storeCredits));
        localStorage.setItem('tcg-store-credit-transactions', JSON.stringify(transactions));

        return transaction;
    }

    getStoreCreditBalance(userId) {
        const storeCredits = JSON.parse(localStorage.getItem('tcg-store-credits') || '{}');
        return storeCredits[userId] ? storeCredits[userId].balance : 0.00;
    }

    // Wishlist Management
    async addToWishlist(userId, cardData) {
        const wishlists = JSON.parse(localStorage.getItem('tcg-wishlists') || '{}');
        
        if (!wishlists[userId]) {
            wishlists[userId] = [];
        }

        const existingItem = wishlists[userId].find(item => item.cardId === cardData.cardId);
        if (existingItem) {
            throw new Error('Item already in wishlist');
        }

        const wishlistItem = {
            id: Date.now() + Math.random(),
            userId: userId,
            cardId: cardData.cardId,
            cardName: cardData.name,
            preferredSet: cardData.preferredSet || null,
            preferredRarity: cardData.preferredRarity || null,
            maxCondition: cardData.maxCondition || 'lightly_played',
            targetPrice: cardData.targetPrice || null,
            notifyWhenAvailable: true,
            notifyWhenPriceDrops: true,
            createdAt: new Date().toISOString()
        };

        wishlists[userId].push(wishlistItem);
        localStorage.setItem('tcg-wishlists', JSON.stringify(wishlists));

        return wishlistItem;
    }

    async removeFromWishlist(userId, wishlistItemId) {
        const wishlists = JSON.parse(localStorage.getItem('tcg-wishlists') || '{}');
        
        if (wishlists[userId]) {
            wishlists[userId] = wishlists[userId].filter(item => item.id !== wishlistItemId);
            localStorage.setItem('tcg-wishlists', JSON.stringify(wishlists));
        }
    }

    getUserWishlist(userId) {
        const wishlists = JSON.parse(localStorage.getItem('tcg-wishlists') || '{}');
        return wishlists[userId] || [];
    }

    // Analytics
    trackEvent(eventType, eventData = {}) {
        const analytics = JSON.parse(localStorage.getItem(this.storageKeys.analytics) || '[]');
        
        const event = {
            id: Date.now() + Math.random(),
            eventType: eventType,
            eventData: eventData,
            userId: eventData.userId || null,
            sessionId: this.getSessionId(),
            ipAddress: null, // Would be set by backend
            userAgent: navigator.userAgent,
            createdAt: new Date().toISOString()
        };

        analytics.push(event);
        
        // Keep only last 1000 events in local storage
        if (analytics.length > 1000) {
            analytics.splice(0, analytics.length - 1000);
        }
        
        localStorage.setItem(this.storageKeys.analytics, JSON.stringify(analytics));
    }

    getSessionId() {
        let sessionId = sessionStorage.getItem('tcg-session-id');
        if (!sessionId) {
            sessionId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('tcg-session-id', sessionId);
        }
        return sessionId;
    }

    // Settings Management
    getSettings() {
        return JSON.parse(localStorage.getItem(this.storageKeys.settings) || '{}');
    }

    setSettings(settings) {
        const currentSettings = this.getSettings();
        const updatedSettings = { ...currentSettings, ...settings };
        localStorage.setItem(this.storageKeys.settings, JSON.stringify(updatedSettings));
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

    // Utility Methods
    hashPassword(password) {
        // Simple hash for demo - use proper hashing in production
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString();
    }

    verifyPassword(password, hash) {
        return this.hashPassword(password) === hash;
    }

    async syncWithBackend() {
        if (this.isOfflineMode) return;
        
        try {
            // Sync pending data with backend
            console.log('Syncing with backend...');
            // Implementation would sync local changes to backend
        } catch (error) {
            console.error('Backend sync failed:', error);
        }
    }

    // Data Export/Import for Migration
    exportData() {
        const data = {};
        Object.values(this.storageKeys).forEach(key => {
            data[key] = localStorage.getItem(key);
        });
        return data;
    }

    importData(data) {
        Object.entries(data).forEach(([key, value]) => {
            if (value !== null) {
                localStorage.setItem(key, value);
            }
        });
    }

    // Database Health Check
    healthCheck() {
        const health = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            storage: {
                available: true,
                usage: this.getStorageUsage()
            },
            backend: {
                connected: !this.isOfflineMode,
                lastSync: null
            }
        };

        return health;
    }

    getStorageUsage() {
        let totalSize = 0;
        Object.values(this.storageKeys).forEach(key => {
            const item = localStorage.getItem(key);
            if (item) {
                totalSize += item.length;
            }
        });
        return {
            totalBytes: totalSize,
            totalKB: Math.round(totalSize / 1024),
            totalMB: Math.round(totalSize / (1024 * 1024))
        };
    }
}

// Initialize database service
window.dbService = new DatabaseService();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DatabaseService;
}
