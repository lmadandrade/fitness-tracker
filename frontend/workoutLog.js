// Front‑end logic for logging a completed workout.
//
// This module coordinates user selection, schedule lookup and exercise
// logging for a workout session. It populates drop‑down lists from
// the backend API, displays scheduled exercises one at a time and
// collects the actual performance entered by the user. When the form
// is submitted the aggregated data is sent to the server.

document.addEventListener('DOMContentLoaded', () => {
  populateUsers();
  populateExercises();
  populateSchedules();
  setToday();
  handleSkipToggle();
  setupRPE();
  setupFormSubmit();
  // Register the addExercise function on the global object so it can
  // be referenced from the HTML onClick attribute. Without doing
  // this the function would be scoped to this module and unavailable
  // from inline event handlers defined in the markup.
  window.addExercise = addExercise;
});

// Set the date input to today's date on load.
function setToday() {
  const today = new Date().toISOString().split('T')[0];
  const dateEl = document.getElementById('date');
  if (dateEl) {
    dateEl.value = today;
  }
}

// Update the displayed RPE value as the user moves the slider.
function setupRPE() {
  const rpeInput = document.getElementById('rpe');
  const rpeValue = document.getElementById('rpeValue');
  if (rpeInput && rpeValue) {
    rpeInput.addEventListener('input', () => {
      rpeValue.textContent = rpeInput.value;
    });
  }
}

// Fetch the list of users from the server and populate the user select
// element. Also update the hidden userId field when a selection is made.
async function populateUsers() {
  const userSelect = document.getElementById('userName');
  const userIdHidden = document.getElementById('userIdHidden');
  if (!userSelect || !userIdHidden) return;

  const res = await fetch('http://localhost:3000/api/users');
  const users = await res.json();

  users.forEach(user => {
    const option = document.createElement('option');
    option.value = user._id;
    option.textContent = user.name;
    userSelect.appendChild(option);
  });

  userSelect.addEventListener('change', () => {
    userIdHidden.value = userSelect.value;
  });
}

// Fetch the exercise library and store it globally for name lookups. This
// array is used later when displaying scheduled exercises.
async function populateExercises() {
  const res = await fetch('http://localhost:3000/api/exercises');
  const exercises = await res.json();
  window.exerciseOptions = exercises.map(ex => ({ id: ex._id, name: ex.name }));
}

// Fetch saved schedules and populate the schedule select element. When a
// schedule is chosen we call handleScheduleSelection to display the
// planned exercises.
async function populateSchedules() {
  const scheduleSelect = document.getElementById('scheduledWorkoutId');
  if (!scheduleSelect) return;
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

// State variables used to track scheduled exercises and user input.
let currentScheduledExercises = [];
let currentIndex = 0;
const collectedExercises = [];

// Add a manual exercise entry. This function is called when the user
// clicks the "Add Exercise" button in the form. It appends a new
// block of inputs to the exerciseContainer allowing the user to log
// exercises that are not part of the selected schedule. When the form
// is submitted these entries are collected and merged with the
// scheduled exercises.
function addExercise() {
  const container = document.getElementById('exerciseContainer');
  if (!container) return;

  const card = document.createElement('div');
  card.classList.add('manual-entry');
  // Build a select element populated with the exercise library. We
  // recreate the options each time in case the exercise list has been
  // updated since the page loaded.
  const selectOptions = window.exerciseOptions
    .map(opt => `<option value="${opt.id}">${opt.name}</option>`)
    .join('');
  card.innerHTML = `
    <label>Exercise</label>
    <select name="exerciseId" required>
      <option value="">Select Exercise</option>
      ${selectOptions}
    </select>
    <label>Sets</label><input type="number" name="setsPerformed" required />
    <label>Reps</label><input type="number" name="repsPerformed" required />
    <label>Weight (kg)</label><input type="number" name="actualWeight" required />
    <label>Rest (sec)</label><input type="number" name="restInterval" />
    <label>Duration (min)</label><input type="number" name="duration" />
    <label>Notes</label><input type="text" name="notes" />
    <button type="button" class="secondary" onclick="this.parentElement.remove()">Remove</button>
  `;
  container.appendChild(card);
}

// Called when the user selects a scheduled workout. Resets state and
// fetches the selected schedule to display the first exercise.
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

// Display the next scheduled exercise and create inputs for logging the
// user's actual performance. When no exercises remain we show a
// completion message instead.
function showNextScheduledExercise() {
  const scheduledDiv = document.getElementById('scheduledDetails');
  const actualContainer = document.getElementById('exerciseContainer');
  scheduledDiv.innerHTML = '';
  actualContainer.innerHTML = '';

  if (currentIndex >= currentScheduledExercises.length) {
    scheduledDiv.innerHTML = '<p>All scheduled exercises reviewed.</p>';
    actualContainer.innerHTML = '<p>You can now submit your workout below.</p>';
    return;
  }

  const ex = currentScheduledExercises[currentIndex];
  const exerciseInfo = window.exerciseOptions.find(opt => opt.id === ex.exerciseId);
  const exerciseName = exerciseInfo ? exerciseInfo.name : `Unknown (${ex.exerciseId})`;

  scheduledDiv.innerHTML = `
    <p><strong>Exercise:</strong> ${exerciseName}</p>
    <p><strong>Sets:</strong> ${ex.sets}</p>
    <p><strong>Reps:</strong> ${ex.reps}</p>
    <p><strong>Target Weight:</strong> ${ex.targetWeight}</p>
    <p><strong>Rest Interval:</strong> ${ex.restInterval}</p>
    <p><strong>Duration:</strong> ${ex.duration}</p>
  `;

  // Create a container for the user to log the actual performance for this
  // exercise. We add inputs for sets, reps, weight, rest interval, duration
  // and optional notes. When the user confirms or skips, we advance to the
  // next scheduled exercise.
  const actualCard = document.createElement('div');
  actualCard.classList.add('exercise-entry');
  actualCard.innerHTML = `
    <input type="hidden" name="exerciseId" value="${ex.exerciseId}" />
    <label>Sets</label><input type="number" name="setsPerformed" required />
    <label>Reps</label><input type="number" name="repsPerformed" required />
    <label>Weight (kg)</label><input type="number" name="actualWeight" required />
    <label>Rest (sec)</label><input type="number" name="restInterval" />
    <label>Duration (min)</label><input type="number" name="duration" />
    <label>Notes</label><input type="text" name="notes" />
    <button type="button" onclick="confirmExercise()">Confirm Exercise</button>
    <button type="button" onclick="skipExercise()">Skip Exercise</button>
  `;
  actualContainer.appendChild(actualCard);
}

// Capture the data entered for a scheduled exercise and store it in the
// collectedExercises array. Then display the next scheduled exercise.
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

// When the user skips an exercise we simply advance the index without
// recording any data.
function skipExercise() {
  currentIndex++;
  showNextScheduledExercise();
}

// Toggle the display of the exercise logging section based on the
// selection of the 'wasSkipped' drop‑down. If the workout is marked as
// skipped there is no need to log individual exercises.
function handleSkipToggle() {
  const wasSkipped = document.getElementById('wasSkipped');
  // Hide or show the logging area when the user marks the workout as skipped.
  // In this simplified layout, the scheduled and actual exercise panels are
  // contained in an element with the class 'exercise-columns'. If we hide
  // this element the user cannot log any exercises when they skipped the
  // workout entirely.
  const exerciseSection = document.querySelector('.exercise-columns');
  if (!wasSkipped || !exerciseSection) return;
  wasSkipped.addEventListener('change', () => {
    exerciseSection.style.display = wasSkipped.value === 'true' ? 'none' : '';
  });
}

// Hook up the form submit handler to send the collected workout data
// to the backend. We prevent default behaviour, build the payload and
// post it. Feedback is provided in a message element.
function setupFormSubmit() {
  const logForm = document.getElementById('logForm');
  if (!logForm) return;
  logForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const formData = new FormData(this);
    const data = Object.fromEntries(formData.entries());
    // Collect any manually added exercises. These are blocks appended
    // by addExercise() that allow the user to log additional work not
    // part of the schedule. Each entry has the same input names as
    // scheduled exercises so we can re‑use the property names directly.
    const manualBlocks = document.querySelectorAll('.manual-entry');
    const manualExercises = [];
    manualBlocks.forEach(block => {
      const exerciseId = block.querySelector('[name="exerciseId"]').value;
      const sets = Number(block.querySelector('[name="setsPerformed"]').value);
      const reps = Number(block.querySelector('[name="repsPerformed"]').value);
      const weight = Number(block.querySelector('[name="actualWeight"]').value);
      const rest = Number(block.querySelector('[name="restInterval"]').value) || 0;
      const duration = Number(block.querySelector('[name="duration"]').value) || 0;
      const notes = block.querySelector('[name="notes"]').value;
      // Only add the entry if an exercise has been selected.
      if (exerciseId) {
        manualExercises.push({
          exerciseId,
          setsPerformed: sets,
          repsPerformed: reps,
          actualWeight: weight,
          restInterval: rest,
          duration: duration,
          notes: notes
        });
      }
    });
    // Merge scheduled exercises with manually logged exercises.
    const allExercises = collectedExercises.concat(manualExercises);
    const logData = {
      logId: 'log' + Date.now(),
      userId: data.userId,
      date: data.date,
      scheduledWorkoutId: data.scheduledWorkoutId || undefined,
      startTime: data.startTime,
      endTime: data.endTime,
      wasSkipped: data.wasSkipped === 'true',
      rpe: Number(data.rpe),
      exercises: allExercises
    };
    try {
      const response = await fetch('http://localhost:3000/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logData)
      });
      const result = await response.json();
      const messageEl = document.getElementById('message');
      if (response.ok) {
        messageEl.textContent = 'Workout logged!';
        resetForm();
      } else {
        messageEl.textContent = `Error: ${result.error}`;
      }
    } catch (err) {
      document.getElementById('message').textContent = 'Failed to connect to server.';
    }
  });
}

// Reset the form and internal state after submission.
function resetForm() {
  const logForm = document.getElementById('logForm');
  if (logForm) {
    logForm.reset();
  }
  document.getElementById('exerciseContainer').innerHTML = '';
  document.getElementById('scheduledDetails').innerHTML = '';
  document.getElementById('message').textContent = '';
  collectedExercises.length = 0;
}