const express = require('express');
const router = express.Router();
const genreController = require('../controllers/genreController');
const { verifyAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public
router.get('/', genreController.getAllGenres);
router.get('/:slug', genreController.getGenreBySlug);

// Admin
router.post('/', verifyAdmin, upload.single('image'), genreController.createGenre);
router.put('/:id', verifyAdmin, upload.single('image'), genreController.updateGenre);
router.delete('/:id', verifyAdmin, genreController.deleteGenre);

module.exports = router;

