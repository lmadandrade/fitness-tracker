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

// Route to get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find(); // Fetch all users from the database
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
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

// Route to get all exercises
app.get('/api/exercises', async (req, res) => {
  try {
    const exercises = await Exercise.find();
    res.json(exercises);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch exercises' });
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



// Route to get all workout schedules
app.get('/api/schedules', async (req, res) => {
  try {
    const schedules = await WorkoutSchedule.find();
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch workout schedules' });
  }
});

app.get('/api/schedules/:id', async (req, res) => {
  try {
    const schedule = await WorkoutSchedule.findOne({ scheduleId: req.params.id });
    if (!schedule) return res.status(404).json({ error: 'Schedule not found' });
    res.json(schedule);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch schedule' });
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


app.get('/api/workouts', async (req, res) => {
  try {
    const logs = await WorkoutLog.find();
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch workout logs' });
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

// Route to get all check-in logs
app.get('/api/checkins', async (req, res) => {
  try {
    const checkIns = await CheckInLog.find(); // Fetch all check-in entries
    res.json(checkIns);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch check-in logs' });
  }
});


// Start server
app.listen(3000, () => {
  console.log('🚀 Server running on http://localhost:3000');
});
