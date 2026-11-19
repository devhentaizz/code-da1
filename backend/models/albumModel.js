const mongoose = require('mongoose');

const albumSchema = new mongoose.Schema({
  _id: { type: String },
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, trim: true },
  artistIds: [{ type: String, ref: 'artists' }],
  coverImage: { type: String, default: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80' },
  releaseDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
  description: { type: String, default: '' }
}, {
  _id: false,
  timestamps: true,
  versionKey: false
});

const albumModel = mongoose.models.albums || mongoose.model('albums', albumSchema);
module.exports = albumModel;
