const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  age: Number,
  height: Number,
  weight: Number,
  experienceLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced']
  }
}, { timestamps: true });

module.exports = mongoose.model('UserProfile', userProfileSchema);
