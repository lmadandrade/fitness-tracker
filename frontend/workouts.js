// workouts.js - show all the user plans and what he already did

document.addEventListener('DOMContentLoaded', () => {
  const userId = localStorage.getItem('userId');

  // check if user is logged
  if (!userId) {
    const plans = document.getElementById('workout-plans');
    if (plans) plans.innerHTML = '<p>Please log in to see your workout plans.</p>';

    const past = document.getElementById('past-workouts');
    if (past) past.innerHTML = '<p>Please log in to see your past workouts.</p>';
    return;
  }

  // Get all plans and past workouts from db
  loadWorkoutPlans(userId);
  loadPastWorkouts(userId);
});


// This loads the workout plans from backend
function loadWorkoutPlans(userId) {
  const plansEl = document.getElementById('workout-plans');
  if (!plansEl) return;

  fetch(`http://localhost:3000/api/schedules?userId=${userId}`)
    .then(res => res.json())
    .then(data => {
      plansEl.innerHTML = '';
      if (data.length === 0) {
        plansEl.innerHTML = '<p>No workout plans found.</p>';
        return;
      }

      data.forEach(plan => {
        const card = document.createElement('div');
        card.className = 'btn-outline';

        card.innerHTML = `
          <h4>${plan.scheduleTitle || 'Untitled Plan'}</h4>
          <p><strong>Day:</strong> ${plan.dayOfWeek}</p>
          <p><strong>Exercises:</strong> ${plan.exercises.length}</p>
          <div class="plan-actions" style="margin-top: 10px;">
            <button onclick="editPlan('${plan.scheduleId}')">Edit</button>
            <button class="secondary" onclick="deletePlan('${plan.scheduleId}')">Delete</button>
          </div>
        `;

        plansEl.appendChild(card);
      });
    })
    .catch(err => {
      console.error('Error fetching workout plans:', err);
      plansEl.innerHTML = '<p class="error">Failed to load workout plans.</p>';
    });
}


// this shows the old workouts that the user did or skipped
async function loadPastWorkouts(userId) {
  const pastEl = document.getElementById('past-workouts');
  if (!pastEl) return;

  try {
    const [workoutsRes, schedulesRes] = await Promise.all([
      fetch(`http://localhost:3000/api/workouts?userId=${userId}`),
      fetch(`http://localhost:3000/api/schedules?userId=${userId}`)
    ]);

    const workouts = await workoutsRes.json();
    const schedules = await schedulesRes.json();

    const scheduleMap = new Map(schedules.map(s => [s.scheduleId, s.scheduleTitle]));

    pastEl.innerHTML = '';
    if (workouts.length === 0) {
      pastEl.innerHTML = '<p>No past workouts found.</p>';
      return;
    }

    // sort by most recent
    workouts.sort((a, b) => new Date(b.date) - new Date(a.date));

    workouts.forEach(workout => {
      const card = document.createElement('div');
      card.className = 'btn-outline';

      const workoutDate = new Date(workout.date).toLocaleDateString();

      const scheduleTitle = (workout.scheduledWorkoutId && scheduleMap.has(workout.scheduledWorkoutId))
        ? scheduleMap.get(workout.scheduledWorkoutId)
        : '"Workout Plan Deleted"';

      // build text for skipped or not
      let body = `<h4>${scheduleTitle} on ${workoutDate}</h4>`;

      if (workout.wasSkipped) {
        body += `<p><strong>Status:</strong> Skipped</p>`;
      } else {
        const count = workout.exercises && workout.exercises.length ? workout.exercises.length : 0;
        body += `<p><strong>Exercises Logged:</strong> ${count}</p>`;
      }

      body += `
        <div style="margin-top: 10px;">
          <button class="secondary" onclick="deleteWorkout('${workout.logId}')">Delete</button>
        </div>
      `;

      card.innerHTML = body;
      pastEl.appendChild(card);
    });

  } catch (err) {
    console.error('Error fetching past workouts:', err);
    pastEl.innerHTML = '<p class="error">Failed to load past workouts.</p>';
  }
}


// Go to edit page for the workout plan
function editPlan(scheduleId) {
  window.location.href = `workoutSchedule.html?edit=${scheduleId}`;
}


// delete plan and reload screen
function deletePlan(scheduleId) {
  fetch(`http://localhost:3000/api/schedules/${scheduleId}`, {
    method: 'DELETE',
  })
  .then(res => {
    if (res.ok) {
      const uid = localStorage.getItem('userId');
      loadWorkoutPlans(uid);
      loadPastWorkouts(uid);
    }
  })
  .catch(err => {
    console.error('Error deleting workout plan:', err);
  });
}


// delete a log workout
function deleteWorkout(logId) {
  fetch(`http://localhost:3000/api/workouts/${logId}`, {
    method: 'DELETE',
  })
  .then(res => {
    if (res.ok) {
      loadPastWorkouts(localStorage.getItem('userId'));
    }
  })
  .catch(err => {
    console.error('Error deleting workout log:', err);
  });
}
