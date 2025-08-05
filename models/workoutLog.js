const mongoose = require('mongoose');

const workoutLogSchema = new mongoose.Schema({
  logId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  date: { type: Date, required: true },
  scheduledWorkoutId: { type: String, default: null }, 
  duration: { type: Number }, 
  wasSkipped: { type: Boolean, default: false },
  rpe: { type: Number, min: 1, max: 10 },
  exercises: [
    {
      exerciseId: { type: String, required: true },
      setsPerformed: Number,
      repsPerformed: Number,
      actualWeight: Number,
      restInterval: Number,
      duration: Number,
      notes: String
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('WorkoutLog', workoutLogSchema);
