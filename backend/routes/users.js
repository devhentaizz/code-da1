const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Auth routes
router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/profile', verifyToken, userController.getProfile);
router.put('/profile', verifyToken, upload.single('avatar'), userController.updateProfile);

// Favorites & History
router.post('/favorite', verifyToken, userController.toggleFavoriteSong);
router.post('/history', verifyToken, userController.addToHistory);

// Admin routes
router.get('/', verifyAdmin, userController.getAllUsers);

module.exports = router;

