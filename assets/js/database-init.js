/**
 * Database Initialization Script
 * Sets up the database with sample data and ensures all systems are connected
 */

class DatabaseInitializer {
    constructor() {
        this.dbService = window.dbService;
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return;

        try {
            // Wait for database service to be ready
            await this.waitForDatabaseService();

            // Initialize sample data
            await this.initializeSampleData();

            // Set up data relationships
            await this.setupDataRelationships();

            // Verify database health
            const health = this.dbService.healthCheck();
            
            this.initialized = true;
            
            // Show initialization success message
            this.showInitializationMessage();

        } catch (error) {
            console.error('❌ Database initialization failed:', error);
            this.showErrorMessage(error.message);
        }
    }

    async waitForDatabaseService() {
        let attempts = 0;
        const maxAttempts = 50;

        while (!window.dbService && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }

        if (!window.dbService) {
            throw new Error('Database service failed to initialize');
        }

    }

    async initializeSampleData() {
        
        // Create sample admin user if none exists
        await this.createSampleAdmin();

        // Create sample regular users
        await this.createSampleUsers();

        // Initialize inventory with sample cards
        await this.initializeSampleInventory();

        // Create sample orders
        await this.createSampleOrders();

    }

    async createSampleAdmin() {
        try {
            // Check if any admin user already exists
            const users = JSON.parse(localStorage.getItem('tcg-users') || '{}');
            const existingAdmin = Object.values(users).find(user => user.isAdmin);
            
            if (existingAdmin) {
                console.log('👑 Admin user already exists:', existingAdmin.email);
                return;
            }

            const adminUser = await this.dbService.createUser({
                email: 'admin@firelightduelacademy.com',
                password: 'admin123',
                firstName: 'Store',
                lastName: 'Administrator',
                phone: '647-555-DUEL',
                favoriteArchetype: 'Blue-Eyes'
            });

            // Mark as admin (would be done in backend normally)
            const updatedUsers = JSON.parse(localStorage.getItem('tcg-users') || '{}');
            if (updatedUsers[adminUser.email]) {
                updatedUsers[adminUser.email].isAdmin = true;
                localStorage.setItem('tcg-users', JSON.stringify(updatedUsers));
            }

            console.log('👑 Admin user created:', adminUser.email);
        } catch (error) {
            if (error.message.includes('already exists')) {
                console.log('👑 Admin user already exists');
            } else {
                console.warn('⚠️ Could not create admin user:', error.message);
            }
        }
    }

    async createSampleUsers() {
        const sampleUsers = [
            {
                email: 'duelist1@example.com',
                password: 'password123',
                firstName: 'Yugi',
                lastName: 'Moto',
                phone: '416-555-0001',
                favoriteArchetype: 'Dark Magician'
            },
            {
                email: 'duelist2@example.com',
                password: 'password123',
                firstName: 'Kaiba',
                lastName: 'Seto',
                phone: '416-555-0002',
                favoriteArchetype: 'Blue-Eyes'
            },
            {
                email: 'duelist3@example.com',
                password: 'password123',
                firstName: 'Joey',
                lastName: 'Wheeler',
                phone: '416-555-0003',
                favoriteArchetype: 'Red-Eyes'
            }
        ];

        for (const userData of sampleUsers) {
            try {
                const user = await this.dbService.createUser(userData);
                
                // Add some store credit to sample users
                await this.dbService.addStoreCredit(
                    user.id, 
                    Math.random() * 50 + 10, 
                    'Welcome bonus', 
                    'bonus'
                );

                console.log('👤 Sample user created:', user.email);
            } catch (error) {
                if (!error.message.includes('already exists')) {
                    console.warn('⚠️ Could not create sample user:', userData.email, error.message);
                }
            }
        }
    }

    async initializeSampleInventory() {
        const sampleCards = [
            {
                cardId: 89631139, // Blue-Eyes White Dragon
                name: 'Blue-Eyes White Dragon',
                setCode: 'LOB-001',
                rarity: 'Ultra Rare',
                condition: 'near_mint',
                quantity: 5,
                price: 45.99
            },
            {
                cardId: 46986414, // Dark Magician
                name: 'Dark Magician',
                setCode: 'LOB-005',
                rarity: 'Ultra Rare',
                condition: 'near_mint',
                quantity: 3,
                price: 38.99
            },
            {
                cardId: 14558127, // Ash Blossom & Joyous Spring
                name: 'Ash Blossom & Joyous Spring',
                setCode: 'MACR-EN036',
                rarity: 'Secret Rare',
                condition: 'near_mint',
                quantity: 8,
                price: 89.99
            },
            {
                cardId: 27204311, // Nibiru, the Primal Being
                name: 'Nibiru, the Primal Being',
                setCode: 'BLAR-EN061',
                rarity: 'Ultra Rare',
                condition: 'near_mint',
                quantity: 6,
                price: 12.99
            },
            {
                cardId: 83764718, // Infinite Impermanence
                name: 'Infinite Impermanence',
                setCode: 'FLOD-EN077',
                rarity: 'Secret Rare',
                condition: 'near_mint',
                quantity: 4,
                price: 67.99
            }
        ];

        const inventory = JSON.parse(localStorage.getItem('tcg-inventory') || '[]');
        
        for (const card of sampleCards) {
            const existingCard = inventory.find(item => 
                item.cardId === card.cardId && 
                item.setCode === card.setCode && 
                item.rarity === card.rarity
            );

            if (!existingCard) {
                inventory.push({
                    id: Date.now() + Math.random(),
                    cardId: card.cardId,
                    cardName: card.name,
                    setCode: card.setCode,
                    rarity: card.rarity,
                    conditionGrade: card.condition,
                    quantity: card.quantity,
                    reservedQuantity: 0,
                    ourPrice: card.price,
                    buylistPrice: card.price * 0.6, // 60% of sell price
                    isActive: true,
                    isFeatured: Math.random() > 0.7, // 30% chance to be featured
                    location: 'A1-' + Math.floor(Math.random() * 100),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
            }
        }

        localStorage.setItem('tcg-inventory', JSON.stringify(inventory));
        console.log('📦 Sample inventory initialized');
    }

    async createSampleOrders() {
        const users = JSON.parse(localStorage.getItem('tcg-users') || '{}');
        const userEmails = Object.keys(users).filter(email => !email.includes('admin'));
        
        if (userEmails.length === 0) return;

        // Create a few sample orders
        for (let i = 0; i < 3; i++) {
            const randomUser = users[userEmails[Math.floor(Math.random() * userEmails.length)]];
            
            try {
                const sampleOrder = await this.dbService.createOrder({
                    userId: randomUser.id,
                    items: [
                        {
                            name: 'Blue-Eyes White Dragon',
                            price: 45.99,
                            quantity: 1,
                            setCode: 'LOB-001',
                            rarity: 'Ultra Rare'
                        }
                    ],
                    subtotal: 45.99,
                    taxAmount: 45.99 * 0.13,
                    shippingAmount: 0,
                    totalAmount: 45.99 * 1.13,
                    paymentMethod: 'square'
                });

                console.log('🛒 Sample order created:', sampleOrder.orderNumber);
            } catch (error) {
                console.warn('⚠️ Could not create sample order:', error.message);
            }
        }
    }

    async setupDataRelationships() {
        console.log('🔗 Setting up data relationships...');

        // Add some cards to user wishlists
        const users = JSON.parse(localStorage.getItem('tcg-users') || '{}');
        const userEmails = Object.keys(users).filter(email => !email.includes('admin'));

        for (const email of userEmails.slice(0, 2)) {
            const user = users[email];
            try {
                await this.dbService.addToWishlist(user.id, {
                    cardId: 89631139,
                    name: 'Blue-Eyes White Dragon',
                    preferredSet: 'LOB-001',
                    preferredRarity: 'Ultra Rare',
                    targetPrice: 40.00
                });
            } catch (error) {
                // Ignore if already exists
            }
        }

    }

    showInitializationMessage() {
        // Database initialization complete - no popup needed
        
    }

    showErrorMessage(message) {
        console.error('Database initialization error:', message);
        
        // Show error notification
        if (window.tcgStore && window.tcgStore.showToast) {
            window.tcgStore.showToast('Database initialization failed: ' + message, 'error', 5000);
        }
    }

    // Utility method to reset database (for development)
    resetDatabase() {
        const keys = [
            'tcg-users',
            'tcg-orders',
            'tcg-inventory',
            'tcg-store-credits',
            'tcg-store-credit-transactions',
            'tcg-wishlists',
            'tcg-settings',
            'tcg-analytics',
            'tcg-membership-plans',
            'tcg-inventory-transactions'
        ];

        keys.forEach(key => localStorage.removeItem(key));
        
        console.log('🗑️ Database reset complete');
        
        // Reinitialize
        this.initialized = false;
        this.initialize();
    }

    // Method to export all data
    exportAllData() {
        const data = this.dbService.exportData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `firelight-database-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('📥 Database exported');
    }

    // Method to import data
    importData(jsonData) {
        try {
            const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
            this.dbService.importData(data);
            console.log('📤 Database imported successfully');
            
            if (window.tcgStore && window.tcgStore.showToast) {
                window.tcgStore.showToast('Database imported successfully!', 'success');
            }
        } catch (error) {
            console.error('Import failed:', error);
            if (window.tcgStore && window.tcgStore.showToast) {
                window.tcgStore.showToast('Database import failed: ' + error.message, 'error');
            }
        }
    }
}

// Initialize database when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dbInitializer = new DatabaseInitializer();
    
    // Initialize after a short delay to ensure all services are loaded
    setTimeout(() => {
        window.dbInitializer.initialize();
    }, 500);
});

// Expose utility functions to global scope for development
window.resetDatabase = () => window.dbInitializer?.resetDatabase();
window.exportDatabase = () => window.dbInitializer?.exportAllData();
window.importDatabase = (data) => window.dbInitializer?.importData(data);

// Console welcome message
setTimeout(() => {
    console.log(`
🔥 Firelight Duel Academy Database System
========================================
Available commands:
- resetDatabase()     : Reset all data
- exportDatabase()    : Export data to file
- importDatabase(data): Import data from JSON
- window.dbService    : Access database service
- window.tcgStore     : Access store functionality

Database Status: ${window.dbService ? '✅ Ready' : '❌ Not Ready'}
`);
}, 1000);
