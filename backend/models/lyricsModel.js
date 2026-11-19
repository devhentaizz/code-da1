const mongoose = require('mongoose');

const lyricsSchema = new mongoose.Schema({
  _id: { type: String },
  songId: { type: String, ref: 'songs', required: true },
  language: { type: String, default: 'vi' },
  synced: { type: Boolean, default: false },
  content: { type: String, default: '' },
  lines: [{
    time: { type: Number },
    text: { type: String }
  }]
}, {
  _id: false,
  collection: 'lyrics',
  timestamps: true,
  versionKey: false
});

const lyricsModel = mongoose.models.lyrics || mongoose.model('lyrics', lyricsSchema);
module.exports = lyricsModel;

