const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { verifyToken } = require('../middleware/auth');

router.get('/song/:songId', commentController.getCommentsBySong);
router.post('/', verifyToken, commentController.addComment);
router.delete('/:id', verifyToken, commentController.deleteComment);

module.exports = router;

