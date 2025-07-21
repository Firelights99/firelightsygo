# 🟦 Square Cloud Database Setup Guide
## Complete Integration with Square's Cloud Services

Square provides multiple cloud database and data management solutions for e-commerce businesses. Here's how to set up Square as your cloud database provider.

## 🎯 Square Cloud Database Options

### Option 1: Square Online Store + Database (Recommended)
**Best for**: Complete e-commerce solution with built-in database
- **Database**: Square's managed cloud database
- **Features**: Product catalog, inventory, customers, orders, analytics
- **Integration**: Native Square APIs for all data operations
- **Cost**: $12-$72/month depending on features

### Option 2: Square APIs + External Database
**Best for**: Custom solution with Square payment processing
- **Database**: Your choice (Railway, Heroku, etc.) 
- **Integration**: Square APIs for payments, customer data sync
- **Features**: Custom database schema with Square data sync

### Option 3: Square for Restaurants/Retail + Cloud Sync
**Best for**: Physical + online store integration
- **Database**: Square's POS database synced to cloud
- **Features**: Unified inventory, customer data, sales reporting

## 🚀 Recommended Setup: Square Online Store Integration

### Step 1: Create Square Online Store
1. **Sign up for Square Online**: https://squareup.com/us/en/online-store
2. **Choose Plan**:
   - **Free Plan**: Basic store with Square branding
   - **Professional ($12/month)**: Custom domain, no Square branding
   - **Performance ($18/month)**: Advanced features, abandoned cart recovery
   - **Premium ($40/month)**: Advanced integrations, priority support

### Step 2: Configure Square Database Integration

**Update Backend to Use Square APIs:**

```javascript
// backend/config/square-database.js
const { Client, Environment } = require('squareup');

class SquareCloudDatabase {
    constructor() {
        this.client = new Client({
            accessToken: process.env.SQUARE_ACCESS_TOKEN,
            environment: process.env.SQUARE_ENVIRONMENT === 'production' 
                ? Environment.Production 
                : Environment.Sandbox
        });
        
        this.catalogApi = this.client.catalogApi;
        this.customersApi = this.client.customersApi;
        this.ordersApi = this.client.ordersApi;
        this.inventoryApi = this.client.inventoryApi;
    }

    // Product Management
    async getProducts() {
        try {
            const response = await this.catalogApi.listCatalog(undefined, 'ITEM');
            return response.result.objects || [];
        } catch (error) {
            console.error('Error fetching products from Square:', error);
            throw error;
        }
    }

    async createProduct(productData) {
        try {
            const catalogObject = {
                type: 'ITEM',
                id: `#${productData.name.replace(/\s+/g, '_').toLowerCase()}`,
                itemData: {
                    name: productData.name,
                    description: productData.description,
                    variations: [{
                        type: 'ITEM_VARIATION',
                        id: `#${productData.name}_variation`,
                        itemVariationData: {
                            itemId: `#${productData.name.replace(/\s+/g, '_').toLowerCase()}`,
                            name: 'Regular',
                            pricingType: 'FIXED_PRICING',
                            priceMoney: {
                                amount: Math.round(productData.price * 100), // Convert to cents
                                currency: 'CAD'
                            }
                        }
                    }]
                }
            };

            const response = await this.catalogApi.upsertCatalogObject({
                idempotencyKey: Date.now().toString(),
                object: catalogObject
            });

            return response.result.catalogObject;
        } catch (error) {
            console.error('Error creating product in Square:', error);
            throw error;
        }
    }

    // Customer Management
    async createCustomer(customerData) {
        try {
            const response = await this.customersApi.createCustomer({
                givenName: customerData.firstName,
                familyName: customerData.lastName,
                emailAddress: customerData.email,
                phoneNumber: customerData.phone,
                note: 'Created via Firelight Duel Academy'
            });

            return response.result.customer;
        } catch (error) {
            console.error('Error creating customer in Square:', error);
            throw error;
        }
    }

    async getCustomer(customerId) {
        try {
            const response = await this.customersApi.retrieveCustomer(customerId);
            return response.result.customer;
        } catch (error) {
            console.error('Error fetching customer from Square:', error);
            throw error;
        }
    }

    // Order Management
    async createOrder(orderData) {
        try {
            const order = {
                locationId: process.env.SQUARE_LOCATION_ID,
                lineItems: orderData.items.map(item => ({
                    quantity: item.quantity.toString(),
                    catalogObjectId: item.catalogObjectId,
                    basePriceMoney: {
                        amount: Math.round(item.price * 100),
                        currency: 'CAD'
                    }
                })),
                taxes: [{
                    name: 'HST',
                    percentage: '13.0',
                    scope: 'ORDER'
                }]
            };

            const response = await this.ordersApi.createOrder({
                locationId: process.env.SQUARE_LOCATION_ID,
                order: order
            });

            return response.result.order;
        } catch (error) {
            console.error('Error creating order in Square:', error);
            throw error;
        }
    }

    // Inventory Management
    async updateInventory(catalogObjectId, quantity) {
        try {
            const response = await this.inventoryApi.batchChangeInventory({
                idempotencyKey: Date.now().toString(),
                changes: [{
                    type: 'ADJUSTMENT',
                    adjustment: {
                        catalogObjectId: catalogObjectId,
                        locationId: process.env.SQUARE_LOCATION_ID,
                        quantity: quantity.toString(),
                        fromState: 'IN_STOCK',
                        toState: 'IN_STOCK'
                    }
                }]
            });

            return response.result;
        } catch (error) {
            console.error('Error updating inventory in Square:', error);
            throw error;
        }
    }
}

module.exports = SquareCloudDatabase;
```

### Step 3: Update Environment Variables

**Add to backend/.env:**
```env
# Square Cloud Database Configuration
SQUARE_ACCESS_TOKEN=your_square_access_token_here
SQUARE_APPLICATION_ID=your_square_application_id_here
SQUARE_LOCATION_ID=your_square_location_id_here
SQUARE_ENVIRONMENT=sandbox  # Change to 'production' for live
SQUARE_WEBHOOK_SIGNATURE_KEY=your_webhook_signature_key_here

# Square Online Store Integration
SQUARE_ONLINE_STORE_ID=your_store_id_here
SQUARE_ONLINE_STORE_URL=https://your-store.square.site
```

### Step 4: Update Backend Dependencies

**Add Square SDK to backend/package.json:**
```json
{
  "dependencies": {
    "squareup": "^29.0.0",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "winston": "^3.10.0",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "express-rate-limit": "^6.10.0",
    "express-validator": "^7.0.1",
    "dotenv": "^16.3.1"
  }
}
```

## 🔧 Implementation Steps

### Step 1: Get Square Credentials

1. **Create Square Developer Account**:
   - Go to https://developer.squareup.com/
   - Sign up or log in with your Square account
   - Create a new application

2. **Get API Credentials**:
   - **Application ID**: Found in your app dashboard
   - **Access Token**: Sandbox and Production tokens
   - **Location ID**: Your business location ID
   - **Webhook Signature Key**: For webhook verification

### Step 2: Set Up Square Online Store

1. **Create Online Store**:
   - Go to https://squareup.com/us/en/online-store
   - Choose your plan and set up your store
   - Configure your domain (if using Professional+ plan)

2. **Import Your Products**:
   - Use Square's bulk import feature
   - Or use the API to programmatically add products
   - Set up categories for Yu-Gi-Oh! cards

### Step 3: Update Backend Routes

**Update backend/routes/products.js:**
```javascript
const express = require('express');
const SquareCloudDatabase = require('../config/square-database');
const router = express.Router();

const squareDB = new SquareCloudDatabase();

// Get all products from Square
router.get('/', async (req, res) => {
    try {
        const products = await squareDB.getProducts();
        res.json({
            success: true,
            data: { products }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Create product in Square
router.post('/', async (req, res) => {
    try {
        const product = await squareDB.createProduct(req.body);
        res.json({
            success: true,
            data: { product }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
```

### Step 4: Update Frontend Integration

**Update assets/js/services/database-service-production.js:**
```javascript
// Add Square-specific methods
async getSquareProducts() {
    try {
        const response = await this.makeRequest('/products/square');
        return response.success ? response.data.products : [];
    } catch (error) {
        console.error('Error getting Square products:', error);
        return [];
    }
}

async createSquareCustomer(customerData) {
    try {
        const response = await this.makeRequest('/customers/square', {
            method: 'POST',
            body: customerData
        });
        return response.success ? response.data.customer : null;
    } catch (error) {
        console.error('Error creating Square customer:', error);
        throw error;
    }
}
```

## 🔄 Data Synchronization

### Square to Website Sync
```javascript
// backend/services/square-sync.js
class SquareSyncService {
    constructor() {
        this.squareDB = new SquareCloudDatabase();
    }

    async syncProducts() {
        try {
            const squareProducts = await this.squareDB.getProducts();
            // Process and format products for your website
            return squareProducts.map(product => ({
                id: product.id,
                name: product.itemData.name,
                description: product.itemData.description,
                price: product.itemData.variations[0].itemVariationData.priceMoney.amount / 100,
                currency: product.itemData.variations[0].itemVariationData.priceMoney.currency,
                inStock: true // Get from inventory API
            }));
        } catch (error) {
            console.error('Error syncing products:', error);
            throw error;
        }
    }

    async syncCustomers() {
        // Sync customer data between Square and your system
    }

    async syncOrders() {
        // Sync order data between Square and your system
    }
}
```

## 📊 Square Analytics Integration

### Dashboard Data
```javascript
// Get sales analytics from Square
async getSquareAnalytics() {
    try {
        const ordersApi = this.client.ordersApi;
        const response = await ordersApi.searchOrders({
            locationIds: [process.env.SQUARE_LOCATION_ID],
            query: {
                dateTimeFilter: {
                    createdAt: {
                        startAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Last 30 days
                        endAt: new Date().toISOString()
                    }
                }
            }
        });

        return response.result.orders || [];
    } catch (error) {
        console.error('Error getting Square analytics:', error);
        throw error;
    }
}
```

## 🚀 Deployment with Square Integration

### Railway Deployment
```bash
# Install dependencies
cd backend
npm install

# Set environment variables in Railway
railway variables set SQUARE_ACCESS_TOKEN=your_token_here
railway variables set SQUARE_APPLICATION_ID=your_app_id_here
railway variables set SQUARE_LOCATION_ID=your_location_id_here

# Deploy
railway up
```

### Heroku Deployment
```bash
# Set environment variables
heroku config:set SQUARE_ACCESS_TOKEN=your_token_here
heroku config:set SQUARE_APPLICATION_ID=your_app_id_here
heroku config:set SQUARE_LOCATION_ID=your_location_id_here

# Deploy
git push heroku main
```

## 🔒 Security Considerations

### API Key Security
- Store all Square credentials in environment variables
- Use different keys for sandbox and production
- Rotate keys regularly
- Never commit keys to version control

### Webhook Security
```javascript
// Verify Square webhooks
const crypto = require('crypto');

function verifySquareWebhook(body, signature, signatureKey) {
    const hash = crypto
        .createHmac('sha1', signatureKey)
        .update(body)
        .digest('base64');
    
    return hash === signature;
}
```

## 📞 Next Steps

1. **Create Square Developer Account** and get API credentials
2. **Set up Square Online Store** with your products
3. **Update backend configuration** with Square integration
4. **Test in sandbox environment** before going live
5. **Deploy to production** with live Square credentials
6. **Set up webhooks** for real-time data sync

## 💰 Pricing Summary

**Square Online Store:**
- Free: Basic store with Square branding
- Professional ($12/month): Custom domain, no branding
- Performance ($18/month): Advanced features
- Premium ($40/month): Full features

**Square Payment Processing:**
- 2.9% + 30¢ per transaction (online)
- 2.6% + 10¢ per transaction (in-person)

**Benefits:**
- Unified inventory management
- Built-in payment processing
- Customer data management
- Analytics and reporting
- Mobile app for management

This setup gives you a complete cloud database solution with Square's robust e-commerce platform!
