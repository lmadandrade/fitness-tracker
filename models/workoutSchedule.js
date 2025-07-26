const mongoose = require('mongoose');

const workoutScheduleSchema = new mongoose.Schema({
  scheduleId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  dayOfWeek: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true
  },
  scheduleTitle: { type: String, default: '' },
  exercises: [
    {
      exerciseId: { type: String, required: true }, // reference to ExerciseLibrary
      sets: { type: Number },
      reps: { type: Number },
      targetWeight: { type: Number },
      restInterval: { type: Number }, // in seconds
      duration: { type: Number } // in minutes (used for cardio)
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('WorkoutSchedule', workoutScheduleSchema);
