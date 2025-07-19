const express = require('express');
const { body, validationResult } = require('express-validator');
const database = require('../config/database');
const logger = require('../utils/logger');

const router = express.Router();

// Get current user profile
router.get('/profile', async (req, res, next) => {
    try {
        const user = await database.getUserById(req.user.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found',
                code: 'USER_NOT_FOUND'
            });
        }

        // Remove sensitive data
        delete user.password_hash;

        res.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    phone: user.phone,
                    isAdmin: user.is_admin || false,
                    emailVerified: user.email_verified,
                    createdAt: user.created_at,
                    updatedAt: user.updated_at
                }
            }
        });

    } catch (error) {
        next(error);
    }
});

// Update user profile
router.put('/profile', [
    body('firstName').optional().trim().isLength({ min: 1 }).withMessage('First name cannot be empty'),
    body('lastName').optional().trim().isLength({ min: 1 }).withMessage('Last name cannot be empty'),
    body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number')
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

        const { firstName, lastName, phone } = req.body;
        const updateData = {};

        if (firstName !== undefined) updateData.first_name = firstName;
        if (lastName !== undefined) updateData.last_name = lastName;
        if (phone !== undefined) updateData.phone = phone;

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No valid fields to update'
            });
        }

        const updated = await database.updateUser(req.user.id, updateData);
        
        if (!updated) {
            return res.status(404).json({
                success: false,
                error: 'User not found',
                code: 'USER_NOT_FOUND'
            });
        }

        // Get updated user
        const user = await database.getUserById(req.user.id);
        delete user.password_hash;

        logger.info('User profile updated:', { userId: req.user.id });

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    phone: user.phone,
                    isAdmin: user.is_admin || false,
                    emailVerified: user.email_verified,
                    createdAt: user.created_at,
                    updatedAt: user.updated_at
                }
            }
        });

    } catch (error) {
        next(error);
    }
});

// Get user orders
router.get('/orders', async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const orders = await database.getUserOrders(req.user.id, limit);

        res.json({
            success: true,
            data: {
                orders: orders.map(order => ({
                    id: order.id,
                    orderNumber: order.order_number,
                    status: order.status,
                    paymentStatus: order.payment_status,
                    totalAmount: parseFloat(order.total_amount),
                    subtotal: parseFloat(order.subtotal),
                    taxAmount: parseFloat(order.tax_amount),
                    shippingAmount: parseFloat(order.shipping_amount),
                    currency: order.currency,
                    items: order.items ? JSON.parse(order.items) : [],
                    createdAt: order.created_at,
                    updatedAt: order.updated_at
                }))
            }
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router;
