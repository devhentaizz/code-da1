const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  _id: { type: String },
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, trim: true },
  artistIds: [{ type: String, ref: 'artists' }],
  albumId: { type: String, ref: 'albums' },
  genreIds: [{ type: String, ref: 'genres' }],
  audioUrl: { type: String, default: '' },
  coverImage: { type: String, default: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80' },
  youtubeId: { type: String, default: '' },
  duration: { type: Number, default: 0 },
  releaseDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
  playCount: { type: Number, default: 0 },
  status: { type: String, default: 'published' },
  createdAt: { type: Date, default: Date.now }
}, {
  _id: false,
  timestamps: true,
  versionKey: false
});

const songModel = mongoose.models.songs || mongoose.model('songs', songSchema);
module.exports = songModel;
