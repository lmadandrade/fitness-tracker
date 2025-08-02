// this create and edit workout plans

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  editingScheduleId = urlParams.get('edit');

  await fetchExercises(); // get all exercises from db

  if (editingScheduleId) {
    // if we are editing a plan already
    document.querySelector('h2').textContent = 'Edit Workout Schedule';
    document.querySelector('button[type="submit"]').textContent = 'Update Schedule';
    loadScheduleForEditing(editingScheduleId);
  } else {
    // if we are creating new, just show one block
    addExerciseBlock();
  }
});

const userId = localStorage.getItem('userId');
if (!userId) {
  window.location.href = 'login.html'; // if not logged, send to login
}

let exerciseOptions = [];
let exerciseTypeMap = {};
let editingScheduleId = null;


// Fetch all exercise from DB and prepare the dropdown
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


// if editing, load the existing plan and put data in the form
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


// Adds a new group for adding exercise info (dropdown + reps + weight...)
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

  // if editing, fill the inputs with data
  if (data.exerciseId) {
    block.querySelector('[name="exerciseId"]').value = data.exerciseId;
    block.querySelector('[name="sets"]').value = data.sets;
    block.querySelector('[name="reps"]').value = data.reps;
    block.querySelector('[name="targetWeight"]').value = data.targetWeight;
    block.querySelector('[name="restInterval"]').value = data.restInterval;
    block.querySelector('[name="duration"]').value = data.duration;
  }

  // if user wants to change the exercise, this can be used for something later
  const select = block.querySelector('.exercise-select');
  select.addEventListener('change', () => {
    // maybe do something based on type later
  });
  select.dispatchEvent(new Event('change'));

  // Remove button logic
  block.querySelector('.remove-btn').addEventListener('click', () => {
    if (document.querySelectorAll('.exercise-block').length > 1) {
      block.remove();
      updateRemoveButtonsVisibility();
    }
  });

  updateRemoveButtonsVisibility(); // hide remove buttom if only 1
}


// this updates all dropdowns with the correct exercises
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


// shows remove buttons only if more than 1 block
function updateRemoveButtonsVisibility() {
  const allBlocks = document.querySelectorAll('.exercise-block');

  const allRemoveBtns = document.querySelectorAll('.remove-btn');

  allRemoveBtns.forEach(btn => {
    btn.style.display = allBlocks.length > 1 ? 'inline-block' : 'none';
  });
}


// when user submit the schedule form
document.getElementById('scheduleForm').addEventListener('submit', async function (e) {

  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

      // take all blocks and put into a list
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
    exercises  };

  let url = 'http://localhost:3000/api/schedules';
  let method = 'POST';

  // if we are editing, change url and method
  if (editingScheduleId) {
    url = `http://localhost:3000/api/schedules/${editingScheduleId}`;
    method = 'PUT';
    scheduleData.scheduleId = editingScheduleId;
  } else {
    scheduleData.scheduleId = 's' + Date.now(); // new ID for new plan
  }

  try {
    const response = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scheduleData)
    });

    if (response.ok) {
      window.location.href = 'workouts.html'; // send back to workout list
    } else {
      const result = await response.json();
      document.getElementById('message').textContent = `Error: ${result.error}`;
    }
  } catch (err) {
    document.getElementById('message').textContent = 'Failed to connect to server.';
  }});
