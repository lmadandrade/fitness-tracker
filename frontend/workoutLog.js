// workoutLog.js - Workout logging functionality
// Simple JavaScript for college project - all data comes from API

// Initialize page when loaded
document.addEventListener('DOMContentLoaded', () => {
  // Check if user is logged in
  const userId = localStorage.getItem('userId');
  if (!userId) {
    alert('You must be logged in to log a workout.');
    window.location.href = 'login.html';
    return;
  }

  // Set up page
  setToday();
  loadExercises(userId);
  loadSchedules(userId);
  setupRPE();
  setupSkipToggle();
  
  // Event listeners
  const scheduleSelect = document.getElementById('scheduledWorkoutId');
  if (scheduleSelect) scheduleSelect.addEventListener('change', handleScheduleChange);

  const logForm = document.getElementById('logForm');
  if (logForm) logForm.addEventListener('submit', handleSubmit);

  // Make functions available globally
  window.addExercise = addExercise;
  window.removeExercise = removeExercise;
  window.resetForm = resetForm;
});

// Store exercises from API
let exerciseOptions = [];

// Set today's date as default
function setToday() {
  const today = new Date().toISOString().split('T')[0];
  const dateEl = document.getElementById('date');
  if (dateEl) dateEl.value = today;
}

// Load exercises from API
async function loadExercises(userId) {
  try {
    const res = await fetch(`http://localhost:3000/api/exercises?userId=${userId}`);
    const data = await res.json();
    exerciseOptions = data.map(ex => ({ id: ex.exerciseId || ex._id, name: ex.name }));
  } catch (err) {
    showMessage('Failed to load exercises.');
  }
}

// Load workout schedules from API
async function loadSchedules(userId) {
  try {
    const res = await fetch(`http://localhost:3000/api/schedules?userId=${userId}`);
    const data = await res.json();
    const select = document.getElementById('scheduledWorkoutId');
    if (!select) return;
    
    // Clear and populate dropdown
    select.innerHTML = '<option value="">Select a schedule</option>';
    data.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.scheduleId;
      opt.textContent = `${s.dayOfWeek} - ${s.scheduleTitle || 'No title'}`;
      select.appendChild(opt);
    });
  } catch (err) {
    showMessage('Failed to load schedules.');
  }
}

// Handle scheduled workout selection
async function handleScheduleChange(e) {
  const scheduleId = e.target.value;
  const container = document.getElementById('scheduledExercises');
  const section = document.getElementById('scheduledExercisesSection');
  
  // Clear previous content
  container.innerHTML = '';
  
  if (!scheduleId) {
    section.style.display = 'none';
    return;
  }
  
  try {
    // Get scheduled workout details from API
    const res = await fetch(`http://localhost:3000/api/schedules/${scheduleId}`);
    const schedule = await res.json();
    
    if (schedule.exercises && schedule.exercises.length > 0) {
      section.style.display = 'block';
      
      // Create side-by-side layout for each exercise
      schedule.exercises.forEach((item, index) => {
        const entry = document.createElement('div');
        entry.className = 'exercise-entry';
        
        // Get exercise name from loaded options
        const exName = exerciseOptions.find(ex => ex.id === item.exerciseId)?.name || item.exerciseId;
        
        entry.innerHTML = `
          <h5>${exName}</h5>
          <div class="two-col-exercise">
            <!-- Planned workout side -->
            <div class="exercise-plan-card">
              <h5>Planned</h5>
              <p><strong>Sets:</strong> ${item.sets}</p>
              <p><strong>Reps:</strong> ${item.reps}</p>
              <p><strong>Weight:</strong> ${item.targetWeight} kg</p>
              <p><strong>Rest:</strong> ${item.restInterval || 0}s</p>
            </div>
            
            <!-- Actual workout side -->
            <div class="exercise-actual-card">
              <h5>Actual Performance</h5>
              <div class="input-group">
                <label>Sets</label>
                <input type="number" name="scheduledSets_${index}" value="${item.sets}" min="1">
              </div>
              <div class="input-group">
                <label>Reps</label>
                <input type="number" name="scheduledReps_${index}" value="${item.reps}" min="1">
              </div>
              <div class="input-group">
                <label>Weight (kg)</label>
                <input type="number" name="scheduledWeight_${index}" value="${item.targetWeight}" step="0.5" min="0">
              </div>
              <div class="input-group">
                <label>Rest (s)</label>
                <input type="number" name="scheduledRest_${index}" value="${item.restInterval || 0}" min="0">
              </div>
            </div>
          </div>
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

// Add manual exercise
function addExercise() {
  const container = document.getElementById('manualExercises');
  const exerciseCount = container.children.length;
  
  const div = document.createElement('div');
  div.className = 'exercise-entry';
  
  div.innerHTML = `
    <div class="exercise-remove">
      <button type="button" onclick="removeExercise(this)">Remove</button>
    </div>
    <h5>Exercise ${exerciseCount + 1}</h5>
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

// Remove manual exercise
function removeExercise(button) {
  button.closest('.exercise-entry').remove();
}

// Reset form to initial state
function resetForm() {
  document.getElementById('logForm').reset();
  document.getElementById('manualExercises').innerHTML = '';
  document.getElementById('scheduledExercises').innerHTML = '';
  
  const section = document.getElementById('scheduledExercisesSection');
  if (section) section.style.display = 'none';
  
  setToday();
  showMessage('');
}

// Set up RPE slider
function setupRPE() {
  const rpe = document.getElementById('rpe');
  const display = document.getElementById('rpeValue');
  if (rpe && display) {
    rpe.addEventListener('input', () => {
      display.textContent = rpe.value;
    });
  }
}

// Set up skip workout toggle
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

// Handle form submission
async function handleSubmit(e) {
  e.preventDefault();
  const userId = localStorage.getItem('userId');
  if (!userId) {
    showMessage('You must be logged in to log a workout.');
    return;
  }

  const form = e.target;
  const data = new FormData(form);
  
  // Build workout log object
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

  // Add scheduled exercises
  const scheduledContainer = document.getElementById('scheduledExercises');
  const scheduledEntries = scheduledContainer.querySelectorAll('.exercise-entry');
  scheduledEntries.forEach((entry, index) => {
    const exerciseId = entry.querySelector(`input[name="scheduledExerciseId_${index}"]`)?.value;
    const sets = entry.querySelector(`input[name="scheduledSets_${index}"]`)?.value;
    const reps = entry.querySelector(`input[name="scheduledReps_${index}"]`)?.value;
    const weight = entry.querySelector(`input[name="scheduledWeight_${index}"]`)?.value;
    const rest = entry.querySelector(`input[name="scheduledRest_${index}"]`)?.value;
    
    if (exerciseId && sets && reps && weight) {
      log.exercises.push({
        exerciseId: exerciseId,
        setsPerformed: Number(sets),
        repsPerformed: Number(reps),
        actualWeight: Number(weight),
        restInterval: Number(rest) || 0,
        duration: 0
      });
    }
  });

  // Add manual exercises
  const manualContainers = document.querySelectorAll('#manualExercises .exercise-entry');
  manualContainers.forEach(div => {
    const exerciseSelect = div.querySelector('select[name="manualExerciseId"]');
    const setsInput = div.querySelector('input[name="manualSets"]');
    const repsInput = div.querySelector('input[name="manualReps"]');
    const weightInput = div.querySelector('input[name="manualWeight"]');
    const restInput = div.querySelector('input[name="manualRest"]');
    
    if (exerciseSelect?.value && setsInput?.value && repsInput?.value && weightInput?.value) {
      log.exercises.push({
        exerciseId: exerciseSelect.value,
        setsPerformed: Number(setsInput.value),
        repsPerformed: Number(repsInput.value),
        actualWeight: Number(weightInput.value),
        restInterval: Number(restInput?.value) || 0,
        duration: 0
      });
    }
  });

  // Submit to API
  try {
    const response = await fetch('http://localhost:3000/api/workouts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(log)
    });
    const result = await response.json();
    
    if (response.ok) {
      showMessage('Workout logged successfully!');
      resetForm();
    } else {
      showMessage(`Error: ${result.error}`);
    }
  } catch (err) {
    showMessage('Failed to connect to server.');
  }
}

// Helper function to show messages
function showMessage(text) {
  const messageEl = document.getElementById('message');
  if (messageEl) messageEl.textContent = text;
}

