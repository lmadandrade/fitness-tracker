// workoutLog.js
// Simplified workout logging script.
// Loads user‑specific exercises and schedules, displays scheduled
// exercises next to manual performance inputs, allows adding manual
// exercises, and submits the combined data to the API.

document.addEventListener('DOMContentLoaded', () => {
  // Verify user is logged in
  const userId = localStorage.getItem('userId');
  if (!userId) {
    alert('You must be logged in to log a workout.');
    window.location.href = 'login.html';
    return;
  }

  setToday();
  loadExercises(userId);
  loadSchedules(userId);
  setupRPE();
  setupSkipToggle();
  
  const scheduleSelect = document.getElementById('scheduledWorkoutId');
  if (scheduleSelect) scheduleSelect.addEventListener('change', handleScheduleChange);

  const logForm = document.getElementById('logForm');
  if (logForm) logForm.addEventListener('submit', handleSubmit);

  // Make functions available globally if needed
  window.addExercise = addExercise;
  window.resetForm = resetForm;
});

let exerciseOptions = [];

function setToday() {
  const today = new Date().toISOString().split('T')[0];
  const dateEl = document.getElementById('date');
  if (dateEl) dateEl.value = today;
}

async function loadExercises(userId) {
  try {
    const res = await fetch(`http://localhost:3000/api/exercises?userId=${userId}`);
    const data = await res.json();
    exerciseOptions = data.map(ex => ({ id: ex.exerciseId || ex._id, name: ex.name }));
  } catch (err) {
    const messageEl = document.getElementById('message');
    if (messageEl) messageEl.textContent = 'Failed to load exercises.';
  }
}

async function loadSchedules(userId) {
  try {
    const res = await fetch(`http://localhost:3000/api/schedules?userId=${userId}`);
    const data = await res.json();
    const select = document.getElementById('scheduledWorkoutId');
    if (!select) return;
    select.innerHTML = '<option value="">Select a schedule</option>';
    data.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.scheduleId;
      opt.textContent = `${s.dayOfWeek} - ${s.scheduleTitle || 'No title'}`;
      select.appendChild(opt);
    });
  } catch (err) {
    const messageEl = document.getElementById('message');
    if (messageEl) messageEl.textContent = 'Failed to load schedules.';
  }
}

async function handleScheduleChange(e) {
  const scheduleId = e.target.value;
  const container = document.getElementById('scheduledExercises');
  container.innerHTML = '';
  if (!scheduleId) return;
  try {
    const res = await fetch(`http://localhost:3000/api/schedules/${scheduleId}`);
    const schedule = await res.json();
    schedule.exercises.forEach(item => {
      const entry = document.createElement('div');
      entry.classList.add('exercise-entry');
      const exName = exerciseOptions.find(ex => ex.id === item.exerciseId)?.name || item.exerciseId;
      entry.innerHTML = `
        <div><strong>${exName}</strong></div>
        <div>Sets: ${item.sets}</div>
        <div>Reps: ${item.reps}</div>
        <div>Target Weight: ${item.targetWeight}</div>
        <div>Rest: ${item.restInterval || 0}</div>
        <div>Duration: ${item.duration || 0}</div>
      `;
      container.appendChild(entry);
    });
  } catch (err) {
    container.textContent = 'Failed to load schedule.';
  }
}

function addExercise() {
  const container = document.getElementById('manualExercises');
  const div = document.createElement('div');
  div.classList.add('exercise-entry');
  div.innerHTML = `
    <select name="manualExerciseId" required>
      <option value="">Select Exercise</option>
      ${exerciseOptions.map(opt => `<option value="${opt.id}">${opt.name}</option>`).join('')}
    </select>
    <input type="number" name="manualSets" placeholder="Sets" required />
    <input type="number" name="manualReps" placeholder="Reps" required />
    <input type="number" name="manualWeight" placeholder="Weight" required />
    <input type="number" name="manualRest" placeholder="Rest" />
    <input type="number" name="manualDuration" placeholder="Duration" />
  `;
  container.appendChild(div);
}

function resetForm() {
  document.getElementById('logForm').reset();
  document.getElementById('manualExercises').innerHTML = '';
  document.getElementById('scheduledExercises').innerHTML = '';
  setToday();
}

function setupRPE() {
  const rpe = document.getElementById('rpe');
  const display = document.getElementById('rpeValue');
  if (rpe && display) {
    rpe.addEventListener('input', () => {
      display.textContent = rpe.value;
    });
  }
}

function setupSkipToggle() {
  const skip = document.getElementById('skip');
  const sections = document.querySelectorAll('.skip-hide');
  if (skip) {
    skip.addEventListener('change', () => {
      sections.forEach(sec => {
        sec.style.display = skip.checked ? 'none' : '';
      });
    });
  }
}

async function handleSubmit(e) {
  e.preventDefault();
  const userId = localStorage.getItem('userId');
  if (!userId) {
    document.getElementById('message').textContent = 'You must be logged in to log a workout.';
    return;
  }

  const form = e.target;
  const data = new FormData(form);
  const log = {
    logId: 'w' + Date.now(),
    userId,
    date: data.get('date'),
    scheduledWorkoutId: data.get('scheduledWorkoutId') || '',
    duration: Number(data.get('duration')) || 0,
    wasSkipped: data.get('skip') === 'on',
    rpe: Number(data.get('rpe')) || 0,
    exercises: []
  };

  // Add manual exercise entries
  const manualContainers = document.querySelectorAll('#manualExercises .exercise-entry');
  manualContainers.forEach(div => {
    const values = div.querySelectorAll('input, select');
    const [idEl, setsEl, repsEl, weightEl, restEl, durationEl] = values;
    if (idEl.value && setsEl.value && repsEl.value && weightEl.value) {
      log.exercises.push({
        exerciseId: idEl.value,
        setsPerformed: Number(setsEl.value),
        repsPerformed: Number(repsEl.value),
        actualWeight: Number(weightEl.value),
        restInterval: Number(restEl.value) || 0,
        duration: Number(durationEl.value) || 0
      });
    }
  });

  try {
    const response = await fetch('http://localhost:3000/api/workouts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(log)
    });
    const result = await response.json();
    if (response.ok) {
      document.getElementById('message').textContent = 'Workout logged successfully!';
      resetForm();
    } else {
      document.getElementById('message').textContent = `Error: ${result.error}`;
    }
  } catch (err) {
    document.getElementById('message').textContent = 'Failed to connect to server.';
  }
}
