const mongoose = require('mongoose'); // Import Mongoose library
const bcrypt = require('bcryptjs'); // Import bcrypt for password hashing

/**
 * User Schema: Defines what a "User" looks like in the database
 */
const userSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Full Name
  email: { type: String, required: true, unique: true }, // Login Email (Must be unique)
  password: { type: String, required: true }, // Hashed Password
  role: { 
    type: String, 
    enum: ['Admin', 'Customer', 'Technician'], // Allowed roles only
    default: 'Customer' 
  },
  phone: { type: String }, // Contact Number
  address: { type: String }, // Home Address
  location: { type: String }, // Specific Branch/Area
  department: { type: String }, // Professional Department
  planId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' }, // Link to their Internet Plan
  planValidity: { type: Date }, // Plan expiry date
  status: { 
    type: String, 
    enum: ['Active', 'Pending', 'Suspended'], 
    default: 'Active' 
  },
  isActive: { type: Boolean, default: true }, // Is the account active?
  createdAt: { type: Date, default: Date.now } // Auto-timestamp
});

/**
 * DATABASE HOOK: Automatically hash the password BEFORE saving to Database
 */
userSchema.pre('save', async function(next) {
  // Only hash if the password was changed (or is new)
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10); // Generate security salt
  this.password = await bcrypt.hash(this.password, salt); // Hash the password
});

/**
 * HELPER METHOD: Check if the entered password matches the hashed one in DB
 */
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema); // Export the Model as 'User'
