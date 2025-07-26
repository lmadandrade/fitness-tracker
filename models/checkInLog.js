const mongoose = require('mongoose');

const checkInLogSchema = new mongoose.Schema({
  checkInId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  date: { type: Date, required: true },
  energyLevel: { type: Number, min: 1, max: 10 },
  mood: { type: String },
  bodyWeight: Number,
  muscleMeasurements: {
    chest: Number,
    waist: Number,
    arms: Number,
    thighs: Number,
    shoulders: Number,
    calves: Number
  },
  progressPhotoUrl: { type: String, default: '' },
  note: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('CheckInLog', checkInLogSchema);
