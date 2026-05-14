const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, required: true }, // Plan/Item description
  amount: { type: Number, required: true },
  billingDate: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  status: { type: String, enum: ['Paid', 'Unpaid', 'Overdue'], default: 'Unpaid' },
  paymentMethod: { type: String },
  transactionId: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model('Bill', billSchema);
