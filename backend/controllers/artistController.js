const artistModel = require('../models/artistModel');
const songModel = require('../models/songModel');
const albumModel = require('../models/albumModel');
const slugify = require('slugify');

// Lấy danh sách nghệ sĩ
const getAllArtists = async (req, res) => {
  try {
    const { keyword, featured, limit = 50 } = req.query;
    const filter = {};

    if (keyword) {
      filter.$or = [
        { name: { $regex: keyword.trim(), $options: 'i' } },
        { slug: { $regex: keyword.trim(), $options: 'i' } }
      ];
    }

    if (featured === 'true') {
      filter.isVerified = true;
    }

    const artists = await artistModel.find(filter)
      .sort({ isVerified: -1, name: 1 })
      .limit(Number(limit));

    res.json(artists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Chi tiết nghệ sĩ kèm danh sách bài hát và album
const getArtistById = async (req, res) => {
  try {
    const artist = await artistModel.findById(req.params.id);
    if (!artist) {
      return res.status(404).json({ message: 'Không tìm thấy nghệ sĩ' });
    }

    const [songs, albums] = await Promise.all([
      songModel.find({ artistIds: artist._id, status: { $ne: 'archived' } })
        .populate('genreIds', 'name slug')
        .sort({ playCount: -1 }),
      albumModel.find({ artistIds: artist._id })
    ]);

    // Format songs để có artist field
    const formattedSongs = songs.map(s => {
      const obj = s.toObject ? s.toObject() : { ...s };
      obj.artist = artist;
      obj.listens = obj.playCount || 0;
      return obj;
    });

    res.json({
      artist,
      songs: formattedSongs,
      albums
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Thêm nghệ sĩ mới
const createArtist = async (req, res) => {
  try {
    const { name, stageName, bio, country, isVerified } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Tên nghệ sĩ là bắt buộc' });
    }

    let avatar = req.body.avatar;
    const avatarFile = req.files?.avatar?.[0] || req.file;
    if (avatarFile) {
      avatar = `/uploads/${avatarFile.filename}`;
    }

    const artistId = `artist_${Date.now()}`;
    const slug = slugify(name, { lower: true, locale: 'vi', remove: /[*+~.()'"!:@]/g });

    const newArtist = new artistModel({
      _id: artistId,
      name,
      stageName: stageName || name,
      slug,
      bio: bio || '',
      country: country || 'Vietnam',
      avatar: avatar || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80',
      isVerified: isVerified === 'true' || isVerified === true
    });

    const saved = await newArtist.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật nghệ sĩ
const updateArtist = async (req, res) => {
  try {
    const { name, stageName, bio, country, isVerified, avatar } = req.body;
    const updateData = {};

    if (name) {
      updateData.name = name;
      updateData.slug = slugify(name, { lower: true, locale: 'vi', remove: /[*+~.()'"!:@]/g });
    }
    if (stageName !== undefined) updateData.stageName = stageName;
    if (bio !== undefined) updateData.bio = bio;
    if (country !== undefined) updateData.country = country;
    if (isVerified !== undefined) updateData.isVerified = isVerified === 'true' || isVerified === true;

    const avatarFile = req.files?.avatar?.[0] || req.file;
    if (avatarFile) {
      updateData.avatar = `/uploads/${avatarFile.filename}`;
    } else if (avatar !== undefined) {
      updateData.avatar = avatar;
    }

    const updated = await artistModel.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: 'Không tìm thấy nghệ sĩ' });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Xóa nghệ sĩ
const deleteArtist = async (req, res) => {
  try {
    await artistModel.findByIdAndDelete(req.params.id);
    res.json({ message: 'Xóa nghệ sĩ thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllArtists,
  getArtistById,
  createArtist,
  updateArtist,
  deleteArtist
};
