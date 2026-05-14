const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  technicianId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  issue: { type: String, required: true, trim: true },
  category: {
    type: String,
    enum: ['Connection', 'Hardware', 'Billing', 'Other'],
    default: 'Connection',
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
    default: 'Open',
  },
  priority: {
    type: String,
    enum: ['Low', 'Normal', 'High', 'Urgent'],
    default: 'Normal',
  },
  resolvedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

ticketSchema.pre('validate', function syncCustomerAliases() {
  if (!this.customerId && this.userId) {
    this.customerId = this.userId;
  }

  if (!this.userId && this.customerId) {
    this.userId = this.customerId;
  }
});

module.exports = mongoose.model('Ticket', ticketSchema);
