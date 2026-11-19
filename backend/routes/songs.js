const express = require('express');
const router = express.Router();
const songController = require('../controllers/songController');
const { verifyAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/', songController.getAllSongs);
router.get('/trending', songController.getTrendingSongs);
router.get('/featured', songController.getFeaturedSongs);
router.get('/:id', songController.getSongById);
router.post('/:id/listen', songController.incrementListen);
router.post('/:id/like', songController.toggleLike);

// Admin routes (Quản lý bài hát)
router.post(
  '/',
  verifyAdmin,
  upload.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'image', maxCount: 1 }
  ]),
  songController.createSong
);

router.put(
  '/:id',
  verifyAdmin,
  upload.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'image', maxCount: 1 }
  ]),
  songController.updateSong
);

router.delete('/:id', verifyAdmin, songController.deleteSong);

module.exports = router;

