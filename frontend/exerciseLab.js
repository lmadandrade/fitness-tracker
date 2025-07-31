// exerciseLab.js
// This script handles creating new exercises and displaying the current
// user's exercises in a simple card layout. It relies on auth.js to
// ensure the user is logged in and to populate the hidden userId when
// creating an exercise.

document.addEventListener('DOMContentLoaded', () => {
  const userId = localStorage.getItem('userId');
  if (!userId) {
    alert('You must be logged in to view this page.');
    window.location.href = 'login.html';
    return;
  }

  loadExerciseList();

  const form = document.getElementById('exerciseForm');
  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      const formData = new FormData(this);
      const data = Object.fromEntries(formData.entries());

      // Generate a unique exercise identifier
      data.exerciseId = 'ex' + Date.now();
      data.userId = userId;

      try {
        const response = await fetch('http://localhost:3000/api/exercises', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
          document.getElementById('message').textContent = '✅ Exercise created successfully!';
          this.reset();
          loadExerciseList();
        } else {
          document.getElementById('message').textContent = `Error: ${result.error || 'Unknown error'}`;
        }
      } catch (err) {
        document.getElementById('message').textContent = 'Failed to connect to server.';
      }
    });
  }
});

// Load the user's exercises and display them as cards
async function loadExerciseList() {
  const listEl = document.getElementById('exerciseList');
  if (!listEl) return;

  listEl.innerHTML = '';
  const userId = localStorage.getItem('userId');
  if (!userId) return;

  try {
    const res = await fetch(`http://localhost:3000/api/exercises?userId=${userId}`);
    const exercises = await res.json();

    if (exercises.length === 0) {
      listEl.textContent = 'No exercises found. Add one above!';
      return;
    }

    exercises.forEach(ex => {
      const card = document.createElement('div');
      card.classList.add('exercise-card');
      card.innerHTML = `
        <h3>${ex.name}</h3>
        <p><strong>Muscle Group:</strong> ${ex.muscleGroup}</p>
        <p><strong>Equipment:</strong> ${ex.equipment}</p>
        <p><strong>Type:</strong> ${ex.type}</p>
        <p>${ex.description || ''}</p>
      `;

      const editBtn = document.createElement('button');
      editBtn.textContent = 'Edit';
      editBtn.style.marginRight = '8px';
      editBtn.addEventListener('click', () => {
        const form = document.getElementById('exerciseForm');
        if (!form) return;
        form.name.value = ex.name;
        form.muscleGroup.value = ex.muscleGroup;
        form.equipment.value = ex.equipment;
        form.type.value = ex.type;
        form.description.value = ex.description || '';
        form.scrollIntoView({ behavior: 'smooth' });
      });

      const removeBtn = document.createElement('button');
      removeBtn.textContent = 'Delete';
      removeBtn.className = 'secondary';
      removeBtn.addEventListener('click', () => {
        card.remove();
        // Optional: add DELETE request to backend later if needed
      });

      card.appendChild(editBtn);
      card.appendChild(removeBtn);
      listEl.appendChild(card);
    });
  } catch (err) {
    listEl.textContent = 'Failed to load exercises.';
  }
}
