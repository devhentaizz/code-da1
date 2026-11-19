const bannerModel = require('../models/bannerModel');

// Lấy danh sách banner đang hoạt động (public)
const getActiveBanners = async (req, res) => {
  try {
    const banners = await bannerModel.find({ isActive: true }).sort({ order: 1 });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Lấy tất cả banners
const getAllBanners = async (req, res) => {
  try {
    const banners = await bannerModel.find().sort({ order: 1 });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tạo banner
const createBanner = async (req, res) => {
  try {
    const { title, subtitle, link, songId, order, isActive } = req.body;
    let image = req.body.image;

    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    }

    if (!image) {
      return res.status(400).json({ message: 'Ảnh banner là bắt buộc' });
    }

    // Tạo _id tự động
    const count = await bannerModel.countDocuments();
    const newId = `banner_${String(count + 1).padStart(3, '0')}`;

    const newBanner = new bannerModel({
      _id: newId,
      title,
      subtitle: subtitle || '',
      image,
      link: link || '#',
      songId: songId || null,
      order: Number(order) || 0,
      isActive: isActive !== undefined ? (isActive === 'true' || isActive === true) : true
    });

    const saved = await newBanner.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật banner
const updateBanner = async (req, res) => {
  try {
    const { title, subtitle, link, songId, order, isActive } = req.body;
    const updateData = {};

    if (title) updateData.title = title;
    if (subtitle !== undefined) updateData.subtitle = subtitle;
    if (link) updateData.link = link;
    if (songId !== undefined) updateData.songId = songId || null;
    if (order !== undefined) updateData.order = Number(order);
    if (isActive !== undefined) updateData.isActive = isActive === 'true' || isActive === true;

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    } else if (req.body.image) {
      updateData.image = req.body.image;
    }

    const updated = await bannerModel.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: 'Không tìm thấy banner' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Xóa banner
const deleteBanner = async (req, res) => {
  try {
    const deleted = await bannerModel.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Không tìm thấy banner' });
    res.json({ message: 'Xóa banner thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getActiveBanners,
  getAllBanners,
  createBanner,
  updateBanner,
  deleteBanner
};
