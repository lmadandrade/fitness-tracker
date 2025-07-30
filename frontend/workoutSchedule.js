// Front‑end logic for creating a workout schedule.
//
// This script loads the available exercises from the backend, allows the
// user to add multiple exercise blocks to a schedule and submits the
// completed schedule to the server. It provides simple success and
// error messages and resets the form upon successful creation.

document.addEventListener('DOMContentLoaded', () => {
  fetchExercises();
  // Add an initial exercise block so the user has something to fill in.
  addExerciseBlock();
});

let exerciseOptions = [];

// Fetch the exercise library from the API and store it in the
// exerciseOptions array. Once loaded, populate any existing select
// elements in the form.
async function fetchExercises() {
  try {
    const res = await fetch('http://localhost:3000/api/exercises');
    const data = await res.json();
    exerciseOptions = data;
    updateAllDropdowns();
  } catch (err) {
    document.getElementById('message').textContent = 'Failed to fetch exercises.';
  }
}

// Populate all exercise drop‑downs with the current list of exercises.
function updateAllDropdowns() {
  const selects = document.querySelectorAll('.exercise-select');
  selects.forEach(select => {
    // Ensure the default option is present.
    select.innerHTML = '<option value="">Select Exercise</option>';
    exerciseOptions.forEach(ex => {
      const option = document.createElement('option');
      option.value = ex._id;
      option.textContent = ex.name;
      select.appendChild(option);
    });
  });
}

// Add a new exercise block to the form. Each block contains fields
// necessary to describe a single exercise in the schedule.
function addExerciseBlock() {
  const container = document.getElementById('exerciseList');
  // Do not allow more than 15 exercise blocks to be added. This keeps
  // the schedule manageable and avoids a long unwieldy form. If the
  // limit is reached we simply return.
  const existingBlocks = container.querySelectorAll('.exercise-block');
  if (existingBlocks.length >= 15) {
    const messageEl = document.getElementById('message');
    if (messageEl) {
      messageEl.textContent = 'You can only add up to 15 exercises in a schedule.';
    }
    return;
  }
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

// Handle schedule submission: gather form data, validate required fields and
// send to the server. On success we reset the form and show a message.
document.getElementById('scheduleForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  // Gather exercise details from each block. If any required field is
  // missing, show an error and abort submission.
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

  // Construct the schedule object to send to the API.
  const scheduleId = 's' + Date.now();
  const scheduleData = {
    scheduleId,
    userId: data.userId,
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
      document.getElementById('message').textContent = 'Schedule created successfully!';
      form.reset();
      document.getElementById('exerciseList').innerHTML = '';
      addExerciseBlock();
    } else {
      document.getElementById('message').textContent = `Error: ${result.error}`;
    }
  } catch (err) {
    document.getElementById('message').textContent = 'Failed to connect to server.';
  }
});