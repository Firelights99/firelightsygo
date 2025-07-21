/**
 * Crystal Commerce API Routes
 * Handles card price fetching and store integration
 */

const express = require('express');
const CrystalCommerceService = require('../services/crystal-commerce-service');
const { body, query, param, validationResult } = require('express-validator');
const logger = require('../utils/logger');

const router = express.Router();
const crystalCommerceService = new CrystalCommerceService();

// Validation middleware
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: errors.array()
        });
    }
    next();
};

/**
 * GET /api/crystal-commerce/health
 * Health check for Crystal Commerce service
 */
router.get('/health', async (req, res) => {
    try {
        const health = await crystalCommerceService.healthCheck();
        res.json({
            success: true,
            data: health
        });
    } catch (error) {
        logger.error('Crystal Commerce health check failed:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/crystal-commerce/stats
 * Get service statistics
 */
router.get('/stats', (req, res) => {
    try {
        const stats = crystalCommerceService.getStats();
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        logger.error('Error getting Crystal Commerce stats:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/crystal-commerce/search
 * Search for cards by name
 */
router.get('/search', [
    query('q').notEmpty().withMessage('Search query is required'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('game').optional().isIn(['yugioh', 'magic', 'pokemon']).withMessage('Invalid game type')
], handleValidationErrors, async (req, res) => {
    try {
        const { q: query, limit, page, game, ...options } = req.query;
        
        const searchOptions = {
            limit: parseInt(limit) || 50,
            page: parseInt(page) || 1,
            game,
            ...options
        };

        const results = await crystalCommerceService.searchCards(query, searchOptions);
        
        res.json({
            success: true,
            data: {
                query,
                results,
                count: results.length,
                page: searchOptions.page,
                limit: searchOptions.limit
            }
        });
    } catch (error) {
        logger.error('Error searching cards:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/crystal-commerce/cards/:id
 * Get card details by product ID
 */
router.get('/cards/:id', [
    param('id').isInt().withMessage('Product ID must be an integer')
], handleValidationErrors, async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const cardDetails = await crystalCommerceService.getCardDetails(productId);
        
        if (!cardDetails) {
            return res.status(404).json({
                success: false,
                error: 'Card not found'
            });
        }

        res.json({
            success: true,
            data: cardDetails
        });
    } catch (error) {
        logger.error('Error getting card details:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/crystal-commerce/cards/:id/prices
 * Get card prices and variants
 */
router.get('/cards/:id/prices', [
    param('id').isInt().withMessage('Product ID must be an integer')
], handleValidationErrors, async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const prices = await crystalCommerceService.getCardPrices(productId);
        
        res.json({
            success: true,
            data: {
                productId,
                prices,
                count: prices.length
            }
        });
    } catch (error) {
        logger.error('Error getting card prices:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/crystal-commerce/cards/:id/buylist
 * Get buylist prices for a card
 */
router.get('/cards/:id/buylist', [
    param('id').isInt().withMessage('Product ID must be an integer')
], handleValidationErrors, async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const buylistPrices = await crystalCommerceService.getBuylistPrices(productId);
        
        res.json({
            success: true,
            data: {
                productId,
                buylistPrices,
                count: buylistPrices.length
            }
        });
    } catch (error) {
        logger.error('Error getting buylist prices:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/crystal-commerce/cards/:id/history
 * Get price history for a card
 */
router.get('/cards/:id/history', [
    param('id').isInt().withMessage('Product ID must be an integer'),
    query('days').optional().isInt({ min: 1, max: 365 }).withMessage('Days must be between 1 and 365')
], handleValidationErrors, async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const days = parseInt(req.query.days) || 30;
        
        const priceHistory = await crystalCommerceService.getPriceHistory(productId, days);
        
        res.json({
            success: true,
            data: {
                productId,
                days,
                history: priceHistory,
                count: priceHistory.length
            }
        });
    } catch (error) {
        logger.error('Error getting price history:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/crystal-commerce/categories/:id/cards
 * Get cards by category
 */
router.get('/categories/:id/cards', [
    param('id').isInt().withMessage('Category ID must be an integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer')
], handleValidationErrors, async (req, res) => {
    try {
        const categoryId = parseInt(req.params.id);
        const options = {
            limit: parseInt(req.query.limit) || 50,
            page: parseInt(req.query.page) || 1,
            ...req.query
        };

        const cards = await crystalCommerceService.getCardsByCategory(categoryId, options);
        
        res.json({
            success: true,
            data: {
                categoryId,
                cards,
                count: cards.length,
                page: options.page,
                limit: options.limit
            }
        });
    } catch (error) {
        logger.error('Error getting cards by category:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/crystal-commerce/yugioh
 * Get Yu-Gi-Oh! specific cards
 */
router.get('/yugioh', [
    query('set').optional().isString().withMessage('Set name must be a string'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer')
], handleValidationErrors, async (req, res) => {
    try {
        const { set: setName, limit, page, ...options } = req.query;
        
        const searchOptions = {
            limit: parseInt(limit) || 50,
            page: parseInt(page) || 1,
            ...options
        };

        const cards = await crystalCommerceService.getYugiohCards(setName, searchOptions);
        
        res.json({
            success: true,
            data: {
                setName: setName || 'All Sets',
                cards,
                count: cards.length,
                page: searchOptions.page,
                limit: searchOptions.limit
            }
        });
    } catch (error) {
        logger.error('Error getting Yu-Gi-Oh! cards:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/crystal-commerce/trending
 * Get trending/popular cards
 */
router.get('/trending', [
    query('game').optional().isIn(['yugioh', 'magic', 'pokemon']).withMessage('Invalid game type'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], handleValidationErrors, async (req, res) => {
    try {
        const game = req.query.game || 'yugioh';
        const limit = parseInt(req.query.limit) || 20;
        
        const trendingCards = await crystalCommerceService.getTrendingCards(game, limit);
        
        res.json({
            success: true,
            data: {
                game,
                cards: trendingCards,
                count: trendingCards.length,
                limit
            }
        });
    } catch (error) {
        logger.error('Error getting trending cards:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/crystal-commerce/new-arrivals
 * Get new arrival cards
 */
router.get('/new-arrivals', [
    query('game').optional().isIn(['yugioh', 'magic', 'pokemon']).withMessage('Invalid game type'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], handleValidationErrors, async (req, res) => {
    try {
        const game = req.query.game || 'yugioh';
        const limit = parseInt(req.query.limit) || 20;
        
        const newArrivals = await crystalCommerceService.getNewArrivals(game, limit);
        
        res.json({
            success: true,
            data: {
                game,
                cards: newArrivals,
                count: newArrivals.length,
                limit
            }
        });
    } catch (error) {
        logger.error('Error getting new arrivals:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/crystal-commerce/bulk-prices
 * Get bulk price lookup for multiple cards
 */
router.post('/bulk-prices', [
    body('productIds').isArray().withMessage('Product IDs must be an array'),
    body('productIds.*').isInt().withMessage('Each product ID must be an integer')
], handleValidationErrors, async (req, res) => {
    try {
        const { productIds } = req.body;
        
        if (productIds.length > 100) {
            return res.status(400).json({
                success: false,
                error: 'Maximum 100 product IDs allowed per request'
            });
        }

        const bulkPrices = await crystalCommerceService.bulkPriceLookup(productIds);
        
        res.json({
            success: true,
            data: {
                requestedIds: productIds,
                prices: bulkPrices,
                count: Object.keys(bulkPrices).length
            }
        });
    } catch (error) {
        logger.error('Error getting bulk prices:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/crystal-commerce/inventory
 * Get inventory levels
 */
router.get('/inventory', [
    query('productIds').optional().isString().withMessage('Product IDs must be a comma-separated string')
], handleValidationErrors, async (req, res) => {
    try {
        const productIds = req.query.productIds ? req.query.productIds.split(',').map(id => parseInt(id)) : null;
        
        const inventory = await crystalCommerceService.getInventoryLevels(productIds);
        
        res.json({
            success: true,
            data: {
                inventory,
                count: Object.keys(inventory).length
            }
        });
    } catch (error) {
        logger.error('Error getting inventory levels:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Error handling middleware
router.use((error, req, res, next) => {
    logger.error('Crystal Commerce API error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

module.exports = router;
