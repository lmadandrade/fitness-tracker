document.addEventListener('DOMContentLoaded', () => {
  populateUsers();
  populateExercises();
  populateSchedules();
  setToday();
  handleSkipToggle();
});

function setToday() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('date').value = today;
}

async function populateUsers() {
  const userSelect = document.getElementById('userName'); // dropdown for names
  const userIdHidden = document.getElementById('userIdHidden'); // hidden input

  const res = await fetch('http://localhost:3000/api/users');
  const users = await res.json();

  users.forEach(user => {
    const option = document.createElement('option');
    option.value = user._id;
    option.textContent = user.name;
    userSelect.appendChild(option);
  });

  // When a user is selected, store ID in hidden field
  userSelect.addEventListener('change', () => {
    userIdHidden.value = userSelect.value;
  });
}

async function populateExercises() {
  const res = await fetch('http://localhost:3000/api/exercises');
  const exercises = await res.json();
  window.exerciseOptions = exercises.map(ex => ({ id: ex._id, name: ex.name }));
}

async function populateSchedules() {
  const scheduleSelect = document.getElementById('scheduledWorkoutId');
  const res = await fetch('http://localhost:3000/api/schedules');
  const schedules = await res.json();

  schedules.forEach(schedule => {
    const option = document.createElement('option');
    option.value = schedule.scheduleId;
    option.textContent = `${schedule.scheduleTitle} (${schedule.dayOfWeek})`;
    scheduleSelect.appendChild(option);
  });

  scheduleSelect.addEventListener('change', handleScheduleSelection);
}

let currentScheduledExercises = [];
let currentIndex = 0;
const collectedExercises = [];

async function handleScheduleSelection() {
  const selectedId = this.value;
  currentScheduledExercises = [];
  currentIndex = 0;
  collectedExercises.length = 0;
  document.getElementById('scheduledDetails').innerHTML = '';
  document.getElementById('exerciseContainer').innerHTML = '';
  if (!selectedId) return;

  const res = await fetch(`http://localhost:3000/api/schedules/${selectedId}`);
  const schedule = await res.json();
  currentScheduledExercises = schedule.exercises;
  showNextScheduledExercise();
}

function showNextScheduledExercise() {
  const scheduledDiv = document.getElementById('scheduledDetails');
  const actualContainer = document.getElementById('exerciseContainer');
  scheduledDiv.innerHTML = '';
  actualContainer.innerHTML = '';

  if (currentIndex >= currentScheduledExercises.length) {
    scheduledDiv.innerHTML = '<p>✅ All scheduled exercises reviewed.</p>';
    actualContainer.innerHTML = '<p>You can now submit your workout below.</p>';
    return;
  }

  const ex = currentScheduledExercises[currentIndex];

  const exerciseInfo = window.exerciseOptions.find(opt => opt.id === ex.exerciseId);
  const exerciseName = exerciseInfo ? exerciseInfo.name : `Unknown (${ex.exerciseId})`;

  const scheduledCard = `
    <p><strong>Exercise:</strong> ${exerciseName}</p>
    <p><strong>Sets:</strong> ${ex.sets}</p>
    <p><strong>Reps:</strong> ${ex.reps}</p>
    <p><strong>Target Weight:</strong> ${ex.targetWeight}</p>
    <p><strong>Rest Interval:</strong> ${ex.restInterval}</p>
    <p><strong>Duration:</strong> ${ex.duration}</p>
  `;
  scheduledDiv.innerHTML = scheduledCard;

  const actualCard = document.createElement('div');
  actualCard.classList.add('exercise-entry');
  actualCard.innerHTML = `
    <input type="hidden" name="exerciseId" value="${ex.exerciseId}" />
    <label>Sets</label><input type="number" name="setsPerformed" required />
    <label>Reps</label><input type="number" name="repsPerformed" required />
    <label>Weight (kg)</label><input type="number" name="actualWeight" required />
    <label>Rest (sec)</label><input type="number" name="restInterval" />
    <label>Duration (min)</label><input type="number" name="exerciseDuration" />
    <label>Notes</label><input type="text" name="notes" />
    <button type="button" onclick="confirmExercise()">Confirm Exercise</button>
    <button type="button" onclick="skipExercise()">Skip Exercise</button>
  `;
  actualContainer.appendChild(actualCard);
}

function confirmExercise() {
  const entry = document.querySelector('.exercise-entry');
  const inputs = entry.querySelectorAll('input');
  const obj = {};

  inputs.forEach(input => {
    obj[input.name] = input.type === 'number' ? Number(input.value) : input.value;
  });

  collectedExercises.push(obj);
  currentIndex++;
  showNextScheduledExercise();
}

function skipExercise() {
  currentIndex++;
  showNextScheduledExercise();
}

function handleSkipToggle() {
  const wasSkipped = document.getElementById('wasSkipped');
  const exerciseSection = document.querySelector('.exercise-layout');

  wasSkipped.addEventListener('change', () => {
    if (wasSkipped.value === 'true') {
      exerciseSection.style.display = 'none';
    } else {
      exerciseSection.style.display = '';
    }
  });
}

function resetForm() {
  document.getElementById('logForm').reset();
  document.getElementById('exerciseContainer').innerHTML = '';
  document.getElementById('scheduledDetails').innerHTML = '';
  document.getElementById('message').textContent = '';
  collectedExercises.length = 0;
  currentIndex = 0;
}

document.getElementById('logForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const formData = new FormData(this);
  const data = Object.fromEntries(formData.entries());

  const logData = {
    logId: 'log' + Date.now(),
    userId: data.userId,
    date: data.date,
    scheduledWorkoutId: data.scheduledWorkoutId || undefined,
    startTime: data.startTime,
    endTime: data.endTime,
    wasSkipped: data.wasSkipped === 'true',
    rpe: Number(data.rpe),
    exercises: collectedExercises
  };

  try {
    const response = await fetch('http://localhost:3000/api/workouts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logData)
    });

    const result = await response.json();

    if (response.ok) {
      document.getElementById('message').textContent = '✅ Workout logged!';
      resetForm();
    } else {
      document.getElementById('message').textContent = `❌ Error: ${result.error}`;
    }
  } catch (err) {
    document.getElementById('message').textContent = '❌ Failed to connect to server.';
  }
});
