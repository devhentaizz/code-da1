const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
  _id: { type: String },
  name: { type: String, required: true, trim: true },
  userId: { type: String, ref: 'users', required: true },
  description: { type: String, default: '' },
  coverImage: { type: String, default: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80' },
  songIds: [{ type: String, ref: 'songs' }],
  visibility: { type: String, enum: ['public', 'private'], default: 'public' },
  createdAt: { type: Date, default: Date.now }
}, {
  _id: false,
  timestamps: true,
  versionKey: false
});

const playlistModel = mongoose.models.playlists || mongoose.model('playlists', playlistSchema);
module.exports = playlistModel;
