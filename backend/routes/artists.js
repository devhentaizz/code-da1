const express = require('express');
const router = express.Router();
const artistController = require('../controllers/artistController');
const { verifyAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public
router.get('/', artistController.getAllArtists);
router.get('/:id', artistController.getArtistById);

// Admin
router.post(
  '/',
  verifyAdmin,
  upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 }
  ]),
  artistController.createArtist
);

router.put(
  '/:id',
  verifyAdmin,
  upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 }
  ]),
  artistController.updateArtist
);

router.delete('/:id', verifyAdmin, artistController.deleteArtist);

module.exports = router;

