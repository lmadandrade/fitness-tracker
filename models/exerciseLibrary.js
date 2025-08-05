const mongoose = require('mongoose');

const exerciseLibrarySchema = new mongoose.Schema({
  exerciseId: { type: String, required: true, unique: true },
  userId: { type: String, default: null }, 
  name: { type: String, required: true },
  muscleGroup: { type: String, required: true }, 
  equipment: { type: String, required: true },  
  type: {
    type: String,
    enum: ['compound', 'isolation', 'cardio', 'stretch'],
    required: true
  },
  description: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('ExerciseLibrary', exerciseLibrarySchema);
