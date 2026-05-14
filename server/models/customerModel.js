const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  plan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
  status: { type: String, enum: ['Active', 'Expired', 'Suspended'], default: 'Active' },
  installationDate: { type: Date, default: Date.now },
  balance: { type: Number, default: 0 }
}, {
  timestamps: true
});

module.exports = mongoose.model('Customer', customerSchema);
