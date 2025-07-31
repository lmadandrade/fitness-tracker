// exerciseLab.js

document.addEventListener('DOMContentLoaded', () => {
  const userId = localStorage.getItem('userId');
  if (!userId) {
    alert('You must be logged in to view this page.');
    window.location.href = 'login.html';
    return;
  }

  loadExerciseList();

  const form = document.getElementById('exerciseForm');
  const editingField = document.getElementById('editingExerciseId');
  const submitBtn = document.getElementById('submitBtn');
  const message = document.getElementById('message');

  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      const formData = new FormData(this);
      const data = Object.fromEntries(formData.entries());

      data.userId = userId;

      try {
        let response;

        if (editingField.value) {
          // UPDATE existing exercise
          data.exerciseId = editingField.value;
          response = await fetch(`http://localhost:3000/api/exercises/${data.exerciseId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
        } else {
          // CREATE new exercise
          data.exerciseId = 'ex' + Date.now();
          response = await fetch('http://localhost:3000/api/exercises', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
        }

        const result = await response.json();

        if (response.ok) {
          message.textContent = editingField.value
            ? '✅ Exercise updated successfully!'
            : '✅ Exercise created successfully!';
          form.reset();
          editingField.value = '';
          submitBtn.textContent = 'Save Exercise';
          loadExerciseList();
        } else {
          message.textContent = `Error: ${result.error || 'Unknown error'}`;
        }
      } catch (err) {
        message.textContent = 'Failed to connect to server.';
      }
    });

    form.addEventListener('reset', () => {
      editingField.value = '';
      submitBtn.textContent = 'Save Exercise';
      message.textContent = '';
    });
  }
});

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
        document.getElementById('editingExerciseId').value = ex.exerciseId;
        document.getElementById('submitBtn').textContent = 'Update Exercise';
        form.scrollIntoView({ behavior: 'smooth' });
      });

      const removeBtn = document.createElement('button');
      removeBtn.textContent = 'Delete';
      removeBtn.className = 'secondary';
      removeBtn.addEventListener('click', async () => {
        try {
          await fetch(`http://localhost:3000/api/exercises/${ex.exerciseId}`, {
            method: 'DELETE'
          });
          card.remove();
        } catch (err) {
          alert('Error deleting exercise.');
        }
      });

      card.appendChild(editBtn);
      card.appendChild(removeBtn);
      listEl.appendChild(card);
    });
  } catch (err) {
    listEl.textContent = 'Failed to load exercises.';
  }
}
