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

// Create a user
app.post('/api/users', async (req, res) => {
  try {
    const newUser = await User.create(req.body);
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user by userId
app.get('/api/users/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user
app.put('/api/users/update', async (req, res) => {
  const { userId, ...updateData } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId is required for update' });
  try {
    const updatedUser = await User.findOneAndUpdate({ userId }, updateData, { new: true });
    if (!updatedUser) return res.status(404).json({ error: 'User not found' });
    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Create exercise
app.post('/api/exercises', async (req, res) => {
  try {
    const newExercise = await Exercise.create(req.body);
    res.status(201).json(newExercise);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all exercises for a user
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

// ✅ Update exercise by exerciseId
app.put('/api/exercises/:exerciseId', async (req, res) => {
  const { exerciseId } = req.params;
  try {
    const updatedExercise = await Exercise.findOneAndUpdate({ exerciseId }, req.body, { new: true });
    if (!updatedExercise) return res.status(404).json({ error: 'Exercise not found' });
    res.json(updatedExercise);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update exercise' });
  }
});

// ✅ Delete exercise by exerciseId
app.delete('/api/exercises/:exerciseId', async (req, res) => {
  const { exerciseId } = req.params;
  try {
    const deleted = await Exercise.findOneAndDelete({ exerciseId });
    if (!deleted) return res.status(404).json({ error: 'Exercise not found' });
    res.json({ message: 'Exercise deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting exercise' });
  }
});

// Create workout schedule
app.post('/api/schedules', async (req, res) => {
  try {
    const newSchedule = await WorkoutSchedule.create(req.body);
    res.status(201).json(newSchedule);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all workout schedules
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

// Get schedule by scheduleId
app.get('/api/schedules/:id', async (req, res) => {
  try {
    const schedule = await WorkoutSchedule.findOne({ scheduleId: req.params.id });
    if (!schedule) return res.status(404).json({ error: 'Schedule not found' });
    res.json(schedule);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch schedule' });
  }
});

// Create workout log
app.post('/api/workouts', async (req, res) => {
  try {
    const newLog = await WorkoutLog.create(req.body);
    res.status(201).json(newLog);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all workout logs
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

// Create check-in log
app.post('/api/checkins', async (req, res) => {
  try {
    const newCheckIn = await CheckInLog.create(req.body);
    res.status(201).json(newCheckIn);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get check-in logs
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

// Start server
app.listen(3000, () => {
  console.log('🚀 Server running on http://localhost:3000');
});
