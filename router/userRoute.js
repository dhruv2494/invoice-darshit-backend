const express = require('express');
const router = express.Router();

const { register, login, getMe } = require('../controller/userController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected route
router.get('/me', protect, getMe);

module.exports = router;