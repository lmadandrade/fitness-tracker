
// this file connects everything: db, routes and stuff

const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ Mongo error:', err));

// test route
app.get('/', (req, res) => {
  res.send('Fitness Tracker API Running');
});

// Getting all models
const User = require('./models/userProfile');
const Exercise = require('./models/exerciseLibrary');
const WorkoutSchedule = require('./models/workoutSchedule');
const WorkoutLog = require('./models/workoutLog');
const CheckInLog = require('./models/checkInLog');


// Login - Verify Email and password in DB
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      email: { $regex: new RegExp(`^${email}$`, 'i') }, // ignore case
      password
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    res.json({ userId: user.userId });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Something went wrong while logging in.' });
  }
});


// user routes

// create new user
app.post('/api/users', async (req, res) => {
  try {
    const newUser = await User.create(req.body);
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// get all users - useful for validation
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch users' });
  }
});

// get single user by userId
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

  // update a user info

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


// EXERCISE ROUTES

// add new exercise
app.post('/api/exercises', async (req, res) => {
  try {
    const newExercise = await Exercise.create(req.body);
    res.status(201).json(newExercise);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// get all exercises by userid
app.get('/api/exercises', async (req, res) => {
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });
  try {
    const exercises = await Exercise.find({ userId });
    res.json(exercises);
  } catch (err) {
    res.status(500).json({ error: 'Error loading exercises' });
  }
});

// Update exercise
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

// Delete exercise
app.delete('/api/exercises/:exerciseId', async (req, res) => {
  const { exerciseId } = req.params;
  try {
    const deleted = await Exercise.findOneAndDelete({ exerciseId });
    if (!deleted) return res.status(404).json({ error: 'Exercise not found' });
    res.json({ message: 'Exercise deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Could not delete exercise' });
  }
});


// SCHEDULE ROUTES
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
    res.status(500).json({ error: 'Could not fetch schedules' });
  }
});

app.get('/api/schedules/:id', async (req, res) => {
  try {
    const schedule = await WorkoutSchedule.findOne({ scheduleId: req.params.id });
    if (!schedule) return res.status(404).json({ error: 'Schedule not found' });
    res.json(schedule);
  } catch (err) {
    res.status(500).json({ error: 'Fetch error' });
  }
});

app.put('/api/schedules/:id', async (req, res) => {
  try {
    const updated = await WorkoutSchedule.findOneAndUpdate({ scheduleId: req.params.id }, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/schedules/:id', async (req, res) => {
  try {
    const deleted = await WorkoutSchedule.findOneAndDelete({ scheduleId: req.params.id });
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Schedule deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Delete error' });
  }
});


// WORKOUT LOG ROUTES
app.post('/api/workouts', async (req, res) => {
  try {
    const newWorkout = await WorkoutLog.create(req.body);
    res.status(201).json(newWorkout);
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
    res.status(500).json({ error: 'Workout logs not found' });
  }
});

app.delete('/api/workouts/:logId', async (req, res) => {
  try {
    const deleted = await WorkoutLog.findOneAndDelete({ logId: req.params.logId });
    if (!deleted) return res.status(404).json({ error: 'Workout log not found' });
    res.json({ message: 'Workout log deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Delete log error' });
  }
});


// CHECKIN ROUTES
app.post('/api/checkins', async (req, res) => {
  try {
    const newCheck = await CheckInLog.create(req.body);
    res.status(201).json(newCheck);
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
    res.status(500).json({ error: 'Could not get check-ins' });
  }
});


// Start the backend
app.listen(3000, () => {
  console.log('Server is live on http://localhost:3000');
});
