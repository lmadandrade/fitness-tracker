document.addEventListener('DOMContentLoaded', () => {
  const userId = localStorage.getItem('userId');
  if (!userId) {
    const plansContainer = document.getElementById('workout-plans');
    if (plansContainer) {
      plansContainer.innerHTML = '<p>Please log in to see your workout plans.</p>';
    }
    const pastWorkoutsContainer = document.getElementById('past-workouts');
    if (pastWorkoutsContainer) {
      pastWorkoutsContainer.innerHTML = '<p>Please log in to see your past workouts.</p>';
    }
    return;
  }

  loadWorkoutPlans(userId);
  loadPastWorkouts(userId);
});

function loadWorkoutPlans(userId) {
  const plansContainer = document.getElementById('workout-plans');
  if (!plansContainer) return;

  fetch(`http://localhost:3000/api/schedules?userId=${userId}`  )
    .then(res => res.json())
    .then(data => {
      plansContainer.innerHTML = '';
      if (data.length === 0) {
        plansContainer.innerHTML = '<p>No workout plans found.</p>';
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

        plansContainer.appendChild(card);
      });
    })
    .catch(err => {
      console.error('❌ Error fetching workout plans:', err);
      plansContainer.innerHTML = '<p class="error">Failed to load workout plans.</p>';
    });
}

async function loadPastWorkouts(userId) {
  const pastWorkoutsContainer = document.getElementById('past-workouts');
  if (!pastWorkoutsContainer) return;

  try {
    // Fetch both workouts and schedules at the same time
    const [workoutsRes, schedulesRes] = await Promise.all([
      fetch(`http://localhost:3000/api/workouts?userId=${userId}`  ),
      fetch(`http://localhost:3000/api/schedules?userId=${userId}`  )
    ]);

    const workouts = await workoutsRes.json();
    const schedules = await schedulesRes.json();

    // Create a simple map for quick lookup of schedule titles
    const scheduleMap = new Map(schedules.map(s => [s.scheduleId, s.scheduleTitle]));

    pastWorkoutsContainer.innerHTML = '';
    if (workouts.length === 0) {
      pastWorkoutsContainer.innerHTML = '<p>No past workouts found.</p>';
      return;
    }

    workouts.sort((a, b) => new Date(b.date) - new Date(a.date));

    workouts.forEach(workout => {
      const card = document.createElement('div');
      card.className = 'btn-outline';
      
      const workoutDate = new Date(workout.date).toLocaleDateString();
      
      // **FIX:** Check if workout.scheduledWorkoutId exists and is in the map.
      // If it is, use the title from the map. Otherwise, default to 'Ad-hoc Workout'.
      const scheduleTitle = (workout.scheduledWorkoutId && scheduleMap.has(workout.scheduledWorkoutId))
        ? scheduleMap.get(workout.scheduledWorkoutId)
        : 'Ad-hoc Workout';

      card.innerHTML = `
  <h4>Workout on ${workoutDate}</h4>
  <p><strong>Exercises Logged:</strong> ${workout.exercises.length}</p>
  <div style="margin-top: 10px;">
      <button class="secondary" onclick="deleteWorkout('${workout.logId}')">Delete</button>
  </div>
`;


      pastWorkoutsContainer.appendChild(card);
    });
  } catch (err) {
    console.error('❌ Error fetching past workouts:', err);
    pastWorkoutsContainer.innerHTML = '<p class="error">Failed to load past workouts.</p>';
  }
}

function editPlan(scheduleId) {
  // Redirect to the schedule page with the ID as a URL parameter
  window.location.href = `workoutSchedule.html?edit=${scheduleId}`;
}

function deletePlan(scheduleId) {
  fetch(`http://localhost:3000/api/schedules/${scheduleId}`, {
    method: 'DELETE',
  }  )
  .then(res => {
    if (res.ok) {
      // **FIX:** Reload both plans and past workouts after deleting a plan
      loadWorkoutPlans(localStorage.getItem('userId'));
      loadPastWorkouts(localStorage.getItem('userId'));
    }
  })
  .catch(err => {
    console.error('❌ Error deleting workout plan:', err);
  });
}

function deleteWorkout(logId) {
    fetch(`http://localhost:3000/api/workouts/${logId}`, {
        method: 'DELETE',
    }  )
    .then(res => {
        if (res.ok) {
            loadPastWorkouts(localStorage.getItem('userId'));
        }
    })
    .catch(err => {
        console.error('❌ Error deleting workout log:', err);
    });
}
