const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const database = require('../config/database');
const logger = require('../utils/logger');

const router = express.Router();

// Register new user
router.post('/register', [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('firstName').trim().isLength({ min: 1 }).withMessage('First name is required'),
    body('lastName').trim().isLength({ min: 1 }).withMessage('Last name is required'),
    body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number')
], async (req, res, next) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const { email, password, firstName, lastName, phone } = req.body;

        // Check if user already exists
        const existingUser = await database.getUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({
                success: false,
                error: 'User with this email already exists',
                code: 'USER_EXISTS'
            });
        }

        // Hash password
        const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Create user
        const userId = await database.createUser({
            email,
            passwordHash,
            firstName,
            lastName,
            phone
        });

        // Generate JWT token
        const token = jwt.sign(
            { userId },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        // Get created user (without password)
        const user = await database.getUserById(userId);
        delete user.password_hash;

        // Log registration event
        await database.logEvent('user_registered', {
            userId,
            email,
            registrationMethod: 'email'
        }, userId, req.sessionID, req.ip, req.get('User-Agent'));

        logger.info('User registered successfully:', { userId, email });

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    phone: user.phone,
                    createdAt: user.created_at
                },
                token
            }
        });

    } catch (error) {
        next(error);
    }
});

// Login user
router.post('/login', [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res, next) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const { email, password } = req.body;

        // Get user by email
        const user = await database.getUserByEmail(email);
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password',
                code: 'INVALID_CREDENTIALS'
            });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            // Log failed login attempt
            await database.logEvent('login_failed', {
                email,
                reason: 'invalid_password'
            }, null, req.sessionID, req.ip, req.get('User-Agent'));

            return res.status(401).json({
                success: false,
                error: 'Invalid email or password',
                code: 'INVALID_CREDENTIALS'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        // Update last login
        await database.updateUser(user.id, {
            last_login_at: new Date()
        });

        // Log successful login
        await database.logEvent('user_login', {
            userId: user.id,
            email,
            loginMethod: 'email'
        }, user.id, req.sessionID, req.ip, req.get('User-Agent'));

        logger.info('User logged in successfully:', { userId: user.id, email });

        // Remove password from response
        delete user.password_hash;

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    phone: user.phone,
                    isAdmin: user.is_admin || false,
                    createdAt: user.created_at,
                    lastLoginAt: user.last_login_at
                },
                token
            }
        });

    } catch (error) {
        next(error);
    }
});

// Refresh token
router.post('/refresh', async (req, res, next) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                error: 'Refresh token is required',
                code: 'NO_REFRESH_TOKEN'
            });
        }

        // Verify the token (even if expired)
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                // Allow expired tokens for refresh
                decoded = jwt.decode(token);
            } else {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid refresh token',
                    code: 'INVALID_REFRESH_TOKEN'
                });
            }
        }

        // Get user
        const user = await database.getUserById(decoded.userId);
        if (!user || !user.is_active) {
            return res.status(401).json({
                success: false,
                error: 'User not found or inactive',
                code: 'USER_NOT_FOUND'
            });
        }

        // Generate new token
        const newToken = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.json({
            success: true,
            message: 'Token refreshed successfully',
            data: {
                token: newToken
            }
        });

    } catch (error) {
        next(error);
    }
});

// Verify token
router.get('/verify', async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'No token provided',
                code: 'NO_TOKEN'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user
        const user = await database.getUserById(decoded.userId);
        if (!user || !user.is_active) {
            return res.status(401).json({
                success: false,
                error: 'Invalid token or user not found',
                code: 'INVALID_TOKEN'
            });
        }

        res.json({
            success: true,
            message: 'Token is valid',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    phone: user.phone,
                    isAdmin: user.is_admin || false,
                    createdAt: user.created_at
                }
            }
        });

    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired token',
                code: 'INVALID_TOKEN'
            });
        }
        next(error);
    }
});

// Logout (client-side token invalidation)
router.post('/logout', async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                
                // Log logout event
                await database.logEvent('user_logout', {
                    userId: decoded.userId
                }, decoded.userId, req.sessionID, req.ip, req.get('User-Agent'));
                
            } catch (error) {
                // Token might be expired, that's okay for logout
            }
        }

        res.json({
            success: true,
            message: 'Logged out successfully'
        });

    } catch (error) {
        next(error);
    }
});

// Request password reset
router.post('/forgot-password', [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email')
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

        const { email } = req.body;

        // Check if user exists
        const user = await database.getUserByEmail(email);
        
        // Always return success to prevent email enumeration
        res.json({
            success: true,
            message: 'If an account with that email exists, a password reset link has been sent.'
        });

        if (user) {
            // Generate reset token (in production, implement proper password reset)
            const resetToken = jwt.sign(
                { userId: user.id, type: 'password_reset' },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            // Log password reset request
            await database.logEvent('password_reset_requested', {
                userId: user.id,
                email
            }, user.id, req.sessionID, req.ip, req.get('User-Agent'));

            logger.info('Password reset requested:', { userId: user.id, email });

            // TODO: Send email with reset link
            // await sendPasswordResetEmail(email, resetToken);
        }

    } catch (error) {
        next(error);
    }
});

module.exports = router;
