/**
 * Square Cloud Database Integration
 * Provides complete database functionality using Square's cloud services
 */

const { Client, Environment } = require('squareup');
const logger = require('../utils/logger');

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
        this.paymentsApi = this.client.paymentsApi;
        this.locationsApi = this.client.locationsApi;
        
        logger.info('Square Cloud Database initialized', {
            environment: process.env.SQUARE_ENVIRONMENT || 'sandbox'
        });
    }

    // Health Check
    async healthCheck() {
        try {
            const response = await this.locationsApi.listLocations();
            return {
                status: 'healthy',
                connected: true,
                locations: response.result.locations?.length || 0,
                environment: process.env.SQUARE_ENVIRONMENT || 'sandbox'
            };
        } catch (error) {
            logger.error('Square health check failed:', error);
            return {
                status: 'unhealthy',
                connected: false,
                error: error.message
            };
        }
    }

    // Product Management
    async getProducts(filters = {}) {
        try {
            const queryParams = {
                types: ['ITEM']
            };

            if (filters.search) {
                queryParams.query = {
                    textQuery: {
                        keywords: [filters.search]
                    }
                };
            }

            const response = await this.catalogApi.searchCatalogObjects(queryParams);
            const products = response.result.objects || [];

            return products.map(product => this.formatProduct(product));
        } catch (error) {
            logger.error('Error fetching products from Square:', error);
            throw new Error(`Failed to fetch products: ${error.message}`);
        }
    }

    async getProductById(productId) {
        try {
            const response = await this.catalogApi.retrieveCatalogObject(productId);
            return this.formatProduct(response.result.object);
        } catch (error) {
            logger.error('Error fetching product from Square:', error);
            throw new Error(`Failed to fetch product: ${error.message}`);
        }
    }

    async createProduct(productData) {
        try {
            const catalogObject = {
                type: 'ITEM',
                id: `#${productData.name.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}`,
                itemData: {
                    name: productData.name,
                    description: productData.description || '',
                    categoryId: productData.categoryId,
                    variations: [{
                        type: 'ITEM_VARIATION',
                        id: `#${productData.name.replace(/\s+/g, '_').toLowerCase()}_variation`,
                        itemVariationData: {
                            itemId: `#${productData.name.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}`,
                            name: productData.variationName || 'Regular',
                            pricingType: 'FIXED_PRICING',
                            priceMoney: {
                                amount: Math.round(productData.price * 100), // Convert to cents
                                currency: productData.currency || 'CAD'
                            },
                            trackInventory: true
                        }
                    }]
                }
            };

            // Add images if provided
            if (productData.imageUrl) {
                catalogObject.itemData.imageIds = [await this.uploadImage(productData.imageUrl)];
            }

            const response = await this.catalogApi.upsertCatalogObject({
                idempotencyKey: `product_${Date.now()}_${Math.random()}`,
                object: catalogObject
            });

            logger.info('Product created in Square:', { productId: response.result.catalogObject.id });
            return this.formatProduct(response.result.catalogObject);
        } catch (error) {
            logger.error('Error creating product in Square:', error);
            throw new Error(`Failed to create product: ${error.message}`);
        }
    }

    async updateProduct(productId, updateData) {
        try {
            // First get the existing product
            const existingProduct = await this.catalogApi.retrieveCatalogObject(productId);
            const product = existingProduct.result.object;

            // Update the product data
            if (updateData.name) product.itemData.name = updateData.name;
            if (updateData.description) product.itemData.description = updateData.description;
            if (updateData.price && product.itemData.variations[0]) {
                product.itemData.variations[0].itemVariationData.priceMoney.amount = Math.round(updateData.price * 100);
            }

            const response = await this.catalogApi.upsertCatalogObject({
                idempotencyKey: `update_${Date.now()}_${Math.random()}`,
                object: product
            });

            logger.info('Product updated in Square:', { productId });
            return this.formatProduct(response.result.catalogObject);
        } catch (error) {
            logger.error('Error updating product in Square:', error);
            throw new Error(`Failed to update product: ${error.message}`);
        }
    }

    // Customer Management
    async createCustomer(customerData) {
        try {
            const customerRequest = {
                givenName: customerData.firstName,
                familyName: customerData.lastName,
                emailAddress: customerData.email,
                phoneNumber: customerData.phone,
                note: 'Created via Firelight Duel Academy',
                preferences: {
                    emailUnsubscribed: false
                }
            };

            // Add address if provided
            if (customerData.address) {
                customerRequest.address = {
                    addressLine1: customerData.address.line1,
                    addressLine2: customerData.address.line2,
                    locality: customerData.address.city,
                    administrativeDistrictLevel1: customerData.address.state,
                    postalCode: customerData.address.postalCode,
                    country: customerData.address.country || 'CA'
                };
            }

            const response = await this.customersApi.createCustomer(customerRequest);
            
            logger.info('Customer created in Square:', { customerId: response.result.customer.id });
            return this.formatCustomer(response.result.customer);
        } catch (error) {
            logger.error('Error creating customer in Square:', error);
            throw new Error(`Failed to create customer: ${error.message}`);
        }
    }

    async getCustomer(customerId) {
        try {
            const response = await this.customersApi.retrieveCustomer(customerId);
            return this.formatCustomer(response.result.customer);
        } catch (error) {
            logger.error('Error fetching customer from Square:', error);
            throw new Error(`Failed to fetch customer: ${error.message}`);
        }
    }

    async updateCustomer(customerId, updateData) {
        try {
            const updateRequest = {};
            
            if (updateData.firstName) updateRequest.givenName = updateData.firstName;
            if (updateData.lastName) updateRequest.familyName = updateData.lastName;
            if (updateData.email) updateRequest.emailAddress = updateData.email;
            if (updateData.phone) updateRequest.phoneNumber = updateData.phone;

            const response = await this.customersApi.updateCustomer(customerId, updateRequest);
            
            logger.info('Customer updated in Square:', { customerId });
            return this.formatCustomer(response.result.customer);
        } catch (error) {
            logger.error('Error updating customer in Square:', error);
            throw new Error(`Failed to update customer: ${error.message}`);
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

            // Add customer if provided
            if (orderData.customerId) {
                order.customerId = orderData.customerId;
            }

            // Add shipping if provided
            if (orderData.shipping) {
                order.fulfillments = [{
                    type: 'SHIPMENT',
                    state: 'PROPOSED',
                    shipmentDetails: {
                        recipient: {
                            displayName: `${orderData.shipping.firstName} ${orderData.shipping.lastName}`,
                            emailAddress: orderData.shipping.email,
                            phoneNumber: orderData.shipping.phone,
                            address: {
                                addressLine1: orderData.shipping.address.line1,
                                addressLine2: orderData.shipping.address.line2,
                                locality: orderData.shipping.address.city,
                                administrativeDistrictLevel1: orderData.shipping.address.state,
                                postalCode: orderData.shipping.address.postalCode,
                                country: orderData.shipping.address.country || 'CA'
                            }
                        }
                    }
                }];
            }

            const response = await this.ordersApi.createOrder({
                locationId: process.env.SQUARE_LOCATION_ID,
                order: order
            });

            logger.info('Order created in Square:', { orderId: response.result.order.id });
            return this.formatOrder(response.result.order);
        } catch (error) {
            logger.error('Error creating order in Square:', error);
            throw new Error(`Failed to create order: ${error.message}`);
        }
    }

    async getOrder(orderId) {
        try {
            const response = await this.ordersApi.retrieveOrder(orderId);
            return this.formatOrder(response.result.order);
        } catch (error) {
            logger.error('Error fetching order from Square:', error);
            throw new Error(`Failed to fetch order: ${error.message}`);
        }
    }

    async getUserOrders(customerId) {
        try {
            const response = await this.ordersApi.searchOrders({
                locationIds: [process.env.SQUARE_LOCATION_ID],
                query: {
                    filter: {
                        customerFilter: {
                            customerIds: [customerId]
                        }
                    },
                    sort: {
                        sortField: 'CREATED_AT',
                        sortOrder: 'DESC'
                    }
                }
            });

            const orders = response.result.orders || [];
            return orders.map(order => this.formatOrder(order));
        } catch (error) {
            logger.error('Error fetching user orders from Square:', error);
            throw new Error(`Failed to fetch user orders: ${error.message}`);
        }
    }

    // Payment Processing
    async processPayment(paymentData) {
        try {
            const paymentRequest = {
                sourceId: paymentData.sourceId, // From Square Web Payments SDK
                idempotencyKey: `payment_${Date.now()}_${Math.random()}`,
                amountMoney: {
                    amount: Math.round(paymentData.amount * 100),
                    currency: 'CAD'
                },
                locationId: process.env.SQUARE_LOCATION_ID
            };

            // Add order ID if provided
            if (paymentData.orderId) {
                paymentRequest.orderId = paymentData.orderId;
            }

            // Add customer ID if provided
            if (paymentData.customerId) {
                paymentRequest.customerId = paymentData.customerId;
            }

            const response = await this.paymentsApi.createPayment(paymentRequest);
            
            logger.info('Payment processed in Square:', { paymentId: response.result.payment.id });
            return {
                id: response.result.payment.id,
                status: response.result.payment.status,
                amount: response.result.payment.amountMoney.amount / 100,
                currency: response.result.payment.amountMoney.currency,
                createdAt: response.result.payment.createdAt
            };
        } catch (error) {
            logger.error('Error processing payment in Square:', error);
            throw new Error(`Failed to process payment: ${error.message}`);
        }
    }

    // Inventory Management
    async updateInventory(catalogObjectId, quantity, adjustmentType = 'ADJUSTMENT') {
        try {
            const response = await this.inventoryApi.batchChangeInventory({
                idempotencyKey: `inventory_${Date.now()}_${Math.random()}`,
                changes: [{
                    type: adjustmentType,
                    adjustment: {
                        catalogObjectId: catalogObjectId,
                        locationId: process.env.SQUARE_LOCATION_ID,
                        quantity: quantity.toString(),
                        fromState: 'IN_STOCK',
                        toState: 'IN_STOCK'
                    }
                }]
            });

            logger.info('Inventory updated in Square:', { catalogObjectId, quantity });
            return response.result;
        } catch (error) {
            logger.error('Error updating inventory in Square:', error);
            throw new Error(`Failed to update inventory: ${error.message}`);
        }
    }

    async getInventory(catalogObjectId) {
        try {
            const response = await this.inventoryApi.retrieveInventoryCount(
                catalogObjectId,
                process.env.SQUARE_LOCATION_ID
            );

            return {
                catalogObjectId: catalogObjectId,
                quantity: parseInt(response.result.counts?.[0]?.quantity || '0'),
                state: response.result.counts?.[0]?.state || 'NONE'
            };
        } catch (error) {
            logger.error('Error fetching inventory from Square:', error);
            throw new Error(`Failed to fetch inventory: ${error.message}`);
        }
    }

    // Analytics
    async getAnalytics(dateRange = 30) {
        try {
            const startDate = new Date(Date.now() - dateRange * 24 * 60 * 60 * 1000);
            const endDate = new Date();

            const response = await this.ordersApi.searchOrders({
                locationIds: [process.env.SQUARE_LOCATION_ID],
                query: {
                    filter: {
                        dateTimeFilter: {
                            createdAt: {
                                startAt: startDate.toISOString(),
                                endAt: endDate.toISOString()
                            }
                        }
                    }
                }
            });

            const orders = response.result.orders || [];
            
            return {
                totalOrders: orders.length,
                totalRevenue: orders.reduce((sum, order) => {
                    return sum + (order.totalMoney?.amount || 0);
                }, 0) / 100,
                averageOrderValue: orders.length > 0 
                    ? (orders.reduce((sum, order) => sum + (order.totalMoney?.amount || 0), 0) / 100) / orders.length 
                    : 0,
                dateRange: {
                    start: startDate.toISOString(),
                    end: endDate.toISOString()
                }
            };
        } catch (error) {
            logger.error('Error fetching analytics from Square:', error);
            throw new Error(`Failed to fetch analytics: ${error.message}`);
        }
    }

    // Helper Methods
    formatProduct(product) {
        if (!product || !product.itemData) return null;

        const variation = product.itemData.variations?.[0];
        const price = variation?.itemVariationData?.priceMoney?.amount || 0;

        return {
            id: product.id,
            name: product.itemData.name,
            description: product.itemData.description || '',
            price: price / 100,
            currency: variation?.itemVariationData?.priceMoney?.currency || 'CAD',
            categoryId: product.itemData.categoryId,
            imageUrl: product.itemData.imageIds?.[0] ? this.getImageUrl(product.itemData.imageIds[0]) : null,
            variationId: variation?.id,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt
        };
    }

    formatCustomer(customer) {
        if (!customer) return null;

        return {
            id: customer.id,
            firstName: customer.givenName || '',
            lastName: customer.familyName || '',
            email: customer.emailAddress || '',
            phone: customer.phoneNumber || '',
            address: customer.address ? {
                line1: customer.address.addressLine1 || '',
                line2: customer.address.addressLine2 || '',
                city: customer.address.locality || '',
                state: customer.address.administrativeDistrictLevel1 || '',
                postalCode: customer.address.postalCode || '',
                country: customer.address.country || 'CA'
            } : null,
            createdAt: customer.createdAt,
            updatedAt: customer.updatedAt
        };
    }

    formatOrder(order) {
        if (!order) return null;

        return {
            id: order.id,
            customerId: order.customerId,
            locationId: order.locationId,
            status: order.state,
            items: order.lineItems?.map(item => ({
                catalogObjectId: item.catalogObjectId,
                quantity: parseInt(item.quantity),
                price: item.basePriceMoney?.amount / 100 || 0,
                currency: item.basePriceMoney?.currency || 'CAD',
                name: item.name || ''
            })) || [],
            subtotal: order.netAmounts?.totalMoney?.amount / 100 || 0,
            tax: order.netAmounts?.taxMoney?.amount / 100 || 0,
            total: order.totalMoney?.amount / 100 || 0,
            currency: order.totalMoney?.currency || 'CAD',
            createdAt: order.createdAt,
            updatedAt: order.updatedAt
        };
    }

    getImageUrl(imageId) {
        // Square image URLs follow a specific pattern
        return `https://items-images-production.s3.us-west-2.amazonaws.com/files/${imageId}/original.jpeg`;
    }

    async uploadImage(imageUrl) {
        // This would require implementing image upload to Square
        // For now, return a placeholder
        return 'placeholder_image_id';
    }
}

module.exports = SquareCloudDatabase;
