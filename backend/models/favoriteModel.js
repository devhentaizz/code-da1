const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  _id: { type: String },
  userId: { type: String, ref: 'users', required: true },
  songId: { type: String, ref: 'songs', required: true },
  createdAt: { type: Date, default: Date.now }
}, {
  _id: false,
  timestamps: true,
  versionKey: false
});

const favoriteModel = mongoose.models.favorites || mongoose.model('favorites', favoriteSchema);
module.exports = favoriteModel;

