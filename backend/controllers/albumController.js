const albumModel = require('../models/albumModel');
const songModel = require('../models/songModel');
const slugify = require('slugify');

// Lấy tất cả album
const getAllAlbums = async (req, res) => {
  try {
    const albums = await albumModel.find()
      .populate('artistIds', 'name slug avatar')
      .sort({ releaseDate: -1 });

    res.json(albums);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Chi tiết album kèm danh sách bài hát
const getAlbumById = async (req, res) => {
  try {
    const album = await albumModel.findById(req.params.id)
      .populate('artistIds', 'name slug avatar bio');

    if (!album) {
      return res.status(404).json({ message: 'Không tìm thấy album' });
    }

    const songs = await songModel.find({ albumId: album._id })
      .populate('artistIds', 'name slug');

    res.json({
      ...album.toObject(),
      songs: songs.map(s => {
        const obj = s.toObject();
        obj.artist = obj.artistIds && obj.artistIds[0] ? obj.artistIds[0] : null;
        obj.listens = obj.playCount || 0;
        return obj;
      })
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tạo album mới
const createAlbum = async (req, res) => {
  try {
    const { title, artist, releaseDate, description } = req.body;
    let coverImage = req.body.coverImage;

    if (req.file) {
      coverImage = `/uploads/${req.file.filename}`;
    }

    const albumId = `album_${Date.now()}`;
    const slug = slugify(title, { lower: true, locale: 'vi', remove: /[*+~.()'"!:@]/g });

    const newAlbum = new albumModel({
      _id: albumId,
      title,
      slug,
      artistIds: artist ? [artist] : [],
      releaseDate: releaseDate || new Date().toISOString().split('T')[0],
      description: description || '',
      coverImage: coverImage || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80'
    });

    const saved = await newAlbum.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật album
const updateAlbum = async (req, res) => {
  try {
    const { title, artist, releaseDate, description, coverImage } = req.body;
    const updateData = {};

    if (title) {
      updateData.title = title;
      updateData.slug = slugify(title, { lower: true, locale: 'vi', remove: /[*+~.()'"!:@]/g });
    }
    if (artist !== undefined) updateData.artistIds = artist ? [artist] : [];
    if (releaseDate) updateData.releaseDate = releaseDate;
    if (description !== undefined) updateData.description = description;

    if (req.file) {
      updateData.coverImage = `/uploads/${req.file.filename}`;
    } else if (coverImage !== undefined) {
      updateData.coverImage = coverImage;
    }

    const updated = await albumModel.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: 'Không tìm thấy album' });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Xóa album
const deleteAlbum = async (req, res) => {
  try {
    await albumModel.findByIdAndDelete(req.params.id);
    res.json({ message: 'Xóa album thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllAlbums,
  getAlbumById,
  createAlbum,
  updateAlbum,
  deleteAlbum
};
