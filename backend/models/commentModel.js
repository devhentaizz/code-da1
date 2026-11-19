const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  _id: { type: String },
  userId: { type: String, ref: 'users', required: true },
  songId: { type: String, ref: 'songs', required: true },
  content: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
  status: { type: String, default: 'visible' }
}, {
  _id: false,
  timestamps: true,
  versionKey: false
});

const commentModel = mongoose.models.comments || mongoose.model('comments', commentSchema);
module.exports = commentModel;
