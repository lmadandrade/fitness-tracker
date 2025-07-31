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
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// ✅ Route to get a single user by userId (for auto-filling settings)
app.get('/api/users/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Route to update a user profile by userId
app.put('/api/users/update', async (req, res) => {
  const { userId, ...updateData } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'userId is required for update' });
  }
  try {
    const updatedUser = await User.findOneAndUpdate({ userId }, updateData, { new: true });
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(updatedUser);
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

// Route to get all exercises for a user
app.get('/api/exercises', async (req, res) => {
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });
  try {
    const exercises = await Exercise.find({ userId });
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

// Route to get all workout schedules for a user
app.get('/api/schedules', async (req, res) => {
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });
  try {
    const schedules = await WorkoutSchedule.find({ userId });
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch workout schedules' });
  }
});

// Route to get a single workout schedule by scheduleId
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

// Route to get all workout logs for a user
app.get('/api/workouts', async (req, res) => {
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });
  try {
    const logs = await WorkoutLog.find({ userId });
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

// Route to get all check-in logs for a user
app.get('/api/checkins', async (req, res) => {
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });
  try {
    const checkIns = await CheckInLog.find({ userId });
    res.json(checkIns);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch check-in logs' });
  }
});

// Start the server
app.listen(3000, () => {
  console.log('🚀 Server running on http://localhost:3000');
});
