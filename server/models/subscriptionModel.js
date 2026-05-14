const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', required: true },
  status: { type: String, enum: ['Pending', 'Active', 'Expired'], default: 'Pending' },
  requestDate: { type: Date, default: Date.now },
  startDate: { type: Date },
  endDate: { type: Date },
  amount: { type: Number, required: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Subscription', subscriptionSchema);