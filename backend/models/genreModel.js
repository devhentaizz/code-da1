const mongoose = require('mongoose');

const genreSchema = new mongoose.Schema({
  _id: { type: String },
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  description: { type: String, default: '' },
  color: { type: String, default: '#3b82f6' },
  coverImage: { type: String, default: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80' }
}, {
  _id: false,
  timestamps: true,
  versionKey: false
});

const genreModel = mongoose.models.genres || mongoose.model('genres', genreSchema);
module.exports = genreModel;
