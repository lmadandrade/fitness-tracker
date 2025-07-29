document.addEventListener('DOMContentLoaded', () => {
  fetchExercises();
  addExerciseBlock(); // Add the first exercise block by default
});

let exerciseOptions = [];

async function fetchExercises() {
  try {
    const res = await fetch('http://localhost:3000/api/exercises');
    const data = await res.json();
    exerciseOptions = data;
    updateAllDropdowns();
  } catch (err) {
    document.getElementById('message').textContent = '❌ Failed to fetch exercises.';
  }
}

function updateAllDropdowns() {
  const selects = document.querySelectorAll('.exercise-select');
  selects.forEach(select => {
    select.innerHTML = '<option value="">Select Exercise</option>';
    exerciseOptions.forEach(ex => {
      const option = document.createElement('option');
      option.value = ex._id;
      option.textContent = ex.name;
      select.appendChild(option);
    });
  });
}

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
  updateAllDropdowns(); // Refresh dropdown after adding
}

document.getElementById('scheduleForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  // Gather all exercise blocks
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
      document.getElementById('message').textContent = '❌ Please fill all required exercise fields.';
      return;
    }

    exercises.push({ exerciseId, sets, reps, targetWeight, restInterval, duration });
  }

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
      document.getElementById('message').textContent = '✅ Schedule created!';
      form.reset();
      document.getElementById('exerciseList').innerHTML = '';
      addExerciseBlock(); // Add fresh block after reset
    } else {
      document.getElementById('message').textContent = `❌ Error: ${result.error}`;
    }
  } catch (err) {
    document.getElementById('message').textContent = '❌ Failed to connect to server.';
  }
});
