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
      exerciseId: { type: String, required: true }, 
      sets: { type: Number },
      reps: { type: Number },
      targetWeight: { type: Number },
      restInterval: { type: Number }, 
      duration: { type: Number }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('WorkoutSchedule', workoutScheduleSchema);
