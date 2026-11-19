const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// Public: Xem danh sách gói
router.get('/plans', subscriptionController.getPlans);

// User: Xem gói cá nhân & nâng cấp
router.get('/me', verifyToken, subscriptionController.getMySubscription);
router.post('/upgrade', verifyToken, subscriptionController.upgradeSubscription);

// Admin: Quản lý gói cước
router.get('/', verifyAdmin, subscriptionController.getAllSubscriptions);

module.exports = router;

