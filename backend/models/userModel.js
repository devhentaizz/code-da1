const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  _id: { type: String },
  username: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  avatar: { type: String, default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80' },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  status: { type: String, default: 'active' },
  createdAt: { type: Date, default: Date.now }
}, {
  _id: false,
  timestamps: true,
  versionKey: false
});

const userModel = mongoose.models.users || mongoose.model('users', userSchema);
module.exports = userModel;
