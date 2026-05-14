const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['Admin', 'Technician', 'Support'], required: true },
  department: { type: String, default: 'General' },
  phone: { type: String },
  activeTasks: { type: Number, default: 0 },
  status: { type: String, enum: ['On-Duty', 'Off-Duty', 'On-Leave'], default: 'On-Duty' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Employee', employeeSchema);
