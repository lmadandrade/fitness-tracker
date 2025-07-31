// workoutSchedule.js
// Handles creating a workout schedule with dynamic exercise blocks

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
let exerciseTypeMap = {}; // Map to store exerciseId -> type

// Fetch exercises for the logged-in user and update dropdowns
async function fetchExercises() {
  try {
    const response = await fetch(`http://localhost:3000/api/exercises?userId=${userId}`);
    const data = await response.json();
    exerciseOptions = data.map(ex => {
      const id = ex.exerciseId || ex._id;
      exerciseTypeMap[id] = ex.type;
      return { id, name: ex.name };
    });
    updateAllDropdowns();
  } catch (err) {
    document.getElementById('message').textContent = 'Failed to fetch exercises.';
  }
}

// Populate all exercise dropdowns with current options
function updateAllDropdowns() {
  const selects = document.querySelectorAll('.exercise-select');
  selects.forEach(select => {
    const currentValue = select.value;
    select.innerHTML = '<option value="">Select Exercise</option>';
    exerciseOptions.forEach(ex => {
      const option = document.createElement('option');
      option.value = ex.id;
      option.textContent = ex.name;
      if (ex.id === currentValue) {
        option.selected = true;
      }
      select.appendChild(option);
    });
  });
}

// Show/hide ❌ buttons based on block count
function updateRemoveButtonsVisibility() {
  const allBlocks = document.querySelectorAll('.exercise-block');
  const allRemoveBtns = document.querySelectorAll('.remove-btn');
  allRemoveBtns.forEach(btn => {
    btn.style.display = allBlocks.length > 1 ? 'inline-block' : 'none';
  });
}

// Dynamically add a new exercise block
function addExerciseBlock() {
  const container = document.getElementById('exerciseList');
  const block = document.createElement('div');
  block.classList.add('exercise-block');

  block.innerHTML = `
    <div class="exercise-header">
      <button type="button" class="remove-btn">❌</button>
    </div>
    <div class="form-grid">
      <div class="form-group">
        <label>Exercise</label>
        <select class="exercise-select" required name="exerciseId">
          <option value="">Select Exercise</option>
        </select>
      </div>
      <div class="form-group sets-group">
        <label>Sets</label>
        <input type="number" name="sets" required />
      </div>
      <div class="form-group reps-group">
        <label>Reps</label>
        <input type="number" name="reps" required />
      </div>
      <div class="form-group weight-group">
        <label>Target Weight (kg)</label>
        <input type="number" name="targetWeight" required />
      </div>
      <div class="form-group rest-group">
        <label>Rest Interval (sec)</label>
        <input type="number" name="restInterval" />
      </div>
      <div class="form-group duration-group">
        <label>Duration (min)</label>
        <input type="number" name="duration" />
      </div>
    </div>
    <hr />
  `;

  container.appendChild(block);
  updateAllDropdowns();

  const select = block.querySelector('.exercise-select');
  const sets = block.querySelector('.sets-group');
  const reps = block.querySelector('.reps-group');
  const weight = block.querySelector('.weight-group');
  const rest = block.querySelector('.rest-group');
  const duration = block.querySelector('.duration-group');

  select.addEventListener('change', () => {
    const type = exerciseTypeMap[select.value];
    if (type === 'cardio' || type === 'stretch') {
      sets.style.display = 'none';
      reps.style.display = 'none';
      weight.style.display = 'none';
      rest.style.display = 'none';
      duration.style.display = 'block';
    } else {
      sets.style.display = 'block';
      reps.style.display = 'block';
      weight.style.display = 'block';
      rest.style.display = 'block';
      duration.style.display = 'none';
    }
  });

  const removeBtn = block.querySelector('.remove-btn');
  removeBtn.addEventListener('click', () => {
    const allBlocks = document.querySelectorAll('.exercise-block');
    if (allBlocks.length > 1) {
      block.remove();
      updateRemoveButtonsVisibility();
    }
  });

  updateRemoveButtonsVisibility();
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
    const setsEl = block.querySelector('[name="sets"]');
    const repsEl = block.querySelector('[name="reps"]');
    const weightEl = block.querySelector('[name="targetWeight"]');
    const restEl = block.querySelector('[name="restInterval"]');
    const durationEl = block.querySelector('[name="duration"]');

    const sets = setsEl ? Number(setsEl.value) : 0;
    const reps = repsEl ? Number(repsEl.value) : 0;
    const targetWeight = weightEl ? Number(weightEl.value) : 0;
    const restInterval = restEl ? Number(restEl.value) : 0;
    const duration = durationEl ? Number(durationEl.value) : 0;

    if (!exerciseId) {
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
