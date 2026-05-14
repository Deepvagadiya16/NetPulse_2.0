const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  provider: { type: String, trim: true, default: 'Local ISP' },
  name: { type: String, required: true },
  speed: { type: String, required: true },
  price: { type: Number, required: true },
  duration: { type: Number, required: true }, // in months
  dataLimit: { type: String, default: 'Unlimited' },
  features: [{ type: String }],
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model('Plan', planSchema);
