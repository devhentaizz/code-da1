const express = require('express');
const router = express.Router();
const albumController = require('../controllers/albumController');
const { verifyAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public
router.get('/', albumController.getAllAlbums);
router.get('/:id', albumController.getAlbumById);

// Admin
router.post('/', verifyAdmin, upload.single('coverImage'), albumController.createAlbum);
router.put('/:id', verifyAdmin, upload.single('coverImage'), albumController.updateAlbum);
router.delete('/:id', verifyAdmin, albumController.deleteAlbum);

module.exports = router;

