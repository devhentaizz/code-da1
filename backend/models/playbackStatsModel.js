const mongoose = require('mongoose');

const playbackStatsSchema = new mongoose.Schema({
  _id: { type: String },
  songId: { type: String, ref: 'songs', required: true },
  date: { type: String, required: true },
  playCount: { type: Number, default: 0 },
  uniqueListeners: { type: Number, default: 0 }
}, {
  _id: false,
  collection: 'playback_stats',
  timestamps: true,
  versionKey: false
});

const playbackStatsModel = mongoose.models.playback_stats || mongoose.model('playback_stats', playbackStatsSchema);
module.exports = playbackStatsModel;

