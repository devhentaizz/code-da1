const playlistModel = require('../models/playlistModel');

// Lấy playlist công khai để hiển thị trong sidebar và các khu vực khám phá
const getFeaturedPlaylists = async (req, res) => {
  try {
    const playlists = await playlistModel.find({ visibility: 'public' })
      .select('_id name description coverImage songIds createdAt')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    res.json(playlists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy danh sách playlist của người dùng
const getUserPlaylists = async (req, res) => {
  try {
    const playlists = await playlistModel.find({ userId: req.user._id })
      .populate({
        path: 'songIds',
        populate: [
          { path: 'artistIds', select: 'name slug avatar' },
          { path: 'genreIds', select: 'name slug' },
          { path: 'albumId', select: 'title' }
        ]
      })
      .sort({ createdAt: -1 });

    res.json(playlists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Chi tiết 1 playlist
const getPlaylistById = async (req, res) => {
  try {
    const playlist = await playlistModel.findById(req.params.id)
      .populate('userId', 'username avatar')
      .populate({
        path: 'songIds',
        populate: [
          { path: 'artistIds', select: 'name slug avatar' },
          { path: 'genreIds', select: 'name slug' },
          { path: 'albumId', select: 'title' }
        ]
      });

    if (!playlist) {
      return res.status(404).json({ message: 'Không tìm thấy playlist' });
    }

    // Format songs
    const playlistObj = playlist.toObject();
    if (playlistObj.songIds) {
      playlistObj.songs = playlistObj.songIds.map(s => ({
        ...s,
        artist: s.artistIds && s.artistIds[0] ? s.artistIds[0] : null,
        albumTitle: s.albumId?.title || '',
        listens: s.playCount || 0
      }));
    }

    res.json(playlistObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tạo playlist mới
const createPlaylist = async (req, res) => {
  try {
    const { name, title, description, visibility, isPublic } = req.body;
    const playlistName = name || title;
    if (!playlistName) {
      return res.status(400).json({ message: 'Tên danh sách phát là bắt buộc' });
    }

    let coverImage = req.body.coverImage;
    if (req.file) {
      coverImage = `/uploads/${req.file.filename}`;
    }

    const playlistId = `playlist_${Date.now()}`;

    const newPlaylist = new playlistModel({
      _id: playlistId,
      name: playlistName,
      userId: req.user._id,
      description: description || '',
      coverImage: coverImage || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
      visibility: visibility || (isPublic !== false ? 'public' : 'private'),
      songIds: []
    });

    const saved = await newPlaylist.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật mô tả và ảnh bìa playlist của người dùng
const updatePlaylist = async (req, res) => {
  try {
    const playlist = await playlistModel.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!playlist) {
      return res.status(404).json({ message: 'Không tìm thấy playlist hoặc bạn không có quyền' });
    }

    if (typeof req.body.description === 'string') {
      playlist.description = req.body.description;
    }
    const coverImageUrl = String(req.body.coverImageUrl || '').trim();
    if (req.file) {
      playlist.coverImage = `/uploads/${req.file.filename}`;
    } else if (coverImageUrl) {
      let parsedUrl;
      try {
        parsedUrl = new URL(coverImageUrl);
      } catch {
        return res.status(400).json({ message: 'Địa chỉ ảnh không hợp lệ' });
      }

      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return res.status(400).json({ message: 'Địa chỉ ảnh phải bắt đầu bằng http:// hoặc https://' });
      }
      playlist.coverImage = parsedUrl.toString();
    }

    await playlist.save();
    res.json(playlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Thêm bài hát vào playlist
const addSongToPlaylist = async (req, res) => {
  try {
    const { songId } = req.body;
    const playlist = await playlistModel.findOne({ _id: req.params.id, userId: req.user._id });

    if (!playlist) {
      return res.status(404).json({ message: 'Không tìm thấy playlist hoặc bạn không có quyền' });
    }

    if (!playlist.songIds.includes(songId)) {
      playlist.songIds.push(songId);
      await playlist.save();
    }

    res.json({ message: 'Đã thêm bài hát vào playlist', playlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Xóa bài hát khỏi playlist
const removeSongFromPlaylist = async (req, res) => {
  try {
    const { songId } = req.body;
    const playlist = await playlistModel.findOne({ _id: req.params.id, userId: req.user._id });

    if (!playlist) {
      return res.status(404).json({ message: 'Không tìm thấy playlist hoặc bạn không có quyền' });
    }

    playlist.songIds = playlist.songIds.filter(id => id.toString() !== songId);
    await playlist.save();

    res.json({ message: 'Đã xóa bài hát khỏi playlist', playlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Xóa playlist
const deletePlaylist = async (req, res) => {
  try {
    const playlist = await playlistModel.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });
    if (!playlist) {
      return res.status(404).json({ message: 'Không tìm thấy playlist hoặc bạn không có quyền' });
    }

    res.json({ message: 'Đã xóa playlist thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getFeaturedPlaylists,
  getUserPlaylists,
  getPlaylistById,
  createPlaylist,
  updatePlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist,
  deletePlaylist
};
