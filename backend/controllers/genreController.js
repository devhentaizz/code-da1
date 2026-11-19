const genreModel = require('../models/genreModel');
const songModel = require('../models/songModel');
const slugify = require('slugify');

// Lấy tất cả thể loại
const getAllGenres = async (req, res) => {
  try {
    const genres = await genreModel.find().sort({ name: 1 });
    res.json(genres);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Chi tiết thể loại kèm bài hát
const getGenreBySlug = async (req, res) => {
  try {
    const genre = await genreModel.findOne({ slug: req.params.slug });
    if (!genre) {
      return res.status(404).json({ message: 'Không tìm thấy thể loại' });
    }

    const songs = await songModel.find({ genreIds: genre._id, status: { $ne: 'archived' } })
      .populate('artistIds', 'name slug avatar')
      .sort({ playCount: -1 });

    const formattedSongs = songs.map(s => {
      const obj = s.toObject ? s.toObject() : { ...s };
      obj.artist = obj.artistIds && obj.artistIds.length > 0 ? obj.artistIds[0] : null;
      obj.genre = genre;
      obj.listens = obj.playCount || 0;
      return obj;
    });

    res.json({ genre, songs: formattedSongs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tạo thể loại mới
const createGenre = async (req, res) => {
  try {
    const { name, description, coverImage, color } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Tên thể loại là bắt buộc' });
    }

    const slug = slugify(name, { lower: true, locale: 'vi', remove: /[*+~.()'"!:@]/g });
    let image = coverImage || req.body.image;

    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    }

    const genreId = `genre_${Date.now()}`;

    const newGenre = new genreModel({
      _id: genreId,
      name,
      slug,
      description: description || '',
      color: color || '#3b82f6',
      coverImage: image || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80'
    });

    const saved = await newGenre.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật thể loại
const updateGenre = async (req, res) => {
  try {
    const { name, description, coverImage, color } = req.body;
    const updateData = {};

    if (name) {
      updateData.name = name;
      updateData.slug = slugify(name, { lower: true, locale: 'vi', remove: /[*+~.()'"!:@]/g });
    }
    if (description !== undefined) updateData.description = description;
    if (color !== undefined) updateData.color = color;
    if (coverImage || req.body.image) updateData.coverImage = coverImage || req.body.image;

    if (req.file) {
      updateData.coverImage = `/uploads/${req.file.filename}`;
    }

    const updated = await genreModel.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: 'Không tìm thấy thể loại' });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Xóa thể loại
const deleteGenre = async (req, res) => {
  try {
    await genreModel.findByIdAndDelete(req.params.id);
    res.json({ message: 'Xóa thể loại thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllGenres,
  getGenreBySlug,
  createGenre,
  updateGenre,
  deleteGenre
};
