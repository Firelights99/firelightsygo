const express = require('express');
const { optionalAuthMiddleware } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const database = require('../config/database');

const router = express.Router();

// Get cart contents
router.get('/', optionalAuthMiddleware, async (req, res, next) => {
    try {
        const userId = req.user ? req.user.id : null;
        const sessionId = req.sessionID;

        const cartItems = await database.getCart(userId, sessionId);

        const total = cartItems.reduce((sum, item) => {
            return sum + (parseFloat(item.price) * item.quantity);
        }, 0);

        res.json({
            success: true,
            data: {
                items: cartItems.map(item => ({
                    id: item.id,
                    productId: item.product_id,
                    name: item.name,
                    price: parseFloat(item.price),
                    quantity: item.quantity,
                    total: parseFloat(item.price) * item.quantity,
                    image: item.image,
                    stockQuantity: item.stock_quantity,
                    createdAt: item.created_at
                })),
                total: total,
                itemCount: cartItems.length
            }
        });

    } catch (error) {
        next(error);
    }
});

// Add item to cart
router.post('/add', [
    body('productId').isInt({ min: 1 }).withMessage('Valid product ID is required'),
    body('quantity').isInt({ min: 1, max: 99 }).withMessage('Quantity must be between 1 and 99')
], optionalAuthMiddleware, async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const { productId, quantity } = req.body;
        const userId = req.user ? req.user.id : null;
        const sessionId = req.sessionID;

        // Check if product exists and is in stock
        const product = await database.getProductById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found',
                code: 'PRODUCT_NOT_FOUND'
            });
        }

        if (!product.in_stock || product.stock_quantity < quantity) {
            return res.status(400).json({
                success: false,
                error: 'Insufficient stock',
                code: 'INSUFFICIENT_STOCK'
            });
        }

        await database.addToCart(userId, sessionId, productId, quantity);

        // Log cart event
        await database.logEvent('cart_add', {
            productId,
            quantity,
            userId
        }, userId, sessionId, req.ip, req.get('User-Agent'));

        res.json({
            success: true,
            message: 'Item added to cart successfully'
        });

    } catch (error) {
        next(error);
    }
});

// Update cart item quantity
router.put('/update/:cartId', [
    body('quantity').isInt({ min: 1, max: 99 }).withMessage('Quantity must be between 1 and 99')
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const cartId = parseInt(req.params.cartId);
        const { quantity } = req.body;

        if (isNaN(cartId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid cart item ID'
            });
        }

        await database.updateCartItem(cartId, quantity);

        res.json({
            success: true,
            message: 'Cart item updated successfully'
        });

    } catch (error) {
        next(error);
    }
});

// Remove item from cart
router.delete('/remove/:cartId', async (req, res, next) => {
    try {
        const cartId = parseInt(req.params.cartId);

        if (isNaN(cartId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid cart item ID'
            });
        }

        await database.removeFromCart(cartId);

        res.json({
            success: true,
            message: 'Item removed from cart successfully'
        });

    } catch (error) {
        next(error);
    }
});

// Clear entire cart
router.delete('/clear', optionalAuthMiddleware, async (req, res, next) => {
    try {
        const userId = req.user ? req.user.id : null;
        const sessionId = req.sessionID;

        await database.clearCart(userId, sessionId);

        res.json({
            success: true,
            message: 'Cart cleared successfully'
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router;
