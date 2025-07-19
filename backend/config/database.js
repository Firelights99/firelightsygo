const mysql = require('mysql2/promise');
const logger = require('../utils/logger');

class Database {
    constructor() {
        this.pool = null;
        this.config = {
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT) || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'firelight_duel_academy',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            acquireTimeout: 60000,
            timeout: 60000,
            reconnect: true,
            charset: 'utf8mb4',
            timezone: '+00:00'
        };
        
        this.init();
    }

    init() {
        try {
            this.pool = mysql.createPool(this.config);
            logger.info('Database pool created successfully');
        } catch (error) {
            logger.error('Failed to create database pool:', error);
            throw error;
        }
    }

    async testConnection() {
        try {
            const connection = await this.pool.getConnection();
            await connection.ping();
            connection.release();
            logger.info('Database connection test successful');
            return true;
        } catch (error) {
            logger.error('Database connection test failed:', error);
            throw error;
        }
    }

    async query(sql, params = []) {
        try {
            const [rows] = await this.pool.execute(sql, params);
            return rows;
        } catch (error) {
            logger.error('Database query error:', { sql, params, error: error.message });
            throw error;
        }
    }

    async transaction(callback) {
        const connection = await this.pool.getConnection();
        
        try {
            await connection.beginTransaction();
            
            const result = await callback(connection);
            
            await connection.commit();
            return result;
        } catch (error) {
            await connection.rollback();
            logger.error('Transaction rolled back:', error);
            throw error;
        } finally {
            connection.release();
        }
    }

    // User operations
    async createUser(userData) {
        const sql = `
            INSERT INTO users (email, password_hash, first_name, last_name, phone, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, NOW(), NOW())
        `;
        
        const params = [
            userData.email,
            userData.passwordHash,
            userData.firstName,
            userData.lastName,
            userData.phone || null
        ];
        
        const result = await this.query(sql, params);
        return result.insertId;
    }

    async getUserByEmail(email) {
        const sql = 'SELECT * FROM users WHERE email = ? AND is_active = 1';
        const users = await this.query(sql, [email]);
        return users[0] || null;
    }

    async getUserById(id) {
        const sql = 'SELECT * FROM users WHERE id = ? AND is_active = 1';
        const users = await this.query(sql, [id]);
        return users[0] || null;
    }

    async updateUser(id, userData) {
        const fields = [];
        const params = [];
        
        Object.keys(userData).forEach(key => {
            if (userData[key] !== undefined) {
                fields.push(`${key} = ?`);
                params.push(userData[key]);
            }
        });
        
        if (fields.length === 0) return false;
        
        fields.push('updated_at = NOW()');
        params.push(id);
        
        const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
        const result = await this.query(sql, params);
        return result.affectedRows > 0;
    }

    // Product operations
    async getProducts(filters = {}) {
        let sql = `
            SELECT p.*, c.name as category_name, 
                   (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.is_active = 1
        `;
        
        const params = [];
        
        if (filters.category) {
            sql += ' AND c.slug = ?';
            params.push(filters.category);
        }
        
        if (filters.search) {
            sql += ' AND (p.name LIKE ? OR p.description LIKE ?)';
            params.push(`%${filters.search}%`, `%${filters.search}%`);
        }
        
        if (filters.featured) {
            sql += ' AND p.is_featured = 1';
        }
        
        sql += ' ORDER BY p.created_at DESC';
        
        if (filters.limit) {
            sql += ' LIMIT ?';
            params.push(parseInt(filters.limit));
        }
        
        return await this.query(sql, params);
    }

    async getProductById(id) {
        const sql = `
            SELECT p.*, c.name as category_name,
                   (SELECT JSON_ARRAYAGG(
                       JSON_OBJECT('id', pi.id, 'url', pi.image_url, 'alt', pi.alt_text, 'isPrimary', pi.is_primary)
                   ) FROM product_images pi WHERE pi.product_id = p.id) as images
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.id = ? AND p.is_active = 1
        `;
        
        const products = await this.query(sql, [id]);
        return products[0] || null;
    }

    // Order operations
    async createOrder(orderData) {
        return await this.transaction(async (connection) => {
            // Create order
            const orderSql = `
                INSERT INTO orders (user_id, order_number, status, total_amount, subtotal, 
                                  tax_amount, shipping_amount, currency, payment_method, 
                                  shipping_address, billing_address, notes, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            `;
            
            const orderParams = [
                orderData.userId,
                orderData.orderNumber,
                orderData.status || 'pending',
                orderData.totalAmount,
                orderData.subtotal,
                orderData.taxAmount || 0,
                orderData.shippingAmount || 0,
                orderData.currency || 'CAD',
                orderData.paymentMethod,
                JSON.stringify(orderData.shippingAddress),
                JSON.stringify(orderData.billingAddress),
                orderData.notes || null
            ];
            
            const [orderResult] = await connection.execute(orderSql, orderParams);
            const orderId = orderResult.insertId;
            
            // Create order items
            for (const item of orderData.items) {
                const itemSql = `
                    INSERT INTO order_items (order_id, product_id, quantity, price, total, 
                                           product_name, product_sku, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
                `;
                
                const itemParams = [
                    orderId,
                    item.productId,
                    item.quantity,
                    item.price,
                    item.total,
                    item.productName,
                    item.productSku
                ];
                
                await connection.execute(itemSql, itemParams);
                
                // Update inventory
                const inventorySql = `
                    INSERT INTO inventory_transactions (product_id, type, quantity, reference_type, 
                                                      reference_id, notes, created_at)
                    VALUES (?, 'out', ?, 'sale', ?, ?, NOW())
                `;
                
                await connection.execute(inventorySql, [
                    item.productId,
                    item.quantity,
                    orderId,
                    `Sale - Order ${orderData.orderNumber}`
                ]);
                
                // Update product stock
                const stockSql = 'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?';
                await connection.execute(stockSql, [item.quantity, item.productId]);
            }
            
            return orderId;
        });
    }

    async getUserOrders(userId, limit = 50) {
        const sql = `
            SELECT o.*, 
                   (SELECT JSON_ARRAYAGG(
                       JSON_OBJECT('id', oi.id, 'productId', oi.product_id, 'quantity', oi.quantity,
                                 'price', oi.price, 'total', oi.total, 'productName', oi.product_name,
                                 'productSku', oi.product_sku)
                   ) FROM order_items oi WHERE oi.order_id = o.id) as items
            FROM orders o
            WHERE o.user_id = ?
            ORDER BY o.created_at DESC
            LIMIT ?
        `;
        
        return await this.query(sql, [userId, limit]);
    }

    // Cart operations
    async getCart(userId, sessionId = null) {
        let sql = `
            SELECT sc.*, p.name, p.price, p.stock_quantity,
                   (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as image
            FROM shopping_cart sc
            JOIN products p ON sc.product_id = p.id
            WHERE p.is_active = 1
        `;
        
        const params = [];
        
        if (userId) {
            sql += ' AND sc.user_id = ?';
            params.push(userId);
        } else if (sessionId) {
            sql += ' AND sc.session_id = ? AND sc.user_id IS NULL';
            params.push(sessionId);
        } else {
            return [];
        }
        
        return await this.query(sql, params);
    }

    async addToCart(userId, sessionId, productId, quantity) {
        const sql = `
            INSERT INTO shopping_cart (user_id, session_id, product_id, quantity, created_at, updated_at)
            VALUES (?, ?, ?, ?, NOW(), NOW())
            ON DUPLICATE KEY UPDATE 
            quantity = quantity + VALUES(quantity),
            updated_at = NOW()
        `;
        
        return await this.query(sql, [userId, sessionId, productId, quantity]);
    }

    async updateCartItem(cartId, quantity) {
        const sql = 'UPDATE shopping_cart SET quantity = ?, updated_at = NOW() WHERE id = ?';
        return await this.query(sql, [quantity, cartId]);
    }

    async removeFromCart(cartId) {
        const sql = 'DELETE FROM shopping_cart WHERE id = ?';
        return await this.query(sql, [cartId]);
    }

    async clearCart(userId, sessionId = null) {
        let sql = 'DELETE FROM shopping_cart WHERE ';
        const params = [];
        
        if (userId) {
            sql += 'user_id = ?';
            params.push(userId);
        } else if (sessionId) {
            sql += 'session_id = ? AND user_id IS NULL';
            params.push(sessionId);
        }
        
        return await this.query(sql, params);
    }

    // Settings operations
    async getSetting(key) {
        const sql = 'SELECT setting_value, setting_type FROM site_settings WHERE setting_key = ?';
        const settings = await this.query(sql, [key]);
        
        if (settings.length === 0) return null;
        
        const setting = settings[0];
        
        switch (setting.setting_type) {
            case 'number':
                return parseFloat(setting.setting_value);
            case 'boolean':
                return setting.setting_value === 'true';
            case 'json':
                return JSON.parse(setting.setting_value);
            default:
                return setting.setting_value;
        }
    }

    async setSetting(key, value, type = 'string') {
        let stringValue = value;
        
        if (type === 'json') {
            stringValue = JSON.stringify(value);
        } else if (type === 'boolean') {
            stringValue = value ? 'true' : 'false';
        } else if (type === 'number') {
            stringValue = value.toString();
        }
        
        const sql = `
            INSERT INTO site_settings (setting_key, setting_value, setting_type, updated_at)
            VALUES (?, ?, ?, NOW())
            ON DUPLICATE KEY UPDATE 
            setting_value = VALUES(setting_value),
            setting_type = VALUES(setting_type),
            updated_at = NOW()
        `;
        
        return await this.query(sql, [key, stringValue, type]);
    }

    // Analytics
    async logEvent(eventType, eventData, userId = null, sessionId = null, ipAddress = null, userAgent = null) {
        const sql = `
            INSERT INTO analytics_events (event_type, event_data, user_id, session_id, 
                                        ip_address, user_agent, created_at)
            VALUES (?, ?, ?, ?, ?, ?, NOW())
        `;
        
        return await this.query(sql, [
            eventType,
            JSON.stringify(eventData),
            userId,
            sessionId,
            ipAddress,
            userAgent
        ]);
    }

    async end() {
        if (this.pool) {
            await this.pool.end();
            logger.info('Database pool closed');
        }
    }
}

module.exports = new Database();
