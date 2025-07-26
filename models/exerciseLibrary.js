const mongoose = require('mongoose');

const exerciseLibrarySchema = new mongoose.Schema({
  exerciseId: { type: String, required: true, unique: true },
  userId: { type: String, default: null }, // null for preloaded
  name: { type: String, required: true },
  muscleGroup: { type: String, required: true }, // e.g., chest, legs
  equipment: { type: String, required: true },   // e.g., barbell, dumbbell
  type: {
    type: String,
    enum: ['compound', 'isolation', 'cardio', 'stretch'],
    required: true
  },
  description: { type: String, default: '' },
  tags: [String] // e.g., ["strength", "mobility"]
}, { timestamps: true });

module.exports = mongoose.model('ExerciseLibrary', exerciseLibrarySchema);
