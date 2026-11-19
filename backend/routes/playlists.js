const express = require('express');
const router = express.Router();
const playlistController = require('../controllers/playlistController');
const { verifyToken } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/featured', playlistController.getFeaturedPlaylists);
router.get('/', verifyToken, playlistController.getUserPlaylists);
router.get('/:id', playlistController.getPlaylistById);
router.post('/', verifyToken, upload.single('coverImage'), playlistController.createPlaylist);
router.put('/:id', verifyToken, upload.single('coverImage'), playlistController.updatePlaylist);
router.post('/:id/songs', verifyToken, playlistController.addSongToPlaylist);
router.delete('/:id/songs', verifyToken, playlistController.removeSongFromPlaylist);
router.delete('/:id', verifyToken, playlistController.deletePlaylist);

module.exports = router;
