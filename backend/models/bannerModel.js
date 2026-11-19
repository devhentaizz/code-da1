const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  _id: { type: String },
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  image: { type: String, required: true },
  link: { type: String, default: '#' },
  songId: { type: String, default: null },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, {
  _id: false,
  timestamps: true,
  versionKey: false
});

const bannerModel = mongoose.models.banners || mongoose.model('banners', bannerSchema);
module.exports = bannerModel;

