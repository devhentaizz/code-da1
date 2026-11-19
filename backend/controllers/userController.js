const userModel = require('../models/userModel');
const favoriteModel = require('../models/favoriteModel');
const playlistModel = require('../models/playlistModel');
const songModel = require('../models/songModel');
const listeningHistoryModel = require('../models/listeningHistoryModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Đăng ký tài khoản mới
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const name = username || req.body.name;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ tên người dùng, email và mật khẩu' });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email này đã được sử dụng' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const newId = `user_${Date.now()}`;

    const newUser = new userModel({
      _id: newId,
      username: name,
      email,
      passwordHash,
      role: 'user',
      status: 'active'
    });

    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET || 'webnhac_secret_key_2026_super_secure_token',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Đăng ký thành công',
      token,
      user: {
        id: newUser._id,
        name: newUser.username,
        email: newUser.email,
        role: newUser.role,
        avatar: newUser.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Đăng nhập
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập email và mật khẩu' });
    }

    const user = await userModel.findOne({
      $or: [{ email: email.toLowerCase() }, { username: email }]
    });

    if (!user) {
      return res.status(400).json({ message: 'Tài khoản không tồn tại' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mật khẩu không chính xác' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'webnhac_secret_key_2026_super_secure_token',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Đăng nhập thành công',
      token,
      user: {
        id: user._id,
        name: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy thông tin cá nhân kèm Favorites và History
const getProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    // Lấy danh sách yêu thích
    const favoritesDocs = await favoriteModel.find({ userId: req.user._id })
      .populate({
        path: 'songId',
        populate: [
          { path: 'artistIds', select: 'name slug avatar' },
          { path: 'genreIds', select: 'name slug' },
          { path: 'albumId', select: 'title' }
        ]
      })
      .sort({ createdAt: -1 });

    const favorites = favoritesDocs.map(f => f.songId).filter(Boolean);
    if (favorites.length) {
      const favoriteSongIds = favorites.map(song => song._id);
      await playlistModel.findOneAndUpdate(
        { userId: req.user._id, name: /^nhạc yêu thích$/i },
        {
          $setOnInsert: {
            _id: `playlist_favorites_${req.user._id}`,
            name: 'Nhạc yêu thích',
            userId: req.user._id,
            description: 'Danh sách những bài hát bạn yêu thích.',
            visibility: 'private'
          },
          $addToSet: { songIds: { $each: favoriteSongIds } }
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    // Lấy lịch sử nghe nhạc gần đây
    const historyDocs = await listeningHistoryModel.find({ userId: req.user._id })
      .populate({
        path: 'songId',
        populate: [
          { path: 'artistIds', select: 'name slug avatar' },
          { path: 'genreIds', select: 'name slug' },
          { path: 'albumId', select: 'title' }
        ]
      })
      .sort({ playedAt: -1 })
      .limit(30);

    const history = historyDocs.map(h => ({
      song: h.songId,
      playedAt: h.playedAt,
      progressSeconds: h.progressSeconds,
      completed: h.completed
    })).filter(h => h.song);

    res.json({
      _id: user._id,
      name: user.username,
      username: user.username,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      favorites,
      history
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật thông tin người dùng
const updateProfile = async (req, res) => {
  try {
    const { name, username, avatar } = req.body;
    const updateData = {};
    const updatedName = (name ?? username)?.trim();
    if (updatedName !== undefined) {
      if (!updatedName) {
        return res.status(400).json({ message: 'Tên hiển thị không được để trống' });
      }
      updateData.username = updatedName;
    }
    if (typeof avatar === 'string' && avatar.trim()) updateData.avatar = avatar.trim();
    if (req.file) {
      updateData.avatar = `/uploads/${req.file.filename}`;
    }

    const updatedUser = await userModel.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true }
    ).select('-passwordHash');

    if (!updatedUser) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    res.json({
      _id: updatedUser._id,
      name: updatedUser.username,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
      avatar: updatedUser.avatar
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Thêm / Bỏ yêu thích bài hát (Favorites Collection)
const toggleFavoriteSong = async (req, res) => {
  try {
    const { songId, isFavorite: requestedFavoriteState } = req.body;
    if (typeof songId !== 'string' || !songId.trim()) {
      return res.status(400).json({ message: 'Thiếu mã bài hát' });
    }

    const normalizedSongId = songId.trim();
    const songExists = await songModel.exists({ _id: normalizedSongId });
    if (!songExists) {
      return res.status(404).json({ message: 'Không tìm thấy bài hát' });
    }

    const existing = await favoriteModel.findOne({
      userId: req.user._id,
      songId: normalizedSongId
    });
    const isFavorite = typeof requestedFavoriteState === 'boolean'
      ? requestedFavoriteState
      : !existing;

    if (isFavorite) {
      await favoriteModel.findOneAndUpdate(
        { userId: req.user._id, songId: normalizedSongId },
        {
          $setOnInsert: {
            _id: `favorite_${req.user._id}_${normalizedSongId}`,
            createdAt: new Date()
          }
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    } else {
      await favoriteModel.deleteMany({ userId: req.user._id, songId: normalizedSongId });
    }

    let favoritePlaylist = await playlistModel.findOne({
      userId: req.user._id,
      name: /^nhạc yêu thích$/i
    });
    if (!favoritePlaylist && isFavorite) {
      favoritePlaylist = await playlistModel.create({
        _id: `playlist_favorites_${req.user._id}`,
        name: 'Nhạc yêu thích',
        userId: req.user._id,
        description: 'Danh sách những bài hát bạn yêu thích.',
        visibility: 'private',
        songIds: []
      });
    }

    if (favoritePlaylist) {
      await playlistModel.updateOne(
        { _id: favoritePlaylist._id },
        isFavorite
          ? { $addToSet: { songIds: normalizedSongId } }
          : { $pull: { songIds: normalizedSongId } }
      );
    }

    const allFavs = await favoriteModel.find({ userId: req.user._id }).select('songId').lean();
    res.json({
      message: isFavorite ? 'Đã thêm vào yêu thích' : 'Đã xóa khỏi yêu thích',
      isFavorite,
      favorites: allFavs.map(f => f.songId)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lưu lịch sử nghe nhạc (listening_history Collection)
const addToHistory = async (req, res) => {
  try {
    const { songId, progressSeconds = 0, completed = false } = req.body;
    if (!songId) {
      return res.status(400).json({ message: 'Thiếu mã bài hát' });
    }

    const historyEntry = await listeningHistoryModel.findOneAndUpdate(
      { userId: req.user._id, songId },
      {
        $set: {
          playedAt: new Date(),
          progressSeconds: Math.max(0, Number(progressSeconds) || 0),
          completed: Boolean(completed)
        },
        $setOnInsert: { _id: `history_${req.user._id}_${songId}` }
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    await listeningHistoryModel.deleteMany({
      userId: req.user._id,
      songId,
      _id: { $ne: historyEntry._id }
    });

    res.json({ message: 'Đã lưu lịch sử nghe nhạc' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Lấy danh sách toàn bộ người dùng
const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find().select('-passwordHash').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  toggleFavoriteSong,
  addToHistory,
  getAllUsers
};
