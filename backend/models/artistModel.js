const mongoose = require('mongoose');

const artistSchema = new mongoose.Schema({
  _id: { type: String },
  name: { type: String, required: true, trim: true },
  stageName: { type: String, trim: true, default: '' },
  slug: { type: String, required: true, trim: true },
  avatar: { type: String, default: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80' },
  bio: { type: String, default: '' },
  country: { type: String, default: 'Vietnam' },
  isVerified: { type: Boolean, default: false }
}, {
  _id: false,
  timestamps: true,
  versionKey: false
});

const artistModel = mongoose.models.artists || mongoose.model('artists', artistSchema);
module.exports = artistModel;
