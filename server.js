const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

app.get('/', (req, res) => {
  res.send('👋 Fitness Tracker API Running');
});

const User = require('./models/userProfile');
const Exercise = require('./models/exerciseLibrary');
const WorkoutSchedule = require('./models/workoutSchedule');
const WorkoutLog = require('./models/workoutLog');
const CheckInLog = require('./models/checkInLog');

// User routes
app.post('/api/users', async (req, res) => {
  try {
    const newUser = await User.create(req.body);
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
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

// Exercise routes
app.post('/api/exercises', async (req, res) => {
  try {
    const newExercise = await Exercise.create(req.body);
    res.status(201).json(newExercise);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
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

// Schedule routes
app.post('/api/schedules', async (req, res) => {
  try {
    const newSchedule = await WorkoutSchedule.create(req.body);
    res.status(201).json(newSchedule);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
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
app.get('/api/schedules/:id', async (req, res) => {
  try {
    const schedule = await WorkoutSchedule.findOne({ scheduleId: req.params.id });
    if (!schedule) return res.status(404).json({ error: 'Schedule not found' });
    res.json(schedule);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch schedule' });
  }
});
app.put('/api/schedules/:id', async (req, res) => {
  try {
    const updatedSchedule = await WorkoutSchedule.findOneAndUpdate({ scheduleId: req.params.id }, req.body, { new: true });
    if (!updatedSchedule) return res.status(404).json({ error: 'Schedule not found' });
    res.json(updatedSchedule);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
app.delete('/api/schedules/:id', async (req, res) => {
  try {
    const deleted = await WorkoutSchedule.findOneAndDelete({ scheduleId: req.params.id });
    if (!deleted) return res.status(404).json({ error: 'Schedule not found' });
    res.json({ message: 'Schedule deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting schedule' });
  }
});

// Workout Log routes
app.post('/api/workouts', async (req, res) => {
  try {
    const newLog = await WorkoutLog.create(req.body);
    res.status(201).json(newLog);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
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
app.delete('/api/workouts/:logId', async (req, res) => {
    try {
      const deleted = await WorkoutLog.findOneAndDelete({ logId: req.params.logId });
      if (!deleted) return res.status(404).json({ error: 'Workout log not found' });
      res.json({ message: 'Workout log deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Error deleting workout log' });
    }
});

// Check-in routes
app.post('/api/checkins', async (req, res) => {
  try {
    const newCheckIn = await CheckInLog.create(req.body);
    res.status(201).json(newCheckIn);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
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

app.listen(3000, () => {
  console.log('🚀 Server running on http://localhost:3000' );
});
