// workoutLog.js - for logging workouts
// script to handle form and send info to backend

document.addEventListener('DOMContentLoaded', () => {
  const userId = localStorage.getItem('userId');

  if (!userId) {
    alert('You must be logged in to log a workout.');
    window.location.href = 'login.html';
    return;
  }

  // just call this when page load
  setToday()
  loadExercises(userId)
  loadSchedules(userId)
  setupRPE()
  setupSkipToggle()

  // form event
  const logForm = document.getElementById('logForm');
  if (logForm) {
    logForm.addEventListener('submit', handleSubmit);
  }

  // This one changes the schedule options
  const scheduleSelect = document.getElementById('scheduledWorkoutId');
  if (scheduleSelect) {
    scheduleSelect.addEventListener('change', handleScheduleChange);
  }

  // let HTML buttons use these
  window.addExercise = addExercise;
  window.removeExercise = removeExercise;
  window.resetForm = resetForm;
});

let exerciseOptions = []; // list to store user exercises

function setToday() {
  const today = new Date().toISOString().split('T')[0];
  const dateEl = document.getElementById('date');
  if (dateEl) dateEl.value = today;
}

// Get the exercises from DB
async function loadExercises(userId) {
  try {
    const res = await fetch(`http://localhost:3000/api/exercises?userId=${userId}`);
    const data = await res.json();
    exerciseOptions = data.map(ex => ({
      id: ex.exerciseId || ex._id,
      name: ex.name
    }));
  } catch (err) {
    showMessage('Failed to load exercises.');
  }
}

// get schedules from DB
async function loadSchedules(userId) {
  try {
    const res = await fetch(`http://localhost:3000/api/schedules?userId=${userId}`);
    const data = await res.json();
    const select = document.getElementById('scheduledWorkoutId');

    if (!select) return;

    select.innerHTML = '<option value="">Select a schedule</option>';

    data.forEach(sch => {
      const opt = document.createElement('option');
      opt.value = sch.scheduleId;
      opt.textContent = `${sch.dayOfWeek} - ${sch.scheduleTitle || 'No title'}`;
      select.appendChild(opt);
    });

  } catch (err) {
    showMessage('Failed to load schedules.');
  }
}

// When schedule selected
async function handleScheduleChange(e) {
  const scheduleId = e.target.value;
  const container = document.getElementById('scheduledExercises');
  const section = document.getElementById('scheduledExercisesSection');

  container.innerHTML = '';

  if (!scheduleId) {
    section.style.display = 'none';
    return;
  }

  try {
    const res = await fetch(`http://localhost:3000/api/schedules/${scheduleId}`);
    const schedule = await res.json();



    if (schedule.exercises && schedule.exercises.length > 0) {
      section.style.display = 'block';


      schedule.exercises.forEach((item, i) => {
        const box = document.createElement('div');
        box.className = 'exercise-entry';

        const name = exerciseOptions.find(ex => ex.id === item.exerciseId)?.name || item.exerciseId;
        box.innerHTML = `
          <h5>${name}</h5>
          <div class="two-col-exercise">
            <div class="exercise-plan-card">

              <h5>Planned</h5>
              <p><strong>Sets:</strong> ${item.sets}</p>
              <p><strong>Reps:</strong> ${item.reps}</p>
              <p><strong>Weight:</strong> ${item.targetWeight} kg</p>
              <p><strong>Rest:</strong> ${item.restInterval || 0}s</p>
            </div>

            <div class="exercise-actual-card">
              <h5>Actual Performance</h5>
              <div class="input-group">
                <label>Sets</label>
                <input type="number" name="scheduledSets_${i}" value="${item.sets}" min="1">
              </div>

              <div class="input-group">
                <label>Reps</label>
                <input type="number" name="scheduledReps_${i}" value="${item.reps}" min="1">
              </div>
              <div class="input-group">
                <label>Weight (kg)</label>
                <input type="number" name="scheduledWeight_${i}" value="${item.targetWeight}" step="0.5" min="0">
              </div>
              
              <div class="input-group">
                <label>Rest (s)</label>
                <input type="number" name="scheduledRest_${i}" value="${item.restInterval || 0}" min="0">
              </div>
            </div>
          </div>
          <input type="hidden" name="scheduledExerciseId_${i}" value="${item.exerciseId}">
        `;

        container.appendChild(box);
      });
    } else {
      section.style.display = 'none';
}

  } catch (err) {
    container.innerHTML = '<p style="color: red;">Failed to load scheduled exercises.</p>';
    section.style.display = 'block';
  }
}

// Add a manual one
function addExercise() {
  const container = document.getElementById('manualExercises');
  const index = container.children.length;

  const div = document.createElement('div');
  div.className = 'exercise-entry';

  div.innerHTML = `
    <div class="exercise-remove">
      <button type="button" onclick="removeExercise(this)">Remove</button>
    </div>
    <h5>Exercise ${index + 1}</h5>
    <div class="exercise-input-grid">
      <div class="form-group">
        <label>Exercise Name</label>
        <select name="manualExerciseId" required>
          <option value="">Select Exercise</option>

          ${exerciseOptions.map(opt => `<option value="${opt.id}">${opt.name}</option>`).join('')}

        </select>
      </div>
      <div class="exercise-inputs">
        <div class="input-group">
          <label>Sets</label>
          <input type="number" name="manualSets" min="1" required>
        </div>

        <div class="input-group">
          <label>Reps</label>
          <input type="number" name="manualReps" min="1" required>
        </div>

        <div class="input-group">
          <label>Weight (kg)</label>
          <input type="number" name="manualWeight" step="0.5" min="0">
        </div>

        <div class="input-group">
          <label>Rest (s)</label>
          <input type="number" name="manualRest" min="0">
        </div>
      </div>
    </div>
  `;

  container.appendChild(div);
}

// just remove that card
function removeExercise(btn) {
  btn.closest('.exercise-entry').remove();
}

// Put everything to default
function resetForm() {
  document.getElementById('logForm').reset();
  document.getElementById('manualExercises').innerHTML = '';
  document.getElementById('scheduledExercises').innerHTML = '';
  const sec = document.getElementById('scheduledExercisesSection');
  if (sec) sec.style.display = 'none';
  setToday();
  showMessage('');
}

// set RPE text
function setupRPE() {
  const rpe = document.getElementById('rpe');
  const disp = document.getElementById('rpeValue');

  if (rpe && disp) {
    rpe.addEventListener('input', () => {
      disp.textContent = rpe.value;
    });
  }
}

// hide stuff if workout is skipped
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

// submit to API
async function handleSubmit(e) {
  e.preventDefault();

  const userId = localStorage.getItem('userId');
  if (!userId) {
    showMessage('You must be logged in to log a workout.');
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

  // from planned section
  const planned = document.querySelectorAll('#scheduledExercises .exercise-entry');
  planned.forEach((div, i) => {
    const id = div.querySelector(`input[name="scheduledExerciseId_${i}"]`)?.value;
    const sets = div.querySelector(`input[name="scheduledSets_${i}"]`)?.value;
    const reps = div.querySelector(`input[name="scheduledReps_${i}"]`)?.value;
    const weight = div.querySelector(`input[name="scheduledWeight_${i}"]`)?.value;
    const rest = div.querySelector(`input[name="scheduledRest_${i}"]`)?.value;

    if (id && sets && reps && weight) {
      log.exercises.push({
        exerciseId: id,
        setsPerformed: Number(sets),
        repsPerformed: Number(reps),
        actualWeight: Number(weight),
        restInterval: Number(rest) || 0,
        duration: 0
      });
    }
  });

  // from manual section


  const manual = document.querySelectorAll('#manualExercises .exercise-entry');
  manual.forEach(div => {

    const ex = div.querySelector('select[name="manualExerciseId"]');
    const sets = div.querySelector('input[name="manualSets"]');
    const reps = div.querySelector('input[name="manualReps"]');
    const weight = div.querySelector('input[name="manualWeight"]');
    const rest = div.querySelector('input[name="manualRest"]');

    if (ex?.value && sets?.value && reps?.value && weight?.value) {
      log.exercises.push({
        exerciseId: ex.value,
        setsPerformed: Number(sets.value),
        repsPerformed: Number(reps.value),
        actualWeight: Number(weight.value),
        restInterval: Number(rest?.value) || 0,
        duration: 0
      });
    }

  });

  try {
    const res = await fetch('http://localhost:3000/api/workouts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(log)
    });
    const result = await res.json();

    if (res.ok) {
  showMessage('Workout logged successfully! Redirecting...');
  
  // delay to let user see message
  setTimeout(() => {
    window.location.href = "workouts.html";
  }, 2000);
  
} else {
  showMessage(`Error: ${result.error || "Something went wrong"}`);
}

  } catch (err) {
    showMessage('Failed to connect to server.');

  }
}



// put message on page
function showMessage(text) {
  const el = document.getElementById('message');
  if (el) el.textContent = text;
}
