const mongoose = require('mongoose');

const listeningHistorySchema = new mongoose.Schema({
  _id: { type: String },
  userId: { type: String, ref: 'users', required: true },
  songId: { type: String, ref: 'songs', required: true },
  playedAt: { type: Date, default: Date.now },
  progressSeconds: { type: Number, default: 0 },
  completed: { type: Boolean, default: false }
}, {
  _id: false,
  collection: 'listening_history',
  timestamps: true,
  versionKey: false
});

const listeningHistoryModel = mongoose.models.listening_history || mongoose.model('listening_history', listeningHistorySchema);
module.exports = listeningHistoryModel;

