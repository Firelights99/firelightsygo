const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log error
    logger.error('API Error:', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = 'Resource not found';
        error = { message, statusCode: 404 };
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const message = 'Duplicate field value entered';
        error = { message, statusCode: 400 };
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message).join(', ');
        error = { message, statusCode: 400 };
    }

    // MySQL errors
    if (err.code) {
        switch (err.code) {
            case 'ER_DUP_ENTRY':
                error = { 
                    message: 'Duplicate entry. This record already exists.', 
                    statusCode: 409 
                };
                break;
            case 'ER_NO_REFERENCED_ROW_2':
                error = { 
                    message: 'Referenced record does not exist.', 
                    statusCode: 400 
                };
                break;
            case 'ER_ROW_IS_REFERENCED_2':
                error = { 
                    message: 'Cannot delete record as it is referenced by other records.', 
                    statusCode: 409 
                };
                break;
            case 'ER_DATA_TOO_LONG':
                error = { 
                    message: 'Data too long for field.', 
                    statusCode: 400 
                };
                break;
            case 'ER_BAD_NULL_ERROR':
                error = { 
                    message: 'Required field cannot be null.', 
                    statusCode: 400 
                };
                break;
            case 'ECONNREFUSED':
                error = { 
                    message: 'Database connection failed.', 
                    statusCode: 503 
                };
                break;
            default:
                error = { 
                    message: 'Database error occurred.', 
                    statusCode: 500 
                };
        }
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        error = { message: 'Invalid token', statusCode: 401 };
    }

    if (err.name === 'TokenExpiredError') {
        error = { message: 'Token expired', statusCode: 401 };
    }

    // File upload errors
    if (err.code === 'LIMIT_FILE_SIZE') {
        error = { 
            message: 'File too large. Maximum size is 5MB.', 
            statusCode: 413 
        };
    }

    if (err.code === 'LIMIT_FILE_COUNT') {
        error = { 
            message: 'Too many files. Maximum is 10 files.', 
            statusCode: 413 
        };
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        error = { 
            message: 'Unexpected file field.', 
            statusCode: 400 
        };
    }

    // Payment errors
    if (err.type === 'StripeCardError') {
        error = { 
            message: err.message || 'Payment failed', 
            statusCode: 402 
        };
    }

    if (err.type === 'StripeInvalidRequestError') {
        error = { 
            message: 'Invalid payment request', 
            statusCode: 400 
        };
    }

    // Rate limiting errors
    if (err.status === 429) {
        error = { 
            message: 'Too many requests. Please try again later.', 
            statusCode: 429 
        };
    }

    // Default error response
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';

    // Don't expose sensitive error details in production
    const response = {
        success: false,
        error: message,
        ...(process.env.NODE_ENV === 'development' && { 
            stack: err.stack,
            details: error 
        })
    };

    // Add request ID for tracking
    if (req.id) {
        response.requestId = req.id;
    }

    res.status(statusCode).json(response);
};

module.exports = errorHandler;
