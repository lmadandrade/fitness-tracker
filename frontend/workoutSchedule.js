const userId = localStorage.getItem('userId');
if (!userId) {
  window.location.href = 'login.html';
}

let exerciseOptions = [];
let exerciseTypeMap = {};
let editingScheduleId = null;

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  editingScheduleId = urlParams.get('edit');

  await fetchExercises();

  if (editingScheduleId) {
    document.querySelector('h2').textContent = 'Edit Workout Schedule';
    document.querySelector('button[type="submit"]').textContent = 'Update Schedule';
    loadScheduleForEditing(editingScheduleId);
  } else {
    addExerciseBlock();
  }
});

async function fetchExercises() {
  try {
    const response = await fetch(`http://localhost:3000/api/exercises?userId=${userId}`);
    const data = await response.json();
    exerciseOptions = data.map(ex => {
      const id = ex.exerciseId || ex._id;
      exerciseTypeMap[id] = ex.type;
      return { id, name: ex.name };
    });
  } catch (err) {
    document.getElementById('message').textContent = 'Failed to fetch exercises.';
  }
}

async function loadScheduleForEditing(scheduleId) {
  try {
    const res = await fetch(`http://localhost:3000/api/schedules/${scheduleId}`);
    const schedule = await res.json();
    document.getElementById('scheduleTitle').value = schedule.scheduleTitle;
    document.getElementById('dayOfWeek').value = schedule.dayOfWeek;

    const container = document.getElementById('exerciseList');
    container.innerHTML = '';
    schedule.exercises.forEach(exercise => {
      addExerciseBlock(exercise);
    });
  } catch (err) {
    document.getElementById('message').textContent = 'Failed to load schedule data.';
  }
}

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

function updateRemoveButtonsVisibility() {
  const allBlocks = document.querySelectorAll('.exercise-block');
  const allRemoveBtns = document.querySelectorAll('.remove-btn');
  allRemoveBtns.forEach(btn => {
    btn.style.display = allBlocks.length > 1 ? 'inline-block' : 'none';
  });
}

function addExerciseBlock(data = {}) {
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
        <select class="exercise-select" required name="exerciseId"></select>
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

  if (data.exerciseId) {
    block.querySelector('[name="exerciseId"]').value = data.exerciseId;
    block.querySelector('[name="sets"]').value = data.sets;
    block.querySelector('[name="reps"]').value = data.reps;
    block.querySelector('[name="targetWeight"]').value = data.targetWeight;
    block.querySelector('[name="restInterval"]').value = data.restInterval;
    block.querySelector('[name="duration"]').value = data.duration;
  }

  const select = block.querySelector('.exercise-select');
  select.addEventListener('change', () => {
    // Logic for type-based visibility (if needed)
  });
  select.dispatchEvent(new Event('change'));

  block.querySelector('.remove-btn').addEventListener('click', () => {
    if (document.querySelectorAll('.exercise-block').length > 1) {
      block.remove();
      updateRemoveButtonsVisibility();
    }
  });

  updateRemoveButtonsVisibility();
}

document.getElementById('scheduleForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  const exercises = Array.from(form.querySelectorAll('.exercise-block')).map(block => ({
    exerciseId: block.querySelector('[name="exerciseId"]').value,
    sets: Number(block.querySelector('[name="sets"]').value) || 0,
    reps: Number(block.querySelector('[name="reps"]').value) || 0,
    targetWeight: Number(block.querySelector('[name="targetWeight"]').value) || 0,
    restInterval: Number(block.querySelector('[name="restInterval"]').value) || 0,
    duration: Number(block.querySelector('[name="duration"]').value) || 0,
  }));

  const scheduleData = {
    userId,
    dayOfWeek: data.dayOfWeek,
    scheduleTitle: data.scheduleTitle || '',
    exercises
  };

  let url = 'http://localhost:3000/api/schedules';
  let method = 'POST';

  if (editingScheduleId) {
    url = `http://localhost:3000/api/schedules/${editingScheduleId}`;
    method = 'PUT';
    scheduleData.scheduleId = editingScheduleId;
  } else {
    scheduleData.scheduleId = 's' + Date.now(); // ✅ Ensure it's set for new schedules
  }

  try {
    const response = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scheduleData)
    });

    if (response.ok) {
      window.location.href = 'workouts.html';
    } else {
      const result = await response.json();
      document.getElementById('message').textContent = `Error: ${result.error}`;
    }
  } catch (err) {
    document.getElementById('message').textContent = 'Failed to connect to server.';
  }
});
