const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  _id: { type: String },
  userId: { type: String, ref: 'users', required: true },
  plan: { type: String, enum: ['free', 'premium'], default: 'free' },
  status: { type: String, default: 'active' },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, default: null },
  provider: { type: String, default: null }
}, {
  _id: false,
  timestamps: true,
  versionKey: false
});

const subscriptionModel = mongoose.models.subscriptions || mongoose.model('subscriptions', subscriptionSchema);
module.exports = subscriptionModel;

