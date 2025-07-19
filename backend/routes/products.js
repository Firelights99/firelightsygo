const express = require('express');
const { optionalAuthMiddleware } = require('../middleware/auth');
const database = require('../config/database');

const router = express.Router();

// Get all products with optional filtering
router.get('/', optionalAuthMiddleware, async (req, res, next) => {
    try {
        const filters = {
            category: req.query.category,
            search: req.query.search,
            featured: req.query.featured === 'true',
            limit: req.query.limit ? parseInt(req.query.limit) : undefined
        };

        const products = await database.getProducts(filters);

        res.json({
            success: true,
            data: {
                products: products.map(product => ({
                    id: product.id,
                    name: product.name,
                    description: product.description,
                    shortDescription: product.short_description,
                    sku: product.sku,
                    price: parseFloat(product.price),
                    salePrice: product.sale_price ? parseFloat(product.sale_price) : null,
                    stockQuantity: product.stock_quantity,
                    inStock: product.in_stock,
                    category: product.category_name,
                    isFeatured: product.is_featured,
                    primaryImage: product.primary_image,
                    createdAt: product.created_at
                }))
            }
        });

    } catch (error) {
        next(error);
    }
});

// Get single product by ID
router.get('/:id', optionalAuthMiddleware, async (req, res, next) => {
    try {
        const productId = parseInt(req.params.id);
        
        if (isNaN(productId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid product ID'
            });
        }

        const product = await database.getProductById(productId);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found',
                code: 'PRODUCT_NOT_FOUND'
            });
        }

        // Log product view
        if (req.user) {
            await database.logEvent('product_viewed', {
                productId: product.id,
                productName: product.name,
                userId: req.user.id
            }, req.user.id, req.sessionID, req.ip, req.get('User-Agent'));
        }

        res.json({
            success: true,
            data: {
                product: {
                    id: product.id,
                    name: product.name,
                    description: product.description,
                    shortDescription: product.short_description,
                    sku: product.sku,
                    price: parseFloat(product.price),
                    salePrice: product.sale_price ? parseFloat(product.sale_price) : null,
                    stockQuantity: product.stock_quantity,
                    inStock: product.in_stock,
                    weight: product.weight ? parseFloat(product.weight) : null,
                    dimensions: product.dimensions,
                    category: product.category_name,
                    isFeatured: product.is_featured,
                    images: product.images ? JSON.parse(product.images) : [],
                    metaTitle: product.meta_title,
                    metaDescription: product.meta_description,
                    createdAt: product.created_at,
                    updatedAt: product.updated_at
                }
            }
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router;
