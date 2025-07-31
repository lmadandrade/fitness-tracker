document.addEventListener('DOMContentLoaded', () => {
  const userId = localStorage.getItem('userId');
  const plansContainer = document.getElementById('workout-plans');

  if (!plansContainer) {
    console.error('⚠️ workout-plans container not found in DOM.');
    return;
  }

  if (!userId) {
    plansContainer.innerHTML = '<p>Please log in to see your workout plans.</p>';
    return;
  }

  fetch(`http://localhost:3000/api/schedules?userId=${userId}`)
    .then(res => res.json())
    .then(data => {
      plansContainer.innerHTML = ''; // Clear loading message
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
        `;

        plansContainer.appendChild(card);
      });
    })
    .catch(err => {
      console.error('❌ Error fetching workout plans:', err);
      plansContainer.innerHTML = '<p class="error">Failed to load workout plans.</p>';
    });
});
