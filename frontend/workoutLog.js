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
  window.removeExercise = removeExercise;
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
  const section = document.getElementById('scheduledExercisesSection');
  
  // Clear previous content
  container.innerHTML = '';
  
  if (!scheduleId) {
    // Hide the scheduled exercises section if no schedule is selected
    section.style.display = 'none';
    return;
  }
  
  try {
    const res = await fetch(`http://localhost:3000/api/schedules/${scheduleId}`);
    const schedule = await res.json();
    
    if (schedule.exercises && schedule.exercises.length > 0) {
      // Show the scheduled exercises section
      section.style.display = 'block';
      
      // Create exercise entries with side-by-side layout
      schedule.exercises.forEach((item, index) => {
        const entry = document.createElement('div');
        entry.classList.add('scheduled-exercise-entry');
        
        const exName = exerciseOptions.find(ex => ex.id === item.exerciseId)?.name || item.exerciseId;
        
        entry.innerHTML = `
          <div class="scheduled-exercise-card">
            <div class="exercise-plan">
              <h5>${exName}</h5>
              <div class="plan-details">
                <span><strong>Sets:</strong> ${item.sets}</span>
                <span><strong>Reps:</strong> ${item.reps}</span>
                <span><strong>Weight:</strong> ${item.targetWeight} kg</span>
                <span><strong>Rest:</strong> ${item.restInterval || 0}s</span>
              </div>
            </div>
            
            <div class="exercise-actual">
              <h6>Actual Performance</h6>
              <div class="actual-inputs">
                <div class="input-pair">
                  <label>Sets</label>
                  <input type="number" name="scheduledSets_${index}" min="0" placeholder="${item.sets}">
                </div>
                <div class="input-pair">
                  <label>Reps</label>
                  <input type="number" name="scheduledReps_${index}" min="0" placeholder="${item.reps}">
                </div>
                <div class="input-pair">
                  <label>Weight (kg)</label>
                  <input type="number" name="scheduledWeight_${index}" min="0" step="0.5" placeholder="${item.targetWeight}">
                </div>
                <div class="input-pair">
                  <label>Rest (s)</label>
                  <input type="number" name="scheduledRest_${index}" min="0" placeholder="${item.restInterval || 0}">
                </div>
              </div>
            </div>
          </div>
          <!-- Hidden field to store exercise ID -->
          <input type="hidden" name="scheduledExerciseId_${index}" value="${item.exerciseId}">
        `;
        
        container.appendChild(entry);
      });
    } else {
      section.style.display = 'none';
    }
  } catch (err) {
    container.innerHTML = '<p style="color: #e74c3c;">Failed to load scheduled exercises.</p>';
    section.style.display = 'block';
  }
}

function addExercise() {
  const container = document.getElementById('manualExercises');
  const exerciseCount = container.children.length; // Get current count for unique naming
  
  const div = document.createElement('div');
  div.classList.add('exercise-entry');
  
  div.innerHTML = `
    <!-- Remove button for manual exercises -->
    <div class="exercise-remove">
      <button type="button" onclick="removeExercise(this)">Remove</button>
    </div>
    
    <h5>Manual Exercise ${exerciseCount + 1}</h5>
    <div class="exercise-input-grid">
      <!-- Exercise selection -->
      <div style="grid-column: 1 / -1; margin-bottom: 10px;">
        <label for="manualExerciseId_${exerciseCount}">Exercise</label>
        <select name="manualExerciseId" id="manualExerciseId_${exerciseCount}" required>
          <option value="">Select Exercise</option>
          ${exerciseOptions.map(opt => `<option value="${opt.id}">${opt.name}</option>`).join('')}
        </select>
      </div>
      
      <!-- Exercise input fields -->
      <div style="grid-column: 1 / -1;">
        <div class="exercise-inputs">
          <div class="input-group">
            <label>Sets</label>
            <input type="number" name="manualSets" min="1" placeholder="Sets performed" required>
          </div>
          <div class="input-group">
            <label>Reps</label>
            <input type="number" name="manualReps" min="1" placeholder="Reps performed" required>
          </div>
          <div class="input-group">
            <label>Weight (kg)</label>
            <input type="number" name="manualWeight" min="0" step="0.5" placeholder="Weight used" required>
          </div>
          <div class="input-group">
            <label>Rest (sec)</label>
            <input type="number" name="manualRest" min="0" placeholder="Rest time">
          </div>
          <div class="input-group">
            <label>Duration (min)</label>
            <input type="number" name="manualDuration" min="0" placeholder="Exercise duration">
          </div>
        </div>
      </div>
    </div>
  `;
  
  container.appendChild(div);
  
  // Update exercise titles after adding
  updateExerciseTitles();
}

// Helper function to remove manual exercises
function removeExercise(button) {
  const exerciseEntry = button.closest('.exercise-entry');
  exerciseEntry.remove();
  
  // Update exercise titles after removal
  updateExerciseTitles();
}

// Helper function to update exercise titles with correct numbering
function updateExerciseTitles() {
  const container = document.getElementById('manualExercises');
  const exercises = container.querySelectorAll('.exercise-entry');
  
  exercises.forEach((exercise, index) => {
    const title = exercise.querySelector('h5');
    if (title) {
      title.textContent = `Manual Exercise ${index + 1}`;
    }
  });
}

function resetForm() {
  document.getElementById('logForm').reset();
  document.getElementById('manualExercises').innerHTML = '';
  document.getElementById('scheduledExercises').innerHTML = '';
  
  // Hide scheduled exercises section
  const section = document.getElementById('scheduledExercisesSection');
  if (section) section.style.display = 'none';
  
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

  // Add scheduled exercise entries (if any)
  const scheduledContainer = document.getElementById('scheduledExercises');
  const scheduledEntries = scheduledContainer.querySelectorAll('.scheduled-exercise-entry');
  scheduledEntries.forEach((entry, index) => {
    const exerciseId = entry.querySelector(`input[name="scheduledExerciseId_${index}"]`)?.value;
    const sets = entry.querySelector(`input[name="scheduledSets_${index}"]`)?.value;
    const reps = entry.querySelector(`input[name="scheduledReps_${index}"]`)?.value;
    const weight = entry.querySelector(`input[name="scheduledWeight_${index}"]`)?.value;
    const rest = entry.querySelector(`input[name="scheduledRest_${index}"]`)?.value;
    
    // Only add if at least sets, reps, and weight are provided
    if (exerciseId && sets && reps && weight) {
      log.exercises.push({
        exerciseId: exerciseId,
        setsPerformed: Number(sets),
        repsPerformed: Number(reps),
        actualWeight: Number(weight),
        restInterval: Number(rest) || 0,
        duration: 0 // Duration not tracked for scheduled exercises in this layout
      });
    }
  });

  // Add manual exercise entries
  const manualContainers = document.querySelectorAll('#manualExercises .exercise-entry');
  manualContainers.forEach(div => {
    const exerciseSelect = div.querySelector('select[name="manualExerciseId"]');
    const setsInput = div.querySelector('input[name="manualSets"]');
    const repsInput = div.querySelector('input[name="manualReps"]');
    const weightInput = div.querySelector('input[name="manualWeight"]');
    const restInput = div.querySelector('input[name="manualRest"]');
    const durationInput = div.querySelector('input[name="manualDuration"]');
    
    if (exerciseSelect?.value && setsInput?.value && repsInput?.value && weightInput?.value) {
      log.exercises.push({
        exerciseId: exerciseSelect.value,
        setsPerformed: Number(setsInput.value),
        repsPerformed: Number(repsInput.value),
        actualWeight: Number(weightInput.value),
        restInterval: Number(restInput?.value) || 0,
        duration: Number(durationInput?.value) || 0
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
