const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());


// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Basic route
app.get('/', (req, res) => {
  res.send('👋 Fitness Tracker API Running');
});

// Import models
const User = require('./models/userProfile');
const Exercise = require('./models/exerciseLibrary');
const WorkoutSchedule = require('./models/workoutSchedule');
const WorkoutLog = require('./models/workoutLog');
const CheckInLog = require('./models/checkInLog');

// Route to create a user
app.post('/api/users', async (req, res) => {
  try {
    const newUser = await User.create(req.body);
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Route to create an exercise
app.post('/api/exercises', async (req, res) => {
  try {
    const newExercise = await Exercise.create(req.body);
    res.status(201).json(newExercise);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Route to create a workout schedule
app.post('/api/schedules', async (req, res) => {
  try {
    const newSchedule = await WorkoutSchedule.create(req.body);
    res.status(201).json(newSchedule);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Route to create a workout log
app.post('/api/workouts', async (req, res) => {
  try {
    const newLog = await WorkoutLog.create(req.body);
    res.status(201).json(newLog);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Route to create a check-in log
app.post('/api/checkins', async (req, res) => {
  try {
    const newCheckIn = await CheckInLog.create(req.body);
    res.status(201).json(newCheckIn);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Start server
app.listen(3000, () => {
  console.log('🚀 Server running on http://localhost:3000');
});
