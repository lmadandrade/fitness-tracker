// workoutSchedule.js
// Handles creating a workout schedule with dynamic exercise blocks
// Exercises are fetched based on the logged-in user, and each block includes
// fields for sets, reps, weight, rest, and duration.

const userId = localStorage.getItem('userId');
if (!userId) {
  alert('You must be logged in to view this page.');
  window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', () => {
  fetchExercises();
  addExerciseBlock();
});

let exerciseOptions = [];

// Fetch exercises for the logged-in user and update dropdowns
async function fetchExercises() {
  try {
    const response = await fetch(`http://localhost:3000/api/exercises?userId=${userId}`);
    const data = await response.json();
    exerciseOptions = data.map(ex => ({
      id: ex.exerciseId || ex._id,
      name: ex.name
    }));
    updateAllDropdowns();
  } catch (err) {
    document.getElementById('message').textContent = 'Failed to fetch exercises.';
  }
}

// Populate all exercise dropdowns with current options
function updateAllDropdowns() {
  const selects = document.querySelectorAll('.exercise-select');
  selects.forEach(select => {
    select.innerHTML = '<option value="">Select Exercise</option>';
    exerciseOptions.forEach(ex => {
      const option = document.createElement('option');
      option.value = ex.id;
      option.textContent = ex.name;
      select.appendChild(option);
    });
  });
}

// Dynamically add a new exercise block
function addExerciseBlock() {
  const container = document.getElementById('exerciseList');
  const block = document.createElement('div');
  block.classList.add('exercise-block');
  block.innerHTML = `
    <div class="form-grid">
      <div class="form-group">
        <label>Exercise</label>
        <select class="exercise-select" required name="exerciseId">
          <option value="">Select Exercise</option>
        </select>
      </div>
      <div class="form-group">
        <label>Sets</label>
        <input type="number" name="sets" required />
      </div>
      <div class="form-group">
        <label>Reps</label>
        <input type="number" name="reps" required />
      </div>
      <div class="form-group">
        <label>Target Weight (kg)</label>
        <input type="number" name="targetWeight" required />
      </div>
      <div class="form-group">
        <label>Rest Interval (sec)</label>
        <input type="number" name="restInterval" />
      </div>
      <div class="form-group">
        <label>Duration (min)</label>
        <input type="number" name="duration" />
      </div>
    </div>
    <hr />
  `;
  container.appendChild(block);
  updateAllDropdowns();
}

// Handle form submission and send schedule to the server
document.getElementById('scheduleForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  const exerciseBlocks = form.querySelectorAll('.exercise-block');
  const exercises = [];

  for (const block of exerciseBlocks) {
    const exerciseId = block.querySelector('[name="exerciseId"]').value;
    const sets = Number(block.querySelector('[name="sets"]').value);
    const reps = Number(block.querySelector('[name="reps"]').value);
    const targetWeight = Number(block.querySelector('[name="targetWeight"]').value);
    const restInterval = Number(block.querySelector('[name="restInterval"]').value) || 0;
    const duration = Number(block.querySelector('[name="duration"]').value) || 0;

    if (!exerciseId || !sets || !reps || !targetWeight) {
      document.getElementById('message').textContent = 'Please fill all required exercise fields.';
      return;
    }

    exercises.push({ exerciseId, sets, reps, targetWeight, restInterval, duration });
  }

  const scheduleData = {
    scheduleId: 's' + Date.now(),
    userId,
    dayOfWeek: data.dayOfWeek,
    scheduleTitle: data.scheduleTitle || '',
    exercises
  };

  try {
    const response = await fetch('http://localhost:3000/api/schedules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scheduleData)
    });

    const result = await response.json();
    if (response.ok) {
      document.getElementById('message').textContent = '✅ Schedule created!';
      form.reset();
      document.getElementById('exerciseList').innerHTML = '';
      addExerciseBlock(); // Add one fresh block
    } else {
      document.getElementById('message').textContent = `Error: ${result.error}`;
    }
  } catch (err) {
    document.getElementById('message').textContent = 'Failed to connect to server.';
  }
});
