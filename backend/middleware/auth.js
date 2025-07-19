const jwt = require('jsonwebtoken');
const database = require('../config/database');
const logger = require('../utils/logger');

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                error: 'Access denied. No token provided.',
                code: 'NO_TOKEN'
            });
        }

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user from database
        const user = await database.getUserById(decoded.userId);
        
        if (!user) {
            return res.status(401).json({
                error: 'Invalid token. User not found.',
                code: 'USER_NOT_FOUND'
            });
        }

        if (!user.is_active) {
            return res.status(401).json({
                error: 'Account is deactivated.',
                code: 'ACCOUNT_DEACTIVATED'
            });
        }

        // Add user to request object
        req.user = {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            isAdmin: user.is_admin || false
        };

        next();
    } catch (error) {
        logger.error('Authentication error:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                error: 'Invalid token.',
                code: 'INVALID_TOKEN'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 'Token expired.',
                code: 'TOKEN_EXPIRED'
            });
        }

        res.status(500).json({
            error: 'Authentication failed.',
            code: 'AUTH_ERROR'
        });
    }
};

// Admin-only middleware
const adminMiddleware = (req, res, next) => {
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({
            error: 'Access denied. Admin privileges required.',
            code: 'ADMIN_REQUIRED'
        });
    }
    next();
};

// Optional auth middleware (doesn't fail if no token)
const optionalAuthMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            req.user = null;
            return next();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await database.getUserById(decoded.userId);
        
        if (user && user.is_active) {
            req.user = {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                isAdmin: user.is_admin || false
            };
        } else {
            req.user = null;
        }

        next();
    } catch (error) {
        // Don't fail on optional auth errors
        req.user = null;
        next();
    }
};

module.exports = {
    authMiddleware,
    adminMiddleware,
    optionalAuthMiddleware
};
