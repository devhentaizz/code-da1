const commentModel = require('../models/commentModel');

// Lấy bình luận của 1 bài hát
const getCommentsBySong = async (req, res) => {
  try {
    const comments = await commentModel.find({ songId: req.params.songId, status: { $ne: 'hidden' } })
      .populate('userId', 'username avatar')
      .sort({ createdAt: -1 });

    const formatted = comments.map(c => {
      const obj = c.toObject ? c.toObject() : { ...c };
      obj.user = obj.userId ? {
        name: obj.userId.username,
        avatar: obj.userId.avatar
      } : { name: 'Thành viên' };
      return obj;
    });

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Đăng bình luận mới
const addComment = async (req, res) => {
  try {
    const { songId, content } = req.body;
    if (!songId || !content) {
      return res.status(400).json({ message: 'Vui lòng nhập nội dung bình luận' });
    }

    const commentId = `comment_${Date.now()}`;

    const newComment = new commentModel({
      _id: commentId,
      userId: req.user._id,
      songId,
      content: content.trim(),
      status: 'visible'
    });

    const saved = await newComment.save();
    const populated = await commentModel.findById(saved._id).populate('userId', 'username avatar');

    const formatted = populated.toObject();
    formatted.user = {
      name: formatted.userId?.username || 'Thành viên',
      avatar: formatted.userId?.avatar
    };

    res.status(201).json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Xóa bình luận
const deleteComment = async (req, res) => {
  try {
    const comment = await commentModel.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Không tìm thấy bình luận' });
    }

    if (comment.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bạn không có quyền xóa bình luận này' });
    }

    await commentModel.findByIdAndDelete(req.params.id);
    res.json({ message: 'Đã xóa bình luận thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCommentsBySong,
  addComment,
  deleteComment
};
