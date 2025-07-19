const express = require('express');
const { adminMiddleware } = require('../middleware/auth');
const router = express.Router();

// Apply admin middleware to all routes
router.use(adminMiddleware);

// Placeholder for admin routes
router.get('/dashboard', (req, res) => {
    res.json({ success: true, message: 'Admin dashboard endpoint - implementation pending' });
});

module.exports = router;
