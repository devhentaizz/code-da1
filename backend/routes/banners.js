const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/bannerController');
const { verifyAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public
router.get('/', bannerController.getActiveBanners);

// Admin
router.get('/all', verifyAdmin, bannerController.getAllBanners);
router.post('/', verifyAdmin, upload.single('image'), bannerController.createBanner);
router.put('/:id', verifyAdmin, upload.single('image'), bannerController.updateBanner);
router.delete('/:id', verifyAdmin, bannerController.deleteBanner);

module.exports = router;

